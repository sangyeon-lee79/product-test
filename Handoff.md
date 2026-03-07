# 프로젝트 인수인계서 (Handoff.md)
> 최종 업데이트: 2026-03-07 | 기준 커밋: `046084d`

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | **Petfolio** (방울아 놀자) — 종합 반려동물 생애주기 관리 플랫폼 |
| 슬로건 | "Your pet's life portfolio" |
| 핵심 가치 | 반려동물 건강 기록 + 질병 관리 + 보호자-서비스제공자 연동 |
| 다국어 | 13개 언어 (ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar) |

**플랫폼 용어**
- `Guardian` = 보호자(펫 소유자)
- `Provider` = 서비스 제공자(병원/미용/호텔 등)
- `Admin` = 플랫폼 관리자

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| API | Cloudflare Workers (TypeScript) |
| DB | Cloudflare D1 (SQLite 호환) — 로컬 wrangler --local |
| Storage | Cloudflare R2 (pet-life-media 버킷) |
| Admin Web | React + TypeScript + Vite 5 (apps/admin-web) |
| Guardian Web | React + TypeScript + Vite (apps/guardian-web) — 단일 App.tsx SPA |
| Auth | JWT (Access 1h + Refresh 7d), test-login 엔드포인트 활성 |
| Mobile | Flutter (Dart) — 아직 미구현 |

**로컬 실행 명령**
```bash
# API 서버 (localhost:8787)
cd services/api && npx wrangler dev --local --port 8787

# Admin Web (localhost:5173)
cd apps/admin-web && npm run dev

# Guardian Web (localhost:5174)
cd apps/guardian-web && npm run dev

# D1 마이그레이션 단건 직접 적용 (로컬 스키마 문제로 정상 apply 불가)
npx wrangler d1 execute pet-life-db --local --file=src/db/migrations/<파일명>.sql
```

---

## 3. 현재 개발 상태 (슬라이스별)

### ✅ S0 — 인프라 기반 (완료)
- wrangler.jsonc D1 + R2 바인딩 설정 완료
- CORS 미들웨어, Rate Limit, JWT 미들웨어 체인 구성
- `GET /api/v1/health` 헬스체크 엔드포인트

### ✅ S1 — i18n 언어 관리 (완료)
- `i18n_translations` 테이블: `id, key, page, ko~ar(13개), is_active`
- Admin Web: 언어 관리 페이지 (`/admin/i18n`), 자동번역 연동
- API: `GET /api/v1/i18n`, `CRUD /api/v1/admin/i18n`, `POST /api/v1/admin/i18n/translate`
- **배포 게이트**: 번역 누락 시 CI 차단 (`npm run check:i18n:master` — admin-web 내부 검사)

### ✅ S2 — 마스터 데이터 (완료)
- `master_categories` / `master_items` 6단계 계층 (`Category → L1 → L2 → L3 → L4 → L5`)
- Admin Web: 6컬럼 탐색 UI (`/admin/master`)
- 대규모 Seed: 품종(0035), 식품(0036), 질병군/질병이력(0037~0039)

### ✅ S3 — 질병 연결 매핑 (완료)
- `disease_symptom_map`, `symptom_metric_map`, `metric_unit_map`, `metric_logtype_map`
- 당뇨 기준 풀 매핑 Seed 완료

### ✅ S4 — 국가/통화 (완료)
- `countries`, `currencies`, `country_currency_map`
- Admin Web: 국가 관리 페이지 (`/admin/countries`)

### ✅ S5 — 인증 + 스토리지 (완료)
- JWT 발급/갱신, test-login, `requireAuth`, `requireRole` 미들웨어
- R2 Proxy Upload: `GET /storage/presigned-url`, `PUT /storage/upload`, `GET /storage/file/*`

### ✅ S6 — Guardian 프로필 + 펫 등록 (API/Web 완료, Mobile 미완)
- `user_profiles`, `pets`, `pet_weight_logs` 테이블
- `pet_allergies`, `pet_symptoms`, `pet_vaccinations` 다중관계 테이블 (0044)
- `pet_health_measurement_logs` 측정로그 테이블 (0044)
- `pet_disease_histories` 질병이력 테이블 (마이그레이션 내 포함)
- API: Guardian 프로필 CRUD, 펫 CRUD, 몸무게 이력
- API: `GET/POST/PUT/DELETE /api/v1/pets/:id/health-measurements` (일반 건강측정로그)
- Guardian Web: 5단계 위저드 펫 편집, 2단계 위저드 건강측정 입력

### ✅ S7 — 건강 기록 + 타임라인 (API/Web 기초 완료, Mobile 미완)
- `logs`, `log_values`, `log_media` 테이블 (0046)
- `log_type` 마스터 카테고리 + 5종 시드 (혈당/인슐린/식사/체중/일반메모)
- i18n 27개 키 (0047): `guardian.log.*`, `alert.*`
- API: `GET/POST/PUT/DELETE /api/v1/pets/:petId/logs`, `POST .../logs/sync`
- **혈당 경고 로직** (LLD §9):
  - `< 60 mg/dL` → `critical` (긴급 저혈당)
  - `< 80 mg/dL` → `warning` (저혈당 주의)
  - `> 300 mg/dL` → `warning` (고혈당 주의)
  - 직전 대비 `≥ 50 mg/dL` 급락 → `warning` (rapid_drop)
  - mmol/L → mg/dL 자동 변환 (× 18.02)
- Guardian Web: 기록 추가 폼, 타임라인 뷰, 경고 배너

### ✅ S10 — 피드 + 예약 + 바이럴 루프 (부분 완료)
- DB: `bookings`, `feeds`, `feed_likes`, `feed_comments`, `pet_album_media` 테이블
- API: 예약 CRUD, 피드 CRUD, 좋아요/댓글, 1-click 바이럴 공유
- Guardian Web: 예약 요청, 갤러리/앨범 뷰

### ✅ S11 — 광고 설정 (API 완료, Mobile 미완)
- API: `GET /api/v1/ads/config`, `CRUD /api/v1/admin/ads`

### ✅ 장치 관리 (Device Management, S7 선행 인프라)
- DB: `device_types`, `device_manufacturers`, `device_brands`, `device_models`, `guardian_devices` (0044)
- DB: `measurement_units`, `measurement_ranges` (0044)
- Admin Web: 장치 관리 4컬럼 UI (`/admin/devices`)
- API: Admin CRUD + Public 조회 + Guardian 장치 등록

---

## 4. DB 마이그레이션 전체 목록

| 파일 | 내용 |
|------|------|
| `000_init.sql` | 초기 스키마 |
| `0001_admin_tables.sql` | Admin 기본 테이블 |
| `0002_admin_ui_i18n.sql` | Admin UI i18n 초기 키 |
| `0003_i18n_all_langs.sql` | 13개 언어 컬럼 확장 |
| `0004_guardian_pet.sql` | Guardian/Pet 기본 구조 |
| `0008_final_seed.sql` | 기초 Seed |
| `0009_translation_memory_and_quota.sql` | 번역 메모리/쿼터 |
| `0010_pet_profile_master.sql` | 펫 프로필 마스터 확장 |
| `0011~0015` | i18n 수동 번역 보완 |
| `0016_feed_friendship_booking_core.sql` | 피드/친구/예약 핵심 테이블 |
| `0017_platform_branding_i18n.sql` | 플랫폼 브랜딩 i18n |
| `0018_guardian_main_i18n_seed.sql` | Guardian 메인 i18n |
| `0019_pet_album_media.sql` | 펫 앨범 미디어 |
| `0020_pet_weight_logs.sql` | 몸무게 이력 |
| `0021_petfolio_core_alignment.sql` | **핵심 정규화** — master_categories/items `code`+`status` 컬럼으로 재구성 |
| `0022_restore_bangul_sample.sql` | 방울이 샘플 복구 |
| `0023_disease_management_foundation.sql` | 질병 관리 기반 |
| `0024_admin_master_disease_tree_i18n.sql` | 질병 트리 i18n |
| `0025_backfill_master_category_i18n.sql` | 마스터 카테고리 i18n 백필 |
| `0026~0027` | Guardian 갤러리 업로드 i18n |
| `0028_admin_master_explorer_i18n.sql` | Admin 마스터 탐색기 i18n |
| `0029_pet_type_breed_hierarchy_seed.sql` | 펫 타입/품종 계층 Seed |
| `0030_disease_measurement_centered_seed.sql` | 질병측정 중심 Seed |
| `0031_disease_test_method_seed.sql` | 검사방법 Seed |
| `0032_master_category_restructure_cleanup.sql` | 카테고리 재구성 정리 |
| `0033_master_l2_restructure_and_pet_breed_seed.sql` | L2 재구성 + 품종 Seed |
| `0034_master_seed_foodtype_pettype_extensions.sql` | 식품유형/펫타입 확장 |
| `0035_pet_type_full_seed_expansion.sql` | 펫 타입 대규모 Seed |
| `0036_food_category_full_seed.sql` | 식품 카테고리 Seed |
| `0037_disease_group_type_full_seed.sql` | 질병군/질병이력 Seed |
| `0038_disease_group_cleanup_and_reseed.sql` | no-op (FK 우회) |
| `0039_disease_group_cleanup_fk_safe.sql` | 레거시 질병군 정리 |
| `0040_master_i18n_backfill_labels.sql` | 마스터 i18n 백필 |
| `0041_admin_master_6level_i18n_full.sql` | 6단계 Admin i18n 전체 |
| `0042_admin_master_ui_keyset_sync.sql` | Admin UI 키셋 동기화 |
| `0042_admin_ui_full_i18n.sql` | Admin UI 전체 i18n (**중복 번호 주의**) |
| `0043_repair_key_literal_i18n_values.sql` | key 리터럴 값 보정 |
| **`0044_device_management.sql`** | 장치 관리 테이블 + Seed |
| **`0044_pet_health_multiselect_and_measurements.sql`** | pet 다중선택 관계 테이블 + 건강측정로그 (**중복 번호 주의**) |
| `0045_device_mgmt_i18n.sql` | 장치 관리 Admin i18n |
| `0046_logs_core.sql` | logs/log_values/log_media 테이블 + log_type 마스터 Seed |
| `0047_logs_i18n.sql` | 건강 기록 UI i18n 27개 키 |

> ⚠️ **중복 번호 주의**: `0042_*` 2개, `0044_*` 2개 — D1은 파일명 전체를 키로 추적하므로 오류는 없으나,
> 차후 마이그레이션 번호는 `0048_`부터 시작할 것.

---

## 5. API 라우트 맵

```
services/api/src/index.ts     ← 메인 디스패처

routes/
  health.ts       GET /api/v1/health
  auth.ts         POST /api/v1/auth/test-login, /refresh
  i18n.ts         GET /api/v1/i18n, CRUD /api/v1/admin/i18n, POST ../translate
  master.ts       GET /api/v1/master/*, CRUD /api/v1/admin/master/*
  countries.ts    GET /api/v1/countries, CRUD /api/v1/admin/countries|currencies
  ads.ts          GET /api/v1/ads/config, CRUD /api/v1/admin/ads
  storage.ts      GET /api/v1/storage/presigned-url, PUT /upload, GET /file/*
  guardians.ts    GET/PUT /api/v1/guardians/me, GET /check-handle
  pets.ts         CRUD /api/v1/pets, weight-logs, glucose-logs,
                  health-measurements, disease-devices
                  └── 위임: /guardian-devices → devices.ts
                  └── 위임: /logs → logs.ts
  devices.ts      Admin CRUD + Public GET 장치계층,
                  Guardian /pets/:petId/guardian-devices CRUD
  logs.ts         GET/POST/PUT/DELETE /api/v1/pets/:petId/logs
                  POST .../logs/sync
  feeds.ts        CRUD /api/v1/feeds, /from-completion, /approve
  providers.ts    /api/v1/stores, /services
  bookings.ts     CRUD /api/v1/bookings
  friends.ts      /api/v1/friends
  petAlbum.ts     /api/v1/pet-album
```

---

## 6. 프론트엔드 현황

### Admin Web (`apps/admin-web/`)
| 페이지 | 경로 | 상태 |
|--------|------|------|
| Dashboard | `/admin` | ✅ |
| i18n 관리 | `/admin/i18n` | ✅ |
| 마스터 데이터 | `/admin/master` | ✅ (6컬럼 탐색) |
| 국가/통화 | `/admin/countries` | ✅ |
| 장치 관리 | `/admin/devices` | ✅ (4컬럼: Type→Mfr→Brand→Model) |

- 모든 텍스트 `t(key)` 기반, 13개 언어 스위처 (사이드바 하단)
- i18n 게이트: `t(key)` 없는 텍스트 하드코딩 → 배포 차단

### Guardian Web (`apps/guardian-web/src/App.tsx`)
단일 파일 SPA (1258 lines). i18n 미적용(한국어 하드코딩).

| 섹션 | 내용 | 상태 |
|------|------|------|
| Login | test-login JWT 발급 | ✅ |
| Profile | Guardian 프로필 편집 | ✅ |
| My Pets | 펫 등록/수정 (5단계 위저드) | ✅ |
| Booking | 예약 요청/목록 | ✅ |
| Gallery | 펫 앨범 조회/승인 | ✅ |
| **건강 기록** | 로그 타입 선택, 수치 입력, 타임라인 뷰, 혈당 경고 배너 | ✅ (기초) |
| 건강 측정 | 2단계 위저드: 질병→측정항목 선택 + 수치입력 | ✅ |

---

## 7. 핵심 아키텍처 규칙

### i18n 원칙 (절대 규칙)
```
모든 UI 텍스트 → t(key) 함수만 사용
키 없이 화면 먼저 금지 → i18n 키 DB 등록 선행 필수
번역 소스: 한국어(ko) → 자동번역 13개 언어
번역값이 key와 동일하면 저장 금지 (audit gate 통과 불가)
```

### 마스터 데이터 구조
```
master_categories (정규화 스키마: code, status)
  └── master_items (code, parent_item_id, status, metadata JSON)
       └── 6단계 계층: Category > L1 > L2 > L3 > L4 > L5
```

### 로컬 vs 원격 스키마 차이 (중요!)
| 컬럼 | 로컬 DB (구 스키마) | 원격 DB (정규화 스키마, 마이그레이션 기준) |
|------|-------|--------|
| master_categories | `key`, `is_active` | `code`, `status` |
| master_items | `key`, `parent_id`, `is_active` | `code`, `parent_item_id`, `status` |
| i18n_translations | `page`, `is_active` | `page`, `is_active` |
| pets | `guardian_id` | `guardian_user_id` |

> ⚠️ 로컬 DB는 마이그레이션 0021에서 체인이 끊겨 구 스키마 상태.
> 0022+ 마이그레이션은 원격 D1에서만 정상 동작.
> 로컬 테스트: `npx wrangler d1 execute --local --file=<파일>` 로 DDL만 개별 적용.

### 변경 순서 원칙
```
문서(PLAN/PRD/LLD) → DB 마이그레이션 → API → UI
```

---

## 8. 다음 개발 과제 (우선순위 순)

### 🔴 S7 완성 (최우선)
- **Guardian Web**: 7종 LogType별 전용 입력 폼 (혈당/인슐린/식사/수분/운동/이벤트/검사)
- **Mobile (Flutter)**: 동일 7종 로그 입력 화면 구현
- **로그 미디어**: 사진 첨부 (R2 presigned → `logs/{logId}/`) 연동
- **테스트 데이터**: 방울이 혈당 3건 입력 (정상 150, 주의 75, 긴급 55) + 경고 확인

### 🟡 S8 — 오프라인 동기화
- API `POST /pets/:petId/logs/sync` ← 이미 구현됨
- Mobile SQLite `local_logs` 테이블 구현 (Flutter)
- 온라인 복귀 시 자동 동기화 트리거

### 🟡 S9 — Provider 매장/서비스
- `stores`, `store_industries`, `services`, `service_discounts` DB 테이블 (미생성)
- API CRUD `/stores`, `/services`
- Provider Web UI 또는 Mobile Provider 모드

### 🟢 S12 — OAuth (Google/Apple)
- `POST /api/v1/auth/oauth` 엔드포인트 구현
- is_new_user 플래그 + 프로필 초기화 흐름

---

## 9. 알려진 이슈 / 주의사항

| 이슈 | 설명 | 상태 |
|------|------|------|
| 중복 마이그레이션 번호 | `0042_*` 2개, `0044_*` 2개 존재 | 운영 가능(D1은 전체 파일명 기준) |
| 로컬 DB 스키마 불일치 | 0021 이후 정규화 스키마 미적용 상태 | 원격 D1 정상 동작 확인됨 |
| i18n_translations 컬럼 | `page` + `is_active` 사용 (`namespace`, `is_verified` 아님) | 확인됨 |
| pets.guardian_user_id | 원격 스키마 기준, 로컬은 `guardian_id` | 로컬 pets API 일부 실패 |
| Guardian Web i18n 미적용 | 단일 SPA, 한국어 하드코딩 | 향후 개선 과제 |
| Mobile Flutter | 아직 Scaffold 없음, 전면 미구현 | S7 이후 착수 예정 |

---

## 10. 주요 파일 경로

```
/home/user/product-test/
  documents/
    PLAN.md       슬라이스 체크리스트 (개발 전 반드시 확인)
    PRD.md        제품 요구사항
    LLD.md        DB 스키마 + API 스펙 상세
  services/api/
    src/
      index.ts              라우터 디스패처
      types.ts              공통 타입 + ok/err/newId/now 헬퍼
      middleware/
        auth.ts             requireAuth, requireRole
        cors.ts
        rateLimit.ts
      routes/               API 라우트 핸들러 (위 §5 참조)
      db/migrations/        0000~0047 SQL 마이그레이션
    wrangler.jsonc          D1/R2 바인딩, JWT_SECRET, ALLOWED_ORIGINS
  apps/
    admin-web/src/
      App.tsx               라우터 + 페이지 연결
      lib/api.ts            API 클라이언트 (typed)
      lib/i18n.tsx          i18n 컨텍스트 + t() 함수
      pages/                각 Admin 페이지
      components/Layout.tsx 사이드바 네비게이션
    guardian-web/src/
      App.tsx               단일 파일 SPA (1258 lines)
      App.css               스타일
  Handoff.md               이 문서
  GEMINI.md                AI 개발 가이드
```

---

## 11. 개발 시 필수 확인 사항

1. **새 마이그레이션**: 번호 `0048_`부터 사용. `page`/`is_active` 컬럼명 사용.
2. **새 i18n 키**: DB 먼저 등록 후 UI 코드 작성. ko 값은 실제 한국어 표시명(key 패턴 금지).
3. **master_items 참조**: `code` 기준으로 로직 작성, 표시명은 i18n 테이블에서 조회.
4. **광고 금지 구역**: 건강/질병 기록 관련 화면에 광고 절대 노출 금지 (PRD §4.7).
5. **소프트 삭제**: 데이터 삭제 시 `status = 'deleted'` 또는 `is_active = 0`. 물리 삭제 금지.
6. **문서 동기화**: 구현 전 `PLAN.md` 체크박스 확인 → 구현 완료 후 `[x]`로 업데이트.
