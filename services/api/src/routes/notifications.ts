import type { Env, JwtPayload } from '../types';
import { ok, err } from '../types';
import { requireAuth } from '../middleware/auth';

async function listNotifications(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 30)));

  const rows = await env.DB.prepare(
    `SELECT n.*, u.email AS actor_email,
            COALESCE(up.display_name, u.email) AS actor_name
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

export async function handleNotifications(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/notifications', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listNotifications(env, me, url);
  if ((sub === '/read-all' || sub === '/read-all/') && request.method === 'POST') return markAllRead(env, me);

  const readOne = sub.match(/^\/([^/]+)\/read$/);
  if (readOne && request.method === 'POST') return markRead(env, me, readOne[1]);

  return err('Not found', 404);
}
