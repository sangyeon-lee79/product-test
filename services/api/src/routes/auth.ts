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

  if (sub === '/login' && request.method === 'POST') return passwordLogin(request, env);
  if (sub === '/test-login' && request.method === 'POST') return testLogin(request, env);
  if (sub === '/signup' && request.method === 'POST') return signup(request, env);
  if (sub === '/refresh' && request.method === 'POST') return refreshToken(request, env);

  return err('Not found', 404);
}

type SignupBody = {
  email: string;
  password?: string;
  display_name?: string;
  nickname?: string;
  phone?: string;
  address_line?: string;
  address_place_id?: string;
  address_lat?: number;
  address_lng?: number;
  country_code?: string;
  language?: string;
  timezone?: string;
  has_pets?: boolean;
  pet_count?: number;
  interested_pet_types?: string[];
  notifications_booking?: boolean;
  notifications_health?: boolean;
  marketing_opt_in?: boolean;
  terms_agreed?: boolean;
  public_profile?: boolean;
  public_id?: string;
  role_application?: {
    requested_role?: string;
    business_category_l1_id?: string | null;
    business_category_l2_id?: string | null;
    business_registration_no?: string | null;
    operating_hours?: string | null;
    certifications?: string[] | null;
    supported_pet_types?: string[] | null;
    address_line?: string | null;
    address_place_id?: string | null;
    address_lat?: number | null;
    address_lng?: number | null;
  };
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

type PasswordLoginBody = {
  email?: string;
  password?: string;
};

function normalizeRequestedRole(raw?: string): JwtPayload['role'] {
  const role = (raw || 'provider').toLowerCase();
  if (role === 'supplier') return 'provider';
  if (role === 'provider' || role === 'guardian' || role === 'admin') return role;
  return 'provider';
}

function asJsonArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is string => typeof value === 'string').map((value) => value.trim()).filter(Boolean);
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations = 120000): Promise<string> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    baseKey,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await derivePasswordHash(password, salt);
  return `pbkdf2$120000$${btoa(String.fromCharCode(...salt))}$${digest}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterationRaw, saltB64, expected] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iterationRaw || !saltB64 || !expected) return false;
  const salt = Uint8Array.from(atob(saltB64), (char) => char.charCodeAt(0));
  const digest = await derivePasswordHash(password, salt, Number(iterationRaw));
  return digest === expected;
}

async function passwordLogin(request: Request, env: Env): Promise<Response> {
  let body: PasswordLoginBody;
  try {
    body = await request.json() as PasswordLoginBody;
  } catch {
    return err('Invalid JSON body');
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email) return err('email required');
  if (!password) return err('password required');

  const user = await env.DB.prepare(
    'SELECT id, role, password_hash, status FROM users WHERE email = ?'
  ).bind(email).first<{ id: string; role: string; password_hash: string | null; status: string }>();

  if (!user?.id || !user.password_hash) return err('invalid email or password', 401);
  if (user.status !== 'active') return err('account is not active', 403);
  if (!await verifyPassword(password, user.password_hash)) return err('invalid email or password', 401);

  const tokens = await issueTokens(user.id, user.role as JwtPayload['role'], env.JWT_SECRET);
  return created({ user_id: user.id, role: user.role, ...tokens });
}

async function signup(request: Request, env: Env): Promise<Response> {
  let body: SignupBody;
  try {
    body = await request.json() as SignupBody;
  } catch {
    return err('Invalid JSON body');
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const displayName = (body.display_name || '').trim();
  const countryCode = (body.country_code || '').trim().toUpperCase();
  const nickname = (body.nickname || '').trim();
  const phone = (body.phone || '').trim();
  const addressLine = (body.address_line || '').trim();
  const addressPlaceId = (body.address_place_id || '').trim();
  const publicId = (body.public_id || '').trim();
  const role = 'guardian';

  if (!email) return err('email required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('invalid email');
  if (!password || password.length < 8) return err('password must be at least 8 characters');
  if (!displayName) return err('display_name required');
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return err('country_code must be ISO 3166-1 alpha-2');

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
  const passwordHash = await hashPassword(password);

  const userId = newId();
  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(userId, email, passwordHash, role, ts, ts).run();

  await env.DB.prepare(
    `INSERT INTO user_profiles (
      id, user_id, handle, display_name, avatar_url, bio, bio_translations,
      country_id, language, timezone, interests, created_at, updated_at
    ) VALUES (?, ?, NULL, ?, NULL, NULL, '{}', ?, ?, ?, '[]', ?, ?)`
  ).bind(newId(), userId, displayName, country.country_id, language, timezone, ts, ts).run();

  await env.DB.prepare(
    `INSERT INTO user_account_details (
      id, user_id, full_name, nickname, phone,
      address_line, address_place_id, address_lat, address_lng, region_text,
      preferred_language, has_pets, pet_count, interested_pet_types,
      notifications_booking, notifications_health, marketing_opt_in,
      terms_agreed_at, public_profile, public_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    newId(),
    userId,
    displayName,
    nickname || null,
    phone || null,
    addressLine || null,
    addressPlaceId || null,
    body.address_lat ?? null,
    body.address_lng ?? null,
    countryCode,
    language,
    body.has_pets ? 1 : 0,
    Math.max(0, Number(body.pet_count || 0)),
    JSON.stringify(asJsonArray(body.interested_pet_types)),
    body.notifications_booking === false ? 0 : 1,
    body.notifications_health === false ? 0 : 1,
    body.marketing_opt_in ? 1 : 0,
    body.terms_agreed ? ts : null,
    body.public_profile ? 1 : 0,
    publicId || null,
    ts,
    ts,
  ).run();

  if (body.role_application && normalizeRequestedRole(body.role_application.requested_role) === 'provider') {
    const applicationId = newId();
    await env.DB.prepare(
      `INSERT INTO role_applications (
        id, user_id, requested_role, business_category_l1_id, business_category_l2_id,
        status, requested_at, created_at, updated_at
      ) VALUES (?, ?, 'provider', ?, ?, 'pending', ?, ?, ?)`
    ).bind(
      applicationId,
      userId,
      body.role_application.business_category_l1_id ?? null,
      body.role_application.business_category_l2_id ?? null,
      ts,
      ts,
      ts,
    ).run();

    await env.DB.prepare(
      `INSERT OR REPLACE INTO provider_profiles (
        id, user_id, business_category_l1_id, business_category_l2_id,
        business_registration_no, operating_hours, supported_pet_types, certifications,
        address_line, address_place_id, address_lat, address_lng,
        approval_status, created_at, updated_at
      ) VALUES (
        COALESCE((SELECT id FROM provider_profiles WHERE user_id = ?), ?),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?
      )`
    ).bind(
      userId,
      newId(),
      userId,
      body.role_application.business_category_l1_id ?? null,
      body.role_application.business_category_l2_id ?? null,
      body.role_application.business_registration_no ?? null,
      body.role_application.operating_hours ?? null,
      JSON.stringify(asJsonArray(body.role_application.supported_pet_types)),
      JSON.stringify(asJsonArray(body.role_application.certifications)),
      (body.role_application.address_line ?? addressLine) || null,
      (body.role_application.address_place_id ?? addressPlaceId) || null,
      body.role_application.address_lat ?? body.address_lat ?? null,
      body.role_application.address_lng ?? body.address_lng ?? null,
      ts,
      ts,
    ).run();
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
      profile_created: true,
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

    if (!user && email === 'provider@petlife.com') {
      user = await ensureProviderSample(env);
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

async function ensureProviderSample(env: Env): Promise<{ id: string; role: string } | null> {
  const ts = now();
  const existing = await env.DB.prepare(
    'SELECT id, role FROM users WHERE email = ?'
  ).bind('provider@petlife.com').first<{ id: string; role: string }>();
  const userId = existing?.id || newId();

  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, 'provider@petlife.com', 'provider', ts, ts).run();
  } else if (existing.role !== 'provider') {
    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').bind('provider', ts, userId).run();
  }

  return { id: userId, role: 'provider' };
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

  const normalizedPets = await hasColumn(env, 'pets', 'guardian_user_id');
  if (normalizedPets) {
    const pet = await env.DB.prepare(
      `SELECT id FROM pets
       WHERE guardian_user_id = ? AND name = '방울' AND status != 'deleted'
       LIMIT 1`
    ).bind(userId).first<{ id: string }>();

    if (!pet) {
      const petId = newId();
      await env.DB.prepare(`
        INSERT INTO pets (
          id, guardian_user_id, name, microchip_number,
          pet_type_id, breed_id, gender_id, life_stage_id, body_size_id, country_id,
          diet_type_id, coat_length_id, coat_type_id, activity_level_id, health_level_id,
          gender_legacy, species_legacy, birth_date, weight_kg, is_neutered, avatar_url, status, created_at, updated_at
        ) VALUES (
          ?, ?, '방울', 'BANGUL-0001',
          ?, ?, ?, NULL, NULL, NULL,
          NULL, NULL, NULL, NULL, NULL,
          'female', 'dog', '2021-03-15', 4.2, 0, 'https://placehold.co/600x600?text=Bangul', 'active', ?, ?
        )
      `).bind(
        petId,
        userId,
        await findMasterItemId(env, 'dog'),
        await findMasterItemId(env, 'pomeranian'),
        await findMasterItemId(env, 'female'),
        ts,
        ts,
      ).run();
    }
  } else {
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
  }

  return { id: userId, role: 'guardian' };
}

async function findMasterItemId(env: Env, key: string): Promise<string | null> {
  try {
    const rowByKey = await env.DB.prepare('SELECT id FROM master_items WHERE key = ? LIMIT 1').bind(key).first<{ id: string }>();
    if (rowByKey?.id) return rowByKey.id;
  } catch {
    // key column may not exist on normalized schema
  }
  try {
    const rowByCode = await env.DB.prepare('SELECT id FROM master_items WHERE code = ? LIMIT 1').bind(key).first<{ id: string }>();
    if (rowByCode?.id) return rowByCode.id;
  } catch {
    // code column may not exist on legacy schema
  }
  return null;
}

async function hasColumn(env: Env, table: string, column: string): Promise<boolean> {
  const rows = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  return rows.results.some((r) => r.name === column);
}

// ─── refresh ──────────────────────────────────────────────────────────────────

async function refreshToken(request: Request, env: Env): Promise<Response> {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;
  const payload = result as JwtPayload;
  const tokens = await issueTokens(payload.sub, payload.role, env.JWT_SECRET);
  return ok(tokens);
}
