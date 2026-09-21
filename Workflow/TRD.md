Here is the complete, detailed Technical Requirements Document formatted as a `.md` (Markdown) file, ready to be provided to Antigravity. I have meticulously detailed all architectural pipelines and workflows while completely excluding the specific validation step against the stored RSA Public Key as requested.

```markdown
# Kalakriti: Technical Requirements Document (TRD)

**Document Type:** Technical Requirements Document (TRD)  
**Project:** Kalakriti — AI-Enhanced Trust Layer for Physical Product Authentication  
**Target Audience:** Engineering Teams, Antigravity AI, System Architects  
**Primary Focus:** Technical architecture, backend workflows, APIs, processing pipelines, integrations, security, and system behavior.

---

## 1. Purpose and Scope
This TRD defines the technical implementation strategy for the Kalakriti platform. It serves as the primary blueprint for engineering teams to understand system behavior, integrations, and processing pipelines. 

**In Scope for this TRD:**
* System architecture and microservice boundaries.
* Frontend-to-backend communication contracts.
* Authentication, authorization, and Role-Based Access Control (RBAC).
* Layer 1 (Physical Authentication) and Layer 2 (Counterfeit Intelligence) pipelines.
* Cryptographic manifest workflows.
* API design principles and structured error handling.

**Out of Scope (Referenced Documents):**
* **PRD (Product Requirements Document):** User stories, UI/UX workflows, and acceptance criteria.
* **Backend Schema:** Exact database table definitions, foreign keys, relationships, data types, and migration rules.

---

## 2. Architectural Principles
Kalakriti is built on five non-negotiable architectural principles designed to ensure system integrity, prevent state manipulation, and maintain mathematical explainability.

1. **Backend as the Source of Truth:** Frontend state must never be treated as authoritative for artisan verification, product ownership, permissions, or authentication results.
2. **Product-Specific Authentication:** A scanned QR must resolve to a specific `QR ID` → `Exact Product` → `Exact Artisan` → `Exact Reference Data`. The system must never fallback to a "default" or hard-coded product.
3. **Layer Separation:** Layer 1 (Authentication) and Layer 2 (Counterfeit Intelligence) are strictly isolated. Layer 2 analytics must never influence whether an individual product scan in Layer 1 is deemed authentic.
4. **Location Agnosticism in Layer 1:** Geographic location is exclusively a Layer 2 metadata attribute. Location does not influence the Layer 1 mathematical authentication score.
5. **Deterministic Primacy over ML:** Machine Learning is a supporting score, not the sole authority. Cryptography + Classical Computer Vision (Geometry/Texture) + Physical Evidence form the core decision engine. ML cannot override a cryptographic or mandatory physical verification failure.

---

## 3. System Architecture

The platform operates on a robust three-tier architecture, separating the transactional product registry from the heavy computer vision and intelligence pipelines.

```text
                         KALAKRITI
                             │
                             ▼
                 ┌─────────────────────┐
                 │   FRONTEND CLIENT   │
                 │ React + TypeScript  │
                 └──────────┬──────────┘
                            │
                       REST / JSON
                            │
                            ▼
                 ┌─────────────────────┐
                 │    API / BACKEND    │
                 │       FastAPI       │
                 └──────────┬──────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   Identity &          Product &          Authentication
 Access Service      Registration            Engine
                            │                   │
                            │                   ├── CV Pipeline (ORB/AKAZE)
                            │                   ├── Cryptography (SHA/RSA)
                            │                   └── ML Scoring (Log. Reg.)
                            │
                            ▼
                   ┌─────────────────┐
                   │    DATABASE     │
                   │   PostgreSQL    │
                   └─────────────────┘
                            │
                            ▼
                 Counterfeit Intelligence
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Analytics       Risk          Dashboard

```

### 3.1 Logical Backend Services

The backend is logically modularized to ensure separation of concerns:

* `/auth` & `/users`: Identity management, JWT generation, and session state.
* `/artisans` & `/cooperatives`: Onboarding, KYC workflows, and verification state machines.
* `/products` & `/qr`: Product metadata, unique ID generation, and manifest creation.
* `/authentication`: The core Layer 1 engine (preprocessing, ROI localization, matching, geometry, scoring).
* `/incidents` & `/intelligence`: The Layer 2 engine (clustering, anomaly detection, risk scoring).

---

## 4. Identity, Authentication & Authorization

### 4.1 Identity Resolution

The system relies on a stable internal user identity. A login event (via phone or email) resolves to an Authenticated User ID, which maps to a specific role.

* **Rule:** A login event must never automatically create a duplicate artisan profile if a profile lookup fails; it must result in a lookup error or retry prompt.

### 4.2 Role-Based Access Control (RBAC)

Permissions are strictly enforced at the backend route level via middleware.

| Role | Permitted Operations |
| --- | --- |
| **ARTISAN** | View own profile, create verification requests, register products (if verified), view own product ledger. |
| **COOPERATIVE_VERIFIER** | View pending artisan requests, approve/reject artisans, view regional counterfeit incidents. |
| **BUYER / PUBLIC** | Scan QR codes, execute Layer 1 authentication, view public digital passports. |
| **ADMIN** | Manage system policies, view national dashboard, administrative overrides. |

---

## 5. Artisan & Cooperative Workflows

### 5.1 Artisan Registration

1. Authenticated user requests artisan profile creation.
2. Backend checks for existing profiles (prevents duplicates).
3. If new, creates profile with `Status = PENDING` and associates a Cooperative ID.
4. Generates a Verification Request for the cooperative queue.

### 5.2 Cooperative Verification

1. Cooperative user logs in and retrieves the pending queue.
2. Reviewer selects `APPROVE` or `REJECT` (transactional database operation).
3. **If Approved:** Artisan status updates to `VERIFIED`, a unique `Kalakriti Artisan ID` is generated, and product registration endpoints are unlocked for that user.
4. **If Rejected:** Status updates to `REJECTED`, and product registration remains blocked.

---

## 6. Product Registration & Identity Workflow

Registration requires a valid JWT, an existing Artisan Profile, a `VERIFIED` status, and a valid `Kalakriti Artisan ID`.

1. **Metadata & ID Generation:** Backend validates input and generates a unique `Product ID` and `QR ID`.
2. **Reference Capture:** Artisan uploads the high-quality product reference image.
3. **ROI Extraction:** System performs image quality validation and extracts the designated Region of Interest (ROI) physical reference.
4. **Manifest Creation:** A digital manifest containing the Product ID, QR ID, and Physical Reference Vector is created.
5. **Cryptographic Signing:** The manifest is hashed (SHA-256) and digitally signed using the system's RSA Private Key.
6. **Persistence:** The trusted product record is stored, marking the product as `REGISTERED`.

---

## 7. Layer 1: On-Spot Physical Authentication

Layer 1 operates under a strict **1:1 targeted physical authentication** model. It does not perform an N-scale database search.

### 7.1 Execution Pipeline

1. **QR Lookup:** Buyer scans QR. Decoder extracts `QR ID`. Backend queries the exact registered product and its original signed reference data.
2. **Image Capture & Quality Gate:** Live query image is captured. If quality is poor (blur, glare), backend returns `IMAGE_QUALITY_INSUFFICIENT`.
3. **ROI Localization & Verification:**
* **Keypoint-Rich Path:** Extracts ORB/AKAZE descriptors → Lowe Ratio Test → Brute-Force/FLANN Matching → RANSAC Homography for geometric consistency (Inlier ratio, reprojection error).
* **Low-Texture Fallback:** If keypoints are insufficient, the system routes to Normalized Cross-Correlation (NCC), Phase Correlation, Structural Similarity Index (SSIM), and Gradient Similarity.


4. **Evidence Vectorization:** A physical evidence vector is compiled from the similarity metrics.

### 7.2 Cryptographic Verification

Prior to physical scoring, the system guarantees data integrity:

* Calculates the SHA-256 hash of the retrieved registered manifest.
* If the cryptographic integrity check is invalid, the authentication fails immediately (`DIGITAL_SIGNATURE_INVALID`).

### 7.3 Final Authentication Engine

A calibrated Logistic Regression model ingests the physical evidence vector to generate a supporting probability score (0-100). The final decision is a cascading logic gate:

```text
IF QR invalid → FAIL (QR_NOT_FOUND)
IF Cryptographic integrity check fails → FAIL (DIGITAL_SIGNATURE_INVALID)
IF ROI cannot be verified → FAIL (INSUFFICIENT_IMAGE_EVIDENCE)
IF physical hard thresholds fail (e.g., RANSAC inliers < 6) → FAIL (SUSPICIOUS)
OTHERWISE → Calculate final authentication score (AUTHENTIC / SUSPICIOUS)

```

---

## 8. Layer 2: Counterfeit Intelligence

Layer 2 triggers exclusively when Layer 1 yields a `SUSPICIOUS` or `COUNTERFEIT` result.

### 8.1 Incident Creation & Deduplication

* The backend generates a `Counterfeit Incident` attaching the Product ID, QR ID, query image, verification metrics, and timestamp.
* **Location Tagging:** Tagged as `USER_PROVIDED` (GPS) or `IP_ESTIMATED`. Location is strictly segregated from Layer 1 computations.
* **Deduplication:** Compares new incidents against recent DB records based on product similarity, time, and location to merge duplicate rapid-scans of the same fake item.

### 8.2 Anomaly & Spatial Analysis

* **DBSCAN Clustering:** Groups geographic incident locations to identify spatial counterfeit hotspots (e.g., clusters within a 50 km radius).
* **Isolation Forest:** Extracts cluster features (scan velocity, mean confidence score, distance from origin) to detect severe behavioral anomalies (e.g., a coordinated syndicate vs. random background fakes).
* **Risk Engine:** Aggregates incident frequency, geographic concentration, and temporal spikes into a dynamic `Geographic Risk Score` exposed to the Cooperative and Admin dashboards.

---

## 9. API Architecture & Error Handling

All APIs adhere to RESTful principles, consuming and producing JSON.

### 9.1 Structured Error Codes

Business logic must not return arbitrary English strings. The backend returns standard HTTP status codes mapped to structured internal reason codes. The frontend handles localization based on these codes.

* `ARTISAN_NOT_FOUND` / `ARTISAN_NOT_VERIFIED`
* `PRODUCT_NOT_FOUND`
* `QR_NOT_FOUND` / `QR_INVALID`
* `ROI_NOT_VERIFIED`
* `INSUFFICIENT_IMAGE_EVIDENCE`
* `DIGITAL_SIGNATURE_INVALID` / `HASH_MISMATCH`
* `AUTHENTICATION_FAILED`
* `UNAUTHORIZED` / `FORBIDDEN`

### 9.2 Standardized Output Contract

Layer 1 authentication results must utilize a structured JSON format:

```json
{
  "product_id": "prd_987654321",
  "qr_id": "qr_123456789",
  "physical_score": 91,
  "digital_verification": "PASS",
  "roi_verification": "PASS",
  "final_result": "AUTHENTIC",
  "reason_codes": []
}

```

---

## 10. Data Persistence & Storage Architecture

**Note:** *Exact table definitions, column types, and foreign key constraints are strictly maintained in the separate Backend Schema document.*

* **Relational Database (PostgreSQL):** Stores identity relationships, users, artisans, cooperatives, QR manifests, digital signatures, verification requests, and Layer 2 incidents/risk metadata.
* **Object/File Storage:** Large binary objects (high-res reference images, live query photos, ROI patches) are stored in cloud object storage (e.g., S3). The database stores lightweight reference URIs to maintain query performance.

---

## 11. Security & Auditability

* **Key Management:** Private RSA keys used for manifest signing are maintained securely on the backend (via environment variables or a KMS) and are never exposed to the frontend client.
* **Integrity:** Digital hash verification ensures that reference data has not been altered directly in the database.
* **Audit Trails:** Immutable audit records are generated for critical state changes: Artisan Registration, Cooperative Approval/Rejection, Product Registration, and Counterfeit Incident creation.
* **Rate Limiting:** Public QR scan and authentication endpoints are heavily rate-limited to prevent brute-force querying of the product database.

---

## 12. Technology Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Frontend UI** | React + TypeScript, Tailwind CSS | Type-safe, responsive client portals. |
| **Backend API** | Python, FastAPI | High-performance, async REST API server. |
| **Database** | PostgreSQL | Relational persistence and transactional integrity. |
| **Computer Vision** | OpenCV | ROI localization, ORB/AKAZE extraction, image processing. |
| **Geometric/Texture** | NumPy, SciPy | RANSAC, Homography, NCC, SSIM computation. |
| **Machine Learning** | Scikit-learn | Logistic Regression (Layer 1), Isolation Forest/DBSCAN (Layer 2). |
| **Cryptography** | `cryptography` (Python) | RSA-2048 signing, SHA-256 hashing. |
| **Mapping & Analytics** | Leaflet, Pandas | Geospatial dashboarding and temporal trend aggregation. |
| **Deployment** | Docker | Containerized environments for consistent staging/production. |

---

## 13. Testing Architecture

System reliability is enforced through three testing layers:

1. **Unit Tests:** Isolated validation of QR parsing algorithms, ROI localization bounds, hash generation, and access control decorators.
2. **Integration Tests:** Verification of module boundaries (e.g., QR string → Backend Router → DB Lookup → Crypto Verification → Authentication JSON response).
3. **End-to-End (E2E) Tests:** Simulating the full lifecycle: Artisan Registration → Cooperative Approval → Product Registration → Buyer QR Scan → Live Image Auth → Incident Generation → Dashboard Update.

```

```