# LLD.md - Low Level Design (Bang-ul Play)

## 1. Database Schema Refinement

### 1.1 Master Data Module
- `master_categories`:
  - `id`: UUID (PK)
  - `category_key`: VARCHAR (Unique, ex: 'industry', 'breed')
  - `is_active`: BOOLEAN (Default: true)
- `master_items`:
  - `id`: UUID (PK)
  - `category_id`: FK -> master_categories.id
  - `item_key`: VARCHAR (Unique within category)
  - `sort_order`: INT
  - `is_active`: BOOLEAN

### 1.2 Universal Translation Module
- `languages`:
  - `code`: VARCHAR(5) (PK, ex: 'ko', 'en')
  - `name`: VARCHAR
  - `is_active`: BOOLEAN
- `translations`:
  - `id`: UUID (PK)
  - `translation_key`: VARCHAR (Unique index, ex: 'ui.save', 'industry.grooming.name')
  - `target_type`: VARCHAR (ui, system, master_item)
  - `target_ref_id`: UUID (Optional reference)
  - `language_code`: FK -> languages.code
  - `text_value`: TEXT
  - `updated_at`: TIMESTAMP

### 1.3 Country & Currency Module
- `countries`:
  - `id`: UUID (PK)
  - `country_code`: VARCHAR(2) (Unique, ex: 'KR')
  - `is_active`: BOOLEAN
- `currencies`:
  - `code`: VARCHAR(3) (PK, ex: 'KRW')
  - `symbol`: VARCHAR(5)
- `country_currency_map`:
  - `country_id`: FK -> countries.id
  - `currency_code`: FK -> currencies.code
  - `is_default`: BOOLEAN (Default: true)

## 2. Implementation Logic

### 2.1 Unified Rendering `t(key)`
- 플랫폼은 `translation_key`를 기반으로 현재 언어(`currentLang`)에 맞는 `text_value`를 `translations` 테이블에서 조회하여 반환함.
- **Priority:** Target Language Value -> Default Language (ko) Value -> Key itself.

### 2.2 Provider Currency Auto-Sync
- 공급자가 `country_id` 선택 시, `country_currency_map`에서 `is_default=true`인 `currency_code`를 자동으로 fetch하여 상점 프로필에 저장함.
- 상점 엔티티의 모든 하위 금액 필드는 이 `currency_code`를 상속받음.
