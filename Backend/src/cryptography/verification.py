"""
Kalakriti — RSA Digital Signature Verification Module.

Verifies the integrity and authenticity of product manifests using
RSA public key cryptography and SHA-256 digests.
"""

import logging
from typing import Union, Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature

from src.cryptography.hashing import canonicalize_manifest

logger = logging.getLogger(__name__)


def verify_manifest_signature(
    manifest: Union[Dict[str, Any], bytes],
    signature_hex: str,
    public_key: rsa.RSAPublicKey,
) -> Tuple[bool, str]:
    """
    Verify an RSA-SHA256 digital signature over a product manifest.

    Args:
        manifest: Product manifest dictionary or canonical bytes.
        signature_hex: Hex-encoded signature string.
        public_key: RSAPublicKey object.

    Returns:
        Tuple of (is_valid: bool, message: str).
    """
    if isinstance(manifest, dict):
        canonical_bytes = canonicalize_manifest(manifest)
    elif isinstance(manifest, bytes):
        canonical_bytes = manifest
    else:
        return False, "Invalid manifest data type (expected dict or bytes)."

    if not signature_hex or not isinstance(signature_hex, str):
        return False, "Missing or invalid signature string."

    try:
        signature_bytes = bytes.fromhex(signature_hex.strip())
    except ValueError:
        return False, "Signature string is not valid hex."

    try:
        public_key.verify(
            signature_bytes,
            canonical_bytes,
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        logger.debug("RSA digital signature successfully verified.")
        return True, "Digital signature is VALID and verified by authority."
    except InvalidSignature:
        logger.warning("RSA digital signature verification FAILED (Invalid signature).")
        return False, "Digital signature verification FAILED: manifest or signature has been tampered with."
    except Exception as e:
        logger.error(f"Error during signature verification: {e}")
        return False, f"Signature verification error: {str(e)}"
