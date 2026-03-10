// Feed Registration Requests — Guardian submit + Admin approve/reject
import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now, randomToken } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import { hasTable, normalizedTranslations, upsertI18n } from '../helpers/sqlHelpers';

export async function handleFeedRequests(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;
  const isAdmin = path.startsWith('/api/v1/admin/');

  // ─── Admin endpoints ─────────────────────────────────────────────
  if (isAdmin) {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const jwt = authResult as JwtPayload;
    const roleErr = requireRole(jwt, ['admin']);
    if (roleErr) return roleErr;

    // GET /api/v1/admin/feed-requests — list all requests
    if (path === '/api/v1/admin/feed-requests' && method === 'GET') {
      const status = url.searchParams.get('status') || '';
      const binds: string[] = [];
      let where = '';
      if (status) {
        where = ' WHERE r.status = ?';
        binds.push(status);
      }
      const rows = await env.DB.prepare(
        `SELECT r.*, u.email AS requester_email
         FROM feed_registration_requests r
         LEFT JOIN users u ON u.id = r.requester_user_id
         ${where}
         ORDER BY r.created_at DESC`
      ).bind(...binds).all();
      return ok(rows.results);
    }

    // GET /api/v1/admin/feed-requests/:id — detail
    const detailMatch = path.match(/^\/api\/v1\/admin\/feed-requests\/([^/]+)$/);
    if (detailMatch && method === 'GET') {
      const id = detailMatch[1];
      const row = await env.DB.prepare(
        `SELECT r.*, u.email AS requester_email
         FROM feed_registration_requests r
         LEFT JOIN users u ON u.id = r.requester_user_id
         WHERE r.id = ?`
      ).bind(id).first();
      if (!row) return err('Not found', 404, 'not_found');
      return ok(row);
    }

    // POST /api/v1/admin/feed-requests/:id/approve — approve + create catalog entries
    const approveMatch = path.match(/^\/api\/v1\/admin\/feed-requests\/([^/]+)\/approve$/);
    if (approveMatch && method === 'POST') {
      const reqId = approveMatch[1];
      const req = await env.DB.prepare(
        `SELECT * FROM feed_registration_requests WHERE id = ?`
      ).bind(reqId).first<Record<string, unknown>>();
      if (!req) return err('Not found', 404, 'not_found');
      if (req.status !== 'pending') return err('Already processed', 400, 'already_processed');

      // Parse optional override body from admin
      const overrideBody = await request.json<{
        manufacturer_id?: string; brand_id?: string; feed_type_item_id?: string;
      }>().catch(() => ({} as Record<string, string | undefined>));

      const feedName = String(req.feed_name || '');
      const manufacturerName = String(req.manufacturer_name || '').trim();
      const brandName = String(req.brand_name || '').trim();
      const feedTypeItemId = (overrideBody.feed_type_item_id || String(req.feed_type_item_id || '')).trim() || null;

      // 1. Use override manufacturer_id or find/create
      let manufacturerId: string | null = null;
      if (overrideBody.manufacturer_id) {
        manufacturerId = overrideBody.manufacturer_id;
      } else if (manufacturerName) {
        const existing = await env.DB.prepare(
          `SELECT id FROM feed_manufacturers WHERE name_ko LIKE ? AND status = 'active' LIMIT 1`
        ).bind(`%${manufacturerName}%`).first<{ id: string }>();
        if (existing) {
          manufacturerId = existing.id;
        } else {
          manufacturerId = newId();
          const mfrKey = `mfr_${randomToken(8)}`;
          const mfrNameKey = `feed.manufacturer.${mfrKey}`;
          await env.DB.prepare(
            `INSERT INTO feed_manufacturers (id, key, name_key, name_ko, name_en, status, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'active', 0, ?, ?)`
          ).bind(manufacturerId, mfrKey, mfrNameKey, manufacturerName, manufacturerName, now(), now()).run();
          await upsertI18n(env, mfrNameKey, normalizedTranslations(undefined, manufacturerName, manufacturerName), 'feed');
          if (await hasTable(env, 'feed_manufacturer_type_map') && feedTypeItemId) {
            await env.DB.prepare(
              `INSERT INTO feed_manufacturer_type_map (manufacturer_id, type_item_id) VALUES (?, ?)
               ON CONFLICT DO NOTHING`
            ).bind(manufacturerId, feedTypeItemId).run();
          }
        }
      }

      // 2. Use override brand_id or find/create
      let brandId: string | null = null;
      if (overrideBody.brand_id) {
        brandId = overrideBody.brand_id;
      } else if (brandName && manufacturerId) {
        const existing = await env.DB.prepare(
          `SELECT id FROM feed_brands WHERE name_ko LIKE ? AND manufacturer_id = ? AND status = 'active' LIMIT 1`
        ).bind(`%${brandName}%`, manufacturerId).first<{ id: string }>();
        if (existing) {
          brandId = existing.id;
        } else {
          brandId = newId();
          const brandKey = `brand_${randomToken(8)}`;
          const brandNameKey = `feed.brand.${brandKey}`;
          await env.DB.prepare(
            `INSERT INTO feed_brands (id, manufacturer_id, name_key, name_ko, name_en, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
          ).bind(brandId, manufacturerId, brandNameKey, brandName, brandName, now(), now()).run();
          await upsertI18n(env, brandNameKey, normalizedTranslations(undefined, brandName, brandName), 'feed');
        }
      }

      // 3. Create feed model
      const modelId = newId();
      const modelKey = `model_${randomToken(8)}`;
      const modelNameKey = `feed.model.${modelKey}`;
      await env.DB.prepare(
        `INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`
      ).bind(modelId, feedTypeItemId, manufacturerId, brandId, modelNameKey, feedName, now(), now()).run();
      await upsertI18n(env, modelNameKey, normalizedTranslations(undefined, feedName, feedName), 'feed');

      // 4. Create nutrition if any field provided
      const hasNutr = [
        req.calories_per_100g, req.protein_pct, req.fat_pct, req.fiber_pct, req.moisture_pct,
        req.ash_pct, req.calcium_pct, req.phosphorus_pct, req.omega3_pct, req.omega6_pct,
        req.carbohydrate_pct, req.serving_size_g,
      ].some((v) => v != null && v !== 0);
      if (hasNutr) {
        if (await hasTable(env, 'feed_nutrition')) {
          const nutrId = newId();
          await env.DB.prepare(
            `INSERT INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct,
             ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text,
             status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
          ).bind(
            nutrId, modelId,
            req.calories_per_100g ?? null, req.protein_pct ?? null,
            req.fat_pct ?? null, req.fiber_pct ?? null, req.moisture_pct ?? null,
            req.ash_pct ?? null, req.calcium_pct ?? null, req.phosphorus_pct ?? null,
            req.omega3_pct ?? null, req.omega6_pct ?? null, req.carbohydrate_pct ?? null,
            req.serving_size_g ?? null, req.ingredients_text ?? null,
            now(), now()
          ).run();
        }
      }

      // 5. Update request status
      await env.DB.prepare(
        `UPDATE feed_registration_requests
         SET status = 'approved', reviewed_by_user_id = ?, reviewed_at = ?,
             approved_manufacturer_id = ?, approved_brand_id = ?, approved_model_id = ?,
             updated_at = ?
         WHERE id = ?`
      ).bind(jwt.sub, now(), manufacturerId, brandId, modelId, now(), reqId).run();

      const updated = await env.DB.prepare(
        `SELECT r.*, u.email AS requester_email
         FROM feed_registration_requests r
         LEFT JOIN users u ON u.id = r.requester_user_id
         WHERE r.id = ?`
      ).bind(reqId).first();
      return ok(updated);
    }

    // POST /api/v1/admin/feed-requests/:id/reject — reject with note
    const rejectMatch = path.match(/^\/api\/v1\/admin\/feed-requests\/([^/]+)\/reject$/);
    if (rejectMatch && method === 'POST') {
      const reqId = rejectMatch[1];
      const req = await env.DB.prepare(
        `SELECT status FROM feed_registration_requests WHERE id = ?`
      ).bind(reqId).first<{ status: string }>();
      if (!req) return err('Not found', 404, 'not_found');
      if (req.status !== 'pending') return err('Already processed', 400, 'already_processed');

      const body = await request.json<{ review_note?: string }>().catch(() => ({} as { review_note?: string }));
      await env.DB.prepare(
        `UPDATE feed_registration_requests
         SET status = 'rejected', reviewed_by_user_id = ?, review_note = ?, reviewed_at = ?, updated_at = ?
         WHERE id = ?`
      ).bind(jwt.sub, body.review_note || null, now(), now(), reqId).run();

      const updated = await env.DB.prepare(
        `SELECT r.*, u.email AS requester_email
         FROM feed_registration_requests r
         LEFT JOIN users u ON u.id = r.requester_user_id
         WHERE r.id = ?`
      ).bind(reqId).first();
      return ok(updated);
    }

    return err('Not Found', 404, 'not_found');
  }

  // ─── Guardian endpoints ──────────────────────────────────────────
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;
  const jwt = authResult as JwtPayload;

  // POST /api/v1/feed-requests — create a new request
  if (path === '/api/v1/feed-requests' && method === 'POST') {
    const body = await request.json<{
      feed_name: string; pet_id?: string; feed_type_item_id?: string;
      manufacturer_name?: string; brand_name?: string;
      calories_per_100g?: number; protein_pct?: number; fat_pct?: number;
      fiber_pct?: number; moisture_pct?: number;
      ash_pct?: number; calcium_pct?: number; phosphorus_pct?: number;
      omega3_pct?: number; omega6_pct?: number; carbohydrate_pct?: number;
      serving_size_g?: number; ingredients_text?: string;
      reference_url?: string; memo?: string;
    }>();
    const feedName = (body.feed_name || '').trim();
    if (!feedName) return err('feed_name required', 400, 'missing_field');
    const id = newId();
    const ts = now();
    await env.DB.prepare(
      `INSERT INTO feed_registration_requests
       (id, requester_user_id, pet_id, feed_name, feed_type_item_id, manufacturer_name, brand_name,
        calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct,
        ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct,
        serving_size_g, ingredients_text,
        reference_url, memo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
    ).bind(
      id, jwt.sub, body.pet_id || null, feedName,
      body.feed_type_item_id || null, body.manufacturer_name || null, body.brand_name || null,
      body.calories_per_100g ?? null, body.protein_pct ?? null,
      body.fat_pct ?? null, body.fiber_pct ?? null, body.moisture_pct ?? null,
      body.ash_pct ?? null, body.calcium_pct ?? null, body.phosphorus_pct ?? null,
      body.omega3_pct ?? null, body.omega6_pct ?? null, body.carbohydrate_pct ?? null,
      body.serving_size_g ?? null, body.ingredients_text || null,
      body.reference_url || null, body.memo || null,
      ts, ts
    ).run();
    const row = await env.DB.prepare(`SELECT * FROM feed_registration_requests WHERE id = ?`).bind(id).first();
    return created(row);
  }

  // GET /api/v1/feed-requests — list my requests
  if (path === '/api/v1/feed-requests' && method === 'GET') {
    const rows = await env.DB.prepare(
      `SELECT * FROM feed_registration_requests WHERE requester_user_id = ? ORDER BY created_at DESC`
    ).bind(jwt.sub).all();
    return ok(rows.results);
  }

  return err('Not Found', 404, 'not_found');
}
