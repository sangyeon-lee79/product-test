# Pet Lifecycle SNS Platform — LLD.md
# 저수준 설계서 (Low-Level Design)
# Status: MVP Planning (PLAN.md 기준 정렬)

Petfolio
Your pet's life portfolio

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
               ──< logs ──< log_values
                        ──< log_media
     ──< feeds ──< feed_likes
               ──< feed_comments

[Provider 영역]
users ──< stores ──< store_industries (다중)
                  ──< services ──< service_discounts
                  ──< bookings ──< booking_completions
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
    is_neutered     BOOLEAN DEFAULT FALSE,
    microchip_no    VARCHAR(50),
    avatar_url      VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pets_guardian ON pets(guardian_id);
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
    author_id       UUID NOT NULL REFERENCES users(id),
    pet_id          UUID REFERENCES pets(id),
    content         TEXT,
    content_translations JSONB DEFAULT '{}',
    media_urls      TEXT[] DEFAULT '{}',         -- R2 URLs
    tags            TEXT[] DEFAULT '{}',
    like_count      INT DEFAULT 0,
    comment_count   INT DEFAULT 0,
    -- 바이럴 루프: 완료사진 공유 시
    source_type     VARCHAR(20),                 -- 'booking_completion' | NULL
    source_id       UUID,                        -- booking_completions.id
    provider_store_id UUID REFERENCES stores(id),
    visibility      VARCHAR(20) DEFAULT 'public',
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feeds_author ON feeds(author_id);
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
    feed_id     UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    parent_id   UUID REFERENCES feed_comments(id),
    status      VARCHAR(20) DEFAULT 'active',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_comments_feed ON feed_comments(feed_id, created_at);
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
    store_id        UUID NOT NULL REFERENCES stores(id),
    service_id      UUID NOT NULL REFERENCES services(id),
    guardian_id     UUID NOT NULL REFERENCES users(id),
    pet_id          UUID REFERENCES pets(id),
    status          VARCHAR(20) DEFAULT 'requested',
                    -- 'requested' | 'accepted' | 'completed' | 'cancelled'
    requested_date  DATE,
    requested_time  TIME,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_store ON bookings(store_id, status);
CREATE INDEX idx_bookings_guardian ON bookings(guardian_id);
```

#### booking_completions (완료사진 + 바이럴)
```sql
CREATE TABLE booking_completions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id),
    photo_urls      TEXT[] DEFAULT '{}',         -- R2 URLs
    message         TEXT,
    is_shared       BOOLEAN DEFAULT FALSE,       -- Guardian이 피드 공유 여부
    shared_feed_id  UUID REFERENCES feeds(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_completions_booking ON booking_completions(booking_id);
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
| POST | /api/v1/feeds/from-completion | 완료사진 1-click 공유 |
| POST | /api/v1/feeds/:id/like | 좋아요 |
| DELETE | /api/v1/feeds/:id/like | 좋아요 취소 |
| GET | /api/v1/feeds/:id/comments | 댓글 목록 |
| POST | /api/v1/feeds/:id/comments | 댓글 작성 |

#### POST /api/v1/feeds/from-completion (바이럴 루프)
```json
// Request
{
  "completion_id": "uuid",
  "caption": "우리 방울이 미용 완료! 🐾",
  "tags": ["grooming", "pomeranian"]
}

// Response 201 — 자동으로 매장 링크, 완료 사진 포함
{
  "id": "uuid",
  "media_urls": ["https://media.petlife.com/completions/..."],
  "provider_store": {
    "id": "uuid",
    "name": "해피 펫 미용실",
    "link": "https://petlife.com/stores/uuid"
  },
  "created_at": "..."
}
```

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
| GET | /api/v1/stores/:id/bookings | 예약 목록 |
| PUT | /api/v1/bookings/:id/accept | 예약 수락 |
| PUT | /api/v1/bookings/:id/complete | 예약 완료 |
| POST | /api/v1/bookings/:id/completion | 완료사진 업로드 |

### 5.7 Admin API

| Method | Endpoint | 설명 |
|--------|----------|------|
| CRUD | /api/v1/admin/master/categories | 카테고리 관리 |
| CRUD | /api/v1/admin/master/items | 아이템 관리 |
| CRUD | /api/v1/admin/master/disease-maps | 질병 연결 관리 |
| CRUD | /api/v1/admin/i18n | 언어관리 |
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
