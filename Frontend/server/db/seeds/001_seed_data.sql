-- Seed Data: 001_seed_data.sql
-- Seed traditional Indian craft cooperatives, verified master artisans, craft products, and tamper-evident passports.

-- 1. Sample Users (Artisans, Coops, Reviewers, Admins, Buyers)
INSERT INTO users (id, email, role, full_name, phone_number) VALUES
('11111111-1111-1111-1111-111111111111', 'odisha.handicrafts.coop@craftpass.in', 'COOPERATIVE', 'Utkal Craft Producers Cooperative Ltd.', '+91 674 2530190'),
('22222222-2222-2222-2222-222222222222', 'bastarcraft.federation@craftpass.in', 'COOPERATIVE', 'Bastar Dhokra Shilp Samiti', '+91 7782 229100'),
('33333333-3333-3333-3333-333333333333', 'subhadra.mahapatra@craftpass.in', 'ARTISAN', 'Subhadra Mahapatra', '+91 9437 128901'),
('44444444-4444-4444-4444-444444444444', 'rameshwar.baghel@craftpass.in', 'ARTISAN', 'Rameshwar Baghel', '+91 9826 341209'),
('55555555-5555-5555-5555-555555555555', 'kalyani.meher@craftpass.in', 'ARTISAN', 'Kalyani Meher', '+91 9438 567812'),
('66666666-6666-6666-6666-666666666666', 'national.reviewer@craftpass.in', 'REVIEWER', 'Dr. Arindam Sen (GI Registry Evaluator)', '+91 11 23456789'),
('77777777-7777-7777-7777-777777777777', 'admin@craftpass.in', 'ADMIN', 'National Craft Board Administrator', '+91 11 23456700'),
('88888888-8888-8888-8888-888888888888', 'buyer.ananya@gmail.com', 'BUYER', 'Ananya Deshmukh', '+91 9820 112233')
ON CONFLICT (id) DO NOTHING;

-- 2. Cooperatives
INSERT INTO cooperatives (id, name, registration_no, region_state, district, head_artisan_name, verification_status, established_year, member_count) VALUES
('11111111-1111-1111-1111-111111111111', 'Utkal Craft Producers Cooperative Ltd.', 'COOP-OD-1984-092', 'Odisha', 'Puri', 'Brundaban Mahapatra', 'VERIFIED', 1984, 184),
('22222222-2222-2222-2222-222222222222', 'Bastar Dhokra Shilp Samiti', 'COOP-CG-1996-310', 'Chhattisgarh', 'Bastar', 'Ghasiram Kashyap', 'VERIFIED', 1996, 92)
ON CONFLICT (id) DO NOTHING;

-- 3. Artisans
INSERT INTO artisans (id, cooperative_id, craft_specialties, experience_years, region_state, district, cluster_name, preferred_lang, bio, gi_authorized_no, verification_status) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', ARRAY['Pipli Appliqué', 'Chitrakathi Appliqué Tapestries'], 28, 'Odisha', 'Puri', 'Pipli Craft Village', 'or', '4th generation appliqué master certified by the National Craft Board with Geographical Indication (GI) accreditation.', 'GI-OD-PIPLI-0442', 'VERIFIED'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', ARRAY['Dhokra Lost Wax Brass Casting', 'Bastar Bell Metal Statues'], 34, 'Chhattisgarh', 'Bastar', 'Kondagaon Brass Guild', 'hi', 'Presidential Awardee for authentic bell metal cire-perdue technique honoring tribal heritage.', 'GI-CG-DHOKRA-0189', 'VERIFIED'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', ARRAY['Sambalpuri Double Ikat', 'Bandhakala Silk Weaving'], 22, 'Odisha', 'Bargarh', 'Bargarh Handloom Cluster', 'or', 'Master weaver known for complex natural-dyed bandhakala motifs woven on pit looms.', 'GI-OD-IKAT-0812', 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Products
INSERT INTO products (id, product_code, artisan_id, cooperative_id, title, description, craft_type, gi_tag_name, technique, origin_state, origin_district, status) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'CRAFT-OD-2026-00124', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Sacred Lotus Pipli Appliqué Tapestry', 'Hand-stitched temple canopy cloth with 108 lotus petals layered with hand-dyed organic khadi cotton.', 'Appliqué & Needlework', 'Pipli Applique Work (GI-86)', 'Traditional Hand Embroidery & Layered Needlework', 'Odisha', 'Puri', 'ACTIVE'),
('bbbb2222-2222-2222-2222-222222222222', 'CRAFT-CG-2026-00481', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Tribal Ritual Elephant Dhokra Sculpture', 'Single-pour bell metal lost-wax casting crafted with river clay core, pure beeswax threads, and recycled brass.', 'Dhokra Metal Casting', 'Bastar Dhokra (GI-83)', 'Cire Perdue Lost-Wax Brass Casting', 'Chhattisgarh', 'Bastar', 'ACTIVE'),
('cccc3333-3333-3333-3333-333333333333', 'CRAFT-OD-2026-00892', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Sambalpuri Bandha Pure Silk Sari', 'Heritage double ikat silk handwoven over 42 days with natural madder and indigo dye extracts.', 'Sambalpuri Ikat', 'Sambalpuri Bandha Sarees (GI-22)', 'Hand-tied resist warp and weft double ikat', 'Odisha', 'Bargarh', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 5. Digital Passports
INSERT INTO passports (id, product_id, passport_version, status, qr_code_hash, nfc_tag_uid, public_url_slug, latest_event_hash) VALUES
('pass-1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 1, 'ACTIVE', 'qr-hash-pipli-00124-9482f', 'NFC-PIPLI-001', 'passport-craft-od-2026-00124', 'f9a2b8e34c718a2b5e092147db189e32a67bc418a098ef123490abcde8761234'),
('pass-2222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', 1, 'ACTIVE', 'qr-hash-dhokra-00481-8172c', 'NFC-DHOKRA-002', 'passport-craft-cg-2026-00481', '7c81d29fae10984cba654321fedcba9876543210abcdef9876543210abcdef01')
ON CONFLICT (id) DO NOTHING;

-- 6. Initial Provenance Events (Genesis and Verification)
INSERT INTO provenance_events (id, product_id, actor_id, event_type, timestamp, metadata, previous_event_hash, current_event_hash) VALUES
('e1111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PRODUCT_CREATED', NOW() - INTERVAL '12 days', '{"origin": "Pipli Workshop #4", "craft": "Pipli Applique"}', '0000000000000000000000000000000000000000000000000000000000000000', '1a89b72f1092384a56c7d8e9f0123456789abcdef0123456789abcdef0123456'),
('e2222222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'COOPERATIVE_VERIFIED', NOW() - INTERVAL '10 days', '{"inspector": "Brundaban Mahapatra", "gi_match": true}', '1a89b72f1092384a56c7d8e9f0123456789abcdef0123456789abcdef0123456', 'f9a2b8e34c718a2b5e092147db189e32a67bc418a098ef123490abcde8761234')
ON CONFLICT (id) DO NOTHING;
