# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Document Management:** All docs managed in `/documents` folder.
- **UI Pattern:** List-First architecture for all management modules.

## 2. Database Schema (Updated)

### A) Master Countries & Currencies
- `master_countries`:
  - `id`: UUID
  - `name_text_id`: FK -> text_entities
  - `currency_code`: VARCHAR (e.g., KRW, USD)
  - `currency_symbol`: VARCHAR (e.g., ₩, $)

### B) Provider Profiles (Fixed)
- `provider_profiles`:
  - `id`: UUID
  - `owner_id`: UUID
  - `store_name_text_id`: FK -> text_entities
  - `address_text_id`: FK -> text_entities
  - `phone_number`: VARCHAR
  - `country_id`: FK -> master_countries
  - `currency_code`: VARCHAR (Derived from country)
  - `industry_ids`: JSONB (Array of master_items.id)

## 3. Implementation Logic

### Store Profile Flow Machine
```javascript
function renderStoreProfile() {
    if (!currentStore) {
        showCreateForm(); // Shop Name, Address, Phone, Country (Dropdown), Industries (Multi)
    } else {
        showEditPage(currentStore);
    }
}
```

### Country-Currency Auto-Mapping
- `onCountryChange(countryId)`:
  - Find country in `master_countries`.
  - Update `store.currency_code` and display symbol.

## 4. UI Rendering Rule
- **List Page:** Default entry point for all domains.
- **Edit/Create Modal:** Context-aware forms.
- **Translation:** Supplemental 🌐 tool next to text inputs.
