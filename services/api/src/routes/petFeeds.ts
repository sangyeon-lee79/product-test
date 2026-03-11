// Pet Feeds / Supplements CRUD — per-pet feed & supplement registration
// Guardian: /api/v1/pets/:petId/pet-feeds  (delegated from pets/index.ts)
//           /api/v1/pets/:petId/pet-supplements
// Pattern mirrors guardian-devices in devices.ts

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';
import { resolveLang, hasTable, hasColumn } from '../helpers/sqlHelpers';

export async function handlePetFeeds(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;

  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult as JwtPayload;

    const match = path.match(/^\/api\/v1\/pets\/([^/]+)\/(pet-feeds|pet-supplements)(?:\/([^/]+))?$/);
    if (!match) return err('Not Found', 404, 'not_found');
    const petId = match[1];
    const category: 'feed' | 'supplement' = match[2] === 'pet-supplements' ? 'supplement' : 'feed';
    const feedId = match[3];

    // Verify pet belongs to guardian
    const pet = await env.DB.prepare(
      `SELECT id FROM pets WHERE id = ? AND guardian_user_id = ? AND status != 'deleted'`
    ).bind(petId, user.sub).first<{ id: string }>();
    if (!pet) return err('Pet not found', 404, 'not_found');

    // Check table existence
    if (!(await hasTable(env, 'pet_feeds'))) {
      if (method === 'GET') return ok({ feeds: [] });
      return err('pet_feeds not available yet', 400, 'not_supported');
    }

    const hasFeedModels = await hasTable(env, 'feed_models');
    const hasNutrition = await hasTable(env, 'feed_nutrition');

    // GET list — cache-bust comment prevents Hyperdrive from serving stale reads after writes
    if (!feedId && method === 'GET') {
      const orderBy = 'pf.is_primary DESC, pf.created_at DESC';
      const cb = `/* t${Date.now()} */`;

      if (!hasFeedModels) {
        const rows = await env.DB.prepare(
          `${cb} SELECT * FROM pet_feeds pf WHERE pf.pet_id = ? AND pf.status != 'deleted' AND COALESCE(pf.category_type, 'feed') = ? ORDER BY ${orderBy}`
        ).bind(petId, category).all();
        return ok({ feeds: rows.results });
      }

      try {
        const lang = resolveLang(url);
        const langCol = lang;
        const normalized = await hasColumn(env, 'master_items', 'code');
        const codeCol = normalized ? 'code' : 'key';

        let nutritionSelect = '';
        let nutritionJoin = '';
        if (hasNutrition) {
          nutritionSelect = `,
            fn.calories_per_100g, fn.protein_pct, fn.fat_pct, fn.fiber_pct,
            fn.moisture_pct, fn.carbohydrate_pct, fn.serving_size_g`;
          nutritionJoin = `LEFT JOIN feed_nutrition fn ON fn.feed_model_id = fm.id AND fn.status = 'active'`;
        }

        const rows = await env.DB.prepare(
          `${cb} SELECT pf.*, fm.model_name, fm.model_code, fm.description AS model_description, fm.image_url,
                  mi.${codeCol} as type_key,
                  COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.${codeCol}) AS type_display_label,
                  mfr.name_ko as mfr_name_ko, mfr.name_en as mfr_name_en,
                  COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko) AS mfr_display_label,
                  b.name_ko as brand_name_ko, b.name_en as brand_name_en,
                  COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
                  COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), fm.model_name) AS model_display_label
                  ${nutritionSelect}
           FROM pet_feeds pf
           LEFT JOIN feed_models fm ON fm.id = pf.feed_model_id
           LEFT JOIN master_items mi ON mi.id = fm.feed_type_item_id
           LEFT JOIN master_categories mc ON mc.id = mi.category_id
           LEFT JOIN i18n_translations tr_type
             ON tr_type.key = CASE
               WHEN mc.${codeCol} LIKE 'master.%' THEN (mc.${codeCol} || '.' || mi.${codeCol})
               ELSE ('master.' || mc.${codeCol} || '.' || mi.${codeCol})
             END
           LEFT JOIN feed_manufacturers mfr ON mfr.id = fm.manufacturer_id
           LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
           LEFT JOIN feed_brands b ON b.id = fm.brand_id
           LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
           LEFT JOIN i18n_translations tr_model ON tr_model.key = fm.name_key
           ${nutritionJoin}
           WHERE pf.pet_id = ? AND pf.status != 'deleted'
             AND COALESCE(pf.category_type, 'feed') = ?
           ORDER BY ${orderBy}`
        ).bind(petId, category).all();
        return ok({ feeds: rows.results });
      } catch {
        // Fallback: simple query without JOINs
        const rows = await env.DB.prepare(
          `${cb} SELECT * FROM pet_feeds pf WHERE pf.pet_id = ? AND pf.status != 'deleted' AND COALESCE(pf.category_type, 'feed') = ? ORDER BY ${orderBy}`
        ).bind(petId, category).all();
        return ok({ feeds: rows.results });
      }
    }

    // POST create
    if (!feedId && method === 'POST') {
      const body = await request.json<{
        feed_model_id: string;
        disease_item_id?: string;
        nickname?: string;
        daily_amount_g?: number;
        daily_amount_unit?: string;
        feeding_frequency?: number;
        start_date?: string;
        end_date?: string;
        notes?: string;
        is_primary?: boolean;
      }>();
      if (!body.feed_model_id) return err('feed_model_id required', 400, 'missing_field');

      if (hasFeedModels) {
        const model = await env.DB.prepare(`SELECT id FROM feed_models WHERE id = ? AND status = 'active'`).bind(body.feed_model_id).first<{ id: string }>();
        if (!model) return err('Feed model not found', 404, 'not_found');
      }

      const isPrimary = body.is_primary === true;
      if (isPrimary) {
        await env.DB.prepare(
          `UPDATE pet_feeds SET is_primary = false, updated_at = ? WHERE pet_id = ? AND is_primary = true AND COALESCE(category_type, 'feed') = ?`
        ).bind(now(), petId, category).run();
      }

      const id = newId();
      await env.DB.prepare(
        `INSERT INTO pet_feeds (id, pet_id, feed_model_id, disease_item_id, nickname, daily_amount_g, daily_amount_unit, feeding_frequency, start_date, end_date, notes, is_primary, category_type, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
      ).bind(
        id, petId, body.feed_model_id,
        body.disease_item_id ?? null,
        body.nickname ?? null,
        body.daily_amount_g ?? null,
        body.daily_amount_unit ?? 'g',
        body.feeding_frequency ?? null,
        body.start_date ?? null,
        body.end_date ?? null,
        body.notes ?? null,
        isPrimary,
        category,
        now(), now(),
      ).run();

      return created({ id });
    }

    // PUT update
    if (feedId && method === 'PUT') {
      const body = await request.json<{
        nickname?: string;
        disease_item_id?: string;
        daily_amount_g?: number;
        daily_amount_unit?: string;
        feeding_frequency?: number;
        start_date?: string;
        end_date?: string;
        notes?: string;
        is_primary?: boolean;
      }>();

      if (body.is_primary) {
        await env.DB.prepare(
          `UPDATE pet_feeds SET is_primary = false, updated_at = ? WHERE pet_id = ? AND is_primary = true AND id != ? AND COALESCE(category_type, 'feed') = ?`
        ).bind(now(), petId, feedId, category).run();
      }

      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | boolean | null)[] = [now()];
      if ('nickname' in body) { sets.push('nickname = ?'); vals.push(body.nickname ?? null); }
      if ('disease_item_id' in body) { sets.push('disease_item_id = ?'); vals.push(body.disease_item_id ?? null); }
      if ('daily_amount_g' in body) { sets.push('daily_amount_g = ?'); vals.push(body.daily_amount_g ?? null); }
      if ('daily_amount_unit' in body) { sets.push('daily_amount_unit = ?'); vals.push(body.daily_amount_unit ?? 'g'); }
      if ('feeding_frequency' in body) { sets.push('feeding_frequency = ?'); vals.push(body.feeding_frequency ?? null); }
      if ('start_date' in body) { sets.push('start_date = ?'); vals.push(body.start_date ?? null); }
      if ('end_date' in body) { sets.push('end_date = ?'); vals.push(body.end_date ?? null); }
      if ('notes' in body) { sets.push('notes = ?'); vals.push(body.notes ?? null); }
      if ('is_primary' in body) { sets.push('is_primary = ?'); vals.push(body.is_primary === true); }
      vals.push(feedId, petId);
      await env.DB.prepare(`UPDATE pet_feeds SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`).bind(...vals).run();
      return ok({ id: feedId, updated: true });
    }

    // DELETE (soft)
    if (feedId && method === 'DELETE') {
      await env.DB.prepare(
        `UPDATE pet_feeds SET status = 'deleted', updated_at = ? WHERE id = ? AND pet_id = ?`
      ).bind(now(), feedId, petId).run();
      return ok({ id: feedId, deleted: true });
    }

    return err('Method Not Allowed', 405, 'method_not_allowed');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`pet-feeds error: ${msg}`, 500, 'internal_error');
  }
}
