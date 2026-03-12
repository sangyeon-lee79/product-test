-- 101: Record card value pill labels — 13 languages
-- Used by the unified RecordCard component in Guardian health timeline

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid()::text, 'guardian.record.value', 'guardian',
 '수치', 'Value', '数値', '数值', '數值', 'Valor', 'Valeur', 'Wert', 'Valor', 'Giá trị', 'ค่า', 'Nilai', 'القيمة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.metric', 'guardian',
 '지표', 'Metric', '指標', '指标', '指標', 'Métrica', 'Indicateur', 'Kennzahl', 'Métrica', 'Chỉ số', 'ตัวชี้วัด', 'Metrik', 'المقياس',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.context', 'guardian',
 '측정조건', 'Context', '測定条件', '测量条件', '測量條件', 'Contexto', 'Contexte', 'Kontext', 'Contexto', 'Bối cảnh', 'บริบท', 'Konteks', 'السياق',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.amount', 'guardian',
 '급여량', 'Amount', '給餌量', '喂食量', '餵食量', 'Cantidad', 'Quantité', 'Menge', 'Quantidade', 'Lượng', 'ปริมาณ', 'Jumlah', 'الكمية',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.calories', 'guardian',
 '칼로리', 'Calories', 'カロリー', '卡路里', '卡路里', 'Calorías', 'Calories', 'Kalorien', 'Calorias', 'Calo', 'แคลอรี', 'Kalori', 'السعرات',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.duration', 'guardian',
 '시간', 'Duration', '時間', '时长', '時長', 'Duración', 'Durée', 'Dauer', 'Duração', 'Thời gian', 'ระยะเวลา', 'Durasi', 'المدة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.intensity', 'guardian',
 '강도', 'Intensity', '強度', '强度', '強度', 'Intensidad', 'Intensité', 'Intensität', 'Intensidade', 'Cường độ', 'ความเข้มข้น', 'Intensitas', 'الشدة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.distance', 'guardian',
 '거리', 'Distance', '距離', '距离', '距離', 'Distancia', 'Distance', 'Entfernung', 'Distância', 'Khoảng cách', 'ระยะทาง', 'Jarak', 'المسافة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.dose', 'guardian',
 '용량', 'Dose', '用量', '剂量', '劑量', 'Dosis', 'Dose', 'Dosis', 'Dose', 'Liều lượng', 'ขนาดยา', 'Dosis', 'الجرعة',
 true, NOW(), NOW())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
