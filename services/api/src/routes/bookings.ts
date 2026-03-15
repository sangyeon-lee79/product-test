import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import { hasColumn } from '../helpers/sqlHelpers';

function parseJsonArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x) => typeof x === 'string') as string[];
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string') as string[];
  } catch {
    return [];
  }
}

function inferMediaType(url: string): 'image' | 'video' {
  const value = url.toLowerCase();
  if (/(\.mp4|\.mov|\.webm|\.mkv|\.avi)(\?|$)/.test(value)) return 'video';
  return 'image';
}

async function legacyFeedCompat(env: Env): Promise<{ hasBusinessCategoryId: boolean; hasPetTypeId: boolean }> {
  const [hasBusinessCategoryId, hasPetTypeId] = await Promise.all([
    hasColumn(env, 'feeds', 'business_category_id'),
    hasColumn(env, 'feeds', 'pet_type_id'),
  ]);
  return { hasBusinessCategoryId, hasPetTypeId };
}

function buildLegacyFeedInsert(
  compat: { hasBusinessCategoryId: boolean; hasPetTypeId: boolean },
  values: {
    id: string;
    authorUserId: string;
    petId: unknown;
    businessCategoryId: unknown;
    petTypeId: unknown;
    bookingId: string;
    supplierId: string;
    relatedServiceId: unknown;
    caption: string | null;
    mediaUrls: string;
    createdAt: string;
    updatedAt: string;
  },
): { sql: string; bindings: unknown[] } {
  const columns = ['id', 'feed_type', 'author_user_id', 'author_role', 'pet_id'];
  const bindings: unknown[] = [values.id, 'booking_completed', values.authorUserId, 'provider', values.petId ?? null];

  if (compat.hasBusinessCategoryId) {
    columns.push('business_category_id');
    bindings.push(values.businessCategoryId ?? null);
  }
  if (compat.hasPetTypeId) {
    columns.push('pet_type_id');
    bindings.push(values.petTypeId ?? null);
  }

  columns.push(
    'visibility_scope',
    'booking_id',
    'supplier_id',
    'related_service_id',
    'caption',
    'media_urls',
    'tags',
    'publish_request_status',
    'is_public',
    'status',
    'created_at',
    'updated_at',
  );
  bindings.push(
    'connected_only',
    values.bookingId,
    values.supplierId,
    values.relatedServiceId ?? null,
    values.caption,
    values.mediaUrls,
    '[]',
    'pending',
    0,
    'hidden',
    values.createdAt,
    values.updatedAt,
  );

  return {
    sql: `INSERT INTO feeds (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    bindings,
  };
}

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
  const timestamp = now();

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
  ).bind(newId(), bookingId, me.sub, mediaUrls, memo, timestamp, timestamp, timestamp).run();

  let feed = await env.DB.prepare(
    `SELECT id FROM feeds WHERE booking_id = ? AND feed_type = 'booking_completed'`
  ).bind(bookingId).first<{ id: string }>();

  if (!feed) {
    const feedId = newId();
    const compat = await legacyFeedCompat(env);
    const insert = buildLegacyFeedInsert(compat, {
      id: feedId,
      authorUserId: me.sub,
      petId: booking.pet_id ?? null,
      businessCategoryId: body.business_category_id ?? booking.business_category_id ?? null,
      petTypeId: body.pet_type_id ?? null,
      bookingId,
      supplierId: me.sub,
      relatedServiceId: booking.service_id ?? null,
      caption: memo,
      mediaUrls,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await env.DB.prepare(insert.sql).bind(...insert.bindings).run();
    feed = { id: feedId };
  }

  await env.DB.prepare(`UPDATE bookings SET status = 'publish_requested', updated_at = ? WHERE id = ?`).bind(timestamp, bookingId).run();

  if (booking.pet_id) {
    const urls = parseJsonArray(mediaUrls);
    for (let index = 0; index < urls.length; index += 1) {
      const mediaUrl = urls[index];
      await env.DB.prepare(
        `INSERT INTO pet_album_media (
          id, pet_id, source_type, source_id, booking_id,
          media_type, media_url, thumbnail_url, caption, tags,
          uploaded_by_user_id, visibility_scope, is_primary,
          sort_order, status, created_at, updated_at
        ) VALUES (?, ?, 'booking_completed', ?, ?, ?, ?, ?, ?, '[]', ?, 'guardian_supplier_only', 0, ?, 'pending', ?, ?)
        ON CONFLICT(pet_id, source_type, source_id, media_url)
        DO UPDATE SET
          booking_id = excluded.booking_id,
          media_type = excluded.media_type,
          thumbnail_url = excluded.thumbnail_url,
          caption = excluded.caption,
          uploaded_by_user_id = excluded.uploaded_by_user_id,
          visibility_scope = excluded.visibility_scope,
          sort_order = excluded.sort_order,
          status = excluded.status,
          updated_at = excluded.updated_at`
      ).bind(
        newId(),
        booking.pet_id,
        feed.id,
        bookingId,
        inferMediaType(mediaUrl),
        mediaUrl,
        mediaUrl,
        memo,
        me.sub,
        index,
        timestamp,
        timestamp,
      ).run();
    }
  }
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
