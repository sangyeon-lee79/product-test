-- 068: 영양제 시드 확장 — 한국 브랜드(묘견서, Dr.Ray) + 글로벌 17종
-- 기존 059_supplement_catalog.sql 패턴 동일

-- ===== 1. MANUFACTURERS (11 신규) =====
INSERT INTO feed_manufacturers (id, key, name_key, name_ko, name_en, country, status, sort_order, category_type, created_at, updated_at)
VALUES
  ('b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5', 'myogyeonseo',        'supplement.manufacturer.myogyeonseo',        '묘견서',           'Myogyeonseo',           'KR', 'active', 110, 'supplement', NOW(), NOW()),
  ('b0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'dr_ray',             'supplement.manufacturer.dr_ray',             'Dr.Ray',          'Dr.Ray',                'KR', 'active', 111, 'supplement', NOW(), NOW()),
  ('b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'boehringer_ingelheim','supplement.manufacturer.boehringer_ingelheim','베링거인겔하임',    'Boehringer Ingelheim',  'DE', 'active', 112, 'supplement', NOW(), NOW()),
  ('b0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'virbac',             'supplement.manufacturer.virbac',             '비르박',           'Virbac',                'FR', 'active', 113, 'supplement', NOW(), NOW()),
  ('b0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'royal_canin',        'supplement.manufacturer.royal_canin',        '로얄캐닌',         'Royal Canin',           'FR', 'active', 114, 'supplement', NOW(), NOW()),
  ('b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'elanco',             'supplement.manufacturer.elanco',             '엘랑코',           'Elanco',                'US', 'active', 115, 'supplement', NOW(), NOW()),
  ('b1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'dechra',             'supplement.manufacturer.dechra',             '데크라',           'Dechra',                'UK', 'active', 116, 'supplement', NOW(), NOW()),
  ('b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'bayer',              'supplement.manufacturer.bayer',              '바이엘',           'Bayer',                 'DE', 'active', 117, 'supplement', NOW(), NOW()),
  ('b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'kyoritsu_seiyaku',   'supplement.manufacturer.kyoritsu_seiyaku',   '쿄리쯔제약',       'Kyoritsu Seiyaku',      'JP', 'active', 118, 'supplement', NOW(), NOW()),
  ('b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'vetplus',            'supplement.manufacturer.vetplus',            '벳플러스',         'VetPlus',               'UK', 'active', 119, 'supplement', NOW(), NOW()),
  ('b1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'phibro',             'supplement.manufacturer.phibro',             '피브로',           'Phibro Animal Health',  'US', 'active', 120, 'supplement', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 2. BRANDS (15 신규) =====
INSERT INTO feed_brands (id, manufacturer_id, name_key, name_ko, name_en, status, category_type, created_at, updated_at)
VALUES
  ('c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5', 'supplement.brand.myogyeonseo', '묘견서',      'Myogyeonseo',  'active', 'supplement', NOW(), NOW()),
  ('c0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'b0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.brand.dr_ray',      'Dr.Ray',     'Dr.Ray',       'active', 'supplement', NOW(), NOW()),
  ('c0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'supplement.brand.vetmedin',    '베트메딘',    'Vetmedin',     'active', 'supplement', NOW(), NOW()),
  ('c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'b0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'supplement.brand.virbac',      '비르박',      'Virbac',       'active', 'supplement', NOW(), NOW()),
  ('c0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'b0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.brand.royal_canin', '로얄캐닌',    'Royal Canin',  'active', 'supplement', NOW(), NOW()),
  ('c0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'supplement.brand.elanco',      '엘랑코',      'Elanco',       'active', 'supplement', NOW(), NOW()),
  ('c1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'supplement.brand.credelio',    '크레델리오',  'Credelio',     'active', 'supplement', NOW(), NOW()),
  ('c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'b1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'supplement.brand.dechra',      '데크라',      'Dechra',       'active', 'supplement', NOW(), NOW()),
  ('c1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.brand.dasuquin',    '다수퀸',      'Dasuquin',     'active', 'supplement', NOW(), NOW()),
  ('c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.brand.cobalequin',  '코발레퀸',    'Cobalequin',   'active', 'supplement', NOW(), NOW()),
  ('c1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.brand.seresto',     '세레스토',    'Seresto',      'active', 'supplement', NOW(), NOW()),
  ('c1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'supplement.brand.kyoritsu',    '쿄리쯔',      'Kyoritsu',     'active', 'supplement', NOW(), NOW()),
  ('c2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'supplement.brand.vetplus',     '벳플러스',    'VetPlus',      'active', 'supplement', NOW(), NOW()),
  ('c2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.brand.apoquel',     '아포퀠',      'Apoquel',      'active', 'supplement', NOW(), NOW()),
  ('c2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'b1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.brand.rejensa',     '레젠사',      'Rejensa',      'active', 'supplement', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 3. MODELS (20 신규) =====
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, status, category_type, created_at, updated_at)
VALUES
  -- 한국 브랜드 3종
  ('d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'mi-suppl-digestive',    'b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5', 'c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'supplement.model.myogyeonseo_densen',    '묘견서 프로바이오틱스 덴센', 'MYO-DENSEN', '{"ingredients":"Lactobacillus rhamnosus 100억+Bifidobacterium animalis 10억+L.acidophilus 8억+L.plantarum 8억+L.gasseri 8억+L.reuteri 25억 (총 300억 CFU/캡슐)","dosage_unit":"capsule","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-digestive',    'b0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.model.pancreta',              'PANCRETA',                  'DRRAY-PANC', '{"ingredients":"Microencapsulated Pancreatic Enzymes+Cobalamin+Folic Acid","dosage_unit":"capsule","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-immune',       'b0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.model.magneta_mini',          'MAGNETA mini',              'DRRAY-MAG',  '{"ingredients":"KD-Pür® 13 Antioxidants Complex","dosage_unit":"softgel","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  -- 글로벌 브랜드 17종
  ('d0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-prescription', 'b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'supplement.model.vetmedin_chewable',     'Vetmedin Chewable',         'BOEH-VETMED','{"ingredients":"Pimobendan","dosage_unit":"tablet","species_key":"dog","prescribed":true}', 'active', 'supplement', NOW(), NOW()),
  ('d0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-skin-coat',    'b0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'supplement.model.megaderm',              'Megaderm',                  'VIRB-MEGA',  '{"ingredients":"Omega3+6+Vit E","dosage_unit":"ml","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'mi-suppl-digestive',    'b0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'supplement.model.cet_enzymatic',         'C.E.T. Enzymatic',          'VIRB-CET',   '{"ingredients":"Glucose Oxidase+Lactoperoxidase","dosage_unit":"tablet","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'mi-suppl-joint',        'b0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'c0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.model.mobility_c2p',          'Mobility C2P+',             'RC-MOB',     '{"ingredients":"Glucosamine+Chondroitin+EPA+DHA","dosage_unit":"tablet","species_key":"dog","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-prescription', 'b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'c0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'supplement.model.galliprant',            'Galliprant',                'ELA-GALL',   '{"ingredients":"Grapiprant 20mg","dosage_unit":"tablet","species_key":"dog","prescribed":true}', 'active', 'supplement', NOW(), NOW()),
  ('d1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-prescription', 'b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'c1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'supplement.model.credelio_plus',         'Credelio Plus',             'ELA-CRED',   '{"ingredients":"Lotilaner+Milbemycin","dosage_unit":"tablet","species_key":"dog","prescribed":true}', 'active', 'supplement', NOW(), NOW()),
  ('d1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-prescription', 'b1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.model.canidryl',              'Canidryl',                  'DEC-CANI',   '{"ingredients":"Carprofen 50mg","dosage_unit":"tablet","species_key":"dog","prescribed":true}', 'active', 'supplement', NOW(), NOW()),
  ('d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-prescription', 'b1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.model.felimazole',            'Felimazole',                'DEC-FELI',   '{"ingredients":"Methimazole 2.5mg","dosage_unit":"tablet","species_key":"cat","prescribed":true}', 'active', 'supplement', NOW(), NOW()),
  ('d1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'mi-suppl-joint',        'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'c1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'supplement.model.dasuquin_advanced',     'Dasuquin Advanced',         'NUT-DASQ',   '{"ingredients":"Glucosamine+Chondroitin+ASU+Boswellia","dosage_unit":"tablet","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'mi-suppl-vitamin',      'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'supplement.model.cobalequin',            'Cobalequin',                'NUT-COBAL',  '{"ingredients":"Cobalamin (Vit B12)","dosage_unit":"tablet","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-prescription', 'b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.model.kiltix',                'Kiltix',                    'BAY-KILT',   '{"ingredients":"Flumethrin+Imidacloprid","dosage_unit":"-","species_key":"both","prescribed":true}', 'active', 'supplement', NOW(), NOW()),
  ('d2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-digestive',    'b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'supplement.model.lacto_b',               'Lacto-B',                   'KYO-LACTO',  '{"ingredients":"Bacillus subtilis+Lactobacillus","dosage_unit":"tablet","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-joint',        'b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'supplement.model.joint_one',             'Joint One',                 'KYO-JOINT',  '{"ingredients":"Glucosamine+UC-II Collagen","dosage_unit":"tablet","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d2e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-vitamin',      'b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'supplement.model.cystaid_plus',          'Cystaid Plus',              'VP-CYST',    '{"ingredients":"N-Acetyl Glucosamine+Hyaluronic Acid","dosage_unit":"capsule","species_key":"cat","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d2f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'mi-suppl-immune',       'b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'supplement.model.aktivait',              'Aktivait',                  'VP-AKTIV',   '{"ingredients":"Phosphatidylserine+CoQ10+Vit E+C","dosage_unit":"capsule","species_key":"both","prescribed":false}', 'active', 'supplement', NOW(), NOW()),
  ('d3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'mi-suppl-prescription', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.model.apoquel',               'Apoquel',                   'ZOE-APO',    '{"ingredients":"Oclacitinib 3.6mg","dosage_unit":"tablet","species_key":"dog","prescribed":true}', 'active', 'supplement', NOW(), NOW()),
  ('d3b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-joint',        'b1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'c2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'supplement.model.rejensa',               'Rejensa',                   'PHI-REJ',    '{"ingredients":"Pentosan Polysulfate Sodium","dosage_unit":"capsule","species_key":"dog","prescribed":false}', 'active', 'supplement', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 4. NUTRITION (20건) =====
INSERT INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
VALUES
  ('e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'd0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'L.rhamnosus, B.animalis, L.acidophilus, L.plantarum, L.gasseri, L.reuteri (총 300억 CFU)', 'Supplement: 묘견서 프로바이오틱스 덴센', 'active', NOW(), NOW()),
  ('e0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'd0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'Microencapsulated Pancreatic Enzymes, Cobalamin, Folic Acid', 'Supplement: PANCRETA', 'active', NOW(), NOW()),
  ('e0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'd0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 50, 0, 5, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'KD-Pür® 13 Antioxidants Complex', 'Supplement: MAGNETA mini', 'active', NOW(), NOW()),
  ('e0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'd0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 100, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.25, 'Pimobendan', 'Supplement: Vetmedin Chewable (prescription)', 'active', NOW(), NOW()),
  ('e0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'd0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 900, 0, 100, 0, 0, 0, 0, 0, 12.0, 8.0, 0, 1.0, 'Omega-3, Omega-6, Vitamin E', 'Supplement: Megaderm', 'active', NOW(), NOW()),
  ('e0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'd0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'Glucose Oxidase, Lactoperoxidase', 'Supplement: C.E.T. Enzymatic', 'active', NOW(), NOW()),
  ('e1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'd1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 133, 0, 0, 0, 5, 0, 0, 0, 2.0, 0, 0, 1.5, 'Glucosamine, Chondroitin, EPA, DHA', 'Supplement: Mobility C2P+', 'active', NOW(), NOW()),
  ('e1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'd1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 100, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'Grapiprant 20mg', 'Supplement: Galliprant (prescription)', 'active', NOW(), NOW()),
  ('e1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'd1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 100, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.8, 'Lotilaner, Milbemycin Oxime', 'Supplement: Credelio Plus (prescription)', 'active', NOW(), NOW()),
  ('e1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'd1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 100, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'Carprofen 50mg', 'Supplement: Canidryl (prescription)', 'active', NOW(), NOW()),
  ('e1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'd1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 100, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'Methimazole 2.5mg', 'Supplement: Felimazole (prescription)', 'active', NOW(), NOW()),
  ('e1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'd1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 133, 0, 0, 0, 5, 0, 1.0, 0.5, 0, 0, 0, 2.0, 'Glucosamine, Chondroitin, ASU, Boswellia', 'Supplement: Dasuquin Advanced', 'active', NOW(), NOW()),
  ('e2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'd2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'Cobalamin (Vitamin B12)', 'Supplement: Cobalequin', 'active', NOW(), NOW()),
  ('e2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'd2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Flumethrin, Imidacloprid', 'Supplement: Kiltix (prescription, collar)', 'active', NOW(), NOW()),
  ('e2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'd2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'Bacillus subtilis, Lactobacillus', 'Supplement: Lacto-B', 'active', NOW(), NOW()),
  ('e2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'd2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 133, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.5, 'Glucosamine, UC-II Collagen', 'Supplement: Joint One', 'active', NOW(), NOW()),
  ('e2e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'd2e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'N-Acetyl Glucosamine, Hyaluronic Acid', 'Supplement: Cystaid Plus', 'active', NOW(), NOW()),
  ('e2f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'd2f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 100, 0, 5, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'Phosphatidylserine, CoQ10, Vitamin E, Vitamin C', 'Supplement: Aktivait', 'active', NOW(), NOW()),
  ('e3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'd3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 100, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'Oclacitinib 3.6mg', 'Supplement: Apoquel (prescription)', 'active', NOW(), NOW()),
  ('e3b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'd3b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'Pentosan Polysulfate Sodium', 'Supplement: Rejensa', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 5. MANUFACTURER TYPE MAPPING =====
-- 기존 제조사 추가 매핑
INSERT INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
VALUES
  -- Nutramax: joint, vitamin (추가)
  (md5('suppl_mfr_type_nutramax_joint'),   'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-joint',        NOW()),
  (md5('suppl_mfr_type_nutramax_vitamin'), 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-vitamin',      NOW()),
  -- Zoetis: prescription (추가)
  (md5('suppl_mfr_type_zoetis_prescription'), 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-prescription', NOW()),
  -- 신규 제조사 매핑
  (md5('suppl_mfr_type_myogyeonseo_digestive'), 'b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5', 'mi-suppl-digestive',    NOW()),
  (md5('suppl_mfr_type_drray_digestive'),       'b0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-digestive',    NOW()),
  (md5('suppl_mfr_type_drray_immune'),          'b0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-immune',       NOW()),
  (md5('suppl_mfr_type_boehringer_prescription'),'b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-prescription', NOW()),
  (md5('suppl_mfr_type_virbac_skin_coat'),      'b0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-skin-coat',    NOW()),
  (md5('suppl_mfr_type_virbac_digestive'),      'b0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-digestive',    NOW()),
  (md5('suppl_mfr_type_royal_canin_joint'),     'b0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-joint',        NOW()),
  (md5('suppl_mfr_type_elanco_prescription'),   'b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'mi-suppl-prescription', NOW()),
  (md5('suppl_mfr_type_dechra_prescription'),   'b1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'mi-suppl-prescription', NOW()),
  (md5('suppl_mfr_type_bayer_prescription'),    'b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-prescription', NOW()),
  (md5('suppl_mfr_type_kyoritsu_digestive'),    'b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-digestive',    NOW()),
  (md5('suppl_mfr_type_kyoritsu_joint'),        'b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-joint',        NOW()),
  (md5('suppl_mfr_type_vetplus_vitamin'),       'b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-vitamin',      NOW()),
  (md5('suppl_mfr_type_vetplus_immune'),        'b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-immune',       NOW()),
  (md5('suppl_mfr_type_phibro_joint'),          'b1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-joint',        NOW())
ON CONFLICT DO NOTHING;

-- ===== 6. BRAND-MANUFACTURER MAPPING =====
INSERT INTO feed_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at)
VALUES
  (md5('suppl_brand_mfr_myogyeonseo'),   'c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5', NOW()),
  (md5('suppl_brand_mfr_drray'),         'c0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'b0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_brand_mfr_vetmedin'),      'c0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', NOW()),
  (md5('suppl_brand_mfr_virbac'),        'c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'b0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', NOW()),
  (md5('suppl_brand_mfr_royal_canin'),   'c0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'b0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', NOW()),
  (md5('suppl_brand_mfr_elanco'),        'c0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', NOW()),
  (md5('suppl_brand_mfr_credelio'),      'c1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'b0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', NOW()),
  (md5('suppl_brand_mfr_dechra'),        'c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'b1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', NOW()),
  (md5('suppl_brand_mfr_dasuquin'),      'c1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', NOW()),
  (md5('suppl_brand_mfr_cobalequin'),    'c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', NOW()),
  (md5('suppl_brand_mfr_seresto'),       'c1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_brand_mfr_kyoritsu'),      'c1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', NOW()),
  (md5('suppl_brand_mfr_vetplus'),       'c2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', NOW()),
  (md5('suppl_brand_mfr_apoquel'),       'c2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_brand_mfr_rejensa'),       'c2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'b1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', NOW())
ON CONFLICT DO NOTHING;

-- ===== 7. MODEL-BRAND MAPPING =====
INSERT INTO feed_model_brand_map (id, model_id, brand_id, created_at)
VALUES
  (md5('suppl_model_brand_myogyeonseo_densen'),  'd0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', NOW()),
  (md5('suppl_model_brand_pancreta'),            'd0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_model_brand_magneta_mini'),        'd0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_model_brand_vetmedin_chewable'),   'd0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', NOW()),
  (md5('suppl_model_brand_megaderm'),            'd0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', NOW()),
  (md5('suppl_model_brand_cet_enzymatic'),       'd0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', NOW()),
  (md5('suppl_model_brand_mobility_c2p'),        'd1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'c0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', NOW()),
  (md5('suppl_model_brand_galliprant'),          'd1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', NOW()),
  (md5('suppl_model_brand_credelio_plus'),       'd1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', NOW()),
  (md5('suppl_model_brand_canidryl'),            'd1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_model_brand_felimazole'),          'd1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_model_brand_dasuquin_advanced'),   'd1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'c1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', NOW()),
  (md5('suppl_model_brand_cobalequin'),          'd2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', NOW()),
  (md5('suppl_model_brand_kiltix'),              'd2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', NOW()),
  (md5('suppl_model_brand_lacto_b'),             'd2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', NOW()),
  (md5('suppl_model_brand_joint_one'),           'd2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', NOW()),
  (md5('suppl_model_brand_cystaid_plus'),        'd2e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'c2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', NOW()),
  (md5('suppl_model_brand_aktivait'),            'd2f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'c2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', NOW()),
  (md5('suppl_model_brand_apoquel'),             'd3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'c2b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', NOW()),
  (md5('suppl_model_brand_rejensa'),             'd3b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'c2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', NOW())
ON CONFLICT DO NOTHING;

-- ===== 8. I18N TRANSLATIONS =====
-- 제조사 (11개)
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at) VALUES
  ('i18n-suppl-mfr-myogyeonseo', 'supplement.manufacturer.myogyeonseo', 'supplement', '묘견서', 'Myogyeonseo', '묘견서', '묘견서', '묘견서', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', true, NOW(), NOW()),
  ('i18n-suppl-mfr-drray', 'supplement.manufacturer.dr_ray', 'supplement', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', true, NOW(), NOW()),
  ('i18n-suppl-mfr-boehringer', 'supplement.manufacturer.boehringer_ingelheim', 'supplement', '베링거인겔하임', 'Boehringer Ingelheim', 'ベーリンガーインゲルハイム', '勃林格殷格翰', '百靈佳殷格翰', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'بورينغر إنغلهايم', true, NOW(), NOW()),
  ('i18n-suppl-mfr-virbac', 'supplement.manufacturer.virbac', 'supplement', '비르박', 'Virbac', 'ビルバック', '维克', '維克', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'فيرباك', true, NOW(), NOW()),
  ('i18n-suppl-mfr-royal-canin', 'supplement.manufacturer.royal_canin', 'supplement', '로얄캐닌', 'Royal Canin', 'ロイヤルカナン', '皇家', '皇家', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'رويال كانين', true, NOW(), NOW()),
  ('i18n-suppl-mfr-elanco', 'supplement.manufacturer.elanco', 'supplement', '엘랑코', 'Elanco', 'エランコ', '礼蓝', '禮藍', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'إيلانكو', true, NOW(), NOW()),
  ('i18n-suppl-mfr-dechra', 'supplement.manufacturer.dechra', 'supplement', '데크라', 'Dechra', 'デクラ', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'ديكرا', true, NOW(), NOW()),
  ('i18n-suppl-mfr-bayer', 'supplement.manufacturer.bayer', 'supplement', '바이엘', 'Bayer', 'バイエル', '拜耳', '拜耳', 'Bayer', 'Bayer', 'Bayer', 'Bayer', 'Bayer', 'Bayer', 'Bayer', 'باير', true, NOW(), NOW()),
  ('i18n-suppl-mfr-kyoritsu', 'supplement.manufacturer.kyoritsu_seiyaku', 'supplement', '쿄리쯔제약', 'Kyoritsu Seiyaku', '共立製薬', '共立制药', '共立製藥', 'Kyoritsu Seiyaku', 'Kyoritsu Seiyaku', 'Kyoritsu Seiyaku', 'Kyoritsu Seiyaku', 'Kyoritsu Seiyaku', 'Kyoritsu Seiyaku', 'Kyoritsu Seiyaku', 'كيوريتسو سيياكو', true, NOW(), NOW()),
  ('i18n-suppl-mfr-vetplus', 'supplement.manufacturer.vetplus', 'supplement', '벳플러스', 'VetPlus', 'ベットプラス', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'فيت بلس', true, NOW(), NOW()),
  ('i18n-suppl-mfr-phibro', 'supplement.manufacturer.phibro', 'supplement', '피브로', 'Phibro Animal Health', 'フィブロ', 'Phibro', 'Phibro', 'Phibro Animal Health', 'Phibro Animal Health', 'Phibro Animal Health', 'Phibro Animal Health', 'Phibro Animal Health', 'Phibro Animal Health', 'Phibro Animal Health', 'فيبرو', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET ko=EXCLUDED.ko, en=EXCLUDED.en, ja=EXCLUDED.ja, zh_cn=EXCLUDED.zh_cn, zh_tw=EXCLUDED.zh_tw, es=EXCLUDED.es, fr=EXCLUDED.fr, de=EXCLUDED.de, pt=EXCLUDED.pt, vi=EXCLUDED.vi, th=EXCLUDED.th, id_lang=EXCLUDED.id_lang, ar=EXCLUDED.ar, updated_at=NOW();

-- 브랜드 (15개)
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at) VALUES
  ('i18n-suppl-brand-myogyeonseo', 'supplement.brand.myogyeonseo', 'supplement', '묘견서', 'Myogyeonseo', '묘견서', '묘견서', '묘견서', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', 'Myogyeonseo', true, NOW(), NOW()),
  ('i18n-suppl-brand-drray', 'supplement.brand.dr_ray', 'supplement', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', 'Dr.Ray', true, NOW(), NOW()),
  ('i18n-suppl-brand-vetmedin', 'supplement.brand.vetmedin', 'supplement', '베트메딘', 'Vetmedin', 'ベトメディン', 'Vetmedin', 'Vetmedin', 'Vetmedin', 'Vetmedin', 'Vetmedin', 'Vetmedin', 'Vetmedin', 'Vetmedin', 'Vetmedin', 'فيتميدين', true, NOW(), NOW()),
  ('i18n-suppl-brand-virbac', 'supplement.brand.virbac', 'supplement', '비르박', 'Virbac', 'ビルバック', '维克', '維克', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'Virbac', 'فيرباك', true, NOW(), NOW()),
  ('i18n-suppl-brand-royal-canin', 'supplement.brand.royal_canin', 'supplement', '로얄캐닌', 'Royal Canin', 'ロイヤルカナン', '皇家', '皇家', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'Royal Canin', 'رويال كانين', true, NOW(), NOW()),
  ('i18n-suppl-brand-elanco', 'supplement.brand.elanco', 'supplement', '엘랑코', 'Elanco', 'エランコ', '礼蓝', '禮藍', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'Elanco', 'إيلانكو', true, NOW(), NOW()),
  ('i18n-suppl-brand-credelio', 'supplement.brand.credelio', 'supplement', '크레델리오', 'Credelio', 'クレデリオ', 'Credelio', 'Credelio', 'Credelio', 'Credelio', 'Credelio', 'Credelio', 'Credelio', 'Credelio', 'Credelio', 'كريديليو', true, NOW(), NOW()),
  ('i18n-suppl-brand-dechra', 'supplement.brand.dechra', 'supplement', '데크라', 'Dechra', 'デクラ', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'Dechra', 'ديكرا', true, NOW(), NOW()),
  ('i18n-suppl-brand-dasuquin', 'supplement.brand.dasuquin', 'supplement', '다수퀸', 'Dasuquin', 'ダスクイン', 'Dasuquin', 'Dasuquin', 'Dasuquin', 'Dasuquin', 'Dasuquin', 'Dasuquin', 'Dasuquin', 'Dasuquin', 'Dasuquin', 'داسوكوين', true, NOW(), NOW()),
  ('i18n-suppl-brand-cobalequin', 'supplement.brand.cobalequin', 'supplement', '코발레퀸', 'Cobalequin', 'コバレキン', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'كوباليكوين', true, NOW(), NOW()),
  ('i18n-suppl-brand-seresto', 'supplement.brand.seresto', 'supplement', '세레스토', 'Seresto', 'セレスト', 'Seresto', 'Seresto', 'Seresto', 'Seresto', 'Seresto', 'Seresto', 'Seresto', 'Seresto', 'Seresto', 'سيريستو', true, NOW(), NOW()),
  ('i18n-suppl-brand-kyoritsu', 'supplement.brand.kyoritsu', 'supplement', '쿄리쯔', 'Kyoritsu', '共立', '共立', '共立', 'Kyoritsu', 'Kyoritsu', 'Kyoritsu', 'Kyoritsu', 'Kyoritsu', 'Kyoritsu', 'Kyoritsu', 'كيوريتسو', true, NOW(), NOW()),
  ('i18n-suppl-brand-vetplus', 'supplement.brand.vetplus', 'supplement', '벳플러스', 'VetPlus', 'ベットプラス', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'VetPlus', 'فيت بلس', true, NOW(), NOW()),
  ('i18n-suppl-brand-apoquel', 'supplement.brand.apoquel', 'supplement', '아포퀠', 'Apoquel', 'アポキル', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'أبوكويل', true, NOW(), NOW()),
  ('i18n-suppl-brand-rejensa', 'supplement.brand.rejensa', 'supplement', '레젠사', 'Rejensa', 'レジェンサ', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'ريجينسا', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET ko=EXCLUDED.ko, en=EXCLUDED.en, ja=EXCLUDED.ja, zh_cn=EXCLUDED.zh_cn, zh_tw=EXCLUDED.zh_tw, es=EXCLUDED.es, fr=EXCLUDED.fr, de=EXCLUDED.de, pt=EXCLUDED.pt, vi=EXCLUDED.vi, th=EXCLUDED.th, id_lang=EXCLUDED.id_lang, ar=EXCLUDED.ar, updated_at=NOW();

-- 모델 (20개)
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at) VALUES
  ('i18n-suppl-model-densen', 'supplement.model.myogyeonseo_densen', 'supplement', '묘견서 프로바이오틱스 덴센', 'Myogyeonseo Probiotics Densen', '묘견서 プロバイオティクス デンセン', '묘견서 益生菌 Densen', '묘견서 益生菌 Densen', 'Myogyeonseo Probiotics Densen', 'Myogyeonseo Probiotics Densen', 'Myogyeonseo Probiotics Densen', 'Myogyeonseo Probiotics Densen', 'Myogyeonseo Probiotics Densen', 'Myogyeonseo Probiotics Densen', 'Myogyeonseo Probiotics Densen', 'Myogyeonseo Probiotics Densen', true, NOW(), NOW()),
  ('i18n-suppl-model-pancreta', 'supplement.model.pancreta', 'supplement', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', 'PANCRETA', true, NOW(), NOW()),
  ('i18n-suppl-model-magneta', 'supplement.model.magneta_mini', 'supplement', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', 'MAGNETA mini', true, NOW(), NOW()),
  ('i18n-suppl-model-vetmedin', 'supplement.model.vetmedin_chewable', 'supplement', '베트메딘 츄어블', 'Vetmedin Chewable', 'ベトメディン チュアブル', 'Vetmedin 咀嚼片', 'Vetmedin 咀嚼錠', 'Vetmedin Masticable', 'Vetmedin à croquer', 'Vetmedin Kautablette', 'Vetmedin Mastigável', 'Vetmedin dạng nhai', 'Vetmedin เคี้ยว', 'Vetmedin Kunyah', 'فيتميدين قابل للمضغ', true, NOW(), NOW()),
  ('i18n-suppl-model-megaderm', 'supplement.model.megaderm', 'supplement', '메가덤', 'Megaderm', 'メガダーム', 'Megaderm', 'Megaderm', 'Megaderm', 'Megaderm', 'Megaderm', 'Megaderm', 'Megaderm', 'Megaderm', 'Megaderm', 'ميجاديرم', true, NOW(), NOW()),
  ('i18n-suppl-model-cet', 'supplement.model.cet_enzymatic', 'supplement', 'C.E.T. 엔자이매틱', 'C.E.T. Enzymatic', 'C.E.T. エンザイマティック', 'C.E.T. 酵素', 'C.E.T. 酵素', 'C.E.T. Enzimático', 'C.E.T. Enzymatique', 'C.E.T. Enzymatisch', 'C.E.T. Enzimático', 'C.E.T. Enzymatic', 'C.E.T. เอนไซม์', 'C.E.T. Enzimatik', 'C.E.T. إنزيمي', true, NOW(), NOW()),
  ('i18n-suppl-model-mobility', 'supplement.model.mobility_c2p', 'supplement', '모빌리티 C2P+', 'Mobility C2P+', 'モビリティ C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', 'Mobility C2P+', true, NOW(), NOW()),
  ('i18n-suppl-model-galliprant', 'supplement.model.galliprant', 'supplement', '갈리프란트', 'Galliprant', 'ガリプラント', 'Galliprant', 'Galliprant', 'Galliprant', 'Galliprant', 'Galliprant', 'Galliprant', 'Galliprant', 'Galliprant', 'Galliprant', 'غاليبرانت', true, NOW(), NOW()),
  ('i18n-suppl-model-credelio', 'supplement.model.credelio_plus', 'supplement', '크레델리오 플러스', 'Credelio Plus', 'クレデリオ プラス', 'Credelio Plus', 'Credelio Plus', 'Credelio Plus', 'Credelio Plus', 'Credelio Plus', 'Credelio Plus', 'Credelio Plus', 'Credelio Plus', 'Credelio Plus', 'كريديليو بلس', true, NOW(), NOW()),
  ('i18n-suppl-model-canidryl', 'supplement.model.canidryl', 'supplement', '카니드릴', 'Canidryl', 'カニドリル', 'Canidryl', 'Canidryl', 'Canidryl', 'Canidryl', 'Canidryl', 'Canidryl', 'Canidryl', 'Canidryl', 'Canidryl', 'كانيدريل', true, NOW(), NOW()),
  ('i18n-suppl-model-felimazole', 'supplement.model.felimazole', 'supplement', '펠리마졸', 'Felimazole', 'フェリマゾール', 'Felimazole', 'Felimazole', 'Felimazole', 'Felimazole', 'Felimazole', 'Felimazole', 'Felimazole', 'Felimazole', 'Felimazole', 'فيليمازول', true, NOW(), NOW()),
  ('i18n-suppl-model-dasuquin', 'supplement.model.dasuquin_advanced', 'supplement', '다수퀸 어드밴스드', 'Dasuquin Advanced', 'ダスクイン アドバンスド', 'Dasuquin Advanced', 'Dasuquin Advanced', 'Dasuquin Advanced', 'Dasuquin Advanced', 'Dasuquin Advanced', 'Dasuquin Advanced', 'Dasuquin Advanced', 'Dasuquin Advanced', 'Dasuquin Advanced', 'داسوكوين أدفانسد', true, NOW(), NOW()),
  ('i18n-suppl-model-cobalequin', 'supplement.model.cobalequin', 'supplement', '코발레퀸', 'Cobalequin', 'コバレキン', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'Cobalequin', 'كوباليكوين', true, NOW(), NOW()),
  ('i18n-suppl-model-kiltix', 'supplement.model.kiltix', 'supplement', '킬틱스', 'Kiltix', 'キルティクス', 'Kiltix', 'Kiltix', 'Kiltix', 'Kiltix', 'Kiltix', 'Kiltix', 'Kiltix', 'Kiltix', 'Kiltix', 'كيلتيكس', true, NOW(), NOW()),
  ('i18n-suppl-model-lacto-b', 'supplement.model.lacto_b', 'supplement', '락토-B', 'Lacto-B', 'ラクト-B', 'Lacto-B', 'Lacto-B', 'Lacto-B', 'Lacto-B', 'Lacto-B', 'Lacto-B', 'Lacto-B', 'Lacto-B', 'Lacto-B', 'لاكتو-بي', true, NOW(), NOW()),
  ('i18n-suppl-model-joint-one', 'supplement.model.joint_one', 'supplement', '조인트 원', 'Joint One', 'ジョイント ワン', 'Joint One', 'Joint One', 'Joint One', 'Joint One', 'Joint One', 'Joint One', 'Joint One', 'Joint One', 'Joint One', 'جوينت وان', true, NOW(), NOW()),
  ('i18n-suppl-model-cystaid', 'supplement.model.cystaid_plus', 'supplement', '시스테이드 플러스', 'Cystaid Plus', 'シスタイド プラス', 'Cystaid Plus', 'Cystaid Plus', 'Cystaid Plus', 'Cystaid Plus', 'Cystaid Plus', 'Cystaid Plus', 'Cystaid Plus', 'Cystaid Plus', 'Cystaid Plus', 'سيستايد بلس', true, NOW(), NOW()),
  ('i18n-suppl-model-aktivait', 'supplement.model.aktivait', 'supplement', '액티베이트', 'Aktivait', 'アクティベイト', 'Aktivait', 'Aktivait', 'Aktivait', 'Aktivait', 'Aktivait', 'Aktivait', 'Aktivait', 'Aktivait', 'Aktivait', 'أكتيفايت', true, NOW(), NOW()),
  ('i18n-suppl-model-apoquel', 'supplement.model.apoquel', 'supplement', '아포퀠', 'Apoquel', 'アポキル', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'Apoquel', 'أبوكويل', true, NOW(), NOW()),
  ('i18n-suppl-model-rejensa', 'supplement.model.rejensa', 'supplement', '레젠사', 'Rejensa', 'レジェンサ', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'Rejensa', 'ريجينسا', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET ko=EXCLUDED.ko, en=EXCLUDED.en, ja=EXCLUDED.ja, zh_cn=EXCLUDED.zh_cn, zh_tw=EXCLUDED.zh_tw, es=EXCLUDED.es, fr=EXCLUDED.fr, de=EXCLUDED.de, pt=EXCLUDED.pt, vi=EXCLUDED.vi, th=EXCLUDED.th, id_lang=EXCLUDED.id_lang, ar=EXCLUDED.ar, updated_at=NOW();
