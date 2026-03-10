import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useT } from '../lib/i18n';

export default function GoogleSettingsPage() {
  const t = useT();
  const [placesKey, setPlacesKey] = useState('');
  const [oauthClientId, setOauthClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [translateServiceEmail, setTranslateServiceEmail] = useState('');
  const [translatePrivateKey, setTranslatePrivateKey] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.platformSettings.google.get();
      setPlacesKey(data.settings.google_places_api_key?.value || '');
      setOauthClientId(data.settings.google_oauth_client_id?.value || '');
      setRedirectUri(data.settings.google_oauth_redirect_uri?.value || '');
      setTranslateServiceEmail(data.settings.google_translate_service_account_email?.value || '');
      setTranslatePrivateKey(data.settings.google_translate_service_account_private_key?.value || '');
      setUpdatedAt(
        data.settings.google_translate_service_account_private_key?.updated_at ||
        data.settings.google_translate_service_account_email?.updated_at ||
        data.settings.google_oauth_redirect_uri?.updated_at ||
        data.settings.google_oauth_client_id?.updated_at ||
        data.settings.google_places_api_key?.updated_at ||
        '',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const result = await api.platformSettings.google.update({
        google_places_api_key: placesKey,
        google_oauth_client_id: oauthClientId,
        google_oauth_redirect_uri: redirectUri,
        google_translate_service_account_email: translateServiceEmail,
        google_translate_service_account_private_key: translatePrivateKey,
      });
      setUpdatedAt(result.updated_at);
      setSuccess(t('admin.google.saved', 'Google API 설정이 저장되었습니다.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🗝️ {t('admin.google.title', 'Google API 설정')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="card" style={{ maxWidth: 840 }}>
          <div className="card-body" style={{ display: 'grid', gap: 14 }}>
            <p className="text-muted">{t('admin.google.description', 'Google Places와 Google 로그인에 사용하는 설정값을 관리합니다. Google 번역은 서버 환경변수 기반으로 동작합니다.')}</p>
            <div className="form-group">
              <label className="form-label">{t('admin.google.field.places_key', 'Google Places API Key')}</label>
              <input className="form-input" value={placesKey} onChange={(e) => setPlacesKey(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.google.field.oauth_client_id', 'Google OAuth Client ID')}</label>
              <input className="form-input" value={oauthClientId} onChange={(e) => setOauthClientId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.google.field.oauth_redirect_uri', 'Google OAuth Redirect URI')}</label>
              <input className="form-input" value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.google.field.translate_service_email', 'Google Translate Service Account Email')}</label>
              <input className="form-input" value={translateServiceEmail} onChange={(e) => setTranslateServiceEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.google.field.translate_private_key', 'Google Translate Private Key')}</label>
              <textarea
                className="form-input"
                value={translatePrivateKey}
                onChange={(e) => setTranslatePrivateKey(e.target.value)}
                rows={8}
                style={{ resize: 'vertical', fontFamily: 'monospace' }}
              />
            </div>
            <div className="text-muted">{t('admin.google.field.updated_at', '마지막 수정일')}: {updatedAt || '-'}</div>
            <div>
              <button className="btn btn-primary" onClick={() => void save()} disabled={saving || loading}>
                {saving ? t('admin.common.saving', '저장중...') : t('admin.google.save', '저장')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
