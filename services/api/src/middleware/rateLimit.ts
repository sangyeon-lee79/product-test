// LLD §6.3 Rate Limit 미들웨어 (IP 기반)
// Cloudflare Workers는 KV를 이용한 분산 rate limit이 이상적이나
// S5 Auth 이후 KV 바인딩 추가 예정. 현재는 요청 IP 체크만.

export interface RateLimitOptions {
  limit?: number;   // 요청 횟수 한도 (미래 확장용)
  window?: number;  // 시간 윈도우 초 (미래 확장용)
}

export function getRealIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

// 추후 KV 바인딩 연결 시 실제 rate limit 구현 예정
export function checkRateLimit(_request: Request, _opts?: RateLimitOptions): boolean {
  // TODO: S5 이후 KV 기반 구현
  return true; // 현재는 통과
}
