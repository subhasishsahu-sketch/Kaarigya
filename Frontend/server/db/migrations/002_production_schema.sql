-- Migration 002: Kaarigya Production Schema (v1.0)
-- Based on: Workflow/Data Base.md
-- Replaces the old flat-table schema from migration 001.
-- Run AFTER 001_initial_schema.sql only if upgrading, OR run standalone on a fresh DB.

BEGIN;

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- PostGIS is optional; skip gracefully if not installed
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "postgis";
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'PostGIS extension not available — geospatial columns will remain type TEXT. Install PostGIS to enable spatial queries.';
END;
$$;

-- ─────────────────────────────────────────────
-- DOMAIN SCHEMAS
-- ─────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS trust;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS authentication;
CREATE SCHEMA IF NOT EXISTS intelligence;
CREATE SCHEMA IF NOT EXISTS audit;

-- ─────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────

-- Identity
DO $$ BEGIN CREATE TYPE identity.user_status AS ENUM ('ACTIVE','SUSPENDED','DEACTIVATED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trust
DO $$ BEGIN CREATE TYPE trust.verification_status AS ENUM ('PENDING','VERIFIED','REJECTED','REVOKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Catalog
DO $$ BEGIN CREATE TYPE catalog.product_status AS ENUM ('DRAFT','REGISTERED','ARCHIVED','FLAGGED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE catalog.roi_feature_type AS ENUM ('KEYPOINT_RICH','LOW_FEATURE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE catalog.qr_status AS ENUM ('PENDING_ACTIVATION','ACTIVE','REVOKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Authentication
DO $$ BEGIN CREATE TYPE authentication.scan_decision AS ENUM ('AUTHENTIC','SUSPICIOUS','INSUFFICIENT_EVIDENCE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Intelligence
DO $$ BEGIN CREATE TYPE intelligence.incident_type AS ENUM ('TEXTURE_MISMATCH','QR_CLONE_DETECTED','UNREGISTERED_TAG'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE intelligence.location_source AS ENUM ('USER_PROVIDED','IP_ESTIMATED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE intelligence.risk_level AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
-- IDENTITY SCHEMA
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS identity.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'BUYER',
    full_name TEXT NOT NULL,
    status identity.user_status NOT NULL DEFAULT 'ACTIVE',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS identity.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS identity.user_roles (
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE RESTRICT,
    role_id UUID NOT NULL REFERENCES identity.roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS identity.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    refresh_token_hash CHAR(64) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ─────────────────────────────────────────────
-- TRUST SCHEMA
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trust.cooperative_guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    head_artisan_name TEXT,
    established_year INT,
    member_count INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS trust.artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES identity.users(id) ON DELETE RESTRICT,
    cooperative_id UUID REFERENCES trust.cooperative_guilds(id) ON DELETE RESTRICT,
    kalakriti_artisan_id VARCHAR(30) UNIQUE,
    full_name TEXT NOT NULL,
    craft_specialties TEXT[] NOT NULL DEFAULT '{}',
    craft_specialty TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    craft_village TEXT,
    gi_authorized_no TEXT,
    experience_years INT DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    preferred_lang VARCHAR(5) DEFAULT 'en',
    verification_status trust.verification_status NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_artisan_verified_id CHECK (
        (verification_status = 'VERIFIED' AND kalakriti_artisan_id IS NOT NULL) OR
        (verification_status != 'VERIFIED')
    )
);

CREATE TABLE IF NOT EXISTS trust.artisan_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES trust.artisans(id) ON DELETE RESTRICT,
    cooperative_id UUID NOT NULL REFERENCES trust.cooperative_guilds(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    left_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS trust.verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES trust.artisans(id) ON DELETE RESTRICT,
    cooperative_id UUID NOT NULL REFERENCES trust.cooperative_guilds(id) ON DELETE RESTRICT,
    status trust.verification_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    reviewed_at TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- CATALOG SCHEMA
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog.craft_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS catalog.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(7) UNIQUE NOT NULL,
    product_code VARCHAR(40) UNIQUE NOT NULL,
    artisan_id UUID NOT NULL REFERENCES trust.artisans(id) ON DELETE RESTRICT,
    cooperative_id UUID REFERENCES trust.cooperative_guilds(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    craft_type TEXT NOT NULL,
    gi_tag_name TEXT,
    technique TEXT,
    origin_state TEXT NOT NULL,
    origin_district TEXT NOT NULL,
    creation_date DATE,
    weight_grams NUMERIC(8,2),
    status catalog.product_status NOT NULL DEFAULT 'DRAFT',
    verification_url TEXT,
    qr_code_data_url TEXT,
    fingerprint_image_data_url TEXT,
    primary_image_url TEXT,
    process_video_url TEXT,
    process_video_status VARCHAR(20),
    process_video_duration INT,
    manifest_hash CHAR(64),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_product_id_format CHECK (product_id ~ '^[A-Z0-9]{7}$')
);

CREATE TABLE IF NOT EXISTS catalog.product_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    source TEXT,
    organic_cert TEXT,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS catalog.product_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    uploaded_by UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    evidence_type TEXT NOT NULL,
    label TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_hash CHAR(64) NOT NULL,
    geo_lat NUMERIC(9,6),
    geo_lng NUMERIC(9,6),
    geo_tag_label TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS catalog.product_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID UNIQUE NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    cluster_name TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    geo_lat NUMERIC(9,6),
    geo_lng NUMERIC(9,6),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS catalog.roi_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID UNIQUE NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    feature_type catalog.roi_feature_type NOT NULL DEFAULT 'KEYPOINT_RICH',
    x_min_norm NUMERIC(6,5),
    y_min_norm NUMERIC(6,5),
    width_norm NUMERIC(6,5),
    height_norm NUMERIC(6,5),
    descriptor_matrix BYTEA,
    spectral_histogram JSONB,
    algorithm_version VARCHAR(30) NOT NULL DEFAULT 'v1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS catalog.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id VARCHAR(7) UNIQUE NOT NULL,
    product_id UUID UNIQUE NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    status catalog.qr_status NOT NULL DEFAULT 'PENDING_ACTIVATION',
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_qr_id_format CHECK (qr_id ~ '^[A-Z0-9]{7}$')
);

CREATE TABLE IF NOT EXISTS catalog.qr_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID UNIQUE NOT NULL REFERENCES catalog.qr_codes(id) ON DELETE RESTRICT,
    manifest_data JSONB NOT NULL,
    manifest_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ─────────────────────────────────────────────
-- AUTHENTICATION SCHEMA (Layer 1)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS authentication.authentication_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_qr_id VARCHAR(7),
    product_id UUID REFERENCES catalog.products(id) ON DELETE RESTRICT,
    decision authentication.scan_decision NOT NULL,
    physical_similarity NUMERIC(5,2),
    scan_notes TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS authentication.verification_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID UNIQUE NOT NULL REFERENCES authentication.authentication_scans(id) ON DELETE CASCADE,
    ransac_inliers INT,
    inlier_ratio NUMERIC(5,4),
    reprojection_error NUMERIC(8,4),
    ssim_score NUMERIC(5,4),
    gradient_similarity NUMERIC(5,4),
    ncc_score NUMERIC(5,4),
    physical_similarity NUMERIC(5,2) NOT NULL DEFAULT 0,
    hard_threshold_passed BOOLEAN NOT NULL DEFAULT FALSE,
    ml_probability NUMERIC(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ─────────────────────────────────────────────
-- INTELLIGENCE SCHEMA (Layer 2)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS intelligence.counterfeit_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID UNIQUE REFERENCES authentication.authentication_scans(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES catalog.products(id) ON DELETE RESTRICT,
    incident_type intelligence.incident_type NOT NULL DEFAULT 'TEXTURE_MISMATCH',
    geo_lat NUMERIC(9,6),
    geo_lng NUMERIC(9,6),
    location_source intelligence.location_source,
    risk_level intelligence.risk_level NOT NULL DEFAULT 'MEDIUM',
    ai_risk_score NUMERIC(4,3) DEFAULT 0,
    detected_reasons TEXT[] DEFAULT '{}',
    evidence_payload JSONB DEFAULT '{}',
    human_review_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reviewer_id UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS intelligence.incident_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID UNIQUE NOT NULL REFERENCES intelligence.counterfeit_incidents(id) ON DELETE CASCADE,
    scan_velocity_1h INT NOT NULL DEFAULT 1,
    device_diversity_ratio NUMERIC(4,3) NOT NULL DEFAULT 1.0,
    similarity_deficit NUMERIC(5,2) NOT NULL DEFAULT 0,
    isolation_forest_anomaly_score NUMERIC(6,5),
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS intelligence.clustering_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eps_km NUMERIC(6,2) NOT NULL DEFAULT 50.00,
    min_samples INT NOT NULL DEFAULT 3,
    total_clusters_found INT NOT NULL DEFAULT 0,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS intelligence.risk_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clustering_run_id UUID NOT NULL REFERENCES intelligence.clustering_runs(id) ON DELETE CASCADE,
    cluster_index INT NOT NULL,
    centroid_lat NUMERIC(9,6),
    centroid_lng NUMERIC(9,6),
    incident_count INT NOT NULL DEFAULT 0,
    composite_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    risk_level intelligence.risk_level NOT NULL DEFAULT 'LOW',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS intelligence.risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_area_id UUID REFERENCES intelligence.risk_areas(id) ON DELETE CASCADE,
    alert_title TEXT NOT NULL,
    alert_details JSONB NOT NULL DEFAULT '{}',
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ─────────────────────────────────────────────
-- AUDIT SCHEMA
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS audit.provenance_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES catalog.products(id) ON DELETE RESTRICT,
    event_name VARCHAR(60) NOT NULL,
    actor_id UUID REFERENCES identity.users(id) ON DELETE RESTRICT,
    actor_name TEXT,
    actor_role VARCHAR(20),
    event_payload JSONB NOT NULL DEFAULT '{}',
    previous_entry_hash CHAR(64) NOT NULL,
    entry_hash CHAR(64) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Immutability trigger on provenance ledger
CREATE OR REPLACE FUNCTION audit.prevent_ledger_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Modifications or deletions to audit.provenance_ledger are strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_provenance_ledger ON audit.provenance_ledger;
CREATE TRIGGER trg_protect_provenance_ledger
  BEFORE UPDATE OR DELETE ON audit.provenance_ledger
  FOR EACH ROW EXECUTE FUNCTION audit.prevent_ledger_tampering();

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

-- QR fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_codes_active_lookup ON catalog.qr_codes (qr_id) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_qr_codes_product_id ON catalog.qr_codes (product_id);

-- Product lookups
CREATE INDEX IF NOT EXISTS idx_products_product_id ON catalog.products (product_id);
CREATE INDEX IF NOT EXISTS idx_products_artisan_id ON catalog.products (artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON catalog.products (status);

-- ROI fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_roi_fingerprints_product ON catalog.roi_fingerprints (product_id);

-- Evidence lookups
CREATE INDEX IF NOT EXISTS idx_evidence_product_id ON catalog.product_evidence (product_id);

-- Verification queue
CREATE INDEX IF NOT EXISTS idx_verification_requests_queue ON trust.verification_requests (cooperative_id, status) WHERE status = 'PENDING';

-- Artisan lookups
CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON trust.artisans (user_id);
CREATE INDEX IF NOT EXISTS idx_artisans_kalakriti_id ON trust.artisans (kalakriti_artisan_id);

-- Authentication scans
CREATE INDEX IF NOT EXISTS idx_auth_scans_product_id ON authentication.authentication_scans (product_id);
CREATE INDEX IF NOT EXISTS idx_auth_scans_started_at ON authentication.authentication_scans (started_at DESC);

-- Intelligence
CREATE INDEX IF NOT EXISTS idx_incidents_product_id ON intelligence.counterfeit_incidents (product_id);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON intelligence.counterfeit_incidents (reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_review_status ON intelligence.counterfeit_incidents (human_review_status);

-- Provenance
CREATE INDEX IF NOT EXISTS idx_provenance_product_chronological ON audit.provenance_ledger (product_id, recorded_at ASC);

COMMIT;
