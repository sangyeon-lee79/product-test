# LLD.md - Low Level Design (Bang-ul Play)

## 1. System Architecture & Tech Stack
- **Mobile:** Flutter (Dart) - Material 3 standard.
- **Backend:** Node.js (TypeScript) + Express/Cloudflare Workers.
- **Database:** PostgreSQL.
- **Localization:** 13-Language Global Text System (Admin Controlled).

## 2. Database Schema (v2 MVP Core)

### 2.1 Global Text Systems
- `ui_dictionary`: (key, domain, values_json[13])
- `master_domains`: (id, name, description)
- `master_items`: (id, domain_id, code, status, order)
- `master_item_values`: (item_id, lang, value)
- `text_entities`: (id, domain, original_text, original_lang, converted_json[13], is_manual)

### 2.2 Role & User System
- `users`: (id, email, oauth_provider, current_role)
- `user_roles`: (user_id, role_type[USER, PROVIDER, ADMIN]) - Additive roles.
- `user_settings`: (user_id, google_api_key, preferred_lang)

### 2.3 Provider & Commerce
- `provider_profiles`: (id, owner_id, name_entity_id, address_entity_id, phone, country_master_id, currency_code, industry_item_ids[ ])
- `provider_services`: (id, provider_id, name_entity_id, price, duration, industry_master_id, is_active)
- `master_products`: (id, name_entity_id, manufacturer, specs_json, category_id)
- `provider_inventory`: (id, provider_id, master_product_id, selling_price, stock_qty, is_active)
- `reservations`: (id, user_id, pet_id, provider_id, service_id, status, scheduled_at)

### 2.4 Pet & Health
- `pets`: (id, owner_id, name_entity_id, breed_master_id, sex, birthdate, microchip_no)
- `pet_conditions`: (id, pet_id, condition_master_id, diagnosed_at, status)
- `daily_logs`: (id, pet_id, date, type[diet, metric, mood], data_json)

## 3. Implementation Logic

### 3.1 Multi-Source Translation `t(source, key, id)`
- **Roles & Static Labels:** All roles (Admin, Provider, User) are stored in `ui_dictionary` and must be editable.
- **Master Creation:** Any new item (Industry, Breed, etc.) must trigger the 13-language conversion grid before saving.

### 3.2 Master Admin 'Add New' Flow
1. Click '+ Add New'
2. Open Create Form with 🌐 Translation Button
3. Generate/Edit 13-lang JSON
4. Save as `text_entity` linked to Master Item.

### 3.2 Provider Permission Scoping
- **Pet Data Access:** `SELECT * FROM timeline WHERE pet_id = :id AND category IN (SELECT industry_ids FROM provider_profiles WHERE owner_id = :me)`
- Access only valid when a non-canceled reservation exists.

### 3.3 Currency & Country Mapping
- `master_countries`: (id, name_entity_id, iso_code, currency_code, currency_symbol)
- When `provider.country_id` changes, `provider.currency_code` is updated via lookup.

## 4. UI/UX Components (Material 3)
- **Shared Shell:** NavigationRail (Desktop) / NavigationBar (Mobile).
- **List-First Pattern:** `BaseListView` -> `BaseDetailView` -> `BaseFormModal`.
- **Conversion Trigger:** `GlobeButton` component attached to `TextFormField`.
