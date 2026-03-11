-- 057: Pet exercise logs table + master data + i18n
-- Depends on: 001_init.sql (pets, users, master_categories, master_items, i18n_translations)

-- ── 1. pet_exercise_logs table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pet_exercise_logs (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  exercise_subtype TEXT NOT NULL,
  exercise_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_min INTEGER NOT NULL,
  distance_km REAL,
  intensity TEXT NOT NULL DEFAULT 'medium' CHECK (intensity IN ('low','medium','high')),
  leash BOOLEAN,
  location_type TEXT DEFAULT 'outdoor' CHECK (location_type IN ('indoor','outdoor','park','beach','other')),
  with_other_pets BOOLEAN DEFAULT false,
  note TEXT,
  recorded_by_user_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_pet_date ON pet_exercise_logs(pet_id, exercise_date DESC);

-- ── 2. Master category: exercise_type ───────────────────────────────────────
INSERT INTO master_categories (id, code, sort_order, status, created_at, updated_at)
VALUES ('mc-exercise-type', 'exercise_type', 200, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 3. L1 exercise types ────────────────────────────────────────────────────
INSERT INTO master_items (id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at) VALUES
  ('mi-exercise-walking',        'mc-exercise-type', 'walking',        NULL, 1, 'active', '{"species":["dog"]}', NOW(), NOW()),
  ('mi-exercise-running',        'mc-exercise-type', 'running',        NULL, 2, 'active', '{"species":["dog"]}', NOW(), NOW()),
  ('mi-exercise-swimming',       'mc-exercise-type', 'swimming',       NULL, 3, 'active', '{"species":["dog"]}', NOW(), NOW()),
  ('mi-exercise-play',           'mc-exercise-type', 'play',           NULL, 4, 'active', '{"species":["dog","cat","other"]}', NOW(), NOW()),
  ('mi-exercise-training',       'mc-exercise-type', 'training',       NULL, 5, 'active', '{"species":["dog","cat"]}', NOW(), NOW()),
  ('mi-exercise-rehabilitation', 'mc-exercise-type', 'rehabilitation', NULL, 6, 'active', '{"species":["dog","cat","other"]}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 4. L2 exercise subtypes ─────────────────────────────────────────────────
INSERT INTO master_items (id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at) VALUES
  -- Walking subtypes
  ('mi-exercise-short-walk',    'mc-exercise-type', 'short_walk',    'mi-exercise-walking', 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-regular-walk',  'mc-exercise-type', 'regular_walk',  'mi-exercise-walking', 2, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-long-walk',     'mc-exercise-type', 'long_walk',     'mi-exercise-walking', 3, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-hiking',        'mc-exercise-type', 'hiking',        'mi-exercise-walking', 4, 'active', '{}', NOW(), NOW()),
  -- Running subtypes
  ('mi-exercise-run-with-owner','mc-exercise-type', 'running_with_owner','mi-exercise-running', 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-free-running',  'mc-exercise-type', 'free_running',  'mi-exercise-running', 2, 'active', '{}', NOW(), NOW()),
  -- Swimming subtypes
  ('mi-exercise-natural-swim',  'mc-exercise-type', 'natural_swimming','mi-exercise-swimming', 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-pool-swim',     'mc-exercise-type', 'pool_swimming', 'mi-exercise-swimming', 2, 'active', '{}', NOW(), NOW()),
  -- Play subtypes
  ('mi-exercise-ball-play',     'mc-exercise-type', 'ball_play',     'mi-exercise-play', 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-tug-play',      'mc-exercise-type', 'tug_play',      'mi-exercise-play', 2, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-hide-seek',     'mc-exercise-type', 'hide_and_seek', 'mi-exercise-play', 3, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-free-play',     'mc-exercise-type', 'free_play',     'mi-exercise-play', 4, 'active', '{}', NOW(), NOW()),
  -- Training subtypes
  ('mi-exercise-basic-obedience','mc-exercise-type','basic_obedience','mi-exercise-training', 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-agility',       'mc-exercise-type', 'agility',       'mi-exercise-training', 2, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-nose-work',     'mc-exercise-type', 'nose_work',     'mi-exercise-training', 3, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-frisbee',       'mc-exercise-type', 'frisbee',       'mi-exercise-training', 4, 'active', '{}', NOW(), NOW()),
  -- Rehabilitation subtypes
  ('mi-exercise-walking-rehab', 'mc-exercise-type', 'walking_rehab', 'mi-exercise-rehabilitation', 1, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-aqua-rehab',    'mc-exercise-type', 'aqua_rehab',    'mi-exercise-rehabilitation', 2, 'active', '{}', NOW(), NOW()),
  ('mi-exercise-stretching',    'mc-exercise-type', 'stretching',    'mi-exercise-rehabilitation', 3, 'active', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 5. i18n: master category label ──────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mc-exercise-type', 'master.exercise_type', 'master', true,
   '운동 유형', 'Exercise Type', '運動タイプ', '运动类型', '運動類型',
   'Tipo de ejercicio', 'Type d''exercice', 'Übungstyp', 'Tipo de exercício',
   'Loại bài tập', 'ประเภทการออกกำลังกาย', 'Jenis olahraga', 'نوع التمرين',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 6. i18n: L1 exercise type labels ────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-walking', 'master.exercise_type.walking', 'master', true,
   '산책', 'Walking', '散歩', '散步', '散步', 'Caminata', 'Promenade', 'Spaziergang', 'Caminhada', 'Đi dạo', 'เดินเล่น', 'Jalan-jalan', 'المشي', NOW(), NOW()),
  ('i18n-ex-running', 'master.exercise_type.running', 'master', true,
   '달리기', 'Running', 'ランニング', '跑步', '跑步', 'Correr', 'Course', 'Laufen', 'Corrida', 'Chạy bộ', 'วิ่ง', 'Berlari', 'الركض', NOW(), NOW()),
  ('i18n-ex-swimming', 'master.exercise_type.swimming', 'master', true,
   '수영', 'Swimming', '水泳', '游泳', '游泳', 'Natación', 'Natation', 'Schwimmen', 'Natação', 'Bơi lội', 'ว่ายน้ำ', 'Berenang', 'السباحة', NOW(), NOW()),
  ('i18n-ex-play', 'master.exercise_type.play', 'master', true,
   '놀이', 'Play', '遊び', '玩耍', '玩耍', 'Juego', 'Jeu', 'Spielen', 'Brincadeira', 'Chơi', 'เล่น', 'Bermain', 'اللعب', NOW(), NOW()),
  ('i18n-ex-training', 'master.exercise_type.training', 'master', true,
   '훈련', 'Training', 'トレーニング', '训练', '訓練', 'Entrenamiento', 'Entraînement', 'Training', 'Treinamento', 'Huấn luyện', 'ฝึกฝน', 'Latihan', 'التدريب', NOW(), NOW()),
  ('i18n-ex-rehabilitation', 'master.exercise_type.rehabilitation', 'master', true,
   '재활', 'Rehabilitation', 'リハビリ', '康复', '復健', 'Rehabilitación', 'Rééducation', 'Rehabilitation', 'Reabilitação', 'Phục hồi chức năng', 'การฟื้นฟู', 'Rehabilitasi', 'إعادة التأهيل', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 7. i18n: L2 exercise subtype labels ─────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-short-walk', 'master.exercise_type.short_walk', 'master', true,
   '짧은 산책', 'Short Walk', '短い散歩', '短途散步', '短途散步', 'Caminata corta', 'Courte promenade', 'Kurzer Spaziergang', 'Caminhada curta', 'Đi dạo ngắn', 'เดินเล่นสั้นๆ', 'Jalan pendek', 'نزهة قصيرة', NOW(), NOW()),
  ('i18n-ex-regular-walk', 'master.exercise_type.regular_walk', 'master', true,
   '일반 산책', 'Regular Walk', '通常の散歩', '普通散步', '普通散步', 'Caminata regular', 'Promenade régulière', 'Normaler Spaziergang', 'Caminhada regular', 'Đi dạo thường', 'เดินเล่นปกติ', 'Jalan biasa', 'نزهة عادية', NOW(), NOW()),
  ('i18n-ex-long-walk', 'master.exercise_type.long_walk', 'master', true,
   '긴 산책', 'Long Walk', '長い散歩', '长途散步', '長途散步', 'Caminata larga', 'Longue promenade', 'Langer Spaziergang', 'Caminhada longa', 'Đi dạo dài', 'เดินเล่นยาว', 'Jalan panjang', 'نزهة طويلة', NOW(), NOW()),
  ('i18n-ex-hiking', 'master.exercise_type.hiking', 'master', true,
   '하이킹', 'Hiking', 'ハイキング', '远足', '健行', 'Senderismo', 'Randonnée', 'Wandern', 'Trilha', 'Đi bộ đường dài', 'เดินป่า', 'Hiking', 'المشي لمسافات', NOW(), NOW()),
  ('i18n-ex-run-owner', 'master.exercise_type.running_with_owner', 'master', true,
   '보호자와 달리기', 'Running with Owner', '飼い主と走る', '和主人跑步', '和主人跑步', 'Correr con dueño', 'Courir avec le maître', 'Laufen mit Besitzer', 'Corrida com dono', 'Chạy với chủ', 'วิ่งกับเจ้าของ', 'Berlari dengan pemilik', 'الركض مع المالك', NOW(), NOW()),
  ('i18n-ex-free-running', 'master.exercise_type.free_running', 'master', true,
   '자유 달리기', 'Free Running', '自由走り', '自由跑步', '自由跑步', 'Carrera libre', 'Course libre', 'Freilauf', 'Corrida livre', 'Chạy tự do', 'วิ่งอิสระ', 'Lari bebas', 'الركض الحر', NOW(), NOW()),
  ('i18n-ex-natural-swim', 'master.exercise_type.natural_swimming', 'master', true,
   '자연 수영', 'Natural Swimming', '自然水泳', '自然游泳', '自然游泳', 'Natación natural', 'Nage naturelle', 'Natürliches Schwimmen', 'Natação natural', 'Bơi tự nhiên', 'ว่ายน้ำธรรมชาติ', 'Renang alami', 'السباحة الطبيعية', NOW(), NOW()),
  ('i18n-ex-pool-swim', 'master.exercise_type.pool_swimming', 'master', true,
   '수영장', 'Pool Swimming', 'プール水泳', '泳池游泳', '泳池游泳', 'Natación en piscina', 'Piscine', 'Poolschwimmen', 'Natação em piscina', 'Bơi hồ bơi', 'ว่ายน้ำสระ', 'Renang kolam', 'السباحة في المسبح', NOW(), NOW()),
  ('i18n-ex-ball-play', 'master.exercise_type.ball_play', 'master', true,
   '공놀이', 'Ball Play', 'ボール遊び', '球类游戏', '球類遊戲', 'Juego de pelota', 'Jeu de balle', 'Ballspiel', 'Brincadeira com bola', 'Chơi bóng', 'เล่นบอล', 'Main bola', 'اللعب بالكرة', NOW(), NOW()),
  ('i18n-ex-tug-play', 'master.exercise_type.tug_play', 'master', true,
   '줄다리기', 'Tug Play', '引っ張り遊び', '拔河游戏', '拔河遊戲', 'Juego de tira', 'Jeu de traction', 'Zerrspiel', 'Cabo de guerra', 'Kéo co', 'เล่นดึง', 'Main tarik', 'لعبة السحب', NOW(), NOW()),
  ('i18n-ex-hide-seek', 'master.exercise_type.hide_and_seek', 'master', true,
   '숨바꼭질', 'Hide and Seek', 'かくれんぼ', '捉迷藏', '捉迷藏', 'Escondite', 'Cache-cache', 'Verstecken', 'Esconde-esconde', 'Trốn tìm', 'ซ่อนหา', 'Petak umpet', 'الغميضة', NOW(), NOW()),
  ('i18n-ex-free-play', 'master.exercise_type.free_play', 'master', true,
   '자유 놀이', 'Free Play', '自由遊び', '自由玩耍', '自由玩耍', 'Juego libre', 'Jeu libre', 'Freispiel', 'Brincadeira livre', 'Chơi tự do', 'เล่นอิสระ', 'Bermain bebas', 'اللعب الحر', NOW(), NOW()),
  ('i18n-ex-basic-obedience', 'master.exercise_type.basic_obedience', 'master', true,
   '기본 복종', 'Basic Obedience', '基本服従', '基础服从', '基礎服從', 'Obediencia básica', 'Obéissance de base', 'Grundgehorsam', 'Obediência básica', 'Vâng lời cơ bản', 'การเชื่อฟังพื้นฐาน', 'Kepatuhan dasar', 'الطاعة الأساسية', NOW(), NOW()),
  ('i18n-ex-agility', 'master.exercise_type.agility', 'master', true,
   '어질리티', 'Agility', 'アジリティ', '敏捷训练', '敏捷訓練', 'Agilidad', 'Agilité', 'Agility', 'Agilidade', 'Nhanh nhẹn', 'อะจิลิตี้', 'Agility', 'خفة الحركة', NOW(), NOW()),
  ('i18n-ex-nose-work', 'master.exercise_type.nose_work', 'master', true,
   '노즈워크', 'Nose Work', 'ノーズワーク', '嗅觉训练', '嗅覺訓練', 'Trabajo de nariz', 'Travail de nez', 'Nasenarbeit', 'Faro', 'Huấn luyện khứu giác', 'การฝึกจมูก', 'Nose work', 'عمل الأنف', NOW(), NOW()),
  ('i18n-ex-frisbee', 'master.exercise_type.frisbee', 'master', true,
   '프리스비', 'Frisbee', 'フリスビー', '飞盘', '飛盤', 'Frisbee', 'Frisbee', 'Frisbee', 'Frisbee', 'Đĩa bay', 'ฟริสบี้', 'Frisbee', 'فريسبي', NOW(), NOW()),
  ('i18n-ex-walking-rehab', 'master.exercise_type.walking_rehab', 'master', true,
   '보행 재활', 'Walking Rehab', '歩行リハビリ', '步行康复', '步行復健', 'Rehabilitación de caminata', 'Rééducation à la marche', 'Gehrehabilitation', 'Reabilitação de caminhada', 'Phục hồi đi bộ', 'การฟื้นฟูการเดิน', 'Rehabilitasi jalan', 'إعادة تأهيل المشي', NOW(), NOW()),
  ('i18n-ex-aqua-rehab', 'master.exercise_type.aqua_rehab', 'master', true,
   '수중 재활', 'Aqua Rehab', '水中リハビリ', '水中康复', '水中復健', 'Rehabilitación acuática', 'Rééducation aquatique', 'Aqua-Rehabilitation', 'Reabilitação aquática', 'Phục hồi dưới nước', 'การฟื้นฟูในน้ำ', 'Rehabilitasi air', 'إعادة التأهيل المائي', NOW(), NOW()),
  ('i18n-ex-stretching', 'master.exercise_type.stretching', 'master', true,
   '스트레칭', 'Stretching', 'ストレッチ', '拉伸', '伸展', 'Estiramiento', 'Étirement', 'Dehnen', 'Alongamento', 'Kéo giãn', 'ยืดกล้ามเนื้อ', 'Peregangan', 'تمارين الإطالة', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 8. i18n: UI labels for guardian.exercise.* ──────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-ui-add', 'guardian.exercise.add', 'guardian', true,
   '운동 추가', 'Add Exercise', '運動を追加', '添加运动', '新增運動', 'Agregar ejercicio', 'Ajouter exercice', 'Übung hinzufügen', 'Adicionar exercício', 'Thêm bài tập', 'เพิ่มการออกกำลังกาย', 'Tambah olahraga', 'إضافة تمرين', NOW(), NOW()),
  ('i18n-ex-ui-title', 'guardian.exercise.title', 'guardian', true,
   '운동 기록', 'Exercise Log', '運動記録', '运动记录', '運動記錄', 'Registro de ejercicio', 'Journal d''exercice', 'Trainingsprotokoll', 'Registro de exercício', 'Nhật ký tập luyện', 'บันทึกการออกกำลังกาย', 'Log olahraga', 'سجل التمرين', NOW(), NOW()),
  ('i18n-ex-ui-edit', 'guardian.exercise.edit_title', 'guardian', true,
   '운동 수정', 'Edit Exercise', '運動を編集', '编辑运动', '編輯運動', 'Editar ejercicio', 'Modifier exercice', 'Übung bearbeiten', 'Editar exercício', 'Sửa bài tập', 'แก้ไขการออกกำลังกาย', 'Edit olahraga', 'تعديل التمرين', NOW(), NOW()),
  ('i18n-ex-ui-type', 'guardian.exercise.type', 'guardian', true,
   '운동 종류', 'Exercise Type', '運動の種類', '运动类型', '運動類型', 'Tipo', 'Type', 'Typ', 'Tipo', 'Loại', 'ประเภท', 'Jenis', 'النوع', NOW(), NOW()),
  ('i18n-ex-ui-subtype', 'guardian.exercise.subtype', 'guardian', true,
   '세부 종류', 'Subtype', 'サブタイプ', '子类型', '子類型', 'Subtipo', 'Sous-type', 'Untertyp', 'Subtipo', 'Phân loại', 'ประเภทย่อย', 'Sub-jenis', 'النوع الفرعي', NOW(), NOW()),
  ('i18n-ex-ui-duration', 'guardian.exercise.duration', 'guardian', true,
   '시간 (분)', 'Duration (min)', '時間（分）', '时长（分钟）', '時長（分鐘）', 'Duración (min)', 'Durée (min)', 'Dauer (Min)', 'Duração (min)', 'Thời lượng (phút)', 'ระยะเวลา (นาที)', 'Durasi (menit)', 'المدة (دقيقة)', NOW(), NOW()),
  ('i18n-ex-ui-distance', 'guardian.exercise.distance', 'guardian', true,
   '거리 (km)', 'Distance (km)', '距離（km）', '距离（km）', '距離（km）', 'Distancia (km)', 'Distance (km)', 'Distanz (km)', 'Distância (km)', 'Khoảng cách (km)', 'ระยะทาง (กม.)', 'Jarak (km)', 'المسافة (كم)', NOW(), NOW()),
  ('i18n-ex-ui-intensity', 'guardian.exercise.intensity', 'guardian', true,
   '강도', 'Intensity', '強度', '强度', '強度', 'Intensidad', 'Intensité', 'Intensität', 'Intensidade', 'Cường độ', 'ความเข้มข้น', 'Intensitas', 'الشدة', NOW(), NOW()),
  ('i18n-ex-ui-leash', 'guardian.exercise.leash', 'guardian', true,
   '리드줄 사용', 'Leash Used', 'リード使用', '使用牵引绳', '使用牽引繩', 'Con correa', 'En laisse', 'An der Leine', 'Com guia', 'Có dây dắt', 'ใส่สายจูง', 'Pakai tali', 'بالمقود', NOW(), NOW()),
  ('i18n-ex-ui-location', 'guardian.exercise.location', 'guardian', true,
   '장소', 'Location', '場所', '地点', '地點', 'Ubicación', 'Lieu', 'Ort', 'Local', 'Địa điểm', 'สถานที่', 'Lokasi', 'الموقع', NOW(), NOW()),
  ('i18n-ex-ui-with-others', 'guardian.exercise.with_others', 'guardian', true,
   '다른 반려동물과 함께', 'With Other Pets', '他のペットと一緒', '与其他宠物一起', '與其他寵物一起', 'Con otras mascotas', 'Avec d''autres animaux', 'Mit anderen Haustieren', 'Com outros pets', 'Với thú cưng khác', 'กับสัตว์เลี้ยงอื่น', 'Dengan hewan lain', 'مع حيوانات أخرى', NOW(), NOW()),
  ('i18n-ex-ui-no-logs', 'guardian.exercise.no_logs', 'guardian', true,
   '운동 기록이 없습니다', 'No exercise logs', '運動記録がありません', '没有运动记录', '沒有運動記錄', 'Sin registros', 'Aucun enregistrement', 'Keine Einträge', 'Sem registros', 'Không có nhật ký', 'ไม่มีบันทึก', 'Tidak ada log', 'لا توجد سجلات', NOW(), NOW()),
  ('i18n-ex-ui-create-failed', 'guardian.exercise.create_failed', 'guardian', true,
   '운동 기록 저장에 실패했습니다', 'Failed to save exercise log', '運動記録の保存に失敗しました', '保存运动记录失败', '儲存運動記錄失敗', 'Error al guardar', 'Échec de la sauvegarde', 'Speichern fehlgeschlagen', 'Falha ao salvar', 'Không thể lưu', 'บันทึกล้มเหลว', 'Gagal menyimpan', 'فشل في الحفظ', NOW(), NOW()),
  ('i18n-ex-ui-int-low', 'guardian.exercise.intensity_low', 'guardian', true,
   '낮음', 'Low', '低い', '低', '低', 'Baja', 'Faible', 'Niedrig', 'Baixa', 'Thấp', 'ต่ำ', 'Rendah', 'منخفضة', NOW(), NOW()),
  ('i18n-ex-ui-int-med', 'guardian.exercise.intensity_medium', 'guardian', true,
   '보통', 'Medium', '普通', '中', '中', 'Media', 'Moyen', 'Mittel', 'Média', 'Trung bình', 'ปานกลาง', 'Sedang', 'متوسطة', NOW(), NOW()),
  ('i18n-ex-ui-int-high', 'guardian.exercise.intensity_high', 'guardian', true,
   '높음', 'High', '高い', '高', '高', 'Alta', 'Élevé', 'Hoch', 'Alta', 'Cao', 'สูง', 'Tinggi', 'عالية', NOW(), NOW()),
  ('i18n-ex-ui-loc-indoor', 'guardian.exercise.location_indoor', 'guardian', true,
   '실내', 'Indoor', '室内', '室内', '室內', 'Interior', 'Intérieur', 'Innen', 'Interior', 'Trong nhà', 'ในร่ม', 'Dalam ruangan', 'داخلي', NOW(), NOW()),
  ('i18n-ex-ui-loc-outdoor', 'guardian.exercise.location_outdoor', 'guardian', true,
   '실외', 'Outdoor', '屋外', '户外', '戶外', 'Exterior', 'Extérieur', 'Außen', 'Exterior', 'Ngoài trời', 'กลางแจ้ง', 'Luar ruangan', 'خارجي', NOW(), NOW()),
  ('i18n-ex-ui-loc-park', 'guardian.exercise.location_park', 'guardian', true,
   '공원', 'Park', '公園', '公园', '公園', 'Parque', 'Parc', 'Park', 'Parque', 'Công viên', 'สวนสาธารณะ', 'Taman', 'حديقة', NOW(), NOW()),
  ('i18n-ex-ui-loc-beach', 'guardian.exercise.location_beach', 'guardian', true,
   '해변', 'Beach', 'ビーチ', '海滩', '海灘', 'Playa', 'Plage', 'Strand', 'Praia', 'Bãi biển', 'ชายหาด', 'Pantai', 'شاطئ', NOW(), NOW()),
  ('i18n-ex-ui-loc-other', 'guardian.exercise.location_other', 'guardian', true,
   '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่นๆ', 'Lainnya', 'أخرى', NOW(), NOW()),
  ('i18n-ex-ui-date', 'guardian.exercise.date', 'guardian', true,
   '운동 날짜', 'Exercise Date', '運動日', '运动日期', '運動日期', 'Fecha', 'Date', 'Datum', 'Data', 'Ngày', 'วันที่', 'Tanggal', 'التاريخ', NOW(), NOW()),
  ('i18n-ex-ui-note', 'guardian.exercise.note', 'guardian', true,
   '메모', 'Note', 'メモ', '备注', '備註', 'Nota', 'Note', 'Notiz', 'Nota', 'Ghi chú', 'บันทึก', 'Catatan', 'ملاحظة', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
