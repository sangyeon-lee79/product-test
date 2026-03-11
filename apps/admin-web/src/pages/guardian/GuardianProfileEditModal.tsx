// Guardian Profile Edit Modal — 보호자 프로필 수정
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api, type GuardianProfile, type Country } from '../../lib/api';
import { useT } from '../../lib/i18n';
import { LANG_LABELS, SUPPORTED_LANGS, type Lang } from '@petfolio/shared';

interface Props {
  open: boolean;
  profile: GuardianProfile;
  countries: Country[];
  lang: Lang;
  onClose: () => void;
  onSaved: (updated: GuardianProfile) => void;
}

export default function GuardianProfileEditModal({ open, profile, countries, lang, onClose, onSaved }: Props) {
  const t = useT();
  const [displayName, setDisplayName] = useState(profile.display_name || profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [countryId, setCountryId] = useState(profile.country_id || '');
  const [language, setLanguage] = useState(profile.language || 'ko');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDisplayName(profile.display_name || profile.full_name || '');
      setPhone(profile.phone || '');
      setCountryId(profile.country_id || '');
      setLanguage(profile.language || 'ko');
      setError('');
    }
  }, [open, profile]);

  if (!open) return null;

  function countryLabel(c: Country): string {
    const byLang = c[lang as keyof Country];
    if (typeof byLang === 'string' && byLang.trim()) return byLang.trim();
    if (c.ko_name) return c.ko_name;
    return c.code;
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await api.guardians.updateMe({
        display_name: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
        country_id: countryId || undefined,
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
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>{t('guardian.profile.edit_profile', 'Edit Profile')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* 이름 (editable) */}
          <div>
            <label className="form-label">{t('guardian.form.name', 'Name')}</label>
            <input
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('guardian.form.name', 'Name')}
            />
          </div>

          {/* 전화번호 (editable) */}
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

          {/* 국가 (editable) */}
          <div>
            <label className="form-label">{t('guardian.profile.country', 'Country')}</label>
            <select className="form-input" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
              <option value="">—</option>
              {countries.filter((c) => c.is_active).map((c) => (
                <option key={c.id} value={c.id}>{countryLabel(c)}</option>
              ))}
            </select>
          </div>

          {/* 언어 (editable) */}
          <div>
            <label className="form-label">{t('guardian.profile.language', 'Language')}</label>
            <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {SUPPORTED_LANGS.map((l) => (
                <option key={l} value={l}>{LANG_LABELS[l]}</option>
              ))}
            </select>
          </div>

          {/* 이메일 (disabled) */}
          <div>
            <label className="form-label">{t('guardian.profile.email', 'Email')}</label>
            <input className="form-input" value={profile.email || ''} disabled />
          </div>

          {/* 가입방식 (disabled) */}
          <div>
            <label className="form-label">{t('guardian.profile.auth_method', 'Sign-up Method')}</label>
            <input className="form-input" value={profile.oauth_provider ? profile.oauth_provider.charAt(0).toUpperCase() + profile.oauth_provider.slice(1) : 'Email'} disabled />
          </div>

          {/* 가입일 (disabled) */}
          <div>
            <label className="form-label">{t('guardian.profile.joined_date', 'Joined')}</label>
            <input className="form-input" value={profile.user_created_at ? new Date(profile.user_created_at).toLocaleDateString() : '-'} disabled />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving', 'Saving...') : t('guardian.profile.save', 'Save')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
