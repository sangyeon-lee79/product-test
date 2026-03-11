// Exercise log CRUD for /api/v1/pets/:id/exercise-logs
import type { Env, JwtPayload } from '../../types';
import { ok, created, err, newId, now } from '../../types';
import { assertPetOwner, normalizeMeasuredAt, rangeStartByKey } from './helpers';

export async function listExerciseLogs(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  const range = (url.searchParams.get('range') || 'all').trim();
  const start = rangeStartByKey(range);

  const where = ['pet_id = ?'];
  const vals: Array<string | number> = [petId];
  if (start) {
    where.push('exercise_date >= ?');
    vals.push(start);
  }

  const rows = await env.DB.prepare(
    `SELECT id, pet_id, exercise_type, exercise_subtype, exercise_date,
            duration_min, distance_km, intensity, leash, location_type,
            with_other_pets, note, recorded_by_user_id, created_at, updated_at
     FROM pet_exercise_logs
     WHERE ${where.join(' AND ')}
     ORDER BY exercise_date DESC, created_at DESC, id DESC`
  ).bind(...vals).all<Record<string, unknown>>();

  const logs = rows.results;
  const totalDuration = logs.reduce((sum, r) => sum + Number(r.duration_min || 0), 0);

  return ok({
    logs,
    range,
    summary: {
      total_count: logs.length,
      total_duration_min: totalDuration,
      avg_duration_min: logs.length ? Math.round(totalDuration / logs.length) : 0,
      latest_date: logs.length ? logs[0].exercise_date : null,
    },
  });
}

export async function createExerciseLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const exerciseType = typeof body.exercise_type === 'string' ? body.exercise_type.trim() : '';
  const exerciseSubtype = typeof body.exercise_subtype === 'string' ? body.exercise_subtype.trim() : '';
  if (!exerciseType) return err('exercise_type required');
  if (!exerciseSubtype) return err('exercise_subtype required');

  const durationMin = Number(body.duration_min);
  if (!Number.isFinite(durationMin) || durationMin <= 0) return err('duration_min must be a positive number');

  const distanceKm = body.distance_km !== undefined && body.distance_km !== null && body.distance_km !== ''
    ? Number(body.distance_km) : null;
  if (distanceKm !== null && !Number.isFinite(distanceKm)) return err('invalid distance_km');

  const intensity = typeof body.intensity === 'string' && body.intensity.trim()
    ? body.intensity.trim() : 'medium';
  const locationType = typeof body.location_type === 'string' && body.location_type.trim()
    ? body.location_type.trim() : 'outdoor';

  const id = newId();
  const ts = now();
  const exerciseDate = normalizeMeasuredAt(body.exercise_date);

  await env.DB.prepare(
    `INSERT INTO pet_exercise_logs (
      id, pet_id, exercise_type, exercise_subtype, exercise_date,
      duration_min, distance_km, intensity, leash, location_type,
      with_other_pets, note, recorded_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, petId, exerciseType, exerciseSubtype, exerciseDate,
    durationMin, distanceKm, intensity,
    body.leash === true || body.leash === 'true' ? true : body.leash === false || body.leash === 'false' ? false : null,
    locationType,
    body.with_other_pets ? true : false,
    typeof body.note === 'string' ? body.note.trim() : null,
    payload.sub,
    ts, ts,
  ).run();

  return created({ id });
}

export async function updateExerciseLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  const row = await env.DB.prepare(
    'SELECT id FROM pet_exercise_logs WHERE id = ? AND pet_id = ?'
  ).bind(logId, petId).first<{ id: string }>();
  if (!row) return err('Exercise log not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];

  if (Object.prototype.hasOwnProperty.call(body, 'exercise_type')) {
    const v = typeof body.exercise_type === 'string' ? body.exercise_type.trim() : '';
    if (!v) return err('exercise_type cannot be empty');
    sets.push('exercise_type = ?');
    vals.push(v);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'exercise_subtype')) {
    const v = typeof body.exercise_subtype === 'string' ? body.exercise_subtype.trim() : '';
    if (!v) return err('exercise_subtype cannot be empty');
    sets.push('exercise_subtype = ?');
    vals.push(v);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'exercise_date')) {
    sets.push('exercise_date = ?');
    vals.push(normalizeMeasuredAt(body.exercise_date));
  }
  if (Object.prototype.hasOwnProperty.call(body, 'duration_min')) {
    const v = Number(body.duration_min);
    if (!Number.isFinite(v) || v <= 0) return err('invalid duration_min');
    sets.push('duration_min = ?');
    vals.push(v);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'distance_km')) {
    const v = body.distance_km !== null && body.distance_km !== undefined && body.distance_km !== ''
      ? Number(body.distance_km) : null;
    if (v !== null && !Number.isFinite(v)) return err('invalid distance_km');
    sets.push('distance_km = ?');
    vals.push(v);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'intensity')) {
    const v = typeof body.intensity === 'string' ? body.intensity.trim() : '';
    if (v) { sets.push('intensity = ?'); vals.push(v); }
  }
  if (Object.prototype.hasOwnProperty.call(body, 'leash')) {
    sets.push('leash = ?');
    vals.push(body.leash === true || body.leash === 'true' ? true : body.leash === false || body.leash === 'false' ? false : null);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'location_type')) {
    const v = typeof body.location_type === 'string' ? body.location_type.trim() : '';
    if (v) { sets.push('location_type = ?'); vals.push(v); }
  }
  if (Object.prototype.hasOwnProperty.call(body, 'with_other_pets')) {
    sets.push('with_other_pets = ?');
    vals.push(body.with_other_pets ? true : false);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'note')) {
    sets.push('note = ?');
    vals.push(typeof body.note === 'string' ? body.note.trim() : null);
  }

  if (sets.length === 1) return err('nothing to update');

  vals.push(logId, petId);
  await env.DB.prepare(`UPDATE pet_exercise_logs SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`).bind(...vals).run();
  return ok({ updated: true, id: logId });
}

export async function deleteExerciseLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  await env.DB.prepare('DELETE FROM pet_exercise_logs WHERE id = ? AND pet_id = ?').bind(logId, petId).run();
  return ok({ deleted: true, id: logId });
}
