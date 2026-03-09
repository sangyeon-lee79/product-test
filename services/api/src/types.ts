// LLD §1 기술 스택 / §6.1 JWT 구조 기반 Env + 공용 타입

export interface Env {
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
  JWT_SECRET: string;
  GOOGLE_TRANSLATE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_TRANSLATE_SERVICE_ACCOUNT_PRIVATE_KEY?: string;
  GOOGLE_TRANSLATE_RPM_LIMIT?: string;
  GOOGLE_TRANSLATE_DAILY_CHAR_LIMIT?: string;
  R2_PUBLIC_URL: string;  // R2 퍼블릭 URL (빈 문자열이면 로컬 서빙 fallback)
  PLATFORM_NAME?: string;
  PLATFORM_TAGLINE?: string;
  DB: D1Database;         // Cloudflare D1 (로컬 개발) / 배포 시 Hyperdrive 전환
  R2: R2Bucket;           // Cloudflare R2 미디어 스토리지 (LLD §8)
  RATE_LIMIT_KV?: KVNamespace; // Cloudflare KV — IP 기반 rate limiting
}

// LLD §6.1 JWT Payload
export interface JwtPayload {
  sub: string;   // user UUID
  role: 'guardian' | 'provider' | 'admin';
  iat: number;
  exp: number;
}

// API 응답 공통 타입
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export function ok<T>(data: T): Response {
  return Response.json({ success: true, data } satisfies ApiResponse<T>, { status: 200 });
}

export function created<T>(data: T): Response {
  return Response.json({ success: true, data } satisfies ApiResponse<T>, { status: 201 });
}

export function err(message: string, status = 400, code?: string): Response {
  return Response.json({ success: false, error: message, code } satisfies ApiResponse, { status });
}

// UUID 생성 헬퍼
export function newId(): string {
  return crypto.randomUUID();
}

// 현재 타임스탬프 ISO 문자열
export function now(): string {
  return new Date().toISOString();
}

// 랜덤 토큰 생성 (키 자동생성 용도)
export function randomToken(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length];
  return out;
}
