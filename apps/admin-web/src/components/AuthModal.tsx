import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setTokens, type MasterItem } from '../lib/api';
import { getApiBase } from '../lib/apiBase';
import { getRoleHomePath, storeRole } from '../lib/auth';
import { loginWithGoogle, getGoogleConfig } from '../lib/google';
import { getKakaoConfig, loginWithKakao } from '../lib/kakao';
import { getAppleConfig, loginWithApple } from '../lib/apple';
import { getOAuthRedirectResult, clearOAuthRedirectParams } from '../lib/oauthRedirect';
import { LANG_LABELS, SUPPORTED_LANGS, useI18n, useT } from '../lib/i18n';

type AuthMode = 'login' | 'signup';
type SignupPhase = 'choose' | 'direct' | 'sns';
type CountryRow = { id: string; code: string; currency_code?: string | null };

const API_BASE = getApiBase();

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={stepNum} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, flexShrink: 0,
              background: done ? 'var(--primary)' : active ? 'var(--primary)' : 'var(--border)',
              color: done || active ? '#fff' : 'var(--text-muted)',
            }}>
              {done ? '✓' : stepNum}
            </div>
            {stepNum < total && (
              <div style={{ flex: 1, height: 2, background: done ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface AuthModalProps {
  open: boolean;
  initialMode: AuthMode;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ open, initialMode, onClose, onSuccess }: AuthModalProps) {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();

  const [mode, setMode] = useState<AuthMode>(initialMode);

  // ── Login state ──
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [googleAvailable, setGoogleAvailable] = useState(false);

  // ── Signup state ──
  const [phase, setPhase] = useState<SignupPhase>('choose');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('KR');
  const [preferredLanguage, setPreferredLanguage] = useState(lang);
  const [hasPets, setHasPets] = useState(false);
  const [petCount, setPetCount] = useState('0');
  const [interestedPetTypes, setInterestedPetTypes] = useState<string[]>([]);
  const [applyProvider, setApplyProvider] = useState(false);
  const [l1Options, setL1Options] = useState<MasterItem[]>([]);
  const [l2Options, setL2Options] = useState<MasterItem[]>([]);
  const [petTypeL1Options, setPetTypeL1Options] = useState<MasterItem[]>([]);
  const [petTypeL2Options, setPetTypeL2Options] = useState<MasterItem[]>([]);
  const [providerL1Id, setProviderL1Id] = useState('');
  const [providerL2Id, setProviderL2Id] = useState('');
  const [providerPetTypeL1Id, setProviderPetTypeL1Id] = useState('');
  const [providerPetTypeL2Id, setProviderPetTypeL2Id] = useState('');
  const [providerL3Id, setProviderL3Id] = useState('');
  const [providerBusinessNumber, setProviderBusinessNumber] = useState('');
  const [providerOperatingHours, setProviderOperatingHours] = useState('');
  const [providerCertifications, setProviderCertifications] = useState('');
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [healthNotifications, setHealthNotifications] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [snsToken, setSnsToken] = useState<{ access: string; refresh: string; role: string } | null>(null);
  const [kakaoAvailable, setKakaoAvailable] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const totalSteps = phase === 'direct' ? 5 : 4;

  // Sync initialMode when prop changes
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      // Reset states when opening
      setLoginError('');
      setSignupError('');
    }
  }, [open, initialMode]);

  // ── ESC key + body scroll lock ──
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Check which OAuth platforms are configured
  useEffect(() => {
    if (!open) return;
    getGoogleConfig().then(c => setGoogleAvailable(!!c.google_oauth_client_id)).catch(() => {});
    getKakaoConfig().then(c => setKakaoAvailable(!!c.kakao_javascript_key)).catch(() => {});
    getAppleConfig().then(c => setAppleAvailable(!!c.apple_service_id)).catch(() => {});
  }, [open]);

  // Handle OAuth redirect result (Google, Kakao, Apple — unified)
  useEffect(() => {
    if (!open) return;
    const result = getOAuthRedirectResult();
    if (!result) return;
    clearOAuthRedirectParams();

    const { provider, mode: oauthMode, code } = result;

    if (oauthMode === 'signup') {
      setMode('signup');
      setSignupLoading(true);
      setSignupError('');
      api.oauthLogin(provider, code)
        .then(data => {
          setSnsToken({ access: data.access_token, refresh: data.refresh_token, role: data.role });
          if (data.email) setEmail(data.email);
          setPhase('sns');
          setStep(1);
        })
        .catch(e => setSignupError(e instanceof Error ? e.message : t('public.signup.sns_fail', 'SNS 가입에 실패했습니다.')))
        .finally(() => setSignupLoading(false));
    } else {
      setMode('login');
      setLoginLoading(true);
      setLoginError('');
      api.oauthLogin(provider, code)
        .then(data => completeAuth(data))
        .catch(e => setLoginError(e instanceof Error ? e.message : t('public.signup.sns_fail', 'SNS 로그인에 실패했습니다.')))
        .finally(() => setLoginLoading(false));
    }
  }, [open]);

  function handleOAuthRedirect(provider: 'google' | 'kakao' | 'apple', oauthMode: 'login' | 'signup') {
    const setError = oauthMode === 'login' ? setLoginError : setSignupError;
    setError('');
    const doRedirect = provider === 'google' ? loginWithGoogle
      : provider === 'apple' ? loginWithApple
      : loginWithKakao;
    doRedirect(oauthMode).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : t('public.signup.sns_fail', 'SNS 연결에 실패했습니다.'));
    });
  }

  // ── Login helpers ──
  function uiErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError'))
        return t('common.err.network', '네트워크 오류가 발생했습니다.');
      return msg;
    }
    return t('admin.login.error', '로그인에 실패했습니다.');
  }

  function completeAuth(data: { access_token: string; refresh_token: string; role: string }) {
    setTokens(data.access_token, data.refresh_token);
    storeRole(data.role);
    onSuccess();
    navigate(getRoleHomePath(data.role), { replace: true });
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await api.login(loginEmail, loginPassword);
      completeAuth(data);
    } catch (err) {
      setLoginError(uiErrorMessage(err));
    } finally {
      setLoginLoading(false);
    }
  }

  // ── Signup data loaders ──
  useEffect(() => {
    if (!open || mode !== 'signup') return;
    let mounted = true;
    async function loadCountries() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/countries`);
        const parsed = await res.json() as { success?: boolean; data?: CountryRow[] };
        if (!res.ok || !parsed?.success || !mounted) return;
        setCountries((parsed.data || []).sort((a, b) => a.code.localeCompare(b.code)));
      } catch { /* fallback: empty */ }
    }
    async function loadBusinessL1() {
      try {
        const rows = await api.master.public.items('business_category', null, lang, { item_level: 'l1' });
        if (mounted) setL1Options(rows);
      } catch { /* ignore */ }
    }
    async function loadPetTypeL1() {
      try {
        const rows = await api.master.public.items('pet_type', null, lang);
        if (mounted) setPetTypeL1Options(rows);
      } catch { /* ignore */ }
    }
    void loadCountries();
    void loadBusinessL1();
    void loadPetTypeL1();
    return () => { mounted = false; };
  }, [open, mode, lang]);

  useEffect(() => {
    if (!providerL1Id) { setL2Options([]); setProviderL2Id(''); return; }
    let mounted = true;
    void (async () => {
      try {
        const rows = await api.master.public.items('business_category', providerL1Id, lang, { item_level: 'l2' });
        if (mounted) setL2Options(rows);
      } catch { if (mounted) setL2Options([]); }
    })();
    return () => { mounted = false; };
  }, [providerL1Id, lang]);

  useEffect(() => {
    if (!providerPetTypeL1Id) { setPetTypeL2Options([]); setProviderPetTypeL2Id(''); return; }
    let mounted = true;
    void (async () => {
      try {
        const rows = await api.master.public.items('pet_type', providerPetTypeL1Id, lang);
        if (mounted) setPetTypeL2Options(rows);
      } catch { if (mounted) setPetTypeL2Options([]); }
    })();
    return () => { mounted = false; };
  }, [providerPetTypeL1Id, lang]);

  useEffect(() => {
    if (!providerL1Id || !providerPetTypeL1Id || !providerPetTypeL2Id) setProviderL3Id('');
  }, [providerL1Id, providerPetTypeL1Id, providerPetTypeL2Id]);

  const selectedCountry = useMemo(() => countries.find(c => c.code === countryCode), [countries, countryCode]);

  function toggleInterest(value: string) {
    setInterestedPetTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  }

  // ── Signup validation ──
  function validateStep(): boolean {
    setSignupError('');
    if (phase === 'direct') {
      if (step === 1) {
        if (!email.trim()) { setSignupError(t('public.signup.email_required', '이메일을 입력해주세요.')); return false; }
        if (password.length < 8) { setSignupError(t('public.signup.password_min', '비밀번호는 8자 이상이어야 합니다.')); return false; }
        if (password !== passwordConfirm) { setSignupError(t('public.signup.password_mismatch', '비밀번호가 일치하지 않습니다.')); return false; }
        return true;
      }
      if (step === 2) {
        if (!displayName.trim()) { setSignupError(t('public.signup.name_required', '이름을 입력해주세요.')); return false; }
        if (!countryCode) { setSignupError(t('public.signup.country_required', '거주 국가를 선택해주세요.')); return false; }
        return true;
      }
    }
    if (phase === 'sns') {
      if (step === 1) {
        if (!countryCode) { setSignupError(t('public.signup.country_required', '거주 국가를 선택해주세요.')); return false; }
        return true;
      }
    }
    const roleStep = phase === 'direct' ? 4 : 3;
    if (step === roleStep && applyProvider && !providerL1Id) {
      setSignupError(t('public.signup.provider_l1_required', '업종 L1을 선택해주세요.'));
      return false;
    }
    const termsStep = phase === 'direct' ? 5 : 4;
    if (step === termsStep && !termsAgreed) {
      setSignupError(t('public.signup.terms_agree', '서비스 약관에 동의해주세요.'));
      return false;
    }
    return true;
  }

  function nextStep() { if (!validateStep()) return; if (step < totalSteps) setStep(s => s + 1); }
  function prevStep() { setSignupError(''); if (step > 1) setStep(s => s - 1); else { setPhase('choose'); setStep(1); } }

  async function handleSignupSubmit() {
    if (!validateStep()) return;
    setSignupLoading(true);
    setSignupError('');
    try {
      if (phase === 'sns' && snsToken) {
        setTokens(snsToken.access, snsToken.refresh);
        storeRole(snsToken.role);
        onSuccess();
        navigate(getRoleHomePath(snsToken.role), { replace: true });
        return;
      }
      const data = await api.signupV2({
        email, password,
        display_name: displayName, nickname, phone,
        country_code: countryCode, language: preferredLanguage,
        has_pets: hasPets, pet_count: Number(petCount || 0),
        interested_pet_types: interestedPetTypes,
        notifications_booking: bookingNotifications,
        notifications_health: healthNotifications,
        marketing_opt_in: marketingOptIn, terms_agreed: termsAgreed,
        role_application: applyProvider ? {
          requested_role: 'provider',
          business_category_l1_id: providerL1Id || null,
          business_category_l2_id: providerL2Id || null,
          business_category_l3_id: providerL3Id || null,
          pet_type_l1_id: providerPetTypeL1Id || null,
          pet_type_l2_id: providerPetTypeL2Id || null,
          business_registration_no: providerBusinessNumber || null,
          operating_hours: providerOperatingHours || null,
          certifications: providerCertifications.split(',').map(v => v.trim()).filter(Boolean),
        } : undefined,
      });
      completeAuth(data);
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : t('public.signup.fail', '회원가입에 실패했습니다.'));
    } finally {
      setSignupLoading(false);
    }
  }

  // ── Switch mode helper ──
  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setLoginError('');
    setSignupError('');
    setPhase('choose');
    setStep(1);
  }

  // ── Step labels ──
  const directStepLabels = [
    t('public.signup.step_account', '계정'),
    t('public.signup.step_profile', '프로필'),
    t('public.signup.step_pets', '반려동물'),
    t('public.signup.step_role', '역할'),
    t('public.signup.step_agree', '동의'),
  ];
  const snsStepLabels = [
    t('public.signup.step_profile', '프로필'),
    t('public.signup.step_pets', '반려동물'),
    t('public.signup.step_role', '역할'),
    t('public.signup.step_agree', '동의'),
  ];
  const stepLabels = phase === 'direct' ? directStepLabels : snsStepLabels;
  const isLastStep = step === totalSteps;

  if (!open) return null;

  // ═══════════════════════════════════
  // RENDER: Login mode
  // ═══════════════════════════════════
  function renderLogin() {
    return (
      <>
        <div className="login-logo" style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 4px' }}>🐾 {t('platform.name', 'Petfolio')}</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{t('public.login.title', '로그인')}</p>
        </div>

        {loginError && <div className="alert alert-error">{loginError}</div>}

        <form onSubmit={handlePasswordLogin}>
          <div className="form-group">
            <label className="form-label">{t('public.login.email', 'Email')}</label>
            <input className="form-input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('public.login.password', '비밀번호')}</label>
            <input className="form-input" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="********" />
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loginLoading} style={{ width: '100%', justifyContent: 'center' }}>
              {loginLoading ? t('admin.login.loading', '로그인 중...') : t('public.login.submit_password', '이메일 로그인')}
            </button>
            <div className="oauth-buttons">
              {googleAvailable && (
                <button className="oauth-btn oauth-btn-google" onClick={() => handleOAuthRedirect('google', 'login')} disabled={loginLoading} type="button">
                  {t('public.login.google', 'Google 로그인')}
                </button>
              )}
              {kakaoAvailable && (
                <button className="oauth-btn oauth-btn-kakao" onClick={() => handleOAuthRedirect('kakao', 'login')} disabled={loginLoading} type="button">
                  {t('public.login.kakao', '카카오 로그인')}
                </button>
              )}
              {appleAvailable && (
                <button className="oauth-btn oauth-btn-apple" onClick={() => handleOAuthRedirect('apple', 'login')} disabled={loginLoading} type="button">
                  {t('public.login.apple', 'Apple로 로그인')}
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="auth-mode-switch">
          {t('public.login.no_account', '계정이 없나요?')}{' '}
          <button className="auth-mode-switch-link" onClick={() => switchMode('signup')}>{t('public.signup.title', '회원가입')}</button>
        </p>
      </>
    );
  }

  // ═══════════════════════════════════
  // RENDER: Signup — choose phase
  // ═══════════════════════════════════
  function renderSignupChoose() {
    return (
      <>
        <div className="login-logo" style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 4px' }}>🐾 {t('platform.name', 'Petfolio')}</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{t('public.signup.title', '회원가입')}</p>
        </div>

        {signupError && <div className="alert alert-error">{signupError}</div>}

        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ border: '2px solid var(--border)' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <h3 style={{ margin: '0 0 8px' }}>{t('public.signup.sns_title', 'SNS 가입')}</h3>
              <p className="text-muted text-sm" style={{ margin: '0 0 16px' }}>
                {t('public.signup.sns_desc', 'Google 계정으로 빠르게 가입')}
              </p>
              <div className="oauth-buttons">
                {googleAvailable && (
                  <button className="oauth-btn oauth-btn-google" onClick={() => handleOAuthRedirect('google', 'signup')} disabled={signupLoading} type="button">
                    {t('public.signup.google', 'Google로 가입')}
                  </button>
                )}
                {kakaoAvailable && (
                  <button className="oauth-btn oauth-btn-kakao" onClick={() => handleOAuthRedirect('kakao', 'signup')} disabled={signupLoading} type="button">
                    {t('public.signup.kakao', '카카오로 가입')}
                  </button>
                )}
                {appleAvailable && (
                  <button className="oauth-btn oauth-btn-apple" onClick={() => handleOAuthRedirect('apple', 'signup')} disabled={signupLoading} type="button">
                    {t('public.signup.apple', 'Apple로 가입')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            {t('public.signup.or', '또는')}
          </div>

          <div
            className="card"
            style={{ border: '2px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onClick={() => { setPhase('direct'); setStep(1); setSignupError(''); }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div className="card-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <h3 style={{ margin: '0 0 8px' }}>{t('public.signup.direct_title', '직접 가입')}</h3>
              <p className="text-muted text-sm" style={{ margin: 0 }}>
                {t('public.signup.direct_desc', '이메일과 비밀번호로 가입')}
              </p>
            </div>
          </div>
        </div>

        <p className="auth-mode-switch">
          {t('public.signup.has_account', '이미 계정이 있나요?')}{' '}
          <button className="auth-mode-switch-link" onClick={() => switchMode('login')}>{t('public.login.title', '로그인')}</button>
        </p>
      </>
    );
  }

  // ═══════════════════════════════════
  // RENDER: Signup — wizard step content
  // ═══════════════════════════════════
  function renderStepContent() {
    if (phase === 'direct' && step === 1) {
      return (
        <>
          <div className="form-group">
            <label className="form-label">{t('public.signup.email', '이메일')} *</label>
            <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="form-row col2">
            <div className="form-group">
              <label className="form-label">{t('public.signup.password', '비밀번호')} *</label>
              <input className="form-input" type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="8자 이상" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('public.signup.password_confirm', '비밀번호 확인')} *</label>
              <input className="form-input" type="password" minLength={8} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
            </div>
          </div>
        </>
      );
    }

    const profileStep = phase === 'direct' ? 2 : 1;
    if (step === profileStep) {
      return (
        <>
          {phase === 'direct' ? (
            <div className="form-row col2">
              <div className="form-group">
                <label className="form-label">{t('public.signup.display_name', '이름')} *</label>
                <input className="form-input" required value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('public.signup.nickname', '닉네임')}</label>
                <input className="form-input" value={nickname} onChange={e => setNickname(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">{t('public.signup.nickname', '닉네임')}</label>
              <input className="form-input" value={nickname} onChange={e => setNickname(e.target.value)} />
            </div>
          )}
          <div className="form-row col2">
            <div className="form-group">
              <label className="form-label">{t('public.signup.phone', '연락처')}</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('public.signup.country', '거주 국가')} *</label>
              <select className="form-select" required value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                {countries.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row col2">
            <div className="form-group">
              <label className="form-label">{t('public.signup.language', '선호 언어')}</label>
              <select className="form-select" value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value as typeof preferredLanguage)}>
                {SUPPORTED_LANGS.map(code => <option key={code} value={code}>{LANG_LABELS[code]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label text-sm text-muted">{t('public.signup.currency_preview', '통화')}: {selectedCountry?.currency_code || '-'}</label>
            </div>
          </div>
        </>
      );
    }

    const petsStep = phase === 'direct' ? 3 : 2;
    if (step === petsStep) {
      return (
        <>
          <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input type="checkbox" checked={hasPets} onChange={e => setHasPets(e.target.checked)} />
            {t('public.signup.has_pets', '반려동물 보유 여부')}
          </label>
          {hasPets && (
            <div className="form-group">
              <label className="form-label">{t('public.signup.pet_count', '반려동물 수')}</label>
              <input className="form-input" type="number" min="0" value={petCount} onChange={e => setPetCount(e.target.value)} style={{ width: 120 }} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('public.signup.interests', '관심 동물 종류')}</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {petTypeL1Options.length > 0
                ? petTypeL1Options.map(pt => (
                    <label key={pt.id} style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={interestedPetTypes.includes(pt.key)} onChange={() => toggleInterest(pt.key)} />
                      {pt.display_label || pt.ko || pt.key}
                    </label>
                  ))
                : ['dog', 'cat', 'other'].map(type => (
                    <label key={type} style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={interestedPetTypes.includes(type)} onChange={() => toggleInterest(type)} />
                      {type}
                    </label>
                  ))
              }
            </div>
          </div>
        </>
      );
    }

    const roleStep = phase === 'direct' ? 4 : 3;
    if (step === roleStep) {
      return (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="radio" name="modal-role" checked={!applyProvider} onChange={() => setApplyProvider(false)} />
              {t('public.signup.role_guardian', '보호자로 가입')}
            </label>
            <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="radio" name="modal-role" checked={applyProvider} onChange={() => setApplyProvider(true)} />
              {t('public.signup.role_provider', '업종 회원 신청')}
            </label>
          </div>

          {applyProvider && (
            <div className="card mt-3">
              <div className="card-body" style={{ display: 'grid', gap: 10 }}>
                <div className="form-row col2">
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_l1', '업종 L1')} *</label>
                    <select className="form-select" value={providerL1Id} onChange={e => { setProviderL1Id(e.target.value); setProviderL3Id(''); }}>
                      <option value="">{t('common.select', '선택...')}</option>
                      {l1Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_l2', '업종 L2')}</label>
                    <select className="form-select" value={providerL2Id} onChange={e => setProviderL2Id(e.target.value)}>
                      <option value="">{t('public.signup.provider_l2_optional', '선택 안 함')}</option>
                      {l2Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row col2">
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_pet_l1', '펫종류 L1')}</label>
                    <select className="form-select" value={providerPetTypeL1Id} onChange={e => { setProviderPetTypeL1Id(e.target.value); setProviderPetTypeL2Id(''); setProviderL3Id(''); }}>
                      <option value="">{t('common.select', '선택...')}</option>
                      {petTypeL1Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_pet_l2', '펫종류 L2')}</label>
                    <select className="form-select" value={providerPetTypeL2Id} onChange={e => { setProviderPetTypeL2Id(e.target.value); setProviderL3Id(''); }}>
                      <option value="">{t('common.select', '선택...')}</option>
                      {petTypeL2Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row col2">
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_business_number', '사업자 번호')}</label>
                    <input className="form-input" value={providerBusinessNumber} onChange={e => setProviderBusinessNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_operating_hours', '운영 시간')}</label>
                    <input className="form-input" value={providerOperatingHours} onChange={e => setProviderOperatingHours(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('public.signup.provider_certifications', '자격증/면허')}</label>
                  <input className="form-input" value={providerCertifications} onChange={e => setProviderCertifications(e.target.value)} placeholder={t('public.signup.certifications_placeholder', '쉼표로 구분')} />
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    // Terms step
    return (
      <>
        <div style={{ display: 'grid', gap: 12 }}>
          <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={bookingNotifications} onChange={e => setBookingNotifications(e.target.checked)} />
            {t('public.signup.notifications_booking', '예약 알림 수신')}
          </label>
          <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={healthNotifications} onChange={e => setHealthNotifications(e.target.checked)} />
            {t('public.signup.notifications_health', '건강 알림 수신')}
          </label>
          <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} />
            {t('public.signup.marketing_opt_in', '마케팅 수신 동의')}
          </label>
          <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
            <input type="checkbox" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
            {t('public.signup.terms_agree', '서비스 약관 동의')} *
          </label>
        </div>
      </>
    );
  }

  // ═══════════════════════════════════
  // RENDER: Signup — wizard steps
  // ═══════════════════════════════════
  function renderSignupWizard() {
    return (
      <>
        <div className="login-logo" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 4px' }}>🐾 {t('platform.name', 'Petfolio')}</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {phase === 'sns' ? t('public.signup.sns_complete', 'SNS 가입 추가 정보') : t('public.signup.title', '회원가입')}
          </p>
        </div>

        <ProgressBar current={step} total={totalSteps} />

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
            Step {step}. {stepLabels[step - 1] || ''}
          </span>
        </div>

        {signupError && <div className="alert alert-error">{signupError}</div>}

        <div style={{ display: 'grid', gap: 12, minHeight: 160 }}>
          {renderStepContent()}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 8 }}>
          <button className="btn btn-secondary" onClick={prevStep} type="button">
            {step === 1 ? t('public.signup.back_to_choose', '가입 방식 선택') : t('common.previous', '이전')}
          </button>
          {isLastStep ? (
            <button className="btn btn-primary" onClick={() => void handleSignupSubmit()} disabled={signupLoading} type="button" style={{ flex: 1, justifyContent: 'center' }}>
              {signupLoading ? t('public.signup.creating', '생성 중...') : t('public.signup.submit', '계정 만들기')}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={nextStep} type="button" style={{ flex: 1, justifyContent: 'center' }}>
              {t('common.next', '다음')}
            </button>
          )}
        </div>

        <p className="auth-mode-switch">
          {t('public.signup.has_account', '이미 계정이 있나요?')}{' '}
          <button className="auth-mode-switch-link" onClick={() => switchMode('login')}>{t('public.login.title', '로그인')}</button>
        </p>
      </>
    );
  }

  // ═══════════════════════════════════
  // RENDER: Modal shell
  // ═══════════════════════════════════
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal auth-modal">
        <div className="modal-header">
          <div className="modal-title">
            {mode === 'login' ? t('public.login.title', '로그인') : t('public.signup.title', '회원가입')}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body auth-modal-body">
          {mode === 'login' && renderLogin()}
          {mode === 'signup' && phase === 'choose' && renderSignupChoose()}
          {mode === 'signup' && phase !== 'choose' && renderSignupWizard()}
        </div>
      </div>
    </div>
  );
}
