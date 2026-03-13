-- =============================================================================
-- 016: Store pet selection UX i18n keys (10 keys × 13 languages)
-- =============================================================================

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.select_animal', 'supplier', '동물 종류를 선택하세요', 'Select Animal Type', '動物の種類を選択してください', '请选择动物类型', '請選擇動物類型', 'Seleccione el tipo de animal', 'Sélectionnez le type d''animal', 'Tierart auswählen', 'Selecione o tipo de animal', 'Chọn loại động vật', 'เลือกประเภทสัตว์', 'Pilih Jenis Hewan', 'اختر نوع الحيوان')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.select_breed', 'supplier', '품종을 선택하세요 (복수 선택 가능)', 'Select Breeds (multiple)', '品種を選択してください（複数可）', '请选择品种（可多选）', '請選擇品種（可多選）', 'Seleccione razas (múltiple)', 'Sélectionnez les races (multiple)', 'Rassen auswählen (mehrere)', 'Selecione raças (múltiplas)', 'Chọn giống (nhiều)', 'เลือกสายพันธุ์ (หลายตัว)', 'Pilih Ras (beberapa)', 'اختر السلالات (متعدد)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.all_breeds', 'supplier', '전체 품종', 'All Breeds', 'すべての品種', '所有品种', '所有品種', 'Todas las razas', 'Toutes les races', 'Alle Rassen', 'Todas as raças', 'Tất cả giống', 'ทุกสายพันธุ์', 'Semua Ras', 'جميع السلالات')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.change_animal', 'supplier', '동물 변경', 'Change Animal', '動物を変更', '更改动物', '更改動物', 'Cambiar animal', 'Changer d''animal', 'Tier ändern', 'Mudar animal', 'Đổi động vật', 'เปลี่ยนสัตว์', 'Ganti Hewan', 'تغيير الحيوان')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.selected_breeds', 'supplier', '선택된 품종: {list}', 'Selected: {list}', '選択された品種: {list}', '已选品种: {list}', '已選品種: {list}', 'Seleccionadas: {list}', 'Sélectionnées : {list}', 'Ausgewählt: {list}', 'Selecionadas: {list}', 'Đã chọn: {list}', 'ที่เลือก: {list}', 'Terpilih: {list}', 'المحدد: {list}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.add_combination', 'supplier', '이 조합으로 등록하기', 'Register This Combination', 'この組み合わせで登録', '注册此组合', '註冊此組合', 'Registrar esta combinación', 'Enregistrer cette combinaison', 'Diese Kombination registrieren', 'Registrar esta combinação', 'Đăng ký tổ hợp này', 'ลงทะเบียนชุดนี้', 'Daftarkan Kombinasi Ini', 'تسجيل هذه المجموعة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.add_another', 'supplier', '다른 동물 종류 추가하기', 'Add Another Animal Type', '別の動物を追加', '添加其他动物类型', '新增其他動物類型', 'Agregar otro tipo de animal', 'Ajouter un autre type d''animal', 'Weitere Tierart hinzufügen', 'Adicionar outro tipo de animal', 'Thêm loại động vật khác', 'เพิ่มสัตว์ประเภทอื่น', 'Tambah Jenis Hewan Lain', 'إضافة نوع حيوان آخر')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.registered', 'supplier', '등록된 동물 종류', 'Registered Types', '登録された動物', '已注册的动物类型', '已註冊的動物類型', 'Tipos registrados', 'Types enregistrés', 'Registrierte Tierarten', 'Tipos registrados', 'Đã đăng ký', 'ประเภทที่ลงทะเบียน', 'Jenis Terdaftar', 'الأنواع المسجلة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.edit', 'supplier', '수정', 'Edit', '編集', '编辑', '編輯', 'Editar', 'Modifier', 'Bearbeiten', 'Editar', 'Sửa', 'แก้ไข', 'Edit', 'تعديل')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'store.pet.required_warning', 'supplier', '동물 종류를 1개 이상 등록하는 것을 권장합니다', 'We recommend registering at least one animal type', '動物の種類を1つ以上登録することを推奨します', '建议至少注册一种动物类型', '建議至少註冊一種動物類型', 'Recomendamos registrar al menos un tipo de animal', 'Nous recommandons d''enregistrer au moins un type d''animal', 'Wir empfehlen mindestens eine Tierart zu registrieren', 'Recomendamos registrar pelo menos um tipo de animal', 'Khuyến nghị đăng ký ít nhất một loại động vật', 'แนะนำให้ลงทะเบียนสัตว์อย่างน้อย 1 ประเภท', 'Disarankan mendaftarkan minimal satu jenis hewan', 'نوصي بتسجيل نوع حيوان واحد على الأقل')
ON CONFLICT (key) DO NOTHING;
