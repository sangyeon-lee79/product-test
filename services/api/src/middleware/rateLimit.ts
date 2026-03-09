// LLD §6.3 Rate Limit 미들웨어 (IP 기반 + KV 분산)
// Fixed-window: 100 req / 60s per IP. Key: rl:{ip}:{window}, TTL: 65s.
import type { Env } from '../types';

export interface RateLimitOptions {
  limit?: number;   // 요청 횟수 한도 (default: 100)
  window?: number;  // 시간 윈도우 초 (default: 60)
}

export function getRealIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export async function checkRateLimit(request: Request, env?: Env, opts?: RateLimitOptions): Promise<boolean> {
  if (!env?.RATE_LIMIT_KV) return true; // KV 없으면 통과 (로컬 개발)

  const limit = opts?.limit ?? 100;
  const window = opts?.window ?? 60;
  const ip = getRealIp(request);
  const windowKey = Math.floor(Date.now() / (window * 1000));
  const key = `rl:${ip}:${windowKey}`;

  try {
    const raw = await env.RATE_LIMIT_KV.get(key);
    const count = raw ? parseInt(raw, 10) : 0;
    if (count >= limit) return false;

    // increment — TTL = window + 5s buffer
    await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: window + 5 });
    return true;
  } catch {
    return true; // KV 오류 시 통과 (서비스 중단 방지)
  }
}
