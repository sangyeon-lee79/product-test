# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Text Management:** 3-Tier Separation (UI / Master / Entity)
- **Frontend:** Data-driven UI (No hardcoded strings)

## 2. Database Schema (v2 Core + Provider System)

### A) UI Dictionary & Master Data
- `ui_dictionary_keys/values`, `master_domains/items/values` (Existing)
- **New Masters:**
  - `master_countries`: (id, name_text_id, currency_code, currency_symbol)
  - `master_products`: (id, name_text_id, category_id, specs_json, image_url)

### B) Provider System
- `provider_profiles`:
  - `id`: UUID
  - `owner_id`: UUID
  - `store_name_text_id`: FK -> text_entities
  - `country_id`: FK -> master_countries
  - `currency_code`: VARCHAR (Auto from country)
  - `industry_ids`: JSON array (e.g. ["grooming", "hotel"])
- `provider_services`:
  - `id`: UUID
  - `provider_id`: FK
  - `name_text_id`: FK
  - `price`: DECIMAL (Store Currency)
  - `industry_id`: FK -> master_items (Scope)
- `provider_products`:
  - `id`: UUID
  - `provider_id`: FK
  - `master_product_id`: FK -> master_products
  - `selling_price`: DECIMAL
  - `stock_qty`: INT
  - `is_active`: BOOLEAN

### C) Commerce & Reservations
- `reservations`:
  - `id`: UUID
  - `pet_id`: FK
  - `provider_id`: FK
  - `service_id`: FK (Optional)
  - `status`: (requested, accepted, completed, canceled)
  - `date_time`: TIMESTAMP
- `promotions`:
  - `id`: UUID
  - `provider_id`: FK
  - `target_type`: (service, product)
  - `target_id`: UUID
  - `discount_type`: (percent, fixed)
  - `value`: DECIMAL

## 3. Implementation Logic

### Currency Handling
- Frontend displays prices with `store.currency_symbol`.
- No currency conversion logic in MVP storage (store raw values).

### Permission Logic (Pet Data)
- `getPetDataForProvider(petId, providerId)`:
  - Fetch `provider.industry_ids`.
  - Fetch `pet.timeline_events` where `event.category` IN `provider.industry_ids`.
  - Return filtered list + Basic Profile.

## 4. UI Rendering Rule
- `data-ui-key` for labels.
- `master_items` for dropdowns.
- `text_entities` for user content.
