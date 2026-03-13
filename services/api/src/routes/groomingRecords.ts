import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import { createAndPush } from '../helpers/pushHelper';

function parsePhotos(raw: unknown): Array<{ url: string; isMain: boolean }> {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p): p is { url: string; isMain: boolean } =>
      typeof p === 'object' && p !== null && typeof (p as Record<string, unknown>).url === 'string'
  ).map((p) => ({ url: p.url, isMain: !!p.isMain }));
}

function inferMediaType(url: string): 'image' | 'video' {
  const v = url.toLowerCase();
  if (/(\.mp4|\.mov|\.webm|\.mkv|\.avi)(\?|$)/.test(v)) return 'video';
  return 'image';
}

/* ─── Create grooming record (supplier) ─── */
async function createGroomingRecord(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['provider']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const appointmentId = String(body.appointmentId ?? body.appointment_id ?? '').trim();
  const petId = String(body.petId ?? body.pet_id ?? '').trim();
  const guardianId = String(body.guardianId ?? body.guardian_id ?? '').trim();
  if (!guardianId) return err('guardianId required');

  // Validate appointment if provided
  if (appointmentId) {
    const apt = await env.DB.prepare(
      'SELECT id, status FROM appointments WHERE id = ? AND supplier_id = ?'
    ).bind(appointmentId, me.sub).first<Record<string, unknown>>();
    if (!apt) return err('appointment not found', 404);
  }

  const photos = parsePhotos(body.photos);
  const id = newId();
  const timestamp = now();

  const cutStyleItemId = String(body.cutStyleItemId ?? body.cut_style_item_id ?? '').trim() || null;
  const customCutName = String(body.customCutName ?? body.custom_cut_name ?? '').trim() || null;
  const memo = String(body.memo ?? '').trim() || null;

  await env.DB.prepare(
    `INSERT INTO grooming_records (
      id, appointment_id, pet_id, supplier_id, guardian_id,
      grooming_type, cut_style, duration_minutes, products_used,
      special_notes, supplier_comment, photos,
      cut_style_item_id, custom_cut_name, memo,
      status, created_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, 'pending_guardian', ?, ?)`
  ).bind(
    id,
    appointmentId || null,
    petId || null,
    me.sub,
    guardianId,
    body.groomingType ?? body.grooming_type ?? null,
    body.cutStyle ?? body.cut_style ?? null,
    body.durationMinutes ?? body.duration_minutes ?? null,
    body.productsUsed ?? body.products_used ?? null,
    body.specialNotes ?? body.special_notes ?? null,
    body.supplierComment ?? body.supplier_comment ?? null,
    JSON.stringify(photos),
    cutStyleItemId,
    customCutName,
    memo,
    timestamp,
    timestamp,
  ).run();

  // Mark appointment as completed if linked
  if (appointmentId) {
    await env.DB.prepare(
      'UPDATE appointments SET status = ?, updated_at = ? WHERE id = ?'
    ).bind('completed', timestamp, appointmentId).run();
  }

  // Get supplier name for notification
  const supplierRow = await env.DB.prepare(
    `SELECT COALESCE(up.display_name, u.email) AS name
     FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.id = ?`
  ).bind(me.sub).first<{ name: string }>();
  const supplierName = supplierRow?.name || '';

  // Notify guardian via in-app + FCM push
  await createAndPush(env, {
    userId: guardianId,
    type: 'grooming_complete',
    actorUserId: me.sub,
    referenceId: id,
    referenceType: 'grooming_record',
    title: 'Grooming Complete',
    body: supplierName ? `${supplierName} sent a completion notice` : 'Grooming is complete',
    data: { link: '/#/guardian', grooming_record_id: id },
  });

  return created({ id, status: 'pending_guardian' });
}

/* ─── Guardian choice ─── */
async function guardianChoice(request: Request, env: Env, me: JwtPayload, id: string): Promise<Response> {
  const record = await env.DB.prepare(
    'SELECT * FROM grooming_records WHERE id = ? AND guardian_id = ?'
  ).bind(id, me.sub).first<Record<string, unknown>>();
  if (!record) return err('grooming record not found', 404);
  if (record.status !== 'pending_guardian') return err('already processed');

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }
  const choice = String(body.choice || '').trim();
  if (!['feed_only', 'approve_only', 'approve_and_feed'].includes(choice)) {
    return err('choice must be feed_only | approve_only | approve_and_feed');
  }

  const timestamp = now();
  let postId: string | null = null;

  if (choice === 'approve_only') {
    // Just approve, no feed
    await env.DB.prepare(
      'UPDATE grooming_records SET status = ?, guardian_choice = ?, guardian_choice_at = ?, completed_at = ? WHERE id = ?'
    ).bind('approved', choice, timestamp, timestamp, id).run();
  } else {
    // feed_only or approve_and_feed → create feed post
    postId = newId();
    const photos = parsePhotos(record.photos);
    const sortedPhotos = [...photos].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));

    // Build grooming tags
    const groomingTags: Array<{ icon: string; label: string }> = [];
    if (record.cut_style) groomingTags.push({ icon: '\u2702\uFE0F', label: String(record.cut_style) });
    if (record.grooming_type) groomingTags.push({ icon: '\uD83D\uDEC1', label: String(record.grooming_type) });
    if (record.duration_minutes) groomingTags.push({ icon: '\u23F1', label: `${record.duration_minutes}min` });

    // Insert feed_post
    await env.DB.prepare(
      `INSERT INTO feed_posts (
        id, author_user_id, author_role, author_type, supplier_id,
        feed_type, post_type, visibility_scope, caption,
        grooming_record_id, grooming_tags,
        status, created_at, updated_at
      ) VALUES (?, ?, 'provider', 'supplier', ?,
        'grooming_completed', 'GROOMING', 'public', ?,
        ?, ?::jsonb,
        'published', ?, ?)`
    ).bind(
      postId,
      String(record.supplier_id),
      String(record.supplier_id),
      String(record.supplier_comment || ''),
      id,
      JSON.stringify(groomingTags),
      timestamp,
      timestamp,
    ).run();

    // Link pet
    if (record.pet_id) {
      await env.DB.prepare(
        `INSERT INTO feed_post_pets (id, post_id, pet_id, sort_order)
         VALUES (?, ?, ?, 0) ON CONFLICT DO NOTHING`
      ).bind(newId(), postId, String(record.pet_id)).run();
    }

    // Insert feed media
    for (const [index, photo] of sortedPhotos.entries()) {
      await env.DB.prepare(
        `INSERT INTO feed_media (id, post_id, media_type, media_url, thumbnail_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(newId(), postId, inferMediaType(photo.url), photo.url, photo.url, index).run();
    }

    const newStatus = choice === 'approve_and_feed' ? 'published' : 'published';
    await env.DB.prepare(
      'UPDATE grooming_records SET status = ?, guardian_choice = ?, guardian_choice_at = ?, post_id = ?, completed_at = ? WHERE id = ?'
    ).bind(newStatus, choice, timestamp, postId, timestamp, id).run();
  }

  return ok({ id, status: choice === 'approve_only' ? 'approved' : 'published', post_id: postId });
}

/* ─── List grooming records ─── */
async function listGroomingRecords(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const petId = url.searchParams.get('petId');
  const supplierId = url.searchParams.get('supplierId');
  const appointmentId = url.searchParams.get('appointmentId');

  let sql = `SELECT gr.*,
      p.name AS pet_name, p.avatar_url AS pet_avatar,
      COALESCE(gup.display_name, gu.email) AS guardian_name,
      COALESCE(sup.display_name, su.email) AS supplier_name
    FROM grooming_records gr
    LEFT JOIN pets p ON p.id = gr.pet_id
    LEFT JOIN users gu ON gu.id = gr.guardian_id
    LEFT JOIN user_profiles gup ON gup.user_id = gr.guardian_id
    LEFT JOIN users su ON su.id = gr.supplier_id
    LEFT JOIN user_profiles sup ON sup.user_id = gr.supplier_id
    WHERE 1=1`;
  const binds: unknown[] = [];

  if (appointmentId) {
    sql += ' AND gr.appointment_id = ?';
    binds.push(appointmentId);
  } else if (petId) {
    sql += ' AND gr.pet_id = ?';
    binds.push(petId);
  } else if (supplierId) {
    sql += ' AND gr.supplier_id = ?';
    binds.push(supplierId);
  } else {
    sql += ' AND (gr.guardian_id = ? OR gr.supplier_id = ?)';
    binds.push(me.sub, me.sub);
  }

  sql += ' ORDER BY gr.created_at DESC';
  const rows = await env.DB.prepare(sql).bind(...binds).all();

  // Parse photos JSONB
  const results = rows.results.map((r: Record<string, unknown>) => ({
    ...r,
    photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos,
  }));

  return ok({ grooming_records: results });
}

/* ─── Get single grooming record ─── */
async function getGroomingRecord(env: Env, me: JwtPayload, id: string): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT gr.*,
      p.name AS pet_name, p.avatar_url AS pet_avatar,
      COALESCE(gup.display_name, gu.email) AS guardian_name,
      COALESCE(sup.display_name, su.email) AS supplier_name
    FROM grooming_records gr
    LEFT JOIN pets p ON p.id = gr.pet_id
    LEFT JOIN users gu ON gu.id = gr.guardian_id
    LEFT JOIN user_profiles gup ON gup.user_id = gr.guardian_id
    LEFT JOIN users su ON su.id = gr.supplier_id
    LEFT JOIN user_profiles sup ON sup.user_id = gr.supplier_id
    WHERE gr.id = ? AND (gr.guardian_id = ? OR gr.supplier_id = ?)`
  ).bind(id, me.sub, me.sub).first<Record<string, unknown>>();
  if (!row) return err('grooming record not found', 404);

  return ok({
    grooming_record: {
      ...row,
      photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : row.photos,
    },
  });
}

/* ─── Router ─── */
export async function handleGroomingRecords(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/grooming-records', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listGroomingRecords(env, me, url);
  if ((sub === '' || sub === '/') && request.method === 'POST') return createGroomingRecord(request, env, me);

  const choiceMatch = sub.match(/^\/([^/]+)\/guardian-choice$/);
  if (choiceMatch && request.method === 'PATCH') return guardianChoice(request, env, me, choiceMatch[1]);

  const singleMatch = sub.match(/^\/([^/]+)$/);
  if (singleMatch && request.method === 'GET') return getGroomingRecord(env, me, singleMatch[1]);

  return err('Not found', 404);
}
