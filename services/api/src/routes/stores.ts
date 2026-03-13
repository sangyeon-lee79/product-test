// S9: Store + Service + Discount Management API
// Public: /api/v1/stores, /api/v1/stores/:id, /api/v1/stores/:id/services
// Provider: /api/v1/stores/my, POST/PUT/DELETE stores, services, discounts
// Guardian: /api/v1/stores/:id/bookings
// Admin: /api/v1/admin/stores

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import { resolveLang } from '../helpers/sqlHelpers';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyStoreOwner(env: Env, storeId: string, userId: string): Promise<{ id: string } | null> {
  return env.DB.prepare(
    `SELECT id FROM stores WHERE id = ? AND owner_id = ? AND status = 'active'`
  ).bind(storeId, userId).first<{ id: string }>();
}

async function verifyServiceOwner(env: Env, serviceId: string, userId: string): Promise<{ id: string; store_id: string } | null> {
  return env.DB.prepare(
    `SELECT s.id, s.store_id FROM services s
     JOIN stores st ON st.id = s.store_id
     WHERE s.id = ? AND st.owner_id = ? AND st.status = 'active'`
  ).bind(serviceId, userId).first<{ id: string; store_id: string }>();
}

function getTranslated(translations: Record<string, string> | null, lang: string): string {
  if (!translations) return '';
  return translations[lang] || translations['ko'] || translations['en'] || '';
}

// ─── Store CRUD ───────────────────────────────────────────────────────────────

async function listStores(env: Env, url: URL): Promise<Response> {
  const lang = resolveLang(url);
  const q = url.searchParams.get('q')?.trim() || '';
  const countryId = url.searchParams.get('country_id') || '';
  const industryId = url.searchParams.get('industry_id') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const status = url.searchParams.get('status') || 'active';

  let where = `s.status = ?`;
  const binds: unknown[] = [status];

  if (q) {
    where += ` AND (s.name ILIKE ? OR s.address ILIKE ?)`;
    binds.push(`%${q}%`, `%${q}%`);
  }
  if (countryId) {
    where += ` AND s.country_id = ?`;
    binds.push(countryId);
  }
  if (industryId) {
    where += ` AND EXISTS (SELECT 1 FROM store_industries si WHERE si.store_id = s.id AND si.industry_id = ?)`;
    binds.push(industryId);
  }
  const stateCode = url.searchParams.get('address_state_code') || '';
  const cityCode = url.searchParams.get('address_city_code') || '';
  if (stateCode) {
    where += ` AND s.address_state_code = ?`;
    binds.push(stateCode);
  }
  if (cityCode) {
    where += ` AND s.address_city_code = ?`;
    binds.push(cityCode);
  }

  const rows = await env.DB.prepare(
    `SELECT
       s.id, s.owner_id, s.name, s.name_translations, s.description, s.description_translations,
       s.address, s.phone, s.country_id, s.currency_id, s.latitude, s.longitude,
       s.avatar_url, s.status, s.business_type, s.business_subtype,
       s.address_state_code, s.address_city_code, s.address_detail,
       s.created_at, s.updated_at,
       c.name_key AS country_name, cur.code AS currency_code,
       (SELECT COUNT(*) FROM services sv WHERE sv.store_id = s.id AND sv.is_active = true) AS service_count
     FROM stores s
     LEFT JOIN countries c ON c.id = s.country_id
     LEFT JOIN currencies cur ON cur.id = s.currency_id
     WHERE ${where}
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all();

  const total = await env.DB.prepare(
    `SELECT COUNT(*) AS cnt FROM stores s WHERE ${where}`
  ).bind(...binds).first<{ cnt: number }>();

  const items = rows.results.map((r: Record<string, unknown>) => {
    const nameTr = typeof r.name_translations === 'string' ? JSON.parse(r.name_translations as string) : r.name_translations || {};
    const descTr = typeof r.description_translations === 'string' ? JSON.parse(r.description_translations as string) : r.description_translations || {};
    return {
      ...r,
      display_name: getTranslated(nameTr as Record<string, string>, lang) || r.name,
      display_description: getTranslated(descTr as Record<string, string>, lang) || r.description,
    };
  });

  return ok({ items, total: total?.cnt || 0, limit, offset });
}

async function getMyStores(env: Env, me: JwtPayload, url: URL): Promise<Response> {
  const roleErr = requireRole(me, ['provider']);
  if (roleErr) return roleErr;

  const lang = resolveLang(url);
  const rows = await env.DB.prepare(
    `SELECT
       s.id, s.name, s.name_translations, s.description, s.description_translations,
       s.address, s.phone, s.country_id, s.currency_id, s.avatar_url, s.status,
       s.business_type, s.business_subtype,
       s.address_state_code, s.address_city_code, s.address_detail,
       s.created_at, s.updated_at,
       c.name_key AS country_name, cur.code AS currency_code,
       (SELECT COUNT(*) FROM services sv WHERE sv.store_id = s.id AND sv.is_active = true) AS service_count
     FROM stores s
     LEFT JOIN countries c ON c.id = s.country_id
     LEFT JOIN currencies cur ON cur.id = s.currency_id
     WHERE s.owner_id = ?
     ORDER BY s.created_at DESC`
  ).bind(me.sub).all();

  const items = rows.results.map((r: Record<string, unknown>) => {
    const nameTr = typeof r.name_translations === 'string' ? JSON.parse(r.name_translations as string) : r.name_translations || {};
    return {
      ...r,
      display_name: getTranslated(nameTr as Record<string, string>, lang) || r.name,
    };
  });

  return ok({ items });
}

async function getStoreDetail(env: Env, storeId: string, url: URL): Promise<Response> {
  const lang = resolveLang(url);

  const store = await env.DB.prepare(
    `SELECT
       s.*, c.name_key AS country_name, cur.code AS currency_code,
       u.email AS owner_email, COALESCE(uad.nickname, uad.full_name, u.email) AS owner_name
     FROM stores s
     LEFT JOIN countries c ON c.id = s.country_id
     LEFT JOIN currencies cur ON cur.id = s.currency_id
     LEFT JOIN users u ON u.id = s.owner_id
     LEFT JOIN user_account_details uad ON uad.user_id = s.owner_id
     WHERE s.id = ?`
  ).bind(storeId).first<Record<string, unknown>>();

  if (!store) return err('Store not found', 404);

  // Industries
  const industries = await env.DB.prepare(
    `SELECT si.industry_id, mi.code AS industry_key,
       COALESCE(NULLIF(TRIM(tr.${lang}), ''), NULLIF(TRIM(tr.ko), ''), mi.code) AS display_label
     FROM store_industries si
     JOIN master_items mi ON mi.id = si.industry_id
     LEFT JOIN master_categories mc ON mc.id = mi.category_id
     LEFT JOIN i18n_translations tr ON tr.key = 'master.' || mc.code || '.' || mi.code
     WHERE si.store_id = ?`
  ).bind(storeId).all();

  // Services
  const services = await env.DB.prepare(
    `SELECT sv.*, cur.code AS currency_code
     FROM services sv
     LEFT JOIN currencies cur ON cur.id = sv.currency_id
     WHERE sv.store_id = ? AND sv.is_active = true
     ORDER BY sv.sort_order, sv.created_at`
  ).bind(storeId).all();

  const serviceItems = services.results.map((sv: Record<string, unknown>) => {
    const nameTr = typeof sv.name_translations === 'string' ? JSON.parse(sv.name_translations as string) : sv.name_translations || {};
    const descTr = typeof sv.description_translations === 'string' ? JSON.parse(sv.description_translations as string) : sv.description_translations || {};
    return {
      ...sv,
      display_name: getTranslated(nameTr as Record<string, string>, lang) || sv.name,
      display_description: getTranslated(descTr as Record<string, string>, lang) || sv.description,
    };
  });

  const nameTr = typeof store.name_translations === 'string' ? JSON.parse(store.name_translations as string) : store.name_translations || {};
  const descTr = typeof store.description_translations === 'string' ? JSON.parse(store.description_translations as string) : store.description_translations || {};

  return ok({
    ...store,
    display_name: getTranslated(nameTr as Record<string, string>, lang) || store.name,
    display_description: getTranslated(descTr as Record<string, string>, lang) || store.description,
    industries: industries.results,
    services: serviceItems,
  });
}

async function createStore(request: Request, env: Env, me: JwtPayload): Promise<Response> {
  const roleErr = requireRole(me, ['provider', 'admin']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return err('name is required');

  const countryId = typeof body.country_id === 'string' ? body.country_id : null;
  let currencyId = typeof body.currency_id === 'string' ? body.currency_id : null;

  // Auto-resolve currency from country
  if (countryId && !currencyId) {
    const map = await env.DB.prepare(
      `SELECT currency_id FROM country_currency_map WHERE country_id = ? AND is_default = true LIMIT 1`
    ).bind(countryId).first<{ currency_id: string }>();
    if (map) currencyId = map.currency_id;
  }

  const id = newId();
  const timestamp = now();

  await env.DB.prepare(
    `INSERT INTO stores (id, owner_id, name, name_translations, description, description_translations,
       address, phone, country_id, currency_id, latitude, longitude, avatar_url,
       business_type, business_subtype, address_state_code, address_city_code, address_detail,
       status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
  ).bind(
    id,
    me.sub,
    name,
    JSON.stringify(body.name_translations || {}),
    typeof body.description === 'string' ? body.description : null,
    JSON.stringify(body.description_translations || {}),
    typeof body.address === 'string' ? body.address : null,
    typeof body.phone === 'string' ? body.phone : null,
    countryId,
    currencyId,
    typeof body.latitude === 'number' ? body.latitude : null,
    typeof body.longitude === 'number' ? body.longitude : null,
    typeof body.avatar_url === 'string' ? body.avatar_url : null,
    typeof body.business_type === 'string' ? body.business_type : null,
    typeof body.business_subtype === 'string' ? body.business_subtype : null,
    typeof body.address_state_code === 'string' ? body.address_state_code : null,
    typeof body.address_city_code === 'string' ? body.address_city_code : null,
    typeof body.address_detail === 'string' ? body.address_detail : null,
    timestamp,
    timestamp,
  ).run();

  // Sync industries
  if (Array.isArray(body.industry_ids)) {
    for (const industryId of body.industry_ids) {
      if (typeof industryId === 'string' && industryId) {
        await env.DB.prepare(
          `INSERT INTO store_industries (id, store_id, industry_id, created_at)
           VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING`
        ).bind(newId(), id, industryId, timestamp).run();
      }
    }
  }

  return created({ id });
}

async function updateStore(request: Request, env: Env, me: JwtPayload, storeId: string): Promise<Response> {
  const isAdmin = me.role === 'admin';
  if (!isAdmin) {
    const own = await verifyStoreOwner(env, storeId, me.sub);
    if (!own) return err('Forbidden', 403);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const timestamp = now();
  await env.DB.prepare(
    `UPDATE stores SET
       name = COALESCE(?, name),
       name_translations = COALESCE(?, name_translations),
       description = COALESCE(?, description),
       description_translations = COALESCE(?, description_translations),
       address = COALESCE(?, address),
       phone = COALESCE(?, phone),
       country_id = COALESCE(?, country_id),
       currency_id = COALESCE(?, currency_id),
       latitude = COALESCE(?, latitude),
       longitude = COALESCE(?, longitude),
       avatar_url = COALESCE(?, avatar_url),
       business_type = COALESCE(?, business_type),
       business_subtype = COALESCE(?, business_subtype),
       address_state_code = COALESCE(?, address_state_code),
       address_city_code = COALESCE(?, address_city_code),
       address_detail = COALESCE(?, address_detail),
       updated_at = ?
     WHERE id = ?`
  ).bind(
    typeof body.name === 'string' ? body.name.trim() || null : null,
    body.name_translations ? JSON.stringify(body.name_translations) : null,
    typeof body.description === 'string' ? body.description : null,
    body.description_translations ? JSON.stringify(body.description_translations) : null,
    typeof body.address === 'string' ? body.address : null,
    typeof body.phone === 'string' ? body.phone : null,
    typeof body.country_id === 'string' ? body.country_id : null,
    typeof body.currency_id === 'string' ? body.currency_id : null,
    typeof body.latitude === 'number' ? body.latitude : null,
    typeof body.longitude === 'number' ? body.longitude : null,
    typeof body.avatar_url === 'string' ? body.avatar_url : null,
    typeof body.business_type === 'string' ? body.business_type : null,
    typeof body.business_subtype === 'string' ? body.business_subtype : null,
    typeof body.address_state_code === 'string' ? body.address_state_code : null,
    typeof body.address_city_code === 'string' ? body.address_city_code : null,
    typeof body.address_detail === 'string' ? body.address_detail : null,
    timestamp,
    storeId,
  ).run();

  // Sync industries if provided
  if (Array.isArray(body.industry_ids)) {
    await env.DB.prepare(`DELETE FROM store_industries WHERE store_id = ?`).bind(storeId).run();
    for (const industryId of body.industry_ids) {
      if (typeof industryId === 'string' && industryId) {
        await env.DB.prepare(
          `INSERT INTO store_industries (id, store_id, industry_id, created_at)
           VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING`
        ).bind(newId(), storeId, industryId, timestamp).run();
      }
    }
  }

  return ok({ updated: true });
}

async function deleteStore(env: Env, me: JwtPayload, storeId: string): Promise<Response> {
  const isAdmin = me.role === 'admin';
  if (!isAdmin) {
    const own = await verifyStoreOwner(env, storeId, me.sub);
    if (!own) return err('Forbidden', 403);
  }

  await env.DB.prepare(
    `UPDATE stores SET status = 'inactive', updated_at = ? WHERE id = ?`
  ).bind(now(), storeId).run();

  return ok({ deleted: true });
}

// ─── Service CRUD ─────────────────────────────────────────────────────────────

async function listServices(env: Env, storeId: string, url: URL): Promise<Response> {
  const lang = resolveLang(url);

  const rows = await env.DB.prepare(
    `SELECT sv.*, cur.code AS currency_code
     FROM services sv
     LEFT JOIN currencies cur ON cur.id = sv.currency_id
     WHERE sv.store_id = ? AND sv.is_active = true
     ORDER BY sv.sort_order, sv.created_at`
  ).bind(storeId).all();

  const items = rows.results.map((sv: Record<string, unknown>) => {
    const nameTr = typeof sv.name_translations === 'string' ? JSON.parse(sv.name_translations as string) : sv.name_translations || {};
    const descTr = typeof sv.description_translations === 'string' ? JSON.parse(sv.description_translations as string) : sv.description_translations || {};
    return {
      ...sv,
      display_name: getTranslated(nameTr as Record<string, string>, lang) || sv.name,
      display_description: getTranslated(descTr as Record<string, string>, lang) || sv.description,
    };
  });

  return ok({ items });
}

async function createService(request: Request, env: Env, me: JwtPayload, storeId: string): Promise<Response> {
  const isAdmin = me.role === 'admin';
  if (!isAdmin) {
    const own = await verifyStoreOwner(env, storeId, me.sub);
    if (!own) return err('Forbidden', 403);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return err('name is required');

  // Get store's currency as default
  const store = await env.DB.prepare(
    `SELECT currency_id FROM stores WHERE id = ?`
  ).bind(storeId).first<{ currency_id: string }>();
  const currencyId = typeof body.currency_id === 'string' ? body.currency_id : store?.currency_id || null;

  const id = newId();
  const timestamp = now();

  await env.DB.prepare(
    `INSERT INTO services (id, store_id, name, name_translations, description, description_translations,
       price, currency_id, photo_urls, sort_order, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?)`
  ).bind(
    id, storeId, name,
    JSON.stringify(body.name_translations || {}),
    typeof body.description === 'string' ? body.description : null,
    JSON.stringify(body.description_translations || {}),
    typeof body.price === 'number' ? body.price : null,
    currencyId,
    JSON.stringify(Array.isArray(body.photo_urls) ? body.photo_urls : []),
    typeof body.sort_order === 'number' ? body.sort_order : 0,
    timestamp, timestamp,
  ).run();

  return created({ id });
}

async function updateService(request: Request, env: Env, me: JwtPayload, serviceId: string): Promise<Response> {
  const isAdmin = me.role === 'admin';
  if (!isAdmin) {
    const own = await verifyServiceOwner(env, serviceId, me.sub);
    if (!own) return err('Forbidden', 403);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const timestamp = now();
  await env.DB.prepare(
    `UPDATE services SET
       name = COALESCE(?, name),
       name_translations = COALESCE(?, name_translations),
       description = COALESCE(?, description),
       description_translations = COALESCE(?, description_translations),
       price = COALESCE(?, price),
       currency_id = COALESCE(?, currency_id),
       photo_urls = COALESCE(?, photo_urls),
       sort_order = COALESCE(?, sort_order),
       updated_at = ?
     WHERE id = ?`
  ).bind(
    typeof body.name === 'string' ? body.name.trim() || null : null,
    body.name_translations ? JSON.stringify(body.name_translations) : null,
    typeof body.description === 'string' ? body.description : null,
    body.description_translations ? JSON.stringify(body.description_translations) : null,
    typeof body.price === 'number' ? body.price : null,
    typeof body.currency_id === 'string' ? body.currency_id : null,
    Array.isArray(body.photo_urls) ? JSON.stringify(body.photo_urls) : null,
    typeof body.sort_order === 'number' ? body.sort_order : null,
    timestamp,
    serviceId,
  ).run();

  return ok({ updated: true });
}

async function deleteService(env: Env, me: JwtPayload, serviceId: string): Promise<Response> {
  const isAdmin = me.role === 'admin';
  if (!isAdmin) {
    const own = await verifyServiceOwner(env, serviceId, me.sub);
    if (!own) return err('Forbidden', 403);
  }

  await env.DB.prepare(
    `UPDATE services SET is_active = false, updated_at = ? WHERE id = ?`
  ).bind(now(), serviceId).run();

  return ok({ deleted: true });
}

// ─── Discount CRUD ────────────────────────────────────────────────────────────

async function listDiscounts(env: Env, serviceId: string): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT * FROM service_discounts WHERE service_id = ? AND is_active = true ORDER BY start_date`
  ).bind(serviceId).all();

  return ok({ items: rows.results });
}

async function createDiscount(request: Request, env: Env, me: JwtPayload, serviceId: string): Promise<Response> {
  const isAdmin = me.role === 'admin';
  if (!isAdmin) {
    const own = await verifyServiceOwner(env, serviceId, me.sub);
    if (!own) return err('Forbidden', 403);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const rate = typeof body.discount_rate === 'number' ? body.discount_rate : null;
  if (!rate || rate <= 0 || rate > 100) return err('discount_rate must be between 0 and 100');

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO service_discounts (id, service_id, discount_rate, start_date, end_date, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, true, ?)`
  ).bind(
    id, serviceId, rate,
    typeof body.start_date === 'string' ? body.start_date : null,
    typeof body.end_date === 'string' ? body.end_date : null,
    now(),
  ).run();

  return created({ id });
}

async function deleteDiscount(env: Env, me: JwtPayload, discountId: string): Promise<Response> {
  // Verify ownership through service → store chain
  const disc = await env.DB.prepare(
    `SELECT sd.id, s.store_id FROM service_discounts sd
     JOIN services s ON s.id = sd.service_id
     WHERE sd.id = ?`
  ).bind(discountId).first<{ id: string; store_id: string }>();
  if (!disc) return err('Discount not found', 404);

  const isAdmin = me.role === 'admin';
  if (!isAdmin) {
    const own = await verifyStoreOwner(env, disc.store_id, me.sub);
    if (!own) return err('Forbidden', 403);
  }

  await env.DB.prepare(
    `UPDATE service_discounts SET is_active = false WHERE id = ?`
  ).bind(discountId).run();

  return ok({ deleted: true });
}

// ─── Store Booking (moved from providers.ts) ──────────────────────────────────

async function createStoreBooking(request: Request, env: Env, me: JwtPayload, storeId: string): Promise<Response> {
  const roleErr = requireRole(me, ['guardian']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  // Resolve store owner as supplier
  const store = await env.DB.prepare(
    `SELECT owner_id FROM stores WHERE id = ? AND status = 'active'`
  ).bind(storeId).first<{ owner_id: string }>();
  if (!store) return err('Store not found', 404);

  const id = newId();
  const timestamp = now();

  await env.DB.prepare(
    `INSERT INTO bookings (
       id, guardian_id, supplier_id, pet_id, service_id, business_category_id,
       status, requested_date, requested_time, notes, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, 'created', ?, ?, ?, ?, ?)`
  ).bind(
    id,
    me.sub,
    store.owner_id,
    typeof body.pet_id === 'string' ? body.pet_id : null,
    typeof body.service_id === 'string' ? body.service_id : null,
    typeof body.business_category_id === 'string' ? body.business_category_id : null,
    typeof body.requested_date === 'string' ? body.requested_date : null,
    typeof body.requested_time === 'string' ? body.requested_time : null,
    typeof body.notes === 'string' ? body.notes : null,
    timestamp,
    timestamp,
  ).run();

  return created({ id, store_id: storeId, supplier_id: store.owner_id });
}

// ─── Admin: List All Stores ───────────────────────────────────────────────────

async function adminListStores(env: Env, url: URL): Promise<Response> {
  const lang = resolveLang(url);
  const q = url.searchParams.get('q')?.trim() || '';
  const status = url.searchParams.get('status') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let where = '1=1';
  const binds: unknown[] = [];

  if (status) {
    where += ` AND s.status = ?`;
    binds.push(status);
  }
  if (q) {
    where += ` AND (s.name ILIKE ? OR s.address ILIKE ? OR u.email ILIKE ?)`;
    binds.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const rows = await env.DB.prepare(
    `SELECT
       s.id, s.owner_id, s.name, s.name_translations, s.description, s.description_translations,
       s.address, s.phone, s.country_id, s.currency_id, s.latitude, s.longitude,
       s.avatar_url, s.status, s.business_type, s.business_subtype,
       s.address_state_code, s.address_city_code, s.address_detail,
       s.created_at, s.updated_at,
       u.email AS owner_email, COALESCE(uad.nickname, uad.full_name, u.email) AS owner_name,
       c.name_key AS country_name, cur.code AS currency_code,
       (SELECT COUNT(*) FROM services sv WHERE sv.store_id = s.id) AS service_count
     FROM stores s
     LEFT JOIN users u ON u.id = s.owner_id
     LEFT JOIN user_account_details uad ON uad.user_id = s.owner_id
     LEFT JOIN countries c ON c.id = s.country_id
     LEFT JOIN currencies cur ON cur.id = s.currency_id
     WHERE ${where}
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all();

  const total = await env.DB.prepare(
    `SELECT COUNT(*) AS cnt FROM stores s LEFT JOIN users u ON u.id = s.owner_id WHERE ${where}`
  ).bind(...binds).first<{ cnt: number }>();

  const items = rows.results.map((r: Record<string, unknown>) => {
    const nameTr = typeof r.name_translations === 'string' ? JSON.parse(r.name_translations as string) : r.name_translations || {};
    return {
      ...r,
      display_name: getTranslated(nameTr as Record<string, string>, lang) || r.name,
    };
  });

  return ok({ items, total: total?.cnt || 0, limit, offset });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function handleStores(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;

  // ─── Admin endpoints ────────────────────────────────────────────────────────
  if (path.startsWith('/api/v1/admin/stores')) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const me = auth as JwtPayload;
    const roleErr = requireRole(me, ['admin']);
    if (roleErr) return roleErr;

    // GET /api/v1/admin/stores/stats
    if (path === '/api/v1/admin/stores/stats' && method === 'GET') {
      const row = await env.DB.prepare(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'active') AS active,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_30d
         FROM stores`
      ).first<{ total: number; active: number; new_30d: number }>();
      return ok(row || { total: 0, active: 0, new_30d: 0 });
    }

    // GET /api/v1/admin/stores
    if (path === '/api/v1/admin/stores' && method === 'GET') {
      return adminListStores(env, url);
    }

    // GET /api/v1/admin/stores/:id
    const adminDetailMatch = path.match(/^\/api\/v1\/admin\/stores\/([^/]+)$/);
    if (adminDetailMatch && method === 'GET') {
      return getStoreDetail(env, adminDetailMatch[1], url);
    }

    // PUT /api/v1/admin/stores/:id
    if (adminDetailMatch && method === 'PUT') {
      return updateStore(request, env, me, adminDetailMatch[1]);
    }

    // DELETE /api/v1/admin/stores/:id
    if (adminDetailMatch && method === 'DELETE') {
      return deleteStore(env, me, adminDetailMatch[1]);
    }

    return err('Not Found', 404);
  }

  // ─── Public: GET /api/v1/stores ─────────────────────────────────────────────
  if (path === '/api/v1/stores' && method === 'GET') {
    return listStores(env, url);
  }

  // ─── Auth required from here ────────────────────────────────────────────────

  // GET /api/v1/stores/my (provider only — before :id match)
  if (path === '/api/v1/stores/my' && method === 'GET') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    return getMyStores(env, auth as JwtPayload, url);
  }

  // POST /api/v1/stores (provider)
  if (path === '/api/v1/stores' && method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    return createStore(request, env, auth as JwtPayload);
  }

  // ─── /api/v1/stores/:id ─────────────────────────────────────────────────────
  const storeIdMatch = path.match(/^\/api\/v1\/stores\/([^/]+)$/);
  if (storeIdMatch) {
    const storeId = storeIdMatch[1];
    if (method === 'GET') return getStoreDetail(env, storeId, url);
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    if (method === 'PUT') return updateStore(request, env, auth as JwtPayload, storeId);
    if (method === 'DELETE') return deleteStore(env, auth as JwtPayload, storeId);
    return err('Method not allowed', 405);
  }

  // ─── /api/v1/stores/:id/services ────────────────────────────────────────────
  const storeServicesMatch = path.match(/^\/api\/v1\/stores\/([^/]+)\/services$/);
  if (storeServicesMatch) {
    const storeId = storeServicesMatch[1];
    if (method === 'GET') return listServices(env, storeId, url);
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    if (method === 'POST') return createService(request, env, auth as JwtPayload, storeId);
    return err('Method not allowed', 405);
  }

  // ─── /api/v1/stores/:id/bookings ────────────────────────────────────────────
  const storeBookingMatch = path.match(/^\/api\/v1\/stores\/([^/]+)\/bookings$/);
  if (storeBookingMatch && method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    return createStoreBooking(request, env, auth as JwtPayload, storeBookingMatch[1]);
  }

  // ─── /api/v1/services/:id ──────────────────────────────────────────────────
  const serviceIdMatch = path.match(/^\/api\/v1\/services\/([^/]+)$/);
  if (serviceIdMatch) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const me = auth as JwtPayload;
    if (method === 'PUT') return updateService(request, env, me, serviceIdMatch[1]);
    if (method === 'DELETE') return deleteService(env, me, serviceIdMatch[1]);
    return err('Method not allowed', 405);
  }

  // ─── /api/v1/services/:id/discounts ─────────────────────────────────────────
  const discountsMatch = path.match(/^\/api\/v1\/services\/([^/]+)\/discounts$/);
  if (discountsMatch) {
    if (method === 'GET') return listDiscounts(env, discountsMatch[1]);
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    if (method === 'POST') return createDiscount(request, env, auth as JwtPayload, discountsMatch[1]);
    return err('Method not allowed', 405);
  }

  // ─── /api/v1/services/discounts/:id ─────────────────────────────────────────
  const discountDeleteMatch = path.match(/^\/api\/v1\/services\/discounts\/([^/]+)$/);
  if (discountDeleteMatch && method === 'DELETE') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    return deleteDiscount(env, auth as JwtPayload, discountDeleteMatch[1]);
  }

  // ─── /api/v1/stores/:id/settings (PATCH) ────────────────────────────────────
  const settingsMatch = path.match(/^\/api\/v1\/stores\/([^/]+)\/settings$/);
  if (settingsMatch && method === 'PATCH') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    return updateStoreSettings(request, env, auth as JwtPayload, settingsMatch[1]);
  }

  // ─── /api/v1/stores/:id/reviews (GET, public) ─────────────────────────────
  const reviewsMatch = path.match(/^\/api\/v1\/stores\/([^/]+)\/reviews$/);
  if (reviewsMatch && method === 'GET') {
    return listStoreReviews(env, reviewsMatch[1], url);
  }

  return err('Not Found', 404);
}

/* ─── Store settings (overtime + review visibility) ─── */
async function updateStoreSettings(request: Request, env: Env, me: JwtPayload, storeId: string): Promise<Response> {
  const store = await verifyStoreOwner(env, storeId, me.sub);
  if (!store) return err('store not found or not owner', 404);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const sets: string[] = [];
  const binds: unknown[] = [];

  if ('allow_overtime' in body || 'allowOvertime' in body) {
    sets.push('allow_overtime = ?');
    binds.push(!!(body.allow_overtime ?? body.allowOvertime));
  }
  if ('overtime_fee_type' in body || 'overtimeFeeType' in body) {
    const feeType = String(body.overtime_fee_type ?? body.overtimeFeeType ?? 'free');
    if (!['free', 'fixed', 'per_30min'].includes(feeType)) return err('overtime_fee_type must be free|fixed|per_30min');
    sets.push('overtime_fee_type = ?');
    binds.push(feeType);
  }
  if ('overtime_fee_amount' in body || 'overtimeFeeAmount' in body) {
    sets.push('overtime_fee_amount = ?');
    binds.push(Number(body.overtime_fee_amount ?? body.overtimeFeeAmount ?? 0));
  }
  if ('review_public' in body || 'reviewPublic' in body) {
    sets.push('review_public = ?');
    binds.push(!!(body.review_public ?? body.reviewPublic));
  }
  if ('operating_hours' in body || 'operatingHours' in body) {
    sets.push('operating_hours = ?::jsonb');
    binds.push(JSON.stringify(body.operating_hours ?? body.operatingHours ?? {}));
  }

  if (sets.length === 0) return err('no settings to update');

  sets.push('updated_at = ?');
  binds.push(now());
  binds.push(storeId);

  await env.DB.prepare(
    `UPDATE stores SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...binds).run();

  return ok({ id: storeId, updated: true });
}

/* ─── Store public reviews ─── */
async function listStoreReviews(env: Env, storeId: string, url: URL): Promise<Response> {
  // Check if store has review_public enabled
  const store = await env.DB.prepare(
    'SELECT id, review_public FROM stores WHERE id = ?'
  ).bind(storeId).first<Record<string, unknown>>();
  if (!store) return err('store not found', 404);
  if (!store.review_public) return ok({ reviews: [], avg_rating: 0, total: 0, review_public: false });

  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const rows = await env.DB.prepare(
    `SELECT ar.id, ar.appointment_id, ar.author_type, ar.rating, ar.content, ar.created_at,
      COALESCE(up.display_name, u.email) AS author_name,
      p.name AS pet_name, p.avatar_url AS pet_avatar
    FROM appointment_reviews ar
    LEFT JOIN users u ON u.id = ar.author_user_id
    LEFT JOIN user_profiles up ON up.user_id = ar.author_user_id
    LEFT JOIN pets p ON p.id = ar.pet_id
    WHERE ar.store_id = ? AND ar.author_type = 'guardian' AND ar.is_visible = true
    ORDER BY ar.created_at DESC
    LIMIT ? OFFSET ?`
  ).bind(storeId, limit, offset).all();

  const stats = await env.DB.prepare(
    `SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS avg_rating
     FROM appointment_reviews
     WHERE store_id = ? AND author_type = 'guardian' AND is_visible = true`
  ).bind(storeId).first<{ total: number; avg_rating: number }>();

  return ok({
    reviews: rows.results,
    avg_rating: Number(Number(stats?.avg_rating || 0).toFixed(1)),
    total: stats?.total || 0,
    review_public: true,
  });
}
