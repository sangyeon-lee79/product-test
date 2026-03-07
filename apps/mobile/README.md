# Petfolio Mobile MVP

남은 실질 작업(예약→완료요청→승인→공유 + Gallery 상세 액션) 검증용 Flutter 최소 앱입니다.

## 실행

1. API 서버 실행 (`services/api`, 기본 `http://localhost:8787`)
2. Flutter 의존성 설치
   - `flutter pub get`
3. 실행
   - `flutter run`

## 포함 화면

- Auth: Guardian/Provider 테스트 로그인
- Bookings:
  - Guardian 예약 생성 (`POST /api/v1/bookings`)
  - Guardian 매장예약 생성 (`POST /api/v1/stores/:storeId/bookings`)
  - Provider 상태 변경/완료요청 (`PUT /bookings/:id/status`, `POST /bookings/:id/completion-request`)
  - Guardian 공유 (`POST /feeds/from-completion`)
- Gallery:
  - 조회/필터 (`GET /pet-album`)
  - 캡션 수정/삭제 (`PUT/DELETE /pet-album/:id`)
  - 예약완료 pending 승인/거절 (`POST /feeds/:id/approve`)
- Feed:
  - 피드 조회 (`GET /feeds`)
  - 좋아요/취소 (`POST/DELETE /feeds/:id/like`)
  - 댓글 조회/작성 (`GET/POST /feeds/:id/comments`)
