"""
Kalakriti — Image Preprocessing Module.

Prepares ROIs for feature extraction: grayscale conversion,
standardized resizing (preserving aspect ratio), mild denoising,
and contrast normalization. Preserves the original alongside
the processed version.
"""

import os
import logging
from typing import Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


# =============================================================================
# Preprocessing Pipeline
# =============================================================================

def preprocess_roi(
    roi_image: np.ndarray,
    config: dict,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Preprocess a texture ROI for feature extraction.

    Steps:
    1. Convert to grayscale
    2. Resize to standardized working size (preserving aspect ratio)
    3. Apply mild denoising
    4. Apply CLAHE contrast normalization if needed
    5. Return both original grayscale and processed version

    Args:
        roi_image: BGR ROI image.
        config: Configuration dictionary.

    Returns:
        Tuple of (original_gray, processed_gray).
    """
    prep_cfg = config.get("preprocessing", {})
    working_size = prep_cfg.get("working_size", 512)
    denoise_h = prep_cfg.get("denoise_h", 10)
    clahe_clip = prep_cfg.get("clahe_clip_limit", 2.0)
    clahe_tile = prep_cfg.get("clahe_tile_grid_size", 8)

    # Step 1: Convert to grayscale
    if len(roi_image.shape) == 3:
        gray = cv2.cvtColor(roi_image, cv2.COLOR_BGR2GRAY)
    else:
        gray = roi_image.copy()

    # Step 2: Resize preserving aspect ratio
    gray_resized = _resize_preserve_aspect(gray, working_size)
    original_gray = gray_resized.copy()

    # Step 3: Mild denoising
    # Using fastNlMeansDenoising which preserves texture better than Gaussian
    processed = cv2.fastNlMeansDenoising(
        gray_resized, None, h=denoise_h, templateWindowSize=7, searchWindowSize=21
    )

    # Step 4: CLAHE contrast normalization
    # Apply adaptively — only if contrast is somewhat low
    contrast = float(np.std(processed))
    if contrast < 50:
        clahe = cv2.createCLAHE(
            clipLimit=clahe_clip,
            tileGridSize=(clahe_tile, clahe_tile),
        )
        processed = clahe.apply(processed)
        logger.debug("Applied CLAHE contrast normalization")

    logger.debug(
        f"Preprocessed ROI: {gray.shape} → {processed.shape}, "
        f"contrast={contrast:.1f}"
    )
    return original_gray, processed


def _resize_preserve_aspect(
    image: np.ndarray,
    max_size: int,
) -> np.ndarray:
    """
    Resize image so longest edge equals max_size, preserving aspect ratio.

    If image is already smaller, returns it unchanged.
    """
    h, w = image.shape[:2]
    if max(h, w) <= max_size:
        return image

    if w >= h:
        new_w = max_size
        new_h = int(h * max_size / w)
    else:
        new_h = max_size
        new_w = int(w * max_size / h)

    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized


# =============================================================================
# Save Preprocessed Images
# =============================================================================

def save_preprocessed(
    original_gray: np.ndarray,
    processed_gray: np.ndarray,
    item_id: str,
    output_dir: str,
) -> Tuple[str, str]:
    """
    Save both original and processed grayscale ROI images.

    Args:
        original_gray: Original grayscale ROI.
        processed_gray: Processed grayscale ROI.
        item_id: Item identifier.
        output_dir: Directory to save.

    Returns:
        Tuple of (original_path, processed_path).
    """
    os.makedirs(output_dir, exist_ok=True)

    orig_path = os.path.join(output_dir, f"{item_id}_original.jpg")
    proc_path = os.path.join(output_dir, f"{item_id}_processed.jpg")

    cv2.imwrite(orig_path, original_gray)
    cv2.imwrite(proc_path, processed_gray)

    logger.debug(f"Saved preprocessed: {orig_path}, {proc_path}")
    return orig_path, proc_path
