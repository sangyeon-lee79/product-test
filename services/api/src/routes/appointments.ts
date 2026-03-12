import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

/* ─── List appointments ─── */
async function listAppointments(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const supplierId = url.searchParams.get('supplierId');
  const guardianId = url.searchParams.get('guardianId');
  const status = url.searchParams.get('status');

  let sql = `SELECT a.*,
      p.name AS pet_name, p.avatar_url AS pet_avatar,
      COALESCE(gup.display_name, gu.email) AS guardian_name,
      gu.email AS guardian_email,
      COALESCE(sup.display_name, su.email) AS supplier_name,
      su.email AS supplier_email
    FROM appointments a
    LEFT JOIN pets p ON p.id = a.pet_id
    LEFT JOIN users gu ON gu.id = a.guardian_id
    LEFT JOIN user_profiles gup ON gup.user_id = a.guardian_id
    LEFT JOIN users su ON su.id = a.supplier_id
    LEFT JOIN user_profiles sup ON sup.user_id = a.supplier_id
    WHERE 1=1`;
  const binds: unknown[] = [];

  if (supplierId) {
    sql += ' AND a.supplier_id = ?';
    binds.push(supplierId);
  } else if (guardianId) {
    sql += ' AND a.guardian_id = ?';
    binds.push(guardianId);
  } else {
    // Default: show my appointments
    sql += ' AND (a.guardian_id = ? OR a.supplier_id = ?)';
    binds.push(me.sub, me.sub);
  }

  if (status) {
    sql += ' AND a.status = ?';
    binds.push(status);
  }

  sql += ' ORDER BY a.created_at DESC';

  const rows = await env.DB.prepare(sql).bind(...binds).all();
  return ok({ appointments: rows.results });
}

/* ─── Create appointment (guardian) ─── */
async function createAppointment(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['guardian']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const petId = String(body.petId || body.pet_id || '').trim();
  const supplierId = String(body.supplierId || body.supplier_id || '').trim();
  if (!supplierId) return err('supplierId required');

  const id = newId();
  const timestamp = now();

  await env.DB.prepare(
    `INSERT INTO appointments (
      id, pet_id, guardian_id, supplier_id, store_id, service_id,
      service_type, scheduled_at, duration_minutes, price, request_note,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    id,
    petId || null,
    me.sub,
    supplierId,
    body.storeId ?? body.store_id ?? null,
    body.serviceId ?? body.service_id ?? null,
    body.serviceType ?? body.service_type ?? '',
    body.scheduledAt ?? body.scheduled_at ?? null,
    body.durationMinutes ?? body.duration_minutes ?? null,
    body.price ?? null,
    body.requestNote ?? body.request_note ?? null,
    timestamp,
    timestamp,
  ).run();

  // Notify supplier
  await env.DB.prepare(
    `INSERT INTO notifications (id, user_id, type, actor_user_id, reference_id, reference_type, created_at)
     VALUES (?, ?, 'appointment_request', ?, ?, 'appointment', ?)`
  ).bind(newId(), supplierId, me.sub, id, timestamp).run();

  return created({ id, status: 'pending' });
}

/* ─── Confirm appointment (supplier) ─── */
async function confirmAppointment(request: Request, env: Env, me: JwtPayload, id: string): Promise<Response> {
  const appointment = await env.DB.prepare(
    'SELECT * FROM appointments WHERE id = ? AND supplier_id = ?'
  ).bind(id, me.sub).first<Record<string, unknown>>();
  if (!appointment) return err('appointment not found', 404);
  if (appointment.status !== 'pending') return err('can only confirm pending appointments');

  const timestamp = now();
  await env.DB.prepare(
    'UPDATE appointments SET status = ?, updated_at = ? WHERE id = ?'
  ).bind('confirmed', timestamp, id).run();

  // Notify guardian
  await env.DB.prepare(
    `INSERT INTO notifications (id, user_id, type, actor_user_id, reference_id, reference_type, created_at)
     VALUES (?, ?, 'appointment_confirmed', ?, ?, 'appointment', ?)`
  ).bind(newId(), String(appointment.guardian_id), me.sub, id, timestamp).run();

  return ok({ id, status: 'confirmed' });
}

/* ─── Reject appointment (supplier) ─── */
async function rejectAppointment(request: Request, env: Env, me: JwtPayload, id: string): Promise<Response> {
  const appointment = await env.DB.prepare(
    'SELECT * FROM appointments WHERE id = ? AND supplier_id = ?'
  ).bind(id, me.sub).first<Record<string, unknown>>();
  if (!appointment) return err('appointment not found', 404);
  if (appointment.status !== 'pending') return err('can only reject pending appointments');

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { body = {}; }
  const reason = String(body.reason || '').trim();

  const timestamp = now();
  await env.DB.prepare(
    'UPDATE appointments SET status = ?, rejected_reason = ?, updated_at = ? WHERE id = ?'
  ).bind('rejected', reason || null, timestamp, id).run();

  // Notify guardian
  await env.DB.prepare(
    `INSERT INTO notifications (id, user_id, type, actor_user_id, reference_id, reference_type, created_at)
     VALUES (?, ?, 'appointment_rejected', ?, ?, 'appointment', ?)`
  ).bind(newId(), String(appointment.guardian_id), me.sub, id, timestamp).run();

  return ok({ id, status: 'rejected' });
}

/* ─── Get single appointment ─── */
async function getAppointment(env: Env, me: JwtPayload, id: string): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT a.*,
      p.name AS pet_name, p.avatar_url AS pet_avatar, p.species, p.breed_id,
      COALESCE(gup.display_name, gu.email) AS guardian_name,
      COALESCE(sup.display_name, su.email) AS supplier_name
    FROM appointments a
    LEFT JOIN pets p ON p.id = a.pet_id
    LEFT JOIN users gu ON gu.id = a.guardian_id
    LEFT JOIN user_profiles gup ON gup.user_id = a.guardian_id
    LEFT JOIN users su ON su.id = a.supplier_id
    LEFT JOIN user_profiles sup ON sup.user_id = a.supplier_id
    WHERE a.id = ? AND (a.guardian_id = ? OR a.supplier_id = ?)`
  ).bind(id, me.sub, me.sub).first();
  if (!row) return err('appointment not found', 404);
  return ok({ appointment: row });
}

/* ─── Router ─── */
export async function handleAppointments(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/appointments', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listAppointments(env, me, url);
  if ((sub === '' || sub === '/') && request.method === 'POST') return createAppointment(request, env, me);

  const confirmMatch = sub.match(/^\/([^/]+)\/confirm$/);
  if (confirmMatch && request.method === 'PATCH') return confirmAppointment(request, env, me, confirmMatch[1]);

  const rejectMatch = sub.match(/^\/([^/]+)\/reject$/);
  if (rejectMatch && request.method === 'PATCH') return rejectAppointment(request, env, me, rejectMatch[1]);

  const singleMatch = sub.match(/^\/([^/]+)$/);
  if (singleMatch && request.method === 'GET') return getAppointment(env, me, singleMatch[1]);

  return err('Not found', 404);
}
