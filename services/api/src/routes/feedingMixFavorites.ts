// 혼합급여 즐겨찾기 CRUD
// GET/POST/DELETE  /api/v1/pets/:petId/feeding-mix-favorites[/:id]
import type { Env, JwtPayload } from '../types';
import { ok, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';
import { assertPetOwner } from './pets/index';

export async function handleFeedingMixFavorites(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const payload = auth as JwtPayload;

  // /api/v1/pets/:petId/feeding-mix-favorites[/:id]
  const m = url.pathname.match(/\/api\/v1\/pets\/([^/]+)\/feeding-mix-favorites(?:\/([^/]+))?$/);
  if (!m) return err('Not found', 404);
  const petId = m[1];
  const favId = m[2] || null;

  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  // GET — list
  if (request.method === 'GET' && !favId) {
    const rows = await env.DB.prepare(
      `SELECT * FROM feeding_mix_favorites WHERE pet_id = ? AND status != 'deleted' ORDER BY sort_order ASC, created_at DESC`
    ).bind(petId).all();
    return ok({ favorites: rows.results });
  }

  // POST — create
  if (request.method === 'POST' && !favId) {
    let body: Record<string, unknown>;
    try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return err('name required');

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length < 1) return err('At least 1 item required');

    const id = newId();
    const ts = now();
    await env.DB.prepare(
      `INSERT INTO feeding_mix_favorites (id, pet_id, name, items_json, sort_order, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 'active', ?, ?)`
    ).bind(id, petId, name, JSON.stringify(items), ts, ts).run();

    return ok({ id, name, items_json: JSON.stringify(items) });
  }

  // DELETE — soft delete
  if (request.method === 'DELETE' && favId) {
    await env.DB.prepare(
      `UPDATE feeding_mix_favorites SET status = 'deleted', updated_at = ? WHERE id = ? AND pet_id = ?`
    ).bind(now(), favId, petId).run();
    return ok({ deleted: true, id: favId });
  }

  return err('Method not allowed', 405);
}
