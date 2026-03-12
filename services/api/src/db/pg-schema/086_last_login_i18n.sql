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
