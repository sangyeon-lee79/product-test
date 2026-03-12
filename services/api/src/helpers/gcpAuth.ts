// GCP OAuth2 JWT signing utilities — shared between i18n (Translate) and push (FCM)

import type { Env } from '../types';

const GOOGLE_TOKEN_AUDIENCE = 'https://oauth2.googleapis.com/token';

let tokenCache: { key: string; token: string; expiresAt: number } | null = null;

export function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlEncodeJson(value: unknown): string {
  const json = JSON.stringify(value);
  return base64UrlEncodeBytes(new TextEncoder().encode(json));
}

export function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, '\n').trim();
}

/**
 * Get a Google Cloud access token using service account JWT assertion.
 * Tokens are cached at module-level per (email+scope) pair until 30s before expiry.
 */
export async function getGcpAccessToken(
  email: string,
  privateKey: string,
  scope: string,
): Promise<string> {
  if (!email || !privateKey) {
    throw new Error('GCP service account credentials are not configured');
  }

  const cacheKey = `${email}:${scope}`;
  const nowSec = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.key === cacheKey && tokenCache.expiresAt > nowSec + 30) {
    return tokenCache.token;
  }

  const privateKeyPem = normalizePrivateKey(privateKey);
  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const payload = {
    iss: email,
    scope,
    aud: GOOGLE_TOKEN_AUDIENCE,
    iat: nowSec,
    exp: nowSec + 3600,
  };
  const header = { alg: 'RS256', typ: 'JWT' };
  const unsigned = `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}`;
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
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description || tokenJson.error || `Google OAuth HTTP ${tokenResponse.status}`);
  }

  const expiresIn = tokenJson.expires_in ?? 3600;
  tokenCache = {
    key: cacheKey,
    token: tokenJson.access_token,
    expiresAt: nowSec + expiresIn,
  };
  return tokenJson.access_token;
}
