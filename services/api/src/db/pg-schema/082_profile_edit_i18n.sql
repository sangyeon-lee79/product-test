-- 081: i18n keys for profile edit modal — country/region/city fields

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Profile field labels ────────────────────────────────────────────────────
(md5('i18n_pf_country'),  'profile.field.country',  'guardian', '국가', 'Country', '国', '国家', '國家', 'País', 'Pays', 'Land', 'País', 'Quốc gia', 'ประเทศ', 'Negara', 'البلد', true, NOW(), NOW()),
(md5('i18n_pf_region'),   'profile.field.region',   'guardian', '시/도', 'Region', '都道府県', '省/州', '縣/市', 'Región', 'Région', 'Region', 'Região', 'Vùng', 'ภูมิภาค', 'Wilayah', 'المنطقة', true, NOW(), NOW()),
(md5('i18n_pf_city'),     'profile.field.city',     'guardian', '시/군/구', 'City', '市区町村', '城市', '城市', 'Ciudad', 'Ville', 'Stadt', 'Cidade', 'Thành phố', 'เมือง', 'Kota', 'المدينة', true, NOW(), NOW()),

-- ── Placeholders ────────────────────────────────────────────────────────────
(md5('i18n_pf_ph_country'), 'profile.placeholder.select_country', 'guardian', '국가를 선택하세요', 'Select country', '国を選択', '选择国家', '選擇國家', 'Selecciona un país', 'Sélectionner un pays', 'Land auswählen', 'Selecione um país', 'Chọn quốc gia', 'เลือกประเทศ', 'Pilih negara', 'اختر البلد', true, NOW(), NOW()),
(md5('i18n_pf_ph_region'),  'profile.placeholder.select_region',  'guardian', '시/도를 선택하세요', 'Select region', '都道府県を選択', '选择省/州', '選擇縣/市', 'Selecciona una región', 'Sélectionner une région', 'Region auswählen', 'Selecione uma região', 'Chọn vùng', 'เลือกภูมิภาค', 'Pilih wilayah', 'اختر المنطقة', true, NOW(), NOW()),
(md5('i18n_pf_ph_city'),    'profile.placeholder.select_city',    'guardian', '시/군/구를 선택하세요', 'Select city', '市区町村を選択', '选择城市', '選擇城市', 'Selecciona una ciudad', 'Sélectionner une ville', 'Stadt auswählen', 'Selecione uma cidade', 'Chọn thành phố', 'เลือกเมือง', 'Pilih kota', 'اختر المدينة', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
