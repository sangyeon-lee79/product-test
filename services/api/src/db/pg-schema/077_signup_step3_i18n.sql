-- 077: i18n keys for provider signup Step 3 — map button + pet type "all" option

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- Map button
(md5('i18n_ps_address_map'), 'public.signup.provider_address_map', 'public', '지도에서 선택', 'Select on Map', '地図で選択', '在地图上选择', '在地圖上選擇', 'Seleccionar en mapa', 'Sélectionner sur la carte', 'Auf Karte auswählen', 'Selecionar no mapa', 'Chọn trên bản đồ', 'เลือกบนแผนที่', 'Pilih di peta', 'اختر على الخريطة', true, NOW(), NOW()),

(md5('i18n_ps_address_map_disabled'), 'public.signup.provider_address_map_disabled', 'public', '준비 중', 'Coming soon', '準備中', '准备中', '準備中', 'Próximamente', 'Bientôt disponible', 'Demnächst', 'Em breve', 'Sắp ra mắt', 'เร็วๆ นี้', 'Segera hadir', 'قريبا', true, NOW(), NOW()),

-- Pet type "All" option
(md5('i18n_ps_pet_all'), 'public.signup.provider_pet_all', 'public', '전체', 'All', '全て', '全部', '全部', 'Todos', 'Tous', 'Alle', 'Todos', 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
