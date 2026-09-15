"""
Unit tests for Image Quality Engine and pre-flight quality checks.
"""

import pytest
import numpy as np
import cv2

from src.image_quality import analyze_quality, QualityReport


def test_analyze_quality_focused_vs_blurred(synthetic_textured_image, test_config):
    """Test that focused image has higher sharpness than blurred image."""
    sharp_report = analyze_quality(synthetic_textured_image, "focused_item", test_config)

    blurred = cv2.GaussianBlur(synthetic_textured_image, (25, 25), 0)
    blurred_report = analyze_quality(blurred, "blurred_item", test_config)

    assert sharp_report.sharpness_score > blurred_report.sharpness_score * 2.0
    assert sharp_report.sharpness_rating in ["EXCELLENT", "GOOD"]


def test_analyze_quality_report_structure(synthetic_textured_image, test_config):
    """Test full image quality evaluation generates structured QualityReport with all metrics."""
    report = analyze_quality(synthetic_textured_image, "test_item", test_config)

    assert isinstance(report, QualityReport)
    assert report.sharpness_score > 0
    assert 0.0 <= report.quality_score <= 1.0
    assert report.roi_quality_rating in ["EXCELLENT", "GOOD", "FAIR", "POOR", "FAILED"]
    assert report.lighting_rating in ["GOOD", "TOO_DARK", "TOO_BRIGHT", "UNEVEN"]
    assert report.reflection_rating in ["LOW", "MODERATE", "HIGH"]
