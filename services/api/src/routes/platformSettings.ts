import type { Env, JwtPayload } from '../types';
import { err, newId, now, ok } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

const GOOGLE_PUBLIC_SETTING_KEYS = [
  'google_places_api_key',
  'google_oauth_client_id',
  'google_oauth_redirect_uri',
] as const;

const GOOGLE_ADMIN_SETTING_KEYS = [
  ...GOOGLE_PUBLIC_SETTING_KEYS,
  'google_translate_service_account_json',
  'google_translate_service_account_email',
  'google_translate_service_account_private_key',
] as const;

const GOOGLE_TOKEN_AUDIENCE = 'https://oauth2.googleapis.com/token';
const GOOGLE_TRANSLATE_SCOPE = 'https://www.googleapis.com/auth/cloud-translation';

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeJson(value: unknown): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, '\n').trim();
}

function parseServiceAccountJson(raw: string): { email: string; privateKey: string } | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as { client_email?: string; private_key?: string };
    const email = String(parsed.client_email || '').trim();
    const privateKey = String(parsed.private_key || '').trim();
    if (!email || !privateKey) return null;
    return { email, privateKey };
  } catch {
    return null;
  }
}

async function issueGoogleTranslateAccessToken(serviceAccountEmail: string, rawPrivateKey: string): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const privateKeyPem = normalizePrivateKey(rawPrivateKey);
  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const payload = {
    iss: serviceAccountEmail,
    scope: GOOGLE_TRANSLATE_SCOPE,
    aud: GOOGLE_TOKEN_AUDIENCE,
    iat: nowSec,
    exp: nowSec + 3600,
  };
  const unsigned = `${base64UrlEncodeJson({ alg: 'RS256', typ: 'JWT' })}.${base64UrlEncodeJson(payload)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    signingKey,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(GOOGLE_TOKEN_AUDIENCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const tokenJson = await tokenResponse.json() as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description || tokenJson.error || `Google OAuth HTTP ${tokenResponse.status}`);
  }

  return tokenJson.access_token;
}

async function testGoogleTranslateCredentials(request: Request, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  let body: {
    google_translate_service_account_json?: string;
    google_translate_service_account_email?: string;
    google_translate_service_account_private_key?: string;
    text?: string;
  };
  try {
    body = await request.json() as typeof body;
  } catch {
    return err('Invalid JSON body');
  }

  const serviceAccountJson = String(body.google_translate_service_account_json || '').trim();
  let serviceAccountEmail = String(body.google_translate_service_account_email || '').trim();
  let privateKey = String(body.google_translate_service_account_private_key || '').trim();
  const text = String(body.text || '테스트 번역').trim();

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson) as { client_email?: string; private_key?: string };
      serviceAccountEmail = String(parsed.client_email || '').trim();
      privateKey = String(parsed.private_key || '').trim();
    } catch {
      return err('google translate service account json is invalid');
    }
  }

  if (!serviceAccountEmail) return err('google translate service account email required');
  if (!privateKey) return err('google translate service account private key required');

  try {
    const accessToken = await issueGoogleTranslateAccessToken(serviceAccountEmail, privateKey);
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        q: text,
        source: 'ko',
        target: 'en',
        format: 'text',
      }),
    });

    const json = await response.json() as {
      data?: { translations?: Array<{ translatedText?: string }> };
      error?: { message?: string };
    };
    if (!response.ok) {
      return err(json.error?.message || `Google Translate HTTP ${response.status}`, 400, 'google_translate_test_failed');
    }

    return ok({
      ok: true,
      translated_text: json.data?.translations?.[0]?.translatedText || '',
    });
  } catch (testError) {
    return err(testError instanceof Error ? testError.message : 'google translate test failed', 400, 'google_translate_test_failed');
  }
}

async function listGoogleSettings(env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  const rows = await env.DB.prepare(
    `SELECT setting_key, setting_value, updated_at
     FROM platform_settings
     WHERE setting_key IN (
       'google_places_api_key',
       'google_oauth_client_id',
       'google_oauth_redirect_uri',
       'google_translate_service_account_json',
       'google_translate_service_account_email',
       'google_translate_service_account_private_key'
     )
     ORDER BY setting_key`
  ).all<Record<string, unknown>>();

  const mapped = Object.fromEntries(
    GOOGLE_ADMIN_SETTING_KEYS.map((key) => [key, { value: '', updated_at: null }]),
  ) as Record<string, { value: string; updated_at: string | null }>;

  for (const row of rows.results || []) {
    mapped[String(row.setting_key)] = {
      value: String(row.setting_value || ''),
      updated_at: row.updated_at ? String(row.updated_at) : null,
    };
  }

  return ok({ settings: mapped });
}

async function listPublicGoogleSettings(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT setting_key, setting_value
     FROM platform_settings
     WHERE setting_key IN ('google_places_api_key', 'google_oauth_client_id', 'google_oauth_redirect_uri')
     ORDER BY setting_key`
  ).all<Record<string, unknown>>();

  const mapped = Object.fromEntries(
    GOOGLE_PUBLIC_SETTING_KEYS.map((key) => [key, '']),
  ) as Record<string, string>;

  for (const row of rows.results || []) {
    mapped[String(row.setting_key)] = String(row.setting_value || '');
  }

  return ok({
    google_places_api_key: mapped.google_places_api_key,
    google_oauth_client_id: mapped.google_oauth_client_id,
    google_oauth_redirect_uri: mapped.google_oauth_redirect_uri,
  });
}

async function updateGoogleSettings(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const parsedServiceAccount = parseServiceAccountJson(String(body.google_translate_service_account_json || ''));
  if ('google_translate_service_account_json' in body && String(body.google_translate_service_account_json || '').trim() && !parsedServiceAccount) {
    return err('google translate service account json is invalid');
  }
  if (parsedServiceAccount) {
    body.google_translate_service_account_email = parsedServiceAccount.email;
    body.google_translate_service_account_private_key = parsedServiceAccount.privateKey;
  }

  const timestamp = now();
  for (const key of GOOGLE_ADMIN_SETTING_KEYS) {
    if (!(key in body)) continue;
    await env.DB.prepare(
      `INSERT INTO platform_settings (id, setting_key, setting_value, updated_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(setting_key) DO UPDATE SET
         setting_value = excluded.setting_value,
         updated_by_user_id = excluded.updated_by_user_id,
         updated_at = excluded.updated_at`
    ).bind(newId(), key, String(body[key] || ''), me.sub, timestamp, timestamp).run();
  }

  return ok({ updated: true, updated_at: timestamp });
}

export async function handlePlatformSettings(request: Request, env: Env, url: URL): Promise<Response> {
  if (url.pathname === '/api/v1/google/config' && request.method === 'GET') {
    return listPublicGoogleSettings(env);
  }

  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  if (url.pathname === '/api/v1/admin/settings/google' && request.method === 'GET') {
    return listGoogleSettings(env, me);
  }
  if (url.pathname === '/api/v1/admin/settings/google' && request.method === 'PUT') {
    return updateGoogleSettings(request, env, me);
  }
  if (url.pathname === '/api/v1/admin/settings/google/test-translate' && request.method === 'POST') {
    return testGoogleTranslateCredentials(request, me);
  }
  return err('Not found', 404);
}
