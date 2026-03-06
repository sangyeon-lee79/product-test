import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

async function listBookings(env: Env, me: JwtPayload): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT * FROM bookings
     WHERE (guardian_id = ? OR supplier_id = ?)
     ORDER BY created_at DESC`
  ).bind(me.sub, me.sub).all();
  return ok({ bookings: rows.results });
}

async function createBooking(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['guardian']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const supplierId = String(body.supplier_id || '').trim();
  if (!supplierId) return err('supplier_id required');

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO bookings (
      id, guardian_id, supplier_id, pet_id, service_id, business_category_id,
      status, requested_date, requested_time, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'created', ?, ?, ?, ?, ?)`
  ).bind(
    id,
    me.sub,
    supplierId,
    body.pet_id ?? null,
    body.service_id ?? null,
    body.business_category_id ?? null,
    body.requested_date ?? null,
    body.requested_time ?? null,
    body.notes ?? null,
    now(),
    now(),
  ).run();

  return created({ id });
}

async function updateBookingStatus(request: Request, env: Env, me: JwtPayload, id: string): Promise<Response> {
  let body: { status?: string };
  try { body = await request.json() as { status?: string }; } catch { return err('Invalid JSON'); }
  const status = (body.status || '').trim();
  if (!status) return err('status required');

  const booking = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  if (!booking) return err('booking not found', 404);

  const isGuardian = String(booking.guardian_id) === me.sub;
  const isSupplier = String(booking.supplier_id) === me.sub;
  if (!isGuardian && !isSupplier) return err('forbidden', 403);

  const allowed = ['created', 'in_progress', 'service_completed', 'publish_requested', 'publish_approved', 'publish_rejected', 'cancelled'];
  if (!allowed.includes(status)) return err('invalid status');

  if (status === 'in_progress' && !isSupplier) return err('only supplier can set in_progress', 403);
  if (status === 'service_completed' && !isSupplier) return err('only supplier can set service_completed', 403);
  if (status === 'cancelled' && !(isGuardian || isSupplier)) return err('forbidden', 403);

  await env.DB.prepare(
    `UPDATE bookings
     SET status = ?, completed_at = CASE WHEN ? = 'service_completed' THEN ? ELSE completed_at END, updated_at = ?
     WHERE id = ?`
  ).bind(status, status, now(), now(), id).run();

  return ok({ id, status });
}

async function supplierCompletionRequest(request: Request, env: Env, me: JwtPayload, bookingId: string): Promise<Response> {
  const roleErr = requireRole(me, ['provider']);
  if (roleErr) return roleErr;

  const booking = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ? AND supplier_id = ?`).bind(bookingId, me.sub).first<Record<string, unknown>>();
  if (!booking) return err('booking not found', 404);
  if (!['service_completed', 'publish_requested', 'publish_rejected'].includes(String(booking.status || ''))) {
    return err('booking must be service_completed first');
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const mediaUrls = Array.isArray(body.media_urls)
    ? JSON.stringify((body.media_urls as unknown[]).filter((x) => typeof x === 'string').map((x) => (x as string).trim()).filter(Boolean))
    : '[]';
  const memo = typeof body.completion_memo === 'string' ? body.completion_memo.trim() : null;

  await env.DB.prepare(
    `INSERT INTO booking_completion_contents (
      id, booking_id, supplier_id, media_urls, completion_memo, publish_status, requested_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    ON CONFLICT(booking_id) DO UPDATE SET
      media_urls = excluded.media_urls,
      completion_memo = excluded.completion_memo,
      publish_status = 'pending',
      requested_at = excluded.requested_at,
      updated_at = excluded.updated_at`
  ).bind(newId(), bookingId, me.sub, mediaUrls, memo, now(), now(), now()).run();

  let feed = await env.DB.prepare(
    `SELECT id FROM feeds WHERE booking_id = ? AND feed_type = 'booking_completed'`
  ).bind(bookingId).first<{ id: string }>();

  if (!feed) {
    const feedId = newId();
    await env.DB.prepare(
      `INSERT INTO feeds (
        id, feed_type, author_user_id, author_role, pet_id, business_category_id, pet_type_id,
        visibility_scope, booking_id, supplier_id, related_service_id,
        caption, media_urls, tags, publish_request_status, is_public, status, created_at, updated_at
      ) VALUES (?, 'booking_completed', ?, 'provider', ?, ?, ?, 'connected_only', ?, ?, ?, ?, ?, '[]', 'pending', 0, 'hidden', ?, ?)`
    ).bind(
      feedId,
      me.sub,
      booking.pet_id ?? null,
      body.business_category_id ?? booking.business_category_id ?? null,
      body.pet_type_id ?? null,
      bookingId,
      me.sub,
      booking.service_id ?? null,
      memo,
      mediaUrls,
      now(),
      now(),
    ).run();
    feed = { id: feedId };
  }

  await env.DB.prepare(`UPDATE bookings SET status = 'publish_requested', updated_at = ? WHERE id = ?`).bind(now(), bookingId).run();
  return ok({ booking_id: bookingId, feed_id: feed.id, status: 'publish_requested' });
}

export async function handleBookings(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/bookings', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listBookings(env, me);
  if ((sub === '' || sub === '/') && request.method === 'POST') return createBooking(request, env, me);

  const statusMatch = sub.match(/^\/([^/]+)\/status$/);
  if (statusMatch && request.method === 'PUT') return updateBookingStatus(request, env, me, statusMatch[1]);

  const completionMatch = sub.match(/^\/([^/]+)\/completion-request$/);
  if (completionMatch && request.method === 'POST') return supplierCompletionRequest(request, env, me, completionMatch[1]);

  return err('Not found', 404);
}
