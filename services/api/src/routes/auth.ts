// S5: 인증 API — LLD §5.2, §6
// POST /api/v1/auth/test-login   — 테스트 로그인 (이메일 기반 role 조회)
// POST /api/v1/auth/signup       — 회원가입 + 즉시 JWT 발급
// POST /api/v1/auth/refresh      — 토큰 갱신

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, issueTokens } from '../middleware/auth';
import { hasColumn } from '../helpers/sqlHelpers';

// ─────────────────────────────────────────────────────────────────────────────

const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

type GoogleTokenHeader = {
  alg?: string;
  kid?: string;
};

type GoogleTokenPayload = {
  aud?: string | string[];
  iss?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
  iat?: number;
};

type GoogleJwk = JsonWebKey & {
  kid?: string;
  alg?: string;
  use?: string;
};

type GoogleCertCache = {
  expiresAt: number;
  keys: GoogleJwk[];
};

let googleCertCache: GoogleCertCache | null = null;

// ─── Apple JWKS ────────────────────────────────────────────────────────────────

const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';

type AppleJwk = JsonWebKey & {
  kid?: string;
  alg?: string;
  use?: string;
  kty?: string;
};

type AppleCertCache = {
  expiresAt: number;
  keys: AppleJwk[];
};

let appleCertCache: AppleCertCache | null = null;

type AppleTokenPayload = {
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
};

// ─── Kakao OAuth types ─────────────────────────────────────────────────────────

type KakaoTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type KakaoUserResponse = {
  id?: number;
  kakao_account?: {
    email?: string;
    is_email_verified?: boolean;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
};

function decodeBase64Url(input: string): string {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4 !== 0) normalized += '=';
  return atob(normalized);
}

function parseJsonPart<T>(value: string): T {
  return JSON.parse(decodeBase64Url(value)) as T;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ─── Google OAuth code exchange ───────────────────────────────────────────────

type GoogleTokenResponse = {
  id_token?: string;
  access_token?: string;
  error?: string;
  error_description?: string;
};

async function exchangeGoogleCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = await response.json() as GoogleTokenResponse;
  if (!response.ok || !json.id_token) {
    throw new Error(json.error_description || json.error || 'Failed to exchange Google auth code');
  }
  return json.id_token;
}

// ─── Apple OAuth code exchange ────────────────────────────────────────────────

type AppleTokenResponse = {
  id_token?: string;
  access_token?: string;
  error?: string;
};

async function generateAppleClientSecret(
  teamId: string,
  keyId: string,
  privateKey: string,
  serviceId: string,
): Promise<string> {
  const normalizedKey = privateKey.replace(/\\n/g, '\n').trim();
  const keyBody = normalizedKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const keyBinary = atob(keyBody);
  const keyBytes = new Uint8Array(keyBinary.length);
  for (let i = 0; i < keyBinary.length; i++) keyBytes[i] = keyBinary.charCodeAt(i);

  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const nowSec = Math.floor(Date.now() / 1000);
  const headerB64 = base64UrlEncode(JSON.stringify({ alg: 'ES256', kid: keyId }));
  const payloadB64 = base64UrlEncode(JSON.stringify({
    iss: teamId,
    iat: nowSec,
    exp: nowSec + 15552000, // 180 days
    aud: 'https://appleid.apple.com',
    sub: serviceId,
  }));

  const unsigned = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signingKey,
    new TextEncoder().encode(unsigned),
  );

  return `${unsigned}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
}

async function exchangeAppleCode(
  code: string,
  clientSecret: string,
  clientId: string,
  redirectUri: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = await response.json() as AppleTokenResponse;
  if (!response.ok || !json.id_token) {
    throw new Error(json.error || 'Failed to exchange Apple auth code');
  }
  return json.id_token;
}

async function getGoogleCerts(): Promise<GoogleJwk[]> {
  if (googleCertCache && googleCertCache.expiresAt > Date.now()) {
    return googleCertCache.keys;
  }

  const response = await fetch(GOOGLE_JWKS_URL);
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : 300;
  const json = await response.json() as { keys?: GoogleJwk[] };

  if (!response.ok || !Array.isArray(json.keys) || json.keys.length === 0) {
    throw new Error('Failed to fetch Google signing keys');
  }

  googleCertCache = {
    keys: json.keys,
    expiresAt: Date.now() + (Number.isFinite(maxAgeSec) ? maxAgeSec : 300) * 1000,
  };
  return json.keys;
}

async function verifyGoogleIdToken(idToken: string, audience: string): Promise<GoogleTokenPayload> {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid Google ID token');

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = parseJsonPart<GoogleTokenHeader>(headerB64);
  const payload = parseJsonPart<GoogleTokenPayload>(payloadB64);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported Google ID token');

  const signingKey = (await getGoogleCerts()).find((key) => key.kid === header.kid);
  if (!signingKey) throw new Error('Google signing key not found');

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    signingKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = Uint8Array.from(decodeBase64Url(signatureB64), (char) => char.charCodeAt(0));
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, data);
  if (!valid) throw new Error('Invalid Google ID token signature');

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= nowSec) throw new Error('Google ID token expired');
  if (!payload.iat || payload.iat > nowSec + 60) throw new Error('Invalid Google ID token issued-at');
  if (!payload.iss || !GOOGLE_ISSUERS.has(payload.iss)) throw new Error('Invalid Google ID token issuer');

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(audience)) throw new Error('Google ID token audience mismatch');
  if (!payload.sub) throw new Error('Google account id missing');
  if (!payload.email) throw new Error('Google account email missing');
  if (!(payload.email_verified === true || payload.email_verified === 'true')) {
    throw new Error('Google account email is not verified');
  }

  return payload;
}

// ─── Apple ID Token Verification ──────────────────────────────────────────────

async function getAppleCerts(): Promise<AppleJwk[]> {
  if (appleCertCache && appleCertCache.expiresAt > Date.now()) {
    return appleCertCache.keys;
  }

  const response = await fetch(APPLE_JWKS_URL);
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : 3600;
  const json = await response.json() as { keys?: AppleJwk[] };

  if (!response.ok || !Array.isArray(json.keys) || json.keys.length === 0) {
    throw new Error('Failed to fetch Apple signing keys');
  }

  appleCertCache = {
    keys: json.keys,
    expiresAt: Date.now() + (Number.isFinite(maxAgeSec) ? maxAgeSec : 3600) * 1000,
  };
  return json.keys;
}

async function verifyAppleIdToken(idToken: string, audience: string): Promise<AppleTokenPayload> {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid Apple ID token');

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = parseJsonPart<{ alg?: string; kid?: string }>(headerB64);
  const payload = parseJsonPart<AppleTokenPayload>(payloadB64);
  if (header.alg !== 'ES256' || !header.kid) throw new Error('Unsupported Apple ID token');

  const signingKey = (await getAppleCerts()).find((key) => key.kid === header.kid);
  if (!signingKey) throw new Error('Apple signing key not found');

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    signingKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const rawSig = Uint8Array.from(decodeBase64Url(signatureB64), (char) => char.charCodeAt(0));
  const valid = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    rawSig,
    data,
  );
  if (!valid) throw new Error('Invalid Apple ID token signature');

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= nowSec) throw new Error('Apple ID token expired');
  if (payload.iss !== APPLE_ISSUER) throw new Error('Invalid Apple ID token issuer');
  if (payload.aud !== audience) throw new Error('Apple ID token audience mismatch');
  if (!payload.sub) throw new Error('Apple account id missing');

  return payload;
}

// ─── Kakao OAuth (authorization code flow) ────────────────────────────────────

async function exchangeKakaoCode(
  code: string,
  clientId: string,
  redirectUri: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = await response.json() as KakaoTokenResponse;
  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description || 'Failed to exchange Kakao auth code');
  }
  return json.access_token;
}

async function getKakaoUserInfo(accessToken: string): Promise<KakaoUserResponse> {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch Kakao user info');
  return response.json() as Promise<KakaoUserResponse>;
}

// ─── Provider-agnostic user lookup/upsert ─────────────────────────────────────

async function findUserByOAuth(
  env: Env,
  provider: string,
  oauthId: string,
  email: string,
): Promise<{ id: string; role: string; status: string | null } | null> {
  const byOauth = await env.DB.prepare(
    `SELECT id, role, status
     FROM users
     WHERE oauth_provider = ? AND oauth_id = ?
     LIMIT 1`
  ).bind(provider, oauthId).first<{ id: string; role: string; status: string | null }>();
  if (byOauth?.id) return byOauth;

  if (email) {
    return env.DB.prepare(
      'SELECT id, role, status FROM users WHERE email = ? LIMIT 1'
    ).bind(email).first<{ id: string; role: string; status: string | null }>();
  }
  return null;
}

async function ensureOAuthProfile(
  env: Env,
  userId: string,
  email: string,
  displayName: string,
  pictureUrl: string | null,
): Promise<void> {
  const ts = now();
  const existingProfile = await env.DB.prepare(
    'SELECT id FROM user_profiles WHERE user_id = ?'
  ).bind(userId).first<{ id: string }>();

  if (existingProfile?.id) {
    await env.DB.prepare(
      `UPDATE user_profiles
       SET display_name = COALESCE(NULLIF(display_name, ''), ?),
           avatar_url = COALESCE(NULLIF(avatar_url, ''), ?),
           updated_at = ?
       WHERE user_id = ?`
    ).bind(displayName || email, pictureUrl, ts, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO user_profiles (
        id, user_id, handle, display_name, avatar_url, bio, bio_translations,
        country_id, language, timezone, interests, created_at, updated_at
      ) VALUES (?, ?, NULL, ?, ?, NULL, '{}', NULL, 'ko', 'Asia/Seoul', '[]', ?, ?)`
    ).bind(newId(), userId, displayName || email, pictureUrl, ts, ts).run();
  }

  const existingAccount = await env.DB.prepare(
    'SELECT id FROM user_account_details WHERE user_id = ?'
  ).bind(userId).first<{ id: string }>();

  if (!existingAccount?.id) {
    await env.DB.prepare(
      `INSERT INTO user_account_details (
        id, user_id, full_name, nickname, phone, address_line, address_place_id,
        address_lat, address_lng, region_text, preferred_language, has_pets, pet_count,
        interested_pet_types, notifications_booking, notifications_health, marketing_opt_in,
        terms_agreed_at, public_profile, public_id, created_at, updated_at
      ) VALUES (?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ko', false, 0, '[]', true, true, false, NULL, false, NULL, ?, ?)`
    ).bind(newId(), userId, displayName || email, ts, ts).run();
  }
}

async function upsertOAuthUser(
  env: Env,
  provider: string,
  oauthId: string,
  email: string,
  displayName: string,
  pictureUrl: string | null,
): Promise<{ id: string; role: JwtPayload['role']; email: string }> {
  const ts = now();
  const existing = await findUserByOAuth(env, provider, oauthId, email);
  const role = (existing?.role || 'guardian') as JwtPayload['role'];

  if (existing?.id) {
    await env.DB.prepare(
      `UPDATE users
       SET email = ?, oauth_provider = ?, oauth_id = ?, status = 'active', last_login_provider = ?, last_login_at = ?, updated_at = ?
       WHERE id = ?`
    ).bind(email || null, provider, oauthId, provider, ts, ts, existing.id).run();
    await ensureOAuthProfile(env, existing.id, email, displayName, pictureUrl);
    return { id: existing.id, role, email };
  }

  const userId = newId();
  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, oauth_provider, oauth_id, status, last_login_provider, last_login_at, created_at, updated_at)
     VALUES (?, ?, NULL, 'guardian', ?, ?, 'active', ?, ?, ?, ?)`
  ).bind(userId, email || null, provider, oauthId, provider, ts, ts, ts).run();

  await ensureOAuthProfile(env, userId, email, displayName, pictureUrl);
  return { id: userId, role: 'guardian', email };
}

async function googleOAuthLogin(credential: string, isCode: boolean, env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT setting_key, setting_value FROM platform_settings
     WHERE setting_key IN ('google_oauth_client_id', 'google_oauth_client_secret', 'google_oauth_redirect_uri')`
  ).all<{ setting_key: string; setting_value: string | null }>();

  const settings: Record<string, string> = {};
  for (const row of rows.results || []) settings[row.setting_key] = String(row.setting_value || '').trim();

  const clientId = settings.google_oauth_client_id || '';
  if (!clientId) return err('google oauth client id is not configured', 503);

  let idToken: string;
  if (isCode) {
    const clientSecret = settings.google_oauth_client_secret || '';
    const redirectUri = settings.google_oauth_redirect_uri || '';
    if (!clientSecret) return err('google oauth client secret is not configured', 503);
    if (!redirectUri) return err('google oauth redirect uri is not configured', 503);
    try {
      idToken = await exchangeGoogleCode(credential, clientId, clientSecret, redirectUri);
    } catch (e) {
      return err(e instanceof Error ? e.message : 'google auth code exchange failed', 401, 'google_code_exchange_failed');
    }
  } else {
    idToken = credential;
  }

  let googleUser: GoogleTokenPayload;
  try {
    googleUser = await verifyGoogleIdToken(idToken, clientId);
  } catch (verifyError) {
    return err(verifyError instanceof Error ? verifyError.message : 'invalid google id token', 401, 'invalid_google_token');
  }

  const email = String(googleUser.email || '').trim().toLowerCase();
  const displayName = String(googleUser.name || googleUser.given_name || email).trim();
  const pictureUrl = googleUser.picture ? String(googleUser.picture).trim() : null;
  const googleSub = String(googleUser.sub || '').trim();

  const user = await upsertOAuthUser(env, 'google', googleSub, email, displayName, pictureUrl);
  const tokens = await issueTokens(user.id, user.role, env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, email: user.email, provider: 'google', ...tokens });
}

async function kakaoOAuthLogin(code: string, env: Env): Promise<Response> {
  const restApiKeyRow = await env.DB.prepare(
    `SELECT setting_value FROM platform_settings WHERE setting_key = 'kakao_rest_api_key' LIMIT 1`
  ).first<{ setting_value: string | null }>();
  const restApiKey = String(restApiKeyRow?.setting_value || '').trim();
  if (!restApiKey) return err('kakao rest api key is not configured', 503);

  const redirectUriRow = await env.DB.prepare(
    `SELECT setting_value FROM platform_settings WHERE setting_key = 'kakao_redirect_uri' LIMIT 1`
  ).first<{ setting_value: string | null }>();
  const redirectUri = String(redirectUriRow?.setting_value || '').trim();
  if (!redirectUri) return err('kakao redirect uri is not configured', 503);

  let accessToken: string;
  try {
    accessToken = await exchangeKakaoCode(code, restApiKey, redirectUri);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'kakao auth code exchange failed', 401, 'kakao_code_exchange_failed');
  }

  let kakaoUser: KakaoUserResponse;
  try {
    kakaoUser = await getKakaoUserInfo(accessToken);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'failed to fetch kakao user info', 401, 'kakao_user_info_failed');
  }

  const kakaoId = String(kakaoUser.id || '').trim();
  if (!kakaoId) return err('kakao account id missing', 401);

  const email = (kakaoUser.kakao_account?.email || '').trim().toLowerCase();
  const displayName = kakaoUser.kakao_account?.profile?.nickname || email || `kakao_${kakaoId}`;
  const pictureUrl = kakaoUser.kakao_account?.profile?.profile_image_url || null;

  const user = await upsertOAuthUser(env, 'kakao', kakaoId, email, displayName, pictureUrl);
  const tokens = await issueTokens(user.id, user.role, env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, email: user.email, provider: 'kakao', ...tokens });
}

async function appleOAuthLogin(credential: string, isCode: boolean, userName: string | undefined, env: Env): Promise<Response> {
  const appleRows = await env.DB.prepare(
    `SELECT setting_key, setting_value FROM platform_settings
     WHERE setting_key IN ('apple_service_id', 'apple_team_id', 'apple_key_id', 'apple_private_key', 'apple_redirect_uri')`
  ).all<{ setting_key: string; setting_value: string | null }>();

  const settings: Record<string, string> = {};
  for (const row of appleRows.results || []) settings[row.setting_key] = String(row.setting_value || '').trim();

  const serviceId = settings.apple_service_id || '';
  if (!serviceId) return err('apple service id is not configured', 503);

  let idToken: string;
  if (isCode) {
    const teamId = settings.apple_team_id || '';
    const keyId = settings.apple_key_id || '';
    const privateKey = settings.apple_private_key || '';
    const redirectUri = settings.apple_redirect_uri || '';
    if (!teamId || !keyId || !privateKey) return err('apple signing keys not configured', 503);
    if (!redirectUri) return err('apple redirect uri not configured', 503);
    try {
      const clientSecret = await generateAppleClientSecret(teamId, keyId, privateKey, serviceId);
      idToken = await exchangeAppleCode(credential, clientSecret, serviceId, redirectUri);
    } catch (e) {
      return err(e instanceof Error ? e.message : 'apple auth code exchange failed', 401, 'apple_code_exchange_failed');
    }
  } else {
    idToken = credential;
  }

  let applePayload: AppleTokenPayload;
  try {
    applePayload = await verifyAppleIdToken(idToken, serviceId);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'invalid apple id token', 401, 'invalid_apple_token');
  }

  const appleSub = String(applePayload.sub || '').trim();
  const email = (applePayload.email || '').trim().toLowerCase();
  const displayName = (userName || email || `apple_${appleSub}`).trim();

  const user = await upsertOAuthUser(env, 'apple', appleSub, email, displayName, null);
  const tokens = await issueTokens(user.id, user.role, env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, email: user.email, provider: 'apple', ...tokens });
}

type OAuthBody = {
  provider?: string;
  id_token?: string;
  code?: string;
  user_name?: string;
};

async function oauthLogin(request: Request, env: Env): Promise<Response> {
  let body: OAuthBody;
  try {
    body = await request.json() as OAuthBody;
  } catch {
    return err('Invalid JSON body');
  }

  const provider = (body.provider || '').trim().toLowerCase();

  if (provider === 'google') {
    const code = String(body.code || '').trim();
    const idToken = String(body.id_token || '').trim();
    if (code) return googleOAuthLogin(code, true, env);
    if (idToken) return googleOAuthLogin(idToken, false, env);
    return err('code or id_token required');
  }

  if (provider === 'kakao') {
    const code = String(body.code || '').trim();
    if (!code) return err('code required');
    return kakaoOAuthLogin(code, env);
  }

  if (provider === 'apple') {
    const code = String(body.code || '').trim();
    const idToken = String(body.id_token || '').trim();
    if (code) return appleOAuthLogin(code, true, body.user_name, env);
    if (idToken) return appleOAuthLogin(idToken, false, body.user_name, env);
    return err('code or id_token required');
  }

  return err('unsupported oauth provider', 400);
}

export async function handleAuth(request: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.replace('/api/v1/auth', '');

  if (sub === '/login' && request.method === 'POST') return passwordLogin(request, env);
  if (sub === '/test-login' && request.method === 'POST') return testLogin(request, env);
  if (sub === '/signup' && request.method === 'POST') return signup(request, env);
  if (sub === '/oauth' && request.method === 'POST') return oauthLogin(request, env);
  if (sub === '/refresh' && request.method === 'POST') return refreshToken(request, env);

  return err('Not found', 404);
}

type SignupBody = {
  email: string;
  password?: string;
  display_name?: string;
  nickname?: string;
  phone?: string;
  address_line?: string;
  address_place_id?: string;
  address_lat?: number;
  address_lng?: number;
  country_code?: string;
  language?: string;
  timezone?: string;
  has_pets?: boolean;
  pet_count?: number;
  interested_pet_types?: string[];
  notifications_booking?: boolean;
  notifications_health?: boolean;
  marketing_opt_in?: boolean;
  terms_agreed?: boolean;
  public_profile?: boolean;
  public_id?: string;
  role_application?: {
    requested_role?: string;
    business_category_l1_id?: string | null;
    business_category_l2_id?: string | null;
    business_category_l3_id?: string | null;
    pet_type_l1_id?: string | null;
    pet_type_l2_id?: string | null;
    business_registration_no?: string | null;
    operating_hours?: string | null;
    certifications?: string[] | null;
    supported_pet_types?: string[] | null;
    address_line?: string | null;
    address_place_id?: string | null;
    address_lat?: number | null;
    address_lng?: number | null;
  };
};

const COUNTRY_DEFAULTS: Record<string, { language: string; timezone: string }> = {
  KR: { language: 'ko', timezone: 'Asia/Seoul' },
  US: { language: 'en', timezone: 'America/New_York' },
  JP: { language: 'ja', timezone: 'Asia/Tokyo' },
  VN: { language: 'vi', timezone: 'Asia/Ho_Chi_Minh' },
  ID: { language: 'id_lang', timezone: 'Asia/Jakarta' },
  TH: { language: 'th', timezone: 'Asia/Bangkok' },
  CN: { language: 'zh_cn', timezone: 'Asia/Shanghai' },
  TW: { language: 'zh_tw', timezone: 'Asia/Taipei' },
};

const DEFAULT_SAMPLE_ACCOUNTS = {
  guardian: {
    email: 'guardian@petlife.com',
    password: 'Guardian123!',
    role: 'guardian' as const,
  },
  provider: {
    email: 'provider@petlife.com',
    password: 'Provider123!',
    role: 'provider' as const,
  },
  admin: {
    email: 'admin@petlife.com',
    password: 'Admin123!',
    role: 'admin' as const,
  },
};

type PasswordLoginBody = {
  email?: string;
  password?: string;
};

type UserRow = {
  id: string;
  role: string;
  password_hash: string | null;
  status: string | null;
};

function normalizeRequestedRole(raw?: string): JwtPayload['role'] {
  const role = (raw || 'provider').toLowerCase();
  if (role === 'supplier') return 'provider';
  if (role === 'provider' || role === 'guardian' || role === 'admin') return role;
  return 'provider';
}

function asJsonArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is string => typeof value === 'string').map((value) => value.trim()).filter(Boolean);
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations = 10000): Promise<string> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    baseKey,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await derivePasswordHash(password, salt);
  return `pbkdf2$10000$${btoa(String.fromCharCode(...salt))}$${digest}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterationRaw, saltB64, expected] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iterationRaw || !saltB64 || !expected) return false;
  const salt = Uint8Array.from(atob(saltB64), (char) => char.charCodeAt(0));
  const digest = await derivePasswordHash(password, salt, Number(iterationRaw));
  return digest === expected;
}

async function passwordLogin(request: Request, env: Env): Promise<Response> {
  let body: PasswordLoginBody;
  try {
    body = await request.json() as PasswordLoginBody;
  } catch {
    return err('Invalid JSON body');
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email) return err('email required');
  if (!password) return err('password required');

  let user = await env.DB.prepare(
    'SELECT id, role, password_hash, status FROM users WHERE email = ?'
  ).bind(email).first<UserRow>();

  try {
    if (email === DEFAULT_SAMPLE_ACCOUNTS.guardian.email) {
      user = await ensureDefaultSampleAccount(env, DEFAULT_SAMPLE_ACCOUNTS.guardian, user);
    } else if (email === DEFAULT_SAMPLE_ACCOUNTS.provider.email) {
      user = await ensureDefaultSampleAccount(env, DEFAULT_SAMPLE_ACCOUNTS.provider, user);
    } else if (email === DEFAULT_SAMPLE_ACCOUNTS.admin.email) {
      user = await ensureDefaultSampleAccount(env, DEFAULT_SAMPLE_ACCOUNTS.admin, user);
    }
  } catch {
    // sample account bootstrap failed — fall through to normal auth
  }

  if (!user?.id || !user.password_hash) return err('invalid email or password', 401);
  if ((user.status || 'active') !== 'active') return err('account is not active', 403);
  if (!await verifyPassword(password, user.password_hash)) return err('invalid email or password', 401);

  // Track last login provider
  try { await env.DB.prepare('UPDATE users SET last_login_provider = ?, last_login_at = ? WHERE id = ?').bind('email', now(), user.id).run(); } catch { /* ignore if column missing */ }

  const tokens = await issueTokens(user.id, user.role as JwtPayload['role'], env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, ...tokens });
}

async function signup(request: Request, env: Env): Promise<Response> {
  let body: SignupBody;
  try {
    body = await request.json() as SignupBody;
  } catch {
    return err('Invalid JSON body');
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const displayName = (body.display_name || '').trim();
  const countryCode = (body.country_code || '').trim().toUpperCase();
  const nickname = (body.nickname || '').trim();
  const phone = (body.phone || '').trim();
  const addressLine = (body.address_line || '').trim();
  const addressPlaceId = (body.address_place_id || '').trim();
  const publicId = (body.public_id || '').trim();
  const role = (body.role_application && normalizeRequestedRole(body.role_application.requested_role) === 'provider')
    ? 'provider' : 'guardian';

  if (!email) return err('email required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('invalid email');
  if (!password || password.length < 8) return err('password must be at least 8 characters');
  if (!displayName) return err('display_name required');
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return err('country_code must be ISO 3166-1 alpha-2');

  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first<{ id: string }>();
  if (existing?.id) return err('email already exists', 409);

  const country = await env.DB.prepare(`
    SELECT
      c.id as country_id,
      c.code as country_code,
      cur.code as default_currency_code
    FROM countries c
    LEFT JOIN country_currency_map ccm ON c.id = ccm.country_id AND ccm.is_default = true
    LEFT JOIN currencies cur ON ccm.currency_id = cur.id
    WHERE c.code = ? AND c.is_active = true
    LIMIT 1
  `).bind(countryCode).first<{ country_id: string; country_code: string; default_currency_code: string | null }>();
  if (!country?.country_id) return err('country not found', 404);

  const defaults = COUNTRY_DEFAULTS[countryCode] || { language: 'en', timezone: 'UTC' };
  const language = (body.language || defaults.language || 'en').trim();
  const timezone = (body.timezone || defaults.timezone || 'UTC').trim();
  const ts = now();
  const passwordHash = await hashPassword(password);

  const userId = newId();
  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(userId, email, passwordHash, role, ts, ts).run();

  await env.DB.prepare(
    `INSERT INTO user_profiles (
      id, user_id, handle, display_name, avatar_url, bio, bio_translations,
      country_id, language, timezone, interests, created_at, updated_at
    ) VALUES (?, ?, NULL, ?, NULL, NULL, '{}', ?, ?, ?, '[]', ?, ?)`
  ).bind(newId(), userId, displayName, country.country_id, language, timezone, ts, ts).run();

  await env.DB.prepare(
    `INSERT INTO user_account_details (
      id, user_id, full_name, nickname, phone,
      address_line, address_place_id, address_lat, address_lng, region_text,
      preferred_language, has_pets, pet_count, interested_pet_types,
      notifications_booking, notifications_health, marketing_opt_in,
      terms_agreed_at, public_profile, public_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    newId(),
    userId,
    displayName,
    nickname || null,
    phone || null,
    addressLine || null,
    addressPlaceId || null,
    body.address_lat ?? null,
    body.address_lng ?? null,
    countryCode,
    language,
    body.has_pets ? true : false,
    Math.max(0, Number(body.pet_count || 0)),
    JSON.stringify(asJsonArray(body.interested_pet_types)),
    body.notifications_booking !== false,
    body.notifications_health !== false,
    Boolean(body.marketing_opt_in),
    body.terms_agreed ? ts : null,
    Boolean(body.public_profile),
    publicId || null,
    ts,
    ts,
  ).run();

  if (body.role_application && normalizeRequestedRole(body.role_application.requested_role) === 'provider') {
    const applicationId = newId();
    const hasRoleAppPetTypeL1 = await hasColumn(env, 'role_applications', 'pet_type_l1_id');
    const hasRoleAppPetTypeL2 = await hasColumn(env, 'role_applications', 'pet_type_l2_id');
    const hasRoleAppBusinessL3 = await hasColumn(env, 'role_applications', 'business_category_l3_id');
    const roleAppColumns = [
      'id',
      'user_id',
      'requested_role',
      'business_category_l1_id',
      'business_category_l2_id',
      ...(hasRoleAppBusinessL3 ? ['business_category_l3_id'] : []),
      ...(hasRoleAppPetTypeL1 ? ['pet_type_l1_id'] : []),
      ...(hasRoleAppPetTypeL2 ? ['pet_type_l2_id'] : []),
      'status',
      'requested_at',
      'created_at',
      'updated_at',
    ];
    const roleAppValues = [
      '?',
      '?',
      "'provider'",
      '?',
      '?',
      ...(hasRoleAppBusinessL3 ? ['?'] : []),
      ...(hasRoleAppPetTypeL1 ? ['?'] : []),
      ...(hasRoleAppPetTypeL2 ? ['?'] : []),
      "'pending'",
      '?',
      '?',
      '?',
    ];
    const roleAppBindings: Array<string | number | null> = [
      applicationId,
      userId,
      body.role_application.business_category_l1_id ?? null,
      body.role_application.business_category_l2_id ?? null,
      ...(hasRoleAppBusinessL3 ? [body.role_application.business_category_l3_id ?? null] : []),
      ...(hasRoleAppPetTypeL1 ? [body.role_application.pet_type_l1_id ?? null] : []),
      ...(hasRoleAppPetTypeL2 ? [body.role_application.pet_type_l2_id ?? null] : []),
      ts,
      ts,
      ts,
    ];
    await env.DB.prepare(
      `INSERT INTO role_applications (${roleAppColumns.join(', ')})
       VALUES (${roleAppValues.join(', ')})`
    ).bind(...roleAppBindings).run();

    const hasProfilePetTypeL1 = await hasColumn(env, 'provider_profiles', 'pet_type_l1_id');
    const hasProfilePetTypeL2 = await hasColumn(env, 'provider_profiles', 'pet_type_l2_id');
    const hasProfileBusinessL3 = await hasColumn(env, 'provider_profiles', 'business_category_l3_id');
    const providerProfileColumns = [
      'id',
      'user_id',
      'business_category_l1_id',
      'business_category_l2_id',
      ...(hasProfileBusinessL3 ? ['business_category_l3_id'] : []),
      ...(hasProfilePetTypeL1 ? ['pet_type_l1_id'] : []),
      ...(hasProfilePetTypeL2 ? ['pet_type_l2_id'] : []),
      'business_registration_no',
      'operating_hours',
      'supported_pet_types',
      'certifications',
      'address_line',
      'address_place_id',
      'address_lat',
      'address_lng',
      'approval_status',
      'created_at',
      'updated_at',
    ];
    const providerProfileValues = [
      '?',
      '?',
      '?',
      '?',
      ...(hasProfileBusinessL3 ? ['?'] : []),
      ...(hasProfilePetTypeL1 ? ['?'] : []),
      ...(hasProfilePetTypeL2 ? ['?'] : []),
      '?',
      '?',
      '?',
      '?',
      '?',
      '?',
      '?',
      '?',
      "'pending'",
      '?',
      '?',
    ];
    // Columns to update on conflict (everything except id and user_id)
    const updateCols = providerProfileColumns.slice(2);
    const updateValues = providerProfileValues.slice(2);
    const onConflictSet = updateCols.map((col, i) => `${col} = ${updateValues[i]}`).join(', ');
    const providerProfileBindings: Array<string | number | boolean | null> = [
      newId(),
      userId,
      body.role_application.business_category_l1_id ?? null,
      body.role_application.business_category_l2_id ?? null,
      ...(hasProfileBusinessL3 ? [body.role_application.business_category_l3_id ?? null] : []),
      ...(hasProfilePetTypeL1 ? [body.role_application.pet_type_l1_id ?? null] : []),
      ...(hasProfilePetTypeL2 ? [body.role_application.pet_type_l2_id ?? null] : []),
      body.role_application.business_registration_no ?? null,
      body.role_application.operating_hours ?? null,
      JSON.stringify(asJsonArray(body.role_application.supported_pet_types)),
      JSON.stringify(asJsonArray(body.role_application.certifications)),
      (body.role_application.address_line ?? addressLine) || null,
      (body.role_application.address_place_id ?? addressPlaceId) || null,
      body.role_application.address_lat ?? body.address_lat ?? null,
      body.role_application.address_lng ?? body.address_lng ?? null,
      ts,
      ts,
    ];
    // Duplicate bindings for the ON CONFLICT SET clause
    const conflictBindings = providerProfileBindings.slice(2);
    await env.DB.prepare(
      `INSERT INTO provider_profiles (${providerProfileColumns.join(', ')})
       VALUES (${providerProfileValues.join(', ')})
       ON CONFLICT (user_id) DO UPDATE SET ${onConflictSet}`
    ).bind(...providerProfileBindings, ...conflictBindings).run();
  }

  const tokens = await issueTokens(userId, role, env.JWT_SECRET);
  return created({
    user_id: userId,
    role,
    ...tokens,
    onboarding: {
      country_code: country.country_code,
      default_language: language,
      default_currency_code: country.default_currency_code,
      profile_created: true,
    },
  });
}

// ─── test-login ───────────────────────────────────────────────────────────────

async function testLogin(request: Request, env: Env): Promise<Response> {
  let body: { email: string };
  try { body = await request.json() as { email: string }; }
  catch { return err('Invalid JSON body'); }

  const email = (body.email || '').trim().toLowerCase();
  if (!email) return err('email required');

  let user = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind(email).first<{ id: string; role: string }>();

  try {
    if (email === DEFAULT_SAMPLE_ACCOUNTS.guardian.email) {
      const normalized = await ensureDefaultSampleAccount(env, DEFAULT_SAMPLE_ACCOUNTS.guardian);
      user = normalized ? { id: normalized.id, role: normalized.role } : null;
    } else if (email === DEFAULT_SAMPLE_ACCOUNTS.provider.email) {
      const normalized = await ensureDefaultSampleAccount(env, DEFAULT_SAMPLE_ACCOUNTS.provider);
      user = normalized ? { id: normalized.id, role: normalized.role } : null;
    } else if (email === DEFAULT_SAMPLE_ACCOUNTS.admin.email) {
      const normalized = await ensureDefaultSampleAccount(env, DEFAULT_SAMPLE_ACCOUNTS.admin);
      user = normalized ? { id: normalized.id, role: normalized.role } : null;
    }
  } catch {
    // sample account bootstrap failed — fall through to normal lookup
  }
  if (!user) return err('account not found. please signup first', 404);

  const tokens = await issueTokens(user.id, user.role as JwtPayload['role'], env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, ...tokens });
}

async function ensureDefaultSampleAccount(
  env: Env,
  sample: { email: string; password: string; role: JwtPayload['role'] },
  existingUser?: UserRow | null,
): Promise<UserRow | null> {
  const existing = existingUser ?? await env.DB.prepare(
    'SELECT id, role, password_hash, status FROM users WHERE email = ?'
  ).bind(sample.email).first<UserRow>();

  // For provider sample: create as guardian (approval flow will promote to provider)
  const initialRole = sample.role === 'provider' ? 'guardian' as JwtPayload['role'] : sample.role;

  const ensuredBase = existing?.id
    ? { id: existing.id, role: existing.role }
    : await ensureMinimalSampleUser(env, sample.email, initialRole);
  if (!ensuredBase) return null;

  const passwordHash = await forceSamplePassword(env, ensuredBase.id, sample.password);
  const ts = now();

  if (sample.role === 'provider') {
    // Provider sample: don't force role — let approval flow manage it
    // But if user exists as 'provider' with no role_applications, reset to 'guardian'
    const anyApp = await env.DB.prepare(
      'SELECT id FROM role_applications WHERE user_id = ? LIMIT 1'
    ).bind(ensuredBase.id).first<{ id: string }>();

    let effectiveRole = ensuredBase.role;
    if (!anyApp) {
      // No applications exist: reset to guardian, create pending application + profile
      effectiveRole = 'guardian';
      await env.DB.prepare(
        'UPDATE users SET role = ?, status = ?, updated_at = ? WHERE id = ?'
      ).bind('guardian', 'active', ts, ensuredBase.id).run();
      await env.DB.prepare(
        `INSERT INTO role_applications (id, user_id, requested_role, status, requested_at, created_at, updated_at)
         VALUES (?, ?, 'provider', 'pending', ?, ?, ?)`
      ).bind(newId(), ensuredBase.id, ts, ts, ts).run();
      await env.DB.prepare(
        `INSERT INTO provider_profiles (id, user_id, approval_status, created_at, updated_at)
         VALUES (?, ?, 'pending', ?, ?)
         ON CONFLICT (user_id) DO UPDATE SET approval_status = 'pending', updated_at = ?`
      ).bind(newId(), ensuredBase.id, ts, ts, ts).run();
    } else {
      // Applications exist: keep current role (approved→provider, pending→guardian)
      await env.DB.prepare(
        'UPDATE users SET status = ?, updated_at = ? WHERE id = ?'
      ).bind('active', ts, ensuredBase.id).run();
    }

    return {
      id: ensuredBase.id,
      role: effectiveRole,
      password_hash: passwordHash,
      status: 'active',
    };
  }

  // Guardian/Admin: always force the role
  await env.DB.prepare(
    'UPDATE users SET role = ?, status = ?, updated_at = ? WHERE id = ?'
  ).bind(sample.role, 'active', ts, ensuredBase.id).run();

  return {
    id: ensuredBase.id,
    role: sample.role,
    password_hash: passwordHash,
    status: 'active',
  };
}

async function ensureMinimalSampleUser(
  env: Env,
  email: string,
  role: JwtPayload['role'],
): Promise<{ id: string; role: string } | null> {
  const ts = now();
  const existing = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind(email).first<{ id: string; role: string }>();
  const userId = existing?.id || newId();

  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, email, role, ts, ts).run();
  } else if (existing.role !== role) {
    await env.DB.prepare(
      'UPDATE users SET role = ?, updated_at = ? WHERE id = ?'
    ).bind(role, ts, userId).run();
  }

  return { id: userId, role };
}

async function ensureSamplePassword(env: Env, userId: string, password: string): Promise<string> {
  const existing = await env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ?'
  ).bind(userId).first<{ password_hash: string | null }>();
  if (existing?.password_hash) return existing.password_hash;
  const passwordHash = await hashPassword(password);
  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
  ).bind(passwordHash, now(), userId).run();
  return passwordHash;
}

async function forceSamplePassword(env: Env, userId: string, password: string): Promise<string> {
  const passwordHash = await hashPassword(password);
  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
  ).bind(passwordHash, now(), userId).run();
  return passwordHash;
}

async function ensureAdminSample(env: Env): Promise<{ id: string; role: string } | null> {
  const ts = now();
  const existing = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind(DEFAULT_SAMPLE_ACCOUNTS.admin.email).first<{ id: string; role: string }>();
  const userId = existing?.id || newId();

  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, DEFAULT_SAMPLE_ACCOUNTS.admin.email, 'admin', ts, ts).run();
  } else if (existing.role !== 'admin') {
    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').bind('admin', ts, userId).run();
  }

  return { id: userId, role: 'admin' };
}

async function ensureProviderSample(env: Env): Promise<{ id: string; role: string } | null> {
  const ts = now();
  const existing = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind('provider@petlife.com').first<{ id: string; role: string }>();
  const userId = existing?.id || newId();

  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, 'provider@petlife.com', 'provider', ts, ts).run();
  } else if (existing.role !== 'provider') {
    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').bind('provider', ts, userId).run();
  }

  return { id: userId, role: 'provider' };
}

async function ensureBangulGuardianSample(env: Env): Promise<{ id: string; role: string } | null> {
  const ts = now();
  const existing = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind('guardian@petlife.com').first<{ id: string; role: string }>();
  const userId = existing?.id || newId();

  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, 'guardian@petlife.com', 'guardian', ts, ts).run();
  } else if (existing.role !== 'guardian') {
    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').bind('guardian', ts, userId).run();
  }

  await env.DB.prepare(
    `INSERT INTO user_profiles (
      id, user_id, handle, display_name, avatar_url, bio, bio_translations,
      country_id, language, timezone, interests, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, '{}', NULL, 'ko', 'Asia/Seoul', '[]', ?, ?)
    ON CONFLICT DO NOTHING`
  ).bind(newId(), userId, null, 'PetMom', 'https://placehold.co/320x320?text=Bangul', 'Daily life with my pet', ts, ts).run();

  await env.DB.prepare(
    `UPDATE user_profiles
     SET display_name = COALESCE(display_name, 'PetMom'),
         avatar_url = COALESCE(avatar_url, 'https://placehold.co/320x320?text=Bangul'),
         bio = COALESCE(bio, 'Daily life with my pet'),
         updated_at = ?
     WHERE user_id = ?`
  ).bind(ts, userId).run();

  const normalizedPets = await hasColumn(env, 'pets', 'guardian_user_id');
  if (normalizedPets) {
    const pet = await env.DB.prepare(
      `SELECT id FROM pets
       WHERE guardian_user_id = ? AND name = 'Bangul' AND status != 'deleted'
       LIMIT 1`
    ).bind(userId).first<{ id: string }>();

    if (!pet) {
      const petId = newId();
      await env.DB.prepare(`
        INSERT INTO pets (
          id, guardian_user_id, name, microchip_number,
          pet_type_id, breed_id, gender_id, life_stage_id, body_size_id, country_id,
          diet_type_id, coat_length_id, coat_type_id, activity_level_id, health_level_id,
          gender_legacy, species_legacy, birth_date, weight_kg, is_neutered, avatar_url, status, created_at, updated_at
        ) VALUES (
          ?, ?, 'Bangul', 'BANGUL-0001',
          ?, ?, ?, NULL, NULL, NULL,
          NULL, NULL, NULL, NULL, NULL,
          'female', 'dog', '2021-03-15', 4.2, false, 'https://placehold.co/600x600?text=Bangul', 'active', ?, ?
        )
      `).bind(
        petId,
        userId,
        await findMasterItemId(env, 'dog'),
        await findMasterItemId(env, 'pomeranian'),
        await findMasterItemId(env, 'female'),
        ts,
        ts,
      ).run();
    }
  } else {
    const pet = await env.DB.prepare(
      `SELECT id FROM pets
       WHERE guardian_id = ? AND name = 'Bangul' AND status != 'deleted'
       LIMIT 1`
    ).bind(userId).first<{ id: string }>();

    if (!pet) {
      const petId = newId();
      await env.DB.prepare(`
        INSERT INTO pets (
          id, guardian_id, name, species, pet_type_id, breed_id, gender_id, neuter_status_id,
          life_stage_id, body_size_id, country_id, medication_status_id, weight_unit_id,
          health_condition_level_id, activity_level_id, diet_type_id, living_style_id,
          ownership_type_id, coat_length_id, coat_type_id, grooming_cycle_id,
          color_ids, allergy_ids, disease_history_ids, symptom_tag_ids, vaccination_ids,
          temperament_ids, notes, intro_text, birthday, birth_date, current_weight, weight_kg, microchip_no,
          avatar_url, is_neutered, status, created_at, updated_at
        ) VALUES (
          ?, ?, 'Bangul', 'dog', ?, ?, ?, NULL,
          NULL, NULL, NULL, NULL, ?,
          NULL, NULL, NULL, NULL,
          NULL, NULL, NULL, NULL,
          '[]', '[]', '[]', '[]', '[]',
          '[]', 'Sample pet data', 'Pomeranian Bangul', '2021-03-15', '2021-03-15', 4.2, 4.2, 'BANGUL-0001',
          'https://placehold.co/600x600?text=Bangul', false, 'active', ?, ?
        )
      `).bind(
        petId,
        userId,
        await findMasterItemId(env, 'dog'),
        await findMasterItemId(env, 'pomeranian'),
        await findMasterItemId(env, 'female'),
        await findMasterItemId(env, 'kg'),
        ts,
        ts,
      ).run();
    }
  }

  return { id: userId, role: 'guardian' };
}

async function findMasterItemId(env: Env, key: string): Promise<string | null> {
  try {
    const rowByKey = await env.DB.prepare('SELECT id FROM master_items WHERE key = ? LIMIT 1').bind(key).first<{ id: string }>();
    if (rowByKey?.id) return rowByKey.id;
  } catch {
    // key column may not exist on normalized schema
  }
  try {
    const rowByCode = await env.DB.prepare('SELECT id FROM master_items WHERE code = ? LIMIT 1').bind(key).first<{ id: string }>();
    if (rowByCode?.id) return rowByCode.id;
  } catch {
    // code column may not exist on legacy schema
  }
  return null;
}

// ─── refresh ──────────────────────────────────────────────────────────────────

async function refreshToken(request: Request, env: Env): Promise<Response> {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;
  const payload = result as JwtPayload;
  const tokens = await issueTokens(payload.sub, payload.role, env.JWT_SECRET);
  return ok(tokens);
}
