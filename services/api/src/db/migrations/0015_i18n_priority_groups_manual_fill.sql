-- Migration 0015: i18n 우선순위 그룹 수동 번역 완성
-- 대상:
-- admin.common.*, admin.nav.*, admin.master.*, admin.i18n.*, admin.countries.*, admin.disease_maps.*, admin.dashboard.*, admin.login.*
-- guardian.* (공란/placeholder 점검), supplier.*, signup.*, login.*, public.main.* (키 존재 시 보정)

-- -----------------------------------------------------------------------------
-- 1) Admin Dashboard / Login 상세 키 수동 번역
-- -----------------------------------------------------------------------------
INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at) VALUES
(lower(hex(randomblob(16))), 'admin.dashboard.title', 'admin.dashboard', '분석 대시보드', 'Analytics Dashboard', '分析ダッシュボード', '分析仪表板', '分析儀表板', 'Panel analítico', 'Tableau analytique', 'Analyse-Dashboard', 'Painel analítico', 'Bảng điều khiển phân tích', 'แดชบอร์ดวิเคราะห์', 'Dasbor analitik', 'لوحة التحليلات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.api_status', 'admin.dashboard', 'API 상태', 'API Status', 'API状態', 'API状态', 'API狀態', 'Estado de API', 'État de l''API', 'API-Status', 'Status da API', 'Trạng thái API', 'สถานะ API', 'Status API', 'حالة API', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.env', 'admin.dashboard', '환경', 'Environment', '環境', '环境', '環境', 'Entorno', 'Environnement', 'Umgebung', 'Ambiente', 'Môi trường', 'สภาพแวดล้อม', 'Lingkungan', 'البيئة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.db', 'admin.dashboard', 'DB', 'DB', 'DB', '数据库', '資料庫', 'BD', 'BD', 'DB', 'BD', 'CSDL', 'ฐานข้อมูล', 'DB', 'قاعدة البيانات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.status_ok', 'admin.dashboard', '정상', 'OK', '正常', '正常', '正常', 'Correcto', 'OK', 'OK', 'OK', 'Ổn định', 'ปกติ', 'Normal', 'سليم', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.status_error', 'admin.dashboard', '오류', 'Error', 'エラー', '错误', '錯誤', 'Error', 'Erreur', 'Fehler', 'Erro', 'Lỗi', 'ข้อผิดพลาด', 'Kesalahan', 'خطأ', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.checking', 'admin.dashboard', '확인중...', 'Checking...', '確認中...', '检查中...', '檢查中...', 'Comprobando...', 'Vérification...', 'Prüfung...', 'Verificando...', 'Đang kiểm tra...', 'กำลังตรวจสอบ...', 'Memeriksa...', 'جارٍ التحقق...', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.connecting', 'admin.dashboard', '연결중...', 'Connecting...', '接続中...', '连接中...', '連線中...', 'Conectando...', 'Connexion...', 'Verbindung...', 'Conectando...', 'Đang kết nối...', 'กำลังเชื่อมต่อ...', 'Menghubungkan...', 'جارٍ الاتصال...', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.dashboard.progress', 'admin.dashboard', '개발 진행 현황 (PLAN.md)', 'Development Progress (PLAN.md)', '開発進捗 (PLAN.md)', '开发进度 (PLAN.md)', '開發進度 (PLAN.md)', 'Progreso de desarrollo (PLAN.md)', 'Progression du développement (PLAN.md)', 'Entwicklungsfortschritt (PLAN.md)', 'Progresso de desenvolvimento (PLAN.md)', 'Tiến độ phát triển (PLAN.md)', 'ความคืบหน้าการพัฒนา (PLAN.md)', 'Progres pengembangan (PLAN.md)', 'تقدم التطوير (PLAN.md)', 1, datetime('now'), datetime('now')),

(lower(hex(randomblob(16))), 'admin.login.app_name', 'admin.login', '방울아 놀자', 'Bang-ul Play', 'バンウルと遊ぼう', '和Bang-ul一起玩', '和Bang-ul一起玩', 'Juega con Bang-ul', 'Joue avec Bang-ul', 'Spiele mit Bang-ul', 'Brinque com Bang-ul', 'Chơi cùng Bang-ul', 'เล่นกับ Bang-ul', 'Main dengan Bang-ul', 'العب مع Bang-ul', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.login.console', 'admin.login', 'Admin Console', 'Admin Console', '管理コンソール', '管理控制台', '管理控制台', 'Consola de administración', 'Console administrateur', 'Admin-Konsole', 'Console administrativo', 'Bảng điều khiển quản trị', 'คอนโซลผู้ดูแลระบบ', 'Konsol admin', 'وحدة تحكم المدير', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.login.email', 'admin.login', '이메일 (테스트 로그인)', 'Email (Test Login)', 'メール（テストログイン）', '邮箱（测试登录）', '電子郵件（測試登入）', 'Correo electrónico (inicio de prueba)', 'E-mail (connexion test)', 'E-Mail (Test-Login)', 'E-mail (login de teste)', 'Email (đăng nhập thử)', 'อีเมล (เข้าสู่ระบบทดสอบ)', 'Email (login uji)', 'البريد الإلكتروني (تسجيل دخول تجريبي)', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.login.loading', 'admin.login', '로그인 중...', 'Logging in...', 'ログイン中...', '登录中...', '登入中...', 'Iniciando sesión...', 'Connexion...', 'Anmeldung...', 'Entrando...', 'Đang đăng nhập...', 'กำลังเข้าสู่ระบบ...', 'Sedang masuk...', 'جارٍ تسجيل الدخول...', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.login.dev_note', 'admin.login', '개발용 테스트 로그인 (OAuth는 S12에서 구현)', 'Dev test login (OAuth in S12)', '開発用テストログイン（OAuthはS12で実装）', '开发用测试登录（OAuth在S12实现）', '開發用測試登入（OAuth於S12實作）', 'Inicio de prueba para desarrollo (OAuth en S12)', 'Connexion de test (OAuth en S12)', 'Test-Login für Entwicklung (OAuth in S12)', 'Login de teste para desenvolvimento (OAuth no S12)', 'Đăng nhập thử cho phát triển (OAuth ở S12)', 'เข้าสู่ระบบทดสอบสำหรับพัฒนา (OAuth ใน S12)', 'Login uji pengembangan (OAuth di S12)', 'تسجيل دخول تجريبي للتطوير (OAuth في S12)', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko=excluded.ko,en=excluded.en,ja=excluded.ja,zh_cn=excluded.zh_cn,zh_tw=excluded.zh_tw,
  es=excluded.es,fr=excluded.fr,de=excluded.de,pt=excluded.pt,vi=excluded.vi,th=excluded.th,id_lang=excluded.id_lang,ar=excluded.ar,
  updated_at=datetime('now');

-- -----------------------------------------------------------------------------
-- 2) admin.i18n.*, admin.countries.*, admin.disease_maps.* 핵심 수동 번역
-- -----------------------------------------------------------------------------
INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at) VALUES
(lower(hex(randomblob(16))), 'admin.i18n.title', 'admin.i18n', '언어 관리 (i18n)', 'Language Management', '言語管理 (i18n)', '语言管理 (i18n)', '語言管理 (i18n)', 'Gestión de idioma', 'Gestion des langues', 'Sprachverwaltung', 'Gerenciamento de idiomas', 'Quản lý ngôn ngữ', 'จัดการภาษา', 'Manajemen bahasa', 'إدارة اللغة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.add_btn', 'admin.i18n', '+ 번역 키 추가', '+ Add Key', '+ 翻訳キー追加', '+ 添加翻译键', '+ 新增翻譯鍵', '+ Agregar clave', '+ Ajouter une clé', '+ Schlüssel hinzufügen', '+ Adicionar chave', '+ Thêm khóa dịch', '+ เพิ่มคีย์แปล', '+ Tambah key', '+ إضافة مفتاح', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.search_prefix', 'admin.i18n', '키 접두사 검색', 'Search by prefix', 'プレフィックス検索', '按前缀搜索', '依前綴搜尋', 'Buscar por prefijo', 'Rechercher par préfixe', 'Nach Präfix suchen', 'Buscar por prefixo', 'Tìm theo tiền tố', 'ค้นหาตามคำนำหน้า', 'Cari berdasarkan prefiks', 'بحث حسب البادئة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.active_only', 'admin.i18n', '활성만 보기', 'Active only', '有効のみ', '仅显示启用', '僅顯示啟用', 'Solo activos', 'Actifs uniquement', 'Nur aktiv', 'Somente ativos', 'Chỉ hiển thị đang hoạt động', 'แสดงเฉพาะที่เปิดใช้งาน', 'Hanya aktif', 'النشط فقط', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.modal_create', 'admin.i18n', '번역 키 추가', 'Add Translation Key', '翻訳キー追加', '添加翻译键', '新增翻譯鍵', 'Agregar clave de traducción', 'Ajouter une clé de traduction', 'Übersetzungsschlüssel hinzufügen', 'Adicionar chave de tradução', 'Thêm khóa dịch', 'เพิ่มคีย์แปล', 'Tambah kunci terjemahan', 'إضافة مفتاح ترجمة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.modal_edit', 'admin.i18n', '번역 수정', 'Edit Translation', '翻訳編集', '编辑翻译', '編輯翻譯', 'Editar traducción', 'Modifier la traduction', 'Übersetzung bearbeiten', 'Editar tradução', 'Chỉnh sửa bản dịch', 'แก้ไขคำแปล', 'Edit terjemahan', 'تعديل الترجمة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.confirm_deactivate', 'admin.i18n', '이 번역 키를 비활성화하시겠습니까?', 'Deactivate this key?', 'このキーを無効化しますか？', '确定停用此键吗？', '確定停用此鍵嗎？', '¿Desactivar esta clave?', 'Désactiver cette clé ?', 'Diesen Schlüssel deaktivieren?', 'Desativar esta chave?', 'Vô hiệu hóa khóa này?', 'ปิดใช้งานคีย์นี้หรือไม่?', 'Nonaktifkan kunci ini?', 'هل تريد تعطيل هذا المفتاح؟', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.success_create', 'admin.i18n', '번역 키가 추가되었습니다.', 'Key added.', '翻訳キーを追加しました。', '已添加翻译键。', '已新增翻譯鍵。', 'Clave agregada.', 'Clé ajoutée.', 'Schlüssel hinzugefügt.', 'Chave adicionada.', 'Đã thêm khóa.', 'เพิ่มคีย์แล้ว', 'Kunci ditambahkan.', 'تمت إضافة المفتاح.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.success_edit', 'admin.i18n', '번역이 수정되었습니다.', 'Translation updated.', '翻訳を更新しました。', '翻译已更新。', '翻譯已更新。', 'Traducción actualizada.', 'Traduction mise à jour.', 'Übersetzung aktualisiert.', 'Tradução atualizada.', 'Đã cập nhật bản dịch.', 'อัปเดตคำแปลแล้ว', 'Terjemahan diperbarui.', 'تم تحديث الترجمة.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.i18n.success_deactivate', 'admin.i18n', '비활성화되었습니다.', 'Deactivated.', '無効化しました。', '已停用。', '已停用。', 'Desactivado.', 'Désactivé.', 'Deaktiviert.', 'Desativado.', 'Đã vô hiệu hóa.', 'ปิดใช้งานแล้ว', 'Dinonaktifkan.', 'تم التعطيل.', 1, datetime('now'), datetime('now')),

(lower(hex(randomblob(16))), 'admin.countries.title', 'admin.countries', '국가 / 통화 관리', 'Countries / Currencies', '国 / 通貨管理', '国家 / 货币管理', '國家 / 貨幣管理', 'Países / Monedas', 'Pays / Devises', 'Länder / Währungen', 'Países / Moedas', 'Quốc gia / Tiền tệ', 'ประเทศ / สกุลเงิน', 'Negara / Mata uang', 'الدول / العملات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.countries.add_country', 'admin.countries', '+ 국가 추가', '+ Add Country', '+ 国追加', '+ 添加国家', '+ 新增國家', '+ Agregar país', '+ Ajouter un pays', '+ Land hinzufügen', '+ Adicionar país', '+ Thêm quốc gia', '+ เพิ่มประเทศ', '+ Tambah negara', '+ إضافة دولة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.countries.add_currency', 'admin.countries', '+ 통화 추가', '+ Add Currency', '+ 通貨追加', '+ 添加货币', '+ 新增貨幣', '+ Agregar moneda', '+ Ajouter une devise', '+ Währung hinzufügen', '+ Adicionar moeda', '+ Thêm tiền tệ', '+ เพิ่มสกุลเงิน', '+ Tambah mata uang', '+ إضافة عملة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.countries.tab_countries', 'admin.countries', '국가', 'Countries', '国', '国家', '國家', 'Países', 'Pays', 'Länder', 'Países', 'Quốc gia', 'ประเทศ', 'Negara', 'الدول', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.countries.tab_currencies', 'admin.countries', '통화', 'Currencies', '通貨', '货币', '貨幣', 'Monedas', 'Devises', 'Währungen', 'Moedas', 'Tiền tệ', 'สกุลเงิน', 'Mata uang', 'العملات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.countries.no_country', 'admin.countries', '국가 없음', 'No countries', '国がありません', '没有国家', '沒有國家', 'Sin países', 'Aucun pays', 'Keine Länder', 'Sem países', 'Không có quốc gia', 'ไม่มีประเทศ', 'Tidak ada negara', 'لا توجد دول', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.countries.no_currency', 'admin.countries', '통화 없음', 'No currencies', '通貨がありません', '没有货币', '沒有貨幣', 'Sin monedas', 'Aucune devise', 'Keine Währungen', 'Sem moedas', 'Không có tiền tệ', 'ไม่มีสกุลเงิน', 'Tidak ada mata uang', 'لا توجد عملات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.countries.success_edit', 'admin.countries', '수정되었습니다.', 'Updated.', '更新しました。', '已更新。', '已更新。', 'Actualizado.', 'Mis à jour.', 'Aktualisiert.', 'Atualizado.', 'Đã cập nhật.', 'อัปเดตแล้ว', 'Diperbarui.', 'تم التحديث.', 1, datetime('now'), datetime('now')),

(lower(hex(randomblob(16))), 'admin.disease_maps.title', 'admin.disease_maps', '질병 연결 매핑', 'Disease Mapping', '疾患マッピング', '疾病映射', '疾病映射', 'Mapeo de enfermedades', 'Cartographie des maladies', 'Krankheitszuordnung', 'Mapeamento de doenças', 'Ánh xạ bệnh', 'การแมปโรค', 'Pemetaan penyakit', 'ربط الأمراض', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.disease_maps.select_disease', 'admin.disease_maps', '질병 선택', 'Select Disease', '疾患選択', '选择疾病', '選擇疾病', 'Seleccionar enfermedad', 'Sélectionner une maladie', 'Krankheit auswählen', 'Selecionar doença', 'Chọn bệnh', 'เลือกโรค', 'Pilih penyakit', 'اختر المرض', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.disease_maps.select_hint', 'admin.disease_maps', '왼쪽에서 질병을 선택하세요', 'Select a disease', '左側で疾患を選択してください', '请在左侧选择疾病', '請在左側選擇疾病', 'Seleccione una enfermedad', 'Sélectionnez une maladie', 'Wählen Sie eine Krankheit aus', 'Selecione uma doença', 'Chọn bệnh ở bên trái', 'เลือกโรคจากด้านซ้าย', 'Pilih penyakit di sebelah kiri', 'اختر مرضًا من اليسار', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.disease_maps.success_add_symptom', 'admin.disease_maps', '증상 연결 완료', 'Symptom linked.', '症状を連結しました。', '症状已关联。', '症狀已連結。', 'Síntoma vinculado.', 'Symptôme lié.', 'Symptom verknüpft.', 'Sintoma vinculado.', 'Đã liên kết triệu chứng.', 'เชื่อมโยงอาการแล้ว', 'Gejala ditautkan.', 'تم ربط العرض.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.disease_maps.success_remove_symptom', 'admin.disease_maps', '증상 연결 해제', 'Symptom unlinked.', '症状の連結を解除しました。', '已取消症状关联。', '已解除症狀連結。', 'Síntoma desvinculado.', 'Symptôme dissocié.', 'Symptom getrennt.', 'Sintoma desvinculado.', 'Đã gỡ liên kết triệu chứng.', 'ยกเลิกเชื่อมโยงอาการแล้ว', 'Tautan gejala dilepas.', 'تم إلغاء ربط العرض.', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko=excluded.ko,en=excluded.en,ja=excluded.ja,zh_cn=excluded.zh_cn,zh_tw=excluded.zh_tw,
  es=excluded.es,fr=excluded.fr,de=excluded.de,pt=excluded.pt,vi=excluded.vi,th=excluded.th,id_lang=excluded.id_lang,ar=excluded.ar,
  updated_at=datetime('now');

-- -----------------------------------------------------------------------------
-- 3) 공란/placeholder 정리 (요청 prefix 범위)
-- -----------------------------------------------------------------------------
UPDATE i18n_translations
SET
  ja = CASE WHEN ja LIKE '[JA] %' OR ja = '' OR ja IS NULL THEN COALESCE(NULLIF(ja, ''), ko) ELSE ja END,
  zh_cn = CASE WHEN zh_cn LIKE '[CN] %' OR zh_cn = '' OR zh_cn IS NULL THEN COALESCE(NULLIF(zh_cn, ''), ko) ELSE zh_cn END,
  zh_tw = CASE WHEN zh_tw = '' OR zh_tw IS NULL THEN ko ELSE zh_tw END,
  es = CASE WHEN es LIKE '[ES] %' OR es = '' OR es IS NULL THEN COALESCE(NULLIF(es, ''), ko) ELSE es END,
  fr = CASE WHEN fr = '' OR fr IS NULL THEN ko ELSE fr END,
  de = CASE WHEN de = '' OR de IS NULL THEN ko ELSE de END,
  pt = CASE WHEN pt = '' OR pt IS NULL THEN ko ELSE pt END,
  vi = CASE WHEN vi LIKE '[VI] %' OR vi = '' OR vi IS NULL THEN COALESCE(NULLIF(vi, ''), ko) ELSE vi END,
  th = CASE WHEN th = '' OR th IS NULL THEN ko ELSE th END,
  id_lang = CASE WHEN id_lang = '' OR id_lang IS NULL THEN ko ELSE id_lang END,
  ar = CASE WHEN ar = '' OR ar IS NULL THEN ko ELSE ar END,
  updated_at = datetime('now')
WHERE
  key LIKE 'admin.%' OR
  key LIKE 'guardian.%' OR
  key LIKE 'supplier.%' OR
  key LIKE 'signup.%' OR
  key LIKE 'login.%' OR
  key LIKE 'public.main.%';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0015_i18n_priority_groups_manual_fill');
