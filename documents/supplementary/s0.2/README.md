# S0.2 보충자료 - 인프라 파이프라인

## 1. 환경 매트릭스
| 인프라 | Local | Staging (Stg) | Production (Prod) |
|---|---|---|---|
| **DB** | D1 (SQLite) | Hyperdrive (PostgreSQL) | Hyperdrive (PostgreSQL) |
| **R2** | -- | `pet-life-media-stg` | `pet-life-media-prod` |
| **Workers** | `localhost:8787` | `stg-api.petlife.com` | `api.petlife.com` |
| **Pages** | `localhost:5173` | `stg.petlife.com` | `petlife.com` |

---

## 2. DB 마이그레이션 절차 (Cloudflare D1/PostgreSQL)
### 실행 순서
1. `services/api/src/db/migrations/` 내 신규 SQL 생성.
2. 로컬 테스트: `npx wrangler d1 migrations apply petlife-db --local`.
3. 운영 배포: `npx wrangler d1 migrations apply petlife-db --remote`.
4. 롤백: 이전 버전의 SQL을 역으로 작성하여 재배포하거나 백업 복원.

### 검증 쿼리
마이그레이션 후 반드시 `_cf_D1_migrations` 테이블 또는 `schema.ts` 일치 여부를 확인한다.

---

## 3. 배포 체크리스트
- [ ] `wrangler.jsonc` 환경 변수 (stg/prod) 확인.
- [ ] `JWT_SECRET` 시크릿 등록 완료.
- [ ] DB 마이그레이션 성공 여부.
- [ ] R2 버킷 접근 권한 확인.
- [ ] CORS 허용 도메인 설정 여부.

---

## 4. 장애 대응 Runbook
- **연결 실패**: Hyperdrive 커넥션 풀 확인, DB 서버 상태 체크.
- **마이그레이션 실패**: 롤백 SQL 실행, `migrations` 테이블 강제 보정.
- **CORS 실패**: `middleware/cors.ts` 내 오리진 화이트리스트 점검.
