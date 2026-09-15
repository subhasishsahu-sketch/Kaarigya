"""
Kalakriti — Utility functions and shared constants.

Provides configuration loading, directory setup, logging helpers,
status enums, and common helper functions used across all modules.
"""

import os
import sys
import json
import logging
import enum
from pathlib import Path
from typing import Any, Dict, Optional, List

import yaml
import numpy as np


# =============================================================================
# Status Enums
# =============================================================================

class VerificationStatus(enum.Enum):
    """Possible outcomes of the verification pipeline."""
    VERIFIED = "VERIFIED"
    NOT_VERIFIED = "NOT_VERIFIED"
    AUTHENTIC = "AUTHENTIC"
    SUSPICIOUS = "SUSPICIOUS"
    UNCERTAIN = "UNCERTAIN"
    RETRY_IMAGE = "RETRY_IMAGE"
    ROI_DETECTION_FAILED = "ROI_DETECTION_FAILED"
    IMAGE_QUALITY_POOR = "IMAGE_QUALITY_POOR"
    INSUFFICIENT_FEATURES = "INSUFFICIENT_FEATURES"
    NO_VALID_HOMOGRAPHY = "NO_VALID_HOMOGRAPHY"
    REGISTRY_EMPTY = "REGISTRY_EMPTY"
    MODEL_MISSING = "MODEL_MISSING"
    ERROR = "ERROR"


class ConfidenceLevel(enum.Enum):
    """Confidence level for verification decisions."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class TrainingMode(enum.Enum):
    """Whether we have enough data for real training."""
    DEMO = "DEMO"
    REAL = "REAL"


# =============================================================================
# Default Configuration
# =============================================================================

DEFAULT_CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "config", "config.yaml"
)

DEFAULT_CONFIG: Dict[str, Any] = {
    "feature_method": "ORB",
    "orb": {
        "nfeatures": 1500,
        "scaleFactor": 1.2,
        "nlevels": 8,
        "edgeThreshold": 31,
        "patchSize": 31,
    },
    "akaze": {
        "descriptor_type": 5,
        "descriptor_size": 0,
        "descriptor_channels": 3,
        "threshold": 0.001,
        "nOctaves": 4,
        "nOctaveLayers": 4,
    },
    "lbp": {
        "radius": 3,
        "n_points": 24,
        "method": "uniform",
    },
    "preprocessing": {
        "working_size": 512,
        "roi_size": 256,
        "denoise_h": 10,
        "clahe_clip_limit": 2.0,
        "clahe_tile_grid_size": 8,
    },
    "surface_detection": {
        "enabled": True,
        "min_surface_area_ratio": 0.10,
        "edge_margin_ratio": 0.05,
    },
    "roi_selection": {
        "grid_step": 32,
        "min_texture_score": 0.15,
        "min_sharpness": 40.0,
        "max_reflection_ratio": 0.12,
        "min_contrast": 15.0,
        "min_keypoints": 15,
        "weight_sharpness": 0.25,
        "weight_gradient": 0.25,
        "weight_variance": 0.25,
        "weight_keypoints": 0.25,
        "blur_penalty_factor": 0.5,
        "reflection_penalty_factor": 1.0,
        "edge_penalty_factor": 0.3,
    },
    "quality": {
        "min_blur_score": 50.0,
        "min_brightness": 35.0,
        "max_brightness": 225.0,
        "min_contrast": 18.0,
        "min_keypoints": 25,
        "min_texture_richness": 5.0,
        "max_specular_ratio": 0.15,
    },
    "matching": {
        "ratio_test": 0.75,
        "cross_check": True,
        "min_matches": 8,
    },
    "ransac": {
        "reprojection_threshold": 5.0,
        "confidence": 0.995,
        "max_iterations": 5000,
        "min_inliers": 6,
    },
    "model": {
        "type": "random_forest",
        "n_estimators": 200,
        "max_depth": 10,
        "min_samples_split": 5,
        "min_samples_leaf": 2,
        "class_weight": "balanced",
        "random_state": 42,
    },
    "decision": {
        "verification_threshold": 0.85,
        "genuine_threshold": 0.85,
        "suspicious_threshold": 0.60,
    },
    "registry": {
        "storage_dir": "data/fingerprints",
        "allow_overwrite": False,
        "save_roi_image": True,
    },
    "dataset": {
        "train_ratio": 0.70,
        "val_ratio": 0.15,
        "test_ratio": 0.15,
        "min_items_for_training": 4,
        "augmentation_per_item": 3,
    },
    "augmentation": {
        "rotation_range": 15,
        "scale_range": [0.9, 1.1],
        "brightness_range": [-30, 30],
        "contrast_range": [0.8, 1.2],
        "blur_max_kernel": 3,
        "translation_range": 10,
        "perspective_strength": 0.02,
    },
    "debug": {
        "enabled": True,
        "save_roi_preview": True,
        "save_keypoint_preview": True,
        "save_match_preview": True,
        "save_ransac_preview": True,
    },
    "paths": {
        "raw": "data/raw",
        "roi": "data/roi",
        "fingerprints": "data/fingerprints",
        "pairs": "data/pairs",
        "features": "data/features",
        "reports": "data/reports",
        "models": "models",
    },
}


# =============================================================================
# Configuration Management
# =============================================================================

def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Load configuration from YAML file, falling back to defaults.

    Args:
        config_path: Path to config.yaml. If None, uses default location.

    Returns:
        Merged configuration dictionary.
    """
    config = DEFAULT_CONFIG.copy()

    if config_path is None:
        config_path = DEFAULT_CONFIG_PATH

    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            user_config = yaml.safe_load(f) or {}
        config = _deep_merge(config, user_config)
        logging.info(f"Loaded configuration from: {config_path}")
    else:
        logging.warning(
            f"Config file not found at {config_path}. Using defaults."
        )

    return config


def _deep_merge(base: Dict, override: Dict) -> Dict:
    """Recursively merge override dict into base dict."""
    result = base.copy()
    for key, value in override.items():
        if (
            key in result
            and isinstance(result[key], dict)
            and isinstance(value, dict)
        ):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


# =============================================================================
# Directory Management
# =============================================================================

def setup_directories(config: Dict[str, Any], base_dir: str) -> Dict[str, str]:
    """
    Create all required project directories.

    Args:
        config: Configuration dictionary.
        base_dir: Project base directory.

    Returns:
        Dictionary mapping path names to absolute paths.
    """
    paths = config.get("paths", DEFAULT_CONFIG["paths"])
    abs_paths = {}

    for name, rel_path in paths.items():
        abs_path = os.path.join(base_dir, rel_path)
        os.makedirs(abs_path, exist_ok=True)
        abs_paths[name] = abs_path

    # Also ensure config directory exists
    config_dir = os.path.join(base_dir, "config")
    os.makedirs(config_dir, exist_ok=True)

    logging.info(f"Directory structure verified under: {base_dir}")
    return abs_paths


def get_project_root() -> str:
    """Get the project root directory (parent of src/)."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# =============================================================================
# Logging Setup
# =============================================================================

def setup_logging(level: int = logging.INFO, log_file: Optional[str] = None):
    """
    Configure logging for the application.

    Args:
        level: Logging level.
        log_file: Optional file path to also write logs to.
    """
    handlers = [logging.StreamHandler(sys.stdout)]

    if log_file:
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        handlers.append(logging.FileHandler(log_file, encoding="utf-8", errors="replace"))

    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=handlers,
        force=True,
    )


# =============================================================================
# Progress Reporting
# =============================================================================

class ProgressReporter:
    """Simple progress reporter for pipeline steps."""

    def __init__(self, total_steps: int):
        self.total_steps = total_steps
        self.current_step = 0

    def step(self, message: str):
        """Report progress for the next step."""
        self.current_step += 1
        print(f"\n[{self.current_step}/{self.total_steps}] {message}")
        logging.info(f"Step {self.current_step}/{self.total_steps}: {message}")

    def done(self):
        """Report pipeline completion."""
        print(f"\n{'='*60}")
        print(f"Pipeline completed ({self.current_step}/{self.total_steps} steps)")
        print(f"{'='*60}")


# =============================================================================
# Serialization Helpers
# =============================================================================

def save_json(data: Any, filepath: str):
    """Save data to JSON file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, default=_json_serializer)
    logging.info(f"Saved JSON: {filepath}")


def load_json(filepath: str) -> Any:
    """Load data from JSON file."""
    with open(filepath, "r") as f:
        return json.load(f)


def _json_serializer(obj):
    """Custom JSON serializer for numpy types."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    if isinstance(obj, enum.Enum):
        return obj.value
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


# =============================================================================
# Image Utility Helpers
# =============================================================================

def supported_image_extensions() -> set:
    """Return set of supported image file extensions."""
    return {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}


def find_images(directory: str) -> list:
    """
    Find all supported image files in a directory.

    Args:
        directory: Path to search.

    Returns:
        Sorted list of image file paths.
    """
    extensions = supported_image_extensions()
    images = []

    for entry in os.scandir(directory):
        if entry.is_file() and Path(entry.name).suffix.lower() in extensions:
            images.append(entry.path)

    images.sort()
    logging.info(f"Found {len(images)} images in {directory}")
    return images


def generate_item_id(image_name: str, item_index: int = 0) -> str:
    """
    Generate a product/item ID from image name.

    Args:
        image_name: Source image filename (without extension).
        item_index: 0-based index if multiple images/items.

    Returns:
        Item ID string.
    """
    clean_name = os.path.splitext(os.path.basename(image_name))[0]
    return f"{clean_name}"
