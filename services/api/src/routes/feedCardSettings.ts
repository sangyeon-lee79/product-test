// Feed Card Settings — admin-only CRUD for feed card insertion rules + dummy cards
import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

const BASE = '/api/v1/admin/feed-card-settings';

export async function handleFeedCardSettings(
  request: Request,
  env: Env,
  url: URL,
): Promise<Response> {
  // Auth + admin guard
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;
  const me = authResult as JwtPayload;
  const roleErr = requireRole(me, ['admin']);
  if (roleErr) return roleErr;

  const path = url.pathname;
  const method = request.method;

  // ─── Settings ────────────────────────────────────────────
  // GET /api/v1/admin/feed-card-settings
  if (path === BASE && method === 'GET') {
    return getSettings(env);
  }

  // PUT /api/v1/admin/feed-card-settings  (bulk save)
  if (path === BASE && method === 'PUT') {
    return bulkUpdateSettings(request, env);
  }

  // ─── Preview ─────────────────────────────────────────────
  // GET /api/v1/admin/feed-card-settings/preview
  if (path === `${BASE}/preview` && method === 'GET') {
    return getPreview(env);
  }

  // ─── Dummy Cards ─────────────────────────────────────────
  const dummyBase = `${BASE}/dummy-cards`;

  // GET /api/v1/admin/feed-card-settings/dummy-cards
  if (path === dummyBase && method === 'GET') {
    return listDummyCards(env, url);
  }

  // POST /api/v1/admin/feed-card-settings/dummy-cards
  if (path === dummyBase && method === 'POST') {
    return createDummyCard(request, env);
  }

  // PUT /api/v1/admin/feed-card-settings/dummy-cards/:id
  const putMatch = path.match(new RegExp(`^${dummyBase}/([^/]+)$`));
  if (putMatch && method === 'PUT') {
    return updateDummyCard(request, env, putMatch[1]);
  }

  // DELETE /api/v1/admin/feed-card-settings/dummy-cards/:id
  if (putMatch && method === 'DELETE') {
    return deleteDummyCard(env, putMatch[1]);
  }

  return err('Not Found', 404, 'not_found');
}

// ─── Settings handlers ──────────────────────────────────────

async function getSettings(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT id, card_type, is_enabled, interval_n, sort_order, rotation_order, metadata, created_at, updated_at
     FROM feed_card_settings ORDER BY sort_order`
  ).all();
  return ok({ settings: rows.results });
}

async function bulkUpdateSettings(request: Request, env: Env): Promise<Response> {
  let body: { settings: Array<{
    id: string;
    is_enabled?: boolean;
    interval_n?: number;
    sort_order?: number;
    rotation_order?: number;
    metadata?: Record<string, unknown>;
  }> };
  try {
    body = await request.json() as typeof body;
  } catch {
    return err('Invalid JSON');
  }

  if (!Array.isArray(body.settings) || body.settings.length === 0) {
    return err('settings array required');
  }

  const ts = now();
  for (const s of body.settings) {
    if (!s.id) continue;
    const sets: string[] = [];
    const vals: unknown[] = [];

    if (typeof s.is_enabled === 'boolean') { sets.push('is_enabled = ?'); vals.push(s.is_enabled); }
    if (typeof s.interval_n === 'number') { sets.push('interval_n = ?'); vals.push(s.interval_n); }
    if (typeof s.sort_order === 'number') { sets.push('sort_order = ?'); vals.push(s.sort_order); }
    if (typeof s.rotation_order === 'number') { sets.push('rotation_order = ?'); vals.push(s.rotation_order); }
    if (s.metadata !== undefined) { sets.push('metadata = ?'); vals.push(JSON.stringify(s.metadata)); }

    if (sets.length === 0) continue;
    sets.push('updated_at = ?');
    vals.push(ts);
    vals.push(s.id);

    await env.DB.prepare(
      `UPDATE feed_card_settings SET ${sets.join(', ')} WHERE id = ?`
    ).bind(...vals).run();
  }

  return ok({ updated: true });
}

// ─── Preview ────────────────────────────────────────────────

async function getPreview(env: Env): Promise<Response> {
  // Get enabled settings sorted by sort_order
  const settingsRows = await env.DB.prepare(
    `SELECT card_type, interval_n, sort_order
     FROM feed_card_settings
     WHERE is_enabled = true
     ORDER BY sort_order`
  ).all();

  const settings = settingsRows.results as Array<{
    card_type: string;
    interval_n: number;
    sort_order: number;
  }>;

  // Build preview: 20 feed slots with card insertions
  const totalSlots = 20;
  const items: Array<{ position: number; type: 'post' | 'ranking' | 'recommended' | 'ad'; label: string }> = [];

  // Determine card insertion positions
  const cardPositions = new Map<number, string>();
  for (const s of settings) {
    if (s.interval_n <= 0) continue;
    for (let pos = s.interval_n; pos <= totalSlots + settings.length * 5; pos += s.interval_n) {
      if (!cardPositions.has(pos)) {
        cardPositions.set(pos, s.card_type);
      }
    }
  }

  let postIndex = 1;
  let pos = 1;
  while (items.length < totalSlots) {
    const cardType = cardPositions.get(pos);
    if (cardType) {
      items.push({
        position: items.length + 1,
        type: cardType as 'ranking' | 'recommended' | 'ad',
        label: cardType,
      });
    } else {
      items.push({
        position: items.length + 1,
        type: 'post',
        label: `Post #${postIndex++}`,
      });
    }
    pos++;
  }

  return ok({ preview: items });
}

// ─── Dummy Cards handlers ───────────────────────────────────

async function listDummyCards(env: Env, url: URL): Promise<Response> {
  const tabType = url.searchParams.get('tab_type');
  const isActive = url.searchParams.get('is_active');

  let sql = 'SELECT * FROM feed_dummy_cards WHERE 1=1';
  const vals: unknown[] = [];

  if (tabType) {
    sql += ' AND tab_type = ?';
    vals.push(tabType);
  }
  if (isActive !== null && isActive !== '') {
    sql += ' AND is_active = ?';
    vals.push(isActive === 'true');
  }
  sql += ' ORDER BY sort_order, created_at DESC';

  const rows = await env.DB.prepare(sql).bind(...vals).all();
  return ok({ cards: rows.results });
}

async function createDummyCard(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const tabType = String(body.tab_type || '').trim();
  if (!tabType) return err('tab_type required');

  const validTabs = ['weekly_health_king', 'breed_health_king', 'new_registration', 'local_health_king', 'recommended_user'];
  if (!validTabs.includes(tabType)) return err('Invalid tab_type');

  const id = newId();
  const ts = now();

  await env.DB.prepare(
    `INSERT INTO feed_dummy_cards (
      id, tab_type, title, subtitle, description, image_url, link_url, avatar_url,
      display_name, badge_text, score, region, breed_info, pet_type,
      is_active, sort_order, metadata, start_date, end_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, tabType,
    body.title ?? null, body.subtitle ?? null, body.description ?? null,
    body.image_url ?? null, body.link_url ?? null, body.avatar_url ?? null,
    body.display_name ?? null, body.badge_text ?? null,
    typeof body.score === 'number' ? body.score : 0,
    body.region ?? null, body.breed_info ?? null, body.pet_type ?? null,
    body.is_active !== false, typeof body.sort_order === 'number' ? body.sort_order : 0,
    body.metadata ? JSON.stringify(body.metadata) : '{}',
    body.start_date ?? null, body.end_date ?? null,
    ts, ts,
  ).run();

  return created({ id });
}

async function updateDummyCard(request: Request, env: Env, id: string): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const existing = await env.DB.prepare('SELECT id FROM feed_dummy_cards WHERE id = ?').bind(id).first();
  if (!existing) return err('Card not found', 404);

  const fields = [
    'tab_type', 'title', 'subtitle', 'description', 'image_url', 'link_url', 'avatar_url',
    'display_name', 'badge_text', 'region', 'breed_info', 'pet_type',
  ];

  const sets: string[] = [];
  const vals: unknown[] = [];

  for (const f of fields) {
    if (f in body) { sets.push(`${f} = ?`); vals.push(body[f] ?? null); }
  }
  if ('score' in body) { sets.push('score = ?'); vals.push(typeof body.score === 'number' ? body.score : 0); }
  if ('is_active' in body) { sets.push('is_active = ?'); vals.push(!!body.is_active); }
  if ('sort_order' in body) { sets.push('sort_order = ?'); vals.push(typeof body.sort_order === 'number' ? body.sort_order : 0); }
  if ('metadata' in body) { sets.push('metadata = ?'); vals.push(JSON.stringify(body.metadata || {})); }
  if ('start_date' in body) { sets.push('start_date = ?'); vals.push(body.start_date ?? null); }
  if ('end_date' in body) { sets.push('end_date = ?'); vals.push(body.end_date ?? null); }

  if (sets.length === 0) return err('No fields to update');

  sets.push('updated_at = ?');
  vals.push(now());
  vals.push(id);

  await env.DB.prepare(
    `UPDATE feed_dummy_cards SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...vals).run();

  return ok({ id, updated: true });
}

async function deleteDummyCard(env: Env, id: string): Promise<Response> {
  const existing = await env.DB.prepare('SELECT id FROM feed_dummy_cards WHERE id = ?').bind(id).first();
  if (!existing) return err('Card not found', 404);

  await env.DB.prepare(
    'UPDATE feed_dummy_cards SET is_active = false, updated_at = ? WHERE id = ?'
  ).bind(now(), id).run();

  return ok({ id, deleted: true });
}
