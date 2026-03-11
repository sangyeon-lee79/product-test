import type { Env, JwtPayload } from '../types';
import { created, err, newId, now, ok } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

async function getMyProfile(env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['provider']);
  if (roleErr) return roleErr;

  const row = await env.DB.prepare(
    `SELECT
      pp.approval_status,
      pp.business_category_l1_id,
      pp.business_category_l2_id,
      pp.business_category_l3_id,
      pp.pet_type_l1_id,
      pp.pet_type_l2_id,
      pp.business_registration_no,
      pp.operating_hours,
      pp.certifications,
      pp.supported_pet_types,
      pp.address_line,
      pp.address_place_id,
      pp.address_lat,
      pp.address_lng,
      pp.approved_at,
      pp.created_at,
      pp.updated_at,
      COALESCE(l1.display_label, '') AS business_l1_label,
      COALESCE(l2.display_label, '') AS business_l2_label,
      COALESCE(l3.display_label, '') AS business_l3_label,
      COALESCE(pl1.display_label, '') AS pet_type_l1_label,
      COALESCE(pl2.display_label, '') AS pet_type_l2_label,
      COALESCE(ra.status, '') AS role_application_status,
      COALESCE(ra.rejection_reason, '') AS rejection_reason
    FROM provider_profiles pp
    LEFT JOIN (
      SELECT mi.id, COALESCE(it.ko, mi.code) AS display_label
      FROM master_items mi
      LEFT JOIN i18n_translations it ON it.key = 'master.' || (SELECT mc.code FROM master_categories mc WHERE mc.id = mi.category_id) || '.' || mi.code
    ) l1 ON l1.id = pp.business_category_l1_id
    LEFT JOIN (
      SELECT mi.id, COALESCE(it.ko, mi.code) AS display_label
      FROM master_items mi
      LEFT JOIN i18n_translations it ON it.key = 'master.' || (SELECT mc.code FROM master_categories mc WHERE mc.id = mi.category_id) || '.' || mi.code
    ) l2 ON l2.id = pp.business_category_l2_id
    LEFT JOIN (
      SELECT mi.id, COALESCE(it.ko, mi.code) AS display_label
      FROM master_items mi
      LEFT JOIN i18n_translations it ON it.key = 'master.' || (SELECT mc.code FROM master_categories mc WHERE mc.id = mi.category_id) || '.' || mi.code
    ) l3 ON l3.id = pp.business_category_l3_id
    LEFT JOIN (
      SELECT mi.id, COALESCE(it.ko, mi.code) AS display_label
      FROM master_items mi
      LEFT JOIN i18n_translations it ON it.key = 'master.' || (SELECT mc.code FROM master_categories mc WHERE mc.id = mi.category_id) || '.' || mi.code
    ) pl1 ON pl1.id = pp.pet_type_l1_id
    LEFT JOIN (
      SELECT mi.id, COALESCE(it.ko, mi.code) AS display_label
      FROM master_items mi
      LEFT JOIN i18n_translations it ON it.key = 'master.' || (SELECT mc.code FROM master_categories mc WHERE mc.id = mi.category_id) || '.' || mi.code
    ) pl2 ON pl2.id = pp.pet_type_l2_id
    LEFT JOIN role_applications ra ON ra.id = (
      SELECT ra2.id FROM role_applications ra2
      WHERE ra2.user_id = pp.user_id
      ORDER BY ra2.requested_at DESC LIMIT 1
    )
    WHERE pp.user_id = ?`
  ).bind(me.sub).first<Record<string, unknown>>();

  if (!row) {
    return ok({ approval_status: 'pending', profile: null });
  }

  let certifications: string[] = [];
  try {
    const parsed = JSON.parse(String(row.certifications || '[]'));
    if (Array.isArray(parsed)) certifications = parsed.filter((v): v is string => typeof v === 'string');
  } catch { /* ignore */ }

  let supportedPetTypes: string[] = [];
  try {
    const parsed = JSON.parse(String(row.supported_pet_types || '[]'));
    if (Array.isArray(parsed)) supportedPetTypes = parsed.filter((v): v is string => typeof v === 'string');
  } catch { /* ignore */ }

  return ok({
    approval_status: row.approval_status,
    role_application_status: row.role_application_status,
    rejection_reason: row.rejection_reason,
    profile: {
      business_category_l1_id: row.business_category_l1_id,
      business_category_l2_id: row.business_category_l2_id,
      business_category_l3_id: row.business_category_l3_id,
      pet_type_l1_id: row.pet_type_l1_id,
      pet_type_l2_id: row.pet_type_l2_id,
      business_l1_label: row.business_l1_label,
      business_l2_label: row.business_l2_label,
      business_l3_label: row.business_l3_label,
      pet_type_l1_label: row.pet_type_l1_label,
      pet_type_l2_label: row.pet_type_l2_label,
      business_registration_no: row.business_registration_no,
      operating_hours: row.operating_hours,
      certifications,
      supported_pet_types: supportedPetTypes,
      address_line: row.address_line,
      approved_at: row.approved_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  });
}

async function updateMyProfile(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['provider']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const timestamp = now();
  await env.DB.prepare(
    `UPDATE provider_profiles SET
      business_category_l1_id = COALESCE(?, business_category_l1_id),
      business_category_l2_id = COALESCE(?, business_category_l2_id),
      business_category_l3_id = COALESCE(?, business_category_l3_id),
      pet_type_l1_id = COALESCE(?, pet_type_l1_id),
      pet_type_l2_id = COALESCE(?, pet_type_l2_id),
      business_registration_no = COALESCE(?, business_registration_no),
      operating_hours = COALESCE(?, operating_hours),
      certifications = COALESCE(?, certifications),
      address_line = COALESCE(?, address_line),
      updated_at = ?
    WHERE user_id = ?`
  ).bind(
    body.business_category_l1_id ?? null,
    body.business_category_l2_id ?? null,
    body.business_category_l3_id ?? null,
    body.pet_type_l1_id ?? null,
    body.pet_type_l2_id ?? null,
    body.business_registration_no ?? null,
    body.operating_hours ?? null,
    body.certifications != null ? JSON.stringify(body.certifications) : null,
    body.address_line ?? null,
    timestamp,
    me.sub,
  ).run();

  return ok({ updated: true });
}

async function createStoreBooking(request: Request, env: Env, me: JwtPayload, storeId: string): Promise<Response> {
  const roleErr = requireRole(me, ['guardian']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const supplierIdRaw = typeof body.supplier_id === 'string' ? body.supplier_id.trim() : '';
  const supplierId = supplierIdRaw || storeId;
  if (!supplierId) return err('supplier_id required');

  const supplier = await env.DB.prepare(
    `SELECT id, role, status FROM users WHERE id = ?`
  ).bind(supplierId).first<{ id: string; role: string; status: string }>();
  if (!supplier || supplier.role !== 'provider' || supplier.status !== 'active') {
    return err('supplier not found', 404);
  }

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

  return created({ id, supplier_id: supplierId, store_id: storeId });
}

export async function handleProviders(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  // Provider self-profile
  if (url.pathname === '/api/v1/providers/me') {
    if (request.method === 'GET') return getMyProfile(env, me);
    if (request.method === 'PUT') return updateMyProfile(request, env, me);
    return err('Method not allowed', 405);
  }

  const storeBookingMatch = url.pathname.match(/^\/api\/v1\/stores\/([^/]+)\/bookings\/?$/);
  if (storeBookingMatch && request.method === 'POST') {
    return createStoreBooking(request, env, me, storeBookingMatch[1]);
  }

  return err('Not implemented yet — S9에서 구현 예정', 501);
}
