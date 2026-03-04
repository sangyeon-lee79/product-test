// TODO: S10 슬라이스에서 구현
// POST /api/v1/stores/:storeId/bookings
// GET /api/v1/bookings
// PUT /api/v1/bookings/:id/accept, /complete
// POST /api/v1/bookings/:id/completion (완료사진)
import type { Env } from '../types';
import { err } from '../types';

export function handleBookings(_request: Request, _env: Env, _url: URL): Response {
  return err('Not implemented yet — S10에서 구현 예정', 501);
}
