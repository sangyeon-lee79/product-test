// TODO: S6 슬라이스에서 구현
// GET/PUT /api/v1/guardians/me
// GET /api/v1/guardians/check-handle
import type { Env } from '../types';
import { err } from '../types';

export function handleGuardians(_request: Request, _env: Env, _url: URL): Response {
  return err('Not implemented yet — S6에서 구현 예정', 501);
}
