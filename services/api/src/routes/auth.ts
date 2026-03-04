// S5: 인증 API — LLD §5.2, §6
// POST /api/v1/auth/test-login   — 테스트 계정 즉시 JWT 발급
// POST /api/v1/auth/refresh      — 토큰 갱신

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, issueTokens } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────

export async function handleAuth(request: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.replace('/api/v1/auth', '');

  if (sub === '/test-login' && request.method === 'POST') return testLogin(request, env);
  if (sub === '/refresh' && request.method === 'POST') return refreshToken(request, env);

  return err('Not found', 404);
}

// ─── test-login ───────────────────────────────────────────────────────────────

async function testLogin(request: Request, env: Env): Promise<Response> {
  let body: { email: string; role?: string };
  try { body = await request.json() as { email: string; role?: string }; }
  catch { return err('Invalid JSON body'); }

  const { email, role = 'guardian' } = body;
  if (!email) return err('email required');

  const validRole = (['guardian', 'provider', 'admin'] as const).includes(role as JwtPayload['role'])
    ? (role as JwtPayload['role']) : 'guardian';

  let user = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind(email).first<{ id: string; role: string }>();

  if (!user) {
    const id = newId();
    await env.DB.prepare(
      'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, email, validRole, now(), now()).run();
    user = { id, role: validRole };
  }

  const tokens = await issueTokens(user.id, user.role as JwtPayload['role'], env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, ...tokens });
}

// ─── refresh ──────────────────────────────────────────────────────────────────

async function refreshToken(request: Request, env: Env): Promise<Response> {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;
  const payload = result as JwtPayload;
  const tokens = await issueTokens(payload.sub, payload.role, env.JWT_SECRET);
  return ok(tokens);
}
