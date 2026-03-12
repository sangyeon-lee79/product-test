-- 091_store_address_business_i18n.sql — 매장 주소/업종 드롭다운 i18n 키

-- ─── Address Labels ─────────────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'store.address.state', 'provider', '시/도', 'State/Province', '都道府県', '省/市', '省/市', 'Estado/Provincia', 'État/Province', 'Bundesland', 'Estado/Província', 'Tỉnh/Thành phố', 'จังหวัด', 'Provinsi', 'المحافظة', true, NOW(), NOW()),
(gen_random_uuid(), 'store.address.city', 'provider', '시/군/구', 'City/District', '市区町村', '市/区/县', '市/區/縣', 'Ciudad/Distrito', 'Ville/District', 'Stadt/Bezirk', 'Cidade/Distrito', 'Quận/Huyện', 'เขต/อำเภอ', 'Kota/Kabupaten', 'المدينة/المنطقة', true, NOW(), NOW()),
(gen_random_uuid(), 'store.address.detail', 'provider', '상세주소', 'Detail Address', '詳細住所', '详细地址', '詳細地址', 'Dirección detallada', 'Adresse détaillée', 'Detailadresse', 'Endereço detalhado', 'Địa chỉ chi tiết', 'ที่อยู่โดยละเอียด', 'Alamat Detail', 'العنوان التفصيلي', true, NOW(), NOW()),
(gen_random_uuid(), 'store.address.select_state', 'provider', '시/도 선택', 'Select State', '都道府県を選択', '选择省/市', '選擇省/市', 'Seleccionar estado', 'Sélectionner l''état', 'Bundesland wählen', 'Selecionar estado', 'Chọn tỉnh/thành', 'เลือกจังหวัด', 'Pilih Provinsi', 'اختر المحافظة', true, NOW(), NOW()),
(gen_random_uuid(), 'store.address.select_city', 'provider', '시/군/구 선택', 'Select City', '市区町村を選択', '选择市/区/县', '選擇市/區/縣', 'Seleccionar ciudad', 'Sélectionner la ville', 'Stadt wählen', 'Selecionar cidade', 'Chọn quận/huyện', 'เลือกเขต/อำเภอ', 'Pilih Kota', 'اختر المدينة', true, NOW(), NOW()),
(gen_random_uuid(), 'store.address.detail_placeholder', 'provider', '상세주소를 입력하세요', 'Enter detail address', '詳細住所を入力', '请输入详细地址', '請輸入詳細地址', 'Ingrese la dirección', 'Entrez l''adresse', 'Adresse eingeben', 'Digite o endereço', 'Nhập địa chỉ', 'กรอกที่อยู่', 'Masukkan alamat', 'أدخل العنوان', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Business Type Labels ───────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'store.business.type', 'provider', '업종', 'Business Type', '業種', '行业类型', '行業類型', 'Tipo de negocio', 'Type d''activité', 'Geschäftsart', 'Tipo de negócio', 'Loại hình', 'ประเภทธุรกิจ', 'Jenis Usaha', 'نوع النشاط', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.subtype', 'provider', '부업종', 'Sub Category', '副業種', '子类别', '子類別', 'Subcategoría', 'Sous-catégorie', 'Unterkategorie', 'Subcategoria', 'Danh mục phụ', 'หมวดย่อย', 'Sub Kategori', 'فئة فرعية', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.select_type', 'provider', '업종 선택', 'Select Type', '業種を選択', '选择类型', '選擇類型', 'Seleccionar tipo', 'Sélectionner le type', 'Art wählen', 'Selecionar tipo', 'Chọn loại', 'เลือกประเภท', 'Pilih Jenis', 'اختر النوع', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.select_subtype', 'provider', '부업종 선택', 'Select Sub Type', '副業種を選択', '选择子类别', '選擇子類別', 'Seleccionar subtipo', 'Sélectionner le sous-type', 'Unterart wählen', 'Selecionar subtipo', 'Chọn danh mục phụ', 'เลือกหมวดย่อย', 'Pilih Sub Jenis', 'اختر النوع الفرعي', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Business L1 Category Labels ────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'store.business.hospital', 'provider', '동물병원', 'Veterinary Hospital', '動物病院', '动物医院', '動物醫院', 'Hospital veterinario', 'Hôpital vétérinaire', 'Tierklinik', 'Hospital veterinário', 'Bệnh viện thú y', 'โรงพยาบาลสัตว์', 'Rumah Sakit Hewan', 'مستشفى بيطري', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.grooming', 'provider', '미용', 'Grooming', 'トリミング', '美容', '美容', 'Peluquería', 'Toilettage', 'Pflege', 'Banho e tosa', 'Làm đẹp', 'ตัดแต่งขน', 'Grooming', 'تجميل', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.hotel', 'provider', '호텔/유치원', 'Hotel/Daycare', 'ホテル/幼稚園', '宠物酒店/托管', '寵物飯店/托管', 'Hotel/Guardería', 'Hôtel/Garderie', 'Hotel/Betreuung', 'Hotel/Creche', 'Khách sạn/Nhà trẻ', 'โรงแรม/เนอสเซอรี่', 'Hotel/Penitipan', 'فندق/حضانة', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.training', 'provider', '훈련소', 'Training', 'トレーニング', '训练中心', '訓練中心', 'Entrenamiento', 'Dressage', 'Training', 'Treinamento', 'Huấn luyện', 'ฝึกสัตว์', 'Pelatihan', 'تدريب', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.shop', 'provider', '펫샵', 'Pet Shop', 'ペットショップ', '宠物店', '寵物店', 'Tienda de mascotas', 'Animalerie', 'Tierhandlung', 'Pet shop', 'Cửa hàng thú cưng', 'ร้านสัตว์เลี้ยง', 'Pet Shop', 'متجر حيوانات', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.cafe', 'provider', '펫카페', 'Pet Cafe', 'ペットカフェ', '宠物咖啡馆', '寵物咖啡館', 'Café de mascotas', 'Café pour animaux', 'Tiercafé', 'Pet café', 'Cà phê thú cưng', 'คาเฟ่สัตว์เลี้ยง', 'Kafe Hewan', 'مقهى حيوانات', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.photo', 'provider', '사진관', 'Pet Studio', 'ペットスタジオ', '宠物摄影', '寵物攝影', 'Estudio de mascotas', 'Studio pour animaux', 'Tierfotostudio', 'Estúdio pet', 'Studio thú cưng', 'สตูดิโอสัตว์เลี้ยง', 'Studio Hewan', 'استوديو حيوانات', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Business L2 Sub-Category Labels ────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- hospital subs
(gen_random_uuid(), 'store.business.hospital.general', 'provider', '일반진료', 'General Practice', '一般診療', '一般诊疗', '一般診療', 'Práctica general', 'Médecine générale', 'Allgemeinmedizin', 'Clínica geral', 'Khám tổng quát', 'ตรวจทั่วไป', 'Praktik Umum', 'ممارسة عامة', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.hospital.emergency', 'provider', '응급', 'Emergency', '救急', '急诊', '急診', 'Emergencia', 'Urgences', 'Notfall', 'Emergência', 'Cấp cứu', 'ฉุกเฉิน', 'Darurat', 'طوارئ', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.hospital.specialist', 'provider', '전문진료', 'Specialist', '専門診療', '专科诊疗', '專科診療', 'Especialista', 'Spécialiste', 'Facharzt', 'Especialista', 'Chuyên khoa', 'เฉพาะทาง', 'Spesialis', 'تخصصي', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.hospital.dental', 'provider', '치과', 'Dental', '歯科', '牙科', '牙科', 'Dental', 'Dentaire', 'Zahnmedizin', 'Odontologia', 'Nha khoa', 'ทันตกรรม', 'Gigi', 'أسنان', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.hospital.oriental', 'provider', '한방', 'Oriental Medicine', '漢方', '中医', '中醫', 'Medicina oriental', 'Médecine orientale', 'Orientalische Medizin', 'Medicina oriental', 'Y học cổ truyền', 'แพทย์แผนตะวันออก', 'Pengobatan Timur', 'الطب الشرقي', true, NOW(), NOW()),
-- grooming subs
(gen_random_uuid(), 'store.business.grooming.full', 'provider', '전체미용', 'Full Grooming', 'フルトリミング', '全套美容', '全套美容', 'Peluquería completa', 'Toilettage complet', 'Komplettepflege', 'Banho e tosa completo', 'Làm đẹp toàn bộ', 'ตัดแต่งขนเต็มรูปแบบ', 'Grooming Lengkap', 'تجميل كامل', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.grooming.bath', 'provider', '목욕', 'Bath', 'シャンプー', '洗澡', '洗澡', 'Baño', 'Bain', 'Bad', 'Banho', 'Tắm', 'อาบน้ำ', 'Mandi', 'استحمام', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.grooming.nail', 'provider', '발톱', 'Nail Trimming', '爪切り', '修剪指甲', '修剪指甲', 'Corte de uñas', 'Coupe d''ongles', 'Krallenschnitt', 'Corte de unhas', 'Cắt móng', 'ตัดเล็บ', 'Potong Kuku', 'تقليم أظافر', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.grooming.style', 'provider', '스타일링', 'Styling', 'スタイリング', '造型', '造型', 'Estilismo', 'Stylisme', 'Styling', 'Estilização', 'Tạo kiểu', 'สไตลิ่ง', 'Styling', 'تصفيف', true, NOW(), NOW()),
-- hotel subs
(gen_random_uuid(), 'store.business.hotel.hotel', 'provider', '호텔', 'Hotel', 'ホテル', '酒店', '飯店', 'Hotel', 'Hôtel', 'Hotel', 'Hotel', 'Khách sạn', 'โรงแรม', 'Hotel', 'فندق', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.hotel.daycare', 'provider', '유치원', 'Daycare', '幼稚園', '日托', '日托', 'Guardería', 'Garderie', 'Tagesbetreuung', 'Creche', 'Nhà trẻ', 'เนอสเซอรี่', 'Penitipan', 'حضانة', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.hotel.boarding', 'provider', '위탁', 'Boarding', '預かり', '寄养', '寄養', 'Alojamiento', 'Pension', 'Pension', 'Hospedagem', 'Gửi nuôi', 'ฝากเลี้ยง', 'Penitipan', 'إيواء', true, NOW(), NOW()),
-- training subs
(gen_random_uuid(), 'store.business.training.basic', 'provider', '기초훈련', 'Basic Training', '基礎トレーニング', '基础训练', '基礎訓練', 'Entrenamiento básico', 'Dressage de base', 'Grundtraining', 'Treinamento básico', 'Huấn luyện cơ bản', 'ฝึกขั้นพื้นฐาน', 'Pelatihan Dasar', 'تدريب أساسي', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.training.behavior', 'provider', '행동교정', 'Behavior Correction', '行動矯正', '行为矫正', '行為矯正', 'Corrección de comportamiento', 'Correction comportementale', 'Verhaltenskorrektur', 'Correção comportamental', 'Chỉnh hành vi', 'แก้ไขพฤติกรรม', 'Koreksi Perilaku', 'تصحيح سلوك', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.training.agility', 'provider', '어질리티', 'Agility', 'アジリティ', '敏捷训练', '敏捷訓練', 'Agilidad', 'Agilité', 'Agility', 'Agilidade', 'Agility', 'อะจิลิตี้', 'Agility', 'الرشاقة', true, NOW(), NOW()),
-- shop subs
(gen_random_uuid(), 'store.business.shop.food', 'provider', '사료/간식', 'Food/Treats', 'フード/おやつ', '食品/零食', '食品/零食', 'Alimento/Golosinas', 'Nourriture/Friandises', 'Futter/Leckerlis', 'Ração/Petiscos', 'Thức ăn/Snack', 'อาหาร/ขนม', 'Makanan/Camilan', 'طعام/حلوى', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.shop.supplies', 'provider', '용품', 'Supplies', '用品', '用品', '用品', 'Suministros', 'Fournitures', 'Zubehör', 'Acessórios', 'Dụng cụ', 'อุปกรณ์', 'Perlengkapan', 'مستلزمات', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.shop.live', 'provider', '생체', 'Live Animals', '生体', '活体', '活體', 'Animales vivos', 'Animaux vivants', 'Lebende Tiere', 'Animais vivos', 'Thú sống', 'สัตว์มีชีวิต', 'Hewan Hidup', 'حيوانات حية', true, NOW(), NOW()),
-- cafe subs
(gen_random_uuid(), 'store.business.cafe.cat', 'provider', '고양이카페', 'Cat Cafe', '猫カフェ', '猫咖啡馆', '貓咖啡館', 'Café de gatos', 'Café de chats', 'Katzencafé', 'Cat café', 'Cà phê mèo', 'คาเฟ่แมว', 'Kafe Kucing', 'مقهى قطط', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.cafe.dog', 'provider', '강아지카페', 'Dog Cafe', '犬カフェ', '狗咖啡馆', '狗咖啡館', 'Café de perros', 'Café de chiens', 'Hundecafé', 'Dog café', 'Cà phê chó', 'คาเฟ่สุนัข', 'Kafe Anjing', 'مقهى كلاب', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.cafe.general', 'provider', '일반', 'General', '一般', '综合', '綜合', 'General', 'Général', 'Allgemein', 'Geral', 'Tổng hợp', 'ทั่วไป', 'Umum', 'عام', true, NOW(), NOW()),
-- photo subs
(gen_random_uuid(), 'store.business.photo.studio', 'provider', '스튜디오', 'Studio', 'スタジオ', '摄影棚', '攝影棚', 'Estudio', 'Studio', 'Studio', 'Estúdio', 'Studio', 'สตูดิโอ', 'Studio', 'استوديو', true, NOW(), NOW()),
(gen_random_uuid(), 'store.business.photo.outdoor', 'provider', '야외촬영', 'Outdoor Shooting', '屋外撮影', '户外拍摄', '戶外拍攝', 'Sesión al aire libre', 'Prise de vue extérieure', 'Außenaufnahme', 'Sessão externa', 'Chụp ngoại cảnh', 'ถ่ายภาพกลางแจ้ง', 'Pemotretan Luar', 'تصوير خارجي', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
