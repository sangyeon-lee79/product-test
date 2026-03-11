// S6: 펫 CRUD 라우터 + 핵심 핸들러
// GET/POST       /api/v1/pets
// GET/PUT/DELETE /api/v1/pets/:id
// GET            /api/v1/pets/check-microchip
import type { Env, JwtPayload } from '../../types';
import { ok, created, err, newId, now } from '../../types';
import { requireAuth } from '../../middleware/auth';
import {
  ARRAY_COLUMNS,
  parseIdArray, parseJsonArrayString, parseOptionalNumber, normalizeMicrochip,
  normalizeMeasuredAt, normalizePetRecord,
  hasTable, hasColumn,
  replaceRelationRows, ensurePetItemRelationTable, upsertSinglePetItemRelation,
  replaceDiseaseSelections, selectRelationIds,
  findMicrochipOwner,
  assertPetOwner, syncPetCurrentWeightFromLogs,
} from './helpers';
import { listWeightLogs, createWeightLog, updateWeightLog, deleteWeightLog } from './weightLogs';
import { listDiseases, addDisease, updateDisease, removeDisease, listDiseaseDevices, createDiseaseDevice } from './diseaseHistory';
import {
  listGlucoseLogs, createGlucoseLog, updateGlucoseLog, deleteGlucoseLog,
  listHealthMeasurementLogs, createHealthMeasurementLog, updateHealthMeasurementLog, deleteHealthMeasurementLog,
} from './healthMeasurements';
import { listExerciseLogs, createExerciseLog, updateExerciseLog, deleteExerciseLog } from './exerciseLogs';

export async function handlePets(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const payload = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/pets', '');

  if ((sub === '/check-microchip' || sub === '/check-microchip/') && request.method === 'GET') {
    return checkMicrochip(env, payload, url);
  }

  // /pets
  if (sub === '' || sub === '/') {
    if (request.method === 'GET') return listPets(env, payload);
    if (request.method === 'POST') return createPet(request, env, payload);
  }

  // /pets/:id/weight-logs
  const weightLogsMatch = sub.match(/^\/([^/]+)\/weight-logs$/);
  if (weightLogsMatch) {
    const petId = weightLogsMatch[1];
    if (request.method === 'GET') return listWeightLogs(env, payload, petId, url);
    if (request.method === 'POST') return createWeightLog(request, env, payload, petId);
  }

  // /pets/:id/weight-logs/:logId
  const weightLogItemMatch = sub.match(/^\/([^/]+)\/weight-logs\/([^/]+)$/);
  if (weightLogItemMatch) {
    const [, petId, logId] = weightLogItemMatch;
    if (request.method === 'PUT') return updateWeightLog(request, env, payload, petId, logId);
    if (request.method === 'DELETE') return deleteWeightLog(env, payload, petId, logId);
  }

  // /pets/:id
  const singleMatch = sub.match(/^\/([^/]+)$/);
  if (singleMatch) {
    const petId = singleMatch[1];
    if (request.method === 'GET') return getPet(env, payload, petId);
    if (request.method === 'PUT') return updatePet(request, env, payload, petId);
    if (request.method === 'DELETE') return deletePet(env, payload, petId);
  }

  // /pets/:id/diseases
  const diseaseListMatch = sub.match(/^\/([^/]+)\/diseases$/);
  if (diseaseListMatch) {
    const petId = diseaseListMatch[1];
    if (request.method === 'GET') return listDiseases(env, payload, petId);
    if (request.method === 'POST') return addDisease(request, env, payload, petId);
  }

  // /pets/:id/diseases/:historyId
  const diseaseItemMatch = sub.match(/^\/([^/]+)\/diseases\/([^/]+)$/);
  if (diseaseItemMatch) {
    const [, petId, historyId] = diseaseItemMatch;
    if (request.method === 'PUT') return updateDisease(request, env, payload, petId, historyId);
    if (request.method === 'DELETE') return removeDisease(env, payload, petId, historyId);
  }

  // /pets/:id/disease-devices
  const diseaseDevicesMatch = sub.match(/^\/([^/]+)\/disease-devices$/);
  if (diseaseDevicesMatch) {
    const petId = diseaseDevicesMatch[1];
    if (request.method === 'GET') return listDiseaseDevices(env, payload, petId);
    if (request.method === 'POST') return createDiseaseDevice(request, env, payload, petId);
  }

  // /pets/:id/glucose-logs
  const glucoseLogsMatch = sub.match(/^\/([^/]+)\/glucose-logs$/);
  if (glucoseLogsMatch) {
    const petId = glucoseLogsMatch[1];
    if (request.method === 'GET') return listGlucoseLogs(env, payload, petId, url);
    if (request.method === 'POST') return createGlucoseLog(request, env, payload, petId);
  }

  // /pets/:id/glucose-logs/:logId
  const glucoseLogItemMatch = sub.match(/^\/([^/]+)\/glucose-logs\/([^/]+)$/);
  if (glucoseLogItemMatch) {
    const [, petId, logId] = glucoseLogItemMatch;
    if (request.method === 'PUT') return updateGlucoseLog(request, env, payload, petId, logId);
    if (request.method === 'DELETE') return deleteGlucoseLog(env, payload, petId, logId);
  }

  // /pets/:id/health-measurements
  const measurementLogsMatch = sub.match(/^\/([^/]+)\/health-measurements$/);
  if (measurementLogsMatch) {
    const petId = measurementLogsMatch[1];
    if (request.method === 'GET') return listHealthMeasurementLogs(env, payload, petId, url);
    if (request.method === 'POST') return createHealthMeasurementLog(request, env, payload, petId);
  }

  // /pets/:id/health-measurements/:logId
  const measurementLogItemMatch = sub.match(/^\/([^/]+)\/health-measurements\/([^/]+)$/);
  if (measurementLogItemMatch) {
    const [, petId, logId] = measurementLogItemMatch;
    if (request.method === 'PUT') return updateHealthMeasurementLog(request, env, payload, petId, logId);
    if (request.method === 'DELETE') return deleteHealthMeasurementLog(env, payload, petId, logId);
  }

  // /pets/:id/exercise-logs
  const exerciseLogsMatch = sub.match(/^\/([^/]+)\/exercise-logs$/);
  if (exerciseLogsMatch) {
    const petId = exerciseLogsMatch[1];
    if (request.method === 'GET') return listExerciseLogs(env, payload, petId, url);
    if (request.method === 'POST') return createExerciseLog(request, env, payload, petId);
  }

  // /pets/:id/exercise-logs/:logId
  const exerciseLogItemMatch = sub.match(/^\/([^/]+)\/exercise-logs\/([^/]+)$/);
  if (exerciseLogItemMatch) {
    const [, petId, logId] = exerciseLogItemMatch;
    if (request.method === 'PUT') return updateExerciseLog(request, env, payload, petId, logId);
    if (request.method === 'DELETE') return deleteExerciseLog(env, payload, petId, logId);
  }

  // /pets/:id/pet-supplements (delegated to petFeeds route — shared handler)
  if (sub.includes('/pet-supplements')) {
    const { handlePetFeeds } = await import('../petFeeds');
    return handlePetFeeds(request, env, url);
  }

  // /pets/:id/pet-feeds (delegated to petFeeds route)
  if (sub.includes('/pet-feeds')) {
    const { handlePetFeeds } = await import('../petFeeds');
    return handlePetFeeds(request, env, url);
  }

  // /pets/:id/feeding-mix-favorites (MUST be before /feeding-logs to avoid false match)
  if (sub.includes('/feeding-mix-favorites')) {
    const { handleFeedingMixFavorites } = await import('../feedingMixFavorites');
    return handleFeedingMixFavorites(request, env, url);
  }

  // /pets/:id/feeding-logs (MUST be before /logs to avoid false match)
  if (sub.includes('/feeding-logs')) {
    const { handlePetFeedingLogs } = await import('../petFeedingLogs');
    return handlePetFeedingLogs(request, env, url);
  }

  // /pets/:id/guardian-devices (delegated to devices route)
  if (sub.includes('/guardian-devices')) {
    const { handleDevices } = await import('../devices');
    return handleDevices(request, env, url);
  }

  // /pets/:id/logs (delegated to logs route)
  if (sub.includes('/logs')) {
    const { handleLogs } = await import('../logs');
    return handleLogs(request, env, url);
  }

  return err('Not found', 404);
}

// ─── Core CRUD handlers ───────────────────────────────────────────────────────

async function checkMicrochip(env: Env, payload: JwtPayload, url: URL): Promise<Response> {
  const microchipNo = normalizeMicrochip(url.searchParams.get('microchip_no'));
  const excludePetId = (url.searchParams.get('exclude_pet_id') || '').trim() || undefined;

  if (!microchipNo) return err('microchip_no required');

  const owner = await findMicrochipOwner(env, microchipNo, excludePetId);
  if (!owner) return ok({ available: true });

  const mine = owner.guardian_id === payload.sub;
  return ok({
    available: false,
    reason: mine ? '이미 등록된 마이크로칩 번호입니다.' : '다른 반려동물에 연결된 번호입니다.',
    pet_id: owner.id,
  });
}

async function listPets(env: Env, payload: JwtPayload): Promise<Response> {
  const pets = await env.DB.prepare(
    `SELECT p.*,
            p.microchip_number AS microchip_no,
            p.birth_date AS birthday,
            p.weight_kg AS current_weight,
            p.health_level_id AS health_condition_level_id
     FROM pets p
     WHERE p.guardian_user_id = ? AND p.status != 'deleted'
     ORDER BY p.created_at ASC`
  ).bind(payload.sub).all<Record<string, unknown>>();

  const result = await Promise.all(
    pets.results.map(async (pet) => attachPetRelations(env, normalizePetRecord(pet)))
  );
  return ok({ pets: result });
}

async function createPet(request: Request, env: Env, payload: JwtPayload): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) return err('name required');
  if (!body.pet_type_id || typeof body.pet_type_id !== 'string') return err('pet_type_id required');

  const microchipNo = normalizeMicrochip(body.microchip_no);
  if (microchipNo) {
    const dup = await findMicrochipOwner(env, microchipNo);
    if (dup) return err('이미 등록된 마이크로칩 번호입니다.', 409, 'microchip_duplicate');
  }

  const id = newId();
  const ts = now();
  const speciesLegacy = typeof body.species === 'string' && body.species.trim() ? body.species.trim() : null;
  const genderLegacy = typeof body.gender === 'string' && body.gender.trim() ? body.gender.trim() : null;
  const birthday = (typeof body.birthday === 'string' && body.birthday.trim())
    ? body.birthday.trim()
    : (typeof body.birth_date === 'string' && body.birth_date.trim() ? body.birth_date.trim() : null);
  const currentWeight = parseOptionalNumber(body.current_weight ?? body.weight_kg);
  const [hasGroomingCycleColumn, hasColorIdsColumn, hasTemperamentIdsColumn] = await Promise.all([
    hasColumn(env, 'pets', 'grooming_cycle_id'),
    hasColumn(env, 'pets', 'color_ids'),
    hasColumn(env, 'pets', 'temperament_ids'),
  ]);

  const insertColumns: string[] = [
    'id', 'guardian_user_id', 'name', 'microchip_number', 'pet_type_id', 'breed_id',
    'gender_id', 'life_stage_id', 'body_size_id', 'country_id', 'diet_type_id',
    'coat_length_id', 'coat_type_id', 'activity_level_id', 'health_level_id',
    'gender_legacy', 'species_legacy', 'birth_date', 'weight_kg', 'is_neutered', 'avatar_url',
  ];
  const insertValues: unknown[] = [
    id, payload.sub, String(body.name).trim(), microchipNo,
    body.pet_type_id, body.breed_id ?? null, body.gender_id ?? null,
    body.life_stage_id ?? null, body.body_size_id ?? null, body.country_id ?? null,
    body.diet_type_id ?? null, body.coat_length_id ?? null, body.coat_type_id ?? null,
    body.activity_level_id ?? null, body.health_condition_level_id ?? null,
    genderLegacy, speciesLegacy, birthday, currentWeight,
    body.is_neutered ? 1 : 0,
    (typeof body.avatar_url === 'string' ? body.avatar_url.trim() : null) ?? null,
  ];

  if (hasGroomingCycleColumn) {
    insertColumns.push('grooming_cycle_id');
    insertValues.push(body.grooming_cycle_id ?? null);
  } else {
    await ensurePetItemRelationTable(env, 'pet_grooming_cycles', 'grooming_cycle_item_id');
  }
  if (hasColorIdsColumn) {
    insertColumns.push('color_ids');
    insertValues.push(JSON.stringify(parseIdArray(body.color_ids)));
  } else {
    await ensurePetItemRelationTable(env, 'pet_colors', 'color_item_id');
  }
  if (hasTemperamentIdsColumn) {
    insertColumns.push('temperament_ids');
    insertValues.push(JSON.stringify(parseIdArray(body.temperament_ids)));
  } else {
    await ensurePetItemRelationTable(env, 'pet_temperaments', 'temperament_item_id');
  }

  const placeholders = insertColumns.map(() => '?').join(', ');
  await env.DB.prepare(
    `INSERT INTO pets (${insertColumns.join(', ')}, status, created_at, updated_at)
     VALUES (${placeholders}, 'active', ?, ?)`
  ).bind(...insertValues, ts, ts).run();

  const diseaseHistoryIds = parseIdArray(body.disease_history_ids);
  await replaceDiseaseSelections(env, id, payload.sub, diseaseHistoryIds, typeof body.notes === 'string' ? body.notes.trim() : null);
  await replaceRelationRows(env, id, 'pet_allergies', 'id', 'allergy_item_id', parseIdArray(body.allergy_ids));
  await replaceRelationRows(env, id, 'pet_symptoms', 'id', 'symptom_item_id', parseIdArray(body.symptom_tag_ids));
  await replaceRelationRows(env, id, 'pet_vaccinations', 'id', 'vaccination_item_id', parseIdArray(body.vaccination_ids));
  if (!hasColorIdsColumn) {
    await replaceRelationRows(env, id, 'pet_colors', 'id', 'color_item_id', parseIdArray(body.color_ids));
  }
  if (!hasTemperamentIdsColumn) {
    await replaceRelationRows(env, id, 'pet_temperaments', 'id', 'temperament_item_id', parseIdArray(body.temperament_ids));
  }
  if (!hasGroomingCycleColumn) {
    const groomingCycleId = typeof body.grooming_cycle_id === 'string' ? body.grooming_cycle_id.trim() || null : null;
    await upsertSinglePetItemRelation(env, 'pet_grooming_cycles', 'grooming_cycle_item_id', id, groomingCycleId);
  }

  if (currentWeight !== null) {
    await env.DB.prepare(
      `INSERT INTO pet_weight_logs (
        id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      newId(), id, currentWeight, body.weight_unit_id ?? null,
      normalizeMeasuredAt(body.current_weight_measured_at), payload.sub,
      typeof body.current_weight_notes === 'string' ? body.current_weight_notes.trim() : 'Initial weight on pet registration',
      ts, ts,
    ).run();
  }

  const pet = await env.DB.prepare(`
    SELECT p.*,
           p.microchip_number AS microchip_no,
           p.birth_date AS birthday,
           p.weight_kg AS current_weight,
           p.health_level_id AS health_condition_level_id
    FROM pets p
    WHERE p.id = ?
  `).bind(id).first<Record<string, unknown>>();
  return created({ pet: await attachPetRelations(env, normalizePetRecord(pet!)) });
}

async function getPet(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    `SELECT p.*,
            p.microchip_number AS microchip_no,
            p.birth_date AS birthday,
            p.weight_kg AS current_weight,
            p.health_level_id AS health_condition_level_id
     FROM pets p
     WHERE p.id = ? AND p.guardian_user_id = ? AND p.status != 'deleted'`
  ).bind(petId, payload.sub).first<Record<string, unknown>>();
  if (!pet) return err('Pet not found', 404, 'not_found');
  return ok({ pet: await attachPetRelations(env, normalizePetRecord(pet)) });
}

async function updatePet(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT id FROM pets WHERE id = ? AND guardian_user_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first();
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const microchipNo = normalizeMicrochip(body.microchip_no);
  if (microchipNo) {
    const dup = await findMicrochipOwner(env, microchipNo, petId);
    if (dup) return err('이미 등록된 마이크로칩 번호입니다.', 409, 'microchip_duplicate');
  }

  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];
  const [hasGroomingCycleColumn, hasColorIdsColumn, hasTemperamentIdsColumn] = await Promise.all([
    hasColumn(env, 'pets', 'grooming_cycle_id'),
    hasColumn(env, 'pets', 'color_ids'),
    hasColumn(env, 'pets', 'temperament_ids'),
  ]);

  const scalarMap: Record<string, string> = {
    name: 'name', pet_type_id: 'pet_type_id', breed_id: 'breed_id', gender_id: 'gender_id',
    life_stage_id: 'life_stage_id', body_size_id: 'body_size_id', country_id: 'country_id',
    health_condition_level_id: 'health_level_id', activity_level_id: 'activity_level_id',
    diet_type_id: 'diet_type_id', coat_length_id: 'coat_length_id', coat_type_id: 'coat_type_id',
    avatar_url: 'avatar_url',
  };
  if (hasGroomingCycleColumn) scalarMap.grooming_cycle_id = 'grooming_cycle_id';

  for (const [inputKey, column] of Object.entries(scalarMap)) {
    if (Object.prototype.hasOwnProperty.call(body, inputKey)) {
      sets.push(`${column} = ?`);
      const value = body[inputKey];
      vals.push(typeof value === 'string' ? value.trim() || null : value ?? null);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'birthday') || Object.prototype.hasOwnProperty.call(body, 'birth_date')) {
    const birthday = (typeof body.birthday === 'string' && body.birthday.trim())
      ? body.birthday.trim()
      : (typeof body.birth_date === 'string' && body.birth_date.trim() ? body.birth_date.trim() : null);
    sets.push('birth_date = ?');
    vals.push(birthday);
  }

  const explicitWeight = Object.prototype.hasOwnProperty.call(body, 'current_weight')
    || Object.prototype.hasOwnProperty.call(body, 'weight_kg');
  const normalizedWeight = parseOptionalNumber(body.current_weight ?? body.weight_kg);
  if (explicitWeight) {
    sets.push('weight_kg = ?');
    vals.push(normalizedWeight);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'microchip_no')) {
    sets.push('microchip_number = ?');
    vals.push(microchipNo);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'is_neutered')) {
    sets.push('is_neutered = ?');
    vals.push(body.is_neutered ? 1 : 0);
  }
  if (hasColorIdsColumn && Object.prototype.hasOwnProperty.call(body, 'color_ids')) {
    sets.push('color_ids = ?');
    vals.push(JSON.stringify(parseIdArray(body.color_ids)));
  } else if (Object.prototype.hasOwnProperty.call(body, 'color_ids')) {
    await ensurePetItemRelationTable(env, 'pet_colors', 'color_item_id');
  }
  if (hasTemperamentIdsColumn && Object.prototype.hasOwnProperty.call(body, 'temperament_ids')) {
    sets.push('temperament_ids = ?');
    vals.push(JSON.stringify(parseIdArray(body.temperament_ids)));
  } else if (Object.prototype.hasOwnProperty.call(body, 'temperament_ids')) {
    await ensurePetItemRelationTable(env, 'pet_temperaments', 'temperament_item_id');
  }

  vals.push(petId);
  await env.DB.prepare(`UPDATE pets SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();

  if (Object.prototype.hasOwnProperty.call(body, 'disease_history_ids')) {
    await replaceDiseaseSelections(env, petId, payload.sub, parseIdArray(body.disease_history_ids), typeof body.notes === 'string' ? body.notes.trim() : null);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'allergy_ids')) {
    await replaceRelationRows(env, petId, 'pet_allergies', 'id', 'allergy_item_id', parseIdArray(body.allergy_ids));
  }
  if (Object.prototype.hasOwnProperty.call(body, 'symptom_tag_ids')) {
    await replaceRelationRows(env, petId, 'pet_symptoms', 'id', 'symptom_item_id', parseIdArray(body.symptom_tag_ids));
  }
  if (Object.prototype.hasOwnProperty.call(body, 'vaccination_ids')) {
    await replaceRelationRows(env, petId, 'pet_vaccinations', 'id', 'vaccination_item_id', parseIdArray(body.vaccination_ids));
  }
  if (!hasColorIdsColumn && Object.prototype.hasOwnProperty.call(body, 'color_ids')) {
    await replaceRelationRows(env, petId, 'pet_colors', 'id', 'color_item_id', parseIdArray(body.color_ids));
  }
  if (!hasTemperamentIdsColumn && Object.prototype.hasOwnProperty.call(body, 'temperament_ids')) {
    await replaceRelationRows(env, petId, 'pet_temperaments', 'id', 'temperament_item_id', parseIdArray(body.temperament_ids));
  }
  if (!hasGroomingCycleColumn && Object.prototype.hasOwnProperty.call(body, 'grooming_cycle_id')) {
    const groomingCycleId = typeof body.grooming_cycle_id === 'string' ? body.grooming_cycle_id.trim() || null : null;
    await upsertSinglePetItemRelation(env, 'pet_grooming_cycles', 'grooming_cycle_item_id', petId, groomingCycleId);
  }

  if (explicitWeight && normalizedWeight !== null) {
    await env.DB.prepare(
      `INSERT INTO pet_weight_logs (
        id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      newId(), petId, normalizedWeight, body.weight_unit_id ?? null,
      normalizeMeasuredAt(body.current_weight_measured_at), payload.sub,
      typeof body.current_weight_notes === 'string' ? body.current_weight_notes.trim() : 'Weight updated from pet profile',
      now(), now(),
    ).run();
    await syncPetCurrentWeightFromLogs(env, petId);
  }

  return getPet(env, payload, petId);
}

async function deletePet(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT id FROM pets WHERE id = ? AND guardian_user_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first();
  if (!pet) return err('Pet not found', 404, 'not_found');

  await env.DB.prepare(
    "UPDATE pets SET status = 'deleted', updated_at = ? WHERE id = ?"
  ).bind(now(), petId).run();
  return ok({ deleted: true });
}

// ─── util: attach relations ───────────────────────────────────────────────────

async function attachPetRelations(env: Env, pet: Record<string, unknown>) {
  const petId = String(pet.id);
  let diseases: Record<string, unknown>[] = [];
  let diseaseIds: string[] = [];

  if (await hasTable(env, 'pet_disease_histories')) {
    const rows = await env.DB.prepare(
      `SELECT
         h.id,
         h.disease_group_item_id,
         h.disease_item_id AS disease_id,
         h.diagnosed_at,
         h.notes,
         h.is_active,
         d.code AS disease_key
       FROM pet_disease_histories h
       LEFT JOIN master_items d ON d.id = h.disease_item_id
       WHERE h.pet_id = ?
       ORDER BY h.is_active DESC, h.created_at DESC`
    ).bind(petId).all<Record<string, unknown>>();
    diseases = rows.results;
    diseaseIds = rows.results
      .map((row) => String(row.disease_id || row.disease_item_id || ''))
      .filter(Boolean);
  } else {
    const rows = await env.DB.prepare(
      `SELECT hr.id, hr.disease_id, hr.recorded_at AS diagnosed_at, hr.description AS notes, 1 AS is_active,
              mi.code AS disease_key
       FROM health_records hr
       LEFT JOIN master_items mi ON mi.id = hr.disease_id
       WHERE hr.pet_id = ? AND hr.record_type = 'disease'
       ORDER BY hr.recorded_at ASC, hr.id ASC`
    ).bind(petId).all<Record<string, unknown>>();
    diseases = rows.results;
    diseaseIds = rows.results.map((row) => String(row.disease_id || '')).filter(Boolean);
  }

  const allergyIds = await selectRelationIds(env, petId, 'pet_allergies', 'allergy_item_id');
  const symptomIds = await selectRelationIds(env, petId, 'pet_symptoms', 'symptom_item_id');
  const vaccinationIds = await selectRelationIds(env, petId, 'pet_vaccinations', 'vaccination_item_id');
  const colorIdsFallback = await selectRelationIds(env, petId, 'pet_colors', 'color_item_id');
  const temperamentIdsFallback = await selectRelationIds(env, petId, 'pet_temperaments', 'temperament_item_id');
  const groomingCycleFallback = await selectRelationIds(env, petId, 'pet_grooming_cycles', 'grooming_cycle_item_id');

  const out: Record<string, unknown> = { ...pet };
  out.diseases = diseases;
  out.disease_history_ids = diseaseIds;
  out.allergy_ids = allergyIds.length > 0 ? allergyIds : parseJsonArrayString(pet.allergy_ids);
  out.symptom_tag_ids = symptomIds.length > 0 ? symptomIds : parseJsonArrayString(pet.symptom_tag_ids);
  out.vaccination_ids = vaccinationIds.length > 0 ? vaccinationIds : parseJsonArrayString(pet.vaccination_ids);
  out.color_ids = colorIdsFallback.length > 0 ? colorIdsFallback : parseJsonArrayString(pet.color_ids);
  out.temperament_ids = temperamentIdsFallback.length > 0 ? temperamentIdsFallback : parseJsonArrayString(pet.temperament_ids);
  out.grooming_cycle_id = groomingCycleFallback[0] || (pet.grooming_cycle_id as string | null) || null;

  if (!(await hasColumn(env, 'pets', 'medication_status_id'))) out.medication_status_id = null;
  if (!(await hasColumn(env, 'pets', 'living_style_id'))) out.living_style_id = null;

  return out;
}

// Re-export helpers used by sub-modules (for potential external use)
export { ARRAY_COLUMNS, assertPetOwner };
