# Pet Lifecycle SNS Platform — PLAN.md (MVP+ Best Plan)
# Status: MVP Planning — 수직 슬라이스 구조
# PRD.md / LLD.md 정렬 완료

체크 표기:
[ ] 개발전
[x] 개발완료

---

## 0. 문서 관리 / 개발 절차 (전역 규칙: 체크 대상 아님)

- 문서는 /documents 폴더에서만 관리: PLAN.md / PRD.md / LLD.md
- PLAN/PRD/LLD = 단일 진실(SSOT). 구현 전 반드시 PRD/LLD 확인
- 변경 순서: 문서 → DB/마이그레이션 → API → UI
- 기존 코드/데이터 삭제/초기화 금지(수정·확장만 허용)
- 모든 관리/설정 UI 기본 패턴: List → Select → Edit + Create
  - 단, "연결형 계층 데이터(질병→증상→수치…)"는 운영 효율을 위해 Tree-view/Graph UI 예외 허용
- 하드코딩 텍스트/드롭다운 금지 (언어관리/마스터 기반만)
- 플랫폼 공식 용어:
  - Guardian = 보호자 계정(User)
  - Provider = 공급자(매장/병원/미용 등)
  - Admin = 관리자
- 다국어는 "번역 기능"이 아니라 "언어변환(관리자/가디언/공급자가 값 보정)" 구조
- 광고 정책: "건강/질병 기록 화면에는 광고 노출 금지(신뢰도 유지)"

### ⚠️ 하드코딩 제로 원칙 (모든 슬라이스에 적용)
```
모든 UI 텍스트는 반드시 t(key)로 렌더한다.
UI를 만들기 전에, 해당 화면의 i18n 키를 먼저 DB에 등록한다.
새 화면/컴포넌트 추가 시 → i18n 키 등록 → 그 다음 UI 코드 작성.
키 없이 화면부터 만드는 것은 금지.
```

각 슬라이스의 구조:
```
1. DB 테이블/마이그레이션
2. API 엔드포인트
3. ★ i18n 키 등록 (해당 UI에서 쓸 모든 텍스트)
4. UI 개발 (t(key)로만 렌더)
5. Seed/테스트 데이터
6. 검증
```
---

## 1. 개발 언어/스택 (체크 대상 아님)

- Mobile App: Flutter (Dart) — Guardian/Provider 공용 앱(권한 스위치)
  - Local Cache: SQLite(오프라인 입력은 '질병 기록(Log)'에만 적용)
- Backend API: Node.js (TypeScript) — Cloudflare Workers
- Admin Web: React (TypeScript, Vite) — Cloudflare Pages
- Guardian Web: React (TypeScript, Vite) — Cloudflare Pages ※ MVP 1차는 "기록 입력/조회 폼 중심"
- Provider Web: React (TypeScript, Vite) — Cloudflare Pages ※ MVP 1차 Optional
- DB: PostgreSQL + Cloudflare Hyperdrive(커넥션 풀링)
- Storage: Cloudflare R2(미디어 스토리지)
- Auth: JWT(Access 1h + Refresh 7d) + OAuth 2.0(Google/Apple)
- Ads: Google AdMob (Flutter google_mobile_ads)

### 참조: LLD §1 기술 스택, §2 아키텍처, §3 Monorepo

---

## 2. MVP 핵심 우선순위 (체크 대상 아님)

1) Admin: 마스터/언어/국가-통화/광고슬롯 "데이터 기반"을 먼저 완성
2) Storage: R2 업로드(검사결과/피드/완료사진)가 먼저 동작해야 함
3) Auth: MVP는 "테스트 로그인 → (빠르게) OAuth(구글/애플)"로 2단 구성
4) Guardian: 펫 생애 추적(질병 기록) MVP를 최우선
5) Provider: 예약/완료사진 → 가디언 1-click 피드 공유(바이럴 루프)
6) Guardian Web: 운영/검증을 빠르게 하는 폼 중심 웹
7) 알고리즘/커머스 고도화(상품/재고/정교 추천)는 2차

### 참조: PRD §1.4 우선순위, §7 Done Criteria

---

## 3. 개발 흐름 원칙 (체크 대상 아님)

### 수직 슬라이스 방식
모든 슬라이스는 아래 순서로 한 묶음을 완성한다:
```
DB 테이블/마이그레이션
  → API 엔드포인트
    → Admin UI (해당 시)
      → Mobile/Web UI (해당 시)
        → Seed/테스트 데이터 입력
          → 검증 (API 호출 + 화면 확인)
```

### 슬라이스 완료 기준
- API: curl/Postman으로 CRUD 확인 완료
- Admin UI: 브라우저에서 데이터 입력/수정/조회 가능
- Mobile/Web UI: 해당 데이터를 불러와 화면 표시 가능
- 테스트 데이터: 최소 Seed 데이터가 DB에 존재

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 0 — 프로젝트 기반 (선행 필수)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 모든 슬라이스의 기반. 이것 없이는 아무것도 안 됨.
> PRD §4.1 (INF-01~07) | LLD §2 아키텍처, §3 Monorepo

## S0-1. Repo & 폴더 구조
[x] /documents 폴더 생성 및 3문서 배치
[x] monorepo 폴더 구조 확정 (LLD §3)
    - apps/mobile, apps/admin-web, apps/guardian-web, apps/provider-web
    - services/api, packages/shared

## S0-2. 인프라 파이프라인
[ ] PostgreSQL 생성 + Hyperdrive 연결 (배포 시)
[x] DB 마이그레이션 기초 구조 (services/api/src/db/migrations/) — D1 로컬 SQLite 사용
[ ] R2 버킷 생성 (pet-life-media) — S5에서
[ ] Cloudflare Pages 배포 (Admin Web, Guardian Web) — 배포 시
[ ] Cloudflare Workers 배포 (API, 스테이징 1개) — 배포 시
[x] wrangler.jsonc 환경 설정 (D1 바인딩 + JWT_SECRET)

## S0-3. 통신 검증
[x] API Health Check 엔드포인트 (GET /api/v1/health) — DB 상태 포함
[x] Admin Web → API 호출 테스트 (localhost:5173 → localhost:8787)
[ ] Guardian Web → API 호출 테스트
[ ] Mobile → API 호출 테스트
[x] CORS 미들웨어 설정 (LLD §6.3)

### ✅ S0 검증: API health 응답 + Admin Web에서 호출 성공

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 1 — 언어관리 (모든 UI의 전제 조건)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 하드코딩 제로의 시작점. 이후 모든 UI가 t(key)로 렌더해야 하므로 최우선.
> PRD §3.1 ADM-04 | LLD §4.2 i18n_translations, §5.1, §5.7

## S1-1. DB
[x] i18n_translations 테이블 생성
    - key(UNIQUE), page, ko/en/ja/zh_cn/zh_tw/es/fr/de/pt/vi/th/id_lang/ar, is_active

## S1-2. API
[x] CRUD /api/v1/admin/i18n (Admin 전용)
[x] GET /api/v1/i18n?lang=ko&prefix=page.home (클라이언트용, 공개)
[x] POST /api/v1/admin/i18n/translate (한국어 -> 12개국어 자동 번역)

## S1-3. Admin UI
[x] 언어관리 페이지
    - key 목록 + 현재 언어값 표시: `app_title [방울아 놀자]`
    - 키 접두사 필터 + "활성만" 필터음.
    - 13개국어 편집 폼
[x] "한국어 기준 일괄 번역" 버튼 추가 및 연동

## S1-4. 클라이언트 i18n 엔진
[ ] packages/shared — i18n 키 타입 정의
[ ] Mobile (Flutter) — core/i18n/ 엔진: GET /i18n 호출 + 로컬 캐시 + t(key) 함수
[x] Admin Web — i18n 훅/유틸
[ ] Guardian Web — i18n 훅/유틸

## S1-5. Seed 데이터 & 검증
[ ] 13개국어 전체 기초 i18n 키 Seed 보강 (ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
[x] 기초 i18n 키 Seed (API로 직접 입력)
    - app.title, nav.home, nav.pets, nav.feed, nav.booking, nav.profile 입력 완료
    - ko + en 2개 언어 완료
[x] API: GET /i18n?lang=ko 응답 확인
[ ] Mobile: t('app_title') → "방울아 놀자" 화면 표시 확인
[ ] Guardian Web: t('app_title') 표시 확인

### ✅ S1 검증: Admin에서 키 입력 → API 조회 → Admin UI 렌더 확인

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 2 — 마스터 데이터 + 카테고리
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 모든 드롭다운/선택지의 원천. i18n과 연동.
> PRD §3.1 ADM-01, ADM-03 | LLD §4.2 master_categories, master_items

## S2-1. DB
[x] master_categories 테이블 생성 (key, sort_order, is_active)
[x] master_items 테이블 생성 (category_id, key, parent_id, sort_order, is_active, metadata)

## S2-2. API
[x] CRUD /api/v1/admin/master/categories (Admin)
[x] CRUD /api/v1/admin/master/items (Admin)
[x] GET /api/v1/master/categories (클라이언트용)
[x] GET /api/v1/master/items?category_key= (클라이언트용)
[x] "사용중이면 삭제 대신 비활성" 정책 적용

## S2-3. Admin UI
[x] 마스터 카테고리 관리 페이지 (List → Select → Edit + Create)
[x] 마스터 아이템 관리 페이지 (카테고리 선택 → 아이템 CRUD)
[x] 아이템 표시명 = i18n key 연동 (예: master.breed.pomeranian → t() 렌더)

## S2-4. 클라이언트 마스터 로더
[ ] Mobile — core/master/: GET /master/* 호출 + 로컬 캐시
[ ] 드롭다운 렌더 = master_items + t(key)

## S2-5. Seed 데이터 & 검증
[x] 필수 10종 카테고리 Seed
    - breed, industry, disease, symptom, metric, unit, log_type, interest, country_ref, ad_slot 완료
[x] 카테고리 기본 아이템 Seed:
    - breed: pomeranian, maltese, poodle, golden_retriever 완료
[ ] disease, log_type, metric, unit 등 추가 Seed (Admin UI로 입력)
[x] API: GET /master/items?category_key=breed 응답 확인

### ✅ S2 검증: Admin에서 카테고리/아이템 입력 → API 조회 확인

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 3 — 질병 연결 매핑 (Disease→Symptom→Metric→Unit/LogType)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 질병 기록 입력폼의 구조를 결정하는 핵심 매핑. S2 아이템이 있어야 연결 가능.
> PRD §3.1 ADM-02, ADM-03 | LLD §4.2 매핑 4테이블

## S3-1. DB
[x] disease_symptom_map (disease_id, symptom_id, is_required, sort_order, is_active)
[x] symptom_metric_map (symptom_id, metric_id, is_required, sort_order, is_active)
[x] metric_unit_map (metric_id, unit_id, is_default, sort_order, is_active)
[x] metric_logtype_map (metric_id, logtype_id, is_default, sort_order, is_active)

## S3-2. API
[x] CRUD /api/v1/admin/master/disease-maps (Admin — 4종 매핑 관리)
[x] GET /api/v1/master/disease-map?disease_id= (클라이언트용 — 트리 응답)
    - Disease → Symptoms[] → Metrics[] → Units[]/LogTypes[]

## S3-3. Admin UI
[x] 질병 연결 관리 페이지
    - Tree-view/Graph UI 예외 허용
    - Disease 선택 → Symptom 연결 → Metric 연결 → Unit/LogType 연결
    - 연결 속성 편집 (required, sort_order, active, default)
[x] Metric은 최소 1개 LogType에 연결 필수 (검증 로직)

## S3-4. Seed 데이터 & 검증
[x] "당뇨(diabetes)" 기준 풀 매핑 (0005_seed_master.sql)
    - 당뇨 → 고혈당(hyperglycemia) → blood_glucose → mg/dL(default), mmol/L → blood_glucose_log
    - 당뇨 → 저혈당(hypoglycemia) → blood_glucose → mg/dL → blood_glucose_log
    - 당뇨 → 인슐린 필요 → insulin_dose → IU → insulin_log
    - 당뇨 → 식이관리 → food_weight → g → meal_log
    - 당뇨 → 식이관리 → calorie_intake → kcal → meal_log
    - 당뇨 → 수분관리 → water_intake → ml → water_log
    - 당뇨 → 활동관리 → duration → min → activity_log
[x] API: GET /master/disease-map?disease_id=mi-dis-001 → 트리 응답 확인
[x] 트리에서 LogType별로 어떤 Metric/Unit이 필요한지 확인

### ✅ S3 검증: Admin에서 당뇨 연결 완성 → API 트리 조회 → 7종 LogType별 Metric/Unit 확인

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 4 — 국가/통화 관리
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> Guardian 프로필(국가 선택), Provider 매장(통화 연결)의 전제.
> PRD §3.1 ADM-05 | LLD §4.2 countries, currencies, country_currency_map

## S4-1. DB
[x] countries 테이블 (code, name_key, is_active, sort_order)
[x] currencies 테이블 (code, symbol, name_key, decimal_places, is_active)
[x] country_currency_map 테이블 (country_id, currency_id, is_default)

## S4-2. API
[x] CRUD /api/v1/admin/countries (Admin)
[x] CRUD /api/v1/admin/currencies (Admin)
[x] GET /api/v1/countries (클라이언트용 — currency map 포함)

## S4-3. Admin UI
[x] 국가 관리 페이지 (CRUD)
[x] 통화 관리는 국가 화면 내 기본통화 선택으로 통합 (분리 탭 제거)
[x] 국가-통화 매핑 편집 UI (국가 Create/Edit 내 default currency 선택)

## S4-4. Seed 데이터 & 검증
[x] 기본 국가/통화 입력 (API로)
    - KR → KRW(₩), US → USD($), JP → JPY(¥) 완료
    - i18n 키 등록 완료
[x] API: GET /countries → 국가 + 통화 매핑 응답 확인

### ✅ S4 검증: Admin에서 국가/통화 입력 → API 조회 → 매핑 정상 확인

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 5 — 인증 + 스토리지 (로그인해야 뭘 할 수 있음)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 로그인 없이는 Guardian/Provider 기능 불가. R2 없이는 사진 업로드 불가.
> PRD §4.3 API-05~07 | LLD §5.2 인증, §5.3 스토리지, §6 JWT, §8 R2

## S5-1. 인증 DB
[x] users 테이블 (email, password_hash, role, oauth_provider, oauth_id, status)

## S5-2. 인증 API
[x] POST /api/v1/auth/test-login (MVP-0 — 테스트 계정 즉시 JWT 발급)
[x] POST /api/v1/auth/refresh (토큰 갱신)
[x] JWT 미들웨어 구현 (services/api/src/middleware/auth.ts)
[x] Role Guard 구현 (guardian/provider/admin 권한 분기 — LLD §6.2)
[x] 미들웨어 체인: CORS → Rate Limit → JWT → Role Guard → Handler

## S5-3. OAuth (MVP-1, 테스트로그인 검증 후)
[ ] POST /api/v1/auth/oauth (provider=google|apple, id_token 서버 검증)
[ ] is_new_user 플래그 반환

## S5-4. 스토리지 API
[x] GET /api/v1/storage/presigned-url?type=&ext=
    - type별 R2 경로 분기 (avatars/, logs/, feeds/, completions/, stores/, services/)
    - 응답: upload_url, file_key, public_url, expires_in(300s)
[x] R2 Proxy Upload 방식 구현 (PUT /storage/upload + GET /storage/file/*)

## S5-5. 인증 UI
[ ] Mobile — 테스트 로그인 화면 → JWT 저장/갱신 관리 (core/auth/)
[ ] Guardian Web — 테스트 로그인
[x] Admin Web — 테스트 로그인 (admin role)

## S5-6. 검증
[x] 테스트 계정으로 로그인 → JWT 발급 확인
[x] JWT로 보호된 API 호출 성공 확인
[ ] Role Guard: guardian 토큰으로 admin API 호출 시 403 확인
[x] R2 Presigned URL 발급 → 업로드 URL 생성 확인

### ✅ S5 검증: 로그인 → JWT → 보호 API 호출 + R2 업로드/다운로드 성공

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 6 — Guardian 프로필 + 펫 등록
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 로그인 후 첫 화면. 프로필 설정 + 펫 등록이 되어야 기록을 남길 수 있음.
> PRD §3.2 GRD-02~03 | LLD §4.3 user_profiles, pets, pet_diseases

## S6-1. DB
[x] user_profiles 테이블 (handle UNIQUE, display_name, avatar_url, bio, bio_translations, country_id, language, timezone, interests[])
[x] pets 테이블 (guardian_id, name, species, breed_id, birth_date, gender, weight_kg, is_neutered, microchip_no, avatar_url)
[x] pet_diseases 테이블 (pet_id, disease_id, diagnosed_at, notes, is_active)







## S6-2. API
[x] GET /api/v1/guardians/me — 내 프로필
[x] PUT /api/v1/guardians/me — 프로필 생성/수정 (upsert)
[x] GET /api/v1/guardians/check-handle?handle= — 핸들 중복 확인
[x] CRUD /api/v1/pets — 펫 CRUD (복수)
[x] POST /api/v1/pets/:id/diseases — 펫 질병 연결
[x] DELETE /api/v1/pets/:id/diseases/:diseaseId — 질병 연결 해제

## S6-3. Mobile UI
[ ] Guardian 프로필 폼
    - @handle(유니크 실시간 체크)
    - 국가 선택 (S4 countries 드롭다운)
    - 관심사 선택 (S2 master_items(interest) 드롭다운)
    - 소개 (🌐언어변환 옵션 — bio_translations)
    - 프로필 사진 업로드 (S5 R2 presigned → avatars/users/)
[ ] 펫 등록 폼
    - 이름, 종(dog/cat/other), 견종(S2 breed 드롭다운)
    - 생년월일, 성별, 체중, 중성화 여부
    - 마이크로칩 번호
    - 펫 프로필 사진 (R2)
    - 질병 선택(복수) — S2 disease 드롭다운 + pet_diseases
[ ] 펫 리스트 + 펫 프로필 화면

## S6-4. Guardian Web UI
[ ] 프로필 편집 폼 (동일 API)
[ ] 펫 등록/수정 폼 (동일 API)

## S6-5. 테스트 데이터 & 검증
[ ] 테스트 Guardian 프로필 입력 (handle: @bangul_mom)
[ ] 테스트 펫 등록 (이름: 방울이, 종: dog, 견종: 포메라니안, 질병: 당뇨)
[ ] 프로필 사진 + 펫 사진 R2 업로드 확인
[ ] Mobile + Web 양쪽에서 조회 확인

### ✅ S6 검증: 프로필 생성 → 펫 등록(질병 연결) → 사진 업로드 → Mobile/Web 표시

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 7 — 질병 기록 + 타임라인 (핵심 MVP)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 플랫폼의 핵심 가치. 방울이의 혈당/인슐린/식단 기록.
> PRD §3.2 GRD-04, GRD-06 | LLD §4.3 logs, log_values, log_media, §5.4, §9 위험 경고

## S7-1. DB
[ ] logs 테이블 (pet_id, author_id, logtype_id, event_date, event_time, title, notes, metadata JSONB, is_synced, sync_version)
[ ] log_values 테이블 (log_id, metric_id, unit_id, numeric_value, text_value, sort_order)
[ ] log_media 테이블 (log_id, media_url, media_type, thumbnail_url, sort_order)

## S7-2. API
[ ] POST /api/v1/pets/:petId/logs — 기록 생성
    - logtype_id, event_date/time, values[], media[], metadata
    - 생성 시 위험 경고 로직 실행 (LLD §9)
    - 응답에 alert 객체 포함 (type, severity, message_key, value, threshold, unit)
[ ] GET /api/v1/pets/:petId/logs — 타임라인 조회
    - ?logtype=&date_from=&date_to=&page=&limit=&sort=desc
[ ] GET /api/v1/pets/:petId/logs/:id — 기록 상세
[ ] PUT /api/v1/pets/:petId/logs/:id — 기록 수정
[ ] DELETE /api/v1/pets/:petId/logs/:id — 기록 삭제

### 위험 경고 규칙 (LLD §9)
[ ] 혈당 < 60 mg/dL → critical (긴급 저혈당)
[ ] 혈당 < 80 mg/dL → warning (저혈당 주의)
[ ] 혈당 > 300 mg/dL → warning (고혈당 주의)
[ ] 직전 기록 대비 -50 mg/dL 이상 급락 → warning (급락 경고)

## S7-3. Mobile UI — 7종 LogType 입력
[ ] LogType 선택 화면 (질병→연결된 LogType 자동 표시, S3 트리 기반)
[ ] 혈당 기록(blood_glucose_log)
    - 수치 입력 + 단위(mg/dL|mmol/L) + 측정방식(리브레/혈액)
[ ] 인슐린 기록(insulin_log)
    - 종류/용량(IU)/시간/스케줄
[ ] 식단 기록(meal_log)
    - 사료/화식 g + kcal 계산
[ ] 수분 기록(water_log)
    - ml 입력
[ ] 운동 기록(activity_log)
    - 활동 종류/시간(min)
[ ] 이벤트 기록(symptom_event_log)
    - 발정/중성화/호르몬/투약 선택
[ ] 검사/병원 기록(lab_test_log)
    - 첨부 파일(R2 → logs/{logId}/) + 수치 입력
[ ] 위험 경고 배너/다이얼로그 (API alert 응답 기반)
[ ] 타임라인 화면
    - 날짜순 정렬, LogType 필터, 카드형 기록 목록
    - 기록 상세 보기

## S7-4. Guardian Web UI
[ ] 질병 기록 입력 (동일 7종 LogType 템플릿)
[ ] 검사결과 업로드/조회 (R2)
[ ] 타임라인/리스트 보기

## S7-5. 테스트 데이터 & 검증
[ ] 방울이 혈당 기록 3건 입력 (정상: 150, 주의: 75, 긴급: 55)
    - 55 입력 시 critical 경고 확인
[ ] 인슐린 기록 2건 입력
[ ] 식단 기록 1건 + 수분 기록 1건
[ ] 검사 기록 1건 (사진 첨부)
[ ] 타임라인에서 전체 기록 시간순 표시 확인
[ ] LogType 필터 동작 확인
[ ] Mobile + Web 양쪽 동일 데이터 표시 확인

### ✅ S7 검증: 7종 기록 입력 → 위험 경고 → 타임라인 조회 → 사진 첨부 → Mobile/Web 동일 표시

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 8 — 오프라인 기록 + 동기화
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> S7 완료 후. 오프라인에서도 기록 가능하게 확장.
> PRD §3.2 GRD-05 | LLD §7 오프라인 동기화

## S8-1. API
[ ] POST /api/v1/pets/:petId/logs/sync — 배치 동기화
    - 요청: logs[] (local_id, logtype_id, event_date, sync_version, values[], metadata)
    - 응답: synced[] (local_id→server_id) + conflicts[]
    - 충돌: sync_version 비교, 마지막 수정 우선

## S8-2. Mobile SQLite (LLD §7.3)
[ ] local_logs 테이블 구현 (core/offline/)
    - local_id, server_id, is_synced, sync_version
[ ] 오프라인 감지 → Log 입력 시 SQLite 저장 (is_synced=false)
[ ] 온라인 복귀 감지 → POST /logs/sync 자동 호출
[ ] 동기화 상태 UI (미동기화 배지/아이콘)

## S8-3. 검증
[ ] 비행기 모드 → 혈당 기록 2건 입력 → SQLite 저장 확인
[ ] 온라인 복귀 → 자동 동기화 → server_id 발급 확인
[ ] 타임라인에 동기화된 기록 표시 확인
[ ] 충돌 시나리오 테스트 (동일 기록 양쪽 수정)

### ✅ S8 검증: 오프라인 기록 → 온라인 복귀 → 동기화 → 타임라인 반영

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 9 — Provider 매장 + 서비스
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 바이럴 루프의 시작. Provider가 매장/서비스를 등록해야 예약이 가능.
> PRD §3.3 PRV-01~03 | LLD §4.4 stores, store_industries, services, service_discounts

## S9-1. DB
[ ] stores 테이블 (owner_id, name, name_translations, address, phone, country_id, currency_id, avatar_url)
[ ] store_industries 테이블 (store_id, industry_id — 다중)
[ ] services 테이블 (store_id, name, name_translations, description, description_translations, price, currency_id, photo_urls[], sort_order)
[ ] service_discounts 테이블 (service_id, discount_rate, start_date, end_date, is_active)

## S9-2. API
[ ] POST /api/v1/stores — 매장 생성 (country_id → currency_id 자동 연결)
[ ] PUT /api/v1/stores/:id — 매장 수정
[ ] GET /api/v1/stores/:id — 매장 상세
[ ] GET /api/v1/stores — 매장 검색
[ ] POST /api/v1/stores/:id/services — 서비스 등록
[ ] PUT /api/v1/services/:id — 서비스 수정
[ ] POST /api/v1/services/:id/discounts — 할인 등록

## S9-3. Mobile UI (Provider 권한 스위치)
[ ] 권한 스위치 (Guardian ↔ Provider 모드 전환)
[ ] 매장 생성/수정 폼
    - 이름/주소/전화 + 사진(R2)
    - 국가 선택(S4) → 통화 자동 표시(읽기전용)
    - 업종 다중 선택(S2 industry 마스터)
    - 텍스트 🌐언어변환 옵션
[ ] 서비스 등록/수정 폼
    - 서비스명/설명/가격/사진(R2)
    - 할인 설정 (기간/율)
[ ] (선택) SNS 홍보 카드 생성

## S9-4. Guardian Mobile UI (소비자 측)
[ ] 매장 검색/목록 화면
[ ] 매장 상세 + 서비스 목록 화면

## S9-5. 테스트 데이터 & 검증
[ ] 테스트 Provider 계정 생성
[ ] 매장 등록: "해피 펫 미용실" (업종: grooming, 국가: KR → KRW)
[ ] 서비스 등록: "전체 미용" 50,000원 + 사진
[ ] 할인 등록: 10% 할인 (기간)
[ ] Guardian 앱에서 매장/서비스 검색 → 상세 표시 확인

### ✅ S9 검증: Provider 매장/서비스 등록 → Guardian 앱에서 검색/조회 확인

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 10 — 예약 + 완료사진 + 바이럴 루프
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> MVP 바이럴 핵심. 예약→완료→사진→1-click 피드 공유→매장 링크 노출.
> PRD §3.3 PRV-04~05, §3.2 GRD-07~08 | LLD §4.4 bookings, booking_completions, §4.3 feeds

## S10-1. DB
[ ] bookings 테이블 (store_id, service_id, guardian_id, pet_id, status, requested_date/time, notes)
[ ] booking_completions 테이블 (booking_id, photo_urls[], message, is_shared, shared_feed_id)
[ ] feeds 테이블 (author_id, pet_id, content, content_translations, media_urls[], tags[], like_count, comment_count, source_type, source_id, provider_store_id)
[ ] feed_likes 테이블 (feed_id, user_id, UNIQUE)
[ ] feed_comments 테이블 (feed_id, user_id, content, parent_id)

## S10-2. API — 예약
[ ] POST /api/v1/stores/:storeId/bookings — Guardian 예약 요청
[ ] GET /api/v1/stores/:id/bookings — Provider 예약 목록
[ ] GET /api/v1/bookings — Guardian 내 예약 목록
[ ] PUT /api/v1/bookings/:id/accept — Provider 수락
[ ] PUT /api/v1/bookings/:id/complete — Provider 완료
[ ] POST /api/v1/bookings/:id/completion — 완료사진 업로드

## S10-3. API — 피드 + 바이럴
[ ] GET /api/v1/feeds — 피드 목록
[ ] POST /api/v1/feeds — 피드 작성
[ ] POST /api/v1/feeds/from-completion — 🔥 1-click 바이럴 공유
    - completion_id → 자동: 완료사진 + 매장 링크(provider_store_id) 포함
[ ] POST /api/v1/feeds/:id/like / DELETE (좋아요)
[ ] GET /api/v1/feeds/:id/comments / POST (댓글)

## S10-4. Mobile UI — 전체 플로우
[ ] Guardian: 예약 요청 폼 (매장/서비스 선택 + 날짜/시간)
[ ] Guardian: 예약 상태 확인 (requested→accepted→completed)
[ ] Provider: 예약 수신 목록 + 수락 버튼
[ ] Provider: 완료 처리 + 완료사진 업로드 (R2 → completions/{bookingId}/)
[ ] Guardian: 완료 알림 + 완료사진 수신
[ ] Guardian: 🔥 1-click 피드 공유 버튼 → POST /feeds/from-completion
    - 매장 링크 자동 포함 확인
[ ] 피드 리스트 + 좋아요/댓글

## S10-5. Guardian Web UI (최소)
[ ] 피드 보기 (옵션)
[ ] 예약 상태 확인 (옵션)

## S10-6. 테스트 & 검증 (전체 바이럴 루프)
[ ] Guardian → "해피 펫 미용실" 전체 미용 예약 요청
[ ] Provider → 예약 수락
[ ] Provider → 완료 처리 + 완료사진 3장 업로드
[ ] Guardian → 완료사진 수신 확인
[ ] Guardian → 1-click 피드 공유
[ ] 피드에서 확인:
    - 완료사진 표시
    - 매장 링크("해피 펫 미용실") 포함
    - 좋아요/댓글 동작
[ ] 다른 Guardian 계정에서 해당 피드 조회 → 매장 링크 클릭 → 매장 상세 이동

### ✅ S10 검증: 예약→수락→완료→사진→1-click 공유→매장 링크 노출 → 피드 소비 전체 플로우 동작

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 11 — 광고(AdMob) + 통계 대시보드
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 수익화 + 운영 모니터링. 핵심 기능 완성 후 붙이기.
> PRD §3.1 ADM-06~07, §4.7 | LLD §4.2 ad_config/ad_slots, §10 광고 통합

## S11-1. DB (이미 S0에서 테이블 존재 가능, 없으면 생성)
[ ] ad_config 테이블 (global_enabled)
[ ] ad_slots 테이블 (slot_key, ad_unit_id, is_enabled, no_health_zone, impression_count)

## S11-2. API
[ ] GET /api/v1/ads/config — 클라이언트용 (슬롯별 설정)
[ ] CRUD /api/v1/admin/ads — Admin 관리
[ ] POST /api/v1/ads/impression — 노출 카운트 증가

## S11-3. Admin UI — 광고 설정
[ ] 전역 On/Off
[ ] 슬롯별 On/Off + Ad Unit ID 입력
    - feed_list_banner
    - store_detail_banner
[ ] 노출 카운트 표시

## S11-4. Admin UI — 통계 대시보드
[ ] 가입자 (Guardian/Provider) 수
[ ] 피드 수
[ ] 예약 수 (status별)
[ ] 광고 노출 (슬롯별)

## S11-5. Mobile — AdMob 연동
[ ] AdMob SDK 연동 (core/ads/ — google_mobile_ads)
[ ] 앱 시작 시 GET /ads/config 로드
[ ] 피드 리스트 배너 (feed_list_banner)
[ ] 매장 상세 배너 (store_detail_banner)
[ ] 건강/질병 기록 화면 → no_health_zone=true → 광고 비표시 (정책 적용)
[ ] 노출 시 POST /ads/impression

## S11-6. 검증
[ ] Admin에서 광고 전역 Off → 앱에서 광고 안 보임 확인
[ ] Admin에서 전역 On + feed_list_banner On → 피드에서 배너 표시
[ ] 질병 기록 화면(S7) 진입 → 광고 안 보임 확인 (핵심 정책)
[ ] 통계 대시보드 숫자 정합성 확인

### ✅ S11 검증: 광고 On/Off 동작 + 건강 화면 광고 차단 + 통계 정합

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLICE 12 — OAuth 전환 + 마무리
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 테스트 로그인 → 실제 OAuth로 전환. 최종 점검.
> PRD §4.3 API-06 | LLD §5.2

## S12-1. OAuth 구현
[ ] Google OAuth — id_token 서버 검증 + JWT 발급
[ ] Apple OAuth — id_token 서버 검증 + JWT 발급
[ ] Mobile: OAuth 로그인 UI (Google/Apple 버튼)
[ ] Guardian Web: OAuth 로그인 UI
[ ] 기존 테스트 계정 → OAuth 계정 전환/병합 로직 (필요시)

## S12-2. 전체 점검
[ ] 하드코딩 텍스트 제로 확인 — 전 화면 t(key) 점검
[ ] i18n 키 누락 점검 (미번역 키 리스트)
[ ] 전체 플로우 E2E 테스트:
    - OAuth 로그인 → 프로필 → 펫 등록 → 질병 기록 → 타임라인
    - Provider 매장/서비스 → 예약 → 완료 → 1-click 공유 → 피드
    - 오프라인 기록 → 동기화
    - 광고 정책 (건강 화면 비노출)

### ✅ S12 검증: OAuth 로그인 기반 전체 E2E 플로우 통과

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Done Criteria (MVP 1차)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> PRD §7 MVP Done Criteria

[ ] S0: 인프라 파이프라인 (DB/R2/Workers/Pages) 정상 동작
[ ] S1: 언어관리 13개국어 — Admin 입력 → t(key) 렌더
[ ] S2: 마스터 데이터 10종 Seed — 드롭다운 렌더
[ ] S3: 질병 연결 매핑 — 당뇨 풀 매핑 완성 + 트리 API
[ ] S4: 국가/통화 — 매핑 동작
[ ] S5: 인증(OAuth) + R2 스토리지 — 로그인 + 파일 업로드
[ ] S6: Guardian 프로필 + 펫 등록 — 질병 연결 포함
[ ] S7: 질병 기록 7종 + 위험 경고 + 타임라인
[ ] S8: 오프라인 기록 + 동기화
[ ] S9: Provider 매장/서비스 등록
[ ] S10: 예약 → 완료 → 1-click 피드 공유 바이럴 루프
[ ] S11: 광고(건강 화면 미노출) + 통계 대시보드
[ ] S12: OAuth 전환 + 하드코딩 제로 + E2E 통과

---

# 슬라이스 의존성 맵

```
S0 (인프라)
 └→ S1 (i18n) ─────────────────────────────────────┐
     └→ S2 (마스터) ──────────────────────────────┐ │
         └→ S3 (질병 매핑) ─────────────────────┐ │ │
         └→ S4 (국가/통화) ───────────────────┐ │ │ │
             └→ S5 (인증 + R2) ─────────────┐ │ │ │ │
                 └→ S6 (프로필 + 펫) ──────┐ │ │ │ │ │
                     └→ S7 (질병기록+타임라인) ← S3  │ │
                         └→ S8 (오프라인)     │ │ │ │
                     └→ S9 (Provider매장) ← S4    │ │
                         └→ S10 (예약+바이럴) ← S7   │
                             └→ S11 (광고+통계) ← ALL│
                                 └→ S12 (OAuth+마무리)
```

---

# 문서 간 참조 맵

| PLAN 슬라이스 | PRD 참조 | LLD 참조 |
|--------------|----------|----------|
| S0 인프라 | §4.1 INF-01~07 | §2 아키텍처, §3 Monorepo |
| S1 i18n | §3.1 ADM-04 | §4.2 i18n_translations, §5.1, §5.7 |
| S2 마스터 | §3.1 ADM-01, ADM-03 | §4.2 master_categories/items |
| S3 질병매핑 | §3.1 ADM-02, ADM-03 | §4.2 매핑 4테이블 |
| S4 국가/통화 | §3.1 ADM-05 | §4.2 countries/currencies |
| S5 인증+R2 | §4.3 API-05~07 | §5.2, §5.3, §6, §8 |
| S6 프로필+펫 | §3.2 GRD-02~03 | §4.3 user_profiles/pets/pet_diseases |
| S7 질병기록 | §3.2 GRD-04, GRD-06 | §4.3 logs/log_values/log_media, §9 |
| S8 오프라인 | §3.2 GRD-05 | §7 오프라인 동기화 |
| S9 Provider | §3.3 PRV-01~03 | §4.4 stores/services |
| S10 바이럴 | §3.3 PRV-04~05, §3.2 GRD-07~08 | §4.4 bookings, §4.3 feeds |
| S11 광고/통계 | §3.1 ADM-06~07, §4.7 | §4.2 ad_config, §10 |
| S12 OAuth | §4.3 API-06 | §5.2 |

---

# 향후 확장 (Out of Scope for MVP 1차)

> PRD §8

- 알고리즘 기반 피드 추천
- 커머스 고도화 (상품/재고/정교 추천)
- 보험 연계 API
- AI 건강 분석/예측
- 수의학 데이터 표준(FHIR 등) 연동
- 실시간 채팅 (Guardian ↔ Provider)
- Provider Web 본격 구축
- 팔로우/팔로워/해시태그/공유 링크 SNS 고도화
