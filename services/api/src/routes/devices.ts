// Device Management API
// Admin: /api/v1/admin/devices/types|manufacturers|brands|models|units
// Public: /api/v1/devices/types|manufacturers|brands|models|units
// Guardian: /api/v1/pets/:petId/guardian-devices

import type { Env } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';

// ─── Helpers ───────────────────────────────────────────────────────────────

const LANGS = ['ko', 'en', 'ja', 'zh_cn', 'zh_tw', 'es', 'fr', 'de', 'pt', 'vi', 'th', 'id_lang', 'ar'] as const;
const LANG_COLS: Record<typeof LANGS[number], string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  zh_cn: 'zh_cn',
  zh_tw: 'zh_tw',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  vi: 'vi',
  th: 'th',
  id_lang: 'id_lang',
  ar: 'ar',
};

function randomToken(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i += 1) out += chars[bytes[i] % chars.length];
  return out;
}

function resolveLang(url: URL): typeof LANGS[number] {
  const raw = (url.searchParams.get('lang') || 'ko').toLowerCase() as typeof LANGS[number];
  return LANGS.includes(raw) ? raw : 'ko';
}

async function hasColumn(env: Env, table: string, column: string): Promise<boolean> {
  const rows = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  return rows.results.some((r) => r.name === column);
}

async function upsertI18n(env: Env, i18nKey: string, translations: Record<string, string>) {
  const existing = await env.DB.prepare('SELECT id FROM i18n_translations WHERE key = ?').bind(i18nKey).first<{ id: string }>();
  const values = LANGS.map((lang) => (translations[lang] || '').trim() || null);
  if (existing) {
    await env.DB.prepare(
      `UPDATE i18n_translations
       SET ko = COALESCE(?, ko),
           en = COALESCE(?, en),
           ja = COALESCE(?, ja),
           zh_cn = COALESCE(?, zh_cn),
           zh_tw = COALESCE(?, zh_tw),
           es = COALESCE(?, es),
           fr = COALESCE(?, fr),
           de = COALESCE(?, de),
           pt = COALESCE(?, pt),
           vi = COALESCE(?, vi),
           th = COALESCE(?, th),
           id_lang = COALESCE(?, id_lang),
           ar = COALESCE(?, ar),
           updated_at = ?
       WHERE id = ?`
    ).bind(...values, now(), existing.id).run();
    return;
  }
  await env.DB.prepare(
    `INSERT INTO i18n_translations
      (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
     VALUES (?, ?, 'device', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(newId(), i18nKey, ...values, now(), now()).run();
}

function normalizedTranslations(input: Record<string, string> | undefined, ko: string, en: string): Record<string, string> {
  const fallback = en || ko;
  const out: Record<string, string> = {};
  for (const lang of LANGS) {
    const v = (input?.[lang] || '').trim();
    if (v) out[lang] = v;
    else if (lang === 'ko') out[lang] = ko;
    else if (lang === 'en') out[lang] = en;
    else out[lang] = fallback;
  }
  return out;
}

async function resolveLegacyDeviceTypeId(env: Env, masterItemId: string): Promise<string | null> {
  const normalized = await hasColumn(env, 'master_items', 'code');
  const row = normalized
    ? await env.DB.prepare(
      `SELECT device_type_id
       FROM master_items
       WHERE id = ? AND status = 'active'
       LIMIT 1`
    ).bind(masterItemId).first<{ device_type_id: string | null }>()
    : await env.DB.prepare(
      `SELECT device_type_id
       FROM master_items
       WHERE id = ? AND is_active = 1
       LIMIT 1`
    ).bind(masterItemId).first<{ device_type_id: string | null }>();
  return row?.device_type_id ?? null;
}

// ─── Main Handler ───────────────────────────────────────────────────────────

export async function handleDevices(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;
  const isAdmin = path.startsWith('/api/v1/admin/');

  // ─── Public endpoints ────────────────────────────────────────────────────

  if (!isAdmin && !path.startsWith('/api/v1/pets/')) {
    const lang = resolveLang(url);
    const langCol = LANG_COLS[lang];
    const normalized = await hasColumn(env, 'master_categories', 'code');

    // GET /api/v1/devices/types
    if (path === '/api/v1/devices/types' && method === 'GET') {
      const rows = normalized
        ? await env.DB.prepare(
          `SELECT
             mi.id,
             mi.code AS key,
             mi.sort_order,
             'active' AS status,
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
           WHERE mc.code = 'disease_device_type'
             AND mi.status = 'active'
           ORDER BY mi.sort_order, mi.code`
        ).all()
        : await env.DB.prepare(
          `SELECT
             mi.id,
             mi.key AS key,
             mi.sort_order,
             'active' AS status,
             COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mi.key) AS display_label,
             tr.ko AS ko_name,
             tr.en AS name_en
           FROM master_items mi
           JOIN master_categories mc ON mc.id = mi.category_id
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key)
               ELSE ('master.' || mc.key || '.' || mi.key)
             END
           WHERE mc.key IN ('disease_device_type', 'master.disease_device_type')
             AND mi.is_active = 1
           ORDER BY mi.sort_order, mi.key`
        ).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/manufacturers?device_type_id=
    if (path === '/api/v1/devices/manufacturers' && method === 'GET') {
      const typeItemId = (url.searchParams.get('device_type_id') || '').trim();
      const binds: string[] = [];
      let where = `WHERE mfr.status = 'active'`;
      if (typeItemId) {
        where += ` AND EXISTS (
          SELECT 1
          FROM device_models dm
          WHERE dm.manufacturer_id = mfr.id
            AND dm.status = 'active'
            AND (
              dm.device_type_item_id = ?
              OR (dm.device_type_item_id IS NULL AND dm.device_type_id = ?)
            )
        )`;
        binds.push(typeItemId, typeItemId);
      }
      const rows = await env.DB.prepare(
        `SELECT
           mfr.*,
           COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS display_label
         FROM device_manufacturers mfr
         LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
         ${where}
         ORDER BY mfr.sort_order, COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key)`
      ).bind(...binds).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/brands?manufacturer_id=
    if (path === '/api/v1/devices/brands' && method === 'GET') {
      const manufacturerId = url.searchParams.get('manufacturer_id');
      let q = `SELECT
                 b.*,
                 COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), b.name_en, b.name_ko) AS display_label
               FROM device_brands b
               LEFT JOIN i18n_translations tr ON tr.key = b.name_key
               WHERE b.status = 'active'`;
      const binds: string[] = [];
      if (manufacturerId) { q += ' AND b.manufacturer_id = ?'; binds.push(manufacturerId); }
      q += ` ORDER BY COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), b.name_en, b.name_ko)`;
      const rows = await env.DB.prepare(q).bind(...binds).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/models?device_type_id=&manufacturer_id=&brand_id=
    if (path === '/api/v1/devices/models' && method === 'GET') {
      const typeId = url.searchParams.get('device_type_id');
      const mfrId = url.searchParams.get('manufacturer_id');
      const brandId = url.searchParams.get('brand_id');
      const binds: string[] = [];
      let where = `WHERE m.status = 'active'`;
      if (typeId) { where += ' AND (m.device_type_item_id = ? OR (m.device_type_item_id IS NULL AND m.device_type_id = ?))'; binds.push(typeId, typeId); }
      if (mfrId) { where += ' AND m.manufacturer_id = ?'; binds.push(mfrId); }
      if (brandId) { where += ' AND m.brand_id = ?'; binds.push(brandId); }
      const rows = normalized
        ? await env.DB.prepare(
          `SELECT m.*,
                  mi.code AS type_key,
                  tr_type.ko AS type_name_ko,
                  tr_type.en AS type_name_en,
                  COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.code) AS type_display_label,
                  mfr.name_ko as mfr_name_ko,
                  mfr.name_en as mfr_name_en,
                  COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS mfr_display_label,
                  b.name_ko as brand_name_ko, b.name_en as brand_name_en,
                  COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
                  COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), m.model_name) AS model_display_label
           FROM device_models m
           LEFT JOIN master_items mi ON mi.id = m.device_type_item_id
           LEFT JOIN master_categories mc ON mc.id = mi.category_id
           LEFT JOIN i18n_translations tr_type
             ON tr_type.key = CASE
               WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
               ELSE ('master.' || mc.code || '.' || mi.code)
             END
           LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
           LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
           LEFT JOIN device_brands b ON b.id = m.brand_id
           LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
           LEFT JOIN i18n_translations tr_model ON tr_model.key = m.name_key
           ${where}
           ORDER BY m.model_name`
        ).bind(...binds).all()
        : await env.DB.prepare(
          `SELECT m.*,
                  mi.key AS type_key,
                  tr_type.ko AS type_name_ko,
                  tr_type.en AS type_name_en,
                  COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.key) AS type_display_label,
                  mfr.name_ko as mfr_name_ko,
                  mfr.name_en as mfr_name_en,
                  COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS mfr_display_label,
                  b.name_ko as brand_name_ko, b.name_en as brand_name_en,
                  COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
                  COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), m.model_name) AS model_display_label
           FROM device_models m
           LEFT JOIN master_items mi ON mi.id = m.device_type_item_id
           LEFT JOIN master_categories mc ON mc.id = mi.category_id
           LEFT JOIN i18n_translations tr_type
             ON tr_type.key = CASE
               WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key)
               ELSE ('master.' || mc.key || '.' || mi.key)
             END
           LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
           LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
           LEFT JOIN device_brands b ON b.id = m.brand_id
           LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
           LEFT JOIN i18n_translations tr_model ON tr_model.key = m.name_key
           ${where}
           ORDER BY m.model_name`
        ).bind(...binds).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/units
    if (path === '/api/v1/devices/units' && method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT * FROM measurement_units WHERE status = 'active' ORDER BY sort_order, name`
      ).all();
      return ok(rows.results);
    }

    return err('Not Found', 404, 'not_found');
  }

  // ─── Guardian: /api/v1/pets/:petId/guardian-devices ──────────────────────

  if (path.startsWith('/api/v1/pets/')) {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult as JwtPayload;

    const petMatch = path.match(/^\/api\/v1\/pets\/([^/]+)\/guardian-devices(?:\/([^/]+))?$/);
    if (!petMatch) return err('Not Found', 404, 'not_found');
    const petId = petMatch[1];
    const deviceId = petMatch[2];

    // Verify pet belongs to guardian
    const pet = await env.DB.prepare(
      `SELECT id FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'`
    ).bind(petId, user.sub).first<{ id: string }>();
    if (!pet) return err('Pet not found', 404, 'not_found');

    // GET list
    if (!deviceId && method === 'GET') {
      const lang = resolveLang(url);
      const langCol = LANG_COLS[lang];
      const normalized = await hasColumn(env, 'master_items', 'code');
      const rows = normalized
        ? await env.DB.prepare(
          `SELECT gd.*, dm.model_name, dm.model_code,
                  mi.code as type_key,
                  tr_type.ko as type_name_ko, tr_type.en as type_name_en,
                  COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.code) AS type_display_label,
                  mfr.name_ko as mfr_name_ko, mfr.name_en as mfr_name_en,
                  COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS mfr_display_label,
                  b.name_ko as brand_name_ko, b.name_en as brand_name_en,
                  COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
                  COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), dm.model_name) AS model_display_label
           FROM guardian_devices gd
           JOIN device_models dm ON dm.id = gd.device_model_id
           LEFT JOIN master_items mi ON mi.id = dm.device_type_item_id
           LEFT JOIN master_categories mc ON mc.id = mi.category_id
           LEFT JOIN i18n_translations tr_type
             ON tr_type.key = CASE
               WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
               ELSE ('master.' || mc.code || '.' || mi.code)
             END
           LEFT JOIN device_manufacturers mfr ON mfr.id = dm.manufacturer_id
           LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
           LEFT JOIN device_brands b ON b.id = dm.brand_id
           LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
           LEFT JOIN i18n_translations tr_model ON tr_model.key = dm.name_key
           WHERE gd.pet_id = ? AND gd.status != 'deleted'
           ORDER BY gd.created_at DESC`
        ).bind(petId).all()
        : await env.DB.prepare(
          `SELECT gd.*, dm.model_name, dm.model_code,
                  mi.key as type_key,
                  tr_type.ko as type_name_ko, tr_type.en as type_name_en,
                  COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.key) AS type_display_label,
                  mfr.name_ko as mfr_name_ko, mfr.name_en as mfr_name_en,
                  COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS mfr_display_label,
                  b.name_ko as brand_name_ko, b.name_en as brand_name_en,
                  COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
                  COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), dm.model_name) AS model_display_label
           FROM guardian_devices gd
           JOIN device_models dm ON dm.id = gd.device_model_id
           LEFT JOIN master_items mi ON mi.id = dm.device_type_item_id
           LEFT JOIN master_categories mc ON mc.id = mi.category_id
           LEFT JOIN i18n_translations tr_type
             ON tr_type.key = CASE
               WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key)
               ELSE ('master.' || mc.key || '.' || mi.key)
             END
           LEFT JOIN device_manufacturers mfr ON mfr.id = dm.manufacturer_id
           LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
           LEFT JOIN device_brands b ON b.id = dm.brand_id
           LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
           LEFT JOIN i18n_translations tr_model ON tr_model.key = dm.name_key
           WHERE gd.pet_id = ? AND gd.status != 'deleted'
           ORDER BY gd.created_at DESC`
        ).bind(petId).all();
      return ok({ devices: rows.results });
    }

    // POST create
    if (!deviceId && method === 'POST') {
      const body = await request.json<{ device_model_id: string; nickname?: string; serial_number?: string; start_date?: string; notes?: string }>();
      if (!body.device_model_id) return err('device_model_id required', 400, 'missing_field');

      const model = await env.DB.prepare(`SELECT id FROM device_models WHERE id = ? AND status = 'active'`).bind(body.device_model_id).first<{ id: string }>();
      if (!model) return err('Device model not found', 404, 'not_found');

      const id = newId();
      await env.DB.prepare(
        `INSERT INTO guardian_devices (id, pet_id, device_model_id, nickname, serial_number, start_date, notes, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
      ).bind(id, petId, body.device_model_id, body.nickname ?? null, body.serial_number ?? null, body.start_date ?? null, body.notes ?? null, now(), now()).run();

      return created({ id });
    }

    // PUT update
    if (deviceId && method === 'PUT') {
      const body = await request.json<{ nickname?: string; serial_number?: string; notes?: string; start_date?: string }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | null)[] = [now()];
      if ('nickname' in body) { sets.push('nickname = ?'); vals.push(body.nickname ?? null); }
      if ('serial_number' in body) { sets.push('serial_number = ?'); vals.push(body.serial_number ?? null); }
      if ('notes' in body) { sets.push('notes = ?'); vals.push(body.notes ?? null); }
      if ('start_date' in body) { sets.push('start_date = ?'); vals.push(body.start_date ?? null); }
      vals.push(deviceId, petId);
      await env.DB.prepare(`UPDATE guardian_devices SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`).bind(...vals).run();
      return ok({ id: deviceId, updated: true });
    }

    // DELETE (soft)
    if (deviceId && method === 'DELETE') {
      await env.DB.prepare(
        `UPDATE guardian_devices SET status = 'deleted', updated_at = ? WHERE id = ? AND pet_id = ?`
      ).bind(now(), deviceId, petId).run();
      return ok({ id: deviceId, deleted: true });
    }

    return err('Method Not Allowed', 405, 'method_not_allowed');
  }

  // ─── Admin endpoints ─────────────────────────────────────────────────────

  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;
  const roleResult = requireRole(authResult as JwtPayload, ['admin']);
  if (roleResult instanceof Response) return roleResult;
  const lang = resolveLang(url);
  const langCol = LANG_COLS[lang];
  const normalizedMaster = await hasColumn(env, 'master_categories', 'code');

  // ── Device Types ──────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/types' && method === 'GET') {
    const rows = normalizedMaster
      ? await env.DB.prepare(
        `SELECT
           mi.id,
           mi.code AS key,
           mi.sort_order,
           'active' AS status,
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
         WHERE mc.code = 'disease_device_type'
           AND mi.status = 'active'
         ORDER BY mi.sort_order, mi.code`
      ).all()
      : await env.DB.prepare(
        `SELECT
           mi.id,
           mi.key AS key,
           mi.sort_order,
           'active' AS status,
           COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mi.key) AS display_label,
           tr.ko AS ko_name,
           tr.en AS name_en
         FROM master_items mi
         JOIN master_categories mc ON mc.id = mi.category_id
         LEFT JOIN i18n_translations tr
           ON tr.key = CASE
             WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key)
             ELSE ('master.' || mc.key || '.' || mi.key)
           END
         WHERE mc.key IN ('disease_device_type', 'master.disease_device_type')
           AND mi.is_active = 1
         ORDER BY mi.sort_order, mi.key`
      ).all();
    return ok(rows.results);
  }

  const typeIdMatch = path.match(/^\/api\/v1\/admin\/devices\/types\/([^/]+)$/);
  if (typeIdMatch) {
    return err('Device type is managed by master category L3 (read-only)', 400, 'read_only');
  }

  // ── Manufacturers ─────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/manufacturers' && method === 'GET') {
    const rows = await env.DB.prepare(
      `SELECT
         mfr.*,
         COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS display_label
       FROM device_manufacturers mfr
       LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
       ORDER BY mfr.sort_order, COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key)`
    ).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/manufacturers' && method === 'POST') {
    const body = await request.json<{ country?: string; sort_order?: number; translations?: Record<string, string>; name_ko?: string; name_en?: string }>();
    const ko = (body.translations?.ko || body.name_ko || '').trim();
    const en = (body.translations?.en || body.name_en || '').trim();
    if (!ko || !en) return err('ko and en translation required', 400, 'missing_field');
    const key = `mfr_${randomToken(8)}`;
    const nameKey = `device.manufacturer.${key}`;
    const translations: Record<string, string> = {
      ko,
      en,
      ja: (body.translations?.ja || '').trim(),
      zh_cn: (body.translations?.zh_cn || '').trim(),
      zh_tw: (body.translations?.zh_tw || '').trim(),
      es: (body.translations?.es || '').trim(),
      fr: (body.translations?.fr || '').trim(),
      de: (body.translations?.de || '').trim(),
      pt: (body.translations?.pt || '').trim(),
      vi: (body.translations?.vi || '').trim(),
      th: (body.translations?.th || '').trim(),
      id_lang: (body.translations?.id_lang || '').trim(),
      ar: (body.translations?.ar || '').trim(),
    };
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO device_manufacturers (id, key, name_key, name_ko, name_en, country, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
    ).bind(id, key, nameKey, ko, en, body.country ?? null, body.sort_order ?? 0, now(), now()).run();
    await upsertI18n(env, nameKey, translations);
    return created(
      await env.DB.prepare(
        `SELECT
           mfr.*,
           COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS display_label
         FROM device_manufacturers mfr
         LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
         WHERE mfr.id = ?`
      ).bind(id).first()
    );
  }

  const mfrIdMatch = path.match(/^\/api\/v1\/admin\/devices\/manufacturers\/([^/]+)$/);
  if (mfrIdMatch) {
    const mfrId = mfrIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ translations?: Record<string, string>; name_ko?: string; name_en?: string; country?: string; sort_order?: number; status?: string }>();
      const existing = await env.DB.prepare('SELECT name_key, name_ko, name_en FROM device_manufacturers WHERE id = ?').bind(mfrId).first<{ name_key?: string | null; name_ko?: string | null; name_en?: string | null }>();
      if (!existing) return err('manufacturer not found', 404, 'not_found');
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | null)[] = [now()];
      const ko = (body.translations?.ko || body.name_ko || existing.name_ko || '').trim();
      const en = (body.translations?.en || body.name_en || existing.name_en || '').trim();
      if (ko) { sets.push('name_ko = ?'); vals.push(ko); }
      if (en) { sets.push('name_en = ?'); vals.push(en); }
      if ('country' in body) { sets.push('country = ?'); vals.push(body.country ?? null); }
      if (body.sort_order != null) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      vals.push(mfrId);
      await env.DB.prepare(`UPDATE device_manufacturers SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      if (existing.name_key) {
        await upsertI18n(env, existing.name_key, {
          ko,
          en,
          ja: (body.translations?.ja || '').trim(),
          zh_cn: (body.translations?.zh_cn || '').trim(),
          zh_tw: (body.translations?.zh_tw || '').trim(),
          es: (body.translations?.es || '').trim(),
          fr: (body.translations?.fr || '').trim(),
          de: (body.translations?.de || '').trim(),
          pt: (body.translations?.pt || '').trim(),
          vi: (body.translations?.vi || '').trim(),
          th: (body.translations?.th || '').trim(),
          id_lang: (body.translations?.id_lang || '').trim(),
          ar: (body.translations?.ar || '').trim(),
        });
      }
      return ok(
        await env.DB.prepare(
          `SELECT
             mfr.*,
             COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.en), ''), NULLIF(TRIM(tr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS display_label
           FROM device_manufacturers mfr
           LEFT JOIN i18n_translations tr ON tr.key = mfr.name_key
           WHERE mfr.id = ?`
        ).bind(mfrId).first()
      );
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE device_manufacturers SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), mfrId).run();
      return ok({ id: mfrId, deleted: true });
    }
  }

  // ── Brands ────────────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/brands' && method === 'GET') {
    const manufacturerId = url.searchParams.get('manufacturer_id');
    let q = `SELECT
               b.*,
               m.name_ko as mfr_name_ko,
               COALESCE(NULLIF(TRIM(trb.${langCol}), ''), NULLIF(TRIM(trb.en), ''), NULLIF(TRIM(trb.ko), ''), b.name_en, b.name_ko) AS display_label,
               COALESCE(NULLIF(TRIM(trm.${langCol}), ''), NULLIF(TRIM(trm.en), ''), NULLIF(TRIM(trm.ko), ''), m.name_en, m.name_ko, m.key) AS mfr_display_label
             FROM device_brands b
             JOIN device_manufacturers m ON m.id = b.manufacturer_id
             LEFT JOIN i18n_translations trb ON trb.key = b.name_key
             LEFT JOIN i18n_translations trm ON trm.key = m.name_key`;
    const binds: string[] = [];
    if (manufacturerId) { q += ' WHERE b.manufacturer_id = ?'; binds.push(manufacturerId); }
    q += ` ORDER BY COALESCE(NULLIF(TRIM(trb.${langCol}), ''), NULLIF(TRIM(trb.en), ''), NULLIF(TRIM(trb.ko), ''), b.name_en, b.name_ko)`;
    const rows = await env.DB.prepare(q).bind(...binds).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/brands' && method === 'POST') {
    const body = await request.json<{ manufacturer_id: string; translations?: Record<string, string>; name_ko?: string; name_en?: string }>();
    const ko = (body.translations?.ko || body.name_ko || '').trim();
    const en = (body.translations?.en || body.name_en || '').trim();
    if (!body.manufacturer_id || !ko || !en) return err('manufacturer_id, ko, en required', 400, 'missing_field');
    const key = `brand_${randomToken(8)}`;
    const nameKey = `device.brand.${key}`;
    const translations = normalizedTranslations(body.translations, ko, en);
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO device_brands (id, manufacturer_id, name_key, name_ko, name_en, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
    ).bind(id, body.manufacturer_id, nameKey, ko, en, now(), now()).run();
    await upsertI18n(env, nameKey, translations);
    return created(await env.DB.prepare(`SELECT * FROM device_brands WHERE id = ?`).bind(id).first());
  }

  const brandIdMatch = path.match(/^\/api\/v1\/admin\/devices\/brands\/([^/]+)$/);
  if (brandIdMatch) {
    const brandId = brandIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ translations?: Record<string, string>; name_ko?: string; name_en?: string; status?: string }>();
      const existing = await env.DB.prepare('SELECT name_key, name_ko, name_en FROM device_brands WHERE id = ?').bind(brandId).first<{ name_key?: string | null; name_ko?: string | null; name_en?: string | null }>();
      if (!existing) return err('brand not found', 404, 'not_found');
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | null)[] = [now()];
      const ko = (body.translations?.ko || body.name_ko || existing.name_ko || '').trim();
      const en = (body.translations?.en || body.name_en || existing.name_en || '').trim();
      if (ko) { sets.push('name_ko = ?'); vals.push(ko); }
      if (en) { sets.push('name_en = ?'); vals.push(en); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      vals.push(brandId);
      await env.DB.prepare(`UPDATE device_brands SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      if (existing.name_key) await upsertI18n(env, existing.name_key, normalizedTranslations(body.translations, ko, en));
      return ok(await env.DB.prepare(`SELECT * FROM device_brands WHERE id = ?`).bind(brandId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE device_brands SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), brandId).run();
      return ok({ id: brandId, deleted: true });
    }
  }

  // ── Models ────────────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/models' && method === 'GET') {
    const typeId = url.searchParams.get('device_type_id');
    const mfrId = url.searchParams.get('manufacturer_id');
    const brandId = url.searchParams.get('brand_id');
    const binds: string[] = [];
    let where = `WHERE 1=1`;
    if (typeId) { where += ' AND (m.device_type_item_id = ? OR (m.device_type_item_id IS NULL AND m.device_type_id = ?))'; binds.push(typeId, typeId); }
    if (mfrId) { where += ' AND m.manufacturer_id = ?'; binds.push(mfrId); }
    if (brandId) { where += ' AND m.brand_id = ?'; binds.push(brandId); }
    const rows = normalizedMaster
      ? await env.DB.prepare(
        `SELECT
           m.*,
           mi.code AS type_key,
           tr_type.ko AS type_name_ko,
           tr_type.en AS type_name_en,
           COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.code) AS type_display_label,
           mfr.name_ko as mfr_name_ko,
           mfr.name_en as mfr_name_en,
           COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS mfr_display_label,
           b.name_ko as brand_name_ko, b.name_en as brand_name_en,
           COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
           COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), m.model_name) AS model_display_label
         FROM device_models m
         LEFT JOIN master_items mi ON mi.id = m.device_type_item_id
         LEFT JOIN master_categories mc ON mc.id = mi.category_id
         LEFT JOIN i18n_translations tr_type
           ON tr_type.key = CASE
             WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
             ELSE ('master.' || mc.code || '.' || mi.code)
           END
         LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
         LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
         LEFT JOIN device_brands b ON b.id = m.brand_id
         LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
         LEFT JOIN i18n_translations tr_model ON tr_model.key = m.name_key
         ${where} ORDER BY m.model_name`
      ).bind(...binds).all()
      : await env.DB.prepare(
        `SELECT
           m.*,
           mi.key AS type_key,
           tr_type.ko AS type_name_ko,
           tr_type.en AS type_name_en,
           COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.key) AS type_display_label,
           mfr.name_ko as mfr_name_ko,
           mfr.name_en as mfr_name_en,
           COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS mfr_display_label,
           b.name_ko as brand_name_ko, b.name_en as brand_name_en,
           COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
           COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), m.model_name) AS model_display_label
         FROM device_models m
         LEFT JOIN master_items mi ON mi.id = m.device_type_item_id
         LEFT JOIN master_categories mc ON mc.id = mi.category_id
         LEFT JOIN i18n_translations tr_type
           ON tr_type.key = CASE
             WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key)
             ELSE ('master.' || mc.key || '.' || mi.key)
           END
         LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
         LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
         LEFT JOIN device_brands b ON b.id = m.brand_id
         LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
         LEFT JOIN i18n_translations tr_model ON tr_model.key = m.name_key
         ${where} ORDER BY m.model_name`
      ).bind(...binds).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/models' && method === 'POST') {
    const body = await request.json<{ device_type_id: string; manufacturer_id: string; brand_id?: string; model_name?: string; model_code?: string; description?: string; translations?: Record<string, string>; name_ko?: string; name_en?: string }>();
    const ko = (body.translations?.ko || body.name_ko || body.model_name || '').trim();
    const en = (body.translations?.en || body.name_en || body.model_name || '').trim();
    if (!body.device_type_id || !body.manufacturer_id || !ko || !en) return err('device_type_id, manufacturer_id, ko, en required', 400, 'missing_field');
    const key = `model_${randomToken(8)}`;
    const nameKey = `device.model.${key}`;
    const translations = normalizedTranslations(body.translations, ko, en);
    const legacyTypeId = await resolveLegacyDeviceTypeId(env, body.device_type_id);
    const id = newId();
    const modelName = en || ko;
    await env.DB.prepare(
      `INSERT INTO device_models (id, device_type_item_id, device_type_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    ).bind(id, body.device_type_id, legacyTypeId, body.manufacturer_id, body.brand_id ?? null, nameKey, modelName, body.model_code ?? null, body.description ?? null, now(), now()).run();
    await upsertI18n(env, nameKey, translations);
    return created(
      await env.DB.prepare(
        `SELECT
           m.*,
           mi.code AS type_key,
           tr_type.ko AS type_name_ko,
           tr_type.en AS type_name_en,
           COALESCE(NULLIF(TRIM(tr_type.${langCol}), ''), NULLIF(TRIM(tr_type.en), ''), NULLIF(TRIM(tr_type.ko), ''), mi.code) AS type_display_label,
           mfr.name_ko as mfr_name_ko,
           mfr.name_en as mfr_name_en,
           COALESCE(NULLIF(TRIM(tr_mfr.${langCol}), ''), NULLIF(TRIM(tr_mfr.en), ''), NULLIF(TRIM(tr_mfr.ko), ''), mfr.name_en, mfr.name_ko, mfr.key) AS mfr_display_label,
           b.name_ko as brand_name_ko, b.name_en as brand_name_en,
           COALESCE(NULLIF(TRIM(tr_brand.${langCol}), ''), NULLIF(TRIM(tr_brand.en), ''), NULLIF(TRIM(tr_brand.ko), ''), b.name_en, b.name_ko) AS brand_display_label,
           COALESCE(NULLIF(TRIM(tr_model.${langCol}), ''), NULLIF(TRIM(tr_model.en), ''), NULLIF(TRIM(tr_model.ko), ''), m.model_name) AS model_display_label
         FROM device_models m
         LEFT JOIN master_items mi ON mi.id = m.device_type_item_id
         LEFT JOIN master_categories mc ON mc.id = mi.category_id
         LEFT JOIN i18n_translations tr_type
           ON tr_type.key = CASE
             WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
             ELSE ('master.' || mc.code || '.' || mi.code)
           END
         LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
         LEFT JOIN i18n_translations tr_mfr ON tr_mfr.key = mfr.name_key
         LEFT JOIN device_brands b ON b.id = m.brand_id
         LEFT JOIN i18n_translations tr_brand ON tr_brand.key = b.name_key
         LEFT JOIN i18n_translations tr_model ON tr_model.key = m.name_key
         WHERE m.id = ?`
      ).bind(id).first()
    );
  }

  const modelIdMatch = path.match(/^\/api\/v1\/admin\/devices\/models\/([^/]+)$/);
  if (modelIdMatch) {
    const modelId = modelIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ model_name?: string; model_code?: string; description?: string; status?: string; device_type_id?: string; manufacturer_id?: string; brand_id?: string | null; translations?: Record<string, string>; name_ko?: string; name_en?: string }>();
      const existing = await env.DB.prepare('SELECT name_key, model_name FROM device_models WHERE id = ?').bind(modelId).first<{ name_key?: string | null; model_name?: string | null }>();
      if (!existing) return err('model not found', 404, 'not_found');
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | null)[] = [now()];
      const ko = (body.translations?.ko || body.name_ko || '').trim();
      const en = (body.translations?.en || body.name_en || body.model_name || '').trim();
      const nextModelName = (en || ko || body.model_name || existing.model_name || '').trim();
      if (nextModelName) { sets.push('model_name = ?'); vals.push(nextModelName); }
      if ('model_code' in body) { sets.push('model_code = ?'); vals.push(body.model_code ?? null); }
      if ('description' in body) { sets.push('description = ?'); vals.push(body.description ?? null); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      if (body.device_type_id) {
        sets.push('device_type_item_id = ?');
        vals.push(body.device_type_id);
        const legacyTypeId = await resolveLegacyDeviceTypeId(env, body.device_type_id);
        sets.push('device_type_id = ?');
        vals.push(legacyTypeId);
      }
      if (body.manufacturer_id) { sets.push('manufacturer_id = ?'); vals.push(body.manufacturer_id); }
      if ('brand_id' in body) { sets.push('brand_id = ?'); vals.push(body.brand_id ?? null); }
      vals.push(modelId);
      await env.DB.prepare(`UPDATE device_models SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      if (existing.name_key) {
        const fallbackKo = ko || existing.model_name || '';
        const fallbackEn = en || existing.model_name || '';
        await upsertI18n(env, existing.name_key, normalizedTranslations(body.translations, fallbackKo, fallbackEn));
      }
      return ok(await env.DB.prepare(`SELECT * FROM device_models WHERE id = ?`).bind(modelId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE device_models SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), modelId).run();
      return ok({ id: modelId, deleted: true });
    }
  }

  // ── Measurement Units ─────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/units' && method === 'GET') {
    const rows = await env.DB.prepare(`SELECT * FROM measurement_units ORDER BY sort_order, name`).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/units' && method === 'POST') {
    const body = await request.json<{ key: string; name: string; symbol?: string; sort_order?: number }>();
    if (!body.key || !body.name) return err('key and name required', 400, 'missing_field');
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO measurement_units (id, key, name, symbol, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`
    ).bind(id, body.key, body.name, body.symbol ?? null, body.sort_order ?? 0, now(), now()).run();
    return created(await env.DB.prepare(`SELECT * FROM measurement_units WHERE id = ?`).bind(id).first());
  }

  const unitIdMatch = path.match(/^\/api\/v1\/admin\/devices\/units\/([^/]+)$/);
  if (unitIdMatch) {
    const unitId = unitIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ name?: string; symbol?: string; sort_order?: number; status?: string }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | null)[] = [now()];
      if (body.name) { sets.push('name = ?'); vals.push(body.name); }
      if ('symbol' in body) { sets.push('symbol = ?'); vals.push(body.symbol ?? null); }
      if (body.sort_order != null) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      vals.push(unitId);
      await env.DB.prepare(`UPDATE measurement_units SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare(`SELECT * FROM measurement_units WHERE id = ?`).bind(unitId).first());
    }
  }

  return err('Not Found', 404, 'not_found');
}
