import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now, randomToken } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import { SUPPORTED_LANGS as LANGS } from '@petfolio/shared';
import { resolveLang, hasColumn, hasTable, syncParentMap, normalizedTranslations, upsertI18n } from '../helpers/sqlHelpers';

/**
 * Supplement Catalog — mirrors feedCatalog.ts but filters by category_type='supplement'
 * and uses master_categories.code='supplement_type' for type hierarchy.
 */
export async function handleSupplementCatalog(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;
  const isAdmin = path.startsWith('/api/v1/admin/');
  const hasMfrTypeMap = await hasTable(env, 'feed_manufacturer_type_map');
  const CAT = 'supplement';

  // Public: nutrition info for a supplement model
  const publicNutritionMatch = !isAdmin && path.match(/^\/api\/v1\/supplement-catalog\/models\/([^/]+)\/nutrition$/);
  if (publicNutritionMatch && method === 'GET') {
    const modelId = publicNutritionMatch[1];
    if (!(await hasTable(env, 'feed_nutrition'))) return ok(null);
    const row = await env.DB.prepare(
      `SELECT * FROM feed_nutrition WHERE feed_model_id = ? AND status = 'active' LIMIT 1`
    ).bind(modelId).first();
    return ok(row ?? null);
  }

  if (!isAdmin) {
    const lang = resolveLang(url);
    const langCol = lang;

    if (path === '/api/v1/supplement-catalog/types' && method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT
           mi.id,
           mi.code AS key,
           mi.sort_order,
           'active' AS status,
           COALESCE((
             SELECT COUNT(*)
             FROM feed_models fm
             WHERE fm.feed_type_item_id = mi.id
               AND fm.status = 'active'
               AND fm.category_type = '${CAT}'
           ), 0) AS model_count,
           COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mi.code) AS display_label,
           tr.ko AS ko_name,
           tr.en AS name_en
         FROM master_items mi
         JOIN master_categories mc ON mc.id = mi.category_id
         LEFT JOIN i18n_translations tr
           ON tr.key = CASE
             WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
             ELSE ('master.' || mc.code || '.' || mi.code)
           END
         WHERE mc.code = 'supplement_type'
           AND mi.status = 'active'
         ORDER BY mi.sort_order, mi.code`
      ).all();
      return ok(rows.results);
    }

    if (path === '/api/v1/supplement-catalog/manufacturers' && method === 'GET') {
      const typeItemId = (url.searchParams.get('feed_type_id') || '').trim();
      const binds: string[] = [];
      let modelCountExpr = `(
        SELECT COUNT(*)
        FROM feed_models fm
        WHERE fm.manufacturer_id = mfr.id
          AND fm.status = 'active'
          AND fm.category_type = '${CAT}'
      )`;
      if (typeItemId) {
        modelCountExpr = `(
          SELECT COUNT(*)
          FROM feed_models fm
          WHERE fm.manufacturer_id = mfr.id
            AND fm.status = 'active'
            AND fm.category_type = '${CAT}'
            AND fm.feed_type_item_id = ?
        )`;
        binds.push(typeItemId);
      }
      let where = `WHERE mfr.status = 'active' AND mfr.category_type = '${CAT}'`;
      where += ` AND EXISTS (
        SELECT 1
        FROM feed_models fm
        WHERE fm.manufacturer_id = mfr.id
          AND fm.status = 'active'
          AND fm.category_type = '${CAT}'`;
      if (typeItemId) {
        where += `
          AND fm.feed_type_item_id = ?`;
        binds.push(typeItemId);
      }
      where += `
      )`;
      const rows = await env.DB.prepare(
        `SELECT mfr.*,
                ${modelCountExpr} AS model_count,
                COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko) AS display_label
         FROM feed_manufacturers mfr
         LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
         ${where}
         ORDER BY mfr.sort_order, mfr.name_en`
      ).bind(...binds).all();
      return ok(rows.results);
    }

    if (path === '/api/v1/supplement-catalog/brands' && method === 'GET') {
      const manufacturerId = url.searchParams.get('manufacturer_id');
      const typeItemId = (url.searchParams.get('feed_type_id') || '').trim();
      const binds: string[] = [];
      let modelCountExpr = `(
        SELECT COUNT(*)
        FROM feed_models fm
        WHERE fm.brand_id = b.id
          AND fm.status = 'active'
          AND fm.category_type = '${CAT}'
      )`;
      if (typeItemId) {
        modelCountExpr = `(
          SELECT COUNT(*)
          FROM feed_models fm
          WHERE fm.brand_id = b.id
            AND fm.status = 'active'
            AND fm.category_type = '${CAT}'
            AND fm.feed_type_item_id = ?
        )`;
        binds.push(typeItemId);
      }
      if (manufacturerId) {
        modelCountExpr = modelCountExpr.replace(
          'WHERE fm.brand_id = b.id',
          `WHERE fm.brand_id = b.id
            AND (
              fm.manufacturer_id = ?
              OR EXISTS (
                SELECT 1
                FROM feed_brand_manufacturer_map bmm2
                WHERE bmm2.brand_id = b.id
                  AND bmm2.manufacturer_id = ?
              )
            )`,
        );
        binds.push(manufacturerId, manufacturerId);
      }
      let q = `SELECT b.*,
                      ${modelCountExpr} AS model_count,
                      m.name_ko AS mfr_name_ko,
                      COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), m.name_en, m.name_ko) AS mfr_display_label,
                      COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS display_label
               FROM feed_brands b
               JOIN feed_manufacturers m ON m.id = b.manufacturer_id
               LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = m.name_key
               LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
               WHERE b.status = 'active'
                 AND b.category_type = '${CAT}'
                 AND EXISTS (
                   SELECT 1
                   FROM feed_models fm
                   WHERE fm.brand_id = b.id
                     AND fm.status = 'active'
                     AND fm.category_type = '${CAT}'`;
      if (manufacturerId) {
        q += `
                     AND (
                       fm.manufacturer_id = ?
                       OR EXISTS (
                         SELECT 1
                         FROM feed_brand_manufacturer_map bmm2
                         WHERE bmm2.brand_id = b.id
                           AND bmm2.manufacturer_id = ?
                       )
                     )
                 )
                 AND (
          b.manufacturer_id = ?
          OR EXISTS (
            SELECT 1
            FROM feed_brand_manufacturer_map bmm
            WHERE bmm.brand_id = b.id
              AND bmm.manufacturer_id = ?
          )
        )`;
        binds.push(manufacturerId, manufacturerId, manufacturerId, manufacturerId);
      } else {
        q += `
                 )`;
      }
      if (typeItemId) {
        q += ` AND EXISTS (
          SELECT 1
          FROM feed_models fm_type
          WHERE fm_type.brand_id = b.id
            AND fm_type.status = 'active'
            AND fm_type.category_type = '${CAT}'
            AND fm_type.feed_type_item_id = ?`;
        if (manufacturerId) {
          q += `
            AND (
              fm_type.manufacturer_id = ?
              OR EXISTS (
                SELECT 1
                FROM feed_brand_manufacturer_map bmm3
                WHERE bmm3.brand_id = b.id
                  AND bmm3.manufacturer_id = ?
              )
            )`;
          binds.push(typeItemId, manufacturerId, manufacturerId);
        } else {
          binds.push(typeItemId);
        }
        q += `
        )`;
      }
      q += ' ORDER BY b.name_en';
      const rows = await env.DB.prepare(q).bind(...binds).all();
      return ok(rows.results);
    }

    if (path === '/api/v1/supplement-catalog/models' && method === 'GET') {
      const typeId = url.searchParams.get('feed_type_id');
      const mfrId = url.searchParams.get('manufacturer_id');
      const brandId = url.searchParams.get('brand_id');
      const hasModelBrandMap = (await hasTable(env, 'feed_model_brand_map'))
        && (await hasColumn(env, 'feed_model_brand_map', 'model_id'))
        && (await hasColumn(env, 'feed_model_brand_map', 'brand_id'));
      const binds: string[] = [];
      let where = `WHERE m.status = 'active' AND m.category_type = '${CAT}'`;
      if (typeId) { where += ' AND m.feed_type_item_id = ?'; binds.push(typeId); }
      if (mfrId) { where += ' AND m.manufacturer_id = ?'; binds.push(mfrId); }
      if (brandId) {
        if (hasModelBrandMap) {
          where += ` AND (
            m.brand_id = ?
            OR EXISTS (
              SELECT 1
              FROM feed_model_brand_map mbm
              WHERE mbm.model_id = m.id
                AND mbm.brand_id = ?
            )
          )`;
          binds.push(brandId, brandId);
        } else {
          where += ' AND m.brand_id = ?';
          binds.push(brandId);
        }
      }
      const rows = await env.DB.prepare(
        `SELECT m.*,
                mi.code AS type_key,
                tr_type.ko AS type_name_ko,
                tr_type.en AS type_name_en,
                COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.code) AS type_display_label,
                mfr.name_ko AS mfr_name_ko,
                mfr.name_en AS mfr_name_en,
                COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko) AS mfr_display_label,
                b.name_ko AS brand_name_ko,
                b.name_en AS brand_name_en,
                COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
                COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), m.model_name) AS model_display_label
         FROM feed_models m
         LEFT JOIN master_items mi ON mi.id = m.feed_type_item_id
         LEFT JOIN master_categories mc ON mc.id = mi.category_id
         LEFT JOIN i18n_translations tr_type
           ON tr_type.key = CASE
             WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
             ELSE ('master.' || mc.code || '.' || mi.code)
           END
         LEFT JOIN feed_manufacturers mfr ON mfr.id = m.manufacturer_id
         LEFT JOIN feed_brands b ON b.id = m.brand_id
         LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
         LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
         LEFT JOIN i18n_translations tr_model ON tr_model.key = m.name_key
         ${where}
         ORDER BY m.model_name`
      ).bind(...binds).all();
      return ok(rows.results);
    }
  }

  // ── Admin endpoints (auth required) ──
  const user = await requireAuth(request, env);
  if (!user) return err('Unauthorized', 401, 'unauthorized');
  const roleResult = requireRole(user as JwtPayload, ['admin']);
  if (roleResult instanceof Response) return roleResult;

  const lang = resolveLang(url);
  const langCol = lang;

  if (path === '/api/v1/admin/supplement-catalog/types' && method === 'GET') {
    const rows = await env.DB.prepare(
      `SELECT
         mi.id,
         mi.code AS key,
         mi.sort_order,
         mi.status,
         COALESCE((
           SELECT COUNT(*)
           FROM feed_models fm
           WHERE fm.feed_type_item_id = mi.id
             AND fm.status = 'active'
             AND fm.category_type = '${CAT}'
         ), 0) AS model_count,
         COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mi.code) AS display_label,
         tr.ko AS ko_name,
         tr.en AS name_en
       FROM master_items mi
       JOIN master_categories mc ON mc.id = mi.category_id
       LEFT JOIN i18n_translations tr
         ON tr.key = CASE
           WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
           ELSE ('master.' || mc.code || '.' || mi.code)
         END
       WHERE mc.code = 'supplement_type'
       ORDER BY mi.sort_order, mi.code`
    ).all();
    return ok(rows.results);
  }

  if (path === '/api/v1/admin/supplement-catalog/manufacturers' && method === 'GET') {
    const typeItemId = url.searchParams.get('type_item_id');
    const parentTypeIdsExpr = hasMfrTypeMap
      ? `(SELECT STRING_AGG(type_item_id, ',') FROM feed_manufacturer_type_map mtm WHERE mtm.manufacturer_id = mfr.id)`
      : `NULL`;
    const binds: string[] = [];
    let modelCountExpr = `(
      SELECT COUNT(*)
      FROM feed_models fm
      WHERE fm.manufacturer_id = mfr.id
        AND fm.status = 'active'
        AND fm.category_type = '${CAT}'
    )`;
    if (typeItemId) {
      modelCountExpr = `(
        SELECT COUNT(*)
        FROM feed_models fm
        WHERE fm.manufacturer_id = mfr.id
          AND fm.status = 'active'
          AND fm.category_type = '${CAT}'
          AND fm.feed_type_item_id = ?
      )`;
      binds.push(typeItemId);
    }
    let where = `WHERE mfr.category_type = '${CAT}'`;
    if (typeItemId && hasMfrTypeMap) {
      where += ` AND EXISTS (SELECT 1 FROM feed_manufacturer_type_map mtm WHERE mtm.manufacturer_id = mfr.id AND mtm.type_item_id = ?)`;
      binds.push(typeItemId);
    }
    const rows = await env.DB.prepare(
      `SELECT mfr.*,
              ${modelCountExpr} AS model_count,
              ${parentTypeIdsExpr} AS parent_type_ids,
              COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko) AS display_label
       FROM feed_manufacturers mfr
       LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
       ${where}
       ORDER BY mfr.sort_order, mfr.name_en`
    ).bind(...binds).all();
    return ok(rows.results);
  }

  if (path === '/api/v1/admin/supplement-catalog/manufacturers' && method === 'POST') {
    const body = await request.json<{ country?: string; sort_order?: number; translations?: Record<string, string>; name_ko?: string; name_en?: string; parent_type_ids?: string[] }>();
    const ko = (body.translations?.ko || body.name_ko || '').trim();
    const en = (body.translations?.en || body.name_en || ko).trim();
    if (!ko) return err('ko required', 400, 'missing_field');
    const key = `suppl_mfr_${randomToken(8)}`;
    const nameKey = `supplement.manufacturer.${key}`;
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO feed_manufacturers (id, key, name_key, name_ko, name_en, country, status, sort_order, category_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, '${CAT}', ?, ?)`
    ).bind(id, key, nameKey, ko, en, body.country ?? null, body.sort_order ?? 0, now(), now()).run();
    await upsertI18n(env, nameKey, normalizedTranslations(body.translations, ko, en), 'supplement');
    if (hasMfrTypeMap) {
      await syncParentMap(env, 'feed_manufacturer_type_map', 'manufacturer_id', id, 'type_item_id', body.parent_type_ids ?? []);
    }
    const parentTypeIdsExpr = hasMfrTypeMap
      ? `(SELECT STRING_AGG(type_item_id, ',') FROM feed_manufacturer_type_map mtm WHERE mtm.manufacturer_id = mfr.id)`
      : `NULL`;
    return created(await env.DB.prepare(
      `SELECT mfr.*,
              ${parentTypeIdsExpr} AS parent_type_ids,
              COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko) AS display_label
       FROM feed_manufacturers mfr
       LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
       WHERE mfr.id = ?`
    ).bind(id).first());
  }

  const mfrIdMatch = path.match(/^\/api\/v1\/admin\/supplement-catalog\/manufacturers\/([^/]+)$/);
  if (mfrIdMatch) {
    const mfrId = mfrIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ name_ko?: string; name_en?: string; country?: string; sort_order?: number; status?: string; translations?: Record<string, string>; parent_type_ids?: string[] }>();
      const existing = await env.DB.prepare('SELECT name_key, name_ko, name_en FROM feed_manufacturers WHERE id = ?').bind(mfrId).first<{ name_key?: string | null; name_ko?: string | null; name_en?: string | null }>();
      if (!existing) return err('manufacturer not found', 404, 'not_found');
      const sets: string[] = [];
      const vals: Array<string | number | null> = [];
      if (body.name_ko !== undefined) { sets.push('name_ko = ?'); vals.push(body.name_ko); }
      if (body.name_en !== undefined) { sets.push('name_en = ?'); vals.push(body.name_en); }
      if (body.country !== undefined) { sets.push('country = ?'); vals.push(body.country || null); }
      if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.status !== undefined) { sets.push('status = ?'); vals.push(body.status); }
      sets.push('updated_at = ?');
      vals.push(now(), mfrId);
      await env.DB.prepare(`UPDATE feed_manufacturers SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      const ko = (body.translations?.ko || body.name_ko || existing.name_ko || '').trim();
      const en = (body.translations?.en || body.name_en || ko || existing.name_en || '').trim();
      if (existing.name_key && (ko || en)) {
        await upsertI18n(env, existing.name_key, normalizedTranslations(body.translations, ko, en), 'supplement');
      }
      if (body.parent_type_ids && hasMfrTypeMap) {
        await syncParentMap(env, 'feed_manufacturer_type_map', 'manufacturer_id', mfrId, 'type_item_id', body.parent_type_ids);
      }
      const parentTypeIdsExpr = hasMfrTypeMap
        ? `(SELECT STRING_AGG(type_item_id, ',') FROM feed_manufacturer_type_map mtm WHERE mtm.manufacturer_id = mfr.id)`
        : `NULL`;
      return ok(await env.DB.prepare(
        `SELECT mfr.*,
                ${parentTypeIdsExpr} AS parent_type_ids,
                COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko) AS display_label
         FROM feed_manufacturers mfr
         LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
         WHERE mfr.id = ?`
      ).bind(mfrId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE feed_manufacturers SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), mfrId).run();
      return ok({ id: mfrId, deleted: true });
    }
  }

  if (path === '/api/v1/admin/supplement-catalog/brands' && method === 'GET') {
    const manufacturerId = url.searchParams.get('manufacturer_id');
    const typeItemId = (url.searchParams.get('type_item_id') || '').trim();
    const hasBrandMfrMap = await hasTable(env, 'feed_brand_manufacturer_map');
    const parentMfrIdsExpr = hasBrandMfrMap
      ? `(SELECT STRING_AGG(manufacturer_id, ',') FROM feed_brand_manufacturer_map bmm WHERE bmm.brand_id = b.id)`
      : `NULL`;
    const binds: string[] = [];
    let modelCountExpr = `(
      SELECT COUNT(*)
      FROM feed_models fm
      WHERE fm.brand_id = b.id
        AND fm.status = 'active'
        AND fm.category_type = '${CAT}'
    )`;
    if (typeItemId) {
      modelCountExpr = `(
        SELECT COUNT(*)
        FROM feed_models fm
        WHERE fm.brand_id = b.id
          AND fm.status = 'active'
          AND fm.category_type = '${CAT}'
          AND fm.feed_type_item_id = ?
      )`;
      binds.push(typeItemId);
    }
    let q = `SELECT b.*,
                    ${modelCountExpr} AS model_count,
                    m.name_ko AS mfr_name_ko,
                    COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), m.name_en, m.name_ko) AS mfr_display_label,
                    COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS display_label,
                    ${parentMfrIdsExpr} AS parent_mfr_ids
             FROM feed_brands b
             JOIN feed_manufacturers m ON m.id = b.manufacturer_id
             LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = m.name_key
             LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
             WHERE b.category_type = '${CAT}'`;
    if (manufacturerId) {
      q += ` AND (
        b.manufacturer_id = ?
        OR EXISTS (
          SELECT 1
          FROM feed_brand_manufacturer_map bmm
          WHERE bmm.brand_id = b.id
            AND bmm.manufacturer_id = ?
        )
      )`;
      binds.push(manufacturerId, manufacturerId);
    }
    q += ' ORDER BY b.name_en';
    const rows = await env.DB.prepare(q).bind(...binds).all();
    return ok(rows.results);
  }

  if (path === '/api/v1/admin/supplement-catalog/brands' && method === 'POST') {
    const body = await request.json<{ manufacturer_id?: string; manufacturer_ids?: string[]; translations?: Record<string, string>; name_ko?: string; name_en?: string }>();
    const ko = (body.translations?.ko || body.name_ko || '').trim();
    const en = (body.translations?.en || body.name_en || ko).trim();
    const manufacturerIds = Array.from(new Set([...(body.manufacturer_ids ?? []), ...(body.manufacturer_id ? [body.manufacturer_id] : [])].filter(Boolean)));
    if (manufacturerIds.length === 0 || !ko) return err('manufacturer_ids and ko required', 400, 'missing_field');
    const key = `suppl_brand_${randomToken(8)}`;
    const nameKey = `supplement.brand.${key}`;
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO feed_brands (id, manufacturer_id, name_key, name_ko, name_en, status, category_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', '${CAT}', ?, ?)`
    ).bind(id, manufacturerIds[0], nameKey, ko, en, now(), now()).run();
    await upsertI18n(env, nameKey, normalizedTranslations(body.translations, ko, en), 'supplement');
    if (await hasTable(env, 'feed_brand_manufacturer_map')) {
      await syncParentMap(env, 'feed_brand_manufacturer_map', 'brand_id', id, 'manufacturer_id', manufacturerIds);
    }
    return created(await env.DB.prepare(`SELECT * FROM feed_brands WHERE id = ?`).bind(id).first());
  }

  const brandIdMatch = path.match(/^\/api\/v1\/admin\/supplement-catalog\/brands\/([^/]+)$/);
  if (brandIdMatch) {
    const brandId = brandIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ name_ko?: string; name_en?: string; status?: string; translations?: Record<string, string>; manufacturer_ids?: string[]; manufacturer_id?: string }>();
      const existing = await env.DB.prepare('SELECT name_key, name_ko, name_en FROM feed_brands WHERE id = ?').bind(brandId).first<{ name_key?: string | null; name_ko?: string | null; name_en?: string | null }>();
      if (!existing) return err('brand not found', 404, 'not_found');
      const sets: string[] = [];
      const vals: Array<string | number | null> = [];
      if (body.name_ko !== undefined) { sets.push('name_ko = ?'); vals.push(body.name_ko); }
      if (body.name_en !== undefined) { sets.push('name_en = ?'); vals.push(body.name_en); }
      const manufacturerIds = Array.from(new Set([...(body.manufacturer_ids ?? []), ...(body.manufacturer_id ? [body.manufacturer_id] : [])].filter(Boolean)));
      if (manufacturerIds.length > 0) { sets.push('manufacturer_id = ?'); vals.push(manufacturerIds[0]); }
      if (body.status !== undefined) { sets.push('status = ?'); vals.push(body.status); }
      sets.push('updated_at = ?');
      vals.push(now(), brandId);
      await env.DB.prepare(`UPDATE feed_brands SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      const ko = (body.translations?.ko || body.name_ko || existing.name_ko || '').trim();
      const en = (body.translations?.en || body.name_en || ko || existing.name_en || '').trim();
      if (existing.name_key && (ko || en)) {
        await upsertI18n(env, existing.name_key, normalizedTranslations(body.translations, ko, en), 'supplement');
      }
      if (manufacturerIds.length > 0 && await hasTable(env, 'feed_brand_manufacturer_map')) {
        await syncParentMap(env, 'feed_brand_manufacturer_map', 'brand_id', brandId, 'manufacturer_id', manufacturerIds);
      }
      return ok(await env.DB.prepare(`SELECT * FROM feed_brands WHERE id = ?`).bind(brandId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE feed_brands SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), brandId).run();
      return ok({ id: brandId, deleted: true });
    }
  }

  if (path === '/api/v1/admin/supplement-catalog/models' && method === 'GET') {
    const typeId = url.searchParams.get('feed_type_id');
    const mfrId = url.searchParams.get('manufacturer_id');
    const brandId = url.searchParams.get('brand_id');
    const hasModelBrandMap = (await hasTable(env, 'feed_model_brand_map'))
      && (await hasColumn(env, 'feed_model_brand_map', 'model_id'))
      && (await hasColumn(env, 'feed_model_brand_map', 'brand_id'));
    const parentBrandIdsExpr = hasModelBrandMap
      ? `(SELECT STRING_AGG(brand_id, ',') FROM feed_model_brand_map mbm WHERE mbm.model_id = m.id)`
      : `NULL`;
    const binds: string[] = [];
    let where = `AND m.category_type = '${CAT}'`;
    if (typeId) { where += ' AND m.feed_type_item_id = ?'; binds.push(typeId); }
    if (mfrId) { where += ' AND m.manufacturer_id = ?'; binds.push(mfrId); }
    if (brandId) {
      if (hasModelBrandMap) {
        where += ` AND (
          m.brand_id = ?
          OR EXISTS (
            SELECT 1
            FROM feed_model_brand_map mbm
            WHERE mbm.model_id = m.id
              AND mbm.brand_id = ?
          )
        )`;
        binds.push(brandId, brandId);
      } else {
        where += ' AND m.brand_id = ?';
        binds.push(brandId);
      }
    }
    try {
      const rows = await env.DB.prepare(
        `SELECT m.*,
                ${parentBrandIdsExpr} AS parent_brand_ids,
                mi.code AS type_key,
                tr_type.ko AS type_name_ko,
                tr_type.en AS type_name_en,
                COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.code) AS type_display_label,
                mfr.name_ko AS mfr_name_ko,
                mfr.name_en AS mfr_name_en,
                COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko) AS mfr_display_label,
                b.name_ko AS brand_name_ko,
                b.name_en AS brand_name_en,
                COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
                COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), m.model_name) AS model_display_label
         FROM feed_models m
         LEFT JOIN master_items mi ON mi.id = m.feed_type_item_id
         LEFT JOIN master_categories mc ON mc.id = mi.category_id
         LEFT JOIN i18n_translations tr_type
           ON tr_type.key = CASE
             WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
             ELSE ('master.' || mc.code || '.' || mi.code)
           END
         LEFT JOIN feed_manufacturers mfr ON mfr.id = m.manufacturer_id
         LEFT JOIN feed_brands b ON b.id = m.brand_id
         LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
         LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
         LEFT JOIN i18n_translations tr_model ON tr_model.key = m.name_key
         WHERE 1=1 ${where}
         ORDER BY m.model_name`
      ).bind(...binds).all();
      return ok(rows.results);
    } catch (e) {
      console.error('[supplement-catalog admin models] primary query failed, fallback query used', e);
      const rows = await env.DB.prepare(
        `SELECT m.*,
                NULL AS parent_brand_ids,
                NULL AS type_key,
                NULL AS type_name_ko,
                NULL AS type_name_en,
                NULL AS type_display_label,
                mfr.name_ko AS mfr_name_ko,
                mfr.name_en AS mfr_name_en,
                COALESCE(mfr.name_en, mfr.name_ko) AS mfr_display_label,
                b.name_ko AS brand_name_ko,
                b.name_en AS brand_name_en,
                COALESCE(b.name_en, b.name_ko) AS brand_display_label,
                m.model_name AS model_display_label
         FROM feed_models m
         LEFT JOIN feed_manufacturers mfr ON mfr.id = m.manufacturer_id
         LEFT JOIN feed_brands b ON b.id = m.brand_id
         WHERE 1=1 ${where}
         ORDER BY m.model_name`
      ).bind(...binds).all();
      return ok(rows.results);
    }
  }

  if (path === '/api/v1/admin/supplement-catalog/models' && method === 'POST') {
    const body = await request.json<{ feed_type_id: string; manufacturer_id: string; brand_id?: string; brand_ids?: string[]; model_name?: string; model_code?: string; description?: string; translations?: Record<string, string>; name_ko?: string; name_en?: string }>();
    const ko = (body.translations?.ko || body.name_ko || body.model_name || '').trim();
    const en = (body.translations?.en || body.name_en || ko || body.model_name || '').trim();
    if (!body.feed_type_id || !body.manufacturer_id || !ko) return err('feed_type_id, manufacturer_id, ko required', 400, 'missing_field');
    const key = `suppl_model_${randomToken(8)}`;
    const nameKey = `supplement.model.${key}`;
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, status, category_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', '${CAT}', ?, ?)`
    ).bind(
      id,
      body.feed_type_id,
      body.manufacturer_id,
      body.brand_id ?? null,
      nameKey,
      en || ko,
      body.model_code ?? null,
      body.description ?? null,
      now(),
      now()
    ).run();
    await upsertI18n(env, nameKey, normalizedTranslations(body.translations, ko, en), 'supplement');
    const brandIds = Array.from(new Set([...(body.brand_ids ?? []), ...(body.brand_id ? [body.brand_id] : [])].filter(Boolean)));
    if (brandIds.length > 0 && await hasTable(env, 'feed_model_brand_map')) {
      await syncParentMap(env, 'feed_model_brand_map', 'model_id', id, 'brand_id', brandIds);
    }
    return created(await env.DB.prepare(`SELECT * FROM feed_models WHERE id = ?`).bind(id).first());
  }

  const modelIdMatch = path.match(/^\/api\/v1\/admin\/supplement-catalog\/models\/([^/]+)$/);
  if (modelIdMatch) {
    const modelId = modelIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ model_name?: string; model_code?: string; description?: string; status?: string; feed_type_id?: string; manufacturer_id?: string; brand_id?: string | null; brand_ids?: string[]; translations?: Record<string, string>; name_ko?: string; name_en?: string }>();
      const existing = await env.DB.prepare('SELECT name_key, model_name FROM feed_models WHERE id = ?').bind(modelId).first<{ name_key?: string | null; model_name?: string | null }>();
      if (!existing) return err('model not found', 404, 'not_found');
      const sets: string[] = [];
      const vals: Array<string | number | null> = [];
      const ko = (body.translations?.ko || body.name_ko || body.model_name || '').trim();
      const en = (body.translations?.en || body.name_en || ko || body.model_name || '').trim();
      const nextName = (en || ko || body.model_name || existing.model_name || '').trim();
      const brandIds = Array.from(new Set([...(body.brand_ids ?? []), ...(body.brand_id ? [body.brand_id] : [])].filter(Boolean)));
      if (body.feed_type_id) { sets.push('feed_type_item_id = ?'); vals.push(body.feed_type_id); }
      if (body.manufacturer_id) { sets.push('manufacturer_id = ?'); vals.push(body.manufacturer_id); }
      if (body.brand_id !== undefined) { sets.push('brand_id = ?'); vals.push(body.brand_id || null); }
      else if (brandIds.length > 0) { sets.push('brand_id = ?'); vals.push(brandIds[0]); }
      if (body.model_code !== undefined) { sets.push('model_code = ?'); vals.push(body.model_code || null); }
      if (body.description !== undefined) { sets.push('description = ?'); vals.push(body.description || null); }
      if (body.status !== undefined) { sets.push('status = ?'); vals.push(body.status); }
      if (nextName) { sets.push('model_name = ?'); vals.push(nextName); }
      sets.push('updated_at = ?');
      vals.push(now(), modelId);
      await env.DB.prepare(`UPDATE feed_models SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      if (existing.name_key && (ko || en || body.translations)) {
        await upsertI18n(env, existing.name_key, normalizedTranslations(body.translations, ko || existing.model_name || '', en || ko || existing.model_name || ''), 'supplement');
      }
      if (brandIds.length > 0 && await hasTable(env, 'feed_model_brand_map')) {
        await syncParentMap(env, 'feed_model_brand_map', 'model_id', modelId, 'brand_id', brandIds);
      }
      return ok(await env.DB.prepare(`SELECT * FROM feed_models WHERE id = ?`).bind(modelId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE feed_models SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), modelId).run();
      return ok({ id: modelId, deleted: true });
    }
  }

  // Admin: nutrition upsert for a supplement model
  const adminNutritionMatch = path.match(/^\/api\/v1\/admin\/supplement-catalog\/models\/([^/]+)\/nutrition$/);
  if (adminNutritionMatch) {
    const modelId = adminNutritionMatch[1];
    if (!(await hasTable(env, 'feed_nutrition'))) return err('feed_nutrition table not available', 400, 'not_supported');

    if (method === 'GET') {
      const row = await env.DB.prepare(
        `SELECT * FROM feed_nutrition WHERE feed_model_id = ? AND status = 'active' LIMIT 1`
      ).bind(modelId).first();
      return ok(row ?? null);
    }

    if (method === 'PUT') {
      const body = await request.json<{
        calories_per_100g?: number | null; protein_pct?: number | null; fat_pct?: number | null;
        fiber_pct?: number | null; moisture_pct?: number | null; ash_pct?: number | null;
        calcium_pct?: number | null; phosphorus_pct?: number | null; omega3_pct?: number | null;
        omega6_pct?: number | null; carbohydrate_pct?: number | null; serving_size_g?: number | null;
        ingredients_text?: string | null; notes?: string | null;
      }>();

      const existing = await env.DB.prepare(
        `SELECT id FROM feed_nutrition WHERE feed_model_id = ? LIMIT 1`
      ).bind(modelId).first<{ id: string }>();

      if (existing) {
        const sets: string[] = ['updated_at = ?'];
        const vals: (string | number | null)[] = [now()];
        const fields: Array<[string, unknown]> = [
          ['calories_per_100g', body.calories_per_100g], ['protein_pct', body.protein_pct],
          ['fat_pct', body.fat_pct], ['fiber_pct', body.fiber_pct],
          ['moisture_pct', body.moisture_pct], ['ash_pct', body.ash_pct],
          ['calcium_pct', body.calcium_pct], ['phosphorus_pct', body.phosphorus_pct],
          ['omega3_pct', body.omega3_pct], ['omega6_pct', body.omega6_pct],
          ['carbohydrate_pct', body.carbohydrate_pct], ['serving_size_g', body.serving_size_g],
          ['ingredients_text', body.ingredients_text], ['notes', body.notes],
        ];
        for (const [col, val] of fields) {
          if (val !== undefined) { sets.push(`${col} = ?`); vals.push(val as string | number | null ?? null); }
        }
        sets.push('status = ?'); vals.push('active');
        vals.push(existing.id);
        await env.DB.prepare(`UPDATE feed_nutrition SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        const updated = await env.DB.prepare(`SELECT * FROM feed_nutrition WHERE id = ?`).bind(existing.id).first();
        return ok(updated);
      } else {
        const id = newId();
        await env.DB.prepare(
          `INSERT INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
        ).bind(
          id, modelId,
          body.calories_per_100g ?? null, body.protein_pct ?? null, body.fat_pct ?? null,
          body.fiber_pct ?? null, body.moisture_pct ?? null, body.ash_pct ?? null,
          body.calcium_pct ?? null, body.phosphorus_pct ?? null, body.omega3_pct ?? null,
          body.omega6_pct ?? null, body.carbohydrate_pct ?? null, body.serving_size_g ?? null,
          body.ingredients_text ?? null, body.notes ?? null,
          now(), now(),
        ).run();
        const inserted = await env.DB.prepare(`SELECT * FROM feed_nutrition WHERE id = ?`).bind(id).first();
        return created(inserted);
      }
    }
  }

  return err('Not Found', 404, 'not_found');
}
