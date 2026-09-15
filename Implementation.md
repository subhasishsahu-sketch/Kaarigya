KALAKRITI — COMPLETE FRONTEND + NODE BACKEND + PYTHON ML INTEGRATION

You are working on the KALAKRITI project.

The project contains THREE logical layers:

1. REACT FRONTEND
2. NODE / EXPRESS APPLICATION BACKEND
3. PYTHON PHYSICAL AUTHENTICATION / ML ENGINE

The goal is NOT simply to merge files.

The goal is to make these three layers function as ONE coherent, real full-stack Kalakriti platform.

========================================================
CORE ARCHITECTURE
========================================================

                    KALAKRITI
                        |
                        v
                 REACT FRONTEND
                        |
                 REST / HTTP API
                        |
                        v
              NODE / EXPRESS BACKEND
                        |
                ML SERVICE API
                        |
                        v
              PYTHON ML ENGINE
                        |
                        v
               LAYER 1 AUTHENTICATION
                        |
             +----------+----------+
             |                     |
             v                     v
         AUTHENTIC          SUSPICIOUS /
                            COUNTERFEIT
                                  |
                                  v
                       LAYER 2 INTELLIGENCE
                                  |
            +---------------------+----------------------+
            |          |           |         |           |
            v          v           v         v           v
        INCIDENTS   LOCATION    HOTSPOTS  TRENDS      RISK
            |          |           |         |           |
            +----------+-----------+---------+-----------+
                                  |
                                  v
                               ALERTS
                                  |
                                  v
                           INVESTIGATION
                                  |
                                  v
                            ADMIN UI
                                  |
                                  v
                           REACT FRONTEND


========================================================
PART 1 — INSPECT THE COMPLETE PROJECT FIRST
========================================================

DO NOT MODIFY FILES IMMEDIATELY.

First inspect:

A. COMPLETE REACT FRONTEND
B. COMPLETE NODE / EXPRESS BACKEND
C. COMPLETE PYTHON ML ENGINE

Understand all existing code before making architectural changes.

Identify:

FRONTEND
- App.tsx
- routing
- pages
- components
- dashboards
- forms
- verification UI
- registration UI
- product UI
- authentication UI
- counterfeit intelligence UI
- admin UI
- artisan UI
- buyer UI
- API client
- contexts/state management
- environment configuration

BACKEND
- server.ts
- routes
- controllers
- services
- middleware
- modules
- database
- authentication
- products
- verification
- AI
- counterfeit intelligence
- incidents
- alerts
- analytics
- location/geography
- provenance/passports
- admin functionality

PYTHON
- register.py
- verify.py
- train.py
- evaluate.py
- image processing
- ROI
- ORB / AKAZE
- LBP
- GLCM
- matching
- RANSAC
- feature vectors
- ML model
- RSA / cryptography
- registry/database functionality

Inspect existing implementations before writing replacements.

FIRST REPORT:

1. Existing frontend architecture
2. Existing backend architecture
3. Existing Python architecture
4. Existing API contracts
5. Existing frontend-to-backend connections
6. Existing backend-to-ML connections
7. Missing connections
8. Broken connections
9. Placeholder/mock implementations
10. Duplicate implementations
11. Missing environment variables
12. Required integration plan

DO NOT START LARGE MODIFICATIONS UNTIL THIS ANALYSIS IS COMPLETE.


========================================================
PART 2 — DO NOT DESTROY THE EXISTING FRONTEND
========================================================

The existing React frontend is part of the product.

Do NOT rebuild the entire frontend from scratch.

Do NOT replace the existing visual design unnecessarily.

Do NOT remove existing screens just because backend integration is incomplete.

Preserve:

- layout
- navigation
- dashboards
- forms
- components
- styling
- existing user flows

Only modify frontend code where required to connect the real backend.


========================================================
PART 3 — FRONTEND FEATURE → BACKEND FEATURE MAPPING
========================================================

Create an explicit mapping between every major frontend feature and its backend API.

For every screen/component, determine:

FRONTEND ACTION
       ↓
API REQUEST
       ↓
NODE ROUTE
       ↓
SERVICE
       ↓
DATABASE / PYTHON ML
       ↓
RESPONSE
       ↓
FRONTEND STATE
       ↓
UI RESULT

Create a mapping table such as:

Frontend Feature
→ API endpoint
→ Backend service
→ Database/ML dependency
→ Response format
→ UI component receiving result

Do this for ALL important workflows.


========================================================
PART 4 — PRODUCT REGISTRATION
========================================================

Connect the existing frontend product registration flow to the REAL authentication engine.

Expected flow:

ARTISAN / ADMIN
      ↓
FRONTEND PRODUCT REGISTRATION
      ↓
Product metadata
      ↓
Reference image upload
      ↓
NODE BACKEND
      ↓
PYTHON /ml/register
      ↓
Image preprocessing
      ↓
ROI detection
      ↓
Feature extraction
      ↓
Physical fingerprint generation
      ↓
ML / registry processing
      ↓
RSA / cryptographic identity
      ↓
Store registration information
      ↓
NODE BACKEND
      ↓
FRONTEND REGISTRATION SUCCESS

The frontend must receive a real response.

Do NOT fake registration success.

If registration fails, the actual error must be returned to the frontend.


========================================================
PART 5 — PRODUCT VERIFICATION
========================================================

Connect the existing buyer/customer verification UI to the REAL authentication engine.

Expected flow:

BUYER
 ↓
Frontend verification screen
 ↓
Upload / capture image
 ↓
Frontend API client
 ↓
Node verification endpoint
 ↓
Python ML service
 ↓
1:N or product-specific authentication
 ↓
ROI
 ↓
ORB / AKAZE
 ↓
Matching
 ↓
RANSAC
 ↓
LBP / GLCM
 ↓
Feature vector
 ↓
ML classification
 ↓
RSA verification
 ↓
Final authentication result
 ↓
Node backend
 ↓
Persist verification event
 ↓
Layer 2 evaluation
 ↓
Return response
 ↓
Frontend result screen


========================================================
PART 6 — AUTHENTICATION RESULT UI
========================================================

The frontend must display REAL authentication information.

Possible states:

AUTHENTIC
SUSPICIOUS
COUNTERFEIT
UNKNOWN
INVALID_INPUT
ERROR

The frontend must clearly distinguish these.

Do not show:

100% confidence
fake match counts
fake ML scores
fake RSA verification
fake geographic data

unless the backend actually returned those values.

Use the actual values from the Python engine.

For unavailable metrics, display:

N/A

rather than inventing data.


========================================================
PART 7 — VERIFICATION HISTORY
========================================================

Connect the existing frontend verification-history UI to the backend.

Frontend must be able to request real records such as:

- verification ID
- product
- timestamp
- result
- confidence
- relevant metrics
- location
- incident relationship

The backend should fetch this from the application database.

Do NOT calculate historical verification records in React.


========================================================
PART 8 — LAYER 1 AUTHENTICATION BACKEND
========================================================

The Python engine remains the SOURCE OF TRUTH.

Do NOT reproduce these algorithms in TypeScript:

- ROI detection
- ORB
- AKAZE
- feature matching
- RANSAC
- LBP
- GLCM
- feature vector construction
- ML authentication
- RSA verification

Node only orchestrates communication.

Architecture:

React
 ↓
Node
 ↓
Python ML
 ↓
Real authentication


========================================================
PART 9 — PYTHON ML API
========================================================

Create a persistent Python API service around the existing Python engine.

Preferred framework:

FastAPI

Possible endpoints:

GET  /ml/health
POST /ml/register
POST /ml/verify

Do not duplicate the authentication logic.

The API should call existing Python functions/modules.

Return structured JSON.

Use the actual fields produced by the Python engine.

Do not invent metrics.


========================================================
PART 10 — NODE ↔ PYTHON INTEGRATION
========================================================

Create a dedicated service such as:

server/modules/ai/mlClient.service.ts

Configuration:

ML_SERVICE_URL=http://127.0.0.1:8000

Node must handle:

- connection errors
- timeout
- invalid response
- malformed JSON
- Python service unavailable
- validation errors

Never convert a Python failure into AUTHENTIC.


========================================================
PART 11 — REPLACE THE EXISTING PLACEHOLDER VISION MATCHER
========================================================

Inspect:

server/modules/ai/visionMatcher.service.ts

If it is a mock/hash/deterministic implementation:

Do NOT use it as the production physical-authentication engine.

Replace its physical-authentication role with the Python ML service.

Preserve interfaces where practical so that the frontend does not need unnecessary rewriting.


========================================================
PART 12 — LAYER 2 COUNTERFEIT INTELLIGENCE
========================================================

Layer 2 begins AFTER Layer 1 returns a verification result.

Flow:

Layer 1
 ↓
Authentication result
 ↓
Persist verification
 ↓
Evaluate:
AUTHENTIC?
SUSPICIOUS?
COUNTERFEIT?
 ↓
If suspicious/counterfeit
 ↓
Create/update incident
 ↓
Location processing
 ↓
Hotspot analysis
 ↓
Trend analysis
 ↓
Risk calculation
 ↓
Alert rules
 ↓
Investigation
 ↓
Admin intelligence


========================================================
PART 13 — COUNTERFEIT INCIDENT FRONTEND
========================================================

Connect existing counterfeit/incident frontend pages to the real backend.

Frontend should support real:

- incident list
- incident details
- status
- evidence
- verification relationship
- product relationship
- timestamp
- location
- confidence
- investigation history

Do not hard-code incidents.


========================================================
PART 14 — GEOGRAPHIC INTELLIGENCE FRONTEND
========================================================

Connect the existing map/geographic components to real backend data.

Backend:

Counterfeit incidents
 ↓
Location normalization
 ↓
Geographic aggregation/clustering
 ↓
Hotspots
 ↓
Risk/density

Frontend:

GET hotspot data
 ↓
Render map
 ↓
Render hotspot information

Do not generate artificial geographic points.

Do not hard-code hotspot coordinates.


========================================================
PART 15 — TIME SERIES / TREND DASHBOARDS
========================================================

Connect frontend charts to real Layer 2 analytics.

Backend should calculate:

- daily detections
- weekly detections
- monthly detections
- regional trends
- product trends
- detection spikes
- repeat incidents

Frontend only visualizes returned data.

Do not calculate core analytics independently in React.


========================================================
PART 16 — RISK DASHBOARD
========================================================

Connect existing risk-related UI to a backend risk service.

Risk must be based on real signals:

- counterfeit frequency
- suspicious detections
- hotspot density
- repeat product incidents
- temporal spikes
- severity
- authentication confidence

Risk calculation must be modular and configurable.

Do not fabricate a score.


========================================================
PART 17 — ALERTS
========================================================

Connect frontend alerts to backend alert generation.

Flow:

Layer 2 signal
 ↓
Rule / threshold
 ↓
Alert
 ↓
Database
 ↓
Admin frontend

Frontend should show:

- alert ID
- severity
- type
- source
- timestamp
- status
- related incident/product
- resolution state


========================================================
PART 18 — INVESTIGATION
========================================================

Connect investigation UI to backend state management.

Possible states:

NEW
UNDER_REVIEW
INVESTIGATING
RESOLVED

Preserve audit history.

Do not overwrite previous investigation events.


========================================================
PART 19 — USER ROLE INTEGRATION
========================================================

Inspect the existing frontend roles and backend authorization.

Connect the correct functionality for roles such as:

- buyer/user
- artisan
- cooperative
- admin
- national/admin intelligence

Do not expose admin APIs to normal users.

Do not move role checks exclusively into React.

Authorization must be enforced by the backend.


========================================================
PART 20 — FRONTEND API CLIENT
========================================================

Inspect:

src/services/api.ts

Refactor it carefully so all major frontend features use a consistent API layer.

Centralize:

- base URL
- authentication headers
- error handling
- request handling
- response parsing

Use environment variables.

Example:

VITE_API_URL=http://localhost:3001

Do not hard-code production URLs.


========================================================
PART 21 — DATABASE
========================================================

Avoid unnecessary duplicate databases.

Recommended ownership:

PYTHON:
- physical fingerprints
- image-processing artifacts
- ML artifacts
- authentication computation
- cryptographic artifacts where appropriate

NODE / APPLICATION DATABASE:
- users
- products
- passports
- verification records
- incidents
- locations
- alerts
- investigations
- Layer 2 analytics
- application metadata

Inspect the current database before implementing this.

Do not migrate data unnecessarily.


========================================================
PART 22 — END-TO-END FRONTEND WORKFLOWS
========================================================

The following workflows MUST work end-to-end.

WORKFLOW A — PRODUCT REGISTRATION

Frontend
 ↓
Node API
 ↓
Python ML
 ↓
Physical fingerprint
 ↓
Cryptographic registration
 ↓
Database
 ↓
Frontend success

WORKFLOW B — PRODUCT VERIFICATION

Frontend
 ↓
Node API
 ↓
Python ML
 ↓
Authentication
 ↓
Database
 ↓
Frontend result

WORKFLOW C — COUNTERFEIT DETECTION

Frontend
 ↓
Node
 ↓
Python
 ↓
COUNTERFEIT
 ↓
Verification event
 ↓
Incident
 ↓
Layer 2
 ↓
Risk / hotspot / trend
 ↓
Alert
 ↓
Admin frontend

WORKFLOW D — AUTHENTIC PRODUCT

Frontend
 ↓
Node
 ↓
Python
 ↓
AUTHENTIC
 ↓
Verification stored
 ↓
Frontend authentic result

WORKFLOW E — ML FAILURE

Frontend
 ↓
Node
 ↓
Python unavailable
 ↓
Structured backend error
 ↓
Frontend error state

Never show AUTHENTIC when ML processing failed.


========================================================
PART 23 — FRONTEND UX STATES
========================================================

Every major API-driven frontend feature must have:

1. Loading state
2. Success state
3. Empty state
4. Validation error state
5. Backend error state
6. ML unavailable state where relevant

Do not leave blank screens when an API fails.


========================================================
PART 24 — SECURITY
========================================================

Never expose:

- RSA private keys
- secret API keys
- database credentials
- ML service credentials
- private cryptographic material

to React.

Secrets remain server-side.

Validate uploaded images and request payloads.

Enforce authorization on backend routes.


========================================================
PART 25 — DEVELOPMENT ENVIRONMENT
========================================================

Make local development easy.

PYTHON ML SERVICE:

Terminal 1
cd <PYTHON-SERVICE>
activate virtual environment
python <ML API ENTRYPOINT>

NODE / REACT APPLICATION:

Terminal 2
cd <KALAKRITI-WEB-APP>
npm install
npm run dev

Use environment configuration:

Node:
ML_SERVICE_URL=http://127.0.0.1:8000

Frontend:
VITE_API_URL=http://localhost:3001

Confirm actual ports from the existing code before finalizing.


========================================================
PART 26 — TESTING
========================================================

Test:

1. Frontend starts
2. Backend starts
3. Python ML service starts
4. Frontend → Node communication
5. Node → Python communication
6. Product registration
7. Product verification
8. Authentic result
9. Suspicious result
10. Counterfeit result
11. Verification persistence
12. Incident creation
13. Hotspot calculation
14. Trend calculation
15. Risk calculation
16. Alert generation
17. Investigation workflow
18. ML service unavailable
19. Invalid image
20. Unauthorized request

For unit tests, mock only service boundaries where necessary.

Do NOT replace actual production authentication logic with mocks.


========================================================
PART 27 — DO NOT CREATE FAKE FUNCTIONALITY
========================================================

This is critical.

Do NOT:

- fake authentication results
- fake verification scores
- fake ML output
- fake counterfeit locations
- fake hotspot coordinates
- fake trends
- fake incidents
- fake risk scores
- fake alert counts

If functionality does not exist yet:

1. identify it
2. implement it properly where possible
3. otherwise clearly mark it as incomplete

Never make the UI appear functional when the backend is not actually functioning.


========================================================
PART 28 — FINAL DIRECTORY STRUCTURE
========================================================

Maintain a clean architecture similar to:

KALAKRITI/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── Backend/
│   ├── server/
│   │   ├── modules/
│   │   │   ├── products/
│   │   │   ├── verification/
│   │   │   ├── ai/
│   │   │   ├── counterfeit/
│   │   │   ├── incidents/
│   │   │   ├── alerts/
│   │   │   └── ...
│   │   ├── middleware/
│   │   ├── db/
│   │   └── ...
│   ├── server.ts
│   └── package.json
│
└── PythonML/
    ├── register.py
    ├── verify.py
    ├── train.py
    ├── evaluate.py
    ├── src/
    ├── models/
    ├── data/
    ├── keys/
    └── ...


If the current structure is already different, preserve it unless a change is actually necessary.


========================================================
PART 29 — FINAL VERIFICATION OF THE COMPLETE SYSTEM
========================================================

Before declaring completion, verify the complete chain:

                 FRONTEND
                     ↓
               NODE BACKEND
                     ↓
                PYTHON ML
                     ↓
             LAYER 1 AUTH
                     ↓
            VERIFICATION EVENT
                     ↓
              LAYER 2 ENGINE
                     ↓
        +------------+------------+
        |            |            |
        v            v            v
     INCIDENT     LOCATION      TRENDS
        |            |            |
        +------------+------------+
                     |
                     v
                    RISK
                     |
                     v
                   ALERT
                     |
                     v
              ADMIN FRONTEND

Every important arrow in this diagram must correspond to an actual implementation.


========================================================
PART 30 — FINAL REPORT
========================================================

After implementation provide:

1. Final architecture
2. Final folder structure
3. Frontend architecture
4. Node backend architecture
5. Python ML architecture
6. Frontend → Node API mapping
7. Node → Python API mapping
8. Layer 1 workflow
9. Layer 2 workflow
10. Database ownership
11. API endpoint list
12. Environment variables
13. Files created
14. Files modified
15. Placeholder implementations replaced
16. Tests performed
17. Exact commands to run all services
18. Frontend URL
19. Node backend URL
20. Python ML URL
21. Remaining limitations

Also update README.md with:

"How to run Kalakriti"

"Kalakriti frontend architecture"

"Kalakriti backend architecture"

"Python ML service"

"Frontend → Node → Python workflow"

"Layer 1 authentication workflow"

"Layer 2 counterfeit intelligence workflow"


========================================================
IMPLEMENTATION ORDER
========================================================

DO NOT IMPLEMENT EVERYTHING AT ONCE.

Use this order:

PHASE 1
Inspect complete Frontend + Backend + Python codebase.

PHASE 2
Produce architecture and gap analysis.

PHASE 3
Create Python ML API around existing authentication engine.

PHASE 4
Connect Node backend to Python ML API.

PHASE 5
Replace placeholder physical matcher.

PHASE 6
Connect product registration frontend.

PHASE 7
Connect verification frontend.

PHASE 8
Persist verification events.

PHASE 9
Implement Layer 2 event processing.

PHASE 10
Connect incidents.

PHASE 11
Connect location/hotspot analytics.

PHASE 12
Connect trends.

PHASE 13
Connect risk.

PHASE 14
Connect alerts.

PHASE 15
Connect investigations.

PHASE 16
Connect admin dashboards.

PHASE 17
Run complete end-to-end tests.

After every phase:

- check TypeScript errors
- check Python errors
- check API errors
- check browser console
- check backend logs
- verify that existing functionality still works


========================================================
FINAL RULE
========================================================

The final product must NOT be:

"Frontend with a backend-looking UI."

It must be a REAL connected system:

REACT FRONTEND
        ↓
REAL NODE / EXPRESS APIs
        ↓
REAL PYTHON AUTHENTICATION ENGINE
        ↓
REAL AUTHENTICATION RESULT
        ↓
REAL VERIFICATION RECORD
        ↓
REAL LAYER 2 COUNTERFEIT INTELLIGENCE
        ↓
REAL INCIDENT / LOCATION / TREND / RISK / ALERT DATA
        ↓
REAL FRONTEND DASHBOARDS

Analyze first.
Plan second.
Implement third.
Test fourth.
Only declare completion after the complete chain works.