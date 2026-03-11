-- 058: Supplement L2/L3 detail items + Exercise L3 qualifier items + i18n
-- Depends on: 003_master_data_seed.sql (diet hierarchy), 057_exercise_logs.sql (exercise types)
-- No deletions or modifications — INSERT only with ON CONFLICT DO NOTHING

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 1: Supplement — New L2 (prescribed_supplement)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
VALUES
  ('mi-diet-sub-prescribed-supplement', 'mc-diet-subtype', 'mi-diet-supplement-food', 'prescribed_supplement', 75, 'active', '{"prescribed":true}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 2: Supplement — L3 detail items in mc-diet-feed-type
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at) VALUES
  -- Joint / Cartilage (관절/연골) → parent: mi-diet-sub-joint-supplement
  ('mi-diet-feed-glucosamine',        'mc-diet-feed-type', 'mi-diet-sub-joint-supplement',        'glucosamine',        702, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-chondroitin',        'mc-diet-feed-type', 'mi-diet-sub-joint-supplement',        'chondroitin',        703, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-msm',               'mc-diet-feed-type', 'mi-diet-sub-joint-supplement',        'msm',                704, 'active', '{}', NOW(), NOW()),

  -- Digestive / Probiotics (소화/유산균) → parent: mi-diet-sub-digestive-supplement
  ('mi-diet-feed-probiotics',         'mc-diet-feed-type', 'mi-diet-sub-digestive-supplement',    'probiotics',         722, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-prebiotics',         'mc-diet-feed-type', 'mi-diet-sub-digestive-supplement',    'prebiotics',         723, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-digestive-enzyme',   'mc-diet-feed-type', 'mi-diet-sub-digestive-supplement',    'digestive_enzyme',   724, 'active', '{}', NOW(), NOW()),

  -- Vitamin / Mineral (비타민/미네랄) → parent: mi-diet-sub-vitamin-supplement
  ('mi-diet-feed-multivitamin',       'mc-diet-feed-type', 'mi-diet-sub-vitamin-supplement',      'multivitamin',       742, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-vitamin-c',          'mc-diet-feed-type', 'mi-diet-sub-vitamin-supplement',      'vitamin_c',          743, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-calcium',            'mc-diet-feed-type', 'mi-diet-sub-vitamin-supplement',      'calcium',            744, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-zinc',               'mc-diet-feed-type', 'mi-diet-sub-vitamin-supplement',      'zinc',               745, 'active', '{}', NOW(), NOW()),

  -- Skin / Coat (피부/모질) → parent: mi-diet-sub-skin-coat-supplement
  ('mi-diet-feed-omega3',             'mc-diet-feed-type', 'mi-diet-sub-skin-coat-supplement',    'omega3',             712, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-omega6',             'mc-diet-feed-type', 'mi-diet-sub-skin-coat-supplement',    'omega6',             713, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-biotin',             'mc-diet-feed-type', 'mi-diet-sub-skin-coat-supplement',    'biotin',             714, 'active', '{}', NOW(), NOW()),

  -- Immune / Antioxidant (면역/항산화) → parent: mi-diet-sub-immune-support-food
  ('mi-diet-feed-coenzyme-q10',       'mc-diet-feed-type', 'mi-diet-sub-immune-support-food',     'coenzyme_q10',       732, 'active', '{}', NOW(), NOW()),
  ('mi-diet-feed-chlorella',          'mc-diet-feed-type', 'mi-diet-sub-immune-support-food',     'chlorella',          733, 'active', '{}', NOW(), NOW()),

  -- Prescribed supplement (처방 영양제) → parent: mi-diet-sub-prescribed-supplement
  ('mi-diet-feed-vet-prescribed',     'mc-diet-feed-type', 'mi-diet-sub-prescribed-supplement',   'vet_prescribed_supplement', 751, 'active', '{"prescribed":true}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 3: Exercise — L3 qualifier items in mc-exercise-type
-- Parent = L1 item, distinguished from L2 by metadata.level = 3
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO master_items (id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at) VALUES
  -- Walking qualifiers (pace) → parent: mi-exercise-walking
  ('mi-exercise-slow-pace',           'mc-exercise-type', 'slow_pace',           'mi-exercise-walking',        101, 'active', '{"level":3,"qualifier":"pace"}', NOW(), NOW()),
  ('mi-exercise-normal-pace',         'mc-exercise-type', 'normal_pace',         'mi-exercise-walking',        102, 'active', '{"level":3,"qualifier":"pace"}', NOW(), NOW()),
  ('mi-exercise-fast-pace',           'mc-exercise-type', 'fast_pace',           'mi-exercise-walking',        103, 'active', '{"level":3,"qualifier":"pace"}', NOW(), NOW()),

  -- Running qualifiers (intensity) → parent: mi-exercise-running
  ('mi-exercise-low-intensity',       'mc-exercise-type', 'low_intensity',       'mi-exercise-running',        101, 'active', '{"level":3,"qualifier":"intensity"}', NOW(), NOW()),
  ('mi-exercise-medium-intensity',    'mc-exercise-type', 'medium_intensity',    'mi-exercise-running',        102, 'active', '{"level":3,"qualifier":"intensity"}', NOW(), NOW()),
  ('mi-exercise-high-intensity',      'mc-exercise-type', 'high_intensity',      'mi-exercise-running',        103, 'active', '{"level":3,"qualifier":"intensity"}', NOW(), NOW()),

  -- Play qualifiers (location) → parent: mi-exercise-play
  ('mi-exercise-indoor-play',         'mc-exercise-type', 'indoor_play',         'mi-exercise-play',           101, 'active', '{"level":3,"qualifier":"location"}', NOW(), NOW()),
  ('mi-exercise-outdoor-play',        'mc-exercise-type', 'outdoor_play',        'mi-exercise-play',           102, 'active', '{"level":3,"qualifier":"location"}', NOW(), NOW()),

  -- Rehabilitation qualifiers (prescribed) → parent: mi-exercise-rehabilitation
  ('mi-exercise-prescribed-rehab',    'mc-exercise-type', 'prescribed_rehab',    'mi-exercise-rehabilitation', 101, 'active', '{"level":3,"qualifier":"prescribed","prescribed":true}', NOW(), NOW()),
  ('mi-exercise-non-prescribed-rehab','mc-exercise-type', 'non_prescribed_rehab','mi-exercise-rehabilitation', 102, 'active', '{"level":3,"qualifier":"prescribed","prescribed":false}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 4: i18n — Supplement L2 + L3
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  -- L2: prescribed supplement
  ('i18n-diet-sub-prescribed-supp', 'master.diet_subtype.prescribed_supplement', 'master', true,
   '처방 영양제', 'Prescribed Supplement', '処方サプリメント', '处方营养品', '處方營養品',
   'Suplemento prescrito', 'Supplément prescrit', 'Verschriebenes Supplement', 'Suplemento prescrito',
   'Thực phẩm bổ sung theo toa', 'อาหารเสริมตามใบสั่ง', 'Suplemen resep', 'مكمل موصوف',
   NOW(), NOW()),

  -- L3: Joint supplements
  ('i18n-diet-feed-glucosamine', 'master.diet_feed_type.glucosamine', 'master', true,
   '글루코사민', 'Glucosamine', 'グルコサミン', '氨基葡萄糖', '氨基葡萄糖',
   'Glucosamina', 'Glucosamine', 'Glucosamin', 'Glucosamina',
   'Glucosamine', 'กลูโคซามีน', 'Glukosamin', 'جلوكوزامين',
   NOW(), NOW()),
  ('i18n-diet-feed-chondroitin', 'master.diet_feed_type.chondroitin', 'master', true,
   '콘드로이틴', 'Chondroitin', 'コンドロイチン', '硫酸软骨素', '硫酸軟骨素',
   'Condroitina', 'Chondroïtine', 'Chondroitin', 'Condroitina',
   'Chondroitin', 'คอนดรอยติน', 'Kondroitin', 'كوندرويتين',
   NOW(), NOW()),
  ('i18n-diet-feed-msm', 'master.diet_feed_type.msm', 'master', true,
   'MSM', 'MSM', 'MSM', 'MSM', 'MSM',
   'MSM', 'MSM', 'MSM', 'MSM',
   'MSM', 'MSM', 'MSM', 'MSM',
   NOW(), NOW()),

  -- L3: Digestive supplements
  ('i18n-diet-feed-probiotics', 'master.diet_feed_type.probiotics', 'master', true,
   '프로바이오틱스', 'Probiotics', 'プロバイオティクス', '益生菌', '益生菌',
   'Probióticos', 'Probiotiques', 'Probiotika', 'Probióticos',
   'Probiotic', 'โปรไบโอติกส์', 'Probiotik', 'بروبيوتيك',
   NOW(), NOW()),
  ('i18n-diet-feed-prebiotics', 'master.diet_feed_type.prebiotics', 'master', true,
   '프리바이오틱스', 'Prebiotics', 'プレバイオティクス', '益生元', '益生元',
   'Prebióticos', 'Prébiotiques', 'Präbiotika', 'Prebióticos',
   'Prebiotic', 'พรีไบโอติกส์', 'Prebiotik', 'بريبيوتيك',
   NOW(), NOW()),
  ('i18n-diet-feed-digestive-enzyme', 'master.diet_feed_type.digestive_enzyme', 'master', true,
   '소화효소', 'Digestive Enzyme', '消化酵素', '消化酶', '消化酶',
   'Enzima digestiva', 'Enzyme digestive', 'Verdauungsenzym', 'Enzima digestiva',
   'Enzyme tiêu hóa', 'เอนไซม์ย่อยอาหาร', 'Enzim pencernaan', 'إنزيم هضمي',
   NOW(), NOW()),

  -- L3: Vitamin / Mineral supplements
  ('i18n-diet-feed-multivitamin', 'master.diet_feed_type.multivitamin', 'master', true,
   '종합비타민', 'Multivitamin', 'マルチビタミン', '综合维生素', '綜合維生素',
   'Multivitamina', 'Multivitamine', 'Multivitamin', 'Multivitamina',
   'Vitamin tổng hợp', 'วิตามินรวม', 'Multivitamin', 'فيتامينات متعددة',
   NOW(), NOW()),
  ('i18n-diet-feed-vitamin-c', 'master.diet_feed_type.vitamin_c', 'master', true,
   '비타민C', 'Vitamin C', 'ビタミンC', '维生素C', '維生素C',
   'Vitamina C', 'Vitamine C', 'Vitamin C', 'Vitamina C',
   'Vitamin C', 'วิตามินซี', 'Vitamin C', 'فيتامين سي',
   NOW(), NOW()),
  ('i18n-diet-feed-calcium', 'master.diet_feed_type.calcium', 'master', true,
   '칼슘', 'Calcium', 'カルシウム', '钙', '鈣',
   'Calcio', 'Calcium', 'Kalzium', 'Cálcio',
   'Canxi', 'แคลเซียม', 'Kalsium', 'كالسيوم',
   NOW(), NOW()),
  ('i18n-diet-feed-zinc', 'master.diet_feed_type.zinc', 'master', true,
   '아연', 'Zinc', '亜鉛', '锌', '鋅',
   'Zinc', 'Zinc', 'Zink', 'Zinco',
   'Kẽm', 'สังกะสี', 'Seng', 'زنك',
   NOW(), NOW()),

  -- L3: Skin / Coat supplements
  ('i18n-diet-feed-omega3', 'master.diet_feed_type.omega3', 'master', true,
   '오메가3', 'Omega-3', 'オメガ3', 'Omega-3', 'Omega-3',
   'Omega-3', 'Oméga-3', 'Omega-3', 'Ômega-3',
   'Omega-3', 'โอเมก้า3', 'Omega-3', 'أوميغا 3',
   NOW(), NOW()),
  ('i18n-diet-feed-omega6', 'master.diet_feed_type.omega6', 'master', true,
   '오메가6', 'Omega-6', 'オメガ6', 'Omega-6', 'Omega-6',
   'Omega-6', 'Oméga-6', 'Omega-6', 'Ômega-6',
   'Omega-6', 'โอเมก้า6', 'Omega-6', 'أوميغا 6',
   NOW(), NOW()),
  ('i18n-diet-feed-biotin', 'master.diet_feed_type.biotin', 'master', true,
   '바이오틴', 'Biotin', 'ビオチン', '生物素', '生物素',
   'Biotina', 'Biotine', 'Biotin', 'Biotina',
   'Biotin', 'ไบโอติน', 'Biotin', 'بيوتين',
   NOW(), NOW()),

  -- L3: Immune / Antioxidant supplements
  ('i18n-diet-feed-coenzyme-q10', 'master.diet_feed_type.coenzyme_q10', 'master', true,
   '코엔자임Q10', 'Coenzyme Q10', 'コエンザイムQ10', '辅酶Q10', '輔酶Q10',
   'Coenzima Q10', 'Coenzyme Q10', 'Coenzym Q10', 'Coenzima Q10',
   'Coenzyme Q10', 'โคเอนไซม์คิวเท็น', 'Koenzim Q10', 'كوإنزيم كيو10',
   NOW(), NOW()),
  ('i18n-diet-feed-chlorella', 'master.diet_feed_type.chlorella', 'master', true,
   '클로렐라', 'Chlorella', 'クロレラ', '小球藻', '小球藻',
   'Clorela', 'Chlorelle', 'Chlorella', 'Clorela',
   'Tảo lục', 'คลอเรลลา', 'Klorela', 'كلوريلا',
   NOW(), NOW()),

  -- L3: Prescribed supplement
  ('i18n-diet-feed-vet-prescribed', 'master.diet_feed_type.vet_prescribed_supplement', 'master', true,
   '수의사 처방 영양제', 'Vet-Prescribed Supplement', '獣医処方サプリ', '兽医处方营养品', '獸醫處方營養品',
   'Suplemento veterinario', 'Supplément vétérinaire', 'Tierarzt-Supplement', 'Suplemento veterinário',
   'Bổ sung theo kê đơn thú y', 'อาหารเสริมสั่งจ่ายโดยสัตวแพทย์', 'Suplemen resep dokter hewan', 'مكمل بوصفة بيطرية',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 5: i18n — Exercise L3 qualifiers
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  -- Walking pace qualifiers
  ('i18n-ex-slow-pace', 'master.exercise_type.slow_pace', 'master', true,
   '느린 보행', 'Slow Pace', 'ゆっくり歩き', '慢步', '慢步',
   'Paso lento', 'Pas lent', 'Langsames Tempo', 'Passo lento',
   'Bước chậm', 'ก้าวช้า', 'Langkah lambat', 'خطوة بطيئة',
   NOW(), NOW()),
  ('i18n-ex-normal-pace', 'master.exercise_type.normal_pace', 'master', true,
   '보통 보행', 'Normal Pace', '普通歩き', '正常步行', '正常步行',
   'Paso normal', 'Pas normal', 'Normales Tempo', 'Passo normal',
   'Bước bình thường', 'ก้าวปกติ', 'Langkah normal', 'خطوة عادية',
   NOW(), NOW()),
  ('i18n-ex-fast-pace', 'master.exercise_type.fast_pace', 'master', true,
   '빠른 보행', 'Fast Pace', '速歩き', '快步', '快步',
   'Paso rápido', 'Pas rapide', 'Schnelles Tempo', 'Passo rápido',
   'Bước nhanh', 'ก้าวเร็ว', 'Langkah cepat', 'خطوة سريعة',
   NOW(), NOW()),

  -- Running intensity qualifiers
  ('i18n-ex-low-intensity', 'master.exercise_type.low_intensity', 'master', true,
   '저강도', 'Low Intensity', '低強度', '低强度', '低強度',
   'Baja intensidad', 'Faible intensité', 'Niedrige Intensität', 'Baixa intensidade',
   'Cường độ thấp', 'ความเข้มข้นต่ำ', 'Intensitas rendah', 'شدة منخفضة',
   NOW(), NOW()),
  ('i18n-ex-medium-intensity', 'master.exercise_type.medium_intensity', 'master', true,
   '중강도', 'Medium Intensity', '中強度', '中强度', '中強度',
   'Intensidad media', 'Intensité moyenne', 'Mittlere Intensität', 'Intensidade média',
   'Cường độ trung bình', 'ความเข้มข้นปานกลาง', 'Intensitas sedang', 'شدة متوسطة',
   NOW(), NOW()),
  ('i18n-ex-high-intensity', 'master.exercise_type.high_intensity', 'master', true,
   '고강도', 'High Intensity', '高強度', '高强度', '高強度',
   'Alta intensidad', 'Haute intensité', 'Hohe Intensität', 'Alta intensidade',
   'Cường độ cao', 'ความเข้มข้นสูง', 'Intensitas tinggi', 'شدة عالية',
   NOW(), NOW()),

  -- Play location qualifiers
  ('i18n-ex-indoor-play', 'master.exercise_type.indoor_play', 'master', true,
   '실내 놀이', 'Indoor Play', '室内遊び', '室内玩耍', '室內玩耍',
   'Juego interior', 'Jeu intérieur', 'Innenspiel', 'Brincadeira interior',
   'Chơi trong nhà', 'เล่นในร่ม', 'Bermain dalam ruangan', 'لعب داخلي',
   NOW(), NOW()),
  ('i18n-ex-outdoor-play', 'master.exercise_type.outdoor_play', 'master', true,
   '실외 놀이', 'Outdoor Play', '屋外遊び', '户外玩耍', '戶外玩耍',
   'Juego exterior', 'Jeu extérieur', 'Außenspiel', 'Brincadeira exterior',
   'Chơi ngoài trời', 'เล่นกลางแจ้ง', 'Bermain luar ruangan', 'لعب خارجي',
   NOW(), NOW()),

  -- Rehabilitation prescribed qualifiers
  ('i18n-ex-prescribed-rehab', 'master.exercise_type.prescribed_rehab', 'master', true,
   '수의사 처방 재활', 'Prescribed Rehab', '処方リハビリ', '处方康复', '處方復健',
   'Rehabilitación prescrita', 'Rééducation prescrite', 'Verschriebene Reha', 'Reabilitação prescrita',
   'Phục hồi theo toa', 'การฟื้นฟูตามใบสั่ง', 'Rehabilitasi resep', 'إعادة تأهيل موصوفة',
   NOW(), NOW()),
  ('i18n-ex-non-prescribed-rehab', 'master.exercise_type.non_prescribed_rehab', 'master', true,
   '자율 재활', 'Non-Prescribed Rehab', '自主リハビリ', '自主康复', '自主復健',
   'Rehabilitación libre', 'Rééducation libre', 'Freie Reha', 'Reabilitação livre',
   'Phục hồi tự do', 'การฟื้นฟูอิสระ', 'Rehabilitasi mandiri', 'إعادة تأهيل مستقلة',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
