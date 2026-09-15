"""
Kalakriti — Product Surface & Single Best ROI Detection Module.

Locates the optimal physical surface region on a product photograph and
selects ONE SINGLE, HIGH-QUALITY ROI with stable micro-level texture.
Evaluates candidate regions using multi-factor quality scoring (sharpness,
contrast, texture richness, keypoints) with strict penalties for blur,
specular reflection, and edge contamination.
"""

import os
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Dict, Any

import cv2
import numpy as np

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class TextureROI:
    """A selected single physical texture region of interest."""
    product_id: str
    roi_image: np.ndarray         # Cropped ROI image (BGR)
    position: Tuple[int, int]     # (x, y) coordinates in source image
    size: Tuple[int, int]         # (width, height)
    quality_score: float          # Overall combined quality score [0, 1]
    sharpness: float              # Laplacian variance
    contrast: float               # Intensity standard deviation
    gradient_strength: float      # Mean Sobel gradient magnitude
    keypoint_density: float       # Keypoints per 10,000 pixels
    keypoint_count: int           # Number of keypoints in ROI
    reflection_ratio: float       # Fraction of specular/overexposed pixels
    is_valid: bool = True         # True if meets minimum acceptable quality
    failure_reason: str = ""      # Descriptive reason if validation failed

    @property
    def item_id(self) -> str:
        """Alias for product_id to ensure backward compatibility."""
        return self.product_id

    @property
    def texture_score(self) -> float:
        """Alias for quality_score."""
        return self.quality_score

    def __str__(self) -> str:
        status = "VALID" if self.is_valid else f"FAILED ({self.failure_reason})"
        return (
            f"  Single ROI for {self.product_id} [{status}]: "
            f"pos=({self.position[0]},{self.position[1]}) "
            f"size={self.size[0]}x{self.size[1]} "
            f"quality_score={self.quality_score:.3f} "
            f"(sharpness={self.sharpness:.1f}, contrast={self.contrast:.1f}, "
            f"kps={self.keypoint_count})"
        )


# =============================================================================
# Product Surface Analysis
# =============================================================================

def find_product_surface_mask(
    image: np.ndarray,
    config: dict,
) -> np.ndarray:
    """
    Estimate the usable product surface mask within an image.
    Removes image outer borders and empty backgrounds while focusing
    on the physical product body.

    Args:
        image: BGR image.
        config: Configuration dictionary.

    Returns:
        Binary mask (uint8, 255 for usable product surface, 0 otherwise).
    """
    h, w = image.shape[:2]
    mask = np.ones((h, w), dtype=np.uint8) * 255

    surf_cfg = config.get("surface_detection", {})
    if not surf_cfg.get("enabled", True):
        return mask

    # 1. Edge margin exclusion (prevent picking border artifacts)
    edge_margin_ratio = surf_cfg.get("edge_margin_ratio", 0.05)
    margin_x = int(w * edge_margin_ratio)
    margin_y = int(h * edge_margin_ratio)
    mask[:margin_y, :] = 0
    mask[h - margin_y:, :] = 0
    mask[:, :margin_x] = 0
    mask[:, w - margin_x:] = 0

    # 2. Exclude completely blown-out pure white / black borders if any
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    # Extreme specular or dead black regions
    mask[gray < 8] = 0
    mask[gray > 252] = 0

    return mask


# =============================================================================
# Patch Quality Evaluation
# =============================================================================

def evaluate_patch_quality(
    patch_bgr: np.ndarray,
    patch_gray: np.ndarray,
    patch_grad: np.ndarray,
    kp_coords: np.ndarray,
    patch_x: int,
    patch_y: int,
    roi_size: int,
    config: dict,
) -> Dict[str, Any]:
    """
    Evaluate candidate patch quality across micro-texture properties and penalties.

    Returns a dictionary of raw metrics and normalized quality score.
    """
    roi_cfg = config.get("roi_selection", {})
    area = roi_size * roi_size

    # --- 1. Sharpness (Laplacian variance) ---
    laplacian = cv2.Laplacian(patch_gray, cv2.CV_64F)
    sharpness = float(laplacian.var())

    # --- 2. Contrast (Standard deviation) ---
    contrast = float(np.std(patch_gray))

    # --- 3. Gradient strength (Texture edges / microstructure) ---
    gradient_strength = float(np.mean(patch_grad))

    # --- 4. Keypoint count & density ---
    if len(kp_coords) > 0:
        in_patch = (
            (kp_coords[:, 0] >= patch_x) & (kp_coords[:, 0] < patch_x + roi_size) &
            (kp_coords[:, 1] >= patch_y) & (kp_coords[:, 1] < patch_y + roi_size)
        )
        kp_count = int(np.sum(in_patch))
    else:
        kp_count = 0

    kp_density = (kp_count / area) * 10000.0

    # --- 5. Specular Reflection / Highlight Analysis ---
    # Fraction of saturated/overexposed pixels (>245)
    reflection_pixels = np.sum(patch_gray >= 245)
    reflection_ratio = float(reflection_pixels / area)

    # --- 6. Illumination / Brightness balance ---
    mean_brightness = float(np.mean(patch_gray))
    # Optimal brightness around 80-180
    if 70 <= mean_brightness <= 185:
        illum_score = 1.0
    elif mean_brightness < 70:
        illum_score = max(0.0, mean_brightness / 70.0)
    else:
        illum_score = max(0.0, 1.0 - (mean_brightness - 185.0) / 70.0)

    # --- Normalized Component Scores [0, 1] ---
    min_sharp = roi_cfg.get("min_sharpness", 40.0)
    norm_sharpness = min(1.0, sharpness / max(min_sharp * 5.0, 100.0))
    norm_contrast = min(1.0, contrast / 60.0)
    norm_gradient = min(1.0, gradient_strength / 80.0)
    norm_kps = min(1.0, kp_density / 35.0)

    # Weights
    w_sharp = roi_cfg.get("weight_sharpness", 0.25)
    w_grad = roi_cfg.get("weight_gradient", 0.25)
    w_var = roi_cfg.get("weight_variance", 0.25)
    w_kps = roi_cfg.get("weight_keypoints", 0.25)

    base_score = (
        w_sharp * norm_sharpness +
        w_grad * norm_gradient +
        w_var * norm_contrast +
        w_kps * norm_kps
    )

    # --- Penalties ---
    blur_pen_fac = roi_cfg.get("blur_penalty_factor", 0.5)
    refl_pen_fac = roi_cfg.get("reflection_penalty_factor", 1.0)

    # Blur penalty if sharpness < min_sharpness
    blur_penalty = 0.0
    if sharpness < min_sharp:
        blur_penalty = blur_pen_fac * (1.0 - sharpness / max(min_sharp, 1.0))

    # Reflection penalty
    reflection_penalty = refl_pen_fac * min(1.0, reflection_ratio * 4.0)

    # Illumination penalty
    illum_penalty = (1.0 - illum_score) * 0.3

    # Final quality score
    final_score = max(0.0, min(1.0, base_score - blur_penalty - reflection_penalty - illum_penalty))

    return {
        "sharpness": sharpness,
        "contrast": contrast,
        "gradient_strength": gradient_strength,
        "keypoint_count": kp_count,
        "keypoint_density": kp_density,
        "reflection_ratio": reflection_ratio,
        "mean_brightness": mean_brightness,
        "quality_score": float(final_score),
    }


# =============================================================================
# Single Best ROI Selection
# =============================================================================

def select_roi(
    image: np.ndarray,
    product_id: str,
    config: dict,
) -> Optional[TextureROI]:
    """
    Detect ONE SINGLE, HIGH-QUALITY ROI on the physical product surface.

    Finds the optimal micro-texture patch that maximizes sharpness, texture
    richness, and keypoints while penalizing blur and specular reflections.

    Args:
        image: BGR product image.
        product_id: Product identifier.
        config: Configuration dictionary.

    Returns:
        TextureROI object with validation status, or None/TextureROI(is_valid=False).
    """
    roi_cfg = config.get("roi_selection", {})
    prep_cfg = config.get("preprocessing", {})

    target_roi_size = prep_cfg.get("roi_size", 256)
    grid_step = roi_cfg.get("grid_step", 32)
    min_texture = roi_cfg.get("min_texture_score", 0.15)
    min_sharpness = roi_cfg.get("min_sharpness", 40.0)
    max_reflection = roi_cfg.get("max_reflection_ratio", 0.12)
    min_contrast = roi_cfg.get("min_contrast", 15.0)
    min_kps = roi_cfg.get("min_keypoints", 15)

    h, w = image.shape[:2]

    # Adjust ROI size if source image is smaller than target size
    roi_size = min(target_roi_size, h, w)
    if roi_size < 48:
        logger.error(f"Image too small for ROI extraction: {w}x{h}")
        return None

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

    # Pre-compute gradient magnitude (Sobel)
    grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(grad_x**2 + grad_y**2)

    # Pre-compute keypoints across whole image
    feature_method = config.get("feature_method", "ORB")
    if feature_method == "AKAZE" and hasattr(cv2, "AKAZE_create"):
        akaze_cfg = config.get("akaze", {})
        detector = cv2.AKAZE_create(
            descriptor_type=akaze_cfg.get("descriptor_type", 5),
            threshold=akaze_cfg.get("threshold", 0.001),
        )
    else:
        orb_cfg = config.get("orb", {})
        detector = cv2.ORB_create(
            nfeatures=orb_cfg.get("nfeatures", 2000),
            scaleFactor=orb_cfg.get("scaleFactor", 1.2),
            nlevels=orb_cfg.get("nlevels", 8),
        )

    all_keypoints = detector.detect(gray, None)
    kp_coords = np.array([(kp.pt[0], kp.pt[1]) for kp in all_keypoints]) if all_keypoints else np.empty((0, 2))

    # Product surface mask
    surface_mask = find_product_surface_mask(image, config)

    # --- Dense sliding window search for the ONE best ROI ---
    candidates = []

    y_steps = range(0, h - roi_size + 1, grid_step)
    x_steps = range(0, w - roi_size + 1, grid_step)

    # Ensure at least center patch is evaluated if steps are empty
    if not y_steps or not x_steps:
        y_steps = [max(0, (h - roi_size) // 2)]
        x_steps = [max(0, (w - roi_size) // 2)]

    for y in y_steps:
        for x in x_steps:
            # Check mask coverage
            patch_mask = surface_mask[y:y + roi_size, x:x + roi_size]
            if np.mean(patch_mask) < 180:
                # Patch falls mostly outside the valid product surface
                continue

            patch_bgr = image[y:y + roi_size, x:x + roi_size]
            patch_gray = gray[y:y + roi_size, x:x + roi_size]
            patch_grad = grad_mag[y:y + roi_size, x:x + roi_size]

            metrics = evaluate_patch_quality(
                patch_bgr=patch_bgr,
                patch_gray=patch_gray,
                patch_grad=patch_grad,
                kp_coords=kp_coords,
                patch_x=x,
                patch_y=y,
                roi_size=roi_size,
                config=config,
            )

            candidates.append({
                "x": x,
                "y": y,
                "metrics": metrics,
            })

    # Fallback to center crop if no candidate satisfied mask
    if not candidates:
        cx = max(0, (w - roi_size) // 2)
        cy = max(0, (h - roi_size) // 2)
        patch_bgr = image[cy:cy + roi_size, cx:cx + roi_size]
        patch_gray = gray[cy:cy + roi_size, cx:cx + roi_size]
        patch_grad = grad_mag[cy:cy + roi_size, cx:cx + roi_size]

        metrics = evaluate_patch_quality(
            patch_bgr=patch_bgr,
            patch_gray=patch_gray,
            patch_grad=patch_grad,
            kp_coords=kp_coords,
            patch_x=cx,
            patch_y=cy,
            roi_size=roi_size,
            config=config,
        )
        candidates.append({"x": cx, "y": cy, "metrics": metrics})

    # Sort strictly by quality score (descending)
    candidates.sort(key=lambda c: c["metrics"]["quality_score"], reverse=True)
    best = candidates[0]
    metrics = best["metrics"]
    x, y = best["x"], best["y"]
    roi_img = image[y:y + roi_size, x:x + roi_size].copy()

    # --- Validation Check ---
    is_valid = True
    failure_reasons = []

    if metrics["quality_score"] < min_texture:
        is_valid = False
        failure_reasons.append("Insufficient overall surface texture")

    if metrics["sharpness"] < min_sharpness * 0.4:
        is_valid = False
        failure_reasons.append("Excessive blur / out-of-focus")

    if metrics["reflection_ratio"] > max_reflection:
        is_valid = False
        failure_reasons.append("Excessive specular highlight / glare")

    if metrics["contrast"] < min_contrast * 0.5:
        is_valid = False
        failure_reasons.append("Flat or uniform surface lacking distinctive micro-features")

    if metrics["keypoint_count"] < 4:
        is_valid = False
        failure_reasons.append("Insufficient repeatable keypoints on surface")

    failure_reason_str = "; ".join(failure_reasons) if failure_reasons else ""

    roi = TextureROI(
        product_id=product_id,
        roi_image=roi_img,
        position=(x, y),
        size=(roi_size, roi_size),
        quality_score=metrics["quality_score"],
        sharpness=metrics["sharpness"],
        contrast=metrics["contrast"],
        gradient_strength=metrics["gradient_strength"],
        keypoint_density=metrics["keypoint_density"],
        keypoint_count=metrics["keypoint_count"],
        reflection_ratio=metrics["reflection_ratio"],
        is_valid=is_valid,
        failure_reason=failure_reason_str,
    )

    if not is_valid:
        logger.warning(f"ROI quality validation failed for {product_id}: {failure_reason_str}")
    else:
        logger.info(f"Selected ONE optimal ROI for {product_id}: {roi}")

    return roi


# =============================================================================
# Save & Visualization
# =============================================================================

def save_roi(
    roi: TextureROI,
    output_dir: str,
) -> str:
    """Save a single texture ROI image to disk."""
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{roi.product_id}_roi.jpg"
    filepath = os.path.join(output_dir, filename)
    cv2.imwrite(filepath, roi.roi_image)
    logger.debug(f"Saved ROI image: {filepath}")
    return filepath


def draw_roi_preview(
    image: np.ndarray,
    roi: TextureROI,
    output_path: str,
) -> str:
    """Draw preview bounding box and quality annotation of the single best ROI."""
    preview = image.copy()
    x, y = roi.position
    w, h = roi.size

    color = (0, 255, 0) if roi.is_valid else (0, 0, 255)
    cv2.rectangle(preview, (x, y), (x + w, y + h), color, 3)

    font = cv2.FONT_HERSHEY_SIMPLEX
    label = f"ROI: {roi.quality_score:.2f} ({'VALID' if roi.is_valid else 'POOR'})"
    cv2.rectangle(preview, (x, y - 24), (x + 220, y), color, -1)
    cv2.putText(preview, label, (x + 4, y - 6), font, 0.55, (0, 0, 0), 1)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, preview)
    logger.debug(f"Saved single ROI preview: {output_path}")
    return output_path
