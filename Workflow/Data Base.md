# Kalakriti (Kaarigya) — Backend Database Schema Specification (v1.0-Production)

**Document Type:** Production Database Schema & DDL Specification  
**Target Engine:** PostgreSQL 16+ with PostGIS & pgcrypto Extensions  
**Primary Key Standard:** UUID v4 (`gen_random_uuid()`)  
**Temporal Standard:** `TIMESTAMPTZ` (UTC)  
**Spatial Standard:** EPSG:4326 (`GEOMETRY(Point, 4326)`)  
**Asset Rule:** Large binaries (images, videos, audio) reside in S3-compatible Object Storage; PostgreSQL stores URI keys, metadata, and SHA-256 hashes.  

---

## 1. Schema Initialization & Global Extensions

```sql
-- Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Domain Schemas
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS trust;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS authentication;
CREATE SCHEMA IF NOT EXISTS intelligence;
CREATE SCHEMA IF NOT EXISTS audit;


-- Identity Domain
CREATE TYPE identity.user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- Trust Domain
CREATE TYPE trust.verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'REVOKED');

-- Catalog Domain
CREATE TYPE catalog.product_status AS ENUM ('DRAFT', 'REGISTERED', 'ARCHIVED', 'FLAGGED');
CREATE TYPE catalog.roi_feature_type AS ENUM ('KEYPOINT_RICH', 'LOW_FEATURE');
CREATE TYPE catalog.qr_status AS ENUM ('PENDING_ACTIVATION', 'ACTIVE', 'REVOKED');

-- Authentication (Layer 1) Domain
CREATE TYPE authentication.scan_decision AS ENUM ('AUTHENTIC', 'SUSPICIOUS', 'INSUFFICIENT_EVIDENCE');

-- Intelligence (Layer 2) Domain
CREATE TYPE intelligence.incident_type AS ENUM ('TEXTURE_MISMATCH', 'QR_CLONE_DETECTED', 'UNREGISTERED_TAG');
CREATE TYPE intelligence.location_source AS ENUM ('USER_PROVIDED', 'IP_ESTIMATED');
CREATE TYPE intelligence.risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- 3.1 Users
CREATE TABLE identity.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    status identity.user_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    last_login_at TIMESTAMPTZ
);

-- 3.2 Roles
CREATE TABLE identity.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3.3 User Roles (Many-to-Many Mapping)
CREATE TABLE identity.user_roles (
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE RESTRICT,
    role_id UUID NOT NULL REFERENCES identity.roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (user_id, role_id)
);

-- 3.4 Sessions
CREATE TABLE identity.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    refresh_token_hash CHAR(64) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4.1 Cooperative Guilds
CREATE TABLE trust.cooperative_guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4.2 Artisans Profile
CREATE TABLE trust.artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES identity.users(id) ON DELETE RESTRICT,
    kalakriti_artisan_id VARCHAR(30) UNIQUE,
    full_name TEXT NOT NULL,
    craft_specialty TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    craft_village TEXT,
    verification_status trust.verification_status NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_artisan_verified_id CHECK (
        (verification_status = 'VERIFIED' AND kalakriti_artisan_id IS NOT NULL) OR
        (verification_status != 'VERIFIED')
    )
);

-- 4.3 Artisan Memberships (Affiliation History)
CREATE TABLE trust.artisan_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES trust.artisans(id) ON DELETE RESTRICT,
    cooperative_id UUID NOT NULL REFERENCES trust.cooperative_guilds(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    left_at TIMESTAMPTZ
);

-- 4.4 Verification Requests (Audit Queue)
CREATE TABLE trust.verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES trust.artisans(id) ON DELETE RESTRICT,
    cooperative_id UUID NOT NULL REFERENCES trust.cooperative_guilds(id) ON DELETE RESTRICT,
    status trust.verification_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    reviewed_at TIMESTAMPTZ
);

-- 5.1 Craft Categories
CREATE TABLE catalog.craft_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5.2 Products
CREATE TABLE catalog.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(40) UNIQUE NOT NULL,
    artisan_id UUID NOT NULL REFERENCES trust.artisans(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES catalog.craft_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    status catalog.product_status NOT NULL DEFAULT 'DRAFT',
    crafting_duration_hours NUMERIC(6,1),
    fair_trade_price NUMERIC(12,2),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5.3 Product Creation Location (Provenance Only, Never Layer 1 Input)
CREATE TABLE catalog.product_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID UNIQUE NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    cluster_name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    geom GEOMETRY(Point, 4326),
    gps_accuracy_meters NUMERIC(6,2),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5.4 Product Media Assets
CREATE TABLE catalog.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    media_purpose VARCHAR(40) NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5.5 ROI Micro-Texture Fingerprints
CREATE TABLE catalog.roi_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID UNIQUE NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    media_id UUID NOT NULL REFERENCES catalog.product_media(id) ON DELETE RESTRICT,
    feature_type catalog.roi_feature_type NOT NULL,
    x_min_norm NUMERIC(6,5) NOT NULL,
    y_min_norm NUMERIC(6,5) NOT NULL,
    width_norm NUMERIC(6,5) NOT NULL,
    height_norm NUMERIC(6,5) NOT NULL,
    descriptor_matrix BYTEA,
    spectral_histogram JSONB,
    algorithm_version VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5.6 QR Codes (Strict 7-Character Alphanumeric Identifier)
CREATE TABLE catalog.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id VARCHAR(7) UNIQUE NOT NULL,
    product_id UUID UNIQUE NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    status catalog.qr_status NOT NULL DEFAULT 'PENDING_ACTIVATION',
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_qr_id_format CHECK (qr_id ~ '^[A-Z0-9]{7}$')
);

-- 5.7 QR Integrity Manifests (SHA-256 Tamper-Evidence)
CREATE TABLE catalog.qr_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID UNIQUE NOT NULL REFERENCES catalog.qr_codes(id) ON DELETE RESTRICT,
    manifest_data JSONB NOT NULL,
    manifest_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
); 

-- 6.1 Authentication Scans
CREATE TABLE authentication.authentication_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_qr_id VARCHAR(7) NOT NULL,
    product_id UUID REFERENCES catalog.products(id) ON DELETE RESTRICT,
    decision authentication.scan_decision NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ NOT NULL
);

-- 6.2 Verification Metrics (Deterministic Feature Vector)
CREATE TABLE authentication.verification_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID UNIQUE NOT NULL REFERENCES authentication.authentication_scans(id) ON DELETE CASCADE,
    ransac_inliers INTEGER,
    inlier_ratio NUMERIC(5,4),
    reprojection_error NUMERIC(8,4),
    ssim_score NUMERIC(5,4) NOT NULL,
    gradient_similarity NUMERIC(5,4) NOT NULL,
    ncc_score NUMERIC(5,4),
    physical_similarity NUMERIC(5,2) NOT NULL,
    hard_threshold_passed BOOLEAN NOT NULL,
    ml_probability NUMERIC(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7.1 Counterfeit Incidents
CREATE TABLE intelligence.counterfeit_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID UNIQUE NOT NULL REFERENCES authentication.authentication_scans(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES catalog.products(id) ON DELETE RESTRICT,
    incident_type intelligence.incident_type NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    location_source intelligence.location_source,
    provenance_displacement_km NUMERIC(8,2),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7.2 Incident Tabular Features (Consumed by Isolation Forest)
CREATE TABLE intelligence.incident_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID UNIQUE NOT NULL REFERENCES intelligence.counterfeit_incidents(id) ON DELETE CASCADE,
    scan_velocity_1h INTEGER NOT NULL,
    device_diversity_ratio NUMERIC(4,3) NOT NULL,
    similarity_deficit NUMERIC(5,2) NOT NULL,
    isolation_forest_anomaly_score NUMERIC(6,5),
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7.3 DBSCAN Clustering Runs
CREATE TABLE intelligence.clustering_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eps_km NUMERIC(6,2) NOT NULL DEFAULT 50.00,
    min_samples INTEGER NOT NULL DEFAULT 3,
    total_clusters_found INTEGER NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7.4 Geographic Risk Areas (Map Polygons and Centroids)
CREATE TABLE intelligence.risk_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clustering_run_id UUID NOT NULL REFERENCES intelligence.clustering_runs(id) ON DELETE CASCADE,
    cluster_index INTEGER NOT NULL,
    area_geom GEOMETRY(Polygon, 4326),
    centroid_geom GEOMETRY(Point, 4326) NOT NULL,
    incident_count INTEGER NOT NULL,
    composite_risk_score NUMERIC(5,2) NOT NULL,
    risk_level intelligence.risk_level NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7.5 Risk Alerts (Actionable Dockets)
CREATE TABLE intelligence.risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_area_id UUID REFERENCES intelligence.risk_areas(id) ON DELETE CASCADE,
    alert_title TEXT NOT NULL,
    alert_details JSONB NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 8.1 System Audit Log
CREATE TABLE audit.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 8.2 Product Provenance Ledger (Append-Only Hash Chain)
CREATE TABLE audit.provenance_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    event_name VARCHAR(60) NOT NULL,
    actor_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE RESTRICT,
    event_payload JSONB NOT NULL,
    previous_entry_hash CHAR(64) NOT NULL,
    entry_hash CHAR(64) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Enforce Immutability via Trigger
CREATE OR REPLACE FUNCTION audit.prevent_ledger_tampering()
RETURNS TRIGGER AS $$ BEGIN     RAISE EXCEPTION 'Modifications or deletions to audit.provenance_ledger are strictly prohibited.'; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_provenance_ledger
BEFORE UPDATE OR DELETE ON audit.provenance_ledger
FOR EACH ROW EXECUTE FUNCTION audit.prevent_ledger_tampering();

-- 1. Targeted 1:1 Physical Verification (Lookup in < 15ms)
CREATE UNIQUE INDEX idx_qr_codes_lookup 
ON catalog.qr_codes (qr_id) 
WHERE status = 'ACTIVE';

CREATE INDEX idx_products_artisan_id 
ON catalog.products (artisan_id);

CREATE INDEX idx_roi_fingerprints_product 
ON catalog.roi_fingerprints (product_id);

-- 2. Cooperative Verification Queue
CREATE INDEX idx_verification_requests_queue 
ON trust.verification_requests (cooperative_id, status) 
WHERE status = 'PENDING';

-- 3. Geospatial Indexing (DBSCAN & Counterfeit Radar Queries)
CREATE INDEX idx_incidents_spatial_point 
ON intelligence.counterfeit_incidents 
USING GIST (location_geom);

CREATE INDEX idx_risk_areas_centroid 
ON intelligence.risk_areas 
USING GIST (centroid_geom);

CREATE INDEX idx_risk_areas_polygon 
ON intelligence.risk_areas 
USING GIST (area_geom);

-- 4. Audit & Provenance Ledger Lookups
CREATE INDEX idx_provenance_product_chronological 
ON audit.provenance_ledger (product_id, recorded_at ASC);
