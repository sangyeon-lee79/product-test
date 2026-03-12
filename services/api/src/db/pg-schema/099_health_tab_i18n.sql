-- 099: Health tab i18n — tab labels, unit abbreviations, missing UI keys
-- All 13 languages: ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- ── Guardian tab labels ──
(gen_random_uuid()::text, 'guardian.tab.timeline', 'guardian',
 '타임라인', 'Timeline', 'タイムライン', '时间线', '時間軸', 'Línea de tiempo', 'Chronologie', 'Zeitleiste', 'Linha do tempo', 'Dòng thời gian', 'ไทม์ไลน์', 'Linimasa', 'الجدول الزمني',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.health', 'guardian',
 '건강', 'Health', '健康', '健康', '健康', 'Salud', 'Santé', 'Gesundheit', 'Saúde', 'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'الصحة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.services', 'guardian',
 '서비스', 'Services', 'サービス', '服务', '服務', 'Servicios', 'Services', 'Dienste', 'Serviços', 'Dịch vụ', 'บริการ', 'Layanan', 'الخدمات',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.gallery', 'guardian',
 '갤러리', 'Gallery', 'ギャラリー', '相册', '相簿', 'Galería', 'Galerie', 'Galerie', 'Galeria', 'Bộ sưu tập', 'แกลเลอรี', 'Galeri', 'معرض الصور',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.profile', 'guardian',
 '프로필', 'Profile', 'プロフィール', '个人资料', '個人資料', 'Perfil', 'Profil', 'Profil', 'Perfil', 'Hồ sơ', 'โปรไฟล์', 'Profil', 'الملف الشخصي',
 true, NOW(), NOW()),

-- ── Unit abbreviations (UI display) ──
(gen_random_uuid()::text, 'unit.kg', 'common',
 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'กก.', 'kg', 'كغ',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.g', 'common',
 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'ก.', 'g', 'غ',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.kcal', 'common',
 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'كيلو كالوري',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.kcal_per_100g', 'common',
 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'كيلو كالوري/100غ',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.min', 'common',
 '분', 'min', '分', '分钟', '分鐘', 'min', 'min', 'Min', 'min', 'phút', 'นาที', 'mnt', 'دقيقة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.km', 'common',
 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'กม.', 'km', 'كم',
 true, NOW(), NOW()),

-- ── Guardian profile ──
(gen_random_uuid()::text, 'guardian.profile.auth_email', 'guardian',
 '이메일', 'Email', 'メール', '电子邮件', '電子郵件', 'Correo', 'E-mail', 'E-Mail', 'E-mail', 'Email', 'อีเมล', 'Email', 'البريد الإلكتروني',
 true, NOW(), NOW()),

-- ── Common ──
(gen_random_uuid()::text, 'common.yes', 'common',
 '예', 'Yes', 'はい', '是', '是', 'Sí', 'Oui', 'Ja', 'Sim', 'Có', 'ใช่', 'Ya', 'نعم',
 true, NOW(), NOW())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
