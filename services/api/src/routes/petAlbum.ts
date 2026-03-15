import type { Env, JwtPayload } from '../types';
import { created, err, newId, now, ok } from '../types';
import { requireAuth, verifyJwt } from '../middleware/auth';
import { hasTable } from '../helpers/sqlHelpers';

type AlbumRow = Record<string, unknown>;

const SOURCE_TYPES = new Set(['profile', 'feed', 'booking_completed', 'health_record', 'manual_upload']);
const MEDIA_TYPES = new Set(['image', 'video']);
const VISIBILITY = new Set(['public', 'friends_only', 'private', 'guardian_supplier_only', 'booking_related']);

function parseJsonArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x) => typeof x === 'string') as string[];
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') as string[] : [];
  } catch {
    return [];
  }
}

function toJsonArray(value: unknown): string {
  if (!Array.isArray(value)) return '[]';
  return JSON.stringify(value.filter((x) => typeof x === 'string').map((x) => (x as string).trim()).filter(Boolean));
}

function optionalBool(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (lowered === 'true' || lowered === '1') return true;
    if (lowered === 'false' || lowered === '0') return false;
  }
  return null;
}

function detectMediaType(url: string): 'image' | 'video' {
  const value = url.toLowerCase();
  if (/(\.mp4|\.mov|\.webm|\.mkv|\.avi)(\?|$)/.test(value)) return 'video';
  return 'image';
}

function normalizeVisibility(raw: unknown): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (value === 'connected_only') return 'guardian_supplier_only';
  if (value === 'booking_related_only') return 'booking_related';
  return value;
}

async function optionalAuth(request: Request, env: Env): Promise<JwtPayload | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return await verifyJwt(auth.slice(7), env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function friendSet(env: Env, userId: string): Promise<Set<string>> {
  const rows = await env.DB.prepare(
    `SELECT user_a_id, user_b_id FROM friendships
     WHERE status = 'active' AND (user_a_id = ? OR user_b_id = ?)`
  ).bind(userId, userId).all<{ user_a_id: string; user_b_id: string }>();
  const set = new Set<string>();
  for (const row of rows.results) {
    set.add(row.user_a_id === userId ? row.user_b_id : row.user_a_id);
  }
  return set;
}

function normalizeRow(row: AlbumRow): AlbumRow {
  return {
    ...row,
    tags: parseJsonArray(row.tags),
    is_primary: Number(row.is_primary || 0),
    sort_order: Number(row.sort_order || 0),
  };
}

function canViewAlbum(row: AlbumRow, me: JwtPayload | null, friends: Set<string>): boolean {
  const status = String(row.status || 'hidden');
  const visibility = normalizeVisibility(row.visibility_scope || 'private');
  const petGuardianId = String(row.pet_guardian_id || '');
  const uploadedBy = String(row.uploaded_by_user_id || '');
  const bookingGuardian = String(row.booking_guardian_id || '');
  const bookingSupplier = String(row.booking_supplier_id || '');

  if (me?.role === 'admin') return status !== 'deleted';

  if (me && (me.sub === petGuardianId || me.sub === uploadedBy)) {
    return status !== 'deleted';
  }

  if (status !== 'active') return false;

  if (visibility === 'public') return true;
  if (!me) return false;

  if (visibility === 'friends_only') return friends.has(petGuardianId);
  if (visibility === 'private') return false;

  if (visibility === 'guardian_supplier_only') {
    if (me.sub === bookingGuardian || me.sub === bookingSupplier) return true;
    return friends.has(petGuardianId);
  }

  if (visibility === 'booking_related') {
    return me.sub === bookingGuardian || me.sub === bookingSupplier;
  }

  return false;
}

async function listAlbum(request: Request, env: Env, url: URL): Promise<Response> {
  const me = await optionalAuth(request, env);
  const friends = me ? await friendSet(env, me.sub) : new Set<string>();
  const hasBookings = await hasTable(env, 'bookings');

  const petId = (url.searchParams.get('pet_id') || '').trim();
  const sourceType = (url.searchParams.get('source_type') || '').trim();
  const mediaType = (url.searchParams.get('media_type') || '').trim();
  const visibilityScope = normalizeVisibility(url.searchParams.get('visibility_scope') || '');
  const includePending = (url.searchParams.get('include_pending') || '').trim() === 'true';
  const sort = (url.searchParams.get('sort') || 'latest').trim();
  const limit = Math.min(300, Math.max(1, Number(url.searchParams.get('limit') || 120)));

  if (!petId && (!me || (me.role !== 'guardian' && me.role !== 'admin'))) {
    return err('pet_id required');
  }

  const where: string[] = ["pam.status != 'deleted'"];
  const params: Array<string | number> = [];

  if (petId) {
    where.push('pam.pet_id = ?');
    params.push(petId);
  } else if (me?.role === 'guardian') {
    where.push('p.guardian_user_id = ?');
    params.push(me.sub);
  }

  if (sourceType) {
    where.push('pam.source_type = ?');
    params.push(sourceType);
  }
  if (mediaType) {
    where.push('pam.media_type = ?');
    params.push(mediaType);
  }
  if (visibilityScope) {
    where.push('pam.visibility_scope = ?');
    params.push(visibilityScope);
  }
  if (!includePending) {
    where.push("pam.status = 'active'");
  }

  const rows = await env.DB.prepare(
    `SELECT
      pam.*,
      p.guardian_user_id AS pet_guardian_id,
      u.email AS uploaded_by_email,
      ${hasBookings ? 'b.guardian_id' : 'NULL'} AS booking_guardian_id,
      ${hasBookings ? 'b.supplier_id' : 'NULL'} AS booking_supplier_id
     FROM pet_album_media pam
     INNER JOIN pets p ON p.id = pam.pet_id
     LEFT JOIN users u ON u.id = pam.uploaded_by_user_id
     ${hasBookings ? 'LEFT JOIN bookings b ON b.id = pam.booking_id' : ''}
     WHERE ${where.join(' AND ')}
     ORDER BY pam.created_at ${sort === 'oldest' ? 'ASC' : 'DESC'}, pam.id DESC
     LIMIT ?`
  ).bind(...params, limit).all<AlbumRow>();

  const filtered = rows.results
    .map(normalizeRow)
    .filter((row) => canViewAlbum(row, me, friends));

  return ok({ media: filtered, filters: { pet_id: petId || null, source_type: sourceType || null, media_type: mediaType || null, sort } });
}

async function createAlbumMedia(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const petId = String(body.pet_id || '').trim();
  if (!petId) return err('pet_id required');

  const pet = await env.DB.prepare("SELECT id, guardian_user_id AS guardian_id FROM pets WHERE id = ? AND status != 'deleted'").bind(petId).first<{ id: string; guardian_id: string }>();
  if (!pet) return err('pet not found', 404);

  const sourceType = String(body.source_type || '').trim() || 'manual_upload';
  if (!SOURCE_TYPES.has(sourceType)) return err('invalid source_type');

  const mediaUrl = String(body.media_url || '').trim();
  if (!mediaUrl) return err('media_url required');

  const mediaTypeRaw = String(body.media_type || '').trim();
  const mediaType = (mediaTypeRaw && MEDIA_TYPES.has(mediaTypeRaw)) ? mediaTypeRaw : detectMediaType(mediaUrl);

  const visibilityRaw = normalizeVisibility(body.visibility_scope);
  const defaultVisibility = sourceType === 'health_record' ? 'private' : sourceType === 'booking_completed' ? 'booking_related' : 'public';
  const visibilityScope = visibilityRaw || defaultVisibility;
  if (!VISIBILITY.has(visibilityScope)) return err('invalid visibility_scope');

  const isOwnerPet = pet.guardian_id === me.sub;
  if (me.role === 'guardian' && !isOwnerPet) return err('forbidden', 403);

  const bookingId = body.booking_id ? String(body.booking_id).trim() : null;
  const requestedPrimary = optionalBool(body.is_primary) === true;

  let status = String(body.status || '').trim();
  if (!status) status = me.role === 'provider' ? 'pending' : 'active';
  if (!['active', 'pending', 'hidden', 'deleted'].includes(status)) return err('invalid status');

  if (me.role === 'provider') {
    if (sourceType !== 'booking_completed') return err('provider can upload booking_completed only', 403);
    if (!bookingId) return err('booking_id required for provider upload');
    if (!await hasTable(env, 'bookings')) return err('booking feature unavailable', 503);
    const booking = await env.DB.prepare(
      'SELECT id, pet_id, supplier_id FROM bookings WHERE id = ?'
    ).bind(bookingId).first<{ id: string; pet_id: string | null; supplier_id: string }>();
    if (!booking) return err('booking not found', 404);
    if (booking.supplier_id !== me.sub) return err('forbidden', 403);
    if (booking.pet_id !== petId) return err('booking pet_id mismatch', 400);
    if (requestedPrimary) return err('provider cannot set profile primary', 403);
    status = 'pending';
  }

  if (requestedPrimary && sourceType !== 'profile') return err('is_primary requires profile source_type');

  const id = newId();
  const timestamp = now();

  await env.DB.prepare(
    `INSERT INTO pet_album_media (
      id, pet_id, source_type, source_id, booking_id,
      media_type, media_url, thumbnail_url, caption, tags,
      uploaded_by_user_id, visibility_scope, is_primary,
      sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    petId,
    sourceType,
    body.source_id ?? null,
    bookingId,
    mediaType,
    mediaUrl,
    body.thumbnail_url ?? mediaUrl,
    typeof body.caption === 'string' ? body.caption.trim() : null,
    toJsonArray(body.tags),
    me.sub,
    visibilityScope,
    requestedPrimary ? true : false,
    Number(body.sort_order ?? 0) || 0,
    status,
    timestamp,
    timestamp,
  ).run();

  if (requestedPrimary) {
    await env.DB.prepare(
      `UPDATE pet_album_media
       SET is_primary = CASE WHEN id = ? THEN true ELSE false END,
           updated_at = ?
       WHERE pet_id = ? AND source_type = 'profile' AND status = 'active'`
    ).bind(id, now(), petId).run();
    await env.DB.prepare(`UPDATE pets SET avatar_url = ?, updated_at = ? WHERE id = ?`).bind(mediaUrl, now(), petId).run();
  }

  const saved = await env.DB.prepare('SELECT * FROM pet_album_media WHERE id = ?').bind(id).first<AlbumRow>();
  return created({ media: normalizeRow(saved || { id }) });
}

async function updateAlbumMedia(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const row = await env.DB.prepare(
    `SELECT pam.*, p.guardian_user_id AS pet_guardian_id
     FROM pet_album_media pam
     INNER JOIN pets p ON p.id = pam.pet_id
     WHERE pam.id = ?`
  ).bind(id).first<AlbumRow>();
  if (!row) return err('media not found', 404);

  const isOwnerPet = String(row.pet_guardian_id || '') === me.sub;
  const isUploader = String(row.uploaded_by_user_id || '') === me.sub;
  const isAdmin = me.role === 'admin';
  if (!isOwnerPet && !isUploader && !isAdmin) return err('forbidden', 403);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const sets: string[] = ['updated_at = ?'];
  const values: unknown[] = [now()];

  if (body.caption !== undefined) {
    sets.push('caption = ?');
    values.push(typeof body.caption === 'string' ? body.caption.trim() : null);
  }
  if (body.thumbnail_url !== undefined) {
    sets.push('thumbnail_url = ?');
    values.push(typeof body.thumbnail_url === 'string' ? body.thumbnail_url.trim() || null : null);
  }
  if (body.tags !== undefined) {
    sets.push('tags = ?');
    values.push(toJsonArray(body.tags));
  }
  if (body.sort_order !== undefined) {
    sets.push('sort_order = ?');
    values.push(Number(body.sort_order) || 0);
  }

  if (body.visibility_scope !== undefined) {
    const visibility = normalizeVisibility(body.visibility_scope);
    if (!VISIBILITY.has(visibility)) return err('invalid visibility_scope');
    if (me.role === 'provider' && !['guardian_supplier_only', 'booking_related'].includes(visibility)) {
      return err('provider visibility restricted', 403);
    }
    sets.push('visibility_scope = ?');
    values.push(visibility);
  }

  if (body.status !== undefined) {
    if (!isOwnerPet && !isAdmin) return err('status can be changed by pet guardian only', 403);
    const status = String(body.status || '').trim();
    if (!['active', 'pending', 'hidden', 'deleted'].includes(status)) return err('invalid status');
    sets.push('status = ?');
    values.push(status);
  }

  let requestedPrimary = false;
  if (body.is_primary !== undefined) {
    const bool = optionalBool(body.is_primary);
    if (bool === null) return err('invalid is_primary');
    if (!isOwnerPet && !isAdmin) return err('is_primary can be changed by pet guardian only', 403);
    if (String(row.source_type || '') !== 'profile') return err('is_primary requires profile source_type');
    sets.push('is_primary = ?');
    values.push(bool ? true : false);
    requestedPrimary = bool;
  }

  if (sets.length === 1) return err('nothing to update');

  values.push(id);
  await env.DB.prepare(`UPDATE pet_album_media SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();

  if (requestedPrimary) {
    await env.DB.prepare(
      `UPDATE pet_album_media
       SET is_primary = CASE WHEN id = ? THEN true ELSE false END,
           updated_at = ?
       WHERE pet_id = ? AND source_type = 'profile' AND status = 'active'`
    ).bind(id, now(), row.pet_id).run();
    const primary = await env.DB.prepare(
      `SELECT media_url FROM pet_album_media WHERE id = ? LIMIT 1`
    ).bind(id).first<{ media_url: string }>();
    await env.DB.prepare(`UPDATE pets SET avatar_url = ?, updated_at = ? WHERE id = ?`).bind(primary?.media_url ?? null, now(), row.pet_id).run();
  }

  const updated = await env.DB.prepare('SELECT * FROM pet_album_media WHERE id = ?').bind(id).first<AlbumRow>();
  return ok({ media: normalizeRow(updated || { id }) });
}

async function deleteAlbumMedia(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const row = await env.DB.prepare(
    `SELECT pam.*, p.guardian_user_id AS pet_guardian_id
     FROM pet_album_media pam
     INNER JOIN pets p ON p.id = pam.pet_id
     WHERE pam.id = ?`
  ).bind(id).first<AlbumRow>();
  if (!row) return err('media not found', 404);

  const isOwnerPet = String(row.pet_guardian_id || '') === me.sub;
  const isUploader = String(row.uploaded_by_user_id || '') === me.sub;
  const isAdmin = me.role === 'admin';
  if (!isOwnerPet && !isUploader && !isAdmin) return err('forbidden', 403);

  await env.DB.prepare(
    `UPDATE pet_album_media
     SET status = 'deleted', is_primary = false, updated_at = ?
     WHERE id = ?`
  ).bind(now(), id).run();

  if (Number(row.is_primary || 0) === 1) {
    const next = await env.DB.prepare(
      `SELECT id FROM pet_album_media
       WHERE pet_id = ? AND source_type = 'profile' AND status = 'active'
       ORDER BY created_at DESC, id DESC
       LIMIT 1`
    ).bind(row.pet_id).first<{ id: string }>();

    if (next?.id) {
      await env.DB.prepare(`UPDATE pet_album_media SET is_primary = true, updated_at = ? WHERE id = ?`).bind(now(), next.id).run();
      const nextPrimary = await env.DB.prepare(`SELECT media_url FROM pet_album_media WHERE id = ?`).bind(next.id).first<{ media_url: string }>();
      await env.DB.prepare(`UPDATE pets SET avatar_url = ?, updated_at = ? WHERE id = ?`).bind(nextPrimary?.media_url ?? null, now(), row.pet_id).run();
    } else {
      await env.DB.prepare(`UPDATE pets SET avatar_url = NULL, updated_at = ? WHERE id = ?`).bind(now(), row.pet_id).run();
    }
  }

  return ok({ deleted: true, id });
}

async function getAlbumMedia(request: Request, env: Env, id: string): Promise<Response> {
  const me = await optionalAuth(request, env);
  const friends = me ? await friendSet(env, me.sub) : new Set<string>();
  const hasBookings = await hasTable(env, 'bookings');

  const row = await env.DB.prepare(
    `SELECT pam.*, p.guardian_user_id AS pet_guardian_id, u.email AS uploaded_by_email,
            ${hasBookings ? 'b.guardian_id' : 'NULL'} AS booking_guardian_id, ${hasBookings ? 'b.supplier_id' : 'NULL'} AS booking_supplier_id
     FROM pet_album_media pam
     INNER JOIN pets p ON p.id = pam.pet_id
     LEFT JOIN users u ON u.id = pam.uploaded_by_user_id
     ${hasBookings ? 'LEFT JOIN bookings b ON b.id = pam.booking_id' : ''}
     WHERE pam.id = ?`
  ).bind(id).first<AlbumRow>();

  if (!row) return err('media not found', 404);
  const normalized = normalizeRow(row);
  if (!canViewAlbum(normalized, me, friends)) return err('forbidden', 403);
  return ok({ media: normalized });
}

export async function handlePetAlbum(request: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.replace('/api/v1/pet-album', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listAlbum(request, env, url);
  if ((sub === '' || sub === '/') && request.method === 'POST') return createAlbumMedia(request, env);

  const itemMatch = sub.match(/^\/([^/]+)$/);
  if (itemMatch && request.method === 'GET') return getAlbumMedia(request, env, itemMatch[1]);
  if (itemMatch && request.method === 'PUT') return updateAlbumMedia(request, env, itemMatch[1]);
  if (itemMatch && request.method === 'DELETE') return deleteAlbumMedia(request, env, itemMatch[1]);

  return err('Not found', 404);
}
