// S7: 건강 기록 API — LLD §5.7
// GET    /api/v1/pets/:petId/logs                 기록 목록 (타임라인)
// POST   /api/v1/pets/:petId/logs                 기록 생성 (+ values + media + glucose alert)
// PUT    /api/v1/pets/:petId/logs/:id             기록 수정
// DELETE /api/v1/pets/:petId/logs/:id             기록 삭제 (soft)
// POST   /api/v1/pets/:petId/logs/sync            오프라인 배치 동기화

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';

// ─── 혈당 경고 임계값 (LLD §9) ─────────────────────────────────────────────
const GLUCOSE = {
  LOW_CRITICAL: 60,   // mg/dL 미만 → critical
  LOW_WARNING:  80,   // mg/dL 미만 → warning
  HIGH_WARNING: 300,  // mg/dL 초과 → warning
  RAPID_DROP:   50,   // mg/dL 이상 급락 → warning
};

// mmol/L → mg/dL 변환
function toMgDl(value: number, unitSymbol: string): number {
  if (unitSymbol === 'mmol/L' || unitSymbol === 'mmol_l') return value * 18.02;
  return value;
}

interface GlucoseAlert {
  type: string;
  severity: 'critical' | 'warning';
  message_key: string;
  value: number;
  threshold: number;
  unit: string;
}

function evaluateGlucoseAlert(mgDlValue: number, prevMgDlValue: number | null): GlucoseAlert | null {
  if (mgDlValue < GLUCOSE.LOW_CRITICAL) {
    return { type: 'low_glucose_critical', severity: 'critical', message_key: 'alert.low_glucose_critical', value: mgDlValue, threshold: GLUCOSE.LOW_CRITICAL, unit: 'mg/dL' };
  }
  if (mgDlValue < GLUCOSE.LOW_WARNING) {
    return { type: 'low_glucose_warning', severity: 'warning', message_key: 'alert.low_glucose_warning', value: mgDlValue, threshold: GLUCOSE.LOW_WARNING, unit: 'mg/dL' };
  }
  if (mgDlValue > GLUCOSE.HIGH_WARNING) {
    return { type: 'high_glucose_warning', severity: 'warning', message_key: 'alert.high_glucose_warning', value: mgDlValue, threshold: GLUCOSE.HIGH_WARNING, unit: 'mg/dL' };
  }
  if (prevMgDlValue !== null && (prevMgDlValue - mgDlValue) >= GLUCOSE.RAPID_DROP) {
    return { type: 'rapid_drop', severity: 'warning', message_key: 'alert.rapid_drop', value: mgDlValue, threshold: GLUCOSE.RAPID_DROP, unit: 'mg/dL' };
  }
  return null;
}

// ─── route entry ─────────────────────────────────────────────────────────────

export async function handleLogs(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const payload = auth as JwtPayload;

  // sub = pathname after /api/v1/pets/:petId
  const sub = url.pathname.replace(/^\/api\/v1\/pets\/[^/]+/, '');
  const petIdMatch = url.pathname.match(/^\/api\/v1\/pets\/([^/]+)/);
  const petId = petIdMatch ? petIdMatch[1] : '';

  if (!petId) return err('Pet ID missing', 400);

  // Ownership guard (guardian only, admin allowed as well)
  if (payload.role === 'guardian') {
    const pet = await env.DB.prepare(
      "SELECT id FROM pets WHERE id = ? AND guardian_user_id = ? AND status != 'deleted'"
    ).bind(petId, payload.sub).first<{ id: string }>();
    if (!pet) return err('Pet not found', 404, 'not_found');
  }

  // POST /logs/sync
  if (sub === '/logs/sync' || sub === '/logs/sync/') {
    if (request.method === 'POST') return syncLogs(request, env, payload, petId);
  }

  // /logs
  if (sub === '/logs' || sub === '/logs/') {
    if (request.method === 'GET')  return listLogs(env, payload, petId, url);
    if (request.method === 'POST') return createLog(request, env, payload, petId);
  }

  // /logs/:id
  const logMatch = sub.match(/^\/logs\/([^/]+)$/);
  if (logMatch) {
    const logId = logMatch[1];
    if (request.method === 'PUT')    return updateLog(request, env, payload, petId, logId);
    if (request.method === 'DELETE') return deleteLog(env, payload, petId, logId);
  }

  return err('Not found', 404);
}

// ─── GET /pets/:petId/logs ────────────────────────────────────────────────────

async function listLogs(env: Env, _payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const limit = Math.min(Number(url.searchParams.get('limit') || '50'), 200);
  const offset = Number(url.searchParams.get('offset') || '0');
  const logtypeId = url.searchParams.get('logtype_id') || '';
  const dateFrom = url.searchParams.get('date_from') || '';
  const dateTo = url.searchParams.get('date_to') || '';

  let where = "l.pet_id = ? AND l.status = 'active'";
  const binds: unknown[] = [petId];

  if (logtypeId) { where += ' AND l.logtype_id = ?'; binds.push(logtypeId); }
  if (dateFrom)  { where += ' AND l.event_date >= ?'; binds.push(dateFrom); }
  if (dateTo)    { where += ' AND l.event_date <= ?'; binds.push(dateTo); }

  const rows = await env.DB.prepare(
    `SELECT l.id, l.pet_id, l.author_id, l.logtype_id,
            mi.code AS logtype_code,
            l.event_date, l.event_time, l.title, l.notes, l.metadata,
            l.is_synced, l.sync_version, l.status, l.created_at, l.updated_at
     FROM logs l
     LEFT JOIN master_items mi ON mi.id = l.logtype_id
     WHERE ${where}
     ORDER BY l.event_date DESC, l.event_time DESC, l.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all<Record<string, unknown>>();

  if (!rows.results.length) return ok({ logs: [], total: 0 });

  const logIds = rows.results.map((r) => r.id as string);

  // Batch load log_values
  const placeholders = logIds.map(() => '?').join(',');
  const values = await env.DB.prepare(
    `SELECT lv.id, lv.log_id, lv.metric_id, lv.unit_id,
            mi.code AS metric_code, mu.code AS unit_code,
            lv.numeric_value, lv.text_value, lv.sort_order
     FROM log_values lv
     LEFT JOIN master_items mi ON mi.id = lv.metric_id
     LEFT JOIN master_items mu ON mu.id = lv.unit_id
     WHERE lv.log_id IN (${placeholders})
     ORDER BY lv.sort_order`
  ).bind(...logIds).all<Record<string, unknown>>();

  // Batch load log_media
  const media = await env.DB.prepare(
    `SELECT id, log_id, media_url, media_type, thumbnail_url, sort_order
     FROM log_media
     WHERE log_id IN (${placeholders})
     ORDER BY sort_order`
  ).bind(...logIds).all<Record<string, unknown>>();

  // Group values and media by log_id
  const valsByLog: Record<string, unknown[]> = {};
  for (const v of values.results) {
    const lid = v.log_id as string;
    if (!valsByLog[lid]) valsByLog[lid] = [];
    valsByLog[lid].push(v);
  }
  const mediaByLog: Record<string, unknown[]> = {};
  for (const m of media.results) {
    const lid = m.log_id as string;
    if (!mediaByLog[lid]) mediaByLog[lid] = [];
    mediaByLog[lid].push(m);
  }

  const logs = rows.results.map((r) => ({
    ...r,
    metadata: safeJson(r.metadata),
    values: valsByLog[r.id as string] || [],
    media: mediaByLog[r.id as string] || [],
  }));

  const totalRow = await env.DB.prepare(
    `SELECT COUNT(*) AS cnt FROM logs l WHERE ${where}`
  ).bind(...binds).first<{ cnt: number }>();

  return ok({ logs, total: totalRow?.cnt ?? logs.length });
}

// ─── POST /pets/:petId/logs ───────────────────────────────────────────────────

async function createLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const logtypeId = (body.logtype_id as string | undefined)?.trim();
  const eventDate = (body.event_date as string | undefined)?.trim();
  if (!logtypeId) return err('logtype_id required');
  if (!eventDate) return err('event_date required');

  const id = newId();
  const ts = now();

  // Validate logtype exists
  const logtype = await env.DB.prepare(
    "SELECT id, code FROM master_items WHERE id = ? AND status = 'active'"
  ).bind(logtypeId).first<{ id: string; code: string }>();
  if (!logtype) return err('logtype_id not found', 422);

  const metadataStr = typeof body.metadata === 'object' && body.metadata !== null
    ? JSON.stringify(body.metadata)
    : '{}';

  await env.DB.prepare(
    `INSERT INTO logs (id, pet_id, author_id, logtype_id, event_date, event_time, title, notes, metadata, is_synced, sync_version, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'active', ?, ?)`
  ).bind(
    id, petId, payload.sub, logtypeId,
    eventDate,
    (body.event_time as string | undefined) || null,
    (body.title as string | undefined) || null,
    (body.notes as string | undefined) || null,
    metadataStr, ts, ts,
  ).run();

  // Insert log_values
  const inputValues = Array.isArray(body.values) ? body.values as Record<string, unknown>[] : [];
  let glucoseAlert: GlucoseAlert | null = null;

  for (let i = 0; i < inputValues.length; i++) {
    const v = inputValues[i];
    const metricId = (v.metric_id as string | undefined)?.trim();
    const unitId = (v.unit_id as string | undefined)?.trim();
    if (!metricId || !unitId) continue;

    const numVal = v.numeric_value != null ? Number(v.numeric_value) : null;
    const txtVal = (v.text_value as string | undefined) || null;

    await env.DB.prepare(
      `INSERT INTO log_values (id, log_id, metric_id, unit_id, numeric_value, text_value, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(newId(), id, metricId, unitId, numVal, txtVal, i, ts).run();

    // Glucose alert check (blood_glucose_log)
    if (logtype.code === 'blood_glucose_log' && numVal !== null && !glucoseAlert) {
      const unitRow = await env.DB.prepare(
        'SELECT code, symbol FROM master_items WHERE id = ? LIMIT 1'
      ).bind(unitId).first<{ code: string; symbol: string }>();
      const unitSymbol = unitRow?.code ?? '';
      const mgDl = toMgDl(numVal, unitSymbol);

      // Previous blood glucose value for rapid drop check
      const prev = await env.DB.prepare(
        `SELECT lv.numeric_value, mu.code AS unit_code
         FROM log_values lv
         JOIN logs lg ON lg.id = lv.log_id
         LEFT JOIN master_items mu ON mu.id = lv.unit_id
         WHERE lg.pet_id = ? AND lg.status = 'active' AND lg.id != ?
           AND lv.metric_id = ?
         ORDER BY lg.event_date DESC, lg.event_time DESC, lg.created_at DESC
         LIMIT 1`
      ).bind(petId, id, metricId).first<{ numeric_value: number; unit_code: string }>();

      const prevMgDl = prev ? toMgDl(prev.numeric_value, prev.unit_code) : null;
      glucoseAlert = evaluateGlucoseAlert(mgDl, prevMgDl);
    }
  }

  // Insert log_media
  const inputMedia = Array.isArray(body.media) ? body.media as Record<string, unknown>[] : [];
  for (let i = 0; i < inputMedia.length; i++) {
    const m = inputMedia[i];
    const mediaUrl = (m.media_url as string | undefined)?.trim();
    if (!mediaUrl) continue;
    await env.DB.prepare(
      `INSERT INTO log_media (id, log_id, media_url, media_type, thumbnail_url, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(newId(), id, mediaUrl, (m.media_type as string | undefined) || 'image', (m.thumbnail_url as string | undefined) || null, i, ts).run();
  }

  const result = await env.DB.prepare(
    `SELECT l.id, l.pet_id, l.author_id, l.logtype_id, mi.code AS logtype_code,
            l.event_date, l.event_time, l.title, l.notes, l.metadata, l.created_at
     FROM logs l LEFT JOIN master_items mi ON mi.id = l.logtype_id
     WHERE l.id = ?`
  ).bind(id).first<Record<string, unknown>>();

  const savedValues = await env.DB.prepare(
    `SELECT lv.id, lv.metric_id, mi.code AS metric_code, lv.unit_id, mu.code AS unit_code,
            lv.numeric_value, lv.text_value, lv.sort_order
     FROM log_values lv
     LEFT JOIN master_items mi ON mi.id = lv.metric_id
     LEFT JOIN master_items mu ON mu.id = lv.unit_id
     WHERE lv.log_id = ?`
  ).bind(id).all<Record<string, unknown>>();

  const savedMedia = await env.DB.prepare(
    'SELECT id, media_url, media_type, thumbnail_url, sort_order FROM log_media WHERE log_id = ?'
  ).bind(id).all<Record<string, unknown>>();

  return created({
    ...(result ?? {}),
    metadata: safeJson((result?.metadata as string | undefined)),
    values: savedValues.results,
    media: savedMedia.results,
    ...(glucoseAlert ? { alert: glucoseAlert } : {}),
  });
}

// ─── PUT /pets/:petId/logs/:id ────────────────────────────────────────────────

async function updateLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const log = await env.DB.prepare(
    "SELECT id FROM logs WHERE id = ? AND pet_id = ? AND author_id = ? AND status = 'active'"
  ).bind(logId, petId, payload.sub).first<{ id: string }>();
  if (!log) return err('Log not found', 404, 'not_found');

  const fields: string[] = [];
  const vals: unknown[] = [];
  if (body.event_date !== undefined) { fields.push('event_date = ?'); vals.push(body.event_date); }
  if (body.event_time !== undefined) { fields.push('event_time = ?'); vals.push(body.event_time || null); }
  if (body.title !== undefined)      { fields.push('title = ?');      vals.push(body.title || null); }
  if (body.notes !== undefined)      { fields.push('notes = ?');      vals.push(body.notes || null); }
  if (body.metadata !== undefined)   { fields.push('metadata = ?');   vals.push(JSON.stringify(body.metadata)); }

  if (fields.length) {
    fields.push('updated_at = ?');
    vals.push(now(), logId);
    await env.DB.prepare(`UPDATE logs SET ${fields.join(', ')} WHERE id = ?`).bind(...vals).run();
  }

  return ok({ id: logId, updated: true });
}

// ─── DELETE /pets/:petId/logs/:id ────────────────────────────────────────────

async function deleteLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const log = await env.DB.prepare(
    "SELECT id FROM logs WHERE id = ? AND pet_id = ? AND author_id = ? AND status = 'active'"
  ).bind(logId, petId, payload.sub).first<{ id: string }>();
  if (!log) return err('Log not found', 404, 'not_found');

  await env.DB.prepare(
    "UPDATE logs SET status = 'deleted', updated_at = ? WHERE id = ?"
  ).bind(now(), logId).run();

  return ok({ id: logId, deleted: true });
}

// ─── POST /pets/:petId/logs/sync ─────────────────────────────────────────────

async function syncLogs(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  let body: { logs?: unknown[] };
  try { body = await request.json() as { logs?: unknown[] }; } catch { return err('Invalid JSON'); }

  const items = Array.isArray(body.logs) ? body.logs : [];
  const synced: string[] = [];
  const errors: { local_id: string; error: string }[] = [];

  for (const item of items) {
    const rec = item as Record<string, unknown>;
    const localId = (rec.local_id as string | undefined) || '';
    try {
      const logtypeId = (rec.logtype_id as string | undefined)?.trim();
      const eventDate = (rec.event_date as string | undefined)?.trim();
      if (!logtypeId || !eventDate) { errors.push({ local_id: localId, error: 'logtype_id and event_date required' }); continue; }

      const id = newId();
      const ts = now();
      const metaStr = typeof rec.metadata === 'object' && rec.metadata !== null ? JSON.stringify(rec.metadata) : '{}';

      await env.DB.prepare(
        `INSERT INTO logs (id, pet_id, author_id, logtype_id, event_date, event_time, title, notes, metadata, is_synced, sync_version, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'active', ?, ?)`
      ).bind(id, petId, payload.sub, logtypeId, eventDate,
        (rec.event_time as string | undefined) || null,
        (rec.title as string | undefined) || null,
        (rec.notes as string | undefined) || null,
        metaStr, Number(rec.sync_version || 1), ts, ts,
      ).run();

      const vals = Array.isArray(rec.values) ? rec.values as Record<string, unknown>[] : [];
      for (let i = 0; i < vals.length; i++) {
        const v = vals[i];
        const metricId = (v.metric_id as string | undefined)?.trim();
        const unitId = (v.unit_id as string | undefined)?.trim();
        if (!metricId || !unitId) continue;
        await env.DB.prepare(
          `INSERT INTO log_values (id, log_id, metric_id, unit_id, numeric_value, text_value, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(newId(), id, metricId, unitId, v.numeric_value ?? null, v.text_value ?? null, i, ts).run();
      }

      synced.push(localId);
    } catch (e) {
      errors.push({ local_id: localId, error: e instanceof Error ? e.message : 'Unknown error' });
    }
  }

  return ok({ synced, errors, total: items.length, success_count: synced.length });
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function safeJson(value: unknown): unknown {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return value ?? {};
}
