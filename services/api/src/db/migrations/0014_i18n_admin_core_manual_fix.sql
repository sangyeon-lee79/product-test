-- Migration 0014: Admin Language Management 핵심 키 수동 번역 보정
-- 목적:
-- 1) [JA]/[CN]/[ES] 등 placeholder 제거
-- 2) admin 핵심 키를 한국어 기준 수동 검수 번역으로 덮어쓰기

-- -----------------------------------------------------------------------------
-- 1) placeholder 제거
-- -----------------------------------------------------------------------------
UPDATE i18n_translations
SET
  ja = CASE WHEN ja LIKE '[JA] %' THEN SUBSTR(ja, 6) ELSE ja END,
  zh_cn = CASE WHEN zh_cn LIKE '[CN] %' THEN SUBSTR(zh_cn, 6) ELSE zh_cn END,
  es = CASE WHEN es LIKE '[ES] %' THEN SUBSTR(es, 6) ELSE es END,
  vi = CASE WHEN vi LIKE '[VI] %' THEN SUBSTR(vi, 6) ELSE vi END,
  updated_at = datetime('now')
WHERE
  ja LIKE '[JA] %' OR
  zh_cn LIKE '[CN] %' OR
  es LIKE '[ES] %' OR
  vi LIKE '[VI] %';

-- -----------------------------------------------------------------------------
-- 2) admin.common.*
-- -----------------------------------------------------------------------------
INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at) VALUES
(lower(hex(randomblob(16))), 'admin.common.save', 'admin', '저장', 'Save', '保存', '保存', '儲存', 'Guardar', 'Enregistrer', 'Speichern', 'Salvar', 'Lưu', 'บันทึก', 'Simpan', 'حفظ', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.cancel', 'admin', '취소', 'Cancel', 'キャンセル', '取消', '取消', 'Cancelar', 'Annuler', 'Abbrechen', 'Cancelar', 'Hủy', 'ยกเลิก', 'Batal', 'إلغاء', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.add', 'admin', '추가', 'Add', '追加', '添加', '新增', 'Agregar', 'Ajouter', 'Hinzufügen', 'Adicionar', 'Thêm', 'เพิ่ม', 'Tambah', 'إضافة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.edit', 'admin', '편집', 'Edit', '編集', '编辑', '編輯', 'Editar', 'Modifier', 'Bearbeiten', 'Editar', 'Chỉnh sửa', 'แก้ไข', 'Edit', 'تعديل', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.deactivate', 'admin', '비활성화', 'Deactivate', '無効化', '停用', '停用', 'Desactivar', 'Désactiver', 'Deaktivieren', 'Desativar', 'Vô hiệu hóa', 'ปิดใช้งาน', 'Nonaktifkan', 'تعطيل', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.disconnect', 'admin', '연결해제', 'Disconnect', '接続解除', '断开连接', '中斷連線', 'Desconectar', 'Déconnecter', 'Trennen', 'Desconectar', 'Ngắt kết nối', 'ตัดการเชื่อมต่อ', 'Putuskan', 'قطع الاتصال', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.active', 'admin', '활성', 'Active', '有効', '启用', '啟用', 'Activo', 'Actif', 'Aktiv', 'Ativo', 'Đang hoạt động', 'เปิดใช้งาน', 'Aktif', 'نشط', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.inactive', 'admin', '비활성', 'Inactive', '無効', '停用', '停用', 'Inactivo', 'Inactif', 'Inaktiv', 'Inativo', 'Không hoạt động', 'ปิดใช้งาน', 'Tidak aktif', 'غير نشط', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.required', 'admin', '필수', 'Required', '必須', '必填', '必填', 'Obligatorio', 'Obligatoire', 'Erforderlich', 'Obrigatório', 'Bắt buộc', 'จำเป็น', 'Wajib', 'مطلوب', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.default', 'admin', '기본', 'Default', 'デフォルト', '默认', '預設', 'Predeterminado', 'Par défaut', 'Standard', 'Padrão', 'Mặc định', 'ค่าเริ่มต้น', 'Default', 'افتراضي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.loading', 'admin', '로딩 중...', 'Loading...', '読み込み中...', '加载中...', '載入中...', 'Cargando...', 'Chargement...', 'Lädt...', 'Carregando...', 'Đang tải...', 'กำลังโหลด...', 'Memuat...', 'جارٍ التحميل...', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.saving', 'admin', '저장중...', 'Saving...', '保存中...', '保存中...', '儲存中...', 'Guardando...', 'Enregistrement...', 'Speichert...', 'Salvando...', 'Đang lưu...', 'กำลังบันทึก...', 'Menyimpan...', 'جارٍ الحفظ...', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.logout', 'admin', '로그아웃', 'Logout', 'ログアウト', '登出', '登出', 'Cerrar sesión', 'Déconnexion', 'Abmelden', 'Sair', 'Đăng xuất', 'ออกจากระบบ', 'Keluar', 'تسجيل الخروج', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.no_data', 'admin', '데이터가 없습니다', 'No data', 'データがありません', '没有数据', '沒有資料', 'No hay datos', 'Aucune donnée', 'Keine Daten', 'Sem dados', 'Không có dữ liệu', 'ไม่มีข้อมูล', 'Tidak ada data', 'لا توجد بيانات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.select', 'admin', '선택...', 'Select...', '選択...', '选择...', '選擇...', 'Seleccionar...', 'Sélectionner...', 'Auswählen...', 'Selecionar...', 'Chọn...', 'เลือก...', 'Pilih...', 'اختر...', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.sort_order', 'admin', '정렬 순서', 'Sort order', '並び順', '排序顺序', '排序順序', 'Orden', 'Ordre de tri', 'Sortierreihenfolge', 'Ordem', 'Thứ tự', 'ลำดับ', 'Urutan', 'ترتيب الفرز', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.key', 'admin', '키', 'Key', 'キー', '键', '鍵', 'Clave', 'Clé', 'Schlüssel', 'Chave', 'Khóa', 'คีย์', 'Kunci', 'مفتاح', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.status', 'admin', '상태', 'Status', '状態', '状态', '狀態', 'Estado', 'Statut', 'Status', 'Status', 'Trạng thái', 'สถานะ', 'Status', 'الحالة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.action', 'admin', '작업', 'Action', '操作', '操作', '操作', 'Acción', 'Action', 'Aktion', 'Ação', 'Thao tác', 'การดำเนินการ', 'Tindakan', 'إجراء', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.prev', 'admin', '이전', 'Prev', '前へ', '上一页', '上一頁', 'Anterior', 'Précédent', 'Zurück', 'Anterior', 'Trước', 'ก่อนหน้า', 'Sebelumnya', 'السابق', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.next', 'admin', '다음', 'Next', '次へ', '下一页', '下一頁', 'Siguiente', 'Suivant', 'Weiter', 'Próximo', 'Tiếp theo', 'ถัดไป', 'Berikutnya', 'التالي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.common.account', 'admin', '계정', 'Account', 'アカウント', '账户', '帳戶', 'Cuenta', 'Compte', 'Konto', 'Conta', 'Tài khoản', 'บัญชี', 'Akun', 'حساب', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko=excluded.ko,en=excluded.en,ja=excluded.ja,zh_cn=excluded.zh_cn,zh_tw=excluded.zh_tw,
  es=excluded.es,fr=excluded.fr,de=excluded.de,pt=excluded.pt,vi=excluded.vi,th=excluded.th,id_lang=excluded.id_lang,ar=excluded.ar,
  updated_at=datetime('now');

-- -----------------------------------------------------------------------------
-- 3) admin.menu/nav/section + admin.master + admin.login 핵심
-- -----------------------------------------------------------------------------
INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at) VALUES
(lower(hex(randomblob(16))), 'admin.section.dashboard', 'admin', '대시보드', 'Dashboard', 'ダッシュボード', '仪表板', '儀表板', 'Panel', 'Tableau de bord', 'Dashboard', 'Painel', 'Bảng điều khiển', 'แดชบอร์ด', 'Dasbor', 'لوحة التحكم', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.section.data', 'admin', '데이터 관리', 'Data Management', 'データ管理', '数据管理', '資料管理', 'Gestión de datos', 'Gestion des données', 'Datenverwaltung', 'Gestão de dados', 'Quản lý dữ liệu', 'การจัดการข้อมูล', 'Manajemen data', 'إدارة البيانات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.section.ads', 'admin', '광고 / 운영', 'Ads / Operations', '広告 / 運用', '广告 / 运营', '廣告 / 營運', 'Anuncios / Operación', 'Publicité / Opérations', 'Werbung / Betrieb', 'Anúncios / Operações', 'Quảng cáo / Vận hành', 'โฆษณา / การดำเนินงาน', 'Iklan / Operasional', 'الإعلانات / التشغيل', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.nav.dashboard', 'admin', '분석 대시보드', 'Analytics Dashboard', '分析ダッシュボード', '分析仪表板', '分析儀表板', 'Panel analítico', 'Tableau analytique', 'Analyse-Dashboard', 'Painel analítico', 'Bảng điều khiển phân tích', 'แดชบอร์ดวิเคราะห์', 'Dasbor analitik', 'لوحة التحليلات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.nav.i18n', 'admin', '언어 관리', 'Language', '言語管理', '语言管理', '語言管理', 'Idioma', 'Langue', 'Sprache', 'Idioma', 'Ngôn ngữ', 'ภาษา', 'Bahasa', 'اللغة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.nav.master', 'admin', '마스터 데이터', 'Master Data', 'マスターデータ', '主数据', '主資料', 'Datos maestros', 'Données maîtres', 'Stammdaten', 'Dados mestres', 'Dữ liệu master', 'ข้อมูลหลัก', 'Data master', 'البيانات الرئيسية', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.nav.countries', 'admin', '국가 / 통화', 'Countries / Currencies', '国 / 通貨', '国家 / 货币', '國家 / 貨幣', 'Países / Monedas', 'Pays / Devises', 'Länder / Währungen', 'Países / Moedas', 'Quốc gia / Tiền tệ', 'ประเทศ / สกุลเงิน', 'Negara / Mata uang', 'الدول / العملات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.nav.disease_maps', 'admin', '질병 연결 매핑', 'Disease Mapping', '疾患マッピング', '疾病映射', '疾病映射', 'Mapeo de enfermedades', 'Cartographie des maladies', 'Krankheitszuordnung', 'Mapeamento de doenças', 'Ánh xạ bệnh', 'การแมปโรค', 'Pemetaan penyakit', 'ربط الأمراض', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.nav.ads', 'admin', '광고 설정', 'Ads Settings', '広告設定', '广告设置', '廣告設定', 'Configuración de anuncios', 'Paramètres des annonces', 'Anzeigeneinstellungen', 'Configurações de anúncios', 'Cài đặt quảng cáo', 'การตั้งค่าโฆษณา', 'Pengaturan iklan', 'إعدادات الإعلانات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.login.submit', 'admin.login', '로그인', 'Login', 'ログイン', '登录', '登入', 'Iniciar sesión', 'Connexion', 'Anmelden', 'Entrar', 'Đăng nhập', 'เข้าสู่ระบบ', 'Masuk', 'تسجيل الدخول', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.login.error', 'admin.login', '로그인 실패', 'Login failed', 'ログイン失敗', '登录失败', '登入失敗', 'Error de inicio de sesión', 'Échec de connexion', 'Anmeldung fehlgeschlagen', 'Falha no login', 'Đăng nhập thất bại', 'เข้าสู่ระบบล้มเหลว', 'Gagal masuk', 'فشل تسجيل الدخول', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.master.title', 'admin.master', '마스터 데이터 관리', 'Master Data', 'マスターデータ管理', '主数据管理', '主資料管理', 'Gestión de datos maestros', 'Gestion des données maîtres', 'Stammdatenverwaltung', 'Gestão de dados mestres', 'Quản lý dữ liệu master', 'การจัดการข้อมูลหลัก', 'Manajemen data master', 'إدارة البيانات الرئيسية', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.master.categories', 'admin.master', '카테고리', 'Categories', 'カテゴリ', '分类', '分類', 'Categorías', 'Catégories', 'Kategorien', 'Categorias', 'Danh mục', 'หมวดหมู่', 'Kategori', 'الفئات', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.master.add_item', 'admin.master', '+ 아이템 추가', '+ Add Item', '+ アイテム追加', '+ 添加项目', '+ 新增項目', '+ Agregar ítem', '+ Ajouter un élément', '+ Element hinzufügen', '+ Adicionar item', '+ Thêm mục', '+ เพิ่มรายการ', '+ Tambah item', '+ إضافة عنصر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.master.no_item', 'admin.master', '아이템이 없습니다', 'No items', 'アイテムがありません', '没有项目', '沒有項目', 'No hay ítems', 'Aucun élément', 'Keine Elemente', 'Sem itens', 'Không có mục', 'ไม่มีรายการ', 'Tidak ada item', 'لا توجد عناصر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'admin.master.modal_edit_item', 'admin.master', '아이템 수정', 'Edit Item', 'アイテム編集', '编辑项目', '編輯項目', 'Editar ítem', 'Modifier l''élément', 'Element bearbeiten', 'Editar item', 'Sửa mục', 'แก้ไขรายการ', 'Edit item', 'تعديل العنصر', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko=excluded.ko,en=excluded.en,ja=excluded.ja,zh_cn=excluded.zh_cn,zh_tw=excluded.zh_tw,
  es=excluded.es,fr=excluded.fr,de=excluded.de,pt=excluded.pt,vi=excluded.vi,th=excluded.th,id_lang=excluded.id_lang,ar=excluded.ar,
  updated_at=datetime('now');

-- -----------------------------------------------------------------------------
-- 4) priority prefix 기본 검증용: 비어있는 필드 ko fallback (빈값 방지)
-- -----------------------------------------------------------------------------
UPDATE i18n_translations
SET
  en      = COALESCE(NULLIF(en, ''), ko),
  ja      = COALESCE(NULLIF(ja, ''), ko),
  zh_cn   = COALESCE(NULLIF(zh_cn, ''), ko),
  zh_tw   = COALESCE(NULLIF(zh_tw, ''), ko),
  es      = COALESCE(NULLIF(es, ''), ko),
  fr      = COALESCE(NULLIF(fr, ''), ko),
  de      = COALESCE(NULLIF(de, ''), ko),
  pt      = COALESCE(NULLIF(pt, ''), ko),
  vi      = COALESCE(NULLIF(vi, ''), ko),
  th      = COALESCE(NULLIF(th, ''), ko),
  id_lang = COALESCE(NULLIF(id_lang, ''), ko),
  ar      = COALESCE(NULLIF(ar, ''), ko),
  updated_at = datetime('now')
WHERE
  key LIKE 'admin.common.%' OR
  key LIKE 'admin.section.%' OR
  key LIKE 'admin.nav.%' OR
  key LIKE 'admin.master.%' OR
  key LIKE 'admin.login.%' OR
  key LIKE 'guardian.%' OR
  key LIKE 'supplier.%' OR
  key LIKE 'signup.%' OR
  key LIKE 'login.%' OR
  key LIKE 'public.main.%';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0014_i18n_admin_core_manual_fix');
