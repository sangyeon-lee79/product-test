// S5: 인증 API — LLD §5.2, §6
// POST /api/v1/auth/test-login   — 테스트 로그인 (이메일 기반 role 조회)
// POST /api/v1/auth/signup       — 회원가입 + 즉시 JWT 발급
// POST /api/v1/auth/refresh      — 토큰 갱신

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, issueTokens } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────

export async function handleAuth(request: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.replace('/api/v1/auth', '');

  if (sub === '/test-login' && request.method === 'POST') return testLogin(request, env);
  if (sub === '/signup' && request.method === 'POST') return signup(request, env);
  if (sub === '/refresh' && request.method === 'POST') return refreshToken(request, env);

  return err('Not found', 404);
}

type SignupBody = {
  email: string;
  role?: string;
  display_name?: string;
  country_code?: string;
  language?: string;
  timezone?: string;
};

const COUNTRY_DEFAULTS: Record<string, { language: string; timezone: string }> = {
  KR: { language: 'ko', timezone: 'Asia/Seoul' },
  US: { language: 'en', timezone: 'America/New_York' },
  JP: { language: 'ja', timezone: 'Asia/Tokyo' },
  VN: { language: 'vi', timezone: 'Asia/Ho_Chi_Minh' },
  ID: { language: 'id_lang', timezone: 'Asia/Jakarta' },
  TH: { language: 'th', timezone: 'Asia/Bangkok' },
  CN: { language: 'zh_cn', timezone: 'Asia/Shanghai' },
  TW: { language: 'zh_tw', timezone: 'Asia/Taipei' },
};

function normalizeSignupRole(raw?: string): JwtPayload['role'] {
  const role = (raw || 'guardian').toLowerCase();
  if (role === 'supplier') return 'provider';
  if (role === 'general') return 'guardian';
  if (role === 'provider' || role === 'admin' || role === 'guardian') return role;
  return 'guardian';
}

async function signup(request: Request, env: Env): Promise<Response> {
  let body: SignupBody;
  try {
    body = await request.json() as SignupBody;
  } catch {
    return err('Invalid JSON body');
  }

  const email = (body.email || '').trim().toLowerCase();
  const displayName = (body.display_name || '').trim();
  const countryCode = (body.country_code || '').trim().toUpperCase();
  const role = normalizeSignupRole(body.role);

  if (!email) return err('email required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('invalid email');
  if (!displayName) return err('display_name required');
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return err('country_code must be ISO 3166-1 alpha-2');
  if (role === 'admin') return err('admin signup is not allowed', 403);

  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first<{ id: string }>();
  if (existing?.id) return err('email already exists', 409);

  const country = await env.DB.prepare(`
    SELECT
      c.id as country_id,
      c.code as country_code,
      cur.code as default_currency_code
    FROM countries c
    LEFT JOIN country_currency_map ccm ON c.id = ccm.country_id AND ccm.is_default = 1
    LEFT JOIN currencies cur ON ccm.currency_id = cur.id
    WHERE c.code = ? AND c.is_active = 1
    LIMIT 1
  `).bind(countryCode).first<{ country_id: string; country_code: string; default_currency_code: string | null }>();
  if (!country?.country_id) return err('country not found', 404);

  const defaults = COUNTRY_DEFAULTS[countryCode] || { language: 'en', timezone: 'UTC' };
  const language = (body.language || defaults.language || 'en').trim();
  const timezone = (body.timezone || defaults.timezone || 'UTC').trim();
  const ts = now();

  const userId = newId();
  await env.DB.prepare(
    'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId, email, role, ts, ts).run();

  if (role === 'guardian') {
    await env.DB.prepare(
      `INSERT INTO user_profiles (
        id, user_id, handle, display_name, avatar_url, bio, bio_translations,
        country_id, language, timezone, interests, created_at, updated_at
      ) VALUES (?, ?, NULL, ?, NULL, NULL, '{}', ?, ?, ?, '[]', ?, ?)`
    ).bind(newId(), userId, displayName, country.country_id, language, timezone, ts, ts).run();
  }

  const tokens = await issueTokens(userId, role, env.JWT_SECRET);
  return created({
    user_id: userId,
    role,
    ...tokens,
    onboarding: {
      country_code: country.country_code,
      default_language: language,
      default_currency_code: country.default_currency_code,
      profile_created: role === 'guardian',
    },
  });
}

// ─── test-login ───────────────────────────────────────────────────────────────

async function testLogin(request: Request, env: Env): Promise<Response> {
  let body: { email: string };
  try { body = await request.json() as { email: string }; }
  catch { return err('Invalid JSON body'); }

  const email = (body.email || '').trim().toLowerCase();
  if (!email) return err('email required');

  let user = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind(email).first<{ id: string; role: string }>();

  if (!user) {
    if (email === 'guardian@petlife.com') {
      user = await ensureBangulGuardianSample(env);
    }

    // Admin 계정은 공개 signup이 없으므로 내부 계정 부트스트랩 허용.
    if (!user && email === 'admin@petlife.com') {
      const id = newId();
      const ts = now();
      await env.DB.prepare(
        'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, email, 'admin', ts, ts).run();
      user = { id, role: 'admin' };
    } else {
      if (!user) return err('account not found. please signup first', 404);
    }
  }

  const tokens = await issueTokens(user.id, user.role as JwtPayload['role'], env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, ...tokens });
}

async function ensureBangulGuardianSample(env: Env): Promise<{ id: string; role: string } | null> {
  const ts = now();
  const existing = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind('guardian@petlife.com').first<{ id: string; role: string }>();
  const userId = existing?.id || newId();

  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, 'guardian@petlife.com', 'guardian', ts, ts).run();
  } else if (existing.role !== 'guardian') {
    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').bind('guardian', ts, userId).run();
  }

  await env.DB.prepare(
    `INSERT OR IGNORE INTO user_profiles (
      id, user_id, handle, display_name, avatar_url, bio, bio_translations,
      country_id, language, timezone, interests, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, '{}', NULL, 'ko', 'Asia/Seoul', '[]', ?, ?)`
  ).bind(newId(), userId, null, '방울맘', 'https://placehold.co/320x320?text=Bangul', '방울이와 함께하는 일상 기록', ts, ts).run();

  await env.DB.prepare(
    `UPDATE user_profiles
     SET display_name = COALESCE(display_name, '방울맘'),
         avatar_url = COALESCE(avatar_url, 'https://placehold.co/320x320?text=Bangul'),
         bio = COALESCE(bio, '방울이와 함께하는 일상 기록'),
         updated_at = ?
     WHERE user_id = ?`
  ).bind(ts, userId).run();

  const pet = await env.DB.prepare(
    `SELECT id FROM pets
     WHERE guardian_id = ? AND name = '방울' AND status != 'deleted'
     LIMIT 1`
  ).bind(userId).first<{ id: string }>();

  if (!pet) {
    const petId = newId();
    await env.DB.prepare(`
      INSERT INTO pets (
        id, guardian_id, name, species, pet_type_id, breed_id, gender_id, neuter_status_id,
        life_stage_id, body_size_id, country_id, medication_status_id, weight_unit_id,
        health_condition_level_id, activity_level_id, diet_type_id, living_style_id,
        ownership_type_id, coat_length_id, coat_type_id, grooming_cycle_id,
        color_ids, allergy_ids, disease_history_ids, symptom_tag_ids, vaccination_ids,
        temperament_ids, notes, intro_text, birthday, birth_date, current_weight, weight_kg, microchip_no,
        avatar_url, is_neutered, status, created_at, updated_at
      ) VALUES (
        ?, ?, '방울', 'dog', ?, ?, ?, NULL,
        NULL, NULL, NULL, NULL, ?,
        NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL,
        '[]', '[]', '[]', '[]', '[]',
        '[]', '샘플 반려동물 데이터', '포메라니안 방울이', '2021-03-15', '2021-03-15', 4.2, 4.2, 'BANGUL-0001',
        'https://placehold.co/600x600?text=Bangul', 0, 'active', ?, ?
      )
    `).bind(
      petId,
      userId,
      await findMasterItemId(env, 'dog'),
      await findMasterItemId(env, 'pomeranian'),
      await findMasterItemId(env, 'female'),
      await findMasterItemId(env, 'kg'),
      ts,
      ts,
    ).run();
  }

  return { id: userId, role: 'guardian' };
}

async function findMasterItemId(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare('SELECT id FROM master_items WHERE key = ? LIMIT 1').bind(key).first<{ id: string }>();
  return row?.id ?? null;
}

// ─── refresh ──────────────────────────────────────────────────────────────────

async function refreshToken(request: Request, env: Env): Promise<Response> {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;
  const payload = result as JwtPayload;
  const tokens = await issueTokens(payload.sub, payload.role, env.JWT_SECRET);
  return ok(tokens);
}
