import os
import json
import hashlib
import logging
from typing import Dict, Any, Union, Tuple, Optional
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature

logger = logging.getLogger(__name__)

DEFAULT_KEY_SIZE = 2048
DEFAULT_PUBLIC_EXPONENT = 65537

# --- Hashing ---

def _serialize_fallback(obj: Any) -> Any:
    if hasattr(obj, "to_dict"):
        return obj.to_dict()
    if hasattr(obj, "tolist"):
        return obj.tolist()
    return str(obj)

def canonicalize_manifest(manifest: Dict[str, Any]) -> bytes:
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
    if isinstance(manifest, dict):
        canonical_bytes = canonicalize_manifest(manifest)
    elif isinstance(manifest, bytes):
        canonical_bytes = manifest
    elif isinstance(manifest, str):
        canonical_bytes = manifest.encode("utf-8")
    else:
        raise TypeError("Manifest must be dict, bytes, or string.")
    return hashlib.sha256(canonical_bytes).hexdigest()

# --- Key Management ---

def generate_rsa_keypair(key_size: int = DEFAULT_KEY_SIZE) -> Tuple[rsa.RSAPrivateKey, rsa.RSAPublicKey]:
    logger.info(f"Generating new {key_size}-bit RSA keypair...")
    private_key = rsa.generate_private_key(
        public_exponent=DEFAULT_PUBLIC_EXPONENT,
        key_size=key_size,
        backend=default_backend(),
    )
    return private_key, private_key.public_key()

def save_keypair(
    private_key: rsa.RSAPrivateKey,
    public_key: rsa.RSAPublicKey,
    keys_dir: str = "keys",
    private_filename: str = "private_key.pem",
    public_filename: str = "public_key.pem",
) -> Tuple[str, str]:
    os.makedirs(keys_dir, exist_ok=True)
    priv_path = os.path.join(keys_dir, private_filename)
    pub_path = os.path.join(keys_dir, public_filename)
    
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    with open(priv_path, "wb") as f:
        f.write(priv_pem)
        
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    with open(pub_path, "wb") as f:
        f.write(pub_pem)
        
    return priv_path, pub_path

def load_private_key(key_path_or_bytes: Union[str, bytes], password: Optional[bytes] = None) -> rsa.RSAPrivateKey:
    if isinstance(key_path_or_bytes, str):
        with open(key_path_or_bytes, "rb") as f:
            data = f.read()
    else:
        data = key_path_or_bytes
    return serialization.load_pem_private_key(data, password=password, backend=default_backend())

def load_public_key(key_path_or_bytes: Union[str, bytes]) -> rsa.RSAPublicKey:
    if isinstance(key_path_or_bytes, str):
        with open(key_path_or_bytes, "rb") as f:
            data = f.read()
    else:
        data = key_path_or_bytes
    return serialization.load_pem_public_key(data, backend=default_backend())

# --- Signing and Verification ---

def sign_manifest(manifest: Union[Dict[str, Any], bytes], private_key: rsa.RSAPrivateKey) -> str:
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

def verify_manifest_signature(
    manifest: Union[Dict[str, Any], bytes],
    signature_hex: str,
    public_key: rsa.RSAPublicKey,
) -> Tuple[bool, str]:
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
        return True, "Digital signature is VALID and verified by authority."
    except InvalidSignature:
        return False, "Digital signature verification FAILED: manifest or signature has been tampered with."
    except Exception as e:
        return False, f"Signature verification error: {str(e)}"
