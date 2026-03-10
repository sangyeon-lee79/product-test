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
