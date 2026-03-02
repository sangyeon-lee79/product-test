# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Mobile:** Flutter (Dart)
- **Backend:** Node.js (TypeScript) + Cloudflare Workers
- **Database:** PostgreSQL (Text Entity Model)

## 2. Database Schema (v2 Core)

### Master Data System
- `master_domains`: (id, name, description, editable_by)
- `master_items`: (id, domain_id, code, status)
- `master_item_values`: (item_id, lang, value, source)

### Analytics Data (Dashboard)
- `platform_stats`: (date, total_users, total_pets, total_bookings, sns_engagement)
- `provider_analytics`: (shop_id, booking_count, completion_rate)
... (기존 내용)

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
