import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setTokens, type MasterItem } from '../lib/api';
import { getApiBase } from '../lib/apiBase';
import { getRoleHomePath, storeRole } from '../lib/auth';
import { loginWithGoogle, getGoogleConfig } from '../lib/google';
import { getKakaoConfig, loginWithKakao } from '../lib/kakao';
import { getAppleConfig, loginWithApple } from '../lib/apple';
import { getOAuthRedirectResult, clearOAuthRedirectParams } from '../lib/oauthRedirect';
import { LANG_LABELS, SUPPORTED_LANGS, useI18n, useT } from '../lib/i18n';
import { COUNTRY_REGIONS } from '../data/countryRegions';

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
  const [providerL1Id, setProviderL1Id] = useState('');
  const [providerL2Id, setProviderL2Id] = useState('');
  const [providerPetTypeL1Id, setProviderPetTypeL1Id] = useState('');
  const [providerPetTypeL2Id, setProviderPetTypeL2Id] = useState('');
  const [providerL3Id, setProviderL3Id] = useState('');
  const [providerBusinessNumber, setProviderBusinessNumber] = useState('');

  // Enhanced provider fields
  const [providerLabelLang, setProviderLabelLang] = useState<'ko' | 'en'>(() => {
    try { return (localStorage.getItem('provider_label_lang') as 'ko' | 'en') || 'ko'; } catch { return 'ko'; }
  });
  const [showBizInfo, setShowBizInfo] = useState(false);
  const [providerState, setProviderState] = useState('');
  const [providerCity, setProviderCity] = useState('');
  const [providerAddressDetail, setProviderAddressDetail] = useState('');
  const [providerAddressFlat, setProviderAddressFlat] = useState('');
  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const [operatingHoursMap, setOperatingHoursMap] = useState<Record<string, { open: string; close: string; closed: boolean }>>(() =>
    Object.fromEntries(DAYS.map(d => [d, { open: '09:00', close: '18:00', closed: false }]))
  );
  const [certTags, setCertTags] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');

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
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [kakaoAvailable, setKakaoAvailable] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

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
    if (!providerL1Id || !providerPetTypeL1Id || !providerPetTypeL2Id) { setProviderL3Id(''); return; }
  }, [providerL1Id, providerPetTypeL1Id, providerPetTypeL2Id]);

  // Check which OAuth platforms are configured
  useEffect(() => {
    getGoogleConfig().then(c => setGoogleAvailable(!!c.google_oauth_client_id)).catch(() => {});
    getKakaoConfig().then(c => setKakaoAvailable(!!c.kakao_javascript_key)).catch(() => {});
    getAppleConfig().then(c => setAppleAvailable(!!c.apple_service_id)).catch(() => {});
  }, []);

  // Handle OAuth redirect result (unified for Google, Kakao, Apple)
  useEffect(() => {
    const result = getOAuthRedirectResult();
    if (!result || result.mode !== 'signup') return;
    clearOAuthRedirectParams();
    setLoading(true);
    setError('');
    api.oauthLogin(result.provider, result.code)
      .then(data => {
        setSnsToken({ access: data.access_token, refresh: data.refresh_token, role: data.role });
        if (data.email) setEmail(data.email);
        if (data.display_name) setDisplayName(data.display_name);
        setPhase('sns');
        setStep(1);
      })
      .catch(err => setError(err instanceof Error ? err.message : t('public.signup.sns_fail', 'SNS 가입에 실패했습니다.')))
      .finally(() => setLoading(false));
  }, []);

  function handleOAuthRedirect(provider: 'google' | 'kakao' | 'apple') {
    setError('');
    const doRedirect = provider === 'google' ? loginWithGoogle
      : provider === 'apple' ? loginWithApple
      : loginWithKakao;
    doRedirect('signup').catch((e: unknown) => {
      setError(e instanceof Error ? e.message : t('public.signup.sns_fail', 'SNS 연결에 실패했습니다.'));
    });
  }

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
          operating_hours: JSON.stringify({
            schedule: operatingHoursMap,
            address: (COUNTRY_REGIONS[countryCode]?.length)
              ? [providerState, providerCity, providerAddressDetail].filter(Boolean).join(' ')
              : providerAddressFlat,
          }),
          certifications: certTags,
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
                  <div className="oauth-buttons">
                    {googleAvailable && (
                      <button className="oauth-btn oauth-btn-google" onClick={() => handleOAuthRedirect('google')} disabled={loading} type="button">
                        {t('public.signup.google', 'Google로 가입')}
                      </button>
                    )}
                    {kakaoAvailable && (
                      <button className="oauth-btn oauth-btn-kakao" onClick={() => handleOAuthRedirect('kakao')} disabled={loading} type="button">
                        {t('public.signup.kakao', '카카오로 가입')}
                      </button>
                    )}
                    {appleAvailable && (
                      <button className="oauth-btn oauth-btn-apple" onClick={() => handleOAuthRedirect('apple')} disabled={loading} type="button">
                        {t('public.signup.apple', 'Apple로 가입')}
                      </button>
                    )}
                  </div>
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
              <select className="form-select" required value={countryCode} onChange={e => { setCountryCode(e.target.value); setProviderState(''); setProviderCity(''); setProviderAddressDetail(''); setProviderAddressFlat(''); }}>
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
      // English label map for provider form toggle
      const EN: Record<string, string> = {
        'public.signup.provider_l1': 'Business Category *',
        'public.signup.provider_l2': 'Sub-category',
        'public.signup.provider_pet_l1': 'Pet Type',
        'public.signup.provider_pet_l2': 'Breed',
        'public.signup.provider_business_number': 'Business Reg. No.',
        'public.signup.provider_certifications': 'Certificates/Licenses',
        'public.signup.provider_address_state': 'State/Province',
        'public.signup.provider_address_city': 'City/District',
        'public.signup.provider_address_detail': 'Detailed Address',
        'public.signup.provider_address_flat': 'Address',
        'public.signup.provider_hours_title': 'Operating Hours',
      };
      const pl = (key: string, koFb: string) => providerLabelLang === 'en' ? (EN[key] || t(key, koFb)) : t(key, koFb);

      // Resolve biz info popover text based on selected L1
      const selectedL1Key = l1Options.find(o => o.id === providerL1Id)?.key || '';
      const bizInfoMap: Record<string, string> = {
        hospital: 'public.signup.provider_info_hospital',
        grooming: 'public.signup.provider_info_grooming',
        pet_shop: 'public.signup.provider_info_petshop',
        pet_hotel: 'public.signup.provider_info_hotel',
        training: 'public.signup.provider_info_training',
      };
      const bizInfoKey = Object.entries(bizInfoMap).find(([k]) => selectedL1Key.toLowerCase().includes(k))?.[1];

      const countryRegionList = COUNTRY_REGIONS[countryCode] || [];
      const hasRegions = countryRegionList.length > 0;
      const selectedRegion = countryRegionList.find(r => r.name === providerState);
      const hasCities = !!(selectedRegion?.cities && selectedRegion.cities.length > 0);

      function toggleLabelLang() {
        const next = providerLabelLang === 'ko' ? 'en' : 'ko';
        setProviderLabelLang(next);
        try { localStorage.setItem('provider_label_lang', next); } catch { /* */ }
      }

      function handleCertKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = certInput.trim();
          if (val && !certTags.includes(val)) setCertTags(prev => [...prev, val]);
          setCertInput('');
        }
      }

      function updateHours(day: string, field: 'open' | 'close' | 'closed', value: string | boolean) {
        setOperatingHoursMap(prev => ({
          ...prev,
          [day]: { ...prev[day], [field]: value },
        }));
      }

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
              <div className="card-body" style={{ display: 'grid', gap: 12 }}>
                {/* A. Language Toggle */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="signup-lang-toggle" onClick={toggleLabelLang}>
                    🌐 {providerLabelLang === 'ko' ? '한국어' : 'English'}
                  </button>
                </div>

                {/* B. Business Category L1/L2 + Info Popover */}
                <div className="form-row col2">
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {pl('public.signup.provider_l1', '업종 L1')}
                      {providerL1Id && (
                        <button type="button" className="signup-biz-info-btn" onClick={() => setShowBizInfo(v => !v)}>ℹ</button>
                      )}
                    </label>
                    <select className="form-select" value={providerL1Id} onChange={e => { setProviderL1Id(e.target.value); setProviderL3Id(''); setShowBizInfo(false); }}>
                      <option value="">{t('common.select', '선택...')}</option>
                      {l1Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                    {showBizInfo && bizInfoKey && (
                      <div className="signup-biz-info-popover">
                        {t(bizInfoKey, '')}
                        <div style={{ textAlign: 'right', marginTop: 6 }}>
                          <button type="button" style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowBizInfo(false)}>✕</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{pl('public.signup.provider_l2', '업종 L2')}</label>
                    <select className="form-select" value={providerL2Id} onChange={e => setProviderL2Id(e.target.value)}>
                      <option value="">{t('public.signup.provider_l2_optional', '선택 안 함')}</option>
                      {l2Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                  </div>
                </div>

                {/* Pet Type L1/L2 */}
                <div className="form-row col2">
                  <div className="form-group">
                    <label className="form-label">{pl('public.signup.provider_pet_l1', '펫종류 L1')}</label>
                    <select className="form-select" value={providerPetTypeL1Id} onChange={e => { setProviderPetTypeL1Id(e.target.value); setProviderPetTypeL2Id(''); setProviderL3Id(''); }}>
                      <option value="">{t('common.select', '선택...')}</option>
                      {petTypeL1Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{pl('public.signup.provider_pet_l2', '펫종류 L2')}</label>
                    <select className="form-select" value={providerPetTypeL2Id} onChange={e => { setProviderPetTypeL2Id(e.target.value); setProviderL3Id(''); }}>
                      <option value="">{t('common.select', '선택...')}</option>
                      {petTypeL2Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                    </select>
                  </div>
                </div>

                {/* Business Registration Number */}
                <div className="form-group">
                  <label className="form-label">{pl('public.signup.provider_business_number', '사업자 번호')}</label>
                  <input className="form-input" value={providerBusinessNumber} onChange={e => setProviderBusinessNumber(e.target.value)} />
                </div>

                {/* C. Address — universal country-aware cascade */}
                {hasRegions ? (
                  <div className="form-row col3">
                    <div className="form-group">
                      <label className="form-label">{pl('public.signup.provider_address_state', '시/도')}</label>
                      <select className="form-select" value={providerState} onChange={e => { setProviderState(e.target.value); setProviderCity(''); }}>
                        <option value="">{t('common.select', '선택...')}</option>
                        {countryRegionList.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{pl('public.signup.provider_address_city', '시/군/구')}</label>
                      {hasCities ? (
                        <select className="form-select" value={providerCity} onChange={e => setProviderCity(e.target.value)} disabled={!providerState}>
                          <option value="">{t('common.select', '선택...')}</option>
                          {(selectedRegion?.cities || []).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <input className="form-input" value={providerCity} onChange={e => setProviderCity(e.target.value)} disabled={!providerState} />
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">{pl('public.signup.provider_address_detail', '상세 주소')}</label>
                      <input className="form-input" value={providerAddressDetail} onChange={e => setProviderAddressDetail(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">{pl('public.signup.provider_address_flat', '주소')}</label>
                    <input className="form-input" value={providerAddressFlat} onChange={e => setProviderAddressFlat(e.target.value)} />
                  </div>
                )}

                {/* D. Operating Hours Day-by-Day */}
                <div className="form-group">
                  <label className="form-label">{pl('public.signup.provider_hours_title', '운영 시간')}</label>
                  <div className="signup-hours-grid">
                    {DAYS.map(day => {
                      const h = operatingHoursMap[day];
                      return (
                        <div key={day} className="signup-hours-row">
                          <span className="day-label">{t(`public.signup.provider_hours_${day}`, day)}</span>
                          <input type="time" value={h.open} disabled={h.closed} onChange={e => updateHours(day, 'open', e.target.value)} />
                          <span className="sep">~</span>
                          <input type="time" value={h.close} disabled={h.closed} onChange={e => updateHours(day, 'close', e.target.value)} />
                          <label className="closed-label">
                            <input type="checkbox" checked={h.closed} onChange={e => updateHours(day, 'closed', e.target.checked)} />
                            {t('public.signup.provider_hours_closed', '휴무')}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* E. Certifications Tag UI */}
                <div className="form-group">
                  <label className="form-label">{pl('public.signup.provider_certifications', '자격증/면허')}</label>
                  <input
                    className="form-input"
                    value={certInput}
                    onChange={e => setCertInput(e.target.value)}
                    onKeyDown={handleCertKeyDown}
                    placeholder={t('public.signup.provider_cert_placeholder', '자격증명을 입력하고 Enter')}
                  />
                  {certTags.length > 0 && (
                    <div className="signup-cert-tags">
                      {certTags.map((tag, i) => (
                        <span key={i} className="signup-cert-tag">
                          {tag}
                          <button type="button" onClick={() => setCertTags(prev => prev.filter((_, j) => j !== i))}>✕</button>
                        </span>
                      ))}
                    </div>
                  )}
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
