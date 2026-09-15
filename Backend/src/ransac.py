"""
Kalakriti — RANSAC + Homography Module.

Estimates homography from matched keypoints using RANSAC,
computes inlier/outlier statistics, reprojection error,
spatial spread, and average inlier descriptor distance.
"""

import logging
from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import numpy as np
from scipy.spatial import ConvexHull

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class RANSACResult:
    """Result of RANSAC homography estimation."""
    inlier_count: int
    outlier_count: int
    inlier_ratio: float
    homography: Optional[np.ndarray]     # 3×3 matrix or None
    inlier_mask: Optional[np.ndarray]    # Boolean mask
    reprojection_error_mean: float
    reprojection_error_median: float
    spatial_spread: float                 # Inlier hull area / ROI area
    avg_inlier_descriptor_distance: float
    valid: bool                           # Whether result is usable

    def __str__(self) -> str:
        return (
            f"    RANSAC Result:\n"
            f"      Inliers: {self.inlier_count} / "
            f"{self.inlier_count + self.outlier_count}\n"
            f"      Inlier ratio: {self.inlier_ratio:.3f}\n"
            f"      Reprojection error (mean): {self.reprojection_error_mean:.2f} px\n"
            f"      Reprojection error (median): {self.reprojection_error_median:.2f} px\n"
            f"      Spatial spread: {self.spatial_spread:.3f}\n"
            f"      Avg inlier desc distance: {self.avg_inlier_descriptor_distance:.1f}\n"
            f"      Valid: {self.valid}"
        )


# =============================================================================
# RANSAC Estimation
# =============================================================================

def estimate_ransac(
    ref_keypoint_coords: np.ndarray,
    ver_keypoint_coords: np.ndarray,
    ref_indices: np.ndarray,
    ver_indices: np.ndarray,
    matches: list,
    roi_area: float,
    config: dict,
) -> RANSACResult:
    """
    Estimate homography using RANSAC and compute quality metrics.

    Args:
        ref_keypoint_coords: (N, 2) reference keypoint coordinates.
        ver_keypoint_coords: (M, 2) verification keypoint coordinates.
        ref_indices: Indices of matched ref keypoints.
        ver_indices: Indices of matched ver keypoints.
        matches: List of cv2.DMatch objects.
        roi_area: Area of the ROI for spatial spread normalization.
        config: Configuration dictionary.

    Returns:
        RANSACResult with all computed metrics.
    """
    ransac_cfg = config.get("ransac", {})
    reproj_threshold = ransac_cfg.get("reprojection_threshold", 5.0)
    confidence = ransac_cfg.get("confidence", 0.995)
    max_iters = ransac_cfg.get("max_iterations", 5000)
    min_inliers = ransac_cfg.get("min_inliers", 6)

    num_matches = len(matches)

    # Need at least 4 matches for homography
    if num_matches < 4:
        logger.warning(
            f"Insufficient matches for RANSAC: {num_matches} < 4"
        )
        return _empty_ransac_result()

    # Extract matched point coordinates
    src_pts = ref_keypoint_coords[ref_indices].reshape(-1, 1, 2).astype(np.float64)
    dst_pts = ver_keypoint_coords[ver_indices].reshape(-1, 1, 2).astype(np.float64)

    # Estimate homography with RANSAC
    homography, mask = cv2.findHomography(
        src_pts, dst_pts,
        cv2.RANSAC,
        ransacReprojThreshold=reproj_threshold,
        confidence=confidence,
        maxIters=max_iters,
    )

    if homography is None or mask is None:
        logger.warning("RANSAC failed to estimate homography")
        return _empty_ransac_result()

    inlier_mask = mask.ravel().astype(bool)
    inlier_count = int(np.sum(inlier_mask))
    outlier_count = num_matches - inlier_count

    if inlier_count < min_inliers:
        logger.warning(
            f"Too few inliers: {inlier_count} < {min_inliers}"
        )
        return RANSACResult(
            inlier_count=inlier_count,
            outlier_count=outlier_count,
            inlier_ratio=inlier_count / max(num_matches, 1),
            homography=homography,
            inlier_mask=inlier_mask,
            reprojection_error_mean=float("inf"),
            reprojection_error_median=float("inf"),
            spatial_spread=0.0,
            avg_inlier_descriptor_distance=float("inf"),
            valid=False,
        )

    inlier_ratio = inlier_count / num_matches

    # --- Reprojection error ---
    reproj_mean, reproj_median = _compute_reprojection_error(
        src_pts, dst_pts, homography, inlier_mask
    )

    # --- Spatial spread ---
    spatial_spread = _compute_spatial_spread(
        dst_pts, inlier_mask, roi_area
    )

    # --- Average inlier descriptor distance ---
    avg_desc_dist = _compute_avg_inlier_distance(matches, inlier_mask)

    result = RANSACResult(
        inlier_count=inlier_count,
        outlier_count=outlier_count,
        inlier_ratio=inlier_ratio,
        homography=homography,
        inlier_mask=inlier_mask,
        reprojection_error_mean=reproj_mean,
        reprojection_error_median=reproj_median,
        spatial_spread=spatial_spread,
        avg_inlier_descriptor_distance=avg_desc_dist,
        valid=True,
    )

    logger.info(f"RANSAC: {inlier_count}/{num_matches} inliers, "
                f"ratio={inlier_ratio:.3f}")
    return result


def _empty_ransac_result() -> RANSACResult:
    """Return an empty/invalid RANSAC result."""
    return RANSACResult(
        inlier_count=0,
        outlier_count=0,
        inlier_ratio=0.0,
        homography=None,
        inlier_mask=None,
        reprojection_error_mean=float("inf"),
        reprojection_error_median=float("inf"),
        spatial_spread=0.0,
        avg_inlier_descriptor_distance=float("inf"),
        valid=False,
    )


# =============================================================================
# Metric Computation
# =============================================================================

def _compute_reprojection_error(
    src_pts: np.ndarray,
    dst_pts: np.ndarray,
    homography: np.ndarray,
    inlier_mask: np.ndarray,
) -> Tuple[float, float]:
    """
    Compute mean and median reprojection error for inliers.

    Projects source points through homography and measures distance
    to actual destination points.
    """
    src_inliers = src_pts[inlier_mask]
    dst_inliers = dst_pts[inlier_mask]

    if len(src_inliers) == 0:
        return float("inf"), float("inf")

    # Project source points
    projected = cv2.perspectiveTransform(src_inliers, homography)

    # Compute per-point error
    errors = np.sqrt(np.sum((projected - dst_inliers) ** 2, axis=2)).ravel()

    return float(np.mean(errors)), float(np.median(errors))


def _compute_spatial_spread(
    dst_pts: np.ndarray,
    inlier_mask: np.ndarray,
    roi_area: float,
) -> float:
    """
    Compute spatial spread: convex hull area of inlier points / ROI area.

    A higher spread means inliers are distributed across the ROI,
    indicating a genuine match rather than a local artifact.
    """
    inlier_pts = dst_pts[inlier_mask].reshape(-1, 2)

    if len(inlier_pts) < 3:
        return 0.0

    try:
        hull = ConvexHull(inlier_pts)
        hull_area = hull.volume  # In 2D, 'volume' is area
    except Exception:
        return 0.0

    if roi_area <= 0:
        return 0.0

    spread = hull_area / roi_area
    return float(min(1.0, spread))


def _compute_avg_inlier_distance(
    matches: list,
    inlier_mask: np.ndarray,
) -> float:
    """Compute mean descriptor distance of inlier matches."""
    inlier_distances = [
        m.distance for m, is_inlier in zip(matches, inlier_mask) if is_inlier
    ]

    if not inlier_distances:
        return float("inf")

    return float(np.mean(inlier_distances))


# =============================================================================
# Debug: RANSAC Visualization
# =============================================================================

def draw_ransac_preview(
    ref_image: np.ndarray,
    ver_image: np.ndarray,
    ref_keypoints: list,
    ver_keypoints: list,
    matches: list,
    inlier_mask: np.ndarray,
    output_path: str,
) -> str:
    """
    Draw RANSAC inliers (green) and outliers (red) on match preview.

    Args:
        ref_image: Reference grayscale image.
        ver_image: Verification grayscale image.
        ref_keypoints: Reference keypoints.
        ver_keypoints: Verification keypoints.
        matches: All matches.
        inlier_mask: Boolean mask of inliers.
        output_path: Path to save.

    Returns:
        Path to saved preview.
    """
    import os

    # Separate inliers and outliers
    inlier_matches = [m for m, ok in zip(matches, inlier_mask) if ok]
    outlier_matches = [m for m, ok in zip(matches, inlier_mask) if not ok]

    # Draw outliers first (red)
    preview = cv2.drawMatches(
        ref_image, ref_keypoints,
        ver_image, ver_keypoints,
        outlier_matches, None,
        matchColor=(0, 0, 255),
        singlePointColor=None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS,
    )

    # Draw inliers on top (green)
    preview = cv2.drawMatches(
        ref_image, ref_keypoints,
        ver_image, ver_keypoints,
        inlier_matches, preview,
        matchColor=(0, 255, 0),
        singlePointColor=None,
        flags=(
            cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS |
            cv2.DrawMatchesFlags_DRAW_OVER_OUTIMG
        ),
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, preview)
    logger.debug(f"Saved RANSAC preview: {output_path}")
    return output_path
