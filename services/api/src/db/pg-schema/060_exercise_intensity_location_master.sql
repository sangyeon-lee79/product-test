-- 060: Move exercise intensity + location to master data
-- Depends on: 057_exercise_logs.sql

-- ── 1. Drop CHECK constraints from pet_exercise_logs ─────────────────────────
ALTER TABLE pet_exercise_logs DROP CONSTRAINT IF EXISTS pet_exercise_logs_intensity_check;
ALTER TABLE pet_exercise_logs DROP CONSTRAINT IF EXISTS pet_exercise_logs_location_type_check;

-- ── 2. Master categories ─────────────────────────────────────────────────────
INSERT INTO master_categories (id, code, sort_order, status, created_at, updated_at)
VALUES
  ('mc-exercise-intensity', 'exercise_intensity', 201, 'active', NOW(), NOW()),
  ('mc-exercise-location',  'exercise_location',  202, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 3. Master items: intensity ───────────────────────────────────────────────
INSERT INTO master_items (id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at) VALUES
  ('mi-exercise-intensity-low',    'mc-exercise-intensity', 'low',    NULL, 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-intensity-medium', 'mc-exercise-intensity', 'medium', NULL, 2, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-intensity-high',   'mc-exercise-intensity', 'high',   NULL, 3, 'active', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 4. Master items: location ────────────────────────────────────────────────
INSERT INTO master_items (id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at) VALUES
  ('mi-exercise-location-indoor',  'mc-exercise-location', 'indoor',  NULL, 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-location-outdoor', 'mc-exercise-location', 'outdoor', NULL, 2, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-location-park',    'mc-exercise-location', 'park',    NULL, 3, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-location-beach',   'mc-exercise-location', 'beach',   NULL, 4, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-location-other',   'mc-exercise-location', 'other',   NULL, 5, 'active', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 5. i18n: category labels ─────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mc-exercise-intensity', 'master.exercise_intensity', 'master', true,
   '운동 강도', 'Exercise Intensity', '運動強度', '运动强度', '運動強度',
   'Intensidad del ejercicio', 'Intensité de l''exercice', 'Trainingsintensität', 'Intensidade do exercício',
   'Cường độ tập luyện', 'ความเข้มข้นของการออกกำลังกาย', 'Intensitas olahraga', 'شدة التمرين',
   NOW(), NOW()),
  ('i18n-mc-exercise-location', 'master.exercise_location', 'master', true,
   '운동 장소', 'Exercise Location', '運動場所', '运动地点', '運動地點',
   'Ubicación del ejercicio', 'Lieu d''exercice', 'Trainingsort', 'Local do exercício',
   'Địa điểm tập luyện', 'สถานที่ออกกำลังกาย', 'Lokasi olahraga', 'موقع التمرين',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 6. i18n: intensity item labels ───────────────────────────────────────────
-- Reuses existing translations from 057 (guardian.exercise.intensity_*)
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mi-exercise-intensity-low', 'master.exercise_intensity.low', 'master', true,
   '낮음', 'Low', '低い', '低', '低', 'Baja', 'Faible', 'Niedrig', 'Baixa', 'Thấp', 'ต่ำ', 'Rendah', 'منخفضة', NOW(), NOW()),
  ('i18n-mi-exercise-intensity-medium', 'master.exercise_intensity.medium', 'master', true,
   '보통', 'Medium', '普通', '中', '中', 'Media', 'Moyen', 'Mittel', 'Média', 'Trung bình', 'ปานกลาง', 'Sedang', 'متوسطة', NOW(), NOW()),
  ('i18n-mi-exercise-intensity-high', 'master.exercise_intensity.high', 'master', true,
   '높음', 'High', '高い', '高', '高', 'Alta', 'Élevé', 'Hoch', 'Alta', 'Cao', 'สูง', 'Tinggi', 'عالية', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 7. i18n: location item labels ────────────────────────────────────────────
-- Reuses existing translations from 057 (guardian.exercise.location_*)
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mi-exercise-location-indoor', 'master.exercise_location.indoor', 'master', true,
   '실내', 'Indoor', '室内', '室内', '室內', 'Interior', 'Intérieur', 'Innen', 'Interior', 'Trong nhà', 'ในร่ม', 'Dalam ruangan', 'داخلي', NOW(), NOW()),
  ('i18n-mi-exercise-location-outdoor', 'master.exercise_location.outdoor', 'master', true,
   '실외', 'Outdoor', '屋外', '户外', '戶外', 'Exterior', 'Extérieur', 'Außen', 'Exterior', 'Ngoài trời', 'กลางแจ้ง', 'Luar ruangan', 'خارجي', NOW(), NOW()),
  ('i18n-mi-exercise-location-park', 'master.exercise_location.park', 'master', true,
   '공원', 'Park', '公園', '公园', '公園', 'Parque', 'Parc', 'Park', 'Parque', 'Công viên', 'สวนสาธารณะ', 'Taman', 'حديقة', NOW(), NOW()),
  ('i18n-mi-exercise-location-beach', 'master.exercise_location.beach', 'master', true,
   '해변', 'Beach', 'ビーチ', '海滩', '海灘', 'Playa', 'Plage', 'Strand', 'Praia', 'Bãi biển', 'ชายหาด', 'Pantai', 'شاطئ', NOW(), NOW()),
  ('i18n-mi-exercise-location-other', 'master.exercise_location.other', 'master', true,
   '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่นๆ', 'Lainnya', 'أخرى', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
