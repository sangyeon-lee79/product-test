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
