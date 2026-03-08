// S2: 마스터 데이터 API — LLD §4.2 master_categories, master_items
// GET  /api/v1/master/categories              — 카테고리 목록 (공개)
// GET  /api/v1/master/items?category_key=     — 아이템 목록 (공개)
// CRUD /api/v1/admin/master/categories        — Admin
// CRUD /api/v1/admin/master/items             — Admin

import type { Env } from '../types';
import { ok, created, err, newId, now, randomToken } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';
import { SUPPORTED_LANGS as LANGS, KEY_LITERAL_PATTERN } from '@petfolio/shared';

async function hasColumn(env: Env, table: string, column: string): Promise<boolean> {
  const rows = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  return rows.results.some((r) => r.name === column);
}


function normalizeMasterKey(raw: string): string {
  return raw.trim().replace(/^master\./, '');
}

function isValidMasterKey(raw: string): boolean {
  return /^[a-z0-9_]+$/.test(raw);
}

async function generateItemKey(env: Env, categoryId: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = `master_item.${randomToken(6)}`;
    const exists = await env.DB.prepare(
      'SELECT id FROM master_items WHERE category_id = ? AND code = ?'
    ).bind(categoryId, candidate).first();
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate unique item key');
}

async function generateCategoryKey(env: Env): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = `cat_${randomToken(8)}`;
    const exists = await env.DB.prepare('SELECT id FROM master_categories WHERE code = ?').bind(candidate).first();
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate unique category key');
}

function categoryI18nKey(categoryKey: string): string {
  return categoryKey.startsWith('master.') ? categoryKey : `master.${categoryKey}`;
}

function itemI18nKey(categoryKey: string, itemKey: string): string {
  return categoryKey.startsWith('master.')
    ? `${categoryKey}.${itemKey}`
    : `master.${categoryKey}.${itemKey}`;
}

async function resolveCategoryIdByKey(env: Env, categoryKey: string): Promise<string | null> {
  const row = await env.DB.prepare(
    `SELECT id
     FROM master_categories
     WHERE status = 'active'
       AND (code = ? OR ('master.' || code) = ? OR REPLACE(code, 'master.', '') = ?)
     LIMIT 1`
  ).bind(categoryKey, categoryKey, categoryKey).first<{ id: string }>();
  return row?.id ?? null;
}

async function listPublicItems(env: Env, categoryKey: string, parentId?: string | null): Promise<Response> {
  const categoryId = await resolveCategoryIdByKey(env, categoryKey);
  if (!categoryId) return err('Category not found', 404);
  const rows = await env.DB.prepare(
    `SELECT
       mi.id,
       mi.category_id,
       mi.code AS key,
       mi.parent_item_id AS parent_id,
       mi.sort_order,
       CASE WHEN mi.status = 'active' THEN 1 ELSE 0 END AS is_active,
       mi.metadata,
       mi.created_at,
       mi.updated_at,
       tr.ko AS ko_name,
       tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
     FROM master_items mi
     LEFT JOIN master_categories mc ON mc.id = mi.category_id
     LEFT JOIN i18n_translations tr
       ON tr.key = CASE
         WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
         ELSE ('master.' || mc.code || '.' || mi.code)
       END
     WHERE mi.category_id = ?
       AND mi.status = 'active'
       AND (? IS NULL OR mi.parent_item_id = ?)
     ORDER BY mi.sort_order, mi.code`
  ).bind(categoryId, parentId ?? null, parentId ?? null).all();
  return ok(rows.results);
}

async function upsertI18n(env: Env, i18nKey: string, translations: Record<string, string>) {
  const existing = await env.DB.prepare('SELECT id FROM i18n_translations WHERE key = ?').bind(i18nKey).first<{ id: string }>();
  const lv = LANGS.map(l => translations[l] ?? null);
  if (existing) {
    // 기존 키가 있으면 빈 값만 채움 (덮어쓰지 않음)
    const sets: string[] = ['updated_at = ?'];
    const vals: (string | null)[] = [now()];
    for (const l of LANGS) {
      if (translations[l]) { sets.push(`${l} = COALESCE(${l}, ?)`); vals.push(translations[l]); }
    }
    vals.push(existing.id);
    await env.DB.prepare(`UPDATE i18n_translations SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(newId(), i18nKey, 'master', ...lv, 1, now(), now()).run();
  }
}

async function hasCompleteI18n(env: Env, i18nKey: string): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar
     FROM i18n_translations
     WHERE key = ?
     LIMIT 1`
  ).bind(i18nKey).first<Record<string, string | null>>();
  if (!row) return false;
  return LANGS.every((lang) => Boolean((row[lang] || '').trim()));
}

function normalizeTranslations(input?: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LANGS) out[lang] = (input?.[lang] || '').trim();
  return out;
}

function missingTranslationLangs(translations: Record<string, string>): string[] {
  return LANGS.filter((lang) => !translations[lang]);
}

function hasInvalidTranslationValue(translations: Record<string, string>, i18nKey: string): string | null {
  for (const lang of LANGS) {
    const value = (translations[lang] || '').trim();
    if (!value) continue;
    if (value === i18nKey) return `translation for ${lang} matches key`;
    if (KEY_LITERAL_PATTERN.test(value)) return `translation for ${lang} is key pattern`;
  }
  return null;
}

const REQUIRES_PARENT_CATEGORY_CODES = new Set([
  'disease_type',
  'disease_device_type',
  'disease_measurement_type',
  'disease_measurement_context',
  'diet_subtype',
  'diet_feed_type',
  'allergy_type',
]);

const EXPECTED_PARENT_CATEGORY_BY_CHILD: Record<string, string> = {
  disease_type: 'disease_group',
  disease_device_type: 'disease_type',
  disease_measurement_type: 'disease_device_type',
  disease_measurement_context: 'disease_measurement_type',
  diet_subtype: 'diet_type',
  diet_feed_type: 'diet_subtype',
  allergy_type: 'allergy_group',
};

async function getParentCategoryKeyByItemId(env: Env, itemId: string): Promise<string | null> {
  const row = await env.DB.prepare(
    `SELECT mc.code AS category_key
     FROM master_items mi
     JOIN master_categories mc ON mc.id = mi.category_id
     WHERE mi.id = ?`
  ).bind(itemId).first<{ category_key: string }>();
  return row?.category_key ? normalizeMasterKey(row.category_key) : null;
}

async function validateParentHierarchy(
  env: Env,
  categoryKey: string,
  parentId?: string | null,
): Promise<{ ok: true } | { ok: false; message: string; code: string }> {
  const requiresParent = REQUIRES_PARENT_CATEGORY_CODES.has(categoryKey);
  if (requiresParent && !parentId) {
    return { ok: false, message: 'parent_id required for this category', code: 'parent_required' };
  }
  if (!parentId) return { ok: true };

  const expectedParentCategory = EXPECTED_PARENT_CATEGORY_BY_CHILD[categoryKey];
  if (!expectedParentCategory) return { ok: true };

  const parentCategoryKey = await getParentCategoryKeyByItemId(env, parentId);
  if (!parentCategoryKey) {
    return { ok: false, message: 'parent item not found', code: 'parent_not_found' };
  }
  if (parentCategoryKey !== expectedParentCategory) {
    return {
      ok: false,
      message: `invalid parent category: expected ${expectedParentCategory}, got ${parentCategoryKey}`,
      code: 'parent_category_mismatch',
    };
  }
  return { ok: true };
}

export async function handleMaster(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const isAdmin = path.startsWith('/api/v1/admin/master');

  if (!isAdmin && path === '/api/v1/master/disease-groups' && request.method === 'GET') {
    return listPublicItems(env, 'disease_group');
  }
  if (!isAdmin && path === '/api/v1/master/diseases' && request.method === 'GET') {
    const groupId = (url.searchParams.get('group_id') || '').trim() || null;
    return listPublicItems(env, 'disease_type', groupId);
  }
  if (!isAdmin && path === '/api/v1/master/disease-devices' && request.method === 'GET') {
    const diseaseId = (url.searchParams.get('disease_id') || '').trim() || null;
    return listPublicItems(env, 'disease_device_type', diseaseId);
  }
  if (!isAdmin && path === '/api/v1/master/disease-measurements' && request.method === 'GET') {
    const diseaseId = (url.searchParams.get('disease_id') || '').trim() || null;
    return listPublicItems(env, 'disease_measurement_type', diseaseId);
  }
  if (!isAdmin && path === '/api/v1/master/diet-types' && request.method === 'GET') {
    return listPublicItems(env, 'diet_type');
  }
  if (!isAdmin && path === '/api/v1/master/diet-subtypes' && request.method === 'GET') {
    const parentId = (url.searchParams.get('parent_id') || '').trim() || null;
    return listPublicItems(env, 'diet_subtype', parentId);
  }
  if (!isAdmin && path === '/api/v1/master/diet-feed-types' && request.method === 'GET') {
    const parentId = (url.searchParams.get('parent_id') || '').trim() || null;
    return listPublicItems(env, 'diet_feed_type', parentId);
  }
  if (!isAdmin && path === '/api/v1/master/allergy-groups' && request.method === 'GET') {
    return listPublicItems(env, 'allergy_group');
  }
  if (!isAdmin && path === '/api/v1/master/allergies' && request.method === 'GET') {
    const groupId = (url.searchParams.get('group_id') || '').trim() || null;
    return listPublicItems(env, 'allergy_type', groupId);
  }
  if (!isAdmin && path === '/api/v1/master/disease-judgement-rules' && request.method === 'GET') {
    const diseaseId = (url.searchParams.get('disease_id') || '').trim();
    if (!diseaseId) return err('disease_id required');
    const rows = await env.DB.prepare(
      `SELECT
         r.*,
         m.code AS measurement_code,
         c.code AS context_code,
         u.code AS unit_code
       FROM disease_judgement_rules r
       LEFT JOIN master_items m ON m.id = r.measurement_item_id
       LEFT JOIN master_items c ON c.id = r.context_item_id
       LEFT JOIN master_items u ON u.id = r.unit_item_id
       WHERE r.disease_item_id = ? AND r.status = 'active'
       ORDER BY r.sort_order ASC, r.id ASC`
    ).bind(diseaseId).all();
    return ok(rows.results);
  }

  // ─── 공개: 카테고리 목록 ──────────────────────────────────────────────────
  if (!isAdmin && path === '/api/v1/master/categories' && request.method === 'GET') {
    const rows = await env.DB.prepare(
      `SELECT
         id,
         code AS key,
         sort_order,
         CASE WHEN status = 'active' THEN 1 ELSE 0 END AS is_active,
         created_at,
         updated_at
       FROM master_categories
       WHERE status = 'active'
       ORDER BY sort_order, code`
    ).all();
    return ok(rows.results);
  }

  // ─── 공개: 아이템 목록 ────────────────────────────────────────────────────
  if (!isAdmin && path === '/api/v1/master/items' && request.method === 'GET') {
    const categoryKey = url.searchParams.get('category_key');
    if (!categoryKey) return err('category_key required');
    const parentId = (url.searchParams.get('parent_id') || '').trim() || null;
    const langRaw = (url.searchParams.get('lang') || 'ko') as typeof LANGS[number];
    const lang = LANGS.includes(langRaw) ? langRaw : 'ko';
    const langCol = lang;

    const cat = await env.DB.prepare(
      `SELECT id
       FROM master_categories
       WHERE status = 'active'
         AND (
           code = ?
           OR ('master.' || code) = ?
           OR REPLACE(code, 'master.', '') = ?
         )
       LIMIT 1`
    ).bind(categoryKey, categoryKey, categoryKey).first<{ id: string }>();
    if (!cat) return err('Category not found', 404);

    const rows = await env.DB.prepare(`
      SELECT
        mi.id,
        mi.category_id,
        mi.code AS key,
        mi.parent_item_id AS parent_id,
        mi.sort_order,
        CASE WHEN mi.status = 'active' THEN 1 ELSE 0 END AS is_active,
        mi.metadata,
        mi.created_at,
        mi.updated_at,
        COALESCE(NULLIF(TRIM(tr.${langCol}), ''), NULLIF(TRIM(tr.ko), ''), NULLIF(TRIM(tr.en), ''), '') AS display_label,
        tr.ko as ko_name,
        tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
      FROM master_items mi
      LEFT JOIN master_categories mc ON mc.id = mi.category_id
      LEFT JOIN i18n_translations tr
        ON tr.key = CASE
          WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
          ELSE ('master.' || mc.code || '.' || mi.code)
        END
      WHERE mi.category_id = ? AND mi.status = 'active'
        AND (? IS NULL OR mi.parent_item_id = ?)
      ORDER BY mi.sort_order, mi.code
    `).bind(cat.id, parentId, parentId).all();
    return ok(rows.results);
  }

  // ─── Admin 전용 ───────────────────────────────────────────────────────────
  if (isAdmin) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const roleErr = requireRole(auth as JwtPayload, ['admin']);
    if (roleErr) return roleErr;

    // ─── Admin: 카테고리 CRUD ───────────────────────────────────────────────
    if (path.startsWith('/api/v1/admin/master/categories')) {
      const idMatch = path.match(/\/categories\/([^/]+)$/);
      const id = idMatch?.[1];

      if (request.method === 'GET' && !id) {
        const rows = await env.DB.prepare(
          `SELECT
             mc.id,
             mc.code AS key,
             mc.sort_order,
             CASE WHEN mc.status = 'active' THEN 1 ELSE 0 END AS is_active,
             mc.created_at,
             mc.updated_at,
             tr.ko AS ko_name,
             tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
           FROM master_categories mc
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.code LIKE 'master.%' THEN mc.code
               ELSE ('master.' || mc.code)
             END
           ORDER BY mc.sort_order, mc.code`
        ).all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id) {
        const row = await env.DB.prepare(
          `SELECT
             mc.id,
             mc.code AS key,
             mc.sort_order,
             CASE WHEN mc.status = 'active' THEN 1 ELSE 0 END AS is_active,
             mc.created_at,
             mc.updated_at,
             tr.ko AS ko_name,
             tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
           FROM master_categories mc
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.code LIKE 'master.%' THEN mc.code
               ELSE ('master.' || mc.code)
             END
           WHERE mc.id = ?`
        ).bind(id).first();
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST') {
        let body: { key?: string; sort_order?: number; translations?: Record<string, string> };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const providedKey = normalizeMasterKey(String(body.key || ''));
        const inputKey = providedKey || await generateCategoryKey(env);
        if (!isValidMasterKey(inputKey)) return err('invalid key format');
        const translations = normalizeTranslations(body.translations);
        const koName = translations.ko;
        if (!koName) return err('한국어 표시명을 입력해야 카테고리를 생성할 수 있습니다.');
        const missing = missingTranslationLangs(translations);
        if (missing.length > 0) return err(`번역값 누락: ${missing.join(', ')}`, 400, 'missing_translations');

        const exists = await env.DB.prepare('SELECT id FROM master_categories WHERE code = ? LIMIT 1').bind(inputKey).first<{ id: string }>();
        if (exists) return err('이미 존재하는 key 입니다.', 409, 'duplicate_key');

        const i18nKey = categoryI18nKey(inputKey);
        const invalidReason = hasInvalidTranslationValue(translations, i18nKey);
        if (invalidReason) return err(invalidReason, 400, 'invalid_translation_value');
        await upsertI18n(env, i18nKey, translations);
        const i18nReady = await hasCompleteI18n(env, i18nKey);
        if (!i18nReady) return err('i18n 생성이 완료되지 않아 저장할 수 없습니다.', 400, 'i18n_not_ready');

        const row = { id: newId(), key: inputKey, sort_order: body.sort_order ?? 0, is_active: 1, created_at: now(), updated_at: now() };
        await env.DB.prepare(
          "INSERT INTO master_categories (id,code,sort_order,status,created_at,updated_at) VALUES (?,?,?,'active',?,?)"
        ).bind(row.id, row.key, row.sort_order, row.created_at, row.updated_at).run();
        return created({ ...row, ko_name: koName });
      }
      if (request.method === 'PUT' && id) {
        let body: { sort_order?: number; is_active?: boolean; translations?: Record<string, string> };
        try { body = await request.json() as { sort_order?: number; is_active?: boolean; translations?: Record<string, string> }; } catch { return err('Invalid JSON'); }
        const sets: string[] = ['updated_at = ?'];
        const vals: (string | number)[] = [now()];
        if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
        if (body.is_active !== undefined) {
          sets.push('status = ?');
          vals.push(body.is_active ? 'active' : 'inactive');
        }
        vals.push(id);
        const result = await env.DB.prepare(`UPDATE master_categories SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        if (result.meta.changes === 0) return err('Not found', 404);

        if (body.translations && Object.values(body.translations).some(v => (v || '').trim())) {
          const translations = normalizeTranslations(body.translations);
          const missing = missingTranslationLangs(translations);
          if (missing.length > 0) return err(`번역값 누락: ${missing.join(', ')}`, 400, 'missing_translations');
          const cat = await env.DB.prepare('SELECT code AS key FROM master_categories WHERE id = ?').bind(id).first<{ key: string }>();
          if (cat?.key) {
            const i18nKey = categoryI18nKey(cat.key);
            const invalidReason = hasInvalidTranslationValue(translations, i18nKey);
            if (invalidReason) return err(invalidReason, 400, 'invalid_translation_value');
            await upsertI18n(env, i18nKey, translations);
          }
        }

        return ok(await env.DB.prepare(
          `SELECT
             mc.id,
             mc.code AS key,
             mc.sort_order,
             CASE WHEN mc.status = 'active' THEN 1 ELSE 0 END AS is_active,
             mc.created_at,
             mc.updated_at,
             tr.ko AS ko_name,
             tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
           FROM master_categories mc
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.code LIKE 'master.%' THEN mc.code
               ELSE ('master.' || mc.code)
             END
           WHERE mc.id = ?`
        ).bind(id).first());
      }
      if (request.method === 'DELETE' && id) {
        // 사용중이면 비활성화, 아이템 없으면 실제 삭제
        const itemCount = await env.DB.prepare('SELECT COUNT(*) as c FROM master_items WHERE category_id = ?').bind(id).first<{ c: number }>();
        if ((itemCount?.c ?? 0) > 0) {
          await env.DB.prepare("UPDATE master_categories SET status = 'inactive', updated_at = ? WHERE id = ?").bind(now(), id).run();
          return ok({ id, deleted: false, message: 'Deactivated (items exist)' });
        }
        await env.DB.prepare('DELETE FROM master_categories WHERE id = ?').bind(id).run();
        return ok({ id, deleted: true });
      }
    }

    // ─── Admin: 아이템 CRUD ────────────────────────────────────────────────
    if (path.startsWith('/api/v1/admin/master/items')) {
      const idMatch = path.match(/\/items\/([^/]+)$/);
      const id = idMatch?.[1];

      if (request.method === 'GET' && !id) {
        const categoryKey = url.searchParams.get('category_key');
        let query = `SELECT
             mi.id,
             mi.category_id,
             mi.code AS key,
             mi.parent_item_id AS parent_id,
             mi.sort_order,
             CASE WHEN mi.status = 'active' THEN 1 ELSE 0 END AS is_active,
             mi.metadata,
             mi.created_at,
             mi.updated_at,
             mc.code as category_key,
             tr.ko as ko_name,
             tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
           FROM master_items mi
           JOIN master_categories mc ON mi.category_id = mc.id
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
               ELSE ('master.' || mc.code || '.' || mi.code)
             END
           WHERE 1=1`;
        const params: (string | number)[] = [];
        if (categoryKey) {
          query += " AND (mc.code = ? OR ('master.' || mc.code) = ? OR REPLACE(mc.code, 'master.', '') = ?)";
          params.push(categoryKey, categoryKey, categoryKey);
        }
        query += ' ORDER BY mi.sort_order, mi.code';
        const rows = await env.DB.prepare(query).bind(...params).all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id) {
        const row = await env.DB.prepare(
          `SELECT
             mi.id,
             mi.category_id,
             mi.code AS key,
             mi.parent_item_id AS parent_id,
             mi.sort_order,
             CASE WHEN mi.status = 'active' THEN 1 ELSE 0 END AS is_active,
             mi.metadata,
             mi.created_at,
             mi.updated_at,
             mc.code as category_key,
             tr.ko as ko_name,
             tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
           FROM master_items mi
           JOIN master_categories mc ON mi.category_id = mc.id
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
               ELSE ('master.' || mc.code || '.' || mi.code)
             END
           WHERE mi.id = ?`
        ).bind(id).first();
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST') {
        let body: { category_id: string; parent_id?: string; sort_order?: number; metadata?: Record<string, unknown>; translations?: Record<string, string>; device_type_id?: string | null };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (!body.category_id) return err('category_id required');
        const translations = normalizeTranslations(body.translations);
        if (!translations.ko) return err('ko translation required');
        const missing = missingTranslationLangs(translations);
        if (missing.length > 0) return err(`번역값 누락: ${missing.join(', ')}`, 400, 'missing_translations');

        const category = await env.DB.prepare('SELECT code AS key FROM master_categories WHERE id = ?').bind(body.category_id).first<{ key: string }>();
        if (!category?.key) return err('category not found', 404);
        const categoryKey = normalizeMasterKey(category.key);
        const hierarchyValidation = await validateParentHierarchy(env, categoryKey, body.parent_id ?? null);
        if (!hierarchyValidation.ok) return err(hierarchyValidation.message, 400, hierarchyValidation.code);

        const autoKey = await generateItemKey(env, body.category_id);
        const i18nKey = itemI18nKey(category.key, autoKey);
        const invalidReason = hasInvalidTranslationValue(translations, i18nKey);
        if (invalidReason) return err(invalidReason, 400, 'invalid_translation_value');
        await upsertI18n(env, i18nKey, translations);
        const i18nReady = await hasCompleteI18n(env, i18nKey);
        if (!i18nReady) return err('i18n 생성이 완료되지 않아 저장할 수 없습니다.', 400, 'i18n_not_ready');

        const rowId = newId();
        const hasDeviceTypeCol = await hasColumn(env, 'master_items', 'device_type_id');
        const deviceTypeId = (hasDeviceTypeCol && body.device_type_id) ? body.device_type_id : null;
        if (hasDeviceTypeCol && deviceTypeId) {
          await env.DB.prepare(
            "INSERT INTO master_items (id,category_id,code,parent_item_id,sort_order,status,metadata,device_type_id,created_at,updated_at) VALUES (?,?,?,?,?,'active',?,?,?,?)"
          ).bind(rowId, body.category_id, autoKey, body.parent_id ?? null, body.sort_order ?? 0, JSON.stringify(body.metadata ?? {}), deviceTypeId, now(), now()).run();
        } else {
          await env.DB.prepare(
            "INSERT INTO master_items (id,category_id,code,parent_item_id,sort_order,status,metadata,created_at,updated_at) VALUES (?,?,?,?,?,'active',?,?,?)"
          ).bind(rowId, body.category_id, autoKey, body.parent_id ?? null, body.sort_order ?? 0, JSON.stringify(body.metadata ?? {}), now(), now()).run();
        }
        return created({ id: rowId, category_id: body.category_id, key: autoKey, parent_id: body.parent_id ?? null, sort_order: body.sort_order ?? 0, is_active: 1, metadata: body.metadata ?? {}, device_type_id: deviceTypeId });
      }
      if (request.method === 'PUT' && id) {
        let body: { sort_order?: number; is_active?: boolean; metadata?: Record<string, unknown>; parent_id?: string | null; translations?: Record<string, string> };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (body.parent_id !== undefined) {
          const itemCategory = await env.DB.prepare(
            `SELECT mc.code AS category_key
             FROM master_items mi
             JOIN master_categories mc ON mc.id = mi.category_id
             WHERE mi.id = ?`
          ).bind(id).first<{ category_key: string }>();
          if (!itemCategory?.category_key) return err('Not found', 404);
          const categoryKey = normalizeMasterKey(itemCategory.category_key);
          const hierarchyValidation = await validateParentHierarchy(env, categoryKey, body.parent_id ?? null);
          if (!hierarchyValidation.ok) return err(hierarchyValidation.message, 400, hierarchyValidation.code);
        }
        const sets: string[] = ['updated_at = ?'];
        const vals: (string | number | null)[] = [now()];
        if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
        if (body.is_active !== undefined) {
          sets.push('status = ?');
          vals.push(body.is_active ? 'active' : 'inactive');
        }
        if (body.metadata !== undefined) { sets.push('metadata = ?'); vals.push(JSON.stringify(body.metadata)); }
        if (body.parent_id !== undefined) {
          sets.push('parent_item_id = ?');
          vals.push(body.parent_id);
        }
        // device_type_id (optional, only if column exists)
        if ((body as Record<string, unknown>).device_type_id !== undefined) {
          const hasDevTypeCol = await hasColumn(env, 'master_items', 'device_type_id');
          if (hasDevTypeCol) {
            sets.push('device_type_id = ?');
            vals.push(((body as Record<string, unknown>).device_type_id as string | null) ?? null);
          }
        }
        vals.push(id);
        const result = await env.DB.prepare(`UPDATE master_items SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        if (result.meta.changes === 0) return err('Not found', 404);

        if (body.translations && Object.values(body.translations).some(v => v)) {
          const translations = normalizeTranslations(body.translations);
          const missing = missingTranslationLangs(translations);
          if (missing.length > 0) return err(`번역값 누락: ${missing.join(', ')}`, 400, 'missing_translations');
          const item = await env.DB.prepare(
            `SELECT mi.code as item_key, mc.code as category_key
             FROM master_items mi
             JOIN master_categories mc ON mc.id = mi.category_id
             WHERE mi.id = ?`
          ).bind(id).first<{ item_key: string; category_key: string }>();
          if (item) {
            const i18nKey = itemI18nKey(item.category_key, item.item_key);
            const invalidReason = hasInvalidTranslationValue(translations, i18nKey);
            if (invalidReason) return err(invalidReason, 400, 'invalid_translation_value');
            await upsertI18n(env, i18nKey, translations);
          }
        }

        return ok(await env.DB.prepare(
          `SELECT
             mi.id,
             mi.category_id,
             mi.code AS key,
             mi.parent_item_id AS parent_id,
             mi.sort_order,
             CASE WHEN mi.status = 'active' THEN 1 ELSE 0 END AS is_active,
             mi.metadata,
             mi.created_at,
             mi.updated_at,
             mc.code as category_key,
             tr.ko as ko_name,
             tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar
           FROM master_items mi
           JOIN master_categories mc ON mi.category_id = mc.id
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.code LIKE 'master.%' THEN (mc.code || '.' || mi.code)
               ELSE ('master.' || mc.code || '.' || mi.code)
             END
           WHERE mi.id = ?`
        ).bind(id).first());
      }
      if (request.method === 'DELETE' && id) {
        // 실제 삭제 시도. 외래 키 제약 조건 등으로 실패할 수 있음.
        try {
          const result = await env.DB.prepare('DELETE FROM master_items WHERE id = ?').bind(id).run();
          if (result.meta.changes === 0) return err('Item not found', 404);
          return ok({ id, deleted: true });
        } catch (e: unknown) {
          // 제약 조건 오류 발생 시 비활성화로 대체
          await env.DB.prepare("UPDATE master_items SET status = 'inactive', updated_at = ? WHERE id = ?").bind(now(), id).run();
          return ok({ id, deleted: false, message: 'Deactivated (used in other data)' });
        }
      }
    }
  }

  return err('Not found', 404);
}
