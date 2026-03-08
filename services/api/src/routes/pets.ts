// S6: 펫 + 펫 질병 API — LLD §5.4
// GET    /api/v1/pets                         내 펫 목록 (질병 포함)
// POST   /api/v1/pets                         펫 등록
// GET    /api/v1/pets/:id                     펫 상세
// PUT    /api/v1/pets/:id                     펫 수정
// DELETE /api/v1/pets/:id                     펫 삭제 (soft delete)
// GET    /api/v1/pets/check-microchip         마이크로칩 중복 확인
// POST   /api/v1/pets/:id/diseases            질병 연결
// DELETE /api/v1/pets/:id/diseases/:diseaseId 질병 연결 해제

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';

const ARRAY_COLUMNS = [
  'color_ids',
  'allergy_ids',
  'disease_history_ids',
  'symptom_tag_ids',
  'vaccination_ids',
  'temperament_ids',
] as const;

function parseIdArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean);
}

function normalizeMicrochip(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseJsonArrayString(value: unknown): string[] {
  if (Array.isArray(value)) return parseIdArray(value);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return parseIdArray(parsed);
  } catch {
    return [];
  }
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

function normalizeMeasuredAt(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return now();
}

function rangeStartByKey(range: string): string | null {
  const current = new Date();
  if (range === '7d') current.setDate(current.getDate() - 7);
  else if (range === '15d') current.setDate(current.getDate() - 15);
  else if (range === '1w') current.setDate(current.getDate() - 7);
  else if (range === '1m') current.setMonth(current.getMonth() - 1);
  else if (range === '3m') current.setMonth(current.getMonth() - 3);
  else if (range === '6m') current.setMonth(current.getMonth() - 6);
  else if (range === '1y') current.setFullYear(current.getFullYear() - 1);
  else return null;
  return current.toISOString();
}

async function hasTable(env: Env, table: string): Promise<boolean> {
  const row = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1"
  ).bind(table).first<{ name: string }>();
  return Boolean(row?.name);
}

async function hasColumn(env: Env, table: string, column: string): Promise<boolean> {
  const rows = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  return rows.results.some((r) => r.name === column);
}

async function replaceRelationRows(
  env: Env,
  petId: string,
  table: string,
  idColumn: string,
  itemColumn: string,
  itemIds: string[],
): Promise<void> {
  if (!(await hasTable(env, table))) return;
  await env.DB.prepare(`DELETE FROM ${table} WHERE pet_id = ?`).bind(petId).run();
  for (const itemId of itemIds) {
    await env.DB.prepare(
      `INSERT INTO ${table} (${idColumn}, pet_id, ${itemColumn}, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(newId(), petId, itemId, now(), now()).run();
  }
}

async function ensurePetItemRelationTable(env: Env, table: string, itemColumn: string): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ${table} (
      id TEXT PRIMARY KEY,
      pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      ${itemColumn} TEXT NOT NULL REFERENCES master_items(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(pet_id, ${itemColumn})
    )`
  ).run();
}

async function replaceDiseaseSelections(
  env: Env,
  petId: string,
  userId: string,
  diseaseIds: string[],
  note?: string | null,
): Promise<void> {
  if (await hasTable(env, 'pet_disease_histories')) {
    await env.DB.prepare(`DELETE FROM pet_disease_histories WHERE pet_id = ?`).bind(petId).run();
    for (const diseaseItemId of diseaseIds) {
      const parent = await env.DB.prepare(
        `SELECT parent_item_id FROM master_items WHERE id = ?`
      ).bind(diseaseItemId).first<{ parent_item_id: string | null }>();
      await env.DB.prepare(
        `INSERT INTO pet_disease_histories (
          id, pet_id, disease_group_item_id, disease_item_id, diagnosed_at, notes, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
      ).bind(
        newId(),
        petId,
        parent?.parent_item_id ?? null,
        diseaseItemId,
        now(),
        note ?? null,
        now(),
        now(),
      ).run();
    }
    return;
  }
  await replaceDiseaseHistory(env, petId, userId, diseaseIds, note);
}

async function selectRelationIds(env: Env, petId: string, table: string, itemColumn: string): Promise<string[]> {
  if (!(await hasTable(env, table))) return [];
  const rows = await env.DB.prepare(
    `SELECT ${itemColumn} AS item_id FROM ${table} WHERE pet_id = ? ORDER BY datetime(created_at) ASC, ${itemColumn} ASC`
  ).bind(petId).all<{ item_id: string }>();
  return rows.results.map((r) => r.item_id).filter(Boolean);
}

async function resolveMasterItemId(env: Env, categoryCode: string, itemCode: string): Promise<string | null> {
  const row = await env.DB.prepare(
    `SELECT mi.id
     FROM master_items mi
     JOIN master_categories mc ON mc.id = mi.category_id
     WHERE mc.code = ?
       AND mi.code = ?
       AND mc.status = 'active'
       AND mi.status = 'active'
     LIMIT 1`
  ).bind(categoryCode, itemCode).first<{ id: string }>();
  return row?.id ?? null;
}

async function findMicrochipOwner(env: Env, microchipNo: string, excludePetId?: string) {
  const baseQuery = "SELECT id, guardian_user_id AS guardian_id FROM pets WHERE microchip_number = ? AND status != 'deleted'";
  if (excludePetId) {
    return env.DB.prepare(`${baseQuery} AND id != ? LIMIT 1`).bind(microchipNo, excludePetId).first<{ id: string; guardian_id: string }>();
  }
  return env.DB.prepare(`${baseQuery} LIMIT 1`).bind(microchipNo).first<{ id: string; guardian_id: string }>();
}

function normalizePetRecord(pet: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...pet };
  for (const col of ARRAY_COLUMNS) {
    out[col] = parseJsonArrayString(pet[col]);
  }
  out.microchip_no = (pet.microchip_no as string | null) || (pet.microchip_number as string | null) || null;
  out.health_condition_level_id = pet.health_condition_level_id ?? pet.health_level_id ?? null;
  out.birthday = (pet.birthday as string | null) || (pet.birth_date as string | null) || null;
  out.current_weight = pet.current_weight ?? pet.weight_kg ?? null;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

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

  // /pets/:id/guardian-devices (delegated to devices route)
  if (sub.includes('/guardian-devices')) {
    const { handleDevices } = await import('./devices');
    return handleDevices(request, env, url);
  }

  // /pets/:id/logs (delegated to logs route)
  if (sub.includes('/logs')) {
    const { handleLogs } = await import('./logs');
    return handleLogs(request, env, url);
  }

  return err('Not found', 404);
}

// ─── GET /pets/check-microchip ───────────────────────────────────────────────

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

async function assertPetOwner(env: Env, payload: JwtPayload, petId: string) {
  return env.DB.prepare(
    "SELECT id, guardian_user_id AS guardian_id, NULL AS weight_unit_id FROM pets WHERE id = ? AND guardian_user_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first<{ id: string; guardian_id: string; weight_unit_id: string | null }>();
}

async function syncPetCurrentWeightFromLogs(env: Env, petId: string): Promise<void> {
  const latest = await env.DB.prepare(
    `SELECT weight_value, weight_unit_id
     FROM pet_weight_logs
     WHERE pet_id = ?
     ORDER BY datetime(measured_at) DESC, datetime(created_at) DESC, id DESC
     LIMIT 1`
  ).bind(petId).first<{ weight_value: number; weight_unit_id: string | null }>();

  await env.DB.prepare(
    `UPDATE pets
     SET weight_kg = ?, updated_at = ?
     WHERE id = ?`
  ).bind(
    latest?.weight_value ?? null,
    now(),
    petId,
  ).run();
}

async function replaceDiseaseHistory(env: Env, petId: string, userId: string, diseaseIds: string[], note?: string | null): Promise<void> {
  await env.DB.prepare(
    `DELETE FROM health_records
     WHERE pet_id = ? AND record_type = 'disease'`
  ).bind(petId).run();

  for (const diseaseId of diseaseIds) {
    await env.DB.prepare(
      `INSERT INTO health_records (
        id, pet_id, record_type, disease_id, description, recorded_at, created_by_user_id, created_at
      ) VALUES (?, ?, 'disease', ?, ?, ?, ?, ?)`
    ).bind(
      newId(),
      petId,
      diseaseId,
      note ?? null,
      now(),
      userId,
      now(),
    ).run();
  }
}

// ─── GET /pets ────────────────────────────────────────────────────────────────

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

// ─── POST /pets ───────────────────────────────────────────────────────────────

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
    'id',
    'guardian_user_id',
    'name',
    'microchip_number',
    'pet_type_id',
    'breed_id',
    'gender_id',
    'life_stage_id',
    'body_size_id',
    'country_id',
    'diet_type_id',
    'coat_length_id',
    'coat_type_id',
    'activity_level_id',
    'health_level_id',
    'gender_legacy',
    'species_legacy',
    'birth_date',
    'weight_kg',
    'is_neutered',
    'avatar_url',
  ];
  const insertValues: unknown[] = [
    id,
    payload.sub,
    String(body.name).trim(),
    microchipNo,
    body.pet_type_id,
    body.breed_id ?? null,
    body.gender_id ?? null,
    body.life_stage_id ?? null,
    body.body_size_id ?? null,
    body.country_id ?? null,
    body.diet_type_id ?? null,
    body.coat_length_id ?? null,
    body.coat_type_id ?? null,
    body.activity_level_id ?? null,
    body.health_condition_level_id ?? null,
    genderLegacy,
    speciesLegacy,
    birthday,
    currentWeight,
    body.is_neutered ? 1 : 0,
    (typeof body.avatar_url === 'string' ? body.avatar_url.trim() : null) ?? null,
  ];

  if (hasGroomingCycleColumn) {
    insertColumns.push('grooming_cycle_id');
    insertValues.push(body.grooming_cycle_id ?? null);
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
  await replaceDiseaseSelections(
    env,
    id,
    payload.sub,
    diseaseHistoryIds,
    typeof body.notes === 'string' ? body.notes.trim() : null,
  );
  await replaceRelationRows(env, id, 'pet_allergies', 'id', 'allergy_item_id', parseIdArray(body.allergy_ids));
  await replaceRelationRows(env, id, 'pet_symptoms', 'id', 'symptom_item_id', parseIdArray(body.symptom_tag_ids));
  await replaceRelationRows(env, id, 'pet_vaccinations', 'id', 'vaccination_item_id', parseIdArray(body.vaccination_ids));
  if (!hasColorIdsColumn) {
    await replaceRelationRows(env, id, 'pet_colors', 'id', 'color_item_id', parseIdArray(body.color_ids));
  }
  if (!hasTemperamentIdsColumn) {
    await replaceRelationRows(env, id, 'pet_temperaments', 'id', 'temperament_item_id', parseIdArray(body.temperament_ids));
  }

  if (currentWeight !== null) {
    await env.DB.prepare(
      `INSERT INTO pet_weight_logs (
        id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      newId(),
      id,
      currentWeight,
      body.weight_unit_id ?? null,
      normalizeMeasuredAt(body.current_weight_measured_at),
      payload.sub,
      typeof body.current_weight_notes === 'string' ? body.current_weight_notes.trim() : 'Initial weight on pet registration',
      ts,
      ts,
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

// ─── GET /pets/:id ────────────────────────────────────────────────────────────

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

// ─── PUT /pets/:id ────────────────────────────────────────────────────────────

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
    name: 'name',
    pet_type_id: 'pet_type_id',
    breed_id: 'breed_id',
    gender_id: 'gender_id',
    life_stage_id: 'life_stage_id',
    body_size_id: 'body_size_id',
    country_id: 'country_id',
    health_condition_level_id: 'health_level_id',
    activity_level_id: 'activity_level_id',
    diet_type_id: 'diet_type_id',
    coat_length_id: 'coat_length_id',
    coat_type_id: 'coat_type_id',
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
    await replaceDiseaseSelections(
      env,
      petId,
      payload.sub,
      parseIdArray(body.disease_history_ids),
      typeof body.notes === 'string' ? body.notes.trim() : null,
    );
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

  if (explicitWeight && normalizedWeight !== null) {
    await env.DB.prepare(
      `INSERT INTO pet_weight_logs (
        id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      newId(),
      petId,
      normalizedWeight,
      body.weight_unit_id ?? null,
      normalizeMeasuredAt(body.current_weight_measured_at),
      payload.sub,
      typeof body.current_weight_notes === 'string' ? body.current_weight_notes.trim() : 'Weight updated from pet profile',
      now(),
      now(),
    ).run();
    await syncPetCurrentWeightFromLogs(env, petId);
  }

  return getPet(env, payload, petId);
}

// ─── DELETE /pets/:id (soft delete) ──────────────────────────────────────────

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

// ─── GET /pets/:id/weight-logs ───────────────────────────────────────────────

async function listWeightLogs(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  const range = (url.searchParams.get('range') || 'all').trim();
  const start = rangeStartByKey(range);

  const where = ['pet_id = ?'];
  const vals: Array<string | number> = [petId];
  if (start) {
    where.push('datetime(measured_at) >= datetime(?)');
    vals.push(start);
  }

  const rows = await env.DB.prepare(
    `SELECT id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
     FROM pet_weight_logs
     WHERE ${where.join(' AND ')}
     ORDER BY datetime(measured_at) DESC, datetime(created_at) DESC, id DESC`
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

// ─── POST /pets/:id/weight-logs ──────────────────────────────────────────────

async function createWeightLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
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

// ─── PUT /pets/:id/weight-logs/:logId ───────────────────────────────────────

async function updateWeightLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
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

// ─── DELETE /pets/:id/weight-logs/:logId ────────────────────────────────────

async function deleteWeightLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  await env.DB.prepare('DELETE FROM pet_weight_logs WHERE id = ? AND pet_id = ?').bind(logId, petId).run();
  await syncPetCurrentWeightFromLogs(env, petId);
  return ok({ deleted: true, id: logId });
}

// ─── Disease history APIs ─────────────────────────────────────────────────────

async function listDiseases(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  const useHistoryTable = await hasTable(env, 'pet_disease_histories');
  if (useHistoryTable) {
    const rows = await env.DB.prepare(
      `SELECT
         h.*,
         d.code AS disease_key,
         g.code AS disease_group_key
       FROM pet_disease_histories h
       LEFT JOIN master_items d ON d.id = h.disease_item_id
       LEFT JOIN master_items g ON g.id = h.disease_group_item_id
       WHERE h.pet_id = ?
       ORDER BY h.is_active DESC, datetime(h.created_at) DESC`
    ).bind(petId).all<Record<string, unknown>>();
    return ok({ diseases: rows.results });
  }

  const rows = await env.DB.prepare(
    `SELECT hr.id, hr.disease_id AS disease_item_id, hr.recorded_at AS diagnosed_at, hr.description AS notes, 1 AS is_active
     FROM health_records hr
     WHERE hr.pet_id = ? AND hr.record_type = 'disease'
     ORDER BY datetime(hr.recorded_at) DESC`
  ).bind(petId).all<Record<string, unknown>>();
  return ok({ diseases: rows.results });
}

async function addDisease(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: { disease_group_item_id?: string; disease_item_id?: string; disease_id?: string; diagnosed_at?: string; notes?: string; is_active?: boolean };
  try {
    body = await request.json() as typeof body;
  } catch {
    return err('Invalid JSON body');
  }

  const diseaseItemId = (body.disease_item_id || body.disease_id || '').trim();
  if (!diseaseItemId) return err('disease_item_id required');
  const diagnosedAt = body.diagnosed_at ? normalizeMeasuredAt(body.diagnosed_at) : now();
  const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  const isActive = body.is_active === false ? 0 : 1;
  const useHistoryTable = await hasTable(env, 'pet_disease_histories');

  if (useHistoryTable) {
    let groupId = (body.disease_group_item_id || '').trim();
    if (!groupId) {
      const parent = await env.DB.prepare(
        `SELECT parent_item_id FROM master_items WHERE id = ?`
      ).bind(diseaseItemId).first<{ parent_item_id: string | null }>();
      groupId = parent?.parent_item_id ?? '';
    }
    const historyId = newId();
    await env.DB.prepare(
      `INSERT INTO pet_disease_histories (
        id, pet_id, disease_group_item_id, disease_item_id, diagnosed_at, notes, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      historyId,
      petId,
      groupId || null,
      diseaseItemId,
      diagnosedAt,
      notes,
      isActive,
      now(),
      now(),
    ).run();
    return created({ history_id: historyId });
  }

  await env.DB.prepare(
    `INSERT INTO health_records (id, pet_id, record_type, disease_id, description, recorded_at, created_by_user_id, created_at)
     VALUES (?, ?, 'disease', ?, ?, ?, ?, ?)`
  ).bind(newId(), petId, diseaseItemId, notes, diagnosedAt, payload.sub, now()).run();
  return created({ created: true });
}

async function updateDisease(request: Request, env: Env, payload: JwtPayload, petId: string, historyId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_disease_histories'))) return err('not supported', 400);

  let body: { disease_group_item_id?: string | null; disease_item_id?: string; diagnosed_at?: string | null; notes?: string | null; is_active?: boolean };
  try {
    body = await request.json() as typeof body;
  } catch {
    return err('Invalid JSON body');
  }

  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];
  if (Object.prototype.hasOwnProperty.call(body, 'disease_group_item_id')) { sets.push('disease_group_item_id = ?'); vals.push(body.disease_group_item_id ?? null); }
  if (Object.prototype.hasOwnProperty.call(body, 'disease_item_id')) { sets.push('disease_item_id = ?'); vals.push(body.disease_item_id ?? null); }
  if (Object.prototype.hasOwnProperty.call(body, 'diagnosed_at')) { sets.push('diagnosed_at = ?'); vals.push(body.diagnosed_at ? normalizeMeasuredAt(body.diagnosed_at) : null); }
  if (Object.prototype.hasOwnProperty.call(body, 'notes')) { sets.push('notes = ?'); vals.push(body.notes ?? null); }
  if (Object.prototype.hasOwnProperty.call(body, 'is_active')) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
  vals.push(historyId, petId);
  await env.DB.prepare(`UPDATE pet_disease_histories SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`).bind(...vals).run();
  return ok({ updated: true, history_id: historyId });
}

async function removeDisease(env: Env, payload: JwtPayload, petId: string, historyId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (await hasTable(env, 'pet_disease_histories')) {
    await env.DB.prepare(`DELETE FROM pet_disease_histories WHERE id = ? AND pet_id = ?`).bind(historyId, petId).run();
    return ok({ deleted: true, history_id: historyId });
  }
  await env.DB.prepare(
    "DELETE FROM health_records WHERE pet_id = ? AND record_type = 'disease' AND disease_id = ?"
  ).bind(petId, historyId).run();
  return ok({ deleted: true, disease_id: historyId });
}

// ─── Disease devices APIs ─────────────────────────────────────────────────────

async function listDiseaseDevices(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_disease_devices'))) return ok({ devices: [] });
  const rows = await env.DB.prepare(
    `SELECT d.*, mi.code AS device_key
     FROM pet_disease_devices d
     LEFT JOIN master_items mi ON mi.id = d.device_item_id
     WHERE d.pet_id = ?
     ORDER BY d.is_active DESC, datetime(d.created_at) DESC`
  ).bind(petId).all<Record<string, unknown>>();
  return ok({ devices: rows.results });
}

async function createDiseaseDevice(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_disease_devices'))) return err('not supported', 400);
  let body: { disease_item_id?: string; device_item_id?: string; serial_number?: string; nickname?: string; notes?: string };
  try { body = await request.json() as typeof body; } catch { return err('Invalid JSON body'); }
  const diseaseItemId = (body.disease_item_id || '').trim();
  const deviceItemId = (body.device_item_id || '').trim();
  if (!diseaseItemId) return err('disease_item_id required');
  if (!deviceItemId) return err('device_item_id required');
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO pet_disease_devices (
      id, pet_id, disease_item_id, device_item_id, serial_number, nickname, notes, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(
    id,
    petId,
    diseaseItemId,
    deviceItemId,
    body.serial_number ?? null,
    body.nickname ?? null,
    body.notes ?? null,
    now(),
    now(),
  ).run();
  return created({ id });
}

// ─── Glucose logs APIs ────────────────────────────────────────────────────────

async function resolveGlucoseJudgement(
  env: Env,
  petId: string,
  diseaseItemId: string,
  value: number,
  unitItemId: string,
  contextItemId: string | null,
): Promise<{ level: string | null; label: string | null }> {
  if (!(await hasTable(env, 'disease_judgement_rules'))) return { level: null, label: null };
  const measurementItemId = await resolveMasterItemId(env, 'disease_measurement_type', 'glucose_value');
  if (!measurementItemId) return { level: null, label: null };
  const pet = await env.DB.prepare(`SELECT pet_type_id FROM pets WHERE id = ?`).bind(petId).first<{ pet_type_id: string | null }>();
  const rows = await env.DB.prepare(
    `SELECT judgement_level, judgement_label
     FROM disease_judgement_rules
     WHERE disease_item_id = ?
       AND measurement_item_id = ?
       AND unit_item_id = ?
       AND status = 'active'
       AND (? IS NULL OR context_item_id = ? OR context_item_id IS NULL)
       AND (species_item_id IS NULL OR species_item_id = ?)
       AND (min_value IS NULL OR ? >= min_value)
       AND (max_value IS NULL OR ? <= max_value)
     ORDER BY
       CASE WHEN context_item_id = ? THEN 0 WHEN context_item_id IS NULL THEN 1 ELSE 2 END,
       CASE WHEN species_item_id = ? THEN 0 WHEN species_item_id IS NULL THEN 1 ELSE 2 END,
       sort_order ASC
     LIMIT 1`
  ).bind(
    diseaseItemId,
    measurementItemId,
    unitItemId,
    contextItemId,
    contextItemId,
    pet?.pet_type_id ?? null,
    value,
    value,
    contextItemId,
    pet?.pet_type_id ?? null,
  ).first<{ judgement_level: string; judgement_label: string | null }>();
  return { level: rows?.judgement_level ?? null, label: rows?.judgement_label ?? null };
}

async function listGlucoseLogs(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_glucose_logs'))) return ok({ logs: [], summary: null, range: 'all' });
  const range = (url.searchParams.get('range') || 'all').trim();
  const start = rangeStartByKey(range === '1w' ? '1m' : range);
  const where = ['pet_id = ?'];
  const vals: Array<string | number> = [petId];
  if (start) { where.push('datetime(measured_at) >= datetime(?)'); vals.push(start); }
  const rows = await env.DB.prepare(
    `SELECT * FROM pet_glucose_logs
     WHERE ${where.join(' AND ')}
     ORDER BY datetime(measured_at) DESC, datetime(created_at) DESC`
  ).bind(...vals).all<Record<string, unknown>>();
  const latest = rows.results[0] || null;
  return ok({
    logs: rows.results,
    range,
    summary: latest ? {
      latest_value: latest.glucose_value ?? null,
      latest_measured_at: latest.measured_at ?? null,
      latest_judgement_level: latest.judgement_level ?? null,
      latest_judgement_label: latest.judgement_label ?? null,
    } : null,
  });
}

async function createGlucoseLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_glucose_logs'))) return err('not supported', 400);
  let body: {
    disease_item_id?: string;
    device_item_id?: string | null;
    glucose_value?: number;
    glucose_unit_item_id?: string;
    measured_at?: string;
    measured_context_item_id?: string | null;
    notes?: string | null;
  };
  try { body = await request.json() as typeof body; } catch { return err('Invalid JSON body'); }
  const defaultDiseaseId = await resolveMasterItemId(env, 'disease_type', 'diabetes');
  const diseaseItemId = (body.disease_item_id || '').trim() || defaultDiseaseId || '';
  if (!diseaseItemId) return err('disease_item_id required');
  const value = parseOptionalNumber(body.glucose_value);
  if (value === null) return err('glucose_value required');
  const defaultUnitId = await resolveMasterItemId(env, 'weight_unit', 'mg_dl');
  const unitId = (body.glucose_unit_item_id || '').trim() || defaultUnitId || '';
  if (!unitId) return err('glucose_unit_item_id required');
  const contextId = body.measured_context_item_id ? String(body.measured_context_item_id).trim() : null;
  const judgement = await resolveGlucoseJudgement(env, petId, diseaseItemId, value, unitId, contextId);
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO pet_glucose_logs (
      id, pet_id, disease_item_id, device_item_id, glucose_value, glucose_unit_item_id,
      measured_at, measured_context_item_id, notes, recorded_by_user_id,
      judgement_level, judgement_label, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    petId,
    diseaseItemId,
    body.device_item_id ?? null,
    value,
    unitId,
    normalizeMeasuredAt(body.measured_at),
    contextId,
    body.notes ?? null,
    payload.sub,
    judgement.level,
    judgement.label,
    now(),
    now(),
  ).run();
  return created({ id, judgement });
}

async function updateGlucoseLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_glucose_logs'))) return err('not supported', 400);
  const existing = await env.DB.prepare(`SELECT * FROM pet_glucose_logs WHERE id = ? AND pet_id = ?`).bind(logId, petId).first<Record<string, unknown>>();
  if (!existing) return err('Glucose log not found', 404, 'not_found');
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON body'); }
  const value = Object.prototype.hasOwnProperty.call(body, 'glucose_value')
    ? parseOptionalNumber(body.glucose_value)
    : parseOptionalNumber(existing.glucose_value);
  if (value === null) return err('invalid glucose_value');
  const defaultDiseaseId = await resolveMasterItemId(env, 'disease_type', 'diabetes');
  const defaultUnitId = await resolveMasterItemId(env, 'weight_unit', 'mg_dl');
  const diseaseItemId = String(body.disease_item_id ?? existing.disease_item_id ?? defaultDiseaseId ?? '');
  const unitId = String(body.glucose_unit_item_id ?? existing.glucose_unit_item_id ?? defaultUnitId ?? '');
  if (!diseaseItemId) return err('disease_item_id required');
  if (!unitId) return err('glucose_unit_item_id required');
  const contextId = (body.measured_context_item_id ?? existing.measured_context_item_id ?? null) as string | null;
  const judgement = await resolveGlucoseJudgement(env, petId, diseaseItemId, value, unitId, contextId);
  await env.DB.prepare(
    `UPDATE pet_glucose_logs
     SET disease_item_id = ?, device_item_id = ?, glucose_value = ?, glucose_unit_item_id = ?,
         measured_at = ?, measured_context_item_id = ?, notes = ?,
         judgement_level = ?, judgement_label = ?, updated_at = ?
     WHERE id = ? AND pet_id = ?`
  ).bind(
    diseaseItemId,
    body.device_item_id ?? existing.device_item_id ?? null,
    value,
    unitId,
    normalizeMeasuredAt(body.measured_at ?? existing.measured_at),
    contextId,
    body.notes ?? existing.notes ?? null,
    judgement.level,
    judgement.label,
    now(),
    logId,
    petId,
  ).run();
  return ok({ updated: true, id: logId, judgement });
}

async function deleteGlucoseLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  await env.DB.prepare(`DELETE FROM pet_glucose_logs WHERE id = ? AND pet_id = ?`).bind(logId, petId).run();
  return ok({ deleted: true, id: logId });
}

// ─── Generic health measurement logs APIs ───────────────────────────────────

async function resolveMeasurementJudgement(
  env: Env,
  petId: string,
  diseaseItemId: string,
  measurementItemId: string,
  value: number,
  unitItemId: string | null,
  contextItemId: string | null,
): Promise<{ level: string | null; label: string | null }> {
  if (!(await hasTable(env, 'disease_judgement_rules')) || !unitItemId) return { level: null, label: null };
  const pet = await env.DB.prepare(`SELECT pet_type_id FROM pets WHERE id = ?`).bind(petId).first<{ pet_type_id: string | null }>();
  const row = await env.DB.prepare(
    `SELECT judgement_level, judgement_label
     FROM disease_judgement_rules
     WHERE disease_item_id = ?
       AND measurement_item_id = ?
       AND unit_item_id = ?
       AND status = 'active'
       AND (? IS NULL OR context_item_id = ? OR context_item_id IS NULL)
       AND (species_item_id IS NULL OR species_item_id = ?)
       AND (min_value IS NULL OR ? >= min_value)
       AND (max_value IS NULL OR ? <= max_value)
     ORDER BY
       CASE WHEN context_item_id = ? THEN 0 WHEN context_item_id IS NULL THEN 1 ELSE 2 END,
       CASE WHEN species_item_id = ? THEN 0 WHEN species_item_id IS NULL THEN 1 ELSE 2 END,
       sort_order ASC
     LIMIT 1`
  ).bind(
    diseaseItemId,
    measurementItemId,
    unitItemId,
    contextItemId,
    contextItemId,
    pet?.pet_type_id ?? null,
    value,
    value,
    contextItemId,
    pet?.pet_type_id ?? null,
  ).first<{ judgement_level: string; judgement_label: string | null }>();
  return { level: row?.judgement_level ?? null, label: row?.judgement_label ?? null };
}

async function listHealthMeasurementLogs(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return ok({ logs: [], range: 'all', summary: null });

  const range = (url.searchParams.get('range') || '1m').trim();
  const start = rangeStartByKey(range);
  const where = ['pet_id = ?'];
  const vals: Array<string | number> = [petId];
  if (start) {
    where.push('datetime(measured_at) >= datetime(?)');
    vals.push(start);
  }
  const rows = await env.DB.prepare(
    `SELECT *
     FROM pet_health_measurement_logs
     WHERE ${where.join(' AND ')}
     ORDER BY datetime(measured_at) DESC, datetime(created_at) DESC, id DESC`
  ).bind(...vals).all<Record<string, unknown>>();

  const latest = rows.results[0] || null;
  return ok({
    logs: rows.results,
    range,
    summary: latest ? {
      latest_value: latest.value ?? null,
      latest_measured_at: latest.measured_at ?? null,
      latest_judgement_level: latest.judgement_level ?? null,
      latest_judgement_label: latest.judgement_label ?? null,
      latest_measurement_item_id: latest.measurement_item_id ?? null,
    } : null,
  });
}

async function createHealthMeasurementLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return err('not supported', 400);

  let body: {
    disease_item_id?: string;
    device_type_item_id?: string | null;
    device_model_id?: string | null;
    measurement_item_id?: string;
    measurement_context_id?: string | null;
    value?: number;
    unit_item_id?: string | null;
    measured_at?: string;
    memo?: string | null;
  };
  try { body = await request.json() as typeof body; } catch { return err('Invalid JSON body'); }

  const diseaseItemId = (body.disease_item_id || '').trim();
  const measurementItemId = (body.measurement_item_id || '').trim();
  const value = parseOptionalNumber(body.value);
  if (!diseaseItemId) return err('disease_item_id required');
  if (!measurementItemId) return err('measurement_item_id required');
  if (value === null) return err('value required');

  const contextId = body.measurement_context_id ? String(body.measurement_context_id).trim() : null;
  const unitItemId = body.unit_item_id ? String(body.unit_item_id).trim() : null;
  const deviceTypeItemId = body.device_type_item_id ? String(body.device_type_item_id).trim() : null;
  const judgement = await resolveMeasurementJudgement(env, petId, diseaseItemId, measurementItemId, value, unitItemId, contextId);

  if (deviceTypeItemId && (await hasTable(env, 'pet_disease_devices'))) {
    const existingDevice = await env.DB.prepare(
      `SELECT id
       FROM pet_disease_devices
       WHERE pet_id = ? AND disease_item_id = ? AND device_item_id = ?
       LIMIT 1`
    ).bind(petId, diseaseItemId, deviceTypeItemId).first<{ id: string }>();
    if (!existingDevice) {
      await env.DB.prepare(
        `INSERT INTO pet_disease_devices (
          id, pet_id, disease_item_id, device_item_id, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 1, ?, ?)`
      ).bind(newId(), petId, diseaseItemId, deviceTypeItemId, now(), now()).run();
    }
  }

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO pet_health_measurement_logs (
      id, pet_id, disease_item_id, device_type_item_id, device_model_id,
      measurement_item_id, measurement_context_id, value, unit_item_id,
      measured_at, memo, recorded_by_user_id, judgement_level, judgement_label, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    petId,
    diseaseItemId,
    deviceTypeItemId,
    body.device_model_id ?? null,
    measurementItemId,
    contextId,
    value,
    unitItemId,
    normalizeMeasuredAt(body.measured_at),
    body.memo ?? null,
    payload.sub,
    judgement.level,
    judgement.label,
    now(),
    now(),
  ).run();
  return created({ id, judgement });
}

async function updateHealthMeasurementLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return err('not supported', 400);
  const existing = await env.DB.prepare(
    `SELECT * FROM pet_health_measurement_logs WHERE id = ? AND pet_id = ?`
  ).bind(logId, petId).first<Record<string, unknown>>();
  if (!existing) return err('Health measurement log not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON body'); }

  const diseaseItemId = String(body.disease_item_id ?? existing.disease_item_id ?? '');
  const measurementItemId = String(body.measurement_item_id ?? existing.measurement_item_id ?? '');
  const value = Object.prototype.hasOwnProperty.call(body, 'value')
    ? parseOptionalNumber(body.value)
    : parseOptionalNumber(existing.value);
  if (!diseaseItemId) return err('disease_item_id required');
  if (!measurementItemId) return err('measurement_item_id required');
  if (value === null) return err('invalid value');

  const contextId = String(body.measurement_context_id ?? existing.measurement_context_id ?? '').trim() || null;
  const unitItemId = String(body.unit_item_id ?? existing.unit_item_id ?? '').trim() || null;
  const judgement = await resolveMeasurementJudgement(env, petId, diseaseItemId, measurementItemId, value, unitItemId, contextId);

  await env.DB.prepare(
    `UPDATE pet_health_measurement_logs
     SET disease_item_id = ?, device_type_item_id = ?, device_model_id = ?,
         measurement_item_id = ?, measurement_context_id = ?, value = ?, unit_item_id = ?,
         measured_at = ?, memo = ?, judgement_level = ?, judgement_label = ?, updated_at = ?
     WHERE id = ? AND pet_id = ?`
  ).bind(
    diseaseItemId,
    body.device_type_item_id ?? existing.device_type_item_id ?? null,
    body.device_model_id ?? existing.device_model_id ?? null,
    measurementItemId,
    contextId,
    value,
    unitItemId,
    normalizeMeasuredAt(body.measured_at ?? existing.measured_at),
    body.memo ?? existing.memo ?? null,
    judgement.level,
    judgement.label,
    now(),
    logId,
    petId,
  ).run();
  return ok({ updated: true, id: logId, judgement });
}

async function deleteHealthMeasurementLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return err('not supported', 400);
  await env.DB.prepare(`DELETE FROM pet_health_measurement_logs WHERE id = ? AND pet_id = ?`).bind(logId, petId).run();
  return ok({ deleted: true, id: logId });
}

// ─── util: attach diseases ────────────────────────────────────────────────────

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
       ORDER BY h.is_active DESC, datetime(h.created_at) DESC`
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
       ORDER BY datetime(hr.recorded_at) ASC, hr.id ASC`
    ).bind(petId).all<Record<string, unknown>>();
    diseases = rows.results;
    diseaseIds = rows.results.map((row) => String(row.disease_id || '')).filter(Boolean);
  }

  const allergyIds = await selectRelationIds(env, petId, 'pet_allergies', 'allergy_item_id');
  const symptomIds = await selectRelationIds(env, petId, 'pet_symptoms', 'symptom_item_id');
  const vaccinationIds = await selectRelationIds(env, petId, 'pet_vaccinations', 'vaccination_item_id');
  const colorIdsFallback = await selectRelationIds(env, petId, 'pet_colors', 'color_item_id');
  const temperamentIdsFallback = await selectRelationIds(env, petId, 'pet_temperaments', 'temperament_item_id');

  const out: Record<string, unknown> = { ...pet };
  out.diseases = diseases;
  out.disease_history_ids = diseaseIds;
  out.allergy_ids = allergyIds.length > 0 ? allergyIds : parseJsonArrayString(pet.allergy_ids);
  out.symptom_tag_ids = symptomIds.length > 0 ? symptomIds : parseJsonArrayString(pet.symptom_tag_ids);
  out.vaccination_ids = vaccinationIds.length > 0 ? vaccinationIds : parseJsonArrayString(pet.vaccination_ids);
  out.color_ids = colorIdsFallback.length > 0 ? colorIdsFallback : parseJsonArrayString(pet.color_ids);
  out.temperament_ids = temperamentIdsFallback.length > 0 ? temperamentIdsFallback : parseJsonArrayString(pet.temperament_ids);

  if (!(await hasColumn(env, 'pets', 'medication_status_id'))) out.medication_status_id = null;
  if (!(await hasColumn(env, 'pets', 'living_style_id'))) out.living_style_id = null;

  return out;
}
