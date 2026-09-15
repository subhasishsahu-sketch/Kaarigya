"""
Kalakriti — Canonical Manifest Hashing Module.

Computes deterministic SHA-256 digests over canonical JSON representations
of product manifests to ensure tamper-evident digital identity integrity.
"""

import json
import hashlib
from typing import Dict, Any, Union


def canonicalize_manifest(manifest: Dict[str, Any]) -> bytes:
    """
    Produce a deterministic canonical UTF-8 byte string from a dictionary.

    Keys are sorted recursively and compact separators (',', ':') are used
    without extra whitespace to guarantee byte-for-byte reproducibility across
    different platforms and runs.

    Args:
        manifest: Product manifest dictionary.

    Returns:
        Canonical JSON encoded as bytes.
    """
    if not isinstance(manifest, dict):
        raise TypeError("Manifest must be a dictionary.")

    return json.dumps(
        manifest,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=True,
        default=_serialize_fallback,
    ).encode("utf-8")


def hash_manifest(manifest: Union[Dict[str, Any], bytes]) -> str:
    """
    Compute SHA-256 hexadecimal hash of a manifest.

    Args:
        manifest: Dictionary or pre-canonicalized bytes.

    Returns:
        64-character lowercase hexadecimal SHA-256 digest string.
    """
    if isinstance(manifest, dict):
        canonical_bytes = canonicalize_manifest(manifest)
    elif isinstance(manifest, bytes):
        canonical_bytes = manifest
    elif isinstance(manifest, str):
        canonical_bytes = manifest.encode("utf-8")
    else:
        raise TypeError("Manifest must be dict, bytes, or string.")

    return hashlib.sha256(canonical_bytes).hexdigest()


def _serialize_fallback(obj: Any) -> Any:
    """Helper serializer for standard types."""
    if hasattr(obj, "to_dict"):
        return obj.to_dict()
    if hasattr(obj, "tolist"):
        return obj.tolist()
    return str(obj)
