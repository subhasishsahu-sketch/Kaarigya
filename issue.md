# Kalakriti Diagnosed Issues & Resolutions

This document logs all identified issues across the frontend React SPA, Node/Express middleware, and Python ML service layers.

---

## 1. Resolved Issues

### 🔍 Missing Root Route & 404 Error
* **Issue**: Hitting `http://127.0.0.1:8000/` returned `{"detail":"Not Found"}`.
* **Impact**: External integration tests failed when checking basic root reachability.
* **Resolution**: Added a landing page endpoint (`GET /`) rendering an interactive HTML dashboard that documents all backend endpoints and interactive Swagger `/docs`.

### 🔒 Unprotected Workspace Role Switching
* **Issue**: Public buyers could switch to "Artisan Portal", "Cooperative Guild", or "National Registry" via the header workspace selector, gaining immediate entry into private views.
* **Impact**: Total lack of authorization boundaries for mock accounts.
* **Resolution**: Introduced a secure authentication gating system (`AuthModal.tsx` + `AppContext` session tracking). Gated all private views in `App.tsx` behind session validation gates.

### 🔌 Missing Frontend Package Dependencies
* **Issue**: Starting the Node/Express server (`npm run dev`) failed with:
  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'cors' imported from server.ts
  ```
* **Impact**: Blocked frontend development.
* **Resolution**: Installed `cors` and `@types/cors` dependencies to align the local `node_modules` structure.

### 🌐 Broken Virtual Environment Link
* **Issue**: Executing `.venv\Scripts\python.exe` threw path errors referencing an absolute directory for another user profile (`subha`).
* **Impact**: Running virtualenv Python commands failed.
* **Resolution**: Resolved by invoking the global `python` interpreter inside the local `SIH_Env` conda environment (`conda run -n SIH_Env`).

### 📊 Missing Environment Configuration File
* **Issue**: The `Frontend` directory was missing a `.env` file, meaning environment parameters default to code-defined values.
* **Resolution**: Created a local [`Frontend/.env`](file:///c:/Users/swaya/Desktop/Kalakriti_full/Frontend/.env) file from the `.env.example` blueprint to structuredly support future Supabase integration credentials and local port configurations.

### ⚡ Socket Bind Collisions (WinError 10048)
* **Issue**: Starting the Python API locally while a background daemon process was active on port `8000` resulted in socket binding exceptions.
* **Resolution**: Stopped the background agent tasks holding onto port `8000`, freeing the socket resource so you can start, restart, and debug uvicorn commands in your terminal without collision warnings.

### 🌐 Language Switching Did Not Propagate to All Pages
* **Issue**: Changing the language from the header dropdown only updated the `Header` nav labels. All page bodies (artisan, cooperative, buyer pages) remained in English.
* **Root Causes (multiple)**:
  1. **Missing `t` destructure**: `CooperativeDashboard`, `CompensationDashboard`, `CounterfeitIntelligence`, `ArtisanManagement`, `ArtisanProfileView`, `ArtisanProductList`, `VerificationQueue`, `Footer`, and `PublicVerificationPage` never pulled `t` out of `useApp()`, so they could never access translations at all.
  2. **Mobile menu hardcoded strings**: `Header.tsx`'s mobile drawer used raw English strings (`"Dashboard"`, `"Overview"`, `"Verification Queue"`, `"Counterfeit Alerts"`, `"Compensation"`) instead of `t.*` keys, unlike the desktop nav which was already using translations.
  3. **Crash in `NationalAdminDashboard`**: Destructured non-existent `setSelectedProduct` from `useApp()` context — this key doesn't exist in `AppContextType`, which would cause a TypeScript/runtime error.
* **Resolution**: 
  - Added `t` to `useApp()` destructuring in all 9 affected components.
  - Replaced hardcoded English strings with `t.*` keys throughout page headers, nav labels, table headers, and status badges.
  - Fixed `NationalAdminDashboard` to remove `setSelectedProduct` (which is a local state in `VerificationQueue`, not a context value) and use `t` instead.
