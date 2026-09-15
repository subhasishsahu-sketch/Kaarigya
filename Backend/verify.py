#!/usr/bin/env python3
"""
Kalakriti — 1:N Product Verification & Identification CLI Script.

Input: ONLY ONE query verification photograph.
Workflow:
1. Pre-flight image quality evaluation & capture guidance
2. Locates product surface & extracts ONE optimal single texture ROI
3. Generates query physical fingerprint (ORB/AKAZE + LBP + GLCM)
4. Automatically searches the entire registered product database (1:N matching)
5. Predicts authenticity & ranks candidates against calibrated threshold (Physical Layer)
6. Verifies Layer 1 RSA Digital Identity (SHA-256 Manifest + Digital Signature)
7. Renders final dual-layer decision (AUTHENTIC vs COUNTERFEIT / UNKNOWN)
"""

import os
import sys
import json
import argparse
import logging

import numpy as np

from src.utils import (
    load_config,
    setup_directories,
    setup_logging,
    VerificationStatus,
)
from src.image_loader import load_image
from src.registry import ProductRegistry
from src.model_training import load_model
from src.verification import verify_query_image_1_to_n, VerificationResult

logger = logging.getLogger(__name__)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Kalakriti — Automated 1:N Physical Product Authentication"
    )
    parser.add_argument(
        "--query", "-q",
        required=True,
        help="Path to query verification photograph"
    )
    parser.add_argument(
        "--threshold", "-t",
        type=float,
        default=None,
        help="Verification threshold in [0, 1] or [0, 100] (default: from calibrated threshold artifact or config)"
    )
    parser.add_argument(
        "--reference", "-r",
        default=None,
        help="[Optional Developer Mode] Path to specific reference image for 1:1 test"
    )
    parser.add_argument(
        "--debug", "-d",
        action="store_true",
        help="Enable debug mode: save intermediate visualization artifacts"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable JSON format"
    )
    parser.add_argument(
        "--no-layer2",
        action="store_true",
        help="Disable Layer 2 counterfeit intelligence pipeline"
    )
    parser.add_argument(
        "--layer2-json",
        action="store_true",
        help="Print Layer 2 intelligence report as JSON (implies --no-layer2 interactive prompt)"
    )
    parser.add_argument(
        "--model-dir", "-m",
        default="models",
        help="Directory containing the trained model (default: models)"
    )
    parser.add_argument(
        "--storage-dir", "-s",
        default=None,
        help="Directory containing registered product fingerprints (default: data/fingerprints)"
    )
    parser.add_argument(
        "--keys-dir", "-k",
        default="keys",
        help="Directory containing RSA public/private keys (default: keys)"
    )
    parser.add_argument(
        "--config", "-c",
        default=None,
        help="Path to custom config.yaml file"
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

    debug_dir = os.path.join(project_root, "artifacts", "debug") if args.debug else (
        reports_dir if config.get("debug", {}).get("enabled", False) else None
    )
    if debug_dir:
        os.makedirs(debug_dir, exist_ok=True)

    # Configure logging
    log_file = os.path.join(reports_dir, "verification.log")
    setup_logging(level=logging.DEBUG if args.debug else logging.INFO, log_file=log_file)

    # Normalize threshold if passed as percentage (e.g. 85 -> 0.85)
    threshold_override = None
    if args.threshold is not None:
        threshold_override = args.threshold / 100.0 if args.threshold > 1.0 else args.threshold

    # 1. Load Query Image
    query_path = args.query
    if not os.path.exists(query_path):
        if args.json:
            print(json.dumps({"error": f"Query image not found: {query_path}"}, indent=2))
        else:
            print(f"\n[ERROR] Query image not found: '{query_path}'")
        sys.exit(1)

    query_img = load_image(query_path)
    if query_img is None:
        if args.json:
            print(json.dumps({"error": f"Failed to load image: {query_path}"}, indent=2))
        else:
            print(f"\n[ERROR] Failed to load query image: '{query_path}'")
        sys.exit(1)

    query_name = os.path.splitext(os.path.basename(query_path))[0]

    # 2. Load Registry
    registry = ProductRegistry(storage_dir=storage_dir, keys_dir=keys_dir, config=config)

    # 3. Load Trained Model
    model_dir = os.path.join(project_root, args.model_dir)
    model, scaler, feature_names = None, None, []
    if os.path.exists(model_dir):
        try:
            model, scaler, feature_names, _ = load_model(model_dir)
        except Exception as e:
            logger.warning(f"Could not load trained model from {model_dir}: {e}. Using calibrated multi-feature heuristic.")

    # 4. Developer 1:1 Fallback Mode (only if --reference is explicitly passed)
    if args.reference:
        ref_path = args.reference
        if not os.path.exists(ref_path):
            print(f"\n[ERROR] Reference path not found: '{ref_path}'")
            sys.exit(1)

        temp_pid = f"temp_ref_{os.path.splitext(os.path.basename(ref_path))[0]}"
        if not registry.has_product(temp_pid):
            try:
                registry.enroll_from_images(temp_pid, [ref_path], config=config, force=True)
            except Exception as e:
                print(f"[ERROR] Failed to process reference image: {e}")
                sys.exit(1)

    # 5. Execute 1:N Verification Pipeline
    threshold_file_path = os.path.join(project_root, "artifacts", "thresholds", "threshold.json")
    result = verify_query_image_1_to_n(
        query_image=query_img,
        query_name=query_name,
        registry=registry,
        model=model,
        scaler=scaler,
        feature_names=feature_names,
        config=config,
        threshold_override=threshold_override,
        threshold_file_path=threshold_file_path,
        debug_dir=debug_dir,
    )

    # 6. Format and Print Results
    if args.json:
        print(json.dumps(result.to_dict(), indent=2))
        sys.exit(0 if result.status == VerificationStatus.VERIFIED else 1)

    # Human-Readable Production Output
    print(f"\n{'='*50}")
    print("KALAKRITI PHYSICAL PRODUCT AUTHENTICATION")
    print(f"{'='*50}\n")
    print(f"Query Image       : {os.path.basename(query_path)}")
    print(f"Processing Time   : {result.processing_time:.2f} seconds")

    if result.quality_report:
        result.quality_report.print_summary()

    if result.status == VerificationStatus.ROI_DETECTION_FAILED:
        print(f"\n{'='*50}")
        print("ROI DETECTION FAILED")
        print(f"{'='*50}")
        print(f"Reason: {result.failure_reason}")
        print("Guidance: Please capture another image with better focus, lighting, and minimal reflection.")
        print(f"{'='*50}\n")
        sys.exit(1)

    if result.status == VerificationStatus.REGISTRY_EMPTY:
        print(f"\n{'='*50}")
        print("DATABASE REGISTRY EMPTY")
        print(f"{'='*50}")
        print(f"Reason: {result.failure_reason}")
        print("Please enroll products first using:")
        print("  python register.py --product-id P001 --image path/to/reference.jpg")
        print(f"{'='*50}\n")
        sys.exit(1)

    print("\n" + "-" * 50)
    print("LAYER 2 — PHYSICAL SURFACE AUTHENTICATION:")
    print("-" * 50)
    print(f"  ROI Status      : Detected successfully")
    print(f"  ROI Quality     : {result.roi_quality:.2f} / 1.00")
    print(f"  Best Candidate  : {result.best_candidate_id}")
    print(f"  Similarity      : {result.similarity * 100:.1f}%")
    print(f"  Threshold       : {result.threshold * 100:.1f}%")
    print(f"  Physical Decision: {result.physical_decision}")

    print("\n" + "-" * 50)
    print("LAYER 1 — DIGITAL IDENTITY VERIFICATION (RSA + SHA-256):")
    print("-" * 50)
    print(f"  Digital Decision: {result.digital_decision}")
    if result.digital_manifest_summary:
        m = result.digital_manifest_summary
        print(f"  Product Name    : {m.get('product_name', 'N/A')}")
        print(f"  Manufacturer ID : {m.get('manufacturer_id', 'N/A')}")
        print(f"  Batch Number    : {m.get('batch_number', 'N/A')}")
        print(f"  Manifest Hash   : {m.get('manifest_hash', 'N/A')}")
        print(f"  RSA Signature   : {'VALID & VERIFIED' if m.get('rsa_signature_present') else 'MISSING'}")

    print("\n" + "=" * 50)
    print("FINAL DUAL-LAYER AUTHENTICATION RESULT:")
    print("=" * 50)
    if result.final_decision == "AUTHENTIC":
        print(f"  DECISION        : [PASS] AUTHENTIC")
        print(f"  VERIFIED PRODUCT: {result.matched_product_id} ({result.similarity * 100:.1f}% Match)")
        print(f"  CONFIDENCE      : {result.confidence.value}")
    else:
        print(f"  DECISION        : [FAIL] {result.final_decision}")
        print(f"  BEST MATCH      : {result.best_candidate_id} ({result.similarity * 100:.1f}% Match)")
        print(f"  REASON          : {result.failure_reason}")
    print(f"{'='*50}\n")

    # ── Layer 2: Counterfeit Intelligence Pipeline ────────────────────
    if not getattr(args, 'no_layer2', False):
        try:
            from layer2.pipeline import run_layer2
            run_layer2(
                verification_result=result,
                config=config,
                project_root=project_root,
                interactive=(not args.json and not getattr(args, 'layer2_json', False)),
                output_json=getattr(args, 'layer2_json', False),
            )
        except ImportError:
            logger.debug("Layer 2 module not available; skipping counterfeit intelligence.")
        except Exception as e:
            logger.warning(f"Layer 2 pipeline error (non-fatal): {e}")


if __name__ == "__main__":
    main()
