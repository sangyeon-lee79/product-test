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
