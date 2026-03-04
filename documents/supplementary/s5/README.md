# S5 보충자료 - 인증 + 스토리지

## 1. JWT 정책
- **Access Token**: 유효기간 1시간 (`exp: 1h`). 모든 요청에 `Authorization: Bearer <token>` 헤더로 포함.
- **Refresh Token**: 유효기간 7일 (`exp: 7d`). 토큰 갱신 시 `POST /auth/refresh`에 포함하여 새로운 Access/Refresh 발급.
- **재발급/폐기**: 비밀번호 변경 또는 탈취 의심 시 사용자의 `Refresh Token`을 무효화 처리.

---

## 2. Role Guard 권한 매트릭스
| 기능 | Guardian | Provider | Admin |
|---|---|---|---|
| 펫/기록 CRUD | ✅ (본인) | ❌ | ✅ |
| 매장/서비스 CRUD | ❌ | ✅ (본인) | ✅ |
| 예약 수락/완료 | ❌ | ✅ | ✅ |
| 마스터/언어관리 | ❌ | ❌ | ✅ |
| 광고/통계 | ❌ | ❌ | ✅ |

---

## 3. OAuth 토큰 검증 절차 (Google/Apple)
1. **클라이언트**: Google/Apple SDK를 통해 `id_token` 발급.
2. **API 서버**: `POST /auth/oauth`로 전달된 `id_token`을 해당 플랫폼 공개키로 서버 측 검증.
3. **사용자 연동**: 검증된 `oauth_id`와 `email`로 기존 사용자 매칭 또는 신규 가입(`is_new_user`).
4. **JWT 발급**: 서버 자체 Access/Refresh 토큰 생성 후 반환.

---

## 4. R2 Presigned URL 경로 및 MIME 제한
- **유효기간**: 발급 후 5분(300초).
- **제한 사양**:
| 유형 (type) | 업로드 경로 | 허용 확장자 (MIME) |
|---|---|---|
| `avatar` | `avatars/users/`, `avatars/pets/` | `image/jpeg`, `image/png` |
| `log_media` | `logs/{logId}/` | `image/*`, `application/pdf` |
| `feed_media` | `feeds/{feedId}/` | `image/*`, `video/mp4` |
| `completion` | `completions/{bookingId}/` | `image/jpeg`, `image/png` |
| `store_media` | `stores/{storeId}/` | `image/*` |
