# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Mobile:** Flutter (Dart)
- **Backend:** Node.js (TypeScript) + Cloudflare Workers
- **Database:** PostgreSQL (Universal Text Entity Reference)

## 2. Database Schema (v2 Core)

### User Settings
- `user_settings`: (user_id, google_api_key, preferred_lang)

### Text Entity Model (Universal)
- 모든 테이블의 `name`, `label`, `description` 컬럼은 `text_entities.id`를 참조함.
- **Menu Entities:** 'Master Data Studio', 'Users', 'Pets' 등의 메뉴명도 DB화되어 관리됨.

### Foreign Key Registry
- `menu_items.label_text_id` -> `text_entities.id`
- `master_items.name_text_id` -> `text_entities.id`
- `users.name_text_id` -> `text_entities.id`
- `pets.name_text_id` -> `text_entities.id`

## 3. UI Rendering Rule
- **t(domain, key, entity_id):** 
  - `entity_id`가 있는 모든 요소는 텍스트를 클릭하거나 수정 버튼을 통해 언어별 편집 모드로 진입 가능.

## 4. Universal Editor Component
- `ConversionGrid`: [Input Grid for 13 Langs]
- `APIConnector`: 사용자의 개인 Google API Key를 사용하여 클라이언트 사이드에서 번역 요청 수행.
