-- Migration: 001_initial_schema.sql
-- S8 Traditional Craft Digital Passport & Trust Platform Schema
-- PostgreSQL + pgvector + Row Level Security

-- Enable UUID and pgvector extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable vector if available in pg environment
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgvector extension not installed in environment, proceeding without vector datatype';
END $$;

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('ARTISAN', 'BUYER', 'COOPERATIVE', 'REVIEWER', 'ADMIN');
CREATE TYPE artisan_verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE coop_verification_status AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED');
CREATE TYPE product_status AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'ACTIVE', 'SOLD', 'DISPUTED', 'ARCHIVED');
CREATE TYPE evidence_type AS ENUM ('WORKSHOP_PHOTO', 'PROCESS_VIDEO', 'RAW_MATERIAL_SLIP', 'AUDIO_TESTIMONY', 'GI_CERTIFICATE');
CREATE TYPE passport_status AS ENUM ('ACTIVE', 'FLAGGED', 'REVOKED');
CREATE TYPE passport_tag_type AS ENUM ('QR_PRINT', 'NFC_STICKER', 'TAMPER_SEAL');
CREATE TYPE verifier_role AS ENUM ('COOPERATIVE', 'REVIEWER', 'ADMIN');
CREATE TYPE verification_decision AS ENUM ('APPROVED', 'REJECTED', 'NEEDS_INFO');
CREATE TYPE provenance_event_type AS ENUM (
  'PRODUCT_CREATED',
  'PASSPORT_CREATED',
  'ARTISAN_VERIFIED',
  'COOPERATIVE_VERIFIED',
  'EVIDENCE_ADDED',
  'PRODUCT_VERIFIED',
  'PRODUCT_SOLD',
  'OWNERSHIP_TRANSFERRED',
  'COUNTERFEIT_FLAGGED',
  'COUNTERFEIT_REVIEWED',
  'DISPUTE_CREATED',
  'DISPUTE_RESOLVED'
);
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE fraud_review_status AS ENUM ('PENDING', 'CONFIRMED_COUNTERFEIT', 'FALSE_POSITIVE', 'RESOLVED');
CREATE TYPE payout_status AS ENUM ('PENDING', 'ESCROWED', 'DISBURSED', 'DISPUTED');
CREATE TYPE dispute_reason AS ENUM ('COUNTERFEIT_CLAIM', 'MATERIAL_MISMATCH', 'COMPENSATION_UNPAID', 'UNAUTHORIZED_LISTING');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED_VALID', 'RESOLVED_REJECTED');
CREATE TYPE transfer_type AS ENUM ('PRIMARY_SALE', 'SECONDARY_TRANSFER', 'GIFT');
CREATE TYPE notification_type AS ENUM ('VERIFICATION_UPDATE', 'FRAUD_ALERT', 'PAYOUT_READY', 'DISPUTE_UPDATE');

-- 2. USERS TABLE (Linked to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'BUYER',
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(32),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COOPERATIVES TABLE
CREATE TABLE IF NOT EXISTS cooperatives (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  registration_no VARCHAR(100) UNIQUE,
  region_state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  head_artisan_name VARCHAR(255),
  verification_status coop_verification_status DEFAULT 'VERIFIED',
  bank_account_hash VARCHAR(64),
  established_year INT,
  member_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ARTISANS TABLE
CREATE TABLE IF NOT EXISTS artisans (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE SET NULL,
  craft_specialties TEXT[] NOT NULL DEFAULT '{}',
  experience_years INT DEFAULT 0,
  region_state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  cluster_name VARCHAR(255),
  preferred_lang VARCHAR(10) DEFAULT 'hi',
  bio TEXT,
  avatar_url TEXT,
  gi_authorized_no VARCHAR(100),
  verification_status artisan_verification_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code VARCHAR(64) UNIQUE NOT NULL,
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE RESTRICT,
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  craft_type VARCHAR(100) NOT NULL,
  gi_tag_name VARCHAR(150),
  technique VARCHAR(255) NOT NULL,
  origin_state VARCHAR(100) NOT NULL,
  origin_district VARCHAR(100) NOT NULL,
  creation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dimensions JSONB,
  weight_grams INT,
  status product_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCT MATERIALS TABLE
CREATE TABLE IF NOT EXISTS product_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  source VARCHAR(255) NOT NULL,
  organic_cert VARCHAR(100),
  percentage NUMERIC(5,2) DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCT EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS product_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  evidence_type evidence_type NOT NULL,
  label VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  geo_lat NUMERIC(9,6),
  geo_lng NUMERIC(9,6),
  geo_tag_label VARCHAR(255),
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DIGITAL PASSPORTS TABLE
CREATE TABLE IF NOT EXISTS passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  passport_version INT DEFAULT 1,
  status passport_status DEFAULT 'ACTIVE',
  qr_code_hash VARCHAR(64) UNIQUE NOT NULL,
  nfc_tag_uid VARCHAR(64) UNIQUE,
  public_url_slug VARCHAR(100) UNIQUE NOT NULL,
  latest_event_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PASSPORT PHYSICAL TAGS
CREATE TABLE IF NOT EXISTS passport_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id UUID NOT NULL REFERENCES passports(id) ON DELETE CASCADE,
  tag_type passport_tag_type NOT NULL,
  physical_serial_no VARCHAR(100) UNIQUE NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  is_revoked BOOLEAN DEFAULT FALSE
);

-- 10. VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  verifier_id UUID NOT NULL REFERENCES users(id),
  verifier_role verifier_role NOT NULL,
  status verification_decision NOT NULL,
  notes TEXT,
  checklist_results JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TRUST SCORES TABLE
CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  composite_score NUMERIC(3,2) NOT NULL,
  artisan_factor NUMERIC(3,2) NOT NULL,
  coop_factor NUMERIC(3,2) NOT NULL,
  evidence_factor NUMERIC(3,2) NOT NULL,
  provenance_factor NUMERIC(3,2) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PROVENANCE EVENTS TABLE (Append-Only Cryptographic Chain)
CREATE TABLE IF NOT EXISTS provenance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id),
  event_type provenance_event_type NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  previous_event_hash VARCHAR(64) NOT NULL,
  current_event_hash VARCHAR(64) NOT NULL
);

-- 13. MARKETPLACE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(100) NOT NULL,
  external_url TEXT NOT NULL,
  claimed_seller_name VARCHAR(255) NOT NULL,
  scraped_title VARCHAR(255) NOT NULL,
  scraped_description TEXT,
  scraped_price NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'INR',
  scraped_images TEXT[] DEFAULT '{}',
  claimed_passport_id UUID REFERENCES passports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. FRAUD ALERTS TABLE (Human Review Queue)
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ai_risk_score NUMERIC(3,2) NOT NULL,
  ai_risk_level risk_level NOT NULL,
  detected_reasons TEXT[] NOT NULL DEFAULT '{}',
  evidence_payload JSONB NOT NULL DEFAULT '{}',
  human_review_status fraud_review_status DEFAULT 'PENDING',
  reviewer_id UUID REFERENCES users(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. COMPENSATION RECORDS TABLE
CREATE TABLE IF NOT EXISTS compensation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  gross_sale_amount NUMERIC(10,2) NOT NULL,
  artisan_payout NUMERIC(10,2) NOT NULL,
  cooperative_fee NUMERIC(10,2) NOT NULL,
  logistics_materials NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payout_status payout_status DEFAULT 'PENDING',
  disbursement_tx_id VARCHAR(128),
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  initiator_id UUID NOT NULL REFERENCES users(id),
  reason dispute_reason NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status dispute_status DEFAULT 'OPEN',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. OWNERSHIP TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS ownership_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  transfer_type transfer_type NOT NULL,
  transfer_date TIMESTAMPTZ DEFAULT NOW(),
  transfer_hash VARCHAR(64) NOT NULL
);

-- 18. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE & RAPID LOOKUPS
CREATE INDEX IF NOT EXISTS idx_products_artisan ON products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_passports_slug ON passports(public_url_slug);
CREATE INDEX IF NOT EXISTS idx_passports_qr ON passports(qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_provenance_product ON provenance_events(product_id);
CREATE INDEX IF NOT EXISTS idx_provenance_time ON provenance_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_fraud_status ON fraud_alerts(human_review_status);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE provenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Public read for verified passports and products
CREATE POLICY "Public can read active passports" ON passports FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (status IN ('ACTIVE', 'VERIFIED', 'SOLD'));
CREATE POLICY "Public can read provenance events" ON provenance_events FOR SELECT USING (true);
