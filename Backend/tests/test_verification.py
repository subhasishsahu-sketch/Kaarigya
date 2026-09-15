"""
Unit and integration tests for 1:N Product Verification & Dual-Layer Authentication.
"""

import os
import pytest
import numpy as np
import cv2

from src.utils import VerificationStatus
from src.verification import verify_query_image_1_to_n, VerificationResult


def test_verification_empty_registry(synthetic_textured_image, temp_registry, test_config):
    """Test 1:N verification on empty database returns REGISTRY_EMPTY."""
    res = verify_query_image_1_to_n(
        query_image=synthetic_textured_image,
        query_name="query_test",
        registry=temp_registry,
        model=None,
        scaler=None,
        feature_names=[],
        config=test_config,
    )

    assert isinstance(res, VerificationResult)
    assert res.status == VerificationStatus.REGISTRY_EMPTY
    assert res.matched_product_id == "UNKNOWN"


def test_verification_roi_failed(synthetic_blank_image, temp_registry, test_config, temp_dir):
    """Test verification on featureless image fails gracefully at ROI detection stage."""
    # First enroll a valid product so registry is non-empty
    valid_img = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
    p_path = os.path.join(temp_dir, "ref_p.jpg")
    cv2.imwrite(p_path, valid_img)
    temp_registry.enroll_from_images("P_TEMP", [p_path])

    res = verify_query_image_1_to_n(
        query_image=synthetic_blank_image,
        query_name="query_blank",
        registry=temp_registry,
        model=None,
        scaler=None,
        feature_names=[],
        config=test_config,
    )

    assert res.status == VerificationStatus.ROI_DETECTION_FAILED
    assert res.matched_product_id == "UNKNOWN"


def test_verification_authentic_match(synthetic_textured_image, temp_registry, test_config, temp_dir):
    """Test 1:N verification correctly authenticates genuine enrolled product."""
    ref_path = os.path.join(temp_dir, "ref_auth.jpg")
    cv2.imwrite(ref_path, synthetic_textured_image)

    # Enroll product P_GENUINE
    temp_registry.enroll_from_images("P_GENUINE", [ref_path], product_name="Authentic Shawl")

    # Query with slightly augmented/same image
    query_img = synthetic_textured_image.copy()

    res = verify_query_image_1_to_n(
        query_image=query_img,
        query_name="query_genuine",
        registry=temp_registry,
        model=None,
        scaler=None,
        feature_names=[],
        config=test_config,
        threshold_override=0.70,
    )

    assert res.status == VerificationStatus.VERIFIED
    assert res.matched_product_id == "P_GENUINE"
    assert res.physical_decision == "VERIFIED"
    assert res.digital_decision == "VERIFIED"
    assert res.final_decision == "AUTHENTIC"
    assert res.similarity >= 0.70


def test_verification_unknown_rejection(synthetic_textured_image, temp_registry, test_config, temp_dir):
    """Test open-set rejection: query product that does not match registry is marked UNKNOWN."""
    ref_path = os.path.join(temp_dir, "ref_reg.jpg")
    cv2.imwrite(ref_path, synthetic_textured_image)
    temp_registry.enroll_from_images("P_REG", [ref_path])

    # Create completely different valid textured pattern with rich keypoints (different seed & shapes)
    diff_img = np.zeros((512, 512, 3), dtype=np.uint8)
    np.random.seed(999)
    noise = np.random.randint(40, 220, (512, 512, 3), dtype=np.uint8)
    diff_img = cv2.addWeighted(diff_img, 0.2, noise, 0.8, 0)
    for y in range(40, 480, 40):
        for x in range(40, 480, 40):
            cv2.drawMarker(diff_img, (x, y), (20, 20, 240), markerType=cv2.MARKER_TILTED_CROSS, markerSize=18, thickness=2)

    res = verify_query_image_1_to_n(
        query_image=diff_img,
        query_name="query_diff",
        registry=temp_registry,
        model=None,
        scaler=None,
        feature_names=[],
        config=test_config,
        threshold_override=0.85,
    )

    assert res.status == VerificationStatus.NOT_VERIFIED
    assert res.matched_product_id == "UNKNOWN"
    assert res.final_decision == "COUNTERFEIT / UNKNOWN"
