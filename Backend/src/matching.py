"""
Kalakriti — Feature Matching Module.

Matches descriptors between reference and verification fingerprints
using BFMatcher with Lowe's ratio test and bidirectional cross-check.
"""

import logging
from dataclasses import dataclass
from typing import List, Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class MatchResult:
    """Result of descriptor matching between two fingerprints."""
    reference_id: str
    verification_id: str
    total_ref_descriptors: int
    total_ver_descriptors: int
    raw_match_count: int            # Before filtering
    ratio_filtered_count: int       # After Lowe's ratio test
    cross_checked_count: int        # After cross-check
    good_matches: list              # Final list of cv2.DMatch
    matched_ref_indices: np.ndarray
    matched_ver_indices: np.ndarray

    @property
    def candidate_match_count(self) -> int:
        return self.cross_checked_count

    def __str__(self) -> str:
        return (
            f"  Matching {self.reference_id} <-> {self.verification_id}:\n"
            f"    Raw matches: {self.raw_match_count}\n"
            f"    After ratio test: {self.ratio_filtered_count}\n"
            f"    After cross-check: {self.cross_checked_count}"
        )


# =============================================================================
# Descriptor Matching
# =============================================================================

def match_descriptors(
    ref_descriptors: Optional[np.ndarray],
    ver_descriptors: Optional[np.ndarray],
    ref_keypoints_coords: np.ndarray,
    ver_keypoints_coords: np.ndarray,
    ref_id: str,
    ver_id: str,
    config: dict,
) -> Optional[MatchResult]:
    """
    Match descriptors between reference and verification fingerprints.

    Args:
        ref_descriptors: (N, D) descriptor array for reference.
        ver_descriptors: (M, D) descriptor array for verification.
        ref_keypoints_coords: (N, 2) keypoint coordinates for reference.
        ver_keypoints_coords: (M, 2) keypoint coordinates for verification.
        ref_id: Reference item ID.
        ver_id: Verification item ID.
        config: Configuration dictionary.

    Returns:
        MatchResult, or None if matching cannot proceed.
    """
    match_cfg = config.get("matching", {})
    ratio_threshold = match_cfg.get("ratio_test", 0.75)
    do_cross_check = match_cfg.get("cross_check", True)
    min_matches = match_cfg.get("min_matches", 8)

    # Validate inputs
    if ref_descriptors is None or ver_descriptors is None:
        logger.warning(
            f"Cannot match {ref_id} <-> {ver_id}: missing descriptors"
        )
        return None

    if len(ref_descriptors) < 2 or len(ver_descriptors) < 2:
        logger.warning(
            f"Cannot match {ref_id} <-> {ver_id}: insufficient descriptors "
            f"(ref={len(ref_descriptors)}, ver={len(ver_descriptors)})"
        )
        return None

    # Determine distance metric based on descriptor type
    feature_method = config.get("feature_method", "ORB")
    if feature_method == "ORB":
        norm_type = cv2.NORM_HAMMING
    else:
        # AKAZE with MLDB uses Hamming, with KAZE uses L2
        if ref_descriptors.dtype == np.uint8:
            norm_type = cv2.NORM_HAMMING
        else:
            norm_type = cv2.NORM_L2

    # --- Forward matching (ref -> ver) with kNN ---
    bf = cv2.BFMatcher(norm_type)
    knn_matches_forward = bf.knnMatch(ref_descriptors, ver_descriptors, k=2)

    # --- Lowe's ratio test ---
    ratio_filtered_forward = []
    for match_pair in knn_matches_forward:
        if len(match_pair) < 2:
            continue
        m, n = match_pair
        if m.distance < ratio_threshold * n.distance:
            ratio_filtered_forward.append(m)

    raw_count = len(knn_matches_forward)
    ratio_count = len(ratio_filtered_forward)

    # --- Cross-check (bidirectional) ---
    if do_cross_check and ratio_count > 0:
        # Reverse matching (ver -> ref)
        knn_matches_reverse = bf.knnMatch(ver_descriptors, ref_descriptors, k=2)

        ratio_filtered_reverse = []
        for match_pair in knn_matches_reverse:
            if len(match_pair) < 2:
                continue
            m, n = match_pair
            if m.distance < ratio_threshold * n.distance:
                ratio_filtered_reverse.append(m)

        # Find mutual matches
        good_matches = _cross_check_matches(
            ratio_filtered_forward, ratio_filtered_reverse
        )
    else:
        good_matches = ratio_filtered_forward

    cross_checked_count = len(good_matches)

    if cross_checked_count < min_matches:
        logger.warning(
            f"Insufficient matches for {ref_id} <-> {ver_id}: "
            f"{cross_checked_count} < {min_matches}"
        )

    # Extract matched keypoint indices
    if good_matches:
        ref_indices = np.array([m.queryIdx for m in good_matches])
        ver_indices = np.array([m.trainIdx for m in good_matches])
    else:
        ref_indices = np.array([], dtype=int)
        ver_indices = np.array([], dtype=int)

    result = MatchResult(
        reference_id=ref_id,
        verification_id=ver_id,
        total_ref_descriptors=len(ref_descriptors),
        total_ver_descriptors=len(ver_descriptors),
        raw_match_count=raw_count,
        ratio_filtered_count=ratio_count,
        cross_checked_count=cross_checked_count,
        good_matches=good_matches,
        matched_ref_indices=ref_indices,
        matched_ver_indices=ver_indices,
    )

    logger.info(f"Matching complete: {result}")
    return result


def _cross_check_matches(
    forward: List[cv2.DMatch],
    reverse: List[cv2.DMatch],
) -> List[cv2.DMatch]:
    """
    Perform cross-check: keep only mutual matches.

    A match (ref_i → ver_j) is mutual if reverse also maps (ver_j → ref_i).
    """
    # Build reverse lookup: ver_idx → ref_idx
    reverse_map = {}
    for m in reverse:
        reverse_map[m.queryIdx] = m.trainIdx

    mutual = []
    for m in forward:
        ref_idx = m.queryIdx
        ver_idx = m.trainIdx
        # Check if reverse direction agrees
        if reverse_map.get(ver_idx) == ref_idx:
            mutual.append(m)

    return mutual


# =============================================================================
# Debug: Match Visualization
# =============================================================================

def draw_match_preview(
    ref_image: np.ndarray,
    ver_image: np.ndarray,
    ref_keypoints: list,
    ver_keypoints: list,
    matches: list,
    output_path: str,
    max_matches: int = 50,
) -> str:
    """
    Draw side-by-side match visualization.

    Args:
        ref_image: Reference grayscale image.
        ver_image: Verification grayscale image.
        ref_keypoints: Reference keypoints.
        ver_keypoints: Verification keypoints.
        matches: List of cv2.DMatch.
        output_path: Path to save.
        max_matches: Maximum matches to draw.

    Returns:
        Path to saved preview.
    """
    # Sort matches by distance and take top N
    sorted_matches = sorted(matches, key=lambda m: m.distance)[:max_matches]

    preview = cv2.drawMatches(
        ref_image, ref_keypoints,
        ver_image, ver_keypoints,
        sorted_matches, None,
        matchColor=(0, 255, 0),
        singlePointColor=(255, 0, 0),
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS,
    )

    import os
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, preview)
    logger.debug(f"Saved match preview: {output_path}")
    return output_path
