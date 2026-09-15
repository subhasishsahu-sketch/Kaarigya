"""
Kalakriti — Feature Vector Construction Module.

Builds the final ML feature vector for each image pair by combining
RANSAC geometric metrics, descriptor statistics, LBP texture similarity,
and GLCM second-order surface roughness features.
"""

import logging
from typing import Dict, List, Optional
import numpy as np

logger = logging.getLogger(__name__)

# =============================================================================
# Feature Names
# =============================================================================

# Standard features
STANDARD_FEATURE_NAMES = [
    "ransac_inlier_ratio",
    "reprojection_error",
    "spatial_spread",
    "avg_inlier_descriptor_distance",
    "normalized_match_count",
    "lbp_similarity",
    "glcm_similarity",
    "glcm_distance",
]

# Legacy 6-feature names (for backward compatibility with v1.0 models)
LEGACY_FEATURE_NAMES = [
    "ransac_inlier_ratio",
    "reprojection_error",
    "spatial_spread",
    "avg_inlier_descriptor_distance",
    "normalized_match_count",
    "lbp_similarity",
]

# Extended features (optional)
EXTENDED_FEATURE_NAMES = [
    "candidate_match_count",
    "inlier_count",
    "keypoint_density_reference",
    "keypoint_density_verification",
    "quality_difference",
]

ALL_FEATURE_NAMES = STANDARD_FEATURE_NAMES + EXTENDED_FEATURE_NAMES


# =============================================================================
# Feature Vector Construction
# =============================================================================

def build_feature_vector(
    ransac_inlier_ratio: float,
    reprojection_error: float,
    spatial_spread: float,
    avg_descriptor_distance: float,
    normalized_match_count: float,
    lbp_similarity: float,
    glcm_similarity: float = 0.0,
    glcm_distance: float = 1.0,
    candidate_match_count: int = 0,
    inlier_count: int = 0,
    keypoint_density_ref: float = 0.0,
    keypoint_density_ver: float = 0.0,
    quality_difference: float = 0.0,
    use_extended: bool = False,
) -> Dict[str, float]:
    """
    Build a feature vector for one image pair.

    Args:
        ransac_inlier_ratio: Ratio of inliers to total matches.
        reprojection_error: Mean reprojection error in pixels.
        spatial_spread: Convex hull area of inliers / ROI area.
        avg_descriptor_distance: Mean descriptor distance of inliers.
        normalized_match_count: Matches / max possible matches.
        lbp_similarity: Normalized LBP similarity [0, 1].
        glcm_similarity: Normalized GLCM similarity [0, 1].
        glcm_distance: Normalized GLCM distance [0, 1].
        candidate_match_count: Total matches before RANSAC.
        inlier_count: Number of RANSAC inliers.
        keypoint_density_ref: Keypoint density of reference.
        keypoint_density_ver: Keypoint density of verification.
        quality_difference: Abs difference in quality scores.
        use_extended: Whether to include extended features.

    Returns:
        Dictionary mapping feature names to values.
    """
    # Sanitize infinite/NaN values
    features = {
        "ransac_inlier_ratio": _sanitize(ransac_inlier_ratio, 0.0),
        "reprojection_error": _sanitize(reprojection_error, 100.0),
        "spatial_spread": _sanitize(spatial_spread, 0.0),
        "avg_inlier_descriptor_distance": _sanitize(avg_descriptor_distance, 256.0),
        "normalized_match_count": _sanitize(normalized_match_count, 0.0),
        "lbp_similarity": _sanitize(lbp_similarity, 0.0),
        "glcm_similarity": _sanitize(glcm_similarity, 0.0),
        "glcm_distance": _sanitize(glcm_distance, 1.0),
    }

    if use_extended:
        features.update({
            "candidate_match_count": _sanitize(float(candidate_match_count), 0.0),
            "inlier_count": _sanitize(float(inlier_count), 0.0),
            "keypoint_density_reference": _sanitize(keypoint_density_ref, 0.0),
            "keypoint_density_verification": _sanitize(keypoint_density_ver, 0.0),
            "quality_difference": _sanitize(quality_difference, 1.0),
        })

    logger.debug(f"Built feature vector: {features}")
    return features


def feature_dict_to_array(
    features: Dict[str, float],
    feature_names: Optional[List[str]] = None,
) -> np.ndarray:
    """
    Convert feature dictionary to ordered numpy array matching specified feature_names.

    Args:
        features: Feature name -> value dictionary.
        feature_names: Ordered list of feature names to extract.
                       If None, uses all keys in the dict.

    Returns:
        1D numpy array of feature values.
    """
    if feature_names is None:
        feature_names = list(features.keys())

    return np.array(
        [features.get(name, 0.0) for name in feature_names],
        dtype=np.float64,
    )


def get_feature_names(use_extended: bool = False, legacy: bool = False) -> List[str]:
    """Get the ordered list of feature names."""
    if legacy:
        return LEGACY_FEATURE_NAMES.copy()
    if use_extended:
        return ALL_FEATURE_NAMES.copy()
    return STANDARD_FEATURE_NAMES.copy()


def _sanitize(value: float, default: float) -> float:
    """Replace inf/NaN with a default value."""
    if np.isfinite(value):
        return float(value)
    return default
