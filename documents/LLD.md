# Pet Lifecycle SNS Platform — LLD.md
# 저수준 설계서 (Low-Level Design)
# Status: MVP In Progress (2026-03-07 동기화)

Petfolio
Your pet's life portfolio

---

## 0. 구현 동기화 노트 (2026-03-07)

- 본 문서는 초기 MVP 설계안을 유지하되, 아래 항목은 실제 구현 기준으로 갱신한다.
- 신규 반영:
  - `pet_album_media` + `/api/v1/pet-album` (Gallery 통합 저장소/API)
  - `pets.birthday`, `pets.current_weight` (직접입력 확장)
  - `pet_weight_logs` + `/api/v1/pets/:id/weight-logs` (시계열 몸무게)
  - 예약 완료 공개요청/승인 플로우: `booking_completion_contents`, `feeds/:id/approve`, `bookings/:id/completion-request`
- 참고:
  - 이 저장소의 실제 DDL 소스는 `services/api/src/db/migrations/*.sql`
  - 일부 구간은 설계안(PostgreSQL 스타일)과 구현(SQLite 호환) 표기가 공존한다.

### 0.1 Master Locale/Stable-ID 클라이언트 구현 규칙 (2026-03-08)

대상: `apps/admin-web/src/pages/GuardianMainPage.tsx` (Pet Wizard, Profile 요약, Health 입력 모달, Master 연결 select 공통)

- Option 모델:
  - `Option = { id, key, label, parentId }`
  - `label`은 `current lang` 우선, fallback `ko -> en -> key`
- 저장 전 정규화:
  - `normalizeSingleStableId(value, options)`:
    - 입력이 id 또는 key여도 최종 `id`로 변환
  - `normalizeMultiStableIds(values, options)`:
    - 다중 선택값을 `id[]`로 정규화 + dedupe
  - strict 저장 경로에서는 매칭 실패값 drop (번역문자열/raw 저장 방지)
- 렌더:
  - `labelOf(options, storedValue)`가 id/key 모두 해석하여 locale 라벨 반환
  - 요약 카드/tooltip은 항상 `labelOf` 기반으로 계산
- 재조회/즉시 갱신:
  - locale 변경 시 master 옵션 재조회 (`loadAll(..., { silent: true })`)
  - 저장 직후에도 동일 로직으로 재조회하여 locale 라벨 일관성 유지

### 0.2 Locale-aware Master Rendering 구현 확장 (2026-03-08)

대상 파일:
- `apps/admin-web/src/pages/GuardianMainPage.tsx`
- `apps/guardian-web/src/App.tsx`

세부 구현:
- Master option label 해석 함수 통일:
  - 우선순위: `display_label` -> `item[locale]` -> `ko` -> `en`
  - raw `label_ko`/`name` 직접 출력 금지
- API 호출 규칙:
  - master items 조회에 `lang` 파라미터 필수 전달
  - endpoint: `GET /api/v1/master/items?category_key=...&lang=...`
- 상태/저장 규칙:
  - form state는 `master_item_id` 중심으로 유지
  - legacy key 입력은 저장 전 id로 정규화 후 전송
- locale 유지:
  - Guardian Web `guardian_locale` 로컬 저장소 유지
  - profile language 변경 시 locale 즉시 반영 + 재조회

### 0.3 Device Management 정규화 상세 (2026-03-08)

DB 마이그레이션:
- `0048_device_type_master_ref_and_mfr_i18n.sql`
  - `device_models.device_type_item_id` 추가 (master_items FK)
  - `device_manufacturers.name_key` 추가 (i18n key)
  - 기존 데이터 backfill:
    - `device_models.device_type_item_id` <- `master_items.device_type_id` 매핑
    - 제조사 `name_key` 생성 + i18n row 생성/보정

API:
- `GET /api/v1/devices/types`, `GET /api/v1/admin/devices/types`
  - source: master category `disease_device_type`
  - locale 파라미터(`lang`) 기반 `display_label` 반환
- `POST/PUT /api/v1/admin/devices/manufacturers`
  - 제조사 생성/수정 시 `name_key` 연결 i18n upsert 수행
- `POST/PUT /api/v1/admin/devices/models`
  - 입력 `device_type_id`를 L3 master item id로 해석
  - 저장 필드: `device_type_item_id` (필수), legacy `device_type_id`는 backward compatibility 용 보조 매핑

Admin UI:
- `DevicePage`는 장치유형 생성/수정 UI 제거
- 장치유형 컬럼은 master L3 조회 결과를 선택 용도로만 사용
- 제조사 표시값은 `display_label` 우선 렌더

### 0.4 Device Name i18n 확장 상세 (2026-03-08)

DB:
- `0049_device_brand_model_i18n_normalization.sql`
  - `device_brands.name_key` 추가
  - `device_models.name_key` 추가
  - brand/model 기존 row의 i18n key backfill
  - `i18n_translations`에 brand/model locale row 생성
  - 누락 locale은 `en/ko` fallback으로 채움

API:
- Brands:
  - `POST/PUT /api/v1/admin/devices/brands`는 `translations` 수신/저장
  - `GET` 응답에 `display_label` 포함
- Models:
  - `POST/PUT /api/v1/admin/devices/models`는 `translations` 수신/저장
  - `GET` 응답에 `model_display_label`, `brand_display_label` 포함
- Guardian/Public/Admin 조회 모두 locale 파라미터 기준 label 계산

### 0.5 Diet Master L3 Seed 상세 (2026-03-08)

마이그레이션:
- `0050_diet_feed_type_l3_seed.sql`
  - 카테고리 `diet_feed_type` 생성/활성화
  - L1/L2 baseline key 보정 후 L3 item seed 추가
  - L3 item은 `parent_item_id`로 L2(`diet_subtype`)를 참조
  - category/item i18n key(`master.diet_feed_type*`) translation row 생성

라우트:
- `GET /api/v1/master/diet-feed-types?parent_id=...`
- parent 검증 규칙:
  - `diet_feed_type` 생성/수정 시 parent category는 `diet_subtype`만 허용

---

## 1. 기술 스택

| 계층 | 기술 |
|------|------|
| Mobile App | Flutter (Dart) — Guardian/Provider 공용 (권한 스위치) |
| Local Cache | SQLite (오프라인 Log 임시 저장 전용) |
| Admin Web | React + TypeScript + Vite |
| Guardian Web | React + TypeScript + Vite |
| Provider Web | React + TypeScript + Vite (MVP Optional) |
| Backend API | Node.js + TypeScript (Cloudflare Workers) |
| Database | PostgreSQL + Cloudflare Hyperdrive (커넥션 풀링) |
| Storage | Cloudflare R2 (미디어) |
| CDN/Deploy | Cloudflare Pages (Web) + Workers (API) |
| Ads | Google AdMob (Flutter google_mobile_ads) |
| Auth | JWT + OAuth 2.0 (Google/Apple) |

---

## 2. 시스템 아키텍처

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Guardian App   │  │  Admin Web      │  │  Guardian Web   │
│  (Flutter)      │  │  (React/Vite)   │  │  (React/Vite)   │
│  + Provider     │  │  CF Pages       │  │  CF Pages       │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                     │
         └────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Cloudflare       │
                    │  Workers (API)    │
                    │  ─────────────    │
                    │  /auth            │
                    │  /i18n            │
                    │  /master          │
                    │  /countries       │
                    │  /ads             │
                    │  /storage         │
                    │  /guardians       │
                    │  /pets            │
                    │  /logs            │
                    │  /feeds           │
                    │  /pet-album       │
                    │  /providers       │
                    │  /bookings        │
                    └────┬────┬────┬────┘
                         │    │    │
              ┌──────────┘    │    └──────────┐
              │               │               │
     ┌────────▼───────┐ ┌────▼────┐ ┌────────▼───────┐
     │  PostgreSQL    │ │   R2    │ │  Hyperdrive    │
     │  (Primary DB)  │ │ (Media) │ │ (Conn Pool)    │
     └────────────────┘ └─────────┘ └────────────────┘
```

---

## 3. Monorepo 구조

```
pet-life/
├── documents/
│   ├── PLAN.md
│   ├── PRD.md
│   └── LLD.md
├── apps/
│   ├── mobile/              # Flutter (Guardian + Provider)
│   │   ├── lib/
│   │   │   ├── main.dart
│   │   │   ├── app/
│   │   │   │   ├── router.dart
│   │   │   │   └── theme.dart
│   │   │   ├── core/
│   │   │   │   ├── i18n/          # t(key) 엔진
│   │   │   │   ├── master/        # 마스터 데이터 캐시
│   │   │   │   ├── auth/          # JWT + OAuth
│   │   │   │   ├── storage/       # R2 업로드 헬퍼
│   │   │   │   ├── offline/       # SQLite 동기화
│   │   │   │   └── ads/           # AdMob 래퍼
│   │   │   ├── features/
│   │   │   │   ├── guardian/
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── pet/
│   │   │   │   │   ├── log/       # 7종 LogType 입력
│   │   │   │   │   ├── timeline/
│   │   │   │   │   ├── feed/
│   │   │   │   │   └── booking/
│   │   │   │   └── provider/
│   │   │   │       ├── store/
│   │   │   │       ├── service/
│   │   │   │       ├── booking/
│   │   │   │       └── completion/ # 완료사진
│   │   │   └── shared/
│   │   │       ├── widgets/
│   │   │       └── models/
│   │   └── pubspec.yaml
│   ├── admin-web/           # React + Vite
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── master/
│   │   │   │   ├── language/
│   │   │   │   ├── country/
│   │   │   │   └── ads/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── vite.config.ts
│   ├── guardian-web/        # React + Vite
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── profile/
│   │   │   │   ├── pet/
│   │   │   │   ├── log/
│   │   │   │   ├── timeline/
│   │   │   │   └── feed/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── vite.config.ts
│   └── provider-web/       # (MVP Optional)
├── services/
│   └── api/                 # Cloudflare Workers
│       ├── src/
│       │   ├── index.ts          # Router
│       │   ├── middleware/
│       │   │   ├── auth.ts       # JWT 검증
│       │   │   ├── cors.ts
│       │   │   └── rateLimit.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── i18n.ts
│       │   │   ├── master.ts
│       │   │   ├── countries.ts
│       │   │   ├── ads.ts
│       │   │   ├── storage.ts
│       │   │   ├── guardians.ts
│       │   │   ├── pets.ts
│       │   │   ├── logs.ts
│       │   │   ├── feeds.ts
│       │   │   ├── petAlbum.ts
│       │   │   ├── providers.ts
│       │   │   └── bookings.ts
│       │   ├── services/
│       │   ├── db/
│       │   │   ├── schema.ts
│       │   │   └── migrations/
│       │   └── utils/
│       └── wrangler.toml
└── packages/
    └── shared/              # 공용 타입, 밸리데이터, i18n 키
        ├── types/
        ├── validators/
        └── i18n/
```

---

## 4. 데이터베이스 스키마

### 4.1 ERD 개요

```
[Admin 영역]
master_categories ──< master_items ──< i18n_translations
                                   ──< disease_symptom_map
                                   ──< symptom_metric_map
                                   ──< metric_unit_map
                                   ──< metric_logtype_map
countries ──< country_currency_map >── currencies
ad_slots

[Guardian 영역]
users ──< user_profiles
     ──< pets ──< pet_diseases
               ──< pet_weight_logs
               ──< logs ──< log_values
                        ──< log_media
     ──< feeds ──< feed_likes
               ──< feed_comments
               ──< booking_completion_contents
     pets ──< pet_album_media

[Provider 영역]
users ──< stores ──< store_industries (다중)
                  ──< services ──< service_discounts
                  ──< bookings ──< booking_completion_contents
```

### 4.2 Admin 테이블

#### master_categories
```sql
CREATE TABLE master_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(50) UNIQUE NOT NULL,
                -- 'industry','breed','disease','symptom','metric','unit',
                -- 'log_type','interest','country_ref','ad_slot'
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### master_items
```sql
CREATE TABLE master_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     UUID NOT NULL REFERENCES master_categories(id),
    key             VARCHAR(100) NOT NULL,
    parent_id       UUID REFERENCES master_items(id),
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, key)
);

CREATE INDEX idx_master_items_category ON master_items(category_id);
CREATE INDEX idx_master_items_parent ON master_items(parent_id);
```

#### i18n_translations
```sql
CREATE TABLE i18n_translations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(200) NOT NULL,
    page        VARCHAR(100),
    ko          TEXT,
    en          TEXT,
    ja          TEXT,
    zh_cn       TEXT,
    zh_tw       TEXT,
    es          TEXT,
    fr          TEXT,
    de          TEXT,
    pt          TEXT,
    vi          TEXT,
    th          TEXT,
    id_lang     TEXT,
    ar          TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(key)
);

CREATE INDEX idx_i18n_page ON i18n_translations(page);
CREATE INDEX idx_i18n_active ON i18n_translations(is_active);

### i18n Rendering Contract
- 저장값: `key/code/id`
- 표시값: `i18n_translations`의 locale별 label
- 금지: UI에서 key 직접 출력
- 렌더 공식: `display_value = translation[current_locale]`, fallback=`ko`
- 누락 처리: key 노출 대신 누락 상태 텍스트 표시

### Master 6-Level Contract
- 관리 UI 구조: `Category | L1 | L2 | L3 | L4 | L5`
- 질병 관리 표준 체인:
  - `disease_group -> disease_type -> disease_device_type -> disease_measurement_type -> disease_measurement_context`
- 예시:
  - `질병군 -> 내분비질환 -> 당뇨 -> 혈당측정기 -> 혈당수치 -> 공복`
- 비질병 카테고리도 동일하게 parent-child를 사용해 L1~L5로 확장 가능해야 한다.

### Master Save Contract
- Category/Item 생성 시 key 단독 저장 금지
- `ko + en + ja + zh_cn + zh_tw + es + fr + de + pt + vi + th + id_lang + ar` 전부 비어있지 않아야 저장 허용
- category key 미입력 시 서버 자동 생성 허용
- item key는 서버 자동 생성
- 자동번역 source는 `ko(label_ko)`만 허용
- source/translation 값이 `master.*` 또는 `admin.*` 패턴이면 저장 금지
- hierarchy 강제:
  - `disease_type` -> parent `disease_group`
  - `disease_device_type` -> parent `disease_type`
  - `disease_measurement_type` -> parent `disease_device_type`
  - `disease_measurement_context` -> parent `disease_measurement_type`
  - `diet_subtype` -> parent `diet_type`
  - `allergy_type` -> parent `allergy_group`

### Pre-Deploy Gate
- 배포 전 `verify_master_i18n_gate.sql` 검사 필수
- 배포 전 `audit_i18n_quality.sql` 검사 필수
- 실패 조건:
  - i18n row 누락
  - 언어 컬럼 공란
  - key literal 누출(master.* 문자열)
  - parent/level 계층 위반

### Seed Contract
- seed 입력 최소 단위:
  - `code(key)`
  - `label_ko`
  - `parent_item_id`(필요 시)
  - `sort_order/level`
- seed에서 하드코딩 표시 문자열을 프론트 옵션으로 직접 사용하지 않는다.
- seed 반영 후 i18n 자동 생성 경로:
  - `label_ko`를 source로 자동번역 호출
  - 13개 언어 row 생성 완료 시에만 운영 반영
```

#### 질병 연결 매핑 테이블

```sql
-- Disease → Symptom
CREATE TABLE disease_symptom_map (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id      UUID NOT NULL REFERENCES master_items(id),
    symptom_id      UUID NOT NULL REFERENCES master_items(id),
    is_required     BOOLEAN DEFAULT FALSE,
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    UNIQUE(disease_id, symptom_id)
);

-- Symptom → Metric
CREATE TABLE symptom_metric_map (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_id      UUID NOT NULL REFERENCES master_items(id),
    metric_id       UUID NOT NULL REFERENCES master_items(id),
    is_required     BOOLEAN DEFAULT FALSE,
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    UNIQUE(symptom_id, metric_id)
);

-- Metric → Unit
CREATE TABLE metric_unit_map (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id       UUID NOT NULL REFERENCES master_items(id),
    unit_id         UUID NOT NULL REFERENCES master_items(id),
    is_default      BOOLEAN DEFAULT FALSE,
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    UNIQUE(metric_id, unit_id)
);

-- Metric → LogType
CREATE TABLE metric_logtype_map (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id       UUID NOT NULL REFERENCES master_items(id),
    logtype_id      UUID NOT NULL REFERENCES master_items(id),
    is_default      BOOLEAN DEFAULT FALSE,
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    UNIQUE(metric_id, logtype_id)
);
```

#### countries / currencies
```sql
CREATE TABLE countries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(3) UNIQUE NOT NULL,   -- ISO 3166-1 alpha-2/3
    name_key    VARCHAR(200) NOT NULL,         -- i18n key 참조
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE currencies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(3) UNIQUE NOT NULL,   -- ISO 4217
    symbol      VARCHAR(10) NOT NULL,
    name_key    VARCHAR(200) NOT NULL,
    decimal_places INT DEFAULT 2,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE country_currency_map (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id      UUID NOT NULL REFERENCES countries(id),
    currency_id     UUID NOT NULL REFERENCES currencies(id),
    is_default      BOOLEAN DEFAULT TRUE,
    UNIQUE(country_id, currency_id)
);
```

#### ad_config
```sql
CREATE TABLE ad_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_enabled  BOOLEAN DEFAULT FALSE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ad_slots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_key        VARCHAR(50) UNIQUE NOT NULL,
                    -- 'feed_list_banner', 'store_detail_banner'
    ad_unit_id      VARCHAR(200),
    is_enabled      BOOLEAN DEFAULT FALSE,
    no_health_zone  BOOLEAN DEFAULT FALSE,      -- 건강/질병 화면 차단 플래그
    impression_count BIGINT DEFAULT 0,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Guardian 테이블

#### users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    password_hash   VARCHAR(255),
    role            VARCHAR(20) NOT NULL DEFAULT 'guardian',
                    -- 'guardian' | 'provider' | 'admin'
    oauth_provider  VARCHAR(20),         -- 'google' | 'apple' | NULL
    oauth_id        VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handle          VARCHAR(50) UNIQUE NOT NULL,
    display_name    VARCHAR(100),
    avatar_url      VARCHAR(500),
    bio             TEXT,
    bio_translations JSONB DEFAULT '{}',   -- 언어변환 값 {"en":"...","ja":"..."}
    country_id      UUID REFERENCES countries(id),
    language        VARCHAR(10) DEFAULT 'ko',
    timezone        VARCHAR(50) DEFAULT 'Asia/Seoul',
    interests       UUID[] DEFAULT '{}',   -- master_items(interest) ID 배열
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_profiles_handle ON user_profiles(handle);
```

#### pets
```sql
CREATE TABLE pets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    species         VARCHAR(20) NOT NULL,       -- 'dog' | 'cat' | 'other'
    breed_id        UUID REFERENCES master_items(id),
    birth_date      DATE,
    gender          VARCHAR(10),                -- 'male' | 'female' | 'unknown'
    weight_kg       DECIMAL(5,2),
    current_weight  DECIMAL(5,2),               -- 최신값 캐시
    weight_unit_id  UUID REFERENCES master_items(id),
    is_neutered     BOOLEAN DEFAULT FALSE,
    microchip_no    VARCHAR(50),
    birthday        DATE,                       -- YYYY-MM-DD, birth_date와 호환
    notes           TEXT,
    avatar_url      VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pets_guardian ON pets(guardian_id);
```

#### pet_weight_logs (몸무게 이력, 시계열)
```sql
CREATE TABLE pet_weight_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id              UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    weight_value        DECIMAL(6,3) NOT NULL,
    weight_unit_id      UUID REFERENCES master_items(id),
    measured_at         TIMESTAMPTZ NOT NULL,
    recorded_by_user_id UUID NOT NULL REFERENCES users(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_weight_logs_pet_measured ON pet_weight_logs(pet_id, measured_at DESC);
CREATE INDEX idx_pet_weight_logs_recorded_by ON pet_weight_logs(recorded_by_user_id, created_at DESC);
```

#### pet_diseases (펫-질병 연결, 복수)
```sql
CREATE TABLE pet_diseases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    disease_id      UUID NOT NULL REFERENCES master_items(id),
    diagnosed_at    DATE,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pet_id, disease_id)
);

CREATE INDEX idx_pet_diseases_pet ON pet_diseases(pet_id);
```

#### logs (질병 기록)
```sql
CREATE TABLE logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    logtype_id      UUID NOT NULL REFERENCES master_items(id),
                    -- blood_glucose_log, insulin_log, meal_log, etc.
    event_date      DATE NOT NULL,
    event_time      TIME,
    title           VARCHAR(200),
    notes           TEXT,
    metadata        JSONB DEFAULT '{}',
                    -- LogType별 추가 데이터
                    -- blood_glucose: {measurement_method: "libre"|"blood"}
                    -- insulin: {insulin_type, schedule}
                    -- meal: {food_type: "kibble"|"homemade", kcal}
    is_synced       BOOLEAN DEFAULT TRUE,       -- 오프라인 동기화 상태
    sync_version    INT DEFAULT 1,
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_pet_date ON logs(pet_id, event_date DESC);
CREATE INDEX idx_logs_pet_logtype ON logs(pet_id, logtype_id);
CREATE INDEX idx_logs_author ON logs(author_id);
```

#### log_values (기록 수치)
```sql
CREATE TABLE log_values (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id          UUID NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
    metric_id       UUID NOT NULL REFERENCES master_items(id),
    unit_id         UUID NOT NULL REFERENCES master_items(id),
    numeric_value   DECIMAL(12,4),
    text_value      VARCHAR(500),
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_log_values_log ON log_values(log_id);
```

#### log_media
```sql
CREATE TABLE log_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id          UUID NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
    media_url       VARCHAR(500) NOT NULL,      -- R2 URL
    media_type      VARCHAR(20) DEFAULT 'image',
    thumbnail_url   VARCHAR(500),
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_log_media_log ON log_media(log_id);
```

#### feeds
```sql
CREATE TABLE feeds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_type       VARCHAR(30) NOT NULL,           -- guardian_post|booking_completed|health_update...
    author_user_id  UUID NOT NULL REFERENCES users(id),
    author_role     VARCHAR(20) NOT NULL,           -- guardian|provider|admin
    pet_id          UUID REFERENCES pets(id),
    business_category_id UUID REFERENCES master_items(id),
    pet_type_id     UUID REFERENCES master_items(id),
    visibility_scope VARCHAR(30) DEFAULT 'public',  -- public|friends_only|private|connected_only|booking_related_only
    booking_id      UUID REFERENCES bookings(id),
    supplier_id     UUID REFERENCES users(id),
    related_service_id UUID,
    caption         TEXT,
    media_urls      TEXT[] DEFAULT '{}',            -- R2 URLs
    tags            TEXT[] DEFAULT '{}',
    like_count      INT DEFAULT 0,
    comment_count   INT DEFAULT 0,
    publish_request_status VARCHAR(20) DEFAULT 'none', -- none|pending|approved|rejected
    is_public       BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'draft',  -- draft|published|hidden|deleted
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feeds_author ON feeds(author_user_id);
CREATE INDEX idx_feeds_created ON feeds(created_at DESC);
CREATE INDEX idx_feeds_tags ON feeds USING GIN(tags);
```

#### feed_likes / feed_comments
```sql
CREATE TABLE feed_likes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id     UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(feed_id, user_id)
);

CREATE TABLE feed_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    parent_comment_id UUID REFERENCES feed_comments(id),
    status      VARCHAR(20) DEFAULT 'active',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_comments_feed ON feed_comments(post_id, created_at);
```

### 4.4 Provider 테이블

#### stores
```sql
CREATE TABLE stores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(200) NOT NULL,
    name_translations JSONB DEFAULT '{}',
    description     TEXT,
    description_translations JSONB DEFAULT '{}',
    address         VARCHAR(500),
    phone           VARCHAR(30),
    country_id      UUID REFERENCES countries(id),
    currency_id     UUID REFERENCES currencies(id),    -- 국가에서 자동 연결
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    avatar_url      VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stores_owner ON stores(owner_id);
```

#### store_industries (다중 업종)
```sql
CREATE TABLE store_industries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    industry_id     UUID NOT NULL REFERENCES master_items(id),
    UNIQUE(store_id, industry_id)
);
```

#### services
```sql
CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    name_translations JSONB DEFAULT '{}',
    description     TEXT,
    description_translations JSONB DEFAULT '{}',
    price           DECIMAL(12,2),
    currency_id     UUID REFERENCES currencies(id),
    photo_urls      TEXT[] DEFAULT '{}',
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_store ON services(store_id);
```

#### service_discounts
```sql
CREATE TABLE service_discounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    discount_rate   DECIMAL(5,2) NOT NULL,      -- 예: 10.00 = 10%
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discounts_service ON service_discounts(service_id);
```

#### bookings
```sql
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id     UUID NOT NULL REFERENCES users(id),
    supplier_id     UUID NOT NULL REFERENCES users(id),
    pet_id          UUID REFERENCES pets(id),
    service_id      UUID,
    business_category_id UUID REFERENCES master_items(id),
    status          VARCHAR(30) DEFAULT 'created',
                    -- 'created' | 'in_progress' | 'service_completed'
                    -- | 'publish_requested' | 'publish_approved' | 'publish_rejected' | 'cancelled'
    requested_date  DATE,
    requested_time  TIME,
    notes           TEXT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_guardian ON bookings(guardian_id);
CREATE INDEX idx_bookings_supplier ON bookings(supplier_id);
```

#### booking_completion_contents (완료사진 + 공개요청)
```sql
CREATE TABLE booking_completion_contents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL UNIQUE REFERENCES bookings(id),
    supplier_id     UUID NOT NULL REFERENCES users(id),
    media_urls      TEXT[] DEFAULT '{}',         -- R2 URLs
    completion_memo TEXT,
    publish_status  VARCHAR(20) DEFAULT 'pending', -- pending|approved|rejected
    requested_at    TIMESTAMPTZ DEFAULT NOW(),
    responded_at    TIMESTAMPTZ,
    responded_by_guardian_id UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_completions_booking ON booking_completion_contents(booking_id);
```

#### pet_album_media (통합 Gallery 저장소)
```sql
CREATE TABLE pet_album_media (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id              UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    source_type         VARCHAR(30) NOT NULL, -- profile|feed|booking_completed|health_record|manual_upload
    source_id           UUID,
    booking_id          UUID REFERENCES bookings(id),
    media_type          VARCHAR(20) DEFAULT 'image', -- image|video
    media_url           VARCHAR(500) NOT NULL,
    thumbnail_url       VARCHAR(500),
    caption             TEXT,
    tags                TEXT[] DEFAULT '{}',
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
    visibility_scope    VARCHAR(30) DEFAULT 'private', -- public|friends_only|private|guardian_supplier_only|booking_related
    is_primary          BOOLEAN DEFAULT FALSE,
    sort_order          INT DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'active', -- active|pending|hidden|deleted
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pet_id, source_type, source_id, media_url)
);

CREATE INDEX idx_pet_album_pet_created ON pet_album_media(pet_id, created_at DESC);
CREATE INDEX idx_pet_album_source ON pet_album_media(source_type, source_id);
CREATE INDEX idx_pet_album_status ON pet_album_media(status);
```

---

## 5. API 설계

### 5.1 공용 데이터 API (Phase C1)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/v1/i18n?lang=ko&prefix=page.home | 언어 키 조회 |
| GET | /api/v1/master/categories | 마스터 카테고리 목록 |
| GET | /api/v1/master/items?category_key=disease | 카테고리별 아이템 |
| GET | /api/v1/master/disease-map?disease_id= | 질병 연결 트리 |
| GET | /api/v1/countries | 국가 + 통화 매핑 |
| GET | /api/v1/ads/config | 광고 설정 (슬롯별) |

#### GET /api/v1/i18n
```json
// Response 200
{
  "lang": "ko",
  "keys": {
    "app_title": "방울아 놀자",
    "nav.home": "홈",
    "nav.my_pet": "내 펫",
    "log.blood_glucose": "혈당 기록",
    "log.insulin": "인슐린 기록"
  }
}
```

#### GET /api/v1/master/disease-map
```json
// Response 200 — 질병 연결 트리 (Disease → Symptom → Metric → Unit/LogType)
{
  "disease": { "id": "uuid", "key": "diabetes" },
  "symptoms": [
    {
      "id": "uuid", "key": "hyperglycemia", "required": true,
      "metrics": [
        {
          "id": "uuid", "key": "blood_glucose",
          "units": [
            { "id": "uuid", "key": "mg_dl", "is_default": true },
            { "id": "uuid", "key": "mmol_l" }
          ],
          "log_types": [
            { "id": "uuid", "key": "blood_glucose_log", "is_default": true }
          ]
        }
      ]
    }
  ]
}
```

### 5.2 인증 API (Phase C2)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/v1/auth/test-login | 테스트 로그인 (MVP-0) |
| POST | /api/v1/auth/oauth | OAuth Google/Apple (MVP-1) |
| POST | /api/v1/auth/refresh | 토큰 갱신 |

#### POST /api/v1/auth/oauth
```json
// Request
{
  "provider": "google",
  "id_token": "eyJ..."
}

// Response 200
{
  "user": { "id": "uuid", "email": "user@gmail.com", "role": "guardian" },
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 3600
  },
  "is_new_user": true
}
```

### 5.3 스토리지 API (Phase C3)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/v1/storage/presigned-url?type=log_media&ext=jpg | R2 업로드 URL |

```json
// Response 200
{
  "upload_url": "https://r2.petlife.com/...",
  "file_key": "logs/uuid/filename.jpg",
  "public_url": "https://media.petlife.com/logs/uuid/filename.jpg",
  "expires_in": 300
}
```

### 5.4 Guardian API (Phase C4)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/v1/guardians/me | 내 프로필 |
| PUT | /api/v1/guardians/me | 프로필 수정 |
| GET | /api/v1/guardians/check-handle?handle= | 핸들 중복 확인 |
| GET | /api/v1/pets | 내 펫 목록 |
| POST | /api/v1/pets | 펫 등록 |
| PUT | /api/v1/pets/:id | 펫 수정 |
| DELETE | /api/v1/pets/:id | 펫 삭제 |
| POST | /api/v1/pets/:id/diseases | 펫 질병 연결 |
| DELETE | /api/v1/pets/:id/diseases/:diseaseId | 펫 질병 연결 해제 |
| GET | /api/v1/pets/:petId/logs | 기록 목록 (타임라인) |
| POST | /api/v1/pets/:petId/logs | 기록 생성 |
| PUT | /api/v1/pets/:petId/logs/:id | 기록 수정 |
| DELETE | /api/v1/pets/:petId/logs/:id | 기록 삭제 |
| POST | /api/v1/pets/:petId/logs/sync | 오프라인 동기화 (배치) |
| GET | /api/v1/pets/:id/weight-logs?range=1m\|3m\|6m\|1y\|all | 몸무게 이력 + 요약 |
| POST | /api/v1/pets/:id/weight-logs | 몸무게 기록 추가 |
| PUT | /api/v1/pets/:id/weight-logs/:logId | 몸무게 기록 수정 |
| DELETE | /api/v1/pets/:id/weight-logs/:logId | 몸무게 기록 삭제 |
| GET | /api/v1/pet-album?pet_id=&source_type=&media_type=&sort= | 펫 앨범 조회 |
| POST | /api/v1/pet-album | 펫 앨범 미디어 생성 |
| GET | /api/v1/pet-album/:id | 펫 앨범 미디어 상세 |
| PUT | /api/v1/pet-album/:id | 펫 앨범 미디어 수정 |
| DELETE | /api/v1/pet-album/:id | 펫 앨범 미디어 삭제(soft) |

#### POST /api/v1/pets/:petId/logs (질병 기록 생성)
```json
// Request
{
  "logtype_id": "uuid-blood_glucose_log",
  "event_date": "2026-03-01",
  "event_time": "08:30",
  "title": "아침 혈당",
  "notes": "공복 측정",
  "metadata": {
    "measurement_method": "libre"
  },
  "values": [
    {
      "metric_id": "uuid-blood_glucose",
      "unit_id": "uuid-mg_dl",
      "numeric_value": 185.0
    }
  ],
  "media": [
    { "media_url": "https://media.petlife.com/logs/...", "media_type": "image" }
  ]
}

// Response 201
{
  "id": "uuid",
  "pet_id": "uuid",
  "logtype": { "id": "uuid", "key": "blood_glucose_log" },
  "event_date": "2026-03-01",
  "event_time": "08:30",
  "values": [...],
  "media": [...],
  "alert": {
    "type": "low_glucose_warning",
    "message": "혈당이 정상 범위 이하입니다."
  },
  "created_at": "2026-03-01T08:31:00Z"
}
```

#### POST /api/v1/pets/:petId/logs/sync (오프라인 동기화)
```json
// Request
{
  "logs": [
    {
      "local_id": "local-uuid-1",
      "logtype_id": "uuid",
      "event_date": "2026-03-01",
      "sync_version": 1,
      "values": [...],
      "metadata": {...}
    }
  ]
}

// Response 200
{
  "synced": [
    { "local_id": "local-uuid-1", "server_id": "uuid", "sync_version": 2 }
  ],
  "conflicts": []
}
```

### 5.5 Feed API (Phase C4)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/v1/feeds | 피드 목록 |
| POST | /api/v1/feeds | 피드 작성 |
| POST | /api/v1/feeds/booking-completed/request | 공급자 완료게시물 공개요청 |
| POST | /api/v1/feeds/:id/approve | Guardian 승인/거절 |
| POST | /api/v1/feeds/:id/like | 좋아요 |
| DELETE | /api/v1/feeds/:id/like | 좋아요 취소 |
| GET | /api/v1/feeds/:id/comments | 댓글 목록 |
| POST | /api/v1/feeds/:id/comments | 댓글 작성 |

### 5.6 Provider API (Phase C4)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/v1/stores | 매장 생성 |
| PUT | /api/v1/stores/:id | 매장 수정 |
| GET | /api/v1/stores/:id | 매장 상세 |
| GET | /api/v1/stores | 매장 검색 |
| POST | /api/v1/stores/:id/services | 서비스 등록 |
| PUT | /api/v1/services/:id | 서비스 수정 |
| POST | /api/v1/services/:id/discounts | 할인 등록 |
| GET | /api/v1/bookings | Guardian/Provider 예약 목록 |
| POST | /api/v1/bookings | Guardian 예약 생성 |
| PUT | /api/v1/bookings/:id/status | 상태 전이 (created→in_progress→...) |
| POST | /api/v1/bookings/:id/completion-request | 완료사진 업로드 + 공개요청 |

### 5.7 Admin API

| Method | Endpoint | 설명 |
|--------|----------|------|
| CRUD | /api/v1/admin/master/categories | 카테고리 관리 |
| CRUD | /api/v1/admin/master/items | 아이템 관리 |
| CRUD | /api/v1/admin/master/disease-maps | 질병 연결 관리 |
| CRUD | /api/v1/admin/i18n | 언어관리 |
| GET | /api/v1/admin/i18n/audit?prefix=master. | 번역 누락/키누출 감사 |
| CRUD | /api/v1/admin/countries | 국가 관리 |
| CRUD | /api/v1/admin/currencies | 통화 관리 |
| CRUD | /api/v1/admin/ads | 광고 설정 |
| GET | /api/v1/admin/stats | 통계 대시보드 |

---

## 6. 인증/인가

### 6.1 JWT 구조

```json
// Access Token (1시간)
{
  "sub": "user-uuid",
  "role": "guardian",
  "iat": 1706000000,
  "exp": 1706003600
}
// Refresh Token: 7일, DB 또는 KV 저장
```

### 6.2 권한 매트릭스

| 리소스 | Guardian | Provider | Admin |
|--------|----------|----------|-------|
| Pet CRUD (자기 것) | ✅ | ❌ | ✅ |
| Log 생성 (자기 펫) | ✅ | ❌ | ✅ |
| Feed 작성 | ✅ | ❌ | ✅ |
| Store/Service CRUD | ❌ | ✅ | ✅ |
| Booking 수신/완료 | ❌ | ✅ | ✅ |
| 완료사진 업로드 | ❌ | ✅ | ✅ |
| Master/i18n 관리 | ❌ | ❌ | ✅ |
| 국가/통화 관리 | ❌ | ❌ | ✅ |
| 광고 설정 | ❌ | ❌ | ✅ |

### 6.3 미들웨어 체인

```
Request → CORS → Rate Limit → JWT 검증 → Role Guard → Handler
```

---

## 7. 오프라인 동기화 (SQLite)

### 7.1 범위
- 오프라인 저장: `logs` 테이블만 (질병 기록)
- Master/i18n: 앱 시작 시 캐시, 오프라인 시 캐시 사용

### 7.2 동기화 전략

```
[오프라인 입력]
    │
    ▼
SQLite에 저장 (is_synced=false, local_id)
    │
    ▼
[온라인 복귀]
    │
    ▼
POST /logs/sync (배치)
    │
    ├── 충돌 없음 → server_id 반환, is_synced=true
    └── 충돌 있음 → 마지막 수정 우선 + 변경 이력(sync_history) 저장
```

### 7.3 SQLite 로컬 스키마

```sql
CREATE TABLE local_logs (
    local_id        TEXT PRIMARY KEY,
    server_id       TEXT,
    pet_id          TEXT NOT NULL,
    logtype_id      TEXT NOT NULL,
    event_date      TEXT NOT NULL,
    event_time      TEXT,
    title           TEXT,
    notes           TEXT,
    metadata        TEXT,       -- JSON string
    values_json     TEXT,       -- JSON string
    is_synced       INTEGER DEFAULT 0,
    sync_version    INTEGER DEFAULT 0,
    created_at      TEXT,
    updated_at      TEXT
);
```

---

## 8. R2 미디어 스토리지

### 8.1 버킷 구조

```
pet-life-media/
├── avatars/
│   ├── users/{userId}/avatar.jpg
│   └── pets/{petId}/avatar.jpg
├── logs/{logId}/
│   ├── image_001.jpg
│   └── image_002.jpg
├── feeds/{feedId}/
│   └── image_001.jpg
├── completions/{bookingId}/
│   └── photo_001.jpg
├── stores/{storeId}/
│   └── cover.jpg
└── services/{serviceId}/
    └── photo_001.jpg
```

### 8.2 업로드 플로우

```
Client → GET /storage/presigned-url (type, ext)
    ← upload_url + public_url
Client → PUT upload_url (file body)
Client → POST /logs (media: [{ media_url: public_url }])
```

---

## 9. 위험 경고 로직

### 9.1 혈당 경고 규칙

```typescript
interface GlucoseAlertRule {
  low_critical: number;    // < 60 mg/dL → 긴급 저혈당 경고
  low_warning: number;     // < 80 mg/dL → 저혈당 주의
  high_warning: number;    // > 300 mg/dL → 고혈당 주의
  rapid_drop: number;      // 직전 기록 대비 -50 mg/dL 이상 급락 → 급락 경고
}
```

### 9.2 경고 응답 구조

```json
{
  "alert": {
    "type": "low_glucose_critical",
    "severity": "critical",
    "message_key": "alert.low_glucose_critical",
    "value": 55,
    "threshold": 60,
    "unit": "mg/dL"
  }
}
```

---

## 10. 광고 (AdMob) 통합

### 10.1 로직

```
앱 시작 → GET /ads/config
    │
    ├── global_enabled = false → 광고 전체 비표시
    │
    └── global_enabled = true
        │
        ├── 현재 화면이 건강/질병 기록? → no_health_zone=true → 비표시
        │
        └── 슬롯 is_enabled=true → AdMob 로드 (ad_unit_id)
            │
            └── 노출 시 → POST /ads/impression (카운팅)
```

---

## 11. 배포 구성

### 11.1 환경

| 환경 | 인프라 | URL |
|------|--------|-----|
| Staging | CF Workers (staging) + CF Pages (preview) | staging-api.petlife.com |
| Production | CF Workers (prod) + CF Pages (prod) | api.petlife.com |

### 11.2 CI/CD

```
GitHub Push
    │
    ├── Lint + TypeScript Check
    ├── Unit Tests
    ├── Build
    └── Deploy
        ├── services/api → wrangler deploy (Workers)
        ├── apps/admin-web → CF Pages
        ├── apps/guardian-web → CF Pages
        └── apps/mobile → Flutter Build (별도 파이프라인)
```

---

## 12. 보안 체크리스트

- [ ] HTTPS 전 구간 (Cloudflare 자동)
- [ ] JWT Access (1시간) + Refresh (7일)
- [ ] OAuth id_token 서버 측 검증
- [ ] Rate Limiting (IP + User 기반)
- [ ] SQL Injection 방지 (Parameterized Query)
- [ ] XSS 방지 (입력값 sanitize)
- [ ] CORS 화이트리스트
- [ ] R2 Presigned URL 만료 (5분)
- [ ] PII 암호화 저장
- [ ] 환경변수/시크릿 Workers Secrets 관리
