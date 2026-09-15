"""
Kalakriti — Python ML Authentication & Counterfeit Intelligence FastAPI Service.

Exposes REST API endpoints for:
1. Health & Registry status
2. Product Physical Fingerprint Registration & RSA Cryptographic Enrollment (Layer 1)
3. 1:N & 1:1 Physical Product Verification & Decision Engine (Layer 1)
4. Counterfeit Incident, Hotspot, Trend, Risk & Alert Intelligence (Layer 2)
"""

import os
import sys
import io
import json
import base64
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

import cv2
import numpy as np
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.utils import (
    load_config,
    setup_directories,
    VerificationStatus,
    ConfidenceLevel,
)
from src.image_loader import load_image, inspect_image
from src.image_quality import analyze_quality
from src.registry import ProductRegistry
from src.model_training import load_model
from src.verification import verify_query_image_1_to_n, VerificationResult
from layer2.pipeline import run_layer2, _l2_dir
from layer2.incident.incident_manager import IncidentManager
from layer2.alerts.alert_engine import AlertEngine

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("KalakritiMLAPI")

# Initialize configuration and directories
config = load_config(os.path.join(PROJECT_ROOT, "config", "config.yaml") if os.path.exists(os.path.join(PROJECT_ROOT, "config", "config.yaml")) else None)
abs_paths = setup_directories(config, PROJECT_ROOT)
storage_dir = abs_paths.get("fingerprints", os.path.join(PROJECT_ROOT, "data", "fingerprints"))
keys_dir = os.path.join(PROJECT_ROOT, "keys")
models_dir = os.path.join(PROJECT_ROOT, "models")
l2_dir = _l2_dir(config, PROJECT_ROOT)

# Initialize registry and load ML model
registry = ProductRegistry(storage_dir=storage_dir, keys_dir=keys_dir, config=config)

model, scaler, feature_names = None, None, []
if os.path.exists(models_dir):
    try:
        model, scaler, feature_names, _ = load_model(models_dir)
        logger.info(f"Successfully loaded ML model with {len(feature_names)} features.")
    except Exception as e:
        logger.warning(f"Could not load trained model from {models_dir}: {e}. Multi-feature fallback enabled.")

app = FastAPI(
    title="Kalakriti ML Physical Authentication & Layer 2 Intelligence Service",
    description="Microservice providing computer vision fingerprinting, ML authenticity classification, RSA cryptographic identity, and counterfeit intelligence.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Request / Response Schemas
# =============================================================================

class RegisterRequest(BaseModel):
    product_id: str = Field(..., description="Unique product ID (e.g. CRAFT-OD-2026-00124)")
    name: str = Field("", description="Product name")
    manufacturer: str = Field("KALAKRITI_AUTH_MFG", description="Manufacturer identifier")
    category: str = Field("handicraft", description="Craft category")
    batch: str = Field("BATCH_2026_01", description="Batch number")
    location: str = Field("India", description="Creation location")
    image_base64: Optional[str] = Field(None, description="Base64 encoded reference image (data URI or raw base64)")
    image_url: Optional[str] = Field(None, description="Local or remote path to image")
    force: bool = Field(False, description="Overwrite if product already enrolled")


class VerifyRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Query photograph as base64")
    image_url: Optional[str] = Field(None, description="Path to query photograph")
    query_name: Optional[str] = Field("query_photo", description="Label for query image")
    product_id: Optional[str] = Field(None, description="Target product ID for 1:1 match or leave None for 1:N discovery")
    threshold: Optional[float] = Field(None, description="Custom similarity threshold override (0.0 to 1.0)")
    latitude: Optional[float] = Field(None, description="GPS latitude where query was captured")
    longitude: Optional[float] = Field(None, description="GPS longitude where query was captured")
    city: Optional[str] = Field("", description="City location")
    state: Optional[str] = Field("", description="State location")
    country: Optional[str] = Field("India", description="Country location")
    trigger_layer2: bool = Field(True, description="Execute Layer 2 pipeline if counterfeit/suspicious")


# Helper function to decode base64 images
def decode_image_base64(b64_str: str) -> np.ndarray:
    if "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]
    img_bytes = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image bytes into valid OpenCV matrix")
    return img


# =============================================================================
# Endpoints
# =============================================================================

@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kalakriti ML Engine API</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAF8F5; color: #202522; padding: 40px; }
            .card { max-width: 650px; margin: 40px auto; background: white; border: 1px solid #DCD7CF; border-radius: 20px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            h1 { color: #5D634C; font-family: Georgia, serif; margin-top: 0; }
            h3 { color: #202522; margin-top: 24px; border-bottom: 1px solid #E8E4DD; padding-bottom: 8px; }
            ul { padding-left: 20px; line-height: 1.8; }
            code { background: #FAF8F5; padding: 2px 6px; border-radius: 4px; border: 1px solid #E8E4DD; color: #B85C45; font-size: 13px; font-family: monospace; }
            a { color: #5D634C; font-weight: 600; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .btn { display: inline-block; padding: 10px 20px; background: #5D634C; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; font-size: 13px; transition: background 0.2s; }
            .btn:hover { background: #4A4F3C; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Kalakriti ML Service Engine</h1>
            <p>Welcome to the Python computer vision authentication & counterfeit intelligence microservice. It is running on port <code>8000</code>.</p>
            <h3>Available Endpoints:</h3>
            <ul>
                <li><code>GET /</code> - Welcome index page.</li>
                <li><code>GET <a href="/docs">/docs</a></code> - Interactive Swagger API documentation.</li>
                <li><code>GET <a href="/redoc">/redoc</a></code> - ReDoc API documentation.</li>
                <li><code>GET <a href="/ml/health">/ml/health</a></code> - Service health & statistics.</li>
                <li><code>POST /ml/register</code> - Register product fingerprints & generate RSA manifests.</li>
                <li><code>POST /ml/verify</code> - Authenticate physical query photographs.</li>
                <li><code>GET /ml/intelligence/dashboard</code> - Counterfeit incidents aggregated analytics.</li>
            </ul>
            <a href="http://127.0.0.1:3001" class="btn">Go to Frontend Portal (Port 3001)</a>
        </div>
    </body>
    </html>
    """




@app.get("/ml/health")
def health_check():
    products = registry.list_products()
    product_ids = [p.product_id for p in products]
    return {
        "status": "healthy",
        "service": "Kalakriti ML Physical Authentication Engine",
        "version": "1.0.0",
        "model_loaded": model is not None,
        "registered_products_count": len(product_ids),
        "registered_products": product_ids[:10],
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/ml/register")
def register_product(req: RegisterRequest):
    """
    Enroll a new physical product:
    - Preprocesses reference photograph & detects optimal texture ROI
    - Extracts ORB/AKAZE keypoints, LBP texture, GLCM texture
    - Creates SHA-256 manifest and signs with RSA-2048 authority key
    - Saves in persistent fingerprint registry
    """
    temp_path = None
    try:
        product_id = req.product_id.strip()
        if not product_id:
            raise HTTPException(status_code=400, detail="Product ID cannot be empty.")

        if registry.check_duplicate_product_id(product_id) and not req.force:
            raise HTTPException(
                status_code=409,
                detail=f"Product ID '{product_id}' is already enrolled in the registry. Use force=True to overwrite.",
            )

        # Obtain image file path
        if req.image_base64:
            img = decode_image_base64(req.image_base64)
            temp_dir = os.path.join(PROJECT_ROOT, "data", "raw", "temp")
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, f"{product_id}_{int(datetime.now().timestamp())}.jpg")
            cv2.imwrite(temp_path, img)
            image_paths = [temp_path]
        elif req.image_url and os.path.exists(req.image_url):
            image_paths = [req.image_url]
        else:
            raise HTTPException(status_code=400, detail="Must provide valid image_base64 or existing image_url.")

        record, roi = registry.enroll_from_images(
            product_id=product_id,
            image_paths=image_paths,
            product_name=req.name or product_id,
            manufacturer_id=req.manufacturer,
            category=req.category,
            batch_number=req.batch,
            manufacturing_location=req.location,
            config=config,
            force=req.force,
        )

        # Encode extracted physical texture ROI as base64 for authentic physical label rendering
        roi_base64 = None
        if roi is not None and getattr(roi, 'roi_image', None) is not None:
            try:
                _, buffer = cv2.imencode('.jpg', roi.roi_image, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
                roi_base64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
            except Exception as e:
                logger.warning(f"Could not encode ROI image to base64: {e}")

        return {
            "success": True,
            "product_id": record.product_id,
            "product_name": record.product_name,
            "manifest_hash": record.manifest_hash,
            "rsa_signature": record.rsa_signature,
            "roi_image_base64": roi_base64,
            "fingerprint_summary": {
                "num_keypoints": record.fingerprint.num_keypoints if record.fingerprint else 0,
                "feature_method": record.fingerprint.feature_method if record.fingerprint else "ORB",
                "roi_position": list(record.fingerprint.roi_position) if record.fingerprint else [0, 0],
                "roi_size": list(record.fingerprint.roi_size) if record.fingerprint else [0, 0],
                "roi_quality": float(record.fingerprint.roi_quality) if record.fingerprint else 0.0,
            },
            "timestamp": record.registration_timestamp or datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error registering product {req.product_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.post("/ml/verify")
def verify_product(req: VerifyRequest):
    """
    Authenticate physical query photograph:
    - Pre-flight quality & optimal texture ROI detection
    - Feature extraction (Keypoints + LBP + GLCM)
    - 1:N candidate search across all enrolled products or targeted 1:1 check
    - Multi-level matching: descriptor matching, RANSAC homography, LBP & GLCM texture similarity
    - Random Forest genuine probability prediction
    - Cryptographic RSA Layer 1 manifest signature validation
    - Final decision (AUTHENTIC, COUNTERFEIT / SUSPICIOUS / UNKNOWN)
    - Automatically executes Layer 2 Counterfeit Intelligence if suspicious/counterfeit
    """
    try:
        # Load query image
        query_img = None
        if req.image_base64:
            query_img = decode_image_base64(req.image_base64)
        elif req.image_url and os.path.exists(req.image_url):
            query_img = load_image(req.image_url)
        else:
            raise HTTPException(status_code=400, detail="Must provide valid image_base64 or existing image_url.")

        if query_img is None:
            raise HTTPException(status_code=400, detail="Failed to load or parse query verification image.")

        query_name = req.query_name or f"query_{int(datetime.now().timestamp())}"

        # Run 1:N verification
        threshold_file_path = os.path.join(PROJECT_ROOT, "artifacts", "thresholds", "threshold.json")
        result: VerificationResult = verify_query_image_1_to_n(
            query_image=query_img,
            query_name=query_name,
            registry=registry,
            model=model,
            scaler=scaler,
            feature_names=feature_names,
            config=config,
            threshold_override=req.threshold,
            threshold_file_path=threshold_file_path if os.path.exists(threshold_file_path) else None,
        )

        res_dict = result.to_dict()

        # If a specific product_id was requested for 1:1 verification, verify against that candidate
        best_candidate = next(
            (c for c in result.candidate_rankings if c.product_id == req.product_id),
            result.candidate_rankings[0] if result.candidate_rankings else None
        )

        # Layer 2 Counterfeit Intelligence Pipeline
        layer2_report = None
        if req.trigger_layer2 and result.status in (VerificationStatus.NOT_VERIFIED, VerificationStatus.SUSPICIOUS, VerificationStatus.UNCERTAIN):
            try:
                layer2_report = run_layer2(
                    verification_result=result,
                    config=config,
                    project_root=PROJECT_ROOT,
                    interactive=False,
                    output_json=True,
                    latitude=req.latitude,
                    longitude=req.longitude,
                    city=req.city or "",
                    state=req.state or "",
                    country=req.country or "India",
                    use_ip_fallback=False,
                )
            except Exception as e:
                logger.warning(f"Layer 2 execution warning: {e}")

        response_payload = {
            "success": True,
            "verification": res_dict,
            "best_candidate": {
                "product_id": best_candidate.product_id if best_candidate else "NONE",
                "similarity_score": best_candidate.similarity_score if best_candidate else 0.0,
                "ransac_inliers": best_candidate.ransac_inliers if best_candidate else 0,
                "lbp_similarity": best_candidate.lbp_similarity if best_candidate else 0.0,
                "glcm_similarity": best_candidate.glcm_similarity if best_candidate else 0.0,
            } if best_candidate else None,
            "layer2_intelligence": layer2_report,
        }

        return response_payload

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error during verification: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


# =============================================================================
# Layer 2 Intelligence Endpoints
# =============================================================================

@app.get("/ml/intelligence/dashboard")
def get_intelligence_dashboard():
    """Returns aggregated Layer 2 counterfeit intelligence dashboard data."""
    try:
        inc_manager = IncidentManager(storage_dir=l2_dir)
        incidents = inc_manager.list_incidents()

        intelligence_dir = os.path.join(l2_dir, "intelligence")
        alerts_dir = os.path.join(l2_dir, "alerts")

        def _load_json(path):
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        return json.load(f)
                except Exception:
                    pass
            return {}

        trends = _load_json(os.path.join(intelligence_dir, "trends.json"))
        geo_data = _load_json(os.path.join(intelligence_dir, "geo_clusters.json"))
        patterns = _load_json(os.path.join(intelligence_dir, "visual_clusters.json"))
        risk_data = _load_json(os.path.join(intelligence_dir, "risk_scores.json"))

        ae = AlertEngine(storage_path=os.path.join(alerts_dir, "alerts.json"), config=config)
        active_alerts = ae.load_active()

        return {
            "success": True,
            "summary": {
                "total_incidents": len(incidents),
                "active_alerts": len(active_alerts),
                "total_clusters": len(geo_data.get("clusters", [])) if isinstance(geo_data, dict) else 0,
                "total_patterns": len(patterns.get("patterns", [])) if isinstance(patterns, dict) else 0,
            },
            "incidents": [i.to_dict() for i in incidents[:50]],
            "geo_clusters": geo_data.get("clusters", []) if isinstance(geo_data, dict) else [],
            "risk_scores": risk_data.get("risk_scores", []) if isinstance(risk_data, dict) else [],
            "trends": trends,
            "active_alerts": [a.to_dict() for a in active_alerts],
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as exc:
        logger.error(f"Error fetching intelligence dashboard: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/ml/intelligence/incidents")
def list_incidents(status: Optional[str] = None):
    """List all recorded counterfeit incidents."""
    try:
        inc_manager = IncidentManager(storage_dir=l2_dir)
        incidents = inc_manager.list_incidents(status_filter=status)
        return {
            "success": True,
            "count": len(incidents),
            "incidents": [i.to_dict() for i in incidents],
        }
    except Exception as exc:
        logger.error(f"Error listing incidents: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/ml/intelligence/incidents/{incident_id}")
def get_incident(incident_id: str):
    """Retrieve details for a specific counterfeit incident."""
    try:
        inc_manager = IncidentManager(storage_dir=l2_dir)
        incident = inc_manager.get_incident(incident_id)
        if not incident:
            raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")
        return {
            "success": True,
            "incident": incident.to_dict(),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error fetching incident {incident_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/ml/intelligence/hotspots")
def get_hotspots():
    """Retrieve geographical clusters and risk hotspots."""
    try:
        intelligence_dir = os.path.join(l2_dir, "intelligence")
        geo_path = os.path.join(intelligence_dir, "geo_clusters.json")
        if os.path.exists(geo_path):
            with open(geo_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {"success": True, "hotspots": data.get("clusters", [])}
        return {"success": True, "hotspots": []}
    except Exception as exc:
        logger.error(f"Error fetching hotspots: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


# Entrypoint for running with python ml_api.py
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("ML_PORT", 8000))
    print(f"Starting Kalakriti ML API on http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
