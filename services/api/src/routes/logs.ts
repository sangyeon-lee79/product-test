// TODO: S7 슬라이스에서 구현 (pets 라우트와 연계)
import type { Env } from '../types';
import { err } from '../types';

export function handleLogs(_request: Request, _env: Env, _url: URL): Response {
  return err('Not implemented yet — S7에서 구현 예정', 501);
}
