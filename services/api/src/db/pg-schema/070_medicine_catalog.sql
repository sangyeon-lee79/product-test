-- ============================================================================
-- 070_medicine_catalog.sql
-- Medicine catalog — reuses feed_manufacturers/brands/models tables
-- with category_type='medicine' to distinguish from feed/supplement entries.
-- 9 manufacturers, 30 brands, 30 models, mappings + i18n
-- All IDs are pre-computed — idempotent (ON CONFLICT DO NOTHING)
-- ============================================================================

-- ===== 1. MASTER CATEGORY + 10 TYPES =====
INSERT INTO master_categories (id, code, sort_order, status, created_at, updated_at)
VALUES ('mc-medicine-category', 'medicine_category', 220, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_items (id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at) VALUES
  ('mi-med-insulin',        'mc-medicine-category', 'insulin_medicine_core',        NULL, 1,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-antibiotic',     'mc-medicine-category', 'antibiotic_medicine_core',     NULL, 2,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-pain-relief',    'mc-medicine-category', 'pain_relief_medicine_core',    NULL, 3,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-digestive',      'mc-medicine-category', 'digestive_medicine_core',      NULL, 4,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-heart',          'mc-medicine-category', 'heart_medicine_core',          NULL, 5,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-kidney',         'mc-medicine-category', 'kidney_medicine_core',         NULL, 6,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-skin',           'mc-medicine-category', 'skin_medicine_core',           NULL, 7,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-eye-ear',        'mc-medicine-category', 'eye_ear_medicine_core',        NULL, 8,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-antiparasitic',  'mc-medicine-category', 'antiparasitic_medicine_core',  NULL, 9,  'active', '{"prescribed":true}', NOW(), NOW()),
  ('mi-med-other',          'mc-medicine-category', 'other_medicine_core',          NULL, 10, 'active', '{"prescribed":true}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 2. MANUFACTURERS (9) =====
INSERT INTO feed_manufacturers (id, key, name_key, name_ko, name_en, country, status, sort_order, category_type, created_at, updated_at)
VALUES
  ('med-mfr-zoetis-00000000000000001', 'med_mfr_zoetis',       'medicine.manufacturer.zoetis',       'Zoetis',                'Zoetis',                'US', 'active', 101, 'medicine', NOW(), NOW()),
  ('med-mfr-novonordisk-0000000001', 'med_mfr_novo_nordisk', 'medicine.manufacturer.novo_nordisk', '노보노디스크',          'Novo Nordisk',          'DK', 'active', 102, 'medicine', NOW(), NOW()),
  ('med-mfr-boehringer-00000000001', 'med_mfr_boehringer',   'medicine.manufacturer.boehringer',   '베링거인겔하임',        'Boehringer Ingelheim',  'DE', 'active', 103, 'medicine', NOW(), NOW()),
  ('med-mfr-dechra-000000000000001', 'med_mfr_dechra',       'medicine.manufacturer.dechra',       'Dechra',                'Dechra',                'GB', 'active', 104, 'medicine', NOW(), NOW()),
  ('med-mfr-virbac-000000000000001', 'med_mfr_virbac',       'medicine.manufacturer.virbac',       'Virbac',                'Virbac',                'FR', 'active', 105, 'medicine', NOW(), NOW()),
  ('med-mfr-elanco-000000000000001', 'med_mfr_elanco',       'medicine.manufacturer.elanco',       'Elanco',                'Elanco',                'US', 'active', 106, 'medicine', NOW(), NOW()),
  ('med-mfr-msd-0000000000000000001', 'med_mfr_msd',           'medicine.manufacturer.msd',           'MSD 동물약품',          'MSD Animal Health',     'US', 'active', 107, 'medicine', NOW(), NOW()),
  ('med-mfr-vetoquinol-0000000001', 'med_mfr_vetoquinol',   'medicine.manufacturer.vetoquinol',   'Vetoquinol',            'Vetoquinol',            'FR', 'active', 108, 'medicine', NOW(), NOW()),
  ('med-mfr-drray-000000000000001', 'med_mfr_drray',         'medicine.manufacturer.drray',         'Dr.Ray',                'Dr.Ray',                'KR', 'active', 109, 'medicine', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 3. BRANDS (30) =====
INSERT INTO feed_brands (id, manufacturer_id, name_key, name_ko, name_en, status, category_type, created_at, updated_at)
VALUES
  -- Zoetis brands
  ('med-brand-caninsulin-000000001', 'med-mfr-zoetis-00000000000000001', 'medicine.brand.caninsulin',  '캐닌슐린',    'Caninsulin',  'active', 'medicine', NOW(), NOW()),
  ('med-brand-convenia-0000000001', 'med-mfr-zoetis-00000000000000001', 'medicine.brand.convenia',   'Convenia',    'Convenia',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-rimadyl-00000000001', 'med-mfr-zoetis-00000000000000001', 'medicine.brand.rimadyl',    'Rimadyl',     'Rimadyl',     'active', 'medicine', NOW(), NOW()),
  ('med-brand-cerenia-00000000001', 'med-mfr-zoetis-00000000000000001', 'medicine.brand.cerenia',    'Cerenia',     'Cerenia',     'active', 'medicine', NOW(), NOW()),
  ('med-brand-cytopoint-000000001', 'med-mfr-zoetis-00000000000000001', 'medicine.brand.cytopoint',  'Cytopoint',   'Cytopoint',   'active', 'medicine', NOW(), NOW()),
  ('med-brand-apoquel-00000000001', 'med-mfr-zoetis-00000000000000001', 'medicine.brand.apoquel',    'Apoquel',     'Apoquel',     'active', 'medicine', NOW(), NOW()),
  ('med-brand-revolution-0000001', 'med-mfr-zoetis-00000000000000001', 'medicine.brand.revolution', 'Revolution',  'Revolution',  'active', 'medicine', NOW(), NOW()),
  -- Novo Nordisk brands
  ('med-brand-vetsulin-0000000001', 'med-mfr-novonordisk-0000000001',   'medicine.brand.vetsulin',   '벳슐린',      'Vetsulin',    'active', 'medicine', NOW(), NOW()),
  -- Boehringer Ingelheim brands
  ('med-brand-prozinc-00000000001', 'med-mfr-boehringer-00000000001',   'medicine.brand.prozinc',    '프로징크',    'ProZinc',     'active', 'medicine', NOW(), NOW()),
  ('med-brand-metacam-00000000001', 'med-mfr-boehringer-00000000001',   'medicine.brand.metacam',    'Metacam',     'Metacam',     'active', 'medicine', NOW(), NOW()),
  ('med-brand-vetmedin-0000000001', 'med-mfr-boehringer-00000000001',   'medicine.brand.vetmedin',   'Vetmedin',    'Vetmedin',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-semintra-0000000001', 'med-mfr-boehringer-00000000001',   'medicine.brand.semintra',   'Semintra',    'Semintra',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-nexgard-00000000001', 'med-mfr-boehringer-00000000001',   'medicine.brand.nexgard',    'NexGard',     'NexGard',     'active', 'medicine', NOW(), NOW()),
  -- Dechra brands
  ('med-brand-clavamox-0000000001', 'med-mfr-dechra-000000000000001',   'medicine.brand.clavamox',   'Clavamox',    'Clavamox',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-canidryl-0000000001', 'med-mfr-dechra-000000000000001',   'medicine.brand.canidryl',   'Canidryl',    'Canidryl',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-onsior-000000000001', 'med-mfr-dechra-000000000000001',   'medicine.brand.onsior',     'Onsior',      'Onsior',      'active', 'medicine', NOW(), NOW()),
  ('med-brand-cardisure-000000001', 'med-mfr-dechra-000000000000001',   'medicine.brand.cardisure',  'Cardisure',   'Cardisure',   'active', 'medicine', NOW(), NOW()),
  ('med-brand-posatex-00000000001', 'med-mfr-dechra-000000000000001',   'medicine.brand.posatex',    'Posatex',     'Posatex',     'active', 'medicine', NOW(), NOW()),
  -- Virbac brands
  ('med-brand-rilexine-0000000001', 'med-mfr-virbac-000000000000001',   'medicine.brand.rilexine',   'Rilexine',    'Rilexine',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-enterosgel-0000001', 'med-mfr-virbac-000000000000001',   'medicine.brand.enterosgel', 'Enterosgel',  'Enterosgel',  'active', 'medicine', NOW(), NOW()),
  ('med-brand-marbocyl-0000000001', 'med-mfr-virbac-000000000000001',   'medicine.brand.marbocyl',   'Marbocyl',    'Marbocyl',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-cortavance-0000001', 'med-mfr-virbac-000000000000001',   'medicine.brand.cortavance', 'Cortavance',  'Cortavance',  'active', 'medicine', NOW(), NOW()),
  -- Elanco brands
  ('med-brand-baytril-00000000001', 'med-mfr-elanco-000000000000001',   'medicine.brand.baytril',    'Baytril',     'Baytril',     'active', 'medicine', NOW(), NOW()),
  ('med-brand-galliprant-0000001', 'med-mfr-elanco-000000000000001',   'medicine.brand.galliprant', 'Galliprant',  'Galliprant',  'active', 'medicine', NOW(), NOW()),
  ('med-brand-epakitin-0000000001', 'med-mfr-elanco-000000000000001',   'medicine.brand.epakitin',   'Epakitin',    'Epakitin',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-credelio-0000000001', 'med-mfr-elanco-000000000000001',   'medicine.brand.credelio',   'Credelio',    'Credelio',    'active', 'medicine', NOW(), NOW()),
  ('med-brand-interceptor-000001', 'med-mfr-elanco-000000000000001',   'medicine.brand.interceptor','Interceptor', 'Interceptor', 'active', 'medicine', NOW(), NOW()),
  -- MSD brands
  ('med-brand-bravecto-0000000001', 'med-mfr-msd-0000000000000000001', 'medicine.brand.bravecto',   'Bravecto',    'Bravecto',    'active', 'medicine', NOW(), NOW()),
  -- Vetoquinol brands
  ('med-brand-ipakitine-000000001', 'med-mfr-vetoquinol-0000000001',   'medicine.brand.ipakitine',  'Ipakitine',   'Ipakitine',   'active', 'medicine', NOW(), NOW()),
  -- Dr.Ray brands
  ('med-brand-pancreta-0000000001', 'med-mfr-drray-000000000000001',   'medicine.brand.pancreta',   '판크레타',    'Pancreta',    'active', 'medicine', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 4. MODELS (30) =====
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, status, category_type, created_at, updated_at)
VALUES
  -- Insulin (3)
  ('med-model-caninsulin40-00001', 'mi-med-insulin', 'med-mfr-zoetis-00000000000000001', 'med-brand-caninsulin-000000001', 'medicine.model.caninsulin_40iu',       'Caninsulin 40IU/ml',       'caninsulin-40', '{"administration_route":"injection","dosage_unit":"IU","species":"dog","disease_tags":{"diabetes":true},"prescribed":true,"storage_condition":"refrigerated","product_name_ko":"캐닌슐린"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-vetsulin40-000001', 'mi-med-insulin', 'med-mfr-novonordisk-0000000001',   'med-brand-vetsulin-0000000001',   'medicine.model.vetsulin_40iu',         'Vetsulin 40IU/ml',         'vetsulin-40',   '{"administration_route":"injection","dosage_unit":"IU","species":"dog","disease_tags":{"diabetes":true},"prescribed":true,"storage_condition":"refrigerated","product_name_ko":"벳슐린"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-prozinc40-0000001', 'mi-med-insulin', 'med-mfr-boehringer-00000000001',   'med-brand-prozinc-00000000001',   'medicine.model.prozinc_40iu',          'ProZinc 40IU/ml',          'prozinc-40',    '{"administration_route":"injection","dosage_unit":"IU","species":"cat","disease_tags":{"diabetes":true},"prescribed":true,"storage_condition":"refrigerated","product_name_ko":"프로징크"}', 'active', 'medicine', NOW(), NOW()),

  -- Antibiotic (4)
  ('med-model-convenia80-000001', 'mi-med-antibiotic', 'med-mfr-zoetis-00000000000000001', 'med-brand-convenia-0000000001',   'medicine.model.convenia_80mg',         'Convenia 80mg/ml',         'convenia-80',   '{"administration_route":"injection","dosage_unit":"mg","species":"both","disease_tags":{},"prescribed":true,"storage_condition":"refrigerated"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-clavamox625-0001', 'mi-med-antibiotic', 'med-mfr-dechra-000000000000001',   'med-brand-clavamox-0000000001',   'medicine.model.clavamox_625mg',        'Clavamox 62.5mg',          'clavamox-625',  '{"administration_route":"oral","dosage_unit":"tablet","species":"both","disease_tags":{},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-rilexine300-0001', 'mi-med-antibiotic', 'med-mfr-virbac-000000000000001',   'med-brand-rilexine-0000000001',   'medicine.model.rilexine_300mg',        'Rilexine 300mg',           'rilexine-300',  '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-baytril50-000001', 'mi-med-antibiotic', 'med-mfr-elanco-000000000000001',   'med-brand-baytril-00000000001',   'medicine.model.baytril_50mg',          'Baytril 50mg',             'baytril-50',    '{"administration_route":"oral","dosage_unit":"tablet","species":"both","disease_tags":{},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),

  -- Pain Relief (5)
  ('med-model-rimadyl100-000001', 'mi-med-pain-relief', 'med-mfr-zoetis-00000000000000001', 'med-brand-rimadyl-00000000001',   'medicine.model.rimadyl_100mg',         'Rimadyl 100mg',            'rimadyl-100',   '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"pain":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-galliprant20-001', 'mi-med-pain-relief', 'med-mfr-elanco-000000000000001',   'med-brand-galliprant-0000001',    'medicine.model.galliprant_20mg',       'Galliprant 20mg',          'galliprant-20', '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"pain":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-canidryl50-00001', 'mi-med-pain-relief', 'med-mfr-dechra-000000000000001',   'med-brand-canidryl-0000000001',   'medicine.model.canidryl_50mg',         'Canidryl 50mg',            'canidryl-50',   '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"pain":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-metacam15-000001', 'mi-med-pain-relief', 'med-mfr-boehringer-00000000001',   'med-brand-metacam-00000000001',   'medicine.model.metacam_15mg',          'Metacam 1.5mg/ml',         'metacam-15',    '{"administration_route":"oral","dosage_unit":"ml","species":"both","disease_tags":{"pain":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-onsior6-00000001', 'mi-med-pain-relief', 'med-mfr-dechra-000000000000001',   'med-brand-onsior-000000000001',   'medicine.model.onsior_6mg',            'Onsior 6mg',               'onsior-6',      '{"administration_route":"oral","dosage_unit":"tablet","species":"cat","disease_tags":{"pain":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),

  -- Heart (3)
  ('med-model-vetmedin125-0001', 'mi-med-heart', 'med-mfr-boehringer-00000000001',   'med-brand-vetmedin-0000000001',   'medicine.model.vetmedin_125mg',        'Vetmedin 1.25mg',          'vetmedin-125',  '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"heart":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-vetmedin5-000001', 'mi-med-heart', 'med-mfr-boehringer-00000000001',   'med-brand-vetmedin-0000000001',   'medicine.model.vetmedin_5mg',          'Vetmedin 5mg',             'vetmedin-5',    '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"heart":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-cardisure5-00001', 'mi-med-heart', 'med-mfr-dechra-000000000000001',   'med-brand-cardisure-000000001',   'medicine.model.cardisure_5mg',         'Cardisure 5mg',            'cardisure-5',   '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"heart":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),

  -- Kidney (3)
  ('med-model-semintra4-000001', 'mi-med-kidney', 'med-mfr-boehringer-00000000001',   'med-brand-semintra-0000000001',   'medicine.model.semintra_4mg',          'Semintra 4mg/ml',          'semintra-4',    '{"administration_route":"oral","dosage_unit":"ml","species":"cat","disease_tags":{"kidney":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-epakitin-0000001', 'mi-med-kidney', 'med-mfr-elanco-000000000000001',   'med-brand-epakitin-0000000001',   'medicine.model.epakitin',              'Epakitin',                 'epakitin',      '{"administration_route":"oral","dosage_unit":"scoop","species":"both","disease_tags":{"kidney":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-ipakitine-000001', 'mi-med-kidney', 'med-mfr-vetoquinol-0000000001',   'med-brand-ipakitine-000000001',   'medicine.model.ipakitine',             'Ipakitine',                'ipakitine',     '{"administration_route":"oral","dosage_unit":"scoop","species":"both","disease_tags":{"kidney":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),

  -- Antiparasitic (5)
  ('med-model-revolution-plus1', 'mi-med-antiparasitic', 'med-mfr-zoetis-00000000000000001', 'med-brand-revolution-0000001', 'medicine.model.revolution_plus',       'Revolution Plus',          'revolution-plus','{"administration_route":"topical","dosage_unit":"ml","species":"cat","disease_tags":{"parasite":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-credelio450-001', 'mi-med-antiparasitic', 'med-mfr-elanco-000000000000001',   'med-brand-credelio-0000000001', 'medicine.model.credelio_450mg',        'Credelio 450mg',           'credelio-450',  '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"parasite":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-nexgard68-00001', 'mi-med-antiparasitic', 'med-mfr-boehringer-00000000001',   'med-brand-nexgard-00000000001', 'medicine.model.nexgard_68mg',          'NexGard 68mg',             'nexgard-68',    '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"parasite":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-bravecto500-001', 'mi-med-antiparasitic', 'med-mfr-msd-0000000000000000001', 'med-brand-bravecto-0000000001', 'medicine.model.bravecto_500mg',        'Bravecto 500mg',           'bravecto-500',  '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"parasite":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-interceptor-plus', 'mi-med-antiparasitic', 'med-mfr-elanco-000000000000001',   'med-brand-interceptor-000001', 'medicine.model.interceptor_plus',      'Interceptor Plus',         'interceptor-plus','{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"parasite":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),

  -- Digestive (4)
  ('med-model-enterosgel-00001', 'mi-med-digestive', 'med-mfr-virbac-000000000000001',   'med-brand-enterosgel-0000001', 'medicine.model.enterosgel',            'Enterosgel',               'enterosgel',    '{"administration_route":"oral","dosage_unit":"ml","species":"both","disease_tags":{},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-pancreta60-00001', 'mi-med-digestive', 'med-mfr-drray-000000000000001',   'med-brand-pancreta-0000000001', 'medicine.model.pancreta_60cap',        'Pancreta 60cap',           'pancreta-60',   '{"administration_route":"oral","dosage_unit":"capsule","species":"both","disease_tags":{},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-cerenia16-000001', 'mi-med-digestive', 'med-mfr-zoetis-00000000000000001', 'med-brand-cerenia-00000000001', 'medicine.model.cerenia_16mg',          'Cerenia 16mg',             'cerenia-16',    '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-marbocyl25-00001', 'mi-med-digestive', 'med-mfr-virbac-000000000000001',   'med-brand-marbocyl-0000000001', 'medicine.model.marbocyl_25mg',         'Marbocyl 25mg',            'marbocyl-25',   '{"administration_route":"oral","dosage_unit":"tablet","species":"both","disease_tags":{},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),

  -- Skin (4)
  ('med-model-cytopoint20-0001', 'mi-med-skin', 'med-mfr-zoetis-00000000000000001', 'med-brand-cytopoint-000000001', 'medicine.model.cytopoint_20mg',        'Cytopoint 20mg',           'cytopoint-20',  '{"administration_route":"injection","dosage_unit":"mg","species":"dog","disease_tags":{"skin":true},"prescribed":true,"storage_condition":"refrigerated"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-apoquel36-000001', 'mi-med-skin', 'med-mfr-zoetis-00000000000000001', 'med-brand-apoquel-00000000001', 'medicine.model.apoquel_36mg',          'Apoquel 3.6mg',            'apoquel-36',    '{"administration_route":"oral","dosage_unit":"tablet","species":"dog","disease_tags":{"skin":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-posatex-00000001', 'mi-med-skin', 'med-mfr-dechra-000000000000001',   'med-brand-posatex-00000000001', 'medicine.model.posatex',               'Posatex',                  'posatex',       '{"administration_route":"ear_drop","dosage_unit":"ml","species":"dog","disease_tags":{"skin":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW()),
  ('med-model-cortavance-00001', 'mi-med-skin', 'med-mfr-virbac-000000000000001',   'med-brand-cortavance-0000001', 'medicine.model.cortavance',            'Cortavance',               'cortavance',    '{"administration_route":"topical","dosage_unit":"ml","species":"dog","disease_tags":{"skin":true},"prescribed":true,"storage_condition":"room_temp"}', 'active', 'medicine', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== 5. MAPPING TABLES =====

-- 5-A. feed_manufacturer_type_map (manufacturer <-> medicine type)
INSERT INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at) VALUES
  -- Zoetis: insulin, antibiotic, pain_relief, digestive, skin, antiparasitic
  (md5('med_mfr_type_zoetis_insulin'),       'med-mfr-zoetis-00000000000000001', 'mi-med-insulin',       NOW()),
  (md5('med_mfr_type_zoetis_antibiotic'),    'med-mfr-zoetis-00000000000000001', 'mi-med-antibiotic',    NOW()),
  (md5('med_mfr_type_zoetis_pain'),          'med-mfr-zoetis-00000000000000001', 'mi-med-pain-relief',   NOW()),
  (md5('med_mfr_type_zoetis_digestive'),     'med-mfr-zoetis-00000000000000001', 'mi-med-digestive',     NOW()),
  (md5('med_mfr_type_zoetis_skin'),          'med-mfr-zoetis-00000000000000001', 'mi-med-skin',          NOW()),
  (md5('med_mfr_type_zoetis_antiparasitic'), 'med-mfr-zoetis-00000000000000001', 'mi-med-antiparasitic', NOW()),
  -- Novo Nordisk: insulin
  (md5('med_mfr_type_novo_insulin'),         'med-mfr-novonordisk-0000000001',   'mi-med-insulin',       NOW()),
  -- Boehringer Ingelheim: insulin, pain_relief, heart, kidney, antiparasitic
  (md5('med_mfr_type_boeh_insulin'),         'med-mfr-boehringer-00000000001',   'mi-med-insulin',       NOW()),
  (md5('med_mfr_type_boeh_pain'),            'med-mfr-boehringer-00000000001',   'mi-med-pain-relief',   NOW()),
  (md5('med_mfr_type_boeh_heart'),           'med-mfr-boehringer-00000000001',   'mi-med-heart',         NOW()),
  (md5('med_mfr_type_boeh_kidney'),          'med-mfr-boehringer-00000000001',   'mi-med-kidney',        NOW()),
  (md5('med_mfr_type_boeh_antiparasitic'),   'med-mfr-boehringer-00000000001',   'mi-med-antiparasitic', NOW()),
  -- Dechra: antibiotic, pain_relief, heart, skin
  (md5('med_mfr_type_dechra_antibiotic'),    'med-mfr-dechra-000000000000001',   'mi-med-antibiotic',    NOW()),
  (md5('med_mfr_type_dechra_pain'),          'med-mfr-dechra-000000000000001',   'mi-med-pain-relief',   NOW()),
  (md5('med_mfr_type_dechra_heart'),         'med-mfr-dechra-000000000000001',   'mi-med-heart',         NOW()),
  (md5('med_mfr_type_dechra_skin'),          'med-mfr-dechra-000000000000001',   'mi-med-skin',          NOW()),
  -- Virbac: antibiotic, digestive, skin
  (md5('med_mfr_type_virbac_antibiotic'),    'med-mfr-virbac-000000000000001',   'mi-med-antibiotic',    NOW()),
  (md5('med_mfr_type_virbac_digestive'),     'med-mfr-virbac-000000000000001',   'mi-med-digestive',     NOW()),
  (md5('med_mfr_type_virbac_skin'),          'med-mfr-virbac-000000000000001',   'mi-med-skin',          NOW()),
  -- Elanco: antibiotic, pain_relief, kidney, antiparasitic
  (md5('med_mfr_type_elanco_antibiotic'),    'med-mfr-elanco-000000000000001',   'mi-med-antibiotic',    NOW()),
  (md5('med_mfr_type_elanco_pain'),          'med-mfr-elanco-000000000000001',   'mi-med-pain-relief',   NOW()),
  (md5('med_mfr_type_elanco_kidney'),        'med-mfr-elanco-000000000000001',   'mi-med-kidney',        NOW()),
  (md5('med_mfr_type_elanco_antiparasitic'), 'med-mfr-elanco-000000000000001',   'mi-med-antiparasitic', NOW()),
  -- MSD: antiparasitic
  (md5('med_mfr_type_msd_antiparasitic'),    'med-mfr-msd-0000000000000000001', 'mi-med-antiparasitic', NOW()),
  -- Vetoquinol: kidney
  (md5('med_mfr_type_vetoquinol_kidney'),    'med-mfr-vetoquinol-0000000001',   'mi-med-kidney',        NOW()),
  -- Dr.Ray: digestive
  (md5('med_mfr_type_drray_digestive'),      'med-mfr-drray-000000000000001',   'mi-med-digestive',     NOW())
ON CONFLICT DO NOTHING;

-- 5-B. feed_brand_manufacturer_map (brand <-> manufacturer)
INSERT INTO feed_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at) VALUES
  (md5('med_brand_mfr_caninsulin'),  'med-brand-caninsulin-000000001', 'med-mfr-zoetis-00000000000000001', NOW()),
  (md5('med_brand_mfr_convenia'),    'med-brand-convenia-0000000001', 'med-mfr-zoetis-00000000000000001', NOW()),
  (md5('med_brand_mfr_rimadyl'),     'med-brand-rimadyl-00000000001', 'med-mfr-zoetis-00000000000000001', NOW()),
  (md5('med_brand_mfr_cerenia'),     'med-brand-cerenia-00000000001', 'med-mfr-zoetis-00000000000000001', NOW()),
  (md5('med_brand_mfr_cytopoint'),   'med-brand-cytopoint-000000001', 'med-mfr-zoetis-00000000000000001', NOW()),
  (md5('med_brand_mfr_apoquel'),     'med-brand-apoquel-00000000001', 'med-mfr-zoetis-00000000000000001', NOW()),
  (md5('med_brand_mfr_revolution'),  'med-brand-revolution-0000001', 'med-mfr-zoetis-00000000000000001', NOW()),
  (md5('med_brand_mfr_vetsulin'),    'med-brand-vetsulin-0000000001', 'med-mfr-novonordisk-0000000001',   NOW()),
  (md5('med_brand_mfr_prozinc'),     'med-brand-prozinc-00000000001', 'med-mfr-boehringer-00000000001',   NOW()),
  (md5('med_brand_mfr_metacam'),     'med-brand-metacam-00000000001', 'med-mfr-boehringer-00000000001',   NOW()),
  (md5('med_brand_mfr_vetmedin'),    'med-brand-vetmedin-0000000001', 'med-mfr-boehringer-00000000001',   NOW()),
  (md5('med_brand_mfr_semintra'),    'med-brand-semintra-0000000001', 'med-mfr-boehringer-00000000001',   NOW()),
  (md5('med_brand_mfr_nexgard'),     'med-brand-nexgard-00000000001', 'med-mfr-boehringer-00000000001',   NOW()),
  (md5('med_brand_mfr_clavamox'),    'med-brand-clavamox-0000000001', 'med-mfr-dechra-000000000000001',   NOW()),
  (md5('med_brand_mfr_canidryl'),    'med-brand-canidryl-0000000001', 'med-mfr-dechra-000000000000001',   NOW()),
  (md5('med_brand_mfr_onsior'),      'med-brand-onsior-000000000001', 'med-mfr-dechra-000000000000001',   NOW()),
  (md5('med_brand_mfr_cardisure'),   'med-brand-cardisure-000000001', 'med-mfr-dechra-000000000000001',   NOW()),
  (md5('med_brand_mfr_posatex'),     'med-brand-posatex-00000000001', 'med-mfr-dechra-000000000000001',   NOW()),
  (md5('med_brand_mfr_rilexine'),    'med-brand-rilexine-0000000001', 'med-mfr-virbac-000000000000001',   NOW()),
  (md5('med_brand_mfr_enterosgel'),  'med-brand-enterosgel-0000001', 'med-mfr-virbac-000000000000001',   NOW()),
  (md5('med_brand_mfr_marbocyl'),    'med-brand-marbocyl-0000000001', 'med-mfr-virbac-000000000000001',   NOW()),
  (md5('med_brand_mfr_cortavance'),  'med-brand-cortavance-0000001', 'med-mfr-virbac-000000000000001',   NOW()),
  (md5('med_brand_mfr_baytril'),     'med-brand-baytril-00000000001', 'med-mfr-elanco-000000000000001',   NOW()),
  (md5('med_brand_mfr_galliprant'),  'med-brand-galliprant-0000001', 'med-mfr-elanco-000000000000001',   NOW()),
  (md5('med_brand_mfr_epakitin'),    'med-brand-epakitin-0000000001', 'med-mfr-elanco-000000000000001',   NOW()),
  (md5('med_brand_mfr_credelio'),    'med-brand-credelio-0000000001', 'med-mfr-elanco-000000000000001',   NOW()),
  (md5('med_brand_mfr_interceptor'), 'med-brand-interceptor-000001', 'med-mfr-elanco-000000000000001',   NOW()),
  (md5('med_brand_mfr_bravecto'),    'med-brand-bravecto-0000000001', 'med-mfr-msd-0000000000000000001', NOW()),
  (md5('med_brand_mfr_ipakitine'),   'med-brand-ipakitine-000000001', 'med-mfr-vetoquinol-0000000001',   NOW()),
  (md5('med_brand_mfr_pancreta'),    'med-brand-pancreta-0000000001', 'med-mfr-drray-000000000000001',   NOW())
ON CONFLICT DO NOTHING;

-- 5-C. feed_model_brand_map (model <-> brand)
INSERT INTO feed_model_brand_map (id, model_id, brand_id, created_at) VALUES
  -- Insulin
  (md5('med_model_brand_caninsulin40'),  'med-model-caninsulin40-00001', 'med-brand-caninsulin-000000001', NOW()),
  (md5('med_model_brand_vetsulin40'),    'med-model-vetsulin40-000001',  'med-brand-vetsulin-0000000001',  NOW()),
  (md5('med_model_brand_prozinc40'),     'med-model-prozinc40-0000001',  'med-brand-prozinc-00000000001',  NOW()),
  -- Antibiotic
  (md5('med_model_brand_convenia80'),    'med-model-convenia80-000001',  'med-brand-convenia-0000000001',  NOW()),
  (md5('med_model_brand_clavamox625'),   'med-model-clavamox625-0001',   'med-brand-clavamox-0000000001',  NOW()),
  (md5('med_model_brand_rilexine300'),   'med-model-rilexine300-0001',   'med-brand-rilexine-0000000001',  NOW()),
  (md5('med_model_brand_baytril50'),     'med-model-baytril50-000001',   'med-brand-baytril-00000000001',  NOW()),
  -- Pain Relief
  (md5('med_model_brand_rimadyl100'),    'med-model-rimadyl100-000001',  'med-brand-rimadyl-00000000001',  NOW()),
  (md5('med_model_brand_galliprant20'),  'med-model-galliprant20-001',   'med-brand-galliprant-0000001',   NOW()),
  (md5('med_model_brand_canidryl50'),    'med-model-canidryl50-00001',   'med-brand-canidryl-0000000001',  NOW()),
  (md5('med_model_brand_metacam15'),     'med-model-metacam15-000001',   'med-brand-metacam-00000000001',  NOW()),
  (md5('med_model_brand_onsior6'),       'med-model-onsior6-00000001',   'med-brand-onsior-000000000001',  NOW()),
  -- Heart
  (md5('med_model_brand_vetmedin125'),   'med-model-vetmedin125-0001',   'med-brand-vetmedin-0000000001',  NOW()),
  (md5('med_model_brand_vetmedin5'),     'med-model-vetmedin5-000001',   'med-brand-vetmedin-0000000001',  NOW()),
  (md5('med_model_brand_cardisure5'),    'med-model-cardisure5-00001',   'med-brand-cardisure-000000001',  NOW()),
  -- Kidney
  (md5('med_model_brand_semintra4'),     'med-model-semintra4-000001',   'med-brand-semintra-0000000001',  NOW()),
  (md5('med_model_brand_epakitin'),      'med-model-epakitin-0000001',   'med-brand-epakitin-0000000001',  NOW()),
  (md5('med_model_brand_ipakitine'),     'med-model-ipakitine-000001',   'med-brand-ipakitine-000000001',  NOW()),
  -- Antiparasitic
  (md5('med_model_brand_revolution'),    'med-model-revolution-plus1',   'med-brand-revolution-0000001',   NOW()),
  (md5('med_model_brand_credelio450'),   'med-model-credelio450-001',    'med-brand-credelio-0000000001',  NOW()),
  (md5('med_model_brand_nexgard68'),     'med-model-nexgard68-00001',    'med-brand-nexgard-00000000001',  NOW()),
  (md5('med_model_brand_bravecto500'),   'med-model-bravecto500-001',    'med-brand-bravecto-0000000001',  NOW()),
  (md5('med_model_brand_interceptor'),   'med-model-interceptor-plus',   'med-brand-interceptor-000001',   NOW()),
  -- Digestive
  (md5('med_model_brand_enterosgel'),    'med-model-enterosgel-00001',   'med-brand-enterosgel-0000001',   NOW()),
  (md5('med_model_brand_pancreta60'),    'med-model-pancreta60-00001',   'med-brand-pancreta-0000000001',  NOW()),
  (md5('med_model_brand_cerenia16'),     'med-model-cerenia16-000001',   'med-brand-cerenia-00000000001',  NOW()),
  (md5('med_model_brand_marbocyl25'),    'med-model-marbocyl25-00001',   'med-brand-marbocyl-0000000001',  NOW()),
  -- Skin
  (md5('med_model_brand_cytopoint20'),   'med-model-cytopoint20-0001',   'med-brand-cytopoint-000000001',  NOW()),
  (md5('med_model_brand_apoquel36'),     'med-model-apoquel36-000001',   'med-brand-apoquel-00000000001',  NOW()),
  (md5('med_model_brand_posatex'),       'med-model-posatex-00000001',   'med-brand-posatex-00000000001',  NOW()),
  (md5('med_model_brand_cortavance'),    'med-model-cortavance-00001',   'med-brand-cortavance-0000001',   NOW())
ON CONFLICT DO NOTHING;

-- ===== 6. I18N — Manufacturer, Brand, Model name_keys =====
INSERT INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
  -- Manufacturers (9)
  (md5('i18n_med_mfr_zoetis'),       'medicine.manufacturer.zoetis',       'medicine', true, 'Zoetis',           'Zoetis',               'Zoetis',               'Zoetis',               'Zoetis',               'Zoetis',           'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       NOW(), NOW()),
  (md5('i18n_med_mfr_novo'),         'medicine.manufacturer.novo_nordisk', 'medicine', true, '노보노디스크',     'Novo Nordisk',         'ノボノルディスク',      '诺和诺德',              '諾和諾德',              'Novo Nordisk',     'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'نوفو نورديسك', NOW(), NOW()),
  (md5('i18n_med_mfr_boehringer'),   'medicine.manufacturer.boehringer',   'medicine', true, '베링거인겔하임',   'Boehringer Ingelheim', 'ベーリンガーインゲルハイム', '勃林格殷格翰',       '勃林格殷格翰',       'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'بورينجر إنجلهايم', NOW(), NOW()),
  (md5('i18n_med_mfr_dechra'),       'medicine.manufacturer.dechra',       'medicine', true, 'Dechra',           'Dechra',               'Dechra',               'Dechra',               'Dechra',               'Dechra',           'Dechra',       'Dechra',       'Dechra',       'Dechra',       'Dechra',       'Dechra',       'Dechra',       NOW(), NOW()),
  (md5('i18n_med_mfr_virbac'),       'medicine.manufacturer.virbac',       'medicine', true, 'Virbac',           'Virbac',               'Virbac',               'Virbac',               'Virbac',               'Virbac',           'Virbac',       'Virbac',       'Virbac',       'Virbac',       'Virbac',       'Virbac',       'Virbac',       NOW(), NOW()),
  (md5('i18n_med_mfr_elanco'),       'medicine.manufacturer.elanco',       'medicine', true, 'Elanco',           'Elanco',               'Elanco',               'Elanco',               'Elanco',               'Elanco',           'Elanco',       'Elanco',       'Elanco',       'Elanco',       'Elanco',       'Elanco',       'Elanco',       NOW(), NOW()),
  (md5('i18n_med_mfr_msd'),          'medicine.manufacturer.msd',          'medicine', true, 'MSD 동물약품',     'MSD Animal Health',    'MSD アニマルヘルス',    'MSD 动物保健',          'MSD 動物保健',          'MSD Salud Animal', 'MSD Sante Animale', 'MSD Tiergesundheit', 'MSD Saude Animal', 'MSD Suc Khoe Dong Vat', 'MSD สุขภาพสัตว์', 'MSD Kesehatan Hewan', 'MSD صحة الحيوان', NOW(), NOW()),
  (md5('i18n_med_mfr_vetoquinol'),   'medicine.manufacturer.vetoquinol',   'medicine', true, 'Vetoquinol',       'Vetoquinol',           'Vetoquinol',           'Vetoquinol',           'Vetoquinol',           'Vetoquinol',       'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   NOW(), NOW()),
  (md5('i18n_med_mfr_drray'),        'medicine.manufacturer.drray',        'medicine', true, 'Dr.Ray',           'Dr.Ray',               'Dr.Ray',               'Dr.Ray',               'Dr.Ray',               'Dr.Ray',           'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       NOW(), NOW()),

  -- Brands (30) — pharma brands are generally the same across languages
  (md5('i18n_med_brand_caninsulin'),  'medicine.brand.caninsulin',  'medicine', true, '캐닌슐린',  'Caninsulin',  'キャニンスリン', '犬胰岛素',  '犬胰島素',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'كانينسولين', NOW(), NOW()),
  (md5('i18n_med_brand_convenia'),    'medicine.brand.convenia',    'medicine', true, 'Convenia',  'Convenia',    'Convenia',       'Convenia',  'Convenia',  'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    NOW(), NOW()),
  (md5('i18n_med_brand_rimadyl'),     'medicine.brand.rimadyl',     'medicine', true, 'Rimadyl',   'Rimadyl',     'Rimadyl',        'Rimadyl',   'Rimadyl',   'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     NOW(), NOW()),
  (md5('i18n_med_brand_cerenia'),     'medicine.brand.cerenia',     'medicine', true, 'Cerenia',   'Cerenia',     'Cerenia',        'Cerenia',   'Cerenia',   'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     NOW(), NOW()),
  (md5('i18n_med_brand_cytopoint'),   'medicine.brand.cytopoint',   'medicine', true, 'Cytopoint', 'Cytopoint',   'サイトポイント', 'Cytopoint', 'Cytopoint', 'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   NOW(), NOW()),
  (md5('i18n_med_brand_apoquel'),     'medicine.brand.apoquel',     'medicine', true, 'Apoquel',   'Apoquel',     'アポキル',       'Apoquel',   'Apoquel',   'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     NOW(), NOW()),
  (md5('i18n_med_brand_revolution'),  'medicine.brand.revolution',  'medicine', true, 'Revolution','Revolution',  'レボリューション','Revolution','Revolution','Revolution', 'Revolution',  'Revolution',  'Revolution',  'Revolution',  'Revolution',  'Revolution',  'Revolution',  NOW(), NOW()),
  (md5('i18n_med_brand_vetsulin'),    'medicine.brand.vetsulin',    'medicine', true, '벳슐린',    'Vetsulin',    'Vetsulin',       'Vetsulin',  'Vetsulin',  'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    NOW(), NOW()),
  (md5('i18n_med_brand_prozinc'),     'medicine.brand.prozinc',     'medicine', true, '프로징크',  'ProZinc',     'プロジンク',     'ProZinc',   'ProZinc',   'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     NOW(), NOW()),
  (md5('i18n_med_brand_metacam'),     'medicine.brand.metacam',     'medicine', true, 'Metacam',   'Metacam',     'メタカム',       'Metacam',   'Metacam',   'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     NOW(), NOW()),
  (md5('i18n_med_brand_vetmedin'),    'medicine.brand.vetmedin',    'medicine', true, 'Vetmedin',  'Vetmedin',    'ベトメディン',   'Vetmedin',  'Vetmedin',  'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    NOW(), NOW()),
  (md5('i18n_med_brand_semintra'),    'medicine.brand.semintra',    'medicine', true, 'Semintra',  'Semintra',    'セミントラ',     'Semintra',  'Semintra',  'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    NOW(), NOW()),
  (md5('i18n_med_brand_nexgard'),     'medicine.brand.nexgard',     'medicine', true, 'NexGard',   'NexGard',     'ネクスガード',   'NexGard',   'NexGard',   'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     NOW(), NOW()),
  (md5('i18n_med_brand_clavamox'),    'medicine.brand.clavamox',    'medicine', true, 'Clavamox',  'Clavamox',    'Clavamox',       'Clavamox',  'Clavamox',  'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    NOW(), NOW()),
  (md5('i18n_med_brand_canidryl'),    'medicine.brand.canidryl',    'medicine', true, 'Canidryl',  'Canidryl',    'Canidryl',       'Canidryl',  'Canidryl',  'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    NOW(), NOW()),
  (md5('i18n_med_brand_onsior'),      'medicine.brand.onsior',      'medicine', true, 'Onsior',    'Onsior',      'オンシオール',   'Onsior',    'Onsior',    'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      NOW(), NOW()),
  (md5('i18n_med_brand_cardisure'),   'medicine.brand.cardisure',   'medicine', true, 'Cardisure', 'Cardisure',   'カルディシュア', 'Cardisure', 'Cardisure', 'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   NOW(), NOW()),
  (md5('i18n_med_brand_posatex'),     'medicine.brand.posatex',     'medicine', true, 'Posatex',   'Posatex',     'Posatex',        'Posatex',   'Posatex',   'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     NOW(), NOW()),
  (md5('i18n_med_brand_rilexine'),    'medicine.brand.rilexine',    'medicine', true, 'Rilexine',  'Rilexine',    'Rilexine',       'Rilexine',  'Rilexine',  'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    NOW(), NOW()),
  (md5('i18n_med_brand_enterosgel'),  'medicine.brand.enterosgel',  'medicine', true, 'Enterosgel','Enterosgel',  'Enterosgel',     'Enterosgel','Enterosgel','Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  NOW(), NOW()),
  (md5('i18n_med_brand_marbocyl'),    'medicine.brand.marbocyl',    'medicine', true, 'Marbocyl',  'Marbocyl',    'Marbocyl',       'Marbocyl',  'Marbocyl',  'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    NOW(), NOW()),
  (md5('i18n_med_brand_cortavance'),  'medicine.brand.cortavance',  'medicine', true, 'Cortavance','Cortavance',  'Cortavance',     'Cortavance','Cortavance','Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  NOW(), NOW()),
  (md5('i18n_med_brand_baytril'),     'medicine.brand.baytril',     'medicine', true, 'Baytril',   'Baytril',     'Baytril',        'Baytril',   'Baytril',   'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     NOW(), NOW()),
  (md5('i18n_med_brand_galliprant'),  'medicine.brand.galliprant',  'medicine', true, 'Galliprant','Galliprant',  'Galliprant',     'Galliprant','Galliprant','Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  NOW(), NOW()),
  (md5('i18n_med_brand_epakitin'),    'medicine.brand.epakitin',    'medicine', true, 'Epakitin',  'Epakitin',    'Epakitin',       'Epakitin',  'Epakitin',  'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    NOW(), NOW()),
  (md5('i18n_med_brand_credelio'),    'medicine.brand.credelio',    'medicine', true, 'Credelio',  'Credelio',    'クレデリオ',     'Credelio',  'Credelio',  'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    NOW(), NOW()),
  (md5('i18n_med_brand_interceptor'), 'medicine.brand.interceptor', 'medicine', true, 'Interceptor','Interceptor','インターセプター','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor', NOW(), NOW()),
  (md5('i18n_med_brand_bravecto'),    'medicine.brand.bravecto',    'medicine', true, 'Bravecto',  'Bravecto',    'ブラベクト',     'Bravecto',  'Bravecto',  'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    NOW(), NOW()),
  (md5('i18n_med_brand_ipakitine'),   'medicine.brand.ipakitine',   'medicine', true, 'Ipakitine', 'Ipakitine',   'Ipakitine',      'Ipakitine', 'Ipakitine', 'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   NOW(), NOW()),
  (md5('i18n_med_brand_pancreta'),    'medicine.brand.pancreta',    'medicine', true, '판크레타',  'Pancreta',    'Pancreta',       'Pancreta',  'Pancreta',  'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
