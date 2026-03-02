# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Mobile:** Flutter (Dart)
- **Backend:** Node.js (TypeScript) + Cloudflare Workers
- **Database:** PostgreSQL
- **Storage:** Cloudflare R2

## 2. Database Schema (Core)

### Pet Table
- `id`: UUID (Primary Key)
- `owner_id`: UUID (Foreign Key to users)
- `name`: VARCHAR
- `breed_code`: VARCHAR (Foreign Key to dictionary)
- `sex`: ENUM (MALE, FEMALE)
- `birthdate`: DATE
- `weight_kg`: DECIMAL
- `is_neutered`: BOOLEAN
- `microchip_id`: VARCHAR (UNIQUE)
- `photo_url`: TEXT

### Condition System
- `condition_types`: (id, category, code, default_severity)
- `pet_conditions`: (id, pet_id, condition_code, diagnosed_date, status)

### Daily Metrics
- `daily_metrics`: (id, pet_id, metric_code, value, unit, source, recorded_at)

### Timeline Events
- `timeline_events`: (id, pet_id, event_type, ref_id, recorded_at)

### Dictionary System
- `dictionary_entries`: (id, domain, key, code)
- `dictionary_values`: (id, entry_id, lang_code, value)

## 3. API Design (v1)

### Auth
- `POST /api/v1/auth/signup`: 회원가입 (Role 선택)
- `POST /api/v1/auth/login`: 로그인

### Pets
- `GET /api/v1/pets`: 내 반려견 목록
- `POST /api/v1/pets`: 반려견 등록
- `GET /api/v1/pets/:id/timeline`: 타임라인 조회

### Dictionary
- `GET /api/v1/dictionary/:lang`: 특정 언어 사전 데이터

## 4. UI Rendering Rule
- 모든 문자열은 `t(domain, key)` 함수를 통해 렌더링.
- 클라이언트는 부팅 시 `dictionary_values`를 로드하여 캐싱.
