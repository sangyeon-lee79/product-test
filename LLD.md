# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Mobile:** Flutter (Dart)
- **Backend:** Node.js (TypeScript) + Cloudflare Workers
- **Database:** PostgreSQL (Text Entity Model)

## 2. Database Schema (v2 Core)

### Text Entity Model
- `text_entities`: (id, domain, owner_id, original_text, converted_json, auto_generated)

### Master Data (Admin Owned)
- `categories`: (id, name_text_id, icon_url)
- `breeds`: (id, name_text_id, species)

### Provider Data (Provider Owned)
- `shops`: (id, owner_id, name_text_id, category_id, info_text_id)

### Pet Data (User Owned)
- `pets`: (id, owner_id, name_text_id, breed_id)

## 3. UI Rendering Rule
- **t(domain, key, entity_id):** 
  - `entity_id`가 있으면 `text_entities`에서 사용자 언어 값을 가져옴.
  - 없으면 `dictionary`에서 시스템 레이블을 가져옴.

## 4. Entry UI Component
- `ConversionInput`: [TextField] + [🌐 Button] -> [Editable Grid Modal]
