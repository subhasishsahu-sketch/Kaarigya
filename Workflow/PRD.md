# Kalakriti (Kaarigya) — Product Requirements Document (PRD)

**Document Type:** Product Requirements Document (PRD)
**Project:** Kalakriti / Kaarigya — AI-Enhanced Digital Product Passport & Physical Craft Trust Platform
**Competition Context:** Smart India Hackathon 2026 — Problem Statement S8

---

## 1. Product Overview
Kalakriti is a product-authentication and counterfeit-intelligence platform designed to establish a trusted chain from the Artisan to the Buyer.

The system operates across two functional layers:
*   **Layer 1 — Product Authentication:** Determines whether the scanned physical product matches its registered reference via deterministic on-spot physical authentication.
*   **Layer 2 — Counterfeit Intelligence:** Analyzes suspicious/counterfeit incidents to identify patterns, anomalies, geographic clusters, and risk areas using spatial clustering and anomaly detection.

---

## 2. Actors / User Roles
The platform features a unified, role-gated web interface. A workspace switcher allows users to access specific portals based on their permissions, such as the "Cooperative Guild" workspace accessed via a phone/email login[cite: 20].

| Actor | Main Responsibility |
| :--- | :--- |
| **Artisan** | Registers identity, submits KYC to affiliated cooperative, registers products, records craft stories, and prints physical labels. |
| **Cooperative / Guild** | Verifies artisans belonging to its organization, audits fair wage compensation, reviews regional counterfeit alerts, and manages disputes[cite: 21]. |
| **Buyer / Consumer** | Scans QRs, views the Digital Product Passport (DPP), and authenticates physical products on the spot. |
| **National Registry / Admin** | Maintains the trusted registry and performs higher-level oversight, policy simulation, and enforcement takedowns. |

---

## 3. Artisan Onboarding & Cooperative Verification

### 3.1 Artisan Registration Flow
*   User accesses the Auth Workspace modal.
*   Selects "Register as New Artisan".
*   Inputs: Full Name, Email, Phone, Craft Specialty (e.g., Pipili Appliqué), State, District, and Village/Craft Cluster Name.
*   Submits request, moving profile to PENDING VERIFICATION. An artisan cannot register products merely by creating an account.

### 3.2 Cooperative / Guild Verification
*   The Cooperative Verifier logs in and accesses the "Verification Queue"[cite: 21].
*   They review pending requests and audit cases, such as "Peacock Garden Appliqué Pillow Cover", to ensure authenticity before passport sealing[cite: 22].
*   Verifiers review submitted photographic evidence, including "Finished Craft Overall Inspection" and "In-Progress Work" photos[cite: 22].
*   The system provides "Artisan Provenance Signals", explicitly indicating if the location is consistent with registered data[cite: 22].
*   **Approve:** Status changes to VERIFIED. The system generates a permanent Kalakriti Artisan ID (e.g., KAL-ART-44444). Product registration is unlocked.
*   **Reject:** Status changes to REJECTED. Product registration remains blocked.

---

## 4. Product Registration Workflow (7-Step Wizard)

Only a verified artisan holding a valid Kalakriti Artisan ID can register a product. Clicking "+ Register a Product" initiates a 7-step wizard[cite: 14].

*   **Step 1: Basic Information:** Input Product Name, Select Craft Category, Input Product Type/Utility, and Description.
*   **Step 2: Materials & Technique:** Select Raw Materials from toggle pills and input Primary Technique.
*   **Step 3: Duration & Fair Trade Pricing:** Input Total Crafting Duration and Retail Fair Trade Price.
*   **Step 4: Artisan Voice Story:** Record or upload a short audio story detailing the cultural significance of the craft.
*   **Step 5: Live Creation Provenance:** A consent-based location privacy module captures the GPS coordinates of the workshop. Exact coordinates are never displayed to buyers.
*   **Step 6: Craft Story & Benchwork Evidence:** Upload "Making Video" and benchmark photos (Craft Process Photo and Maker's Mark Photo).

**Step 7: Physical Registration Workflow (QR & ROI Capture)**
This final step physically anchors the digital passport to the real-world item.
*   **Initiate & Generate:** The system displays a "Product Summary" (Name, Category, Artisan, Location) and requires the artisan to click "Generate Product ID & Printable Label"[cite: 14].
*   **Print & Paste (Step 1 of 3):** The system generates a printable authentication label featuring the Kalakriti branding, a unique 7-character Product ID (e.g., `TBEG2FK`), a 2D QR code, and a high-contrast physical ROI bounding box[cite: 15]. The artisan must download or print the label and paste it securely onto the craft item[cite: 15].
*   **Dual Scan Required (Step 2 of 2):**
    *   **Step A (Scan Printed QR Code):** The artisan points the camera at the physical QR label on the craft piece to auto-detect and verify it matches the assigned Product ID[cite: 16].
    *   **Step B (Capture ROI Texture):** Once the QR is verified, the artisan frames the craft's weave, stitching, or texture close-up within the camera boundary and taps "Capture ROI & Register in Database"[cite: 17]. Both the QR and ROI are strictly required to prevent automatic rejection[cite: 16, 17].
*   **Registration Success:** The system confirms the product is "Registered & Signed" and "Database Persisted"[cite: 18]. It displays checkmarks confirming "Physical QR Verified" and "Physical ROI Captured", noting the texture is bound to the product identity and signed with a 2048-bit RSA key[cite: 18].

---

## 5. Buyer Discovery & Physical Authentication

### 5.1 Public Discovery Page
*   The landing page allows buyers to search by ID or click "Scan QR Code".
*   Displays a Digital Product Passport preview card showing the GI Tag, Master Artisan, Made In location, Artisan Earnings percentage, and a Trust Score.

### 5.2 Layer 1 Physical Authentication
*   **QR Scan Modal:** Buyers access an instant authenticity & provenance lookup modal where they can use their device camera or upload a QR image[cite: 19].
*   **Test Environments:** The modal provides "Quick Demo Test Codes" (e.g., CRAFT-00124 for authentic items, or CRAFT-00999 for a flagged copy) to simulate the scan experience[cite: 19].
*   **Authentication Engine:** The system extracts the 7-character ID, queries the database for the exact reference image, and compares the live captured ROI image to the reference image using geometric and textural thresholds.
*   **Results:**
    *   **Authentic:** Physical evidence satisfies conditions.
    *   **Insufficient Evidence:** Poor lighting or blur prompts a recapture. (Insufficient evidence ≠ counterfeit).
    *   **Suspicious / Counterfeit:** Evidence fails to match; triggers an incident in Layer 2.

---

## 6. Cooperative Operations & Layer 2 Intelligence

The Cooperative Hub provides an overview of operations, ensuring transparent compensation and intelligence monitoring. 

### 6.1 Operations Overview
*   The dashboard displays real-time metrics including total catalogued products (e.g., 1,240), passports sealed (e.g., 1,102), suspicious anomaly alerts (e.g., 46), active guild members, and direct disbursed compensation (e.g., ₹12.4 Lakh)[cite: 21].
*   Cooperatives can view specific wage escrow percentages (e.g., 65%) tied to individual audit cases before finalizing passport verification[cite: 22].

### 6.2 Counterfeit Intelligence & Geographic Surveillance
When Layer 1 produces a Suspicious result, an incident is created and mapped.
*   **Geospatial Counterfeit Radar:** A pan-India map visualizes where counterfeits have been found, physical seizures, industrial imitation mills, and provenance distance offsets from registered GI clusters[cite: 23].
*   **Surveillance Metrics:** The system tracks high-risk alerts, medium-risk anomalies, resolved takedowns, total units intercepted (e.g., 2,245 units), and the maximum displacement offset (e.g., 1488 km)[cite: 23].
*   **Map Controls:** Users can filter the map to view "All Incident Nodes", "High Risk Seizures", "Industrial Mills & Foundries", or view density heatmaps[cite: 23].
*   **Enforcement Actions:** Authorized users can click "Dispatch GI Enforcement Notice" directly from flagged incident dockets (e.g., a listing mapped to Surat, Gujarat with an 87% Anomaly Risk)[cite: 23].

---

## 7. Critical Product Rules & Acceptance Criteria

*   **Rule 1 — Unverified Registration Block:** Unverified artisans cannot register products.
*   **Rule 2 — Exact Resolution:** Every QR must map to its exact registered product. No fallback to a default product is permitted.
*   **Rule 3 — Layer Isolation:** Location clustering, Anomaly Risk percentages, and Layer 2 intelligence must never modify the Layer 1 physical authentication result.
*   **Rule 4 — Distinction of States:** The system must distinctly separate AUTHENTIC, SUSPICIOUS, and INSUFFICIENT EVIDENCE.
*   **Rule 5 — Cooperative Scope Enforced:** A cooperative can verify and manage compensation only for artisans belonging to that specific cooperative.