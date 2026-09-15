import os
import base64
import numpy as np
import cv2
import uuid
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional, Dict

from db.models import Product, Manifest, Incident, Artisan
from api.dependencies import get_db_session, get_cv_engine, get_ml_model
from ml.crypto_utils import hash_manifest, load_private_key, sign_manifest, load_public_key, verify_manifest_signature

router = APIRouter()

# --- Schemas ---

class RegisterRequest(BaseModel):
    product_id: str
    name: str = "Unknown"
    artisan_id: str = "KALAKRITI_AUTH_MFG"
    category: str = "handicraft"
    batch: str = "BATCH_2026_01"
    location: str = "India"
    image_base64: str = Field(..., description="Base64 encoded reference image")

class VerifyRequest(BaseModel):
    image_base64: str
    product_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# --- Helpers ---

def decode_image_base64(b64_str: str) -> np.ndarray:
    if "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]
    img_bytes = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image bytes")
    return img

# --- Endpoints ---

@router.post("/ml/register")
def register_product(
    req: RegisterRequest, 
    db: Session = Depends(get_db_session),
    cv_engine = Depends(get_cv_engine)
):
    """Layer 1: Product Registration & Cryptographic Manifest Generation"""
    
    # 1. Check existing
    existing = db.query(Product).filter(Product.product_id == req.product_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Product ID already registered.")
        
    # 2. Extract Features using CV Engine (Layer 2)
    try:
        img = decode_image_base64(req.image_base64)
        features = cv_engine.extract_features(img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")
        
    # Save descriptors somewhere in real implementation. We'll simulate by keeping in DB as JSON for this prototype
    feature_summary = {k: v for k, v in features.items() if k not in ["keypoints", "descriptors"]}
    # In a real app we'd save the descriptors array to disk and store the path
    
    # 3. Save Product
    # Ensure artisan exists
    artisan = db.query(Artisan).filter(Artisan.id == req.artisan_id).first()
    if not artisan:
        artisan = Artisan(id=req.artisan_id, name="Default Artisan", location=req.location)
        db.add(artisan)
        
    product = Product(
        product_id=req.product_id,
        name=req.name,
        artisan_id=req.artisan_id,
        category=req.category,
        batch=req.batch,
        location=req.location,
        roi_metadata=feature_summary
    )
    db.add(product)
    
    # 4. Generate Cryptographic Manifest (Layer 1)
    manifest_data = {
        "product_id": req.product_id,
        "name": req.name,
        "artisan_id": req.artisan_id,
        "timestamp": datetime.utcnow().isoformat(),
        "features": feature_summary
    }
    
    m_hash = hash_manifest(manifest_data)
    
    # Load private key and sign
    try:
        priv_key = load_private_key("keys/private_key.pem")
        signature = sign_manifest(manifest_data, priv_key)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Cryptography error: {str(e)}")
        
    manifest = Manifest(
        product_id=req.product_id,
        manifest_hash=m_hash,
        rsa_signature=signature,
        manifest_data=manifest_data
    )
    db.add(manifest)
    
    db.commit()
    
    return {
        "success": True,
        "product_id": req.product_id,
        "manifest_hash": m_hash,
        "rsa_signature": signature,
        "path_used": feature_summary.get("path_used")
    }


@router.post("/ml/verify")
def verify_product(
    req: VerifyRequest,
    db: Session = Depends(get_db_session),
    cv_engine = Depends(get_cv_engine),
    model = Depends(get_ml_model)
):
    """Layer 2: Adaptive Physical Authentication & Trigger Layer 3"""
    
    if not req.product_id:
        # 1:N not implemented in this prototype outline, simulate requiring Product ID
        raise HTTPException(status_code=400, detail="Product ID is required for 1:1 verification in this outline.")
        
    product = db.query(Product).filter(Product.product_id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    # 1. Feature Extraction
    try:
        img = decode_image_base64(req.image_base64)
        query_features = cv_engine.extract_features(img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")
        
    # 2. Match Features
    # In a full implementation, reference_features would be loaded from disk/DB.
    # We mock it here using the metadata we saved for PATH_B
    ref_features = product.roi_metadata
    
    # For PATH_A, matching requires the actual descriptors which we didn't save in the SQLite DB
    # We'll simulate the match result if path is PATH_A based on num_keypoints for prototype
    match_result = {"match": False, "score": 0.0, "reason": "No descriptor data loaded"}
    
    if query_features.get("path_used") == "PATH_B" and ref_features.get("path_used") == "PATH_B":
        match_result = cv_engine.match_features(query_features, ref_features)
    elif query_features.get("path_used") == "PATH_A":
        # Simulate successful match for Path A if keypoints > threshold
        if query_features["num_keypoints"] > 150:
            match_result = {"match": True, "score": 0.95, "inliers": 30}
        else:
            match_result = {"match": False, "score": 0.2, "inliers": 2}
            
    # 3. Cryptographic Verification
    manifest = product.manifest
    try:
        pub_key = load_public_key("keys/public_key.pem")
        is_valid, msg = verify_manifest_signature(manifest.manifest_data, manifest.rsa_signature, pub_key)
    except Exception as e:
        is_valid, msg = False, str(e)
        
    final_decision = "AUTHENTIC" if (match_result["match"] and is_valid) else "COUNTERFEIT"
    
    # 4. Record Incident in DB
    incident_id = f"CF-{datetime.utcnow().year}-{str(uuid.uuid4())[:8]}"
    incident = Incident(
        incident_id=incident_id,
        product_id=req.product_id,
        authentication_status=final_decision,
        authentication_score=match_result.get("score", 0.0),
        final_decision=final_decision,
        physical_decision="PASS" if match_result["match"] else "FAIL",
        digital_decision="PASS" if is_valid else "FAIL",
        confidence="HIGH",
        latitude=req.latitude,
        longitude=req.longitude,
        location_source="USER_GPS" if req.latitude else "UNKNOWN"
    )
    db.add(incident)
    db.commit()
    
    # 5. Trigger Layer 3 Asynchronous Intelligence if Counterfeit
    if final_decision == "COUNTERFEIT":
        # Use Celery to dispatch the task
        from services.intelligence_worker import analyze_incident_task
        analyze_incident_task.delay(incident_id)
        
    return {
        "success": True,
        "decision": final_decision,
        "physical_match": match_result,
        "digital_valid": is_valid,
        "incident_id": incident_id
    }
