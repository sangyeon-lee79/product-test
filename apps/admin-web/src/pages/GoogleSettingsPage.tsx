import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useT } from '../lib/i18n';

function FieldHint({ children }: { children: React.ReactNode }) {
  return <div className="text-muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{children}</div>;
}

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
            <p className="text-muted">{t('admin.google.description', 'Google Cloud Console에서 발급한 값을 기능별로 그대로 붙여넣으면 됩니다.')}</p>

            <div className="alert" style={{ background: '#fffaf0', border: '1px solid #f3e0b5', color: '#7c4a03' }}>
              <strong>빠른 매핑</strong>
              <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                <div><strong>API Key</strong> → Google Places API Key</div>
                <div><strong>OAuth Client ID</strong> → Google OAuth Client ID</div>
                <div><strong>서비스계정 JSON의 client_email</strong> → Google Translate Service Account Email</div>
                <div><strong>서비스계정 JSON의 private_key</strong> → Google Translate Private Key</div>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
              <div className="card-body" style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>1. Google 주소 자동완성</div>
                  <FieldHint>Google Maps Platform &gt; Credentials에서 만든 API key를 입력합니다.</FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.google.field.places_key', 'Google Places API Key')}</label>
                  <input className="form-input" value={placesKey} onChange={(e) => setPlacesKey(e.target.value)} placeholder="AIza..." />
                  <FieldHint>
                    Google Cloud Console 값: <strong>Credentials &gt; API keys &gt; Key</strong>
                  </FieldHint>
                  <FieldHint>
                    콘솔에서 같이 확인할 것: <strong>HTTP referrers</strong>, <strong>Maps JavaScript API</strong>, <strong>Places API</strong>
                  </FieldHint>
                </div>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
              <div className="card-body" style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>2. Google 로그인</div>
                  <FieldHint>Google Auth platform에서 만든 Web application 클라이언트 값을 입력합니다.</FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.google.field.oauth_client_id', 'Google OAuth Client ID')}</label>
                  <input className="form-input" value={oauthClientId} onChange={(e) => setOauthClientId(e.target.value)} placeholder="1234567890-xxxxx.apps.googleusercontent.com" />
                  <FieldHint>
                    Google Cloud Console 값: <strong>Clients &gt; Web application &gt; Client ID</strong>
                  </FieldHint>
                  <FieldHint>
                    콘솔에서 같이 확인할 것: <strong>Authorized JavaScript origins</strong>에 현재 관리자 웹 주소 등록
                  </FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.google.field.oauth_redirect_uri', 'Google OAuth Redirect URI')}</label>
                  <input className="form-input" value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} placeholder="https://admin.example.com/auth/google/callback" />
                  <FieldHint>
                    현재 구현은 popup 로그인이라 필수는 아닙니다. 운영 메모용으로만 저장해도 됩니다.
                  </FieldHint>
                </div>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
              <div className="card-body" style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>3. Google 번역</div>
                  <FieldHint>Cloud Translation API용 서비스계정 JSON 파일의 값을 그대로 복사해 넣습니다.</FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.google.field.translate_service_email', 'Google Translate Service Account Email')}</label>
                  <input className="form-input" value={translateServiceEmail} onChange={(e) => setTranslateServiceEmail(e.target.value)} placeholder="translate-bot@project-id.iam.gserviceaccount.com" />
                  <FieldHint>
                    서비스계정 JSON 값: <strong>client_email</strong>
                  </FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.google.field.translate_private_key', 'Google Translate Private Key')}</label>
                  <textarea
                    className="form-input"
                    value={translatePrivateKey}
                    onChange={(e) => setTranslatePrivateKey(e.target.value)}
                    rows={10}
                    placeholder={'-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'}
                    style={{ resize: 'vertical', fontFamily: 'monospace' }}
                  />
                  <FieldHint>
                    서비스계정 JSON 값: <strong>private_key</strong>
                  </FieldHint>
                  <FieldHint>
                    <strong>BEGIN PRIVATE KEY</strong>부터 <strong>END PRIVATE KEY</strong>까지 전체를 그대로 붙여넣어야 합니다.
                  </FieldHint>
                </div>
              </div>
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
