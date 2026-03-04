// S0-3 검증: GET /api/v1/health
// 모든 클라이언트(Admin Web, Guardian Web, Mobile)에서 통신 확인용

import { ok } from '../types';
import type { Env } from '../types';

export async function handleHealth(_request: Request, env: Env): Promise<Response> {
  let dbStatus = 'connected';
  try {
    await env.DB.prepare('SELECT 1').first();
  } catch {
    dbStatus = 'error';
  }
  return ok({
    status: 'ok',
    environment: env.ENVIRONMENT,
    version: '0.2.0',
    timestamp: new Date().toISOString(),
    services: { db: dbStatus, r2: 'not_connected' },
  });
}
