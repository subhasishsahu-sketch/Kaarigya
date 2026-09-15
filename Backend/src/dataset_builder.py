"""
Kalakriti — Dataset Builder Module.

Generates training pairs (positive/negative) from detected items,
applies data augmentation, performs product-level train/val/test
splits (preventing data leakage), and saves features.csv.
"""

import os
import logging
import random
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from itertools import combinations

import cv2
import numpy as np
import pandas as pd

from src.utils import TrainingMode, save_json

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class ImagePair:
    """A pair of item images for training/evaluation."""
    pair_id: str
    reference_item_id: str
    verification_item_id: str
    label: int                        # 1 = genuine, 0 = different
    source_images: List[str]
    is_augmented: bool = False
    augmentation_type: str = ""

    def __str__(self) -> str:
        label_str = "GENUINE" if self.label == 1 else "DIFFERENT"
        aug_str = f" [AUG: {self.augmentation_type}]" if self.is_augmented else ""
        return (
            f"  Pair {self.pair_id}: {self.reference_item_id} <-> "
            f"{self.verification_item_id} -> {label_str}{aug_str}"
        )


@dataclass
class DatasetSplit:
    """Train/val/test split of the dataset."""
    train_pairs: List[ImagePair] = field(default_factory=list)
    val_pairs: List[ImagePair] = field(default_factory=list)
    test_pairs: List[ImagePair] = field(default_factory=list)
    train_items: List[str] = field(default_factory=list)
    val_items: List[str] = field(default_factory=list)
    test_items: List[str] = field(default_factory=list)
    mode: TrainingMode = TrainingMode.DEMO


# =============================================================================
# Pair Generation
# =============================================================================

def generate_pairs(
    item_ids: List[str],
    item_images: Dict[str, np.ndarray],
    config: dict,
) -> List[ImagePair]:
    """
    Generate positive and negative image pairs from detected items.

    Positive pairs: same item (original + augmented versions)
    Negative pairs: different items

    Args:
        item_ids: List of item identifiers.
        item_images: Dictionary mapping item_id → preprocessed grayscale image.
        config: Configuration dictionary.

    Returns:
        List of ImagePair objects.
    """
    pairs = []
    pair_counter = 0

    aug_cfg = config.get("augmentation", {})
    n_augmentations = config.get("dataset", {}).get("augmentation_per_item", 3)

    logger.info(f"Generating pairs from {len(item_ids)} items...")

    # --- Positive pairs: same item with augmentation ---
    augmented_images = {}

    for item_id in item_ids:
        image = item_images.get(item_id)
        if image is None:
            continue

        # Generate augmented versions
        aug_versions = _generate_augmentations(image, n_augmentations, aug_cfg)
        augmented_images[item_id] = aug_versions

        # Create positive pairs: original ↔ each augmented version
        for i, (aug_img, aug_type) in enumerate(aug_versions):
            pair_id = f"pair_{pair_counter:05d}"
            pairs.append(ImagePair(
                pair_id=pair_id,
                reference_item_id=item_id,
                verification_item_id=f"{item_id}_aug{i:02d}",
                label=1,
                source_images=[item_id],
                is_augmented=True,
                augmentation_type=aug_type,
            ))
            pair_counter += 1

    # --- Negative pairs: different items ---
    if len(item_ids) >= 2:
        for id_a, id_b in combinations(item_ids, 2):
            # Original vs original
            pair_id = f"pair_{pair_counter:05d}"
            pairs.append(ImagePair(
                pair_id=pair_id,
                reference_item_id=id_a,
                verification_item_id=id_b,
                label=0,
                source_images=[id_a, id_b],
                is_augmented=False,
            ))
            pair_counter += 1

            # Also create cross-augmented negatives for diversity
            if id_a in augmented_images and augmented_images[id_a]:
                pair_id = f"pair_{pair_counter:05d}"
                pairs.append(ImagePair(
                    pair_id=pair_id,
                    reference_item_id=f"{id_a}_aug00",
                    verification_item_id=id_b,
                    label=0,
                    source_images=[id_a, id_b],
                    is_augmented=True,
                    augmentation_type="cross_negative",
                ))
                pair_counter += 1

    # Report statistics
    n_positive = sum(1 for p in pairs if p.label == 1)
    n_negative = sum(1 for p in pairs if p.label == 0)
    logger.info(
        f"Generated {len(pairs)} pairs: "
        f"{n_positive} positive, {n_negative} negative"
    )

    return pairs


# =============================================================================
# Data Augmentation
# =============================================================================

def _generate_augmentations(
    image: np.ndarray,
    n_augmentations: int,
    aug_cfg: dict,
) -> List[Tuple[np.ndarray, str]]:
    """
    Generate augmented versions of an image.

    Returns list of (augmented_image, augmentation_description) tuples.
    """
    augmented = []
    h, w = image.shape[:2]

    aug_types = [
        "rotation",
        "scale",
        "brightness",
        "contrast",
        "blur",
        "translation",
        "perspective",
    ]

    for i in range(min(n_augmentations, len(aug_types))):
        aug_type = aug_types[i % len(aug_types)]
        aug_img = _apply_augmentation(image, aug_type, aug_cfg)
        augmented.append((aug_img, aug_type))

    return augmented


def _apply_augmentation(
    image: np.ndarray,
    aug_type: str,
    aug_cfg: dict,
) -> np.ndarray:
    """Apply a single augmentation type."""
    h, w = image.shape[:2]
    result = image.copy()

    if aug_type == "rotation":
        angle = random.uniform(
            -aug_cfg.get("rotation_range", 15),
            aug_cfg.get("rotation_range", 15),
        )
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        result = cv2.warpAffine(result, M, (w, h), borderMode=cv2.BORDER_REFLECT)

    elif aug_type == "scale":
        scale_range = aug_cfg.get("scale_range", [0.9, 1.1])
        scale = random.uniform(scale_range[0], scale_range[1])
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cv2.resize(result, (new_w, new_h))
        # Center crop/pad back to original size
        result = _center_crop_or_pad(resized, w, h)

    elif aug_type == "brightness":
        b_range = aug_cfg.get("brightness_range", [-30, 30])
        delta = random.uniform(b_range[0], b_range[1])
        result = np.clip(result.astype(np.float32) + delta, 0, 255).astype(np.uint8)

    elif aug_type == "contrast":
        c_range = aug_cfg.get("contrast_range", [0.8, 1.2])
        factor = random.uniform(c_range[0], c_range[1])
        mean = np.mean(result)
        result = np.clip(
            (result.astype(np.float32) - mean) * factor + mean, 0, 255
        ).astype(np.uint8)

    elif aug_type == "blur":
        max_k = aug_cfg.get("blur_max_kernel", 3)
        k = max(1, max_k)
        if k % 2 == 0:
            k += 1
        result = cv2.GaussianBlur(result, (k, k), 0)

    elif aug_type == "translation":
        t_range = aug_cfg.get("translation_range", 10)
        tx = random.uniform(-t_range, t_range)
        ty = random.uniform(-t_range, t_range)
        M = np.float32([[1, 0, tx], [0, 1, ty]])
        result = cv2.warpAffine(result, M, (w, h), borderMode=cv2.BORDER_REFLECT)

    elif aug_type == "perspective":
        strength = aug_cfg.get("perspective_strength", 0.02)
        pts1 = np.float32([[0, 0], [w, 0], [0, h], [w, h]])
        offsets = np.random.uniform(-strength * w, strength * w, (4, 2)).astype(np.float32)
        pts2 = pts1 + offsets
        M = cv2.getPerspectiveTransform(pts1, pts2)
        result = cv2.warpPerspective(result, M, (w, h), borderMode=cv2.BORDER_REFLECT)

    return result


def _center_crop_or_pad(
    image: np.ndarray,
    target_w: int,
    target_h: int,
) -> np.ndarray:
    """Center crop or pad image to target size."""
    h, w = image.shape[:2]

    if h >= target_h and w >= target_w:
        # Center crop
        y_start = (h - target_h) // 2
        x_start = (w - target_w) // 2
        return image[y_start:y_start + target_h, x_start:x_start + target_w]
    else:
        # Pad
        result = np.zeros((target_h, target_w), dtype=image.dtype)
        y_start = max(0, (target_h - h) // 2)
        x_start = max(0, (target_w - w) // 2)
        paste_h = min(h, target_h)
        paste_w = min(w, target_w)
        result[y_start:y_start + paste_h, x_start:x_start + paste_w] = \
            image[:paste_h, :paste_w]
        return result


# =============================================================================
# Product-Level Dataset Split
# =============================================================================

def split_dataset(
    pairs: List[ImagePair],
    item_ids: List[str],
    config: dict,
) -> DatasetSplit:
    """
    Split dataset by physical item (product-level split).

    All pairs belonging to one physical item stay in the same split.
    This prevents data leakage.

    Args:
        pairs: All generated image pairs.
        item_ids: All unique item IDs.
        config: Configuration dictionary.

    Returns:
        DatasetSplit with train/val/test pairs.
    """
    dataset_cfg = config.get("dataset", {})
    train_ratio = dataset_cfg.get("train_ratio", 0.70)
    val_ratio = dataset_cfg.get("val_ratio", 0.15)
    min_items = dataset_cfg.get("min_items_for_training", 4)

    # Determine training mode
    n_items = len(item_ids)
    mode = TrainingMode.REAL if n_items >= min_items else TrainingMode.DEMO

    if mode == TrainingMode.DEMO:
        logger.warning(
            f"\n{'='*60}\n"
            f"DEMO MODE: Only {n_items} items detected.\n"
            f"Dataset size is insufficient for reliable model training.\n"
            f"Collect more images per physical item under different conditions.\n"
            f"Minimum {min_items} items recommended for REAL training.\n"
            f"{'='*60}"
        )
        print(
            f"\n[!] DEMO / DATA PREPARATION MODE\n"
            f"   Only {n_items} item(s) detected.\n"
            f"   Dataset size is insufficient for reliable model training.\n"
            f"   Collect more images per physical item under different conditions.\n"
        )

    # Shuffle items for random split
    shuffled_items = item_ids.copy()
    random.shuffle(shuffled_items)

    # Calculate split boundaries
    n_train = max(1, int(n_items * train_ratio))
    n_val = max(0, int(n_items * val_ratio))
    # Ensure at least 1 item per split when possible
    if n_items >= 3:
        n_val = max(1, n_val)
    n_test = n_items - n_train - n_val

    train_items = shuffled_items[:n_train]
    val_items = shuffled_items[n_train:n_train + n_val]
    test_items = shuffled_items[n_train + n_val:]

    # Assign pairs to splits based on their items
    train_item_set = set(train_items)
    val_item_set = set(val_items)
    test_item_set = set(test_items)

    split = DatasetSplit(mode=mode)
    split.train_items = train_items
    split.val_items = val_items
    split.test_items = test_items

    for pair in pairs:
        # Extract base item ID (remove _aug suffix)
        ref_base = _get_base_item_id(pair.reference_item_id)
        ver_base = _get_base_item_id(pair.verification_item_id)

        # For positive pairs, both IDs map to the same item
        # For negative pairs, assign to the split of the first item
        primary_item = ref_base

        if primary_item in train_item_set:
            # Also check that the other item (for negatives) is in train
            if ver_base in train_item_set or ver_base == ref_base:
                split.train_pairs.append(pair)
        elif primary_item in val_item_set:
            if ver_base in val_item_set or ver_base == ref_base:
                split.val_pairs.append(pair)
        elif primary_item in test_item_set:
            if ver_base in test_item_set or ver_base == ref_base:
                split.test_pairs.append(pair)

    logger.info(
        f"Dataset split ({mode.value}):\n"
        f"  Train: {len(split.train_pairs)} pairs from "
        f"{len(train_items)} items\n"
        f"  Val:   {len(split.val_pairs)} pairs from "
        f"{len(val_items)} items\n"
        f"  Test:  {len(split.test_pairs)} pairs from "
        f"{len(test_items)} items"
    )

    return split


def _get_base_item_id(item_id: str) -> str:
    """Extract base item ID by removing augmentation suffix."""
    if "_aug" in item_id:
        return item_id.split("_aug")[0]
    return item_id


# =============================================================================
# Save Features CSV
# =============================================================================

def save_features_csv(
    feature_records: List[dict],
    output_path: str,
) -> str:
    """
    Save feature vectors to CSV.

    Args:
        feature_records: List of dicts, each containing pair metadata + features.
        output_path: Path to save the CSV.

    Returns:
        Path to saved CSV.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    df = pd.DataFrame(feature_records)

    # Reorder columns: metadata first, then features
    metadata_cols = [
        "pair_id", "reference_item_id", "verification_item_id", "label"
    ]
    feature_cols = [c for c in df.columns if c not in metadata_cols]
    ordered_cols = [c for c in metadata_cols if c in df.columns] + sorted(feature_cols)
    df = df[ordered_cols]

    df.to_csv(output_path, index=False)
    logger.info(f"Saved features CSV: {output_path} ({len(df)} rows)")
    return output_path
