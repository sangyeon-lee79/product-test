import type { Env, JwtPayload } from '../types';
import { err, newId, now, ok } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

type MemberFilters = {
  q?: string;
  role?: string;
  date_from?: string;
  date_to?: string;
};

function parseJsonArray(raw: unknown): string[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

async function listMembers(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  const filters: MemberFilters = {
    q: (url.searchParams.get('q') || '').trim(),
    role: (url.searchParams.get('role') || '').trim(),
    date_from: (url.searchParams.get('date_from') || '').trim(),
    date_to: (url.searchParams.get('date_to') || '').trim(),
  };

  const where: string[] = [];
  const params: Array<string> = [];

  if (filters.q) {
    where.push(`(lower(u.email) LIKE ? OR lower(COALESCE(uad.full_name, up.display_name, '')) LIKE ? OR lower(COALESCE(uad.nickname, '')) LIKE ?)`);
    const q = `%${filters.q.toLowerCase()}%`;
    params.push(q, q, q);
  }
  if (filters.role) {
    where.push('u.role = ?');
    params.push(filters.role);
  }
  if (filters.date_from) {
    where.push('date(u.created_at) >= date(?)');
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    where.push('date(u.created_at) <= date(?)');
    params.push(filters.date_to);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await env.DB.prepare(
    `SELECT
      u.id,
      u.email,
      u.role,
      u.status,
      u.created_at,
      COALESCE(uad.full_name, up.display_name, '') AS full_name,
      COALESCE(uad.nickname, '') AS nickname,
      COALESCE(uad.phone, '') AS phone,
      COALESCE(uad.address_line, pp.address_line, '') AS address_line,
      COALESCE(uad.region_text, '') AS region_text,
      COALESCE(uad.preferred_language, up.language, 'ko') AS preferred_language,
      COALESCE(pp.business_category_l1_id, '') AS business_category_l1_id,
      COALESCE(pp.business_category_l2_id, '') AS business_category_l2_id,
      COALESCE(pp.business_registration_no, '') AS business_registration_no,
      COALESCE(pp.operating_hours, '') AS operating_hours,
      COALESCE(pp.certifications, '[]') AS certifications,
      COALESCE(pp.approval_status, '') AS provider_approval_status,
      COALESCE(ra.id, '') AS role_application_id,
      COALESCE(ra.status, '') AS role_application_status,
      COALESCE(ra.requested_role, '') AS requested_role,
      COALESCE(l1.display_label, l1.ko, l1.code, '') AS business_l1_label,
      COALESCE(l2.display_label, l2.ko, l2.code, '') AS business_l2_label
     FROM users u
     LEFT JOIN user_profiles up ON up.user_id = u.id
     LEFT JOIN user_account_details uad ON uad.user_id = u.id
     LEFT JOIN provider_profiles pp ON pp.user_id = u.id
     LEFT JOIN role_applications ra ON ra.id = (
       SELECT ra2.id FROM role_applications ra2
       WHERE ra2.user_id = u.id
       ORDER BY ra2.requested_at DESC
       LIMIT 1
     )
     LEFT JOIN (
       SELECT mi.id, mi.code, it.ko, it.en, COALESCE(it.ko, mi.code) AS display_label
       FROM master_items mi
       LEFT JOIN i18n_translations it ON it.key = 'master.business_category.' || mi.code
     ) l1 ON l1.id = pp.business_category_l1_id
     LEFT JOIN (
       SELECT mi.id, mi.code, it.ko, it.en, COALESCE(it.ko, mi.code) AS display_label
       FROM master_items mi
       LEFT JOIN i18n_translations it ON it.key = 'master.business_category.' || mi.code
     ) l2 ON l2.id = pp.business_category_l2_id
     ${clause}
     ORDER BY u.created_at DESC`
  ).bind(...params).all<Record<string, unknown>>();

  const summary = await env.DB.prepare(
    `SELECT
      COUNT(*) AS total_members,
      SUM(CASE WHEN date(created_at) >= date('now', '-7 day') THEN 1 ELSE 0 END) AS new_members
     FROM users`
  ).first<{ total_members: number; new_members: number }>();

  return ok({
    summary: {
      total_members: Number(summary?.total_members || 0),
      new_members: Number(summary?.new_members || 0),
    },
    members: (rows.results || []).map((row) => ({
      ...row,
      certifications: parseJsonArray(row.certifications),
    })),
  });
}

async function createRoleApplication(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['guardian', 'provider', 'admin']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const requestedRole = String(body.requested_role || 'provider').trim().toLowerCase();
  if (requestedRole !== 'provider') return err('only provider application is supported');

  const latest = await env.DB.prepare(
    `SELECT id, status FROM role_applications WHERE user_id = ? ORDER BY requested_at DESC LIMIT 1`
  ).bind(me.sub).first<{ id: string; status: string }>();
  if (latest?.status === 'pending') return err('pending application already exists', 409);

  const timestamp = now();
  const applicationId = newId();
  await env.DB.prepare(
    `INSERT INTO role_applications (
      id, user_id, requested_role, business_category_l1_id, business_category_l2_id,
      status, requested_at, created_at, updated_at
    ) VALUES (?, ?, 'provider', ?, ?, 'pending', ?, ?, ?)`
  ).bind(
    applicationId,
    me.sub,
    body.business_category_l1_id ?? null,
    body.business_category_l2_id ?? null,
    timestamp,
    timestamp,
    timestamp,
  ).run();

  await env.DB.prepare(
    `INSERT OR REPLACE INTO provider_profiles (
      id, user_id, business_category_l1_id, business_category_l2_id,
      business_registration_no, operating_hours, certifications, supported_pet_types,
      address_line, address_place_id, address_lat, address_lng,
      approval_status, created_at, updated_at
    ) VALUES (
      COALESCE((SELECT id FROM provider_profiles WHERE user_id = ?), ?),
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?
    )`
  ).bind(
    me.sub,
    newId(),
    me.sub,
    body.business_category_l1_id ?? null,
    body.business_category_l2_id ?? null,
    body.business_registration_no ?? null,
    body.operating_hours ?? null,
    JSON.stringify(Array.isArray(body.certifications) ? body.certifications : []),
    JSON.stringify(Array.isArray(body.supported_pet_types) ? body.supported_pet_types : []),
    body.address_line ?? null,
    body.address_place_id ?? null,
    body.address_lat ?? null,
    body.address_lng ?? null,
    timestamp,
    timestamp,
  ).run();

  return ok({ id: applicationId, status: 'pending' });
}

async function updateMember(request: Request, env: Env, me: JwtPayload, memberId: string): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const user = await env.DB.prepare(`SELECT id FROM users WHERE id = ?`).bind(memberId).first<{ id: string }>();
  if (!user) return err('member not found', 404);

  const timestamp = now();
  const role = String(body.role || '').trim();
  if (role && !['guardian', 'provider', 'admin'].includes(role)) return err('invalid role');

  if (role) {
    await env.DB.prepare(`UPDATE users SET role = ?, updated_at = ? WHERE id = ?`).bind(role, timestamp, memberId).run();
  }

  await env.DB.prepare(
    `INSERT INTO user_account_details (
      id, user_id, full_name, nickname, phone, address_line, region_text,
      preferred_language, updated_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      full_name = excluded.full_name,
      nickname = excluded.nickname,
      phone = excluded.phone,
      address_line = excluded.address_line,
      region_text = excluded.region_text,
      preferred_language = excluded.preferred_language,
      updated_at = excluded.updated_at`
  ).bind(
    newId(),
    memberId,
    body.full_name ?? null,
    body.nickname ?? null,
    body.phone ?? null,
    body.address_line ?? null,
    body.region_text ?? null,
    body.preferred_language ?? null,
    timestamp,
    timestamp,
  ).run();

  await env.DB.prepare(
    `INSERT INTO provider_profiles (
      id, user_id, business_category_l1_id, business_category_l2_id, business_registration_no,
      operating_hours, certifications, approval_status, updated_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      business_category_l1_id = excluded.business_category_l1_id,
      business_category_l2_id = excluded.business_category_l2_id,
      business_registration_no = excluded.business_registration_no,
      operating_hours = excluded.operating_hours,
      certifications = excluded.certifications,
      approval_status = excluded.approval_status,
      updated_at = excluded.updated_at`
  ).bind(
    newId(),
    memberId,
    body.business_category_l1_id ?? null,
    body.business_category_l2_id ?? null,
    body.business_registration_no ?? null,
    body.operating_hours ?? null,
    JSON.stringify(Array.isArray(body.certifications) ? body.certifications : []),
    role === 'provider' ? 'approved' : (body.provider_approval_status ?? 'pending'),
    timestamp,
    timestamp,
  ).run();

  return ok({ updated: true, member_id: memberId });
}

async function decideRoleApplication(request: Request, env: Env, me: JwtPayload, applicationId: string): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  let body: { action?: string };
  try {
    body = await request.json() as { action?: string };
  } catch {
    return err('Invalid JSON body');
  }

  const action = String(body.action || '').trim();
  if (!['approve', 'reject'].includes(action)) return err('invalid action');

  const application = await env.DB.prepare(
    `SELECT * FROM role_applications WHERE id = ?`
  ).bind(applicationId).first<Record<string, unknown>>();
  if (!application) return err('application not found', 404);

  const status = action === 'approve' ? 'approved' : 'rejected';
  const timestamp = now();
  await env.DB.prepare(
    `UPDATE role_applications
     SET status = ?, decided_at = ?, decided_by_user_id = ?, updated_at = ?
     WHERE id = ?`
  ).bind(status, timestamp, me.sub, timestamp, applicationId).run();

  await env.DB.prepare(
    `UPDATE provider_profiles
     SET approval_status = ?, approved_at = CASE WHEN ? = 'approved' THEN ? ELSE approved_at END,
         approved_by_user_id = CASE WHEN ? = 'approved' THEN ? ELSE approved_by_user_id END,
         updated_at = ?
     WHERE user_id = ?`
  ).bind(status, status, timestamp, status, me.sub, timestamp, application.user_id).run();

  if (status === 'approved') {
    await env.DB.prepare(`UPDATE users SET role = 'provider', updated_at = ? WHERE id = ?`).bind(timestamp, application.user_id).run();
  }

  return ok({ id: applicationId, status });
}

export async function handleMembers(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const path = url.pathname;
  if (path === '/api/v1/account/role-applications' && request.method === 'POST') {
    return createRoleApplication(request, env, me);
  }
  if (path === '/api/v1/admin/members' && request.method === 'GET') {
    return listMembers(env, me, url);
  }

  const memberMatch = path.match(/^\/api\/v1\/admin\/members\/([^/]+)$/);
  if (memberMatch && request.method === 'PUT') {
    return updateMember(request, env, me, memberMatch[1]);
  }

  const decisionMatch = path.match(/^\/api\/v1\/admin\/role-applications\/([^/]+)\/decision$/);
  if (decisionMatch && request.method === 'POST') {
    return decideRoleApplication(request, env, me, decisionMatch[1]);
  }

  return err('Not found', 404);
}
