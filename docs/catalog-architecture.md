# Catalog Factory Architecture

> Petfolio의 제품 카탈로그(사료 / 영양제 / 의약품) 시스템 아키텍처 문서.
> `catalogFactory.ts` 기반 팩토리 패턴으로 3개 카탈로그를 단일 코드베이스에서 생성한다.

---

## 1. 파일 구조 및 의존 관계

### 1.1 파일 목록

| 레이어 | 파일 | LOC | 역할 |
|--------|------|-----|------|
| **API Core** | `services/api/src/routes/catalogFactory.ts` | ~825 | 팩토리 — CRUD 핸들러 생성기 |
| **API Instance** | `services/api/src/routes/feedCatalog.ts` | 30 | 사료 카탈로그 설정 + statsExtras |
| **API Instance** | `services/api/src/routes/supplementCatalog.ts` | 32 | 영양제 카탈로그 설정 + statsExtras |
| **API Instance** | `services/api/src/routes/medicineCatalog.ts` | 13 | 의약품 카탈로그 설정 (영양정보 없음) |
| **API Helper** | `services/api/src/helpers/sqlHelpers.ts` | ~110 | 공통 DB 헬퍼 (resolveLang, hasColumn 등) |
| **API Router** | `services/api/src/index.ts` | — | URL prefix → 핸들러 디스패치 |
| **Client** | `apps/admin-web/src/lib/api.ts` | ~250 (발췌) | `createCatalogApi()` — 타입 안전 API 클라이언트 |
| **Client Types** | `apps/admin-web/src/types/api.ts` | — | FeedType, FeedManufacturer, FeedBrand, FeedModel, FeedNutrition, CatalogStats |
| **UI Hook** | `apps/admin-web/src/hooks/useCatalogPage.ts` | ~300 | 페이지 상태 + CRUD 로직 캡슐화 |
| **UI Components** | `apps/admin-web/src/components/CatalogGrid.tsx` | ~229 | CatalogCol, CatalogStatusBadge, CatalogListThumb, CatalogModelDetail |
| **UI Utilities** | `apps/admin-web/src/lib/catalogUtils.ts` | ~106 | emptyTrans, sortCatalog, autoTranslate 등 |
| **UI Pages** | `apps/admin-web/src/pages/FeedPage.tsx` | ~450 | 사료 관리 페이지 |
| **UI Pages** | `apps/admin-web/src/pages/SupplementPage.tsx` | 유사 | 영양제 관리 페이지 |
| **UI Pages** | `apps/admin-web/src/pages/MedicinePage.tsx` | 유사 | 의약품 관리 페이지 |

### 1.2 의존 관계 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Cloudflare Workers)            │
│                                                             │
│  ┌────────────────────────────────────────┐                 │
│  │        catalogFactory.ts               │                 │
│  │  createCatalogHandler(cfg: CatalogConfig)                │
│  │  → handleCatalog(request, env, url)    │                 │
│  └────────────────┬───────────────────────┘                 │
│          ┌────────┼────────┐                                │
│          ▼        ▼        ▼                                │
│   feedCatalog  supplement  medicine                         │
│     .ts        Catalog.ts  Catalog.ts                       │
│    (30줄)      (32줄)      (13줄)                            │
│          │        │        │                                │
│          ▼        ▼        ▼                                │
│  ┌──────────────────────────────────┐                       │
│  │  index.ts (Router / Dispatcher)  │                       │
│  │  Public:  /api/v1/{type}-catalog │                       │
│  │  Admin: /api/v1/admin/{type}-catalog                     │
│  └──────────────────────────────────┘                       │
│          │                                                  │
│          │  sqlHelpers.ts ◄── resolveLang, hasColumn,       │
│          │                    hasTable, syncParentMap,       │
│          │                    upsertI18n, normalizedTranslations
│          │                                                  │
└──────────┼──────────────────────────────────────────────────┘
           │  HTTP
           ▼
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│                                                              │
│  ┌──────────────────────────────────────┐                    │
│  │  api.ts — createCatalogApi()         │                    │
│  │  ├ api.feedCatalog        (with nutrition)                │
│  │  ├ api.supplementCatalog  (with nutrition)                │
│  │  └ api.medicineCatalog    (without nutrition)             │
│  └───────────────┬──────────────────────┘                    │
│                  │                                           │
│  ┌───────────────▼──────────────────────┐                    │
│  │  useCatalogPage(config)              │                    │
│  │  ├ types / mfrs / brands / models    │                    │
│  │  ├ CRUD handlers                     │                    │
│  │  ├ nutrition handlers (opt)          │                    │
│  │  └ stats / sorting / modal state     │                    │
│  └───────────────┬──────────────────────┘                    │
│                  │                                           │
│      ┌───────────┼────────────┐                              │
│      ▼           ▼            ▼                              │
│  FeedPage   SupplementPage  MedicinePage                     │
│      │           │            │                              │
│      └───────────┼────────────┘                              │
│                  │                                           │
│      ┌───────────┴────────────────┐                          │
│      ▼                            ▼                          │
│  CatalogGrid.tsx           catalogUtils.ts                   │
│  ├ CatalogCol              ├ emptyTrans()                    │
│  ├ CatalogStatusBadge      ├ sortCatalog()                   │
│  ├ CatalogListThumb        ├ itemLabel()                     │
│  └ CatalogModelDetail      ├ autoTranslate()                 │
│                            └ i18nRowToTranslations()          │
└──────────────────────────────────────────────────────────────┘
```

### 1.3 데이터 흐름

```
[DB Tables]                        [API Factory]                [Client]          [UI]

feed_types (master_items)  ──┐
feed_manufacturers         ──┤
feed_brands                ──┼──▶ catalogFactory.ts ──▶ JSON ──▶ api.ts ──▶ useCatalogPage ──▶ Page
feed_models                ──┤     (SQL queries)       response  (fetch)    (state mgmt)     (render)
feed_nutrition             ──┤
i18n_translations          ──┤
feed_manufacturer_type_map ──┘     ▲
                                   │
                            sqlHelpers.ts
                            (resolveLang, upsertI18n,
                             syncParentMap, hasColumn)
```

---

## 2. CatalogConfig 타입 파라미터 상세

```typescript
export interface CatalogConfig {
  categoryType: string;
  // 카탈로그 구분자. 'feed' | 'supplement' | 'medicine'
  // DB 쿼리에서 feed_models.category_type, pet_feeds.category_type 필터에 사용

  masterCategoryCode: string;
  // 마스터 카테고리 코드. 'diet_feed_type' | 'supplement_type' | 'medicine_category'
  // master_categories.code를 기준으로 해당 카탈로그의 타입 목록(master_items)을 조회

  urlPrefix: string;
  // Public API URL prefix. '/api/v1/feed-catalog'
  // index.ts에서 path.startsWith(urlPrefix)로 라우팅

  adminUrlPrefix: string;
  // Admin API URL prefix. '/api/v1/admin/feed-catalog'
  // Admin 전용 CRUD 엔드포인트 매칭

  i18nPage: string;
  // i18n_translations.page 컬럼 값. 'feed' | 'supplement' | 'medicine'
  // upsertI18n() 호출 시 page 파라미터로 전달

  keyPrefix: {
    mfr: string;    // 제조사 i18n 키 접두사: 'mfr_' | 'suppl_mfr_' | 'med_mfr_'
    brand: string;  // 브랜드 i18n 키 접두사: 'brand_' | 'suppl_brand_' | 'med_brand_'
    model: string;  // 모델 i18n 키 접두사: 'model_' | 'suppl_model_' | 'med_model_'
  };
  // i18n 키 생성 시 사용. 예: mfr_로얄캐닌, suppl_model_유산균500

  hasNutrition: boolean;
  // true: /models/:id/nutrition GET/PUT 엔드포인트 활성화
  // feed=true, supplement=true, medicine=false

  setCategoryTypeOnInsert: boolean;
  // INSERT 시 feed_models.category_type에 값을 명시적으로 설정하는지 여부
  // feed=false (레거시 호환: category_type 컬럼 미설정 → COALESCE 처리)
  // supplement=true, medicine=true (명시적 설정)

  statsExtras?: (env: Env, catFilter: string) => Promise<Record<string, number>>;
  // 관리자 통계(GET /stats) 추가 항목 콜백
  // feed: user_registered, actual_usage 카운트
  // supplement: user_registered, actual_usage, prescribed 카운트
  // medicine: 미설정 (total_models, active_models만 반환)
}
```

### 인스턴스별 설정 비교

| 파라미터 | Feed | Supplement | Medicine |
|---------|------|-----------|---------|
| `categoryType` | `'feed'` | `'supplement'` | `'medicine'` |
| `masterCategoryCode` | `'diet_feed_type'` | `'supplement_type'` | `'medicine_category'` |
| `urlPrefix` | `/api/v1/feed-catalog` | `/api/v1/supplement-catalog` | `/api/v1/medicine-catalog` |
| `adminUrlPrefix` | `/api/v1/admin/feed-catalog` | `/api/v1/admin/supplement-catalog` | `/api/v1/admin/medicine-catalog` |
| `i18nPage` | `'feed'` | `'supplement'` | `'medicine'` |
| `keyPrefix.mfr` | `'mfr_'` | `'suppl_mfr_'` | `'med_mfr_'` |
| `keyPrefix.brand` | `'brand_'` | `'suppl_brand_'` | `'med_brand_'` |
| `keyPrefix.model` | `'model_'` | `'suppl_model_'` | `'med_model_'` |
| `hasNutrition` | `true` | `true` | `false` |
| `setCategoryTypeOnInsert` | `false` | `true` | `true` |
| `statsExtras` | user_registered + actual_usage | + prescribed | 없음 |

---

## 3. 새 카탈로그 추가 체크리스트

> 예: "간식(Treat) 카탈로그" 추가 시

### 3.1 Backend

- [ ] **DB 마이그레이션** — `pg-schema/` 신규 SQL
  - `master_categories`에 `'treat_type'` 행 INSERT
  - `master_items`에 간식 유형 항목 INSERT
  - i18n 키 등록 (13개 언어)
- [ ] **인스턴스 파일 생성** — `services/api/src/routes/treatCatalog.ts`
  ```typescript
  import { createCatalogHandler } from './catalogFactory';
  export const handleTreatCatalog = createCatalogHandler({
    categoryType: 'treat',
    masterCategoryCode: 'treat_type',
    urlPrefix: '/api/v1/treat-catalog',
    adminUrlPrefix: '/api/v1/admin/treat-catalog',
    i18nPage: 'treat',
    keyPrefix: { mfr: 'treat_mfr_', brand: 'treat_brand_', model: 'treat_model_' },
    hasNutrition: true,  // 또는 false
    setCategoryTypeOnInsert: true,
    // statsExtras: 필요 시 콜백 추가
  });
  ```
- [ ] **라우터 등록** — `services/api/src/index.ts`
  - Public 블록에 `if (path.startsWith('/api/v1/treat-catalog'))` 추가
  - Admin 블록에 `if (path.startsWith('/api/v1/admin/treat-catalog'))` 추가
- [ ] **빌드 확인** — `cd services/api && npm run build`

### 3.2 Frontend

- [ ] **API 클라이언트** — `apps/admin-web/src/lib/api.ts`
  ```typescript
  treatCatalog: createCatalogApi('/api/v1/admin/treat-catalog', '/api/v1/treat-catalog', true),
  ```
- [ ] **페이지 생성** — `apps/admin-web/src/pages/TreatPage.tsx`
  - `useCatalogPage({ catalogApi: api.treatCatalog, imageSubdir: 'treat' })` 사용
  - FeedPage.tsx를 복사해서 시작 (가장 완전한 참조 구현)
- [ ] **라우트 등록** — `apps/admin-web/src/App.tsx`
  - `/admin/treat-catalog` 라우트 추가
- [ ] **네비게이션** — 사이드바에 메뉴 항목 추가
- [ ] **Placeholder 이미지** — `/public/assets/images/placeholder_treat.svg` 추가 (선택)
- [ ] **빌드 확인** — `cd apps/admin-web && npm run build`

### 3.3 최종 확인

- [ ] Public API 테스트: `GET /api/v1/treat-catalog/types?lang=ko`
- [ ] Admin CRUD 테스트: 타입 → 제조사 → 브랜드 → 모델 생성/수정/삭제
- [ ] i18n 번역 표시 확인 (13개 언어 전환)
- [ ] 영양정보 탭 동작 확인 (`hasNutrition: true`일 때)
- [ ] 통계 카드 표시 확인

---

## 4. 버그 수정 케이스별 가이드

### Case A: "목록이 안 나와요" (데이터 조회 실패)

| 확인 순서 | 파일 | 확인 내용 |
|-----------|------|---------|
| 1 | `catalogFactory.ts` | SQL 쿼리의 WHERE 조건 (category_type 필터, status 필터) |
| 2 | `catalogFactory.ts` | `resolveLang()` 반환값 → i18n JOIN의 `display_label` COALESCE 체인 |
| 3 | `sqlHelpers.ts` | `hasColumn()` / `hasTable()` 캐시 → 컬럼 존재 여부 판단 오류 가능 |
| 4 | DB 마이그레이션 | master_categories.code가 cfg.masterCategoryCode와 일치하는지 |

### Case B: "번역이 안 보여요" (i18n 표시 오류)

| 확인 순서 | 파일 | 확인 내용 |
|-----------|------|---------|
| 1 | `catalogFactory.ts` | i18n_translations JOIN — `i18n_key` 매칭 (`keyPrefix.mfr` + id) |
| 2 | `sqlHelpers.ts` | `upsertI18n()` — page 파라미터 (cfg.i18nPage) 올바른지 |
| 3 | `sqlHelpers.ts` | `normalizedTranslations()` — 빈 값 처리, ko/en 폴백 |
| 4 | DB | i18n_translations 테이블에 해당 키 존재하는지 직접 확인 |

### Case C: "생성/수정이 안 돼요" (CRUD 오류)

| 확인 순서 | 파일 | 확인 내용 |
|-----------|------|---------|
| 1 | `catalogFactory.ts` | INSERT/UPDATE SQL — 필수 컬럼 누락, category_type 설정 (`setCategoryTypeOnInsert`) |
| 2 | `catalogFactory.ts` | `syncParentMap()` 호출 — parent_type_ids, parent_mfr_ids 매핑 테이블 |
| 3 | `sqlHelpers.ts` | `syncParentMap()` — DELETE + INSERT 로직, 테이블명/컬럼명 |
| 4 | 인스턴스 파일 | config 값 확인 (특히 keyPrefix 오타) |

### Case D: "관리자 통계가 이상해요" (Stats 오류)

| 확인 순서 | 파일 | 확인 내용 |
|-----------|------|---------|
| 1 | 인스턴스 파일 | `statsExtras` 콜백의 SQL 쿼리 (catFilter 파라미터 사용 여부) |
| 2 | `catalogFactory.ts` | 기본 stats 쿼리 (total_models, active_models) |
| 3 | UI | `useCatalogPage.ts` — stats 로딩 로직, statsFilter 상태 |

### Case E: "영양정보가 저장/표시 안 돼요"

| 확인 순서 | 파일 | 확인 내용 |
|-----------|------|---------|
| 1 | 인스턴스 파일 | `hasNutrition: true` 설정 확인 |
| 2 | `catalogFactory.ts` | nutrition GET/PUT 핸들러 — feed_nutrition 테이블 JOIN |
| 3 | `api.ts` | `createCatalogApi(..., true)` — nutrition 메서드 포함 여부 |
| 4 | `useCatalogPage.ts` | nutrition load/save 로직 |

### Case F: "UI에서 정렬/필터가 안 돼요"

| 확인 순서 | 파일 | 확인 내용 |
|-----------|------|---------|
| 1 | `catalogUtils.ts` | `sortCatalog()` — sort mode별 비교 로직 |
| 2 | `useCatalogPage.ts` | selectedType/selectedMfr/selectedBrand 상태 변경 시 하위 데이터 리로드 |
| 3 | `CatalogGrid.tsx` | CatalogCol — sort 토글 사이클 (count_desc → name_asc → count_asc) |

### Case G: "이미지 업로드/표시 안 돼요"

| 확인 순서 | 파일 | 확인 내용 |
|-----------|------|---------|
| 1 | `CatalogGrid.tsx` | CatalogModelDetail — onImageUpload, onImageUrlChange 핸들러 |
| 2 | `CatalogGrid.tsx` | CatalogListThumb — fallbackSrc 경로, onError 핸들링 |
| 3 | `useCatalogPage.ts` | image upload → R2 Storage API → model UPDATE image_url |
| 4 | `catalogFactory.ts` | model UPDATE SQL에 image_url 포함 여부 |

---

## 5. 핵심 아키텍처 패턴 요약

### A. 파라미터화된 팩토리 패턴
단일 `createCatalogHandler(cfg)` → 3개 카탈로그의 CRUD 전체 생성.
인스턴스 파일은 13~32줄의 **설정(config)**만 정의.

### B. 함수 오버로드 타입 안전성 (Client)
```typescript
function createCatalogApi(admin, pub, hasNutrition: true): CatalogApiWithNutrition;
function createCatalogApi(admin, pub, hasNutrition: false): CatalogApiBase;
```
`hasNutrition` 불리언에 따라 반환 타입이 달라져, nutrition 메서드 접근 시 컴파일 타임 타입 체크.

### C. 모듈 레벨 스키마 캐싱
`hasColumn()` / `hasTable()` — Map 캐시로 PRAGMA 쿼리 중복 실행 제거.
첫 호출 시 DB 조회 → 이후 캐시 반환.

### D. N:M 부모-자식 매핑
`syncParentMap(env, table, childCol, childId, parentCol, parentIds)`:
- 기존 매핑 전체 DELETE → 새 parentIds INSERT
- feed_manufacturer_type_map, feed_brand_type_map 등에 사용

### E. 13개 언어 폴백 체인
`display_label` = COALESCE(현재 locale → en → ko → key)
모든 목록/상세 쿼리에서 i18n_translations LEFT JOIN으로 처리.

---

## 6. 생성되는 API 엔드포인트

각 카탈로그 인스턴스는 다음 엔드포인트를 자동 생성한다:

### Public (인증 불필요)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/{prefix}/types` | 타입 목록 (model_count 포함) |
| GET | `/{prefix}/manufacturers` | 제조사 목록 (?feed_type_id= 필터) |
| GET | `/{prefix}/brands` | 브랜드 목록 (?manufacturer_id=, ?feed_type_id= 필터) |
| GET | `/{prefix}/models` | 모델 목록 (3개 필터 조합 가능) |
| GET | `/{prefix}/models/:id/nutrition` | 영양정보 (hasNutrition=true만) |

### Admin (관리자 인증 필요)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/admin/{prefix}/stats` | 통계 (total, active, + statsExtras) |
| GET | `/admin/{prefix}/types` | 타입 목록 (관리자용) |
| POST | `/admin/{prefix}/manufacturers` | 제조사 생성 |
| PUT | `/admin/{prefix}/manufacturers/:id` | 제조사 수정 |
| DELETE | `/admin/{prefix}/manufacturers/:id` | 제조사 삭제 (soft) |
| POST | `/admin/{prefix}/brands` | 브랜드 생성 |
| PUT | `/admin/{prefix}/brands/:id` | 브랜드 수정 |
| DELETE | `/admin/{prefix}/brands/:id` | 브랜드 삭제 (soft) |
| POST | `/admin/{prefix}/models` | 모델 생성 |
| PUT | `/admin/{prefix}/models/:id` | 모델 수정 |
| DELETE | `/admin/{prefix}/models/:id` | 모델 삭제 (soft) |
| PUT | `/admin/{prefix}/models/:id/nutrition` | 영양정보 Upsert (hasNutrition=true만) |
