// S6: Guardian 프로필 API — LLD §5.4
// GET  /api/v1/guardians/me            내 프로필 조회
// PUT  /api/v1/guardians/me            프로필 생성/수정 (upsert)
// GET  /api/v1/guardians/check-handle  핸들 중복 확인

import type { Env, JwtPayload } from '../types';
import { ok, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────

export async function handleGuardians(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const payload = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/guardians', '');

  if (sub === '/me' && request.method === 'GET')  return getMe(env, payload);
  if (sub === '/me' && request.method === 'PUT')  return updateMe(request, env, payload);
  if (sub === '/check-handle' && request.method === 'GET') return checkHandle(env, url);

  return err('Not found', 404);
}

// ─── GET /me ──────────────────────────────────────────────────────────────────

async function getMe(env: Env, payload: JwtPayload): Promise<Response> {
  const profile = await env.DB.prepare(`
    SELECT up.*,
           u.email, u.oauth_provider, u.created_at AS user_created_at,
           uad.phone, uad.full_name
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    LEFT JOIN user_account_details uad ON uad.user_id = up.user_id
    WHERE up.user_id = ?
  `).bind(payload.sub).first<Record<string, unknown>>();

  if (!profile) {
    // user_profiles가 없어도 users 기본 정보는 반환
    const user = await env.DB.prepare(`
      SELECT u.id AS user_id, u.email, u.oauth_provider, u.created_at AS user_created_at,
             uad.phone, uad.full_name
      FROM users u
      LEFT JOIN user_account_details uad ON uad.user_id = u.id
      WHERE u.id = ?
    `).bind(payload.sub).first<Record<string, unknown>>();
    if (!user) return ok({ profile: null });
    return ok({ profile: user });
  }

  return ok({ profile: normalizeProfile(profile) });
}

// ─── PUT /me (upsert) ─────────────────────────────────────────────────────────

async function updateMe(request: Request, env: Env, payload: JwtPayload): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return err('Invalid JSON body'); }

  // 핸들 중복 검사 (다른 유저가 사용 중인지)
  if (body.handle) {
    const conflict = await env.DB.prepare(
      'SELECT id FROM user_profiles WHERE handle = ? AND user_id != ?'
    ).bind(body.handle, payload.sub).first();
    if (conflict) return err('Handle already taken', 409, 'handle_taken');
  }

  const existing = await env.DB.prepare(
    'SELECT id FROM user_profiles WHERE user_id = ?'
  ).bind(payload.sub).first<{ id: string }>();

  const bioTranslations = JSON.stringify(body.bio_translations ?? {});
  const interests       = JSON.stringify(body.interests ?? []);

  if (existing) {
    await env.DB.prepare(`
      UPDATE user_profiles
      SET handle = ?, display_name = ?, bio = ?, bio_translations = ?,
          country_id = ?, language = ?, timezone = ?, interests = ?,
          avatar_url = ?, updated_at = ?
      WHERE user_id = ?
    `).bind(
      body.handle ?? null,
      body.display_name ?? null,
      body.bio ?? null,
      bioTranslations,
      body.country_id ?? null,
      body.language ?? 'ko',
      body.timezone ?? 'Asia/Seoul',
      interests,
      body.avatar_url ?? null,
      now(),
      payload.sub,
    ).run();
  } else {
    await env.DB.prepare(`
      INSERT INTO user_profiles
        (id, user_id, handle, display_name, bio, bio_translations,
         country_id, language, timezone, interests, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      newId(),
      payload.sub,
      body.handle ?? null,
      body.display_name ?? null,
      body.bio ?? null,
      bioTranslations,
      body.country_id ?? null,
      body.language ?? 'ko',
      body.timezone ?? 'Asia/Seoul',
      interests,
      body.avatar_url ?? null,
      now(),
      now(),
    ).run();
  }

  // phone → user_account_details (upsert)
  if (body.phone !== undefined) {
    const uad = await env.DB.prepare(
      'SELECT id FROM user_account_details WHERE user_id = ?'
    ).bind(payload.sub).first<{ id: string }>();
    if (uad) {
      await env.DB.prepare(
        'UPDATE user_account_details SET phone = ?, updated_at = ? WHERE user_id = ?'
      ).bind(body.phone ?? null, now(), payload.sub).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO user_account_details (id, user_id, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(newId(), payload.sub, body.phone ?? null, now(), now()).run();
    }
  }

  return getMe(env, payload);
}

// ─── GET /check-handle ────────────────────────────────────────────────────────

async function checkHandle(env: Env, url: URL): Promise<Response> {
  const handle = url.searchParams.get('handle');
  if (!handle) return err('handle query param required');
  if (!/^[a-z0-9_]{3,30}$/.test(handle)) {
    return ok({ available: false, reason: 'format' }); // 소문자/숫자/언더스코어 3~30자
  }
  const existing = await env.DB.prepare(
    'SELECT id FROM user_profiles WHERE handle = ?'
  ).bind(handle).first();
  return ok({ available: !existing });
}

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function normalizeProfile(row: Record<string, unknown>) {
  return {
    ...row,
    bio_translations: parseJson(row.bio_translations as string, {}),
    interests:        parseJson(row.interests as string, []),
  };
}

function parseJson<T>(val: string | null | undefined, fallback: T): T {
  try { return val ? (JSON.parse(val) as T) : fallback; }
  catch { return fallback; }
}
