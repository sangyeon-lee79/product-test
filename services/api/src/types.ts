// LLD §1 기술 스택 / §6.1 JWT 구조 기반 Env + 공용 타입

export interface Env {
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
  JWT_SECRET: string;
  DB: D1Database;   // Cloudflare D1 (로컬 개발) / 배포 시 Hyperdrive 전환
  // R2: R2Bucket;  // S5 이후 스토리지 연결 시 주석 해제
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
