import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';

type UserRole = 'guardian' | 'provider' | 'admin';

function normalizeRole(raw: string): UserRole {
  const v = (raw || '').toLowerCase();
  if (v === 'supplier') return 'provider';
  if (v === 'guardian' || v === 'provider' || v === 'admin') return v;
  return 'guardian';
}

function pair(a: string, b: string): { a: string; b: string } {
  return a < b ? { a, b } : { a: b, b: a };
}

async function userById(env: Env, id: string): Promise<{ id: string; role: UserRole; email: string } | null> {
  const row = await env.DB.prepare('SELECT id, role, email FROM users WHERE id = ?').bind(id).first<{ id: string; role: string; email: string }>();
  if (!row) return null;
  return { id: row.id, role: normalizeRole(row.role), email: row.email };
}

async function userByEmail(env: Env, email: string): Promise<{ id: string; role: UserRole; email: string } | null> {
  const row = await env.DB.prepare('SELECT id, role, email FROM users WHERE lower(email) = ?').bind(email.toLowerCase()).first<{ id: string; role: string; email: string }>();
  if (!row) return null;
  return { id: row.id, role: normalizeRole(row.role), email: row.email };
}

function canConnect(a: UserRole, b: UserRole): boolean {
  return (a === 'guardian' && b === 'provider') || (a === 'provider' && b === 'guardian');
}

async function listFriends(env: Env, me: JwtPayload): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT f.id, f.relation_type, f.status, f.created_at,
            CASE WHEN f.user_a_id = ? THEN f.user_b_id ELSE f.user_a_id END AS friend_user_id,
            u.email AS friend_email,
            u.role AS friend_role
     FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.user_a_id = ? THEN f.user_b_id ELSE f.user_a_id END
     WHERE f.status = 'active' AND (f.user_a_id = ? OR f.user_b_id = ?)
     ORDER BY f.created_at DESC`
  ).bind(me.sub, me.sub, me.sub, me.sub).all<Record<string, unknown>>();

  return ok({ friends: rows.results });
}

async function listRequests(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const scope = (url.searchParams.get('scope') || 'inbox').trim();

  let query = `SELECT fr.*, ru.email AS requester_email, rv.email AS receiver_email
               FROM friend_requests fr
               JOIN users ru ON ru.id = fr.requester_user_id
               JOIN users rv ON rv.id = fr.receiver_user_id`;
  const params: string[] = [];

  if (scope === 'outbox') {
    query += ' WHERE fr.requester_user_id = ?';
    params.push(me.sub);
  } else if (scope === 'all') {
    query += ' WHERE fr.requester_user_id = ? OR fr.receiver_user_id = ?';
    params.push(me.sub, me.sub);
  } else {
    query += " WHERE fr.receiver_user_id = ? AND fr.status = 'request_sent'";
    params.push(me.sub);
  }

  query += ' ORDER BY fr.created_at DESC';

  const rows = await env.DB.prepare(query).bind(...params).all<Record<string, unknown>>();
  return ok({ requests: rows.results, scope });
}

async function createRequest(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  let body: { receiver_user_id?: string; receiver_email?: string };
  try { body = await request.json() as { receiver_user_id?: string; receiver_email?: string }; }
  catch { return err('Invalid JSON'); }

  const receiverId = (body.receiver_user_id || '').trim();
  const receiverEmail = (body.receiver_email || '').trim().toLowerCase();
  if (!receiverId && !receiverEmail) return err('receiver_user_id or receiver_email required');

  const meUser = await userById(env, me.sub);
  if (!meUser) return err('user not found', 404);

  const target = receiverId
    ? await userById(env, receiverId)
    : await userByEmail(env, receiverEmail);
  if (!target) return err('receiver not found', 404);
  if (target.id === me.sub) return err('cannot request yourself');

  if (!canConnect(meUser.role, target.role)) {
    return err('only guardian and provider can connect');
  }

  const existingFriend = await env.DB.prepare(
    `SELECT id FROM friendships
     WHERE status = 'active' AND ((user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?))`
  ).bind(me.sub, target.id, target.id, me.sub).first<{ id: string }>();
  if (existingFriend?.id) return ok({ request_id: null, status: 'already_friends' });

  const existingPending = await env.DB.prepare(
    `SELECT id, status FROM friend_requests
     WHERE ((requester_user_id = ? AND receiver_user_id = ?) OR (requester_user_id = ? AND receiver_user_id = ?))
       AND status = 'request_sent'
     LIMIT 1`
  ).bind(me.sub, target.id, target.id, me.sub).first<{ id: string; status: string }>();
  if (existingPending?.id) return ok({ request_id: existingPending.id, status: 'request_sent' });

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO friend_requests (
      id, requester_user_id, receiver_user_id, requester_role, receiver_role, status, created_at
    ) VALUES (?, ?, ?, ?, ?, 'request_sent', ?)`
  ).bind(id, me.sub, target.id, meUser.role, target.role, now()).run();

  return created({ request_id: id, status: 'request_sent' });
}

async function respondRequest(request: Request, env: Env, me: JwtPayload, requestId: string): Promise<Response> {
  let body: { action?: string };
  try { body = await request.json() as { action?: string }; }
  catch { return err('Invalid JSON'); }
  const action = (body.action || '').trim().toLowerCase();
  if (!['accept', 'reject', 'block'].includes(action)) return err('action must be accept|reject|block');

  const req = await env.DB.prepare(
    'SELECT * FROM friend_requests WHERE id = ?'
  ).bind(requestId).first<Record<string, unknown>>();
  if (!req) return err('friend request not found', 404);

  const receiverId = String(req.receiver_user_id || '');
  if (receiverId !== me.sub) return err('forbidden', 403);
  if (String(req.status || '') !== 'request_sent') return err('request already processed');

  const status = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'blocked';
  await env.DB.prepare(
    'UPDATE friend_requests SET status = ?, responded_at = ? WHERE id = ?'
  ).bind(status, now(), requestId).run();

  if (action === 'accept') {
    const a = String(req.requester_user_id || '');
    const b = String(req.receiver_user_id || '');
    const ordered = pair(a, b);
    await env.DB.prepare(
      `INSERT INTO friendships (id, user_a_id, user_b_id, relation_type, status, created_at)
       VALUES (?, ?, ?, 'guardian_supplier_connected', 'active', ?)
       ON CONFLICT DO NOTHING`
    ).bind(newId(), ordered.a, ordered.b, now()).run();
  }

  return ok({ request_id: requestId, status });
}

export async function handleFriends(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/friends', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listFriends(env, me);
  if ((sub === '/requests' || sub === '/requests/') && request.method === 'GET') return listRequests(env, me, url);
  if ((sub === '/requests' || sub === '/requests/') && request.method === 'POST') return createRequest(request, env, me);

  const respond = sub.match(/^\/requests\/([^/]+)\/respond$/);
  if (respond && request.method === 'POST') return respondRequest(request, env, me, respond[1]);

  return err('Not found', 404);
}
