#!/usr/bin/env python3
"""
Kalakriti — Training Pipeline CLI Script.

Runs the complete batch processing pipeline:
1. Loads raw product photographs
2. Evaluates surface quality & selects ONE SINGLE optimal texture ROI per product image
3. Preprocesses ROIs and generates physical fingerprints (ORB/AKAZE + LBP + GLCM)
4. Builds positive pairs (genuine product multi-photos & augmentations) and negative pairs (impostors)
5. Extracts ML matching feature vectors (RANSAC homography, descriptor distances, LBP, GLCM)
6. Trains and evaluates the Random Forest authentication model
7. Saves all trained model artifacts, feature names, and evaluation metrics
"""

import os
import sys
import argparse
import logging
from pathlib import Path

import cv2
import numpy as np
import pandas as pd

from src.utils import (
    load_config,
    setup_directories,
    setup_logging,
    ProgressReporter,
    find_images,
    save_json,
    TrainingMode,
)
from src.image_loader import load_and_inspect_images
from src.roi_detection import select_roi, save_roi, draw_roi_preview
from src.image_quality import analyze_quality
from src.preprocessing import preprocess_roi, save_preprocessed
from src.feature_extraction import (
    generate_fingerprint,
    save_fingerprint,
    draw_keypoints_preview,
)
from src.matching import match_descriptors
from src.ransac import estimate_ransac
from src.texture_features import compare_lbp_histograms
from src.glcm_features import compare_glcm_features
from src.feature_vector import build_feature_vector, get_feature_names, feature_dict_to_array
from src.dataset_builder import generate_pairs, split_dataset, save_features_csv
from src.model_training import train_random_forest, save_model
from src.evaluation import evaluate_model


def parse_args():
    parser = argparse.ArgumentParser(
        description="Kalakriti — Train physical product authentication model"
    )
    parser.add_argument(
        "--input", "-i",
        default="data/raw",
        help="Path to directory containing raw training photographs (default: data/raw)"
    )
    parser.add_argument(
        "--config", "-c",
        default=None,
        help="Path to custom config.yaml file"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    project_root = os.path.dirname(os.path.abspath(__file__))

    # Load configuration
    config = load_config(args.config)

    # Setup directories
    abs_paths = setup_directories(config, project_root)

    # Configure logging
    log_file = os.path.join(abs_paths["reports"], "training.log")
    setup_logging(level=logging.INFO, log_file=log_file)
    logging.info("Starting Kalakriti training pipeline...")

    # Initialize progress reporter (10 steps)
    reporter = ProgressReporter(total_steps=10)

    # -------------------------------------------------------------------------
    # [1/10] Loading images...
    # -------------------------------------------------------------------------
    reporter.step("Loading images...")
    input_dir = os.path.join(project_root, args.input)
    if not os.path.exists(input_dir):
        os.makedirs(input_dir, exist_ok=True)
        print(f"\nCreated raw input folder: {input_dir}")
        print("Please place raw product images inside and rerun.")
        sys.exit(0)

    raw_image_paths = find_images(input_dir)
    if not raw_image_paths:
        print(f"\nNo images found in: {input_dir}")
        print("Please place raw product images inside and rerun.")
        sys.exit(0)

    loaded_images = load_and_inspect_images(
        raw_image_paths, config, abs_paths["reports"]
    )

    if not loaded_images:
        logging.error("Failed to load any valid images.")
        sys.exit(1)

    # -------------------------------------------------------------------------
    # [2/10] Inspecting product surfaces...
    # -------------------------------------------------------------------------
    reporter.step("Inspecting product surfaces...")
    logging.info(f"Loaded {len(loaded_images)} product images for surface inspection.")

    # -------------------------------------------------------------------------
    # [3/10] Selecting single best ROI per product image...
    # -------------------------------------------------------------------------
    reporter.step("Selecting single best ROI per product image...")
    all_rois = []
    for image, report, normalized in loaded_images:
        product_id = os.path.splitext(report.filename)[0]
        roi = select_roi(normalized, product_id, config)
        if roi:
            all_rois.append(roi)
            save_roi(roi, abs_paths["roi"])

            # Save debug preview
            if config.get("debug", {}).get("save_roi_preview", True):
                preview_path = os.path.join(abs_paths["reports"], f"{product_id}_roi_placement.jpg")
                draw_roi_preview(image, roi, preview_path)

    if not all_rois:
        logging.error("No valid ROIs extracted from input images.")
        sys.exit(1)

    # -------------------------------------------------------------------------
    # [4/10] Generating fingerprints...
    # -------------------------------------------------------------------------
    reporter.step("Generating fingerprints...")
    fingerprints = {}
    item_preprocessed = {}

    for roi in all_rois:
        # Preprocess ROI
        orig_gray, proc_gray = preprocess_roi(roi.roi_image, config)
        save_preprocessed(orig_gray, proc_gray, roi.product_id, abs_paths["roi"])
        item_preprocessed[roi.product_id] = proc_gray

        # Analyze Quality
        analyze_quality(roi.roi_image, roi.product_id, config)

        # Generate Fingerprint (ORB/AKAZE + LBP + GLCM)
        fp = generate_fingerprint(
            proc_gray,
            roi.product_id,
            roi.position,
            roi.size,
            config,
            roi_quality=roi.quality_score,
        )
        if fp:
            fingerprints[roi.product_id] = fp
            save_fingerprint(fp, abs_paths["fingerprints"])

            # Save debug preview
            if config.get("debug", {}).get("save_keypoint_preview", True):
                preview_path = os.path.join(abs_paths["reports"], f"{roi.product_id}_keypoints.jpg")
                kps = [cv2.KeyPoint(x=pt[0], y=pt[1], size=10) for pt in fp.keypoint_coords]
                draw_keypoints_preview(orig_gray, kps, roi.product_id, preview_path)

    # -------------------------------------------------------------------------
    # [5/10] Creating image pairs...
    # -------------------------------------------------------------------------
    reporter.step("Creating image pairs...")
    item_ids = list(fingerprints.keys())
    pairs = generate_pairs(item_ids, item_preprocessed, config)

    # -------------------------------------------------------------------------
    # [6/10] Extracting matching features...
    # -------------------------------------------------------------------------
    reporter.step("Extracting matching features...")
    feature_records = []

    all_fingerprints = fingerprints.copy()
    all_processed = item_preprocessed.copy()

    # Generate fingerprints for augmented versions
    aug_cfg = config.get("augmentation", {})
    n_augmentations = config.get("dataset", {}).get("augmentation_per_item", 3)

    for item_id, fp in fingerprints.items():
        proc_img = item_preprocessed[item_id]
        from src.dataset_builder import _generate_augmentations
        aug_versions = _generate_augmentations(proc_img, n_augmentations, aug_cfg)
        for i, (aug_img, _) in enumerate(aug_versions):
            aug_id = f"{item_id}_aug{i:02d}"
            all_processed[aug_id] = aug_img
            aug_fp = generate_fingerprint(
                aug_img,
                aug_id,
                fp.roi_position,
                fp.roi_size,
                config,
                roi_quality=fp.roi_quality,
            )
            if aug_fp:
                all_fingerprints[aug_id] = aug_fp

    for pair in pairs:
        ref_fp = all_fingerprints.get(pair.reference_item_id)
        ver_fp = all_fingerprints.get(pair.verification_item_id)

        if not ref_fp or not ver_fp:
            continue

        # Match keypoints
        match_res = match_descriptors(
            ref_fp.descriptors,
            ver_fp.descriptors,
            ref_fp.keypoint_coords,
            ver_fp.keypoint_coords,
            ref_fp.item_id,
            ver_fp.item_id,
            config,
        )

        if not match_res or match_res.cross_checked_count < 4:
            ransac_ratio = 0.0
            reproj_err = 100.0
            spread = 0.0
            avg_dist = 256.0
            norm_matches = 0.0
            inlier_count = 0
            candidate_matches = 0
        else:
            roi_area = float(ref_fp.roi_size[0] * ref_fp.roi_size[1])
            ransac_res = estimate_ransac(
                ref_fp.keypoint_coords,
                ver_fp.keypoint_coords,
                match_res.matched_ref_indices,
                match_res.matched_ver_indices,
                match_res.good_matches,
                roi_area,
                config,
            )

            ransac_ratio = ransac_res.inlier_ratio if ransac_res.valid else 0.0
            reproj_err = ransac_res.reprojection_error_mean if ransac_res.valid else 100.0
            spread = ransac_res.spatial_spread if ransac_res.valid else 0.0
            avg_dist = ransac_res.avg_inlier_descriptor_distance if ransac_res.valid else 256.0
            max_kps = max(ref_fp.num_keypoints, ver_fp.num_keypoints, 1)
            norm_matches = match_res.cross_checked_count / max_kps
            inlier_count = ransac_res.inlier_count
            candidate_matches = match_res.cross_checked_count

        # LBP comparison
        lbp_res = compare_lbp_histograms(
            ref_fp.lbp_histogram,
            ver_fp.lbp_histogram,
        )
        lbp_sim = lbp_res.get("lbp_similarity", 0.0)

        # GLCM comparison
        glcm_res = compare_glcm_features(
            ref_fp.glcm_vector,
            ver_fp.glcm_vector,
        )
        glcm_sim = glcm_res.get("glcm_similarity", 0.0)
        glcm_dist = glcm_res.get("glcm_distance", 1.0)

        # Build feature vector
        features = build_feature_vector(
            ransac_inlier_ratio=ransac_ratio,
            reprojection_error=reproj_err,
            spatial_spread=spread,
            avg_descriptor_distance=avg_dist,
            normalized_match_count=norm_matches,
            lbp_similarity=lbp_sim,
            glcm_similarity=glcm_sim,
            glcm_distance=glcm_dist,
            candidate_match_count=candidate_matches,
            inlier_count=inlier_count,
            keypoint_density_ref=ref_fp.num_keypoints / (ref_fp.roi_size[0] * ref_fp.roi_size[1]) * 10000.0,
            keypoint_density_ver=ver_fp.num_keypoints / (ver_fp.roi_size[0] * ver_fp.roi_size[1]) * 10000.0,
            use_extended=False,
        )

        record = {
            "pair_id": pair.pair_id,
            "reference_item_id": pair.reference_item_id,
            "verification_item_id": pair.verification_item_id,
            "label": pair.label,
            **features,
        }
        feature_records.append(record)

    # Save to CSV
    csv_path = os.path.join(abs_paths["features"], "features.csv")
    save_features_csv(feature_records, csv_path)

    # -------------------------------------------------------------------------
    # [7/10] Building feature vectors...
    # -------------------------------------------------------------------------
    reporter.step("Building feature vectors...")
    feature_names = get_feature_names(use_extended=False)
    split = split_dataset(pairs, item_ids, config)

    def get_xy_from_pairs(pair_list):
        X, y = [], []
        rec_map = {r["pair_id"]: r for r in feature_records}
        for pair in pair_list:
            rec = rec_map.get(pair.pair_id)
            if rec:
                x_val = feature_dict_to_array(rec, feature_names)
                X.append(x_val)
                y.append(rec["label"])
        return np.array(X) if X else np.empty((0, len(feature_names))), np.array(y)

    X_train, y_train = get_xy_from_pairs(split.train_pairs)
    X_val, y_val = get_xy_from_pairs(split.val_pairs)
    X_test, y_test = get_xy_from_pairs(split.test_pairs)

    # -------------------------------------------------------------------------
    # [8/10] Training Random Forest...
    # -------------------------------------------------------------------------
    reporter.step("Training Random Forest...")
    if split.mode == TrainingMode.DEMO or len(X_train) == 0:
        logging.info("DEMO Mode: Training prototype model on all available samples.")
        X_all, y_all = get_xy_from_pairs(pairs)
        if len(X_all) == 0:
            logging.error("No valid features extracted to train model.")
            sys.exit(1)
        clf, scaler, train_metrics = train_random_forest(
            X_all, y_all, None, None, feature_names, config
        )
    else:
        clf, scaler, train_metrics = train_random_forest(
            X_train, y_train, X_val, y_val, feature_names, config
        )

    # -------------------------------------------------------------------------
    # [9/10] Evaluating...
    # -------------------------------------------------------------------------
    reporter.step("Evaluating...")
    if split.mode == TrainingMode.DEMO:
        X_all, y_all = get_xy_from_pairs(pairs)
        evaluate_model(clf, scaler, X_all, y_all, feature_names, abs_paths["reports"])
    else:
        evaluate_model(clf, scaler, X_test, y_test, feature_names, abs_paths["reports"])

    # -------------------------------------------------------------------------
    # [10/10] Saving model...
    # -------------------------------------------------------------------------
    reporter.step("Saving model...")
    save_model(clf, scaler, feature_names, train_metrics, config, abs_paths["models"])

    reporter.done()


if __name__ == "__main__":
    main()
