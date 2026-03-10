// Weight log CRUD for /api/v1/pets/:id/weight-logs
import type { Env, JwtPayload } from '../../types';
import { ok, created, err, newId, now } from '../../types';
import { assertPetOwner, normalizeMeasuredAt, parseOptionalNumber, rangeStartByKey, syncPetCurrentWeightFromLogs } from './helpers';

export async function listWeightLogs(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  const range = (url.searchParams.get('range') || 'all').trim();
  const start = rangeStartByKey(range);

  const where = ['pet_id = ?'];
  const vals: Array<string | number> = [petId];
  if (start) {
    where.push('measured_at >= ?');
    vals.push(start);
  }

  const rows = await env.DB.prepare(
    `SELECT id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
     FROM pet_weight_logs
     WHERE ${where.join(' AND ')}
     ORDER BY measured_at DESC, created_at DESC, id DESC`
  ).bind(...vals).all<Record<string, unknown>>();

  const asc = [...rows.results].sort((a, b) => new Date(String(a.measured_at || a.created_at)).getTime() - new Date(String(b.measured_at || b.created_at)).getTime());
  const latest = rows.results[0] || null;
  const latestValue = latest ? Number(latest.weight_value || 0) : null;
  const minValue = rows.results.length ? Math.min(...rows.results.map((r) => Number(r.weight_value || 0))) : null;
  const maxValue = rows.results.length ? Math.max(...rows.results.map((r) => Number(r.weight_value || 0))) : null;
  const prevValue = asc.length > 1 ? Number(asc[asc.length - 2].weight_value || 0) : null;
  const deltaFromPrev = (latestValue !== null && prevValue !== null) ? Number((latestValue - prevValue).toFixed(3)) : null;

  return ok({
    logs: rows.results,
    range,
    summary: {
      latest_weight: latestValue,
      latest_measured_at: latest?.measured_at ?? null,
      min_weight: minValue,
      max_weight: maxValue,
      delta_from_prev: deltaFromPrev,
      weight_unit_id: (latest?.weight_unit_id as string | null) ?? pet.weight_unit_id ?? null,
    },
  });
}

export async function createWeightLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const weightValue = parseOptionalNumber(body.weight_value ?? body.current_weight);
  if (weightValue === null) return err('weight_value required');

  const id = newId();
  const ts = now();
  const measuredAt = normalizeMeasuredAt(body.measured_at);
  const weightUnitId = typeof body.weight_unit_id === 'string' && body.weight_unit_id.trim() ? body.weight_unit_id.trim() : pet.weight_unit_id;

  await env.DB.prepare(
    `INSERT INTO pet_weight_logs (
      id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    petId,
    weightValue,
    weightUnitId ?? null,
    measuredAt,
    payload.sub,
    typeof body.notes === 'string' ? body.notes.trim() : null,
    ts,
    ts,
  ).run();

  await syncPetCurrentWeightFromLogs(env, petId);
  return created({ id });
}

export async function updateWeightLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  const row = await env.DB.prepare(
    'SELECT id FROM pet_weight_logs WHERE id = ? AND pet_id = ?'
  ).bind(logId, petId).first<{ id: string }>();
  if (!row) return err('Weight log not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];

  if (Object.prototype.hasOwnProperty.call(body, 'weight_value')) {
    const weightValue = parseOptionalNumber(body.weight_value);
    if (weightValue === null) return err('invalid weight_value');
    sets.push('weight_value = ?');
    vals.push(weightValue);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'weight_unit_id')) {
    sets.push('weight_unit_id = ?');
    vals.push(body.weight_unit_id ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'measured_at')) {
    sets.push('measured_at = ?');
    vals.push(normalizeMeasuredAt(body.measured_at));
  }
  if (Object.prototype.hasOwnProperty.call(body, 'notes')) {
    sets.push('notes = ?');
    vals.push(typeof body.notes === 'string' ? body.notes.trim() : null);
  }

  if (sets.length === 1) return err('nothing to update');

  vals.push(logId, petId);
  await env.DB.prepare(`UPDATE pet_weight_logs SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`).bind(...vals).run();
  await syncPetCurrentWeightFromLogs(env, petId);
  return ok({ updated: true, id: logId });
}

export async function deleteWeightLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  await env.DB.prepare('DELETE FROM pet_weight_logs WHERE id = ? AND pet_id = ?').bind(logId, petId).run();
  await syncPetCurrentWeightFromLogs(env, petId);
  return ok({ deleted: true, id: logId });
}
