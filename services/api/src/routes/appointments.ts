import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import { createAndPush } from '../helpers/pushHelper';

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
      su.email AS supplier_email,
      st.name AS store_name,
      (SELECT COUNT(*) FROM appointment_reviews ar WHERE ar.appointment_id = a.id) AS review_count,
      (SELECT COUNT(*) FROM appointment_reviews ar WHERE ar.appointment_id = a.id AND ar.author_type = 'guardian') AS has_guardian_review,
      (SELECT COUNT(*) FROM appointment_reviews ar WHERE ar.appointment_id = a.id AND ar.author_type = 'supplier') AS has_supplier_review
    FROM appointments a
    LEFT JOIN pets p ON p.id = a.pet_id
    LEFT JOIN users gu ON gu.id = a.guardian_id
    LEFT JOIN user_profiles gup ON gup.user_id = a.guardian_id
    LEFT JOIN users su ON su.id = a.supplier_id
    LEFT JOIN user_profiles sup ON sup.user_id = a.supplier_id
    LEFT JOIN stores st ON st.id = a.store_id
    WHERE a.deleted_at IS NULL`;
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

  sql += ' ORDER BY a.scheduled_at DESC, a.created_at DESC';

  const rows = await env.DB.prepare(sql).bind(...binds).all();

  // Parse JSONB fields
  const results = rows.results.map((r: Record<string, unknown>) => ({
    ...r,
    extra_data: typeof r.extra_data === 'string' ? JSON.parse(r.extra_data) : r.extra_data,
  }));

  return ok({ appointments: results });
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

  const storeId = String(body.storeId ?? body.store_id ?? '').trim() || null;
  const serviceId = String(body.serviceId ?? body.service_id ?? '').trim() || null;
  const businessType = String(body.businessType ?? body.business_type ?? '').trim() || null;
  const extraData = body.extraData ?? body.extra_data ?? {};
  const petReportPeriod = String(body.petReportPeriod ?? body.pet_report_period ?? '').trim() || null;
  const isOvertime = !!body.isOvertime || !!body.is_overtime;
  const overtimeMinutes = Number(body.overtimeMinutes ?? body.overtime_minutes ?? 0);
  const overtimeFee = Number(body.overtimeFee ?? body.overtime_fee ?? 0);

  const id = newId();
  const timestamp = now();

  await env.DB.prepare(
    `INSERT INTO appointments (
      id, pet_id, guardian_id, supplier_id, store_id, service_id,
      service_type, scheduled_at, duration_minutes, price, request_note,
      business_type, extra_data, pet_report_period,
      is_overtime, overtime_minutes, overtime_fee,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    id,
    petId || null,
    me.sub,
    supplierId,
    storeId,
    serviceId,
    body.serviceType ?? body.service_type ?? '',
    body.scheduledAt ?? body.scheduled_at ?? null,
    body.durationMinutes ?? body.duration_minutes ?? null,
    body.price ?? null,
    body.requestNote ?? body.request_note ?? null,
    businessType,
    JSON.stringify(extraData),
    petReportPeriod,
    isOvertime,
    overtimeMinutes,
    overtimeFee,
    timestamp,
    timestamp,
  ).run();

  // Notify supplier
  const guardianRow = await env.DB.prepare(
    `SELECT COALESCE(up.display_name, u.email) AS name
     FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.id = ?`
  ).bind(me.sub).first<{ name: string }>();

  await createAndPush(env, {
    userId: supplierId,
    type: 'appointment_request',
    actorUserId: me.sub,
    referenceId: id,
    referenceType: 'appointment',
    title: 'New Booking Request',
    body: guardianRow?.name ? `${guardianRow.name} requested a booking` : 'New booking request',
    data: { link: '/#/supplier', appointment_id: id },
  });

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
  await createAndPush(env, {
    userId: String(appointment.guardian_id),
    type: 'appointment_confirmed',
    actorUserId: me.sub,
    referenceId: id,
    referenceType: 'appointment',
    title: 'Booking Confirmed',
    body: 'Your booking has been confirmed',
    data: { link: '/#/guardian', appointment_id: id },
  });

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
  await createAndPush(env, {
    userId: String(appointment.guardian_id),
    type: 'appointment_rejected',
    actorUserId: me.sub,
    referenceId: id,
    referenceType: 'appointment',
    title: 'Booking Rejected',
    body: reason ? `Booking rejected: ${reason}` : 'Your booking was rejected',
    data: { link: '/#/guardian', appointment_id: id },
  });

  return ok({ id, status: 'rejected' });
}

/* ─── Cancel appointment (guardian or supplier) ─── */
async function cancelAppointment(request: Request, env: Env, me: JwtPayload, id: string): Promise<Response> {
  const appointment = await env.DB.prepare(
    'SELECT * FROM appointments WHERE id = ? AND (guardian_id = ? OR supplier_id = ?)'
  ).bind(id, me.sub, me.sub).first<Record<string, unknown>>();
  if (!appointment) return err('appointment not found', 404);
  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return err('cannot cancel this appointment');
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { body = {}; }
  const reason = String(body.reason ?? body.cancelled_reason ?? '').trim();

  const timestamp = now();
  await env.DB.prepare(
    `UPDATE appointments SET status = 'cancelled', cancelled_reason = ?, deleted_at = ?, updated_at = ? WHERE id = ?`
  ).bind(reason || null, timestamp, timestamp, id).run();

  // Notify the other party
  const isGuardian = String(appointment.guardian_id) === me.sub;
  const notifyUserId = isGuardian ? String(appointment.supplier_id) : String(appointment.guardian_id);

  await createAndPush(env, {
    userId: notifyUserId,
    type: 'appointment_cancelled',
    actorUserId: me.sub,
    referenceId: id,
    referenceType: 'appointment',
    title: 'Booking Cancelled',
    body: reason ? `Booking cancelled: ${reason}` : 'A booking has been cancelled',
    data: { link: isGuardian ? '/#/supplier' : '/#/guardian', appointment_id: id },
  });

  return ok({ id, status: 'cancelled' });
}

/* ─── Get single appointment ─── */
async function getAppointment(env: Env, me: JwtPayload, id: string): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT a.*,
      p.name AS pet_name, p.avatar_url AS pet_avatar, p.species, p.breed_id,
      COALESCE(gup.display_name, gu.email) AS guardian_name,
      COALESCE(sup.display_name, su.email) AS supplier_name,
      st.name AS store_name
    FROM appointments a
    LEFT JOIN pets p ON p.id = a.pet_id
    LEFT JOIN users gu ON gu.id = a.guardian_id
    LEFT JOIN user_profiles gup ON gup.user_id = a.guardian_id
    LEFT JOIN users su ON su.id = a.supplier_id
    LEFT JOIN user_profiles sup ON sup.user_id = a.supplier_id
    LEFT JOIN stores st ON st.id = a.store_id
    WHERE a.id = ? AND (a.guardian_id = ? OR a.supplier_id = ?)`
  ).bind(id, me.sub, me.sub).first<Record<string, unknown>>();
  if (!row) return err('appointment not found', 404);

  return ok({
    appointment: {
      ...row,
      extra_data: typeof row.extra_data === 'string' ? JSON.parse(row.extra_data as string) : row.extra_data,
    },
  });
}

/* ─── Available time slots ─── */
async function availableSlots(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const storeId = url.searchParams.get('storeId') || url.searchParams.get('store_id');
  const date = url.searchParams.get('date'); // YYYY-MM-DD
  const serviceId = url.searchParams.get('serviceId') || url.searchParams.get('service_id');
  if (!storeId || !date) return err('storeId and date required');

  // Get store operating hours and overtime settings
  const store = await env.DB.prepare(
    `SELECT operating_hours, allow_overtime, overtime_fee_type, overtime_fee_amount FROM stores WHERE id = ?`
  ).bind(storeId).first<Record<string, unknown>>();
  if (!store) return err('store not found', 404);

  const operatingHours = typeof store.operating_hours === 'string'
    ? JSON.parse(store.operating_hours as string)
    : store.operating_hours || {};

  // Get service duration
  let durationMin = 30;
  if (serviceId) {
    const svc = await env.DB.prepare(
      'SELECT duration_minutes FROM services WHERE id = ?'
    ).bind(serviceId).first<{ duration_minutes: number | null }>();
    if (svc?.duration_minutes) durationMin = svc.duration_minutes;
  }

  // Get existing appointments for this store on this date
  const existingApts = await env.DB.prepare(
    `SELECT scheduled_at, duration_minutes FROM appointments
     WHERE store_id = ? AND scheduled_at::date = ?::date
     AND status IN ('pending', 'confirmed') AND deleted_at IS NULL`
  ).bind(storeId, date).all();

  const bookedSlots = new Set<string>();
  for (const apt of existingApts.results) {
    const r = apt as Record<string, unknown>;
    if (r.scheduled_at) {
      const dt = new Date(String(r.scheduled_at));
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      bookedSlots.add(`${hh}:${mm}`);
    }
  }

  // Determine day of week for operating hours
  const dayOfWeek = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const dayHours = operatingHours[dayOfWeek] || operatingHours[dayOfWeek.slice(0, 3)] || null;

  // Generate slots (default 09:00-21:00, 30-min intervals)
  const openHour = dayHours?.open ? parseInt(dayHours.open.split(':')[0]) : 9;
  const openMin = dayHours?.open ? parseInt(dayHours.open.split(':')[1] || '0') : 0;
  const closeHour = dayHours?.close ? parseInt(dayHours.close.split(':')[0]) : 21;
  const closeMin = dayHours?.close ? parseInt(dayHours.close.split(':')[1] || '0') : 0;

  const slots: Array<{ time: string; type: 'normal' | 'overtime' | 'closed'; booked: boolean }> = [];
  const isClosed = dayHours === null && Object.keys(operatingHours).length > 0;

  // Generate 30-min slots from 07:00 to 22:00
  for (let h = 7; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      const slotMin = h * 60 + m;
      const openMin2 = openHour * 60 + openMin;
      const closeMin2 = closeHour * 60 + closeMin;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      let type: 'normal' | 'overtime' | 'closed';
      if (isClosed) {
        type = store.allow_overtime ? 'overtime' : 'closed';
      } else if (slotMin >= openMin2 && slotMin < closeMin2) {
        type = 'normal';
      } else if (store.allow_overtime) {
        type = 'overtime';
      } else {
        type = 'closed';
      }

      slots.push({ time: timeStr, type, booked: bookedSlots.has(timeStr) });
    }
  }

  return ok({
    slots,
    store: {
      allow_overtime: store.allow_overtime,
      overtime_fee_type: store.overtime_fee_type,
      overtime_fee_amount: store.overtime_fee_amount,
      operating_hours: operatingHours,
    },
    service_duration_minutes: durationMin,
  });
}

/* ─── Create review ─── */
async function createReview(request: Request, env: Env, me: JwtPayload, appointmentId: string): Promise<Response> {
  const appointment = await env.DB.prepare(
    'SELECT * FROM appointments WHERE id = ? AND (guardian_id = ? OR supplier_id = ?)'
  ).bind(appointmentId, me.sub, me.sub).first<Record<string, unknown>>();
  if (!appointment) return err('appointment not found', 404);
  if (appointment.status !== 'completed') return err('can only review completed appointments');

  const isGuardian = String(appointment.guardian_id) === me.sub;
  const authorType = isGuardian ? 'guardian' : 'supplier';

  // Check if already reviewed
  const existing = await env.DB.prepare(
    'SELECT id FROM appointment_reviews WHERE appointment_id = ? AND author_type = ?'
  ).bind(appointmentId, authorType).first();
  if (existing) return err('review already exists for this appointment');

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5) return err('rating must be 1-5');
  // Round to nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;

  const content = String(body.content || '').trim();
  const id = newId();
  const timestamp = now();

  await env.DB.prepare(
    `INSERT INTO appointment_reviews (
      id, appointment_id, store_id, author_user_id, pet_id,
      author_type, rating, content, is_visible,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?)`
  ).bind(
    id,
    appointmentId,
    appointment.store_id ?? null,
    me.sub,
    isGuardian ? (appointment.pet_id ?? null) : null,
    authorType,
    roundedRating,
    content || null,
    timestamp,
    timestamp,
  ).run();

  // Notify the other party
  const notifyUserId = isGuardian ? String(appointment.supplier_id) : String(appointment.guardian_id);
  await createAndPush(env, {
    userId: notifyUserId,
    type: 'review_received',
    actorUserId: me.sub,
    referenceId: id,
    referenceType: 'review',
    title: 'New Review',
    body: `You received a ${roundedRating}-star review`,
    data: { link: isGuardian ? '/#/supplier' : '/#/guardian', appointment_id: appointmentId },
  });

  return created({ id, rating: roundedRating });
}

/* ─── Get reviews for appointment (mutual visibility) ─── */
async function getReviews(env: Env, me: JwtPayload, appointmentId: string): Promise<Response> {
  const appointment = await env.DB.prepare(
    'SELECT * FROM appointments WHERE id = ? AND (guardian_id = ? OR supplier_id = ?)'
  ).bind(appointmentId, me.sub, me.sub).first<Record<string, unknown>>();
  if (!appointment) return err('appointment not found', 404);

  const rows = await env.DB.prepare(
    `SELECT ar.*,
      COALESCE(up.display_name, u.email) AS author_name,
      u.email AS author_email,
      p.name AS pet_name
    FROM appointment_reviews ar
    LEFT JOIN users u ON u.id = ar.author_user_id
    LEFT JOIN user_profiles up ON up.user_id = ar.author_user_id
    LEFT JOIN pets p ON p.id = ar.pet_id
    WHERE ar.appointment_id = ?
    ORDER BY ar.created_at ASC`
  ).bind(appointmentId).all();

  const reviews = rows.results as Record<string, unknown>[];
  const isGuardian = String(appointment.guardian_id) === me.sub;
  const myType = isGuardian ? 'guardian' : 'supplier';
  const otherType = isGuardian ? 'supplier' : 'guardian';

  const myReview = reviews.find(r => r.author_type === myType) || null;
  const otherReview = reviews.find(r => r.author_type === otherType) || null;

  // Mutual visibility: only show other's review if both have written
  const bothWritten = myReview !== null && otherReview !== null;

  return ok({
    my_review: myReview,
    other_review: bothWritten ? otherReview : null,
    both_written: bothWritten,
    can_write: myReview === null && appointment.status === 'completed',
  });
}

/* ─── Send health report to supplier ─── */
async function sendReport(request: Request, env: Env, me: JwtPayload, appointmentId: string): Promise<Response> {
  const roleErr = requireRole(me, ['guardian']);
  if (roleErr) return roleErr;

  const appointment = await env.DB.prepare(
    'SELECT * FROM appointments WHERE id = ? AND guardian_id = ?'
  ).bind(appointmentId, me.sub).first<Record<string, unknown>>();
  if (!appointment) return err('appointment not found', 404);

  const timestamp = now();
  await env.DB.prepare(
    'UPDATE appointments SET pet_report_sent = true, updated_at = ? WHERE id = ?'
  ).bind(timestamp, appointmentId).run();

  // Notify supplier
  await createAndPush(env, {
    userId: String(appointment.supplier_id),
    type: 'pet_report_sent',
    actorUserId: me.sub,
    referenceId: appointmentId,
    referenceType: 'appointment',
    title: 'Health Report Received',
    body: 'Guardian sent a pet health report',
    data: { link: '/#/supplier', appointment_id: appointmentId },
  });

  return ok({ id: appointmentId, pet_report_sent: true });
}

/* ─── Router ─── */
export async function handleAppointments(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/appointments', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listAppointments(env, me, url);
  if ((sub === '' || sub === '/') && request.method === 'POST') return createAppointment(request, env, me);

  if (sub === '/available-slots' && request.method === 'GET') return availableSlots(env, me, url);

  const confirmMatch = sub.match(/^\/([^/]+)\/confirm$/);
  if (confirmMatch && request.method === 'PATCH') return confirmAppointment(request, env, me, confirmMatch[1]);

  const rejectMatch = sub.match(/^\/([^/]+)\/reject$/);
  if (rejectMatch && request.method === 'PATCH') return rejectAppointment(request, env, me, rejectMatch[1]);

  const cancelMatch = sub.match(/^\/([^/]+)\/cancel$/);
  if (cancelMatch && request.method === 'PATCH') return cancelAppointment(request, env, me, cancelMatch[1]);

  const reviewsMatch = sub.match(/^\/([^/]+)\/reviews$/);
  if (reviewsMatch && request.method === 'POST') return createReview(request, env, me, reviewsMatch[1]);
  if (reviewsMatch && request.method === 'GET') return getReviews(env, me, reviewsMatch[1]);

  const reportMatch = sub.match(/^\/([^/]+)\/send-report$/);
  if (reportMatch && request.method === 'POST') return sendReport(request, env, me, reportMatch[1]);

  const singleMatch = sub.match(/^\/([^/]+)$/);
  if (singleMatch && request.method === 'GET') return getAppointment(env, me, singleMatch[1]);

  return err('Not found', 404);
}
