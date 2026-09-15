"""
Unit tests for image loading, inspection, and normalization.
"""

import os
import pytest
import numpy as np
import cv2

from src.image_loader import load_image, inspect_image, normalize_image, ImageReport


def test_load_valid_image(synthetic_textured_image, temp_dir):
    """Test loading a valid image from disk."""
    path = os.path.join(temp_dir, "test_img.jpg")
    cv2.imwrite(path, synthetic_textured_image)

    loaded = load_image(path)
    assert loaded is not None
    assert loaded.shape == synthetic_textured_image.shape


def test_load_nonexistent_image():
    """Test loading a non-existent image returns None."""
    loaded = load_image("non_existent_path_12345.jpg")
    assert loaded is None


def test_inspect_image(synthetic_textured_image, test_config, temp_dir):
    """Test image quality inspection report generation."""
    path = os.path.join(temp_dir, "inspect_img.jpg")
    cv2.imwrite(path, synthetic_textured_image)

    report = inspect_image(synthetic_textured_image, path, test_config)
    assert isinstance(report, ImageReport)
    assert report.resolution == (512, 512)
    assert report.blur_score > 0
    assert report.estimated_quality in ["GOOD", "FAIR", "POOR"]


def test_normalize_image(synthetic_textured_image, test_config):
    """Test CLAHE image normalization and resizing."""
    norm_img, report = normalize_image(synthetic_textured_image, test_config)
    assert norm_img is not None
    max_dim = max(norm_img.shape[:2])
    assert max_dim <= test_config["preprocessing"]["working_size"]
