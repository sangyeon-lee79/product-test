// S5: R2 스토리지 API — LLD §5.3, §8
// GET /api/v1/storage/presigned-url?type=&ext=   JWT 인증 필요
// PUT /api/v1/storage/upload?key=&token=         HMAC 토큰 인증
// GET /api/v1/storage/file/*                     로컬 개발용 R2 파일 서빙

import type { Env } from '../types';
import { ok, err, newId } from '../types';
import { requireAuth } from '../middleware/auth';

// LLD §8.1 — type → R2 경로 프리픽스
const TYPE_PATHS: Record<string, string> = {
  user_avatar:      'avatars/users',
  pet_avatar:       'avatars/pets',
  log_media:        'logs',
  feed_media:       'feeds',
  completion_photo: 'completions',
  store_photo:      'stores',
  service_photo:    'services',
};

// ─────────────────────────────────────────────────────────────────────────────

export async function handleStorage(request: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.replace('/api/v1/storage', '');

  // GET /presigned-url — JWT 인증 후 업로드 토큰 발급
  if (sub === '/presigned-url' && request.method === 'GET') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    return getPresignedUrl(request, env, url);
  }

  // PUT /upload — HMAC 토큰 검증 후 R2에 저장
  if (sub === '/upload' && request.method === 'PUT') {
    return uploadFile(request, env, url);
  }

  // GET /file/* — 로컬 개발용 R2 파일 서빙
  if (sub.startsWith('/file/') && request.method === 'GET') {
    return serveFile(env, sub.slice('/file/'.length));
  }

  return err('Not found', 404);
}

// ─── Presigned URL 발급 ────────────────────────────────────────────────────

async function getPresignedUrl(request: Request, env: Env, url: URL): Promise<Response> {
  const type = url.searchParams.get('type') ?? '';
  const ext  = (url.searchParams.get('ext') ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const subdirRaw = (url.searchParams.get('subdir') ?? '').trim();

  if (!TYPE_PATHS[type]) {
    return err(`type must be one of: ${Object.keys(TYPE_PATHS).join(', ')}`);
  }

  const safeSubdir = subdirRaw
    .split('/')
    .map((part) => part.trim().replace(/[^a-zA-Z0-9_-]/g, ''))
    .filter(Boolean)
    .slice(0, 5)
    .join('/');
  const keyPrefix = safeSubdir ? `${TYPE_PATHS[type]}/${safeSubdir}` : TYPE_PATHS[type];
  const file_key = `${keyPrefix}/${newId()}.${ext}`;
  const expires  = Math.floor(Date.now() / 1000) + 300;
  const token    = await makeUploadToken(file_key, expires, env.JWT_SECRET);

  const origin     = new URL(request.url);
  const baseOrigin = `${origin.protocol}//${origin.host}`;
  const upload_url = `${baseOrigin}/api/v1/storage/upload?key=${encodeURIComponent(file_key)}&token=${encodeURIComponent(token)}`;
  const public_url = env.R2_PUBLIC_URL
    ? `${env.R2_PUBLIC_URL}/${file_key}`
    : `${baseOrigin}/api/v1/storage/file/${file_key}`;

  return ok({ upload_url, file_key, public_url, expires_in: 300 });
}

// ─── 파일 업로드 ───────────────────────────────────────────────────────────

async function uploadFile(request: Request, env: Env, url: URL): Promise<Response> {
  if (!env.R2) return err('Storage not configured — R2 binding missing', 503, 'no_r2');

  const key   = url.searchParams.get('key');
  const token = url.searchParams.get('token');
  if (!key || !token) return err('key and token required');

  // 토큰 검증
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) return err('Invalid token', 401, 'invalid_token');

  const payloadB64 = token.slice(0, dotIdx);
  let payload: string;
  try {
    payload = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return err('Invalid token', 401, 'invalid_token');
  }

  // payload = "{file_key}:{expires}"
  const lastColon = payload.lastIndexOf(':');
  const tokenKey  = payload.slice(0, lastColon);
  const expires   = parseInt(payload.slice(lastColon + 1));

  if (tokenKey !== key)                                         return err('Token key mismatch', 401, 'invalid_token');
  if (isNaN(expires) || expires < Math.floor(Date.now() / 1000)) return err('Token expired', 401, 'token_expired');

  const expected = await makeUploadToken(tokenKey, expires, env.JWT_SECRET);
  if (expected !== token) return err('Invalid token signature', 401, 'invalid_token');

  // R2에 저장
  const body        = await request.arrayBuffer();
  const contentType = request.headers.get('Content-Type') ?? 'application/octet-stream';
  await env.R2.put(key, body, { httpMetadata: { contentType } });

  const origin     = new URL(request.url);
  const baseOrigin = `${origin.protocol}//${origin.host}`;
  const public_url = env.R2_PUBLIC_URL
    ? `${env.R2_PUBLIC_URL}/${key}`
    : `${baseOrigin}/api/v1/storage/file/${key}`;

  return ok({ file_key: key, public_url });
}

// ─── 로컬 개발용 파일 서빙 ────────────────────────────────────────────────

async function serveFile(env: Env, key: string): Promise<Response> {
  if (!env.R2) return err('Storage not configured', 503, 'no_r2');
  const obj = await env.R2.get(key);
  if (!obj) return err('Not found', 404);

  const headers = new Headers();
  if (obj.httpMetadata?.contentType) headers.set('Content-Type', obj.httpMetadata.contentType);
  headers.set('Cache-Control', 'public, max-age=86400');
  return new Response(obj.body, { headers });
}

// ─── HMAC-SHA256 업로드 토큰 생성 ────────────────────────────────────────
// 형식: {base64url(file_key:expires)}.{base64url(HMAC_SHA256(file_key:expires))}

async function makeUploadToken(fileKey: string, expires: number, secret: string): Promise<string> {
  const payload    = `${fileKey}:${expires}`;
  const payloadB64 = toB64url(new TextEncoder().encode(payload));

  const cryptoKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(payload));
  const sigB64 = toB64url(new Uint8Array(sigBuf));

  return `${payloadB64}.${sigB64}`;
}

function toB64url(data: Uint8Array | ArrayBuffer): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
