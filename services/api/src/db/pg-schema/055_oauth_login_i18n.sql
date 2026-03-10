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
