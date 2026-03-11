-- ============================================================================
-- 059_supplement_catalog.sql
-- Supplement catalog — reuses feed_manufacturers/brands/models/nutrition tables
-- with category_type='supplement' to distinguish from feed entries.
-- 7 manufacturers, 8 brands, 18 models, 18 nutrition + mappings + i18n
-- All IDs are pre-computed 32-char hex — idempotent (ON CONFLICT DO NOTHING)
-- ============================================================================

-- ===== 1. ALTER TABLES — add category_type column =====
ALTER TABLE feed_manufacturers ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'feed';
ALTER TABLE feed_brands        ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'feed';
ALTER TABLE feed_models        ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'feed';

-- ===== 2. MASTER CATEGORY + TYPES =====
INSERT INTO master_categories (id, code, sort_order, status, created_at, updated_at)
VALUES ('mc-supplement-type', 'supplement_type', 210, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_items (id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at) VALUES
  ('mi-suppl-joint',        'mc-supplement-type', 'joint_supplement_core',        NULL, 1, 'active', '{}', NOW(), NOW()),
  ('mi-suppl-digestive',    'mc-supplement-type', 'digestive_supplement_core',    NULL, 2, 'active', '{}', NOW(), NOW()),
  ('mi-suppl-vitamin',      'mc-supplement-type', 'vitamin_supplement_core',      NULL, 3, 'active', '{}', NOW(), NOW()),
  ('mi-suppl-skin-coat',    'mc-supplement-type', 'skin_coat_supplement_core',    NULL, 4, 'active', '{}', NOW(), NOW()),
  ('mi-suppl-immune',       'mc-supplement-type', 'immune_supplement_core',       NULL, 5, 'active', '{}', NOW(), NOW()),
  ('mi-suppl-prescription', 'mc-supplement-type', 'prescription_supplement_core', NULL, 6, 'active', '{"prescribed":true}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 3. MANUFACTURERS (7) =====
INSERT INTO feed_manufacturers (id, key, name_key, name_ko, name_en, country, status, sort_order, category_type, created_at, updated_at)
VALUES
  ('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'zoetis',          'supplement.manufacturer.zoetis',          'Zoetis',         'Zoetis',          'US', 'active', 101, 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  ('b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'vetri_science',   'supplement.manufacturer.vetri_science',   '벳트리사이언스', 'Vetri-Science',   'US', 'active', 102, 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  ('c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'purina_suppl',    'supplement.manufacturer.purina_suppl',    '퓨리나',         'Purina',          'US', 'active', 103, 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  ('d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'nutramax',        'supplement.manufacturer.nutramax',        'Nutramax',       'Nutramax',        'US', 'active', 104, 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  ('e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'zesty_paws',      'supplement.manufacturer.zesty_paws',      '제스티포즈',     'Zesty Paws',      'US', 'active', 105, 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  ('f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'nordic_naturals',  'supplement.manufacturer.nordic_naturals', '노르딕내추럴스', 'Nordic Naturals', 'US', 'active', 106, 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  ('a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'rx_only',          'supplement.manufacturer.rx_only',          '처방전용',       'Rx Only',         NULL,'active', 199, 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 4. BRANDS (8) =====
INSERT INTO feed_brands (id, manufacturer_id, name_key, name_ko, name_en, status, category_type, created_at, updated_at)
VALUES
  -- Zoetis -> Cosequin
  ('b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'supplement.brand.cosequin',        'Cosequin',        'Cosequin',        'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- Vetri-Science -> Vetri-Science
  ('c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'supplement.brand.vetri_science',   'Vetri-Science',   'Vetri-Science',   'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- Purina -> Purina Pro Plan
  ('d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'supplement.brand.purina_pro_plan', '프로플랜',        'Purina Pro Plan', 'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- Nutramax -> Proviable
  ('e4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.brand.proviable',       'Proviable',       'Proviable',       'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- Nutramax -> Welactin
  ('f5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'supplement.brand.welactin',        'Welactin',        'Welactin',        'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- Zesty Paws -> Zesty Paws
  ('a6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'supplement.brand.zesty_paws',      'Zesty Paws',      'Zesty Paws',      'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- Nordic Naturals -> Nordic Naturals
  ('b7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'supplement.brand.nordic_naturals', 'Nordic Naturals', 'Nordic Naturals', 'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- Rx Only -> 처방전용
  ('c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'supplement.brand.rx_only',         '처방전용',        'Rx Only',         'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 5. MODELS (18) =====
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, status, category_type, created_at, updated_at)
VALUES
  -- #1 Zoetis/Cosequin -> Cosequin DS Plus MSM (joint)
  ('aa01b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'mi-suppl-joint', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', 'supplement.model.cosequin_ds_plus_msm',       'Cosequin DS Plus MSM',       '', '{"ingredients":"Glucosamine+Chondroitin+MSM","dosage_unit":"tablet","calories_per_serving":2,"species_key":"both","prescribed":false}',       'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #2 Zoetis/Cosequin -> Cosequin Maximum Strength (joint)
  ('bb02c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-joint', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', 'supplement.model.cosequin_max_strength',      'Cosequin Maximum Strength',  '', '{"ingredients":"Glucosamine+Chondroitin","dosage_unit":"tablet","calories_per_serving":2,"species_key":"both","prescribed":false}',             'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #3 Vetri-Science/Vetri-Science -> GlycoFlex Stage 1 (joint)
  ('cc03d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-joint', 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', 'supplement.model.glycoflex_stage1',           'GlycoFlex Stage 1',          '', '{"ingredients":"Perna+Glucosamine","dosage_unit":"tablet","calories_per_serving":3,"species_key":"both","prescribed":false}',                    'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #4 Vetri-Science/Vetri-Science -> GlycoFlex Stage 3 (joint)
  ('dd04e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-joint', 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', 'supplement.model.glycoflex_stage3',           'GlycoFlex Stage 3',          '', '{"ingredients":"Glucosamine+MSM+DMG","dosage_unit":"tablet","calories_per_serving":3,"species_key":"both","prescribed":false}',                  'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #5 Purina/Purina Pro Plan -> FortiFlora Dog (digestive)
  ('ee05f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-digestive', 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'd3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', 'supplement.model.fortiflora_dog',             'FortiFlora Dog',             '', '{"ingredients":"Lactobacillus 1억CFU","dosage_unit":"scoop","calories_per_serving":5,"species_key":"dog","prescribed":false}',                   'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #6 Purina/Purina Pro Plan -> FortiFlora Cat (digestive)
  ('ff06a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'mi-suppl-digestive', 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'd3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', 'supplement.model.fortiflora_cat',             'FortiFlora Cat',             '', '{"ingredients":"Lactobacillus 1억CFU","dosage_unit":"scoop","calories_per_serving":5,"species_key":"cat","prescribed":false}',                   'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #7 Nutramax/Proviable -> Proviable-DC (digestive)
  ('aa07b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'mi-suppl-digestive', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'e4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', 'supplement.model.proviable_dc',               'Proviable-DC',               '', '{"ingredients":"Multi-strain Probiotics","dosage_unit":"capsule","calories_per_serving":4,"species_key":"both","prescribed":false}',             'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #8 Nutramax/Proviable -> Proviable Forte (digestive)
  ('bb08c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'mi-suppl-digestive', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'e4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', 'supplement.model.proviable_forte',            'Proviable Forte',            '', '{"ingredients":"Probiotics+Prebiotics","dosage_unit":"scoop","calories_per_serving":8,"species_key":"both","prescribed":false}',                 'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #9 Zesty Paws/Zesty Paws -> Omega Bites Dog (skin-coat)
  ('cc09d0e1f2a3b4c5d6e7f8a9b0c1d2e3', 'mi-suppl-skin-coat', 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'a6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', 'supplement.model.omega_bites_dog',            'Omega Bites Dog',            '', '{"ingredients":"EPA 180mg+DHA 120mg","dosage_unit":"tablet","calories_per_serving":9,"species_key":"dog","prescribed":false}',                   'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #10 Zesty Paws/Zesty Paws -> Omega Bites Cat (skin-coat)
  ('dd10e1f2a3b4c5d6e7f8a9b0c1d2e3f4', 'mi-suppl-skin-coat', 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'a6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', 'supplement.model.omega_bites_cat',            'Omega Bites Cat',            '', '{"ingredients":"EPA+DHA+Vitamin E","dosage_unit":"tablet","calories_per_serving":8,"species_key":"cat","prescribed":false}',                     'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #11 Nordic Naturals/Nordic Naturals -> Omega-3 Pet (skin-coat)
  ('ee11f2a3b4c5d6e7f8a9b0c1d2e3f4a5', 'mi-suppl-skin-coat', 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'b7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', 'supplement.model.omega3_pet',                 'Omega-3 Pet',                '', '{"ingredients":"EPA 425mg+DHA 850mg","dosage_unit":"ml","calories_per_serving":9,"species_key":"both","prescribed":false}',                      'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #12 Nordic Naturals/Nordic Naturals -> Omega-3 Cat (skin-coat)
  ('ff12a3b4c5d6e7f8a9b0c1d2e3f4a5b6', 'mi-suppl-skin-coat', 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'b7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', 'supplement.model.omega3_cat',                 'Omega-3 Cat',                '', '{"ingredients":"EPA+DHA Fish Oil","dosage_unit":"ml","calories_per_serving":9,"species_key":"cat","prescribed":false}',                          'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #13 Vetri-Science/Vetri-Science -> Canine Plus Senior (vitamin)
  ('aa13b4c5d6e7f8a9b0c1d2e3f4a5b6c7', 'mi-suppl-vitamin', 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', 'supplement.model.canine_plus_senior',         'Canine Plus Senior',         '', '{"ingredients":"Multivitamin+Mineral","dosage_unit":"tablet","calories_per_serving":3,"species_key":"dog","prescribed":false}',                  'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #14 Nutramax/Welactin -> Welactin Canine (skin-coat)
  ('bb14c5d6e7f8a9b0c1d2e3f4a5b6c7d8', 'mi-suppl-skin-coat', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'f5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', 'supplement.model.welactin_canine',            'Welactin Canine',            '', '{"ingredients":"Omega-3+Vitamin E","dosage_unit":"ml","calories_per_serving":10,"species_key":"dog","prescribed":false}',                        'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #15 Rx Only/Rx Only -> Rx Joint Care (prescription)
  ('cc15d6e7f8a9b0c1d2e3f4a5b6c7d8e9', 'mi-suppl-prescription', 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', 'supplement.model.rx_joint_care',              'Rx Joint Care',              '', '{"ingredients":"Rx-Glucosamine Complex","dosage_unit":"tablet","calories_per_serving":2,"species_key":"both","prescribed":true}',                'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #16 Rx Only/Rx Only -> Rx Kidney Care (prescription)
  ('dd16e7f8a9b0c1d2e3f4a5b6c7d8e9f0', 'mi-suppl-prescription', 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', 'supplement.model.rx_kidney_care',             'Rx Kidney Care',             '', '{"ingredients":"Low Phosphorus Formula","dosage_unit":"scoop","calories_per_serving":0,"species_key":"both","prescribed":true}',                 'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #17 Rx Only/Rx Only -> Rx Liver Care (prescription)
  ('ee17f8a9b0c1d2e3f4a5b6c7d8e9f0a1', 'mi-suppl-prescription', 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', 'supplement.model.rx_liver_care',              'Rx Liver Care',              '', '{"ingredients":"SAMe+Milk Thistle","dosage_unit":"tablet","calories_per_serving":2,"species_key":"both","prescribed":true}',                     'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #18 Rx Only/Rx Only -> Rx Heart Care (prescription)
  ('ff18a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 'mi-suppl-prescription', 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', 'supplement.model.rx_heart_care',              'Rx Heart Care',              '', '{"ingredients":"Taurine+L-Carnitine","dosage_unit":"tablet","calories_per_serving":2,"species_key":"both","prescribed":true}',                   'active', 'supplement', '2026-03-11 12:00:00', '2026-03-11 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 6. NUTRITION (18) =====
-- Supplements: calories_per_100g estimated from per-serving, protein/fat/fiber/moisture ~0, ingredients_text from description
INSERT INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
VALUES
  -- #1 Cosequin DS Plus MSM — ~2 kcal/tablet (~1.5g), ~133 kcal/100g
  ('a101b2c3d4e5f6a7b8c9d0e1f2a30001', 'aa01b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 133, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.5, 'Glucosamine HCl, Sodium Chondroitin Sulfate, MSM (Methylsulfonylmethane)', 'Supplement: Cosequin DS Plus MSM', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #2 Cosequin Maximum Strength — ~2 kcal/tablet
  ('a102c3d4e5f6a7b8c9d0e1f2a3b40002', 'bb02c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 133, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.5, 'Glucosamine HCl, Sodium Chondroitin Sulfate', 'Supplement: Cosequin Maximum Strength', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #3 GlycoFlex Stage 1 — ~3 kcal/tablet (~2g)
  ('a103d4e5f6a7b8c9d0e1f2a3b4c50003', 'cc03d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 150, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 2.0, 'Perna Canaliculus (Green-Lipped Mussel), Glucosamine HCl', 'Supplement: GlycoFlex Stage 1', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #4 GlycoFlex Stage 3 — ~3 kcal/tablet (~2g)
  ('a104e5f6a7b8c9d0e1f2a3b4c5d60004', 'dd04e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 150, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 2.0, 'Glucosamine HCl, MSM, DMG (Dimethylglycine)', 'Supplement: GlycoFlex Stage 3', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #5 FortiFlora Dog — ~5 kcal/scoop (~1g)
  ('a105f6a7b8c9d0e1f2a3b4c5d6e70005', 'ee05f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 500, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'Enterococcus faecium SF68, Animal digest, Brewers dried yeast', 'Supplement: FortiFlora Dog', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #6 FortiFlora Cat — ~5 kcal/scoop (~1g)
  ('a106a7b8c9d0e1f2a3b4c5d6e7f80006', 'ff06a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 500, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.0, 'Enterococcus faecium SF68, Animal digest, Brewers dried yeast', 'Supplement: FortiFlora Cat', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #7 Proviable-DC — ~4 kcal/capsule (~0.5g)
  ('a107b8c9d0e1f2a3b4c5d6e7f8a90007', 'aa07b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 800, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0.5, 'Multi-strain Probiotics (7 strains, 5 billion CFU)', 'Supplement: Proviable-DC', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #8 Proviable Forte — ~8 kcal/scoop (~2g)
  ('a108c9d0e1f2a3b4c5d6e7f8a9b00008', 'bb08c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 400, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 2.0, 'Probiotics (10 billion CFU), Prebiotics (FOS)', 'Supplement: Proviable Forte', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #9 Omega Bites Dog — ~9 kcal/tablet (~3g)
  ('a109d0e1f2a3b4c5d6e7f8a9b0c10009', 'cc09d0e1f2a3b4c5d6e7f8a9b0c1d2e3', 300, 0, 8, 0, 5, 0, 0, 0, 3.0, 0, 0, 3.0, 'EPA 180mg, DHA 120mg, Salmon Oil, Mixed Tocopherols', 'Supplement: Omega Bites Dog', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #10 Omega Bites Cat — ~8 kcal/tablet (~2.5g)
  ('a110e1f2a3b4c5d6e7f8a9b0c1d20010', 'dd10e1f2a3b4c5d6e7f8a9b0c1d2e3f4', 320, 0, 7, 0, 5, 0, 0, 0, 2.5, 0, 0, 2.5, 'EPA, DHA, Vitamin E, Fish Oil', 'Supplement: Omega Bites Cat', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #11 Omega-3 Pet — ~9 kcal/ml
  ('a111f2a3b4c5d6e7f8a9b0c1d2e30011', 'ee11f2a3b4c5d6e7f8a9b0c1d2e3f4a5', 900, 0, 100, 0, 0, 0, 0, 0, 15.0, 0, 0, 1.0, 'EPA 425mg, DHA 850mg, Anchovy/Sardine Oil', 'Supplement: Omega-3 Pet', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #12 Omega-3 Cat — ~9 kcal/ml
  ('a112a3b4c5d6e7f8a9b0c1d2e3f40012', 'ff12a3b4c5d6e7f8a9b0c1d2e3f4a5b6', 900, 0, 100, 0, 0, 0, 0, 0, 12.0, 0, 0, 1.0, 'EPA, DHA, Fish Oil (Anchovy/Sardine)', 'Supplement: Omega-3 Cat', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #13 Canine Plus Senior — ~3 kcal/tablet (~2g)
  ('a113b4c5d6e7f8a9b0c1d2e3f4a50013', 'aa13b4c5d6e7f8a9b0c1d2e3f4a5b6c7', 150, 0, 0, 0, 5, 0, 1.0, 0.5, 0, 0, 0, 2.0, 'Multivitamin complex, Chelated Minerals, Omega-3', 'Supplement: Canine Plus Senior', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #14 Welactin Canine — ~10 kcal/ml
  ('a114c5d6e7f8a9b0c1d2e3f4a5b60014', 'bb14c5d6e7f8a9b0c1d2e3f4a5b6c7d8', 900, 0, 100, 0, 0, 0, 0, 0, 18.0, 0, 0, 1.0, 'Omega-3 Fatty Acids (EPA+DHA), Vitamin E, Fish Oil', 'Supplement: Welactin Canine', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #15 Rx Joint Care — ~2 kcal/tablet (~1.5g)
  ('a115d6e7f8a9b0c1d2e3f4a5b6c70015', 'cc15d6e7f8a9b0c1d2e3f4a5b6c7d8e9', 133, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.5, 'Rx-Glucosamine Complex, Hyaluronic Acid', 'Supplement: Rx Joint Care (prescription)', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #16 Rx Kidney Care — ~0 kcal/scoop
  ('a116e7f8a9b0c1d2e3f4a5b6c7d80016', 'dd16e7f8a9b0c1d2e3f4a5b6c7d8e9f0', 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 2.0, 'Low Phosphorus Formula, Potassium Citrate, Sodium Bicarbonate', 'Supplement: Rx Kidney Care (prescription)', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #17 Rx Liver Care — ~2 kcal/tablet (~1.5g)
  ('a117f8a9b0c1d2e3f4a5b6c7d8e90017', 'ee17f8a9b0c1d2e3f4a5b6c7d8e9f0a1', 133, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.5, 'S-Adenosylmethionine (SAMe), Milk Thistle (Silymarin)', 'Supplement: Rx Liver Care (prescription)', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00'),
  -- #18 Rx Heart Care — ~2 kcal/tablet (~1.5g)
  ('a118a9b0c1d2e3f4a5b6c7d8e9f00018', 'ff18a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 133, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1.5, 'Taurine, L-Carnitine, Coenzyme Q10', 'Supplement: Rx Heart Care (prescription)', 'active', '2026-03-11 12:00:00', '2026-03-11 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 7. MAPPING TABLES =====

-- 7-A. feed_manufacturer_type_map (manufacturer <-> supplement type)
INSERT INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
VALUES
  -- Zoetis: joint
  (md5('suppl_mfr_type_zoetis_joint'),          'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'mi-suppl-joint',        '2026-03-11 12:00:00'),
  -- Vetri-Science: joint, vitamin
  (md5('suppl_mfr_type_vetri_joint'),           'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-joint',        '2026-03-11 12:00:00'),
  (md5('suppl_mfr_type_vetri_vitamin'),         'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'mi-suppl-vitamin',      '2026-03-11 12:00:00'),
  -- Purina: digestive
  (md5('suppl_mfr_type_purina_digestive'),      'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'mi-suppl-digestive',    '2026-03-11 12:00:00'),
  -- Nutramax: digestive, skin-coat
  (md5('suppl_mfr_type_nutramax_digestive'),    'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-digestive',    '2026-03-11 12:00:00'),
  (md5('suppl_mfr_type_nutramax_skin_coat'),    'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'mi-suppl-skin-coat',    '2026-03-11 12:00:00'),
  -- Zesty Paws: skin-coat
  (md5('suppl_mfr_type_zesty_skin_coat'),       'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'mi-suppl-skin-coat',    '2026-03-11 12:00:00'),
  -- Nordic Naturals: skin-coat
  (md5('suppl_mfr_type_nordic_skin_coat'),      'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'mi-suppl-skin-coat',    '2026-03-11 12:00:00'),
  -- Rx Only: prescription
  (md5('suppl_mfr_type_rx_prescription'),       'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'mi-suppl-prescription', '2026-03-11 12:00:00')
ON CONFLICT DO NOTHING;

-- 7-B. feed_brand_manufacturer_map (brand <-> manufacturer)
INSERT INTO feed_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at)
VALUES
  (md5('suppl_brand_mfr_cosequin_zoetis'),      'b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', '2026-03-11 12:00:00'),
  (md5('suppl_brand_mfr_vetri_vetri'),          'c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', '2026-03-11 12:00:00'),
  (md5('suppl_brand_mfr_purina_pp_purina'),     'd3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', '2026-03-11 12:00:00'),
  (md5('suppl_brand_mfr_proviable_nutramax'),   'e4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', '2026-03-11 12:00:00'),
  (md5('suppl_brand_mfr_welactin_nutramax'),    'f5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', '2026-03-11 12:00:00'),
  (md5('suppl_brand_mfr_zesty_zesty'),          'a6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', '2026-03-11 12:00:00'),
  (md5('suppl_brand_mfr_nordic_nordic'),        'b7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', '2026-03-11 12:00:00'),
  (md5('suppl_brand_mfr_rx_rx'),                'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', '2026-03-11 12:00:00')
ON CONFLICT DO NOTHING;

-- 7-C. feed_model_brand_map (model <-> brand)
INSERT INTO feed_model_brand_map (id, model_id, brand_id, created_at)
VALUES
  -- Cosequin models
  (md5('suppl_model_brand_cosequin_ds'),        'aa01b2c3d4e5f6a7b8c9d0e1f2a3b4c5', 'b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_cosequin_max'),       'bb02c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', '2026-03-11 12:00:00'),
  -- Vetri-Science models
  (md5('suppl_model_brand_glycoflex_s1'),       'cc03d4e5f6a7b8c9d0e1f2a3b4c5d6e7', 'c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_glycoflex_s3'),       'dd04e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_canine_plus_sr'),     'aa13b4c5d6e7f8a9b0c1d2e3f4a5b6c7', 'c2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', '2026-03-11 12:00:00'),
  -- Purina Pro Plan models
  (md5('suppl_model_brand_fortiflora_dog'),     'ee05f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 'd3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_fortiflora_cat'),     'ff06a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'd3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', '2026-03-11 12:00:00'),
  -- Proviable models
  (md5('suppl_model_brand_proviable_dc'),       'aa07b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'e4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_proviable_forte'),    'bb08c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'e4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', '2026-03-11 12:00:00'),
  -- Zesty Paws models
  (md5('suppl_model_brand_omega_bites_dog'),    'cc09d0e1f2a3b4c5d6e7f8a9b0c1d2e3', 'a6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_omega_bites_cat'),    'dd10e1f2a3b4c5d6e7f8a9b0c1d2e3f4', 'a6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', '2026-03-11 12:00:00'),
  -- Nordic Naturals models
  (md5('suppl_model_brand_omega3_pet'),         'ee11f2a3b4c5d6e7f8a9b0c1d2e3f4a5', 'b7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_omega3_cat'),         'ff12a3b4c5d6e7f8a9b0c1d2e3f4a5b6', 'b7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', '2026-03-11 12:00:00'),
  -- Welactin models
  (md5('suppl_model_brand_welactin_canine'),    'bb14c5d6e7f8a9b0c1d2e3f4a5b6c7d8', 'f5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', '2026-03-11 12:00:00'),
  -- Rx Only models
  (md5('suppl_model_brand_rx_joint'),           'cc15d6e7f8a9b0c1d2e3f4a5b6c7d8e9', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_rx_kidney'),          'dd16e7f8a9b0c1d2e3f4a5b6c7d8e9f0', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_rx_liver'),           'ee17f8a9b0c1d2e3f4a5b6c7d8e9f0a1', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', '2026-03-11 12:00:00'),
  (md5('suppl_model_brand_rx_heart'),           'ff18a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 'c8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', '2026-03-11 12:00:00')
ON CONFLICT DO NOTHING;

-- ===== 8. I18N TRANSLATIONS =====
-- Category (1) + Types (6) + Manufacturers (7) + Brands (8) = 22 rows
INSERT INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
  -- Master category label
  (md5('i18n_master_supplement_type'), 'master.supplement_type', 'master', true,
    '영양제 유형', 'Supplement Type',
    'サプリメントタイプ', '营养补充剂类型', '營養補充劑類型',
    'Tipo de Suplemento', 'Type de Supplement', 'Erganzungstyp',
    'Tipo de Suplemento', 'Loai Thuc Pham Bo Sung', 'ประเภทอาหารเสริม',
    'Jenis Suplemen', 'نوع المكمل',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  -- Supplement type labels (6)
  (md5('i18n_suppl_type_joint'), 'master.supplement_type.joint_supplement_core', 'master', true,
    '관절 영양제', 'Joint Supplement',
    '関節サプリ', '关节营养品', '關節營養品',
    'Suplemento Articular', 'Supplement Articulaire', 'Gelenkerganzung',
    'Suplemento Articular', 'Bo Sung Khop', 'อาหารเสริมข้อต่อ',
    'Suplemen Sendi', 'مكمل المفاصل',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_digestive'), 'master.supplement_type.digestive_supplement_core', 'master', true,
    '소화 영양제', 'Digestive Supplement',
    '消化サプリ', '消化营养品', '消化營養品',
    'Suplemento Digestivo', 'Supplement Digestif', 'Verdauungserganzung',
    'Suplemento Digestivo', 'Bo Sung Tieu Hoa', 'อาหารเสริมระบบย่อยอาหาร',
    'Suplemen Pencernaan', 'مكمل الجهاز الهضمي',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_vitamin'), 'master.supplement_type.vitamin_supplement_core', 'master', true,
    '비타민 영양제', 'Vitamin Supplement',
    'ビタミンサプリ', '维生素营养品', '維生素營養品',
    'Suplemento Vitaminico', 'Supplement Vitaminique', 'Vitaminerganzung',
    'Suplemento Vitaminico', 'Bo Sung Vitamin', 'อาหารเสริมวิตามิน',
    'Suplemen Vitamin', 'مكمل فيتامين',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_skin_coat'), 'master.supplement_type.skin_coat_supplement_core', 'master', true,
    '피부/모질 영양제', 'Skin & Coat Supplement',
    '皮膚・被毛サプリ', '皮肤毛发营养品', '皮膚毛髮營養品',
    'Suplemento Piel y Pelaje', 'Supplement Peau et Pelage', 'Haut- & Fellerganzung',
    'Suplemento Pele e Pelagem', 'Bo Sung Da Long', 'อาหารเสริมผิวหนังและขน',
    'Suplemen Kulit & Bulu', 'مكمل البشرة والفراء',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_immune'), 'master.supplement_type.immune_supplement_core', 'master', true,
    '면역 영양제', 'Immune Supplement',
    '免疫サプリ', '免疫营养品', '免疫營養品',
    'Suplemento Inmunologico', 'Supplement Immunitaire', 'Immunerganzung',
    'Suplemento Imunologico', 'Bo Sung Mien Dich', 'อาหารเสริมภูมิคุ้มกัน',
    'Suplemen Imun', 'مكمل المناعة',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_prescription'), 'master.supplement_type.prescription_supplement_core', 'master', true,
    '처방 영양제', 'Prescription Supplement',
    '処方サプリ', '处方营养品', '處方營養品',
    'Suplemento con Receta', 'Supplement sur Ordonnance', 'Verschreibungspflichtiges Erganzungsmittel',
    'Suplemento com Receita', 'Bo Sung Theo Don', 'อาหารเสริมตามใบสั่ง',
    'Suplemen Resep', 'مكمل بوصفة طبية',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  -- Manufacturer i18n (7)
  (md5('i18n_suppl_mfr_zoetis'), 'supplement.manufacturer.zoetis', 'supplement', true,
    'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_vetri'), 'supplement.manufacturer.vetri_science', 'supplement', true,
    '벳트리사이언스', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_purina'), 'supplement.manufacturer.purina_suppl', 'supplement', true,
    '퓨리나', 'Purina',
    'ピュリナ', '普瑞纳', '普瑞納',
    'Purina', 'Purina', 'Purina',
    'Purina', 'Purina', 'Purina',
    'Purina', 'بيورينا',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_nutramax'), 'supplement.manufacturer.nutramax', 'supplement', true,
    'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_zesty'), 'supplement.manufacturer.zesty_paws', 'supplement', true,
    '제스티포즈', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_nordic'), 'supplement.manufacturer.nordic_naturals', 'supplement', true,
    '노르딕내추럴스', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_rx'), 'supplement.manufacturer.rx_only', 'supplement', true,
    '처방전용', 'Rx Only',
    '処方専用', '处方专用', '處方專用',
    'Solo con Receta', 'Ordonnance Uniquement', 'Nur auf Rezept',
    'Somente com Receita', 'Chi Theo Don', 'ตามใบสั่งยาเท่านั้น',
    'Resep Saja', 'بوصفة طبية فقط',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  -- Brand i18n (8)
  (md5('i18n_suppl_brand_cosequin'), 'supplement.brand.cosequin', 'supplement', true,
    'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_vetri'), 'supplement.brand.vetri_science', 'supplement', true,
    'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_purina_pp'), 'supplement.brand.purina_pro_plan', 'supplement', true,
    '프로플랜', 'Purina Pro Plan',
    'ピュリナ プロプラン', '普瑞纳冠能', '普瑞納冠能',
    'Purina Pro Plan', 'Purina Pro Plan', 'Purina Pro Plan',
    'Purina Pro Plan', 'Purina Pro Plan', 'Purina Pro Plan',
    'Purina Pro Plan', 'بيورينا برو بلان',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_proviable'), 'supplement.brand.proviable', 'supplement', true,
    'Proviable', 'Proviable',
    'Proviable', 'Proviable', 'Proviable',
    'Proviable', 'Proviable', 'Proviable',
    'Proviable', 'Proviable', 'Proviable',
    'Proviable', 'Proviable',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_welactin'), 'supplement.brand.welactin', 'supplement', true,
    'Welactin', 'Welactin',
    'Welactin', 'Welactin', 'Welactin',
    'Welactin', 'Welactin', 'Welactin',
    'Welactin', 'Welactin', 'Welactin',
    'Welactin', 'Welactin',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_zesty'), 'supplement.brand.zesty_paws', 'supplement', true,
    'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_nordic'), 'supplement.brand.nordic_naturals', 'supplement', true,
    'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_rx'), 'supplement.brand.rx_only', 'supplement', true,
    '처방전용', 'Rx Only',
    '処方専用', '处方专用', '處方專用',
    'Solo con Receta', 'Ordonnance Uniquement', 'Nur auf Rezept',
    'Somente com Receita', 'Chi Theo Don', 'ตามใบสั่งยาเท่านั้น',
    'Resep Saja', 'بوصفة طبية فقط',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00')
ON CONFLICT (key) DO NOTHING;
