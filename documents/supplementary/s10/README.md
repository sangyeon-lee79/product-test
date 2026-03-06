# S10 보충자료 - 예약 + 완료사진 + 피드/친구 연동

## 1. 예약 상태 전이도 (State Machine)
- **`created`**: 보호자가 예약을 생성한 상태.
- **`in_progress`**: 공급자가 서비스 진행 중으로 변경한 상태.
- **`service_completed`**: 서비스 완료 상태.
- **`publish_requested`**: 공급자가 완료 콘텐츠 공개 요청을 올린 상태.
- **`publish_approved`**: 보호자가 공개 승인한 상태.
- **`publish_rejected`**: 보호자가 공개 거절한 상태.
- **`cancelled`**: 취소 상태.
- **전이 규칙(권장)**: `created` -> `in_progress` -> `service_completed` -> `publish_requested` -> (`publish_approved` | `publish_rejected`)

---

## 2. 완료사진 업로드/공개 요청 규칙
- **저장 경로**: `completions/{bookingId}/{uuid}.jpg`
- **업로드 주체**: 오직 Provider 계정만 해당 예약 건에 대해 업로드 가능.
- **공개 규칙**: Provider가 올린 완료 콘텐츠는 Guardian 승인 전까지 공개 불가.

---

## 3. 완료 게시물 피드 생성 계약 (현재 API)
- `POST /api/v1/bookings/:id/completion-request`
- `POST /api/v1/feeds/booking-completed/request`
- 공통 동작:
- `booking_completion_contents` upsert
- `feeds(feed_type='booking_completed')` 생성 또는 갱신
- `publish_request_status='pending'`, `status='hidden'`, `is_public=0`
- Guardian 승인 API:
- `POST /api/v1/feeds/:id/approve` (`approve` / `reject`)
- 승인 시에만 `status='published'` + `is_public` 반영

---

## 4. 매장 링크 노출 UX 가이드
- **피드 카드**: 피드 하단에 "이용한 매장: 해피 미용실 >" 형태의 칩 또는 버튼 노출.
- **클릭 동작**: 매장 상세 페이지(`S9`)로 즉시 이동.
- **바이럴 포인트**: 예쁜 완료 사진과 매장 정보를 자연스럽게 연결하여 다른 유저의 예약을 유도.

---

## 5. DB 마이그레이션 적용 명령 (0016)
실행 기준 디렉토리: `services/api`

1. 로컬 D1 적용
```bash
npx wrangler d1 migrations apply pet-life-db --local
```

2. 원격 D1 적용
```bash
npx wrangler d1 migrations apply pet-life-db --remote
```

3. 특정 SQL 파일 직접 적용이 필요한 경우
```bash
npx wrangler d1 execute pet-life-db --local --file=src/db/migrations/0016_feed_friendship_booking_core.sql
npx wrangler d1 execute pet-life-db --remote --file=src/db/migrations/0016_feed_friendship_booking_core.sql
```

---

## 6. 검증 쿼리 실행
검증 SQL 파일:
- `services/api/src/db/queries/verify_feed_friendship_booking.sql`

실행 명령:
```bash
npx wrangler d1 execute pet-life-db --local --file=src/db/queries/verify_feed_friendship_booking.sql
npx wrangler d1 execute pet-life-db --remote --file=src/db/queries/verify_feed_friendship_booking.sql
```

핵심 확인 포인트:
- `schema_migrations`에 `0016_feed_friendship_booking_core` 존재
- `booking_completed` 게시물은 `approved` 이전에 공개되지 않음
- `bookings.status`와 `booking_completion_contents.publish_status` 일관성 유지
- 친구 요청 self-request/중복 활성 friendship 없음
- 피드 필터 키(`business_category_id`, `pet_type_id`) 참조 무결성 유지
