"""
Unit tests for Physical Fingerprint generation and serialization.
"""

import os
import pytest
import numpy as np
import cv2

from src.feature_extraction import (
    generate_fingerprint,
    save_fingerprint,
    load_fingerprint,
    extract_keypoint_features,
    extract_lbp_histogram,
    PhysicalFingerprint,
)


def test_extract_keypoint_features(synthetic_textured_image, test_config):
    """Test extracting ORB/AKAZE keypoints."""
    gray = cv2.cvtColor(synthetic_textured_image, cv2.COLOR_BGR2GRAY)
    kps, descs = extract_keypoint_features(gray, test_config)

    assert len(kps) > 10
    assert descs is not None
    assert len(descs) == len(kps)


def test_extract_lbp_histogram(synthetic_textured_image, test_config):
    """Test computing normalized LBP histogram."""
    gray = cv2.cvtColor(synthetic_textured_image, cv2.COLOR_BGR2GRAY)
    hist, params = extract_lbp_histogram(gray, test_config)

    assert hist is not None
    assert np.isclose(np.sum(hist), 1.0, atol=1e-3)
    assert params["radius"] == test_config["lbp"]["radius"]


def test_generate_and_serialize_fingerprint(synthetic_textured_image, test_config, temp_dir):
    """Test generating a multi-modal physical fingerprint and saving/loading .npz."""
    gray = cv2.cvtColor(synthetic_textured_image, cv2.COLOR_BGR2GRAY)
    fp = generate_fingerprint(
        processed_gray=gray,
        item_id="P_TEST_01",
        roi_position=(50, 50),
        roi_size=(256, 256),
        config=test_config,
        roi_quality=0.89,
    )

    assert isinstance(fp, PhysicalFingerprint)
    assert fp.num_keypoints > 10
    assert fp.lbp_histogram is not None
    assert fp.glcm_vector is not None
    assert fp.roi_quality == 0.89

    # Test saving to disk
    npz_path = save_fingerprint(fp, temp_dir)
    assert os.path.exists(npz_path)

    # Test reloading
    loaded_fp = load_fingerprint(npz_path)
    assert loaded_fp.item_id == "P_TEST_01"
    assert loaded_fp.num_keypoints == fp.num_keypoints
    assert loaded_fp.feature_version == fp.feature_version
    assert np.allclose(loaded_fp.lbp_histogram, fp.lbp_histogram)
    if fp.descriptors is not None:
        assert np.array_equal(loaded_fp.descriptors, fp.descriptors)
