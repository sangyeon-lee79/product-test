// LLD §6.1 JWT 인증 미들웨어 + §6.2 Role Guard
// S5에서 실제 JWT 검증 구현. 현재는 헤더 파싱 구조만 확립.

import { err } from '../types';
import type { Env, JwtPayload } from '../types';

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload> {
  // Workers의 Web Crypto API로 HS256 검증
  const [headerB64, payloadB64, sigB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error('invalid_token');

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['verify']
  );

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!valid) throw new Error('invalid_signature');

  const payload = JSON.parse(atob(payloadB64)) as JwtPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('token_expired');

  return payload;
}

// JWT 검증 미들웨어 — 유효하면 payload 반환, 실패 시 Response 반환
export async function requireAuth(
  request: Request,
  env: Env
): Promise<JwtPayload | Response> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return err('Unauthorized', 401, 'missing_token');

  const token = auth.slice(7);
  try {
    return await verifyJwt(token, env.JWT_SECRET);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'invalid_token';
    return err(msg === 'token_expired' ? 'Token expired' : 'Invalid token', 401, msg);
  }
}

// LLD §6.2 Role Guard — 허용 role이 아니면 403
export function requireRole(
  payload: JwtPayload,
  roles: JwtPayload['role'][]
): Response | null {
  if (!roles.includes(payload.role)) {
    return err('Forbidden', 403, 'insufficient_role');
  }
  return null;
}

// JWT 서명 (HS256)
export async function signJwt(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${header}.${body}.${sig}`;
}

// Access Token (1h) + Refresh Token (7d) 발급
export async function issueTokens(
  userId: string,
  role: JwtPayload['role'],
  secret: string,
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const [access_token, refresh_token] = await Promise.all([
    signJwt({ sub: userId, role }, secret, 3600),
    signJwt({ sub: userId, role }, secret, 7 * 24 * 3600),
  ]);
  return { access_token, refresh_token, expires_in: 3600 };
}
