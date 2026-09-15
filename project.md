# Kalakriti Architecture & Directory Documentation

This file documents the overall architecture, folder structures, key files, and physical integration map for the **Kalakriti** platform.

---

## 1. Core Integration Strategy

The platform operates on a three-tier model:

```
            +--------------------------------------------+
            |               React Frontend               |
            |   (Vite / React TS - port 3001 in dev)     |
            +---------------------+----------------------+
                                  |
                           REST / HTTP API
                                  v
            +---------------------+----------------------+
            |       Node / Express Backend Server        |
            |       (Port 3001 /server.ts / Node)        |
            +---------------------+----------------------+
                                  |
                        Intra-Service API Call
                                  v
            +---------------------+----------------------+
            |        Python ML Authentication Engine     |
            |       (Port 8000 / FastAPI / ml_api.py)    |
            +--------------------------------------------+
```

### Routing & Integration for `/` across Ports:
* **Port 3001 (Node/Express Server + Vite SPA)**: This is the main customer/artisan entry-point. Hitting `/` here compiles and serves the Vite React SPA HTML UI.
* **Port 8000 (Python FastAPI ML Service)**: The root route (`/`) serves an interactive HTML index page listing all the available backend endpoints (Swagger docs, health check, registration, verification, etc.) with a CTA button to navigate to the frontend portal on port 3001.

---

## 2. Directory Breakdown

### 📂 Root Directory
* [`Implementation.md`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Implementation.md): Guides integration and workflow across the stack.
* [`project.md`](file:///c:/Users/swaya/Desktop/Kalakriti_full/project.md): This file (system architecture overview and directory index).
* [`README.md`](file:///c:/Users/swaya/Desktop/Kalakriti_full/README.md): Setup instructions for running the code.

---

### 📂 Backend (Python ML Physical Authentication Engine)
Runs on port **8000**. Handles digital fingerprint generation, OpenCV image feature matching, and Layer 2 counterfeit intelligence clustering.

* [`ml_api.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/ml_api.py): Main entrypoint exposing endpoints for:
  - `/ml/health` (Service health status)
  - `/ml/register` (Enroll product image & generate RSA identity signature)
  - `/ml/verify` (Authenticate query photograph)
  - `/ml/intelligence/*` (Counterfeit intelligence, incidents, geo-hotspots)
* [`requirements.txt`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/requirements.txt): Python dependencies list.
* [`possible_causes.txt`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/possible_causes.txt): Diagnostic file for service connectivity checks.

#### 📂 Backend/src (Computer Vision Core)
* [`registry.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/src/registry.py): Manages persistence of enrolled physical fingerprints.
* [`verification.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/src/verification.py): Conducts 1:N or 1:1 matching checks using RANSAC and LBP.
* [`feature_extraction.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/src/feature_extraction.py): Extracts LBP, GLCM, and ORB/AKAZE keypoints from images.
* [`roi_detection.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/src/roi_detection.py): Detects region-of-interest (ROI) matching optimal surface textures.
* [`image_loader.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/src/image_loader.py): Utility for reading local/remote images into NumPy arrays.
* [`image_quality.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/src/image_quality.py): Computes sharpness, noise, and exposure metrics for QA.

#### 📂 Backend/layer2 (Counterfeit Intelligence & Alerts)
* [`pipeline.py`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Backend/layer2/pipeline.py): Aggregates counterfeit incidents and triggers risk analysis.
* **`alerts/`**: Generates real-time alerts if counterfeit hotspots cross critical thresholds.
* **`incident/`**: Manages incident logs for investigations.

---

### 📂 Frontend (React SPA & Express Backend)
Runs on port **3001**. Contains the web interface and the client-facing proxy backend.

* [`server.ts`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Frontend/server.ts): Express server boot script. Coordinates:
  - Vite middleware serving React SPA on `/` (dev mode).
  - Production static serving from `dist/`.
  - API routers mounted under `/api/*`.

#### 📂 Frontend/server (Node REST controllers)
* **`modules/auth/`**: Sign-in, sign-up, and session handlers.
* **`modules/products/`**: Products registry metadata storage.
* **`modules/verification/`**: Connects to the Python ML API `/ml/verify` endpoint.
* **`modules/counterfeit/`**: Feeds the admin counterfeit intelligence dashboard.

#### 📂 Frontend/src (React Client Web App)
* [`main.tsx`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Frontend/src/main.tsx): Entry point bootstrap.
* [`App.tsx`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Frontend/src/App.tsx): Client-side layout and route config (enforces authentication gates on private workspace views).
* **`components/`**: Divided by actor and functionality:
  - `admin/`: Admin panels & incident investigations.
  - `artisan/`: Artisan dashboard for product enrollment.
  - `buyer/`: Product search, verification page, and digital passports.
  - `common/`: Core layouts, UI wrappers, and the secure workspace identity controller [`AuthModal.tsx`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Frontend/src/components/common/AuthModal.tsx).
  - `cooperative/`: Artisan cooperative analytics.
