import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';
import { createAndPush } from '../helpers/pushHelper';

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

// ─── GET /friends/search?email=xxx ─────────────────────────────────────────────

async function searchUser(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  if (!email) return err('email parameter required');

  const target = await userByEmail(env, email);
  if (!target) return ok({ user: null });

  // Determine friend_status
  let friend_status: 'self' | 'friend' | 'pending' | 'none' = 'none';
  if (target.id === me.sub) {
    friend_status = 'self';
  } else {
    const friendship = await env.DB.prepare(
      `SELECT id FROM friendships
       WHERE status = 'active'
         AND ((user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?))`
    ).bind(me.sub, target.id, target.id, me.sub).first<{ id: string }>();
    if (friendship) {
      friend_status = 'friend';
    } else {
      const pending = await env.DB.prepare(
        `SELECT id FROM friend_requests
         WHERE requester_user_id = ? AND receiver_user_id = ? AND status = 'request_sent'`
      ).bind(me.sub, target.id).first<{ id: string }>();
      if (pending) friend_status = 'pending';
    }
  }

  // Profile + account details (with localized country name)
  const langParam = (url.searchParams.get('lang') || 'ko').toLowerCase();
  const langCol = ['ko','en','ja','zh_cn','zh_tw','es','fr','de','pt','vi','th','id_lang','ar'].includes(langParam) ? langParam : 'ko';
  const profile = await env.DB.prepare(
    `SELECT COALESCE(up.display_name, u.email) AS display_name,
            up.avatar_url,
            COALESCE(
              (SELECT it.${langCol} FROM i18n_translations it WHERE it.key = c.name_key LIMIT 1),
              c.name_key
            ) AS country_name,
            uad.region_text
     FROM users u
     LEFT JOIN user_profiles up ON up.user_id = u.id
     LEFT JOIN countries c ON c.id = up.country_id
     LEFT JOIN user_account_details uad ON uad.user_id = u.id
     WHERE u.id = ?`
  ).bind(target.id).first<Record<string, unknown>>();

  // Pets (up to 2)
  const petRows = await env.DB.prepare(
    `SELECT p.name, pt.code AS pet_type_code, br.code AS breed_code
     FROM pets p
     LEFT JOIN master_items pt ON pt.id = p.pet_type_id
     LEFT JOIN master_items br ON br.id = p.breed_id
     WHERE p.guardian_user_id = ? AND COALESCE(p.status, 'active') = 'active'
     ORDER BY p.created_at
     LIMIT 2`
  ).bind(target.id).all<Record<string, unknown>>();

  return ok({
    user: {
      id: target.id,
      display_name: profile?.display_name || target.email,
      email: target.email,
      avatar_url: profile?.avatar_url || null,
      country_name: profile?.country_name || null,
      region_text: profile?.region_text || null,
      pets: petRows.results || [],
      friend_status,
    },
  });
}

async function listFriends(env: Env, me: JwtPayload): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT f.id, f.relation_type, f.status, f.created_at,
            CASE WHEN f.user_a_id = ? THEN f.user_b_id ELSE f.user_a_id END AS friend_user_id,
            u.email AS friend_email,
            u.role AS friend_role,
            COALESCE(up.display_name, u.email) AS friend_display_name,
            up.avatar_url AS friend_avatar_url
     FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.user_a_id = ? THEN f.user_b_id ELSE f.user_a_id END
     LEFT JOIN user_profiles up ON up.user_id = u.id
     WHERE f.status = 'active' AND (f.user_a_id = ? OR f.user_b_id = ?)
     ORDER BY f.created_at DESC`
  ).bind(me.sub, me.sub, me.sub, me.sub).all<Record<string, unknown>>();

  return ok({ friends: rows.results });
}

async function listRequests(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const scope = (url.searchParams.get('scope') || 'inbox').trim();

  let query = `SELECT fr.*, ru.email AS requester_email, rv.email AS receiver_email,
                      ru.created_at AS requester_joined_at,
                      COALESCE(rup.display_name, ru.email) AS requester_display_name,
                      rup.avatar_url AS requester_avatar_url,
                      c.name_key AS requester_country_name
               FROM friend_requests fr
               JOIN users ru ON ru.id = fr.requester_user_id
               JOIN users rv ON rv.id = fr.receiver_user_id
               LEFT JOIN user_profiles rup ON rup.user_id = fr.requester_user_id
               LEFT JOIN countries c ON c.id = rup.country_id`;
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
  const requests = rows.results || [];

  // Enrich inbox requests with requester pets & public feed images
  if (scope === 'inbox' || scope === '' || !scope) {
    const requesterIds = [...new Set(requests.map(r => String(r.requester_user_id || '')).filter(Boolean))];
    if (requesterIds.length > 0) {
      // Batch-fetch pets for all requesters
      const petPlaceholders = requesterIds.map(() => '?').join(',');
      const petRows = await env.DB.prepare(
        `SELECT p.id, p.guardian_user_id, p.name, p.avatar_url, p.birth_date,
                pt.code AS pet_type_code, br.code AS breed_code
         FROM pets p
         LEFT JOIN master_items pt ON pt.id = p.pet_type_id
         LEFT JOIN master_items br ON br.id = p.breed_id
         WHERE p.guardian_user_id IN (${petPlaceholders}) AND p.status = 'active'
         ORDER BY p.guardian_user_id, p.created_at`
      ).bind(...requesterIds).all<Record<string, unknown>>();

      const petsByUser = new Map<string, Record<string, unknown>[]>();
      for (const p of (petRows.results || [])) {
        const uid = String(p.guardian_user_id || '');
        if (!petsByUser.has(uid)) petsByUser.set(uid, []);
        petsByUser.get(uid)!.push(p);
      }

      // Batch-fetch recent public feed images
      const feedRows = await env.DB.prepare(
        `SELECT fp.id AS post_id, fp.author_user_id,
                fm.media_url, fm.thumbnail_url
         FROM feed_posts fp
         JOIN feed_media fm ON fm.post_id = fp.id AND fm.media_type = 'image'
         WHERE fp.author_user_id IN (${petPlaceholders})
           AND fp.visibility_scope = 'public' AND fp.status = 'published'
         ORDER BY fp.author_user_id, fp.created_at DESC`
      ).bind(...requesterIds).all<Record<string, unknown>>();

      const feedByUser = new Map<string, Record<string, unknown>[]>();
      for (const f of (feedRows.results || [])) {
        const uid = String(f.author_user_id || '');
        if (!feedByUser.has(uid)) feedByUser.set(uid, []);
        const arr = feedByUser.get(uid)!;
        if (arr.length < 5) arr.push(f);
      }

      // Attach to each request
      for (const r of requests) {
        const uid = String(r.requester_user_id || '');
        const allPets = petsByUser.get(uid) || [];
        (r as Record<string, unknown>).requester_pets = allPets.slice(0, 4);
        (r as Record<string, unknown>).requester_pets_total = allPets.length;
        (r as Record<string, unknown>).requester_feed_images = feedByUser.get(uid) || [];
      }
    }
  }

  return ok({ requests, scope });
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

  // Notify receiver — get actor display name for push body
  const actorProfile = await env.DB.prepare(
    'SELECT COALESCE(up.display_name, u.email) AS name FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.id = ?'
  ).bind(me.sub).first<{ name: string }>();
  const actorName = actorProfile?.name || meUser.email;

  await createAndPush(env, {
    userId: target.id,
    type: 'friend_request',
    actorUserId: me.sub,
    referenceId: id,
    referenceType: 'friend_request',
    title: actorName,
    body: `${actorName} sent you a friend request`,
    data: { link: '/#/guardian', type: 'friend_request', reference_id: id },
  });

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
       VALUES (?, ?, ?, 'friend', 'active', ?)
       ON CONFLICT DO NOTHING`
    ).bind(newId(), ordered.a, ordered.b, now()).run();

    // Notify requester that their request was accepted
    const acceptorProfile = await env.DB.prepare(
      'SELECT COALESCE(up.display_name, u.email) AS name FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.id = ?'
    ).bind(me.sub).first<{ name: string }>();
    const acceptorName = acceptorProfile?.name || '';

    await createAndPush(env, {
      userId: a,
      type: 'friend_accepted',
      actorUserId: me.sub,
      referenceId: requestId,
      referenceType: 'friend_request',
      title: acceptorName,
      body: `${acceptorName} accepted your friend request`,
      data: { link: '/#/guardian', type: 'friend_accepted', reference_id: requestId },
    });
  }

  return ok({ request_id: requestId, status });
}

async function listFriendPets(env: Env, me: JwtPayload): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT p.id AS pet_id, p.name AS pet_name,
            mi.code AS pet_type_code,
            u.id AS guardian_user_id, u.email AS guardian_email,
            COALESCE(up.display_name, u.email) AS guardian_name
     FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.user_a_id = ? THEN f.user_b_id ELSE f.user_a_id END
     JOIN pets p ON p.guardian_user_id = u.id AND p.status = 'active'
     LEFT JOIN master_items mi ON mi.id = p.pet_type_id
     LEFT JOIN user_profiles up ON up.user_id = u.id
     WHERE f.status = 'active' AND (f.user_a_id = ? OR f.user_b_id = ?)
     ORDER BY u.email, p.name`
  ).bind(me.sub, me.sub, me.sub).all<Record<string, unknown>>();

  return ok({ pets: rows.results });
}

async function deleteFriendship(env: Env, me: JwtPayload, friendshipId: string): Promise<Response> {
  const row = await env.DB.prepare(
    'SELECT id, user_a_id, user_b_id FROM friendships WHERE id = ?'
  ).bind(friendshipId).first<{ id: string; user_a_id: string; user_b_id: string }>();
  if (!row) return err('friendship not found', 404);

  if (row.user_a_id !== me.sub && row.user_b_id !== me.sub) return err('forbidden', 403);

  await env.DB.prepare('DELETE FROM friendships WHERE id = ?').bind(friendshipId).run();

  return ok({ deleted: true });
}

export async function handleFriends(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/friends', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listFriends(env, me);
  if ((sub === '/search' || sub === '/search/') && request.method === 'GET') return searchUser(env, me, url);
  if ((sub === '/pets' || sub === '/pets/') && request.method === 'GET') return listFriendPets(env, me);
  if ((sub === '/requests' || sub === '/requests/') && request.method === 'GET') return listRequests(env, me, url);
  if ((sub === '/requests' || sub === '/requests/') && request.method === 'POST') return createRequest(request, env, me);

  const respond = sub.match(/^\/requests\/([^/]+)\/respond$/);
  if (respond && request.method === 'POST') return respondRequest(request, env, me, respond[1]);

  const deleteFriend = sub.match(/^\/([^/]+)$/);
  if (deleteFriend && request.method === 'DELETE') return deleteFriendship(env, me, deleteFriend[1]);

  return err('Not found', 404);
}
