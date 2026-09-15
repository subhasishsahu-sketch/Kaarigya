"""
Kalakriti — 1:N Product Identification & Dual-Layer Verification Module.

Executes the automated 1:N product authentication pipeline:
1. Performs pre-flight image quality evaluation & capture guidance
2. Detects ONE optimal single ROI on the query product surface
3. Generates query physical fingerprint (ORB/AKAZE + LBP + GLCM)
4. Searches ALL registered physical fingerprints in registry database (1:N matching)
5. Computes multi-level matching (keypoints, RANSAC homography, LBP similarity, GLCM similarity)
6. Predicts genuine similarity using Random Forest model / calibrated hybrid score
7. Ranks candidates and applies calibrated threshold (Physical Verification)
8. Verifies Layer 1 Digital Identity (SHA-256 Manifest + RSA Digital Signature)
9. Combines Physical + Digital layers to render final AUTHENTIC vs COUNTERFEIT decision
"""

import os
import time
import logging
from datetime import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any

import cv2
import numpy as np

from src.utils import VerificationStatus, ConfidenceLevel, load_json
from src.image_loader import normalize_image
from src.roi_detection import select_roi, TextureROI
from src.image_quality import analyze_quality, QualityReport
from src.preprocessing import preprocess_roi
from src.feature_extraction import (
    generate_fingerprint,
    PhysicalFingerprint,
    draw_keypoints_preview,
    CURRENT_FEATURE_VERSION,
    CURRENT_PREPROCESSING_VERSION,
    CURRENT_MODEL_VERSION,
)
from src.matching import match_descriptors, draw_match_preview
from src.ransac import estimate_ransac, draw_ransac_preview
from src.texture_features import compare_lbp_histograms
from src.glcm_features import compare_glcm_features
from src.feature_vector import build_feature_vector, feature_dict_to_array
from src.registry import ProductRegistry, ProductRecord

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class CandidateMatch:
    """Match comparison against a single registered product."""
    product_id: str
    similarity_score: float             # In [0, 1]
    genuine_probability: float
    feature_dict: Dict[str, float]
    ransac_inliers: int
    candidate_matches: int
    lbp_similarity: float
    glcm_similarity: float
    reprojection_error: float


@dataclass
class VerificationResult:
    """Final result of 1:N product identification and dual-layer verification."""
    query_name: str
    status: VerificationStatus
    decision: str                       # Display decision (e.g. "AUTHENTIC", "COUNTERFEIT / UNKNOWN")
    physical_decision: str              # "VERIFIED" or "NOT_VERIFIED / UNKNOWN"
    digital_decision: str               # "VERIFIED", "INVALID", or "N/A"
    final_decision: str                 # "AUTHENTIC", "COUNTERFEIT / PHYSICAL_MISMATCH", "COUNTERFEIT / DIGITAL_ID_INVALID", "COUNTERFEIT / UNKNOWN"
    confidence: ConfidenceLevel
    matched_product_id: str             # Enrolled product ID, or "UNKNOWN"
    best_candidate_id: str              # Best candidate even if below threshold
    similarity: float                   # Best similarity score in [0, 1]
    threshold: float                    # Verification threshold in [0, 1]
    roi_quality: float                  # Quality score of query ROI
    quality_report: Optional[QualityReport] = None
    roi: Optional[TextureROI] = None
    failure_reason: str = ""
    candidate_rankings: List[CandidateMatch] = field(default_factory=list)
    digital_manifest_summary: Dict[str, Any] = field(default_factory=dict)

    # Versioning & Performance Diagnostics
    model_version: str = CURRENT_MODEL_VERSION
    feature_version: str = CURRENT_FEATURE_VERSION
    preprocessing_version: str = CURRENT_PREPROCESSING_VERSION
    processing_time: float = 0.0
    timestamp: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query_image": self.query_name,
            "product_id": self.matched_product_id,
            "best_candidate": self.best_candidate_id,
            "similarity": round(float(self.similarity), 4),
            "similarity_percent": f"{self.similarity * 100:.1f}%",
            "threshold": round(float(self.threshold), 4),
            "threshold_percent": f"{self.threshold * 100:.1f}%",
            "decision": self.decision,
            "physical_decision": self.physical_decision,
            "digital_decision": self.digital_decision,
            "final_decision": self.final_decision,
            "status": self.status.value,
            "confidence": self.confidence.value,
            "roi_quality": round(float(self.roi_quality), 4),
            "failure_reason": self.failure_reason,
            "model_version": self.model_version,
            "feature_version": self.feature_version,
            "preprocessing_version": self.preprocessing_version,
            "processing_time_seconds": round(float(self.processing_time), 3),
            "timestamp": self.timestamp or datetime.now().isoformat(),
            "digital_manifest_summary": self.digital_manifest_summary,
            "total_candidates_searched": len(self.candidate_rankings),
            "top_candidates": [
                {
                    "product_id": c.product_id,
                    "similarity": round(float(c.similarity_score), 4),
                    "ransac_inliers": c.ransac_inliers,
                    "lbp_similarity": round(float(c.lbp_similarity), 4),
                    "glcm_similarity": round(float(c.glcm_similarity), 4),
                }
                for c in self.candidate_rankings[:5]
            ],
        }


# =============================================================================
# 1:N Verification Engine
# =============================================================================

def verify_query_image_1_to_n(
    query_image: np.ndarray,
    query_name: str,
    registry: ProductRegistry,
    model,
    scaler,
    feature_names: List[str],
    config: dict,
    threshold_override: Optional[float] = None,
    threshold_file_path: Optional[str] = "artifacts/thresholds/threshold.json",
    debug_dir: Optional[str] = None,
) -> VerificationResult:
    """
    Perform complete 1:N verification of a query photograph against the registered
    product database with Layer 1 (RSA Digital Manifest) + Layer 2 (Physical Fingerprint) fusion.
    """
    t_start = time.time()
    timestamp_iso = datetime.now().isoformat()

    # Determine threshold: CLI override > threshold.json > config
    threshold = None
    if threshold_override is not None:
        threshold = threshold_override
    elif threshold_file_path and os.path.exists(threshold_file_path):
        try:
            t_data = load_json(threshold_file_path)
            threshold = float(t_data.get("threshold", t_data.get("recommended_threshold", 0.85)))
            logger.info(f"Loaded calibrated threshold {threshold:.4f} from {threshold_file_path}")
        except Exception as e:
            logger.warning(f"Could not load threshold from {threshold_file_path}: {e}")

    if threshold is None:
        dec_cfg = config.get("decision", {})
        threshold = dec_cfg.get("verification_threshold", 0.85)

    # 1. Image Quality Analysis & Guidance Report
    quality_report = analyze_quality(query_image, query_name, config)
    logger.info(f"Query image quality: {quality_report.roi_quality_rating} (score={quality_report.quality_score:.2f})")

    # 2. Check Registry Population
    registered_products = registry.list_products()
    if not registered_products:
        logger.warning("Product fingerprint registry is empty.")
        return VerificationResult(
            query_name=query_name,
            status=VerificationStatus.REGISTRY_EMPTY,
            decision="NOT VERIFIED / UNKNOWN",
            physical_decision="NOT_VERIFIED",
            digital_decision="N/A",
            final_decision="COUNTERFEIT / UNKNOWN",
            confidence=ConfidenceLevel.LOW,
            matched_product_id="UNKNOWN",
            best_candidate_id="NONE",
            similarity=0.0,
            threshold=threshold,
            roi_quality=0.0,
            quality_report=quality_report,
            failure_reason="Registry database contains no registered products. Enroll products first using register.py",
            processing_time=time.time() - t_start,
            timestamp=timestamp_iso,
        )

    # 3. Normalize Image
    normalized_query, _ = normalize_image(query_image, config)

    # 4. Product Surface & Single Best ROI Detection
    query_roi = select_roi(normalized_query, query_name, config)
    if query_roi is None or not query_roi.is_valid:
        reason = query_roi.failure_reason if query_roi else "Failed to locate suitable texture surface"
        logger.warning(f"ROI detection failed: {reason}")
        return VerificationResult(
            query_name=query_name,
            status=VerificationStatus.ROI_DETECTION_FAILED,
            decision="ROI DETECTION FAILED",
            physical_decision="ROI_DETECTION_FAILED",
            digital_decision="N/A",
            final_decision="COUNTERFEIT / UNKNOWN",
            confidence=ConfidenceLevel.LOW,
            matched_product_id="UNKNOWN",
            best_candidate_id="NONE",
            similarity=0.0,
            threshold=threshold,
            roi_quality=query_roi.quality_score if query_roi else 0.0,
            quality_report=quality_report,
            roi=query_roi,
            failure_reason=reason,
            processing_time=time.time() - t_start,
            timestamp=timestamp_iso,
        )

    # 5. Preprocess Query ROI
    orig_gray, proc_gray = preprocess_roi(query_roi.roi_image, config)

    # 6. Generate Query Fingerprint
    query_fingerprint = generate_fingerprint(
        processed_gray=proc_gray,
        item_id=query_name,
        roi_position=query_roi.position,
        roi_size=query_roi.size,
        config=config,
        roi_quality=query_roi.quality_score,
    )

    if query_fingerprint is None or query_fingerprint.num_keypoints < 4:
        logger.warning("Insufficient keypoints extracted from query ROI.")
        return VerificationResult(
            query_name=query_name,
            status=VerificationStatus.INSUFFICIENT_FEATURES,
            decision="NOT VERIFIED / UNKNOWN",
            physical_decision="INSUFFICIENT_FEATURES",
            digital_decision="N/A",
            final_decision="COUNTERFEIT / UNKNOWN",
            confidence=ConfidenceLevel.LOW,
            matched_product_id="UNKNOWN",
            best_candidate_id="NONE",
            similarity=0.0,
            threshold=threshold,
            roi_quality=query_roi.quality_score,
            quality_report=quality_report,
            roi=query_roi,
            failure_reason="Insufficient distinctive keypoints found in query ROI.",
            processing_time=time.time() - t_start,
            timestamp=timestamp_iso,
        )

    # Save keypoint preview if debug enabled
    if debug_dir and config.get("debug", {}).get("save_keypoint_preview", True):
        kp_objs = [cv2.KeyPoint(x=p[0], y=p[1], size=10) for p in query_fingerprint.keypoint_coords]
        draw_keypoints_preview(
            orig_gray,
            kp_objs,
            query_name,
            os.path.join(debug_dir, f"{query_name}_query_keypoints.jpg"),
        )

    # 7. 1:N Search: Compare against every registered product
    candidates = []

    for product_record in registered_products:
        pid = product_record.product_id
        ref_fp = product_record.fingerprint

        cand = compare_fingerprints(
            query_fp=query_fingerprint,
            ref_fp=ref_fp,
            product_id=pid,
            model=model,
            scaler=scaler,
            feature_names=feature_names,
            config=config,
            query_quality_score=query_roi.quality_score,
            roi_size=query_roi.size,
        )
        candidates.append(cand)

    # 8. Rank candidates strictly by similarity score descending
    candidates.sort(key=lambda c: c.similarity_score, reverse=True)

    best_candidate = candidates[0]
    best_similarity = best_candidate.similarity_score
    best_pid = best_candidate.product_id

    logger.info(
        f"1:N Search complete across {len(candidates)} products. "
        f"Top match: {best_pid} with similarity {best_similarity * 100:.1f}% "
        f"(threshold={threshold * 100:.1f}%)"
    )

    # 9. Layer 2 Physical Decision
    if best_similarity >= threshold:
        physical_passed = True
        physical_decision_str = "VERIFIED"
        matched_id = best_pid
        if best_similarity >= threshold + 0.08:
            conf = ConfidenceLevel.HIGH
        else:
            conf = ConfidenceLevel.MEDIUM
        reason_str = f"Physical surface fingerprint matched registered product '{best_pid}' with {best_similarity * 100:.1f}% confidence."
    else:
        physical_passed = False
        physical_decision_str = "NOT_VERIFIED / UNKNOWN"
        matched_id = "UNKNOWN"
        conf = ConfidenceLevel.LOW
        reason_str = (
            f"No registered fingerprint exceeded the verification threshold ({threshold * 100:.1f}%). "
            f"Best candidate was '{best_pid}' at {best_similarity * 100:.1f}%."
        )

    # 10. Layer 1 Digital Identity Verification
    digital_passed = False
    digital_decision_str = "N/A"
    manifest_summary = {}

    if physical_passed:
        # Validate digital manifest and RSA digital signature of matched product
        is_digital_valid, digital_msg = registry.validate_product(matched_id)
        if is_digital_valid:
            digital_passed = True
            digital_decision_str = "VERIFIED"
        else:
            digital_passed = False
            digital_decision_str = "INVALID"
            logger.warning(f"Digital identity validation failed for {matched_id}: {digital_msg}")

        rec = registry.get_product(matched_id)
        if rec and rec.manifest:
            manifest_summary = {
                "product_name": rec.product_name,
                "manufacturer_id": rec.manufacturer_id,
                "category": rec.category,
                "batch_number": rec.batch_number,
                "manufacturing_location": rec.manufacturing_location,
                "registered_at": rec.registration_timestamp,
                "manifest_hash": rec.manifest_hash[:16] + "..." if rec.manifest_hash else "",
                "rsa_signature_present": bool(rec.rsa_signature),
            }

    # 11. Final Dual-Layer Fusion Decision
    if physical_passed and digital_passed:
        status = VerificationStatus.VERIFIED
        final_decision_str = "AUTHENTIC"
        display_decision = "AUTHENTIC"
    elif physical_passed and not digital_passed:
        status = VerificationStatus.SUSPICIOUS
        final_decision_str = "COUNTERFEIT / DIGITAL_ID_INVALID"
        display_decision = "COUNTERFEIT / DIGITAL_ID_INVALID"
        reason_str = f"Physical fingerprint matched '{matched_id}' but Layer 1 RSA digital signature verification failed."
    else:
        status = VerificationStatus.NOT_VERIFIED
        final_decision_str = "COUNTERFEIT / UNKNOWN"
        display_decision = "COUNTERFEIT / UNKNOWN"

    processing_time = time.time() - t_start

    return VerificationResult(
        query_name=query_name,
        status=status,
        decision=display_decision,
        physical_decision=physical_decision_str,
        digital_decision=digital_decision_str,
        final_decision=final_decision_str,
        confidence=conf,
        matched_product_id=matched_id,
        best_candidate_id=best_pid,
        similarity=best_similarity,
        threshold=threshold,
        roi_quality=query_roi.quality_score,
        quality_report=quality_report,
        roi=query_roi,
        failure_reason=reason_str,
        candidate_rankings=candidates,
        digital_manifest_summary=manifest_summary,
        model_version=query_fingerprint.model_version,
        feature_version=query_fingerprint.feature_version,
        preprocessing_version=query_fingerprint.preprocessing_version,
        processing_time=processing_time,
        timestamp=timestamp_iso,
    )


# =============================================================================
# Pairwise Fingerprint Comparison
# =============================================================================

def compare_fingerprints(
    query_fp: PhysicalFingerprint,
    ref_fp: PhysicalFingerprint,
    product_id: str,
    model,
    scaler,
    feature_names: List[str],
    config: dict,
    query_quality_score: float,
    roi_size: Tuple[int, int],
) -> CandidateMatch:
    """
    Compare query fingerprint against a reference product fingerprint.
    Computes keypoint descriptor matching, RANSAC homography, LBP similarity,
    GLCM similarity, and model prediction / calibrated heuristic fusion.
    """
    # 1. Match descriptors
    match_res = match_descriptors(
        ref_descriptors=ref_fp.descriptors,
        ver_descriptors=query_fp.descriptors,
        ref_keypoints_coords=ref_fp.keypoint_coords,
        ver_keypoints_coords=query_fp.keypoint_coords,
        ref_id=product_id,
        ver_id="query",
        config=config,
    )

    if match_res is None or match_res.cross_checked_count < 4:
        # Descriptor matching failed
        ransac_ratio = 0.0
        reproj_err = 100.0
        spread = 0.0
        avg_dist = 256.0
        norm_matches = 0.0
        inlier_count = 0
        cand_matches = match_res.cross_checked_count if match_res else 0
    else:
        # 2. RANSAC Homography
        roi_area = float(roi_size[0] * roi_size[1])
        ransac_res = estimate_ransac(
            ref_keypoint_coords=ref_fp.keypoint_coords,
            ver_keypoint_coords=query_fp.keypoint_coords,
            ref_indices=match_res.matched_ref_indices,
            ver_indices=match_res.matched_ver_indices,
            matches=match_res.good_matches,
            roi_area=roi_area,
            config=config,
        )

        ransac_ratio = ransac_res.inlier_ratio if ransac_res.valid else 0.0
        reproj_err = ransac_res.reprojection_error_mean if ransac_res.valid else 100.0
        spread = ransac_res.spatial_spread if ransac_res.valid else 0.0
        avg_dist = ransac_res.avg_inlier_descriptor_distance if ransac_res.valid else 256.0
        max_kps = max(ref_fp.num_keypoints, query_fp.num_keypoints, 1)
        norm_matches = match_res.cross_checked_count / max_kps
        inlier_count = ransac_res.inlier_count
        cand_matches = match_res.cross_checked_count

    # 3. LBP Texture Comparison
    lbp_res = compare_lbp_histograms(
        ref_histogram=ref_fp.lbp_histogram,
        ver_histogram=query_fp.lbp_histogram,
    )
    lbp_sim = lbp_res.get("lbp_similarity", 0.0)

    # 4. GLCM Texture Comparison
    glcm_res = compare_glcm_features(
        ref_glcm_vector=ref_fp.glcm_vector,
        ver_glcm_vector=query_fp.glcm_vector,
    )
    glcm_sim = glcm_res.get("glcm_similarity", 0.0)
    glcm_dist = glcm_res.get("glcm_distance", 1.0)

    # 5. ML Feature Vector Construction
    roi_area = float(roi_size[0] * roi_size[1])
    use_extended = len(feature_names) > 8 if feature_names else False
    feat_dict = build_feature_vector(
        ransac_inlier_ratio=ransac_ratio,
        reprojection_error=reproj_err,
        spatial_spread=spread,
        avg_descriptor_distance=avg_dist,
        normalized_match_count=norm_matches,
        lbp_similarity=lbp_sim,
        glcm_similarity=glcm_sim,
        glcm_distance=glcm_dist,
        candidate_match_count=cand_matches,
        inlier_count=inlier_count,
        keypoint_density_ref=ref_fp.num_keypoints / roi_area * 10000.0,
        keypoint_density_ver=query_fp.num_keypoints / roi_area * 10000.0,
        quality_difference=abs(query_quality_score - ref_fp.roi_quality),
        use_extended=use_extended,
    )

    # 6. Prediction with Model
    if model is not None and feature_names:
        feat_vector = feature_dict_to_array(feat_dict, feature_names).reshape(1, -1)
        if scaler is not None:
            feat_vector = scaler.transform(feat_vector)

        try:
            probs = model.predict_proba(feat_vector)[0]
            genuine_prob = float(probs[1]) if len(probs) == 2 else (float(probs[0]) if model.classes_[0] == 1 else 0.0)
        except Exception:
            genuine_prob = _heuristic_similarity(ransac_ratio, lbp_sim, glcm_sim, norm_matches, reproj_err)
    else:
        genuine_prob = _heuristic_similarity(ransac_ratio, lbp_sim, glcm_sim, norm_matches, reproj_err)

    # Hybrid final similarity combining ML probability and key geometric/texture evidence
    heuristic_score = _heuristic_similarity(ransac_ratio, lbp_sim, glcm_sim, norm_matches, reproj_err)
    if inlier_count >= 12 and ransac_ratio > 0.6 and lbp_sim > 0.70:
        # Strong direct evidence
        similarity = 0.6 * genuine_prob + 0.4 * heuristic_score
    elif inlier_count < 4 or ransac_ratio < 0.2:
        # Weak evidence
        similarity = min(genuine_prob, heuristic_score)
    else:
        similarity = 0.5 * genuine_prob + 0.5 * heuristic_score

    return CandidateMatch(
        product_id=product_id,
        similarity_score=float(min(1.0, max(0.0, similarity))),
        genuine_probability=float(genuine_prob),
        feature_dict=feat_dict,
        ransac_inliers=inlier_count,
        candidate_matches=cand_matches,
        lbp_similarity=lbp_sim,
        glcm_similarity=glcm_sim,
        reprojection_error=reproj_err,
    )


def _heuristic_similarity(
    inlier_ratio: float,
    lbp_sim: float,
    glcm_sim: float,
    norm_matches: float,
    reproj_err: float,
) -> float:
    """Compute physical similarity score in [0, 1] combining geometry, LBP, and GLCM."""
    err_score = max(0.0, 1.0 - min(reproj_err, 20.0) / 20.0)
    score = (
        0.35 * inlier_ratio +
        0.25 * lbp_sim +
        0.20 * glcm_sim +
        0.10 * min(1.0, norm_matches * 3.0) +
        0.10 * err_score
    )
    return float(max(0.0, min(1.0, score)))
