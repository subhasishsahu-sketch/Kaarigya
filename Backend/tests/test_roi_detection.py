"""
Unit tests for Single ROI detection, multi-factor scoring, and rejection policy.
"""

import pytest
import numpy as np

from src.roi_detection import select_roi, TextureROI
from src.preprocessing import preprocess_roi


def test_select_single_best_roi(synthetic_textured_image, test_config):
    """Test extracting exactly ONE optimal physical texture ROI from an image."""
    roi = select_roi(synthetic_textured_image, "ITEM_001", test_config)

    assert isinstance(roi, TextureROI)
    assert roi.is_valid is True
    assert roi.roi_image is not None
    assert roi.size == (test_config["preprocessing"]["roi_size"], test_config["preprocessing"]["roi_size"])
    assert roi.quality_score > 0.3


def test_reject_blank_image_roi(synthetic_blank_image, test_config):
    """Test that featureless / blank images are rejected with LOW_TEXTURE or INSUFFICIENT_FEATURES."""
    roi = select_roi(synthetic_blank_image, "ITEM_BLANK", test_config)

    assert roi is not None
    assert roi.is_valid is False
    assert len(roi.failure_reason) > 0


def test_preprocess_roi_shape_and_type(synthetic_textured_image, test_config):
    """Test ROI preprocessing normalizes to grayscale with correct dimensions."""
    roi_patch = synthetic_textured_image[:256, :256]
    orig_gray, proc_gray = preprocess_roi(roi_patch, test_config)

    assert orig_gray.ndim == 2
    assert proc_gray.ndim == 2
    assert proc_gray.shape == (256, 256)
    assert proc_gray.dtype == np.uint8
