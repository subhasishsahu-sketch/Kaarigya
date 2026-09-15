"""
Pytest configuration and shared test fixtures for Kalakriti test suite.
"""

import os
import shutil
import tempfile
import pytest
import numpy as np
import cv2

from src.utils import load_config
from src.registry import ProductRegistry


@pytest.fixture(scope="session")
def test_config():
    """Load default system test configuration."""
    cfg = load_config()
    cfg["debug"]["enabled"] = False
    return cfg


@pytest.fixture
def temp_dir():
    """Provide a clean temporary directory for test artifacts."""
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)


@pytest.fixture
def synthetic_textured_image():
    """
    Generate a high-frequency textured test image with distinct micro-features
    (checkerboard + noise + circles) suitable for keypoint and texture extraction.
    """
    img = np.zeros((512, 512, 3), dtype=np.uint8)
    # Background texture
    np.random.seed(42)
    noise = np.random.randint(50, 200, (512, 512, 3), dtype=np.uint8)
    img = cv2.addWeighted(img, 0.3, noise, 0.7, 0)

    # Distinct geometric micro-features
    for y in range(64, 448, 64):
        for x in range(64, 448, 64):
            cv2.circle(img, (x, y), 12, (240, 240, 240), -1)
            cv2.rectangle(img, (x - 20, y - 20), (x + 20, y + 20), (30, 30, 30), 2)
            cv2.putText(img, "+", (x - 4, y + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 0), 1)

    return img


@pytest.fixture
def synthetic_blank_image():
    """Generate a low-texture blank image for rejection testing."""
    return np.full((512, 512, 3), 128, dtype=np.uint8)


@pytest.fixture
def temp_registry(temp_dir, test_config):
    """Provide a fresh isolated ProductRegistry."""
    storage = os.path.join(temp_dir, "fingerprints")
    keys = os.path.join(temp_dir, "keys")
    return ProductRegistry(storage_dir=storage, keys_dir=keys, config=test_config)
