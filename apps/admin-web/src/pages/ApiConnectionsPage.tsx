import { useEffect, useState, type ChangeEvent } from 'react';
import { api } from '../lib/api';
import { testGoogleIdentityClient, testGooglePlacesKey } from '../lib/google';
import { useT } from '../lib/i18n';

type Tab = 'google' | 'kakao' | 'apple';

function FieldHint({ children }: { children: React.ReactNode }) {
  return <div className="text-muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{children}</div>;
}

function StatusBadge({ connected, t }: { connected: boolean; t: (key: string, fb?: string) => string }) {
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
      {connected
        ? t('admin.api_connections.status.connected', '연결완료')
        : t('admin.api_connections.status.unverified', '미확인')}
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

// ─── Google Tab ──────────────────────────────────────────────────────────────

function GoogleTab({ t }: { t: (key: string, fb?: string) => string }) {
  const [placesKey, setPlacesKey] = useState('');
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
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
  const [initialValues, setInitialValues] = useState({
    placesKey: '', oauthClientId: '', redirectUri: '', translateServiceJson: '',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.platformSettings.google.get();
      const loadedJson = data.settings.google_translate_service_account_json?.value || '';
      const parsed = parseServiceAccountJson(loadedJson);
      setPlacesKey(data.settings.google_places_api_key?.value || '');
      setOauthClientId(data.settings.google_oauth_client_id?.value || '');
      setOauthClientSecret(data.settings.google_oauth_client_secret?.value || '');
      setRedirectUri(data.settings.google_oauth_redirect_uri?.value || '');
      setTranslateServiceJson(loadedJson);
      setTranslateServiceEmail(parsed?.email || data.settings.google_translate_service_account_email?.value || '');
      setTranslatePrivateKey(parsed?.privateKey || data.settings.google_translate_service_account_private_key?.value || '');
      setInitialValues({
        placesKey: data.settings.google_places_api_key?.value || '',
        oauthClientId: data.settings.google_oauth_client_id?.value || '',
        redirectUri: data.settings.google_oauth_redirect_uri?.value || '',
        translateServiceJson: loadedJson,
      });
      setPlacesConnected(Boolean(data.settings.google_places_verified_at?.value));
      setOauthConnected(Boolean(data.settings.google_oauth_verified_at?.value));
      setTranslateConnected(Boolean(data.settings.google_translate_verified_at?.value));
      setUpdatedAt(
        data.settings.google_translate_service_account_json?.updated_at ||
        data.settings.google_oauth_client_id?.updated_at ||
        data.settings.google_places_api_key?.updated_at || '',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const placesChanged = placesKey !== initialValues.placesKey;
      const oauthChanged = oauthClientId !== initialValues.oauthClientId || redirectUri !== initialValues.redirectUri;
      const translateChanged = translateServiceJson !== initialValues.translateServiceJson;
      await api.platformSettings.google.update({
        google_places_api_key: placesKey,
        google_oauth_client_id: oauthClientId,
        google_oauth_client_secret: oauthClientSecret,
        google_oauth_redirect_uri: redirectUri,
        google_translate_service_account_json: translateServiceJson,
        google_translate_service_account_email: translateServiceEmail,
        google_translate_service_account_private_key: translatePrivateKey,
        ...(placesChanged ? { google_places_verified_at: '' } : {}),
        ...(oauthChanged ? { google_oauth_verified_at: '' } : {}),
        ...(translateChanged ? { google_translate_verified_at: '' } : {}),
      });
      if (placesChanged) setPlacesConnected(false);
      if (oauthChanged) setOauthConnected(false);
      if (translateChanged) setTranslateConnected(false);
      setSuccess(t('admin.api_connections.saved', '설정이 저장되었습니다.'));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function testPlaces() {
    setTestingTarget('places'); setPlacesTestMessage('');
    try {
      await testGooglePlacesKey(placesKey);
      await api.platformSettings.google.update({ google_places_verified_at: new Date().toISOString() });
      setPlacesConnected(true);
      setPlacesTestMessage('정상입니다. Google Places 스크립트 로드가 확인되었습니다.');
    } catch (e) {
      setPlacesConnected(false);
      setPlacesTestMessage(e instanceof Error ? e.message : 'Google Places 연결 확인에 실패했습니다.');
    } finally { setTestingTarget(''); }
  }

  async function testOAuth() {
    setTestingTarget('oauth'); setOauthTestMessage('');
    try {
      await testGoogleIdentityClient(oauthClientId);
      await api.platformSettings.google.update({ google_oauth_verified_at: new Date().toISOString() });
      setOauthConnected(true);
      setOauthTestMessage('정상입니다. Google 로그인 스크립트와 Client ID 초기화가 확인되었습니다.');
    } catch (e) {
      setOauthConnected(false);
      setOauthTestMessage(e instanceof Error ? e.message : 'Google 로그인 연결 확인에 실패했습니다.');
    } finally { setTestingTarget(''); }
  }

  async function testTranslate() {
    setTestingTarget('translate'); setTranslateTestMessage('');
    try {
      const parsed = parseServiceAccountJson(translateServiceJson);
      const result = await api.platformSettings.google.testTranslate({
        google_translate_service_account_json: translateServiceJson,
        google_translate_service_account_email: parsed?.email || translateServiceEmail,
        google_translate_service_account_private_key: parsed?.privateKey || translatePrivateKey,
        text: '테스트 번역',
      });
      await api.platformSettings.google.update({ google_translate_verified_at: new Date().toISOString() });
      setTranslateConnected(true);
      setTranslateTestMessage(`정상입니다. 테스트 번역 결과: ${result.translated_text || '(빈 응답)'}`);
    } catch (e) {
      setTranslateConnected(false);
      setTranslateTestMessage(e instanceof Error ? e.message : 'Google 번역 연결 확인에 실패했습니다.');
    } finally { setTestingTarget(''); }
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
    } catch { setTranslateTestMessage('JSON 파일을 읽지 못했습니다.'); }
    finally { e.target.value = ''; }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <p className="text-muted">{t('admin.google.description', 'Google Cloud Console에서 발급한 값을 기능별로 그대로 붙여넣으면 됩니다.')}</p>

      {/* Section 1: Places */}
      <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
        <div className="card-body" style={{ display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>1. Google Places</span>
              <StatusBadge connected={placesConnected} t={t} />
            </div>
            <FieldHint>Google Maps Platform &gt; Credentials에서 만든 API key를 입력합니다.</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.google.field.places_key', 'Google Places API Key')}</label>
            <input className="form-input" value={placesKey} onChange={e => setPlacesKey(e.target.value)} placeholder="AIza..." />
            <FieldHint>Google Cloud Console: <strong>Credentials &gt; API keys &gt; Key</strong></FieldHint>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" type="button" onClick={() => void testPlaces()} disabled={testingTarget !== ''}>
                {testingTarget === 'places' ? t('admin.api_connections.btn.testing', '확인중...') : t('admin.api_connections.btn.test', '연결 확인')}
              </button>
              {placesTestMessage && <span className="text-muted" style={{ fontSize: 12 }}>{placesTestMessage}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: OAuth */}
      <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
        <div className="card-body" style={{ display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>2. Google OAuth</span>
              <StatusBadge connected={oauthConnected} t={t} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.google.field.oauth_client_id', 'Google OAuth Client ID')}</label>
            <input className="form-input" value={oauthClientId} onChange={e => setOauthClientId(e.target.value)} placeholder="1234567890-xxxxx.apps.googleusercontent.com" />
            <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" type="button" onClick={() => void testOAuth()} disabled={testingTarget !== ''}>
                {testingTarget === 'oauth' ? t('admin.api_connections.btn.testing', '확인중...') : t('admin.api_connections.btn.test', '연결 확인')}
              </button>
              {oauthTestMessage && <span className="text-muted" style={{ fontSize: 12 }}>{oauthTestMessage}</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.google.field.oauth_client_secret', 'Google OAuth Client Secret')}</label>
            <input className="form-input" type="password" value={oauthClientSecret} onChange={e => setOauthClientSecret(e.target.value)} placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.google.field.oauth_redirect_uri', 'Google OAuth Redirect URI')}</label>
            <input className="form-input" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} placeholder="https://admin.example.com/auth/google/callback" />
          </div>
        </div>
      </div>

      {/* Section 3: Translate */}
      <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
        <div className="card-body" style={{ display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>3. Google Translate</span>
              <StatusBadge connected={translateConnected} t={t} />
            </div>
            <FieldHint>Cloud Translation API용 서비스계정 JSON 파일을 붙여넣거나 업로드합니다.</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">Service Account JSON</label>
            <textarea
              className="form-input" value={translateServiceJson} rows={10}
              onChange={e => {
                const next = e.target.value;
                setTranslateServiceJson(next);
                const parsed = parseServiceAccountJson(next);
                setTranslateServiceEmail(parsed?.email || '');
                setTranslatePrivateKey(parsed?.privateKey || '');
                setTranslateConnected(false);
              }}
              placeholder={'{\n  "type": "service_account",\n  "client_email": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n..."\n}'}
              style={{ resize: 'vertical', fontFamily: 'monospace' }}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                JSON 파일 불러오기
                <input type="file" accept="application/json,.json" onChange={e => void handleJsonFileUpload(e)} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.google.field.translate_service_email', 'Service Account Email')}</label>
            <input className="form-input" value={translateServiceEmail} readOnly placeholder="translate-bot@project-id.iam.gserviceaccount.com" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.google.field.translate_private_key', 'Private Key')}</label>
            <textarea className="form-input" value={translatePrivateKey} readOnly rows={6} style={{ resize: 'vertical', fontFamily: 'monospace' }}
              placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----" />
            <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" type="button" onClick={() => void testTranslate()} disabled={testingTarget !== ''}>
                {testingTarget === 'translate' ? t('admin.api_connections.btn.testing', '확인중...') : t('admin.api_connections.btn.test', '연결 확인')}
              </button>
              {translateTestMessage && <span className="text-muted" style={{ fontSize: 12 }}>{translateTestMessage}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted">{t('admin.google.field.updated_at', '마지막 수정일')}: {updatedAt || '-'}</div>
      <div>
        <button className="btn btn-primary" onClick={() => void save()} disabled={saving || loading}>
          {saving ? t('admin.common.saving', '저장중...') : t('admin.api_connections.btn.save', '저장')}
        </button>
      </div>
    </div>
  );
}

// ─── Kakao Tab ───────────────────────────────────────────────────────────────

function KakaoTab({ t }: { t: (key: string, fb?: string) => string }) {
  const [restApiKey, setRestApiKey] = useState('');
  const [javascriptKey, setJavascriptKey] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [initialValues, setInitialValues] = useState({ restApiKey: '', javascriptKey: '', redirectUri: '' });

  async function load() {
    setLoading(true); setError('');
    try {
      const data = await api.platformSettings.kakao.get();
      const s = data.settings;
      setRestApiKey(s.kakao_rest_api_key?.value || '');
      setJavascriptKey(s.kakao_javascript_key?.value || '');
      setRedirectUri(s.kakao_redirect_uri?.value || '');
      setConnected(Boolean(s.kakao_verified_at?.value));
      setUpdatedAt(s.kakao_rest_api_key?.updated_at || s.kakao_javascript_key?.updated_at || '');
      setInitialValues({
        restApiKey: s.kakao_rest_api_key?.value || '',
        javascriptKey: s.kakao_javascript_key?.value || '',
        redirectUri: s.kakao_redirect_uri?.value || '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const changed = restApiKey !== initialValues.restApiKey || javascriptKey !== initialValues.javascriptKey || redirectUri !== initialValues.redirectUri;
      const result = await api.platformSettings.kakao.update({
        kakao_rest_api_key: restApiKey,
        kakao_javascript_key: javascriptKey,
        kakao_redirect_uri: redirectUri,
        ...(changed ? { kakao_verified_at: '' } : {}),
      });
      setUpdatedAt(result.updated_at);
      setInitialValues({ restApiKey, javascriptKey, redirectUri });
      if (changed) setConnected(false);
      setSuccess(t('admin.api_connections.saved', '설정이 저장되었습니다.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  async function test() {
    setTesting(true); setTestMessage('');
    try {
      await api.platformSettings.kakao.test();
      setConnected(true);
      setTestMessage('정상입니다. Kakao REST API Key가 유효합니다.');
    } catch (e) {
      setConnected(false);
      setTestMessage(e instanceof Error ? e.message : 'Kakao 연결 확인에 실패했습니다.');
    } finally { setTesting(false); }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
        <div className="card-body" style={{ display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{t('admin.kakao.section.oauth', 'Kakao 로그인')}</span>
              <StatusBadge connected={connected} t={t} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.kakao.field.rest_api_key', 'REST API Key')}</label>
            <input className="form-input" value={restApiKey} onChange={e => setRestApiKey(e.target.value)} placeholder="32자리 hex (예: abcdef0123456789...)" />
            <FieldHint>{t('admin.kakao.hint.rest_api_key', 'Kakao Developers > 내 애플리케이션 > 앱 키 > REST API 키')}</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.kakao.field.javascript_key', 'JavaScript Key')}</label>
            <input className="form-input" value={javascriptKey} onChange={e => setJavascriptKey(e.target.value)} placeholder="32자리 hex" />
            <FieldHint>{t('admin.kakao.hint.javascript_key', 'Kakao Developers > 내 애플리케이션 > 앱 키 > JavaScript 키')}</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.kakao.field.redirect_uri', 'Redirect URI')}</label>
            <input className="form-input" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} placeholder="https://example.com/auth/kakao/callback" />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" type="button" onClick={() => void test()} disabled={testing}>
              {testing ? t('admin.api_connections.btn.testing', '확인중...') : t('admin.api_connections.btn.test', '연결 확인')}
            </button>
            {testMessage && <span className="text-muted" style={{ fontSize: 12 }}>{testMessage}</span>}
          </div>
        </div>
      </div>

      <div className="text-muted">{t('admin.google.field.updated_at', '마지막 수정일')}: {updatedAt || '-'}</div>
      <div>
        <button className="btn btn-primary" onClick={() => void save()} disabled={saving || loading}>
          {saving ? t('admin.common.saving', '저장중...') : t('admin.api_connections.btn.save', '저장')}
        </button>
      </div>
    </div>
  );
}

// ─── Apple Tab ───────────────────────────────────────────────────────────────

function AppleTab({ t }: { t: (key: string, fb?: string) => string }) {
  const [serviceId, setServiceId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [initialValues, setInitialValues] = useState({ serviceId: '', teamId: '', keyId: '', privateKey: '', redirectUri: '' });

  async function load() {
    setLoading(true); setError('');
    try {
      const data = await api.platformSettings.apple.get();
      const s = data.settings;
      setServiceId(s.apple_service_id?.value || '');
      setTeamId(s.apple_team_id?.value || '');
      setKeyId(s.apple_key_id?.value || '');
      setPrivateKey(s.apple_private_key?.value || '');
      setRedirectUri(s.apple_redirect_uri?.value || '');
      setConnected(Boolean(s.apple_verified_at?.value));
      setUpdatedAt(s.apple_service_id?.updated_at || s.apple_team_id?.updated_at || '');
      setInitialValues({
        serviceId: s.apple_service_id?.value || '',
        teamId: s.apple_team_id?.value || '',
        keyId: s.apple_key_id?.value || '',
        privateKey: s.apple_private_key?.value || '',
        redirectUri: s.apple_redirect_uri?.value || '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const changed =
        serviceId !== initialValues.serviceId || teamId !== initialValues.teamId ||
        keyId !== initialValues.keyId || privateKey !== initialValues.privateKey ||
        redirectUri !== initialValues.redirectUri;
      const result = await api.platformSettings.apple.update({
        apple_service_id: serviceId,
        apple_team_id: teamId,
        apple_key_id: keyId,
        apple_private_key: privateKey,
        apple_redirect_uri: redirectUri,
        ...(changed ? { apple_verified_at: '' } : {}),
      });
      setUpdatedAt(result.updated_at);
      setInitialValues({ serviceId, teamId, keyId, privateKey, redirectUri });
      if (changed) setConnected(false);
      setSuccess(t('admin.api_connections.saved', '설정이 저장되었습니다.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  async function test() {
    setTesting(true); setTestMessage('');
    try {
      await api.platformSettings.apple.test();
      setConnected(true);
      setTestMessage('정상입니다. Apple .p8 키로 JWT 생성이 확인되었습니다.');
    } catch (e) {
      setConnected(false);
      setTestMessage(e instanceof Error ? e.message : 'Apple 연결 확인에 실패했습니다.');
    } finally { setTesting(false); }
  }

  async function handleP8FileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setPrivateKey(text.trim());
      setConnected(false);
      setTestMessage('.p8 파일을 불러왔습니다. 저장 후 연결 확인을 눌러주세요.');
    } catch { setTestMessage('.p8 파일을 읽지 못했습니다.'); }
    finally { e.target.value = ''; }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
        <div className="card-body" style={{ display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{t('admin.apple.section.signin', 'Apple 로그인')}</span>
              <StatusBadge connected={connected} t={t} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.apple.field.service_id', 'Service ID')}</label>
            <input className="form-input" value={serviceId} onChange={e => setServiceId(e.target.value)} placeholder="com.example.app.signin" />
            <FieldHint>{t('admin.apple.hint.service_id', 'Apple Developer > Certificates, Identifiers & Profiles > Identifiers > Services IDs')}</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.apple.field.team_id', 'Team ID')}</label>
            <input className="form-input" value={teamId} onChange={e => setTeamId(e.target.value)} placeholder="ABCDE12345" />
            <FieldHint>Apple Developer 계정의 Team ID (10자리)</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.apple.field.key_id', 'Key ID')}</label>
            <input className="form-input" value={keyId} onChange={e => setKeyId(e.target.value)} placeholder="ABC123DEFG" />
            <FieldHint>Sign in with Apple용 Key의 Key ID (10자리)</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.apple.field.private_key', 'Private Key (.p8)')}</label>
            <textarea
              className="form-input" value={privateKey} rows={8}
              onChange={e => { setPrivateKey(e.target.value); setConnected(false); }}
              placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
              style={{ resize: 'vertical', fontFamily: 'monospace' }}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                .p8 파일 불러오기
                <input type="file" accept=".p8,.pem" onChange={e => void handleP8FileUpload(e)} style={{ display: 'none' }} />
              </label>
            </div>
            <FieldHint>{t('admin.apple.hint.private_key', 'Apple Developer에서 다운로드한 .p8 파일의 내용을 붙여넣으세요.')}</FieldHint>
          </div>
          <div className="form-group">
            <label className="form-label">{t('admin.apple.field.redirect_uri', 'Redirect URI')}</label>
            <input className="form-input" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} placeholder="https://example.com/auth/apple/callback" />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" type="button" onClick={() => void test()} disabled={testing}>
              {testing ? t('admin.api_connections.btn.testing', '확인중...') : t('admin.api_connections.btn.test', '연결 확인')}
            </button>
            {testMessage && <span className="text-muted" style={{ fontSize: 12 }}>{testMessage}</span>}
          </div>
        </div>
      </div>

      <div className="text-muted">{t('admin.google.field.updated_at', '마지막 수정일')}: {updatedAt || '-'}</div>
      <div>
        <button className="btn btn-primary" onClick={() => void save()} disabled={saving || loading}>
          {saving ? t('admin.common.saving', '저장중...') : t('admin.api_connections.btn.save', '저장')}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ApiConnectionsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<Tab>('google');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'google', label: t('admin.api_connections.tab.google', 'Google') },
    { key: 'kakao', label: t('admin.api_connections.tab.kakao', 'Kakao') },
    { key: 'apple', label: t('admin.api_connections.tab.apple', 'Apple') },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('admin.api_connections.title', 'API 연결')}</div>
      </div>
      <div className="content">
        <div style={{ maxWidth: 840 }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 20,
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--text)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: -2,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'google' && <GoogleTab t={t} />}
          {activeTab === 'kakao' && <KakaoTab t={t} />}
          {activeTab === 'apple' && <AppleTab t={t} />}
        </div>
      </div>
    </>
  );
}
