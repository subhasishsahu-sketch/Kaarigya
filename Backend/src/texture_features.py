"""
Kalakriti — Texture Features (LBP Comparison) Module.

Compares reference and verification LBP histograms using
Chi-square, correlation, and Bhattacharyya distances.
Returns a normalized similarity score.
"""

import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)


# =============================================================================
# LBP Histogram Comparison
# =============================================================================

def compare_lbp_histograms(
    ref_histogram: np.ndarray,
    ver_histogram: np.ndarray,
) -> dict:
    """
    Compare two LBP histograms using multiple distance metrics.

    Args:
        ref_histogram: Normalized LBP histogram for reference.
        ver_histogram: Normalized LBP histogram for verification.

    Returns:
        Dictionary with:
            - chi_square: Chi-square distance (lower = more similar)
            - correlation: Correlation coefficient (higher = more similar)
            - bhattacharyya: Bhattacharyya distance (lower = more similar)
            - lbp_similarity: Normalized similarity score [0, 1]
    """
    # Ensure histograms are float32 for OpenCV
    ref_hist = ref_histogram.astype(np.float32)
    ver_hist = ver_histogram.astype(np.float32)

    # Pad shorter histogram if necessary
    if len(ref_hist) != len(ver_hist):
        max_len = max(len(ref_hist), len(ver_hist))
        ref_padded = np.zeros(max_len, dtype=np.float32)
        ver_padded = np.zeros(max_len, dtype=np.float32)
        ref_padded[:len(ref_hist)] = ref_hist
        ver_padded[:len(ver_hist)] = ver_hist
        ref_hist = ref_padded
        ver_hist = ver_padded

    # Chi-square distance
    chi_square = float(cv2.compareHist(ref_hist, ver_hist, cv2.HISTCMP_CHISQR))

    # Correlation
    correlation = float(cv2.compareHist(ref_hist, ver_hist, cv2.HISTCMP_CORREL))

    # Bhattacharyya distance
    bhattacharyya = float(
        cv2.compareHist(ref_hist, ver_hist, cv2.HISTCMP_BHATTACHARYYA)
    )

    # Combined normalized similarity score [0, 1]
    # Correlation is already in [-1, 1], map to [0, 1]
    corr_sim = (correlation + 1.0) / 2.0

    # Bhattacharyya is in [0, 1], invert for similarity
    bhatt_sim = 1.0 - bhattacharyya

    # Chi-square: normalize using sigmoid-like mapping
    chi_sim = 1.0 / (1.0 + chi_square * 0.1)

    # Weighted combination
    lbp_similarity = (
        0.40 * corr_sim +
        0.35 * bhatt_sim +
        0.25 * chi_sim
    )

    result = {
        "chi_square": chi_square,
        "correlation": correlation,
        "bhattacharyya": bhattacharyya,
        "lbp_similarity": float(lbp_similarity),
    }

    logger.debug(
        f"LBP comparison: corr={correlation:.3f}, "
        f"bhatt={bhattacharyya:.3f}, chi2={chi_square:.3f}, "
        f"similarity={lbp_similarity:.3f}"
    )

    return result
