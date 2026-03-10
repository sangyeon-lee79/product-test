import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setTokens, type MasterItem } from '../lib/api';
import { getApiBase } from '../lib/apiBase';
import { getRoleHomePath, storeRole } from '../lib/auth';
import { ensureGoogleIdentityScript } from '../lib/google';
import { LANG_LABELS, SUPPORTED_LANGS, useI18n, useT } from '../lib/i18n';

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

export default function Signup() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();

  // Wizard state
  const [phase, setPhase] = useState<SignupPhase>('choose');
  const [step, setStep] = useState(1);

  // Account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('KR');
  const [preferredLanguage, setPreferredLanguage] = useState(lang);

  // Pet info
  const [hasPets, setHasPets] = useState(false);
  const [petCount, setPetCount] = useState('0');
  const [interestedPetTypes, setInterestedPetTypes] = useState<string[]>([]);

  // Role & provider
  const [applyProvider, setApplyProvider] = useState(false);
  const [l1Options, setL1Options] = useState<MasterItem[]>([]);
  const [l2Options, setL2Options] = useState<MasterItem[]>([]);
  const [petTypeL1Options, setPetTypeL1Options] = useState<MasterItem[]>([]);
  const [petTypeL2Options, setPetTypeL2Options] = useState<MasterItem[]>([]);
  const [l3Options, setL3Options] = useState<MasterItem[]>([]);
  const [providerL1Id, setProviderL1Id] = useState('');
  const [providerL2Id, setProviderL2Id] = useState('');
  const [providerPetTypeL1Id, setProviderPetTypeL1Id] = useState('');
  const [providerPetTypeL2Id, setProviderPetTypeL2Id] = useState('');
  const [providerL3Id, setProviderL3Id] = useState('');
  const [providerBusinessNumber, setProviderBusinessNumber] = useState('');
  const [providerOperatingHours, setProviderOperatingHours] = useState('');
  const [providerCertifications, setProviderCertifications] = useState('');

  // Agreements
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [healthNotifications, setHealthNotifications] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // UI state
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snsToken, setSnsToken] = useState<{ access: string; refresh: string; role: string } | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const totalSteps = phase === 'direct' ? 5 : 4;

  // ── Data loaders ──
  useEffect(() => {
    let mounted = true;
    async function loadCountries() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/countries`);
        const parsed = await res.json() as { success?: boolean; data?: CountryRow[] };
        if (!res.ok || !parsed?.success) return;
        if (!mounted) return;
        setCountries((parsed.data || []).sort((a, b) => a.code.localeCompare(b.code)));
      } catch { /* fallback: empty list */ }
    }
    async function loadBusinessL1() {
      try {
        const rows = await api.master.public.items('business_category', null, lang, { item_level: 'l1' });
        if (!mounted) return;
        setL1Options(rows);
      } catch { /* ignore */ }
    }
    async function loadPetTypeL1() {
      try {
        const rows = await api.master.public.items('pet_type', null, lang);
        if (!mounted) return;
        setPetTypeL1Options(rows);
      } catch { /* ignore */ }
    }
    void loadCountries();
    void loadBusinessL1();
    void loadPetTypeL1();
    return () => { mounted = false; };
  }, [lang]);

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
    if (!providerL1Id || !providerPetTypeL1Id || !providerPetTypeL2Id) { setL3Options([]); setProviderL3Id(''); return; }
    let mounted = true;
    void (async () => {
      try {
        const rows = await api.master.public.items('business_category', null, lang, {
          item_level: 'l3_style',
          business_category_l1_id: providerL1Id,
          pet_type_l1_id: providerPetTypeL1Id,
          pet_type_l2_id: providerPetTypeL2Id,
        });
        if (mounted) setL3Options(rows);
      } catch { if (mounted) setL3Options([]); }
    })();
    return () => { mounted = false; };
  }, [providerL1Id, providerPetTypeL1Id, providerPetTypeL2Id, lang]);

  // ── Google OAuth for choose phase ──
  useEffect(() => {
    if (phase !== 'choose' || !googleButtonRef.current) return;
    let cancelled = false;

    async function setupGoogle() {
      if (!googleButtonRef.current) return;
      try {
        const config = await ensureGoogleIdentityScript();
        if (cancelled || !googleButtonRef.current) return;
        const googleId = window.google?.accounts?.id;
        if (!googleId) return;

        googleButtonRef.current.innerHTML = '';
        googleId.initialize({
          client_id: config.google_oauth_client_id,
          ux_mode: 'popup',
          callback: async ({ credential }) => {
            if (!credential) { setError(t('public.signup.google_no_token', 'Google 인증 토큰을 받지 못했습니다.')); return; }
            setLoading(true);
            setError('');
            try {
              const data = await api.oauthLogin('google', credential);
              // Store tokens for later, transition to SNS wizard
              setSnsToken({ access: data.access_token, refresh: data.refresh_token, role: data.role });
              // Try to extract name/email from JWT payload
              try {
                const payload = JSON.parse(atob(credential.split('.')[1]));
                if (payload.email) setEmail(payload.email);
                if (payload.name) setDisplayName(payload.name);
              } catch { /* ignore JWT parse */ }
              setPhase('sns');
              setStep(1);
            } catch (err) {
              setError(err instanceof Error ? err.message : t('public.signup.google_fail', 'Google 가입에 실패했습니다.'));
            } finally {
              setLoading(false);
            }
          },
        });
        googleId.renderButton(googleButtonRef.current, {
          theme: 'outline', size: 'large', width: 300, text: 'signup_with', shape: 'pill',
        });
      } catch { /* Google not available — direct signup still works */ }
    }

    void setupGoogle();
    return () => { cancelled = true; };
  }, [phase, t]);

  const selectedCountry = useMemo(() => countries.find(c => c.code === countryCode), [countries, countryCode]);

  function toggleInterest(value: string) {
    setInterestedPetTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  }

  // ── Validation ──
  function validateStep(): boolean {
    setError('');
    if (phase === 'direct') {
      if (step === 1) {
        if (!email.trim()) { setError(t('public.signup.email_required', '이메일을 입력해주세요.')); return false; }
        if (password.length < 8) { setError(t('public.signup.password_min', '비밀번호는 8자 이상이어야 합니다.')); return false; }
        if (password !== passwordConfirm) { setError(t('public.signup.password_mismatch', '비밀번호가 일치하지 않습니다.')); return false; }
        return true;
      }
      if (step === 2) {
        if (!displayName.trim()) { setError(t('public.signup.name_required', '이름을 입력해주세요.')); return false; }
        if (!countryCode) { setError(t('public.signup.country_required', '거주 국가를 선택해주세요.')); return false; }
        return true;
      }
    }
    if (phase === 'sns') {
      if (step === 1) {
        if (!countryCode) { setError(t('public.signup.country_required', '거주 국가를 선택해주세요.')); return false; }
        return true;
      }
    }
    // Role step: if provider selected, L1 is required
    const roleStep = phase === 'direct' ? 4 : 3;
    if (step === roleStep && applyProvider && !providerL1Id) {
      setError(t('public.signup.provider_l1_required', '업종 L1을 선택해주세요.'));
      return false;
    }
    // Terms step
    const termsStep = phase === 'direct' ? 5 : 4;
    if (step === termsStep && !termsAgreed) {
      setError(t('public.signup.terms_agree', '서비스 약관에 동의해주세요.'));
      return false;
    }
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    if (step < totalSteps) setStep(s => s + 1);
  }

  function prevStep() {
    setError('');
    if (step > 1) setStep(s => s - 1);
    else { setPhase('choose'); setStep(1); }
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!validateStep()) return;
    setLoading(true);
    setError('');

    try {
      if (phase === 'sns' && snsToken) {
        // SNS: already authenticated — just complete login with stored tokens
        setTokens(snsToken.access, snsToken.refresh);
        storeRole(snsToken.role);
        navigate(getRoleHomePath(snsToken.role), { replace: true });
        return;
      }

      // Direct signup
      const data = await api.signupV2({
        email,
        password,
        display_name: displayName,
        nickname,
        phone,
        country_code: countryCode,
        language: preferredLanguage,
        has_pets: hasPets,
        pet_count: Number(petCount || 0),
        interested_pet_types: interestedPetTypes,
        notifications_booking: bookingNotifications,
        notifications_health: healthNotifications,
        marketing_opt_in: marketingOptIn,
        terms_agreed: termsAgreed,
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

      setTokens(data.access_token, data.refresh_token);
      storeRole(data.role);
      navigate(getRoleHomePath(data.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('public.signup.fail', '회원가입에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  }

  const isLastStep = step === totalSteps;

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

  // ═════════════════════════════════════════════
  // RENDER: Phase 'choose'
  // ═════════════════════════════════════════════
  if (phase === 'choose') {
    return (
      <div className="login-page">
        <div className="login-card card" style={{ width: 480 }}>
          <div className="card-body">
            <div className="login-logo">
              <h1>🐾 {t('platform.name', 'Petfolio')}</h1>
              <p>{t('public.signup.title', '회원가입')}</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: 'grid', gap: 16 }}>
              {/* SNS signup card */}
              <div className="card" style={{ border: '2px solid var(--border)', cursor: 'pointer' }}>
                <div className="card-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <h3 style={{ margin: '0 0 8px' }}>{t('public.signup.sns_title', 'SNS 가입')}</h3>
                  <p className="text-muted text-sm" style={{ margin: '0 0 16px' }}>
                    {t('public.signup.sns_desc', 'Google 계정으로 빠르게 가입')}
                  </p>
                  <div ref={googleButtonRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 42 }} />
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                {t('public.signup.or', '또는')}
              </div>

              {/* Direct signup card */}
              <div
                className="card"
                style={{ border: '2px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => { setPhase('direct'); setStep(1); setError(''); }}
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

            <p className="text-sm mt-3" style={{ textAlign: 'center' }}>
              {t('public.signup.has_account', '이미 계정이 있나요?')} <Link to="/login">{t('public.login.title', '로그인')}</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // RENDER: Wizard steps (direct & sns)
  // ═════════════════════════════════════════════

  // Map logical step to content
  function renderStepContent() {
    // Direct step 1: Account
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

    // Profile step (direct step 2 / sns step 1)
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

    // Pets step (direct step 3 / sns step 2)
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

    // Role step (direct step 4 / sns step 3)
    const roleStep = phase === 'direct' ? 4 : 3;
    if (step === roleStep) {
      return (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="radio" name="role" checked={!applyProvider} onChange={() => setApplyProvider(false)} />
              {t('public.signup.role_guardian', '보호자로 가입')}
            </label>
            <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="radio" name="role" checked={applyProvider} onChange={() => setApplyProvider(true)} />
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
                <div className="form-row col3">
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_business_number', '사업자 번호')}</label>
                    <input className="form-input" value={providerBusinessNumber} onChange={e => setProviderBusinessNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_operating_hours', '운영 시간')}</label>
                    <input className="form-input" value={providerOperatingHours} onChange={e => setProviderOperatingHours(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.provider_certifications', '자격증/면허')}</label>
                    <input className="form-input" value={providerCertifications} onChange={e => setProviderCertifications(e.target.value)} placeholder={t('public.signup.certifications_placeholder', '쉼표로 구분')} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    // Terms step (direct step 5 / sns step 4)
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

  return (
    <div className="login-page">
      <div className="login-card card" style={{ width: 540 }}>
        <div className="card-body">
          <div className="login-logo">
            <h1>🐾 {t('platform.name', 'Petfolio')}</h1>
            <p>{phase === 'sns' ? t('public.signup.sns_complete', 'SNS 가입 추가 정보') : t('public.signup.title', '회원가입')}</p>
          </div>

          <ProgressBar current={step} total={totalSteps} />

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
              Step {step}. {stepLabels[step - 1] || ''}
            </span>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: 'grid', gap: 12, minHeight: 160 }}>
            {renderStepContent()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 8 }}>
            <button className="btn btn-secondary" onClick={prevStep} type="button">
              {step === 1 ? t('public.signup.back_to_choose', '가입 방식 선택') : t('common.previous', '이전')}
            </button>
            {isLastStep ? (
              <button className="btn btn-primary" onClick={() => void handleSubmit()} disabled={loading} type="button" style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? t('public.signup.creating', '생성 중...') : t('public.signup.submit', '계정 만들기')}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={nextStep} type="button" style={{ flex: 1, justifyContent: 'center' }}>
                {t('common.next', '다음')}
              </button>
            )}
          </div>

          <p className="text-sm mt-3" style={{ textAlign: 'center' }}>
            {t('public.signup.has_account', '이미 계정이 있나요?')} <Link to="/login">{t('public.login.title', '로그인')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
