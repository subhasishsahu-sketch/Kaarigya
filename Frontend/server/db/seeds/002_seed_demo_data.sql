-- Seed: 002_seed_demo_data.sql
-- Inserts the demo cooperative, artisans, users and one product used throughout the Kaarigya demo.
-- Run AFTER migration 002_production_schema.sql

BEGIN;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
INSERT INTO identity.users (id, email, password_hash, role, full_name, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'odisha.handicrafts.coop@craftpass.in', '$2b$10$seed_hash_coop1', 'COOPERATIVE', 'Utkal Craft Producers Cooperative Ltd.', 'ACTIVE'),
  ('22222222-2222-2222-2222-222222222222', 'bastarcraft.federation@craftpass.in',   '$2b$10$seed_hash_coop2', 'COOPERATIVE', 'Bastar Dhokra Shilp Samiti', 'ACTIVE'),
  ('33333333-3333-3333-3333-333333333333', 'subhadra.mahapatra@craftpass.in',       '$2b$10$seed_hash_art1',  'ARTISAN',      'Subhadra Mahapatra', 'ACTIVE'),
  ('44444444-4444-4444-4444-444444444444', 'rameshwar.baghel@craftpass.in',         '$2b$10$seed_hash_art2',  'ARTISAN',      'Rameshwar Baghel', 'ACTIVE'),
  ('55555555-5555-5555-5555-555555555555', 'kalyani.meher@craftpass.in',            '$2b$10$seed_hash_art3',  'ARTISAN',      'Kalyani Meher', 'ACTIVE'),
  ('66666666-6666-6666-6666-666666666666', 'reviewer@craftpass.in',                 '$2b$10$seed_hash_rev1',  'REVIEWER',     'Dr. Arindam Sen (GI Registry Evaluator)', 'ACTIVE'),
  ('77777777-7777-7777-7777-777777777777', 'admin@craftpass.in',                    '$2b$10$seed_hash_adm1',  'ADMIN',        'National Craft Board Administrator', 'ACTIVE'),
  ('88888888-8888-8888-8888-888888888888', 'buyer.ananya@gmail.com',                '$2b$10$seed_hash_buy1',  'BUYER',        'Ananya Deshmukh', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- COOPERATIVES
-- ─────────────────────────────────────────────
INSERT INTO trust.cooperative_guilds (id, name, registration_number, state, district, head_artisan_name, established_year, member_count)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Utkal Craft Producers Cooperative Ltd.', 'COOP-OD-1984-092', 'Odisha',        'Puri',   'Brundaban Mahapatra', 1984, 184),
  ('22222222-2222-2222-2222-222222222222', 'Bastar Dhokra Shilp Samiti',            'COOP-CG-1996-310', 'Chhattisgarh', 'Bastar', 'Ghasiram Kashyap',    1996,  92)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- ARTISANS
-- ─────────────────────────────────────────────
INSERT INTO trust.artisans (id, user_id, cooperative_id, kalakriti_artisan_id, full_name, craft_specialties, craft_specialty, state, district, craft_village, gi_authorized_no, experience_years, verification_status, verified_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'KAL-ART-33333', 'Subhadra Mahapatra', ARRAY['Pipli Appliqué','Chitrakathi Appliqué Tapestries'], 'Pipli Appliqué', 'Odisha', 'Puri', 'Pipli Craft Village', 'GI-OD-PIPLI-0442', 28, 'VERIFIED', NOW() - INTERVAL '200 days'),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'KAL-ART-44444', 'Rameshwar Baghel',   ARRAY['Dhokra Lost Wax Brass Casting','Bastar Bell Metal Statues'], 'Dhokra Metal Casting', 'Chhattisgarh', 'Bastar', 'Kondagaon Brass Guild', 'GI-CG-DHOKRA-0189', 34, 'VERIFIED', NOW() - INTERVAL '180 days'),
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'KAL-ART-55555', 'Kalyani Meher',      ARRAY['Sambalpuri Ikat Weaving'], 'Sambalpuri Silk Weaving', 'Odisha', 'Sambalpur', 'Barapali Weaving Cluster', 'GI-OD-SAMBALPUR-0067', 22, 'VERIFIED', NOW() - INTERVAL '150 days')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- CRAFT CATEGORIES
-- ─────────────────────────────────────────────
INSERT INTO catalog.craft_categories (id, code, name, description)
VALUES
  ('cat-00000001-0000-0000-0000-000000000001', 'APPLIQUE_NEEDLEWORK', 'Appliqué & Needlework', 'Traditional appliqué and embroidery textile crafts'),
  ('cat-00000001-0000-0000-0000-000000000002', 'METAL_CASTING',       'Metal Casting',         'Dhokra, bell metal and lost-wax casting techniques'),
  ('cat-00000001-0000-0000-0000-000000000003', 'HANDLOOM_WEAVING',    'Handloom Weaving',      'GI-tagged silk and cotton ikat handloom textiles')
ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────
-- DEMO PRODUCT (Pipli Appliqué Tapestry — CRAFT-00124)
-- ─────────────────────────────────────────────
INSERT INTO catalog.products (
  id, product_id, product_code, artisan_id, cooperative_id,
  title, description, craft_type, gi_tag_name, technique,
  origin_state, origin_district, creation_date, weight_grams,
  status, verification_url, primary_image_url, manifest_hash,
  registered_at
)
VALUES (
  'aaaa1111-1111-1111-1111-111111111111',
  'K7B9X3Q',
  'CRAFT-OD-2026-00124',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Sacred Lotus Pipli Appliqué Tapestry',
  'Hand-stitched temple canopy cloth with 108 lotus petals layered with hand-dyed organic khadi cotton and mirror insets.',
  'Appliqué & Needlework',
  'Pipli Applique Work (GI-86)',
  'Traditional Hand Embroidery & Layered Needlework',
  'Odisha', 'Puri', '2026-02-04', 850,
  'REGISTERED',
  'http://localhost:3001/verify/K7B9X3Q',
  'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  NOW() - INTERVAL '14 days'
) ON CONFLICT (id) DO NOTHING;

-- Evidence photos for demo product
INSERT INTO catalog.product_evidence (product_id, uploaded_by, evidence_type, label, file_url, file_hash, geo_lat, geo_lng, geo_tag_label)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'WORKSHOP_PHOTO', 'Primary Finished Tapestry',
   'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80',
   'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
   19.8135, 85.8312, 'Pipli Master Workshop, Puri District, Odisha'),
  ('aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PROCESS_VIDEO', 'Needlework & Mirror Setting In-Progress',
   'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
   'c4ca4238a0b923820dcc509a6f75849b27ae41e4649b934ca495991b7852b855',
   19.8135, 85.8312, 'Pipli Master Workshop, Puri District, Odisha')
ON CONFLICT DO NOTHING;

-- Materials
INSERT INTO catalog.product_materials (product_id, name, source, percentage)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Organic Handspun Khadi Cotton', 'Odisha Khadi Board, Cuttack', 85),
  ('aaaa1111-1111-1111-1111-111111111111', 'Natural Madder & Turmeric Vegetable Dyes', 'Sambalpur Botanical Extractors', 15)
ON CONFLICT DO NOTHING;

-- QR Code
INSERT INTO catalog.qr_codes (qr_id, product_id, status, activated_at)
VALUES ('K7B9X3Q', 'aaaa1111-1111-1111-1111-111111111111', 'ACTIVE', NOW() - INTERVAL '14 days')
ON CONFLICT (qr_id) DO NOTHING;

-- QR Manifest (SHA-256 tamper evidence, no RSA)
INSERT INTO catalog.qr_manifests (qr_code_id, manifest_data, manifest_hash)
SELECT q.id,
  jsonb_build_object(
    'productId', 'aaaa1111-1111-1111-1111-111111111111',
    'qrId', 'K7B9X3Q',
    'artisanId', '33333333-3333-3333-3333-333333333333',
    'craftType', 'Appliqué & Needlework',
    'registeredAt', NOW() - INTERVAL '14 days'
  ),
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
FROM catalog.qr_codes q
WHERE q.qr_id = 'K7B9X3Q'
ON CONFLICT (qr_code_id) DO NOTHING;

-- Provenance ledger genesis event
INSERT INTO audit.provenance_ledger (product_id, event_name, actor_id, actor_name, actor_role, event_payload, previous_entry_hash, entry_hash)
VALUES (
  'aaaa1111-1111-1111-1111-111111111111',
  'PRODUCT_CREATED',
  '33333333-3333-3333-3333-333333333333',
  'Subhadra Mahapatra',
  'ARTISAN',
  '{"craftType":"Appliqué & Needlework","origin":"Pipli Village, Puri, Odisha"}'::jsonb,
  '0000000000000000000000000000000000000000000000000000000000000000',
  'f9a2b8e34c718a2b5e092147db189e32a67bc418a098ef123490abcde8761234'
);

COMMIT;
