import type { Env, JwtPayload } from '../types';
import { ok, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';

async function listNotifications(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 30)));

  const rows = await env.DB.prepare(
    `SELECT n.id, n.user_id, n.type, n.actor_user_id, n.reference_id, n.reference_type,
            n.is_read, n.title, n.body, n.data, n.push_sent, n.created_at,
            u.email AS actor_email,
            COALESCE(up.display_name, u.email) AS actor_name,
            up.avatar_url AS actor_avatar_url
     FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_user_id
     LEFT JOIN user_profiles up ON up.user_id = n.actor_user_id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT ?`
  ).bind(me.sub, limit).all<Record<string, unknown>>();

  const unread = await env.DB.prepare(
    'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = false'
  ).bind(me.sub).first<{ cnt: number }>();

  return ok({ notifications: rows.results, unread_count: unread?.cnt ?? 0 });
}

async function markRead(env: Env, me: JwtPayload, notifId: string): Promise<Response> {
  await env.DB.prepare(
    'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?'
  ).bind(notifId, me.sub).run();
  return ok({ success: true });
}

async function markAllRead(env: Env, me: JwtPayload): Promise<Response> {
  await env.DB.prepare(
    'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false'
  ).bind(me.sub).run();
  return ok({ success: true });
}

// ─── Push Token Management ──────────────────────────────────────────────

async function registerPushToken(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  let body: { token?: string; device_type?: string };
  try { body = await request.json() as { token?: string; device_type?: string }; }
  catch { return err('Invalid JSON'); }

  const token = (body.token || '').trim();
  if (!token) return err('token required');
  const deviceType = (body.device_type || 'web').trim();

  // Upsert: if token already exists for another user, reassign
  const existing = await env.DB.prepare(
    'SELECT id, user_id FROM user_push_tokens WHERE token = ?'
  ).bind(token).first<{ id: string; user_id: string }>();

  if (existing) {
    await env.DB.prepare(
      'UPDATE user_push_tokens SET user_id = ?, device_type = ?, is_active = true, updated_at = ? WHERE id = ?'
    ).bind(me.sub, deviceType, now(), existing.id).run();
    return ok({ id: existing.id });
  }

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO user_push_tokens (id, user_id, token, device_type, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, true, ?, ?)`
  ).bind(id, me.sub, token, deviceType, now(), now()).run();
  return ok({ id });
}

async function unregisterPushToken(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  let body: { token?: string };
  try { body = await request.json() as { token?: string }; }
  catch { return err('Invalid JSON'); }

  const token = (body.token || '').trim();
  if (!token) return err('token required');

  await env.DB.prepare(
    'UPDATE user_push_tokens SET is_active = false, updated_at = ? WHERE token = ? AND user_id = ?'
  ).bind(now(), token, me.sub).run();
  return ok({ success: true });
}

// ─── Notification Settings ──────────────────────────────────────────────

async function getSettings(env: Env, me: JwtPayload): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT friend_request, friend_accepted, post_like, post_comment,
            friend_new_post, pet_health_remind, appointment_remind,
            service_notice, marketing
     FROM notification_settings WHERE user_id = ?`
  ).bind(me.sub).first<Record<string, boolean>>();

  // Return defaults if no row exists yet
  const defaults = {
    friend_request: true,
    friend_accepted: true,
    post_like: true,
    post_comment: true,
    friend_new_post: true,
    pet_health_remind: true,
    appointment_remind: true,
    service_notice: true,
    marketing: false,
  };

  return ok({ settings: row || defaults });
}

async function updateSettings(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  let body: Record<string, boolean>;
  try { body = await request.json() as Record<string, boolean>; }
  catch { return err('Invalid JSON'); }

  const allowed = [
    'friend_request', 'friend_accepted', 'post_like', 'post_comment',
    'friend_new_post', 'pet_health_remind', 'appointment_remind',
    'service_notice', 'marketing',
  ];

  // Validate keys
  const updates: Record<string, boolean> = {};
  for (const key of allowed) {
    if (key in body && typeof body[key] === 'boolean') {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) return err('No valid settings provided');

  const timestamp = now();

  // Upsert: create row with defaults if not exists, then update
  await env.DB.prepare(
    `INSERT INTO notification_settings (id, user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (user_id) DO NOTHING`
  ).bind(newId(), me.sub, timestamp, timestamp).run();

  // Build dynamic SET clause
  const setClauses = Object.keys(updates).map(k => `${k} = ?`);
  setClauses.push('updated_at = ?');
  const values = [...Object.values(updates), timestamp, me.sub];

  await env.DB.prepare(
    `UPDATE notification_settings SET ${setClauses.join(', ')} WHERE user_id = ?`
  ).bind(...values).run();

  return ok({ success: true });
}

// ─── Router ─────────────────────────────────────────────────────────────

export async function handleNotifications(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/notifications', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listNotifications(env, me, url);
  if ((sub === '/read-all' || sub === '/read-all/') && request.method === 'POST') return markAllRead(env, me);

  // Push token management
  if ((sub === '/push-token' || sub === '/push-token/') && request.method === 'POST') return registerPushToken(request, env, me);
  if ((sub === '/push-token' || sub === '/push-token/') && request.method === 'DELETE') return unregisterPushToken(request, env, me);

  // Notification settings
  if ((sub === '/settings' || sub === '/settings/') && request.method === 'GET') return getSettings(env, me);
  if ((sub === '/settings' || sub === '/settings/') && request.method === 'PATCH') return updateSettings(request, env, me);

  const readOne = sub.match(/^\/([^/]+)\/read$/);
  if (readOne && request.method === 'POST') return markRead(env, me, readOne[1]);

  return err('Not found', 404);
}
