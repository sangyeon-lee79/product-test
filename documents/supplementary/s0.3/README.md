# S0.3 보충자료 - 통신 검증

## 1. API 베이스 URL 규칙
클라이언트는 환경에 따라 아래 URL을 공통으로 사용한다.
- **Local Development**: `http://localhost:8787/api/v1`
- **Staging**: `https://stg-api.petlife.com/api/v1`
- **Production**: `https://api.petlife.com/api/v1`

---

## 2. CORS 허용 도메인 정책
| 환경 | 허용 오리진 (Origin) |
|---|---|
| Local | `http://localhost:5173`, `http://localhost:3000` |
| Staging | `https://stg.petlife.com`, `https://*.pet-life-stg.pages.dev` |
| Production | `https://petlife.com`, `https://*.pet-life.pages.dev` |

---

## 3. 헬스체크 및 스모크 테스트
### 헬스체크 엔드포인트: `GET /health`
응답 예시:
```json
{
  "status": "ok",
  "db": "connected",
  "version": "1.0.0",
  "timestamp": "2026-03-04T12:00:00Z"
}
```

### 스모크 테스트 시나리오
1. **API 도달 가능성**: `curl -I /health` 호출 시 200 OK 확인.
2. **DB 연결 확인**: `/health` 응답의 `"db": "connected"` 확인.
3. **CORS 확인**: 브라우저 개발자 도구 Network 탭에서 `Access-Control-Allow-Origin` 헤더 유무 확인.

---

## 4. 디버깅 체크리스트
- [ ] 네트워크 연결 상태 확인.
- [ ] 브라우저 개발자 도구 Console/Network 탭 로그 확인.
- [ ] 로컬 개발 시 API 서버가 8787 포트에서 실행 중인지 확인.
- [ ] JWT 토큰이 유효한지 또는 `Authorization: Bearer <token>` 헤더가 포함되었는지 확인.
- [ ] 모바일 앱의 경우 로컬 IP(예: `192.168.x.x`)로의 접근 허용 여부 확인.

---

## 5. Admin `Failed to fetch` 재발 방지 규칙 (2026-03-06)
로그인/초기 i18n 로딩 실패를 막기 위해 아래를 필수로 맞춘다.

1. API Base 단일화
- Admin Web의 모든 fetch는 반드시 `apps/admin-web/src/lib/apiBase.ts`의 `getApiBase()`를 사용한다.
- 파일별로 `localhost:8787`를 직접 하드코딩하지 않는다.

2. 배포 환경 변수
- Pages/프론트 배포 시 `VITE_API_URL`을 환경별 API URL로 반드시 설정한다.
- 예시
  - Staging: `https://stg-api.petlife.com`
  - Production: `https://api.petlife.com`

3. CORS 화이트리스트 동기화
- 실제 Admin Web Origin이 Workers의 `ALLOWED_ORIGINS`에 반드시 포함되어야 한다.
- 위치: `services/api/wrangler.jsonc` (`vars.ALLOWED_ORIGINS` 및 각 env 별 `ALLOWED_ORIGINS`).
- 새 도메인/프리뷰 도메인 추가 시 프론트 배포보다 먼저 API CORS부터 반영한다.

4. 코드 수정 시 점검 항목
- 로그인 API(`POST /api/v1/auth/test-login`)와 i18n API(`GET /api/v1/i18n`)가 동일한 API Base를 사용하는지 확인.
- 브라우저 Network 탭에서 실패 요청 URL이 `localhost`로 잘못 향하지 않는지 확인.

---

## 6. Google 자동번역 운영 규칙
Admin 자동번역(`POST /api/v1/admin/i18n/translate`)은 Google Cloud Translation API를 사용한다.

- 호출 시점: 화면 로딩 시 자동호출 금지. 저장 전 또는 관리자 버튼 클릭 시에만 호출.
- source text: 항상 한국어(`ko`) 기준.
- 저장 정책: 번역 결과는 DB에 저장하고 조회 시 저장값을 그대로 사용.
- 재사용 정책: 동일한 한국어 원문은 `translation_memory` 캐시를 재사용.
- 덮어쓰기 금지: 이미 관리자 입력값이 있는 언어는 자동번역으로 덮어쓰지 않음.
- 실패 처리: 실패한 언어는 빈값 유지(관리자가 수동 입력 가능).
- quota: 분당 요청/일일 문자수 제한을 적용.

필수 환경 설정:
1. Google Cloud Console (수동 설정)
- `Cloud Translation API` 활성화
- 서비스 계정 생성 (권장: 전용 계정 1개)
- 서비스 계정 키(JSON) 발급

2. Cloudflare Worker Secret
- `GOOGLE_TRANSLATE_SERVICE_ACCOUNT_PRIVATE_KEY`

3. Cloudflare Worker Vars
- `GOOGLE_TRANSLATE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_TRANSLATE_RPM_LIMIT` (기본 60)
- `GOOGLE_TRANSLATE_DAILY_CHAR_LIMIT` (기본 200000)

예시:
```bash
cd services/api
npx wrangler secret put GOOGLE_TRANSLATE_SERVICE_ACCOUNT_PRIVATE_KEY
```

서비스 계정 JSON에서 아래 값을 사용:
- `client_email` -> `GOOGLE_TRANSLATE_SERVICE_ACCOUNT_EMAIL`
- `private_key` -> `GOOGLE_TRANSLATE_SERVICE_ACCOUNT_PRIVATE_KEY`

보안 원칙:
- 프론트엔드에는 Google 키/토큰을 절대 노출하지 않는다.
- 번역 호출은 서버(API Worker)만 수행한다.
- Worker는 서비스계정 JWT(OAuth2)로 access token을 발급받아 Google API를 호출한다.
```
