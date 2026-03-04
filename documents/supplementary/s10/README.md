# S10 보충자료 - 예약 + 완료사진 + 바이럴

## 1. 예약 상태 전이도 (State Machine)
- **`requested`**: 보호자가 예약을 요청한 초기 상태.
- **`accepted`**: 공급자가 예약을 확인하고 수락한 상태.
- **`completed`**: 서비스가 완료되고 완료사진이 업로드된 상태.
- **`cancelled`**: 보호자 또는 공급자가 예약을 취소한 상태.
- **전이 규칙**: `requested` -> `accepted` -> `completed`. (`cancelled`는 언제나 가능하나 `completed` 이후 불가)

---

## 2. 완료사진 업로드 규칙
- **저장 경로**: `completions/{bookingId}/{uuid}.jpg`
- **업로드 주체**: 오직 Provider 계정만 해당 예약 건에 대해 업로드 가능.
- **최대 개수**: 최대 3~5장 권장.

---

## 3. from-completion 피드 생성 계약 (자동 필드)
`POST /api/v1/feeds/from-completion` 호출 시 자동으로 구성되는 필드:
- `media_urls`: `booking_completions`의 사진들.
- `provider_store_id`: 예약된 매장 ID.
- `source_type`: `booking_completion`.
- `content`: 사용자가 입력한 캡션 + (자동) "매장 정보가 포함된 링크".

---

## 4. 매장 링크 노출 UX 가이드
- **피드 카드**: 피드 하단에 "이용한 매장: 해피 미용실 >" 형태의 칩 또는 버튼 노출.
- **클릭 동작**: 매장 상세 페이지(`S9`)로 즉시 이동.
- **바이럴 포인트**: 예쁜 완료 사진과 매장 정보를 자연스럽게 연결하여 다른 유저의 예약을 유도.
