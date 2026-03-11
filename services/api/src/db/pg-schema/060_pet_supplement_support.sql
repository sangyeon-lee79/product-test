-- 060: Pet supplement support — category_type on pet_feeds & feed_registration_requests + i18n keys
-- Allows the same pet_feeds table to store both feed and supplement registrations

-- 1) Add category_type to pet_feeds (existing rows default to 'feed')
ALTER TABLE pet_feeds ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'feed';

-- 2) Add category_type to feed_registration_requests
ALTER TABLE feed_registration_requests ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'feed';

-- 3) i18n keys for the guardian feed/supplement modal tabs + empty states
INSERT INTO i18n_translations (id, key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
  -- Tab labels
  (gen_random_uuid()::text, 'guardian.modal.tab_feed', '사료', 'Feed', 'フード', '饲料', '飼料', 'Alimento', 'Alimentation', 'Futter', 'Ração', 'Thức ăn', 'อาหาร', 'Pakan', 'طعام'),
  (gen_random_uuid()::text, 'guardian.modal.tab_supplement', '영양제', 'Supplement', 'サプリ', '营养品', '營養品', 'Suplemento', 'Supplément', 'Ergänzung', 'Suplemento', 'Thực phẩm bổ sung', 'อาหารเสริม', 'Suplemen', 'مكمل'),

  -- Feed empty state
  (gen_random_uuid()::text, 'guardian.feed.empty_title', '아직 등록된 사료가 없어요.', 'No feeds registered yet.', 'まだフードが登録されていません。', '还没有注册饲料。', '還沒有註冊飼料。', 'Aún no hay alimentos registrados.', 'Aucun aliment enregistré.', 'Noch kein Futter registriert.', 'Nenhuma ração registrada.', 'Chưa có thức ăn nào.', 'ยังไม่มีอาหารที่ลงทะเบียน', 'Belum ada pakan terdaftar.', 'لا يوجد طعام مسجل بعد.'),
  (gen_random_uuid()::text, 'guardian.feed.empty_desc', '반려동물의 사료를 추가해보세요!', 'Add your pet''s feed!', 'ペットのフードを追加しましょう！', '添加宠物的饲料吧！', '添加寵物的飼料吧！', '¡Agrega el alimento de tu mascota!', 'Ajoutez l''alimentation de votre animal !', 'Füge das Futter deines Haustieres hinzu!', 'Adicione a ração do seu pet!', 'Hãy thêm thức ăn cho thú cưng!', 'เพิ่มอาหารสัตว์เลี้ยงของคุณ!', 'Tambahkan pakan hewan peliharaan!', 'أضف طعام حيوانك الأليف!'),

  -- Supplement empty state
  (gen_random_uuid()::text, 'guardian.supplement.empty_title', '아직 등록된 영양제가 없어요.', 'No supplements registered yet.', 'まだサプリが登録されていません。', '还没有注册营养品。', '還沒有註冊營養品。', 'Aún no hay suplementos registrados.', 'Aucun supplément enregistré.', 'Noch keine Ergänzungen registriert.', 'Nenhum suplemento registrado.', 'Chưa có thực phẩm bổ sung nào.', 'ยังไม่มีอาหารเสริมที่ลงทะเบียน', 'Belum ada suplemen terdaftar.', 'لا توجد مكملات مسجلة بعد.'),
  (gen_random_uuid()::text, 'guardian.supplement.empty_desc', '반려동물의 영양제를 추가해보세요!', 'Add your pet''s supplements!', 'ペットのサプリを追加しましょう！', '添加宠物的营养品吧！', '添加寵物的營養品吧！', '¡Agrega el suplemento de tu mascota!', 'Ajoutez les suppléments de votre animal !', 'Füge die Ergänzungen deines Haustieres hinzu!', 'Adicione os suplementos do seu pet!', 'Hãy thêm thực phẩm bổ sung cho thú cưng!', 'เพิ่มอาหารเสริมสัตว์เลี้ยงของคุณ!', 'Tambahkan suplemen hewan peliharaan!', 'أضف مكملات حيوانك الأليف!'),

  -- Supplement CRUD labels
  (gen_random_uuid()::text, 'guardian.supplement.manage_title', '사료 / 영양제 관리', 'Feed / Supplement', 'フード / サプリ管理', '饲料 / 营养品管理', '飼料 / 營養品管理', 'Alimento / Suplemento', 'Alimentation / Supplément', 'Futter / Ergänzung', 'Ração / Suplemento', 'Thức ăn / Bổ sung', 'อาหาร / อาหารเสริม', 'Pakan / Suplemen', 'طعام / مكمل'),
  (gen_random_uuid()::text, 'guardian.supplement.add', '영양제 추가', 'Add Supplement', 'サプリ追加', '添加营养品', '添加營養品', 'Agregar suplemento', 'Ajouter supplément', 'Ergänzung hinzufügen', 'Adicionar suplemento', 'Thêm bổ sung', 'เพิ่มอาหารเสริม', 'Tambah suplemen', 'إضافة مكمل'),
  (gen_random_uuid()::text, 'guardian.supplement.edit', '영양제 수정', 'Edit Supplement', 'サプリ編集', '编辑营养品', '編輯營養品', 'Editar suplemento', 'Modifier supplément', 'Ergänzung bearbeiten', 'Editar suplemento', 'Sửa bổ sung', 'แก้ไขอาหารเสริม', 'Edit suplemen', 'تعديل مكمل'),
  (gen_random_uuid()::text, 'guardian.supplement.is_primary', '기본 영양제', 'Primary Supplement', 'メインサプリ', '主要营养品', '主要營養品', 'Suplemento principal', 'Supplément principal', 'Hauptergänzung', 'Suplemento principal', 'Bổ sung chính', 'อาหารเสริมหลัก', 'Suplemen utama', 'مكمل رئيسي'),
  (gen_random_uuid()::text, 'guardian.supplement.set_primary', '기본 설정', 'Set Primary', 'メインに設定', '设为主要', '設為主要', 'Establecer principal', 'Définir principal', 'Als Haupt setzen', 'Definir principal', 'Đặt chính', 'ตั้งเป็นหลัก', 'Tetapkan utama', 'تعيين رئيسي'),
  (gen_random_uuid()::text, 'guardian.supplement.delete_confirm', '이 영양제를 삭제하시겠습니까?', 'Delete this supplement?', 'このサプリを削除しますか？', '删除此营养品？', '刪除此營養品？', '¿Eliminar este suplemento?', 'Supprimer ce supplément ?', 'Diese Ergänzung löschen?', 'Excluir este suplemento?', 'Xóa bổ sung này?', 'ลบอาหารเสริมนี้?', 'Hapus suplemen ini?', 'حذف هذا المكمل؟'),
  (gen_random_uuid()::text, 'guardian.supplement.model_required', '영양제 제품을 선택해주세요.', 'Please select a supplement product.', 'サプリ製品を選択してください。', '请选择营养品。', '請選擇營養品。', 'Seleccione un suplemento.', 'Veuillez sélectionner un supplément.', 'Bitte wählen Sie ein Ergänzungsprodukt.', 'Selecione um suplemento.', 'Vui lòng chọn sản phẩm bổ sung.', 'กรุณาเลือกผลิตภัณฑ์เสริม', 'Silakan pilih produk suplemen.', 'يرجى اختيار منتج مكمل.'),

  -- Supplement registration request
  (gen_random_uuid()::text, 'guardian.supplement.request_btn', '영양제 등록 요청', 'Request Supplement Registration', 'サプリ登録リクエスト', '营养品注册请求', '營養品註冊請求', 'Solicitar registro de suplemento', 'Demande d''enregistrement de supplément', 'Ergänzungsregistrierung anfordern', 'Solicitar registro de suplemento', 'Yêu cầu đăng ký bổ sung', 'ขอลงทะเบียนอาหารเสริม', 'Minta pendaftaran suplemen', 'طلب تسجيل مكمل'),
  (gen_random_uuid()::text, 'guardian.supplement.request_desc', '원하는 영양제가 목록에 없나요? 등록을 요청해주세요.', 'Can''t find your supplement? Request registration.', 'お探しのサプリがありませんか？登録をリクエストしてください。', '找不到您的营养品？请申请注册。', '找不到您的營養品？請申請註冊。', '¿No encuentra su suplemento? Solicite registro.', 'Vous ne trouvez pas votre supplément ? Demandez l''enregistrement.', 'Ergänzung nicht gefunden? Registrierung anfordern.', 'Não encontrou seu suplemento? Solicite registro.', 'Không tìm thấy bổ sung? Yêu cầu đăng ký.', 'หาอาหารเสริมไม่พบ? ขอลงทะเบียน', 'Tidak menemukan suplemen? Minta pendaftaran.', 'لم تجد المكمل؟ اطلب التسجيل.'),
  (gen_random_uuid()::text, 'guardian.supplement.prescribed_badge', '처방', 'Rx', '処方', '处方', '處方', 'Rx', 'Rx', 'Rx', 'Rx', 'Rx', 'Rx', 'Rx', 'Rx'),
  (gen_random_uuid()::text, 'guardian.supplement.nickname', '별명', 'Nickname', 'ニックネーム', '昵称', '暱稱', 'Apodo', 'Surnom', 'Spitzname', 'Apelido', 'Biệt danh', 'ชื่อเล่น', 'Nama panggilan', 'اسم مستعار'),
  (gen_random_uuid()::text, 'guardian.supplement.nickname_placeholder', '예: 방울이 관절 영양제', 'e.g. Buddy''s joint supplement', '例: ポチの関節サプリ', '例：毛毛的关节营养品', '例：毛毛的關節營養品', 'ej. Suplemento articular de Max', 'ex. Supplément articulaire de Max', 'z.B. Buddys Gelenkergänzung', 'ex. Suplemento articular do Rex', 'VD: Bổ sung khớp của Buddy', 'เช่น อาหารเสริมข้อต่อของบัดดี้', 'cth. Suplemen sendi Buddy', 'مثال: مكمل مفاصل بادي'),

  -- Supplement type label
  (gen_random_uuid()::text, 'guardian.supplement.type', '영양제 유형', 'Supplement Type', 'サプリタイプ', '营养品类型', '營養品類型', 'Tipo de suplemento', 'Type de supplément', 'Ergänzungstyp', 'Tipo de suplemento', 'Loại bổ sung', 'ประเภทอาหารเสริม', 'Jenis suplemen', 'نوع المكمل'),
  (gen_random_uuid()::text, 'guardian.supplement.request_name', '영양제 이름', 'Supplement Name', 'サプリ名', '营养品名称', '營養品名稱', 'Nombre del suplemento', 'Nom du supplément', 'Ergänzungsname', 'Nome do suplemento', 'Tên bổ sung', 'ชื่ออาหารเสริม', 'Nama suplemen', 'اسم المكمل')
ON CONFLICT (key) DO NOTHING;
