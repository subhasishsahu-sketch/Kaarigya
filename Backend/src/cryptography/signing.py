"""
Kalakriti — RSA Key Management & Digital Signing Module.

Provides RSA key generation, PEM loading/saving, and cryptographic signing
of canonical product manifests using SHA-256 and PKCS#1 v1.5 / PSS padding.
"""

import os
import logging
from typing import Tuple, Optional, Union, Dict, Any
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

from src.cryptography.hashing import canonicalize_manifest

logger = logging.getLogger(__name__)

DEFAULT_KEY_SIZE = 2048
DEFAULT_PUBLIC_EXPONENT = 65537


def generate_rsa_keypair(key_size: int = DEFAULT_KEY_SIZE) -> Tuple[rsa.RSAPrivateKey, rsa.RSAPublicKey]:
    """
    Generate an RSA private/public keypair.

    Args:
        key_size: Bit length of key (default: 2048).

    Returns:
        Tuple of (RSAPrivateKey, RSAPublicKey).
    """
    logger.info(f"Generating new {key_size}-bit RSA keypair...")
    private_key = rsa.generate_private_key(
        public_exponent=DEFAULT_PUBLIC_EXPONENT,
        key_size=key_size,
        backend=default_backend(),
    )
    public_key = private_key.public_key()
    return private_key, public_key


def save_keypair(
    private_key: rsa.RSAPrivateKey,
    public_key: rsa.RSAPublicKey,
    keys_dir: str = "keys",
    private_filename: str = "private_key.pem",
    public_filename: str = "public_key.pem",
) -> Tuple[str, str]:
    """
    Save RSA keypair to PEM files in a specified directory.

    Args:
        private_key: RSAPrivateKey object.
        public_key: RSAPublicKey object.
        keys_dir: Directory to save keys.
        private_filename: Filename for private key.
        public_filename: Filename for public key.

    Returns:
        Tuple of (private_key_path, public_key_path).
    """
    os.makedirs(keys_dir, exist_ok=True)
    priv_path = os.path.join(keys_dir, private_filename)
    pub_path = os.path.join(keys_dir, public_filename)

    # Serialize private key without encryption for local signing service
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    with open(priv_path, "wb") as f:
        f.write(priv_pem)

    # Serialize public key
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    with open(pub_path, "wb") as f:
        f.write(pub_pem)

    logger.info(f"Saved RSA public key to: {pub_path}")
    logger.info(f"Saved RSA private key to: {priv_path}")
    return priv_path, pub_path


def load_private_key(key_path_or_bytes: Union[str, bytes], password: Optional[bytes] = None) -> rsa.RSAPrivateKey:
    """
    Load an RSA private key from file path or PEM bytes.

    Args:
        key_path_or_bytes: Path to .pem file or raw PEM bytes.
        password: Optional decryption password.

    Returns:
        RSAPrivateKey object.
    """
    if isinstance(key_path_or_bytes, str):
        if not os.path.exists(key_path_or_bytes):
            raise FileNotFoundError(f"Private key file not found: {key_path_or_bytes}")
        with open(key_path_or_bytes, "rb") as f:
            data = f.read()
    else:
        data = key_path_or_bytes

    return serialization.load_pem_private_key(
        data,
        password=password,
        backend=default_backend(),
    )


def load_public_key(key_path_or_bytes: Union[str, bytes]) -> rsa.RSAPublicKey:
    """
    Load an RSA public key from file path or PEM bytes.

    Args:
        key_path_or_bytes: Path to .pem file or raw PEM bytes.

    Returns:
        RSAPublicKey object.
    """
    if isinstance(key_path_or_bytes, str):
        if not os.path.exists(key_path_or_bytes):
            raise FileNotFoundError(f"Public key file not found: {key_path_or_bytes}")
        with open(key_path_or_bytes, "rb") as f:
            data = f.read()
    else:
        data = key_path_or_bytes

    return serialization.load_pem_public_key(
        data,
        backend=default_backend(),
    )


def sign_manifest(
    manifest: Union[Dict[str, Any], bytes],
    private_key: rsa.RSAPrivateKey,
) -> str:
    """
    Cryptographically sign a product manifest using RSA-SHA256 (PKCS#1 v1.5).

    Args:
        manifest: Dictionary or canonical bytes to sign.
        private_key: RSAPrivateKey object.

    Returns:
        Hex-encoded signature string.
    """
    if isinstance(manifest, dict):
        canonical_bytes = canonicalize_manifest(manifest)
    elif isinstance(manifest, bytes):
        canonical_bytes = manifest
    else:
        raise TypeError("Manifest must be dict or canonical bytes.")

    signature = private_key.sign(
        canonical_bytes,
        padding.PKCS1v15(),
        hashes.SHA256(),
    )
    return signature.hex()
