// LLD §6.3 CORS 미들웨어
// ALLOWED_ORIGINS env var에서 화이트리스트를 읽음

import type { Env } from '../types';

function parseOrigin(origin: string): URL | null {
  try {
    return new URL(origin);
  } catch {
    return null;
  }
}

function isAllowedOrigin(origin: string, pattern: string): boolean {
  const trimmedPattern = pattern.trim();
  if (!trimmedPattern) return false;
  if (!origin) return false;

  // Exact origin match (includes protocol/host/port)
  if (trimmedPattern.includes('://')) {
    return origin === trimmedPattern;
  }

  // Wildcard host suffix match: *.example.com
  if (trimmedPattern.startsWith('*.')) {
    const originUrl = parseOrigin(origin);
    if (!originUrl) return false;
    const hostPattern = trimmedPattern.slice(2).toLowerCase();
    const hostname = originUrl.hostname.toLowerCase();
    return hostname === hostPattern || hostname.endsWith(`.${hostPattern}`);
  }

  // Plain hostname pattern
  const originUrl = parseOrigin(origin);
  if (!originUrl) return false;
  return originUrl.hostname.toLowerCase() === trimmedPattern.toLowerCase();
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  let isAllowed = false;
  try {
    const raw = env.ALLOWED_ORIGINS || '';
    const allowed = raw.split(',').map((o) => o.trim()).filter(Boolean);
    isAllowed = allowed.some((pattern) => isAllowedOrigin(origin, pattern));
  } catch { /* env.ALLOWED_ORIGINS missing or malformed — deny */ }

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Vary': 'Origin',
  };
}

export function handleCors(request: Request, env: Env): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }
  return null;
}
