# Kalakriti — S8 Traditional Craft Digital Passport & Trust Platform

> **Smart India Hackathon 2026 — PS-S8**  
> AI-powered authentication, counterfeit detection, and GI-compliant provenance tracking for Indian traditional crafts.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React SPA (Vite)                    │
│   Artisan Portal · Buyer Scanner · Cooperative Hub      │
│   Admin Dashboard · Counterfeit Intelligence Map        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────────────┐
│             Node.js / Express Backend (port 3001)       │
│  Auth · Products · Passports · Verification             │
│  Counterfeit · Compensation · Disputes · Provenance     │
└──────┬──────────────────────────────────────────────────┘
       │ HTTP (internal, port 8000)
┌──────▼────────────────────────────────────────────────┐
│        Python FastAPI ML Engine (ml_api.py)           │
│                                                       │
│  Layer 1 – Physical Fingerprint Authentication        │
│    • ROI detection (multi-scale adaptive)             │
│    • ORB + AKAZE keypoint extraction                  │
│    • LBP texture analysis (128-bin histogram)         │
│    • GLCM spectral analysis (4-direction)             │
│    • RANSAC homography verification                   │
│    • RSA-2048 digital manifest signing                │
│    • Random Forest classifier (8 features)            │
│                                                       │
│  Layer 2 – Counterfeit Intelligence Pipeline          │
│    • Geospatial cluster detection                     │
│    • Incident tracking & hotspot mapping              │
│    • Pattern recognition across scan events           │
└───────────────────────────────────────────────────────┘
```

---

## Services

| Service | Port | Command |
|---------|------|---------|
| Node.js Backend + Vite SPA | `3001` | `npm run dev` (in `Frontend/`) |
| Python ML API | `8000` | `python ml_api.py` (in `Backend/`) |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18  
- **Python** ≥ 3.10  
- Python packages: `fastapi uvicorn python-multipart opencv-python numpy scikit-learn pyyaml`

### 1. Install Node dependencies

```bash
cd Frontend
npm install
```

### 2. Install Python dependencies

```bash
cd Backend
pip install fastapi uvicorn python-multipart opencv-python numpy scikit-learn pyyaml joblib cryptography
```

### 3. Start the Python ML API

```bash
cd Backend
python ml_api.py
```

Verify it is running:
```bash
curl http://127.0.0.1:8000/ml/health
```

### 4. Start the Node Backend + Frontend

```bash
cd Frontend
npm run dev
```

The application is now accessible at **http://localhost:3001**

---

## Key Features

### Artisan Portal
- Register products with full GI-tag metadata
- Upload workshop evidence (photos, process videos, material slips)
- Automatic physical fingerprint enrollment in the ML registry
- RSA-2048 digital product manifest generation

### Buyer / Consumer
- QR code & NFC scan for instant passport verification
- **Live camera physical match** — real-time computer vision (Layer 1 ML)
  - RANSAC inlier matching
  - LBP texture similarity  
  - GLCM spectral analysis
  - RSA manifest signature verification
- GPS-geotagged scan provenance

### Cooperative Hub
- Counterfeit Intelligence dashboard (Layer 2)
- Incident case management
- Surveillance map with hotspot clusters
- Legal takedown dispatch (GI Act / IP Enforcement)

### National Admin Dashboard
- Nationwide verification metrics
- Fraud alert feed
- Artisan & cooperative management

---

## API Reference

### Node REST API (`/api/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login / demo auth |
| `GET` | `/api/products` | List all products |
| `POST` | `/api/products` | Register new product + ML enrollment |
| `POST` | `/api/products/:id/physical-check` | Targeted 1:1 physical match |
| `POST` | `/api/verify/physical-1-to-n` | Anonymous 1:N discovery scan |
| `GET` | `/api/fraud-alerts/intelligence/dashboard` | Layer 2 intelligence summary |
| `GET` | `/api/fraud-alerts/intelligence/incidents` | Active counterfeit incidents |
| `GET` | `/api/fraud-alerts/intelligence/hotspots` | Geospatial hotspot clusters |
| `GET` | `/api/products/:id/provenance` | Provenance ledger events |

### Python ML API (`/ml/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ml/health` | Health check |
| `POST` | `/ml/register` | Enroll product fingerprint |
| `POST` | `/ml/verify` | Run 1:N physical authentication |
| `GET` | `/ml/intelligence/dashboard` | Layer 2 dashboard |
| `GET` | `/ml/intelligence/incidents` | Layer 2 incidents |
| `GET` | `/ml/intelligence/hotspots` | Layer 2 hotspot clusters |

---

## ML Pipeline Details

### Layer 1 — Physical Fingerprint Authentication

1. **Image Ingestion**: Accepts base64 data URLs or file paths  
2. **ROI Detection**: Multi-scale adaptive ROI selection targeting the highest-quality craft region  
3. **Feature Extraction**:
   - ORB + AKAZE keypoints (up to 2000 descriptors)
   - LBP 128-bin texture histogram
   - GLCM 4-direction spectral features
4. **Matching**: RANSAC homography + Lowe's ratio test + cross-check filtering  
5. **Fusion Scoring**: Random Forest classifier with 8 features (RANSAC inliers, ratio, LBP/GLCM similarity, reprojection error, normalized match count, ROI quality, threshold delta)  
6. **Digital Verification**: RSA-2048 manifest hash verification  
7. **Decision**: `VERIFIED` / `NOT_VERIFIED` / `SUSPICIOUS` / `UNCERTAIN`

Calibrated threshold: **86.7%** (loaded from `artifacts/thresholds/threshold.json`)

### Layer 2 — Counterfeit Intelligence Pipeline

Triggered automatically when Layer 1 returns `NOT_VERIFIED` or `SUSPICIOUS`:
- Converts verification result to a `DetectionEvent`
- Runs geospatial clustering on recent scan events
- Creates incident records and updates hotspot registry
- Feeds the Cooperative Intelligence and Admin dashboards

---

## User Roles

| Role | Access |
|------|--------|
| `ARTISAN` | Register products, upload evidence, view own passports |
| `BUYER` | Scan & verify products, view provenance |
| `COOPERATIVE` | Verify artisans, manage fraud alerts, counterfeit intelligence |
| `REVIEWER` | Full verification audit, approve/reject products |
| `ADMIN` | Full system access, national dashboard |

---

## Security Model

- **JWT Bearer tokens** for all authenticated routes
- **RBAC middleware** (`requireRole`) on all sensitive endpoints
- **RSA-2048** asymmetric signing of every product's physical manifest
- **Rate limiting** on physical-check endpoints (60 req/min)
- **Provenance ledger** — immutable audit trail for every verification event

---

## Data Storage

All data is stored in-memory for the hackathon demo (see `Frontend/server/config/supabase.ts`).  
The ML fingerprint registry persists to disk at `Backend/data/registry/`.

To reset the ML registry:
```bash
rm -rf Backend/data/registry/*
```

---

## Project Structure

```
Kalakriti/
├── Frontend/
│   ├── server.ts                    # Express entrypoint
│   ├── server/
│   │   ├── modules/
│   │   │   ├── ai/                  # ML client & vision matcher
│   │   │   ├── products/            # Product CRUD + ML enrollment
│   │   │   ├── verification/        # Physical & cooperative verification
│   │   │   ├── counterfeit/         # Fraud alerts + Layer 2 intelligence
│   │   │   ├── passports/           # Digital passport management
│   │   │   ├── provenance/          # Ledger events
│   │   │   └── ...
│   │   └── middleware/              # Auth, RBAC, rate limiting
│   └── src/
│       ├── components/              # React UI components
│       ├── context/                 # AppContext (global state)
│       └── services/api.ts          # Frontend API client
└── Backend/
    ├── ml_api.py                    # FastAPI ML microservice
    ├── src/
    │   ├── verification.py          # 1:N verification core
    │   ├── feature_extraction.py    # ORB/AKAZE/LBP/GLCM
    │   ├── matching.py              # RANSAC matching
    │   ├── roi_detection.py         # Adaptive ROI selection
    │   └── model_training.py        # Random Forest trainer
    ├── layer2/
    │   ├── pipeline.py              # Layer 2 intelligence pipeline
    │   └── adapter.py               # VerificationResult → DetectionEvent
    ├── register.py                  # CLI product enrollment tool
    ├── verify.py                    # CLI verification tool
    └── config/config.yaml           # ML configuration
```
