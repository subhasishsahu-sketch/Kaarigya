"""
Kalakriti — Image & ROI Quality Analysis Module.

Computes pre-flight quality metrics for product images and ROIs:
sharpness, lighting/brightness, contrast, texture richness, specular reflection,
and keypoint suitability. Generates human-friendly quality guidance reports.
"""

import logging
from dataclasses import dataclass, asdict
from typing import Dict, Any, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class QualityReport:
    """Comprehensive quality metrics for an image or ROI."""
    item_id: str
    sharpness_score: float      # Laplacian variance
    brightness_score: float     # Mean intensity [0, 255]
    contrast_score: float       # Std dev of intensity
    texture_richness: float     # Gradient magnitude mean
    keypoint_density: float     # Keypoints per 10,000 pixels
    keypoint_count: int
    reflection_ratio: float     # Specular / highlight ratio
    quality_score: float        # Combined normalized score [0, 1]
    quality_label: str          # EXCELLENT, GOOD, FAIR, POOR, FAILED
    
    # Categorical ratings for user guidance
    sharpness_rating: str = "GOOD"      # GOOD, FAIR, POOR
    lighting_rating: str = "GOOD"       # GOOD, TOO_DARK, TOO_BRIGHT, UNEVEN
    texture_rating: str = "GOOD"        # GOOD, MODERATE, POOR
    reflection_rating: str = "LOW"      # LOW, MODERATE, HIGH
    roi_quality_rating: str = "GOOD"    # EXCELLENT, GOOD, FAIR, POOR, FAILED

    def __str__(self) -> str:
        return (
            f"Image quality for {self.item_id}:\n"
            f"  Sharpness       : {self.sharpness_rating} ({self.sharpness_score:.1f})\n"
            f"  Lighting        : {self.lighting_rating} (mean={self.brightness_score:.1f})\n"
            f"  Texture         : {self.texture_rating} (contrast={self.contrast_score:.1f})\n"
            f"  Reflection      : {self.reflection_rating} ({self.reflection_ratio * 100:.1f}%)\n"
            f"  ROI quality     : {self.roi_quality_rating} (score={self.quality_score:.2f})"
        )

    def to_dict(self) -> dict:
        return asdict(self)

    def print_summary(self):
        """Print concise user-facing quality guidance."""
        print("\nImage quality:")
        print(f"  Sharpness       : {self.sharpness_rating}")
        print(f"  Lighting        : {self.lighting_rating}")
        print(f"  Texture         : {self.texture_rating}")
        print(f"  Reflection      : {self.reflection_rating}")
        print(f"  ROI quality     : {self.roi_quality_rating}")


# =============================================================================
# Quality Analysis
# =============================================================================

def analyze_quality(
    image: np.ndarray,
    item_id: str,
    config: dict,
) -> QualityReport:
    """
    Perform comprehensive quality analysis on an image or ROI.

    Args:
        image: BGR or grayscale image array.
        item_id: Product or item identifier.
        config: Configuration dictionary.

    Returns:
        QualityReport with all metrics and guidance ratings.
    """
    quality_cfg = config.get("quality", {})

    # Convert to grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    h, w = gray.shape[:2]
    area = max(1, h * w)

    # 1. Sharpness: Laplacian variance
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    sharpness_score = float(laplacian.var())

    # 2. Brightness: Mean intensity
    brightness_score = float(np.mean(gray))

    # 3. Contrast: Standard deviation
    contrast_score = float(np.std(gray))

    # 4. Texture richness: Gradient magnitude
    grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(grad_x**2 + grad_y**2)
    texture_richness = float(np.mean(grad_mag))

    # 5. Keypoint density
    feature_method = config.get("feature_method", "ORB")
    if feature_method == "AKAZE" and hasattr(cv2, "AKAZE_create"):
        detector = cv2.AKAZE_create(threshold=0.001)
    else:
        orb_cfg = config.get("orb", {})
        detector = cv2.ORB_create(nfeatures=orb_cfg.get("nfeatures", 1500))

    keypoints = detector.detect(gray, None)
    keypoint_count = len(keypoints) if keypoints else 0
    keypoint_density = (keypoint_count / area) * 10000.0

    # 6. Reflection / Highlight Ratio (pixels > 245)
    reflection_pixels = np.sum(gray >= 245)
    reflection_ratio = float(reflection_pixels / area)

    # --- Ratings Calculation ---
    min_blur = quality_cfg.get("min_blur_score", 50.0)
    min_bright = quality_cfg.get("min_brightness", 35.0)
    max_bright = quality_cfg.get("max_brightness", 225.0)
    min_contrast = quality_cfg.get("min_contrast", 18.0)
    max_spec = quality_cfg.get("max_specular_ratio", 0.15)

    # Sharpness Rating
    if sharpness_score >= min_blur * 1.5:
        sharpness_rating = "EXCELLENT"
    elif sharpness_score >= min_blur:
        sharpness_rating = "GOOD"
    elif sharpness_score >= min_blur * 0.5:
        sharpness_rating = "FAIR"
    else:
        sharpness_rating = "POOR"

    # Lighting Rating
    if brightness_score < min_bright:
        lighting_rating = "TOO_DARK"
    elif brightness_score > max_bright:
        lighting_rating = "TOO_BRIGHT"
    elif 65 <= brightness_score <= 190:
        lighting_rating = "GOOD"
    else:
        lighting_rating = "FAIR"

    # Texture Rating
    if contrast_score >= min_contrast * 1.5 and texture_richness >= 15.0:
        texture_rating = "EXCELLENT"
    elif contrast_score >= min_contrast:
        texture_rating = "GOOD"
    elif contrast_score >= min_contrast * 0.6:
        texture_rating = "MODERATE"
    else:
        texture_rating = "POOR"

    # Reflection Rating
    if reflection_ratio < 0.03:
        reflection_rating = "LOW"
    elif reflection_ratio < max_spec:
        reflection_rating = "MODERATE"
    else:
        reflection_rating = "HIGH"

    # Combined Quality Score
    quality_score = _compute_quality_score(
        sharpness=sharpness_score,
        brightness=brightness_score,
        contrast=contrast_score,
        texture=texture_richness,
        kp_density=keypoint_density,
        reflection_ratio=reflection_ratio,
        quality_cfg=quality_cfg,
    )

    # Overall ROI Quality Rating
    if quality_score >= 0.75:
        roi_quality_rating = "EXCELLENT"
    elif quality_score >= 0.55:
        roi_quality_rating = "GOOD"
    elif quality_score >= 0.35:
        roi_quality_rating = "FAIR"
    elif quality_score >= 0.20:
        roi_quality_rating = "POOR"
    else:
        roi_quality_rating = "FAILED"

    quality_label = roi_quality_rating

    report = QualityReport(
        item_id=item_id,
        sharpness_score=sharpness_score,
        brightness_score=brightness_score,
        contrast_score=contrast_score,
        texture_richness=texture_richness,
        keypoint_density=keypoint_density,
        keypoint_count=keypoint_count,
        reflection_ratio=reflection_ratio,
        quality_score=quality_score,
        quality_label=quality_label,
        sharpness_rating=sharpness_rating,
        lighting_rating=lighting_rating,
        texture_rating=texture_rating,
        reflection_rating=reflection_rating,
        roi_quality_rating=roi_quality_rating,
    )

    logger.info(f"Quality analysis for {item_id}: {roi_quality_rating} (score={quality_score:.2f})")
    return report


def _compute_quality_score(
    sharpness: float,
    brightness: float,
    contrast: float,
    texture: float,
    kp_density: float,
    reflection_ratio: float,
    quality_cfg: dict,
) -> float:
    """Compute normalized overall quality score in [0, 1]."""
    min_blur = quality_cfg.get("min_blur_score", 50.0)
    min_bright = quality_cfg.get("min_brightness", 35.0)
    max_bright = quality_cfg.get("max_brightness", 225.0)
    min_contrast = quality_cfg.get("min_contrast", 18.0)
    min_texture = quality_cfg.get("min_texture_richness", 5.0)

    # Normalize components
    s_sharp = min(1.0, sharpness / max(min_blur * 5.0, 100.0))
    s_contrast = min(1.0, contrast / max(min_contrast * 3.0, 50.0))
    s_texture = min(1.0, texture / max(min_texture * 5.0, 30.0))
    s_kps = min(1.0, kp_density / 30.0)

    # Lighting score
    if min_bright <= brightness <= max_bright:
        s_bright = 1.0 - abs(brightness - 128.0) / 128.0
    else:
        s_bright = 0.2

    # Weighted positive score
    score = (
        0.30 * s_sharp +
        0.25 * s_contrast +
        0.20 * s_texture +
        0.15 * s_kps +
        0.10 * max(0.0, s_bright)
    )

    # Reflection penalty
    penalty = min(0.5, reflection_ratio * 2.5)
    final_score = max(0.0, min(1.0, score - penalty))
    return float(final_score)
