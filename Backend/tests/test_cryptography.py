"""
Unit tests for Kalakriti Cryptography subsystem (SHA-256 + RSA-2048).
"""

import os
import pytest

from src.cryptography import (
    canonicalize_manifest,
    hash_manifest,
    generate_rsa_keypair,
    sign_manifest,
    save_keypair,
    load_private_key,
    load_public_key,
    verify_manifest_signature,
)


def test_canonicalize_manifest_determinism():
    """Test that dictionary key ordering does not alter the canonical byte output."""
    dict_a = {"product_id": "P001", "batch": "B1", "count": 10}
    dict_b = {"count": 10, "product_id": "P001", "batch": "B1"}

    bytes_a = canonicalize_manifest(dict_a)
    bytes_b = canonicalize_manifest(dict_b)

    assert bytes_a == bytes_b
    assert hash_manifest(dict_a) == hash_manifest(dict_b)
    assert len(hash_manifest(dict_a)) == 64


def test_rsa_keypair_generation_and_persistence(temp_dir):
    """Test generating, saving, and reloading RSA keypairs."""
    priv_k, pub_k = generate_rsa_keypair(key_size=2048)
    priv_path, pub_path = save_keypair(priv_k, pub_k, keys_dir=temp_dir)

    assert os.path.exists(priv_path)
    assert os.path.exists(pub_path)

    loaded_priv = load_private_key(priv_path)
    loaded_pub = load_public_key(pub_path)

    assert loaded_priv.key_size == 2048
    assert loaded_pub.key_size == 2048


def test_sign_and_verify_manifest(temp_dir):
    """Test valid digital signature signing and verification."""
    priv_k, pub_k = generate_rsa_keypair()
    manifest = {
        "product_id": "P001",
        "name": "Pashmina Shawl",
        "manufacturer": "Kashmir Crafts",
        "quality_score": 0.88,
    }

    sig_hex = sign_manifest(manifest, priv_k)
    assert isinstance(sig_hex, str)
    assert len(sig_hex) > 0

    is_valid, msg = verify_manifest_signature(manifest, sig_hex, pub_k)
    assert is_valid is True
    assert "VALID" in msg


def test_verify_tampered_manifest_fails():
    """Test that tampering with any field in the manifest causes signature verification failure."""
    priv_k, pub_k = generate_rsa_keypair()
    manifest = {"product_id": "P001", "batch": "B1"}
    sig_hex = sign_manifest(manifest, priv_k)

    # Tamper with manifest
    tampered = {"product_id": "P001", "batch": "B2"}
    is_valid, msg = verify_manifest_signature(tampered, sig_hex, pub_k)

    assert is_valid is False
    assert "FAILED" in msg


def test_verify_invalid_signature_hex():
    """Test that malformed signature strings are rejected safely."""
    _, pub_k = generate_rsa_keypair()
    manifest = {"product_id": "P001"}

    is_valid, msg = verify_manifest_signature(manifest, "not-a-valid-hex-string", pub_k)
    assert is_valid is False

    is_valid, msg = verify_manifest_signature(manifest, "", pub_k)
    assert is_valid is False
