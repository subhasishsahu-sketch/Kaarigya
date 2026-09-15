"""
Unit tests for GLCM texture feature extraction and comparison.
"""

import pytest
import numpy as np

from src.glcm_features import compute_glcm_features, compare_glcm_features


def test_glcm_feature_computation():
    """Test GLCM property calculation on synthetic texture."""
    # Synthetic gradient/texture patch
    patch = np.tile(np.arange(0, 256, 16, dtype=np.uint8), (16, 1))

    res = compute_glcm_features(patch, distances=[1, 2], levels=256)

    assert "feature_vector" in res
    assert "property_means" in res
    assert len(res["feature_vector"]) > 0
    assert "contrast" in res["property_means"]
    assert "homogeneity" in res["property_means"]
    assert res["property_means"]["contrast"] >= 0.0


def test_glcm_feature_comparison_identical():
    """Test GLCM comparison on identical vectors yields high similarity."""
    vec = np.array([10.5, 2.3, 0.85, 0.42, 0.78, 0.35], dtype=np.float32)
    cmp_res = compare_glcm_features(vec, vec)

    assert cmp_res["glcm_similarity"] > 0.99
    assert cmp_res["glcm_distance"] < 0.01


def test_glcm_feature_comparison_different():
    """Test GLCM comparison on widely different vectors yields low similarity."""
    vec_a = np.array([10.0, 5.0, 0.9, 0.8, 0.9, 0.8], dtype=np.float32)
    vec_b = np.array([500.0, 50.0, 0.1, 0.05, 0.1, 0.05], dtype=np.float32)
    cmp_res = compare_glcm_features(vec_a, vec_b)

    assert cmp_res["glcm_similarity"] < 0.5
    assert cmp_res["glcm_distance"] > 0.5
