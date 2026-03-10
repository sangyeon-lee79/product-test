import { useEffect, useState, type ChangeEvent } from 'react';
import { api } from '../lib/api';
import { testGoogleIdentityClient, testGooglePlacesKey } from '../lib/google';
import { useT } from '../lib/i18n';

function FieldHint({ children }: { children: React.ReactNode }) {
  return <div className="text-muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{children}</div>;
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: connected ? '#ecfdf3' : '#fff7ed',
        color: connected ? '#166534' : '#9a3412',
        border: `1px solid ${connected ? '#bbf7d0' : '#fed7aa'}`,
      }}
    >
      {connected ? '연결완료' : '미확인'}
    </span>
  );
}

function parseServiceAccountJson(raw: string): { email: string; privateKey: string } | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as { client_email?: string; private_key?: string };
    return {
      email: String(parsed.client_email || '').trim(),
      privateKey: String(parsed.private_key || '').trim(),
    };
  } catch {
    return null;
  }
}

export default function GoogleSettingsPage() {
  const t = useT();
  const [placesKey, setPlacesKey] = useState('');
  const [oauthClientId, setOauthClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [translateServiceJson, setTranslateServiceJson] = useState('');
  const [translateServiceEmail, setTranslateServiceEmail] = useState('');
  const [translatePrivateKey, setTranslatePrivateKey] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [placesTestMessage, setPlacesTestMessage] = useState('');
  const [oauthTestMessage, setOauthTestMessage] = useState('');
  const [translateTestMessage, setTranslateTestMessage] = useState('');
  const [testingTarget, setTestingTarget] = useState<'places' | 'oauth' | 'translate' | ''>('');
  const [placesConnected, setPlacesConnected] = useState(false);
  const [oauthConnected, setOauthConnected] = useState(false);
  const [translateConnected, setTranslateConnected] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.platformSettings.google.get();
      setPlacesKey(data.settings.google_places_api_key?.value || '');
      setOauthClientId(data.settings.google_oauth_client_id?.value || '');
      setRedirectUri(data.settings.google_oauth_redirect_uri?.value || '');
      setTranslateServiceJson(data.settings.google_translate_service_account_json?.value || '');
      setTranslateServiceEmail(data.settings.google_translate_service_account_email?.value || '');
      setTranslatePrivateKey(data.settings.google_translate_service_account_private_key?.value || '');
      setUpdatedAt(
        data.settings.google_translate_service_account_json?.updated_at ||
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
        google_translate_service_account_json: translateServiceJson,
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

  async function testPlacesConnection() {
    setTestingTarget('places');
    setPlacesTestMessage('');
    try {
      await testGooglePlacesKey(placesKey);
      setPlacesConnected(true);
      setPlacesTestMessage('정상입니다. 현재 관리자 웹에서 Google Places 스크립트 로드가 확인되었습니다.');
    } catch (e) {
      setPlacesConnected(false);
      setPlacesTestMessage(e instanceof Error ? e.message : 'Google Places 연결 확인에 실패했습니다.');
    } finally {
      setTestingTarget('');
    }
  }

  async function testOAuthConnection() {
    setTestingTarget('oauth');
    setOauthTestMessage('');
    try {
      await testGoogleIdentityClient(oauthClientId);
      setOauthConnected(true);
      setOauthTestMessage('정상입니다. Google 로그인 스크립트와 Client ID 초기화가 확인되었습니다.');
    } catch (e) {
      setOauthConnected(false);
      setOauthTestMessage(e instanceof Error ? e.message : 'Google 로그인 연결 확인에 실패했습니다.');
    } finally {
      setTestingTarget('');
    }
  }

  async function testTranslateConnection() {
    setTestingTarget('translate');
    setTranslateTestMessage('');
    try {
      const parsed = parseServiceAccountJson(translateServiceJson);
      const result = await api.platformSettings.google.testTranslate({
        google_translate_service_account_json: translateServiceJson,
        google_translate_service_account_email: parsed?.email || translateServiceEmail,
        google_translate_service_account_private_key: parsed?.privateKey || translatePrivateKey,
        text: '테스트 번역',
      });
      setTranslateConnected(true);
      setTranslateTestMessage(`정상입니다. 테스트 번역 결과: ${result.translated_text || '(빈 응답)'}`);
    } catch (e) {
      setTranslateConnected(false);
      setTranslateTestMessage(e instanceof Error ? e.message : 'Google 번역 연결 확인에 실패했습니다.');
    } finally {
      setTestingTarget('');
    }
  }

  async function handleJsonFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseServiceAccountJson(text);
      setTranslateServiceJson(text);
      setTranslateServiceEmail(parsed?.email || '');
      setTranslatePrivateKey(parsed?.privateKey || '');
      setTranslateConnected(false);
      setTranslateTestMessage(parsed ? 'JSON 파일을 불러왔습니다. 저장 후 연결 확인을 눌러주세요.' : 'JSON을 불러왔지만 client_email/private_key를 찾지 못했습니다.');
    } catch {
      setTranslateConnected(false);
      setTranslateTestMessage('JSON 파일을 읽지 못했습니다.');
    } finally {
      e.target.value = '';
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
                  <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>1. Google 주소 자동완성</span>
                    <StatusBadge connected={placesConnected} />
                  </div>
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
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" type="button" onClick={() => void testPlacesConnection()} disabled={testingTarget !== ''}>
                      {testingTarget === 'places' ? '확인중...' : '연결 확인'}
                    </button>
                    {placesTestMessage && <span className="text-muted" style={{ fontSize: 12 }}>{placesTestMessage}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
              <div className="card-body" style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>2. Google 로그인</span>
                    <StatusBadge connected={oauthConnected} />
                  </div>
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
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" type="button" onClick={() => void testOAuthConnection()} disabled={testingTarget !== ''}>
                      {testingTarget === 'oauth' ? '확인중...' : '연결 확인'}
                    </button>
                    {oauthTestMessage && <span className="text-muted" style={{ fontSize: 12 }}>{oauthTestMessage}</span>}
                  </div>
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
                  <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>3. Google 번역</span>
                    <StatusBadge connected={translateConnected} />
                  </div>
                  <FieldHint>Cloud Translation API용 서비스계정 JSON 파일 전체를 그대로 붙여넣거나 업로드합니다.</FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">Google Translate Service Account JSON</label>
                  <textarea
                    className="form-input"
                    value={translateServiceJson}
                    onChange={(e) => {
                      const next = e.target.value;
                      setTranslateServiceJson(next);
                      const parsed = parseServiceAccountJson(next);
                      setTranslateServiceEmail(parsed?.email || '');
                      setTranslatePrivateKey(parsed?.privateKey || '');
                      setTranslateConnected(false);
                    }}
                    rows={10}
                    placeholder={'{\n  "type": "service_account",\n  "client_email": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n..."\n}'}
                    style={{ resize: 'vertical', fontFamily: 'monospace' }}
                  />
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                      JSON 파일 불러오기
                      <input type="file" accept="application/json,.json" onChange={(e) => void handleJsonFileUpload(e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <FieldHint>
                    다운로드한 서비스계정 JSON 파일 내용을 통째로 저장합니다.
                  </FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.google.field.translate_service_email', 'Google Translate Service Account Email')}</label>
                  <input className="form-input" value={translateServiceEmail} readOnly placeholder="translate-bot@project-id.iam.gserviceaccount.com" />
                  <FieldHint>
                    서비스계정 JSON에서 자동 추출된 <strong>client_email</strong> 값입니다.
                  </FieldHint>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.google.field.translate_private_key', 'Google Translate Private Key')}</label>
                  <textarea
                    className="form-input"
                    value={translatePrivateKey}
                    readOnly
                    rows={10}
                    placeholder={'-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'}
                    style={{ resize: 'vertical', fontFamily: 'monospace' }}
                  />
                  <FieldHint>
                    서비스계정 JSON에서 자동 추출된 <strong>private_key</strong> 값입니다.
                  </FieldHint>
                  <FieldHint>
                    <strong>BEGIN PRIVATE KEY</strong>부터 <strong>END PRIVATE KEY</strong>까지 전체를 그대로 붙여넣어야 합니다.
                  </FieldHint>
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" type="button" onClick={() => void testTranslateConnection()} disabled={testingTarget !== ''}>
                      {testingTarget === 'translate' ? '확인중...' : '연결 확인'}
                    </button>
                    {translateTestMessage && <span className="text-muted" style={{ fontSize: 12 }}>{translateTestMessage}</span>}
                  </div>
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
