import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setTokens, type MasterItem } from '../lib/api';
import { getApiBase } from '../lib/apiBase';
import { getRoleHomePath, storeRole } from '../lib/auth';
import { ensureGooglePlacesScript } from '../lib/google';
import { LANG_LABELS, SUPPORTED_LANGS, useI18n, useT } from '../lib/i18n';

type CountryRow = {
  id: string;
  code: string;
  currency_code?: string | null;
};

const API_BASE = getApiBase();

export default function Signup() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [addressPlaceId, setAddressPlaceId] = useState('');
  const [addressLat, setAddressLat] = useState<number | undefined>(undefined);
  const [addressLng, setAddressLng] = useState<number | undefined>(undefined);
  const [countryCode, setCountryCode] = useState('KR');
  const [preferredLanguage, setPreferredLanguage] = useState(lang);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [hasPets, setHasPets] = useState(false);
  const [petCount, setPetCount] = useState('0');
  const [interestedPetTypes, setInterestedPetTypes] = useState<string[]>([]);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [healthNotifications, setHealthNotifications] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  function uiErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
      }
      return msg;
    }
    return fallback;
  }

  useEffect(() => {
    let mounted = true;
    async function loadCountries() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/countries`);
        const text = await res.text();
        const parsed = text ? JSON.parse(text) as { success?: boolean; data?: CountryRow[]; error?: string } : null;
        if (!res.ok || !parsed?.success) throw new Error(parsed?.error || `HTTP ${res.status}`);
        if (!mounted) return;
        const list = (parsed.data || []).sort((a, b) => a.code.localeCompare(b.code));
        setCountries(list);
      } catch (e) {
        if (!mounted) return;
        setError(uiErrorMessage(e, '국가 목록을 불러오지 못했습니다.'));
      }
    }
    async function loadBusinessL1() {
      try {
        const rows = await api.master.public.items('business_category', null, lang, { item_level: 'l1' });
        if (!mounted) return;
        setL1Options(rows);
      } catch (e) {
        if (!mounted) return;
        setError(uiErrorMessage(e, '업종 목록을 불러오지 못했습니다.'));
      }
    }
    async function loadPetTypeL1() {
      try {
        const rows = await api.master.public.items('pet_type', null, lang);
        if (!mounted) return;
        setPetTypeL1Options(rows);
      } catch (e) {
        if (!mounted) return;
        setError(uiErrorMessage(e, '펫 종류 목록을 불러오지 못했습니다.'));
      }
    }
    void loadCountries();
    void loadBusinessL1();
    void loadPetTypeL1();
    return () => {
      mounted = false;
    };
  }, [lang]);

  useEffect(() => {
    if (!providerL1Id) {
      setL2Options([]);
      setProviderL2Id('');
      return;
    }
    let mounted = true;
    async function loadBusinessL2() {
      try {
        const rows = await api.master.public.items('business_category', providerL1Id, lang, { item_level: 'l2' });
        if (!mounted) return;
        setL2Options(rows);
      } catch {
        if (!mounted) return;
        setL2Options([]);
      }
    }
    void loadBusinessL2();
    return () => {
      mounted = false;
    };
  }, [providerL1Id, lang]);

  useEffect(() => {
    if (!providerPetTypeL1Id) {
      setPetTypeL2Options([]);
      setProviderPetTypeL2Id('');
      return;
    }
    let mounted = true;
    async function loadPetTypeL2() {
      try {
        const rows = await api.master.public.items('pet_type', providerPetTypeL1Id, lang);
        if (!mounted) return;
        setPetTypeL2Options(rows);
      } catch {
        if (!mounted) return;
        setPetTypeL2Options([]);
      }
    }
    void loadPetTypeL2();
    return () => {
      mounted = false;
    };
  }, [providerPetTypeL1Id, lang]);

  useEffect(() => {
    if (!providerL1Id || !providerPetTypeL1Id || !providerPetTypeL2Id) {
      setL3Options([]);
      setProviderL3Id('');
      return;
    }
    let mounted = true;
    async function loadBusinessL3() {
      try {
        const rows = await api.master.public.items('business_category', null, lang, {
          item_level: 'l3_style',
          business_category_l1_id: providerL1Id,
          pet_type_l1_id: providerPetTypeL1Id,
          pet_type_l2_id: providerPetTypeL2Id,
        });
        if (!mounted) return;
        setL3Options(rows);
      } catch {
        if (!mounted) return;
        setL3Options([]);
      }
    }
    void loadBusinessL3();
    return () => {
      mounted = false;
    };
  }, [providerL1Id, providerPetTypeL1Id, providerPetTypeL2Id, lang]);

  useEffect(() => {
    let cancelled = false;
    let listener: { remove: () => void } | null = null;

    async function setupPlaces() {
      if (!addressInputRef.current) return;
      try {
        await ensureGooglePlacesScript();
        if (cancelled || !addressInputRef.current) return;
        const AutocompleteCtor = window.google?.maps?.places?.Autocomplete;
        if (!AutocompleteCtor) return;

        const autocomplete = new AutocompleteCtor(addressInputRef.current, {
          fields: ['formatted_address', 'geometry', 'place_id'],
          types: ['address'],
        });

        listener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const formatted = place.formatted_address || addressInputRef.current?.value || '';
          setAddressLine(formatted);
          setAddressPlaceId(place.place_id || '');
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          setAddressLat(typeof lat === 'number' ? lat : undefined);
          setAddressLng(typeof lng === 'number' ? lng : undefined);
        });
      } catch {
        // Fallback to manual address input when Google Places is not configured.
      }
    }

    void setupPlaces();
    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, []);

  const selectedCountry = useMemo(
    () => countries.find(c => c.code === countryCode),
    [countries, countryCode],
  );

  function toggleInterest(value: string) {
    setInterestedPetTypes((prev) => prev.includes(value) ? prev.filter((row) => row !== value) : [...prev, value]);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (password !== passwordConfirm) throw new Error(t('public.signup.password_mismatch', '비밀번호가 일치하지 않습니다.'));
      if (!termsAgreed) throw new Error(t('public.signup.terms_agree', '서비스 약관 동의'));

      const data = await api.signupV2({
        email,
        password,
        display_name: displayName,
        nickname,
        phone,
        address_line: addressLine,
        address_place_id: addressPlaceId || undefined,
        address_lat: addressLat,
        address_lng: addressLng,
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
          address_line: addressLine || null,
          address_place_id: addressPlaceId || null,
          address_lat: addressLat ?? null,
          address_lng: addressLng ?? null,
        } : undefined,
      });

      setTokens(data.access_token, data.refresh_token);
      storeRole(data.role);
      navigate(getRoleHomePath(data.role), { replace: true });
    } catch (e) {
      setError(uiErrorMessage(e, '회원가입에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card" style={{ width: 640 }}>
        <div className="card-body">
          <div className="login-logo">
            <h1>🐾 Petfolio</h1>
            <p>{t('public.signup.title', '회원가입')}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSignup} style={{ display: 'grid', gap: 12 }}>
            <div className="form-row col2">
              <div className="form-group">
                <label className="form-label">{t('public.signup.email', '이메일')} *</label>
                <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('public.signup.display_name', '이름')} *</label>
                <input className="form-input" required value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
            </div>

            <div className="form-row col2">
              <div className="form-group">
                <label className="form-label">{t('public.signup.password', '비밀번호')} *</label>
                <input className="form-input" type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('public.signup.password_confirm', '비밀번호 확인')} *</label>
                <input className="form-input" type="password" minLength={8} required value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
              </div>
            </div>

            <div className="form-row col3">
              <div className="form-group">
                <label className="form-label">{t('public.signup.nickname', '닉네임')}</label>
                <input className="form-input" value={nickname} onChange={e => setNickname(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('public.signup.phone', '연락처')}</label>
                <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('public.signup.language', '선호 언어')}</label>
                <select className="form-select" value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value as typeof preferredLanguage)}>
                  {SUPPORTED_LANGS.map(code => <option key={code} value={code}>{LANG_LABELS[code]}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row col2">
              <div className="form-group">
                <label className="form-label">{t('public.signup.country', '거주 국가')} *</label>
                <select className="form-select" required value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                  {countries.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('public.signup.address', '주소')}</label>
                <input
                  ref={addressInputRef}
                  className="form-input"
                  value={addressLine}
                  onChange={e => {
                    setAddressLine(e.target.value);
                    setAddressPlaceId('');
                    setAddressLat(undefined);
                    setAddressLng(undefined);
                  }}
                  placeholder="주소를 입력하거나 Google 추천에서 선택"
                />
              </div>
            </div>

            <div className="alert" style={{ background: '#f5f8ff', border: '1px solid #d6e2ff', color: '#244c99' }}>
              {t('public.signup.default_setup', '선택한 국가 기준으로 언어/통화 기본값이 설정됩니다.')}
              <div className="mt-1 text-sm">Currency preview: {selectedCountry?.currency_code || '-'}</div>
            </div>

            <div className="card">
              <div className="card-body" style={{ display: 'grid', gap: 10 }}>
                <strong>{t('public.signup.my_page_seed', '마이페이지 기본 정보')}</strong>
                <div className="form-row col3">
                  <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={hasPets} onChange={e => setHasPets(e.target.checked)} />
                    {t('public.signup.has_pets', '반려동물 보유 여부')}
                  </label>
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.pet_count', '반려동물 수')}</label>
                    <input className="form-input" type="number" min="0" value={petCount} onChange={e => setPetCount(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('public.signup.interests', '관심 동물 종류')}</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {['dog', 'cat', 'other'].map((type) => (
                        <label key={type} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="checkbox" checked={interestedPetTypes.includes(type)} onChange={() => toggleInterest(type)} />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-row col3">
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
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ display: 'grid', gap: 10 }}>
                <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={applyProvider} onChange={e => setApplyProvider(e.target.checked)} />
                  {t('public.signup.provider_apply', '가입 후 업종회원 role 신청')}
                </label>
                {applyProvider && (
                  <>
                    <div className="form-row col2">
                      <div className="form-group">
                        <label className="form-label">{t('public.signup.provider_l1', '업종 L1')}</label>
                        <select className="form-select" value={providerL1Id} onChange={e => {
                          setProviderL1Id(e.target.value);
                          setProviderL3Id('');
                        }}>
                          <option value="">{t('admin.common.select', '선택...')}</option>
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
                    <div className="form-row col3">
                      <div className="form-group">
                        <label className="form-label">{t('public.signup.provider_pet_l1', '펫종류 L1')}</label>
                        <select className="form-select" value={providerPetTypeL1Id} onChange={e => {
                          setProviderPetTypeL1Id(e.target.value);
                          setProviderPetTypeL2Id('');
                          setProviderL3Id('');
                        }}>
                          <option value="">{t('admin.common.select', '선택...')}</option>
                          {petTypeL1Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('public.signup.provider_pet_l2', '펫종류 L2')}</label>
                        <select className="form-select" value={providerPetTypeL2Id} onChange={e => {
                          setProviderPetTypeL2Id(e.target.value);
                          setProviderL3Id('');
                        }}>
                          <option value="">{t('admin.common.select', '선택...')}</option>
                          {petTypeL2Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('public.signup.provider_l3', '작업 스타일')}</label>
                        <select className="form-select" value={providerL3Id} onChange={e => setProviderL3Id(e.target.value)} disabled={!providerL1Id || !providerPetTypeL1Id || !providerPetTypeL2Id}>
                          <option value="">{t('admin.common.select', '선택...')}</option>
                          {l3Options.map(item => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
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
                        <label className="form-label">{t('public.signup.provider_certifications', '보유 자격증/면허')}</label>
                        <input className="form-input" value={providerCertifications} onChange={e => setProviderCertifications(e.target.value)} placeholder={t('public.signup.certifications_placeholder', '쉼표로 구분해 입력')} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
              {t('public.signup.terms_agree', '서비스 약관 동의')}
            </label>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Creating...' : t('public.signup.submit', '계정 만들기')}
            </button>
          </form>

          <p className="text-sm mt-3" style={{ textAlign: 'center' }}>
            이미 계정이 있나요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
