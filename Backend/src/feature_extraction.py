"""
Kalakriti — Physical Fingerprint Generation Module.

Generates three complementary physical fingerprint representations:
A) ORB / AKAZE descriptors + keypoint coordinates (micro-geometry)
B) Local Binary Pattern (LBP) histogram (micro-texture)
C) Gray-Level Co-occurrence Matrix (GLCM) features (surface roughness & regularity)

Bundles them into a versioned PhysicalFingerprint dataclass and serializes to .npz.
"""

import os
import logging
from dataclasses import dataclass, field
from typing import Optional, Tuple, List, Dict, Any

import cv2
import numpy as np
from skimage.feature import local_binary_pattern

from src.glcm_features import compute_glcm_features

logger = logging.getLogger(__name__)

CURRENT_FEATURE_VERSION = "2.0.0"
CURRENT_PREPROCESSING_VERSION = "1.0.0"
CURRENT_MODEL_VERSION = "2.0.0"


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class PhysicalFingerprint:
    """Complete versioned physical fingerprint for one physical product ROI."""
    item_id: str
    roi_position: Tuple[int, int]
    roi_size: Tuple[int, int]

    # ORB / AKAZE fingerprint
    keypoint_coords: np.ndarray          # (N, 2) float32
    keypoint_sizes: np.ndarray           # (N,) float32
    keypoint_angles: np.ndarray          # (N,) float32
    keypoint_responses: np.ndarray       # (N,) float32
    descriptors: Optional[np.ndarray]    # (N, D) uint8 or float32
    num_keypoints: int
    feature_method: str                  # "ORB" or "AKAZE"

    # LBP fingerprint
    lbp_histogram: np.ndarray            # Normalized histogram
    lbp_params: dict = field(default_factory=dict)

    # GLCM fingerprint
    glcm_vector: Optional[np.ndarray] = None
    glcm_properties: dict = field(default_factory=dict)

    # Quality and Versioning metadata
    roi_quality: float = 0.0
    feature_version: str = CURRENT_FEATURE_VERSION
    preprocessing_version: str = CURRENT_PREPROCESSING_VERSION
    model_version: str = CURRENT_MODEL_VERSION

    def __str__(self) -> str:
        desc_shape = self.descriptors.shape if self.descriptors is not None else "None"
        glcm_shape = self.glcm_vector.shape if self.glcm_vector is not None else "None"
        return (
            f"  Fingerprint for {self.item_id} (v{self.feature_version}):\n"
            f"    Method: {self.feature_method}\n"
            f"    Keypoints: {self.num_keypoints}\n"
            f"    Descriptors: {desc_shape}\n"
            f"    LBP histogram: {self.lbp_histogram.shape}\n"
            f"    GLCM vector: {glcm_shape}\n"
            f"    ROI quality: {self.roi_quality:.3f}"
        )


# =============================================================================
# ORB / AKAZE Feature Extraction
# =============================================================================

def extract_keypoint_features(
    gray_image: np.ndarray,
    config: dict,
) -> Tuple[list, Optional[np.ndarray]]:
    """
    Extract keypoints and descriptors using ORB or AKAZE.

    Args:
        gray_image: Grayscale image.
        config: Configuration dictionary.

    Returns:
        Tuple of (keypoints_list, descriptors_array).
    """
    feature_method = config.get("feature_method", "ORB")

    if feature_method == "AKAZE" and hasattr(cv2, "AKAZE_create"):
        akaze_cfg = config.get("akaze", {})
        detector = cv2.AKAZE_create(
            descriptor_type=akaze_cfg.get("descriptor_type", 5),
            descriptor_size=akaze_cfg.get("descriptor_size", 0),
            descriptor_channels=akaze_cfg.get("descriptor_channels", 3),
            threshold=akaze_cfg.get("threshold", 0.001),
            nOctaves=akaze_cfg.get("nOctaves", 4),
            nOctaveLayers=akaze_cfg.get("nOctaveLayers", 4),
        )
    else:
        orb_cfg = config.get("orb", {})
        detector = cv2.ORB_create(
            nfeatures=orb_cfg.get("nfeatures", 1500),
            scaleFactor=orb_cfg.get("scaleFactor", 1.2),
            nlevels=orb_cfg.get("nlevels", 8),
            edgeThreshold=orb_cfg.get("edgeThreshold", 31),
            patchSize=orb_cfg.get("patchSize", 31),
        )

    keypoints, descriptors = detector.detectAndCompute(gray_image, None)

    logger.debug(
        f"Extracted {len(keypoints)} keypoints using {feature_method}"
    )
    return keypoints, descriptors


# =============================================================================
# LBP Feature Extraction
# =============================================================================

def extract_lbp_histogram(
    gray_image: np.ndarray,
    config: dict,
) -> Tuple[np.ndarray, dict]:
    """
    Compute Local Binary Pattern histogram.

    Args:
        gray_image: Grayscale image.
        config: Configuration dictionary.

    Returns:
        Tuple of (normalized_histogram, lbp_params).
    """
    lbp_cfg = config.get("lbp", {})
    radius = lbp_cfg.get("radius", 3)
    n_points = lbp_cfg.get("n_points", 24)
    method = lbp_cfg.get("method", "uniform")

    # Compute LBP
    lbp = local_binary_pattern(gray_image, n_points, radius, method=method)

    # Compute histogram
    if method == "uniform":
        n_bins = n_points + 2
    else:
        n_bins = 2 ** n_points

    hist, _ = np.histogram(
        lbp.ravel(),
        bins=n_bins,
        range=(0, n_bins),
        density=True,
    )

    # Normalize
    hist = hist.astype(np.float64)
    norm = np.sum(hist)
    if norm > 0:
        hist /= norm

    lbp_params = {
        "radius": radius,
        "n_points": n_points,
        "method": method,
        "n_bins": n_bins,
    }

    logger.debug(
        f"Computed LBP histogram: {hist.shape} "
        f"(radius={radius}, n_points={n_points})"
    )
    return hist, lbp_params


# =============================================================================
# Fingerprint Generation
# =============================================================================

def generate_fingerprint(
    processed_gray: np.ndarray,
    item_id: str,
    roi_position: Tuple[int, int],
    roi_size: Tuple[int, int],
    config: dict,
    roi_quality: float = 0.0,
) -> Optional[PhysicalFingerprint]:
    """
    Generate a complete multi-modal physical fingerprint for an item ROI.

    Combines:
    1. Keypoints & local descriptors (ORB/AKAZE)
    2. Local Binary Pattern (LBP) histogram
    3. Gray-Level Co-occurrence Matrix (GLCM) second-order statistics

    Args:
        processed_gray: Preprocessed grayscale ROI image.
        item_id: Item identifier.
        roi_position: (x, y) of ROI in item image.
        roi_size: (width, height) of ROI.
        config: Configuration dictionary.
        roi_quality: Quality score of the extracted ROI.

    Returns:
        PhysicalFingerprint, or None if extraction failed.
    """
    feature_method = config.get("feature_method", "ORB")

    # --- 1. ORB / AKAZE ---
    keypoints, descriptors = extract_keypoint_features(processed_gray, config)

    if len(keypoints) == 0:
        logger.warning(f"No keypoints extracted for {item_id}")
        kp_coords = np.empty((0, 2), dtype=np.float32)
        kp_sizes = np.empty((0,), dtype=np.float32)
        kp_angles = np.empty((0,), dtype=np.float32)
        kp_responses = np.empty((0,), dtype=np.float32)
    else:
        kp_coords = np.array(
            [(kp.pt[0], kp.pt[1]) for kp in keypoints], dtype=np.float32
        )
        kp_sizes = np.array(
            [kp.size for kp in keypoints], dtype=np.float32
        )
        kp_angles = np.array(
            [kp.angle for kp in keypoints], dtype=np.float32
        )
        kp_responses = np.array(
            [kp.response for kp in keypoints], dtype=np.float32
        )

    # --- 2. LBP ---
    lbp_hist, lbp_params = extract_lbp_histogram(processed_gray, config)

    # --- 3. GLCM ---
    glcm_cfg = config.get("glcm", {})
    distances = glcm_cfg.get("distances", [1, 2, 4])
    levels = glcm_cfg.get("levels", 256)
    try:
        glcm_res = compute_glcm_features(
            processed_gray,
            distances=distances,
            levels=levels,
        )
        glcm_vec = glcm_res["feature_vector"]
        glcm_props = glcm_res["property_means"]
    except Exception as e:
        logger.warning(f"GLCM computation warning for {item_id}: {e}")
        glcm_vec = np.zeros(len(distances) * 6, dtype=np.float32)
        glcm_props = {}

    fingerprint = PhysicalFingerprint(
        item_id=item_id,
        roi_position=roi_position,
        roi_size=roi_size,
        keypoint_coords=kp_coords,
        keypoint_sizes=kp_sizes,
        keypoint_angles=kp_angles,
        keypoint_responses=kp_responses,
        descriptors=descriptors,
        num_keypoints=len(keypoints),
        feature_method=feature_method,
        lbp_histogram=lbp_hist,
        lbp_params=lbp_params,
        glcm_vector=glcm_vec,
        glcm_properties=glcm_props,
        roi_quality=roi_quality,
        feature_version=CURRENT_FEATURE_VERSION,
        preprocessing_version=CURRENT_PREPROCESSING_VERSION,
        model_version=CURRENT_MODEL_VERSION,
    )

    logger.info(f"Generated fingerprint for {item_id} ({fingerprint.num_keypoints} kps, v{CURRENT_FEATURE_VERSION})")
    return fingerprint


# =============================================================================
# Serialization
# =============================================================================

def save_fingerprint(
    fingerprint: PhysicalFingerprint,
    output_dir: str,
) -> str:
    """
    Serialize a fingerprint to .npz format with complete version metadata.

    Args:
        fingerprint: PhysicalFingerprint object.
        output_dir: Directory to save.

    Returns:
        Path to saved .npz file.
    """
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"{fingerprint.item_id}_fingerprint.npz")

    save_data = {
        "item_id": np.array([fingerprint.item_id]),
        "roi_position": np.array(fingerprint.roi_position),
        "roi_size": np.array(fingerprint.roi_size),
        "keypoint_coords": fingerprint.keypoint_coords,
        "keypoint_sizes": fingerprint.keypoint_sizes,
        "keypoint_angles": fingerprint.keypoint_angles,
        "keypoint_responses": fingerprint.keypoint_responses,
        "num_keypoints": np.array([fingerprint.num_keypoints]),
        "feature_method": np.array([fingerprint.feature_method]),
        "lbp_histogram": fingerprint.lbp_histogram,
        "lbp_radius": np.array([fingerprint.lbp_params.get("radius", 3)]),
        "lbp_n_points": np.array([fingerprint.lbp_params.get("n_points", 24)]),
        "roi_quality": np.array([fingerprint.roi_quality]),
        "feature_version": np.array([fingerprint.feature_version]),
        "preprocessing_version": np.array([fingerprint.preprocessing_version]),
        "model_version": np.array([fingerprint.model_version]),
    }

    if fingerprint.descriptors is not None:
        save_data["descriptors"] = fingerprint.descriptors

    if fingerprint.glcm_vector is not None:
        save_data["glcm_vector"] = fingerprint.glcm_vector

    np.savez_compressed(filepath, **save_data)
    logger.info(f"Saved fingerprint: {filepath}")
    return filepath


def load_fingerprint(filepath: str) -> PhysicalFingerprint:
    """
    Load a fingerprint from .npz file, maintaining backward compatibility
    with earlier versions that lack GLCM or version fields.

    Args:
        filepath: Path to .npz file.

    Returns:
        PhysicalFingerprint object.
    """
    data = np.load(filepath, allow_pickle=True)

    item_id = str(data["item_id"][0])
    roi_position = tuple(data["roi_position"].tolist())
    roi_size = tuple(data["roi_size"].tolist())

    descriptors = data["descriptors"] if "descriptors" in data else None
    glcm_vector = data["glcm_vector"] if "glcm_vector" in data else None

    roi_quality = float(data["roi_quality"][0]) if "roi_quality" in data else 0.0
    feature_version = str(data["feature_version"][0]) if "feature_version" in data else "1.0.0"
    preprocessing_version = str(data["preprocessing_version"][0]) if "preprocessing_version" in data else "1.0.0"
    model_version = str(data["model_version"][0]) if "model_version" in data else "1.0.0"

    fingerprint = PhysicalFingerprint(
        item_id=item_id,
        roi_position=roi_position,
        roi_size=roi_size,
        keypoint_coords=data["keypoint_coords"],
        keypoint_sizes=data["keypoint_sizes"],
        keypoint_angles=data["keypoint_angles"],
        keypoint_responses=data["keypoint_responses"],
        descriptors=descriptors,
        num_keypoints=int(data["num_keypoints"][0]),
        feature_method=str(data["feature_method"][0]),
        lbp_histogram=data["lbp_histogram"],
        lbp_params={
            "radius": int(data["lbp_radius"][0]),
            "n_points": int(data["lbp_n_points"][0]),
        },
        glcm_vector=glcm_vector,
        roi_quality=roi_quality,
        feature_version=feature_version,
        preprocessing_version=preprocessing_version,
        model_version=model_version,
    )

    logger.debug(f"Loaded fingerprint: {filepath} (v{feature_version})")
    return fingerprint


# =============================================================================
# Debug: Keypoint Visualization
# =============================================================================

def draw_keypoints_preview(
    gray_image: np.ndarray,
    keypoints: list,
    item_id: str,
    output_path: str,
) -> str:
    """
    Draw keypoints on an image and save.

    Args:
        gray_image: Grayscale image.
        keypoints: List of cv2.KeyPoint objects.
        item_id: Item identifier.
        output_path: Path to save.

    Returns:
        Path to saved preview.
    """
    preview = cv2.drawKeypoints(
        gray_image, keypoints, None,
        color=(0, 255, 0),
        flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS,
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, preview)
    logger.debug(f"Saved keypoint preview: {output_path}")
    return output_path
