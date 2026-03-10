// Pet Feeding Logs CRUD — 급여 기록 (single + multi-feed mixing)
// Guardian: /api/v1/pets/:petId/feeding-logs (delegated from pets/index.ts)

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';
import { resolveLang, hasTable } from '../helpers/sqlHelpers';

interface FeedingLogItemBody {
  pet_feed_id: string;
  amount_g?: number;
  ratio_pct?: number;
}

export async function handlePetFeedingLogs(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;

  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult as JwtPayload;

    const match = path.match(/^\/api\/v1\/pets\/([^/]+)\/feeding-logs(?:\/([^/]+))?$/);
    if (!match) return err('Not Found', 404, 'not_found');
    const petId = match[1];
    const logId = match[2];

    // Verify pet belongs to guardian
    const pet = await env.DB.prepare(
      `SELECT id FROM pets WHERE id = ? AND guardian_user_id = ? AND status != 'deleted'`
    ).bind(petId, user.sub).first<{ id: string }>();
    if (!pet) return err('Pet not found', 404, 'not_found');

    // Check table existence
    if (!(await hasTable(env, 'pet_feeding_logs'))) {
      if (method === 'GET') return ok({ logs: [] });
      return err('pet_feeding_logs not available yet', 400, 'not_supported');
    }

    const hasFeedModels = await hasTable(env, 'feed_models');
    const hasItems = await hasTable(env, 'pet_feeding_log_items');

    // GET list
    if (!logId && method === 'GET') {
      if (!hasFeedModels) {
        const rows = await env.DB.prepare(
          `SELECT * FROM pet_feeding_logs WHERE pet_id = ? AND status != 'deleted' ORDER BY created_at DESC`
        ).bind(petId).all();
        return ok({ logs: rows.results });
      }

      try {
        const lang = resolveLang(url);
        const hasNutrition = await hasTable(env, 'feed_nutrition');

        const rows = await env.DB.prepare(
          `SELECT fl.*,
                  pf.nickname AS feed_nickname,
                  fm.model_name,
                  COALESCE(NULLIF(TRIM(tr_model.${lang}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), fm.model_name) AS model_display_label${hasNutrition ? `,
                  fn.calories_per_100g` : ''}
           FROM pet_feeding_logs fl
           LEFT JOIN pet_feeds pf ON pf.id = fl.pet_feed_id
           LEFT JOIN feed_models fm ON fm.id = fl.feed_model_id
           LEFT JOIN i18n_translations tr_model ON tr_model.key = fm.name_key${hasNutrition ? `
           LEFT JOIN feed_nutrition fn ON fn.feed_model_id = fl.feed_model_id` : ''}
           WHERE fl.pet_id = ? AND fl.status != 'deleted'
           ORDER BY fl.created_at DESC`
        ).bind(petId).all();

        // For mixed logs, also load items
        if (hasItems) {
          const logs = rows.results as Record<string, unknown>[];
          const mixedIds = logs.filter((l) => l.is_mixed === 1).map((l) => l.id as string);
          if (mixedIds.length > 0) {
            const placeholders = mixedIds.map(() => '?').join(',');
            const itemRows = await env.DB.prepare(
              `SELECT fli.*,
                      pf.nickname AS feed_nickname,
                      fm.model_name,
                      COALESCE(NULLIF(TRIM(tr.${lang}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), fm.model_name) AS model_display_label${hasNutrition ? `,
                      fn.calories_per_100g, fn.protein_pct, fn.fat_pct, fn.fiber_pct, fn.carbohydrate_pct` : ''}
               FROM pet_feeding_log_items fli
               LEFT JOIN pet_feeds pf ON pf.id = fli.pet_feed_id
               LEFT JOIN feed_models fm ON fm.id = fli.feed_model_id
               LEFT JOIN i18n_translations tr ON tr.key = fm.name_key${hasNutrition ? `
               LEFT JOIN feed_nutrition fn ON fn.feed_model_id = fli.feed_model_id` : ''}
               WHERE fli.feeding_log_id IN (${placeholders})
               ORDER BY fli.sort_order`
            ).bind(...mixedIds).all();

            const itemsByLog = new Map<string, unknown[]>();
            for (const item of itemRows.results) {
              const lid = (item as Record<string, unknown>).feeding_log_id as string;
              if (!itemsByLog.has(lid)) itemsByLog.set(lid, []);
              itemsByLog.get(lid)!.push(item);
            }
            for (const log of logs) {
              if (log.is_mixed === 1) {
                log.items = itemsByLog.get(log.id as string) ?? [];
              }
            }
          }
        }

        return ok({ logs: rows.results });
      } catch {
        const rows = await env.DB.prepare(
          `SELECT * FROM pet_feeding_logs WHERE pet_id = ? AND status != 'deleted' ORDER BY created_at DESC`
        ).bind(petId).all();
        return ok({ logs: rows.results });
      }
    }

    // POST create
    if (!logId && method === 'POST') {
      const body = await request.json<{
        pet_feed_id?: string;
        feed_model_id?: string;
        amount_g?: number;
        amount_unit?: string;
        frequency?: number;
        feeding_time?: string;
        memo?: string;
        is_mixed?: boolean;
        items?: FeedingLogItemBody[];
      }>();

      const isMixed = !!body.is_mixed && Array.isArray(body.items) && body.items.length > 0;

      // Validation: single mode needs pet_feed_id or feed_model_id; mixed mode needs items
      if (!isMixed && !body.pet_feed_id && !body.feed_model_id) {
        return err('pet_feed_id or feed_model_id required', 400, 'missing_field');
      }

      // If pet_feed_id given (single mode), resolve feed_model_id from it
      let feedModelId = body.feed_model_id ?? null;
      if (!isMixed && body.pet_feed_id && !feedModelId) {
        const pf = await env.DB.prepare(
          `SELECT feed_model_id FROM pet_feeds WHERE id = ? AND pet_id = ?`
        ).bind(body.pet_feed_id, petId).first<{ feed_model_id: string }>();
        if (pf) feedModelId = pf.feed_model_id;
      }

      const id = newId();
      const hasIsMixed = await hasTable(env, 'pet_feeding_log_items'); // implies column exists too

      if (hasIsMixed) {
        await env.DB.prepare(
          `INSERT INTO pet_feeding_logs (id, pet_id, pet_feed_id, feed_model_id, amount_g, amount_unit, frequency, feeding_time, memo, is_mixed, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
        ).bind(
          id, petId,
          isMixed ? null : (body.pet_feed_id ?? null),
          isMixed ? null : feedModelId,
          body.amount_g ?? null,
          body.amount_unit ?? 'g',
          body.frequency ?? null,
          body.feeding_time ?? null,
          body.memo ?? null,
          isMixed ? 1 : 0,
          now(), now(),
        ).run();

        // Insert items for mixed mode
        if (isMixed && body.items) {
          for (let i = 0; i < body.items.length; i++) {
            const item = body.items[i];
            // Resolve feed_model_id from pet_feed_id
            let itemModelId: string | null = null;
            if (item.pet_feed_id) {
              const pf = await env.DB.prepare(
                `SELECT feed_model_id FROM pet_feeds WHERE id = ? AND pet_id = ?`
              ).bind(item.pet_feed_id, petId).first<{ feed_model_id: string }>();
              if (pf) itemModelId = pf.feed_model_id;
            }
            await env.DB.prepare(
              `INSERT INTO pet_feeding_log_items (id, feeding_log_id, pet_feed_id, feed_model_id, amount_g, ratio_pct, sort_order, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              newId(), id,
              item.pet_feed_id ?? null,
              itemModelId,
              item.amount_g ?? null,
              item.ratio_pct ?? null,
              i,
              now(), now(),
            ).run();
          }
        }
      } else {
        // Legacy path — no is_mixed column yet
        await env.DB.prepare(
          `INSERT INTO pet_feeding_logs (id, pet_id, pet_feed_id, feed_model_id, amount_g, amount_unit, frequency, feeding_time, memo, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
        ).bind(
          id, petId,
          body.pet_feed_id ?? null,
          feedModelId,
          body.amount_g ?? null,
          body.amount_unit ?? 'g',
          body.frequency ?? null,
          body.feeding_time ?? null,
          body.memo ?? null,
          now(), now(),
        ).run();
      }

      return created({ id });
    }

    // PUT update
    if (logId && method === 'PUT') {
      const body = await request.json<{
        pet_feed_id?: string;
        feed_model_id?: string;
        amount_g?: number;
        amount_unit?: string;
        frequency?: number;
        feeding_time?: string;
        memo?: string;
        is_mixed?: boolean;
        items?: FeedingLogItemBody[];
      }>();

      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | null)[] = [now()];

      if ('pet_feed_id' in body) { sets.push('pet_feed_id = ?'); vals.push(body.pet_feed_id ?? null); }
      if ('feed_model_id' in body) { sets.push('feed_model_id = ?'); vals.push(body.feed_model_id ?? null); }
      if ('amount_g' in body) { sets.push('amount_g = ?'); vals.push(body.amount_g ?? null); }
      if ('amount_unit' in body) { sets.push('amount_unit = ?'); vals.push(body.amount_unit ?? 'g'); }
      if ('frequency' in body) { sets.push('frequency = ?'); vals.push(body.frequency ?? null); }
      if ('feeding_time' in body) { sets.push('feeding_time = ?'); vals.push(body.feeding_time ?? null); }
      if ('memo' in body) { sets.push('memo = ?'); vals.push(body.memo ?? null); }

      const isMixed = !!body.is_mixed && Array.isArray(body.items) && body.items.length > 0;
      if (hasItems && 'is_mixed' in body) {
        sets.push('is_mixed = ?');
        vals.push(isMixed ? 1 : 0);
      }

      vals.push(logId, petId);
      await env.DB.prepare(
        `UPDATE pet_feeding_logs SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`
      ).bind(...vals).run();

      // Replace items if mixed mode updated
      if (hasItems && isMixed && body.items) {
        await env.DB.prepare(
          `DELETE FROM pet_feeding_log_items WHERE feeding_log_id = ?`
        ).bind(logId).run();
        for (let i = 0; i < body.items.length; i++) {
          const item = body.items[i];
          let itemModelId: string | null = null;
          if (item.pet_feed_id) {
            const pf = await env.DB.prepare(
              `SELECT feed_model_id FROM pet_feeds WHERE id = ? AND pet_id = ?`
            ).bind(item.pet_feed_id, petId).first<{ feed_model_id: string }>();
            if (pf) itemModelId = pf.feed_model_id;
          }
          await env.DB.prepare(
            `INSERT INTO pet_feeding_log_items (id, feeding_log_id, pet_feed_id, feed_model_id, amount_g, ratio_pct, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            newId(), logId,
            item.pet_feed_id ?? null,
            itemModelId,
            item.amount_g ?? null,
            item.ratio_pct ?? null,
            i,
            now(), now(),
          ).run();
        }
      } else if (hasItems && 'is_mixed' in body && !isMixed) {
        // Switched back to single mode — remove items
        await env.DB.prepare(
          `DELETE FROM pet_feeding_log_items WHERE feeding_log_id = ?`
        ).bind(logId).run();
      }

      return ok({ id: logId, updated: true });
    }

    // DELETE (soft)
    if (logId && method === 'DELETE') {
      await env.DB.prepare(
        `UPDATE pet_feeding_logs SET status = 'deleted', updated_at = ? WHERE id = ? AND pet_id = ?`
      ).bind(now(), logId, petId).run();
      return ok({ id: logId, deleted: true });
    }

    return err('Method Not Allowed', 405, 'method_not_allowed');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`pet-feeding-logs error: ${msg}`, 500, 'internal_error');
  }
}
