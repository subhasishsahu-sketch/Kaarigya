"""
Kalakriti — Image Loading and Inspection Module.

Loads input images, validates them, reports quality metrics
(resolution, brightness, contrast, blur score), and optionally
normalizes images that need correction.
"""

import os
import logging
from dataclasses import dataclass, asdict
from typing import Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class ImageReport:
    """Quality report for a loaded image."""
    filename: str
    filepath: str
    resolution: Tuple[int, int]   # (width, height)
    channels: int
    brightness: float
    contrast: float
    blur_score: float
    estimated_quality: str        # GOOD, FAIR, POOR
    normalized: bool = False

    def __str__(self) -> str:
        w, h = self.resolution
        return (
            f"Image: {self.filename}\n"
            f"  Resolution: {w} x {h}\n"
            f"  Channels: {self.channels}\n"
            f"  Brightness: {self.brightness:.1f}\n"
            f"  Contrast: {self.contrast:.1f}\n"
            f"  Blur score: {self.blur_score:.1f}\n"
            f"  Estimated quality: {self.estimated_quality}\n"
            f"  Normalized: {self.normalized}"
        )

    def to_dict(self) -> dict:
        return asdict(self)


# =============================================================================
# Image Loading
# =============================================================================

def load_image(filepath: str) -> Optional[np.ndarray]:
    """
    Load an image from disk.

    Args:
        filepath: Absolute or relative path to the image.

    Returns:
        BGR image as numpy array, or None if loading failed.
    """
    if not os.path.exists(filepath):
        logger.error(f"Image file does not exist: {filepath}")
        return None

    image = cv2.imread(filepath, cv2.IMREAD_COLOR)
    if image is None:
        logger.error(f"Failed to load image (corrupted or unsupported): {filepath}")
        return None

    logger.info(f"Loaded image: {filepath} ({image.shape[1]}x{image.shape[0]})")
    return image


# =============================================================================
# Image Inspection
# =============================================================================

def inspect_image(
    image: np.ndarray,
    filepath: str,
    config: dict,
) -> ImageReport:
    """
    Inspect an image and produce a quality report.

    Args:
        image: BGR image array.
        filepath: Original file path (for reporting).
        config: Configuration dictionary.

    Returns:
        ImageReport with all quality metrics.
    """
    filename = os.path.basename(filepath)
    h, w = image.shape[:2]
    channels = image.shape[2] if len(image.shape) == 3 else 1

    # Convert to grayscale for analysis
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if channels > 1 else image

    # Brightness: mean intensity
    brightness = float(np.mean(gray))

    # Contrast: standard deviation of intensity
    contrast = float(np.std(gray))

    # Blur score: variance of Laplacian (higher = sharper)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Quality estimation
    quality_cfg = config.get("quality", {})
    estimated_quality = _estimate_quality(
        brightness, contrast, blur_score, quality_cfg
    )

    report = ImageReport(
        filename=filename,
        filepath=filepath,
        resolution=(w, h),
        channels=channels,
        brightness=brightness,
        contrast=contrast,
        blur_score=blur_score,
        estimated_quality=estimated_quality,
    )

    logger.info(f"Inspection complete for {filename}: {estimated_quality}")
    return report


def _estimate_quality(
    brightness: float,
    contrast: float,
    blur_score: float,
    quality_cfg: dict,
) -> str:
    """
    Estimate overall image quality from metrics.

    Returns 'GOOD', 'FAIR', or 'POOR'.
    """
    issues = 0

    min_blur = quality_cfg.get("min_blur_score", 50.0)
    min_brightness = quality_cfg.get("min_brightness", 40.0)
    max_brightness = quality_cfg.get("max_brightness", 220.0)
    min_contrast = quality_cfg.get("min_contrast", 20.0)

    if blur_score < min_blur:
        issues += 1
        logger.warning(f"Low sharpness: blur_score={blur_score:.1f} < {min_blur}")

    if brightness < min_brightness:
        issues += 1
        logger.warning(f"Too dark: brightness={brightness:.1f} < {min_brightness}")
    elif brightness > max_brightness:
        issues += 1
        logger.warning(f"Too bright: brightness={brightness:.1f} > {max_brightness}")

    if contrast < min_contrast:
        issues += 1
        logger.warning(f"Low contrast: contrast={contrast:.1f} < {min_contrast}")

    if issues == 0:
        return "GOOD"
    elif issues == 1:
        return "FAIR"
    else:
        return "POOR"


# =============================================================================
# Image Normalization
# =============================================================================

def normalize_image(
    image: np.ndarray,
    config: dict,
) -> Tuple[np.ndarray, bool]:
    """
    Automatically normalize an image if it needs correction.

    Applies brightness/contrast correction using CLAHE on the L channel
    of LAB color space.

    Args:
        image: BGR image array.
        config: Configuration dictionary.

    Returns:
        Tuple of (normalized image, whether normalization was applied).
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))
    contrast = float(np.std(gray))

    quality_cfg = config.get("quality", {})
    needs_norm = (
        brightness < quality_cfg.get("min_brightness", 40.0)
        or brightness > quality_cfg.get("max_brightness", 220.0)
        or contrast < quality_cfg.get("min_contrast", 20.0)
    )

    if not needs_norm:
        return image, False

    # Apply CLAHE in LAB color space
    prep_cfg = config.get("preprocessing", {})
    clip_limit = prep_cfg.get("clahe_clip_limit", 2.0)
    tile_size = prep_cfg.get("clahe_tile_grid_size", 8)

    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=clip_limit,
        tileGridSize=(tile_size, tile_size),
    )
    l_channel = clahe.apply(l_channel)

    lab = cv2.merge([l_channel, a_channel, b_channel])
    result = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    logger.info("Applied automatic normalization (CLAHE)")
    return result, True


# =============================================================================
# Inspection Image Saving
# =============================================================================

def save_inspection_image(
    image: np.ndarray,
    report: ImageReport,
    output_dir: str,
) -> str:
    """
    Save an annotated inspection image with quality metrics overlaid.

    Args:
        image: BGR image array.
        report: Image quality report.
        output_dir: Directory to save the inspection image.

    Returns:
        Path to the saved inspection image.
    """
    os.makedirs(output_dir, exist_ok=True)

    # Create a copy for annotation
    annotated = image.copy()
    h, w = annotated.shape[:2]

    # Draw semi-transparent overlay for text background
    overlay = annotated.copy()
    cv2.rectangle(overlay, (0, 0), (min(450, w), min(180, h)), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, annotated, 0.4, 0, annotated)

    # Draw metrics text
    font = cv2.FONT_HERSHEY_SIMPLEX
    color = (0, 255, 0) if report.estimated_quality == "GOOD" else (
        (0, 255, 255) if report.estimated_quality == "FAIR" else (0, 0, 255)
    )

    lines = [
        f"File: {report.filename}",
        f"Resolution: {report.resolution[0]} x {report.resolution[1]}",
        f"Brightness: {report.brightness:.1f}",
        f"Contrast: {report.contrast:.1f}",
        f"Blur score: {report.blur_score:.1f}",
        f"Quality: {report.estimated_quality}",
    ]

    y_offset = 25
    for line in lines:
        cv2.putText(annotated, line, (10, y_offset), font, 0.6, color, 1)
        y_offset += 25

    # Save
    name = os.path.splitext(report.filename)[0]
    output_path = os.path.join(output_dir, f"{name}_inspection.jpg")
    cv2.imwrite(output_path, annotated)
    logger.info(f"Saved inspection image: {output_path}")
    return output_path


# =============================================================================
# Batch Processing
# =============================================================================

def load_and_inspect_images(
    image_paths: list,
    config: dict,
    reports_dir: str,
) -> list:
    """
    Load and inspect a list of images.

    Args:
        image_paths: List of image file paths.
        config: Configuration dictionary.
        reports_dir: Directory to save inspection images.

    Returns:
        List of (image, report, normalized_image) tuples for successfully
        loaded images.
    """
    results = []

    for filepath in image_paths:
        image = load_image(filepath)
        if image is None:
            continue

        report = inspect_image(image, filepath, config)
        print(f"\n{report}")

        # Auto-normalize if needed
        normalized, was_normalized = normalize_image(image, config)
        report.normalized = was_normalized

        # Save inspection image
        save_inspection_image(image, report, reports_dir)

        results.append((image, report, normalized))

    logger.info(f"Successfully loaded {len(results)}/{len(image_paths)} images")
    return results
