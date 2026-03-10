import type { Env, JwtPayload } from '../types';
import { err, newId, now, ok } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

const GOOGLE_SETTING_KEYS = [
  'google_places_api_key',
  'google_oauth_client_id',
  'google_oauth_redirect_uri',
] as const;

async function listGoogleSettings(env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  const rows = await env.DB.prepare(
    `SELECT setting_key, setting_value, updated_at
     FROM platform_settings
     WHERE setting_key IN ('google_places_api_key', 'google_oauth_client_id', 'google_oauth_redirect_uri')
     ORDER BY setting_key`
  ).all<Record<string, unknown>>();

  const mapped = Object.fromEntries(
    GOOGLE_SETTING_KEYS.map((key) => [key, { value: '', updated_at: null }]),
  ) as Record<string, { value: string; updated_at: string | null }>;

  for (const row of rows.results || []) {
    mapped[String(row.setting_key)] = {
      value: String(row.setting_value || ''),
      updated_at: row.updated_at ? String(row.updated_at) : null,
    };
  }

  return ok({ settings: mapped });
}

async function updateGoogleSettings(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const timestamp = now();
  for (const key of GOOGLE_SETTING_KEYS) {
    if (!(key in body)) continue;
    await env.DB.prepare(
      `INSERT INTO platform_settings (id, setting_key, setting_value, updated_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(setting_key) DO UPDATE SET
         setting_value = excluded.setting_value,
         updated_by_user_id = excluded.updated_by_user_id,
         updated_at = excluded.updated_at`
    ).bind(newId(), key, String(body[key] || ''), me.sub, timestamp, timestamp).run();
  }

  return ok({ updated: true, updated_at: timestamp });
}

export async function handlePlatformSettings(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  if (url.pathname === '/api/v1/admin/settings/google' && request.method === 'GET') {
    return listGoogleSettings(env, me);
  }
  if (url.pathname === '/api/v1/admin/settings/google' && request.method === 'PUT') {
    return updateGoogleSettings(request, env, me);
  }
  return err('Not found', 404);
}
