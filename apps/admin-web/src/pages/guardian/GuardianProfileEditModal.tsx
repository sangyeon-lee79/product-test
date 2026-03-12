// Guardian Profile Edit Modal — 보호자 프로필 수정
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { api, type GuardianProfile, type Country } from '../../lib/api';
import { useT } from '../../lib/i18n';
import { LANG_LABELS, SUPPORTED_LANGS, type Lang } from '@petfolio/shared';
import { COUNTRY_REGIONS, type Region } from '../../data/countryRegions';

interface Props {
  open: boolean;
  profile: GuardianProfile;
  countries: Country[];
  lang: Lang;
  onClose: () => void;
  onSaved: (updated: GuardianProfile) => void;
}

/** Parse "region_text" stored as "RegionName|CityName" */
function parseRegionText(raw: string | null | undefined): { region: string; city: string } {
  if (!raw) return { region: '', city: '' };
  const idx = raw.indexOf('|');
  if (idx < 0) return { region: raw, city: '' };
  return { region: raw.slice(0, idx), city: raw.slice(idx + 1) };
}

function buildRegionText(region: string, city: string): string | null {
  if (!region && !city) return null;
  if (!city) return region;
  return `${region}|${city}`;
}

const readonlyStyle: React.CSSProperties = { background: '#F5F5F5', color: '#888', cursor: 'not-allowed' };

export default function GuardianProfileEditModal({ open, profile, countries, lang, onClose, onSaved }: Props) {
  const t = useT();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryId, setCountryId] = useState('');
  const [regionName, setRegionName] = useState('');
  const [cityName, setCityName] = useState('');
  const [language, setLanguage] = useState('ko');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDisplayName(profile.display_name || profile.full_name || '');
      setPhone(profile.phone || '');
      setCountryId(profile.country_id || '');
      const parsed = parseRegionText(profile.region_text);
      setRegionName(parsed.region);
      setCityName(parsed.city);
      setLanguage(profile.language || 'ko');
      setError('');
    }
  }, [open, profile]);

  // Resolve country code from country_id
  const selectedCountryCode = useMemo(() => {
    if (!countryId) return '';
    const c = countries.find((c) => c.id === countryId);
    return c?.code || '';
  }, [countryId, countries]);

  // Region list for selected country
  const regionList: Region[] = useMemo(
    () => COUNTRY_REGIONS[selectedCountryCode] || [],
    [selectedCountryCode],
  );

  // City list for selected region (only KR-style cascaded regions)
  const cityList: string[] = useMemo(() => {
    if (!regionName || regionList.length === 0) return [];
    const found = regionList.find((r) => r.name === regionName);
    return found?.cities || [];
  }, [regionName, regionList]);

  // Reset region/city when country changes
  function handleCountryChange(newId: string) {
    setCountryId(newId);
    setRegionName('');
    setCityName('');
  }

  // Reset city when region changes
  function handleRegionChange(newRegion: string) {
    setRegionName(newRegion);
    setCityName('');
  }

  if (!open) return null;

  function countryLabel(c: Country): string {
    const byLang = c[lang as keyof Country];
    if (typeof byLang === 'string' && byLang.trim()) return byLang.trim();
    if (c.ko_name) return c.ko_name;
    return c.code;
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.guardians.updateMe({
        display_name: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
        country_id: countryId || undefined,
        region_text: buildRegionText(regionName, cityName),
        language: language || undefined,
      });
      onSaved(res.profile);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.save_error', 'Failed to save.'));
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 480,
          maxWidth: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="modal-header">
          <h3>{t('guardian.profile.edit_profile', 'Edit Profile')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* 1. Name */}
          <div>
            <label className="form-label">{t('guardian.form.name', 'Name')}</label>
            <input
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('guardian.form.name', 'Name')}
            />
          </div>

          {/* 2. Phone */}
          <div>
            <label className="form-label">{t('guardian.profile.phone', 'Phone')}</label>
            <input
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('guardian.profile.phone', 'Phone')}
              type="tel"
            />
          </div>

          {/* 3. Country */}
          <div>
            <label className="form-label">{t('profile.field.country', 'Country')}</label>
            <select
              className="form-input"
              value={countryId}
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              <option value="">{t('profile.placeholder.select_country', 'Select country')}</option>
              {countries.filter((c) => c.is_active).map((c) => (
                <option key={c.id} value={c.id}>{countryLabel(c)}</option>
              ))}
            </select>
          </div>

          {/* 4. Region / City */}
          {regionList.length > 0 ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('profile.field.region', 'Region')}</label>
                <select
                  className="form-input"
                  value={regionName}
                  onChange={(e) => handleRegionChange(e.target.value)}
                >
                  <option value="">{t('profile.placeholder.select_region', 'Select region')}</option>
                  {regionList.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('profile.field.city', 'City')}</label>
                {cityList.length > 0 ? (
                  <select
                    className="form-input"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    disabled={!regionName}
                  >
                    <option value="">{t('profile.placeholder.select_city', 'Select city')}</option>
                    {cityList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-input"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder={t('profile.placeholder.select_city', 'Enter city')}
                    disabled={!regionName}
                  />
                )}
              </div>
            </div>
          ) : countryId ? (
            <div>
              <label className="form-label">{t('profile.field.city', 'City')}</label>
              <input
                className="form-input"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder={t('profile.placeholder.select_city', 'Enter city')}
              />
            </div>
          ) : null}

          {/* 5. Language */}
          <div>
            <label className="form-label">{t('guardian.profile.language', 'Language')}</label>
            <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {SUPPORTED_LANGS.map((l) => (
                <option key={l} value={l}>{LANG_LABELS[l]}</option>
              ))}
            </select>
          </div>

          {/* 6. Email (read-only) */}
          <div>
            <label className="form-label">{t('guardian.profile.email', 'Email')}</label>
            <input className="form-input" value={profile.email || ''} disabled style={readonlyStyle} />
          </div>

          {/* 7. Sign-up Method (read-only) */}
          <div>
            <label className="form-label">{t('guardian.profile.auth_method', 'Sign-up Method')}</label>
            <input
              className="form-input"
              value={profile.oauth_provider ? profile.oauth_provider.charAt(0).toUpperCase() + profile.oauth_provider.slice(1) : 'Email'}
              disabled
              style={readonlyStyle}
            />
          </div>

          {/* 8. Joined Date (read-only) */}
          <div>
            <label className="form-label">{t('guardian.profile.joined_date', 'Joined')}</label>
            <input
              className="form-input"
              value={profile.user_created_at ? new Date(profile.user_created_at).toLocaleDateString() : '-'}
              disabled
              style={readonlyStyle}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel', 'Cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving', 'Saving...') : t('guardian.profile.save', 'Save')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
