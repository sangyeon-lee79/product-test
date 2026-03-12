-- =============================================================================
-- Petfolio — Consolidated i18n Translations (v2)
-- =============================================================================
-- Merged from all *_i18n*.sql files + i18n portions of mixed files.
-- All statements use INSERT ... ON CONFLICT (key) DO UPDATE SET for idempotency.
-- 13 languages: ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar
-- =============================================================================


-- --------------------------------------------------------------------------
-- Source: 052_i18n_fill_missing_translations.sql
-- --------------------------------------------------------------------------
-- 052: Fill missing 11-language translations for all incomplete i18n rows
-- Targets: public.login/signup, admin.members, admin.google, admin nav/section,
--          platform, device manufacturers, feed manufacturers/brands
-- Languages: ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar

BEGIN;

-- ═══════════════════════════════════════════════════════════════════
-- 1. public.login.* (6 keys)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='ログイン', zh_cn='登录', zh_tw='登入',
  es='Iniciar sesión', fr='Connexion', de='Anmelden',
  pt='Entrar', vi='Đăng nhập', th='เข้าสู่ระบบ',
  id_lang='Masuk', ar='تسجيل الدخول'
WHERE key='public.login.title' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='メールアドレス', zh_cn='电子邮箱', zh_tw='電子郵件',
  es='Correo electrónico', fr='E-mail', de='E-Mail',
  pt='E-mail', vi='Email', th='อีเมล',
  id_lang='Email', ar='البريد الإلكتروني'
WHERE key='public.login.email' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='パスワード', zh_cn='密码', zh_tw='密碼',
  es='Contraseña', fr='Mot de passe', de='Passwort',
  pt='Senha', vi='Mật khẩu', th='รหัสผ่าน',
  id_lang='Kata sandi', ar='كلمة المرور'
WHERE key='public.login.password' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='メールでログイン', zh_cn='邮箱登录', zh_tw='電子郵件登入',
  es='Iniciar sesión con correo', fr='Se connecter par e-mail', de='Mit E-Mail anmelden',
  pt='Entrar com e-mail', vi='Đăng nhập bằng email', th='เข้าสู่ระบบด้วยอีเมล',
  id_lang='Masuk dengan email', ar='تسجيل الدخول بالبريد الإلكتروني'
WHERE key='public.login.submit_password' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='開発テストログイン', zh_cn='开发测试登录', zh_tw='開發測試登入',
  es='Inicio de sesión de prueba', fr='Connexion test développeur', de='Entwickler-Testanmeldung',
  pt='Login de teste', vi='Đăng nhập thử nghiệm', th='เข้าสู่ระบบทดสอบ',
  id_lang='Login uji coba', ar='تسجيل دخول تجريبي'
WHERE key='public.login.submit_test' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='現在Google OAuthは準備段階であり、メール/パスワードログインが基本です。',
  zh_cn='Google OAuth 尚未启用，当前使用邮箱/密码登录。',
  zh_tw='Google OAuth 尚未啟用，目前使用電子郵件/密碼登入。',
  es='Google OAuth aún no está habilitado. El inicio de sesión es por correo/contraseña.',
  fr='Google OAuth n''est pas encore activé. La connexion par e-mail/mot de passe est utilisée.',
  de='Google OAuth ist noch nicht aktiviert. E-Mail/Passwort ist die Standardanmeldung.',
  pt='Google OAuth ainda não está ativado. O login por e-mail/senha é o padrão.',
  vi='Google OAuth chưa được kích hoạt. Đăng nhập bằng email/mật khẩu là mặc định.',
  th='Google OAuth ยังไม่เปิดใช้งาน อีเมล/รหัสผ่านเป็นการเข้าสู่ระบบหลัก',
  id_lang='Google OAuth belum diaktifkan. Login email/kata sandi adalah default.',
  ar='لم يتم تفعيل Google OAuth بعد. تسجيل الدخول بالبريد/كلمة المرور هو الافتراضي.'
WHERE key='public.login.dev_note' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 2. public.signup.* (30 keys)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='会員登録', zh_cn='注册', zh_tw='註冊',
  es='Registrarse', fr='Inscription', de='Registrieren',
  pt='Cadastro', vi='Đăng ký', th='สมัครสมาชิก',
  id_lang='Daftar', ar='إنشاء حساب'
WHERE key='public.signup.title' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='メールアドレス', zh_cn='电子邮箱', zh_tw='電子郵件',
  es='Correo electrónico', fr='E-mail', de='E-Mail',
  pt='E-mail', vi='Email', th='อีเมล',
  id_lang='Email', ar='البريد الإلكتروني'
WHERE key='public.signup.email' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='パスワード', zh_cn='密码', zh_tw='密碼',
  es='Contraseña', fr='Mot de passe', de='Passwort',
  pt='Senha', vi='Mật khẩu', th='รหัสผ่าน',
  id_lang='Kata sandi', ar='كلمة المرور'
WHERE key='public.signup.password' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='パスワード確認', zh_cn='确认密码', zh_tw='確認密碼',
  es='Confirmar contraseña', fr='Confirmer le mot de passe', de='Passwort bestätigen',
  pt='Confirmar senha', vi='Xác nhận mật khẩu', th='ยืนยันรหัสผ่าน',
  id_lang='Konfirmasi kata sandi', ar='تأكيد كلمة المرور'
WHERE key='public.signup.password_confirm' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='名前', zh_cn='姓名', zh_tw='姓名',
  es='Nombre', fr='Nom', de='Name',
  pt='Nome', vi='Tên', th='ชื่อ',
  id_lang='Nama', ar='الاسم'
WHERE key='public.signup.display_name' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ニックネーム', zh_cn='昵称', zh_tw='暱稱',
  es='Apodo', fr='Pseudo', de='Spitzname',
  pt='Apelido', vi='Biệt danh', th='ชื่อเล่น',
  id_lang='Nama panggilan', ar='اسم مستعار'
WHERE key='public.signup.nickname' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='連絡先', zh_cn='联系电话', zh_tw='聯絡電話',
  es='Teléfono', fr='Téléphone', de='Telefon',
  pt='Telefone', vi='Điện thoại', th='โทรศัพท์',
  id_lang='Telepon', ar='رقم الهاتف'
WHERE key='public.signup.phone' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='居住国', zh_cn='居住国家', zh_tw='居住國家',
  es='País de residencia', fr='Pays de résidence', de='Wohnsitzland',
  pt='País de residência', vi='Quốc gia cư trú', th='ประเทศที่อาศัย',
  id_lang='Negara tempat tinggal', ar='بلد الإقامة'
WHERE key='public.signup.country' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='希望言語', zh_cn='首选语言', zh_tw='偏好語言',
  es='Idioma preferido', fr='Langue préférée', de='Bevorzugte Sprache',
  pt='Idioma preferido', vi='Ngôn ngữ ưa thích', th='ภาษาที่ต้องการ',
  id_lang='Bahasa pilihan', ar='اللغة المفضلة'
WHERE key='public.signup.language' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='住所', zh_cn='地址', zh_tw='地址',
  es='Dirección', fr='Adresse', de='Adresse',
  pt='Endereço', vi='Địa chỉ', th='ที่อยู่',
  id_lang='Alamat', ar='العنوان'
WHERE key='public.signup.address' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ペット飼育の有無', zh_cn='是否养宠物', zh_tw='是否飼養寵物',
  es='¿Tienes mascotas?', fr='Avez-vous des animaux ?', de='Haben Sie Haustiere?',
  pt='Você tem pets?', vi='Bạn có nuôi thú cưng?', th='คุณมีสัตว์เลี้ยงหรือไม่',
  id_lang='Apakah Anda memiliki hewan peliharaan?', ar='هل لديك حيوانات أليفة؟'
WHERE key='public.signup.has_pets' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ペットの数', zh_cn='宠物数量', zh_tw='寵物數量',
  es='Número de mascotas', fr='Nombre d''animaux', de='Anzahl der Haustiere',
  pt='Número de pets', vi='Số lượng thú cưng', th='จำนวนสัตว์เลี้ยง',
  id_lang='Jumlah hewan peliharaan', ar='عدد الحيوانات الأليفة'
WHERE key='public.signup.pet_count' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='関心のある動物の種類', zh_cn='感兴趣的动物种类', zh_tw='感興趣的動物種類',
  es='Tipos de animales de interés', fr='Types d''animaux d''intérêt', de='Interessante Tierarten',
  pt='Tipos de animais de interesse', vi='Loại động vật quan tâm', th='ประเภทสัตว์ที่สนใจ',
  id_lang='Jenis hewan yang diminati', ar='أنواع الحيوانات المفضلة'
WHERE key='public.signup.interests' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='予約通知の受信', zh_cn='接收预约通知', zh_tw='接收預約通知',
  es='Notificaciones de reservas', fr='Notifications de réservation', de='Buchungsbenachrichtigungen',
  pt='Notificações de reservas', vi='Nhận thông báo đặt lịch', th='รับการแจ้งเตือนการจอง',
  id_lang='Notifikasi pemesanan', ar='إشعارات الحجز'
WHERE key='public.signup.notifications_booking' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='健康通知の受信', zh_cn='接收健康通知', zh_tw='接收健康通知',
  es='Notificaciones de salud', fr='Notifications de santé', de='Gesundheitsbenachrichtigungen',
  pt='Notificações de saúde', vi='Nhận thông báo sức khỏe', th='รับการแจ้งเตือนสุขภาพ',
  id_lang='Notifikasi kesehatan', ar='إشعارات الصحة'
WHERE key='public.signup.notifications_health' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='マーケティング受信同意', zh_cn='同意接收营销信息', zh_tw='同意接收行銷資訊',
  es='Consentimiento de marketing', fr='Consentement marketing', de='Marketing-Einwilligung',
  pt='Consentimento de marketing', vi='Đồng ý nhận tiếp thị', th='ยินยอมรับการตลาด',
  id_lang='Persetujuan pemasaran', ar='الموافقة على التسويق'
WHERE key='public.signup.marketing_opt_in' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='利用規約に同意', zh_cn='同意服务条款', zh_tw='同意服務條款',
  es='Aceptar términos', fr='Accepter les conditions', de='Nutzungsbedingungen akzeptieren',
  pt='Aceitar termos', vi='Đồng ý điều khoản', th='ยอมรับข้อกำหนด',
  id_lang='Setuju dengan ketentuan', ar='الموافقة على الشروط'
WHERE key='public.signup.terms_agree' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='登録後に業種会員ロールを申請', zh_cn='注册后申请业务会员角色', zh_tw='註冊後申請業種會員角色',
  es='Solicitar rol de proveedor', fr='Demander le rôle fournisseur', de='Anbieterrolle beantragen',
  pt='Solicitar papel de provedor', vi='Đăng ký vai trò nhà cung cấp', th='สมัครบทบาทผู้ให้บริการ',
  id_lang='Ajukan peran penyedia', ar='التقدم لدور مزود الخدمة'
WHERE key='public.signup.provider_apply' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='業種 L1', zh_cn='行业 L1', zh_tw='業種 L1',
  es='Categoría L1', fr='Catégorie L1', de='Branche L1',
  pt='Categoria L1', vi='Ngành nghề L1', th='หมวดธุรกิจ L1',
  id_lang='Kategori L1', ar='فئة العمل L1'
WHERE key='public.signup.provider_l1' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='業種 L2', zh_cn='行业 L2', zh_tw='業種 L2',
  es='Categoría L2', fr='Catégorie L2', de='Branche L2',
  pt='Categoria L2', vi='Ngành nghề L2', th='หมวดธุรกิจ L2',
  id_lang='Kategori L2', ar='فئة العمل L2'
WHERE key='public.signup.provider_l2' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='選択しない', zh_cn='不选择', zh_tw='不選擇',
  es='Ninguno', fr='Aucun', de='Keine Auswahl',
  pt='Nenhum', vi='Không chọn', th='ไม่เลือก',
  id_lang='Tidak memilih', ar='بدون اختيار'
WHERE key='public.signup.provider_l2_optional' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='事業者番号', zh_cn='营业执照号', zh_tw='營業登記號',
  es='Número de registro', fr='Numéro d''entreprise', de='Handelsregisternummer',
  pt='CNPJ', vi='Mã số doanh nghiệp', th='เลขทะเบียนธุรกิจ',
  id_lang='Nomor registrasi bisnis', ar='رقم السجل التجاري'
WHERE key='public.signup.provider_business_number' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='営業時間', zh_cn='营业时间', zh_tw='營業時間',
  es='Horario de atención', fr='Heures d''ouverture', de='Öffnungszeiten',
  pt='Horário de funcionamento', vi='Giờ hoạt động', th='เวลาทำการ',
  id_lang='Jam operasional', ar='ساعات العمل'
WHERE key='public.signup.provider_operating_hours' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='保有資格・免許', zh_cn='资质证书/执照', zh_tw='持有證照/執照',
  es='Certificaciones / Licencias', fr='Certifications / Licences', de='Zertifikate / Lizenzen',
  pt='Certificações / Licenças', vi='Chứng chỉ / Giấy phép', th='ใบรับรอง / ใบอนุญาต',
  id_lang='Sertifikasi / Lisensi', ar='الشهادات / التراخيص'
WHERE key='public.signup.provider_certifications' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='アカウントを作成', zh_cn='创建账户', zh_tw='建立帳號',
  es='Crear cuenta', fr='Créer un compte', de='Konto erstellen',
  pt='Criar conta', vi='Tạo tài khoản', th='สร้างบัญชี',
  id_lang='Buat akun', ar='إنشاء حساب'
WHERE key='public.signup.submit' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='会員登録が完了しました。', zh_cn='注册已完成。', zh_tw='註冊已完成。',
  es='Registro completado.', fr='Inscription terminée.', de='Registrierung abgeschlossen.',
  pt='Cadastro concluído.', vi='Đăng ký hoàn tất.', th='สมัครสมาชิกเสร็จสิ้น',
  id_lang='Pendaftaran selesai.', ar='تم إنشاء الحساب بنجاح.'
WHERE key='public.signup.success' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='パスワードが一致しません。', zh_cn='密码不一致。', zh_tw='密碼不一致。',
  es='Las contraseñas no coinciden.', fr='Les mots de passe ne correspondent pas.', de='Passwörter stimmen nicht überein.',
  pt='As senhas não correspondem.', vi='Mật khẩu không khớp.', th='รหัสผ่านไม่ตรงกัน',
  id_lang='Kata sandi tidak cocok.', ar='كلمات المرور غير متطابقة.'
WHERE key='public.signup.password_mismatch' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='選択した国に基づいて言語/通貨のデフォルトが設定されます。',
  zh_cn='语言和货币默认值将根据所选国家设置。',
  zh_tw='語言和貨幣預設值將根據所選國家設定。',
  es='Los valores predeterminados de idioma y moneda se basan en el país seleccionado.',
  fr='La langue et la devise par défaut sont définies selon le pays sélectionné.',
  de='Sprache und Währung werden basierend auf dem ausgewählten Land festgelegt.',
  pt='O idioma e a moeda padrão são definidos com base no país selecionado.',
  vi='Ngôn ngữ và tiền tệ mặc định được đặt theo quốc gia đã chọn.',
  th='ค่าเริ่มต้นภาษาและสกุลเงินจะตั้งตามประเทศที่เลือก',
  id_lang='Bahasa dan mata uang default diatur berdasarkan negara yang dipilih.',
  ar='يتم تعيين اللغة والعملة الافتراضية بناءً على البلد المختار.'
WHERE key='public.signup.default_setup' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='マイページ基本情報', zh_cn='我的页面基本信息', zh_tw='我的頁面基本資訊',
  es='Información base de Mi página', fr='Info de base Ma page', de='Meine Seite Basisinfo',
  pt='Info básica Minha página', vi='Thông tin cơ bản trang cá nhân', th='ข้อมูลพื้นฐานหน้าของฉัน',
  id_lang='Info dasar Halaman saya', ar='معلومات صفحتي الأساسية'
WHERE key='public.signup.my_page_seed' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='カンマ区切りで入力', zh_cn='用逗号分隔输入', zh_tw='以逗號分隔輸入',
  es='Ingrese valores separados por comas', fr='Saisissez des valeurs séparées par des virgules', de='Kommagetrennt eingeben',
  pt='Insira valores separados por vírgula', vi='Nhập giá trị phân cách bằng dấu phẩy', th='กรอกโดยคั่นด้วยเครื่องหมายจุลภาค',
  id_lang='Masukkan nilai dipisahkan koma', ar='أدخل القيم مفصولة بفواصل'
WHERE key='public.signup.certifications_placeholder' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 3. admin.section / admin.nav (3 keys)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='会員管理', zh_cn='会员管理', zh_tw='會員管理',
  es='Gestión de miembros', fr='Gestion des membres', de='Mitgliederverwaltung',
  pt='Gestão de membros', vi='Quản lý thành viên', th='จัดการสมาชิก',
  id_lang='Manajemen anggota', ar='إدارة الأعضاء'
WHERE key='admin.section.members' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='会員', zh_cn='会员', zh_tw='會員',
  es='Miembros', fr='Membres', de='Mitglieder',
  pt='Membros', vi='Thành viên', th='สมาชิก',
  id_lang='Anggota', ar='الأعضاء'
WHERE key='admin.nav.members' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='Google設定', zh_cn='Google设置', zh_tw='Google設定',
  es='Configuración de Google', fr='Paramètres Google', de='Google-Einstellungen',
  pt='Configurações do Google', vi='Cài đặt Google', th='ตั้งค่า Google',
  id_lang='Pengaturan Google', ar='إعدادات Google'
WHERE key='admin.nav.google_settings' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 4. admin.google.* (8 keys)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='Google API設定', zh_cn='Google API 设置', zh_tw='Google API 設定',
  es='Configuración de Google API', fr='Configuration Google API', de='Google API-Einstellungen',
  pt='Configuração da Google API', vi='Cài đặt Google API', th='ตั้งค่า Google API',
  id_lang='Pengaturan Google API', ar='إعدادات Google API'
WHERE key='admin.google.title' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='Google翻訳APIキー', zh_cn='Google 翻译 API 密钥', zh_tw='Google 翻譯 API 金鑰',
  es='Clave API de Google Translate', fr='Clé API Google Traduction', de='Google Translate API-Schlüssel',
  pt='Chave da API do Google Tradutor', vi='Khóa API Google Dịch', th='คีย์ API Google แปลภาษา',
  id_lang='Kunci API Google Terjemahan', ar='مفتاح API ترجمة Google'
WHERE key='admin.google.translate_api_key' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='APIキーを入力', zh_cn='输入 API 密钥', zh_tw='輸入 API 金鑰',
  es='Ingrese la clave API', fr='Saisissez la clé API', de='API-Schlüssel eingeben',
  pt='Insira a chave API', vi='Nhập khóa API', th='กรอกคีย์ API',
  id_lang='Masukkan kunci API', ar='أدخل مفتاح API'
WHERE key='admin.google.api_key_placeholder' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='保存', zh_cn='保存', zh_tw='儲存',
  es='Guardar', fr='Enregistrer', de='Speichern',
  pt='Salvar', vi='Lưu', th='บันทึก',
  id_lang='Simpan', ar='حفظ'
WHERE key='admin.google.save' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='テスト', zh_cn='测试', zh_tw='測試',
  es='Probar', fr='Tester', de='Testen',
  pt='Testar', vi='Kiểm tra', th='ทดสอบ',
  id_lang='Uji', ar='اختبار'
WHERE key='admin.google.test' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='APIキーが保存されました。', zh_cn='API 密钥已保存。', zh_tw='API 金鑰已儲存。',
  es='Clave API guardada.', fr='Clé API enregistrée.', de='API-Schlüssel gespeichert.',
  pt='Chave API salva.', vi='Đã lưu khóa API.', th='บันทึกคีย์ API แล้ว',
  id_lang='Kunci API disimpan.', ar='تم حفظ مفتاح API.'
WHERE key='admin.google.save_success' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='テスト翻訳成功', zh_cn='测试翻译成功', zh_tw='測試翻譯成功',
  es='Traducción de prueba exitosa', fr='Traduction test réussie', de='Testübersetzung erfolgreich',
  pt='Tradução de teste bem-sucedida', vi='Dịch thử thành công', th='ทดสอบแปลสำเร็จ',
  id_lang='Uji terjemahan berhasil', ar='نجح اختبار الترجمة'
WHERE key='admin.google.test_success' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='テスト翻訳失敗', zh_cn='测试翻译失败', zh_tw='測試翻譯失敗',
  es='Traducción de prueba fallida', fr='Traduction test échouée', de='Testübersetzung fehlgeschlagen',
  pt='Falha na tradução de teste', vi='Dịch thử thất bại', th='ทดสอบแปลล้มเหลว',
  id_lang='Uji terjemahan gagal', ar='فشل اختبار الترجمة'
WHERE key='admin.google.test_fail' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 5. admin.members.* (41 keys)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='会員一覧', zh_cn='会员列表', zh_tw='會員列表',
  es='Lista de miembros', fr='Liste des membres', de='Mitgliederliste',
  pt='Lista de membros', vi='Danh sách thành viên', th='รายชื่อสมาชิก',
  id_lang='Daftar anggota', ar='قائمة الأعضاء'
WHERE key='admin.members.title' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='全て', zh_cn='全部', zh_tw='全部',
  es='Todos', fr='Tous', de='Alle',
  pt='Todos', vi='Tất cả', th='ทั้งหมด',
  id_lang='Semua', ar='الكل'
WHERE key='admin.members.filter_all' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='保護者', zh_cn='监护人', zh_tw='飼主',
  es='Guardián', fr='Gardien', de='Betreuer',
  pt='Guardião', vi='Người giám hộ', th='ผู้ดูแล',
  id_lang='Wali', ar='الوصي'
WHERE key='admin.members.filter_guardian' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='事業者', zh_cn='服务商', zh_tw='服務商',
  es='Proveedor', fr='Fournisseur', de='Anbieter',
  pt='Provedor', vi='Nhà cung cấp', th='ผู้ให้บริการ',
  id_lang='Penyedia', ar='مزود الخدمة'
WHERE key='admin.members.filter_provider' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='管理者', zh_cn='管理员', zh_tw='管理員',
  es='Administrador', fr='Administrateur', de='Administrator',
  pt='Administrador', vi='Quản trị viên', th='ผู้ดูแลระบบ',
  id_lang='Administrator', ar='المشرف'
WHERE key='admin.members.filter_admin' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='名前/メール検索', zh_cn='搜索姓名/邮箱', zh_tw='搜尋姓名/電郵',
  es='Buscar nombre/correo', fr='Rechercher nom/e-mail', de='Name/E-Mail suchen',
  pt='Buscar nome/e-mail', vi='Tìm tên/email', th='ค้นหาชื่อ/อีเมล',
  id_lang='Cari nama/email', ar='بحث بالاسم/البريد'
WHERE key='admin.members.search_placeholder' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='メール', zh_cn='邮箱', zh_tw='電郵',
  es='Correo', fr='E-mail', de='E-Mail',
  pt='E-mail', vi='Email', th='อีเมล',
  id_lang='Email', ar='البريد'
WHERE key='admin.members.col_email' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='名前', zh_cn='姓名', zh_tw='姓名',
  es='Nombre', fr='Nom', de='Name',
  pt='Nome', vi='Tên', th='ชื่อ',
  id_lang='Nama', ar='الاسم'
WHERE key='admin.members.col_name' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ロール', zh_cn='角色', zh_tw='角色',
  es='Rol', fr='Rôle', de='Rolle',
  pt='Função', vi='Vai trò', th='บทบาท',
  id_lang='Peran', ar='الدور'
WHERE key='admin.members.col_role' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='登録日', zh_cn='注册日期', zh_tw='註冊日期',
  es='Fecha de registro', fr='Date d''inscription', de='Registrierungsdatum',
  pt='Data de cadastro', vi='Ngày đăng ký', th='วันที่ลงทะเบียน',
  id_lang='Tanggal daftar', ar='تاريخ التسجيل'
WHERE key='admin.members.col_created' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='操作', zh_cn='操作', zh_tw='操作',
  es='Acciones', fr='Actions', de='Aktionen',
  pt='Ações', vi='Thao tác', th='การดำเนินการ',
  id_lang='Tindakan', ar='إجراءات'
WHERE key='admin.members.col_actions' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='会員がいません', zh_cn='没有会员', zh_tw='沒有會員',
  es='Sin miembros', fr='Aucun membre', de='Keine Mitglieder',
  pt='Nenhum membro', vi='Không có thành viên', th='ไม่มีสมาชิก',
  id_lang='Tidak ada anggota', ar='لا يوجد أعضاء'
WHERE key='admin.members.empty' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='詳細', zh_cn='详情', zh_tw='詳情',
  es='Detalles', fr='Détails', de='Details',
  pt='Detalhes', vi='Chi tiết', th='รายละเอียด',
  id_lang='Detail', ar='التفاصيل'
WHERE key='admin.members.detail' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='会員詳細', zh_cn='会员详情', zh_tw='會員詳情',
  es='Detalles del miembro', fr='Détails du membre', de='Mitglied-Details',
  pt='Detalhes do membro', vi='Chi tiết thành viên', th='รายละเอียดสมาชิก',
  id_lang='Detail anggota', ar='تفاصيل العضو'
WHERE key='admin.members.detail_title' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='UID', zh_cn='UID', zh_tw='UID',
  es='UID', fr='UID', de='UID',
  pt='UID', vi='UID', th='UID',
  id_lang='UID', ar='UID'
WHERE key='admin.members.uid' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ニックネーム', zh_cn='昵称', zh_tw='暱稱',
  es='Apodo', fr='Pseudo', de='Spitzname',
  pt='Apelido', vi='Biệt danh', th='ชื่อเล่น',
  id_lang='Nama panggilan', ar='اسم مستعار'
WHERE key='admin.members.nickname' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='国', zh_cn='国家', zh_tw='國家',
  es='País', fr='Pays', de='Land',
  pt='País', vi='Quốc gia', th='ประเทศ',
  id_lang='Negara', ar='البلد'
WHERE key='admin.members.country' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='電話', zh_cn='电话', zh_tw='電話',
  es='Teléfono', fr='Téléphone', de='Telefon',
  pt='Telefone', vi='Điện thoại', th='โทรศัพท์',
  id_lang='Telepon', ar='الهاتف'
WHERE key='admin.members.phone' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='住所', zh_cn='地址', zh_tw='地址',
  es='Dirección', fr='Adresse', de='Adresse',
  pt='Endereço', vi='Địa chỉ', th='ที่อยู่',
  id_lang='Alamat', ar='العنوان'
WHERE key='admin.members.address' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='言語', zh_cn='语言', zh_tw='語言',
  es='Idioma', fr='Langue', de='Sprache',
  pt='Idioma', vi='Ngôn ngữ', th='ภาษา',
  id_lang='Bahasa', ar='اللغة'
WHERE key='admin.members.language' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='通貨', zh_cn='货币', zh_tw='貨幣',
  es='Moneda', fr='Devise', de='Währung',
  pt='Moeda', vi='Tiền tệ', th='สกุลเงิน',
  id_lang='Mata uang', ar='العملة'
WHERE key='admin.members.currency' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ペットの有無', zh_cn='是否有宠物', zh_tw='是否有寵物',
  es='¿Tiene mascotas?', fr='A des animaux ?', de='Hat Haustiere?',
  pt='Tem pets?', vi='Có thú cưng?', th='มีสัตว์เลี้ยง?',
  id_lang='Punya hewan?', ar='لديه حيوانات؟'
WHERE key='admin.members.has_pets' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ペット数', zh_cn='宠物数', zh_tw='寵物數',
  es='N° mascotas', fr='N° animaux', de='Haustieranzahl',
  pt='N° pets', vi='Số thú cưng', th='จำนวนสัตว์เลี้ยง',
  id_lang='Jumlah hewan', ar='عدد الحيوانات'
WHERE key='admin.members.pet_count' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='関心のある動物', zh_cn='感兴趣的动物', zh_tw='感興趣的動物',
  es='Animales de interés', fr='Animaux d''intérêt', de='Interessante Tiere',
  pt='Animais de interesse', vi='Động vật quan tâm', th='สัตว์ที่สนใจ',
  id_lang='Hewan yang diminati', ar='الحيوانات المفضلة'
WHERE key='admin.members.interests' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='マーケティング', zh_cn='营销', zh_tw='行銷',
  es='Marketing', fr='Marketing', de='Marketing',
  pt='Marketing', vi='Tiếp thị', th='การตลาด',
  id_lang='Pemasaran', ar='التسويق'
WHERE key='admin.members.marketing' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='登録日時', zh_cn='注册时间', zh_tw='註冊時間',
  es='Fecha de registro', fr='Date d''inscription', de='Registrierungsdatum',
  pt='Data de cadastro', vi='Ngày đăng ký', th='วันที่ลงทะเบียน',
  id_lang='Tanggal daftar', ar='تاريخ التسجيل'
WHERE key='admin.members.created_at' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='閉じる', zh_cn='关闭', zh_tw='關閉',
  es='Cerrar', fr='Fermer', de='Schließen',
  pt='Fechar', vi='Đóng', th='ปิด',
  id_lang='Tutup', ar='إغلاق'
WHERE key='admin.members.close' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ロール変更', zh_cn='更改角色', zh_tw='變更角色',
  es='Cambiar rol', fr='Changer le rôle', de='Rolle ändern',
  pt='Alterar função', vi='Đổi vai trò', th='เปลี่ยนบทบาท',
  id_lang='Ubah peran', ar='تغيير الدور'
WHERE key='admin.members.change_role' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='のロールを変更', zh_cn='更改角色为', zh_tw='變更角色為',
  es='Cambiar rol de', fr='Changer le rôle de', de='Rolle ändern von',
  pt='Alterar função de', vi='Đổi vai trò của', th='เปลี่ยนบทบาทของ',
  id_lang='Ubah peran dari', ar='تغيير دور'
WHERE key='admin.members.change_role_for' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='新しいロール', zh_cn='新角色', zh_tw='新角色',
  es='Nuevo rol', fr='Nouveau rôle', de='Neue Rolle',
  pt='Nova função', vi='Vai trò mới', th='บทบาทใหม่',
  id_lang='Peran baru', ar='الدور الجديد'
WHERE key='admin.members.new_role' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ロール変更を確認', zh_cn='确认更改角色', zh_tw='確認變更角色',
  es='Confirmar cambio de rol', fr='Confirmer le changement', de='Rollenänderung bestätigen',
  pt='Confirmar alteração', vi='Xác nhận đổi vai trò', th='ยืนยันเปลี่ยนบทบาท',
  id_lang='Konfirmasi ubah peran', ar='تأكيد تغيير الدور'
WHERE key='admin.members.confirm_role' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='キャンセル', zh_cn='取消', zh_tw='取消',
  es='Cancelar', fr='Annuler', de='Abbrechen',
  pt='Cancelar', vi='Hủy', th='ยกเลิก',
  id_lang='Batal', ar='إلغاء'
WHERE key='admin.members.cancel' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ロールが変更されました。', zh_cn='角色已更改。', zh_tw='角色已變更。',
  es='Rol cambiado.', fr='Rôle modifié.', de='Rolle geändert.',
  pt='Função alterada.', vi='Đã đổi vai trò.', th='เปลี่ยนบทบาทแล้ว',
  id_lang='Peran diubah.', ar='تم تغيير الدور.'
WHERE key='admin.members.role_changed' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='アカウント停止', zh_cn='停用账户', zh_tw='停用帳號',
  es='Suspender cuenta', fr='Suspendre le compte', de='Konto sperren',
  pt='Suspender conta', vi='Đình chỉ tài khoản', th='ระงับบัญชี',
  id_lang='Nonaktifkan akun', ar='تعليق الحساب'
WHERE key='admin.members.suspend' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='アカウント復活', zh_cn='恢复账户', zh_tw='恢復帳號',
  es='Reactivar cuenta', fr='Réactiver le compte', de='Konto reaktivieren',
  pt='Reativar conta', vi='Kích hoạt lại tài khoản', th='เปิดใช้งานบัญชีอีกครั้ง',
  id_lang='Aktifkan kembali akun', ar='إعادة تفعيل الحساب'
WHERE key='admin.members.activate' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='本当にこの会員を停止しますか？', zh_cn='确定要停用该会员吗？', zh_tw='確定要停用該會員嗎？',
  es='¿Suspender este miembro?', fr='Suspendre ce membre ?', de='Dieses Mitglied sperren?',
  pt='Suspender este membro?', vi='Đình chỉ thành viên này?', th='ระงับสมาชิกนี้?',
  id_lang='Nonaktifkan anggota ini?', ar='تعليق هذا العضو؟'
WHERE key='admin.members.confirm_suspend' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='本当にこの会員を復活しますか？', zh_cn='确定要恢复该会员吗？', zh_tw='確定要恢復該會員嗎？',
  es='¿Reactivar este miembro?', fr='Réactiver ce membre ?', de='Dieses Mitglied reaktivieren?',
  pt='Reativar este membro?', vi='Kích hoạt lại thành viên này?', th='เปิดใช้งานสมาชิกนี้อีกครั้ง?',
  id_lang='Aktifkan kembali anggota ini?', ar='إعادة تفعيل هذا العضو؟'
WHERE key='admin.members.confirm_activate' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ステータス', zh_cn='状态', zh_tw='狀態',
  es='Estado', fr='Statut', de='Status',
  pt='Status', vi='Trạng thái', th='สถานะ',
  id_lang='Status', ar='الحالة'
WHERE key='admin.members.col_status' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='有効', zh_cn='正常', zh_tw='正常',
  es='Activo', fr='Actif', de='Aktiv',
  pt='Ativo', vi='Hoạt động', th='ใช้งาน',
  id_lang='Aktif', ar='نشط'
WHERE key='admin.members.status_active' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='停止', zh_cn='已停用', zh_tw='已停用',
  es='Suspendido', fr='Suspendu', de='Gesperrt',
  pt='Suspenso', vi='Bị đình chỉ', th='ถูกระงับ',
  id_lang='Dinonaktifkan', ar='معلق'
WHERE key='admin.members.status_suspended' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 6. platform.name / platform.tagline (2 keys)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='Petfolio', zh_cn='Petfolio', zh_tw='Petfolio',
  es='Petfolio', fr='Petfolio', de='Petfolio',
  pt='Petfolio', vi='Petfolio', th='Petfolio',
  id_lang='Petfolio', ar='Petfolio'
WHERE key='platform.name' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ペットの一生を美しく記録する', zh_cn='美丽记录宠物的一生', zh_tw='美麗記錄寵物的一生',
  es='Registra bellamente la vida de tu mascota', fr='Enregistrez magnifiquement la vie de votre animal', de='Das Leben Ihres Haustieres schön festhalten',
  pt='Registre lindamente a vida do seu pet', vi='Ghi lại cuộc đời thú cưng thật đẹp', th='บันทึกชีวิตสัตว์เลี้ยงอย่างสวยงาม',
  id_lang='Rekam indah kehidupan hewan peliharaan Anda', ar='سجّل حياة حيوانك الأليف بجمال'
WHERE key='platform.tagline' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 7. device.manufacturer.* (4 keys — proper nouns, same across langs)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='アボット', zh_cn='雅培', zh_tw='亞培',
  es='Abbott', fr='Abbott', de='Abbott',
  pt='Abbott', vi='Abbott', th='แอ๊บบอต',
  id_lang='Abbott', ar='أبوت'
WHERE key='device.manufacturer.abbott' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ロシュ', zh_cn='罗氏', zh_tw='羅氏',
  es='Roche', fr='Roche', de='Roche',
  pt='Roche', vi='Roche', th='โรช',
  id_lang='Roche', ar='روش'
WHERE key='device.manufacturer.roche' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ライフスキャン', zh_cn='强生稳豪', zh_tw='嬌生穩豪',
  es='LifeScan', fr='LifeScan', de='LifeScan',
  pt='LifeScan', vi='LifeScan', th='ไลฟ์สแกน',
  id_lang='LifeScan', ar='لايفسكان'
WHERE key='device.manufacturer.lifescan' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='オムロン', zh_cn='欧姆龙', zh_tw='歐姆龍',
  es='Omron', fr='Omron', de='Omron',
  pt='Omron', vi='Omron', th='ออมรอน',
  id_lang='Omron', ar='أومرون'
WHERE key='device.manufacturer.omron' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 8. feed.manufacturer.* (8 keys — brand names)
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET
  ja='ピュリナ', zh_cn='普瑞纳', zh_tw='普瑞納',
  es='Purina', fr='Purina', de='Purina',
  pt='Purina', vi='Purina', th='เพียวริน่า',
  id_lang='Purina', ar='بورينا'
WHERE key='feed.manufacturer.purina' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ファルミナ', zh_cn='法米纳', zh_tw='法米納',
  es='Farmina', fr='Farmina', de='Farmina',
  pt='Farmina', vi='Farmina', th='ฟาร์มิน่า',
  id_lang='Farmina', ar='فارمينا'
WHERE key='feed.manufacturer.farmina' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ジウィピーク', zh_cn='巅峰', zh_tw='巔峰',
  es='Ziwi Peak', fr='Ziwi Peak', de='Ziwi Peak',
  pt='Ziwi Peak', vi='Ziwi Peak', th='ซีวี่พีค',
  id_lang='Ziwi Peak', ar='زيوي بيك'
WHERE key='feed.manufacturer.ziwi_peak' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='インスティンクト', zh_cn='本能', zh_tw='本能',
  es='Instinct', fr='Instinct', de='Instinct',
  pt='Instinct', vi='Instinct', th='อินสทิงค์',
  id_lang='Instinct', ar='إنستينكت'
WHERE key='feed.manufacturer.instinct' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ステラ&チューイーズ', zh_cn='星厨', zh_tw='星廚',
  es='Stella & Chewy''s', fr='Stella & Chewy''s', de='Stella & Chewy''s',
  pt='Stella & Chewy''s', vi='Stella & Chewy''s', th='สเตลล่า แอนด์ ชิววี่ส์',
  id_lang='Stella & Chewy''s', ar='ستيلا آند تشويز'
WHERE key='feed.manufacturer.stella_chewys' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='オープンファーム', zh_cn='开放农场', zh_tw='開放農場',
  es='Open Farm', fr='Open Farm', de='Open Farm',
  pt='Open Farm', vi='Open Farm', th='โอเพ่นฟาร์ม',
  id_lang='Open Farm', ar='أوبن فارم'
WHERE key='feed.manufacturer.open_farm' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='ウェルネス', zh_cn='健康', zh_tw='健康',
  es='Wellness', fr='Wellness', de='Wellness',
  pt='Wellness', vi='Wellness', th='เวลเนส',
  id_lang='Wellness', ar='ويلنس'
WHERE key='feed.manufacturer.wellness' AND ja IS NULL;

UPDATE i18n_translations SET
  ja='テイスト・オブ・ザ・ワイルド', zh_cn='旷野滋味', zh_tw='曠野滋味',
  es='Taste of the Wild', fr='Taste of the Wild', de='Taste of the Wild',
  pt='Taste of the Wild', vi='Taste of the Wild', th='เทสต์ออฟเดอะไวลด์',
  id_lang='Taste of the Wild', ar='تيست أوف ذا وايلد'
WHERE key='feed.manufacturer.taste_of_the_wild' AND ja IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 9. feed.brand.* (23 keys — brand/product line names)
--    Most are proper nouns; CJK gets localized names where common
-- ═══════════════════════════════════════════════════════════════════

UPDATE i18n_translations SET ja=ko, zh_cn=ko, zh_tw=ko, es=en, fr=en, de=en, pt=en, vi=en, th=ko, id_lang=en, ar=en
WHERE key LIKE 'feed.brand.%' AND ja IS NULL;

COMMIT;


-- --------------------------------------------------------------------------
-- Source: 054_api_connections_i18n.sql
-- --------------------------------------------------------------------------
-- 054: i18n keys for API Connections page (Google + Kakao + Apple)

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
-- Navigation
(gen_random_uuid()::text, 'admin.nav.api_connections', 'admin', true,
 'API 연결', 'API Connections', 'API接続', 'API连接', 'API連接',
 'Conexiones API', 'Connexions API', 'API-Verbindungen', 'Conexões API',
 'Kết nối API', 'การเชื่อมต่อ API', 'Koneksi API', 'اتصالات API',
 now(), now()),

-- Page title
(gen_random_uuid()::text, 'admin.api_connections.title', 'admin', true,
 'API 연결', 'API Connections', 'API接続', 'API连接', 'API連接',
 'Conexiones API', 'Connexions API', 'API-Verbindungen', 'Conexões API',
 'Kết nối API', 'การเชื่อมต่อ API', 'Koneksi API', 'اتصالات API',
 now(), now()),

-- Tabs
(gen_random_uuid()::text, 'admin.api_connections.tab.google', 'admin', true,
 'Google', 'Google', 'Google', 'Google', 'Google',
 'Google', 'Google', 'Google', 'Google',
 'Google', 'Google', 'Google', 'Google',
 now(), now()),

(gen_random_uuid()::text, 'admin.api_connections.tab.kakao', 'admin', true,
 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao',
 'Kakao', 'Kakao', 'Kakao', 'Kakao',
 'Kakao', 'Kakao', 'Kakao', 'Kakao',
 now(), now()),

(gen_random_uuid()::text, 'admin.api_connections.tab.apple', 'admin', true,
 'Apple', 'Apple', 'Apple', 'Apple', 'Apple',
 'Apple', 'Apple', 'Apple', 'Apple',
 'Apple', 'Apple', 'Apple', 'Apple',
 now(), now()),

-- Status badges
(gen_random_uuid()::text, 'admin.api_connections.status.connected', 'admin', true,
 '연결완료', 'Connected', '接続済み', '已连接', '已連接',
 'Conectado', 'Connecté', 'Verbunden', 'Conectado',
 'Đã kết nối', 'เชื่อมต่อแล้ว', 'Terhubung', 'متصل',
 now(), now()),

(gen_random_uuid()::text, 'admin.api_connections.status.unverified', 'admin', true,
 '미확인', 'Unverified', '未確認', '未验证', '未驗證',
 'Sin verificar', 'Non vérifié', 'Nicht verifiziert', 'Não verificado',
 'Chưa xác minh', 'ยังไม่ยืนยัน', 'Belum diverifikasi', 'غير مؤكد',
 now(), now()),

-- Common buttons
(gen_random_uuid()::text, 'admin.api_connections.btn.test', 'admin', true,
 '연결 확인', 'Test Connection', '接続テスト', '测试连接', '測試連接',
 'Probar conexión', 'Tester la connexion', 'Verbindung testen', 'Testar conexão',
 'Kiểm tra kết nối', 'ทดสอบการเชื่อมต่อ', 'Uji koneksi', 'اختبار الاتصال',
 now(), now()),

(gen_random_uuid()::text, 'admin.api_connections.btn.testing', 'admin', true,
 '확인중...', 'Testing...', 'テスト中...', '测试中...', '測試中...',
 'Probando...', 'Test en cours...', 'Teste läuft...', 'Testando...',
 'Đang kiểm tra...', 'กำลังทดสอบ...', 'Menguji...', '...جارٍ الاختبار',
 now(), now()),

(gen_random_uuid()::text, 'admin.api_connections.btn.save', 'admin', true,
 '저장', 'Save', '保存', '保存', '儲存',
 'Guardar', 'Enregistrer', 'Speichern', 'Salvar',
 'Lưu', 'บันทึก', 'Simpan', 'حفظ',
 now(), now()),

(gen_random_uuid()::text, 'admin.api_connections.saved', 'admin', true,
 '설정이 저장되었습니다.', 'Settings saved.', '設定が保存されました。', '设置已保存。', '設定已儲存。',
 'Configuración guardada.', 'Paramètres enregistrés.', 'Einstellungen gespeichert.', 'Configurações salvas.',
 'Đã lưu cài đặt.', 'บันทึกการตั้งค่าแล้ว', 'Pengaturan disimpan.', '.تم حفظ الإعدادات',
 now(), now()),

-- Kakao section
(gen_random_uuid()::text, 'admin.kakao.section.oauth', 'admin', true,
 'Kakao 로그인', 'Kakao Login', 'Kakaoログイン', 'Kakao登录', 'Kakao登入',
 'Inicio de sesión Kakao', 'Connexion Kakao', 'Kakao-Anmeldung', 'Login Kakao',
 'Đăng nhập Kakao', 'เข้าสู่ระบบ Kakao', 'Login Kakao', 'تسجيل دخول Kakao',
 now(), now()),

(gen_random_uuid()::text, 'admin.kakao.field.rest_api_key', 'admin', true,
 'REST API Key', 'REST API Key', 'REST APIキー', 'REST API密钥', 'REST API金鑰',
 'Clave REST API', 'Clé REST API', 'REST-API-Schlüssel', 'Chave REST API',
 'Khóa REST API', 'คีย์ REST API', 'Kunci REST API', 'مفتاح REST API',
 now(), now()),

(gen_random_uuid()::text, 'admin.kakao.field.javascript_key', 'admin', true,
 'JavaScript Key', 'JavaScript Key', 'JavaScriptキー', 'JavaScript密钥', 'JavaScript金鑰',
 'Clave JavaScript', 'Clé JavaScript', 'JavaScript-Schlüssel', 'Chave JavaScript',
 'Khóa JavaScript', 'คีย์ JavaScript', 'Kunci JavaScript', 'مفتاح JavaScript',
 now(), now()),

(gen_random_uuid()::text, 'admin.kakao.field.redirect_uri', 'admin', true,
 'Redirect URI', 'Redirect URI', 'リダイレクトURI', '重定向URI', '重定向URI',
 'URI de redirección', 'URI de redirection', 'Weiterleitungs-URI', 'URI de redirecionamento',
 'URI chuyển hướng', 'URI เปลี่ยนเส้นทาง', 'URI Pengalihan', 'URI إعادة التوجيه',
 now(), now()),

(gen_random_uuid()::text, 'admin.kakao.hint.rest_api_key', 'admin', true,
 'Kakao Developers > 내 애플리케이션 > 앱 키 > REST API 키',
 'Kakao Developers > My Application > App Keys > REST API Key',
 'Kakao Developers > マイアプリケーション > アプリキー > REST APIキー',
 'Kakao Developers > 我的应用 > 应用密钥 > REST API密钥',
 'Kakao Developers > 我的應用 > 應用金鑰 > REST API金鑰',
 'Kakao Developers > Mi aplicación > Claves de app > Clave REST API',
 'Kakao Developers > Mon application > Clés d''app > Clé REST API',
 'Kakao Developers > Meine Anwendung > App-Schlüssel > REST-API-Schlüssel',
 'Kakao Developers > Meu aplicativo > Chaves do app > Chave REST API',
 'Kakao Developers > Ứng dụng > Khóa ứng dụng > Khóa REST API',
 'Kakao Developers > แอปพลิเคชัน > คีย์แอป > คีย์ REST API',
 'Kakao Developers > Aplikasi Saya > Kunci App > Kunci REST API',
 'Kakao Developers > تطبيقي > مفاتيح التطبيق > مفتاح REST API',
 now(), now()),

(gen_random_uuid()::text, 'admin.kakao.hint.javascript_key', 'admin', true,
 'Kakao Developers > 내 애플리케이션 > 앱 키 > JavaScript 키',
 'Kakao Developers > My Application > App Keys > JavaScript Key',
 'Kakao Developers > マイアプリケーション > アプリキー > JavaScriptキー',
 'Kakao Developers > 我的应用 > 应用密钥 > JavaScript密钥',
 'Kakao Developers > 我的應用 > 應用金鑰 > JavaScript金鑰',
 'Kakao Developers > Mi aplicación > Claves de app > Clave JavaScript',
 'Kakao Developers > Mon application > Clés d''app > Clé JavaScript',
 'Kakao Developers > Meine Anwendung > App-Schlüssel > JavaScript-Schlüssel',
 'Kakao Developers > Meu aplicativo > Chaves do app > Chave JavaScript',
 'Kakao Developers > Ứng dụng > Khóa ứng dụng > Khóa JavaScript',
 'Kakao Developers > แอปพลิเคชัน > คีย์แอป > คีย์ JavaScript',
 'Kakao Developers > Aplikasi Saya > Kunci App > Kunci JavaScript',
 'Kakao Developers > تطبيقي > مفاتيح التطبيق > مفتاح JavaScript',
 now(), now()),

-- Apple section
(gen_random_uuid()::text, 'admin.apple.section.signin', 'admin', true,
 'Apple 로그인', 'Sign in with Apple', 'Appleでサインイン', 'Apple登录', 'Apple登入',
 'Iniciar sesión con Apple', 'Se connecter avec Apple', 'Mit Apple anmelden', 'Iniciar sessão com Apple',
 'Đăng nhập bằng Apple', 'ลงชื่อเข้าใช้ด้วย Apple', 'Masuk dengan Apple', 'تسجيل الدخول بـ Apple',
 now(), now()),

(gen_random_uuid()::text, 'admin.apple.field.service_id', 'admin', true,
 'Service ID', 'Service ID', 'サービスID', '服务ID', '服務ID',
 'ID de servicio', 'ID de service', 'Service-ID', 'ID de serviço',
 'ID Dịch vụ', 'ID บริการ', 'ID Layanan', 'معرف الخدمة',
 now(), now()),

(gen_random_uuid()::text, 'admin.apple.field.team_id', 'admin', true,
 'Team ID', 'Team ID', 'チームID', '团队ID', '團隊ID',
 'ID de equipo', 'ID d''équipe', 'Team-ID', 'ID da equipe',
 'ID Nhóm', 'ID ทีม', 'ID Tim', 'معرف الفريق',
 now(), now()),

(gen_random_uuid()::text, 'admin.apple.field.key_id', 'admin', true,
 'Key ID', 'Key ID', 'キーID', '密钥ID', '金鑰ID',
 'ID de clave', 'ID de clé', 'Schlüssel-ID', 'ID da chave',
 'ID Khóa', 'ID คีย์', 'ID Kunci', 'معرف المفتاح',
 now(), now()),

(gen_random_uuid()::text, 'admin.apple.field.private_key', 'admin', true,
 'Private Key (.p8)', 'Private Key (.p8)', '秘密鍵 (.p8)', '私钥 (.p8)', '私鑰 (.p8)',
 'Clave privada (.p8)', 'Clé privée (.p8)', 'Privater Schlüssel (.p8)', 'Chave privada (.p8)',
 'Khóa bí mật (.p8)', 'คีย์ส่วนตัว (.p8)', 'Kunci Pribadi (.p8)', '(.p8) المفتاح الخاص',
 now(), now()),

(gen_random_uuid()::text, 'admin.apple.field.redirect_uri', 'admin', true,
 'Redirect URI', 'Redirect URI', 'リダイレクトURI', '重定向URI', '重定向URI',
 'URI de redirección', 'URI de redirection', 'Weiterleitungs-URI', 'URI de redirecionamento',
 'URI chuyển hướng', 'URI เปลี่ยนเส้นทาง', 'URI Pengalihan', 'URI إعادة التوجيه',
 now(), now()),

(gen_random_uuid()::text, 'admin.apple.hint.service_id', 'admin', true,
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs',
 now(), now()),

(gen_random_uuid()::text, 'admin.apple.hint.private_key', 'admin', true,
 'Apple Developer에서 다운로드한 .p8 파일의 내용을 붙여넣으세요.',
 'Paste the contents of the .p8 file downloaded from Apple Developer.',
 'Apple Developerからダウンロードした.p8ファイルの内容を貼り付けてください。',
 '粘贴从Apple Developer下载的.p8文件内容。',
 '貼上從Apple Developer下載的.p8檔案內容。',
 'Pegue el contenido del archivo .p8 descargado de Apple Developer.',
 'Collez le contenu du fichier .p8 téléchargé depuis Apple Developer.',
 'Fügen Sie den Inhalt der von Apple Developer heruntergeladenen .p8-Datei ein.',
 'Cole o conteúdo do arquivo .p8 baixado do Apple Developer.',
 'Dán nội dung tệp .p8 đã tải từ Apple Developer.',
 'วางเนื้อหาของไฟล์ .p8 ที่ดาวน์โหลดจาก Apple Developer',
 'Tempelkan isi file .p8 yang diunduh dari Apple Developer.',
 '.الصق محتوى ملف .p8 الذي تم تنزيله من Apple Developer',
 now(), now())

ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 055_oauth_login_i18n.sql
-- --------------------------------------------------------------------------
-- 055: i18n keys for Kakao/Apple OAuth login/signup buttons

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
(gen_random_uuid()::text, 'public.login.kakao', 'public', true,
 '카카오 로그인', 'Continue with Kakao', 'Kakaoでログイン', 'Kakao登录', 'Kakao登入',
 'Continuar con Kakao', 'Continuer avec Kakao', 'Weiter mit Kakao', 'Continuar com Kakao',
 'Tiếp tục với Kakao', 'ดำเนินการต่อด้วย Kakao', 'Lanjutkan dengan Kakao', 'المتابعة مع Kakao',
 now(), now()),

(gen_random_uuid()::text, 'public.login.apple', 'public', true,
 'Apple로 로그인', 'Sign in with Apple', 'Appleでサインイン', '通过Apple登录', '透過Apple登入',
 'Iniciar sesión con Apple', 'Se connecter avec Apple', 'Mit Apple anmelden', 'Iniciar sessão com Apple',
 'Đăng nhập bằng Apple', 'ลงชื่อเข้าใช้ด้วย Apple', 'Masuk dengan Apple', 'تسجيل الدخول بـ Apple',
 now(), now()),

(gen_random_uuid()::text, 'public.signup.kakao', 'public', true,
 '카카오로 가입', 'Sign up with Kakao', 'Kakaoで登録', 'Kakao注册', 'Kakao註冊',
 'Registrarse con Kakao', 'S''inscrire avec Kakao', 'Mit Kakao registrieren', 'Cadastrar com Kakao',
 'Đăng ký với Kakao', 'สมัครด้วย Kakao', 'Daftar dengan Kakao', 'التسجيل بـ Kakao',
 now(), now()),

(gen_random_uuid()::text, 'public.signup.apple', 'public', true,
 'Apple로 가입', 'Sign up with Apple', 'Appleで登録', 'Apple注册', 'Apple註冊',
 'Registrarse con Apple', 'S''inscrire avec Apple', 'Mit Apple registrieren', 'Cadastrar com Apple',
 'Đăng ký với Apple', 'สมัครด้วย Apple', 'Daftar dengan Apple', 'التسجيل بـ Apple',
 now(), now()),

(gen_random_uuid()::text, 'public.signup.kakao_fail', 'public', true,
 '카카오 가입에 실패했습니다.', 'Kakao signup failed.', 'Kakao登録に失敗しました。', 'Kakao注册失败。', 'Kakao註冊失敗。',
 'Error al registrarse con Kakao.', 'Échec de l''inscription Kakao.', 'Kakao-Registrierung fehlgeschlagen.', 'Falha no cadastro Kakao.',
 'Đăng ký Kakao thất bại.', 'การสมัคร Kakao ล้มเหลว', 'Pendaftaran Kakao gagal.', '.فشل التسجيل بـ Kakao',
 now(), now()),

(gen_random_uuid()::text, 'public.signup.apple_fail', 'public', true,
 'Apple 가입에 실패했습니다.', 'Apple signup failed.', 'Apple登録に失敗しました。', 'Apple注册失败。', 'Apple註冊失敗。',
 'Error al registrarse con Apple.', 'Échec de l''inscription Apple.', 'Apple-Registrierung fehlgeschlagen.', 'Falha no cadastro Apple.',
 'Đăng ký Apple thất bại.', 'การสมัคร Apple ล้มเหลว', 'Pendaftaran Apple gagal.', '.فشل التسجيل بـ Apple',
 now(), now()),

(gen_random_uuid()::text, 'public.signup.kakao_no_code', 'public', true,
 '카카오 인증 코드를 받지 못했습니다.', 'Failed to receive Kakao auth code.', 'Kakao認証コードを受信できませんでした。', '未收到Kakao认证码。', '未收到Kakao認證碼。',
 'No se recibió el código de Kakao.', 'Code Kakao non reçu.', 'Kakao-Authentifizierungscode nicht empfangen.', 'Código Kakao não recebido.',
 'Không nhận được mã Kakao.', 'ไม่ได้รับรหัส Kakao', 'Kode Kakao tidak diterima.', '.لم يتم استلام رمز Kakao',
 now(), now()),

(gen_random_uuid()::text, 'public.signup.apple_no_token', 'public', true,
 'Apple 인증 토큰을 받지 못했습니다.', 'Failed to receive Apple auth token.', 'Apple認証トークンを受信できませんでした。', '未收到Apple认证令牌。', '未收到Apple認證令牌。',
 'No se recibió el token de Apple.', 'Token Apple non reçu.', 'Apple-Token nicht empfangen.', 'Token Apple não recebido.',
 'Không nhận được token Apple.', 'ไม่ได้รับ token Apple', 'Token Apple tidak diterima.', '.لم يتم استلام رمز Apple',
 now(), now())

ON CONFLICT (key) DO NOTHING;

-- Update existing SNS description to mention all 3 providers
UPDATE i18n_translations SET
  ko = 'Google, 카카오, Apple 계정으로 빠르게 가입',
  en = 'Quick signup with Google, Kakao, or Apple',
  ja = 'Google、Kakao、Appleで素早く登録',
  zh_cn = '使用Google、Kakao或Apple快速注册',
  zh_tw = '使用Google、Kakao或Apple快速註冊',
  es = 'Registro rápido con Google, Kakao o Apple',
  fr = 'Inscription rapide avec Google, Kakao ou Apple',
  de = 'Schnelle Registrierung mit Google, Kakao oder Apple',
  pt = 'Cadastro rápido com Google, Kakao ou Apple',
  vi = 'Đăng ký nhanh với Google, Kakao hoặc Apple',
  th = 'สมัครเร็วด้วย Google, Kakao หรือ Apple',
  id_lang = 'Daftar cepat dengan Google, Kakao, atau Apple',
  ar = 'تسجيل سريع بـ Google أو Kakao أو Apple',
  updated_at = now()
WHERE key = 'public.signup.sns_desc';


-- --------------------------------------------------------------------------
-- Source: 056_gallery_i18n.sql
-- --------------------------------------------------------------------------
-- 056: i18n keys for Gallery panel + misc hardcoded Korean strings

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
-- Gallery source labels
(gen_random_uuid()::text, 'guardian.gallery.source.profile', 'guardian', true,
 '프로필', 'Profile', 'プロフィール', '个人资料', '個人資料',
 'Perfil', 'Profil', 'Profil', 'Perfil',
 'Hồ sơ', 'โปรไฟล์', 'Profil', 'الملف الشخصي',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.feed', 'guardian', true,
 '피드', 'Feed', 'フィード', '动态', '動態',
 'Feed', 'Flux', 'Feed', 'Feed',
 'Bảng tin', 'ฟีด', 'Umpan', 'التغذية',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.booking_completed', 'guardian', true,
 '예약완료', 'Booking', '予約完了', '预约完成', '預約完成',
 'Reserva', 'Réservation', 'Buchung', 'Reserva',
 'Đặt lịch', 'การจอง', 'Pemesanan', 'الحجز',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.health_record', 'guardian', true,
 '건강기록', 'Health', '健康記録', '健康记录', '健康紀錄',
 'Salud', 'Santé', 'Gesundheit', 'Saúde',
 'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'الصحة',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.manual_upload', 'guardian', true,
 '수동업로드', 'Upload', '手動アップロード', '手动上传', '手動上傳',
 'Subida', 'Téléchargement', 'Upload', 'Upload',
 'Tải lên', 'อัปโหลด', 'Unggahan', 'رفع',
 now(), now()),

-- Gallery filter/sort
(gen_random_uuid()::text, 'guardian.gallery.filter.all', 'guardian', true,
 '전체', 'All', 'すべて', '全部', '全部',
 'Todos', 'Tout', 'Alle', 'Todos',
 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.filter.image_only', 'guardian', true,
 '사진만', 'Photos', '写真のみ', '仅照片', '僅照片',
 'Fotos', 'Photos', 'Fotos', 'Fotos',
 'Ảnh', 'รูปภาพ', 'Foto', 'صور',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.filter.video_only', 'guardian', true,
 '영상만', 'Videos', '動画のみ', '仅视频', '僅影片',
 'Videos', 'Vidéos', 'Videos', 'Vídeos',
 'Video', 'วิดีโอ', 'Video', 'فيديو',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.filter.all_media', 'guardian', true,
 '영상포함', 'All', 'すべて', '包含视频', '包含影片',
 'Todos', 'Tout', 'Alle', 'Todos',
 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.sort.latest', 'guardian', true,
 '최신순', 'Latest', '新しい順', '最新', '最新',
 'Más reciente', 'Plus récent', 'Neueste', 'Mais recente',
 'Mới nhất', 'ล่าสุด', 'Terbaru', 'الأحدث',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.sort.oldest', 'guardian', true,
 '오래된순', 'Oldest', '古い順', '最早', '最早',
 'Más antiguo', 'Plus ancien', 'Älteste', 'Mais antigo',
 'Cũ nhất', 'เก่าสุด', 'Terlama', 'الأقدم',
 now(), now()),

-- Gallery empty states
(gen_random_uuid()::text, 'guardian.gallery.empty.title', 'guardian', true,
 '아직 사진이 없습니다.', 'No photos yet.', 'まだ写真がありません。', '还没有照片。', '還沒有照片。',
 'Aún no hay fotos.', 'Pas encore de photos.', 'Noch keine Fotos.', 'Nenhuma foto ainda.',
 'Chưa có ảnh.', 'ยังไม่มีรูปภาพ', 'Belum ada foto.', 'لا توجد صور بعد.',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.empty.desc', 'guardian', true,
 '첫 프로필 사진이나 반려동물 사진을 업로드해보세요.', 'Upload your first profile or pet photo.', '最初のプロフィールまたはペットの写真をアップロードしましょう。', '上传您的第一张个人资料或宠物照片。', '上傳您的第一張個人資料或寵物照片。',
 'Sube tu primera foto de perfil o mascota.', 'Téléchargez votre première photo de profil ou d''animal.', 'Laden Sie Ihr erstes Profil- oder Haustierfoto hoch.', 'Envie sua primeira foto de perfil ou pet.',
 'Tải lên ảnh hồ sơ hoặc thú cưng đầu tiên.', 'อัปโหลดรูปโปรไฟล์หรือรูปสัตว์เลี้ยงแรกของคุณ', 'Unggah foto profil atau hewan peliharaan pertama Anda.', 'قم بتحميل أول صورة شخصية أو صورة حيوانك الأليف.',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.empty.filtered', 'guardian', true,
 '선택한 유형의 사진이 없습니다.', 'No photos for the selected type.', '選択した種類の写真がありません。', '所选类型没有照片。', '所選類型沒有照片。',
 'No hay fotos del tipo seleccionado.', 'Aucune photo pour le type sélectionné.', 'Keine Fotos für den ausgewählten Typ.', 'Nenhuma foto para o tipo selecionado.',
 'Không có ảnh cho loại đã chọn.', 'ไม่มีรูปภาพสำหรับประเภทที่เลือก', 'Tidak ada foto untuk jenis yang dipilih.', 'لا توجد صور للنوع المحدد.',
 now(), now()),

-- Gallery detail meta
(gen_random_uuid()::text, 'guardian.gallery.title', 'guardian', true,
 'Gallery', 'Gallery', 'ギャラリー', '相册', '相簿',
 'Galería', 'Galerie', 'Galerie', 'Galeria',
 'Thư viện', 'แกลเลอรี', 'Galeri', 'معرض',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.photo_count', 'guardian', true,
 '사진', 'Photos', '写真', '照片', '照片',
 'Fotos', 'Photos', 'Fotos', 'Fotos',
 'Ảnh', 'รูปภาพ', 'Foto', 'صور',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.video_count', 'guardian', true,
 '영상', 'Videos', '動画', '视频', '影片',
 'Videos', 'Vidéos', 'Videos', 'Vídeos',
 'Video', 'วิดีโอ', 'Video', 'فيديو',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.last_update', 'guardian', true,
 '최근 업데이트', 'Last update', '最終更新', '最近更新', '最近更新',
 'Última actualización', 'Dernière mise à jour', 'Letztes Update', 'Última atualização',
 'Cập nhật cuối', 'อัปเดตล่าสุด', 'Pembaruan terakhir', 'آخر تحديث',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.upload_type', 'guardian', true,
 '업로드 유형', 'Upload type', 'アップロード種類', '上传类型', '上傳類型',
 'Tipo de carga', 'Type de téléchargement', 'Upload-Typ', 'Tipo de upload',
 'Loại tải lên', 'ประเภทอัปโหลด', 'Jenis unggahan', 'نوع الرفع',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.upload_date', 'guardian', true,
 '업로드 날짜', 'Upload date', 'アップロード日', '上传日期', '上傳日期',
 'Fecha de carga', 'Date de téléchargement', 'Upload-Datum', 'Data de upload',
 'Ngày tải lên', 'วันที่อัปโหลด', 'Tanggal unggahan', 'تاريخ الرفع',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.uploader', 'guardian', true,
 '업로드자', 'Uploader', 'アップロード者', '上传者', '上傳者',
 'Cargado por', 'Téléchargeur', 'Hochgeladen von', 'Enviado por',
 'Người tải lên', 'ผู้อัปโหลด', 'Pengunggah', 'الرافع',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.visibility', 'guardian', true,
 '공개 범위', 'Visibility', '公開範囲', '公开范围', '公開範圍',
 'Visibilidad', 'Visibilité', 'Sichtbarkeit', 'Visibilidade',
 'Phạm vi', 'ขอบเขตการมองเห็น', 'Visibilitas', 'الرؤية',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.booking_status', 'guardian', true,
 '예약 상태', 'Booking status', '予約状態', '预约状态', '預約狀態',
 'Estado de reserva', 'Statut de réservation', 'Buchungsstatus', 'Status da reserva',
 'Trạng thái đặt lịch', 'สถานะการจอง', 'Status pemesanan', 'حالة الحجز',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.no_booking', 'guardian', true,
 '예약 정보 없음', 'No booking info', '予約情報なし', '无预约信息', '無預約資訊',
 'Sin información de reserva', 'Pas d''info de réservation', 'Keine Buchungsinformationen', 'Sem informação de reserva',
 'Không có thông tin đặt lịch', 'ไม่มีข้อมูลการจอง', 'Tidak ada info pemesanan', 'لا توجد معلومات حجز',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.current_profile', 'guardian', true,
 '현재 프로필', 'Current profile', '現在のプロフィール', '当前资料', '目前個人資料',
 'Perfil actual', 'Profil actuel', 'Aktuelles Profil', 'Perfil atual',
 'Hồ sơ hiện tại', 'โปรไฟล์ปัจจุบัน', 'Profil saat ini', 'الملف الشخصي الحالي',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.view_original', 'guardian', true,
 '원본 피드 보기', 'View original feed', '元のフィードを見る', '查看原始动态', '查看原始動態',
 'Ver feed original', 'Voir le flux original', 'Original-Feed anzeigen', 'Ver feed original',
 'Xem bài gốc', 'ดูฟีดต้นฉบับ', 'Lihat umpan asli', 'عرض التغذية الأصلية',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.confirm_delete', 'guardian', true,
 '이 미디어를 삭제할까요?', 'Delete this media?', 'このメディアを削除しますか？', '删除此媒体？', '刪除此媒體？',
 '¿Eliminar este medio?', 'Supprimer ce média ?', 'Dieses Medium löschen?', 'Excluir esta mídia?',
 'Xóa phương tiện này?', 'ลบสื่อนี้?', 'Hapus media ini?', 'حذف هذا الوسائط؟',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.delete_failed', 'guardian', true,
 '삭제에 실패했습니다.', 'Failed to delete.', '削除に失敗しました。', '删除失败。', '刪除失敗。',
 'Error al eliminar.', 'Échec de la suppression.', 'Löschen fehlgeschlagen.', 'Falha ao excluir.',
 'Xóa thất bại.', 'ลบไม่สำเร็จ', 'Gagal menghapus.', 'فشل الحذف.',
 now(), now())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = now();


-- --------------------------------------------------------------------------
-- Source: 058_provider_approval_i18n.sql
-- --------------------------------------------------------------------------
-- 058_provider_approval_i18n.sql
-- Provider approval status UI + profile edit i18n keys

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active)
VALUES
-- Approval status
(gen_random_uuid()::text, 'admin.provider.approval.pending_title', 'supplier', '승인 대기 중', 'Pending Approval', '承認待ち', '待审批', '待審批', 'Pendiente de aprobación', 'En attente d''approbation', 'Genehmigung ausstehend', 'Aprovação pendente', 'Đang chờ phê duyệt', 'รอการอนุมัติ', 'Menunggu persetujuan', 'في انتظار الموافقة', true),
(gen_random_uuid()::text, 'admin.provider.approval.pending_description', 'supplier', '관리자가 회원님의 업체 등록 신청을 검토 중입니다. 승인이 완료되면 모든 서비스를 이용하실 수 있습니다.', 'Your business registration is under review. Once approved, you will have full access to all services.', '管理者があなたの事業者登録申請を審査中です。承認が完了すると、すべてのサービスをご利用いただけます。', '管理员正在审核您的商家注册申请。审核通过后即可使用全部服务。', '管理員正在審核您的商家註冊申請。審核通過後即可使用全部服務。', 'Su registro de negocio está en revisión. Una vez aprobado, tendrá acceso completo a todos los servicios.', 'Votre inscription commerciale est en cours de vérification. Une fois approuvée, vous aurez accès à tous les services.', 'Ihre Geschäftsregistrierung wird überprüft. Nach der Genehmigung haben Sie vollen Zugriff auf alle Dienste.', 'Seu registro comercial está em análise. Após aprovação, você terá acesso completo a todos os serviços.', 'Đăng ký doanh nghiệp của bạn đang được xem xét. Sau khi được phê duyệt, bạn sẽ có quyền truy cập đầy đủ.', 'การลงทะเบียนธุรกิจของคุณอยู่ระหว่างการตรวจสอบ เมื่อได้รับอนุมัติแล้วจะสามารถใช้บริการทั้งหมดได้', 'Pendaftaran bisnis Anda sedang ditinjau. Setelah disetujui, Anda akan memiliki akses penuh.', 'تسجيل عملك قيد المراجعة. بمجرد الموافقة، ستتمكن من الوصول الكامل لجميع الخدمات.', true),
(gen_random_uuid()::text, 'admin.provider.approval.rejected_title', 'supplier', '승인 거절', 'Application Rejected', '申請却下', '申请被拒', '申請被拒', 'Solicitud rechazada', 'Demande rejetée', 'Antrag abgelehnt', 'Solicitação rejeitada', 'Đơn bị từ chối', 'คำขอถูกปฏิเสธ', 'Permohonan ditolak', 'تم رفض الطلب', true),
(gen_random_uuid()::text, 'admin.provider.approval.rejected_description', 'supplier', '업체 등록 신청이 거절되었습니다. 정보를 수정한 후 다시 신청해 주세요.', 'Your business registration was rejected. Please update your information and reapply.', '事業者登録申請が却下されました。情報を修正して再申請してください。', '商家注册申请已被拒绝，请修改信息后重新申请。', '商家註冊申請已被拒絕，請修改資訊後重新申請。', 'Su registro fue rechazado. Actualice su información y vuelva a solicitar.', 'Votre inscription a été rejetée. Veuillez mettre à jour vos informations et refaire une demande.', 'Ihre Registrierung wurde abgelehnt. Bitte aktualisieren Sie Ihre Informationen und beantragen Sie erneut.', 'Seu registro foi rejeitado. Atualize suas informações e reaplique.', 'Đăng ký của bạn đã bị từ chối. Vui lòng cập nhật thông tin và nộp lại.', 'การลงทะเบียนถูกปฏิเสธ กรุณาแก้ไขข้อมูลและสมัครใหม่', 'Pendaftaran Anda ditolak. Silakan perbarui informasi dan ajukan kembali.', 'تم رفض تسجيلك. يرجى تحديث معلوماتك وإعادة التقديم.', true),
(gen_random_uuid()::text, 'admin.provider.approval.approved_title', 'supplier', '승인 완료', 'Approved', '承認済み', '已批准', '已批准', 'Aprobado', 'Approuvé', 'Genehmigt', 'Aprovado', 'Đã phê duyệt', 'อนุมัติแล้ว', 'Disetujui', 'تمت الموافقة', true),

-- Profile section
(gen_random_uuid()::text, 'admin.provider.profile.title', 'supplier', '업체 프로필', 'Business Profile', '事業者プロフィール', '商家资料', '商家資料', 'Perfil de negocio', 'Profil commercial', 'Geschäftsprofil', 'Perfil comercial', 'Hồ sơ doanh nghiệp', 'โปรไฟล์ธุรกิจ', 'Profil bisnis', 'الملف التجاري', true),
(gen_random_uuid()::text, 'admin.provider.profile.business_category', 'supplier', '업종', 'Business Category', '業種', '行业', '行業', 'Categoría', 'Catégorie', 'Branche', 'Categoria', 'Ngành nghề', 'ประเภทธุรกิจ', 'Kategori bisnis', 'فئة العمل', true),
(gen_random_uuid()::text, 'admin.provider.profile.business_category_l2', 'supplier', '세부 업종', 'Sub Category', 'サブカテゴリ', '子类别', '子類別', 'Subcategoría', 'Sous-catégorie', 'Unterkategorie', 'Subcategoria', 'Phân loại phụ', 'หมวดหมู่ย่อย', 'Sub kategori', 'فئة فرعية', true),
(gen_random_uuid()::text, 'admin.provider.profile.business_category_l3', 'supplier', '상세 업종', 'Detail Category', '詳細カテゴリ', '详细类别', '詳細類別', 'Categoría detallada', 'Catégorie détaillée', 'Detailkategorie', 'Categoria detalhada', 'Chi tiết ngành', 'หมวดหมู่ละเอียด', 'Kategori detail', 'فئة تفصيلية', true),
(gen_random_uuid()::text, 'admin.provider.profile.pet_type', 'supplier', '반려동물 종류', 'Pet Type', 'ペット種類', '宠物类型', '寵物類型', 'Tipo de mascota', 'Type d''animal', 'Haustierart', 'Tipo de pet', 'Loại thú cưng', 'ประเภทสัตว์เลี้ยง', 'Jenis hewan', 'نوع الحيوان', true),
(gen_random_uuid()::text, 'admin.provider.profile.registration_no', 'supplier', '사업자등록번호', 'Business Registration No.', '事業者登録番号', '营业执照号', '營業執照號', 'Nº de registro', 'Nº d''enregistrement', 'Registrierungsnr.', 'Nº de registro', 'Mã đăng ký KD', 'เลขทะเบียนธุรกิจ', 'No. registrasi', 'رقم السجل التجاري', true),
(gen_random_uuid()::text, 'admin.provider.profile.operating_hours', 'supplier', '영업시간', 'Operating Hours', '営業時間', '营业时间', '營業時間', 'Horario', 'Heures d''ouverture', 'Öffnungszeiten', 'Horário', 'Giờ hoạt động', 'เวลาทำการ', 'Jam operasional', 'ساعات العمل', true),
(gen_random_uuid()::text, 'admin.provider.profile.certifications', 'supplier', '자격증/인증', 'Certifications', '資格/認証', '资质证书', '資質證書', 'Certificaciones', 'Certifications', 'Zertifizierungen', 'Certificações', 'Chứng chỉ', 'ใบรับรอง', 'Sertifikasi', 'الشهادات', true),
(gen_random_uuid()::text, 'admin.provider.profile.address', 'supplier', '주소', 'Address', '住所', '地址', '地址', 'Dirección', 'Adresse', 'Adresse', 'Endereço', 'Địa chỉ', 'ที่อยู่', 'Alamat', 'العنوان', true),
(gen_random_uuid()::text, 'admin.provider.profile.save', 'supplier', '저장', 'Save', '保存', '保存', '儲存', 'Guardar', 'Enregistrer', 'Speichern', 'Salvar', 'Lưu', 'บันทึก', 'Simpan', 'حفظ', true),
(gen_random_uuid()::text, 'admin.provider.profile.saved', 'supplier', '저장되었습니다', 'Saved successfully', '保存しました', '保存成功', '儲存成功', 'Guardado con éxito', 'Enregistré avec succès', 'Erfolgreich gespeichert', 'Salvo com sucesso', 'Đã lưu thành công', 'บันทึกสำเร็จ', 'Berhasil disimpan', 'تم الحفظ بنجاح', true),
(gen_random_uuid()::text, 'admin.provider.profile.save_failed', 'supplier', '저장에 실패했습니다', 'Failed to save', '保存に失敗しました', '保存失败', '儲存失敗', 'Error al guardar', 'Échec de l''enregistrement', 'Speichern fehlgeschlagen', 'Falha ao salvar', 'Lưu thất bại', 'บันทึกล้มเหลว', 'Gagal menyimpan', 'فشل الحفظ', true),
(gen_random_uuid()::text, 'admin.provider.approval.reapply', 'supplier', '다시 신청', 'Reapply', '再申請', '重新申请', '重新申請', 'Reaplicar', 'Refaire une demande', 'Erneut beantragen', 'Reaplicar', 'Nộp lại', 'สมัครใหม่', 'Ajukan ulang', 'إعادة التقديم', true)
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active;


-- --------------------------------------------------------------------------
-- Source: 059_members_page_i18n.sql
-- --------------------------------------------------------------------------
-- 059: i18n keys for Members Page enhancements
-- oauth provider labels, delete/deactivate, confirm dialogs, breakdown labels

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active)
VALUES
-- OAuth provider column & badges
(gen_random_uuid()::text, 'admin.members.col.auth_method', 'admin', '가입방식', 'Auth Method', '認証方式', '认证方式', '認證方式', 'Método', 'Méthode', 'Methode', 'Método', 'Phương thức', 'วิธีการ', 'Metode', 'الطريقة', true),
(gen_random_uuid()::text, 'admin.members.oauth.email', 'admin', '이메일', 'Email', 'メール', '邮箱', '電郵', 'Email', 'Email', 'E-Mail', 'Email', 'Email', 'อีเมล', 'Email', 'بريد', true),
(gen_random_uuid()::text, 'admin.members.oauth.google', 'admin', '구글', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'جوجل', true),
(gen_random_uuid()::text, 'admin.members.oauth.apple', 'admin', '애플', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'آبل', true),
(gen_random_uuid()::text, 'admin.members.oauth.kakao', 'admin', '카카오', 'Kakao', 'カカオ', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'كاكاو', true),

-- Delete / Deactivate
(gen_random_uuid()::text, 'admin.members.action.delete', 'admin', '삭제', 'Delete', '削除', '删除', '刪除', 'Eliminar', 'Supprimer', 'Löschen', 'Excluir', 'Xóa', 'ลบ', 'Hapus', 'حذف', true),
(gen_random_uuid()::text, 'admin.members.confirm.delete_title', 'admin', '회원 삭제', 'Delete Member', '会員削除', '删除会员', '刪除會員', 'Eliminar miembro', 'Supprimer membre', 'Mitglied löschen', 'Excluir membro', 'Xóa thành viên', 'ลบสมาชิก', 'Hapus anggota', 'حذف العضو', true),
(gen_random_uuid()::text, 'admin.members.confirm.delete_msg', 'admin', '이 회원을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.', 'Permanently delete this member? This action cannot be undone.', 'この会員を完全に削除しますか？この操作は元に戻せません。', '确定要永久删除此会员吗？此操作无法撤销。', '確定要永久刪除此會員嗎？此操作無法撤銷。', '¿Eliminar permanentemente este miembro?', 'Supprimer définitivement ce membre ?', 'Dieses Mitglied dauerhaft löschen?', 'Excluir permanentemente este membro?', 'Xóa vĩnh viễn thành viên này?', 'ลบสมาชิกนี้ถาวร?', 'Hapus anggota ini secara permanen?', 'هل تريد حذف هذا العضو نهائياً؟', true),
(gen_random_uuid()::text, 'admin.members.confirm.deactivate_msg', 'admin', '이 회원은 연결된 데이터(반려동물, 기록 등)가 있어 완전 삭제할 수 없습니다. 대신 비활성화 처리합니다.', 'This member has associated data (pets, records, etc.) and cannot be fully deleted. They will be deactivated instead.', 'この会員には関連データがあるため完全に削除できません。代わりに非活性化します。', '此会员有关联数据，无法完全删除。将改为停用。', '此會員有關聯資料，無法完全刪除。將改為停用。', 'Este miembro tiene datos asociados. Se desactivará en su lugar.', 'Ce membre a des données associées. Il sera désactivé.', 'Dieses Mitglied hat verknüpfte Daten. Es wird stattdessen deaktiviert.', 'Este membro tem dados associados. Será desativado.', 'Thành viên này có dữ liệu liên quan. Sẽ bị vô hiệu hóa.', 'สมาชิกนี้มีข้อมูลที่เกี่ยวข้อง จะถูกปิดใช้งาน', 'Anggota ini memiliki data terkait. Akan dinonaktifkan.', 'هذا العضو لديه بيانات مرتبطة. سيتم تعطيله بدلاً من ذلك.', true),
(gen_random_uuid()::text, 'admin.members.success.deleted', 'admin', '회원이 삭제되었습니다.', 'Member has been deleted.', '会員が削除されました。', '会员已删除。', '會員已刪除。', 'Miembro eliminado.', 'Membre supprimé.', 'Mitglied gelöscht.', 'Membro excluído.', 'Đã xóa thành viên.', 'ลบสมาชิกแล้ว', 'Anggota dihapus.', 'تم حذف العضو.', true),
(gen_random_uuid()::text, 'admin.members.success.deactivated', 'admin', '회원이 비활성화되었습니다.', 'Member has been deactivated.', '会員が非活性化されました。', '会员已停用。', '會員已停用。', 'Miembro desactivado.', 'Membre désactivé.', 'Mitglied deaktiviert.', 'Membro desativado.', 'Đã vô hiệu hóa thành viên.', 'ปิดใช้งานสมาชิกแล้ว', 'Anggota dinonaktifkan.', 'تم تعطيل العضو.', true),

-- Breakdown labels
(gen_random_uuid()::text, 'admin.members.summary.breakdown.email', 'admin', '이메일', 'Email', 'メール', '邮箱', '電郵', 'Email', 'Email', 'E-Mail', 'Email', 'Email', 'อีเมล', 'Email', 'بريد', true),
(gen_random_uuid()::text, 'admin.members.summary.breakdown.google', 'admin', '구글', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'جوجل', true),
(gen_random_uuid()::text, 'admin.members.summary.breakdown.apple', 'admin', '애플', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'آبل', true),
(gen_random_uuid()::text, 'admin.members.summary.breakdown.kakao', 'admin', '카카오', 'Kakao', 'カカオ', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'كاكاو', true),

-- Confirm dialog
(gen_random_uuid()::text, 'admin.common.confirm', 'admin', '확인', 'Confirm', '確認', '确认', '確認', 'Confirmar', 'Confirmer', 'Bestätigen', 'Confirmar', 'Xác nhận', 'ยืนยัน', 'Konfirmasi', 'تأكيد', true),

-- Status badge
(gen_random_uuid()::text, 'admin.members.status.inactive', 'admin', '비활성', 'Inactive', '非活性', '已停用', '已停用', 'Inactivo', 'Inactif', 'Inaktiv', 'Inativo', 'Không hoạt động', 'ไม่ใช้งาน', 'Nonaktif', 'غير نشط', true)

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang,
  ar = EXCLUDED.ar, is_active = true;


-- --------------------------------------------------------------------------
-- Source: 061_dashboard_i18n.sql
-- --------------------------------------------------------------------------
-- 061: Dashboard analytics i18n keys
-- Admin dashboard statistics labels for all 13 languages

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active)
VALUES
-- Filter
(gen_random_uuid()::text, 'admin.dashboard.filter.period', 'admin', '기간', 'Period', '期間', '期间', '期間', 'Período', 'Période', 'Zeitraum', 'Período', 'Khoảng thời gian', 'ช่วงเวลา', 'Periode', 'الفترة', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.today', 'admin', '오늘', 'Today', '今日', '今天', '今天', 'Hoy', 'Aujourd''hui', 'Heute', 'Hoje', 'Hôm nay', 'วันนี้', 'Hari ini', 'اليوم', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.7d', 'admin', '7일', '7 Days', '7日間', '7天', '7天', '7 días', '7 jours', '7 Tage', '7 dias', '7 ngày', '7 วัน', '7 hari', '7 أيام', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.30d', 'admin', '30일', '30 Days', '30日間', '30天', '30天', '30 días', '30 jours', '30 Tage', '30 dias', '30 ngày', '30 วัน', '30 hari', '30 يومًا', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.3m', 'admin', '3개월', '3 Months', '3ヶ月', '3个月', '3個月', '3 meses', '3 mois', '3 Monate', '3 meses', '3 tháng', '3 เดือน', '3 bulan', '3 أشهر', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.custom', 'admin', '직접입력', 'Custom', 'カスタム', '自定义', '自訂', 'Personalizado', 'Personnalisé', 'Benutzerdefiniert', 'Personalizado', 'Tùy chỉnh', 'กำหนดเอง', 'Kustom', 'مخصص', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.pet_type', 'admin', '펫 종류', 'Pet Type', 'ペット種類', '宠物类型', '寵物類型', 'Tipo de mascota', 'Type d''animal', 'Tierart', 'Tipo de pet', 'Loại thú cưng', 'ประเภทสัตว์เลี้ยง', 'Jenis hewan', 'نوع الحيوان', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.all', 'admin', '전체', 'All', 'すべて', '全部', '全部', 'Todos', 'Tous', 'Alle', 'Todos', 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.dog', 'admin', '개', 'Dog', '犬', '狗', '狗', 'Perro', 'Chien', 'Hund', 'Cachorro', 'Chó', 'สุนัข', 'Anjing', 'كلب', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.cat', 'admin', '고양이', 'Cat', '猫', '猫', '貓', 'Gato', 'Chat', 'Katze', 'Gato', 'Mèo', 'แมว', 'Kucing', 'قطة', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.other', 'admin', '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่น ๆ', 'Lainnya', 'أخرى', true),

-- Feeding stats
(gen_random_uuid()::text, 'admin.dashboard.feeding.title', 'admin', '급여 통계', 'Feeding Stats', '給餌統計', '喂食统计', '餵食統計', 'Estadísticas de alimentación', 'Statistiques d''alimentation', 'Fütterungsstatistik', 'Estatísticas de alimentação', 'Thống kê cho ăn', 'สถิติการให้อาหาร', 'Statistik pemberian makan', 'إحصائيات التغذية', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.top5_feed', 'admin', '사료 TOP 5', 'Top 5 Feeds', 'フードTOP 5', '饲料TOP 5', '飼料TOP 5', 'Top 5 alimentos', 'Top 5 aliments', 'Top 5 Futter', 'Top 5 rações', 'Top 5 thức ăn', 'อาหาร 5 อันดับ', 'Top 5 pakan', 'أفضل 5 أعلاف', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.manufacturer_ratio', 'admin', '제조사별 사용 비율', 'Manufacturer Ratio', 'メーカー別比率', '厂商比例', '廠商比例', 'Ratio por fabricante', 'Ratio par fabricant', 'Herstelleranteil', 'Proporção por fabricante', 'Tỷ lệ nhà sản xuất', 'สัดส่วนผู้ผลิต', 'Rasio produsen', 'نسبة الشركة المصنعة', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.type_distribution', 'admin', '사료유형별 분포', 'Feed Type Distribution', 'フードタイプ分布', '饲料类型分布', '飼料類型分布', 'Distribución por tipo', 'Distribution par type', 'Futtertyp-Verteilung', 'Distribuição por tipo', 'Phân bố loại thức ăn', 'การกระจายประเภทอาหาร', 'Distribusi jenis pakan', 'توزيع نوع العلف', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.supplement_category', 'admin', '영양제 카테고리별 빈도', 'Supplement Category Freq.', 'サプリカテゴリ頻度', '营养品分类频率', '營養品分類頻率', 'Frecuencia por categoría de suplemento', 'Fréquence par catégorie de supplément', 'Supplement-Kategorie Häufigkeit', 'Frequência por categoria de suplemento', 'Tần suất danh mục thực phẩm bổ sung', 'ความถี่หมวดอาหารเสริม', 'Frekuensi kategori suplemen', 'تردد فئة المكملات', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.prescribed_ratio', 'admin', '처방 영양제 비율', 'Prescribed Supplement Ratio', '処方サプリ比率', '处方营养品比例', '處方營養品比例', 'Ratio de suplemento prescrito', 'Ratio supplément prescrit', 'Verschriebener Anteil', 'Proporção prescrita', 'Tỷ lệ kê đơn', 'สัดส่วนยาตามใบสั่ง', 'Rasio resep', 'نسبة المكملات الموصوفة', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.daily_calories', 'admin', '일평균 칼로리', 'Avg Daily Calories', '日平均カロリー', '日均卡路里', '日均卡路里', 'Calorías diarias promedio', 'Calories moy. quotidiennes', 'Ø Tägliche Kalorien', 'Calorias médias diárias', 'Calo trung bình hàng ngày', 'แคลอรี่เฉลี่ยต่อวัน', 'Kalori harian rata-rata', 'السعرات الحرارية اليومية', true),

-- Exercise stats
(gen_random_uuid()::text, 'admin.dashboard.exercise.title', 'admin', '운동 통계', 'Exercise Stats', '運動統計', '运动统计', '運動統計', 'Estadísticas de ejercicio', 'Statistiques d''exercice', 'Bewegungsstatistik', 'Estatísticas de exercício', 'Thống kê vận động', 'สถิติการออกกำลังกาย', 'Statistik olahraga', 'إحصائيات التمارين', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.type_count', 'admin', '운동 종류별 기록 건수', 'Records by Exercise Type', '種類別記録件数', '各类运动记录数', '各類運動記錄數', 'Registros por tipo', 'Enregistrements par type', 'Einträge pro Typ', 'Registros por tipo', 'Số bản ghi theo loại', 'บันทึกตามประเภท', 'Catatan per jenis', 'السجلات حسب النوع', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.avg_duration', 'admin', '평균 운동 시간', 'Avg Duration', '平均運動時間', '平均运动时间', '平均運動時間', 'Duración promedio', 'Durée moyenne', 'Ø Dauer', 'Duração média', 'Thời gian trung bình', 'ระยะเวลาเฉลี่ย', 'Durasi rata-rata', 'المدة المتوسطة', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.intensity_dist', 'admin', '강도 분포', 'Intensity Distribution', '強度分布', '强度分布', '強度分布', 'Distribución de intensidad', 'Distribution d''intensité', 'Intensitätsverteilung', 'Distribuição de intensidade', 'Phân bố cường độ', 'การกระจายความเข้มข้น', 'Distribusi intensitas', 'توزيع الشدة', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.location_dist', 'admin', '장소 분포', 'Location Distribution', '場所分布', '场所分布', '場所分布', 'Distribución por lugar', 'Distribution par lieu', 'Ortsverteilung', 'Distribuição por local', 'Phân bố địa điểm', 'การกระจายสถานที่', 'Distribusi lokasi', 'توزيع المواقع', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.monthly_trend', 'admin', '월별 운동 기록 추이', 'Monthly Exercise Trend', '月別運動推移', '月度运动趋势', '月度運動趨勢', 'Tendencia mensual', 'Tendance mensuelle', 'Monatlicher Trend', 'Tendência mensal', 'Xu hướng hàng tháng', 'แนวโน้มรายเดือน', 'Tren bulanan', 'الاتجاه الشهري', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.pet_type_compare', 'admin', '펫 종별 운동 패턴 비교', 'Exercise Pattern by Pet Type', 'ペット種別運動パターン', '宠物种类运动模式', '寵物種類運動模式', 'Patrón por tipo de mascota', 'Modèle par type d''animal', 'Muster nach Tierart', 'Padrão por tipo de pet', 'Mẫu theo loại thú cưng', 'รูปแบบตามสัตว์เลี้ยง', 'Pola per jenis hewan', 'نمط حسب نوع الحيوان', true),

-- Health stats
(gen_random_uuid()::text, 'admin.dashboard.health.title', 'admin', '건강 수치', 'Health Metrics', '健康指標', '健康指标', '健康指標', 'Métricas de salud', 'Métriques de santé', 'Gesundheitsmetriken', 'Métricas de saúde', 'Chỉ số sức khỏe', 'ตัวชี้วัดสุขภาพ', 'Metrik kesehatan', 'مقاييس الصحة', true),
(gen_random_uuid()::text, 'admin.dashboard.health.weight_trend', 'admin', '전체 평균 체중 추이', 'Avg Weight Trend', '平均体重推移', '平均体重趋势', '平均體重趨勢', 'Tendencia de peso promedio', 'Tendance de poids moyen', 'Ø Gewichtstrend', 'Tendência de peso médio', 'Xu hướng cân nặng trung bình', 'แนวโน้มน้ำหนักเฉลี่ย', 'Tren berat rata-rata', 'اتجاه الوزن المتوسط', true),
(gen_random_uuid()::text, 'admin.dashboard.health.weight_by_size', 'admin', '펫 종/사이즈별 평균 체중', 'Weight by Size', 'サイズ別平均体重', '按体型平均体重', '按體型平均體重', 'Peso por tamaño', 'Poids par taille', 'Gewicht nach Größe', 'Peso por tamanho', 'Cân nặng theo kích cỡ', 'น้ำหนักตามขนาด', 'Berat per ukuran', 'الوزن حسب الحجم', true),
(gen_random_uuid()::text, 'admin.dashboard.health.top5_measurements', 'admin', '건강 수치 기록 빈도 TOP 5', 'Top 5 Measurements', '健康指標記録頻度TOP 5', '健康指标记录频率TOP 5', '健康指標記錄頻率TOP 5', 'Top 5 mediciones', 'Top 5 mesures', 'Top 5 Messungen', 'Top 5 medições', 'Top 5 phép đo', '5 อันดับการวัด', 'Top 5 pengukuran', 'أفضل 5 قياسات', true),
(gen_random_uuid()::text, 'admin.dashboard.health.weight_change_dist', 'admin', '체중 변화 분포', 'Weight Change Distribution', '体重変化分布', '体重变化分布', '體重變化分布', 'Distribución de cambio de peso', 'Distribution de changement de poids', 'Gewichtsänderungs-Verteilung', 'Distribuição de mudança de peso', 'Phân bố thay đổi cân nặng', 'การกระจายการเปลี่ยนแปลงน้ำหนัก', 'Distribusi perubahan berat', 'توزيع تغير الوزن', true),

-- Member stats
(gen_random_uuid()::text, 'admin.dashboard.member.title', 'admin', '회원 활동', 'Member Activity', '会員活動', '会员活动', '會員活動', 'Actividad de miembros', 'Activité des membres', 'Mitgliederaktivität', 'Atividade dos membros', 'Hoạt động thành viên', 'กิจกรรมสมาชิก', 'Aktivitas anggota', 'نشاط الأعضاء', true),
(gen_random_uuid()::text, 'admin.dashboard.member.total_users', 'admin', '전체 회원수', 'Total Users', '総会員数', '总会员数', '總會員數', 'Usuarios totales', 'Utilisateurs totaux', 'Gesamtbenutzer', 'Total de usuários', 'Tổng người dùng', 'ผู้ใช้ทั้งหมด', 'Total pengguna', 'إجمالي المستخدمين', true),
(gen_random_uuid()::text, 'admin.dashboard.member.signup_trend', 'admin', '신규 가입 추이', 'Signup Trend', '新規登録推移', '新注册趋势', '新註冊趨勢', 'Tendencia de registro', 'Tendance d''inscription', 'Registrierungstrend', 'Tendência de cadastro', 'Xu hướng đăng ký', 'แนวโน้มการลงทะเบียน', 'Tren pendaftaran', 'اتجاه التسجيل', true),
(gen_random_uuid()::text, 'admin.dashboard.member.active_guardians', 'admin', '활성 가디언 수', 'Active Guardians', 'アクティブガーディアン', '活跃监护人', '活躍監護人', 'Guardianes activos', 'Gardiens actifs', 'Aktive Guardians', 'Guardiões ativos', 'Người giám hộ hoạt động', 'ผู้ดูแลที่ใช้งาน', 'Guardian aktif', 'أولياء الأمور النشطون', true),
(gen_random_uuid()::text, 'admin.dashboard.member.feature_usage', 'admin', '기능별 사용률', 'Feature Usage', '機能別使用率', '功能使用率', '功能使用率', 'Uso por función', 'Utilisation par fonction', 'Funktionsnutzung', 'Uso por funcionalidade', 'Sử dụng tính năng', 'การใช้งานฟีเจอร์', 'Penggunaan fitur', 'استخدام الميزات', true),
(gen_random_uuid()::text, 'admin.dashboard.member.pet_type_dist', 'admin', '반려동물 종별 분포', 'Pet Type Distribution', 'ペット種類分布', '宠物种类分布', '寵物種類分布', 'Distribución por tipo de mascota', 'Distribution par type d''animal', 'Verteilung nach Tierart', 'Distribuição por tipo de pet', 'Phân bố loại thú cưng', 'การกระจายประเภทสัตว์เลี้ยง', 'Distribusi jenis hewan', 'توزيع نوع الحيوان', true),
(gen_random_uuid()::text, 'admin.dashboard.member.top10_breeds', 'admin', '품종 TOP 10', 'Top 10 Breeds', '犬種TOP 10', '品种TOP 10', '品種TOP 10', 'Top 10 razas', 'Top 10 races', 'Top 10 Rassen', 'Top 10 raças', 'Top 10 giống', '10 อันดับสายพันธุ์', 'Top 10 ras', 'أفضل 10 سلالات', true),
(gen_random_uuid()::text, 'admin.dashboard.member.oauth_dist', 'admin', '가입방식별 비율', 'Signup Method Ratio', '登録方法別比率', '注册方式比例', '註冊方式比例', 'Ratio por método de registro', 'Ratio par méthode d''inscription', 'Registrierungsmethode', 'Proporção por método', 'Tỷ lệ phương thức đăng ký', 'สัดส่วนวิธีการลงทะเบียน', 'Rasio metode pendaftaran', 'نسبة طريقة التسجيل', true),

-- Common
(gen_random_uuid()::text, 'admin.dashboard.no_data', 'admin', '데이터 없음', 'No Data', 'データなし', '暂无数据', '暫無資料', 'Sin datos', 'Aucune donnée', 'Keine Daten', 'Sem dados', 'Không có dữ liệu', 'ไม่มีข้อมูล', 'Tidak ada data', 'لا توجد بيانات', true),
(gen_random_uuid()::text, 'admin.dashboard.weight_increase', 'admin', '증가', 'Increase', '増加', '增加', '增加', 'Aumento', 'Augmentation', 'Zunahme', 'Aumento', 'Tăng', 'เพิ่ม', 'Naik', 'زيادة', true),
(gen_random_uuid()::text, 'admin.dashboard.weight_decrease', 'admin', '감소', 'Decrease', '減少', '减少', '減少', 'Disminución', 'Diminution', 'Abnahme', 'Diminuição', 'Giảm', 'ลด', 'Turun', 'انخفاض', true),
(gen_random_uuid()::text, 'admin.dashboard.weight_maintain', 'admin', '유지', 'Maintain', '維持', '维持', '維持', 'Mantener', 'Maintien', 'Halten', 'Manter', 'Duy trì', 'คงที่', 'Tetap', 'ثبات', true),
(gen_random_uuid()::text, 'admin.dashboard.kcal', 'admin', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', true),
(gen_random_uuid()::text, 'admin.dashboard.minutes', 'admin', '분', 'min', '分', '分钟', '分鐘', 'min', 'min', 'Min', 'min', 'phút', 'นาที', 'menit', 'دقيقة', true),
(gen_random_uuid()::text, 'admin.dashboard.count_unit', 'admin', '건', 'records', '件', '条', '筆', 'registros', 'enregistrements', 'Einträge', 'registros', 'bản ghi', 'รายการ', 'catatan', 'سجلات', true),
(gen_random_uuid()::text, 'admin.dashboard.people', 'admin', '명', 'people', '人', '人', '人', 'personas', 'personnes', 'Personen', 'pessoas', 'người', 'คน', 'orang', 'أشخاص', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding_feature', 'admin', '급여', 'Feeding', '給餌', '喂食', '餵食', 'Alimentación', 'Alimentation', 'Fütterung', 'Alimentação', 'Cho ăn', 'ให้อาหาร', 'Pemberian makan', 'تغذية', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise_feature', 'admin', '운동', 'Exercise', '運動', '运动', '運動', 'Ejercicio', 'Exercice', 'Bewegung', 'Exercício', 'Vận động', 'ออกกำลังกาย', 'Olahraga', 'تمارين', true),
(gen_random_uuid()::text, 'admin.dashboard.health_feature', 'admin', '건강', 'Health', '健康', '健康', '健康', 'Salud', 'Santé', 'Gesundheit', 'Saúde', 'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'صحة', true)
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang,
  ar = EXCLUDED.ar, is_active = true;


-- --------------------------------------------------------------------------
-- Source: 063_pet_report_i18n.sql
-- --------------------------------------------------------------------------
-- 063: i18n keys for Pet Report tab
-- Depends on: 062_exercise_companion_pets.sql

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  -- Tab label
  (gen_random_uuid()::text, 'guardian.tab.report', 'guardian', true,
   '리포트', 'Report', 'レポート', '报告', '報告',
   'Informe', 'Rapport', 'Bericht', 'Relatório',
   'Báo cáo', 'รายงาน', 'Laporan', 'تقرير',
   NOW(), NOW()),

  -- Period filter
  (gen_random_uuid()::text, 'guardian.report.period.today', 'guardian', true,
   '오늘', 'Today', '今日', '今天', '今天',
   'Hoy', 'Aujourd''hui', 'Heute', 'Hoje',
   'Hôm nay', 'วันนี้', 'Hari ini', 'اليوم',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.period.7d', 'guardian', true,
   '7일', '7 Days', '7日間', '7天', '7天',
   '7 días', '7 jours', '7 Tage', '7 dias',
   '7 ngày', '7 วัน', '7 hari', '7 أيام',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.period.30d', 'guardian', true,
   '30일', '30 Days', '30日間', '30天', '30天',
   '30 días', '30 jours', '30 Tage', '30 dias',
   '30 ngày', '30 วัน', '30 hari', '30 يومًا',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.period.3m', 'guardian', true,
   '3개월', '3 Months', '3ヶ月', '3个月', '3個月',
   '3 meses', '3 mois', '3 Monate', '3 meses',
   '3 tháng', '3 เดือน', '3 bulan', '3 أشهر',
   NOW(), NOW()),

  -- Summary text
  (gen_random_uuid()::text, 'guardian.report.summary_text', 'guardian', true,
   '{name}의 {period} 리포트', '{name}''s {period} Report', '{name}の{period}レポート', '{name}的{period}报告', '{name}的{period}報告',
   'Informe de {period} de {name}', 'Rapport {period} de {name}', '{name}s {period}-Bericht', 'Relatório de {period} de {name}',
   'Báo cáo {period} của {name}', 'รายงาน {period} ของ {name}', 'Laporan {period} {name}', 'تقرير {period} لـ {name}',
   NOW(), NOW()),

  -- Feeding section
  (gen_random_uuid()::text, 'guardian.report.feeding.title', 'guardian', true,
   '급여 리포트', 'Feeding Report', '給餌レポート', '喂食报告', '餵食報告',
   'Informe de alimentación', 'Rapport d''alimentation', 'Fütterungsbericht', 'Relatório de alimentação',
   'Báo cáo cho ăn', 'รายงานการให้อาหาร', 'Laporan pemberian makan', 'تقرير التغذية',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.calorie_gauge', 'guardian', true,
   '오늘의 칼로리', 'Today''s Calories', '今日のカロリー', '今日卡路里', '今日卡路里',
   'Calorías de hoy', 'Calories du jour', 'Kalorien heute', 'Calorias de hoje',
   'Calo hôm nay', 'แคลอรี่วันนี้', 'Kalori hari ini', 'سعرات اليوم',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.weekly_trend', 'guardian', true,
   '주간 칼로리 추이', 'Weekly Calorie Trend', '週間カロリー推移', '每周卡路里趋势', '每週卡路里趨勢',
   'Tendencia calórica semanal', 'Tendance calorique hebdo', 'Wöchentlicher Kalorientrend', 'Tendência calórica semanal',
   'Xu hướng calo tuần', 'แนวโน้มแคลอรี่รายสัปดาห์', 'Tren kalori mingguan', 'اتجاه السعرات الأسبوعي',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.nutrient_ratio', 'guardian', true,
   '영양소 비율', 'Nutrient Ratio', '栄養素比率', '营养比例', '營養比例',
   'Proporción de nutrientes', 'Ratio nutritionnel', 'Nährstoffverhältnis', 'Proporção de nutrientes',
   'Tỷ lệ dinh dưỡng', 'สัดส่วนสารอาหาร', 'Rasio nutrisi', 'نسبة العناصر الغذائية',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.top_feeds', 'guardian', true,
   '자주 먹는 사료 TOP 3', 'Top 3 Feeds', 'よく食べるフードTOP3', '最常吃的饲料TOP3', '最常吃的飼料TOP3',
   'Top 3 alimentos', 'Top 3 aliments', 'Top 3 Futter', 'Top 3 rações',
   'Top 3 thức ăn', 'อาหาร 3 อันดับแรก', 'Top 3 pakan', 'أفضل 3 أعلاف',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.supplements', 'guardian', true,
   '영양제 현황', 'Supplements', 'サプリメント', '营养补充剂', '營養補充劑',
   'Suplementos', 'Suppléments', 'Nahrungsergänzungen', 'Suplementos',
   'Thực phẩm bổ sung', 'อาหารเสริม', 'Suplemen', 'المكملات',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.prescribed', 'guardian', true,
   '처방', 'Prescribed', '処方', '处方', '處方',
   'Prescrito', 'Prescrit', 'Verschrieben', 'Prescrito',
   'Kê đơn', 'สั่งจ่ายยา', 'Resep', 'موصوف',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.target', 'guardian', true,
   '목표', 'Target', '目標', '目标', '目標',
   'Objetivo', 'Objectif', 'Ziel', 'Meta',
   'Mục tiêu', 'เป้าหมาย', 'Target', 'الهدف',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.actual', 'guardian', true,
   '실제', 'Actual', '実際', '实际', '實際',
   'Real', 'Réel', 'Tatsächlich', 'Real',
   'Thực tế', 'จริง', 'Aktual', 'الفعلي',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.compliance', 'guardian', true,
   '달성률', 'Compliance', '達成率', '达成率', '達成率',
   'Cumplimiento', 'Conformité', 'Einhaltung', 'Conformidade',
   'Tuân thủ', 'การปฏิบัติตาม', 'Kepatuhan', 'الالتزام',
   NOW(), NOW()),

  -- Exercise section
  (gen_random_uuid()::text, 'guardian.report.exercise.title', 'guardian', true,
   '운동 리포트', 'Exercise Report', '運動レポート', '运动报告', '運動報告',
   'Informe de ejercicio', 'Rapport d''exercice', 'Bewegungsbericht', 'Relatório de exercício',
   'Báo cáo vận động', 'รายงานการออกกำลังกาย', 'Laporan olahraga', 'تقرير التمارين',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.week_summary', 'guardian', true,
   '이번 주 요약', 'This Week', '今週のまとめ', '本周总结', '本週總結',
   'Esta semana', 'Cette semaine', 'Diese Woche', 'Esta semana',
   'Tuần này', 'สัปดาห์นี้', 'Minggu ini', 'هذا الأسبوع',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.calendar', 'guardian', true,
   '운동 캘린더', 'Exercise Calendar', '運動カレンダー', '运动日历', '運動日曆',
   'Calendario de ejercicio', 'Calendrier d''exercice', 'Bewegungskalender', 'Calendário de exercício',
   'Lịch tập luyện', 'ปฏิทินออกกำลังกาย', 'Kalender olahraga', 'تقويم التمارين',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.type_ratio', 'guardian', true,
   '운동 종류 비율', 'Exercise Type Ratio', '運動種類の割合', '运动类型比例', '運動類型比例',
   'Proporción de tipos', 'Ratio par type', 'Verteilung nach Typ', 'Proporção por tipo',
   'Tỷ lệ loại', 'สัดส่วนประเภท', 'Rasio jenis', 'نسبة الأنواع',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.monthly_trend', 'guardian', true,
   '월별 운동량 추이', 'Monthly Trend', '月別運動量推移', '月度趋势', '月度趨勢',
   'Tendencia mensual', 'Tendance mensuelle', 'Monatlicher Trend', 'Tendência mensal',
   'Xu hướng hàng tháng', 'แนวโน้มรายเดือน', 'Tren bulanan', 'الاتجاه الشهري',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.recent', 'guardian', true,
   '최근 기록', 'Recent Records', '最近の記録', '最近记录', '最近記錄',
   'Registros recientes', 'Enregistrements récents', 'Letzte Einträge', 'Registros recentes',
   'Ghi chép gần đây', 'บันทึกล่าสุด', 'Catatan terbaru', 'السجلات الأخيرة',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.count', 'guardian', true,
   '횟수', 'Count', '回数', '次数', '次數',
   'Veces', 'Fois', 'Mal', 'Vezes',
   'Lần', 'ครั้ง', 'Kali', 'مرات',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.duration', 'guardian', true,
   '총 시간', 'Total Time', '合計時間', '总时间', '總時間',
   'Tiempo total', 'Temps total', 'Gesamtzeit', 'Tempo total',
   'Tổng thời gian', 'เวลารวม', 'Total waktu', 'الوقت الإجمالي',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.avg_intensity', 'guardian', true,
   '평균 강도', 'Avg Intensity', '平均強度', '平均强度', '平均強度',
   'Intensidad promedio', 'Intensité moy.', 'Durchschn. Intensität', 'Intensidade média',
   'Cường độ TB', 'ความเข้มเฉลี่ย', 'Rata-rata intensitas', 'متوسط الشدة',
   NOW(), NOW()),

  -- Health section
  (gen_random_uuid()::text, 'guardian.report.health.title', 'guardian', true,
   '건강 리포트', 'Health Report', '健康レポート', '健康报告', '健康報告',
   'Informe de salud', 'Rapport de santé', 'Gesundheitsbericht', 'Relatório de saúde',
   'Báo cáo sức khỏe', 'รายงานสุขภาพ', 'Laporan kesehatan', 'تقرير الصحة',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.weight_trend', 'guardian', true,
   '체중 추이', 'Weight Trend', '体重推移', '体重趋势', '體重趨勢',
   'Tendencia de peso', 'Tendance de poids', 'Gewichtstrend', 'Tendência de peso',
   'Xu hướng cân nặng', 'แนวโน้มน้ำหนัก', 'Tren berat badan', 'اتجاه الوزن',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.current_weight', 'guardian', true,
   '현재 체중', 'Current Weight', '現在の体重', '当前体重', '目前體重',
   'Peso actual', 'Poids actuel', 'Aktuelles Gewicht', 'Peso atual',
   'Cân nặng hiện tại', 'น้ำหนักปัจจุบัน', 'Berat saat ini', 'الوزن الحالي',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.measurement_trends', 'guardian', true,
   '건강 수치 추이', 'Measurement Trends', '測定値の推移', '测量趋势', '測量趨勢',
   'Tendencias de medición', 'Tendances de mesure', 'Messtrends', 'Tendências de medição',
   'Xu hướng đo lường', 'แนวโน้มการวัด', 'Tren pengukuran', 'اتجاهات القياس',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.recent', 'guardian', true,
   '최근 건강 기록', 'Recent Health Records', '最近の健康記録', '最近健康记录', '最近健康記錄',
   'Registros de salud recientes', 'Enregistrements de santé récents', 'Letzte Gesundheitseinträge', 'Registros de saúde recentes',
   'Hồ sơ sức khỏe gần đây', 'บันทึกสุขภาพล่าสุด', 'Catatan kesehatan terbaru', 'سجلات الصحة الأخيرة',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.weight_delta', 'guardian', true,
   '체중 변화', 'Weight Change', '体重変化', '体重变化', '體重變化',
   'Cambio de peso', 'Changement de poids', 'Gewichtsänderung', 'Mudança de peso',
   'Thay đổi cân nặng', 'การเปลี่ยนแปลงน้ำหนัก', 'Perubahan berat', 'تغيير الوزن',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.increase', 'guardian', true,
   '증가', 'Increase', '増加', '增加', '增加',
   'Aumento', 'Augmentation', 'Zunahme', 'Aumento',
   'Tăng', 'เพิ่มขึ้น', 'Naik', 'زيادة',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.decrease', 'guardian', true,
   '감소', 'Decrease', '減少', '减少', '減少',
   'Disminución', 'Diminution', 'Abnahme', 'Diminuição',
   'Giảm', 'ลดลง', 'Turun', 'انخفاض',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.maintain', 'guardian', true,
   '유지', 'Maintained', '維持', '维持', '維持',
   'Mantenido', 'Maintenu', 'Gehalten', 'Mantido',
   'Duy trì', 'รักษา', 'Stabil', 'مُحافظ عليه',
   NOW(), NOW()),

  -- Weekly summary
  (gen_random_uuid()::text, 'guardian.report.weekly.title', 'guardian', true,
   '종합 주간 리포트', 'Weekly Summary', '週間サマリー', '每周总结', '每週總結',
   'Resumen semanal', 'Résumé hebdomadaire', 'Wochenzusammenfassung', 'Resumo semanal',
   'Tóm tắt tuần', 'สรุปรายสัปดาห์', 'Ringkasan mingguan', 'ملخص أسبوعي',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.weekly.feed_card', 'guardian', true,
   '급여', 'Feeding', '給餌', '喂食', '餵食',
   'Alimentación', 'Alimentation', 'Fütterung', 'Alimentação',
   'Cho ăn', 'อาหาร', 'Pakan', 'التغذية',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.weekly.exercise_card', 'guardian', true,
   '운동', 'Exercise', '運動', '运动', '運動',
   'Ejercicio', 'Exercice', 'Bewegung', 'Exercício',
   'Vận động', 'ออกกำลังกาย', 'Olahraga', 'التمارين',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.weekly.health_card', 'guardian', true,
   '건강', 'Health', '健康', '健康', '健康',
   'Salud', 'Santé', 'Gesundheit', 'Saúde',
   'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'الصحة',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.weekly.vs_prev', 'guardian', true,
   '이전 주 대비', 'vs Previous Week', '前週比', '与上周相比', '與上週相比',
   'vs semana anterior', 'vs semaine précédente', 'vs Vorwoche', 'vs semana anterior',
   'so với tuần trước', 'เทียบกับสัปดาห์ก่อน', 'vs minggu lalu', 'مقارنة بالأسبوع السابق',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.weekly.alerts', 'guardian', true,
   '관리 알림', 'Care Alerts', 'ケアアラート', '管理提醒', '管理提醒',
   'Alertas de cuidado', 'Alertes de soins', 'Pflegehinweise', 'Alertas de cuidado',
   'Cảnh báo chăm sóc', 'การแจ้งเตือนการดูแล', 'Peringatan perawatan', 'تنبيهات الرعاية',
   NOW(), NOW()),

  -- Alerts
  (gen_random_uuid()::text, 'guardian.report.alert.missed_supplement', 'guardian', true,
   '{days}일 연속 영양제 미복용', '{days} days without supplement', '{days}日連続サプリ未摂取', '连续{days}天未服用补充剂', '連續{days}天未服用補充劑',
   '{days} días sin suplemento', '{days} jours sans supplément', '{days} Tage ohne Ergänzung', '{days} dias sem suplemento',
   '{days} ngày không uống bổ sung', 'ไม่ทานอาหารเสริม {days} วัน', '{days} hari tanpa suplemen', '{days} أيام بدون مكمل',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.alert.no_exercise', 'guardian', true,
   '{days}일 연속 운동 미기록', 'No exercise for {days} days', '{days}日連続運動なし', '连续{days}天无运动', '連續{days}天無運動',
   'Sin ejercicio por {days} días', 'Pas d''exercice depuis {days} jours', 'Kein Sport seit {days} Tagen', 'Sem exercício por {days} dias',
   'Không tập {days} ngày', 'ไม่ออกกำลังกาย {days} วัน', 'Tidak olahraga {days} hari', 'لا تمارين لمدة {days} أيام',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.alert.weight_spike', 'guardian', true,
   '체중 {pct}% 이상 변화 감지', 'Weight changed by {pct}%+', '体重{pct}%以上変化', '体重变化超过{pct}%', '體重變化超過{pct}%',
   'Peso cambió {pct}%+', 'Poids modifié de {pct}%+', 'Gewicht um {pct}%+ verändert', 'Peso alterou {pct}%+',
   'Cân nặng thay đổi {pct}%+', 'น้ำหนักเปลี่ยน {pct}%+', 'Berat berubah {pct}%+', 'تغير الوزن بنسبة {pct}%+',
   NOW(), NOW()),

  -- Empty state
  (gen_random_uuid()::text, 'guardian.report.no_data', 'guardian', true,
   '이 기간에 기록된 데이터가 없습니다', 'No data recorded for this period', 'この期間のデータはありません', '此期间无记录数据', '此期間無記錄數據',
   'Sin datos para este período', 'Aucune donnée pour cette période', 'Keine Daten für diesen Zeitraum', 'Sem dados para este período',
   'Không có dữ liệu cho giai đoạn này', 'ไม่มีข้อมูลสำหรับช่วงนี้', 'Tidak ada data untuk periode ini', 'لا توجد بيانات لهذه الفترة',
   NOW(), NOW()),

  -- Misc labels
  (gen_random_uuid()::text, 'guardian.report.feeding.kcal', 'guardian', true,
   'kcal', 'kcal', 'kcal', 'kcal', 'kcal',
   'kcal', 'kcal', 'kcal', 'kcal',
   'kcal', 'kcal', 'kcal', 'سعرة',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.exercise.min_unit', 'guardian', true,
   '분', 'min', '分', '分钟', '分鐘',
   'min', 'min', 'Min', 'min',
   'phút', 'นาที', 'mnt', 'دقيقة',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.health.kg_unit', 'guardian', true,
   'kg', 'kg', 'kg', 'kg', 'kg',
   'kg', 'kg', 'kg', 'kg',
   'kg', 'kg', 'kg', 'كغ',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.protein', 'guardian', true,
   '단백질', 'Protein', 'タンパク質', '蛋白质', '蛋白質',
   'Proteína', 'Protéine', 'Protein', 'Proteína',
   'Protein', 'โปรตีน', 'Protein', 'بروتين',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.fat', 'guardian', true,
   '지방', 'Fat', '脂肪', '脂肪', '脂肪',
   'Grasa', 'Lipides', 'Fett', 'Gordura',
   'Chất béo', 'ไขมัน', 'Lemak', 'دهون',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.carbs', 'guardian', true,
   '탄수화물', 'Carbs', '炭水化物', '碳水化合物', '碳水化合物',
   'Carbohidratos', 'Glucides', 'Kohlenhydrate', 'Carboidratos',
   'Carbs', 'คาร์โบไฮเดรต', 'Karbohidrat', 'كربوهيدرات',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.feeding.fiber', 'guardian', true,
   '섬유질', 'Fiber', '食物繊維', '纤维', '纖維',
   'Fibra', 'Fibres', 'Ballaststoffe', 'Fibra',
   'Chất xơ', 'ไฟเบอร์', 'Serat', 'ألياف',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.taken', 'guardian', true,
   '복용', 'Taken', '摂取済', '已服用', '已服用',
   'Tomado', 'Pris', 'Eingenommen', 'Tomado',
   'Đã uống', 'ทานแล้ว', 'Sudah', 'تم تناوله',
   NOW(), NOW()),
  (gen_random_uuid()::text, 'guardian.report.missed', 'guardian', true,
   '미복용', 'Missed', '未摂取', '未服用', '未服用',
   'Omitido', 'Manqué', 'Verpasst', 'Perdido',
   'Bỏ lỡ', 'พลาด', 'Terlewat', 'فائت',
   NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 064_guardian_pet_ui_i18n.sql
-- --------------------------------------------------------------------------
-- 064: Guardian pet UI i18n keys (onboarding + sidebar)
-- Depends on: 003_master_data_seed.sql

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-guardian-onboard-title', 'guardian.empty.onboard_title', 'guardian', true,
   '아직 등록된 반려동물이 없어요', 'No pets registered yet', 'まだペットが登録されていません',
   '还没有注册宠物', '還沒有註冊寵物', 'Aún no hay mascotas registradas',
   'Aucun animal enregistré', 'Noch keine Haustiere registriert', 'Nenhum pet registrado ainda',
   'Chưa có thú cưng nào được đăng ký', 'ยังไม่มีสัตว์เลี้ยงที่ลงทะเบียน', 'Belum ada hewan peliharaan terdaftar',
   'لا توجد حيوانات أليفة مسجلة بعد',
   NOW(), NOW()),
  ('i18n-guardian-onboard-desc', 'guardian.empty.onboard_desc', 'guardian', true,
   '반려동물을 추가하고 건강을 기록해보세요!', 'Add your pet and start tracking their health!',
   'ペットを追加して健康を記録しましょう！', '添加宠物并开始记录健康状况！', '添加寵物並開始記錄健康狀況！',
   '¡Agrega tu mascota y empieza a registrar su salud!', 'Ajoutez votre animal et commencez à suivre sa santé !',
   'Fügen Sie Ihr Haustier hinzu und beginnen Sie, seine Gesundheit zu verfolgen!',
   'Adicione seu pet e comece a acompanhar a saúde!', 'Thêm thú cưng và bắt đầu theo dõi sức khỏe!',
   'เพิ่มสัตว์เลี้ยงและเริ่มบันทึกสุขภาพ!', 'Tambahkan hewan peliharaan dan mulai catat kesehatannya!',
   'أضف حيوانك الأليف وابدأ بتتبع صحته!',
   NOW(), NOW()),
  ('i18n-guardian-onboard-cta', 'guardian.empty.onboard_cta', 'guardian', true,
   '+ 반려동물 추가하기', '+ Add Pet', '+ ペットを追加', '+ 添加宠物', '+ 添加寵物',
   '+ Agregar mascota', '+ Ajouter un animal', '+ Haustier hinzufügen', '+ Adicionar pet',
   '+ Thêm thú cưng', '+ เพิ่มสัตว์เลี้ยง', '+ Tambah hewan peliharaan', '+ إضافة حيوان أليف',
   NOW(), NOW()),
  ('i18n-guardian-sidebar-measurements', 'guardian.sidebar.measurements', 'guardian', true,
   '수치', 'Records', '記録', '记录', '記錄', 'Registros', 'Enregistrements', 'Einträge', 'Registros',
   'Bản ghi', 'บันทึก', 'Catatan', 'سجلات',
   NOW(), NOW()),
  ('i18n-guardian-sidebar-status', 'guardian.sidebar.status', 'guardian', true,
   '상태', 'Status', 'ステータス', '状态', '狀態', 'Estado', 'Statut', 'Status', 'Status',
   'Trạng thái', 'สถานะ', 'Status', 'الحالة',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 065_feeding_supplement_i18n.sql
-- --------------------------------------------------------------------------
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


-- --------------------------------------------------------------------------
-- Source: 066_guardian_profile_i18n.sql
-- --------------------------------------------------------------------------
-- 066: Guardian Profile 섹션 i18n 키 추가
-- 보호자 프로필 표시에 필요한 필드 라벨

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at) VALUES
  ('i18n-gp-020', 'guardian.profile.email', 'guardian.profile', '이메일', 'Email', 'メールアドレス', '电子邮件', '電子郵件', 'Correo electrónico', 'E-mail', 'E-Mail', 'E-mail', 'Email', 'อีเมล', 'Email', 'البريد الإلكتروني', true, NOW(), NOW()),
  ('i18n-gp-021', 'guardian.profile.phone', 'guardian.profile', '전화번호', 'Phone', '電話番号', '电话号码', '電話號碼', 'Teléfono', 'Téléphone', 'Telefon', 'Telefone', 'Số điện thoại', 'โทรศัพท์', 'Telepon', 'رقم الهاتف', true, NOW(), NOW()),
  ('i18n-gp-022', 'guardian.profile.auth_method', 'guardian.profile', '가입방식', 'Sign-up Method', '登録方法', '注册方式', '註冊方式', 'Método de registro', 'Méthode d''inscription', 'Registrierungsmethode', 'Método de cadastro', 'Phương thức đăng ký', 'วิธีการสมัคร', 'Metode pendaftaran', 'طريقة التسجيل', true, NOW(), NOW()),
  ('i18n-gp-023', 'guardian.profile.joined_date', 'guardian.profile', '가입일', 'Joined', '登録日', '注册日', '註冊日', 'Fecha de registro', 'Date d''inscription', 'Registrierungsdatum', 'Data de cadastro', 'Ngày đăng ký', 'วันที่สมัคร', 'Tanggal bergabung', 'تاريخ التسجيل', true, NOW(), NOW()),
  ('i18n-gp-024', 'guardian.profile.edit_profile', 'guardian.profile', '프로필 수정', 'Edit Profile', 'プロフィール編集', '编辑资料', '編輯資料', 'Editar perfil', 'Modifier le profil', 'Profil bearbeiten', 'Editar perfil', 'Chỉnh sửa hồ sơ', 'แก้ไขโปรไฟล์', 'Edit profil', 'تعديل الملف الشخصي', true, NOW(), NOW()),
  ('i18n-gp-025', 'guardian.profile.pet_profile', 'guardian.profile', '반려동물 프로필', 'Pet Profile', 'ペットプロフィール', '宠物资料', '寵物資料', 'Perfil de mascota', 'Profil de l''animal', 'Haustierprofil', 'Perfil do pet', 'Hồ sơ thú cưng', 'โปรไฟล์สัตว์เลี้ยง', 'Profil hewan', 'ملف الحيوان الأليف', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 067_image_url_i18n.sql
-- --------------------------------------------------------------------------
-- 067: i18n keys for image URL manual input
INSERT INTO i18n_translations (id, key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
  (gen_random_uuid()::text, 'admin.catalog.image_url', '이미지 URL', 'Image URL', '画像URL', '图片URL', '圖片URL', 'URL de imagen', 'URL de l''image', 'Bild-URL', 'URL da imagem', 'URL hình ảnh', 'URL รูปภาพ', 'URL Gambar', 'رابط الصورة'),
  (gen_random_uuid()::text, 'admin.catalog.image_url_hint', '외부 이미지 URL 붙여넣기', 'Paste external image URL', '外部画像URLを貼り付け', '粘贴外部图片URL', '貼上外部圖片URL', 'Pegar URL de imagen externa', 'Coller l''URL de l''image externe', 'Externe Bild-URL einfügen', 'Colar URL de imagem externa', 'Dán URL hình ảnh bên ngoài', 'วาง URL รูปภาพภายนอก', 'Tempel URL gambar eksternal', 'لصق رابط الصورة الخارجي'),
  (gen_random_uuid()::text, 'admin.catalog.image_url_save', '적용', 'Apply', '適用', '应用', '套用', 'Aplicar', 'Appliquer', 'Anwenden', 'Aplicar', 'Áp dụng', 'นำไปใช้', 'Terapkan', 'تطبيق')
ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 067_stores_services_i18n.sql
-- --------------------------------------------------------------------------
-- 067_stores_services_i18n.sql — S9: 매장/서비스/할인 i18n 키 등록
-- ~60 keys for admin store management, services, discounts, guardian store browsing

-- ─── Admin Nav ────────────────────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'admin.nav.stores', 'admin', '매장 관리', 'Store Management', '店舗管理', '店铺管理', '店鋪管理', 'Gestión de tiendas', 'Gestion des magasins', 'Filialverwaltung', 'Gestão de lojas', 'Quản lý cửa hàng', 'จัดการร้านค้า', 'Manajemen Toko', 'إدارة المتاجر', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Admin Store Page ─────────────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'admin.store.page_title', 'admin', '매장 관리', 'Store Management', '店舗管理', '店铺管理', '店鋪管理', 'Gestión de tiendas', 'Gestion des magasins', 'Filialverwaltung', 'Gestão de lojas', 'Quản lý cửa hàng', 'จัดการร้านค้า', 'Manajemen Toko', 'إدارة المتاجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.list.title', 'admin', '매장 목록', 'Store List', '店舗一覧', '店铺列表', '店鋪列表', 'Lista de tiendas', 'Liste des magasins', 'Filialliste', 'Lista de lojas', 'Danh sách cửa hàng', 'รายการร้านค้า', 'Daftar Toko', 'قائمة المتاجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.list.empty', 'admin', '등록된 매장이 없습니다', 'No stores registered', '登録された店舗がありません', '没有已注册的店铺', '沒有已註冊的店鋪', 'No hay tiendas registradas', 'Aucun magasin enregistré', 'Keine Filialen registriert', 'Nenhuma loja registrada', 'Chưa có cửa hàng nào', 'ยังไม่มีร้านค้า', 'Belum ada toko terdaftar', 'لا توجد متاجر مسجلة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.list.search', 'admin', '매장 검색...', 'Search stores...', '店舗を検索...', '搜索店铺...', '搜尋店鋪...', 'Buscar tiendas...', 'Rechercher des magasins...', 'Filialen suchen...', 'Pesquisar lojas...', 'Tìm cửa hàng...', 'ค้นหาร้านค้า...', 'Cari toko...', 'البحث عن متاجر...', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.name', 'admin', '매장 이름', 'Store Name', '店舗名', '店铺名称', '店鋪名稱', 'Nombre de tienda', 'Nom du magasin', 'Filialname', 'Nome da loja', 'Tên cửa hàng', 'ชื่อร้านค้า', 'Nama Toko', 'اسم المتجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.description', 'admin', '설명', 'Description', '説明', '描述', '描述', 'Descripción', 'Description', 'Beschreibung', 'Descrição', 'Mô tả', 'คำอธิบาย', 'Deskripsi', 'الوصف', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.address', 'admin', '주소', 'Address', '住所', '地址', '地址', 'Dirección', 'Adresse', 'Adresse', 'Endereço', 'Địa chỉ', 'ที่อยู่', 'Alamat', 'العنوان', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.phone', 'admin', '전화번호', 'Phone', '電話番号', '电话号码', '電話號碼', 'Teléfono', 'Téléphone', 'Telefon', 'Telefone', 'Số điện thoại', 'โทรศัพท์', 'Telepon', 'الهاتف', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.country', 'admin', '국가', 'Country', '国', '国家', '國家', 'País', 'Pays', 'Land', 'País', 'Quốc gia', 'ประเทศ', 'Negara', 'الدولة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.currency', 'admin', '통화', 'Currency', '通貨', '货币', '貨幣', 'Moneda', 'Devise', 'Währung', 'Moeda', 'Tiền tệ', 'สกุลเงิน', 'Mata Uang', 'العملة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.industries', 'admin', '업종', 'Industries', '業種', '行业', '行業', 'Industrias', 'Industries', 'Branchen', 'Indústrias', 'Ngành nghề', 'ประเภทธุรกิจ', 'Industri', 'الصناعات', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.avatar', 'admin', '매장 이미지', 'Store Image', '店舗画像', '店铺图片', '店鋪圖片', 'Imagen de tienda', 'Image du magasin', 'Filialbild', 'Imagem da loja', 'Hình cửa hàng', 'รูปร้านค้า', 'Gambar Toko', 'صورة المتجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.latitude', 'admin', '위도', 'Latitude', '緯度', '纬度', '緯度', 'Latitud', 'Latitude', 'Breitengrad', 'Latitude', 'Vĩ độ', 'ละติจูด', 'Lintang', 'خط العرض', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.longitude', 'admin', '경도', 'Longitude', '経度', '经度', '經度', 'Longitud', 'Longitude', 'Längengrad', 'Longitude', 'Kinh độ', 'ลองจิจูด', 'Bujur', 'خط الطول', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.action.create', 'admin', '매장 등록', 'Create Store', '店舗登録', '创建店铺', '建立店鋪', 'Crear tienda', 'Créer un magasin', 'Filiale erstellen', 'Criar loja', 'Tạo cửa hàng', 'สร้างร้านค้า', 'Buat Toko', 'إنشاء متجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.action.edit', 'admin', '매장 수정', 'Edit Store', '店舗編集', '编辑店铺', '編輯店鋪', 'Editar tienda', 'Modifier le magasin', 'Filiale bearbeiten', 'Editar loja', 'Sửa cửa hàng', 'แก้ไขร้านค้า', 'Edit Toko', 'تعديل المتجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.action.delete', 'admin', '매장 비활성화', 'Deactivate Store', '店舗無効化', '停用店铺', '停用店鋪', 'Desactivar tienda', 'Désactiver le magasin', 'Filiale deaktivieren', 'Desativar loja', 'Vô hiệu hóa cửa hàng', 'ปิดใช้งานร้านค้า', 'Nonaktifkan Toko', 'تعطيل المتجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.action.save', 'admin', '저장', 'Save', '保存', '保存', '儲存', 'Guardar', 'Enregistrer', 'Speichern', 'Salvar', 'Lưu', 'บันทึก', 'Simpan', 'حفظ', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.action.cancel', 'admin', '취소', 'Cancel', 'キャンセル', '取消', '取消', 'Cancelar', 'Annuler', 'Abbrechen', 'Cancelar', 'Hủy', 'ยกเลิก', 'Batal', 'إلغاء', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.alert.created', 'admin', '매장이 등록되었습니다', 'Store created successfully', '店舗が登録されました', '店铺创建成功', '店鋪建立成功', 'Tienda creada exitosamente', 'Magasin créé avec succès', 'Filiale erfolgreich erstellt', 'Loja criada com sucesso', 'Tạo cửa hàng thành công', 'สร้างร้านค้าสำเร็จ', 'Toko berhasil dibuat', 'تم إنشاء المتجر بنجاح', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.alert.updated', 'admin', '매장 정보가 수정되었습니다', 'Store updated successfully', '店舗情報が更新されました', '店铺更新成功', '店鋪更新成功', 'Tienda actualizada exitosamente', 'Magasin mis à jour avec succès', 'Filiale erfolgreich aktualisiert', 'Loja atualizada com sucesso', 'Cập nhật cửa hàng thành công', 'อัปเดตร้านค้าสำเร็จ', 'Toko berhasil diperbarui', 'تم تحديث المتجر بنجاح', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.alert.deleted', 'admin', '매장이 비활성화되었습니다', 'Store deactivated', '店舗が無効化されました', '店铺已停用', '店鋪已停用', 'Tienda desactivada', 'Magasin désactivé', 'Filiale deaktiviert', 'Loja desativada', 'Đã vô hiệu hóa cửa hàng', 'ปิดใช้งานร้านค้าแล้ว', 'Toko dinonaktifkan', 'تم تعطيل المتجر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.alert.failed', 'admin', '작업에 실패했습니다', 'Operation failed', '操作に失敗しました', '操作失败', '操作失敗', 'Operación fallida', 'Opération échouée', 'Vorgang fehlgeschlagen', 'Operação falhou', 'Thao tác thất bại', 'ดำเนินการไม่สำเร็จ', 'Operasi gagal', 'فشلت العملية', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.status.active', 'admin', '활성', 'Active', 'アクティブ', '活跃', '活躍', 'Activo', 'Actif', 'Aktiv', 'Ativo', 'Hoạt động', 'ใช้งาน', 'Aktif', 'نشط', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.status.inactive', 'admin', '비활성', 'Inactive', '非アクティブ', '非活跃', '非活躍', 'Inactivo', 'Inactif', 'Inaktiv', 'Inativo', 'Không hoạt động', 'ไม่ใช้งาน', 'Tidak Aktif', 'غير نشط', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Admin Service ────────────────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'admin.service.list.title', 'admin', '서비스 목록', 'Service List', 'サービス一覧', '服务列表', '服務列表', 'Lista de servicios', 'Liste des services', 'Serviceliste', 'Lista de serviços', 'Danh sách dịch vụ', 'รายการบริการ', 'Daftar Layanan', 'قائمة الخدمات', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.list.empty', 'admin', '등록된 서비스가 없습니다', 'No services registered', '登録されたサービスがありません', '没有已注册的服务', '沒有已註冊的服務', 'No hay servicios registrados', 'Aucun service enregistré', 'Keine Services registriert', 'Nenhum serviço registrado', 'Chưa có dịch vụ nào', 'ยังไม่มีบริการ', 'Belum ada layanan terdaftar', 'لا توجد خدمات مسجلة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.form.name', 'admin', '서비스 이름', 'Service Name', 'サービス名', '服务名称', '服務名稱', 'Nombre del servicio', 'Nom du service', 'Servicename', 'Nome do serviço', 'Tên dịch vụ', 'ชื่อบริการ', 'Nama Layanan', 'اسم الخدمة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.form.description', 'admin', '서비스 설명', 'Service Description', 'サービス説明', '服务描述', '服務描述', 'Descripción del servicio', 'Description du service', 'Servicebeschreibung', 'Descrição do serviço', 'Mô tả dịch vụ', 'คำอธิบายบริการ', 'Deskripsi Layanan', 'وصف الخدمة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.form.price', 'admin', '가격', 'Price', '価格', '价格', '價格', 'Precio', 'Prix', 'Preis', 'Preço', 'Giá', 'ราคา', 'Harga', 'السعر', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.form.photos', 'admin', '사진', 'Photos', '写真', '照片', '照片', 'Fotos', 'Photos', 'Fotos', 'Fotos', 'Ảnh', 'รูปภาพ', 'Foto', 'الصور', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.form.sort_order', 'admin', '정렬 순서', 'Sort Order', '表示順', '排序', '排序', 'Orden', 'Ordre', 'Reihenfolge', 'Ordem', 'Thứ tự', 'ลำดับ', 'Urutan', 'الترتيب', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.action.create', 'admin', '서비스 등록', 'Add Service', 'サービス登録', '添加服务', '新增服務', 'Agregar servicio', 'Ajouter un service', 'Service hinzufügen', 'Adicionar serviço', 'Thêm dịch vụ', 'เพิ่มบริการ', 'Tambah Layanan', 'إضافة خدمة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.action.edit', 'admin', '서비스 수정', 'Edit Service', 'サービス編集', '编辑服务', '編輯服務', 'Editar servicio', 'Modifier le service', 'Service bearbeiten', 'Editar serviço', 'Sửa dịch vụ', 'แก้ไขบริการ', 'Edit Layanan', 'تعديل الخدمة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.action.delete', 'admin', '서비스 삭제', 'Delete Service', 'サービス削除', '删除服务', '刪除服務', 'Eliminar servicio', 'Supprimer le service', 'Service löschen', 'Excluir serviço', 'Xóa dịch vụ', 'ลบบริการ', 'Hapus Layanan', 'حذف الخدمة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.alert.created', 'admin', '서비스가 등록되었습니다', 'Service created successfully', 'サービスが登録されました', '服务创建成功', '服務建立成功', 'Servicio creado exitosamente', 'Service créé avec succès', 'Service erfolgreich erstellt', 'Serviço criado com sucesso', 'Tạo dịch vụ thành công', 'สร้างบริการสำเร็จ', 'Layanan berhasil dibuat', 'تم إنشاء الخدمة بنجاح', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.alert.updated', 'admin', '서비스가 수정되었습니다', 'Service updated successfully', 'サービスが更新されました', '服务更新成功', '服務更新成功', 'Servicio actualizado exitosamente', 'Service mis à jour avec succès', 'Service erfolgreich aktualisiert', 'Serviço atualizado com sucesso', 'Cập nhật dịch vụ thành công', 'อัปเดตบริการสำเร็จ', 'Layanan berhasil diperbarui', 'تم تحديث الخدمة بنجاح', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.alert.deleted', 'admin', '서비스가 삭제되었습니다', 'Service deleted', 'サービスが削除されました', '服务已删除', '服務已刪除', 'Servicio eliminado', 'Service supprimé', 'Service gelöscht', 'Serviço excluído', 'Đã xóa dịch vụ', 'ลบบริการแล้ว', 'Layanan dihapus', 'تم حذف الخدمة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.service.alert.failed', 'admin', '서비스 작업에 실패했습니다', 'Service operation failed', 'サービス操作に失敗しました', '服务操作失败', '服務操作失敗', 'Operación de servicio fallida', 'Opération de service échouée', 'Servicevorgang fehlgeschlagen', 'Operação de serviço falhou', 'Thao tác dịch vụ thất bại', 'ดำเนินการบริการไม่สำเร็จ', 'Operasi layanan gagal', 'فشلت عملية الخدمة', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Admin Discount ───────────────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'admin.discount.list.title', 'admin', '할인 목록', 'Discount List', '割引一覧', '折扣列表', '折扣列表', 'Lista de descuentos', 'Liste des réductions', 'Rabattliste', 'Lista de descontos', 'Danh sách giảm giá', 'รายการส่วนลด', 'Daftar Diskon', 'قائمة الخصومات', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.list.empty', 'admin', '등록된 할인이 없습니다', 'No discounts registered', '登録された割引がありません', '没有已注册的折扣', '沒有已註冊的折扣', 'No hay descuentos registrados', 'Aucune réduction enregistrée', 'Keine Rabatte registriert', 'Nenhum desconto registrado', 'Chưa có giảm giá nào', 'ยังไม่มีส่วนลด', 'Belum ada diskon terdaftar', 'لا توجد خصومات مسجلة', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.form.rate', 'admin', '할인율 (%)', 'Discount Rate (%)', '割引率 (%)', '折扣率 (%)', '折扣率 (%)', 'Tasa de descuento (%)', 'Taux de réduction (%)', 'Rabatt (%)', 'Taxa de desconto (%)', 'Tỷ lệ giảm giá (%)', 'อัตราส่วนลด (%)', 'Tingkat Diskon (%)', 'نسبة الخصم (%)', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.form.start_date', 'admin', '시작일', 'Start Date', '開始日', '开始日期', '開始日期', 'Fecha de inicio', 'Date de début', 'Startdatum', 'Data de início', 'Ngày bắt đầu', 'วันที่เริ่มต้น', 'Tanggal Mulai', 'تاريخ البداية', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.form.end_date', 'admin', '종료일', 'End Date', '終了日', '结束日期', '結束日期', 'Fecha de fin', 'Date de fin', 'Enddatum', 'Data de término', 'Ngày kết thúc', 'วันที่สิ้นสุด', 'Tanggal Berakhir', 'تاريخ النهاية', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.action.create', 'admin', '할인 등록', 'Add Discount', '割引登録', '添加折扣', '新增折扣', 'Agregar descuento', 'Ajouter une réduction', 'Rabatt hinzufügen', 'Adicionar desconto', 'Thêm giảm giá', 'เพิ่มส่วนลด', 'Tambah Diskon', 'إضافة خصم', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.action.delete', 'admin', '할인 삭제', 'Delete Discount', '割引削除', '删除折扣', '刪除折扣', 'Eliminar descuento', 'Supprimer la réduction', 'Rabatt löschen', 'Excluir desconto', 'Xóa giảm giá', 'ลบส่วนลด', 'Hapus Diskon', 'حذف الخصم', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.alert.created', 'admin', '할인이 등록되었습니다', 'Discount created successfully', '割引が登録されました', '折扣创建成功', '折扣建立成功', 'Descuento creado exitosamente', 'Réduction créée avec succès', 'Rabatt erfolgreich erstellt', 'Desconto criado com sucesso', 'Tạo giảm giá thành công', 'สร้างส่วนลดสำเร็จ', 'Diskon berhasil dibuat', 'تم إنشاء الخصم بنجاح', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.alert.deleted', 'admin', '할인이 삭제되었습니다', 'Discount deleted', '割引が削除されました', '折扣已删除', '折扣已刪除', 'Descuento eliminado', 'Réduction supprimée', 'Rabatt gelöscht', 'Desconto excluído', 'Đã xóa giảm giá', 'ลบส่วนลดแล้ว', 'Diskon dihapus', 'تم حذف الخصم', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.discount.alert.failed', 'admin', '할인 작업에 실패했습니다', 'Discount operation failed', '割引操作に失敗しました', '折扣操作失败', '折扣操作失敗', 'Operación de descuento fallida', 'Opération de réduction échouée', 'Rabattvorgang fehlgeschlagen', 'Operação de desconto falhou', 'Thao tác giảm giá thất bại', 'ดำเนินการส่วนลดไม่สำเร็จ', 'Operasi diskon gagal', 'فشلت عملية الخصم', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Guardian Store Browsing ──────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'guardian.store.browse', 'guardian', '매장 탐색', 'Browse Stores', '店舗を探す', '浏览店铺', '瀏覽店鋪', 'Explorar tiendas', 'Parcourir les magasins', 'Filialen durchsuchen', 'Explorar lojas', 'Duyệt cửa hàng', 'เรียกดูร้านค้า', 'Jelajahi Toko', 'تصفح المتاجر', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.store.search', 'guardian', '매장 검색...', 'Search stores...', '店舗を検索...', '搜索店铺...', '搜尋店鋪...', 'Buscar tiendas...', 'Rechercher des magasins...', 'Filialen suchen...', 'Pesquisar lojas...', 'Tìm cửa hàng...', 'ค้นหาร้านค้า...', 'Cari toko...', 'البحث عن متاجر...', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.store.detail', 'guardian', '매장 상세', 'Store Details', '店舗詳細', '店铺详情', '店鋪詳情', 'Detalles de la tienda', 'Détails du magasin', 'Filialdetails', 'Detalhes da loja', 'Chi tiết cửa hàng', 'รายละเอียดร้านค้า', 'Detail Toko', 'تفاصيل المتجر', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.store.services', 'guardian', '서비스', 'Services', 'サービス', '服务', '服務', 'Servicios', 'Services', 'Services', 'Serviços', 'Dịch vụ', 'บริการ', 'Layanan', 'الخدمات', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.store.book', 'guardian', '예약하기', 'Book Now', '予約する', '立即预约', '立即預約', 'Reservar ahora', 'Réserver', 'Jetzt buchen', 'Reservar agora', 'Đặt lịch', 'จองตอนนี้', 'Pesan Sekarang', 'احجز الآن', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.store.no_services', 'guardian', '등록된 서비스가 없습니다', 'No services available', '利用可能なサービスがありません', '暂无可用服务', '暫無可用服務', 'No hay servicios disponibles', 'Aucun service disponible', 'Keine Services verfügbar', 'Nenhum serviço disponível', 'Không có dịch vụ', 'ไม่มีบริการ', 'Tidak ada layanan', 'لا توجد خدمات متاحة', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.store.discount_badge', 'guardian', '할인 중', 'On Sale', 'セール中', '打折中', '折扣中', 'En oferta', 'En promotion', 'Im Angebot', 'Em promoção', 'Đang giảm giá', 'ลดราคา', 'Diskon', 'تخفيض', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ─── Provider Store Management ────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'provider.store.my_stores', 'provider', '내 매장', 'My Stores', 'マイ店舗', '我的店铺', '我的店鋪', 'Mis tiendas', 'Mes magasins', 'Meine Filialen', 'Minhas lojas', 'Cửa hàng của tôi', 'ร้านค้าของฉัน', 'Toko Saya', 'متاجري', true, NOW(), NOW()),
(gen_random_uuid(), 'provider.store.create', 'provider', '매장 등록', 'Register Store', '店舗登録', '注册店铺', '註冊店鋪', 'Registrar tienda', 'Enregistrer un magasin', 'Filiale registrieren', 'Registrar loja', 'Đăng ký cửa hàng', 'ลงทะเบียนร้านค้า', 'Daftarkan Toko', 'تسجيل متجر', true, NOW(), NOW()),
(gen_random_uuid(), 'provider.store.services_count', 'provider', '서비스 {count}개', '{count} services', 'サービス {count}件', '{count}个服务', '{count}個服務', '{count} servicios', '{count} services', '{count} Services', '{count} serviços', '{count} dịch vụ', '{count} บริการ', '{count} layanan', '{count} خدمات', true, NOW(), NOW()),
(gen_random_uuid(), 'provider.store.no_stores', 'provider', '등록된 매장이 없습니다. 매장을 등록해보세요!', 'No stores yet. Register your first store!', 'まだ店舗がありません。最初の店舗を登録しましょう！', '还没有店铺，注册您的第一家店铺吧！', '還沒有店鋪，註冊您的第一家店鋪吧！', '¡Aún no hay tiendas. Registra tu primera tienda!', 'Aucun magasin encore. Enregistrez votre premier magasin !', 'Noch keine Filialen. Registrieren Sie Ihre erste Filiale!', 'Nenhuma loja ainda. Registre sua primeira loja!', 'Chưa có cửa hàng. Hãy đăng ký cửa hàng đầu tiên!', 'ยังไม่มีร้านค้า ลงทะเบียนร้านค้าแรกของคุณ!', 'Belum ada toko. Daftarkan toko pertama Anda!', 'لا توجد متاجر بعد. سجّل متجرك الأول!', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 069_catalog_stats_i18n.sql
-- --------------------------------------------------------------------------
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


-- --------------------------------------------------------------------------
-- Source: 071_medicine_i18n.sql
-- --------------------------------------------------------------------------
-- ============================================================================
-- 071_medicine_i18n.sql
-- UI i18n keys for medicine catalog admin pages (13 languages)
-- ============================================================================

INSERT INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
  -- Master category label
  (md5('i18n_master_medicine_category'), 'master.medicine_category', 'master', true,
    '약품 유형', 'Medicine Category',
    '薬品タイプ', '药品类型', '藥品類型',
    'Categoria de Medicamentos', 'Categorie de Medicaments', 'Medikamentenkategorie',
    'Categoria de Medicamentos', 'Loai Thuoc', 'ประเภทยา',
    'Kategori Obat', 'فئة الأدوية',
    NOW(), NOW()),

  -- 10 type labels
  (md5('i18n_med_type_insulin'), 'master.medicine_category.insulin_medicine_core', 'master', true,
    '인슐린', 'Insulin',
    'インスリン', '胰岛素', '胰島素',
    'Insulina', 'Insuline', 'Insulin',
    'Insulina', 'Insulin', 'อินซูลิน',
    'Insulin', 'الأنسولين',
    NOW(), NOW()),

  (md5('i18n_med_type_antibiotic'), 'master.medicine_category.antibiotic_medicine_core', 'master', true,
    '항생제', 'Antibiotic',
    '抗生物質', '抗生素', '抗生素',
    'Antibiotico', 'Antibiotique', 'Antibiotikum',
    'Antibiotico', 'Khang Sinh', 'ยาปฏิชีวนะ',
    'Antibiotik', 'مضاد حيوي',
    NOW(), NOW()),

  (md5('i18n_med_type_pain_relief'), 'master.medicine_category.pain_relief_medicine_core', 'master', true,
    '진통/소염제', 'Pain Relief',
    '鎮痛消炎薬', '止痛消炎药', '止痛消炎藥',
    'Analgesico', 'Analgesique', 'Schmerzmittel',
    'Analgesico', 'Giam Dau', 'ยาแก้ปวด',
    'Pereda Nyeri', 'مسكن للألم',
    NOW(), NOW()),

  (md5('i18n_med_type_digestive'), 'master.medicine_category.digestive_medicine_core', 'master', true,
    '소화기 약품', 'Digestive',
    '消化器薬', '消化药', '消化藥',
    'Digestivo', 'Digestif', 'Verdauungsmittel',
    'Digestivo', 'Tieu Hoa', 'ยาระบบทางเดินอาหาร',
    'Obat Pencernaan', 'جهاز هضمي',
    NOW(), NOW()),

  (md5('i18n_med_type_heart'), 'master.medicine_category.heart_medicine_core', 'master', true,
    '심장 약품', 'Heart',
    '心臓薬', '心脏药', '心臟藥',
    'Cardiaco', 'Cardiaque', 'Herzmittel',
    'Cardiaco', 'Tim Mach', 'ยาหัวใจ',
    'Obat Jantung', 'دواء القلب',
    NOW(), NOW()),

  (md5('i18n_med_type_kidney'), 'master.medicine_category.kidney_medicine_core', 'master', true,
    '신장 약품', 'Kidney',
    '腎臓薬', '肾脏药', '腎臟藥',
    'Renal', 'Renal', 'Nierenmittel',
    'Renal', 'Than', 'ยาไต',
    'Obat Ginjal', 'دواء الكلى',
    NOW(), NOW()),

  (md5('i18n_med_type_skin'), 'master.medicine_category.skin_medicine_core', 'master', true,
    '피부 약품', 'Skin',
    '皮膚薬', '皮肤药', '皮膚藥',
    'Dermatologico', 'Dermatologique', 'Hautmittel',
    'Dermatologico', 'Da Lieu', 'ยาผิวหนัง',
    'Obat Kulit', 'دواء الجلد',
    NOW(), NOW()),

  (md5('i18n_med_type_eye_ear'), 'master.medicine_category.eye_ear_medicine_core', 'master', true,
    '안/이비 약품', 'Eye & Ear',
    '眼耳薬', '眼耳药', '眼耳藥',
    'Oftalmico/Otico', 'Ophtalmique/Otique', 'Augen-/Ohrenmittel',
    'Oftalmico/Otico', 'Mat Tai', 'ยาตา/หู',
    'Obat Mata/Telinga', 'دواء العين والأذن',
    NOW(), NOW()),

  (md5('i18n_med_type_antiparasitic'), 'master.medicine_category.antiparasitic_medicine_core', 'master', true,
    '구충/외부기생충', 'Antiparasitic',
    '駆虫薬', '驱虫药', '驅蟲藥',
    'Antiparasitario', 'Antiparasitaire', 'Antiparasitikum',
    'Antiparasitario', 'Chong Ky Sinh', 'ยาถ่ายพยาธิ',
    'Antiparasit', 'مضاد طفيليات',
    NOW(), NOW()),

  (md5('i18n_med_type_other'), 'master.medicine_category.other_medicine_core', 'master', true,
    '기타', 'Other',
    'その他', '其他', '其他',
    'Otro', 'Autre', 'Sonstige',
    'Outro', 'Khac', 'อื่นๆ',
    'Lainnya', 'أخرى',
    NOW(), NOW()),

  -- Admin nav
  (md5('i18n_admin_nav_medicines'), 'admin.nav.medicines', 'admin', true,
    '약품 관리', 'Medicine Catalog',
    '薬品管理', '药品管理', '藥品管理',
    'Catalogo de Medicamentos', 'Catalogue de Medicaments', 'Medikamentenkatalog',
    'Catalogo de Medicamentos', 'Quan Ly Thuoc', 'จัดการยา',
    'Katalog Obat', 'كتالوج الأدوية',
    NOW(), NOW()),

  -- Admin page labels
  (md5('i18n_admin_medicine_title'), 'admin.medicine.title', 'admin', true,
    '약품 카탈로그', 'Medicine Catalog',
    '薬品カタログ', '药品目录', '藥品目錄',
    'Catalogo de Medicamentos', 'Catalogue de Medicaments', 'Medikamentenkatalog',
    'Catalogo de Medicamentos', 'Danh Muc Thuoc', 'แคตตาล็อกยา',
    'Katalog Obat', 'كتالوج الأدوية',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_guide'), 'admin.medicine.guide', 'admin', true,
    '약품 카탈로그 관리: 유형 > 제조사 > 브랜드 > 약품', 'Manage medicine catalog: Type > Manufacturer > Brand > Medicine',
    '薬品カタログ管理: タイプ > メーカー > ブランド > 薬品', '药品目录管理: 类型 > 制造商 > 品牌 > 药品', '藥品目錄管理: 類型 > 製造商 > 品牌 > 藥品',
    'Gestionar catalogo: Tipo > Fabricante > Marca > Medicamento', 'Gerer le catalogue: Type > Fabricant > Marque > Medicament', 'Katalog verwalten: Typ > Hersteller > Marke > Medikament',
    'Gerenciar catalogo: Tipo > Fabricante > Marca > Medicamento', 'Quan ly: Loai > Nha san xuat > Thuong hieu > Thuoc', 'จัดการ: ประเภท > ผู้ผลิต > แบรนด์ > ยา',
    'Kelola katalog: Jenis > Produsen > Merek > Obat', 'إدارة الكتالوج: النوع > المصنع > العلامة > الدواء',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_types'), 'admin.medicine.types', 'admin', true,
    '약품 유형', 'Medicine Types',
    '薬品タイプ', '药品类型', '藥品類型',
    'Tipos de Medicamentos', 'Types de Medicaments', 'Medikamententypen',
    'Tipos de Medicamentos', 'Loai Thuoc', 'ประเภทยา',
    'Jenis Obat', 'أنواع الأدوية',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_manufacturers'), 'admin.medicine.manufacturers', 'admin', true,
    '제조사', 'Manufacturers',
    'メーカー', '制造商', '製造商',
    'Fabricantes', 'Fabricants', 'Hersteller',
    'Fabricantes', 'Nha San Xuat', 'ผู้ผลิต',
    'Produsen', 'المصنعون',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_brands'), 'admin.medicine.brands', 'admin', true,
    '브랜드', 'Brands',
    'ブランド', '品牌', '品牌',
    'Marcas', 'Marques', 'Marken',
    'Marcas', 'Thuong Hieu', 'แบรนด์',
    'Merek', 'العلامات التجارية',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_models'), 'admin.medicine.models', 'admin', true,
    '약품 목록', 'Medicines',
    '薬品一覧', '药品列表', '藥品列表',
    'Medicamentos', 'Medicaments', 'Medikamente',
    'Medicamentos', 'Danh Sach Thuoc', 'รายการยา',
    'Daftar Obat', 'قائمة الأدوية',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_type'), 'admin.medicine.type', 'admin', true,
    '약품 유형', 'Medicine Type',
    '薬品タイプ', '药品类型', '藥品類型',
    'Tipo', 'Type', 'Typ',
    'Tipo', 'Loai', 'ประเภท',
    'Jenis', 'النوع',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_manufacturer'), 'admin.medicine.manufacturer', 'admin', true,
    '제조사', 'Manufacturer',
    'メーカー', '制造商', '製造商',
    'Fabricante', 'Fabricant', 'Hersteller',
    'Fabricante', 'Nha San Xuat', 'ผู้ผลิต',
    'Produsen', 'المصنع',
    NOW(), NOW()),

  (md5('i18n_admin_medicine_brand'), 'admin.medicine.brand', 'admin', true,
    '브랜드', 'Brand',
    'ブランド', '品牌', '品牌',
    'Marca', 'Marque', 'Marke',
    'Marca', 'Thuong Hieu', 'แบรนด์',
    'Merek', 'العلامة التجارية',
    NOW(), NOW()),

  -- Medicine-specific field labels
  (md5('i18n_admin_med_admin_route'), 'admin.medicine.administration_route', 'admin', true,
    '투여 경로', 'Administration Route',
    '投与経路', '给药途径', '給藥途徑',
    'Via de Administracion', 'Voie d''Administration', 'Verabreichungsweg',
    'Via de Administracao', 'Duong Dung', 'เส้นทางการให้ยา',
    'Rute Pemberian', 'طريقة الإعطاء',
    NOW(), NOW()),

  (md5('i18n_admin_med_dosage_unit'), 'admin.medicine.dosage_unit', 'admin', true,
    '투여 단위', 'Dosage Unit',
    '投与単位', '剂量单位', '劑量單位',
    'Unidad de Dosis', 'Unite de Dosage', 'Dosiereinheit',
    'Unidade de Dosagem', 'Don Vi Lieu', 'หน่วยยา',
    'Satuan Dosis', 'وحدة الجرعة',
    NOW(), NOW()),

  (md5('i18n_admin_med_species'), 'admin.medicine.species', 'admin', true,
    '대상 동물', 'Species',
    '対象動物', '适用动物', '適用動物',
    'Especie', 'Espece', 'Tierart',
    'Especie', 'Loai', 'ชนิดสัตว์',
    'Spesies', 'الأنواع',
    NOW(), NOW()),

  (md5('i18n_admin_med_prescribed'), 'admin.medicine.prescribed', 'admin', true,
    '처방 필요', 'Prescribed',
    '処方', '处方', '處方',
    'Con Receta', 'Sur Ordonnance', 'Verschreibungspflichtig',
    'Com Receita', 'Ke Don', 'ยาตามใบสั่ง',
    'Resep', 'بوصفة طبية',
    NOW(), NOW()),

  (md5('i18n_admin_med_storage'), 'admin.medicine.storage_condition', 'admin', true,
    '보관 조건', 'Storage Condition',
    '保管条件', '储存条件', '儲存條件',
    'Condicion de Almacenamiento', 'Condition de Stockage', 'Lagerbedingung',
    'Condicao de Armazenamento', 'Dieu Kien Bao Quan', 'เงื่อนไขการเก็บรักษา',
    'Kondisi Penyimpanan', 'ظروف التخزين',
    NOW(), NOW()),

  (md5('i18n_admin_med_warnings'), 'admin.medicine.warnings', 'admin', true,
    '주의사항', 'Warnings',
    '注意事項', '注意事项', '注意事項',
    'Advertencias', 'Avertissements', 'Warnhinweise',
    'Advertencias', 'Luu Y', 'คำเตือน',
    'Peringatan', 'تحذيرات',
    NOW(), NOW()),

  (md5('i18n_admin_med_disease_tags'), 'admin.medicine.disease_tags', 'admin', true,
    '질병 태그', 'Disease Tags',
    '疾病タグ', '疾病标签', '疾病標籤',
    'Etiquetas de Enfermedad', 'Etiquettes de Maladie', 'Krankheits-Tags',
    'Etiquetas de Doenca', 'The Benh', 'แท็กโรค',
    'Tag Penyakit', 'علامات المرض',
    NOW(), NOW()),

  -- Storage condition badges
  (md5('i18n_admin_med_refrigerated'), 'admin.medicine.refrigerated_badge', 'admin', true,
    '냉장 보관 필요', 'Refrigerated',
    '冷蔵保管', '需冷藏', '需冷藏',
    'Refrigerado', 'Refrigere', 'Gekuhlt',
    'Refrigerado', 'Bao Quan Lanh', 'แช่เย็น',
    'Berpendingin', 'مبرد',
    NOW(), NOW()),

  (md5('i18n_admin_med_frozen'), 'admin.medicine.frozen_badge', 'admin', true,
    '냉동 보관', 'Frozen',
    '冷凍保管', '需冷冻', '需冷凍',
    'Congelado', 'Congele', 'Gefroren',
    'Congelado', 'Dong Lanh', 'แช่แข็ง',
    'Beku', 'مجمد',
    NOW(), NOW()),

  (md5('i18n_admin_med_room_temp'), 'admin.medicine.room_temp_badge', 'admin', true,
    '실온 보관', 'Room Temp',
    '常温保管', '常温保存', '常溫保存',
    'Temperatura Ambiente', 'Temperature Ambiante', 'Raumtemperatur',
    'Temperatura Ambiente', 'Nhiet Do Phong', 'อุณหภูมิห้อง',
    'Suhu Ruangan', 'درجة حرارة الغرفة',
    NOW(), NOW()),

  -- Administration route labels
  (md5('i18n_med_route_injection'), 'medicine.route.injection', 'medicine', true,
    '주사', 'Injection',
    '注射', '注射', '注射',
    'Inyeccion', 'Injection', 'Injektion',
    'Injecao', 'Tiem', 'ฉีด',
    'Suntik', 'حقن',
    NOW(), NOW()),

  (md5('i18n_med_route_oral'), 'medicine.route.oral', 'medicine', true,
    '경구', 'Oral',
    '経口', '口服', '口服',
    'Oral', 'Oral', 'Oral',
    'Oral', 'Uong', 'รับประทาน',
    'Oral', 'فموي',
    NOW(), NOW()),

  (md5('i18n_med_route_topical'), 'medicine.route.topical', 'medicine', true,
    '도포', 'Topical',
    '外用', '外用', '外用',
    'Topico', 'Topique', 'Topisch',
    'Topico', 'Boi', 'ยาทา',
    'Topikal', 'موضعي',
    NOW(), NOW()),

  (md5('i18n_med_route_eye_drop'), 'medicine.route.eye_drop', 'medicine', true,
    '점안', 'Eye Drop',
    '点眼', '滴眼', '滴眼',
    'Gotas Oftalmicas', 'Gouttes Oculaires', 'Augentropfen',
    'Colorio', 'Nho Mat', 'ยาหยอดตา',
    'Tetes Mata', 'قطرة عين',
    NOW(), NOW()),

  (md5('i18n_med_route_ear_drop'), 'medicine.route.ear_drop', 'medicine', true,
    '점이', 'Ear Drop',
    '点耳', '滴耳', '滴耳',
    'Gotas Oticas', 'Gouttes Auriculaires', 'Ohrentropfen',
    'Gotas Auriculares', 'Nho Tai', 'ยาหยอดหู',
    'Tetes Telinga', 'قطرة أذن',
    NOW(), NOW()),

  -- Dosage unit labels (ones not already in the system)
  (md5('i18n_med_unit_iu'), 'medicine.unit.IU', 'medicine', true,
    'IU', 'IU',
    'IU', 'IU', 'IU',
    'UI', 'UI', 'IE',
    'UI', 'IU', 'IU',
    'IU', 'وحدة دولية',
    NOW(), NOW()),

  (md5('i18n_med_unit_scoop'), 'medicine.unit.scoop', 'medicine', true,
    '스쿱', 'scoop',
    'スクープ', '勺', '勺',
    'cucharada', 'cuillere', 'Messloffel',
    'colher', 'muong', 'ช้อนตวง',
    'sendok', 'ملعقة',
    NOW(), NOW()),

  (md5('i18n_med_unit_capsule'), 'medicine.unit.capsule', 'medicine', true,
    '캡슐', 'capsule',
    'カプセル', '胶囊', '膠囊',
    'capsula', 'capsule', 'Kapsel',
    'capsula', 'vien nang', 'แคปซูล',
    'kapsul', 'كبسولة',
    NOW(), NOW())
ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 072_search_modal_i18n.sql
-- --------------------------------------------------------------------------
-- 072_search_modal_i18n.sql — 사료/영양제/장비 추가 모달 검색 UI i18n

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- Feed search
(gen_random_uuid(), 'guardian.feed.search_label', 'guardian', '사료명 검색', 'Search Feed', 'フード名検索', '搜索饲料', '搜尋飼料', 'Buscar alimento', 'Rechercher aliment', 'Futter suchen', 'Buscar ração', 'Tìm thức ăn', 'ค้นหาอาหาร', 'Cari Pakan', 'بحث طعام', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.feed.search_placeholder', 'guardian', '사료를 검색하세요...', 'Search for feed...', 'フードを検索...', '搜索饲料...', '搜尋飼料...', 'Buscar alimento...', 'Rechercher un aliment...', 'Futter suchen...', 'Buscar ração...', 'Tìm thức ăn...', 'ค้นหาอาหาร...', 'Cari pakan...', 'بحث عن طعام...', true, NOW(), NOW()),

-- Supplement search
(gen_random_uuid(), 'guardian.supplement.search_label', 'guardian', '영양제명 검색', 'Search Supplement', 'サプリメント名検索', '搜索营养品', '搜尋營養品', 'Buscar suplemento', 'Rechercher supplément', 'Ergänzung suchen', 'Buscar suplemento', 'Tìm thực phẩm chức năng', 'ค้นหาอาหารเสริม', 'Cari Suplemen', 'بحث مكمل', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.supplement.search_placeholder', 'guardian', '영양제를 검색하세요...', 'Search for supplement...', 'サプリメントを検索...', '搜索营养品...', '搜尋營養品...', 'Buscar suplemento...', 'Rechercher un supplément...', 'Ergänzung suchen...', 'Buscar suplemento...', 'Tìm thực phẩm chức năng...', 'ค้นหาอาหารเสริม...', 'Cari suplemen...', 'بحث عن مكمل...', true, NOW(), NOW()),

-- Device search
(gen_random_uuid(), 'guardian.device.search_label', 'guardian', '장비명 검색', 'Search Device', 'デバイス名検索', '搜索设备', '搜尋設備', 'Buscar dispositivo', 'Rechercher appareil', 'Gerät suchen', 'Buscar dispositivo', 'Tìm thiết bị', 'ค้นหาอุปกรณ์', 'Cari Perangkat', 'بحث جهاز', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.device.search_placeholder', 'guardian', '장비를 검색하세요...', 'Search for device...', 'デバイスを検索...', '搜索设备...', '搜尋設備...', 'Buscar dispositivo...', 'Rechercher un appareil...', 'Gerät suchen...', 'Buscar dispositivo...', 'Tìm thiết bị...', 'ค้นหาอุปกรณ์...', 'Cari perangkat...', 'بحث عن جهاز...', true, NOW(), NOW()),

-- Common
(gen_random_uuid(), 'guardian.catalog.no_results', 'guardian', '검색 결과가 없습니다', 'No results found', '検索結果なし', '无搜索结果', '無搜尋結果', 'Sin resultados', 'Aucun résultat', 'Keine Ergebnisse', 'Nenhum resultado', 'Không có kết quả', 'ไม่พบผลลัพธ์', 'Tidak ada hasil', 'لا توجد نتائج', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.catalog.loading_models', 'guardian', '제품 목록 불러오는 중...', 'Loading products...', '製品一覧を読み込み中...', '加载产品列表...', '載入產品列表...', 'Cargando productos...', 'Chargement des produits...', 'Produkte laden...', 'Carregando produtos...', 'Đang tải sản phẩm...', 'กำลังโหลดสินค้า...', 'Memuat produk...', 'جاري تحميل المنتجات...', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 073_provider_store_mgmt_i18n.sql
-- --------------------------------------------------------------------------
-- 073: i18n keys for Provider store management + Admin dashboard store stats
-- Provider store CRUD keys + Admin dashboard store stats keys

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- Provider store management
(gen_random_uuid(), 'provider.store.create', 'provider_store', '매장 등록', 'Add Store', '店舗登録', '添加店铺', '新增店鋪', 'Agregar tienda', 'Ajouter un magasin', 'Geschäft hinzufügen', 'Adicionar loja', 'Thêm cửa hàng', 'เพิ่มร้านค้า', 'Tambah toko', 'إضافة متجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.edit', 'provider_store', '매장 수정', 'Edit Store', '店舗編集', '编辑店铺', '編輯店鋪', 'Editar tienda', 'Modifier le magasin', 'Geschäft bearbeiten', 'Editar loja', 'Sửa cửa hàng', 'แก้ไขร้านค้า', 'Edit toko', 'تعديل المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.detail', 'provider_store', '매장 상세', 'Store Detail', '店舗詳細', '店铺详情', '店鋪詳情', 'Detalle de tienda', 'Détail du magasin', 'Geschäftsdetails', 'Detalhe da loja', 'Chi tiết cửa hàng', 'รายละเอียดร้านค้า', 'Detail toko', 'تفاصيل المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.delete_confirm', 'provider_store', '이 매장을 삭제하시겠습니까?', 'Delete this store?', 'この店舗を削除しますか？', '确定删除此店铺？', '確定刪除此店鋪？', '¿Eliminar esta tienda?', 'Supprimer ce magasin ?', 'Dieses Geschäft löschen?', 'Excluir esta loja?', 'Xóa cửa hàng này?', 'ลบร้านค้านี้?', 'Hapus toko ini?', 'حذف هذا المتجر؟', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.alert.created', 'provider_store', '매장이 등록되었습니다', 'Store created', '店舗が登録されました', '店铺已创建', '店鋪已建立', 'Tienda creada', 'Magasin créé', 'Geschäft erstellt', 'Loja criada', 'Đã tạo cửa hàng', 'สร้างร้านค้าแล้ว', 'Toko dibuat', 'تم إنشاء المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.alert.updated', 'provider_store', '매장이 수정되었습니다', 'Store updated', '店舗が更新されました', '店铺已更新', '店鋪已更新', 'Tienda actualizada', 'Magasin mis à jour', 'Geschäft aktualisiert', 'Loja atualizada', 'Đã cập nhật cửa hàng', 'อัปเดตร้านค้าแล้ว', 'Toko diperbarui', 'تم تحديث المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.alert.deleted', 'provider_store', '매장이 삭제되었습니다', 'Store deleted', '店舗が削除されました', '店铺已删除', '店鋪已刪除', 'Tienda eliminada', 'Magasin supprimé', 'Geschäft gelöscht', 'Loja excluída', 'Đã xóa cửa hàng', 'ลบร้านค้าแล้ว', 'Toko dihapus', 'تم حذف المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.service.add', 'provider_store', '서비스 추가', 'Add Service', 'サービス追加', '添加服务', '新增服務', 'Agregar servicio', 'Ajouter un service', 'Service hinzufügen', 'Adicionar serviço', 'Thêm dịch vụ', 'เพิ่มบริการ', 'Tambah layanan', 'إضافة خدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.service.edit', 'provider_store', '서비스 수정', 'Edit Service', 'サービス編集', '编辑服务', '編輯服務', 'Editar servicio', 'Modifier le service', 'Service bearbeiten', 'Editar serviço', 'Sửa dịch vụ', 'แก้ไขบริการ', 'Edit layanan', 'تعديل الخدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.discount.add', 'provider_store', '할인 추가', 'Add Discount', '割引追加', '添加折扣', '新增折扣', 'Agregar descuento', 'Ajouter une remise', 'Rabatt hinzufügen', 'Adicionar desconto', 'Thêm giảm giá', 'เพิ่มส่วนลด', 'Tambah diskon', 'إضافة خصم', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.no_stores', 'provider_store', '등록된 매장이 없습니다', 'No stores yet', 'まだ店舗がありません', '暂无店铺', '尚無店鋪', 'Sin tiendas aún', 'Aucun magasin', 'Noch keine Geschäfte', 'Nenhuma loja ainda', 'Chưa có cửa hàng', 'ยังไม่มีร้านค้า', 'Belum ada toko', 'لا توجد متاجر بعد', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.my_stores', 'provider_store', '내 매장', 'My Stores', 'マイ店舗', '我的店铺', '我的店鋪', 'Mis tiendas', 'Mes magasins', 'Meine Geschäfte', 'Minhas lojas', 'Cửa hàng của tôi', 'ร้านค้าของฉัน', 'Toko saya', 'متاجري', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.services_count', 'provider_store', '{count}개 서비스', '{count} services', '{count}件のサービス', '{count}个服务', '{count}個服務', '{count} servicios', '{count} services', '{count} Services', '{count} serviços', '{count} dịch vụ', '{count} บริการ', '{count} layanan', '{count} خدمات', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.select_store', 'provider_store', '매장을 선택하세요', 'Select a store', '店舗を選択', '请选择店铺', '請選擇店鋪', 'Selecciona una tienda', 'Sélectionnez un magasin', 'Geschäft auswählen', 'Selecione uma loja', 'Chọn cửa hàng', 'เลือกร้านค้า', 'Pilih toko', 'اختر متجرًا', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.no_services', 'provider_store', '등록된 서비스가 없습니다', 'No services yet', 'まだサービスがありません', '暂无服务', '尚無服務', 'Sin servicios', 'Aucun service', 'Keine Services', 'Nenhum serviço', 'Chưa có dịch vụ', 'ยังไม่มีบริการ', 'Belum ada layanan', 'لا توجد خدمات', true, NOW(), NOW()),

-- Admin dashboard store stats
(gen_random_uuid(), 'admin.dashboard.stores.title', 'admin_dashboard', '매장 통계', 'Store Statistics', '店舗統計', '店铺统计', '店鋪統計', 'Estadísticas de tiendas', 'Statistiques des magasins', 'Geschäftsstatistiken', 'Estatísticas de lojas', 'Thống kê cửa hàng', 'สถิติร้านค้า', 'Statistik toko', 'إحصائيات المتاجر', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.dashboard.stores.total', 'admin_dashboard', '전체 매장', 'Total Stores', '全店舗数', '全部店铺', '全部店鋪', 'Total tiendas', 'Total magasins', 'Geschäfte gesamt', 'Total de lojas', 'Tổng cửa hàng', 'ร้านค้าทั้งหมด', 'Total toko', 'إجمالي المتاجر', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.dashboard.stores.active', 'admin_dashboard', '활성 매장', 'Active Stores', 'アクティブ店舗', '活跃店铺', '活躍店鋪', 'Tiendas activas', 'Magasins actifs', 'Aktive Geschäfte', 'Lojas ativas', 'Cửa hàng hoạt động', 'ร้านค้าที่ใช้งาน', 'Toko aktif', 'متاجر نشطة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.dashboard.stores.new', 'admin_dashboard', '신규 매장 (30일)', 'New Stores (30d)', '新規店舗 (30日)', '新店铺 (30天)', '新店鋪 (30天)', 'Nuevas tiendas (30d)', 'Nouveaux magasins (30j)', 'Neue Geschäfte (30T)', 'Novas lojas (30d)', 'Cửa hàng mới (30 ngày)', 'ร้านค้าใหม่ (30 วัน)', 'Toko baru (30h)', 'متاجر جديدة (30 يوم)', true, NOW(), NOW())

ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 074_health_toolbar_i18n.sql
-- --------------------------------------------------------------------------
-- 074: i18n keys for Health tab toolbar buttons (unified naming) + Medication log modal
-- 7 toolbar buttons + medication modal form labels

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Toolbar button labels (7) ────────────────────────────────────────────────
(md5('i18n_htb_weight_log'),     'guardian.health.weight_log',     'guardian', '체중 기록', 'Weight Log', '体重記録', '体重记录', '體重記錄', 'Registro de peso', 'Registre de poids', 'Gewichtsprotokoll', 'Registro de peso', 'Nhật ký cân nặng', 'บันทึกน้ำหนัก', 'Log Berat', 'سجل الوزن', true, NOW(), NOW()),
(md5('i18n_htb_measure_log'),    'guardian.health.measure_log',    'guardian', '수치 기록', 'Measure Log', '測定記録', '测量记录', '測量記錄', 'Registro de medición', 'Registre de mesure', 'Messprotokoll', 'Registro de medição', 'Nhật ký đo', 'บันทึกค่าวัด', 'Log Ukuran', 'سجل القياس', true, NOW(), NOW()),
(md5('i18n_htb_feeding_log'),    'guardian.health.feeding_log',    'guardian', '급여 기록', 'Feeding Log', '給餌記録', '喂食记录', '餵食記錄', 'Registro de alimentación', 'Registre d''alimentation', 'Fütterungsprotokoll', 'Registro de alimentação', 'Nhật ký cho ăn', 'บันทึกการให้อาหาร', 'Log Pemberian Makan', 'سجل التغذية', true, NOW(), NOW()),
(md5('i18n_htb_exercise_log'),   'guardian.health.exercise_log',   'guardian', '운동 기록', 'Exercise Log', '運動記録', '运动记录', '運動記錄', 'Registro de ejercicio', 'Registre d''exercice', 'Bewegungsprotokoll', 'Registro de exercício', 'Nhật ký tập luyện', 'บันทึกการออกกำลังกาย', 'Log Olahraga', 'سجل التمرين', true, NOW(), NOW()),
(md5('i18n_htb_medication_log'), 'guardian.health.medication_log', 'guardian', '약품 기록', 'Medication Log', '投薬記録', '用药记录', '用藥記錄', 'Registro de medicación', 'Registre de médicament', 'Medikamentenprotokoll', 'Registro de medicação', 'Nhật ký thuốc', 'บันทึกยา', 'Log Obat', 'سجل الأدوية', true, NOW(), NOW()),
(md5('i18n_htb_device_manage'),  'guardian.health.device_manage',  'guardian', '장비 관리', 'Device Mgmt', 'デバイス管理', '设备管理', '設備管理', 'Gestión de equipo', 'Gestion d''appareil', 'Geräteverwaltung', 'Gestão de equipamento', 'Quản lý thiết bị', 'จัดการอุปกรณ์', 'Kelola Perangkat', 'إدارة الأجهزة', true, NOW(), NOW()),
(md5('i18n_htb_feed_manage'),    'guardian.health.feed_manage',    'guardian', '사료 관리', 'Feed Mgmt', '飼料管理', '饲料管理', '飼料管理', 'Gestión de alimento', 'Gestion d''aliment', 'Futterverwaltung', 'Gestão de ração', 'Quản lý thức ăn', 'จัดการอาหาร', 'Kelola Pakan', 'إدارة العلف', true, NOW(), NOW()),

-- ── Medication log modal labels ──────────────────────────────────────────────
(md5('i18n_med_modal_title'),        'guardian.medication.title',         'guardian', '약품 투여 기록', 'Medication Administration', '投薬記録', '用药记录', '用藥記錄', 'Registro de medicación', 'Administration de médicament', 'Medikamentenverabreichung', 'Administração de medicação', 'Ghi nhận dùng thuốc', 'บันทึกการให้ยา', 'Catatan Pemberian Obat', 'سجل إعطاء الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_type'),         'guardian.medication.medicine_type', 'guardian', '약품 유형', 'Medicine Type', '薬品タイプ', '药品类型', '藥品類型', 'Tipo de medicamento', 'Type de médicament', 'Medikamententyp', 'Tipo de medicamento', 'Loại thuốc', 'ประเภทยา', 'Jenis Obat', 'نوع الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_name'),         'guardian.medication.medicine_name', 'guardian', '약품명', 'Medicine Name', '薬品名', '药品名', '藥品名', 'Nombre del medicamento', 'Nom du médicament', 'Medikamentenname', 'Nome do medicamento', 'Tên thuốc', 'ชื่อยา', 'Nama Obat', 'اسم الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_dose'),         'guardian.medication.dose_amount',   'guardian', '투여량', 'Dose Amount', '投与量', '剂量', '劑量', 'Dosis', 'Dose', 'Dosis', 'Dose', 'Liều lượng', 'ปริมาณยา', 'Dosis', 'الجرعة', true, NOW(), NOW()),
(md5('i18n_med_modal_unit'),         'guardian.medication.dose_unit',     'guardian', '단위', 'Unit', '単位', '单位', '單位', 'Unidad', 'Unité', 'Einheit', 'Unidade', 'Đơn vị', 'หน่วย', 'Satuan', 'الوحدة', true, NOW(), NOW()),
(md5('i18n_med_modal_route'),        'guardian.medication.route',         'guardian', '투여 경로', 'Administration Route', '投与経路', '给药途径', '給藥途徑', 'Vía de administración', 'Voie d''administration', 'Verabreichungsweg', 'Via de administração', 'Đường dùng thuốc', 'เส้นทางการให้ยา', 'Rute Pemberian', 'طريق الإعطاء', true, NOW(), NOW()),
(md5('i18n_med_modal_date'),         'guardian.medication.date',          'guardian', '투여 날짜', 'Date', '投与日', '用药日期', '用藥日期', 'Fecha', 'Date', 'Datum', 'Data', 'Ngày', 'วันที่', 'Tanggal', 'التاريخ', true, NOW(), NOW()),
(md5('i18n_med_modal_time'),         'guardian.medication.time',          'guardian', '투여 시간', 'Time', '投与時間', '用药时间', '用藥時間', 'Hora', 'Heure', 'Uhrzeit', 'Hora', 'Giờ', 'เวลา', 'Waktu', 'الوقت', true, NOW(), NOW()),
(md5('i18n_med_modal_notes'),        'guardian.medication.notes',         'guardian', '메모', 'Notes', 'メモ', '备注', '備註', 'Notas', 'Notes', 'Notizen', 'Notas', 'Ghi chú', 'หมายเหตุ', 'Catatan', 'ملاحظات', true, NOW(), NOW()),
(md5('i18n_med_modal_next'),         'guardian.medication.next_dose',     'guardian', '다음 투여 예정일', 'Next Dose Date', '次回投与予定日', '下次用药日期', '下次用藥日期', 'Próxima dosis', 'Prochaine dose', 'Nächste Dosis', 'Próxima dose', 'Ngày dùng tiếp', 'วันให้ยาครั้งถัดไป', 'Dosis Berikutnya', 'موعد الجرعة التالية', true, NOW(), NOW()),
(md5('i18n_med_modal_prescriber'),   'guardian.medication.prescriber',    'guardian', '처방 수의사', 'Prescriber', '処方獣医師', '处方兽医', '處方獸醫', 'Prescriptor', 'Prescripteur', 'Verschreibender Tierarzt', 'Prescritor', 'Bác sĩ kê đơn', 'สัตวแพทย์ผู้สั่งยา', 'Dokter Penulis Resep', 'الطبيب البيطري', true, NOW(), NOW()),
(md5('i18n_med_modal_save'),         'guardian.medication.save',          'guardian', '저장', 'Save', '保存', '保存', '儲存', 'Guardar', 'Enregistrer', 'Speichern', 'Salvar', 'Lưu', 'บันทึก', 'Simpan', 'حفظ', true, NOW(), NOW()),
(md5('i18n_med_modal_edit_title'),   'guardian.medication.edit_title',    'guardian', '약품 투여 수정', 'Edit Medication', '投薬記録の編集', '编辑用药记录', '編輯用藥記錄', 'Editar medicación', 'Modifier le médicament', 'Medikament bearbeiten', 'Editar medicação', 'Sửa ghi nhận thuốc', 'แก้ไขการให้ยา', 'Edit Pemberian Obat', 'تعديل سجل الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_delete'),       'guardian.medication.delete',        'guardian', '삭제', 'Delete', '削除', '删除', '刪除', 'Eliminar', 'Supprimer', 'Löschen', 'Excluir', 'Xóa', 'ลบ', 'Hapus', 'حذف', true, NOW(), NOW()),
(md5('i18n_med_modal_del_confirm'),  'guardian.medication.delete_confirm','guardian', '이 약품 기록을 삭제하시겠습니까?', 'Delete this medication record?', 'この投薬記録を削除しますか？', '确定删除此用药记录？', '確定刪除此用藥記錄？', '¿Eliminar este registro?', 'Supprimer cet enregistrement ?', 'Diesen Eintrag löschen?', 'Excluir este registro?', 'Xóa bản ghi này?', 'ลบบันทึกนี้?', 'Hapus catatan ini?', 'حذف هذا السجل؟', true, NOW(), NOW()),

-- ── Error messages ───────────────────────────────────────────────────────────
(md5('i18n_med_err_type'),    'guardian.medication.err_type',    'guardian', '약품 유형을 선택해주세요', 'Please select medicine type', '薬品タイプを選択してください', '请选择药品类型', '請選擇藥品類型', 'Seleccione el tipo', 'Sélectionnez le type', 'Bitte Typ wählen', 'Selecione o tipo', 'Chọn loại thuốc', 'กรุณาเลือกประเภทยา', 'Pilih jenis obat', 'يرجى اختيار نوع الدواء', true, NOW(), NOW()),
(md5('i18n_med_err_medicine'),'guardian.medication.err_medicine','guardian', '약품을 선택해주세요', 'Please select a medicine', '薬品を選択してください', '请选择药品', '請選擇藥品', 'Seleccione un medicamento', 'Sélectionnez un médicament', 'Bitte Medikament wählen', 'Selecione um medicamento', 'Chọn một loại thuốc', 'กรุณาเลือกยา', 'Pilih obat', 'يرجى اختيار الدواء', true, NOW(), NOW()),
(md5('i18n_med_err_dose'),   'guardian.medication.err_dose',   'guardian', '투여량을 입력해주세요', 'Please enter dose amount', '投与量を入力してください', '请输入剂量', '請輸入劑量', 'Ingrese la dosis', 'Entrez la dose', 'Bitte Dosis eingeben', 'Insira a dose', 'Nhập liều lượng', 'กรุณากรอกปริมาณยา', 'Masukkan dosis', 'يرجى إدخال الجرعة', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 076_provider_signup_i18n.sql
-- --------------------------------------------------------------------------
-- 076: i18n keys for provider signup Step 3 — enhanced business registration form
-- Language toggle, business info popovers, address, operating hours, certifications

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Language toggle ────────────────────────────────────────────────────────────
(md5('i18n_ps_lang_toggle'), 'public.signup.provider_lang_toggle', 'public', '한국어 / English', 'Korean / English', '韓国語 / English', '韩语 / English', '韓語 / English', 'Coreano / English', 'Coréen / English', 'Koreanisch / English', 'Coreano / English', 'Hàn / English', 'เกาหลี / English', 'Korea / English', 'كورية / English', true, NOW(), NOW()),

-- ── Business info popovers (5 categories) ──────────────────────────────────────
(md5('i18n_ps_info_hospital'), 'public.signup.provider_info_hospital', 'public', '동물병원: 수의사 면허가 필요하며, 진료·수술·예방접종 등 의료 서비스를 제공합니다.', 'Veterinary Hospital: Requires a veterinary license. Provides medical services including treatment, surgery, and vaccinations.', '動物病院：獣医師免許が必要です。診療・手術・予防接種などの医療サービスを提供します。', '动物医院：需要兽医执照，提供诊疗、手术、疫苗等医疗服务。', '動物醫院：需要獸醫執照，提供診療、手術、疫苗等醫療服務。', 'Hospital Veterinario: Requiere licencia veterinaria. Ofrece servicios médicos como tratamiento, cirugía y vacunación.', 'Hôpital Vétérinaire : Nécessite une licence vétérinaire. Fournit des services médicaux.', 'Tierklinik: Erfordert eine Tierarztlizenz. Bietet medizinische Dienstleistungen an.', 'Hospital Veterinário: Requer licença veterinária. Oferece serviços médicos.', 'Bệnh viện thú y: Cần có giấy phép thú y. Cung cấp dịch vụ y tế.', 'โรงพยาบาลสัตว์: ต้องมีใบอนุญาตสัตวแพทย์ ให้บริการทางการแพทย์', 'Rumah Sakit Hewan: Memerlukan izin dokter hewan. Menyediakan layanan medis.', 'مستشفى بيطري: يتطلب ترخيص بيطري. يقدم خدمات طبية.', true, NOW(), NOW()),

(md5('i18n_ps_info_grooming'), 'public.signup.provider_info_grooming', 'public', '미용실: 반려동물 미용·목욕·스파 서비스를 제공합니다. 미용사 자격증이 필요할 수 있습니다.', 'Grooming Salon: Provides grooming, bathing, and spa services for pets. Groomer certification may be required.', 'トリミングサロン：ペットのトリミング・入浴・スパサービスを提供します。', '美容院：提供宠物美容、洗澡、SPA服务。可能需要美容师资格证。', '美容院：提供寵物美容、洗澡、SPA服務。可能需要美容師資格證。', 'Peluquería: Ofrece servicios de peluquería, baño y spa para mascotas.', 'Salon de Toilettage : Offre des services de toilettage, bain et spa pour animaux.', 'Tiersalon: Bietet Pflege-, Bade- und Spa-Dienste für Haustiere an.', 'Salão de Beleza: Oferece serviços de beleza, banho e spa para pets.', 'Tiệm cắt tỉa: Cung cấp dịch vụ cắt tỉa, tắm và spa cho thú cưng.', 'ร้านตัดขน: ให้บริการตัดขน อาบน้ำ และสปาสำหรับสัตว์เลี้ยง', 'Salon Grooming: Menyediakan layanan grooming, mandi, dan spa untuk hewan peliharaan.', 'صالون تجميل: يقدم خدمات التجميل والاستحمام والسبا للحيوانات الأليفة.', true, NOW(), NOW()),

(md5('i18n_ps_info_petshop'), 'public.signup.provider_info_petshop', 'public', '펫샵: 반려동물 용품·사료·간식 등을 판매합니다. 생체 판매 시 별도 허가가 필요합니다.', 'Pet Shop: Sells pet supplies, food, and treats. Live animal sales require additional permits.', 'ペットショップ：ペット用品・フード・おやつ等を販売します。生体販売には別途許可が必要です。', '宠物店：销售宠物用品、饲料、零食等。活体销售需要额外许可。', '寵物店：銷售寵物用品、飼料、零食等。活體銷售需要額外許可。', 'Tienda de Mascotas: Vende suministros, alimentos y golosinas para mascotas.', 'Animalerie : Vend des fournitures, de la nourriture et des friandises pour animaux.', 'Tierhandlung: Verkauft Heimtierbedarf, Futter und Leckerlis.', 'Pet Shop: Vende suprimentos, rações e petiscos para pets.', 'Cửa hàng thú cưng: Bán đồ dùng, thức ăn và đồ ăn vặt cho thú cưng.', 'ร้านสัตว์เลี้ยง: จำหน่ายอุปกรณ์ อาหาร และขนมสำหรับสัตว์เลี้ยง', 'Pet Shop: Menjual perlengkapan, makanan, dan camilan hewan peliharaan.', 'متجر حيوانات: يبيع مستلزمات وأغذية ومكافآت الحيوانات الأليفة.', true, NOW(), NOW()),

(md5('i18n_ps_info_hotel'), 'public.signup.provider_info_hotel', 'public', '펫호텔: 반려동물 돌봄·위탁·데이케어 서비스를 제공합니다.', 'Pet Hotel: Provides pet boarding, daycare, and overnight care services.', 'ペットホテル：ペットの預かり・デイケアサービスを提供します。', '宠物酒店：提供宠物寄养、日托和过夜看护服务。', '寵物旅館：提供寵物寄養、日托和過夜看護服務。', 'Hotel para Mascotas: Ofrece servicios de alojamiento, guardería y cuidado nocturno.', 'Hôtel pour Animaux : Offre des services de pension, garderie et garde de nuit.', 'Tierhotel: Bietet Tierpension, Tagesbetreuung und Nachtpflege an.', 'Hotel Pet: Oferece serviços de hospedagem, creche e cuidados noturnos.', 'Khách sạn thú cưng: Cung cấp dịch vụ trông giữ, chăm sóc ban ngày và qua đêm.', 'โรงแรมสัตว์เลี้ยง: ให้บริการรับฝาก ดูแลกลางวัน และดูแลค้างคืน', 'Hotel Hewan: Menyediakan layanan penitipan, penitipan harian, dan perawatan menginap.', 'فندق حيوانات: يقدم خدمات الإيواء والرعاية النهارية والليلية.', true, NOW(), NOW()),

(md5('i18n_ps_info_training'), 'public.signup.provider_info_training', 'public', '훈련소: 반려동물 행동 교정·복종 훈련·사회화 프로그램을 제공합니다. 훈련사 자격증이 필요할 수 있습니다.', 'Training Center: Provides behavior correction, obedience training, and socialization programs. Trainer certification may be required.', '訓練所：行動矯正・服従訓練・社会化プログラムを提供します。', '训练中心：提供行为矫正、服从训练和社会化计划。可能需要训练师资格证。', '訓練中心：提供行為矯正、服從訓練和社會化計劃。可能需要訓練師資格證。', 'Centro de Entrenamiento: Ofrece corrección de comportamiento, entrenamiento de obediencia y socialización.', 'Centre de Dressage : Offre correction comportementale, obéissance et socialisation.', 'Trainingszentrum: Bietet Verhaltenskorrektur, Gehorsamkeitstraining und Sozialisation.', 'Centro de Treinamento: Oferece correção comportamental, treinamento de obediência e socialização.', 'Trung tâm huấn luyện: Cung cấp chương trình chỉnh hành vi, huấn luyện và xã hội hóa.', 'ศูนย์ฝึก: ให้บริการแก้ไขพฤติกรรม ฝึกเชื่อฟัง และโปรแกรมสังคม', 'Pusat Pelatihan: Menyediakan koreksi perilaku, pelatihan kepatuhan, dan sosialisasi.', 'مركز تدريب: يقدم تصحيح السلوك وتدريب الطاعة وبرامج التنشئة الاجتماعية.', true, NOW(), NOW()),

-- ── Address labels ──────────────────────────────────────────────────────────────
(md5('i18n_ps_addr_state'), 'public.signup.provider_address_state', 'public', '시/도', 'State/Province', '都道府県', '省/市', '省/市', 'Estado/Provincia', 'État/Province', 'Bundesland', 'Estado/Província', 'Tỉnh/Thành phố', 'จังหวัด', 'Provinsi', 'المحافظة', true, NOW(), NOW()),
(md5('i18n_ps_addr_city'), 'public.signup.provider_address_city', 'public', '시/군/구', 'City/District', '市区町村', '区/县', '區/縣', 'Ciudad/Distrito', 'Ville/District', 'Stadt/Bezirk', 'Cidade/Distrito', 'Quận/Huyện', 'อำเภอ/เขต', 'Kota/Kabupaten', 'المدينة/المنطقة', true, NOW(), NOW()),
(md5('i18n_ps_addr_detail'), 'public.signup.provider_address_detail', 'public', '상세 주소', 'Detailed Address', '詳細住所', '详细地址', '詳細地址', 'Dirección detallada', 'Adresse détaillée', 'Detaillierte Adresse', 'Endereço detalhado', 'Địa chỉ chi tiết', 'ที่อยู่โดยละเอียด', 'Alamat Lengkap', 'العنوان التفصيلي', true, NOW(), NOW()),
(md5('i18n_ps_addr_flat'), 'public.signup.provider_address_flat', 'public', '주소', 'Address', '住所', '地址', '地址', 'Dirección', 'Adresse', 'Adresse', 'Endereço', 'Địa chỉ', 'ที่อยู่', 'Alamat', 'العنوان', true, NOW(), NOW()),

-- ── Operating hours ─────────────────────────────────────────────────────────────
(md5('i18n_ps_hours_mon'), 'public.signup.provider_hours_mon', 'public', '월', 'Mon', '月', '一', '一', 'Lun', 'Lun', 'Mo', 'Seg', 'T2', 'จ.', 'Sen', 'الإثنين', true, NOW(), NOW()),
(md5('i18n_ps_hours_tue'), 'public.signup.provider_hours_tue', 'public', '화', 'Tue', '火', '二', '二', 'Mar', 'Mar', 'Di', 'Ter', 'T3', 'อ.', 'Sel', 'الثلاثاء', true, NOW(), NOW()),
(md5('i18n_ps_hours_wed'), 'public.signup.provider_hours_wed', 'public', '수', 'Wed', '水', '三', '三', 'Mié', 'Mer', 'Mi', 'Qua', 'T4', 'พ.', 'Rab', 'الأربعاء', true, NOW(), NOW()),
(md5('i18n_ps_hours_thu'), 'public.signup.provider_hours_thu', 'public', '목', 'Thu', '木', '四', '四', 'Jue', 'Jeu', 'Do', 'Qui', 'T5', 'พฤ.', 'Kam', 'الخميس', true, NOW(), NOW()),
(md5('i18n_ps_hours_fri'), 'public.signup.provider_hours_fri', 'public', '금', 'Fri', '金', '五', '五', 'Vie', 'Ven', 'Fr', 'Sex', 'T6', 'ศ.', 'Jum', 'الجمعة', true, NOW(), NOW()),
(md5('i18n_ps_hours_sat'), 'public.signup.provider_hours_sat', 'public', '토', 'Sat', '土', '六', '六', 'Sáb', 'Sam', 'Sa', 'Sáb', 'T7', 'ส.', 'Sab', 'السبت', true, NOW(), NOW()),
(md5('i18n_ps_hours_sun'), 'public.signup.provider_hours_sun', 'public', '일', 'Sun', '日', '日', '日', 'Dom', 'Dim', 'So', 'Dom', 'CN', 'อา.', 'Min', 'الأحد', true, NOW(), NOW()),
(md5('i18n_ps_hours_open'), 'public.signup.provider_hours_open', 'public', '오픈', 'Open', '開店', '开门', '開門', 'Apertura', 'Ouverture', 'Öffnung', 'Abertura', 'Mở cửa', 'เปิด', 'Buka', 'مفتوح', true, NOW(), NOW()),
(md5('i18n_ps_hours_close'), 'public.signup.provider_hours_close', 'public', '마감', 'Close', '閉店', '关门', '關門', 'Cierre', 'Fermeture', 'Schluss', 'Fechamento', 'Đóng cửa', 'ปิด', 'Tutup', 'مغلق', true, NOW(), NOW()),
(md5('i18n_ps_hours_closed'), 'public.signup.provider_hours_closed', 'public', '휴무', 'Closed', '定休日', '休息', '休息', 'Cerrado', 'Fermé', 'Geschlossen', 'Fechado', 'Nghỉ', 'หยุด', 'Libur', 'عطلة', true, NOW(), NOW()),
(md5('i18n_ps_hours_title'), 'public.signup.provider_hours_title', 'public', '운영 시간', 'Operating Hours', '営業時間', '营业时间', '營業時間', 'Horario de operación', 'Heures d''ouverture', 'Öffnungszeiten', 'Horário de funcionamento', 'Giờ hoạt động', 'เวลาทำการ', 'Jam Operasional', 'ساعات العمل', true, NOW(), NOW()),

-- ── Certifications ──────────────────────────────────────────────────────────────
(md5('i18n_ps_cert_add'), 'public.signup.provider_cert_add', 'public', '자격증 추가', 'Add Certificate', '資格証追加', '添加证书', '添加證書', 'Agregar certificado', 'Ajouter un certificat', 'Zertifikat hinzufügen', 'Adicionar certificado', 'Thêm chứng chỉ', 'เพิ่มใบรับรอง', 'Tambah Sertifikat', 'إضافة شهادة', true, NOW(), NOW()),
(md5('i18n_ps_cert_placeholder'), 'public.signup.provider_cert_placeholder', 'public', '자격증명을 입력하고 Enter', 'Type certificate name and press Enter', '資格名を入力してEnter', '输入证书名称并按Enter', '輸入證書名稱並按Enter', 'Escriba y presione Enter', 'Tapez et appuyez sur Entrée', 'Eingeben und Enter drücken', 'Digite e pressione Enter', 'Nhập và nhấn Enter', 'พิมพ์แล้วกด Enter', 'Ketik lalu tekan Enter', 'اكتب واضغط Enter', true, NOW(), NOW()),

-- ── Business info label ─────────────────────────────────────────────────────────
(md5('i18n_ps_biz_info'), 'public.signup.provider_biz_info', 'public', '업종 안내', 'Business Info', '業種案内', '行业说明', '行業說明', 'Info del negocio', 'Info entreprise', 'Brancheninfo', 'Info do negócio', 'Thông tin ngành', 'ข้อมูลธุรกิจ', 'Info Bisnis', 'معلومات العمل', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 077_signup_step3_i18n.sql
-- --------------------------------------------------------------------------
-- 077: i18n keys for provider signup Step 3 — map button + pet type "all" option

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- Map button
(md5('i18n_ps_address_map'), 'public.signup.provider_address_map', 'public', '지도에서 선택', 'Select on Map', '地図で選択', '在地图上选择', '在地圖上選擇', 'Seleccionar en mapa', 'Sélectionner sur la carte', 'Auf Karte auswählen', 'Selecionar no mapa', 'Chọn trên bản đồ', 'เลือกบนแผนที่', 'Pilih di peta', 'اختر على الخريطة', true, NOW(), NOW()),

(md5('i18n_ps_address_map_disabled'), 'public.signup.provider_address_map_disabled', 'public', '준비 중', 'Coming soon', '準備中', '准备中', '準備中', 'Próximamente', 'Bientôt disponible', 'Demnächst', 'Em breve', 'Sắp ra mắt', 'เร็วๆ นี้', 'Segera hadir', 'قريبا', true, NOW(), NOW()),

-- Pet type "All" option
(md5('i18n_ps_pet_all'), 'public.signup.provider_pet_all', 'public', '전체', 'All', '全て', '全部', '全部', 'Todos', 'Tous', 'Alle', 'Todos', 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 078_home_i18n.sql
-- --------------------------------------------------------------------------
-- 078: i18n keys for PublicHome — supplier feed tab + right panel widgets

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

(md5('i18n_public_feed_supplier'), 'public.feed.supplier', 'public', '업종 피드', 'Business Feed', 'ビジネスフィード', '商家动态', '商家動態', 'Feed de negocios', 'Flux professionnels', 'Geschäfts-Feed', 'Feed de negócios', 'Nguồn cấp dữ liệu doanh nghiệp', 'ฟีดธุรกิจ', 'Feed bisnis', 'موجز الأعمال', true, NOW(), NOW()),

(md5('i18n_public_widget_guardian_role'), 'public.widget.guardian_role', 'public', 'Petfolio 가디언', 'Petfolio Guardian', 'Petfolio ガーディアン', 'Petfolio 守护者', 'Petfolio 守護者', 'Petfolio Guardián', 'Petfolio Gardien', 'Petfolio Hüter', 'Petfolio Guardião', 'Petfolio Người giám hộ', 'Petfolio ผู้ดูแล', 'Petfolio Penjaga', 'Petfolio الوصي', true, NOW(), NOW()),

(md5('i18n_public_widget_provider_role'), 'public.widget.provider_role', 'public', 'Petfolio 공급자', 'Petfolio Provider', 'Petfolio プロバイダー', 'Petfolio 供应商', 'Petfolio 供應商', 'Petfolio Proveedor', 'Petfolio Fournisseur', 'Petfolio Anbieter', 'Petfolio Fornecedor', 'Petfolio Nhà cung cấp', 'Petfolio ผู้ให้บริการ', 'Petfolio Penyedia', 'Petfolio مزوّد', true, NOW(), NOW()),

(md5('i18n_public_widget_my_pet'), 'public.widget.my_pet', 'public', '내 반려동물', 'My Pet', '私のペット', '我的宠物', '我的寵物', 'Mi mascota', 'Mon animal', 'Mein Haustier', 'Meu pet', 'Thú cưng của tôi', 'สัตว์เลี้ยงของฉัน', 'Hewan peliharaan saya', 'حيواني الأليف', true, NOW(), NOW()),

(md5('i18n_public_widget_next_booking'), 'public.widget.next_booking', 'public', '다음 예약', 'Next Booking', '次の予約', '下一个预约', '下一個預約', 'Próxima reserva', 'Prochaine réservation', 'Nächste Buchung', 'Próxima reserva', 'Lịch hẹn tiếp theo', 'การจองถัดไป', 'Pemesanan berikutnya', 'الحجز التالي', true, NOW(), NOW()),

(md5('i18n_public_widget_no_booking'), 'public.widget.no_booking', 'public', '예정된 일정 없음', 'No upcoming schedule', '予定なし', '暂无预约', '暫無預約', 'Sin citas pendientes', 'Aucun rendez-vous prévu', 'Keine Termine geplant', 'Nenhum agendamento', 'Không có lịch hẹn', 'ไม่มีนัดหมาย', 'Tidak ada jadwal', 'لا مواعيد قادمة', true, NOW(), NOW()),

(md5('i18n_public_widget_no_pet'), 'public.widget.no_pet', 'public', '등록된 반려동물이 없습니다', 'No pets registered', 'ペットが登録されていません', '暂无宠物', '尚未註冊寵物', 'No hay mascotas registradas', 'Aucun animal enregistré', 'Keine Haustiere registriert', 'Nenhum pet cadastrado', 'Chưa có thú cưng nào', 'ยังไม่มีสัตว์เลี้ยง', 'Belum ada hewan peliharaan', 'لا حيوانات أليفة مسجلة', true, NOW(), NOW()),

(md5('i18n_public_widget_login_prompt'), 'public.widget.login_prompt', 'public', '로그인하고 반려동물을 등록하세요', 'Log in to register your pet', 'ログインしてペットを登録しましょう', '登录后注册您的宠物', '登入以註冊您的寵物', 'Inicia sesión para registrar tu mascota', 'Connectez-vous pour enregistrer votre animal', 'Melden Sie sich an, um Ihr Haustier zu registrieren', 'Faça login para cadastrar seu pet', 'Đăng nhập để đăng ký thú cưng', 'เข้าสู่ระบบเพื่อลงทะเบียนสัตว์เลี้ยง', 'Masuk untuk mendaftarkan hewan peliharaan', 'سجّل الدخول لتسجيل حيوانك الأليف', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 079_friend_feed_i18n.sql
-- --------------------------------------------------------------------------
-- 079: i18n keys for friend system + feed separation + notifications

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Friend buttons ─────────────────────────────────────────────────────────────
(md5('i18n_fr_btn_guardian'),  'friend.btn.add_guardian',  'public', '친구 신청', 'Add Friend', '友達申請', '添加好友', '加好友', 'Agregar amigo', 'Ajouter un ami', 'Freund hinzufügen', 'Adicionar amigo', 'Kết bạn', 'เพิ่มเพื่อน', 'Tambah Teman', 'إضافة صديق', true, NOW(), NOW()),
(md5('i18n_fr_btn_provider'),  'friend.btn.add_provider',  'public', '단골 맺기', 'Become Regular', '常連になる', '成为常客', '成為常客', 'Hacerse habitual', 'Devenir habitué', 'Stammkunde werden', 'Tornar-se frequente', 'Trở thành khách quen', 'เป็นลูกค้าประจำ', 'Jadi Pelanggan', 'أصبح عميلاً منتظماً', true, NOW(), NOW()),
(md5('i18n_fr_btn_pending'),   'friend.btn.pending',       'public', '신청 중', 'Pending', '申請中', '申请中', '申請中', 'Pendiente', 'En attente', 'Ausstehend', 'Pendente', 'Đang chờ', 'รอดำเนินการ', 'Menunggu', 'قيد الانتظار', true, NOW(), NOW()),
(md5('i18n_fr_btn_accepted'),  'friend.btn.accepted',      'public', '친구', 'Friends', '友達', '好友', '好友', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),
(md5('i18n_fr_btn_unfriend'),  'friend.btn.unfriend',      'public', '친구 삭제', 'Remove Friend', '友達解除', '删除好友', '刪除好友', 'Eliminar amigo', 'Supprimer l''ami', 'Freund entfernen', 'Remover amigo', 'Hủy kết bạn', 'ลบเพื่อน', 'Hapus Teman', 'إزالة صديق', true, NOW(), NOW()),
(md5('i18n_fr_unfriend_cfm'),  'friend.unfriend.confirm',  'public', '정말 친구를 삭제하시겠습니까?', 'Remove this friend?', 'この友達を解除しますか？', '确定删除好友？', '確定刪除好友？', '¿Eliminar este amigo?', 'Supprimer cet ami ?', 'Diesen Freund entfernen?', 'Remover este amigo?', 'Hủy kết bạn này?', 'ลบเพื่อนนี้?', 'Hapus teman ini?', 'إزالة هذا الصديق؟', true, NOW(), NOW()),
(md5('i18n_fr_section_title'), 'friend.section.title',     'public', '친구', 'Friends', '友達', '好友', '好友', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),

-- ── Notifications ──────────────────────────────────────────────────────────────
(md5('i18n_notif_title'),      'notification.title',           'common', '알림', 'Notifications', '通知', '通知', '通知', 'Notificaciones', 'Notifications', 'Benachrichtigungen', 'Notificações', 'Thông báo', 'การแจ้งเตือน', 'Notifikasi', 'الإشعارات', true, NOW(), NOW()),
(md5('i18n_notif_fr_req'),     'notification.friend_request',  'common', '님이 친구 요청을 보냈습니다', 'sent you a friend request', 'さんから友達リクエストが届きました', '向您发送了好友请求', '向您發送了好友請求', 'te envió una solicitud de amistad', 'vous a envoyé une demande d''ami', 'hat Ihnen eine Freundschaftsanfrage gesendet', 'enviou um pedido de amizade', 'đã gửi lời mời kết bạn', 'ส่งคำขอเป็นเพื่อนถึงคุณ', 'mengirim permintaan pertemanan', 'أرسل لك طلب صداقة', true, NOW(), NOW()),
(md5('i18n_notif_fr_acc'),     'notification.friend_accepted', 'common', '님이 친구 요청을 수락했습니다', 'accepted your friend request', 'さんが友達リクエストを承認しました', '接受了您的好友请求', '接受了您的好友請求', 'aceptó tu solicitud de amistad', 'a accepté votre demande d''ami', 'hat Ihre Freundschaftsanfrage angenommen', 'aceitou seu pedido de amizade', 'đã chấp nhận lời mời kết bạn', 'ยอมรับคำขอเป็นเพื่อนของคุณ', 'menerima permintaan pertemanan Anda', 'قبل طلب صداقتك', true, NOW(), NOW()),
(md5('i18n_notif_empty'),      'notification.empty',           'common', '알림이 없습니다', 'No notifications', '通知はありません', '没有通知', '沒有通知', 'Sin notificaciones', 'Aucune notification', 'Keine Benachrichtigungen', 'Sem notificações', 'Không có thông báo', 'ไม่มีการแจ้งเตือน', 'Tidak ada notifikasi', 'لا توجد إشعارات', true, NOW(), NOW()),
(md5('i18n_notif_mark_read'),  'notification.mark_read',       'common', '읽음 처리', 'Mark as read', '既読にする', '标为已读', '標為已讀', 'Marcar como leído', 'Marquer comme lu', 'Als gelesen markieren', 'Marcar como lido', 'Đánh dấu đã đọc', 'ทำเครื่องหมายว่าอ่านแล้ว', 'Tandai telah dibaca', 'تعليم كمقروء', true, NOW(), NOW()),

-- ── Feed tab label ─────────────────────────────────────────────────────────────
(md5('i18n_feed_my_feed'),     'public.feed.my_feed',          'public', '내 피드', 'My Feed', 'マイフィード', '我的动态', '我的動態', 'Mi feed', 'Mon fil', 'Mein Feed', 'Meu feed', 'Bảng tin của tôi', 'ฟีดของฉัน', 'Feed Saya', 'خلاصتي', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 080_friends_modal_i18n.sql
-- --------------------------------------------------------------------------
-- 080: i18n keys for FriendsModal (guardian page)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Modal title & tabs ───────────────────────────────────────────────────────
(md5('i18n_gf_title'),        'guardian.friends.title',        'guardian', '친구', 'Friends', '友達', '好友', '好友', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),
(md5('i18n_gf_tab_friends'),  'guardian.friends.tab_friends',  'guardian', '친구 목록', 'Friends', '友達リスト', '好友列表', '好友列表', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),
(md5('i18n_gf_tab_pending'),  'guardian.friends.tab_pending',  'guardian', '대기중 요청', 'Pending', '承認待ち', '待处理', '待處理', 'Pendientes', 'En attente', 'Ausstehend', 'Pendentes', 'Đang chờ', 'รอดำเนินการ', 'Menunggu', 'قيد الانتظار', true, NOW(), NOW()),

-- ── Accept / Reject ──────────────────────────────────────────────────────────
(md5('i18n_gf_accept'),       'guardian.friends.accept',       'guardian', '수락', 'Accept', '承認', '接受', '接受', 'Aceptar', 'Accepter', 'Annehmen', 'Aceitar', 'Chấp nhận', 'ยอมรับ', 'Terima', 'قبول', true, NOW(), NOW()),
(md5('i18n_gf_reject'),       'guardian.friends.reject',       'guardian', '거절', 'Reject', '拒否', '拒绝', '拒絕', 'Rechazar', 'Refuser', 'Ablehnen', 'Rejeitar', 'Từ chối', 'ปฏิเสธ', 'Tolak', 'رفض', true, NOW(), NOW()),
(md5('i18n_gf_respond_fail'), 'guardian.friends.respond_failed','guardian', '요청 처리에 실패했습니다.', 'Failed to process request.', 'リクエストの処理に失敗しました。', '处理请求失败。', '處理請求失敗。', 'Error al procesar la solicitud.', 'Échec du traitement de la demande.', 'Anfrage konnte nicht verarbeitet werden.', 'Falha ao processar a solicitação.', 'Không thể xử lý yêu cầu.', 'ไม่สามารถดำเนินการตามคำขอได้', 'Gagal memproses permintaan.', 'فشل في معالجة الطلب.', true, NOW(), NOW()),

-- ── Empty states ─────────────────────────────────────────────────────────────
(md5('i18n_gf_empty_title'),  'guardian.friends.empty_title',  'guardian', '아직 친구가 없어요', 'No friends yet', 'まだ友達がいません', '还没有好友', '還沒有好友', 'Aún no hay amigos', 'Pas encore d''amis', 'Noch keine Freunde', 'Ainda sem amigos', 'Chưa có bạn bè', 'ยังไม่มีเพื่อน', 'Belum ada teman', 'لا يوجد أصدقاء بعد', true, NOW(), NOW()),
(md5('i18n_gf_empty_desc'),   'guardian.friends.empty_desc',   'guardian', '피드에서 친구 요청을 보내 연결해보세요.', 'Send friend requests from the feed to connect.', 'フィードから友達リクエストを送って繋がりましょう。', '从动态中发送好友请求来建立联系。', '從動態中發送好友請求來建立聯繫。', 'Envía solicitudes de amistad desde el feed.', 'Envoyez des demandes d''ami depuis le fil.', 'Senden Sie Freundschaftsanfragen aus dem Feed.', 'Envie pedidos de amizade pelo feed.', 'Gửi lời mời kết bạn từ bảng tin.', 'ส่งคำขอเป็นเพื่อนจากฟีด', 'Kirim permintaan pertemanan dari feed.', 'أرسل طلبات صداقة من الخلاصة.', true, NOW(), NOW()),
(md5('i18n_gf_nopend_title'), 'guardian.friends.no_pending_title','guardian', '대기중인 요청이 없어요', 'No pending requests', '承認待ちのリクエストはありません', '没有待处理的请求', '沒有待處理的請求', 'No hay solicitudes pendientes', 'Aucune demande en attente', 'Keine ausstehenden Anfragen', 'Sem pedidos pendentes', 'Không có yêu cầu đang chờ', 'ไม่มีคำขอที่รอดำเนินการ', 'Tidak ada permintaan tertunda', 'لا توجد طلبات معلقة', true, NOW(), NOW()),
(md5('i18n_gf_nopend_desc'),  'guardian.friends.no_pending_desc','guardian', '모든 요청을 처리했어요!', 'You''re all caught up!', 'すべてのリクエストを処理しました！', '所有请求已处理！', '所有請求已處理！', '¡Todo al día!', 'Tout est à jour !', 'Alles erledigt!', 'Tudo em dia!', 'Đã xử lý hết!', 'ดำเนินการครบแล้ว!', 'Semua sudah ditangani!', 'تم التعامل مع الكل!', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 081_friends_card_i18n.sql
-- --------------------------------------------------------------------------
-- 081: i18n keys for enriched friend request cards (guardian resume style)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Friend card sections ────────────────────────────────────────────────────
(md5('i18n_gfc_pets_title'),    'guardian.friends.card.pets_title',    'guardian', '반려동물', 'Pets', 'ペット', '宠物', '寵物', 'Mascotas', 'Animaux', 'Haustiere', 'Pets', 'Thú cưng', 'สัตว์เลี้ยง', 'Hewan Peliharaan', 'حيوانات أليفة', true, NOW(), NOW()),
(md5('i18n_gfc_more_pets'),     'guardian.friends.card.more_pets',     'guardian', '+{count}마리 더', '+{count} more', '+{count}匹', '+{count}只', '+{count}隻', '+{count} más', '+{count} de plus', '+{count} mehr', '+{count} mais', '+{count} nữa', '+{count} เพิ่มเติม', '+{count} lagi', '+{count} أخرى', true, NOW(), NOW()),
(md5('i18n_gfc_recent_posts'),  'guardian.friends.card.recent_posts',  'guardian', '최근 게시물', 'Recent Posts', '最近の投稿', '最近帖子', '最近貼文', 'Publicaciones recientes', 'Publications récentes', 'Neueste Beiträge', 'Posts recentes', 'Bài đăng gần đây', 'โพสต์ล่าสุด', 'Postingan Terbaru', 'المنشورات الأخيرة', true, NOW(), NOW()),
(md5('i18n_gfc_no_pets'),       'guardian.friends.card.no_pets',       'guardian', '등록된 반려동물이 없습니다', 'No pets registered', 'ペットが登録されていません', '没有注册宠物', '沒有註冊寵物', 'Sin mascotas registradas', 'Aucun animal enregistré', 'Keine Haustiere registriert', 'Sem pets registrados', 'Chưa đăng ký thú cưng', 'ไม่มีสัตว์เลี้ยงที่ลงทะเบียน', 'Belum ada hewan peliharaan', 'لا توجد حيوانات مسجلة', true, NOW(), NOW()),
(md5('i18n_gfc_requested_at'),  'guardian.friends.card.requested_at',  'guardian', '요청일', 'Requested', 'リクエスト日', '请求日期', '請求日期', 'Solicitado', 'Demandé le', 'Angefragt am', 'Solicitado em', 'Ngày yêu cầu', 'วันที่ขอ', 'Tanggal permintaan', 'تاريخ الطلب', true, NOW(), NOW()),
(md5('i18n_gfc_pet_age'),       'guardian.friends.card.pet_age',       'guardian', '{age}세', '{age}y', '{age}歳', '{age}岁', '{age}歲', '{age}a', '{age}a', '{age}J', '{age}a', '{age}t', '{age}ปี', '{age}th', '{age}سنة', true, NOW(), NOW()),
(md5('i18n_gfc_joined'),        'guardian.friends.card.joined',        'guardian', '가입', 'Joined', '登録', '加入', '加入', 'Registrado', 'Inscrit', 'Beigetreten', 'Registrado', 'Tham gia', 'เข้าร่วม', 'Bergabung', 'انضم', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 082_profile_edit_i18n.sql
-- --------------------------------------------------------------------------
-- 081: i18n keys for profile edit modal — country/region/city fields

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Profile field labels ────────────────────────────────────────────────────
(md5('i18n_pf_country'),  'profile.field.country',  'guardian', '국가', 'Country', '国', '国家', '國家', 'País', 'Pays', 'Land', 'País', 'Quốc gia', 'ประเทศ', 'Negara', 'البلد', true, NOW(), NOW()),
(md5('i18n_pf_region'),   'profile.field.region',   'guardian', '시/도', 'Region', '都道府県', '省/州', '縣/市', 'Región', 'Région', 'Region', 'Região', 'Vùng', 'ภูมิภาค', 'Wilayah', 'المنطقة', true, NOW(), NOW()),
(md5('i18n_pf_city'),     'profile.field.city',     'guardian', '시/군/구', 'City', '市区町村', '城市', '城市', 'Ciudad', 'Ville', 'Stadt', 'Cidade', 'Thành phố', 'เมือง', 'Kota', 'المدينة', true, NOW(), NOW()),

-- ── Placeholders ────────────────────────────────────────────────────────────
(md5('i18n_pf_ph_country'), 'profile.placeholder.select_country', 'guardian', '국가를 선택하세요', 'Select country', '国を選択', '选择国家', '選擇國家', 'Selecciona un país', 'Sélectionner un pays', 'Land auswählen', 'Selecione um país', 'Chọn quốc gia', 'เลือกประเทศ', 'Pilih negara', 'اختر البلد', true, NOW(), NOW()),
(md5('i18n_pf_ph_region'),  'profile.placeholder.select_region',  'guardian', '시/도를 선택하세요', 'Select region', '都道府県を選択', '选择省/州', '選擇縣/市', 'Selecciona una región', 'Sélectionner une région', 'Region auswählen', 'Selecione uma região', 'Chọn vùng', 'เลือกภูมิภาค', 'Pilih wilayah', 'اختر المنطقة', true, NOW(), NOW()),
(md5('i18n_pf_ph_city'),    'profile.placeholder.select_city',    'guardian', '시/군/구를 선택하세요', 'Select city', '市区町村を選択', '选择城市', '選擇城市', 'Selecciona una ciudad', 'Sélectionner une ville', 'Stadt auswählen', 'Selecione uma cidade', 'Chọn thành phố', 'เลือกเมือง', 'Pilih kota', 'اختر المدينة', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 082_supplier_post_i18n.sql
-- --------------------------------------------------------------------------
-- 082: i18n keys for supplier post feature (13 languages)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Compose modal ────────────────────────────────────────────────────────────
(md5('i18n_sp_placeholder'),   'supplier.post.placeholder',    'supplier', '업종 소식을 공유해보세요', 'Share your business news', 'ビジネスニュースを共有しましょう', '分享您的业务动态', '分享您的業務動態', 'Comparte tus noticias de negocio', 'Partagez vos actualités', 'Teilen Sie Ihre Geschäftsneuigkeiten', 'Compartilhe suas novidades', 'Chia sẻ tin tức kinh doanh', 'แชร์ข่าวสารธุรกิจ', 'Bagikan berita bisnis Anda', 'شارك أخبار عملك', true, NOW(), NOW()),
(md5('i18n_sp_create_title'),  'supplier.post.create_title',   'supplier', '게시글 작성', 'Create Post', '投稿作成', '创建帖子', '建立貼文', 'Crear publicación', 'Créer une publication', 'Beitrag erstellen', 'Criar publicação', 'Tạo bài viết', 'สร้างโพสต์', 'Buat Postingan', 'إنشاء منشور', true, NOW(), NOW()),
(md5('i18n_sp_post_type'),     'supplier.post.post_type',      'supplier', '게시글 유형', 'Post Type', '投稿タイプ', '帖子类型', '貼文類型', 'Tipo de publicación', 'Type de publication', 'Beitragstyp', 'Tipo de publicação', 'Loại bài viết', 'ประเภทโพสต์', 'Jenis Postingan', 'نوع المنشور', true, NOW(), NOW()),

-- ── Post types ───────────────────────────────────────────────────────────────
(md5('i18n_sp_type_general'),  'supplier.post.type.general',   'supplier', '일반', 'General', '一般', '一般', '一般', 'General', 'Général', 'Allgemein', 'Geral', 'Chung', 'ทั่วไป', 'Umum', 'عام', true, NOW(), NOW()),
(md5('i18n_sp_type_news'),     'supplier.post.type.news',      'supplier', '소식', 'News', 'ニュース', '资讯', '資訊', 'Noticias', 'Actualités', 'Nachrichten', 'Notícias', 'Tin tức', 'ข่าวสาร', 'Berita', 'أخبار', true, NOW(), NOW()),
(md5('i18n_sp_type_product'),  'supplier.post.type.product',   'supplier', '제품/서비스', 'Product', 'プロダクト', '产品', '產品', 'Producto', 'Produit', 'Produkt', 'Produto', 'Sản phẩm', 'สินค้า', 'Produk', 'منتج', true, NOW(), NOW()),
(md5('i18n_sp_type_event'),    'supplier.post.type.event',     'supplier', '이벤트/프로모션', 'Event', 'イベント', '活动', '活動', 'Evento', 'Événement', 'Veranstaltung', 'Evento', 'Sự kiện', 'กิจกรรม', 'Acara', 'حدث', true, NOW(), NOW()),
(md5('i18n_sp_type_hiring'),   'supplier.post.type.hiring',    'supplier', '채용', 'Hiring', '採用', '招聘', '徵才', 'Empleo', 'Recrutement', 'Stellenangebot', 'Vagas', 'Tuyển dụng', 'รับสมัครงาน', 'Lowongan', 'توظيف', true, NOW(), NOW()),

-- ── Feed section in supplier dashboard ───────────────────────────────────────
(md5('i18n_sp_feed_title'),    'supplier.feed.title',          'supplier', '내 게시글', 'My Posts', '私の投稿', '我的帖子', '我的貼文', 'Mis publicaciones', 'Mes publications', 'Meine Beiträge', 'Minhas publicações', 'Bài viết của tôi', 'โพสต์ของฉัน', 'Postingan Saya', 'منشوراتي', true, NOW(), NOW()),
(md5('i18n_sp_feed_empty'),    'supplier.feed.empty',          'supplier', '아직 작성한 게시글이 없습니다.', 'No posts yet.', 'まだ投稿がありません。', '还没有帖子。', '還沒有貼文。', 'Aún no hay publicaciones.', 'Aucune publication pour le moment.', 'Noch keine Beiträge.', 'Ainda não há publicações.', 'Chưa có bài viết nào.', 'ยังไม่มีโพสต์', 'Belum ada postingan.', 'لا توجد منشورات بعد.', true, NOW(), NOW()),

-- ── Badge label for public feed ──────────────────────────────────────────────
(md5('i18n_sp_badge_supplier'),'supplier.badge.supplier',      'public', '업종', 'Business', 'ビジネス', '商家', '商家', 'Negocio', 'Entreprise', 'Unternehmen', 'Negócio', 'Doanh nghiệp', 'ธุรกิจ', 'Bisnis', 'أعمال', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 083_supplier_card_i18n.sql
-- --------------------------------------------------------------------------
-- 083: i18n keys for supplier card UI enhancements

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(md5('i18n_sc_view_store'), 'supplier.card.view_store', 'supplier', '업체 보기', 'View Store', '店舗を見る', '查看店铺', '查看店鋪', 'Ver tienda', 'Voir boutique', 'Laden ansehen', 'Ver loja', 'Xem cửa hàng', 'ดูร้านค้า', 'Lihat Toko', 'عرض المتجر', true, NOW(), NOW()),
(md5('i18n_sc_sponsored'), 'supplier.card.sponsored', 'supplier', 'Sponsored', 'Sponsored', 'スポンサー', '推广', '推廣', 'Patrocinado', 'Sponsorisé', 'Gesponsert', 'Patrocinado', 'Được tài trợ', 'สปอนเซอร์', 'Bersponsor', 'ممول', true, NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar;


-- --------------------------------------------------------------------------
-- Source: 084_recommendation_i18n.sql
-- --------------------------------------------------------------------------
-- 084: i18n keys for user recommendation cards

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(md5('i18n_reco_title'),          'public.recommend.card_title',     'public', '추천 Guardian', 'Recommended Guardian', 'おすすめガーディアン', '推荐监护人', '推薦監護人', 'Guardian recomendado', 'Guardian recommandé', 'Empfohlener Guardian', 'Guardian recomendado', 'Guardian được đề xuất', 'ผู้ดูแลที่แนะนำ', 'Guardian Direkomendasikan', 'وصي موصى به', true, NOW(), NOW()),
(md5('i18n_reco_reason_breed'),   'public.recommend.reason_breed',   'public', '같은 품종', 'Same breed', '同じ品種', '相同品种', '相同品種', 'Misma raza', 'Même race', 'Gleiche Rasse', 'Mesma raça', 'Cùng giống', 'สายพันธุ์เดียวกัน', 'Ras yang sama', 'نفس السلالة', true, NOW(), NOW()),
(md5('i18n_reco_reason_mutual'),  'public.recommend.reason_mutual',  'public', '함께 아는 친구 {n}명', '{n} mutual friends', '共通の友達 {n}人', '{n}个共同好友', '{n}個共同好友', '{n} amigos en común', '{n} amis en commun', '{n} gemeinsame Freunde', '{n} amigos em comum', '{n} bạn chung', 'เพื่อนร่วม {n} คน', '{n} teman bersama', '{n} أصدقاء مشتركين', true, NOW(), NOW()),
(md5('i18n_reco_reason_product'), 'public.recommend.reason_product', 'public', '같은 사료/영양제', 'Same food/supplement', '同じフード/サプリ', '相同食品/营养品', '相同食品/營養品', 'Mismo alimento', 'Même alimentation', 'Gleiches Futter', 'Mesmo alimento', 'Cùng thức ăn', 'อาหารเดียวกัน', 'Makanan yang sama', 'نفس الطعام', true, NOW(), NOW()),
(md5('i18n_reco_reason_provider'),'public.recommend.reason_provider','public', '같은 병원/미용실', 'Same vet/groomer', '同じ病院/サロン', '相同医院/美容院', '相同醫院/美容院', 'Mismo veterinario', 'Même vétérinaire', 'Gleicher Tierarzt', 'Mesmo veterinário', 'Cùng bệnh viện', 'สัตวแพทย์เดียวกัน', 'Dokter hewan yang sama', 'نفس البيطري', true, NOW(), NOW()),
(md5('i18n_reco_type_dog'),       'public.recommend.type_dog',       'public', '🐶 강아지 보호자', '🐶 Dog parent', '🐶 犬の保護者', '🐶 狗狗家长', '🐶 狗狗家長', '🐶 Dueño de perro', '🐶 Parent de chien', '🐶 Hundebesitzer', '🐶 Dono de cão', '🐶 Chủ chó', '🐶 เจ้าของสุนัข', '🐶 Pemilik anjing', '🐶 صاحب كلب', true, NOW(), NOW()),
(md5('i18n_reco_type_cat'),       'public.recommend.type_cat',       'public', '🐱 고양이 보호자', '🐱 Cat parent', '🐱 猫の保護者', '🐱 猫咪家长', '🐱 貓咪家長', '🐱 Dueño de gato', '🐱 Parent de chat', '🐱 Katzenbesitzer', '🐱 Dono de gato', '🐱 Chủ mèo', '🐱 เจ้าของแมว', '🐱 Pemilik kucing', '🐱 صاحب قطة', true, NOW(), NOW()),
(md5('i18n_reco_type_other'),     'public.recommend.type_other',     'public', '🐾 반려동물 보호자', '🐾 Pet parent', '🐾 ペットの保護者', '🐾 宠物家长', '🐾 寵物家長', '🐾 Dueño de mascota', '🐾 Parent d''animal', '🐾 Tierbesitzer', '🐾 Dono de pet', '🐾 Chủ thú cưng', '🐾 เจ้าของสัตว์เลี้ยง', '🐾 Pemilik hewan', '🐾 صاحب حيوان أليف', true, NOW(), NOW()),
(md5('i18n_reco_view_profile'),   'public.recommend.view_profile',   'public', '프로필 보기', 'View Profile', 'プロフィール表示', '查看资料', '查看資料', 'Ver perfil', 'Voir le profil', 'Profil ansehen', 'Ver perfil', 'Xem hồ sơ', 'ดูโปรไฟล์', 'Lihat Profil', 'عرض الملف الشخصي', true, NOW(), NOW()),
(md5('i18n_reco_score_label'),    'public.recommend.score_label',    'public', '매칭 점수', 'Match score', 'マッチスコア', '匹配分', '配對分', 'Puntuación', 'Score', 'Punktzahl', 'Pontuação', 'Điểm', 'คะแนน', 'Skor', 'نقاط', true, NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar;


-- --------------------------------------------------------------------------
-- Source: 085_friend_search_i18n.sql
-- --------------------------------------------------------------------------
-- 085: i18n keys for friend search in FriendsModal

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Search UI ──────────────────────────────────────────────────────────────────
(md5('i18n_fs_btn'),         'friends.search.button',         'guardian', '검색', 'Search', '検索', '搜索', '搜尋', 'Buscar', 'Rechercher', 'Suchen', 'Pesquisar', 'Tìm kiếm', 'ค้นหา', 'Cari', 'بحث', true, NOW(), NOW()),
(md5('i18n_fs_placeholder'), 'friends.search.placeholder',    'guardian', '이메일로 검색', 'Search by email', 'メールで検索', '通过邮箱搜索', '透過電郵搜尋', 'Buscar por correo', 'Rechercher par e-mail', 'Suche per E-Mail', 'Pesquisar por e-mail', 'Tìm theo email', 'ค้นหาด้วยอีเมล', 'Cari berdasarkan email', 'البحث بالبريد الإلكتروني', true, NOW(), NOW()),
(md5('i18n_fs_not_found'),   'friends.search.not_found',      'guardian', '해당 이메일로 가입된 사용자가 없습니다', 'No user found with this email', 'このメールアドレスのユーザーが見つかりません', '未找到该邮箱的用户', '未找到該電郵的用戶', 'No se encontró usuario con este correo', 'Aucun utilisateur trouvé avec cet e-mail', 'Kein Benutzer mit dieser E-Mail gefunden', 'Nenhum usuário encontrado com este e-mail', 'Không tìm thấy người dùng với email này', 'ไม่พบผู้ใช้ด้วยอีเมลนี้', 'Tidak ditemukan pengguna dengan email ini', 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني', true, NOW(), NOW()),
(md5('i18n_fs_self'),        'friends.search.self_search',    'guardian', '본인은 친구 추가할 수 없습니다', 'You cannot add yourself', '自分自身を追加することはできません', '无法添加自己', '無法新增自己', 'No puedes agregarte a ti mismo', 'Vous ne pouvez pas vous ajouter', 'Sie können sich nicht selbst hinzufügen', 'Você não pode adicionar a si mesmo', 'Bạn không thể thêm chính mình', 'คุณไม่สามารถเพิ่มตัวเองได้', 'Anda tidak bisa menambahkan diri sendiri', 'لا يمكنك إضافة نفسك', true, NOW(), NOW()),

-- ── Card actions ────────────────────────────────────────────────────────────────
(md5('i18n_fs_send'),        'friends.search.send_request',   'guardian', '친구 신청하기', 'Send Friend Request', '友達リクエストを送る', '发送好友请求', '發送好友請求', 'Enviar solicitud', 'Envoyer une demande', 'Freundschaftsanfrage senden', 'Enviar pedido de amizade', 'Gửi lời mời kết bạn', 'ส่งคำขอเป็นเพื่อน', 'Kirim permintaan pertemanan', 'إرسال طلب صداقة', true, NOW(), NOW()),
(md5('i18n_fs_already'),     'friends.search.already_friend', 'guardian', '이미 친구입니다', 'Already friends', 'すでに友達です', '已经是好友', '已經是好友', 'Ya son amigos', 'Déjà amis', 'Bereits befreundet', 'Já são amigos', 'Đã là bạn bè', 'เป็นเพื่อนกันแล้ว', 'Sudah berteman', 'أصدقاء بالفعل', true, NOW(), NOW()),
(md5('i18n_fs_pending'),     'friends.search.pending',        'guardian', '신청 대기 중', 'Request pending', 'リクエスト承認待ち', '请求待处理', '請求待處理', 'Solicitud pendiente', 'Demande en attente', 'Anfrage ausstehend', 'Pedido pendente', 'Yêu cầu đang chờ', 'คำขอรอดำเนินการ', 'Permintaan tertunda', 'الطلب معلق', true, NOW(), NOW()),
(md5('i18n_fs_sent_ok'),     'friends.search.sent_success',   'guardian', '신청 완료', 'Request sent', 'リクエスト送信完了', '请求已发送', '請求已發送', 'Solicitud enviada', 'Demande envoyée', 'Anfrage gesendet', 'Pedido enviado', 'Đã gửi yêu cầu', 'ส่งคำขอแล้ว', 'Permintaan terkirim', 'تم إرسال الطلب', true, NOW(), NOW()),

-- ── Empty / error ──────────────────────────────────────────────────────────────
(md5('i18n_fs_no_pets'),     'friends.search.no_pets',        'guardian', '등록된 반려동물 없음', 'No pets registered', '登録されたペットなし', '暂无宠物', '尚無寵物', 'Sin mascotas registradas', 'Aucun animal enregistré', 'Keine Haustiere registriert', 'Nenhum pet registrado', 'Chưa đăng ký thú cưng', 'ยังไม่มีสัตว์เลี้ยง', 'Belum ada hewan peliharaan', 'لا حيوانات أليفة مسجلة', true, NOW(), NOW()),
(md5('i18n_fs_error'),       'friends.search.error',          'guardian', '검색에 실패했습니다', 'Search failed', '検索に失敗しました', '搜索失败', '搜尋失敗', 'Error en la búsqueda', 'Échec de la recherche', 'Suche fehlgeschlagen', 'Falha na pesquisa', 'Tìm kiếm thất bại', 'การค้นหาล้มเหลว', 'Pencarian gagal', 'فشل البحث', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 086_last_login_i18n.sql
-- --------------------------------------------------------------------------
-- 086: i18n keys for last login provider UI

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(md5('i18n_ll_last_used'),       'login.last_used',           'auth', '마지막으로 사용한 로그인', 'Last used login', '前回のログイン方法', '上次使用的登录方式', '上次使用的登入方式', 'Último inicio de sesión', 'Dernière connexion', 'Zuletzt verwendet', 'Último login utilizado', 'Đăng nhập lần trước', 'เข้าสู่ระบบล่าสุด', 'Login terakhir', 'آخر تسجيل دخول', true, NOW(), NOW()),
(md5('i18n_ll_last_badge'),      'login.last_used_badge',     'auth', '지난번에 사용', 'Last used', '前回使用', '上次使用', '上次使用', 'Usado antes', 'Utilisé avant', 'Zuletzt', 'Usado antes', 'Đã dùng', 'ใช้ล่าสุด', 'Terakhir', 'آخر استخدام', true, NOW(), NOW()),
(md5('i18n_ll_continue_google'), 'login.continue_with_google','auth', 'Google로 계속하기', 'Continue with Google', 'Googleで続ける', '使用Google继续', '使用Google繼續', 'Continuar con Google', 'Continuer avec Google', 'Weiter mit Google', 'Continuar com Google', 'Tiếp tục với Google', 'ดำเนินการด้วย Google', 'Lanjutkan dengan Google', 'المتابعة مع Google', true, NOW(), NOW()),
(md5('i18n_ll_continue_kakao'),  'login.continue_with_kakao', 'auth', '카카오로 계속하기', 'Continue with Kakao', 'カカオで続ける', '使用Kakao继续', '使用Kakao繼續', 'Continuar con Kakao', 'Continuer avec Kakao', 'Weiter mit Kakao', 'Continuar com Kakao', 'Tiếp tục với Kakao', 'ดำเนินการด้วย Kakao', 'Lanjutkan dengan Kakao', 'المتابعة مع Kakao', true, NOW(), NOW()),
(md5('i18n_ll_continue_apple'),  'login.continue_with_apple', 'auth', 'Apple로 계속하기', 'Continue with Apple', 'Appleで続ける', '使用Apple继续', '使用Apple繼續', 'Continuar con Apple', 'Continuer avec Apple', 'Weiter mit Apple', 'Continuar com Apple', 'Tiếp tục với Apple', 'ดำเนินการด้วย Apple', 'Lanjutkan dengan Apple', 'المتابعة مع Apple', true, NOW(), NOW()),
(md5('i18n_ll_continue_email'),  'login.continue_with_email', 'auth', '이메일로 계속하기', 'Continue with Email', 'メールで続ける', '使用邮箱继续', '使用郵箱繼續', 'Continuar con Email', 'Continuer par Email', 'Weiter mit E-Mail', 'Continuar com Email', 'Tiếp tục với Email', 'ดำเนินการด้วยอีเมล', 'Lanjutkan dengan Email', 'المتابعة بالبريد', true, NOW(), NOW()),
(md5('i18n_ll_other_methods'),   'login.other_methods',       'auth', '다른 방법으로 로그인', 'Other login methods', '他の方法でログイン', '其他登录方式', '其他登入方式', 'Otros métodos', 'Autres méthodes', 'Andere Methoden', 'Outros métodos', 'Cách khác', 'วิธีอื่น', 'Metode lain', 'طرق أخرى', true, NOW(), NOW()),
(md5('i18n_ll_already_reg'),     'login.already_registered',  'auth', '이 이메일은 {provider}로 가입되어 있어요', 'This email is registered with {provider}', 'このメールは{provider}で登録済みです', '此邮箱已通过{provider}注册', '此郵箱已透過{provider}註冊', 'Este email está registrado con {provider}', 'Cet email est enregistré avec {provider}', 'Diese E-Mail ist bei {provider} registriert', 'Este email está registrado com {provider}', 'Email này đã đăng ký với {provider}', 'อีเมลนี้ลงทะเบียนกับ {provider}', 'Email ini terdaftar di {provider}', 'هذا البريد مسجل في {provider}', true, NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar;


-- --------------------------------------------------------------------------
-- Source: 088_push_notification_i18n.sql
-- --------------------------------------------------------------------------
-- 088_push_notification_i18n.sql
-- i18n keys for push notifications, notification center, settings

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- Notification Center UI
(gen_random_uuid(), 'notification.center.title', 'notification',
 '알림', 'Notifications', '通知', '通知', '通知', 'Notificaciones', 'Notifications', 'Benachrichtigungen', 'Notificações', 'Thông báo', 'การแจ้งเตือน', 'Notifikasi', 'الإشعارات', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.center.empty', 'notification',
 '알림이 없습니다', 'No notifications', '通知はありません', '没有通知', '沒有通知', 'Sin notificaciones', 'Aucune notification', 'Keine Benachrichtigungen', 'Sem notificações', 'Không có thông báo', 'ไม่มีการแจ้งเตือน', 'Tidak ada notifikasi', 'لا توجد إشعارات', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.center.mark_all_read', 'notification',
 '모두 읽음', 'Mark all read', 'すべて既読', '全部已读', '全部已讀', 'Marcar todo leído', 'Tout marquer comme lu', 'Alle als gelesen markieren', 'Marcar tudo como lido', 'Đánh dấu tất cả đã đọc', 'อ่านทั้งหมด', 'Tandai semua dibaca', 'تحديد الكل كمقروء', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.center.view_all', 'notification',
 '모두 보기', 'View all', 'すべて表示', '查看全部', '查看全部', 'Ver todo', 'Voir tout', 'Alle anzeigen', 'Ver tudo', 'Xem tất cả', 'ดูทั้งหมด', 'Lihat semua', 'عرض الكل', true, NOW(), NOW()),

-- Notification type labels
(gen_random_uuid(), 'notification.type.friend_request', 'notification',
 '친구 요청', 'Friend Request', '友達リクエスト', '好友请求', '好友請求', 'Solicitud de amistad', 'Demande d''ami', 'Freundschaftsanfrage', 'Pedido de amizade', 'Yêu cầu kết bạn', 'คำขอเป็นเพื่อน', 'Permintaan teman', 'طلب صداقة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.friend_accepted', 'notification',
 '친구 수락', 'Friend Accepted', '友達承認', '好友已接受', '好友已接受', 'Amistad aceptada', 'Ami accepté', 'Freundschaft akzeptiert', 'Amizade aceita', 'Đã chấp nhận kết bạn', 'ยอมรับเป็นเพื่อน', 'Teman diterima', 'تم قبول الصداقة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.post_like', 'notification',
 '게시글 좋아요', 'Post Like', 'いいね', '帖子点赞', '貼文按讚', 'Me gusta', 'J''aime', 'Gefällt mir', 'Curtida', 'Lượt thích', 'ถูกใจ', 'Suka pos', 'إعجاب', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.post_comment', 'notification',
 '게시글 댓글', 'Post Comment', 'コメント', '帖子评论', '貼文留言', 'Comentario', 'Commentaire', 'Kommentar', 'Comentário', 'Bình luận', 'ความคิดเห็น', 'Komentar pos', 'تعليق', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.friend_new_post', 'notification',
 '친구 새 게시글', 'Friend New Post', '友達の新投稿', '好友新帖子', '好友新貼文', 'Nueva publicación de amigo', 'Nouvelle publication d''ami', 'Neuer Beitrag eines Freundes', 'Nova publicação de amigo', 'Bài viết mới từ bạn bè', 'โพสต์ใหม่จากเพื่อน', 'Pos baru teman', 'منشور جديد من صديق', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.pet_health_remind', 'notification',
 '건강 리마인더', 'Health Reminder', '健康リマインダー', '健康提醒', '健康提醒', 'Recordatorio de salud', 'Rappel santé', 'Gesundheitserinnerung', 'Lembrete de saúde', 'Nhắc nhở sức khỏe', 'แจ้งเตือนสุขภาพ', 'Pengingat kesehatan', 'تذكير صحي', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.appointment_remind', 'notification',
 '예약 리마인더', 'Appointment Reminder', '予約リマインダー', '预约提醒', '預約提醒', 'Recordatorio de cita', 'Rappel de rendez-vous', 'Terminerinnerung', 'Lembrete de consulta', 'Nhắc nhở lịch hẹn', 'แจ้งเตือนนัดหมาย', 'Pengingat janji', 'تذكير بالموعد', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.service_notice', 'notification',
 '서비스 공지', 'Service Notice', 'お知らせ', '服务通知', '服務通知', 'Aviso de servicio', 'Avis de service', 'Servicemitteilung', 'Aviso de serviço', 'Thông báo dịch vụ', 'ประกาศบริการ', 'Pemberitahuan layanan', 'إشعار الخدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.type.marketing', 'notification',
 '마케팅', 'Marketing', 'マーケティング', '营销', '行銷', 'Marketing', 'Marketing', 'Marketing', 'Marketing', 'Tiếp thị', 'การตลาด', 'Pemasaran', 'تسويق', true, NOW(), NOW()),

-- Notification messages
(gen_random_uuid(), 'notification.msg.sent_friend_request', 'notification',
 '님이 친구 요청을 보냈습니다', 'sent you a friend request', 'さんが友達リクエストを送りました', '向您发送了好友请求', '向您發送了好友請求', 'te envió una solicitud de amistad', 'vous a envoyé une demande d''ami', 'hat Ihnen eine Freundschaftsanfrage gesendet', 'enviou um pedido de amizade', 'đã gửi lời mời kết bạn', 'ส่งคำขอเป็นเพื่อนถึงคุณ', 'mengirim permintaan pertemanan', 'أرسل لك طلب صداقة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.msg.accepted_friend_request', 'notification',
 '님이 친구 요청을 수락했습니다', 'accepted your friend request', 'さんが友達リクエストを承認しました', '接受了您的好友请求', '接受了您的好友請求', 'aceptó tu solicitud de amistad', 'a accepté votre demande d''ami', 'hat Ihre Freundschaftsanfrage akzeptiert', 'aceitou seu pedido de amizade', 'đã chấp nhận lời mời kết bạn', 'ยอมรับคำขอเป็นเพื่อนของคุณ', 'menerima permintaan pertemanan Anda', 'قبل طلب صداقتك', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.msg.liked_your_post', 'notification',
 '님이 게시글에 좋아요를 눌렀습니다', 'liked your post', 'さんがあなたの投稿にいいねしました', '赞了您的帖子', '對您的貼文按讚', 'le dio me gusta a tu publicación', 'a aimé votre publication', 'hat Ihren Beitrag geliked', 'curtiu sua publicação', 'đã thích bài viết của bạn', 'ถูกใจโพสต์ของคุณ', 'menyukai pos Anda', 'أعجب بمنشورك', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.msg.commented_on_your_post', 'notification',
 '님이 게시글에 댓글을 남겼습니다', 'commented on your post', 'さんがあなたの投稿にコメントしました', '评论了您的帖子', '在您的貼文留言', 'comentó en tu publicación', 'a commenté votre publication', 'hat Ihren Beitrag kommentiert', 'comentou sua publicação', 'đã bình luận bài viết của bạn', 'แสดงความคิดเห็นในโพสต์ของคุณ', 'mengomentari pos Anda', 'علّق على منشورك', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.msg.shared_new_post', 'notification',
 '님이 새 게시글을 올렸습니다', 'shared a new post', 'さんが新しい投稿をしました', '发布了新帖子', '發布了新貼文', 'compartió una nueva publicación', 'a partagé une nouvelle publication', 'hat einen neuen Beitrag geteilt', 'compartilhou uma nova publicação', 'đã đăng bài viết mới', 'แชร์โพสต์ใหม่', 'membagikan pos baru', 'شارك منشوراً جديداً', true, NOW(), NOW()),

-- Notification settings labels
(gen_random_uuid(), 'notification.settings.title', 'notification',
 '알림 설정', 'Notification Settings', '通知設定', '通知设置', '通知設定', 'Configuración de notificaciones', 'Paramètres de notifications', 'Benachrichtigungseinstellungen', 'Configurações de notificação', 'Cài đặt thông báo', 'ตั้งค่าการแจ้งเตือน', 'Pengaturan notifikasi', 'إعدادات الإشعارات', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.friend_request', 'notification',
 '친구 요청 알림', 'Friend request notifications', '友達リクエスト通知', '好友请求通知', '好友請求通知', 'Notificaciones de solicitud de amistad', 'Notifications de demandes d''amis', 'Freundschaftsanfragen', 'Notificações de pedidos de amizade', 'Thông báo yêu cầu kết bạn', 'แจ้งเตือนคำขอเป็นเพื่อน', 'Notifikasi permintaan teman', 'إشعارات طلبات الصداقة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.friend_accepted', 'notification',
 '친구 수락 알림', 'Friend accepted notifications', '友達承認通知', '好友接受通知', '好友接受通知', 'Notificaciones de amistad aceptada', 'Notifications d''amis acceptés', 'Freundschaftsakzeptiert', 'Notificações de amizade aceita', 'Thông báo chấp nhận kết bạn', 'แจ้งเตือนยอมรับเป็นเพื่อน', 'Notifikasi teman diterima', 'إشعارات قبول الصداقة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.post_like', 'notification',
 '좋아요 알림', 'Like notifications', 'いいね通知', '点赞通知', '按讚通知', 'Notificaciones de me gusta', 'Notifications de j''aime', 'Like-Benachrichtigungen', 'Notificações de curtidas', 'Thông báo lượt thích', 'แจ้งเตือนถูกใจ', 'Notifikasi suka', 'إشعارات الإعجاب', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.post_comment', 'notification',
 '댓글 알림', 'Comment notifications', 'コメント通知', '评论通知', '留言通知', 'Notificaciones de comentarios', 'Notifications de commentaires', 'Kommentar-Benachrichtigungen', 'Notificações de comentários', 'Thông báo bình luận', 'แจ้งเตือนความคิดเห็น', 'Notifikasi komentar', 'إشعارات التعليقات', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.friend_new_post', 'notification',
 '친구 새 게시글 알림', 'Friend new post notifications', '友達の新投稿通知', '好友新帖子通知', '好友新貼文通知', 'Notificaciones de nuevas publicaciones de amigos', 'Notifications de nouvelles publications d''amis', 'Neue Beiträge von Freunden', 'Notificações de novas publicações de amigos', 'Thông báo bài mới từ bạn bè', 'แจ้งเตือนโพสต์ใหม่จากเพื่อน', 'Notifikasi pos baru teman', 'إشعارات منشورات الأصدقاء الجديدة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.pet_health_remind', 'notification',
 '건강 리마인더 알림', 'Health reminder notifications', '健康リマインダー通知', '健康提醒通知', '健康提醒通知', 'Notificaciones de recordatorio de salud', 'Notifications de rappel santé', 'Gesundheitserinnerungen', 'Notificações de lembrete de saúde', 'Thông báo nhắc nhở sức khỏe', 'แจ้งเตือนสุขภาพ', 'Notifikasi pengingat kesehatan', 'إشعارات التذكير الصحي', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.appointment_remind', 'notification',
 '예약 리마인더 알림', 'Appointment reminder notifications', '予約リマインダー通知', '预约提醒通知', '預約提醒通知', 'Notificaciones de recordatorio de citas', 'Notifications de rappel de rendez-vous', 'Terminerinnerungen', 'Notificações de lembrete de consulta', 'Thông báo nhắc nhở lịch hẹn', 'แจ้งเตือนนัดหมาย', 'Notifikasi pengingat janji', 'إشعارات تذكير المواعيد', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.service_notice', 'notification',
 '서비스 공지 알림', 'Service notice notifications', 'お知らせ通知', '服务通知', '服務通知', 'Notificaciones de avisos de servicio', 'Notifications d''avis de service', 'Servicemitteilungen', 'Notificações de avisos de serviço', 'Thông báo dịch vụ', 'แจ้งเตือนประกาศบริการ', 'Notifikasi pemberitahuan layanan', 'إشعارات إشعارات الخدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.settings.marketing', 'notification',
 '마케팅 알림', 'Marketing notifications', 'マーケティング通知', '营销通知', '行銷通知', 'Notificaciones de marketing', 'Notifications marketing', 'Marketing-Benachrichtigungen', 'Notificações de marketing', 'Thông báo tiếp thị', 'แจ้งเตือนการตลาด', 'Notifikasi pemasaran', 'إشعارات التسويق', true, NOW(), NOW()),

-- Push permission UI
(gen_random_uuid(), 'notification.push.enable_title', 'notification',
 '푸시 알림을 활성화하시겠습니까?', 'Enable push notifications?', 'プッシュ通知を有効にしますか？', '启用推送通知？', '啟用推播通知？', '¿Habilitar notificaciones push?', 'Activer les notifications push ?', 'Push-Benachrichtigungen aktivieren?', 'Ativar notificações push?', 'Bật thông báo đẩy?', 'เปิดใช้งานการแจ้งเตือนแบบพุช?', 'Aktifkan notifikasi push?', 'تفعيل الإشعارات الفورية؟', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.push.enable_button', 'notification',
 '알림 허용', 'Enable Notifications', '通知を許可', '允许通知', '允許通知', 'Permitir notificaciones', 'Autoriser les notifications', 'Benachrichtigungen erlauben', 'Permitir notificações', 'Cho phép thông báo', 'อนุญาตการแจ้งเตือน', 'Izinkan notifikasi', 'السماح بالإشعارات', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.push.denied_message', 'notification',
 '알림이 차단되었습니다. 브라우저 설정에서 허용해주세요.', 'Notifications are blocked. Please enable them in your browser settings.', '通知がブロックされています。ブラウザの設定で許可してください。', '通知已被屏蔽。请在浏览器设置中启用。', '通知已被封鎖。請在瀏覽器設定中啟用。', 'Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.', 'Les notifications sont bloquées. Activez-les dans les paramètres du navigateur.', 'Benachrichtigungen sind blockiert. Aktivieren Sie diese in den Browsereinstellungen.', 'As notificações estão bloqueadas. Ative-as nas configurações do navegador.', 'Thông báo đã bị chặn. Vui lòng bật trong cài đặt trình duyệt.', 'การแจ้งเตือนถูกบล็อก กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์', 'Notifikasi diblokir. Aktifkan di pengaturan browser Anda.', 'الإشعارات محظورة. يرجى تفعيلها من إعدادات المتصفح.', true, NOW(), NOW()),

-- Time labels
(gen_random_uuid(), 'notification.time.just_now', 'notification',
 '방금', 'Just now', 'たった今', '刚刚', '剛剛', 'Ahora mismo', 'À l''instant', 'Gerade eben', 'Agora mesmo', 'Vừa xong', 'เมื่อสักครู่', 'Baru saja', 'الآن', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.time.minutes_ago', 'notification',
 '분 전', 'min ago', '分前', '分钟前', '分鐘前', 'min atrás', 'min', 'Min.', 'min atrás', 'phút trước', 'นาทีที่แล้ว', 'menit lalu', 'دقيقة مضت', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.time.hours_ago', 'notification',
 '시간 전', 'hr ago', '時間前', '小时前', '小時前', 'h atrás', 'h', 'Std.', 'h atrás', 'giờ trước', 'ชั่วโมงที่แล้ว', 'jam lalu', 'ساعة مضت', true, NOW(), NOW()),

(gen_random_uuid(), 'notification.time.days_ago', 'notification',
 '일 전', 'd ago', '日前', '天前', '天前', 'd atrás', 'j', 'T.', 'd atrás', 'ngày trước', 'วันที่แล้ว', 'hari lalu', 'يوم مضى', true, NOW(), NOW())

ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 090_friends_modal_redesign_i18n.sql
-- --------------------------------------------------------------------------
-- 090: i18n keys for friend modal redesign

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Guardian label on friend card ──────────────────────────────────────────────
(md5('i18n_gfc_guardian_label'), 'guardian.friends.card.guardian_label', 'guardian', '보호자', 'Guardian', '保護者', '监护人', '監護人', 'Tutor', 'Tuteur', 'Betreuer', 'Tutor', 'Người giám hộ', 'ผู้ดูแล', 'Penjaga', 'الوصي', true, NOW(), NOW()),

-- ── Feed section label ─────────────────────────────────────────────────────────
(md5('i18n_gfc_feed_title'), 'guardian.friends.card.feed_title', 'guardian', '피드', 'Feed', 'フィード', '动态', '動態', 'Feed', 'Fil', 'Feed', 'Feed', 'Bảng tin', 'ฟีด', 'Feed', 'الخلاصة', true, NOW(), NOW()),

-- ── Accepted toast ─────────────────────────────────────────────────────────────
(md5('i18n_gfc_accepted_msg'), 'guardian.friends.accepted_msg', 'guardian', '친구가 되었습니다!', 'You are now friends!', '友達になりました！', '已成为好友！', '已成為好友！', '¡Ahora son amigos!', 'Vous êtes maintenant amis !', 'Ihr seid jetzt Freunde!', 'Agora são amigos!', 'Đã trở thành bạn bè!', 'เป็นเพื่อนกันแล้ว!', 'Sekarang berteman!', 'أصبحتم أصدقاء!', true, NOW(), NOW()),

-- ── Rejected toast ─────────────────────────────────────────────────────────────
(md5('i18n_gfc_rejected_msg'), 'guardian.friends.rejected_msg', 'guardian', '요청을 거절했습니다', 'Request declined', 'リクエストを拒否しました', '已拒绝请求', '已拒絕請求', 'Solicitud rechazada', 'Demande refusée', 'Anfrage abgelehnt', 'Pedido recusado', 'Đã từ chối yêu cầu', 'ปฏิเสธคำขอแล้ว', 'Permintaan ditolak', 'تم رفض الطلب', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 091_store_address_business_i18n.sql
-- --------------------------------------------------------------------------
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


-- --------------------------------------------------------------------------
-- Source: 092_feed_catalog_i18n_full.sql
-- --------------------------------------------------------------------------
-- 092: Feed catalog i18n — 048에서 ko/en만 있던 제조사(8)+브랜드(23) 총 31 키에 13개국어 보충
-- 브랜드명은 고유명사이므로 대부분 원어 유지, 한중일 음역 제공

-- ===== MANUFACTURERS (8) =====
UPDATE i18n_translations SET
  ja = 'ピュリナ', zh_cn = '普瑞纳', zh_tw = '普瑞納',
  es = 'Purina', fr = 'Purina', de = 'Purina', pt = 'Purina',
  vi = 'Purina', th = 'เพียวริน่า', id_lang = 'Purina', ar = 'بورينا',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.purina' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ファルミナ', zh_cn = 'Farmina', zh_tw = 'Farmina',
  es = 'Farmina', fr = 'Farmina', de = 'Farmina', pt = 'Farmina',
  vi = 'Farmina', th = 'ฟาร์มิน่า', id_lang = 'Farmina', ar = 'فارمينا',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.farmina' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ジウィピーク', zh_cn = 'Ziwi Peak', zh_tw = 'Ziwi Peak',
  es = 'Ziwi Peak', fr = 'Ziwi Peak', de = 'Ziwi Peak', pt = 'Ziwi Peak',
  vi = 'Ziwi Peak', th = 'ซีวี่พีค', id_lang = 'Ziwi Peak', ar = 'زيوي بيك',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.ziwi_peak' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'インスティンクト', zh_cn = 'Instinct', zh_tw = 'Instinct',
  es = 'Instinct', fr = 'Instinct', de = 'Instinct', pt = 'Instinct',
  vi = 'Instinct', th = 'อินสติงค์', id_lang = 'Instinct', ar = 'إنستينكت',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.instinct' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ステラ&チューイーズ', zh_cn = 'Stella & Chewy''s', zh_tw = 'Stella & Chewy''s',
  es = 'Stella & Chewy''s', fr = 'Stella & Chewy''s', de = 'Stella & Chewy''s', pt = 'Stella & Chewy''s',
  vi = 'Stella & Chewy''s', th = 'สเตลล่า แอนด์ ชิวอี้ส์', id_lang = 'Stella & Chewy''s', ar = 'ستيلا آند تشويز',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.stella_chewys' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'オープンファーム', zh_cn = 'Open Farm', zh_tw = 'Open Farm',
  es = 'Open Farm', fr = 'Open Farm', de = 'Open Farm', pt = 'Open Farm',
  vi = 'Open Farm', th = 'โอเพ่นฟาร์ม', id_lang = 'Open Farm', ar = 'أوبن فارم',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.open_farm' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ウェルネス', zh_cn = 'Wellness', zh_tw = 'Wellness',
  es = 'Wellness', fr = 'Wellness', de = 'Wellness', pt = 'Wellness',
  vi = 'Wellness', th = 'เวลเนส', id_lang = 'Wellness', ar = 'ويلنس',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.wellness' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'テイスト・オブ・ザ・ワイルド', zh_cn = 'Taste of the Wild', zh_tw = 'Taste of the Wild',
  es = 'Taste of the Wild', fr = 'Taste of the Wild', de = 'Taste of the Wild', pt = 'Taste of the Wild',
  vi = 'Taste of the Wild', th = 'เทสต์ออฟเดอะไวลด์', id_lang = 'Taste of the Wild', ar = 'تيست أوف ذا وايلد',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.taste_of_the_wild' AND ja IS NULL;

-- ===== BRANDS (23) =====
-- Purina brands
UPDATE i18n_translations SET
  ja = 'プロプラン', zh_cn = 'Pro Plan', zh_tw = 'Pro Plan',
  es = 'Pro Plan', fr = 'Pro Plan', de = 'Pro Plan', pt = 'Pro Plan',
  vi = 'Pro Plan', th = 'โปรแพลน', id_lang = 'Pro Plan', ar = 'برو بلان',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_pro_plan' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ピュリナ ワン', zh_cn = 'Purina ONE', zh_tw = 'Purina ONE',
  es = 'Purina ONE', fr = 'Purina ONE', de = 'Purina ONE', pt = 'Purina ONE',
  vi = 'Purina ONE', th = 'เพียวริน่า วัน', id_lang = 'Purina ONE', ar = 'بورينا وان',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_one' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ファンシーフィースト', zh_cn = 'Fancy Feast', zh_tw = 'Fancy Feast',
  es = 'Fancy Feast', fr = 'Fancy Feast', de = 'Fancy Feast', pt = 'Fancy Feast',
  vi = 'Fancy Feast', th = 'แฟนซีฟีสต์', id_lang = 'Fancy Feast', ar = 'فانسي فيست',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_fancy_feast' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ビヨンド', zh_cn = 'Beyond', zh_tw = 'Beyond',
  es = 'Beyond', fr = 'Beyond', de = 'Beyond', pt = 'Beyond',
  vi = 'Beyond', th = 'บียอนด์', id_lang = 'Beyond', ar = 'بيوند',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_beyond' AND ja IS NULL;

-- Farmina brands
UPDATE i18n_translations SET
  ja = 'N&D ナチュラル&デリシャス', zh_cn = 'N&D 天然美味', zh_tw = 'N&D 天然美味',
  es = 'N&D Natural & Delicious', fr = 'N&D Natural & Delicious', de = 'N&D Natural & Delicious', pt = 'N&D Natural & Delicious',
  vi = 'N&D Natural & Delicious', th = 'เอ็นแอนด์ดี', id_lang = 'N&D Natural & Delicious', ar = 'إن آند دي',
  updated_at = NOW()
WHERE key = 'feed.brand.farmina_nd' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ベットライフ', zh_cn = '兽医生活', zh_tw = '獸醫生活',
  es = 'Vet Life', fr = 'Vet Life', de = 'Vet Life', pt = 'Vet Life',
  vi = 'Vet Life', th = 'เว็ทไลฟ์', id_lang = 'Vet Life', ar = 'فيت لايف',
  updated_at = NOW()
WHERE key = 'feed.brand.farmina_vet_life' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'チームブリーダー', zh_cn = 'Team Breeder', zh_tw = 'Team Breeder',
  es = 'Team Breeder', fr = 'Team Breeder', de = 'Team Breeder', pt = 'Team Breeder',
  vi = 'Team Breeder', th = 'ทีมบรีดเดอร์', id_lang = 'Team Breeder', ar = 'تيم بريدر',
  updated_at = NOW()
WHERE key = 'feed.brand.farmina_team_breeder' AND ja IS NULL;

-- Ziwi Peak brands
UPDATE i18n_translations SET
  ja = 'エアドライ', zh_cn = '风干', zh_tw = '風乾',
  es = 'Secado al aire', fr = 'Séché à l''air', de = 'Luftgetrocknet', pt = 'Secagem ao ar',
  vi = 'Sấy khô', th = 'อบแห้ง', id_lang = 'Kering Udara', ar = 'مجفف بالهواء',
  updated_at = NOW()
WHERE key = 'feed.brand.ziwi_air_dried' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = '缶詰', zh_cn = '罐头', zh_tw = '罐頭',
  es = 'Enlatado', fr = 'En conserve', de = 'Dose', pt = 'Enlatado',
  vi = 'Đồ hộp', th = 'กระป๋อง', id_lang = 'Kalengan', ar = 'معلب',
  updated_at = NOW()
WHERE key = 'feed.brand.ziwi_canned' AND ja IS NULL;

-- Instinct brands
UPDATE i18n_translations SET
  ja = 'オリジナル', zh_cn = '原味', zh_tw = '原味',
  es = 'Original', fr = 'Original', de = 'Original', pt = 'Original',
  vi = 'Original', th = 'ออริจินอล', id_lang = 'Original', ar = 'أوريجينال',
  updated_at = NOW()
WHERE key = 'feed.brand.instinct_original' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ロウブースト', zh_cn = 'Raw Boost', zh_tw = 'Raw Boost',
  es = 'Raw Boost', fr = 'Raw Boost', de = 'Raw Boost', pt = 'Raw Boost',
  vi = 'Raw Boost', th = 'รอว์บูสต์', id_lang = 'Raw Boost', ar = 'رو بوست',
  updated_at = NOW()
WHERE key = 'feed.brand.instinct_raw_boost' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'リミテッド・イングリディエント', zh_cn = '限定原料', zh_tw = '限定原料',
  es = 'Ingrediente Limitado', fr = 'Ingrédient Limité', de = 'Begrenzte Zutaten', pt = 'Ingrediente Limitado',
  vi = 'Nguyên liệu hạn chế', th = 'ลิมิเต็ด อินกรีเดียนท์', id_lang = 'Bahan Terbatas', ar = 'مكونات محدودة',
  updated_at = NOW()
WHERE key = 'feed.brand.instinct_limited_ingredient' AND ja IS NULL;

-- Stella & Chewy's brands
UPDATE i18n_translations SET
  ja = 'フリーズドライ・ロウ', zh_cn = '冻干生食', zh_tw = '凍乾生食',
  es = 'Crudo Liofilizado', fr = 'Cru Lyophilisé', de = 'Gefriergetrocknet Roh', pt = 'Cru Liofilizado',
  vi = 'Sấy thăng hoa', th = 'ฟรีซดราย ดิบ', id_lang = 'Kering Beku Mentah', ar = 'مجفف بالتجميد خام',
  updated_at = NOW()
WHERE key = 'feed.brand.stella_fd_raw' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'シチュー', zh_cn = '炖菜', zh_tw = '燉菜',
  es = 'Guisos', fr = 'Ragoûts', de = 'Eintöpfe', pt = 'Ensopados',
  vi = 'Hầm', th = 'สตูว์', id_lang = 'Semur', ar = 'يخنة',
  updated_at = NOW()
WHERE key = 'feed.brand.stella_stews' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ミールミキサー', zh_cn = '拌餐粉', zh_tw = '拌餐粉',
  es = 'Mezcladores de Comida', fr = 'Mélangeurs de Repas', de = 'Mahlzeitmischer', pt = 'Misturadores de Refeição',
  vi = 'Trộn cơm', th = 'มีลมิกเซอร์', id_lang = 'Pencampur Makanan', ar = 'خلاطات الوجبات',
  updated_at = NOW()
WHERE key = 'feed.brand.stella_meal_mixers' AND ja IS NULL;

-- Open Farm brands
UPDATE i18n_translations SET
  ja = 'ドライフード', zh_cn = '干粮', zh_tw = '乾糧',
  es = 'Alimento Seco', fr = 'Nourriture Sèche', de = 'Trockenfutter', pt = 'Ração Seca',
  vi = 'Thức ăn khô', th = 'อาหารเม็ด', id_lang = 'Makanan Kering', ar = 'طعام جاف',
  updated_at = NOW()
WHERE key = 'feed.brand.open_farm_dry' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ウェットフード', zh_cn = '湿粮', zh_tw = '濕糧',
  es = 'Alimento Húmedo', fr = 'Nourriture Humide', de = 'Nassfutter', pt = 'Ração Úmida',
  vi = 'Thức ăn ướt', th = 'อาหารเปียก', id_lang = 'Makanan Basah', ar = 'طعام رطب',
  updated_at = NOW()
WHERE key = 'feed.brand.open_farm_wet' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'フリーズドライ・ロウ', zh_cn = '冻干生食', zh_tw = '凍乾生食',
  es = 'Crudo Liofilizado', fr = 'Cru Lyophilisé', de = 'Gefriergetrocknet Roh', pt = 'Cru Liofilizado',
  vi = 'Sấy thăng hoa', th = 'ฟรีซดราย ดิบ', id_lang = 'Kering Beku Mentah', ar = 'مجفف بالتجميد خام',
  updated_at = NOW()
WHERE key = 'feed.brand.open_farm_fd_raw' AND ja IS NULL;

-- Wellness brands
UPDATE i18n_translations SET
  ja = 'コンプリートヘルス', zh_cn = '完整健康', zh_tw = '完整健康',
  es = 'Salud Completa', fr = 'Santé Complète', de = 'Komplette Gesundheit', pt = 'Saúde Completa',
  vi = 'Sức khỏe hoàn chỉnh', th = 'คอมพลีทเฮลธ์', id_lang = 'Kesehatan Lengkap', ar = 'صحة كاملة',
  updated_at = NOW()
WHERE key = 'feed.brand.wellness_complete_health' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'コア', zh_cn = 'CORE', zh_tw = 'CORE',
  es = 'CORE', fr = 'CORE', de = 'CORE', pt = 'CORE',
  vi = 'CORE', th = 'คอร์', id_lang = 'CORE', ar = 'كور',
  updated_at = NOW()
WHERE key = 'feed.brand.wellness_core' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'シンプル', zh_cn = '简单', zh_tw = '簡單',
  es = 'Simple', fr = 'Simple', de = 'Simple', pt = 'Simple',
  vi = 'Simple', th = 'ซิมเปิล', id_lang = 'Simple', ar = 'سيمبل',
  updated_at = NOW()
WHERE key = 'feed.brand.wellness_simple' AND ja IS NULL;

-- Taste of the Wild brands
UPDATE i18n_translations SET
  ja = 'ドライ', zh_cn = '干粮', zh_tw = '乾糧',
  es = 'Seco', fr = 'Sec', de = 'Trocken', pt = 'Seco',
  vi = 'Khô', th = 'แห้ง', id_lang = 'Kering', ar = 'جاف',
  updated_at = NOW()
WHERE key = 'feed.brand.totw_dry' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ウェット', zh_cn = '湿粮', zh_tw = '濕糧',
  es = 'Húmedo', fr = 'Humide', de = 'Nass', pt = 'Úmido',
  vi = 'Ướt', th = 'เปียก', id_lang = 'Basah', ar = 'رطب',
  updated_at = NOW()
WHERE key = 'feed.brand.totw_wet' AND ja IS NULL;


-- --------------------------------------------------------------------------
-- Source: 093_fill_missing_i18n.sql
-- --------------------------------------------------------------------------
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


-- --------------------------------------------------------------------------
-- Source: 094_feed_card_settings_i18n.sql
-- --------------------------------------------------------------------------
-- 094_feed_card_settings_i18n.sql
-- i18n keys for feed card settings admin page (13 languages)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- Sidebar / Navigation
(gen_random_uuid(), 'admin.nav.feed_card_settings', 'admin',
 '피드 카드 설정', 'Feed Card Settings', 'フィードカード設定', '信息流卡片设置', '動態卡片設定', 'Config. tarjetas de feed', 'Paramètres cartes de flux', 'Feed-Karten-Einstellungen', 'Config. cartões de feed', 'Cài đặt thẻ nguồn cấp', 'ตั้งค่าการ์ดฟีด', 'Pengaturan kartu feed', 'إعدادات بطاقات الخلاصة', true, NOW(), NOW()),

-- Tab labels
(gen_random_uuid(), 'admin.feed_card.tab_settings', 'admin',
 '설정', 'Settings', '設定', '设置', '設定', 'Configuración', 'Paramètres', 'Einstellungen', 'Configurações', 'Cài đặt', 'การตั้งค่า', 'Pengaturan', 'الإعدادات', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.tab_dummy_data', 'admin',
 '더미 데이터', 'Dummy Data', 'ダミーデータ', '虚拟数据', '虛擬資料', 'Datos ficticios', 'Données factices', 'Testdaten', 'Dados fictícios', 'Dữ liệu mẫu', 'ข้อมูลจำลอง', 'Data dummy', 'بيانات تجريبية', true, NOW(), NOW()),

-- Card type labels
(gen_random_uuid(), 'admin.feed_card.type_ranking', 'admin',
 '랭킹 카드', 'Ranking Card', 'ランキングカード', '排名卡片', '排名卡片', 'Tarjeta de ranking', 'Carte classement', 'Ranking-Karte', 'Cartão de ranking', 'Thẻ xếp hạng', 'การ์ดอันดับ', 'Kartu peringkat', 'بطاقة التصنيف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.type_recommended', 'admin',
 '추천 카드', 'Recommended Card', 'おすすめカード', '推荐卡片', '推薦卡片', 'Tarjeta recomendada', 'Carte recommandée', 'Empfohlene Karte', 'Cartão recomendado', 'Thẻ đề xuất', 'การ์ดแนะนำ', 'Kartu rekomendasi', 'بطاقة مُوصى بها', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.type_ad', 'admin',
 '광고 카드', 'Ad Card', '広告カード', '广告卡片', '廣告卡片', 'Tarjeta de anuncio', 'Carte publicitaire', 'Werbekarte', 'Cartão de anúncio', 'Thẻ quảng cáo', 'การ์ดโฆษณา', 'Kartu iklan', 'بطاقة إعلانية', true, NOW(), NOW()),

-- Settings panel labels
(gen_random_uuid(), 'admin.feed_card.enabled', 'admin',
 '활성화', 'Enabled', '有効', '启用', '啟用', 'Activado', 'Activé', 'Aktiviert', 'Ativado', 'Đã bật', 'เปิดใช้งาน', 'Diaktifkan', 'مُفعّل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.disabled', 'admin',
 '비활성화', 'Disabled', '無効', '禁用', '停用', 'Desactivado', 'Désactivé', 'Deaktiviert', 'Desativado', 'Đã tắt', 'ปิดใช้งาน', 'Dinonaktifkan', 'مُعطّل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.interval', 'admin',
 '삽입 간격 (N개마다)', 'Insert Interval (every N posts)', '挿入間隔（N件ごと）', '插入间隔（每N篇）', '插入間隔（每N篇）', 'Intervalo (cada N publicaciones)', 'Intervalle (tous les N posts)', 'Intervall (alle N Beiträge)', 'Intervalo (a cada N posts)', 'Khoảng cách (mỗi N bài)', 'ช่วง (ทุก N โพสต์)', 'Interval (setiap N pos)', 'الفاصل (كل N منشور)', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.rotation_order', 'admin',
 '순환 순서', 'Rotation Order', 'ローテーション順序', '轮换顺序', '輪換順序', 'Orden de rotación', 'Ordre de rotation', 'Rotationsreihenfolge', 'Ordem de rotação', 'Thứ tự xoay', 'ลำดับการหมุน', 'Urutan rotasi', 'ترتيب الدوران', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.sort_order', 'admin',
 '우선순위', 'Priority', '優先順位', '优先级', '優先順序', 'Prioridad', 'Priorité', 'Priorität', 'Prioridade', 'Ưu tiên', 'ลำดับความสำคัญ', 'Prioritas', 'الأولوية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.move_up', 'admin',
 '위로', 'Move Up', '上へ', '上移', '上移', 'Subir', 'Monter', 'Nach oben', 'Mover acima', 'Lên', 'ขึ้น', 'Naik', 'لأعلى', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.move_down', 'admin',
 '아래로', 'Move Down', '下へ', '下移', '下移', 'Bajar', 'Descendre', 'Nach unten', 'Mover abaixo', 'Xuống', 'ลง', 'Turun', 'لأسفل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.save', 'admin',
 '저장', 'Save', '保存', '保存', '儲存', 'Guardar', 'Enregistrer', 'Speichern', 'Salvar', 'Lưu', 'บันทึก', 'Simpan', 'حفظ', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.save_success', 'admin',
 '설정이 저장되었습니다', 'Settings saved successfully', '設定が保存されました', '设置已保存', '設定已儲存', 'Configuración guardada', 'Paramètres enregistrés', 'Einstellungen gespeichert', 'Configurações salvas', 'Đã lưu cài đặt', 'บันทึกการตั้งค่าแล้ว', 'Pengaturan tersimpan', 'تم حفظ الإعدادات', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.save_error', 'admin',
 '저장에 실패했습니다', 'Failed to save settings', '保存に失敗しました', '保存失败', '儲存失敗', 'Error al guardar', 'Échec de l''enregistrement', 'Speichern fehlgeschlagen', 'Falha ao salvar', 'Lưu thất bại', 'บันทึกล้มเหลว', 'Gagal menyimpan', 'فشل في الحفظ', true, NOW(), NOW()),

-- Preview section
(gen_random_uuid(), 'admin.feed_card.preview_title', 'admin',
 '피드 미리보기', 'Feed Preview', 'フィードプレビュー', '信息流预览', '動態預覽', 'Vista previa del feed', 'Aperçu du flux', 'Feed-Vorschau', 'Pré-visualização do feed', 'Xem trước nguồn cấp', 'ตัวอย่างฟีด', 'Pratinjau feed', 'معاينة الخلاصة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_post', 'admin',
 '일반 게시물', 'Regular Post', '通常投稿', '普通帖子', '一般貼文', 'Publicación normal', 'Publication normale', 'Normaler Beitrag', 'Publicação normal', 'Bài viết thường', 'โพสต์ปกติ', 'Pos biasa', 'منشور عادي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_ranking', 'admin',
 '랭킹 카드', 'Ranking Card', 'ランキングカード', '排名卡片', '排名卡片', 'Tarjeta de ranking', 'Carte classement', 'Ranking-Karte', 'Cartão de ranking', 'Thẻ xếp hạng', 'การ์ดอันดับ', 'Kartu peringkat', 'بطاقة التصنيف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_recommended', 'admin',
 '추천 카드', 'Recommended Card', 'おすすめカード', '推荐卡片', '推薦卡片', 'Tarjeta recomendada', 'Carte recommandée', 'Empfohlene Karte', 'Cartão recomendado', 'Thẻ đề xuất', 'การ์ดแนะนำ', 'Kartu rekomendasi', 'بطاقة مُوصى بها', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_ad', 'admin',
 '광고 카드', 'Ad Card', '広告カード', '广告卡片', '廣告卡片', 'Tarjeta de anuncio', 'Carte publicitaire', 'Werbekarte', 'Cartão de anúncio', 'Thẻ quảng cáo', 'การ์ดโฆษณา', 'Kartu iklan', 'بطاقة إعلانية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_position', 'admin',
 '위치', 'Position', '位置', '位置', '位置', 'Posición', 'Position', 'Position', 'Posição', 'Vị trí', 'ตำแหน่ง', 'Posisi', 'الموضع', true, NOW(), NOW()),

-- Dummy data sub-tabs
(gen_random_uuid(), 'admin.feed_card.dummy_tab_weekly_health_king', 'admin',
 '주간 건강왕', 'Weekly Health King', '週間ヘルスキング', '每周健康王', '每週健康王', 'Rey semanal de salud', 'Roi santé hebdo', 'Wöchentlicher Gesundheitskönig', 'Rei da saúde semanal', 'Vua sức khỏe tuần', 'ราชาสุขภาพประจำสัปดาห์', 'Raja kesehatan mingguan', 'ملك الصحة الأسبوعي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_breed_health_king', 'admin',
 '견종 건강왕', 'Breed Health King', '犬種ヘルスキング', '品种健康王', '品種健康王', 'Rey de salud de raza', 'Roi santé de race', 'Rasse-Gesundheitskönig', 'Rei da saúde da raça', 'Vua sức khỏe giống', 'ราชาสุขภาพสายพันธุ์', 'Raja kesehatan ras', 'ملك صحة السلالة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_new_registration', 'admin',
 '신규 가입', 'New Registration', '新規登録', '新注册', '新註冊', 'Nuevo registro', 'Nouvelle inscription', 'Neue Registrierung', 'Novo cadastro', 'Đăng ký mới', 'ลงทะเบียนใหม่', 'Pendaftaran baru', 'تسجيل جديد', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_local_health_king', 'admin',
 '지역 건강왕', 'Local Health King', '地域ヘルスキング', '地区健康王', '地區健康王', 'Rey de salud local', 'Roi santé local', 'Lokaler Gesundheitskönig', 'Rei da saúde local', 'Vua sức khỏe địa phương', 'ราชาสุขภาพท้องถิ่น', 'Raja kesehatan lokal', 'ملك الصحة المحلي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_recommended_user', 'admin',
 '추천 유저', 'Recommended User', 'おすすめユーザー', '推荐用户', '推薦用戶', 'Usuario recomendado', 'Utilisateur recommandé', 'Empfohlener Benutzer', 'Usuário recomendado', 'Người dùng đề xuất', 'ผู้ใช้แนะนำ', 'Pengguna rekomendasi', 'مستخدم مُوصى به', true, NOW(), NOW()),

-- Dummy data form labels
(gen_random_uuid(), 'admin.feed_card.dummy_title', 'admin',
 '제목', 'Title', 'タイトル', '标题', '標題', 'Título', 'Titre', 'Titel', 'Título', 'Tiêu đề', 'ชื่อ', 'Judul', 'العنوان', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_subtitle', 'admin',
 '부제목', 'Subtitle', 'サブタイトル', '副标题', '副標題', 'Subtítulo', 'Sous-titre', 'Untertitel', 'Subtítulo', 'Phụ đề', 'ชื่อรอง', 'Subjudul', 'العنوان الفرعي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_description', 'admin',
 '설명', 'Description', '説明', '描述', '描述', 'Descripción', 'Description', 'Beschreibung', 'Descrição', 'Mô tả', 'คำอธิบาย', 'Deskripsi', 'الوصف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_image_url', 'admin',
 '이미지 URL', 'Image URL', '画像URL', '图片URL', '圖片URL', 'URL de imagen', 'URL de l''image', 'Bild-URL', 'URL da imagem', 'URL hình ảnh', 'URL รูปภาพ', 'URL gambar', 'رابط الصورة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_display_name', 'admin',
 '표시 이름', 'Display Name', '表示名', '显示名称', '顯示名稱', 'Nombre a mostrar', 'Nom affiché', 'Anzeigename', 'Nome de exibição', 'Tên hiển thị', 'ชื่อที่แสดง', 'Nama tampilan', 'اسم العرض', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_badge_text', 'admin',
 '뱃지 텍스트', 'Badge Text', 'バッジテキスト', '徽章文字', '徽章文字', 'Texto de insignia', 'Texte du badge', 'Badge-Text', 'Texto do emblema', 'Văn bản huy hiệu', 'ข้อความเหรียญ', 'Teks lencana', 'نص الشارة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_score', 'admin',
 '점수', 'Score', 'スコア', '分数', '分數', 'Puntuación', 'Score', 'Punktzahl', 'Pontuação', 'Điểm', 'คะแนน', 'Skor', 'النقاط', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_region', 'admin',
 '지역', 'Region', '地域', '地区', '地區', 'Región', 'Région', 'Region', 'Região', 'Khu vực', 'ภูมิภาค', 'Wilayah', 'المنطقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_breed_info', 'admin',
 '견종 정보', 'Breed Info', '犬種情報', '品种信息', '品種資訊', 'Info de raza', 'Info de race', 'Rasseninfo', 'Info da raça', 'Thông tin giống', 'ข้อมูลสายพันธุ์', 'Info ras', 'معلومات السلالة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_pet_type', 'admin',
 '동물 종류', 'Pet Type', 'ペット種類', '宠物类型', '寵物類型', 'Tipo de mascota', 'Type d''animal', 'Haustierart', 'Tipo de pet', 'Loại thú cưng', 'ประเภทสัตว์เลี้ยง', 'Jenis hewan', 'نوع الحيوان', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_link_url', 'admin',
 '링크 URL', 'Link URL', 'リンクURL', '链接URL', '連結URL', 'URL del enlace', 'URL du lien', 'Link-URL', 'URL do link', 'URL liên kết', 'URL ลิงก์', 'URL tautan', 'رابط URL', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_avatar_url', 'admin',
 '아바타 URL', 'Avatar URL', 'アバターURL', '头像URL', '頭像URL', 'URL del avatar', 'URL de l''avatar', 'Avatar-URL', 'URL do avatar', 'URL avatar', 'URL อวาตาร์', 'URL avatar', 'رابط الصورة الرمزية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_start_date', 'admin',
 '시작일', 'Start Date', '開始日', '开始日期', '開始日期', 'Fecha de inicio', 'Date de début', 'Startdatum', 'Data de início', 'Ngày bắt đầu', 'วันเริ่มต้น', 'Tanggal mulai', 'تاريخ البداية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_end_date', 'admin',
 '종료일', 'End Date', '終了日', '结束日期', '結束日期', 'Fecha de fin', 'Date de fin', 'Enddatum', 'Data de término', 'Ngày kết thúc', 'วันสิ้นสุด', 'Tanggal selesai', 'تاريخ النهاية', true, NOW(), NOW()),

-- Dummy data actions
(gen_random_uuid(), 'admin.feed_card.dummy_add', 'admin',
 '카드 추가', 'Add Card', 'カード追加', '添加卡片', '新增卡片', 'Agregar tarjeta', 'Ajouter carte', 'Karte hinzufügen', 'Adicionar cartão', 'Thêm thẻ', 'เพิ่มการ์ด', 'Tambah kartu', 'إضافة بطاقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_edit', 'admin',
 '수정', 'Edit', '編集', '编辑', '編輯', 'Editar', 'Modifier', 'Bearbeiten', 'Editar', 'Chỉnh sửa', 'แก้ไข', 'Edit', 'تعديل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_delete', 'admin',
 '삭제', 'Delete', '削除', '删除', '刪除', 'Eliminar', 'Supprimer', 'Löschen', 'Excluir', 'Xóa', 'ลบ', 'Hapus', 'حذف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_delete_confirm', 'admin',
 '이 카드를 삭제하시겠습니까?', 'Delete this card?', 'このカードを削除しますか？', '确定删除此卡片吗？', '確定刪除此卡片嗎？', '¿Eliminar esta tarjeta?', 'Supprimer cette carte ?', 'Diese Karte löschen?', 'Excluir este cartão?', 'Xóa thẻ này?', 'ลบการ์ดนี้?', 'Hapus kartu ini?', 'حذف هذه البطاقة؟', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_save_success', 'admin',
 '카드가 저장되었습니다', 'Card saved successfully', 'カードが保存されました', '卡片已保存', '卡片已儲存', 'Tarjeta guardada', 'Carte enregistrée', 'Karte gespeichert', 'Cartão salvo', 'Đã lưu thẻ', 'บันทึกการ์ดแล้ว', 'Kartu tersimpan', 'تم حفظ البطاقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_delete_success', 'admin',
 '카드가 삭제되었습니다', 'Card deleted successfully', 'カードが削除されました', '卡片已删除', '卡片已刪除', 'Tarjeta eliminada', 'Carte supprimée', 'Karte gelöscht', 'Cartão excluído', 'Đã xóa thẻ', 'ลบการ์ดแล้ว', 'Kartu dihapus', 'تم حذف البطاقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_active', 'admin',
 '활성', 'Active', 'アクティブ', '活跃', '啟用', 'Activo', 'Actif', 'Aktiv', 'Ativo', 'Hoạt động', 'ใช้งาน', 'Aktif', 'نشط', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_inactive', 'admin',
 '비활성', 'Inactive', '非アクティブ', '不活跃', '停用', 'Inactivo', 'Inactif', 'Inaktiv', 'Inativo', 'Không hoạt động', 'ไม่ได้ใช้งาน', 'Tidak aktif', 'غير نشط', true, NOW(), NOW()),

-- Common / misc
(gen_random_uuid(), 'admin.feed_card.no_cards', 'admin',
 '등록된 카드가 없습니다', 'No cards registered', 'カードが登録されていません', '没有注册的卡片', '沒有註冊的卡片', 'No hay tarjetas registradas', 'Aucune carte enregistrée', 'Keine Karten registriert', 'Nenhum cartão registrado', 'Chưa có thẻ nào', 'ไม่มีการ์ดที่ลงทะเบียน', 'Tidak ada kartu terdaftar', 'لا توجد بطاقات مسجلة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.cancel', 'admin',
 '취소', 'Cancel', 'キャンセル', '取消', '取消', 'Cancelar', 'Annuler', 'Abbrechen', 'Cancelar', 'Hủy', 'ยกเลิก', 'Batal', 'إلغاء', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.confirm', 'admin',
 '확인', 'Confirm', '確認', '确认', '確認', 'Confirmar', 'Confirmer', 'Bestätigen', 'Confirmar', 'Xác nhận', 'ยืนยัน', 'Konfirmasi', 'تأكيد', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.posts_unit', 'admin',
 '개 게시물마다', 'posts', '件ごと', '篇帖子', '篇貼文', 'publicaciones', 'publications', 'Beiträge', 'publicações', 'bài viết', 'โพสต์', 'pos', 'منشورات', true, NOW(), NOW())

ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 094_hardcoded_text_i18n.sql
-- --------------------------------------------------------------------------
-- 094_hardcoded_text_i18n.sql
-- i18n keys for all previously hardcoded frontend text
-- All 13 languages: ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- =====================================================================
-- Explore page
-- =====================================================================
(gen_random_uuid(), 'explore.search_placeholder', 'explore',
 '캡션, 펫 이름, 태그로 검색…', 'Search by caption, pet name, or tag…', 'キャプション、ペット名、タグで検索…', '按标题、宠物名或标签搜索…', '按標題、寵物名或標籤搜尋…', 'Buscar por título, nombre o etiqueta…', 'Rechercher par légende, nom ou tag…', 'Nach Beschreibung, Name oder Tag suchen…', 'Pesquisar por legenda, nome ou tag…', 'Tìm theo chú thích, tên thú cưng hoặc thẻ…', 'ค้นหาด้วยคำบรรยาย ชื่อสัตว์เลี้ยง หรือแท็ก…', 'Cari berdasarkan keterangan, nama hewan, atau tag…', 'البحث بالوصف أو اسم الحيوان أو الوسم…', true, NOW(), NOW()),

(gen_random_uuid(), 'explore.post_count', 'explore',
 '개의 게시물', 'posts', '件の投稿', '篇帖子', '篇貼文', 'publicaciones', 'publications', 'Beiträge', 'publicações', 'bài đăng', 'โพสต์', 'pos', 'منشورات', true, NOW(), NOW()),

(gen_random_uuid(), 'explore.no_results', 'explore',
 '검색 결과가 없습니다', 'No results found', '検索結果がありません', '未找到搜索结果', '未找到搜尋結果', 'Sin resultados', 'Aucun résultat', 'Keine Ergebnisse', 'Nenhum resultado', 'Không tìm thấy kết quả', 'ไม่พบผลลัพธ์', 'Tidak ada hasil', 'لا توجد نتائج', true, NOW(), NOW()),

-- =====================================================================
-- Countries page
-- =====================================================================
(gen_random_uuid(), 'admin.countries.err_select_code', 'admin.countries',
 '국가 코드를 선택해주세요.', 'Please select a country code.', '国コードを選択してください。', '请选择国家代码。', '請選擇國家代碼。', 'Seleccione un código de país.', 'Veuillez sélectionner un code pays.', 'Bitte wählen Sie einen Ländercode.', 'Selecione um código de país.', 'Vui lòng chọn mã quốc gia.', 'กรุณาเลือกรหัสประเทศ', 'Pilih kode negara.', 'يرجى اختيار رمز الدولة.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.err_ko_required', 'admin.countries',
 '한국어 국가명은 필수입니다.', 'Korean country name is required.', '韓国語の国名は必須です。', '韩语国名为必填项。', '韓語國名為必填項。', 'El nombre del país en coreano es obligatorio.', 'Le nom du pays en coréen est obligatoire.', 'Der koreanische Ländername ist erforderlich.', 'O nome do país em coreano é obrigatório.', 'Tên quốc gia bằng tiếng Hàn là bắt buộc.', 'ชื่อประเทศภาษาเกาหลีจำเป็นต้องกรอก', 'Nama negara dalam bahasa Korea wajib diisi.', 'اسم الدولة بالكورية مطلوب.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.err_select_currency', 'admin.countries',
 '기본 통화를 선택해주세요.', 'Please select a default currency.', 'デフォルト通貨を選択してください。', '请选择默认货币。', '請選擇預設貨幣。', 'Seleccione una moneda predeterminada.', 'Veuillez sélectionner une devise par défaut.', 'Bitte wählen Sie eine Standardwährung.', 'Selecione uma moeda padrão.', 'Vui lòng chọn tiền tệ mặc định.', 'กรุณาเลือกสกุลเงินเริ่มต้น', 'Pilih mata uang default.', 'يرجى اختيار العملة الافتراضية.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.select_iso_code', 'admin.countries',
 '-- ISO 3166-1 alpha-2 선택 --', '-- Select ISO 3166-1 alpha-2 --', '-- ISO 3166-1 alpha-2 を選択 --', '-- 选择 ISO 3166-1 alpha-2 --', '-- 選擇 ISO 3166-1 alpha-2 --', '-- Seleccionar ISO 3166-1 alpha-2 --', '-- Sélectionner ISO 3166-1 alpha-2 --', '-- ISO 3166-1 alpha-2 auswählen --', '-- Selecionar ISO 3166-1 alpha-2 --', '-- Chọn ISO 3166-1 alpha-2 --', '-- เลือก ISO 3166-1 alpha-2 --', '-- Pilih ISO 3166-1 alpha-2 --', '-- اختر ISO 3166-1 alpha-2 --', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.select_currency', 'admin.countries',
 '-- 통화 선택 --', '-- Select currency --', '-- 通貨を選択 --', '-- 选择货币 --', '-- 選擇貨幣 --', '-- Seleccionar moneda --', '-- Sélectionner la devise --', '-- Währung auswählen --', '-- Selecionar moeda --', '-- Chọn tiền tệ --', '-- เลือกสกุลเงิน --', '-- Pilih mata uang --', '-- اختر العملة --', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.auto_sort_hint', 'admin.countries',
 '생성 시 자동으로 다음 순서가 부여됩니다.', 'The next sort order will be assigned automatically.', '作成時に次の順番が自動的に割り当てられます。', '创建时将自动分配下一个排序号。', '建立時將自動分配下一個排序號。', 'El siguiente orden se asignará automáticamente.', 'L''ordre suivant sera attribué automatiquement.', 'Die nächste Sortierreihenfolge wird automatisch zugewiesen.', 'A próxima ordem será atribuída automaticamente.', 'Thứ tự tiếp theo sẽ được gán tự động.', 'ลำดับถัดไปจะถูกกำหนดโดยอัตโนมัติ', 'Urutan berikutnya akan ditetapkan secara otomatis.', 'سيتم تعيين الترتيب التالي تلقائيًا.', true, NOW(), NOW()),

-- =====================================================================
-- Common error keys
-- =====================================================================
(gen_random_uuid(), 'common.err.unknown', 'common',
 '오류가 발생했습니다', 'Error', 'エラーが発生しました', '发生错误', '發生錯誤', 'Error', 'Erreur', 'Fehler', 'Erro', 'Đã xảy ra lỗi', 'เกิดข้อผิดพลาด', 'Terjadi kesalahan', 'حدث خطأ', true, NOW(), NOW()),

(gen_random_uuid(), 'common.scroll_left', 'common',
 '왼쪽으로 스크롤', 'Scroll left', '左にスクロール', '向左滚动', '向左滾動', 'Desplazar a la izquierda', 'Défiler à gauche', 'Nach links scrollen', 'Rolar para a esquerda', 'Cuộn sang trái', 'เลื่อนไปทางซ้าย', 'Geser ke kiri', 'التمرير لليسار', true, NOW(), NOW()),

(gen_random_uuid(), 'common.scroll_right', 'common',
 '오른쪽으로 스크롤', 'Scroll right', '右にスクロール', '向右滚动', '向右滾動', 'Desplazar a la derecha', 'Défiler à droite', 'Nach rechts scrollen', 'Rolar para a direita', 'Cuộn sang phải', 'เลื่อนไปทางขวา', 'Geser ke kanan', 'التمرير لليمين', true, NOW(), NOW()),

(gen_random_uuid(), 'common.sort', 'common',
 '정렬', 'Sort', 'ソート', '排序', '排序', 'Ordenar', 'Trier', 'Sortieren', 'Ordenar', 'Sắp xếp', 'เรียงลำดับ', 'Urutkan', 'ترتيب', true, NOW(), NOW()),

-- =====================================================================
-- I18n page
-- =====================================================================
(gen_random_uuid(), 'admin.i18n.translating', 'admin.i18n',
 '번역중...', 'Translating...', '翻訳中...', '翻译中...', '翻譯中...', 'Traduciendo...', 'Traduction...', 'Übersetze...', 'Traduzindo...', 'Đang dịch...', 'กำลังแปล...', 'Menerjemahkan...', 'جارٍ الترجمة...', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.i18n.auto_translate_btn', 'admin.i18n',
 '✨ 12개국어 자동번역', '✨ Auto-translate 12 languages', '✨ 12言語自動翻訳', '✨ 自动翻译12种语言', '✨ 自動翻譯12種語言', '✨ Traducción automática 12 idiomas', '✨ Traduction auto 12 langues', '✨ 12 Sprachen automatisch übersetzen', '✨ Tradução automática 12 idiomas', '✨ Tự động dịch 12 ngôn ngữ', '✨ แปลอัตโนมัติ 12 ภาษา', '✨ Terjemahan otomatis 12 bahasa', '✨ ترجمة تلقائية 12 لغة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.i18n.total_count', 'admin.i18n',
 '총', 'Total', '合計', '共', '共', 'Total', 'Total', 'Gesamt', 'Total', 'Tổng', 'ทั้งหมด', 'Total', 'الإجمالي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.i18n.err_translation', 'admin.i18n',
 '번역 오류', 'Translation Error', '翻訳エラー', '翻译错误', '翻譯錯誤', 'Error de traducción', 'Erreur de traduction', 'Übersetzungsfehler', 'Erro de tradução', 'Lỗi dịch thuật', 'ข้อผิดพลาดในการแปล', 'Kesalahan terjemahan', 'خطأ في الترجمة', true, NOW(), NOW()),

-- =====================================================================
-- Auth / Signup
-- =====================================================================
(gen_random_uuid(), 'auth.password_hint', 'auth',
 '8자 이상', '8+ characters', '8文字以上', '8个字符以上', '8個字元以上', '8 o más caracteres', '8 caractères ou plus', 'Mindestens 8 Zeichen', '8 ou mais caracteres', '8 ký tự trở lên', '8 ตัวอักษรขึ้นไป', '8 karakter atau lebih', '8 أحرف على الأقل', true, NOW(), NOW()),

-- =====================================================================
-- Members page errors
-- =====================================================================
(gen_random_uuid(), 'admin.members.err_load', 'admin.members',
 '회원 목록을 불러오지 못했습니다', 'Failed to load members', '会員一覧の読み込みに失敗しました', '加载会员列表失败', '載入會員列表失敗', 'Error al cargar miembros', 'Échec du chargement des membres', 'Fehler beim Laden der Mitglieder', 'Falha ao carregar membros', 'Không tải được danh sách thành viên', 'ไม่สามารถโหลดรายชื่อสมาชิกได้', 'Gagal memuat anggota', 'فشل في تحميل الأعضاء', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.members.err_update', 'admin.members',
 '회원 정보 수정에 실패했습니다', 'Failed to update member', '会員情報の更新に失敗しました', '更新会员信息失败', '更新會員資訊失敗', 'Error al actualizar miembro', 'Échec de la mise à jour du membre', 'Fehler beim Aktualisieren des Mitglieds', 'Falha ao atualizar membro', 'Cập nhật thành viên thất bại', 'ไม่สามารถอัปเดตสมาชิกได้', 'Gagal memperbarui anggota', 'فشل في تحديث العضو', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.members.err_delete', 'admin.members',
 '회원 삭제에 실패했습니다', 'Failed to delete member', '会員の削除に失敗しました', '删除会员失败', '刪除會員失敗', 'Error al eliminar miembro', 'Échec de la suppression du membre', 'Fehler beim Löschen des Mitglieds', 'Falha ao excluir membro', 'Xóa thành viên thất bại', 'ไม่สามารถลบสมาชิกได้', 'Gagal menghapus anggota', 'فشل في حذف العضو', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.members.err_update_app', 'admin.members',
 '신청 상태 변경에 실패했습니다', 'Failed to update application', '申請の更新に失敗しました', '更新申请失败', '更新申請失敗', 'Error al actualizar la solicitud', 'Échec de la mise à jour de la demande', 'Fehler beim Aktualisieren des Antrags', 'Falha ao atualizar solicitação', 'Cập nhật đơn thất bại', 'ไม่สามารถอัปเดตคำขอได้', 'Gagal memperbarui pengajuan', 'فشل في تحديث الطلب', true, NOW(), NOW()),

-- =====================================================================
-- Guardian / Health
-- =====================================================================
(gen_random_uuid(), 'guardian.pet_summary', 'guardian',
 '반려동물 프로필 요약', 'Pet profile summary', 'ペットプロフィール概要', '宠物资料概要', '寵物資料概要', 'Resumen del perfil de mascota', 'Résumé du profil animal', 'Haustier-Profilübersicht', 'Resumo do perfil do pet', 'Tóm tắt hồ sơ thú cưng', 'สรุปข้อมูลสัตว์เลี้ยง', 'Ringkasan profil hewan', 'ملخص ملف الحيوان', true, NOW(), NOW()),

(gen_random_uuid(), 'guardian.feeding.supplements_included', 'guardian',
 '포함된 영양제', 'Supplements included', '含まれるサプリメント', '包含的营养品', '包含的營養品', 'Suplementos incluidos', 'Suppléments inclus', 'Enthaltene Ergänzungen', 'Suplementos incluídos', 'Thực phẩm bổ sung', 'อาหารเสริมที่รวม', 'Suplemen yang termasuk', 'المكملات المضمنة', true, NOW(), NOW()),

(gen_random_uuid(), 'guardian.report.err_load', 'guardian',
 '리포트를 불러오지 못했습니다', 'Failed to load report', 'レポートの読み込みに失敗しました', '加载报告失败', '載入報告失敗', 'Error al cargar el informe', 'Échec du chargement du rapport', 'Fehler beim Laden des Berichts', 'Falha ao carregar relatório', 'Không tải được báo cáo', 'ไม่สามารถโหลดรายงานได้', 'Gagal memuat laporan', 'فشل في تحميل التقرير', true, NOW(), NOW()),

-- =====================================================================
-- API Connections page
-- =====================================================================
(gen_random_uuid(), 'admin.api_connections.err_load', 'admin.api_connections',
 '설정을 불러오지 못했습니다', 'Failed to load settings', '設定の読み込みに失敗しました', '加载设置失败', '載入設定失敗', 'Error al cargar la configuración', 'Échec du chargement des paramètres', 'Fehler beim Laden der Einstellungen', 'Falha ao carregar configurações', 'Không tải được cài đặt', 'ไม่สามารถโหลดการตั้งค่าได้', 'Gagal memuat pengaturan', 'فشل في تحميل الإعدادات', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.err_save', 'admin.api_connections',
 '저장에 실패했습니다', 'Failed to save', '保存に失敗しました', '保存失败', '儲存失敗', 'Error al guardar', 'Échec de l''enregistrement', 'Fehler beim Speichern', 'Falha ao salvar', 'Lưu thất bại', 'ไม่สามารถบันทึกได้', 'Gagal menyimpan', 'فشل في الحفظ', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.places_ok', 'admin.api_connections',
 '정상입니다. Google Places 스크립트 로드가 확인되었습니다.', 'OK. Google Places script loaded successfully.', '正常です。Google Placesスクリプトの読み込みが確認されました。', '正常。Google Places 脚本加载成功。', '正常。Google Places 腳本載入成功。', 'OK. Script de Google Places cargado.', 'OK. Script Google Places chargé.', 'OK. Google Places-Skript geladen.', 'OK. Script do Google Places carregado.', 'OK. Tải script Google Places thành công.', 'ปกติ โหลดสคริปต์ Google Places สำเร็จ', 'OK. Skrip Google Places berhasil dimuat.', 'تم. تم تحميل برنامج Google Places.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.places_fail', 'admin.api_connections',
 'Google Places 연결 확인에 실패했습니다.', 'Google Places connection check failed.', 'Google Placesの接続確認に失敗しました。', 'Google Places 连接检查失败。', 'Google Places 連線檢查失敗。', 'Fallo en la verificación de Google Places.', 'Échec de la vérification Google Places.', 'Google Places-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Google Places.', 'Kiểm tra kết nối Google Places thất bại.', 'การตรวจสอบ Google Places ล้มเหลว', 'Gagal memeriksa koneksi Google Places.', 'فشل التحقق من اتصال Google Places.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.oauth_ok', 'admin.api_connections',
 '정상입니다. Google 로그인 스크립트와 Client ID 초기화가 확인되었습니다.', 'OK. Google sign-in script and Client ID initialization confirmed.', '正常です。Googleログインスクリプトの読み込みとClient IDの初期化が確認されました。', '正常。Google 登录脚本和 Client ID 初始化已确认。', '正常。Google 登入腳本和 Client ID 初始化已確認。', 'OK. Script de Google y Client ID inicializados.', 'OK. Script Google et Client ID initialisés.', 'OK. Google-Script und Client-ID initialisiert.', 'OK. Script Google e Client ID inicializados.', 'OK. Xác nhận script đăng nhập Google và Client ID.', 'ปกติ สคริปต์ Google และ Client ID เริ่มต้นสำเร็จ', 'OK. Skrip Google dan Client ID berhasil diinisialisasi.', 'تم. تم التحقق من برنامج Google ومعرف العميل.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.oauth_fail', 'admin.api_connections',
 'Google 로그인 연결 확인에 실패했습니다.', 'Google sign-in connection check failed.', 'Googleログインの接続確認に失敗しました。', 'Google 登录连接检查失败。', 'Google 登入連線檢查失敗。', 'Fallo en la verificación de Google OAuth.', 'Échec de la vérification Google OAuth.', 'Google OAuth-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Google OAuth.', 'Kiểm tra đăng nhập Google thất bại.', 'การตรวจสอบ Google OAuth ล้มเหลว', 'Gagal memeriksa koneksi Google OAuth.', 'فشل التحقق من اتصال Google OAuth.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.sample_text', 'admin.api_connections',
 '테스트 번역', 'Test translation', 'テスト翻訳', '测试翻译', '測試翻譯', 'Traducción de prueba', 'Traduction test', 'Testübersetzung', 'Tradução teste', 'Dịch thử', 'ทดสอบการแปล', 'Terjemahan uji coba', 'ترجمة تجريبية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.translate_ok', 'admin.api_connections',
 '정상입니다. 테스트 번역 결과', 'OK. Test translation result', '正常です。テスト翻訳結果', '正常。测试翻译结果', '正常。測試翻譯結果', 'OK. Resultado de traducción', 'OK. Résultat de traduction', 'OK. Übersetzungsergebnis', 'OK. Resultado da tradução', 'OK. Kết quả dịch thử', 'ปกติ ผลการแปลทดสอบ', 'OK. Hasil terjemahan uji coba', 'تم. نتيجة الترجمة التجريبية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.empty_response', 'admin.api_connections',
 '(빈 응답)', '(empty response)', '(空のレスポンス)', '(空响应)', '(空回應)', '(respuesta vacía)', '(réponse vide)', '(leere Antwort)', '(resposta vazia)', '(phản hồi trống)', '(การตอบกลับว่าง)', '(respons kosong)', '(استجابة فارغة)', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.translate_fail', 'admin.api_connections',
 'Google 번역 연결 확인에 실패했습니다.', 'Google Translate connection check failed.', 'Google翻訳の接続確認に失敗しました。', 'Google 翻译连接检查失败。', 'Google 翻譯連線檢查失敗。', 'Fallo en la verificación de Google Translate.', 'Échec de la vérification Google Translate.', 'Google Translate-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Google Translate.', 'Kiểm tra Google Translate thất bại.', 'การตรวจสอบ Google Translate ล้มเหลว', 'Gagal memeriksa koneksi Google Translate.', 'فشل التحقق من اتصال Google Translate.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.json_loaded', 'admin.api_connections',
 'JSON 파일을 불러왔습니다. 저장 후 연결 확인을 눌러주세요.', 'JSON file loaded. Save and run connection check.', 'JSONファイルを読み込みました。保存後に接続確認を押してください。', 'JSON 文件已加载。保存后请点击连接检查。', 'JSON 檔案已載入。儲存後請點擊連線檢查。', 'Archivo JSON cargado. Guarde y verifique la conexión.', 'Fichier JSON chargé. Enregistrez et vérifiez la connexion.', 'JSON-Datei geladen. Speichern und Verbindung prüfen.', 'Arquivo JSON carregado. Salve e verifique a conexão.', 'Đã tải file JSON. Lưu rồi kiểm tra kết nối.', 'โหลดไฟล์ JSON แล้ว บันทึกแล้วกดตรวจสอบ', 'File JSON dimuat. Simpan lalu periksa koneksi.', 'تم تحميل ملف JSON. احفظ وتحقق من الاتصال.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.json_key_missing', 'admin.api_connections',
 'JSON을 불러왔지만 client_email/private_key를 찾지 못했습니다.', 'JSON loaded but client_email/private_key not found.', 'JSONを読み込みましたがclient_email/private_keyが見つかりません。', 'JSON 已加载但未找到 client_email/private_key。', 'JSON 已載入但未找到 client_email/private_key。', 'JSON cargado pero no se encontraron client_email/private_key.', 'JSON chargé mais client_email/private_key introuvables.', 'JSON geladen, aber client_email/private_key nicht gefunden.', 'JSON carregado mas client_email/private_key não encontrados.', 'Đã tải JSON nhưng không tìm thấy client_email/private_key.', 'โหลด JSON แล้วแต่ไม่พบ client_email/private_key', 'JSON dimuat tapi client_email/private_key tidak ditemukan.', 'تم تحميل JSON لكن لم يتم العثور على client_email/private_key.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.json_read_fail', 'admin.api_connections',
 'JSON 파일을 읽지 못했습니다.', 'Failed to read JSON file.', 'JSONファイルの読み込みに失敗しました。', '无法读取 JSON 文件。', '無法讀取 JSON 檔案。', 'Error al leer el archivo JSON.', 'Échec de la lecture du fichier JSON.', 'JSON-Datei konnte nicht gelesen werden.', 'Falha ao ler arquivo JSON.', 'Không đọc được file JSON.', 'ไม่สามารถอ่านไฟล์ JSON ได้', 'Gagal membaca file JSON.', 'فشل في قراءة ملف JSON.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.hint.places_key', 'admin.api_connections',
 'Google Maps Platform > Credentials에서 만든 API key를 입력합니다.', 'Enter the API key from Google Maps Platform > Credentials.', 'Google Maps Platform > Credentialsで作成したAPIキーを入力します。', '输入 Google Maps Platform > Credentials 中创建的 API 密钥。', '輸入 Google Maps Platform > Credentials 中建立的 API 金鑰。', 'Ingrese la clave API de Google Maps Platform > Credentials.', 'Entrez la clé API de Google Maps Platform > Credentials.', 'Geben Sie den API-Schlüssel von Google Maps Platform > Credentials ein.', 'Insira a chave API do Google Maps Platform > Credentials.', 'Nhập API key từ Google Maps Platform > Credentials.', 'ป้อน API key จาก Google Maps Platform > Credentials', 'Masukkan API key dari Google Maps Platform > Credentials.', 'أدخل مفتاح API من Google Maps Platform > Credentials.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.hint.translate_json', 'admin.api_connections',
 'Cloud Translation API용 서비스계정 JSON 파일을 붙여넣거나 업로드합니다.', 'Paste or upload the service account JSON for Cloud Translation API.', 'Cloud Translation API用のサービスアカウントJSONを貼り付けるかアップロードします。', '粘贴或上传 Cloud Translation API 的服务账户 JSON。', '貼上或上傳 Cloud Translation API 的服務帳戶 JSON。', 'Pegue o cargue el JSON de la cuenta de servicio para Cloud Translation API.', 'Collez ou téléchargez le JSON du compte de service pour Cloud Translation API.', 'Fügen Sie die Service-Account-JSON für Cloud Translation API ein oder laden Sie sie hoch.', 'Cole ou envie o JSON da conta de serviço para Cloud Translation API.', 'Dán hoặc tải lên file JSON tài khoản dịch vụ cho Cloud Translation API.', 'วางหรืออัปโหลด JSON บัญชีบริการสำหรับ Cloud Translation API', 'Tempel atau unggah JSON akun layanan untuk Cloud Translation API.', 'الصق أو ارفع ملف JSON لحساب الخدمة الخاص بـ Cloud Translation API.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.field.service_account_json', 'admin.api_connections',
 '서비스 계정 JSON', 'Service Account JSON', 'サービスアカウントJSON', '服务账户 JSON', '服務帳戶 JSON', 'JSON de cuenta de servicio', 'JSON du compte de service', 'Dienstkonto-JSON', 'JSON da conta de serviço', 'JSON tài khoản dịch vụ', 'JSON บัญชีบริการ', 'JSON akun layanan', 'JSON حساب الخدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.btn.load_json', 'admin.api_connections',
 'JSON 파일 불러오기', 'Load JSON file', 'JSONファイルを読み込む', '加载 JSON 文件', '載入 JSON 檔案', 'Cargar archivo JSON', 'Charger le fichier JSON', 'JSON-Datei laden', 'Carregar arquivo JSON', 'Tải file JSON', 'โหลดไฟล์ JSON', 'Muat file JSON', 'تحميل ملف JSON', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.kakao_ok', 'admin.api_connections',
 '정상입니다. Kakao REST API Key가 유효합니다.', 'OK. Kakao REST API Key is valid.', '正常です。Kakao REST APIキーが有効です。', '正常。Kakao REST API Key 有效。', '正常。Kakao REST API Key 有效。', 'OK. Clave Kakao REST API válida.', 'OK. Clé Kakao REST API valide.', 'OK. Kakao REST API-Schlüssel gültig.', 'OK. Chave Kakao REST API válida.', 'OK. Kakao REST API Key hợp lệ.', 'ปกติ Kakao REST API Key ถูกต้อง', 'OK. Kakao REST API Key valid.', 'تم. مفتاح Kakao REST API صالح.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.kakao_fail', 'admin.api_connections',
 'Kakao 연결 확인에 실패했습니다.', 'Kakao connection check failed.', 'Kakaoの接続確認に失敗しました。', 'Kakao 连接检查失败。', 'Kakao 連線檢查失敗。', 'Fallo en la verificación de Kakao.', 'Échec de la vérification Kakao.', 'Kakao-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Kakao.', 'Kiểm tra kết nối Kakao thất bại.', 'การตรวจสอบ Kakao ล้มเหลว', 'Gagal memeriksa koneksi Kakao.', 'فشل التحقق من اتصال Kakao.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.apple_ok', 'admin.api_connections',
 '정상입니다. Apple .p8 키로 JWT 생성이 확인되었습니다.', 'OK. JWT generation with Apple .p8 key confirmed.', '正常です。Apple .p8キーでのJWT生成が確認されました。', '正常。使用 Apple .p8 密钥生成 JWT 已确认。', '正常。使用 Apple .p8 金鑰生成 JWT 已確認。', 'OK. Generación JWT con clave Apple .p8 confirmada.', 'OK. Génération JWT avec clé Apple .p8 confirmée.', 'OK. JWT-Generierung mit Apple .p8-Schlüssel bestätigt.', 'OK. Geração JWT com chave Apple .p8 confirmada.', 'OK. Xác nhận tạo JWT bằng Apple .p8 key.', 'ปกติ ยืนยันการสร้าง JWT ด้วย Apple .p8 key', 'OK. Pembuatan JWT dengan Apple .p8 key dikonfirmasi.', 'تم. تم التحقق من إنشاء JWT بمفتاح Apple .p8.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.apple_fail', 'admin.api_connections',
 'Apple 연결 확인에 실패했습니다.', 'Apple connection check failed.', 'Appleの接続確認に失敗しました。', 'Apple 连接检查失败。', 'Apple 連線檢查失敗。', 'Fallo en la verificación de Apple.', 'Échec de la vérification Apple.', 'Apple-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Apple.', 'Kiểm tra kết nối Apple thất bại.', 'การตรวจสอบ Apple ล้มเหลว', 'Gagal memeriksa koneksi Apple.', 'فشل التحقق من اتصال Apple.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.p8_loaded', 'admin.api_connections',
 '.p8 파일을 불러왔습니다. 저장 후 연결 확인을 눌러주세요.', '.p8 file loaded. Save and run connection check.', '.p8ファイルを読み込みました。保存後に接続確認を押してください。', '.p8 文件已加载。保存后请点击连接检查。', '.p8 檔案已載入。儲存後請點擊連線檢查。', 'Archivo .p8 cargado. Guarde y verifique la conexión.', 'Fichier .p8 chargé. Enregistrez et vérifiez.', '.p8-Datei geladen. Speichern und Verbindung prüfen.', 'Arquivo .p8 carregado. Salve e verifique.', 'Đã tải file .p8. Lưu rồi kiểm tra kết nối.', 'โหลดไฟล์ .p8 แล้ว บันทึกแล้วกดตรวจสอบ', 'File .p8 dimuat. Simpan lalu periksa koneksi.', 'تم تحميل ملف .p8. احفظ وتحقق من الاتصال.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.p8_read_fail', 'admin.api_connections',
 '.p8 파일을 읽지 못했습니다.', 'Failed to read .p8 file.', '.p8ファイルの読み込みに失敗しました。', '无法读取 .p8 文件。', '無法讀取 .p8 檔案。', 'Error al leer el archivo .p8.', 'Échec de la lecture du fichier .p8.', '.p8-Datei konnte nicht gelesen werden.', 'Falha ao ler arquivo .p8.', 'Không đọc được file .p8.', 'ไม่สามารถอ่านไฟล์ .p8 ได้', 'Gagal membaca file .p8.', 'فشل في قراءة ملف .p8.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.btn.load_p8', 'admin.api_connections',
 '.p8 파일 불러오기', 'Load .p8 file', '.p8ファイルを読み込む', '加载 .p8 文件', '載入 .p8 檔案', 'Cargar archivo .p8', 'Charger le fichier .p8', '.p8-Datei laden', 'Carregar arquivo .p8', 'Tải file .p8', 'โหลดไฟล์ .p8', 'Muat file .p8', 'تحميل ملف .p8', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.apple.hint.team_id', 'admin.apple',
 'Apple Developer 계정의 Team ID (10자리)', 'Team ID from Apple Developer account (10 characters)', 'Apple Developerアカウントのチーム ID（10桁）', 'Apple Developer 账户的 Team ID（10位）', 'Apple Developer 帳戶的 Team ID（10位）', 'Team ID de la cuenta Apple Developer (10 caracteres)', 'Team ID du compte Apple Developer (10 caractères)', 'Team-ID des Apple Developer-Kontos (10 Zeichen)', 'Team ID da conta Apple Developer (10 caracteres)', 'Team ID từ tài khoản Apple Developer (10 ký tự)', 'Team ID จากบัญชี Apple Developer (10 ตัวอักษร)', 'Team ID dari akun Apple Developer (10 karakter)', 'معرّف الفريق من حساب Apple Developer (10 أحرف)', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.apple.hint.key_id', 'admin.apple',
 'Sign in with Apple용 Key의 Key ID (10자리)', 'Key ID for Sign in with Apple key (10 characters)', 'Sign in with Apple用キーのキー ID（10桁）', 'Sign in with Apple 密钥的 Key ID（10位）', 'Sign in with Apple 金鑰的 Key ID（10位）', 'Key ID de la clave Sign in with Apple (10 caracteres)', 'Key ID de la clé Sign in with Apple (10 caractères)', 'Key-ID des Sign in with Apple-Schlüssels (10 Zeichen)', 'Key ID da chave Sign in with Apple (10 caracteres)', 'Key ID cho Sign in with Apple key (10 ký tự)', 'Key ID สำหรับ Sign in with Apple (10 ตัวอักษร)', 'Key ID untuk Sign in with Apple (10 karakter)', 'معرّف المفتاح لـ Sign in with Apple (10 أحرف)', true, NOW(), NOW())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 098_booking_grooming_i18n.sql
-- --------------------------------------------------------------------------
-- 090: i18n keys for appointment booking + grooming completion + guardian approval + feed display (13 languages)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Booking (Guardian) ─────────────────────────────────────────────────────
(md5('i18n_bk_title'),          'booking.title',            'booking', '예약 신청', 'Book Appointment', '予約申請', '预约申请', '預約申請', 'Reservar cita', 'Prendre rendez-vous', 'Termin buchen', 'Agendar consulta', 'Đặt lịch hẹn', 'จองนัดหมาย', 'Buat Janji', 'حجز موعد', true, NOW(), NOW()),
(md5('i18n_bk_pet_select'),     'booking.pet_select',       'booking', '반려동물 선택', 'Select Pet', 'ペットを選択', '选择宠物', '選擇寵物', 'Seleccionar mascota', 'Sélectionner un animal', 'Haustier wählen', 'Selecionar pet', 'Chọn thú cưng', 'เลือกสัตว์เลี้ยง', 'Pilih Hewan', 'اختيار الحيوان', true, NOW(), NOW()),
(md5('i18n_bk_service_select'), 'booking.service_select',   'booking', '서비스 선택', 'Select Service', 'サービスを選択', '选择服务', '選擇服務', 'Seleccionar servicio', 'Sélectionner un service', 'Service wählen', 'Selecionar serviço', 'Chọn dịch vụ', 'เลือกบริการ', 'Pilih Layanan', 'اختيار الخدمة', true, NOW(), NOW()),
(md5('i18n_bk_date_select'),    'booking.date_select',      'booking', '날짜 선택', 'Select Date', '日付を選択', '选择日期', '選擇日期', 'Seleccionar fecha', 'Sélectionner une date', 'Datum wählen', 'Selecionar data', 'Chọn ngày', 'เลือกวันที่', 'Pilih Tanggal', 'اختيار التاريخ', true, NOW(), NOW()),
(md5('i18n_bk_time_select'),    'booking.time_select',      'booking', '시간 선택', 'Select Time', '時間を選択', '选择时间', '選擇時間', 'Seleccionar hora', 'Sélectionner une heure', 'Zeit wählen', 'Selecionar horário', 'Chọn giờ', 'เลือกเวลา', 'Pilih Waktu', 'اختيار الوقت', true, NOW(), NOW()),
(md5('i18n_bk_request_note'),   'booking.request_note',     'booking', '요청사항', 'Request Note', 'リクエストメモ', '备注', '備註', 'Nota de solicitud', 'Note de demande', 'Anmerkung', 'Observação', 'Ghi chú yêu cầu', 'หมายเหตุ', 'Catatan Permintaan', 'ملاحظات الطلب', true, NOW(), NOW()),
(md5('i18n_bk_summary'),        'booking.summary',          'booking', '예약 요약', 'Booking Summary', '予約概要', '预约摘要', '預約摘要', 'Resumen de reserva', 'Résumé de réservation', 'Buchungsübersicht', 'Resumo da reserva', 'Tóm tắt đặt lịch', 'สรุปการจอง', 'Ringkasan Pemesanan', 'ملخص الحجز', true, NOW(), NOW()),
(md5('i18n_bk_confirm_btn'),    'booking.confirm_btn',      'booking', '예약 신청하기', 'Book Now', '予約を申請する', '提交预约', '提交預約', 'Reservar ahora', 'Réserver maintenant', 'Jetzt buchen', 'Reservar agora', 'Đặt lịch ngay', 'จองเลย', 'Pesan Sekarang', 'احجز الآن', true, NOW(), NOW()),
(md5('i18n_bk_success_toast'),  'booking.success_toast',    'booking', '예약 신청이 완료되었습니다', 'Booking request submitted', '予約申請が完了しました', '预约申请已提交', '預約申請已提交', 'Solicitud de reserva enviada', 'Demande de réservation envoyée', 'Buchungsanfrage gesendet', 'Solicitação enviada', 'Đã gửi yêu cầu đặt lịch', 'ส่งคำขอจองแล้ว', 'Permintaan pemesanan terkirim', 'تم إرسال طلب الحجز', true, NOW(), NOW()),
(md5('i18n_bk_service_type'),   'booking.service_type',     'booking', '서비스 유형', 'Service Type', 'サービス種類', '服务类型', '服務類型', 'Tipo de servicio', 'Type de service', 'Serviceart', 'Tipo de serviço', 'Loại dịch vụ', 'ประเภทบริการ', 'Jenis Layanan', 'نوع الخدمة', true, NOW(), NOW()),
(md5('i18n_bk_duration'),       'booking.duration',         'booking', '소요시간', 'Duration', '所要時間', '所需时间', '所需時間', 'Duración', 'Durée', 'Dauer', 'Duração', 'Thời gian', 'ระยะเวลา', 'Durasi', 'المدة', true, NOW(), NOW()),
(md5('i18n_bk_price'),          'booking.price',            'booking', '금액', 'Price', '料金', '价格', '價格', 'Precio', 'Prix', 'Preis', 'Preço', 'Giá', 'ราคา', 'Harga', 'السعر', true, NOW(), NOW()),
(md5('i18n_bk_minutes'),        'booking.minutes',          'booking', '분', 'min', '分', '分钟', '分鐘', 'min', 'min', 'Min', 'min', 'phút', 'นาที', 'menit', 'دقيقة', true, NOW(), NOW()),

-- ── Supplier: Appointment management ───────────────────────────────────────
(md5('i18n_sa_new_request'),    'supplier.appointment.new_request',    'supplier', '새 예약 요청', 'New Appointment Request', '新規予約リクエスト', '新预约请求', '新預約請求', 'Nueva solicitud de cita', 'Nouvelle demande de rendez-vous', 'Neue Terminanfrage', 'Nova solicitação de consulta', 'Yêu cầu đặt lịch mới', 'คำขอนัดหมายใหม่', 'Permintaan Janji Baru', 'طلب موعد جديد', true, NOW(), NOW()),
(md5('i18n_sa_confirm_btn'),    'supplier.appointment.confirm_btn',    'supplier', '예약 수락', 'Accept', '予約を承認', '接受预约', '接受預約', 'Aceptar', 'Accepter', 'Annehmen', 'Aceitar', 'Chấp nhận', 'ยอมรับ', 'Terima', 'قبول', true, NOW(), NOW()),
(md5('i18n_sa_reject_btn'),     'supplier.appointment.reject_btn',     'supplier', '예약 거절', 'Reject', '予約を拒否', '拒绝预约', '拒絕預約', 'Rechazar', 'Refuser', 'Ablehnen', 'Recusar', 'Từ chối', 'ปฏิเสธ', 'Tolak', 'رفض', true, NOW(), NOW()),
(md5('i18n_sa_reject_reason'),  'supplier.appointment.reject_reason',  'supplier', '거절 사유', 'Rejection Reason', '拒否理由', '拒绝理由', '拒絕理由', 'Motivo de rechazo', 'Motif de refus', 'Ablehnungsgrund', 'Motivo da recusa', 'Lý do từ chối', 'เหตุผลในการปฏิเสธ', 'Alasan Penolakan', 'سبب الرفض', true, NOW(), NOW()),
(md5('i18n_sa_confirmed'),      'supplier.appointment.confirmed',      'supplier', '확정된 예약', 'Confirmed Appointments', '確定済み予約', '已确认预约', '已確認預約', 'Citas confirmadas', 'Rendez-vous confirmés', 'Bestätigte Termine', 'Consultas confirmadas', 'Lịch hẹn đã xác nhận', 'นัดหมายที่ยืนยันแล้ว', 'Janji Terkonfirmasi', 'المواعيد المؤكدة', true, NOW(), NOW()),
(md5('i18n_sa_complete_btn'),   'supplier.appointment.complete_btn',   'supplier', '완료 처리', 'Complete', '完了処理', '完成处理', '完成處理', 'Completar', 'Terminer', 'Abschließen', 'Concluir', 'Hoàn thành', 'เสร็จสิ้น', 'Selesai', 'إكمال', true, NOW(), NOW()),
(md5('i18n_sa_pending'),        'supplier.appointment.status.pending', 'supplier', '대기중', 'Pending', '待機中', '待处理', '待處理', 'Pendiente', 'En attente', 'Ausstehend', 'Pendente', 'Đang chờ', 'รอดำเนินการ', 'Menunggu', 'قيد الانتظار', true, NOW(), NOW()),
(md5('i18n_sa_st_confirmed'),   'supplier.appointment.status.confirmed', 'supplier', '확정', 'Confirmed', '確定', '已确认', '已確認', 'Confirmada', 'Confirmé', 'Bestätigt', 'Confirmada', 'Đã xác nhận', 'ยืนยันแล้ว', 'Dikonfirmasi', 'مؤكد', true, NOW(), NOW()),
(md5('i18n_sa_st_rejected'),    'supplier.appointment.status.rejected', 'supplier', '거절됨', 'Rejected', '拒否済み', '已拒绝', '已拒絕', 'Rechazada', 'Refusé', 'Abgelehnt', 'Recusada', 'Đã từ chối', 'ถูกปฏิเสธ', 'Ditolak', 'مرفوض', true, NOW(), NOW()),
(md5('i18n_sa_st_completed'),   'supplier.appointment.status.completed', 'supplier', '완료', 'Completed', '完了', '已完成', '已完成', 'Completada', 'Terminé', 'Abgeschlossen', 'Concluída', 'Hoàn thành', 'เสร็จสิ้น', 'Selesai', 'مكتمل', true, NOW(), NOW()),

-- ── Grooming: Supplier completion modal ────────────────────────────────────
(md5('i18n_gc_title'),          'grooming.complete.title',      'grooming', '미용 완료 보고', 'Grooming Completion Report', 'グルーミング完了報告', '美容完成报告', '美容完成報告', 'Informe de acicalamiento', 'Rapport de toilettage', 'Pflegebericht', 'Relatório de tosa', 'Báo cáo hoàn thành', 'รายงานการตัดแต่ง', 'Laporan Grooming', 'تقرير العناية', true, NOW(), NOW()),
(md5('i18n_gc_photos'),         'grooming.complete.photos',     'grooming', '완료 사진', 'Completion Photos', '完了写真', '完成照片', '完成照片', 'Fotos completadas', 'Photos terminées', 'Fertige Fotos', 'Fotos concluídas', 'Ảnh hoàn thành', 'รูปที่เสร็จแล้ว', 'Foto Selesai', 'صور مكتملة', true, NOW(), NOW()),
(md5('i18n_gc_main_photo'),     'grooming.complete.main_photo', 'grooming', '대표 사진', 'Main Photo', 'メイン写真', '主照片', '主照片', 'Foto principal', 'Photo principale', 'Hauptfoto', 'Foto principal', 'Ảnh chính', 'รูปหลัก', 'Foto Utama', 'الصورة الرئيسية', true, NOW(), NOW()),
(md5('i18n_gc_style'),          'grooming.complete.style',      'grooming', '미용 스타일 정보', 'Grooming Style Info', 'スタイル情報', '造型信息', '造型資訊', 'Info de estilo', 'Info de style', 'Stil-Info', 'Info de estilo', 'Thông tin kiểu', 'ข้อมูลสไตล์', 'Info Gaya', 'معلومات الأسلوب', true, NOW(), NOW()),
(md5('i18n_gc_type'),           'grooming.complete.type',       'grooming', '미용 종류', 'Grooming Type', 'グルーミング種類', '美容类型', '美容類型', 'Tipo de acicalamiento', 'Type de toilettage', 'Pflegeart', 'Tipo de tosa', 'Loại chải chuốt', 'ประเภทการตัดแต่ง', 'Jenis Grooming', 'نوع العناية', true, NOW(), NOW()),
(md5('i18n_gc_cut'),            'grooming.complete.cut',        'grooming', '커트 스타일', 'Cut Style', 'カットスタイル', '剪裁风格', '剪裁風格', 'Estilo de corte', 'Style de coupe', 'Schnittstil', 'Estilo de corte', 'Kiểu cắt', 'สไตล์การตัด', 'Gaya Potongan', 'أسلوب القص', true, NOW(), NOW()),
(md5('i18n_gc_duration'),       'grooming.complete.duration',   'grooming', '소요시간', 'Duration', '所要時間', '所需时间', '所需時間', 'Duración', 'Durée', 'Dauer', 'Duração', 'Thời gian', 'ระยะเวลา', 'Durasi', 'المدة', true, NOW(), NOW()),
(md5('i18n_gc_products'),       'grooming.complete.products',   'grooming', '사용 제품', 'Products Used', '使用製品', '使用产品', '使用產品', 'Productos usados', 'Produits utilisés', 'Verwendete Produkte', 'Produtos usados', 'Sản phẩm sử dụng', 'ผลิตภัณฑ์ที่ใช้', 'Produk Digunakan', 'المنتجات المستخدمة', true, NOW(), NOW()),
(md5('i18n_gc_comment'),        'grooming.complete.comment',    'grooming', '보호자에게 코멘트', 'Comment to Guardian', '飼い主へのコメント', '给主人的评语', '給主人的評語', 'Comentario al guardián', 'Commentaire au gardien', 'Kommentar an Besitzer', 'Comentário ao guardião', 'Bình luận cho chủ', 'ความเห็นถึงเจ้าของ', 'Komentar untuk Pemilik', 'تعليق للمالك', true, NOW(), NOW()),
(md5('i18n_gc_send_btn'),       'grooming.complete.send_btn',   'grooming', '보호자에게 전송', 'Send to Guardian', '飼い主に送信', '发送给主人', '傳送給主人', 'Enviar al guardián', 'Envoyer au gardien', 'An Besitzer senden', 'Enviar ao guardião', 'Gửi cho chủ', 'ส่งถึงเจ้าของ', 'Kirim ke Pemilik', 'إرسال للمالك', true, NOW(), NOW()),

-- ── Grooming: Guardian approval modal ──────────────────────────────────────
(md5('i18n_gg_noti_title'),     'grooming.guardian.noti_title',      'grooming', '미용이 완료되었습니다', 'Grooming is complete', 'グルーミングが完了しました', '美容已完成', '美容已完成', 'El acicalamiento está listo', 'Le toilettage est terminé', 'Die Pflege ist abgeschlossen', 'A tosa foi concluída', 'Chải chuốt hoàn tất', 'การตัดแต่งเสร็จแล้ว', 'Grooming selesai', 'اكتملت العناية', true, NOW(), NOW()),
(md5('i18n_gg_choice_feed'),    'grooming.guardian.choice_feed',     'grooming', '피드에 공유', 'Share to Feed', 'フィードに共有', '分享到动态', '分享到動態', 'Compartir en feed', 'Partager dans le fil', 'Im Feed teilen', 'Compartilhar no feed', 'Chia sẻ lên bảng tin', 'แชร์ไปยังฟีด', 'Bagikan ke Feed', 'مشاركة في الخلاصة', true, NOW(), NOW()),
(md5('i18n_gg_choice_approve'), 'grooming.guardian.choice_approve',  'grooming', '승인만', 'Approve Only', '承認のみ', '仅批准', '僅批准', 'Solo aprobar', 'Approuver seulement', 'Nur genehmigen', 'Apenas aprovar', 'Chỉ phê duyệt', 'อนุมัติเท่านั้น', 'Hanya Setujui', 'موافقة فقط', true, NOW(), NOW()),
(md5('i18n_gg_choice_both'),    'grooming.guardian.choice_both',     'grooming', '승인 + 피드 공유', 'Approve & Share', '承認＆共有', '批准并分享', '批准並分享', 'Aprobar y compartir', 'Approuver et partager', 'Genehmigen & teilen', 'Aprovar e compartilhar', 'Phê duyệt & chia sẻ', 'อนุมัติและแชร์', 'Setujui & Bagikan', 'موافقة ومشاركة', true, NOW(), NOW()),
(md5('i18n_gg_confirm_btn'),    'grooming.guardian.confirm_btn',     'grooming', '선택 완료', 'Confirm Choice', '選択を確定', '确认选择', '確認選擇', 'Confirmar elección', 'Confirmer le choix', 'Auswahl bestätigen', 'Confirmar escolha', 'Xác nhận lựa chọn', 'ยืนยันตัวเลือก', 'Konfirmasi Pilihan', 'تأكيد الاختيار', true, NOW(), NOW()),

-- ── Grooming: Feed card display ────────────────────────────────────────────
(md5('i18n_gf_badge'),          'grooming.feed.badge',              'grooming', '미용완료', 'Grooming Done', 'グルーミング完了', '美容完成', '美容完成', 'Acicalamiento listo', 'Toilettage terminé', 'Pflege fertig', 'Tosa concluída', 'Đã hoàn thành', 'ตัดแต่งเสร็จ', 'Grooming Selesai', 'عناية مكتملة', true, NOW(), NOW()),
(md5('i18n_gf_view_store'),     'grooming.feed.view_store',         'grooming', '매장 보기', 'View Store', 'ストアを見る', '查看店铺', '查看店鋪', 'Ver tienda', 'Voir le magasin', 'Shop ansehen', 'Ver loja', 'Xem cửa hàng', 'ดูร้านค้า', 'Lihat Toko', 'عرض المتجر', true, NOW(), NOW()),
(md5('i18n_gf_detail_type'),    'grooming.feed.detail.type',        'grooming', '미용 종류', 'Grooming Type', 'グルーミング種類', '美容类型', '美容類型', 'Tipo', 'Type', 'Art', 'Tipo', 'Loại', 'ประเภท', 'Jenis', 'النوع', true, NOW(), NOW()),
(md5('i18n_gf_detail_cut'),     'grooming.feed.detail.cut',         'grooming', '커트 스타일', 'Cut Style', 'カットスタイル', '剪裁风格', '剪裁風格', 'Estilo de corte', 'Style de coupe', 'Schnittstil', 'Estilo de corte', 'Kiểu cắt', 'สไตล์การตัด', 'Gaya Potongan', 'أسلوب القص', true, NOW(), NOW()),
(md5('i18n_gf_detail_duration'),'grooming.feed.detail.duration',    'grooming', '소요시간', 'Duration', '所要時間', '所需时间', '所需時間', 'Duración', 'Durée', 'Dauer', 'Duração', 'Thời gian', 'ระยะเวลา', 'Durasi', 'المدة', true, NOW(), NOW()),
(md5('i18n_gf_detail_products'),'grooming.feed.detail.products',    'grooming', '사용 제품', 'Products', '使用製品', '使用产品', '使用產品', 'Productos', 'Produits', 'Produkte', 'Produtos', 'Sản phẩm', 'ผลิตภัณฑ์', 'Produk', 'المنتجات', true, NOW(), NOW()),
(md5('i18n_gf_detail_comment'), 'grooming.feed.detail.comment',     'grooming', '업종 코멘트', 'Stylist Comment', 'スタイリストコメント', '造型师评语', '造型師評語', 'Comentario del estilista', 'Commentaire du styliste', 'Stylist-Kommentar', 'Comentário do estilista', 'Nhận xét của thợ', 'ความเห็นช่าง', 'Komentar Stylist', 'تعليق المصمم', true, NOW(), NOW()),

-- ── Grooming service types (master-like options) ───────────────────────────
(md5('i18n_gs_full'),           'grooming.service.full',        'grooming', '전체미용', 'Full Grooming', 'フルグルーミング', '全身美容', '全身美容', 'Acicalamiento completo', 'Toilettage complet', 'Vollpflege', 'Tosa completa', 'Tỉa lông toàn bộ', 'ตัดแต่งขนทั้งตัว', 'Grooming Penuh', 'عناية كاملة', true, NOW(), NOW()),
(md5('i18n_gs_partial'),        'grooming.service.partial',     'grooming', '부분미용', 'Partial Grooming', '部分グルーミング', '局部美容', '局部美容', 'Acicalamiento parcial', 'Toilettage partiel', 'Teilpflege', 'Tosa parcial', 'Tỉa lông cục bộ', 'ตัดแต่งขนบางส่วน', 'Grooming Parsial', 'عناية جزئية', true, NOW(), NOW()),
(md5('i18n_gs_bath_dry'),       'grooming.service.bath_dry',    'grooming', '목욕+드라이', 'Bath & Dry', 'バス＆ドライ', '洗澡+吹干', '洗澡+吹乾', 'Baño y secado', 'Bain et séchage', 'Bad & Trocknen', 'Banho e secagem', 'Tắm & sấy', 'อาบน้ำ & เป่าแห้ง', 'Mandi & Keringkan', 'حمام وتجفيف', true, NOW(), NOW()),
(md5('i18n_gs_spa'),            'grooming.service.spa',         'grooming', '스파', 'Spa', 'スパ', '水疗', '水療', 'Spa', 'Spa', 'Spa', 'Spa', 'Spa', 'สปา', 'Spa', 'سبا', true, NOW(), NOW()),

-- ── Cut styles ─────────────────────────────────────────────────────────────
(md5('i18n_cs_teddy'),          'grooming.cut.teddy_bear',      'grooming', '테디베어컷', 'Teddy Bear Cut', 'テディベアカット', '泰迪熊造型', '泰迪熊造型', 'Corte osito', 'Coupe nounours', 'Teddybär-Schnitt', 'Corte ursinho', 'Kiểu gấu bông', 'ตัดทรงหมีเท็ดดี้', 'Potongan Teddy Bear', 'قصة الدب', true, NOW(), NOW()),
(md5('i18n_cs_bear'),           'grooming.cut.bear',            'grooming', '곰돌이컷', 'Bear Cut', 'ベアカット', '小熊造型', '小熊造型', 'Corte oso', 'Coupe ourson', 'Bärchen-Schnitt', 'Corte urso', 'Kiểu gấu', 'ตัดทรงหมี', 'Potongan Beruang', 'قصة الدبدوب', true, NOW(), NOW()),
(md5('i18n_cs_sporty'),         'grooming.cut.sporty',          'grooming', '스포츠컷', 'Sporty Cut', 'スポーツカット', '运动造型', '運動造型', 'Corte deportivo', 'Coupe sport', 'Sport-Schnitt', 'Corte esportivo', 'Kiểu thể thao', 'ตัดทรงสปอร์ต', 'Potongan Sporty', 'قصة رياضية', true, NOW(), NOW()),
(md5('i18n_cs_natural'),        'grooming.cut.natural',         'grooming', '자연컷', 'Natural Cut', 'ナチュラルカット', '自然造型', '自然造型', 'Corte natural', 'Coupe naturelle', 'Natürlicher Schnitt', 'Corte natural', 'Kiểu tự nhiên', 'ตัดทรงธรรมชาติ', 'Potongan Natural', 'قصة طبيعية', true, NOW(), NOW()),

-- ── Notification messages ──────────────────────────────────────────────────
(md5('i18n_noti_apt_request'),  'notification.appointment_request',   'notification', '새 예약 요청이 있습니다', 'New appointment request', '新しい予約リクエストがあります', '有新的预约请求', '有新的預約請求', 'Nueva solicitud de cita', 'Nouvelle demande de rendez-vous', 'Neue Terminanfrage', 'Nova solicitação de consulta', 'Có yêu cầu đặt lịch mới', 'มีคำขอนัดหมายใหม่', 'Ada permintaan janji baru', 'طلب موعد جديد', true, NOW(), NOW()),
(md5('i18n_noti_apt_confirmed'),'notification.appointment_confirmed', 'notification', '예약이 수락되었습니다', 'Appointment confirmed', '予約が承認されました', '预约已确认', '預約已確認', 'Cita confirmada', 'Rendez-vous confirmé', 'Termin bestätigt', 'Consulta confirmada', 'Đã xác nhận lịch hẹn', 'นัดหมายได้รับการยืนยัน', 'Janji dikonfirmasi', 'تم تأكيد الموعد', true, NOW(), NOW()),
(md5('i18n_noti_apt_rejected'), 'notification.appointment_rejected',  'notification', '예약이 거절되었습니다', 'Appointment rejected', '予約が拒否されました', '预约被拒绝', '預約被拒絕', 'Cita rechazada', 'Rendez-vous refusé', 'Termin abgelehnt', 'Consulta recusada', 'Lịch hẹn bị từ chối', 'นัดหมายถูกปฏิเสธ', 'Janji ditolak', 'تم رفض الموعد', true, NOW(), NOW()),
(md5('i18n_noti_groom_done'),   'notification.grooming_complete',     'notification', '미용이 완료되었습니다', 'Grooming is complete', 'グルーミングが完了しました', '美容已完成', '美容已完成', 'Acicalamiento completado', 'Toilettage terminé', 'Pflege abgeschlossen', 'Tosa concluída', 'Đã hoàn thành chải chuốt', 'การตัดแต่งเสร็จแล้ว', 'Grooming selesai', 'اكتملت العناية', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 099_health_tab_i18n.sql
-- --------------------------------------------------------------------------
-- 099: Health tab i18n — tab labels, unit abbreviations, missing UI keys
-- All 13 languages: ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- ── Guardian tab labels ──
(gen_random_uuid()::text, 'guardian.tab.timeline', 'guardian',
 '타임라인', 'Timeline', 'タイムライン', '时间线', '時間軸', 'Línea de tiempo', 'Chronologie', 'Zeitleiste', 'Linha do tempo', 'Dòng thời gian', 'ไทม์ไลน์', 'Linimasa', 'الجدول الزمني',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.health', 'guardian',
 '건강', 'Health', '健康', '健康', '健康', 'Salud', 'Santé', 'Gesundheit', 'Saúde', 'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'الصحة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.services', 'guardian',
 '서비스', 'Services', 'サービス', '服务', '服務', 'Servicios', 'Services', 'Dienste', 'Serviços', 'Dịch vụ', 'บริการ', 'Layanan', 'الخدمات',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.gallery', 'guardian',
 '갤러리', 'Gallery', 'ギャラリー', '相册', '相簿', 'Galería', 'Galerie', 'Galerie', 'Galeria', 'Bộ sưu tập', 'แกลเลอรี', 'Galeri', 'معرض الصور',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.tab.profile', 'guardian',
 '프로필', 'Profile', 'プロフィール', '个人资料', '個人資料', 'Perfil', 'Profil', 'Profil', 'Perfil', 'Hồ sơ', 'โปรไฟล์', 'Profil', 'الملف الشخصي',
 true, NOW(), NOW()),

-- ── Unit abbreviations (UI display) ──
(gen_random_uuid()::text, 'unit.kg', 'common',
 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'กก.', 'kg', 'كغ',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.g', 'common',
 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'ก.', 'g', 'غ',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.kcal', 'common',
 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'كيلو كالوري',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.kcal_per_100g', 'common',
 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'kcal/100g', 'كيلو كالوري/100غ',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.min', 'common',
 '분', 'min', '分', '分钟', '分鐘', 'min', 'min', 'Min', 'min', 'phút', 'นาที', 'mnt', 'دقيقة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'unit.km', 'common',
 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'km', 'กม.', 'km', 'كم',
 true, NOW(), NOW()),

-- ── Guardian profile ──
(gen_random_uuid()::text, 'guardian.profile.auth_email', 'guardian',
 '이메일', 'Email', 'メール', '电子邮件', '電子郵件', 'Correo', 'E-mail', 'E-Mail', 'E-mail', 'Email', 'อีเมล', 'Email', 'البريد الإلكتروني',
 true, NOW(), NOW()),

-- ── Common ──
(gen_random_uuid()::text, 'common.yes', 'common',
 '예', 'Yes', 'はい', '是', '是', 'Sí', 'Oui', 'Ja', 'Sim', 'Có', 'ใช่', 'Ya', 'نعم',
 true, NOW(), NOW())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 100_avatar_upload_i18n.sql
-- --------------------------------------------------------------------------
-- 100: Avatar upload i18n keys (13 languages)
-- Keys: avatar.upload.change, avatar.upload.uploading, avatar.upload.failed,
--        avatar.upload.size_limit, avatar.upload.type_invalid, avatar.upload.success

INSERT INTO i18n_translations (id, key, page,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
('avatar_upload_change', 'avatar.upload.change', 'common',
 '사진 변경', 'Change Photo', '写真を変更', '更换照片', '更換照片',
 'Cambiar foto', 'Changer la photo', 'Foto ändern', 'Alterar foto',
 'Đổi ảnh', 'เปลี่ยนรูป', 'Ganti Foto', 'تغيير الصورة'),

('avatar_upload_uploading', 'avatar.upload.uploading', 'common',
 '업로드 중...', 'Uploading...', 'アップロード中...', '上传中...', '上傳中...',
 'Subiendo...', 'Envoi en cours...', 'Wird hochgeladen...', 'Enviando...',
 'Đang tải lên...', 'กำลังอัปโหลด...', 'Mengunggah...', 'جارٍ الرفع...'),

('avatar_upload_failed', 'avatar.upload.failed', 'common',
 '사진 업로드에 실패했습니다.', 'Failed to upload photo.', '写真のアップロードに失敗しました。',
 '照片上传失败。', '照片上傳失敗。',
 'Error al subir la foto.', 'Échec de l''envoi de la photo.', 'Foto-Upload fehlgeschlagen.',
 'Falha ao enviar a foto.', 'Tải ảnh lên thất bại.', 'อัปโหลดรูปไม่สำเร็จ',
 'Gagal mengunggah foto.', 'فشل رفع الصورة.'),

('avatar_upload_size_limit', 'avatar.upload.size_limit', 'common',
 '파일 크기는 5MB 이하여야 합니다.', 'File size must be 5MB or less.',
 'ファイルサイズは5MB以下にしてください。', '文件大小不能超过5MB。', '檔案大小不能超過5MB。',
 'El archivo debe ser de 5MB o menos.', 'Le fichier doit faire 5 Mo ou moins.',
 'Die Datei darf maximal 5 MB groß sein.', 'O arquivo deve ter no máximo 5MB.',
 'Kích thước tệp phải từ 5MB trở xuống.', 'ขนาดไฟล์ต้องไม่เกิน 5MB',
 'Ukuran file harus 5MB atau kurang.', 'يجب ألّا يتجاوز حجم الملف 5 ميغابايت.'),

('avatar_upload_type_invalid', 'avatar.upload.type_invalid', 'common',
 'JPG/PNG/WEBP 파일만 지원합니다.', 'Only JPG/PNG/WEBP files are allowed.',
 'JPG/PNG/WEBPファイルのみ対応しています。', '仅支持JPG/PNG/WEBP文件。', '僅支援JPG/PNG/WEBP檔案。',
 'Solo se permiten archivos JPG/PNG/WEBP.', 'Seuls les fichiers JPG/PNG/WEBP sont acceptés.',
 'Nur JPG/PNG/WEBP-Dateien sind erlaubt.', 'Apenas arquivos JPG/PNG/WEBP são permitidos.',
 'Chỉ chấp nhận tệp JPG/PNG/WEBP.', 'รองรับเฉพาะไฟล์ JPG/PNG/WEBP',
 'Hanya file JPG/PNG/WEBP yang diizinkan.', 'يُسمح فقط بملفات JPG/PNG/WEBP.'),

('avatar_upload_success', 'avatar.upload.success', 'common',
 '사진이 업로드되었습니다.', 'Photo uploaded successfully.',
 '写真がアップロードされました。', '照片上传成功。', '照片上傳成功。',
 'Foto subida correctamente.', 'Photo envoyée avec succès.', 'Foto erfolgreich hochgeladen.',
 'Foto enviada com sucesso.', 'Ảnh đã được tải lên thành công.', 'อัปโหลดรูปสำเร็จแล้ว',
 'Foto berhasil diunggah.', 'تم رفع الصورة بنجاح.')

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = CURRENT_TIMESTAMP;


-- --------------------------------------------------------------------------
-- Source: 101_record_card_i18n.sql
-- --------------------------------------------------------------------------
-- 101: Record card value pill labels — 13 languages
-- Used by the unified RecordCard component in Guardian health timeline

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid()::text, 'guardian.record.value', 'guardian',
 '수치', 'Value', '数値', '数值', '數值', 'Valor', 'Valeur', 'Wert', 'Valor', 'Giá trị', 'ค่า', 'Nilai', 'القيمة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.metric', 'guardian',
 '지표', 'Metric', '指標', '指标', '指標', 'Métrica', 'Indicateur', 'Kennzahl', 'Métrica', 'Chỉ số', 'ตัวชี้วัด', 'Metrik', 'المقياس',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.context', 'guardian',
 '측정조건', 'Context', '測定条件', '测量条件', '測量條件', 'Contexto', 'Contexte', 'Kontext', 'Contexto', 'Bối cảnh', 'บริบท', 'Konteks', 'السياق',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.amount', 'guardian',
 '급여량', 'Amount', '給餌量', '喂食量', '餵食量', 'Cantidad', 'Quantité', 'Menge', 'Quantidade', 'Lượng', 'ปริมาณ', 'Jumlah', 'الكمية',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.calories', 'guardian',
 '칼로리', 'Calories', 'カロリー', '卡路里', '卡路里', 'Calorías', 'Calories', 'Kalorien', 'Calorias', 'Calo', 'แคลอรี', 'Kalori', 'السعرات',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.duration', 'guardian',
 '시간', 'Duration', '時間', '时长', '時長', 'Duración', 'Durée', 'Dauer', 'Duração', 'Thời gian', 'ระยะเวลา', 'Durasi', 'المدة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.intensity', 'guardian',
 '강도', 'Intensity', '強度', '强度', '強度', 'Intensidad', 'Intensité', 'Intensität', 'Intensidade', 'Cường độ', 'ความเข้มข้น', 'Intensitas', 'الشدة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.distance', 'guardian',
 '거리', 'Distance', '距離', '距离', '距離', 'Distancia', 'Distance', 'Entfernung', 'Distância', 'Khoảng cách', 'ระยะทาง', 'Jarak', 'المسافة',
 true, NOW(), NOW()),

(gen_random_uuid()::text, 'guardian.record.dose', 'guardian',
 '용량', 'Dose', '用量', '剂量', '劑量', 'Dosis', 'Dose', 'Dosis', 'Dose', 'Liều lượng', 'ขนาดยา', 'Dosis', 'الجرعة',
 true, NOW(), NOW())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();


-- --------------------------------------------------------------------------
-- Source: 051_vaccination_type_seed.sql (i18n portion)
-- --------------------------------------------------------------------------


-- --------------------------------------------------------------------------
-- Source: 057_exercise_logs.sql (i18n portion)
-- --------------------------------------------------------------------------
-- ── 5. i18n: master category label ──────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mc-exercise-type', 'master.exercise_type', 'master', true,
   '운동 유형', 'Exercise Type', '運動タイプ', '运动类型', '運動類型',
   'Tipo de ejercicio', 'Type d''exercice', 'Übungstyp', 'Tipo de exercício',
   'Loại bài tập', 'ประเภทการออกกำลังกาย', 'Jenis olahraga', 'نوع التمرين',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 6. i18n: L1 exercise type labels ────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-walking', 'master.exercise_type.walking', 'master', true,
   '산책', 'Walking', '散歩', '散步', '散步', 'Caminata', 'Promenade', 'Spaziergang', 'Caminhada', 'Đi dạo', 'เดินเล่น', 'Jalan-jalan', 'المشي', NOW(), NOW()),
  ('i18n-ex-running', 'master.exercise_type.running', 'master', true,
   '달리기', 'Running', 'ランニング', '跑步', '跑步', 'Correr', 'Course', 'Laufen', 'Corrida', 'Chạy bộ', 'วิ่ง', 'Berlari', 'الركض', NOW(), NOW()),
  ('i18n-ex-swimming', 'master.exercise_type.swimming', 'master', true,
   '수영', 'Swimming', '水泳', '游泳', '游泳', 'Natación', 'Natation', 'Schwimmen', 'Natação', 'Bơi lội', 'ว่ายน้ำ', 'Berenang', 'السباحة', NOW(), NOW()),
  ('i18n-ex-play', 'master.exercise_type.play', 'master', true,
   '놀이', 'Play', '遊び', '玩耍', '玩耍', 'Juego', 'Jeu', 'Spielen', 'Brincadeira', 'Chơi', 'เล่น', 'Bermain', 'اللعب', NOW(), NOW()),
  ('i18n-ex-training', 'master.exercise_type.training', 'master', true,
   '훈련', 'Training', 'トレーニング', '训练', '訓練', 'Entrenamiento', 'Entraînement', 'Training', 'Treinamento', 'Huấn luyện', 'ฝึกฝน', 'Latihan', 'التدريب', NOW(), NOW()),
  ('i18n-ex-rehabilitation', 'master.exercise_type.rehabilitation', 'master', true,
   '재활', 'Rehabilitation', 'リハビリ', '康复', '復健', 'Rehabilitación', 'Rééducation', 'Rehabilitation', 'Reabilitação', 'Phục hồi chức năng', 'การฟื้นฟู', 'Rehabilitasi', 'إعادة التأهيل', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 7. i18n: L2 exercise subtype labels ─────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-short-walk', 'master.exercise_type.short_walk', 'master', true,
   '짧은 산책', 'Short Walk', '短い散歩', '短途散步', '短途散步', 'Caminata corta', 'Courte promenade', 'Kurzer Spaziergang', 'Caminhada curta', 'Đi dạo ngắn', 'เดินเล่นสั้นๆ', 'Jalan pendek', 'نزهة قصيرة', NOW(), NOW()),
  ('i18n-ex-regular-walk', 'master.exercise_type.regular_walk', 'master', true,
   '일반 산책', 'Regular Walk', '通常の散歩', '普通散步', '普通散步', 'Caminata regular', 'Promenade régulière', 'Normaler Spaziergang', 'Caminhada regular', 'Đi dạo thường', 'เดินเล่นปกติ', 'Jalan biasa', 'نزهة عادية', NOW(), NOW()),
  ('i18n-ex-long-walk', 'master.exercise_type.long_walk', 'master', true,
   '긴 산책', 'Long Walk', '長い散歩', '长途散步', '長途散步', 'Caminata larga', 'Longue promenade', 'Langer Spaziergang', 'Caminhada longa', 'Đi dạo dài', 'เดินเล่นยาว', 'Jalan panjang', 'نزهة طويلة', NOW(), NOW()),
  ('i18n-ex-hiking', 'master.exercise_type.hiking', 'master', true,
   '하이킹', 'Hiking', 'ハイキング', '远足', '健行', 'Senderismo', 'Randonnée', 'Wandern', 'Trilha', 'Đi bộ đường dài', 'เดินป่า', 'Hiking', 'المشي لمسافات', NOW(), NOW()),
  ('i18n-ex-run-owner', 'master.exercise_type.running_with_owner', 'master', true,
   '보호자와 달리기', 'Running with Owner', '飼い主と走る', '和主人跑步', '和主人跑步', 'Correr con dueño', 'Courir avec le maître', 'Laufen mit Besitzer', 'Corrida com dono', 'Chạy với chủ', 'วิ่งกับเจ้าของ', 'Berlari dengan pemilik', 'الركض مع المالك', NOW(), NOW()),
  ('i18n-ex-free-running', 'master.exercise_type.free_running', 'master', true,
   '자유 달리기', 'Free Running', '自由走り', '自由跑步', '自由跑步', 'Carrera libre', 'Course libre', 'Freilauf', 'Corrida livre', 'Chạy tự do', 'วิ่งอิสระ', 'Lari bebas', 'الركض الحر', NOW(), NOW()),
  ('i18n-ex-natural-swim', 'master.exercise_type.natural_swimming', 'master', true,
   '자연 수영', 'Natural Swimming', '自然水泳', '自然游泳', '自然游泳', 'Natación natural', 'Nage naturelle', 'Natürliches Schwimmen', 'Natação natural', 'Bơi tự nhiên', 'ว่ายน้ำธรรมชาติ', 'Renang alami', 'السباحة الطبيعية', NOW(), NOW()),
  ('i18n-ex-pool-swim', 'master.exercise_type.pool_swimming', 'master', true,
   '수영장', 'Pool Swimming', 'プール水泳', '泳池游泳', '泳池游泳', 'Natación en piscina', 'Piscine', 'Poolschwimmen', 'Natação em piscina', 'Bơi hồ bơi', 'ว่ายน้ำสระ', 'Renang kolam', 'السباحة في المسبح', NOW(), NOW()),
  ('i18n-ex-ball-play', 'master.exercise_type.ball_play', 'master', true,
   '공놀이', 'Ball Play', 'ボール遊び', '球类游戏', '球類遊戲', 'Juego de pelota', 'Jeu de balle', 'Ballspiel', 'Brincadeira com bola', 'Chơi bóng', 'เล่นบอล', 'Main bola', 'اللعب بالكرة', NOW(), NOW()),
  ('i18n-ex-tug-play', 'master.exercise_type.tug_play', 'master', true,
   '줄다리기', 'Tug Play', '引っ張り遊び', '拔河游戏', '拔河遊戲', 'Juego de tira', 'Jeu de traction', 'Zerrspiel', 'Cabo de guerra', 'Kéo co', 'เล่นดึง', 'Main tarik', 'لعبة السحب', NOW(), NOW()),
  ('i18n-ex-hide-seek', 'master.exercise_type.hide_and_seek', 'master', true,
   '숨바꼭질', 'Hide and Seek', 'かくれんぼ', '捉迷藏', '捉迷藏', 'Escondite', 'Cache-cache', 'Verstecken', 'Esconde-esconde', 'Trốn tìm', 'ซ่อนหา', 'Petak umpet', 'الغميضة', NOW(), NOW()),
  ('i18n-ex-free-play', 'master.exercise_type.free_play', 'master', true,
   '자유 놀이', 'Free Play', '自由遊び', '自由玩耍', '自由玩耍', 'Juego libre', 'Jeu libre', 'Freispiel', 'Brincadeira livre', 'Chơi tự do', 'เล่นอิสระ', 'Bermain bebas', 'اللعب الحر', NOW(), NOW()),
  ('i18n-ex-basic-obedience', 'master.exercise_type.basic_obedience', 'master', true,
   '기본 복종', 'Basic Obedience', '基本服従', '基础服从', '基礎服從', 'Obediencia básica', 'Obéissance de base', 'Grundgehorsam', 'Obediência básica', 'Vâng lời cơ bản', 'การเชื่อฟังพื้นฐาน', 'Kepatuhan dasar', 'الطاعة الأساسية', NOW(), NOW()),
  ('i18n-ex-agility', 'master.exercise_type.agility', 'master', true,
   '어질리티', 'Agility', 'アジリティ', '敏捷训练', '敏捷訓練', 'Agilidad', 'Agilité', 'Agility', 'Agilidade', 'Nhanh nhẹn', 'อะจิลิตี้', 'Agility', 'خفة الحركة', NOW(), NOW()),
  ('i18n-ex-nose-work', 'master.exercise_type.nose_work', 'master', true,
   '노즈워크', 'Nose Work', 'ノーズワーク', '嗅觉训练', '嗅覺訓練', 'Trabajo de nariz', 'Travail de nez', 'Nasenarbeit', 'Faro', 'Huấn luyện khứu giác', 'การฝึกจมูก', 'Nose work', 'عمل الأنف', NOW(), NOW()),
  ('i18n-ex-frisbee', 'master.exercise_type.frisbee', 'master', true,
   '프리스비', 'Frisbee', 'フリスビー', '飞盘', '飛盤', 'Frisbee', 'Frisbee', 'Frisbee', 'Frisbee', 'Đĩa bay', 'ฟริสบี้', 'Frisbee', 'فريسبي', NOW(), NOW()),
  ('i18n-ex-walking-rehab', 'master.exercise_type.walking_rehab', 'master', true,
   '보행 재활', 'Walking Rehab', '歩行リハビリ', '步行康复', '步行復健', 'Rehabilitación de caminata', 'Rééducation à la marche', 'Gehrehabilitation', 'Reabilitação de caminhada', 'Phục hồi đi bộ', 'การฟื้นฟูการเดิน', 'Rehabilitasi jalan', 'إعادة تأهيل المشي', NOW(), NOW()),
  ('i18n-ex-aqua-rehab', 'master.exercise_type.aqua_rehab', 'master', true,
   '수중 재활', 'Aqua Rehab', '水中リハビリ', '水中康复', '水中復健', 'Rehabilitación acuática', 'Rééducation aquatique', 'Aqua-Rehabilitation', 'Reabilitação aquática', 'Phục hồi dưới nước', 'การฟื้นฟูในน้ำ', 'Rehabilitasi air', 'إعادة التأهيل المائي', NOW(), NOW()),
  ('i18n-ex-stretching', 'master.exercise_type.stretching', 'master', true,
   '스트레칭', 'Stretching', 'ストレッチ', '拉伸', '伸展', 'Estiramiento', 'Étirement', 'Dehnen', 'Alongamento', 'Kéo giãn', 'ยืดกล้ามเนื้อ', 'Peregangan', 'تمارين الإطالة', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 8. i18n: UI labels for guardian.exercise.* ──────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-ui-add', 'guardian.exercise.add', 'guardian', true,
   '운동 추가', 'Add Exercise', '運動を追加', '添加运动', '新增運動', 'Agregar ejercicio', 'Ajouter exercice', 'Übung hinzufügen', 'Adicionar exercício', 'Thêm bài tập', 'เพิ่มการออกกำลังกาย', 'Tambah olahraga', 'إضافة تمرين', NOW(), NOW()),
  ('i18n-ex-ui-title', 'guardian.exercise.title', 'guardian', true,
   '운동 기록', 'Exercise Log', '運動記録', '运动记录', '運動記錄', 'Registro de ejercicio', 'Journal d''exercice', 'Trainingsprotokoll', 'Registro de exercício', 'Nhật ký tập luyện', 'บันทึกการออกกำลังกาย', 'Log olahraga', 'سجل التمرين', NOW(), NOW()),
  ('i18n-ex-ui-edit', 'guardian.exercise.edit_title', 'guardian', true,
   '운동 수정', 'Edit Exercise', '運動を編集', '编辑运动', '編輯運動', 'Editar ejercicio', 'Modifier exercice', 'Übung bearbeiten', 'Editar exercício', 'Sửa bài tập', 'แก้ไขการออกกำลังกาย', 'Edit olahraga', 'تعديل التمرين', NOW(), NOW()),
  ('i18n-ex-ui-type', 'guardian.exercise.type', 'guardian', true,
   '운동 종류', 'Exercise Type', '運動の種類', '运动类型', '運動類型', 'Tipo', 'Type', 'Typ', 'Tipo', 'Loại', 'ประเภท', 'Jenis', 'النوع', NOW(), NOW()),
  ('i18n-ex-ui-subtype', 'guardian.exercise.subtype', 'guardian', true,
   '세부 종류', 'Subtype', 'サブタイプ', '子类型', '子類型', 'Subtipo', 'Sous-type', 'Untertyp', 'Subtipo', 'Phân loại', 'ประเภทย่อย', 'Sub-jenis', 'النوع الفرعي', NOW(), NOW()),
  ('i18n-ex-ui-duration', 'guardian.exercise.duration', 'guardian', true,
   '시간 (분)', 'Duration (min)', '時間（分）', '时长（分钟）', '時長（分鐘）', 'Duración (min)', 'Durée (min)', 'Dauer (Min)', 'Duração (min)', 'Thời lượng (phút)', 'ระยะเวลา (นาที)', 'Durasi (menit)', 'المدة (دقيقة)', NOW(), NOW()),
  ('i18n-ex-ui-distance', 'guardian.exercise.distance', 'guardian', true,
   '거리 (km)', 'Distance (km)', '距離（km）', '距离（km）', '距離（km）', 'Distancia (km)', 'Distance (km)', 'Distanz (km)', 'Distância (km)', 'Khoảng cách (km)', 'ระยะทาง (กม.)', 'Jarak (km)', 'المسافة (كم)', NOW(), NOW()),
  ('i18n-ex-ui-intensity', 'guardian.exercise.intensity', 'guardian', true,
   '강도', 'Intensity', '強度', '强度', '強度', 'Intensidad', 'Intensité', 'Intensität', 'Intensidade', 'Cường độ', 'ความเข้มข้น', 'Intensitas', 'الشدة', NOW(), NOW()),
  ('i18n-ex-ui-leash', 'guardian.exercise.leash', 'guardian', true,
   '리드줄 사용', 'Leash Used', 'リード使用', '使用牵引绳', '使用牽引繩', 'Con correa', 'En laisse', 'An der Leine', 'Com guia', 'Có dây dắt', 'ใส่สายจูง', 'Pakai tali', 'بالمقود', NOW(), NOW()),
  ('i18n-ex-ui-location', 'guardian.exercise.location', 'guardian', true,
   '장소', 'Location', '場所', '地点', '地點', 'Ubicación', 'Lieu', 'Ort', 'Local', 'Địa điểm', 'สถานที่', 'Lokasi', 'الموقع', NOW(), NOW()),
  ('i18n-ex-ui-with-others', 'guardian.exercise.with_others', 'guardian', true,
   '다른 반려동물과 함께', 'With Other Pets', '他のペットと一緒', '与其他宠物一起', '與其他寵物一起', 'Con otras mascotas', 'Avec d''autres animaux', 'Mit anderen Haustieren', 'Com outros pets', 'Với thú cưng khác', 'กับสัตว์เลี้ยงอื่น', 'Dengan hewan lain', 'مع حيوانات أخرى', NOW(), NOW()),
  ('i18n-ex-ui-no-logs', 'guardian.exercise.no_logs', 'guardian', true,
   '운동 기록이 없습니다', 'No exercise logs', '運動記録がありません', '没有运动记录', '沒有運動記錄', 'Sin registros', 'Aucun enregistrement', 'Keine Einträge', 'Sem registros', 'Không có nhật ký', 'ไม่มีบันทึก', 'Tidak ada log', 'لا توجد سجلات', NOW(), NOW()),
  ('i18n-ex-ui-create-failed', 'guardian.exercise.create_failed', 'guardian', true,
   '운동 기록 저장에 실패했습니다', 'Failed to save exercise log', '運動記録の保存に失敗しました', '保存运动记录失败', '儲存運動記錄失敗', 'Error al guardar', 'Échec de la sauvegarde', 'Speichern fehlgeschlagen', 'Falha ao salvar', 'Không thể lưu', 'บันทึกล้มเหลว', 'Gagal menyimpan', 'فشل في الحفظ', NOW(), NOW()),
  ('i18n-ex-ui-int-low', 'guardian.exercise.intensity_low', 'guardian', true,
   '낮음', 'Low', '低い', '低', '低', 'Baja', 'Faible', 'Niedrig', 'Baixa', 'Thấp', 'ต่ำ', 'Rendah', 'منخفضة', NOW(), NOW()),
  ('i18n-ex-ui-int-med', 'guardian.exercise.intensity_medium', 'guardian', true,
   '보통', 'Medium', '普通', '中', '中', 'Media', 'Moyen', 'Mittel', 'Média', 'Trung bình', 'ปานกลาง', 'Sedang', 'متوسطة', NOW(), NOW()),
  ('i18n-ex-ui-int-high', 'guardian.exercise.intensity_high', 'guardian', true,
   '높음', 'High', '高い', '高', '高', 'Alta', 'Élevé', 'Hoch', 'Alta', 'Cao', 'สูง', 'Tinggi', 'عالية', NOW(), NOW()),
  ('i18n-ex-ui-loc-indoor', 'guardian.exercise.location_indoor', 'guardian', true,
   '실내', 'Indoor', '室内', '室内', '室內', 'Interior', 'Intérieur', 'Innen', 'Interior', 'Trong nhà', 'ในร่ม', 'Dalam ruangan', 'داخلي', NOW(), NOW()),
  ('i18n-ex-ui-loc-outdoor', 'guardian.exercise.location_outdoor', 'guardian', true,
   '실외', 'Outdoor', '屋外', '户外', '戶外', 'Exterior', 'Extérieur', 'Außen', 'Exterior', 'Ngoài trời', 'กลางแจ้ง', 'Luar ruangan', 'خارجي', NOW(), NOW()),
  ('i18n-ex-ui-loc-park', 'guardian.exercise.location_park', 'guardian', true,
   '공원', 'Park', '公園', '公园', '公園', 'Parque', 'Parc', 'Park', 'Parque', 'Công viên', 'สวนสาธารณะ', 'Taman', 'حديقة', NOW(), NOW()),
  ('i18n-ex-ui-loc-beach', 'guardian.exercise.location_beach', 'guardian', true,
   '해변', 'Beach', 'ビーチ', '海滩', '海灘', 'Playa', 'Plage', 'Strand', 'Praia', 'Bãi biển', 'ชายหาด', 'Pantai', 'شاطئ', NOW(), NOW()),
  ('i18n-ex-ui-loc-other', 'guardian.exercise.location_other', 'guardian', true,
   '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่นๆ', 'Lainnya', 'أخرى', NOW(), NOW()),
  ('i18n-ex-ui-date', 'guardian.exercise.date', 'guardian', true,
   '운동 날짜', 'Exercise Date', '運動日', '运动日期', '運動日期', 'Fecha', 'Date', 'Datum', 'Data', 'Ngày', 'วันที่', 'Tanggal', 'التاريخ', NOW(), NOW()),
  ('i18n-ex-ui-note', 'guardian.exercise.note', 'guardian', true,
   '메모', 'Note', 'メモ', '备注', '備註', 'Nota', 'Note', 'Notiz', 'Nota', 'Ghi chú', 'บันทึก', 'Catatan', 'ملاحظة', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 058_supplement_exercise_l3_seed.sql (i18n portion)
-- --------------------------------------------------------------------------


-- --------------------------------------------------------------------------
-- Source: 059_supplement_catalog.sql (i18n portion)
-- --------------------------------------------------------------------------
-- ===== 8. I18N TRANSLATIONS =====
-- Category (1) + Types (6) + Manufacturers (7) + Brands (8) = 22 rows
INSERT INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
  -- Master category label
  (md5('i18n_master_supplement_type'), 'master.supplement_type', 'master', true,
    '영양제 유형', 'Supplement Type',
    'サプリメントタイプ', '营养补充剂类型', '營養補充劑類型',
    'Tipo de Suplemento', 'Type de Supplement', 'Erganzungstyp',
    'Tipo de Suplemento', 'Loai Thuc Pham Bo Sung', 'ประเภทอาหารเสริม',
    'Jenis Suplemen', 'نوع المكمل',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  -- Supplement type labels (6)
  (md5('i18n_suppl_type_joint'), 'master.supplement_type.joint_supplement_core', 'master', true,
    '관절 영양제', 'Joint Supplement',
    '関節サプリ', '关节营养品', '關節營養品',
    'Suplemento Articular', 'Supplement Articulaire', 'Gelenkerganzung',
    'Suplemento Articular', 'Bo Sung Khop', 'อาหารเสริมข้อต่อ',
    'Suplemen Sendi', 'مكمل المفاصل',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_digestive'), 'master.supplement_type.digestive_supplement_core', 'master', true,
    '소화 영양제', 'Digestive Supplement',
    '消化サプリ', '消化营养品', '消化營養品',
    'Suplemento Digestivo', 'Supplement Digestif', 'Verdauungserganzung',
    'Suplemento Digestivo', 'Bo Sung Tieu Hoa', 'อาหารเสริมระบบย่อยอาหาร',
    'Suplemen Pencernaan', 'مكمل الجهاز الهضمي',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_vitamin'), 'master.supplement_type.vitamin_supplement_core', 'master', true,
    '비타민 영양제', 'Vitamin Supplement',
    'ビタミンサプリ', '维生素营养品', '維生素營養品',
    'Suplemento Vitaminico', 'Supplement Vitaminique', 'Vitaminerganzung',
    'Suplemento Vitaminico', 'Bo Sung Vitamin', 'อาหารเสริมวิตามิน',
    'Suplemen Vitamin', 'مكمل فيتامين',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_skin_coat'), 'master.supplement_type.skin_coat_supplement_core', 'master', true,
    '피부/모질 영양제', 'Skin & Coat Supplement',
    '皮膚・被毛サプリ', '皮肤毛发营养品', '皮膚毛髮營養品',
    'Suplemento Piel y Pelaje', 'Supplement Peau et Pelage', 'Haut- & Fellerganzung',
    'Suplemento Pele e Pelagem', 'Bo Sung Da Long', 'อาหารเสริมผิวหนังและขน',
    'Suplemen Kulit & Bulu', 'مكمل البشرة والفراء',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_immune'), 'master.supplement_type.immune_supplement_core', 'master', true,
    '면역 영양제', 'Immune Supplement',
    '免疫サプリ', '免疫营养品', '免疫營養品',
    'Suplemento Inmunologico', 'Supplement Immunitaire', 'Immunerganzung',
    'Suplemento Imunologico', 'Bo Sung Mien Dich', 'อาหารเสริมภูมิคุ้มกัน',
    'Suplemen Imun', 'مكمل المناعة',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_type_prescription'), 'master.supplement_type.prescription_supplement_core', 'master', true,
    '처방 영양제', 'Prescription Supplement',
    '処方サプリ', '处方营养品', '處方營養品',
    'Suplemento con Receta', 'Supplement sur Ordonnance', 'Verschreibungspflichtiges Erganzungsmittel',
    'Suplemento com Receita', 'Bo Sung Theo Don', 'อาหารเสริมตามใบสั่ง',
    'Suplemen Resep', 'مكمل بوصفة طبية',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  -- Manufacturer i18n (7)
  (md5('i18n_suppl_mfr_zoetis'), 'supplement.manufacturer.zoetis', 'supplement', true,
    'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis', 'Zoetis',
    'Zoetis', 'Zoetis',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_vetri'), 'supplement.manufacturer.vetri_science', 'supplement', true,
    '벳트리사이언스', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_purina'), 'supplement.manufacturer.purina_suppl', 'supplement', true,
    '퓨리나', 'Purina',
    'ピュリナ', '普瑞纳', '普瑞納',
    'Purina', 'Purina', 'Purina',
    'Purina', 'Purina', 'Purina',
    'Purina', 'بيورينا',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_nutramax'), 'supplement.manufacturer.nutramax', 'supplement', true,
    'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax', 'Nutramax',
    'Nutramax', 'Nutramax',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_zesty'), 'supplement.manufacturer.zesty_paws', 'supplement', true,
    '제스티포즈', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_nordic'), 'supplement.manufacturer.nordic_naturals', 'supplement', true,
    '노르딕내추럴스', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_mfr_rx'), 'supplement.manufacturer.rx_only', 'supplement', true,
    '처방전용', 'Rx Only',
    '処方専用', '处方专用', '處方專用',
    'Solo con Receta', 'Ordonnance Uniquement', 'Nur auf Rezept',
    'Somente com Receita', 'Chi Theo Don', 'ตามใบสั่งยาเท่านั้น',
    'Resep Saja', 'بوصفة طبية فقط',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  -- Brand i18n (8)
  (md5('i18n_suppl_brand_cosequin'), 'supplement.brand.cosequin', 'supplement', true,
    'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin', 'Cosequin',
    'Cosequin', 'Cosequin',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_vetri'), 'supplement.brand.vetri_science', 'supplement', true,
    'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science', 'Vetri-Science',
    'Vetri-Science', 'Vetri-Science',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_purina_pp'), 'supplement.brand.purina_pro_plan', 'supplement', true,
    '프로플랜', 'Purina Pro Plan',
    'ピュリナ プロプラン', '普瑞纳冠能', '普瑞納冠能',
    'Purina Pro Plan', 'Purina Pro Plan', 'Purina Pro Plan',
    'Purina Pro Plan', 'Purina Pro Plan', 'Purina Pro Plan',
    'Purina Pro Plan', 'بيورينا برو بلان',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_proviable'), 'supplement.brand.proviable', 'supplement', true,
    'Proviable', 'Proviable',
    'Proviable', 'Proviable', 'Proviable',
    'Proviable', 'Proviable', 'Proviable',
    'Proviable', 'Proviable', 'Proviable',
    'Proviable', 'Proviable',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_welactin'), 'supplement.brand.welactin', 'supplement', true,
    'Welactin', 'Welactin',
    'Welactin', 'Welactin', 'Welactin',
    'Welactin', 'Welactin', 'Welactin',
    'Welactin', 'Welactin', 'Welactin',
    'Welactin', 'Welactin',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_zesty'), 'supplement.brand.zesty_paws', 'supplement', true,
    'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws', 'Zesty Paws',
    'Zesty Paws', 'Zesty Paws',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_nordic'), 'supplement.brand.nordic_naturals', 'supplement', true,
    'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals', 'Nordic Naturals',
    'Nordic Naturals', 'Nordic Naturals',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00'),

  (md5('i18n_suppl_brand_rx'), 'supplement.brand.rx_only', 'supplement', true,
    '처방전용', 'Rx Only',
    '処方専用', '处方专用', '處方專用',
    'Solo con Receta', 'Ordonnance Uniquement', 'Nur auf Rezept',
    'Somente com Receita', 'Chi Theo Don', 'ตามใบสั่งยาเท่านั้น',
    'Resep Saja', 'بوصفة طبية فقط',
    '2026-03-11 12:00:00', '2026-03-11 12:00:00')
ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 060_exercise_intensity_location_master.sql (i18n portion)
-- --------------------------------------------------------------------------
-- ── 5. i18n: category labels ─────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mc-exercise-intensity', 'master.exercise_intensity', 'master', true,
   '운동 강도', 'Exercise Intensity', '運動強度', '运动强度', '運動強度',
   'Intensidad del ejercicio', 'Intensité de l''exercice', 'Trainingsintensität', 'Intensidade do exercício',
   'Cường độ tập luyện', 'ความเข้มข้นของการออกกำลังกาย', 'Intensitas olahraga', 'شدة التمرين',
   NOW(), NOW()),
  ('i18n-mc-exercise-location', 'master.exercise_location', 'master', true,
   '운동 장소', 'Exercise Location', '運動場所', '运动地点', '運動地點',
   'Ubicación del ejercicio', 'Lieu d''exercice', 'Trainingsort', 'Local do exercício',
   'Địa điểm tập luyện', 'สถานที่ออกกำลังกาย', 'Lokasi olahraga', 'موقع التمرين',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 6. i18n: intensity item labels ───────────────────────────────────────────
-- Reuses existing translations from 057 (guardian.exercise.intensity_*)
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mi-exercise-intensity-low', 'master.exercise_intensity.low', 'master', true,
   '낮음', 'Low', '低い', '低', '低', 'Baja', 'Faible', 'Niedrig', 'Baixa', 'Thấp', 'ต่ำ', 'Rendah', 'منخفضة', NOW(), NOW()),
  ('i18n-mi-exercise-intensity-medium', 'master.exercise_intensity.medium', 'master', true,
   '보통', 'Medium', '普通', '中', '中', 'Media', 'Moyen', 'Mittel', 'Média', 'Trung bình', 'ปานกลาง', 'Sedang', 'متوسطة', NOW(), NOW()),
  ('i18n-mi-exercise-intensity-high', 'master.exercise_intensity.high', 'master', true,
   '높음', 'High', '高い', '高', '高', 'Alta', 'Élevé', 'Hoch', 'Alta', 'Cao', 'สูง', 'Tinggi', 'عالية', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 7. i18n: location item labels ────────────────────────────────────────────
-- Reuses existing translations from 057 (guardian.exercise.location_*)
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-mi-exercise-location-indoor', 'master.exercise_location.indoor', 'master', true,
   '실내', 'Indoor', '室内', '室内', '室內', 'Interior', 'Intérieur', 'Innen', 'Interior', 'Trong nhà', 'ในร่ม', 'Dalam ruangan', 'داخلي', NOW(), NOW()),
  ('i18n-mi-exercise-location-outdoor', 'master.exercise_location.outdoor', 'master', true,
   '실외', 'Outdoor', '屋外', '户外', '戶外', 'Exterior', 'Extérieur', 'Außen', 'Exterior', 'Ngoài trời', 'กลางแจ้ง', 'Luar ruangan', 'خارجي', NOW(), NOW()),
  ('i18n-mi-exercise-location-park', 'master.exercise_location.park', 'master', true,
   '공원', 'Park', '公園', '公园', '公園', 'Parque', 'Parc', 'Park', 'Parque', 'Công viên', 'สวนสาธารณะ', 'Taman', 'حديقة', NOW(), NOW()),
  ('i18n-mi-exercise-location-beach', 'master.exercise_location.beach', 'master', true,
   '해변', 'Beach', 'ビーチ', '海滩', '海灘', 'Playa', 'Plage', 'Strand', 'Praia', 'Bãi biển', 'ชายหาด', 'Pantai', 'شاطئ', NOW(), NOW()),
  ('i18n-mi-exercise-location-other', 'master.exercise_location.other', 'master', true,
   '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่นๆ', 'Lainnya', 'أخرى', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 060_pet_supplement_support.sql (i18n only)
-- --------------------------------------------------------------------------
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


-- --------------------------------------------------------------------------
-- Source: 062_exercise_companion_pets.sql (i18n only)
-- --------------------------------------------------------------------------
-- ── 2. i18n: new UI keys for exercise modal enhancements ──────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-ui-companion-search', 'guardian.exercise.companion_search', 'guardian', true,
   '친구 반려동물 검색...', 'Search friend''s pet...', '友達のペットを検索...', '搜索好友宠物...', '搜尋好友寵物...',
   'Buscar mascota de amigo...', 'Chercher animal d''ami...', 'Haustier eines Freundes suchen...', 'Buscar pet de amigo....',
   'Tìm thú cưng bạn bè...', 'ค้นหาสัตว์เลี้ยงของเพื่อน...', 'Cari hewan teman...', 'البحث عن حيوان صديق...',
   NOW(), NOW()),
  ('i18n-ex-ui-no-friends', 'guardian.exercise.no_friends', 'guardian', true,
   '연결된 친구가 없습니다', 'No connected friends', '接続された友達がいません', '没有好友', '沒有好友',
   'Sin amigos conectados', 'Aucun ami connecté', 'Keine verbundenen Freunde', 'Sem amigos conectados',
   'Không có bạn bè kết nối', 'ไม่มีเพื่อนที่เชื่อมต่อ', 'Tidak ada teman terhubung', 'لا يوجد أصدقاء متصلون',
   NOW(), NOW()),
  ('i18n-ex-ui-map-coming', 'guardian.exercise.map_coming_soon', 'guardian', true,
   '지도 검색 (준비 중)', 'Map Search (Coming Soon)', 'マップ検索（近日公開）', '地图搜索（即将推出）', '地圖搜尋（即將推出）',
   'Búsqueda en mapa (Próximamente)', 'Recherche sur carte (Bientôt)', 'Kartensuche (Demnächst)', 'Busca no mapa (Em breve)',
   'Tìm trên bản đồ (Sắp ra mắt)', 'ค้นหาแผนที่ (เร็วๆ นี้)', 'Cari peta (Segera)', 'البحث على الخريطة (قريبًا)',
   NOW(), NOW()),
  ('i18n-ex-ui-duration-unit', 'guardian.exercise.duration_unit', 'guardian', true,
   '분', 'min', '分', '分钟', '分鐘',
   'min', 'min', 'Min', 'min',
   'phút', 'นาที', 'mnt', 'دقيقة',
   NOW(), NOW()),
  ('i18n-ex-ui-companion-pets', 'guardian.exercise.companion_pets', 'guardian', true,
   '함께 운동한 반려동물', 'Companion Pets', '一緒に運動したペット', '同伴宠物', '同伴寵物',
   'Mascotas compañeras', 'Animaux compagnons', 'Begleittiere', 'Pets companheiros',
   'Thú cưng đồng hành', 'สัตว์เลี้ยงร่วม', 'Hewan pendamping', 'حيوانات مرافقة',
   NOW(), NOW()),
  ('i18n-ex-ui-companion-remove', 'guardian.exercise.companion_remove', 'guardian', true,
   '제거', 'Remove', '削除', '移除', '移除',
   'Eliminar', 'Supprimer', 'Entfernen', 'Remover',
   'Xóa', 'ลบ', 'Hapus', 'إزالة',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- --------------------------------------------------------------------------
-- Source: 065_model_images.sql (i18n only)
-- --------------------------------------------------------------------------
-- i18n keys for catalog image UI
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-cat-img', 'admin.catalog.image', 'admin', true,
   '이미지', 'Image', '画像', '图片', '圖片', 'Imagen', 'Image', 'Bild', 'Imagem', 'Hình ảnh', 'รูปภาพ', 'Gambar', 'صورة',
   NOW(), NOW()),
  ('i18n-cat-upload-img', 'admin.catalog.upload_image', 'admin', true,
   '이미지 업로드', 'Upload Image', '画像アップロード', '上传图片', '上傳圖片', 'Subir imagen', 'Télécharger', 'Bild hochladen', 'Enviar imagem', 'Tải ảnh lên', 'อัปโหลดรูป', 'Unggah gambar', 'رفع صورة',
   NOW(), NOW()),
  ('i18n-cat-change-img', 'admin.catalog.change_image', 'admin', true,
   '이미지 변경', 'Change Image', '画像変更', '更换图片', '更換圖片', 'Cambiar imagen', 'Changer', 'Bild ändern', 'Alterar imagem', 'Đổi ảnh', 'เปลี่ยนรูป', 'Ganti gambar', 'تغيير الصورة',
   NOW(), NOW()),
  ('i18n-cat-remove-img', 'admin.catalog.remove_image', 'admin', true,
   '이미지 삭제', 'Remove Image', '画像削除', '删除图片', '刪除圖片', 'Eliminar imagen', 'Supprimer', 'Bild entfernen', 'Remover imagem', 'Xóa ảnh', 'ลบรูป', 'Hapus gambar', 'إزالة الصورة',
   NOW(), NOW()),
  ('i18n-cat-no-img', 'admin.catalog.no_image', 'admin', true,
   '이미지 없음', 'No Image', '画像なし', '无图片', '無圖片', 'Sin imagen', 'Pas d''image', 'Kein Bild', 'Sem imagem', 'Không có ảnh', 'ไม่มีรูป', 'Tidak ada gambar', 'لا توجد صورة',
   NOW(), NOW()),
  ('i18n-cat-img-hint', 'admin.catalog.image_upload_hint', 'admin', true,
   '권장 200×200, jpg/png/webp', 'Recommended 200×200, jpg/png/webp', '推奨 200×200, jpg/png/webp', '建议 200×200, jpg/png/webp', '建議 200×200, jpg/png/webp', 'Recomendado 200×200, jpg/png/webp', 'Recommandé 200×200, jpg/png/webp', 'Empfohlen 200×200, jpg/png/webp', 'Recomendado 200×200, jpg/png/webp', 'Khuyến nghị 200×200, jpg/png/webp', 'แนะนำ 200×200, jpg/png/webp', 'Disarankan 200×200, jpg/png/webp', 'موصى به 200×200, jpg/png/webp',
   NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar;


-- --------------------------------------------------------------------------
-- Source: 070_medicine_catalog.sql (i18n portion)
-- --------------------------------------------------------------------------
-- ===== 6. I18N — Manufacturer, Brand, Model name_keys =====
INSERT INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
  -- Manufacturers (9)
  (md5('i18n_med_mfr_zoetis'),       'medicine.manufacturer.zoetis',       'medicine', true, 'Zoetis',           'Zoetis',               'Zoetis',               'Zoetis',               'Zoetis',               'Zoetis',           'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       'Zoetis',       NOW(), NOW()),
  (md5('i18n_med_mfr_novo'),         'medicine.manufacturer.novo_nordisk', 'medicine', true, '노보노디스크',     'Novo Nordisk',         'ノボノルディスク',      '诺和诺德',              '諾和諾德',              'Novo Nordisk',     'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'Novo Nordisk', 'نوفو نورديسك', NOW(), NOW()),
  (md5('i18n_med_mfr_boehringer'),   'medicine.manufacturer.boehringer',   'medicine', true, '베링거인겔하임',   'Boehringer Ingelheim', 'ベーリンガーインゲルハイム', '勃林格殷格翰',       '勃林格殷格翰',       'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'Boehringer Ingelheim', 'بورينجر إنجلهايم', NOW(), NOW()),
  (md5('i18n_med_mfr_dechra'),       'medicine.manufacturer.dechra',       'medicine', true, 'Dechra',           'Dechra',               'Dechra',               'Dechra',               'Dechra',               'Dechra',           'Dechra',       'Dechra',       'Dechra',       'Dechra',       'Dechra',       'Dechra',       'Dechra',       NOW(), NOW()),
  (md5('i18n_med_mfr_virbac'),       'medicine.manufacturer.virbac',       'medicine', true, 'Virbac',           'Virbac',               'Virbac',               'Virbac',               'Virbac',               'Virbac',           'Virbac',       'Virbac',       'Virbac',       'Virbac',       'Virbac',       'Virbac',       'Virbac',       NOW(), NOW()),
  (md5('i18n_med_mfr_elanco'),       'medicine.manufacturer.elanco',       'medicine', true, 'Elanco',           'Elanco',               'Elanco',               'Elanco',               'Elanco',               'Elanco',           'Elanco',       'Elanco',       'Elanco',       'Elanco',       'Elanco',       'Elanco',       'Elanco',       NOW(), NOW()),
  (md5('i18n_med_mfr_msd'),          'medicine.manufacturer.msd',          'medicine', true, 'MSD 동물약품',     'MSD Animal Health',    'MSD アニマルヘルス',    'MSD 动物保健',          'MSD 動物保健',          'MSD Salud Animal', 'MSD Sante Animale', 'MSD Tiergesundheit', 'MSD Saude Animal', 'MSD Suc Khoe Dong Vat', 'MSD สุขภาพสัตว์', 'MSD Kesehatan Hewan', 'MSD صحة الحيوان', NOW(), NOW()),
  (md5('i18n_med_mfr_vetoquinol'),   'medicine.manufacturer.vetoquinol',   'medicine', true, 'Vetoquinol',       'Vetoquinol',           'Vetoquinol',           'Vetoquinol',           'Vetoquinol',           'Vetoquinol',       'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   'Vetoquinol',   NOW(), NOW()),
  (md5('i18n_med_mfr_drray'),        'medicine.manufacturer.drray',        'medicine', true, 'Dr.Ray',           'Dr.Ray',               'Dr.Ray',               'Dr.Ray',               'Dr.Ray',               'Dr.Ray',           'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       'Dr.Ray',       NOW(), NOW()),

  -- Brands (30) — pharma brands are generally the same across languages
  (md5('i18n_med_brand_caninsulin'),  'medicine.brand.caninsulin',  'medicine', true, '캐닌슐린',  'Caninsulin',  'キャニンスリン', '犬胰岛素',  '犬胰島素',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'Caninsulin',  'كانينسولين', NOW(), NOW()),
  (md5('i18n_med_brand_convenia'),    'medicine.brand.convenia',    'medicine', true, 'Convenia',  'Convenia',    'Convenia',       'Convenia',  'Convenia',  'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    'Convenia',    NOW(), NOW()),
  (md5('i18n_med_brand_rimadyl'),     'medicine.brand.rimadyl',     'medicine', true, 'Rimadyl',   'Rimadyl',     'Rimadyl',        'Rimadyl',   'Rimadyl',   'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     'Rimadyl',     NOW(), NOW()),
  (md5('i18n_med_brand_cerenia'),     'medicine.brand.cerenia',     'medicine', true, 'Cerenia',   'Cerenia',     'Cerenia',        'Cerenia',   'Cerenia',   'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     'Cerenia',     NOW(), NOW()),
  (md5('i18n_med_brand_cytopoint'),   'medicine.brand.cytopoint',   'medicine', true, 'Cytopoint', 'Cytopoint',   'サイトポイント', 'Cytopoint', 'Cytopoint', 'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   'Cytopoint',   NOW(), NOW()),
  (md5('i18n_med_brand_apoquel'),     'medicine.brand.apoquel',     'medicine', true, 'Apoquel',   'Apoquel',     'アポキル',       'Apoquel',   'Apoquel',   'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     'Apoquel',     NOW(), NOW()),
  (md5('i18n_med_brand_revolution'),  'medicine.brand.revolution',  'medicine', true, 'Revolution','Revolution',  'レボリューション','Revolution','Revolution','Revolution', 'Revolution',  'Revolution',  'Revolution',  'Revolution',  'Revolution',  'Revolution',  'Revolution',  NOW(), NOW()),
  (md5('i18n_med_brand_vetsulin'),    'medicine.brand.vetsulin',    'medicine', true, '벳슐린',    'Vetsulin',    'Vetsulin',       'Vetsulin',  'Vetsulin',  'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    'Vetsulin',    NOW(), NOW()),
  (md5('i18n_med_brand_prozinc'),     'medicine.brand.prozinc',     'medicine', true, '프로징크',  'ProZinc',     'プロジンク',     'ProZinc',   'ProZinc',   'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     'ProZinc',     NOW(), NOW()),
  (md5('i18n_med_brand_metacam'),     'medicine.brand.metacam',     'medicine', true, 'Metacam',   'Metacam',     'メタカム',       'Metacam',   'Metacam',   'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     'Metacam',     NOW(), NOW()),
  (md5('i18n_med_brand_vetmedin'),    'medicine.brand.vetmedin',    'medicine', true, 'Vetmedin',  'Vetmedin',    'ベトメディン',   'Vetmedin',  'Vetmedin',  'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    'Vetmedin',    NOW(), NOW()),
  (md5('i18n_med_brand_semintra'),    'medicine.brand.semintra',    'medicine', true, 'Semintra',  'Semintra',    'セミントラ',     'Semintra',  'Semintra',  'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    'Semintra',    NOW(), NOW()),
  (md5('i18n_med_brand_nexgard'),     'medicine.brand.nexgard',     'medicine', true, 'NexGard',   'NexGard',     'ネクスガード',   'NexGard',   'NexGard',   'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     'NexGard',     NOW(), NOW()),
  (md5('i18n_med_brand_clavamox'),    'medicine.brand.clavamox',    'medicine', true, 'Clavamox',  'Clavamox',    'Clavamox',       'Clavamox',  'Clavamox',  'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    'Clavamox',    NOW(), NOW()),
  (md5('i18n_med_brand_canidryl'),    'medicine.brand.canidryl',    'medicine', true, 'Canidryl',  'Canidryl',    'Canidryl',       'Canidryl',  'Canidryl',  'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    'Canidryl',    NOW(), NOW()),
  (md5('i18n_med_brand_onsior'),      'medicine.brand.onsior',      'medicine', true, 'Onsior',    'Onsior',      'オンシオール',   'Onsior',    'Onsior',    'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      'Onsior',      NOW(), NOW()),
  (md5('i18n_med_brand_cardisure'),   'medicine.brand.cardisure',   'medicine', true, 'Cardisure', 'Cardisure',   'カルディシュア', 'Cardisure', 'Cardisure', 'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   'Cardisure',   NOW(), NOW()),
  (md5('i18n_med_brand_posatex'),     'medicine.brand.posatex',     'medicine', true, 'Posatex',   'Posatex',     'Posatex',        'Posatex',   'Posatex',   'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     'Posatex',     NOW(), NOW()),
  (md5('i18n_med_brand_rilexine'),    'medicine.brand.rilexine',    'medicine', true, 'Rilexine',  'Rilexine',    'Rilexine',       'Rilexine',  'Rilexine',  'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    'Rilexine',    NOW(), NOW()),
  (md5('i18n_med_brand_enterosgel'),  'medicine.brand.enterosgel',  'medicine', true, 'Enterosgel','Enterosgel',  'Enterosgel',     'Enterosgel','Enterosgel','Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  'Enterosgel',  NOW(), NOW()),
  (md5('i18n_med_brand_marbocyl'),    'medicine.brand.marbocyl',    'medicine', true, 'Marbocyl',  'Marbocyl',    'Marbocyl',       'Marbocyl',  'Marbocyl',  'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    'Marbocyl',    NOW(), NOW()),
  (md5('i18n_med_brand_cortavance'),  'medicine.brand.cortavance',  'medicine', true, 'Cortavance','Cortavance',  'Cortavance',     'Cortavance','Cortavance','Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  'Cortavance',  NOW(), NOW()),
  (md5('i18n_med_brand_baytril'),     'medicine.brand.baytril',     'medicine', true, 'Baytril',   'Baytril',     'Baytril',        'Baytril',   'Baytril',   'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     'Baytril',     NOW(), NOW()),
  (md5('i18n_med_brand_galliprant'),  'medicine.brand.galliprant',  'medicine', true, 'Galliprant','Galliprant',  'Galliprant',     'Galliprant','Galliprant','Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  'Galliprant',  NOW(), NOW()),
  (md5('i18n_med_brand_epakitin'),    'medicine.brand.epakitin',    'medicine', true, 'Epakitin',  'Epakitin',    'Epakitin',       'Epakitin',  'Epakitin',  'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    'Epakitin',    NOW(), NOW()),
  (md5('i18n_med_brand_credelio'),    'medicine.brand.credelio',    'medicine', true, 'Credelio',  'Credelio',    'クレデリオ',     'Credelio',  'Credelio',  'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    'Credelio',    NOW(), NOW()),
  (md5('i18n_med_brand_interceptor'), 'medicine.brand.interceptor', 'medicine', true, 'Interceptor','Interceptor','インターセプター','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor','Interceptor', NOW(), NOW()),
  (md5('i18n_med_brand_bravecto'),    'medicine.brand.bravecto',    'medicine', true, 'Bravecto',  'Bravecto',    'ブラベクト',     'Bravecto',  'Bravecto',  'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    'Bravecto',    NOW(), NOW()),
  (md5('i18n_med_brand_ipakitine'),   'medicine.brand.ipakitine',   'medicine', true, 'Ipakitine', 'Ipakitine',   'Ipakitine',      'Ipakitine', 'Ipakitine', 'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   'Ipakitine',   NOW(), NOW()),
  (md5('i18n_med_brand_pancreta'),    'medicine.brand.pancreta',    'medicine', true, '판크레타',  'Pancreta',    'Pancreta',       'Pancreta',  'Pancreta',  'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    'Pancreta',    NOW(), NOW())
ON CONFLICT (key) DO NOTHING;


-- ===========================================================================
-- Record i18n migration
-- ===========================================================================
INSERT INTO schema_migrations (version)
VALUES ('pg_003_i18n_v2')
ON CONFLICT DO NOTHING;
