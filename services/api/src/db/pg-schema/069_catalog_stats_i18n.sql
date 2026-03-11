-- 069_catalog_stats_i18n.sql — 장치/사료/영양제 관리 페이지 통계 카드 i18n

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- 공통 라벨
(gen_random_uuid(), 'admin.catalog.stats.total_models', 'admin', '전체 모델', 'Total Models', '全モデル', '全部型号', '全部型號', 'Total modelos', 'Total modèles', 'Alle Modelle', 'Total modelos', 'Tổng mô hình', 'โมเดลทั้งหมด', 'Total Model', 'إجمالي النماذج', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.active', 'admin', '활성', 'Active', 'アクティブ', '活跃', '活躍', 'Activo', 'Actif', 'Aktiv', 'Ativo', 'Hoạt động', 'ใช้งาน', 'Aktif', 'نشط', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.user_registered', 'admin', '유저 등록', 'User Registered', 'ユーザー登録', '用户注册', '用戶註冊', 'Registro de usuarios', 'Inscrits', 'Nutzer registriert', 'Usuários registrados', 'Người dùng đăng ký', 'ผู้ใช้ลงทะเบียน', 'Pengguna Terdaftar', 'المستخدمون المسجلون', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.actual_usage', 'admin', '실사용', 'Actual Usage', '実使用', '实际使用', '實際使用', 'Uso real', 'Utilisation réelle', 'Tatsächliche Nutzung', 'Uso real', 'Sử dụng thực tế', 'การใช้งานจริง', 'Penggunaan Aktual', 'الاستخدام الفعلي', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.prescribed', 'admin', '처방전용', 'Prescribed', '処方専用', '处方专用', '處方專用', 'Con receta', 'Sur ordonnance', 'Verschrieben', 'Prescrito', 'Kê đơn', 'สั่งจ่าย', 'Resep', 'بوصفة طبية', true, NOW(), NOW()),

-- 설명 라벨
(gen_random_uuid(), 'admin.catalog.stats.total_models_desc', 'admin', '등록된 모델', 'Registered models', '登録済みモデル', '已注册型号', '已註冊型號', 'Modelos registrados', 'Modèles enregistrés', 'Registrierte Modelle', 'Modelos registrados', 'Mô hình đã đăng ký', 'โมเดลที่ลงทะเบียน', 'Model terdaftar', 'النماذج المسجلة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.active_desc', 'admin', '활성 모델', 'Active models', 'アクティブモデル', '活跃型号', '活躍型號', 'Modelos activos', 'Modèles actifs', 'Aktive Modelle', 'Modelos ativos', 'Mô hình hoạt động', 'โมเดลที่ใช้งาน', 'Model aktif', 'النماذج النشطة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.user_registered_device_desc', 'admin', '반려동물 연결', 'Pet connections', 'ペット接続', '宠物关联', '寵物關聯', 'Conexiones de mascotas', 'Connexions animaux', 'Haustier-Verbindungen', 'Conexões de pets', 'Kết nối thú cưng', 'การเชื่อมต่อสัตว์เลี้ยง', 'Koneksi hewan', 'اتصالات الحيوانات', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.user_registered_feed_desc', 'admin', '등록된 급여 수', 'Registered feeds', '登録済みフード数', '已注册饲料数', '已註冊飼料數', 'Alimentos registrados', 'Aliments enregistrés', 'Registriertes Futter', 'Rações registradas', 'Thức ăn đã đăng ký', 'อาหารที่ลงทะเบียน', 'Pakan terdaftar', 'الأعلاف المسجلة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.actual_usage_device_desc', 'admin', '최근 30일 기록', 'Records in last 30 days', '過去30日の記録', '最近30天记录', '最近30天記錄', 'Registros últimos 30 días', 'Enregistrements 30 derniers jours', 'Aufzeichnungen letzte 30 Tage', 'Registros últimos 30 dias', 'Ghi nhận 30 ngày qua', 'บันทึก 30 วันล่าสุด', 'Catatan 30 hari terakhir', 'سجلات آخر 30 يوم', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.actual_usage_feed_desc', 'admin', '최근 30일 급여 기록', 'Feeding logs in last 30 days', '過去30日の給餌記録', '最近30天喂食记录', '最近30天餵食記錄', 'Registros de alimentación 30 días', 'Journaux alimentation 30 jours', 'Fütterungsprotokolle 30 Tage', 'Registros alimentação 30 dias', 'Nhật ký cho ăn 30 ngày', 'บันทึกการให้อาหาร 30 วัน', 'Log pemberian makan 30 hari', 'سجلات التغذية 30 يوم', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.catalog.stats.prescribed_desc', 'admin', '처방 연결 항목', 'Prescribed items', '処方関連項目', '处方关联项目', '處方關聯項目', 'Artículos prescritos', 'Articles prescrits', 'Verschriebene Artikel', 'Itens prescritos', 'Mục kê đơn', 'รายการที่สั่งจ่าย', 'Item resep', 'العناصر الموصوفة', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
