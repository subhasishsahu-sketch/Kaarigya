"""
Kalakriti — Product Fingerprint & Digital Identity Registry Module.

Manages persistent storage, enrollment, multi-image aggregation, cryptographic
manifest signing, and retrieval of registered physical product fingerprints
and digital identity records.
"""

import os
import json
import logging
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple, Any

import cv2
import numpy as np

from src.utils import load_json, save_json, load_config
from src.image_loader import load_image, inspect_image, normalize_image
from src.roi_detection import select_roi, TextureROI
from src.preprocessing import preprocess_roi
from src.feature_extraction import (
    PhysicalFingerprint,
    generate_fingerprint,
    save_fingerprint,
    load_fingerprint,
    CURRENT_FEATURE_VERSION,
    CURRENT_PREPROCESSING_VERSION,
    CURRENT_MODEL_VERSION,
)
from src.cryptography import (
    hash_manifest,
    generate_rsa_keypair,
    sign_manifest,
    load_private_key,
    load_public_key,
    save_keypair,
    verify_manifest_signature,
)

logger = logging.getLogger(__name__)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class ProductRecord:
    """Complete registration record for an enrolled physical product."""
    product_id: str
    fingerprint: PhysicalFingerprint
    roi_metadata: Dict[str, Any] = field(default_factory=dict)
    registration_metadata: Dict[str, Any] = field(default_factory=dict)

    # Product and provenance metadata
    product_name: str = ""
    manufacturer_id: str = "KALAKRITI_AUTH_MFG"
    category: str = "handicraft"
    batch_number: str = "BATCH_2026_01"
    manufacturing_location: str = "India"
    registration_timestamp: str = ""

    # Versioning
    feature_version: str = CURRENT_FEATURE_VERSION
    preprocessing_version: str = CURRENT_PREPROCESSING_VERSION
    model_version: str = CURRENT_MODEL_VERSION

    # Cryptographic Layer 1 Digital Identity
    manifest: Dict[str, Any] = field(default_factory=dict)
    manifest_hash: str = ""
    rsa_signature: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "product_id": self.product_id,
            "product_name": self.product_name or self.product_id,
            "manufacturer_id": self.manufacturer_id,
            "category": self.category,
            "batch_number": self.batch_number,
            "manufacturing_location": self.manufacturing_location,
            "registration_timestamp": self.registration_timestamp or self.registration_metadata.get("registered_at", ""),
            "feature_version": self.feature_version,
            "preprocessing_version": self.preprocessing_version,
            "model_version": self.model_version,
            "manifest": self.manifest,
            "manifest_hash": self.manifest_hash,
            "rsa_signature": self.rsa_signature,
            "roi_metadata": self.roi_metadata,
            "registration_metadata": self.registration_metadata,
            "fingerprint_summary": {
                "num_keypoints": self.fingerprint.num_keypoints if self.fingerprint else 0,
                "feature_method": self.fingerprint.feature_method if self.fingerprint else "ORB",
                "roi_position": self.fingerprint.roi_position if self.fingerprint else [0, 0],
                "roi_size": self.fingerprint.roi_size if self.fingerprint else [0, 0],
                "roi_quality": self.fingerprint.roi_quality if self.fingerprint else 0.0,
            } if self.fingerprint else {},
        }


# =============================================================================
# Product Registry
# =============================================================================

class ProductRegistry:
    """
    Registry database for physical product fingerprints and digital identities.
    """

    def __init__(
        self,
        storage_dir: str = "data/fingerprints",
        keys_dir: str = "keys",
        config: Optional[dict] = None,
    ):
        self.storage_dir = storage_dir
        self.keys_dir = keys_dir
        self.config = config or load_config()
        os.makedirs(self.storage_dir, exist_ok=True)
        os.makedirs(self.keys_dir, exist_ok=True)
        self.index_path = os.path.join(self.storage_dir, "registry_index.json")
        self._ensure_index()
        self._ensure_crypto_keys()

    def _ensure_index(self):
        """Ensure registry index exists and is synchronized."""
        if not os.path.exists(self.index_path):
            save_json({"products": {}}, self.index_path)

    def _ensure_crypto_keys(self):
        """Ensure RSA public and private keys exist, creating them if necessary."""
        priv_path = os.path.join(self.keys_dir, "private_key.pem")
        pub_path = os.path.join(self.keys_dir, "public_key.pem")
        if not os.path.exists(priv_path) or not os.path.exists(pub_path):
            priv_k, pub_k = generate_rsa_keypair()
            save_keypair(priv_k, pub_k, keys_dir=self.keys_dir)

    def get_public_key(self):
        """Load authority RSA public key for verification."""
        pub_path = os.path.join(self.keys_dir, "public_key.pem")
        return load_public_key(pub_path)

    def get_private_key(self):
        """Load authority RSA private key for signing."""
        priv_path = os.path.join(self.keys_dir, "private_key.pem")
        return load_private_key(priv_path)

    def _get_index(self) -> Dict[str, Any]:
        """Read registry index."""
        try:
            return load_json(self.index_path)
        except Exception:
            return {"products": {}}

    def _save_index(self, index_data: Dict[str, Any]):
        """Write registry index."""
        save_json(index_data, self.index_path)

    def has_product(self, product_id: str) -> bool:
        """Check if product ID is already registered."""
        index = self._get_index()
        return product_id in index.get("products", {})

    def check_duplicate_product_id(self, product_id: str) -> bool:
        """Alias for has_product to enforce duplicate rejection."""
        return self.has_product(product_id)

    def count(self) -> int:
        """Return number of registered products."""
        return len(self._get_index().get("products", {}))

    def register_product(
        self,
        product_id: str,
        fingerprint: PhysicalFingerprint,
        roi_metadata: Dict[str, Any],
        source_images: List[str],
        product_name: str = "",
        manufacturer_id: str = "KALAKRITI_AUTH_MFG",
        category: str = "handicraft",
        batch_number: str = "BATCH_2026_01",
        manufacturing_location: str = "India",
        force: bool = False,
    ) -> ProductRecord:
        """
        Store a product fingerprint and metadata in the registry, generate
        canonical manifest, compute SHA-256 digest, and cryptographically sign with RSA.
        """
        if self.has_product(product_id) and not force:
            raise ValueError(
                f"Product ID '{product_id}' is already registered in database. "
                "Use --force to overwrite if this is intentional."
            )

        # Save fingerprint .npz file
        fp_path = os.path.join(self.storage_dir, f"{product_id}_fingerprint.npz")
        fingerprint.item_id = product_id
        save_fingerprint(fingerprint, self.storage_dir)

        now_iso = datetime.now().isoformat()

        # Build canonical manifest for Layer 1 Digital Identity
        manifest = {
            "product_id": product_id,
            "product_name": product_name or product_id,
            "manufacturer_id": manufacturer_id,
            "category": category,
            "batch_number": batch_number,
            "manufacturing_location": manufacturing_location,
            "registered_at": now_iso,
            "fingerprint_summary": {
                "num_keypoints": fingerprint.num_keypoints,
                "feature_method": fingerprint.feature_method,
                "roi_position": list(fingerprint.roi_position),
                "roi_size": list(fingerprint.roi_size),
                "roi_quality": float(fingerprint.roi_quality),
            },
        }

        # SHA-256 hash of canonical manifest
        manifest_hash = hash_manifest(manifest)

        # RSA sign the canonical manifest
        try:
            priv_k = self.get_private_key()
            rsa_signature = sign_manifest(manifest, priv_k)
        except Exception as e:
            logger.error(f"Failed to sign manifest with RSA: {e}")
            rsa_signature = ""

        # Registration metadata
        reg_metadata = {
            "registered_at": now_iso,
            "source_images": [os.path.basename(p) for p in source_images],
            "image_count": len(source_images),
            "fingerprint_file": os.path.basename(fp_path),
        }

        record = ProductRecord(
            product_id=product_id,
            product_name=product_name or product_id,
            manufacturer_id=manufacturer_id,
            category=category,
            batch_number=batch_number,
            manufacturing_location=manufacturing_location,
            registration_timestamp=now_iso,
            fingerprint=fingerprint,
            roi_metadata=roi_metadata,
            registration_metadata=reg_metadata,
            feature_version=fingerprint.feature_version,
            preprocessing_version=fingerprint.preprocessing_version,
            model_version=fingerprint.model_version,
            manifest=manifest,
            manifest_hash=manifest_hash,
            rsa_signature=rsa_signature,
        )

        # Save product JSON metadata
        meta_path = os.path.join(self.storage_dir, f"{product_id}.json")
        save_json(record.to_dict(), meta_path)

        # Update index
        index = self._get_index()
        index.setdefault("products", {})[product_id] = {
            "product_name": record.product_name,
            "metadata_file": os.path.basename(meta_path),
            "fingerprint_file": os.path.basename(fp_path),
            "registered_at": now_iso,
            "image_count": len(source_images),
            "quality_score": roi_metadata.get("quality_score", 0.0),
            "manifest_hash": manifest_hash,
            "has_signature": bool(rsa_signature),
        }
        self._save_index(index)

        logger.info(f"Registered product '{product_id}' (Digital Manifest Hash: {manifest_hash[:12]}...).")
        return record

    def add_product(self, *args, **kwargs) -> ProductRecord:
        """Alias for register_product."""
        return self.register_product(*args, **kwargs)

    def enroll_from_images(
        self,
        product_id: str,
        image_paths: List[str],
        product_name: str = "",
        manufacturer_id: str = "KALAKRITI_AUTH_MFG",
        category: str = "handicraft",
        batch_number: str = "BATCH_2026_01",
        manufacturing_location: str = "India",
        config: Optional[dict] = None,
        force: bool = False,
    ) -> Tuple[ProductRecord, TextureROI]:
        """
        Complete enrollment pipeline for one or more reference images.
        """
        cfg = config or self.config
        if not image_paths:
            raise ValueError("No reference images provided for enrollment.")

        # Check duplicate
        if self.has_product(product_id) and not force:
            raise ValueError(
                f"Product ID '{product_id}' is already registered in database. "
                "Use --force if you wish to re-enroll and replace it."
            )

        # Load and analyze candidate images
        candidate_rois = []
        candidate_processed = []

        for img_path in image_paths:
            img = load_image(img_path)
            if img is None:
                logger.warning(f"Skipping unreadable reference image: {img_path}")
                continue

            # Normalize image if needed
            norm_img, _ = normalize_image(img, cfg)

            # Select single best ROI
            roi = select_roi(norm_img, product_id, cfg)
            if roi is None or not roi.is_valid:
                logger.warning(
                    f"Low ROI quality on {os.path.basename(img_path)}: "
                    f"{roi.failure_reason if roi else 'Detection failed'}"
                )
                if roi is not None:
                    candidate_rois.append((roi, img_path))
                continue

            # Preprocess ROI
            orig_gray, proc_gray = preprocess_roi(roi.roi_image, cfg)
            candidate_rois.append((roi, img_path))
            candidate_processed.append((roi, proc_gray, img_path))

        if not candidate_rois:
            raise RuntimeError(
                f"Failed to extract any valid ROI from provided images for product '{product_id}'."
            )

        # Select the highest quality ROI
        if candidate_processed:
            candidate_processed.sort(key=lambda item: item[0].quality_score, reverse=True)
            best_roi, best_proc, best_path = candidate_processed[0]
        else:
            candidate_rois.sort(key=lambda item: item[0].quality_score, reverse=True)
            best_roi, best_path = candidate_rois[0]
            _, best_proc = preprocess_roi(best_roi.roi_image, cfg)

        # Generate physical fingerprint
        fingerprint = generate_fingerprint(
            processed_gray=best_proc,
            item_id=product_id,
            roi_position=best_roi.position,
            roi_size=best_roi.size,
            config=cfg,
            roi_quality=best_roi.quality_score,
        )

        if fingerprint is None or fingerprint.num_keypoints < 4:
            raise RuntimeError(
                f"Insufficient keypoints extracted from ROI for product '{product_id}'."
            )

        # Multi-image enhancement: if multiple valid reference photos, merge descriptors & features
        if len(candidate_processed) > 1:
            all_descriptors = [fingerprint.descriptors] if fingerprint.descriptors is not None else []
            all_coords = [fingerprint.keypoint_coords]
            all_lbp = [fingerprint.lbp_histogram]
            all_glcm = [fingerprint.glcm_vector] if fingerprint.glcm_vector is not None else []

            for other_roi, other_proc, other_path in candidate_processed[1:]:
                other_fp = generate_fingerprint(
                    processed_gray=other_proc,
                    item_id=product_id,
                    roi_position=other_roi.position,
                    roi_size=other_roi.size,
                    config=cfg,
                    roi_quality=other_roi.quality_score,
                )
                if other_fp and other_fp.descriptors is not None and len(other_fp.descriptors) > 0:
                    all_descriptors.append(other_fp.descriptors)
                    all_coords.append(other_fp.keypoint_coords)
                    all_lbp.append(other_fp.lbp_histogram)
                    if other_fp.glcm_vector is not None:
                        all_glcm.append(other_fp.glcm_vector)

            if all_descriptors:
                fingerprint.descriptors = np.vstack(all_descriptors)
                fingerprint.keypoint_coords = np.vstack(all_coords)
                fingerprint.num_keypoints = len(fingerprint.descriptors)
                # Average LBP histogram across reference photos
                fingerprint.lbp_histogram = np.mean(all_lbp, axis=0)
                if all_glcm:
                    fingerprint.glcm_vector = np.mean(all_glcm, axis=0)
                logger.info(
                    f"Fused multi-image fingerprint for {product_id}: "
                    f"{fingerprint.num_keypoints} descriptors across {len(candidate_processed)} photos"
                )

        roi_meta = {
            "position": best_roi.position,
            "size": best_roi.size,
            "quality_score": best_roi.quality_score,
            "sharpness": best_roi.sharpness,
            "contrast": best_roi.contrast,
            "gradient_strength": best_roi.gradient_strength,
            "keypoint_count": fingerprint.num_keypoints,
            "reflection_ratio": best_roi.reflection_ratio,
            "is_valid": best_roi.is_valid,
        }

        record = self.register_product(
            product_id=product_id,
            fingerprint=fingerprint,
            roi_metadata=roi_meta,
            source_images=image_paths,
            product_name=product_name,
            manufacturer_id=manufacturer_id,
            category=category,
            batch_number=batch_number,
            manufacturing_location=manufacturing_location,
            force=force,
        )

        return record, best_roi

    def get_product(self, product_id: str) -> Optional[ProductRecord]:
        """Load a product record and its fingerprint from registry."""
        fp_path = os.path.join(self.storage_dir, f"{product_id}_fingerprint.npz")
        meta_path = os.path.join(self.storage_dir, f"{product_id}.json")

        if not os.path.exists(fp_path):
            return None

        try:
            fp = load_fingerprint(fp_path)
            meta = load_json(meta_path) if os.path.exists(meta_path) else {}
            return ProductRecord(
                product_id=product_id,
                product_name=meta.get("product_name", product_id),
                manufacturer_id=meta.get("manufacturer_id", "KALAKRITI_AUTH_MFG"),
                category=meta.get("category", "handicraft"),
                batch_number=meta.get("batch_number", "BATCH_2026_01"),
                manufacturing_location=meta.get("manufacturing_location", "India"),
                registration_timestamp=meta.get("registration_timestamp", ""),
                fingerprint=fp,
                roi_metadata=meta.get("roi_metadata", {}),
                registration_metadata=meta.get("registration_metadata", {}),
                feature_version=meta.get("feature_version", fp.feature_version),
                preprocessing_version=meta.get("preprocessing_version", fp.preprocessing_version),
                model_version=meta.get("model_version", fp.model_version),
                manifest=meta.get("manifest", {}),
                manifest_hash=meta.get("manifest_hash", ""),
                rsa_signature=meta.get("rsa_signature", ""),
            )
        except Exception as e:
            logger.error(f"Error loading product '{product_id}': {e}")
            return None

    def list_products(self) -> List[ProductRecord]:
        """List and load all registered product records."""
        index = self._get_index()
        products = []
        for pid in index.get("products", {}).keys():
            record = self.get_product(pid)
            if record:
                products.append(record)
        return products

    def search_fingerprints(self) -> List[Tuple[str, PhysicalFingerprint]]:
        """Retrieve all active product IDs and their physical fingerprints."""
        products = self.list_products()
        return [(p.product_id, p.fingerprint) for p in products if p.fingerprint is not None]

    def validate_product(self, product_id: str) -> Tuple[bool, str]:
        """
        Validate Layer 1 Digital Identity: verify manifest hash and RSA digital signature.
        """
        record = self.get_product(product_id)
        if record is None:
            return False, f"Product '{product_id}' not found in registry."

        if not record.manifest or not record.rsa_signature:
            return False, f"Product '{product_id}' is missing digital manifest or RSA signature."

        # Verify manifest hash matches computed hash
        expected_hash = hash_manifest(record.manifest)
        if record.manifest_hash and record.manifest_hash != expected_hash:
            return False, f"Digital manifest hash mismatch (expected {expected_hash[:8]}, got {record.manifest_hash[:8]})."

        # Verify RSA digital signature
        try:
            pub_k = self.get_public_key()
            is_valid, msg = verify_manifest_signature(record.manifest, record.rsa_signature, pub_k)
            return is_valid, msg
        except Exception as e:
            return False, f"Cryptographic verification error: {e}"

    def update_product(self, product_id: str, updates: Dict[str, Any]) -> bool:
        """Update metadata for an existing registered product."""
        record = self.get_product(product_id)
        if record is None:
            return False

        meta_path = os.path.join(self.storage_dir, f"{product_id}.json")
        rec_dict = record.to_dict()
        for k, v in updates.items():
            if k in rec_dict:
                rec_dict[k] = v

        save_json(rec_dict, meta_path)
        logger.info(f"Updated product metadata for '{product_id}'.")
        return True

    def delete_product(self, product_id: str) -> bool:
        """Remove a product from registry."""
        index = self._get_index()
        if product_id not in index.get("products", {}):
            return False

        del index["products"][product_id]
        self._save_index(index)

        # Remove files if they exist
        fp_path = os.path.join(self.storage_dir, f"{product_id}_fingerprint.npz")
        meta_path = os.path.join(self.storage_dir, f"{product_id}.json")
        if os.path.exists(fp_path):
            os.remove(fp_path)
        if os.path.exists(meta_path):
            os.remove(meta_path)

        logger.info(f"Deleted product '{product_id}' from registry.")
        return True
