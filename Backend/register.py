#!/usr/bin/env python3
"""
Kalakriti — Product Registration / Enrollment CLI Script.

Registers genuine physical products into the fingerprint database:
1. Loads reference image(s) for a given product ID
2. Inspects image quality and estimates surface integrity
3. Detects the optimal single physical texture ROI
4. Generates physical fingerprint (keypoints + LBP + GLCM)
5. Constructs Layer 1 Digital Manifest and cryptographically signs with RSA-2048
6. Stores fingerprint, signature, and metadata in the product registry database
"""

import os
import sys
import argparse
import logging

from src.utils import (
    load_config,
    setup_directories,
    setup_logging,
    find_images,
)
from src.image_loader import inspect_image, load_image
from src.image_quality import analyze_quality
from src.registry import ProductRegistry
from src.roi_detection import draw_roi_preview

logger = logging.getLogger(__name__)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Kalakriti — Register physical product fingerprint into database"
    )
    parser.add_argument(
        "--product-id", "-p",
        required=True,
        help="Unique product identifier (e.g. P001, ART-2026-01)"
    )
    parser.add_argument(
        "--name", "-n",
        default="",
        help="Human-readable product name (e.g. 'Pashmina Silk Shawl')"
    )
    parser.add_argument(
        "--manufacturer",
        default="KALAKRITI_AUTH_MFG",
        help="Manufacturer identifier (default: KALAKRITI_AUTH_MFG)"
    )
    parser.add_argument(
        "--category",
        default="handicraft",
        help="Product category (default: handicraft)"
    )
    parser.add_argument(
        "--batch",
        default="BATCH_2026_01",
        help="Batch / lot number (default: BATCH_2026_01)"
    )
    parser.add_argument(
        "--location",
        default="India",
        help="Manufacturing location (default: India)"
    )
    parser.add_argument(
        "--image", "-i",
        default=None,
        help="Path to single reference photograph of the product"
    )
    parser.add_argument(
        "--images",
        nargs="+",
        default=None,
        help="Paths to multiple reference photographs of the product"
    )
    parser.add_argument(
        "--debug", "-d",
        action="store_true",
        help="Save debug preview visualizations"
    )
    parser.add_argument(
        "--force", "-f",
        action="store_true",
        help="Force overwrite if product ID is already registered"
    )
    parser.add_argument(
        "--config", "-c",
        default=None,
        help="Path to custom config.yaml file"
    )
    parser.add_argument(
        "--storage-dir", "-s",
        default=None,
        help="Directory to store product fingerprints (default: data/fingerprints)"
    )
    parser.add_argument(
        "--keys-dir", "-k",
        default="keys",
        help="Directory containing RSA public/private keys (default: keys)"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    project_root = os.path.dirname(os.path.abspath(__file__))

    # Load configuration
    config = load_config(args.config)

    # Setup directories
    abs_paths = setup_directories(config, project_root)
    reports_dir = abs_paths["reports"]
    storage_dir = args.storage_dir or abs_paths["fingerprints"]
    keys_dir = os.path.join(project_root, args.keys_dir)

    debug_dir = os.path.join(project_root, "artifacts", "debug") if args.debug else reports_dir
    os.makedirs(debug_dir, exist_ok=True)

    # Configure logging
    log_file = os.path.join(reports_dir, "registration.log")
    setup_logging(level=logging.DEBUG if args.debug else logging.INFO, log_file=log_file)

    # Collect image paths
    image_paths = []
    if args.image:
        image_paths.append(args.image)
    if args.images:
        image_paths.extend(args.images)

    if not image_paths:
        print("\n[ERROR] Please provide at least one reference photograph with --image or --images.")
        print("   Example: python register.py --product-id P001 --image path/to/reference.jpg")
        sys.exit(1)

    # Validate image files exist
    for p in image_paths:
        if not os.path.exists(p):
            print(f"\n[ERROR] Image file not found: '{p}'")
            sys.exit(1)

    product_id = args.product_id.strip()
    registry = ProductRegistry(storage_dir=storage_dir, keys_dir=keys_dir, config=config)

    # Check for existing product ID
    if registry.check_duplicate_product_id(product_id) and not args.force:
        print(f"\n[ERROR] Registration Failed: Product ID '{product_id}' is already registered in database.")
        print("   If you intended to update or re-enroll this product, add the --force flag:")
        print(f"   python register.py --product-id {product_id} --image {image_paths[0]} --force")
        sys.exit(1)

    print(f"\n{'='*60}")
    print("KALAKRITI PRODUCT ENROLLMENT & DIGITAL IDENTITY SIGNING")
    print(f"{'='*60}")
    print(f"Product ID        : {product_id}")
    print(f"Product Name      : {args.name or product_id}")
    print(f"Manufacturer ID   : {args.manufacturer}")
    print(f"Category          : {args.category}")
    print(f"Batch Number      : {args.batch}")
    print(f"Reference Photos  : {len(image_paths)}")
    for i, p in enumerate(image_paths, 1):
        print(f"  [{i}] {os.path.basename(p)}")
    print(f"{'-'*60}")

    # Perform enrollment
    try:
        record, roi = registry.enroll_from_images(
            product_id=product_id,
            image_paths=image_paths,
            product_name=args.name,
            manufacturer_id=args.manufacturer,
            category=args.category,
            batch_number=args.batch,
            manufacturing_location=args.location,
            config=config,
            force=args.force,
        )
    except Exception as e:
        print(f"\n[ERROR] Enrollment Failed: {e}")
        logger.exception(f"Enrollment failed for {product_id}")
        sys.exit(1)

    # Save debug preview if enabled
    if args.debug or config.get("debug", {}).get("save_roi_preview", True):
        preview_path = os.path.join(debug_dir, f"{product_id}_registration_roi.jpg")
        ref_img = load_image(image_paths[0])
        if ref_img is not None:
            draw_roi_preview(ref_img, roi, preview_path)

    # Print success summary
    print("Layer 2 Physical Fingerprint:")
    print(f"  Quality Score   : {roi.quality_score:.2f} ({'EXCELLENT' if roi.quality_score >= 0.75 else ('GOOD' if roi.quality_score >= 0.55 else 'FAIR')})")
    print(f"  Sharpness       : {roi.sharpness:.1f}")
    print(f"  Contrast        : {roi.contrast:.1f}")
    print(f"  Keypoints       : {record.fingerprint.num_keypoints}")
    print(f"  Feature Method  : {record.fingerprint.feature_method}")
    print(f"  ROI Position    : ({roi.position[0]}, {roi.position[1]})")
    print(f"  ROI Size        : {roi.size[0]}x{roi.size[1]} px")
    print(f"  Feature Version : v{record.feature_version}")

    print("\nLayer 1 Cryptographic Manifest:")
    print(f"  Manifest SHA-256: {record.manifest_hash}")
    print(f"  RSA Signature   : {record.rsa_signature[:32]}... ({len(record.rsa_signature)} hex chars)")

    print(f"{'-'*60}")
    print(f"[SUCCESS] Product '{product_id}' successfully registered & signed!")
    print(f"   Database Path   : {os.path.join(storage_dir, f'{product_id}.json')}")
    print(f"   Fingerprint File: {os.path.join(storage_dir, f'{product_id}_fingerprint.npz')}")
    print(f"   Total Enrolled  : {registry.count()} product(s) in registry")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
