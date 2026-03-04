// TODO: S6, S7 슬라이스에서 구현
// CRUD /api/v1/pets
// POST/DELETE /api/v1/pets/:id/diseases
// CRUD /api/v1/pets/:petId/logs (타임라인, 7종 LogType)
// POST /api/v1/pets/:petId/logs/sync (오프라인 동기화)
import type { Env } from '../types';
import { err } from '../types';

export function handlePets(_request: Request, _env: Env, _url: URL): Response {
  return err('Not implemented yet — S6/S7에서 구현 예정', 501);
}
