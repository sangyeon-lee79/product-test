import type { Env, JwtPayload } from '../types';
import { created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

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

  const storeBookingMatch = url.pathname.match(/^\/api\/v1\/stores\/([^/]+)\/bookings\/?$/);
  if (storeBookingMatch && request.method === 'POST') {
    return createStoreBooking(request, env, me, storeBookingMatch[1]);
  }

  return err('Not implemented yet — S9에서 구현 예정', 501);
}
