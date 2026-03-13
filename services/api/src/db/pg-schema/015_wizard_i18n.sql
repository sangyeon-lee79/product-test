-- =============================================================================
-- 015: Store wizard modal i18n keys (19 keys × 13 languages)
-- =============================================================================

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.step1_title', 'supplier', '기본 정보', 'Basic Info', '基本情報', '基本信息', '基本資訊', 'Info básica', 'Infos de base', 'Grundinfo', 'Info básica', 'Thông tin cơ bản', 'ข้อมูลพื้นฐาน', 'Info Dasar', 'معلومات أساسية')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.step2_title', 'supplier', '업종 & 펫 종류', 'Business & Pet Types', '業種 & ペットの種類', '业种与宠物类型', '業種與寵物類型', 'Negocio y tipos de mascota', 'Activité & types d''animaux', 'Branche & Tierarten', 'Negócio e tipos de pet', 'Ngành nghề & loại thú cưng', 'ธุรกิจ & ประเภทสัตว์เลี้ยง', 'Bisnis & Jenis Hewan', 'النشاط وأنواع الحيوانات')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.step3_title', 'supplier', '주소 & 운영시간', 'Address & Hours', '住所 & 営業時間', '地址与营业时间', '地址與營業時間', 'Dirección y horario', 'Adresse & horaires', 'Adresse & Öffnungszeiten', 'Endereço e horários', 'Địa chỉ & giờ mở cửa', 'ที่อยู่ & เวลาทำการ', 'Alamat & Jam Operasional', 'العنوان وساعات العمل')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.next', 'supplier', '다음', 'Next', '次へ', '下一步', '下一步', 'Siguiente', 'Suivant', 'Weiter', 'Próximo', 'Tiếp theo', 'ถัดไป', 'Selanjutnya', 'التالي')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.prev', 'supplier', '이전', 'Previous', '前へ', '上一步', '上一步', 'Anterior', 'Précédent', 'Zurück', 'Anterior', 'Trước đó', 'ก่อนหน้า', 'Sebelumnya', 'السابق')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.step_of', 'supplier', '{current} / {total} 단계', 'Step {current} of {total}', 'ステップ {current}/{total}', '第{current}步/共{total}步', '第{current}步/共{total}步', 'Paso {current} de {total}', 'Étape {current} sur {total}', 'Schritt {current} von {total}', 'Passo {current} de {total}', 'Bước {current}/{total}', 'ขั้นตอน {current}/{total}', 'Langkah {current} dari {total}', 'الخطوة {current} من {total}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.pet_support_title', 'supplier', '지원 동물 종류', 'Supported Pet Types', 'サポート動物の種類', '支持的动物类型', '支援的動物類型', 'Tipos de mascota soportados', 'Types d''animaux pris en charge', 'Unterstützte Tierarten', 'Tipos de pet suportados', 'Loại thú cưng được hỗ trợ', 'ประเภทสัตว์เลี้ยงที่รองรับ', 'Jenis Hewan yang Didukung', 'أنواع الحيوانات المدعومة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.pet_support_desc', 'supplier', '이 매장에서 지원하는 동물을 선택하세요', 'Select pet types this store supports', 'この店舗がサポートする動物を選択してください', '选择此店铺支持的动物类型', '選擇此店鋪支援的動物類型', 'Seleccione los tipos de mascota que admite esta tienda', 'Sélectionnez les types d''animaux pris en charge par ce magasin', 'Wählen Sie die Tierarten, die dieses Geschäft unterstützt', 'Selecione os tipos de pet que esta loja atende', 'Chọn loại thú cưng cửa hàng này hỗ trợ', 'เลือกประเภทสัตว์เลี้ยงที่ร้านค้านี้รองรับ', 'Pilih jenis hewan yang didukung toko ini', 'اختر أنواع الحيوانات التي يدعمها هذا المتجر')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.pet_l1_label', 'supplier', '동물 분류', 'Animal Category', '動物分類', '动物分类', '動物分類', 'Categoría animal', 'Catégorie animale', 'Tierkategorie', 'Categoria animal', 'Phân loại động vật', 'หมวดหมู่สัตว์', 'Kategori Hewan', 'فئة الحيوان')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.pet_l2_label', 'supplier', '세부 품종', 'Specific Breeds', '品種詳細', '具体品种', '具體品種', 'Razas específicas', 'Races spécifiques', 'Spezifische Rassen', 'Raças específicas', 'Giống cụ thể', 'สายพันธุ์เฉพาะ', 'Ras Spesifik', 'سلالات محددة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.wizard.pet_l2_all', 'supplier', '전체 품종', 'All Breeds', 'すべての品種', '所有品种', '所有品種', 'Todas las razas', 'Toutes les races', 'Alle Rassen', 'Todas as raças', 'Tất cả giống', 'ทุกสายพันธุ์', 'Semua Ras', 'جميع السلالات')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'common.cancel', 'common', '취소', 'Cancel', 'キャンセル', '取消', '取消', 'Cancelar', 'Annuler', 'Abbrechen', 'Cancelar', 'Hủy', 'ยกเลิก', 'Batal', 'إلغاء')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.mon', 'supplier', '월', 'Mon', '月', '一', '一', 'Lun', 'Lun', 'Mo', 'Seg', 'T2', 'จ.', 'Sen', 'الإثنين')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.tue', 'supplier', '화', 'Tue', '火', '二', '二', 'Mar', 'Mar', 'Di', 'Ter', 'T3', 'อ.', 'Sel', 'الثلاثاء')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.wed', 'supplier', '수', 'Wed', '水', '三', '三', 'Mié', 'Mer', 'Mi', 'Qua', 'T4', 'พ.', 'Rab', 'الأربعاء')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.thu', 'supplier', '목', 'Thu', '木', '四', '四', 'Jue', 'Jeu', 'Do', 'Qui', 'T5', 'พฤ.', 'Kam', 'الخميس')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.fri', 'supplier', '금', 'Fri', '金', '五', '五', 'Vie', 'Ven', 'Fr', 'Sex', 'T6', 'ศ.', 'Jum', 'الجمعة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.sat', 'supplier', '토', 'Sat', '土', '六', '六', 'Sáb', 'Sam', 'Sa', 'Sáb', 'T7', 'ส.', 'Sab', 'السبت')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.sun', 'supplier', '일', 'Sun', '日', '日', '日', 'Dom', 'Dim', 'So', 'Dom', 'CN', 'อา.', 'Min', 'الأحد')
ON CONFLICT (key) DO NOTHING;
