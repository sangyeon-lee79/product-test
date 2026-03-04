// TODO: S9 슬라이스에서 구현
// CRUD /api/v1/stores, /api/v1/services
// POST /api/v1/services/:id/discounts
import type { Env } from '../types';
import { err } from '../types';

export function handleProviders(_request: Request, _env: Env, _url: URL): Response {
  return err('Not implemented yet — S9에서 구현 예정', 501);
}
