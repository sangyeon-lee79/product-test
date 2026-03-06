-- Migration 0011: Master Data 다국어 seed 보강 (카테고리/아이템)

-- 1) 카테고리 i18n 키 누락분 생성
INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  CASE WHEN mc.key LIKE 'master.%' THEN mc.key ELSE ('master.' || mc.key) END,
  'master',
  mc.key, mc.key, mc.key, mc.key, mc.key, mc.key, mc.key, mc.key, mc.key, mc.key, mc.key, mc.key, mc.key,
  1, datetime('now'), datetime('now')
FROM master_categories mc
LEFT JOIN i18n_translations tr
  ON tr.key = CASE WHEN mc.key LIKE 'master.%' THEN mc.key ELSE ('master.' || mc.key) END
WHERE tr.id IS NULL;

-- 2) 아이템 i18n 키 누락분 생성
INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  CASE WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key) ELSE ('master.' || mc.key || '.' || mi.key) END,
  'master',
  mi.key, mi.key, mi.key, mi.key, mi.key, mi.key, mi.key, mi.key, mi.key, mi.key, mi.key, mi.key, mi.key,
  1, datetime('now'), datetime('now')
FROM master_items mi
JOIN master_categories mc ON mc.id = mi.category_id
LEFT JOIN i18n_translations tr
  ON tr.key = CASE WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key) ELSE ('master.' || mc.key || '.' || mi.key) END
WHERE tr.id IS NULL;

-- 3) 우선순위 카테고리 번역 (ko source)
INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
  (lower(hex(randomblob(16))), 'master.pet_type', 'master', '펫 종류', 'Pet Type', 'ペットの種類', '宠物类型', '寵物類型', 'Tipo de mascota', 'Type d''animal', 'Haustierart', 'Tipo de pet', 'Loại thú cưng', 'ประเภทสัตว์เลี้ยง', 'Jenis hewan peliharaan', 'نوع الحيوان الأليف', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_breed', 'master', '품종', 'Breed', '品種', '品种', '品種', 'Raza', 'Race', 'Rasse', 'Raça', 'Giống', 'สายพันธุ์', 'Ras', 'السلالة', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_gender', 'master', '성별', 'Gender', '性別', '性别', '性別', 'Género', 'Genre', 'Geschlecht', 'Gênero', 'Giới tính', 'เพศ', 'Jenis kelamin', 'الجنس', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.neuter_status', 'master', '중성화 여부', 'Neutered/Spayed Status', '去勢・避妊状態', '绝育状态', '結紮狀態', 'Estado de esterilización', 'Statut de stérilisation', 'Kastrationsstatus', 'Status de castração', 'Tình trạng triệt sản', 'สถานะทำหมัน', 'Status sterilisasi', 'حالة التعقيم', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.life_stage', 'master', '생애 단계', 'Life Stage', 'ライフステージ', '生命阶段', '生命階段', 'Etapa de vida', 'Stade de vie', 'Lebensphase', 'Fase da vida', 'Giai đoạn sống', 'ช่วงวัย', 'Tahap hidup', 'مرحلة الحياة', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.body_size', 'master', '체형/크기', 'Body Size', '体格/サイズ', '体型/大小', '體型/大小', 'Tamaño corporal', 'Taille corporelle', 'Körpergröße', 'Porte físico', 'Kích thước cơ thể', 'ขนาดตัว', 'Ukuran tubuh', 'حجم الجسم', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_color', 'master', '대표 색상', 'Primary Color', '主な色', '主要颜色', '主要顏色', 'Color principal', 'Couleur principale', 'Primärfarbe', 'Cor principal', 'Màu chủ đạo', 'สีหลัก', 'Warna utama', 'اللون الأساسي', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.allergy_type', 'master', '알러지', 'Allergy', 'アレルギー', '过敏', '過敏', 'Alergia', 'Allergie', 'Allergie', 'Alergia', 'Dị ứng', 'ภูมิแพ้', 'Alergi', 'حساسية', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.disease_type', 'master', '질병 이력', 'Disease History', '疾患歴', '疾病史', '疾病史', 'Historial de enfermedades', 'Historique des maladies', 'Krankheitsverlauf', 'Histórico de doenças', 'Tiền sử bệnh', 'ประวัติโรค', 'Riwayat penyakit', 'السجل المرضي', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.symptom_type', 'master', '증상 태그', 'Symptom', '症状', '症状', '症狀', 'Síntoma', 'Symptôme', 'Symptom', 'Sintoma', 'Triệu chứng', 'อาการ', 'Gejala', 'عرض', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.vaccination_type', 'master', '예방접종', 'Vaccination', '予防接種', '疫苗接种', '疫苗接種', 'Vacunación', 'Vaccination', 'Impfung', 'Vacinação', 'Tiêm chủng', 'การฉีดวัคซีน', 'Vaksinasi', 'التطعيم', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.temperament_type', 'master', '성격/기질', 'Temperament', '性格/気質', '性格/气质', '性格/氣質', 'Temperamento', 'Tempérament', 'Temperament', 'Temperamento', 'Tính cách', 'นิสัย', 'Temperamen', 'الطبع', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko = excluded.ko,
  en = excluded.en,
  ja = excluded.ja,
  zh_cn = excluded.zh_cn,
  zh_tw = excluded.zh_tw,
  es = excluded.es,
  fr = excluded.fr,
  de = excluded.de,
  pt = excluded.pt,
  vi = excluded.vi,
  th = excluded.th,
  id_lang = excluded.id_lang,
  ar = excluded.ar,
  updated_at = datetime('now');

-- 4) 우선순위 아이템 번역 (예시 + 핵심값)
INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
  (lower(hex(randomblob(16))), 'master.pet_type.dog', 'master', '강아지', 'Dog', '犬', '狗', '狗', 'Perro', 'Chien', 'Hund', 'Cão', 'Chó', 'สุนัข', 'Anjing', 'كلب', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_type.cat', 'master', '고양이', 'Cat', '猫', '猫', '貓', 'Gato', 'Chat', 'Katze', 'Gato', 'Mèo', 'แมว', 'Kucing', 'قطة', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_type.bird', 'master', '새', 'Bird', '鳥', '鸟', '鳥', 'Pájaro', 'Oiseau', 'Vogel', 'Pássaro', 'Chim', 'นก', 'Burung', 'طائر', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_type.rabbit', 'master', '토끼', 'Rabbit', 'ウサギ', '兔子', '兔子', 'Conejo', 'Lapin', 'Kaninchen', 'Coelho', 'Thỏ', 'กระต่าย', 'Kelinci', 'أرنب', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_type.reptile', 'master', '파충류', 'Reptile', '爬虫類', '爬行动物', '爬蟲類', 'Reptil', 'Reptile', 'Reptil', 'Réptil', 'Bò sát', 'สัตว์เลื้อยคลาน', 'Reptil', 'زاحف', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_type.other', 'master', '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่นๆ', 'Lainnya', 'أخرى', 1, datetime('now'), datetime('now')),

  (lower(hex(randomblob(16))), 'master.allergy_type.beef', 'master', '소고기', 'Beef', '牛肉', '牛肉', '牛肉', 'Carne de res', 'Bœuf', 'Rindfleisch', 'Carne bovina', 'Thịt bò', 'เนื้อวัว', 'Daging sapi', 'لحم بقري', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.allergy_type.chicken', 'master', '닭고기', 'Chicken', '鶏肉', '鸡肉', '雞肉', 'Pollo', 'Poulet', 'Huhn', 'Frango', 'Thịt gà', 'เนื้อไก่', 'Daging ayam', 'دجاج', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.allergy_type.none', 'master', '없음', 'None', 'なし', '无', '無', 'Ninguno', 'Aucun', 'Keine', 'Nenhum', 'Không', 'ไม่มี', 'Tidak ada', 'لا يوجد', 1, datetime('now'), datetime('now')),

  (lower(hex(randomblob(16))), 'master.pet_gender.male', 'master', '수컷', 'Male', 'オス', '公', '公', 'Macho', 'Mâle', 'Männlich', 'Macho', 'Đực', 'เพศผู้', 'Jantan', 'ذكر', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_gender.female', 'master', '암컷', 'Female', 'メス', '母', '母', 'Hembra', 'Femelle', 'Weiblich', 'Fêmea', 'Cái', 'เพศเมีย', 'Betina', 'أنثى', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.pet_gender.unknown', 'master', '미상', 'Unknown', '不明', '未知', '未知', 'Desconocido', 'Inconnu', 'Unbekannt', 'Desconhecido', 'Không rõ', 'ไม่ทราบ', 'Tidak diketahui', 'غير معروف', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko = excluded.ko,
  en = excluded.en,
  ja = excluded.ja,
  zh_cn = excluded.zh_cn,
  zh_tw = excluded.zh_tw,
  es = excluded.es,
  fr = excluded.fr,
  de = excluded.de,
  pt = excluded.pt,
  vi = excluded.vi,
  th = excluded.th,
  id_lang = excluded.id_lang,
  ar = excluded.ar,
  updated_at = datetime('now');

-- 5) 전체 master seed 언어 공란 제거 (fallback)
UPDATE i18n_translations
SET
  en      = COALESCE(NULLIF(en, ''), ko),
  ja      = COALESCE(NULLIF(ja, ''), en, ko),
  zh_cn   = COALESCE(NULLIF(zh_cn, ''), en, ko),
  zh_tw   = COALESCE(NULLIF(zh_tw, ''), en, ko),
  es      = COALESCE(NULLIF(es, ''), en, ko),
  fr      = COALESCE(NULLIF(fr, ''), en, ko),
  de      = COALESCE(NULLIF(de, ''), en, ko),
  pt      = COALESCE(NULLIF(pt, ''), en, ko),
  vi      = COALESCE(NULLIF(vi, ''), en, ko),
  th      = COALESCE(NULLIF(th, ''), en, ko),
  id_lang = COALESCE(NULLIF(id_lang, ''), en, ko),
  ar      = COALESCE(NULLIF(ar, ''), en, ko),
  updated_at = datetime('now')
WHERE page = 'master' AND key LIKE 'master.%';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0011_master_i18n_full_backfill');
