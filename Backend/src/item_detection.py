"""
Kalakriti — Automatic Multi-Item Detection Module.

Detects individual physical items within a photograph using
classical computer vision: grayscale, blur, thresholding,
Canny edge detection, morphology, and contour analysis.
"""

import os
import logging
from dataclasses import dataclass
from typing import List, Tuple, Optional

import cv2
import numpy as np

from src.utils import generate_item_id

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class DetectedItem:
    """Represents a single detected physical item."""
    item_id: str
    source_image: str
    bbox: Tuple[int, int, int, int]   # (x, y, w, h)
    contour_area: float
    confidence: str                    # HIGH, MEDIUM, LOW
    image: np.ndarray                  # Cropped item image

    def __str__(self) -> str:
        x, y, w, h = self.bbox
        return (
            f"  {self.item_id}: bbox=({x},{y},{w},{h}) "
            f"area={self.contour_area:.0f} confidence={self.confidence}"
        )


# =============================================================================
# Multi-Item Detection
# =============================================================================

def detect_items(
    image: np.ndarray,
    image_name: str,
    config: dict,
) -> List[DetectedItem]:
    """
    Detect individual items within a photograph.

    Uses a multi-strategy approach:
    1. Grayscale + blur
    2. Adaptive thresholding + Canny edges
    3. Morphological closing to fill gaps
    4. Contour detection
    5. Filter by area and aspect ratio

    Args:
        image: BGR image array.
        image_name: Name of source image (without extension).
        config: Configuration dictionary.

    Returns:
        List of DetectedItem objects.
    """
    det_cfg = config.get("item_detection", {})
    h, w = image.shape[:2]
    image_area = h * w

    min_area = int(image_area * det_cfg.get("min_area_ratio", 0.005))
    max_area = int(image_area * det_cfg.get("max_area_ratio", 0.95))
    blur_k = det_cfg.get("blur_kernel", 5)
    morph_k = det_cfg.get("morph_kernel", 5)
    morph_iter = det_cfg.get("morph_iterations", 2)
    canny_low = det_cfg.get("canny_low", 50)
    canny_high = det_cfg.get("canny_high", 150)
    padding = det_cfg.get("padding", 10)

    # --- Step 1: Grayscale + blur ---
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (blur_k, blur_k), 0)

    # --- Step 2: Dual thresholding strategy ---
    # Strategy A: Otsu's thresholding
    _, thresh_otsu = cv2.threshold(
        blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    # Strategy B: Adaptive thresholding
    thresh_adaptive = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 21, 5
    )

    # Combine both strategies
    combined = cv2.bitwise_or(thresh_otsu, thresh_adaptive)

    # --- Step 3: Add Canny edges ---
    edges = cv2.Canny(blurred, canny_low, canny_high)
    combined = cv2.bitwise_or(combined, edges)

    # --- Step 4: Morphological operations to close gaps ---
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (morph_k, morph_k)
    )
    closed = cv2.morphologyEx(
        combined, cv2.MORPH_CLOSE, kernel, iterations=morph_iter
    )
    # Fill small holes
    closed = cv2.dilate(closed, kernel, iterations=1)
    closed = cv2.erode(closed, kernel, iterations=1)

    # --- Step 5: Find contours ---
    contours, _ = cv2.findContours(
        closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    # --- Step 6: Filter and extract items ---
    items = []
    item_index = 0

    # Sort contours by area (largest first)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for contour in contours:
        area = cv2.contourArea(contour)

        # Filter by area
        if area < min_area or area > max_area:
            continue

        # Get bounding rectangle
        x, y, bw, bh = cv2.boundingRect(contour)

        # Filter extreme aspect ratios
        aspect = max(bw, bh) / (min(bw, bh) + 1e-6)
        if aspect > 10:
            continue

        # Apply padding
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(w, x + bw + padding)
        y2 = min(h, y + bh + padding)

        # Crop item
        item_image = image[y1:y2, x1:x2].copy()

        # Confidence estimation based on contour properties
        confidence = _estimate_detection_confidence(contour, area, image_area)

        item_id = generate_item_id(image_name, item_index)
        items.append(DetectedItem(
            item_id=item_id,
            source_image=image_name,
            bbox=(x1, y1, x2 - x1, y2 - y1),
            contour_area=area,
            confidence=confidence,
            image=item_image,
        ))
        item_index += 1

    # If no items detected, treat entire image as single item
    if not items:
        logger.warning(
            f"No distinct items detected in {image_name}. "
            "Treating entire image as a single item."
        )
        item_id = generate_item_id(image_name, 0)
        items.append(DetectedItem(
            item_id=item_id,
            source_image=image_name,
            bbox=(0, 0, w, h),
            contour_area=float(image_area),
            confidence="LOW",
            image=image.copy(),
        ))

    logger.info(f"Detected {len(items)} item(s) in {image_name}")
    return items


def _estimate_detection_confidence(
    contour: np.ndarray,
    area: float,
    image_area: int,
) -> str:
    """
    Estimate confidence of a detection based on contour properties.

    Considers: solidity, area ratio, convexity.
    """
    hull = cv2.convexHull(contour)
    hull_area = cv2.contourArea(hull)
    solidity = area / (hull_area + 1e-6)

    area_ratio = area / image_area

    if solidity > 0.7 and 0.01 < area_ratio < 0.8:
        return "HIGH"
    elif solidity > 0.4 and 0.005 < area_ratio < 0.9:
        return "MEDIUM"
    else:
        return "LOW"


# =============================================================================
# Save Detected Items
# =============================================================================

def save_detected_items(
    items: List[DetectedItem],
    output_dir: str,
) -> List[str]:
    """
    Save cropped item images to disk.

    Args:
        items: List of detected items.
        output_dir: Directory to save cropped images.

    Returns:
        List of saved file paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    saved_paths = []

    for item in items:
        filename = f"{item.item_id}.jpg"
        filepath = os.path.join(output_dir, filename)
        cv2.imwrite(filepath, item.image)
        saved_paths.append(filepath)
        logger.debug(f"Saved detected item: {filepath}")

    logger.info(f"Saved {len(saved_paths)} detected items to {output_dir}")
    return saved_paths


# =============================================================================
# Debug Preview
# =============================================================================

def draw_detection_preview(
    image: np.ndarray,
    items: List[DetectedItem],
    output_path: str,
) -> str:
    """
    Draw bounding boxes on the image for all detected items.

    Args:
        image: Original BGR image.
        items: List of detected items.
        output_path: Path to save the preview image.

    Returns:
        Path to saved preview.
    """
    preview = image.copy()
    font = cv2.FONT_HERSHEY_SIMPLEX

    colors = {
        "HIGH": (0, 255, 0),      # Green
        "MEDIUM": (0, 255, 255),   # Yellow
        "LOW": (0, 0, 255),        # Red
    }

    for item in items:
        x, y, w, h = item.bbox
        color = colors.get(item.confidence, (255, 255, 255))

        # Draw bounding box
        cv2.rectangle(preview, (x, y), (x + w, y + h), color, 2)

        # Draw label
        label = f"{item.item_id} ({item.confidence})"
        label_size = cv2.getTextSize(label, font, 0.5, 1)[0]

        # Background for label
        cv2.rectangle(
            preview,
            (x, y - label_size[1] - 8),
            (x + label_size[0] + 4, y),
            color, -1,
        )
        cv2.putText(
            preview, label, (x + 2, y - 4),
            font, 0.5, (0, 0, 0), 1,
        )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, preview)
    logger.info(f"Saved detection preview: {output_path}")
    return output_path
