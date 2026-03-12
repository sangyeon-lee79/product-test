// Guardian-facing dummy store exploration endpoints
// GET /api/v1/dummy-stores          — list with filters
// GET /api/v1/dummy-stores/:id      — single store detail

import type { Env } from '../types';
import { ok, err } from '../types';
import { resolveLang } from '../helpers/sqlHelpers';

// ─── List dummy stores ──────────────────────────────────────────────────────

async function listDummyStores(env: Env, url: URL): Promise<Response> {
  const lang = resolveLang(url);
  const fallback = lang === 'ko' ? 'en' : 'ko';

  const category = url.searchParams.get('category') || '';
  const stateCode = url.searchParams.get('state_code') || '';
  const cityCode = url.searchParams.get('city_code') || '';
  const q = url.searchParams.get('q') || '';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  // Build WHERE conditions
  const conditions: string[] = ['ds.is_active = true'];
  const binds: unknown[] = [];

  if (category) {
    conditions.push(`ds.category = ?`);
    binds.push(category);
  }
  if (stateCode) {
    conditions.push(`ds.address->>'state_code' = ?`);
    binds.push(stateCode);
  }
  if (cityCode) {
    conditions.push(`ds.address->>'city_code' = ?`);
    binds.push(cityCode);
  }
  if (q) {
    conditions.push(`(ds.name->>'${lang}' ILIKE ? OR ds.name->>'ko' ILIKE ? OR ds.name->>'en' ILIKE ?)`);
    const pattern = `%${q}%`;
    binds.push(pattern, pattern, pattern);
  }

  const where = conditions.join(' AND ');

  // Count total
  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM dummy_stores ds WHERE ${where}`
  ).bind(...binds).first<{ total: number }>();
  const total = countRow?.total ?? 0;

  // Fetch stores
  const storeRows = await env.DB.prepare(
    `SELECT
       ds.id,
       ds.category,
       ds.name,
       ds.description,
       ds.address,
       ds.rating,
       ds.review_count,
       COALESCE(ds.name->>'${lang}', ds.name->>'${fallback}', ds.name->>'ko') AS display_name,
       COALESCE(ds.description->>'${lang}', ds.description->>'${fallback}', ds.description->>'ko') AS display_description
     FROM dummy_stores ds
     WHERE ${where}
     ORDER BY ds.rating DESC NULLS LAST, ds.review_count DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all<Record<string, unknown>>();

  // Fetch services for each returned store
  const items = [];

  for (const store of storeRows.results) {
    const svcRows = await env.DB.prepare(
      `SELECT
         id, name, price, duration_min,
         COALESCE(name->>'${lang}', name->>'${fallback}', name->>'ko') AS display_name
       FROM dummy_store_services
       WHERE dummy_store_id = ? AND is_active = true
       ORDER BY price ASC NULLS LAST`
    ).bind(store.id).all<Record<string, unknown>>();

    items.push({
      ...store,
      services: svcRows.results,
    });
  }

  return ok({ items, total });
}

// ─── Get single dummy store ─────────────────────────────────────────────────

async function getDummyStore(env: Env, url: URL, storeId: string): Promise<Response> {
  const lang = resolveLang(url);
  const fallback = lang === 'ko' ? 'en' : 'ko';

  const store = await env.DB.prepare(
    `SELECT
       ds.id,
       ds.category,
       ds.name,
       ds.description,
       ds.address,
       ds.rating,
       ds.review_count,
       COALESCE(ds.name->>'${lang}', ds.name->>'${fallback}', ds.name->>'ko') AS display_name,
       COALESCE(ds.description->>'${lang}', ds.description->>'${fallback}', ds.description->>'ko') AS display_description
     FROM dummy_stores ds
     WHERE ds.id = ? AND ds.is_active = true`
  ).bind(storeId).first<Record<string, unknown>>();

  if (!store) return err('Store not found', 404);

  const svcRows = await env.DB.prepare(
    `SELECT
       id, name, price, duration_min,
       COALESCE(name->>'${lang}', name->>'${fallback}', name->>'ko') AS display_name
     FROM dummy_store_services
     WHERE dummy_store_id = ? AND is_active = true
     ORDER BY price ASC NULLS LAST`
  ).bind(storeId).all<Record<string, unknown>>();

  return ok({
    ...store,
    services: svcRows.results,
  });
}

// ─── Router ─────────────────────────────────────────────────────────────────

export async function handleDummyStores(request: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.replace('/api/v1/dummy-stores', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') {
    return listDummyStores(env, url);
  }

  const match = sub.match(/^\/([^/]+)$/);
  if (match && request.method === 'GET') {
    return getDummyStore(env, url, match[1]);
  }

  return err('Not found', 404);
}
