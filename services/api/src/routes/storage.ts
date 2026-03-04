// TODO: S5 슬라이스에서 구현
// GET /api/v1/storage/presigned-url?type=&ext= (R2 Presigned URL)
import type { Env } from '../types';
import { err } from '../types';

export function handleStorage(_request: Request, _env: Env, _url: URL): Response {
  return err('Not implemented yet — S5에서 구현 예정', 501);
}
