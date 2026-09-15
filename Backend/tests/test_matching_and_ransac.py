"""
Unit tests for Descriptor Matching and RANSAC Homography Estimation.
"""

import pytest
import numpy as np

from src.matching import match_descriptors
from src.ransac import estimate_ransac


def test_match_descriptors_identical(synthetic_textured_image, test_config):
    """Test matching descriptors against self yields strong matches."""
    from src.feature_extraction import extract_keypoint_features
    import cv2

    gray = cv2.cvtColor(synthetic_textured_image, cv2.COLOR_BGR2GRAY)
    kps, descs = extract_keypoint_features(gray, test_config)
    coords = np.array([(kp.pt[0], kp.pt[1]) for kp in kps], dtype=np.float32)

    match_res = match_descriptors(
        ref_descriptors=descs,
        ver_descriptors=descs,
        ref_keypoints_coords=coords,
        ver_keypoints_coords=coords,
        ref_id="P1",
        ver_id="P1_query",
        config=test_config,
    )

    assert match_res is not None
    assert match_res.cross_checked_count > 10


def test_ransac_homography_estimation(synthetic_textured_image, test_config):
    """Test RANSAC homography estimation on matching points."""
    from src.feature_extraction import extract_keypoint_features
    import cv2

    gray = cv2.cvtColor(synthetic_textured_image, cv2.COLOR_BGR2GRAY)
    kps, descs = extract_keypoint_features(gray, test_config)
    coords = np.array([(kp.pt[0], kp.pt[1]) for kp in kps], dtype=np.float32)

    match_res = match_descriptors(
        ref_descriptors=descs,
        ver_descriptors=descs,
        ref_keypoints_coords=coords,
        ver_keypoints_coords=coords,
        ref_id="P1",
        ver_id="P1_query",
        config=test_config,
    )

    ransac_res = estimate_ransac(
        ref_keypoint_coords=coords,
        ver_keypoint_coords=coords,
        ref_indices=match_res.matched_ref_indices,
        ver_indices=match_res.matched_ver_indices,
        matches=match_res.good_matches,
        roi_area=256.0 * 256.0,
        config=test_config,
    )

    assert ransac_res is not None
    assert ransac_res.valid is True
    assert ransac_res.inlier_count >= 4
    assert ransac_res.inlier_ratio > 0.6
