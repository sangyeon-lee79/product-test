INSERT OR IGNORE INTO master_categories (id, code, sort_order, status, created_at, updated_at) VALUES
  ('mc-business-category', 'business_category', 230, 'active', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-hospital', c.id, NULL, 'hospital', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'business_category';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-grooming', c.id, NULL, 'grooming', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'business_category';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-petshop', c.id, NULL, 'pet_shop', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'business_category';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-hotel', c.id, NULL, 'pet_hotel', 4, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'business_category';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-training', c.id, NULL, 'training', 5, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'business_category';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-doctor', c.id, p.id, 'doctor', 101, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'hospital' AND p.category_id = c.id;
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-nurse', c.id, p.id, 'nurse', 102, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'hospital' AND p.category_id = c.id;
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-groomer', c.id, p.id, 'groomer', 201, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'grooming' AND p.category_id = c.id;
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-stylist', c.id, p.id, 'stylist', 202, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'grooming' AND p.category_id = c.id;
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-shop-manager', c.id, p.id, 'shop_manager', 301, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'pet_shop' AND p.category_id = c.id;
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-consultant', c.id, p.id, 'consultant', 302, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'pet_shop' AND p.category_id = c.id;
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-caretaker', c.id, p.id, 'caretaker', 401, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'pet_hotel' AND p.category_id = c.id;
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-business-trainer', c.id, p.id, 'trainer', 501, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'business_category' AND p.code = 'training' AND p.category_id = c.id;

INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at) VALUES
  (lower(hex(randomblob(16))), 'master.business_category', 'master', '업종 분류', 'Business Category', '業種分類', '业务分类', '業務分類', 'Categoria de negocio', 'Categorie d activite', 'Geschaeftskategorie', 'Categoria de negocio', 'Danh muc nganh nghe', 'หมวดหมู่ธุรกิจ', 'Kategori bisnis', 'فئة النشاط', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.hospital', 'master', '병원', 'Hospital', '病院', '医院', '醫院', 'Hospital', 'Hopital', 'Klinik', 'Hospital', 'Benh vien', 'โรงพยาบาลสัตว์', 'Rumah sakit', 'مستشفى', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.grooming', 'master', '애견미용', 'Grooming', 'トリミング', '美容', '美容', 'Peluqueria', 'Toilettage', 'Pflege', 'Banho e tosa', 'Cham soc lam dep', 'ตัดแต่งขน', 'Grooming', 'العناية والتجميل', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.pet_shop', 'master', '펫샵', 'Pet Shop', 'ペットショップ', '宠物店', '寵物店', 'Tienda de mascotas', 'Boutique animalerie', 'Zoofachgeschaeft', 'Pet shop', 'Cua hang thu cung', 'ร้านเพ็ทช็อป', 'Toko hewan', 'متجر حيوانات أليفة', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.pet_hotel', 'master', '펫호텔', 'Pet Hotel', 'ペットホテル', '宠物酒店', '寵物旅館', 'Hotel para mascotas', 'Hotel pour animaux', 'Tierhotel', 'Hotel pet', 'Khach san thu cung', 'โรงแรมสัตว์เลี้ยง', 'Hotel hewan', 'فندق للحيوانات الأليفة', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.training', 'master', '훈련', 'Training', '訓練', '训练', '訓練', 'Entrenamiento', 'Dressage', 'Training', 'Treinamento', 'Huan luyen', 'ฝึกสอน', 'Pelatihan', 'تدريب', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.doctor', 'master', '담당 의사', 'Doctor', '担当医', '负责医生', '負責醫師', 'Doctor', 'Medecin', 'Arzt', 'Medico', 'Bac si', 'สัตวแพทย์', 'Dokter', 'طبيب', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.nurse', 'master', '담당 간호사', 'Nurse', '担当看護師', '负责护士', '負責護理師', 'Enfermero', 'Infirmier', 'Pflegekraft', 'Enfermeiro', 'Y ta', 'พยาบาล', 'Perawat', 'ممرض', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.groomer', 'master', '담당 미용사', 'Groomer', '担当トリマー', '负责美容师', '負責美容師', 'Estilista', 'Toiletteur', 'Hundefriseur', 'Tosador', 'Nguoi cat tia', 'ช่างตัดแต่งขน', 'Groomer', 'مصفف', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.stylist', 'master', '스타일리스트', 'Stylist', 'スタイリスト', '造型师', '造型師', 'Estilista', 'Styliste', 'Stylist', 'Estilista', 'Nha tao mau', 'สไตลิสต์', 'Stylist', 'مصمم', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.shop_manager', 'master', '매장 담당자', 'Shop Manager', '店舗担当者', '门店负责人', '門市負責人', 'Responsable de tienda', 'Responsable boutique', 'Filialleiter', 'Gerente da loja', 'Quan ly cua hang', 'ผู้จัดการร้าน', 'Manajer toko', 'مدير المتجر', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.consultant', 'master', '상담 담당자', 'Consultant', '相談担当者', '顾问', '顧問', 'Consultor', 'Conseiller', 'Berater', 'Consultor', 'Tu van vien', 'ที่ปรึกษา', 'Konsultan', 'مستشار', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.caretaker', 'master', '케어 담당자', 'Caretaker', 'ケア担当者', '护理人员', '照護人員', 'Cuidador', 'Soigneur', 'Betreuer', 'Cuidador', 'Nguoi cham soc', 'ผู้ดูแล', 'Perawat', 'مقدم رعاية', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'master.business_category.trainer', 'master', '훈련사', 'Trainer', 'トレーナー', '训犬师', '訓練師', 'Entrenador', 'Dresseur', 'Trainer', 'Treinador', 'Huan luyen vien', 'ครูฝึก', 'Pelatih', 'مدرب', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0080_business_category_seed');
