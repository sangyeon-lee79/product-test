-- 065: i18n keys for Feeding Log supplement section
-- Depends on: 064_guardian_pet_ui_i18n.sql

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'guardian.feeding.supplement_section', 'guardian', true,
   '영양제 (선택사항)', 'Supplements (optional)', 'サプリメント（任意）', '营养补充剂（可选）', '營養補充劑（可選）',
   'Suplementos (opcional)', 'Compléments (optionnel)', 'Nahrungsergänzung (optional)', 'Suplementos (opcional)',
   'Thực phẩm bổ sung (tùy chọn)', 'อาหารเสริม (ไม่บังคับ)', 'Suplemen (opsional)', 'المكملات (اختياري)',
   NOW(), NOW()),

  (gen_random_uuid()::text, 'guardian.feeding.add_supplement', 'guardian', true,
   '영양제 추가', 'Add Supplement', 'サプリメント追加', '添加补充剂', '新增補充劑',
   'Agregar suplemento', 'Ajouter un complément', 'Ergänzung hinzufügen', 'Adicionar suplemento',
   'Thêm bổ sung', 'เพิ่มอาหารเสริม', 'Tambah suplemen', 'إضافة مكمل',
   NOW(), NOW()),

  (gen_random_uuid()::text, 'guardian.feeding.supplement_select', 'guardian', true,
   '영양제 선택', 'Select Supplement', 'サプリメント選択', '选择补充剂', '選擇補充劑',
   'Seleccionar suplemento', 'Choisir un complément', 'Ergänzung auswählen', 'Selecionar suplemento',
   'Chọn bổ sung', 'เลือกอาหารเสริม', 'Pilih suplemen', 'اختر المكمل',
   NOW(), NOW()),

  (gen_random_uuid()::text, 'guardian.feeding.supplement_dosage', 'guardian', true,
   '용량', 'Dosage', '用量', '剂量', '劑量',
   'Dosis', 'Dosage', 'Dosierung', 'Dosagem',
   'Liều lượng', 'ปริมาณ', 'Dosis', 'الجرعة',
   NOW(), NOW()),

  (gen_random_uuid()::text, 'guardian.feeding.no_supplements', 'guardian', true,
   '등록된 영양제가 없습니다. 사료/영양제 관리에서 먼저 추가해주세요.', 'No supplements registered. Please add them in Feed/Supplement management first.', '登録されたサプリメントがありません。飼料/サプリメント管理から追加してください。', '没有注册的补充剂。请先在饲料/补充剂管理中添加。', '沒有註冊的補充劑。請先在飼料/補充劑管理中新增。',
   'No hay suplementos registrados. Agréguelos primero en la gestión de alimentos/suplementos.', 'Aucun complément enregistré. Veuillez les ajouter dans la gestion alimentation/compléments.', 'Keine Nahrungsergänzungen registriert. Bitte zuerst in der Futter-/Ergänzungsverwaltung hinzufügen.', 'Nenhum suplemento registrado. Adicione-os primeiro no gerenciamento de ração/suplementos.',
   'Chưa có thực phẩm bổ sung. Vui lòng thêm trong quản lý thức ăn/bổ sung trước.', 'ยังไม่มีอาหารเสริมที่ลงทะเบียน กรุณาเพิ่มในจัดการอาหาร/อาหารเสริมก่อน', 'Belum ada suplemen terdaftar. Silakan tambahkan di manajemen pakan/suplemen terlebih dahulu.', 'لا توجد مكملات مسجلة. يرجى إضافتها في إدارة الأعلاف/المكملات أولاً.',
   NOW(), NOW()),

  (gen_random_uuid()::text, 'guardian.feeding.supplement_calories', 'guardian', true,
   '영양제 칼로리', 'Supplement Calories', 'サプリカロリー', '补充剂热量', '補充劑熱量',
   'Calorías suplementos', 'Calories compléments', 'Ergänzung-Kalorien', 'Calorias suplementos',
   'Calo bổ sung', 'แคลอรี่อาหารเสริม', 'Kalori suplemen', 'سعرات المكمل',
   NOW(), NOW()),

  (gen_random_uuid()::text, 'guardian.feeding.feed_calories', 'guardian', true,
   '사료 칼로리', 'Feed Calories', '飼料カロリー', '饲料热量', '飼料熱量',
   'Calorías alimento', 'Calories alimentation', 'Futter-Kalorien', 'Calorias ração',
   'Calo thức ăn', 'แคลอรี่อาหาร', 'Kalori pakan', 'سعرات العلف',
   NOW(), NOW()),

  (gen_random_uuid()::text, 'guardian.feeding.prescribed_badge', 'guardian', true,
   '처방', 'Rx', '処方', '处方', '處方',
   'Rx', 'Rx', 'Rx', 'Rx',
   'Rx', 'Rx', 'Rx', 'Rx',
   NOW(), NOW())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
