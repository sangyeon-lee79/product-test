// Admin Dummy Store Management — CRUD + toggle active/inactive
import type { Env, JwtPayload } from '../types';
import { ok, err, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

export async function handleDummyStores(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;

  // All endpoints require admin auth
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  // PUT /api/v1/admin/dummy-stores/:id/toggle
  const toggleMatch = path.match(/^\/api\/v1\/admin\/dummy-stores\/([^/]+)\/toggle$/);
  if (toggleMatch && method === 'PUT') {
    return toggleStore(env, toggleMatch[1]);
  }

  // PUT /api/v1/admin/dummy-stores/:id
  const updateMatch = path.match(/^\/api\/v1\/admin\/dummy-stores\/([^/]+)$/);
  if (updateMatch && method === 'PUT') {
    return updateStore(request, env, updateMatch[1]);
  }

  // DELETE /api/v1/admin/dummy-stores/:id
  if (updateMatch && method === 'DELETE') {
    return deleteStore(env, updateMatch[1]);
  }

  // GET /api/v1/admin/dummy-stores
  if (path === '/api/v1/admin/dummy-stores' && method === 'GET') {
    return listStores(env, url);
  }

  // POST /api/v1/admin/dummy-stores
  if (path === '/api/v1/admin/dummy-stores' && method === 'POST') {
    return createStore(request, env);
  }

  return err('Not Found', 404, 'not_found');
}

// ─── GET — list with filters ─────────────────────────────────────────
async function listStores(env: Env, url: URL): Promise<Response> {
  const category = url.searchParams.get('category') || '';
  const isActive = url.searchParams.get('is_active');

  let where = '1=1';
  const binds: unknown[] = [];

  if (category) {
    where += ` AND ds.category = $${binds.length + 1}`;
    binds.push(category);
  }
  if (isActive === 'true' || isActive === 'false') {
    where += ` AND ds.is_active = $${binds.length + 1}`;
    binds.push(isActive === 'true');
  }

  const countResult = await env.DB.prepare(
    `SELECT COUNT(*) as total,
            COUNT(*) FILTER (WHERE ds.is_active = true) as active_count
     FROM dummy_stores ds WHERE ${where}`
  ).bind(...binds).first<{ total: number; active_count: number }>();

  const rows = await env.DB.prepare(
    `SELECT ds.*,
       COALESCE(
         (SELECT json_agg(json_build_object(
           'id', dss.id, 'name', dss.name, 'price', dss.price,
           'duration_min', dss.duration_min, 'is_active', dss.is_active
         )) FROM dummy_store_services dss WHERE dss.dummy_store_id = ds.id),
         '[]'::json
       ) as services
     FROM dummy_stores ds
     WHERE ${where}
     ORDER BY ds.category, ds.created_at`
  ).bind(...binds).all();

  return ok({
    items: rows.results,
    total: countResult?.total ?? 0,
    active_count: countResult?.active_count ?? 0,
  });
}

// ─── POST — create ───────────────────────────────────────────────────
async function createStore(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return err('Invalid JSON'); }

  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const name = body.name as Record<string, string> | undefined;
  if (!category || !name || !name.ko) {
    return err('category and name.ko are required');
  }

  const result = await env.DB.prepare(
    `INSERT INTO dummy_stores (category, name, description, address, rating, review_count, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, true, $7)
     RETURNING *`
  ).bind(
    category,
    JSON.stringify(name),
    body.description ? JSON.stringify(body.description) : null,
    body.address ? JSON.stringify(body.address) : null,
    typeof body.rating === 'number' ? body.rating : null,
    typeof body.review_count === 'number' ? body.review_count : 0,
    now(),
  ).first();

  return ok(result);
}

// ─── PUT — update ────────────────────────────────────────────────────
async function updateStore(request: Request, env: Env, id: string): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return err('Invalid JSON'); }

  const sets: string[] = [];
  const binds: unknown[] = [];
  let idx = 1;

  if (body.category !== undefined) {
    sets.push(`category = $${idx++}`);
    binds.push(body.category);
  }
  if (body.name !== undefined) {
    sets.push(`name = $${idx++}`);
    binds.push(JSON.stringify(body.name));
  }
  if (body.description !== undefined) {
    sets.push(`description = $${idx++}`);
    binds.push(body.description ? JSON.stringify(body.description) : null);
  }
  if (body.address !== undefined) {
    sets.push(`address = $${idx++}`);
    binds.push(body.address ? JSON.stringify(body.address) : null);
  }
  if (body.rating !== undefined) {
    sets.push(`rating = $${idx++}`);
    binds.push(body.rating);
  }
  if (body.review_count !== undefined) {
    sets.push(`review_count = $${idx++}`);
    binds.push(body.review_count);
  }
  if (body.is_active !== undefined) {
    sets.push(`is_active = $${idx++}`);
    binds.push(body.is_active);
  }

  if (sets.length === 0) return err('No fields to update');

  binds.push(id);
  const result = await env.DB.prepare(
    `UPDATE dummy_stores SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`
  ).bind(...binds).first();

  if (!result) return err('Store not found', 404);
  return ok(result);
}

// ─── PUT toggle ──────────────────────────────────────────────────────
async function toggleStore(env: Env, id: string): Promise<Response> {
  const result = await env.DB.prepare(
    `UPDATE dummy_stores SET is_active = NOT is_active WHERE id = $1 RETURNING *`
  ).bind(id).first();

  if (!result) return err('Store not found', 404);
  return ok(result);
}

// ─── DELETE ──────────────────────────────────────────────────────────
async function deleteStore(env: Env, id: string): Promise<Response> {
  await env.DB.prepare(`DELETE FROM dummy_stores WHERE id = $1`).bind(id).run();
  return ok({ deleted: true });
}
