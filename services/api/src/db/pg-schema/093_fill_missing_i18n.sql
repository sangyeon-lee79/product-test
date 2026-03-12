-- 093_fill_missing_i18n.sql
-- Fill all NULL language columns for i18n rows seeded with ko/en only (003 + 048)
-- Covers: platform.*, device.manufacturer.*, admin.members.*, admin.google.*,
--         public.login.*, public.signup.*, feed.manufacturer.*, feed.brand.*

-- =====================================================================
-- 1. Platform
-- =====================================================================
UPDATE i18n_translations SET
  ja = 'ペットフォリオ', zh_cn = 'Petfolio', zh_tw = 'Petfolio',
  es = 'Petfolio', fr = 'Petfolio', de = 'Petfolio', pt = 'Petfolio',
  vi = 'Petfolio', th = 'Petfolio', id_lang = 'Petfolio', ar = 'Petfolio',
  updated_at = NOW()
WHERE key = 'platform.name';

UPDATE i18n_translations SET
  ja = 'ペットの生涯を記録するポートフォリオプラットフォーム',
  zh_cn = '记录宠物一生的作品集平台',
  zh_tw = '記錄寵物一生的作品集平台',
  es = 'Plataforma de portafolio para registrar la vida de tu mascota',
  fr = 'Plateforme portfolio pour enregistrer la vie de votre animal',
  de = 'Portfolio-Plattform zur Aufzeichnung des Lebens Ihres Haustiers',
  pt = 'Plataforma de portfólio para registrar a vida do seu pet',
  vi = 'Nền tảng portfolio ghi lại cuộc đời thú cưng',
  th = 'แพลตฟอร์มพอร์ตโฟลิโอบันทึกชีวิตสัตว์เลี้ยง',
  id_lang = 'Platform portofolio untuk mencatat kehidupan hewan peliharaan',
  ar = 'منصة محفظة لتسجيل حياة حيوانك الأليف',
  updated_at = NOW()
WHERE key = 'platform.tagline';

-- =====================================================================
-- 2. Device manufacturers (proper nouns — keep brand name across all)
-- =====================================================================
UPDATE i18n_translations SET
  ja = ko, zh_cn = ko, zh_tw = ko, es = ko, fr = ko, de = ko, pt = ko,
  vi = ko, th = ko, id_lang = ko, ar = ko, updated_at = NOW()
WHERE key IN (
  'device.manufacturer.abbott',
  'device.manufacturer.roche',
  'device.manufacturer.lifescan',
  'device.manufacturer.omron'
);

-- =====================================================================
-- 3. Admin — Members section
-- =====================================================================
UPDATE i18n_translations SET
  ja = '会員管理', zh_cn = '会员管理', zh_tw = '會員管理',
  es = 'Gestión de miembros', fr = 'Gestion des membres', de = 'Mitgliederverwaltung',
  pt = 'Gerenciamento de membros', vi = 'Quản lý thành viên', th = 'จัดการสมาชิก',
  id_lang = 'Manajemen anggota', ar = 'إدارة الأعضاء', updated_at = NOW()
WHERE key = 'admin.section.members';

UPDATE i18n_translations SET
  ja = '会員管理', zh_cn = '会员管理', zh_tw = '會員管理',
  es = 'Gestión de miembros', fr = 'Gestion des membres', de = 'Mitgliederverwaltung',
  pt = 'Gerenciamento de membros', vi = 'Quản lý thành viên', th = 'จัดการสมาชิก',
  id_lang = 'Manajemen anggota', ar = 'إدارة الأعضاء', updated_at = NOW()
WHERE key = 'admin.nav.members';

UPDATE i18n_translations SET
  ja = 'Google API設定', zh_cn = 'Google API 设置', zh_tw = 'Google API 設定',
  es = 'Configuración de Google API', fr = 'Paramètres Google API', de = 'Google API-Einstellungen',
  pt = 'Configurações de Google API', vi = 'Cài đặt Google API', th = 'ตั้งค่า Google API',
  id_lang = 'Pengaturan Google API', ar = 'إعدادات Google API', updated_at = NOW()
WHERE key = 'admin.nav.google_settings';

UPDATE i18n_translations SET
  ja = '会員管理', zh_cn = '会员管理', zh_tw = '會員管理',
  es = 'Gestión de miembros', fr = 'Gestion des membres', de = 'Mitgliederverwaltung',
  pt = 'Gerenciamento de membros', vi = 'Quản lý thành viên', th = 'จัดการสมาชิก',
  id_lang = 'Manajemen anggota', ar = 'إدارة الأعضاء', updated_at = NOW()
WHERE key = 'admin.members.title';

UPDATE i18n_translations SET
  ja = '全会員数', zh_cn = '总会员数', zh_tw = '總會員數',
  es = 'Total de miembros', fr = 'Nombre total de membres', de = 'Gesamtmitglieder',
  pt = 'Total de membros', vi = 'Tổng thành viên', th = 'สมาชิกทั้งหมด',
  id_lang = 'Total anggota', ar = 'إجمالي الأعضاء', updated_at = NOW()
WHERE key = 'admin.members.summary.total';

UPDATE i18n_translations SET
  ja = '新規加入者数', zh_cn = '新注册人数', zh_tw = '新註冊人數',
  es = 'Nuevos registros', fr = 'Nouvelles inscriptions', de = 'Neue Anmeldungen',
  pt = 'Novos cadastros', vi = 'Đăng ký mới', th = 'สมัครใหม่',
  id_lang = 'Pendaftaran baru', ar = 'تسجيلات جديدة', updated_at = NOW()
WHERE key = 'admin.members.summary.new';

UPDATE i18n_translations SET
  ja = '名前またはメールで検索', zh_cn = '按姓名或邮箱搜索', zh_tw = '按姓名或電郵搜尋',
  es = 'Buscar por nombre o email', fr = 'Rechercher par nom ou email', de = 'Nach Name oder E-Mail suchen',
  pt = 'Pesquisar por nome ou email', vi = 'Tìm theo tên hoặc email', th = 'ค้นหาตามชื่อหรืออีเมล',
  id_lang = 'Cari berdasarkan nama atau email', ar = 'البحث بالاسم أو البريد', updated_at = NOW()
WHERE key = 'admin.members.filter.search';

UPDATE i18n_translations SET
  ja = '役割フィルタ', zh_cn = '角色筛选', zh_tw = '角色篩選',
  es = 'Filtro de rol', fr = 'Filtre de rôle', de = 'Rollenfilter',
  pt = 'Filtro de função', vi = 'Lọc theo vai trò', th = 'กรองตามบทบาท',
  id_lang = 'Filter peran', ar = 'تصفية الدور', updated_at = NOW()
WHERE key = 'admin.members.filter.role';

UPDATE i18n_translations SET
  ja = '加入日 開始', zh_cn = '注册日期 起', zh_tw = '註冊日期 起',
  es = 'Fecha desde', fr = 'Date de début', de = 'Beitrittsdatum von',
  pt = 'Data de início', vi = 'Từ ngày', th = 'ตั้งแต่วันที่',
  id_lang = 'Dari tanggal', ar = 'من تاريخ', updated_at = NOW()
WHERE key = 'admin.members.filter.date_from';

UPDATE i18n_translations SET
  ja = '加入日 終了', zh_cn = '注册日期 至', zh_tw = '註冊日期 至',
  es = 'Fecha hasta', fr = 'Date de fin', de = 'Beitrittsdatum bis',
  pt = 'Data final', vi = 'Đến ngày', th = 'ถึงวันที่',
  id_lang = 'Sampai tanggal', ar = 'إلى تاريخ', updated_at = NOW()
WHERE key = 'admin.members.filter.date_to';

UPDATE i18n_translations SET
  ja = '名前', zh_cn = '姓名', zh_tw = '姓名',
  es = 'Nombre', fr = 'Nom', de = 'Name',
  pt = 'Nome', vi = 'Tên', th = 'ชื่อ',
  id_lang = 'Nama', ar = 'الاسم', updated_at = NOW()
WHERE key = 'admin.members.col.name';

UPDATE i18n_translations SET
  ja = 'メール', zh_cn = '邮箱', zh_tw = '電郵',
  es = 'Correo', fr = 'Email', de = 'E-Mail',
  pt = 'Email', vi = 'Email', th = 'อีเมล',
  id_lang = 'Email', ar = 'البريد', updated_at = NOW()
WHERE key = 'admin.members.col.email';

UPDATE i18n_translations SET
  ja = '加入日', zh_cn = '注册日', zh_tw = '註冊日',
  es = 'Fecha de registro', fr = 'Date d''inscription', de = 'Beitrittsdatum',
  pt = 'Data de cadastro', vi = 'Ngày tham gia', th = 'วันที่สมัคร',
  id_lang = 'Tanggal bergabung', ar = 'تاريخ الانضمام', updated_at = NOW()
WHERE key = 'admin.members.col.joined_at';

UPDATE i18n_translations SET
  ja = '現在のrole', zh_cn = '当前角色', zh_tw = '目前角色',
  es = 'Rol actual', fr = 'Rôle actuel', de = 'Aktuelle Rolle',
  pt = 'Função atual', vi = 'Vai trò hiện tại', th = 'บทบาทปัจจุบัน',
  id_lang = 'Peran saat ini', ar = 'الدور الحالي', updated_at = NOW()
WHERE key = 'admin.members.col.role';

UPDATE i18n_translations SET
  ja = '業種 L1', zh_cn = '行业 L1', zh_tw = '行業 L1',
  es = 'Sector L1', fr = 'Secteur L1', de = 'Branche L1',
  pt = 'Setor L1', vi = 'Ngành L1', th = 'ประเภทธุรกิจ L1',
  id_lang = 'Bisnis L1', ar = 'القطاع L1', updated_at = NOW()
WHERE key = 'admin.members.col.category_l1';

UPDATE i18n_translations SET
  ja = '業種 L2', zh_cn = '行业 L2', zh_tw = '行業 L2',
  es = 'Sector L2', fr = 'Secteur L2', de = 'Branche L2',
  pt = 'Setor L2', vi = 'Ngành L2', th = 'ประเภทธุรกิจ L2',
  id_lang = 'Bisnis L2', ar = 'القطاع L2', updated_at = NOW()
WHERE key = 'admin.members.col.category_l2';

UPDATE i18n_translations SET
  ja = '状態', zh_cn = '状态', zh_tw = '狀態',
  es = 'Estado', fr = 'Statut', de = 'Status',
  pt = 'Status', vi = 'Trạng thái', th = 'สถานะ',
  id_lang = 'Status', ar = 'الحالة', updated_at = NOW()
WHERE key = 'admin.members.col.status';

UPDATE i18n_translations SET
  ja = '申請状態', zh_cn = '申请状态', zh_tw = '申請狀態',
  es = 'Estado de solicitud', fr = 'Statut de la demande', de = 'Antragsstatus',
  pt = 'Status da solicitação', vi = 'Trạng thái đơn', th = 'สถานะการสมัคร',
  id_lang = 'Status aplikasi', ar = 'حالة الطلب', updated_at = NOW()
WHERE key = 'admin.members.col.application';

UPDATE i18n_translations SET
  ja = '承認', zh_cn = '批准', zh_tw = '批准',
  es = 'Aprobar', fr = 'Approuver', de = 'Genehmigen',
  pt = 'Aprovar', vi = 'Phê duyệt', th = 'อนุมัติ',
  id_lang = 'Setujui', ar = 'موافقة', updated_at = NOW()
WHERE key = 'admin.members.action.approve';

UPDATE i18n_translations SET
  ja = '拒否', zh_cn = '拒绝', zh_tw = '拒絕',
  es = 'Rechazar', fr = 'Refuser', de = 'Ablehnen',
  pt = 'Rejeitar', vi = 'Từ chối', th = 'ปฏิเสธ',
  id_lang = 'Tolak', ar = 'رفض', updated_at = NOW()
WHERE key = 'admin.members.action.reject';

UPDATE i18n_translations SET
  ja = '情報修正', zh_cn = '编辑信息', zh_tw = '編輯資訊',
  es = 'Editar miembro', fr = 'Modifier le membre', de = 'Mitglied bearbeiten',
  pt = 'Editar membro', vi = 'Chỉnh sửa', th = 'แก้ไขข้อมูล',
  id_lang = 'Edit anggota', ar = 'تعديل العضو', updated_at = NOW()
WHERE key = 'admin.members.action.edit';

UPDATE i18n_translations SET
  ja = 'フィルタ適用', zh_cn = '应用筛选', zh_tw = '套用篩選',
  es = 'Aplicar filtros', fr = 'Appliquer les filtres', de = 'Filter anwenden',
  pt = 'Aplicar filtros', vi = 'Áp dụng bộ lọc', th = 'ใช้ตัวกรอง',
  id_lang = 'Terapkan filter', ar = 'تطبيق الفلاتر', updated_at = NOW()
WHERE key = 'admin.members.action.apply_filters';

UPDATE i18n_translations SET
  ja = '会員データがありません。', zh_cn = '没有会员数据。', zh_tw = '沒有會員資料。',
  es = 'No se encontraron miembros.', fr = 'Aucun membre trouvé.', de = 'Keine Mitglieder gefunden.',
  pt = 'Nenhum membro encontrado.', vi = 'Không tìm thấy thành viên.', th = 'ไม่พบสมาชิก',
  id_lang = 'Tidak ada anggota ditemukan.', ar = 'لا يوجد أعضاء.', updated_at = NOW()
WHERE key = 'admin.members.empty';

UPDATE i18n_translations SET
  ja = '保護者', zh_cn = '监护人', zh_tw = '飼主',
  es = 'Tutor', fr = 'Gardien', de = 'Betreuer',
  pt = 'Tutor', vi = 'Người giám hộ', th = 'ผู้ดูแล',
  id_lang = 'Wali', ar = 'الوصي', updated_at = NOW()
WHERE key = 'admin.members.role.guardian';

UPDATE i18n_translations SET
  ja = '業種会員', zh_cn = '服务商', zh_tw = '服務商',
  es = 'Proveedor', fr = 'Prestataire', de = 'Anbieter',
  pt = 'Fornecedor', vi = 'Nhà cung cấp', th = 'ผู้ให้บริการ',
  id_lang = 'Penyedia', ar = 'مقدّم الخدمة', updated_at = NOW()
WHERE key = 'admin.members.role.provider';

UPDATE i18n_translations SET
  ja = '管理者', zh_cn = '管理员', zh_tw = '管理員',
  es = 'Administrador', fr = 'Administrateur', de = 'Administrator',
  pt = 'Administrador', vi = 'Quản trị viên', th = 'ผู้ดูแลระบบ',
  id_lang = 'Admin', ar = 'المسؤول', updated_at = NOW()
WHERE key = 'admin.members.role.admin';

UPDATE i18n_translations SET
  ja = 'なし', zh_cn = '无', zh_tw = '無',
  es = 'Ninguno', fr = 'Aucun', de = 'Keine',
  pt = 'Nenhum', vi = 'Không có', th = 'ไม่มี',
  id_lang = 'Tidak ada', ar = 'لا يوجد', updated_at = NOW()
WHERE key = 'admin.members.application.none';

UPDATE i18n_translations SET
  ja = '保留中', zh_cn = '待处理', zh_tw = '待處理',
  es = 'Pendiente', fr = 'En attente', de = 'Ausstehend',
  pt = 'Pendente', vi = 'Đang chờ', th = 'รอดำเนินการ',
  id_lang = 'Menunggu', ar = 'قيد الانتظار', updated_at = NOW()
WHERE key = 'admin.members.application.pending';

UPDATE i18n_translations SET
  ja = '承認済み', zh_cn = '已批准', zh_tw = '已批准',
  es = 'Aprobado', fr = 'Approuvé', de = 'Genehmigt',
  pt = 'Aprovado', vi = 'Đã duyệt', th = 'อนุมัติแล้ว',
  id_lang = 'Disetujui', ar = 'تمت الموافقة', updated_at = NOW()
WHERE key = 'admin.members.application.approved';

UPDATE i18n_translations SET
  ja = '拒否', zh_cn = '已拒绝', zh_tw = '已拒絕',
  es = 'Rechazado', fr = 'Refusé', de = 'Abgelehnt',
  pt = 'Rejeitado', vi = 'Đã từ chối', th = 'ถูกปฏิเสธ',
  id_lang = 'Ditolak', ar = 'مرفوض', updated_at = NOW()
WHERE key = 'admin.members.application.rejected';

UPDATE i18n_translations SET
  ja = '会員詳細 / role修正', zh_cn = '会员详情 / 角色修改', zh_tw = '會員詳情 / 角色修改',
  es = 'Detalle del miembro / Cambiar rol', fr = 'Détails du membre / Modifier le rôle', de = 'Mitgliederdetails / Rolle ändern',
  pt = 'Detalhes do membro / Alterar função', vi = 'Chi tiết thành viên / Đổi vai trò', th = 'รายละเอียดสมาชิก / เปลี่ยนบทบาท',
  id_lang = 'Detail anggota / Ubah peran', ar = 'تفاصيل العضو / تغيير الدور', updated_at = NOW()
WHERE key = 'admin.members.modal.title';

UPDATE i18n_translations SET
  ja = '名前', zh_cn = '姓名', zh_tw = '姓名',
  es = 'Nombre completo', fr = 'Nom complet', de = 'Vollständiger Name',
  pt = 'Nome completo', vi = 'Họ tên', th = 'ชื่อเต็ม',
  id_lang = 'Nama lengkap', ar = 'الاسم الكامل', updated_at = NOW()
WHERE key = 'admin.members.field.full_name';

UPDATE i18n_translations SET
  ja = 'ニックネーム', zh_cn = '昵称', zh_tw = '暱稱',
  es = 'Apodo', fr = 'Surnom', de = 'Spitzname',
  pt = 'Apelido', vi = 'Biệt danh', th = 'ชื่อเล่น',
  id_lang = 'Nama panggilan', ar = 'اللقب', updated_at = NOW()
WHERE key = 'admin.members.field.nickname';

UPDATE i18n_translations SET
  ja = '連絡先', zh_cn = '联系方式', zh_tw = '聯絡方式',
  es = 'Teléfono', fr = 'Téléphone', de = 'Telefon',
  pt = 'Telefone', vi = 'Số điện thoại', th = 'เบอร์โทร',
  id_lang = 'Telepon', ar = 'الهاتف', updated_at = NOW()
WHERE key = 'admin.members.field.phone';

UPDATE i18n_translations SET
  ja = 'role', zh_cn = '角色', zh_tw = '角色',
  es = 'Rol', fr = 'Rôle', de = 'Rolle',
  pt = 'Função', vi = 'Vai trò', th = 'บทบาท',
  id_lang = 'Peran', ar = 'الدور', updated_at = NOW()
WHERE key = 'admin.members.field.role';

UPDATE i18n_translations SET
  ja = '業種 L1', zh_cn = '行业 L1', zh_tw = '行業 L1',
  es = 'Sector L1', fr = 'Secteur L1', de = 'Branche L1',
  pt = 'Setor L1', vi = 'Ngành L1', th = 'ประเภทธุรกิจ L1',
  id_lang = 'Bisnis L1', ar = 'القطاع L1', updated_at = NOW()
WHERE key = 'admin.members.field.business_l1';

UPDATE i18n_translations SET
  ja = '業種 L2', zh_cn = '行业 L2', zh_tw = '行業 L2',
  es = 'Sector L2', fr = 'Secteur L2', de = 'Branche L2',
  pt = 'Setor L2', vi = 'Ngành L2', th = 'ประเภทธุรกิจ L2',
  id_lang = 'Bisnis L2', ar = 'القطاع L2', updated_at = NOW()
WHERE key = 'admin.members.field.business_l2';

UPDATE i18n_translations SET
  ja = '事業者番号', zh_cn = '营业执照号', zh_tw = '營業登記號',
  es = 'Número de registro', fr = 'Numéro d''entreprise', de = 'Handelsregisternummer',
  pt = 'CNPJ', vi = 'Mã số kinh doanh', th = 'เลขทะเบียนธุรกิจ',
  id_lang = 'Nomor izin usaha', ar = 'رقم السجل التجاري', updated_at = NOW()
WHERE key = 'admin.members.field.business_number';

UPDATE i18n_translations SET
  ja = '営業時間', zh_cn = '营业时间', zh_tw = '營業時間',
  es = 'Horario de atención', fr = 'Heures d''ouverture', de = 'Öffnungszeiten',
  pt = 'Horário de funcionamento', vi = 'Giờ hoạt động', th = 'เวลาทำการ',
  id_lang = 'Jam operasional', ar = 'ساعات العمل', updated_at = NOW()
WHERE key = 'admin.members.field.operating_hours';

UPDATE i18n_translations SET
  ja = '資格証/免許', zh_cn = '资质/许可', zh_tw = '資質/許可',
  es = 'Certificaciones / Licencias', fr = 'Certifications / Licences', de = 'Zertifizierungen / Lizenzen',
  pt = 'Certificações / Licenças', vi = 'Chứng chỉ / Giấy phép', th = 'ใบรับรอง / ใบอนุญาต',
  id_lang = 'Sertifikasi / Lisensi', ar = 'الشهادات / التراخيص', updated_at = NOW()
WHERE key = 'admin.members.field.certifications';

UPDATE i18n_translations SET
  ja = '住所', zh_cn = '地址', zh_tw = '地址',
  es = 'Dirección', fr = 'Adresse', de = 'Adresse',
  pt = 'Endereço', vi = 'Địa chỉ', th = 'ที่อยู่',
  id_lang = 'Alamat', ar = 'العنوان', updated_at = NOW()
WHERE key = 'admin.members.field.address';

UPDATE i18n_translations SET
  ja = '会員情報が更新されました。', zh_cn = '会员信息已更新。', zh_tw = '會員資訊已更新。',
  es = 'Miembro actualizado.', fr = 'Membre mis à jour.', de = 'Mitglied aktualisiert.',
  pt = 'Membro atualizado.', vi = 'Đã cập nhật thành viên.', th = 'อัปเดตสมาชิกแล้ว',
  id_lang = 'Anggota diperbarui.', ar = 'تم تحديث العضو.', updated_at = NOW()
WHERE key = 'admin.members.success.updated';

UPDATE i18n_translations SET
  ja = 'role申請を承認しました。', zh_cn = '角色申请已批准。', zh_tw = '角色申請已批准。',
  es = 'Solicitud de rol aprobada.', fr = 'Demande de rôle approuvée.', de = 'Rollenantrag genehmigt.',
  pt = 'Solicitação de função aprovada.', vi = 'Đã duyệt đơn xin vai trò.', th = 'อนุมัติคำขอบทบาทแล้ว',
  id_lang = 'Pengajuan peran disetujui.', ar = 'تمت الموافقة على طلب الدور.', updated_at = NOW()
WHERE key = 'admin.members.success.approved';

UPDATE i18n_translations SET
  ja = 'role申請を拒否しました。', zh_cn = '角色申请已拒绝。', zh_tw = '角色申請已拒絕。',
  es = 'Solicitud de rol rechazada.', fr = 'Demande de rôle refusée.', de = 'Rollenantrag abgelehnt.',
  pt = 'Solicitação de função rejeitada.', vi = 'Đã từ chối đơn xin vai trò.', th = 'ปฏิเสธคำขอบทบาทแล้ว',
  id_lang = 'Pengajuan peran ditolak.', ar = 'تم رفض طلب الدور.', updated_at = NOW()
WHERE key = 'admin.members.success.rejected';

-- =====================================================================
-- 4. Admin — Google API Settings
-- =====================================================================
UPDATE i18n_translations SET
  ja = 'Google API設定', zh_cn = 'Google API 设置', zh_tw = 'Google API 設定',
  es = 'Configuración de Google API', fr = 'Paramètres Google API', de = 'Google API-Einstellungen',
  pt = 'Configurações de Google API', vi = 'Cài đặt Google API', th = 'ตั้งค่า Google API',
  id_lang = 'Pengaturan Google API', ar = 'إعدادات Google API', updated_at = NOW()
WHERE key = 'admin.google.title';

UPDATE i18n_translations SET
  ja = 'Google PlacesとGoogle OAuthの連携キーとリダイレクトURIを管理します。',
  zh_cn = '管理Google Places和Google OAuth的密钥与重定向URI。',
  zh_tw = '管理Google Places和Google OAuth的金鑰與重新導向URI。',
  es = 'Administra las claves de Google Places y Google OAuth y las URI de redirección.',
  fr = 'Gérez les clés Google Places et Google OAuth et les URI de redirection.',
  de = 'Verwalten Sie Google Places- und Google OAuth-Schlüssel und Weiterleitungs-URIs.',
  pt = 'Gerencie as chaves do Google Places e Google OAuth e as URIs de redirecionamento.',
  vi = 'Quản lý khóa Google Places và Google OAuth cùng URI chuyển hướng.',
  th = 'จัดการคีย์ Google Places และ Google OAuth พร้อม URI เปลี่ยนเส้นทาง',
  id_lang = 'Kelola kunci Google Places dan Google OAuth serta URI redirect.',
  ar = 'إدارة مفاتيح Google Places وGoogle OAuth وروابط إعادة التوجيه.',
  updated_at = NOW()
WHERE key = 'admin.google.description';

UPDATE i18n_translations SET
  ja = 'Google Places APIキー', zh_cn = 'Google Places API 密钥', zh_tw = 'Google Places API 金鑰',
  es = 'Clave de Google Places API', fr = 'Clé Google Places API', de = 'Google Places API-Schlüssel',
  pt = 'Chave de Google Places API', vi = 'Khóa Google Places API', th = 'คีย์ Google Places API',
  id_lang = 'Kunci Google Places API', ar = 'مفتاح Google Places API', updated_at = NOW()
WHERE key = 'admin.google.field.places_key';

UPDATE i18n_translations SET
  ja = 'Google OAuth クライアントID', zh_cn = 'Google OAuth 客户端ID', zh_tw = 'Google OAuth 用戶端ID',
  es = 'Google OAuth Client ID', fr = 'Google OAuth Client ID', de = 'Google OAuth Client-ID',
  pt = 'Google OAuth Client ID', vi = 'Google OAuth Client ID', th = 'Google OAuth Client ID',
  id_lang = 'Google OAuth Client ID', ar = 'معرّف عميل Google OAuth', updated_at = NOW()
WHERE key = 'admin.google.field.oauth_client_id';

UPDATE i18n_translations SET
  ja = 'Google OAuthリダイレクトURI', zh_cn = 'Google OAuth 重定向URI', zh_tw = 'Google OAuth 重新導向URI',
  es = 'Google OAuth Redirect URI', fr = 'Google OAuth URI de redirection', de = 'Google OAuth Weiterleitungs-URI',
  pt = 'Google OAuth Redirect URI', vi = 'Google OAuth Redirect URI', th = 'Google OAuth Redirect URI',
  id_lang = 'Google OAuth Redirect URI', ar = 'رابط إعادة التوجيه لـ Google OAuth', updated_at = NOW()
WHERE key = 'admin.google.field.oauth_redirect_uri';

UPDATE i18n_translations SET
  ja = '最終更新日', zh_cn = '最后修改日', zh_tw = '最後修改日',
  es = 'Última actualización', fr = 'Dernière modification', de = 'Zuletzt aktualisiert',
  pt = 'Última atualização', vi = 'Cập nhật lần cuối', th = 'แก้ไขล่าสุด',
  id_lang = 'Terakhir diperbarui', ar = 'آخر تحديث', updated_at = NOW()
WHERE key = 'admin.google.field.updated_at';

UPDATE i18n_translations SET
  ja = '保存', zh_cn = '保存', zh_tw = '儲存',
  es = 'Guardar', fr = 'Enregistrer', de = 'Speichern',
  pt = 'Salvar', vi = 'Lưu', th = 'บันทึก',
  id_lang = 'Simpan', ar = 'حفظ', updated_at = NOW()
WHERE key = 'admin.google.save';

UPDATE i18n_translations SET
  ja = 'Google API設定が保存されました。', zh_cn = 'Google API 设置已保存。', zh_tw = 'Google API 設定已儲存。',
  es = 'Configuración de Google API guardada.', fr = 'Paramètres Google API enregistrés.', de = 'Google API-Einstellungen gespeichert.',
  pt = 'Configurações de Google API salvas.', vi = 'Đã lưu cài đặt Google API.', th = 'บันทึกการตั้งค่า Google API แล้ว',
  id_lang = 'Pengaturan Google API disimpan.', ar = 'تم حفظ إعدادات Google API.', updated_at = NOW()
WHERE key = 'admin.google.saved';

-- =====================================================================
-- 5. Public — Login
-- =====================================================================
UPDATE i18n_translations SET
  ja = 'ログイン', zh_cn = '登录', zh_tw = '登入',
  es = 'Iniciar sesión', fr = 'Connexion', de = 'Anmelden',
  pt = 'Entrar', vi = 'Đăng nhập', th = 'เข้าสู่ระบบ',
  id_lang = 'Masuk', ar = 'تسجيل الدخول', updated_at = NOW()
WHERE key = 'public.login.title';

UPDATE i18n_translations SET
  ja = 'メール', zh_cn = '邮箱', zh_tw = '電郵',
  es = 'Correo electrónico', fr = 'Email', de = 'E-Mail',
  pt = 'Email', vi = 'Email', th = 'อีเมล',
  id_lang = 'Email', ar = 'البريد الإلكتروني', updated_at = NOW()
WHERE key = 'public.login.email';

UPDATE i18n_translations SET
  ja = 'パスワード', zh_cn = '密码', zh_tw = '密碼',
  es = 'Contraseña', fr = 'Mot de passe', de = 'Passwort',
  pt = 'Senha', vi = 'Mật khẩu', th = 'รหัสผ่าน',
  id_lang = 'Kata sandi', ar = 'كلمة المرور', updated_at = NOW()
WHERE key = 'public.login.password';

UPDATE i18n_translations SET
  ja = 'メールでログイン', zh_cn = '邮箱登录', zh_tw = '電郵登入',
  es = 'Iniciar con email', fr = 'Connexion par email', de = 'Mit E-Mail anmelden',
  pt = 'Entrar com email', vi = 'Đăng nhập bằng email', th = 'เข้าสู่ระบบด้วยอีเมล',
  id_lang = 'Masuk dengan email', ar = 'تسجيل الدخول بالبريد', updated_at = NOW()
WHERE key = 'public.login.submit_password';

UPDATE i18n_translations SET
  ja = '開発用テストログイン', zh_cn = '开发测试登录', zh_tw = '開發測試登入',
  es = 'Login de prueba para desarrollo', fr = 'Connexion test développeur', de = 'Entwickler-Testanmeldung',
  pt = 'Login de teste para desenvolvedores', vi = 'Đăng nhập thử nghiệm', th = 'เข้าสู่ระบบทดสอบ',
  id_lang = 'Login uji coba developer', ar = 'تسجيل دخول تجريبي للمطورين', updated_at = NOW()
WHERE key = 'public.login.submit_test';

UPDATE i18n_translations SET
  ja = '現在、Google OAuthは準備中です。メール/パスワードでのログインが基本です。',
  zh_cn = 'Google OAuth 尚未启用。邮箱/密码登录为主要方式。',
  zh_tw = 'Google OAuth 尚未啟用。電郵/密碼登入為主要方式。',
  es = 'Google OAuth aún no está habilitado. El inicio de sesión por email/contraseña es el principal.',
  fr = 'Google OAuth n''est pas encore activé. La connexion par email/mot de passe est la méthode principale.',
  de = 'Google OAuth ist noch nicht aktiviert. E-Mail/Passwort-Anmeldung ist die Hauptmethode.',
  pt = 'Google OAuth ainda não está ativado. O login por email/senha é o principal.',
  vi = 'Google OAuth chưa được bật. Đăng nhập bằng email/mật khẩu là phương thức chính.',
  th = 'Google OAuth ยังไม่เปิดใช้งาน การเข้าสู่ระบบด้วยอีเมล/รหัสผ่านเป็นวิธีหลัก',
  id_lang = 'Google OAuth belum diaktifkan. Login email/kata sandi adalah metode utama.',
  ar = 'لم يتم تفعيل Google OAuth بعد. تسجيل الدخول بالبريد/كلمة المرور هو الأساسي.',
  updated_at = NOW()
WHERE key = 'public.login.dev_note';

-- =====================================================================
-- 6. Public — Signup
-- =====================================================================
UPDATE i18n_translations SET
  ja = '会員登録', zh_cn = '注册', zh_tw = '註冊',
  es = 'Registrarse', fr = 'Inscription', de = 'Registrierung',
  pt = 'Cadastro', vi = 'Đăng ký', th = 'สมัครสมาชิก',
  id_lang = 'Daftar', ar = 'إنشاء حساب', updated_at = NOW()
WHERE key = 'public.signup.title';

UPDATE i18n_translations SET
  ja = 'メール', zh_cn = '邮箱', zh_tw = '電郵',
  es = 'Correo electrónico', fr = 'Email', de = 'E-Mail',
  pt = 'Email', vi = 'Email', th = 'อีเมล',
  id_lang = 'Email', ar = 'البريد الإلكتروني', updated_at = NOW()
WHERE key = 'public.signup.email';

UPDATE i18n_translations SET
  ja = 'パスワード', zh_cn = '密码', zh_tw = '密碼',
  es = 'Contraseña', fr = 'Mot de passe', de = 'Passwort',
  pt = 'Senha', vi = 'Mật khẩu', th = 'รหัสผ่าน',
  id_lang = 'Kata sandi', ar = 'كلمة المرور', updated_at = NOW()
WHERE key = 'public.signup.password';

UPDATE i18n_translations SET
  ja = 'パスワード確認', zh_cn = '确认密码', zh_tw = '確認密碼',
  es = 'Confirmar contraseña', fr = 'Confirmer le mot de passe', de = 'Passwort bestätigen',
  pt = 'Confirmar senha', vi = 'Xác nhận mật khẩu', th = 'ยืนยันรหัสผ่าน',
  id_lang = 'Konfirmasi kata sandi', ar = 'تأكيد كلمة المرور', updated_at = NOW()
WHERE key = 'public.signup.password_confirm';

UPDATE i18n_translations SET
  ja = '名前', zh_cn = '姓名', zh_tw = '姓名',
  es = 'Nombre', fr = 'Nom', de = 'Name',
  pt = 'Nome', vi = 'Tên', th = 'ชื่อ',
  id_lang = 'Nama', ar = 'الاسم', updated_at = NOW()
WHERE key = 'public.signup.display_name';

UPDATE i18n_translations SET
  ja = 'ニックネーム', zh_cn = '昵称', zh_tw = '暱稱',
  es = 'Apodo', fr = 'Surnom', de = 'Spitzname',
  pt = 'Apelido', vi = 'Biệt danh', th = 'ชื่อเล่น',
  id_lang = 'Nama panggilan', ar = 'اللقب', updated_at = NOW()
WHERE key = 'public.signup.nickname';

UPDATE i18n_translations SET
  ja = '連絡先', zh_cn = '联系方式', zh_tw = '聯絡方式',
  es = 'Teléfono', fr = 'Téléphone', de = 'Telefon',
  pt = 'Telefone', vi = 'Số điện thoại', th = 'เบอร์โทร',
  id_lang = 'Telepon', ar = 'الهاتف', updated_at = NOW()
WHERE key = 'public.signup.phone';

UPDATE i18n_translations SET
  ja = '居住国', zh_cn = '居住国家', zh_tw = '居住國家',
  es = 'País de residencia', fr = 'Pays de résidence', de = 'Wohnsitzland',
  pt = 'País de residência', vi = 'Quốc gia cư trú', th = 'ประเทศที่พำนัก',
  id_lang = 'Negara tempat tinggal', ar = 'بلد الإقامة', updated_at = NOW()
WHERE key = 'public.signup.country';

UPDATE i18n_translations SET
  ja = '優先言語', zh_cn = '偏好语言', zh_tw = '偏好語言',
  es = 'Idioma preferido', fr = 'Langue préférée', de = 'Bevorzugte Sprache',
  pt = 'Idioma preferido', vi = 'Ngôn ngữ ưa thích', th = 'ภาษาที่ต้องการ',
  id_lang = 'Bahasa pilihan', ar = 'اللغة المفضلة', updated_at = NOW()
WHERE key = 'public.signup.language';

UPDATE i18n_translations SET
  ja = '住所', zh_cn = '地址', zh_tw = '地址',
  es = 'Dirección', fr = 'Adresse', de = 'Adresse',
  pt = 'Endereço', vi = 'Địa chỉ', th = 'ที่อยู่',
  id_lang = 'Alamat', ar = 'العنوان', updated_at = NOW()
WHERE key = 'public.signup.address';

UPDATE i18n_translations SET
  ja = 'ペットを飼っていますか？', zh_cn = '是否养宠物？', zh_tw = '是否養寵物？',
  es = '¿Tiene mascotas?', fr = 'Avez-vous des animaux ?', de = 'Haben Sie Haustiere?',
  pt = 'Você tem pets?', vi = 'Bạn có thú cưng không?', th = 'คุณมีสัตว์เลี้ยงไหม?',
  id_lang = 'Apakah Anda memiliki hewan peliharaan?', ar = 'هل لديك حيوانات أليفة؟', updated_at = NOW()
WHERE key = 'public.signup.has_pets';

UPDATE i18n_translations SET
  ja = 'ペット数', zh_cn = '宠物数量', zh_tw = '寵物數量',
  es = 'Número de mascotas', fr = 'Nombre d''animaux', de = 'Anzahl der Haustiere',
  pt = 'Número de pets', vi = 'Số lượng thú cưng', th = 'จำนวนสัตว์เลี้ยง',
  id_lang = 'Jumlah hewan peliharaan', ar = 'عدد الحيوانات', updated_at = NOW()
WHERE key = 'public.signup.pet_count';

UPDATE i18n_translations SET
  ja = '関心のある動物', zh_cn = '感兴趣的动物类型', zh_tw = '感興趣的動物類型',
  es = 'Tipos de animales de interés', fr = 'Types d''animaux qui vous intéressent', de = 'Interessierte Tierarten',
  pt = 'Tipos de animais de interesse', vi = 'Loại động vật quan tâm', th = 'ประเภทสัตว์ที่สนใจ',
  id_lang = 'Jenis hewan yang diminati', ar = 'أنواع الحيوانات المهتم بها', updated_at = NOW()
WHERE key = 'public.signup.interests';

UPDATE i18n_translations SET
  ja = '予約通知を受信', zh_cn = '接收预约通知', zh_tw = '接收預約通知',
  es = 'Notificaciones de reserva', fr = 'Notifications de réservation', de = 'Buchungsbenachrichtigungen',
  pt = 'Notificações de reserva', vi = 'Nhận thông báo đặt lịch', th = 'รับการแจ้งเตือนการจอง',
  id_lang = 'Notifikasi pemesanan', ar = 'إشعارات الحجز', updated_at = NOW()
WHERE key = 'public.signup.notifications_booking';

UPDATE i18n_translations SET
  ja = '健康通知を受信', zh_cn = '接收健康通知', zh_tw = '接收健康通知',
  es = 'Notificaciones de salud', fr = 'Notifications de santé', de = 'Gesundheitsbenachrichtigungen',
  pt = 'Notificações de saúde', vi = 'Nhận thông báo sức khỏe', th = 'รับการแจ้งเตือนสุขภาพ',
  id_lang = 'Notifikasi kesehatan', ar = 'إشعارات صحية', updated_at = NOW()
WHERE key = 'public.signup.notifications_health';

UPDATE i18n_translations SET
  ja = 'マーケティング受信同意', zh_cn = '同意接收营销信息', zh_tw = '同意接收行銷資訊',
  es = 'Consentimiento de marketing', fr = 'Consentement marketing', de = 'Marketing-Einwilligung',
  pt = 'Consentimento de marketing', vi = 'Đồng ý nhận tiếp thị', th = 'ยินยอมรับข้อมูลการตลาด',
  id_lang = 'Persetujuan pemasaran', ar = 'الموافقة على التسويق', updated_at = NOW()
WHERE key = 'public.signup.marketing_opt_in';

UPDATE i18n_translations SET
  ja = '利用規約に同意', zh_cn = '同意服务条款', zh_tw = '同意服務條款',
  es = 'Aceptar los términos', fr = 'Accepter les conditions', de = 'Nutzungsbedingungen akzeptieren',
  pt = 'Aceitar os termos', vi = 'Đồng ý điều khoản', th = 'ยอมรับข้อตกลง',
  id_lang = 'Setuju dengan ketentuan', ar = 'الموافقة على الشروط', updated_at = NOW()
WHERE key = 'public.signup.terms_agree';

UPDATE i18n_translations SET
  ja = '登録後に業種会員roleを申請', zh_cn = '注册后申请服务商角色', zh_tw = '註冊後申請服務商角色',
  es = 'Solicitar rol de proveedor después del registro', fr = 'Demander le rôle prestataire après l''inscription', de = 'Nach der Registrierung Anbieter-Rolle beantragen',
  pt = 'Solicitar função de fornecedor após cadastro', vi = 'Đăng ký vai trò nhà cung cấp sau khi tạo tài khoản', th = 'สมัครบทบาทผู้ให้บริการหลังสมัครสมาชิก',
  id_lang = 'Ajukan peran penyedia setelah mendaftar', ar = 'التقدم لدور مقدّم الخدمة بعد التسجيل', updated_at = NOW()
WHERE key = 'public.signup.provider_apply';

UPDATE i18n_translations SET
  ja = '業種 L1', zh_cn = '行业 L1', zh_tw = '行業 L1',
  es = 'Sector L1', fr = 'Secteur L1', de = 'Branche L1',
  pt = 'Setor L1', vi = 'Ngành L1', th = 'ประเภทธุรกิจ L1',
  id_lang = 'Bisnis L1', ar = 'القطاع L1', updated_at = NOW()
WHERE key = 'public.signup.provider_l1';

UPDATE i18n_translations SET
  ja = '業種 L2', zh_cn = '行业 L2', zh_tw = '行業 L2',
  es = 'Sector L2', fr = 'Secteur L2', de = 'Branche L2',
  pt = 'Setor L2', vi = 'Ngành L2', th = 'ประเภทธุรกิจ L2',
  id_lang = 'Bisnis L2', ar = 'القطاع L2', updated_at = NOW()
WHERE key = 'public.signup.provider_l2';

UPDATE i18n_translations SET
  ja = '選択しない', zh_cn = '不选择', zh_tw = '不選擇',
  es = 'Opcional / Ninguno', fr = 'Optionnel / Aucun', de = 'Optional / Keine',
  pt = 'Opcional / Nenhum', vi = 'Không chọn', th = 'ไม่เลือก',
  id_lang = 'Opsional / Tidak ada', ar = 'اختياري / لا يوجد', updated_at = NOW()
WHERE key = 'public.signup.provider_l2_optional';

UPDATE i18n_translations SET
  ja = '事業者番号', zh_cn = '营业执照号', zh_tw = '營業登記號',
  es = 'Número de registro', fr = 'Numéro d''entreprise', de = 'Handelsregisternummer',
  pt = 'CNPJ', vi = 'Mã số kinh doanh', th = 'เลขทะเบียนธุรกิจ',
  id_lang = 'Nomor izin usaha', ar = 'رقم السجل التجاري', updated_at = NOW()
WHERE key = 'public.signup.provider_business_number';

UPDATE i18n_translations SET
  ja = '営業時間', zh_cn = '营业时间', zh_tw = '營業時間',
  es = 'Horario de atención', fr = 'Heures d''ouverture', de = 'Öffnungszeiten',
  pt = 'Horário de funcionamento', vi = 'Giờ hoạt động', th = 'เวลาทำการ',
  id_lang = 'Jam operasional', ar = 'ساعات العمل', updated_at = NOW()
WHERE key = 'public.signup.provider_operating_hours';

UPDATE i18n_translations SET
  ja = '保有資格/免許', zh_cn = '持有资质/许可', zh_tw = '持有資質/許可',
  es = 'Certificaciones / Licencias', fr = 'Certifications / Licences', de = 'Zertifizierungen / Lizenzen',
  pt = 'Certificações / Licenças', vi = 'Chứng chỉ / Giấy phép', th = 'ใบรับรอง / ใบอนุญาต',
  id_lang = 'Sertifikasi / Lisensi', ar = 'الشهادات / التراخيص', updated_at = NOW()
WHERE key = 'public.signup.provider_certifications';

UPDATE i18n_translations SET
  ja = 'アカウント作成', zh_cn = '创建账户', zh_tw = '建立帳戶',
  es = 'Crear cuenta', fr = 'Créer un compte', de = 'Konto erstellen',
  pt = 'Criar conta', vi = 'Tạo tài khoản', th = 'สร้างบัญชี',
  id_lang = 'Buat akun', ar = 'إنشاء حساب', updated_at = NOW()
WHERE key = 'public.signup.submit';

UPDATE i18n_translations SET
  ja = '会員登録が完了しました。', zh_cn = '注册完成。', zh_tw = '註冊完成。',
  es = 'Registro completado.', fr = 'Inscription terminée.', de = 'Registrierung abgeschlossen.',
  pt = 'Cadastro concluído.', vi = 'Đăng ký hoàn tất.', th = 'สมัครสมาชิกเรียบร้อย',
  id_lang = 'Pendaftaran selesai.', ar = 'اكتمل التسجيل.', updated_at = NOW()
WHERE key = 'public.signup.success';

UPDATE i18n_translations SET
  ja = 'パスワードが一致しません。', zh_cn = '密码不匹配。', zh_tw = '密碼不相符。',
  es = 'Las contraseñas no coinciden.', fr = 'Les mots de passe ne correspondent pas.', de = 'Passwörter stimmen nicht überein.',
  pt = 'As senhas não correspondem.', vi = 'Mật khẩu không khớp.', th = 'รหัสผ่านไม่ตรงกัน',
  id_lang = 'Kata sandi tidak cocok.', ar = 'كلمات المرور غير متطابقة.', updated_at = NOW()
WHERE key = 'public.signup.password_mismatch';

UPDATE i18n_translations SET
  ja = '選択した国に基づいて言語/通貨のデフォルト値が設定されます。',
  zh_cn = '根据所选国家自动设置语言/货币默认值。',
  zh_tw = '根據所選國家自動設定語言/貨幣預設值。',
  es = 'Los valores predeterminados de idioma y moneda se configuran según el país seleccionado.',
  fr = 'Les valeurs par défaut de langue et devise sont définies selon le pays sélectionné.',
  de = 'Sprach- und Währungsstandards werden basierend auf dem gewählten Land festgelegt.',
  pt = 'Os padrões de idioma e moeda são definidos com base no país selecionado.',
  vi = 'Ngôn ngữ và tiền tệ mặc định sẽ được thiết lập theo quốc gia đã chọn.',
  th = 'ค่าเริ่มต้นภาษาและสกุลเงินจะถูกตั้งตามประเทศที่เลือก',
  id_lang = 'Default bahasa dan mata uang diatur berdasarkan negara yang dipilih.',
  ar = 'يتم تعيين اللغة والعملة الافتراضية بناءً على البلد المختار.',
  updated_at = NOW()
WHERE key = 'public.signup.default_setup';

UPDATE i18n_translations SET
  ja = 'マイページ基本情報', zh_cn = '我的页面基本信息', zh_tw = '我的頁面基本資訊',
  es = 'Información básica de mi página', fr = 'Informations de base de ma page', de = 'Grundinformationen meiner Seite',
  pt = 'Informações básicas da minha página', vi = 'Thông tin cơ bản trang cá nhân', th = 'ข้อมูลพื้นฐานหน้าของฉัน',
  id_lang = 'Info dasar halaman saya', ar = 'معلومات صفحتي الأساسية', updated_at = NOW()
WHERE key = 'public.signup.my_page_seed';

UPDATE i18n_translations SET
  ja = 'カンマ区切りで入力', zh_cn = '用逗号分隔输入', zh_tw = '用逗號分隔輸入',
  es = 'Ingrese separado por comas', fr = 'Entrez séparées par des virgules', de = 'Kommagetrennt eingeben',
  pt = 'Insira separado por vírgulas', vi = 'Nhập phân cách bằng dấu phẩy', th = 'ป้อนโดยคั่นด้วยจุลภาค',
  id_lang = 'Masukkan dipisahkan koma', ar = 'أدخل مفصولة بفواصل', updated_at = NOW()
WHERE key = 'public.signup.certifications_placeholder';

-- =====================================================================
-- 7. Feed manufacturers (proper nouns — use brand name or local phonetic)
-- =====================================================================
UPDATE i18n_translations SET
  ja = 'ピュリナ', zh_cn = '普瑞纳', zh_tw = '普瑞納', es = 'Purina', fr = 'Purina', de = 'Purina',
  pt = 'Purina', vi = 'Purina', th = 'พูริน่า', id_lang = 'Purina', ar = 'بورينا', updated_at = NOW()
WHERE key = 'feed.manufacturer.purina';

UPDATE i18n_translations SET
  ja = 'ファルミナ', zh_cn = '法米纳', zh_tw = '法米納', es = 'Farmina', fr = 'Farmina', de = 'Farmina',
  pt = 'Farmina', vi = 'Farmina', th = 'ฟาร์มิน่า', id_lang = 'Farmina', ar = 'فارمينا', updated_at = NOW()
WHERE key = 'feed.manufacturer.farmina';

UPDATE i18n_translations SET
  ja = 'ジウィピーク', zh_cn = '巅峰', zh_tw = '巔峰', es = 'Ziwi Peak', fr = 'Ziwi Peak', de = 'Ziwi Peak',
  pt = 'Ziwi Peak', vi = 'Ziwi Peak', th = 'ซีวี่พีค', id_lang = 'Ziwi Peak', ar = 'زيوي بيك', updated_at = NOW()
WHERE key = 'feed.manufacturer.ziwi_peak';

UPDATE i18n_translations SET
  ja = 'インスティンクト', zh_cn = '百利', zh_tw = '百利', es = 'Instinct', fr = 'Instinct', de = 'Instinct',
  pt = 'Instinct', vi = 'Instinct', th = 'อินสทิงค์', id_lang = 'Instinct', ar = 'إنستينكت', updated_at = NOW()
WHERE key = 'feed.manufacturer.instinct';

UPDATE i18n_translations SET
  ja = 'ステラ&チューイーズ', zh_cn = '星厨', zh_tw = '星廚', es = 'Stella & Chewy''s', fr = 'Stella & Chewy''s', de = 'Stella & Chewy''s',
  pt = 'Stella & Chewy''s', vi = 'Stella & Chewy''s', th = 'สเตลล่าแอนด์ชูวี่ส์', id_lang = 'Stella & Chewy''s', ar = 'ستيلا آند تشوي', updated_at = NOW()
WHERE key = 'feed.manufacturer.stella_chewys';

UPDATE i18n_translations SET
  ja = 'オープンファーム', zh_cn = '开放农场', zh_tw = '開放農場', es = 'Open Farm', fr = 'Open Farm', de = 'Open Farm',
  pt = 'Open Farm', vi = 'Open Farm', th = 'โอเพ่นฟาร์ม', id_lang = 'Open Farm', ar = 'أوبن فارم', updated_at = NOW()
WHERE key = 'feed.manufacturer.open_farm';

UPDATE i18n_translations SET
  ja = 'ウェルネス', zh_cn = '健康', zh_tw = '健康', es = 'Wellness', fr = 'Wellness', de = 'Wellness',
  pt = 'Wellness', vi = 'Wellness', th = 'เวลเนส', id_lang = 'Wellness', ar = 'ويلنس', updated_at = NOW()
WHERE key = 'feed.manufacturer.wellness';

UPDATE i18n_translations SET
  ja = 'テイストオブザワイルド', zh_cn = '旷野盛宴', zh_tw = '曠野盛宴', es = 'Taste of the Wild', fr = 'Taste of the Wild', de = 'Taste of the Wild',
  pt = 'Taste of the Wild', vi = 'Taste of the Wild', th = 'เทสต์ออฟเดอะไวลด์', id_lang = 'Taste of the Wild', ar = 'تيست أوف ذا وايلد', updated_at = NOW()
WHERE key = 'feed.manufacturer.taste_of_the_wild';

-- =====================================================================
-- 8. Feed brands (product line names — local phonetic or keep original)
-- =====================================================================
UPDATE i18n_translations SET
  ja = 'プロプラン', zh_cn = '冠能', zh_tw = '冠能', es = 'Pro Plan', fr = 'Pro Plan', de = 'Pro Plan',
  pt = 'Pro Plan', vi = 'Pro Plan', th = 'โปรแพลน', id_lang = 'Pro Plan', ar = 'برو بلان', updated_at = NOW()
WHERE key = 'feed.brand.purina_pro_plan';

UPDATE i18n_translations SET
  ja = 'ピュリナワン', zh_cn = '普瑞纳ONE', zh_tw = '普瑞納ONE', es = 'Purina ONE', fr = 'Purina ONE', de = 'Purina ONE',
  pt = 'Purina ONE', vi = 'Purina ONE', th = 'พูริน่า วัน', id_lang = 'Purina ONE', ar = 'بورينا وان', updated_at = NOW()
WHERE key = 'feed.brand.purina_one';

UPDATE i18n_translations SET
  ja = 'ファンシーフィースト', zh_cn = '珍致', zh_tw = '珍致', es = 'Fancy Feast', fr = 'Fancy Feast', de = 'Fancy Feast',
  pt = 'Fancy Feast', vi = 'Fancy Feast', th = 'แฟนซีฟีสต์', id_lang = 'Fancy Feast', ar = 'فانسي فيست', updated_at = NOW()
WHERE key = 'feed.brand.purina_fancy_feast';

UPDATE i18n_translations SET
  ja = 'ビヨンド', zh_cn = 'Beyond', zh_tw = 'Beyond', es = 'Beyond', fr = 'Beyond', de = 'Beyond',
  pt = 'Beyond', vi = 'Beyond', th = 'บียอนด์', id_lang = 'Beyond', ar = 'بيوند', updated_at = NOW()
WHERE key = 'feed.brand.purina_beyond';

UPDATE i18n_translations SET
  ja = 'N&D', zh_cn = 'N&D', zh_tw = 'N&D', es = 'N&D Natural & Delicious', fr = 'N&D Natural & Delicious', de = 'N&D Natural & Delicious',
  pt = 'N&D Natural & Delicious', vi = 'N&D Natural & Delicious', th = 'N&D', id_lang = 'N&D Natural & Delicious', ar = 'ان اند دي', updated_at = NOW()
WHERE key = 'feed.brand.farmina_nd';

UPDATE i18n_translations SET
  ja = 'ベットライフ', zh_cn = 'Vet Life', zh_tw = 'Vet Life', es = 'Vet Life', fr = 'Vet Life', de = 'Vet Life',
  pt = 'Vet Life', vi = 'Vet Life', th = 'เวทไลฟ์', id_lang = 'Vet Life', ar = 'فيت لايف', updated_at = NOW()
WHERE key = 'feed.brand.farmina_vet_life';

UPDATE i18n_translations SET
  ja = 'チームブリーダー', zh_cn = 'Team Breeder', zh_tw = 'Team Breeder', es = 'Team Breeder', fr = 'Team Breeder', de = 'Team Breeder',
  pt = 'Team Breeder', vi = 'Team Breeder', th = 'ทีมบรีดเดอร์', id_lang = 'Team Breeder', ar = 'تيم بريدر', updated_at = NOW()
WHERE key = 'feed.brand.farmina_team_breeder';

UPDATE i18n_translations SET
  ja = 'エアドライ', zh_cn = '风干', zh_tw = '風乾', es = 'Air-Dried', fr = 'Séché à l''air', de = 'Luftgetrocknet',
  pt = 'Seco ao ar', vi = 'Sấy khô', th = 'แอร์ดราย', id_lang = 'Air-Dried', ar = 'مجفف بالهواء', updated_at = NOW()
WHERE key = 'feed.brand.ziwi_air_dried';

UPDATE i18n_translations SET
  ja = '缶詰', zh_cn = '罐装', zh_tw = '罐裝', es = 'Enlatado', fr = 'En conserve', de = 'Dosen',
  pt = 'Enlatado', vi = 'Đóng hộp', th = 'กระป๋อง', id_lang = 'Kalengan', ar = 'معلب', updated_at = NOW()
WHERE key = 'feed.brand.ziwi_canned';

UPDATE i18n_translations SET
  ja = 'オリジナル', zh_cn = '原味', zh_tw = '原味', es = 'Original', fr = 'Original', de = 'Original',
  pt = 'Original', vi = 'Original', th = 'ออริจินัล', id_lang = 'Original', ar = 'أصلي', updated_at = NOW()
WHERE key = 'feed.brand.instinct_original';

UPDATE i18n_translations SET
  ja = 'ロウブースト', zh_cn = 'Raw Boost', zh_tw = 'Raw Boost', es = 'Raw Boost', fr = 'Raw Boost', de = 'Raw Boost',
  pt = 'Raw Boost', vi = 'Raw Boost', th = 'รอว์บูสท์', id_lang = 'Raw Boost', ar = 'رو بوست', updated_at = NOW()
WHERE key = 'feed.brand.instinct_raw_boost';

UPDATE i18n_translations SET
  ja = 'リミテッドイングリディエント', zh_cn = '限定配方', zh_tw = '限定配方', es = 'Ingrediente limitado', fr = 'Ingrédient limité', de = 'Begrenzte Zutaten',
  pt = 'Ingrediente limitado', vi = 'Thành phần giới hạn', th = 'ลิมิเต็ดอินกรีเดียนท์', id_lang = 'Limited Ingredient', ar = 'مكونات محدودة', updated_at = NOW()
WHERE key = 'feed.brand.instinct_limited_ingredient';

UPDATE i18n_translations SET
  ja = 'フリーズドライ ロウ', zh_cn = '冻干生食', zh_tw = '凍乾生食', es = 'Crudo liofilizado', fr = 'Lyophilisé cru', de = 'Gefriergetrocknet roh',
  pt = 'Cru liofilizado', vi = 'Sấy đông khô', th = 'ฟรีซดรายรอว์', id_lang = 'Freeze-Dried Raw', ar = 'مجفف بالتجميد', updated_at = NOW()
WHERE key = 'feed.brand.stella_fd_raw';

UPDATE i18n_translations SET
  ja = 'シチュー', zh_cn = '炖菜', zh_tw = '燉菜', es = 'Guisos', fr = 'Ragoûts', de = 'Eintöpfe',
  pt = 'Ensopados', vi = 'Hầm', th = 'สตูว์', id_lang = 'Stews', ar = 'يخنات', updated_at = NOW()
WHERE key = 'feed.brand.stella_stews';

UPDATE i18n_translations SET
  ja = 'ミールミキサー', zh_cn = '拌粮', zh_tw = '拌糧', es = 'Mezcladores', fr = 'Mélangeurs', de = 'Mahlzeitmixer',
  pt = 'Misturadores', vi = 'Trộn thức ăn', th = 'มีลมิกเซอร์', id_lang = 'Meal Mixers', ar = 'خلطات الوجبات', updated_at = NOW()
WHERE key = 'feed.brand.stella_meal_mixers';

UPDATE i18n_translations SET
  ja = 'ドライフード', zh_cn = '干粮', zh_tw = '乾糧', es = 'Alimento seco', fr = 'Croquettes', de = 'Trockenfutter',
  pt = 'Ração seca', vi = 'Thức ăn khô', th = 'อาหารเม็ด', id_lang = 'Makanan kering', ar = 'طعام جاف', updated_at = NOW()
WHERE key = 'feed.brand.open_farm_dry';

UPDATE i18n_translations SET
  ja = 'ウェットフード', zh_cn = '湿粮', zh_tw = '濕糧', es = 'Alimento húmedo', fr = 'Pâtée', de = 'Nassfutter',
  pt = 'Ração úmida', vi = 'Thức ăn ướt', th = 'อาหารเปียก', id_lang = 'Makanan basah', ar = 'طعام رطب', updated_at = NOW()
WHERE key = 'feed.brand.open_farm_wet';

UPDATE i18n_translations SET
  ja = 'フリーズドライ ロウ', zh_cn = '冻干生食', zh_tw = '凍乾生食', es = 'Crudo liofilizado', fr = 'Lyophilisé cru', de = 'Gefriergetrocknet roh',
  pt = 'Cru liofilizado', vi = 'Sấy đông khô', th = 'ฟรีซดรายรอว์', id_lang = 'Freeze-Dried Raw', ar = 'مجفف بالتجميد', updated_at = NOW()
WHERE key = 'feed.brand.open_farm_fd_raw';

UPDATE i18n_translations SET
  ja = 'コンプリートヘルス', zh_cn = '全面健康', zh_tw = '全面健康', es = 'Salud Completa', fr = 'Santé Complète', de = 'Complete Health',
  pt = 'Saúde Completa', vi = 'Complete Health', th = 'คอมพลีทเฮลธ์', id_lang = 'Complete Health', ar = 'صحة كاملة', updated_at = NOW()
WHERE key = 'feed.brand.wellness_complete_health';

UPDATE i18n_translations SET
  ja = 'コア', zh_cn = 'CORE', zh_tw = 'CORE', es = 'CORE', fr = 'CORE', de = 'CORE',
  pt = 'CORE', vi = 'CORE', th = 'คอร์', id_lang = 'CORE', ar = 'كور', updated_at = NOW()
WHERE key = 'feed.brand.wellness_core';

UPDATE i18n_translations SET
  ja = 'シンプル', zh_cn = '简单', zh_tw = '簡單', es = 'Simple', fr = 'Simple', de = 'Simple',
  pt = 'Simple', vi = 'Simple', th = 'ซิมเปิ้ล', id_lang = 'Simple', ar = 'سيمبل', updated_at = NOW()
WHERE key = 'feed.brand.wellness_simple';

UPDATE i18n_translations SET
  ja = 'ドライ', zh_cn = '干粮', zh_tw = '乾糧', es = 'Seco', fr = 'Sec', de = 'Trocken',
  pt = 'Seco', vi = 'Khô', th = 'เม็ด', id_lang = 'Kering', ar = 'جاف', updated_at = NOW()
WHERE key = 'feed.brand.totw_dry';

UPDATE i18n_translations SET
  ja = 'ウェット', zh_cn = '湿粮', zh_tw = '濕糧', es = 'Húmedo', fr = 'Humide', de = 'Nass',
  pt = 'Úmido', vi = 'Ướt', th = 'เปียก', id_lang = 'Basah', ar = 'رطب', updated_at = NOW()
WHERE key = 'feed.brand.totw_wet';
