"""
Unit tests for Product Registry database, enrollment, digital signing, and duplicate rejection.
"""

import os
import pytest
import cv2

from src.registry import ProductRegistry, ProductRecord


def test_enroll_and_retrieve_product(temp_registry, synthetic_textured_image, temp_dir):
    """Test full product registration, digital manifest generation, RSA signing, and retrieval."""
    img_path = os.path.join(temp_dir, "ref_01.jpg")
    cv2.imwrite(img_path, synthetic_textured_image)

    record, roi = temp_registry.enroll_from_images(
        product_id="P_REG_01",
        image_paths=[img_path],
        product_name="Silk Scarf",
        manufacturer_id="MFG_INDIA_01",
        category="textile",
    )

    assert isinstance(record, ProductRecord)
    assert record.product_id == "P_REG_01"
    assert record.product_name == "Silk Scarf"
    assert record.manifest_hash != ""
    assert record.rsa_signature != ""
    assert temp_registry.has_product("P_REG_01") is True

    # Retrieve from registry
    retrieved = temp_registry.get_product("P_REG_01")
    assert retrieved is not None
    assert retrieved.product_id == "P_REG_01"
    assert retrieved.fingerprint.num_keypoints == record.fingerprint.num_keypoints

    # Validate Layer 1 Digital Identity
    is_valid, msg = temp_registry.validate_product("P_REG_01")
    assert is_valid is True
    assert "VALID" in msg


def test_duplicate_product_rejection(temp_registry, synthetic_textured_image, temp_dir):
    """Test that attempting to register an existing product ID raises ValueError unless force is True."""
    img_path = os.path.join(temp_dir, "ref_dup.jpg")
    cv2.imwrite(img_path, synthetic_textured_image)

    temp_registry.enroll_from_images("P_DUP_01", [img_path])

    # Re-register without force should fail
    with pytest.raises(ValueError) as exc:
        temp_registry.enroll_from_images("P_DUP_01", [img_path], force=False)
    assert "already registered" in str(exc.value)

    # Re-register with force should succeed
    record, _ = temp_registry.enroll_from_images("P_DUP_01", [img_path], force=True)
    assert record.product_id == "P_DUP_01"


def test_delete_product(temp_registry, synthetic_textured_image, temp_dir):
    """Test deleting a product removes it from index and disk."""
    img_path = os.path.join(temp_dir, "ref_del.jpg")
    cv2.imwrite(img_path, synthetic_textured_image)

    temp_registry.enroll_from_images("P_DEL_01", [img_path])
    assert temp_registry.has_product("P_DEL_01") is True

    deleted = temp_registry.delete_product("P_DEL_01")
    assert deleted is True
    assert temp_registry.has_product("P_DEL_01") is False
    assert temp_registry.get_product("P_DEL_01") is None
