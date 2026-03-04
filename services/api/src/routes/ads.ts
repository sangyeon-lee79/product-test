// TODO: S11 슬라이스에서 구현
// GET /api/v1/ads/config
// CRUD /api/v1/admin/ads (Admin 전용)
import type { Env } from '../types';
import { err } from '../types';

export function handleAds(_request: Request, _env: Env, _url: URL): Response {
  return err('Not implemented yet — S11에서 구현 예정', 501);
}
