"""
Kalakriti — Cryptographic Subsystem.

Provides SHA-256 canonical manifest hashing, RSA key management,
digital signing, and public key signature verification for Layer 1
Digital Identity authentication.
"""

from src.cryptography.hashing import hash_manifest, canonicalize_manifest
from src.cryptography.signing import (
    generate_rsa_keypair,
    sign_manifest,
    load_private_key,
    load_public_key,
    save_keypair,
)
from src.cryptography.verification import verify_manifest_signature

__all__ = [
    "hash_manifest",
    "canonicalize_manifest",
    "generate_rsa_keypair",
    "sign_manifest",
    "load_private_key",
    "load_public_key",
    "save_keypair",
    "verify_manifest_signature",
]
