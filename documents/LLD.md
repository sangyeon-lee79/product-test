# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Mobile App:** Flutter (Dart)
- **UI Design Baseline:** Material 3 Guidelines (m3.material.io)
- **Spacing Scale:** 8dp increment (8, 16, 24, 32...)

## 2. UI Pattern Implementation

### A) List-First Pattern (Component)
- `DomainList`: 카드형 목록 UI (M3 Card pattern).
- `DomainForm`: 섹션별 그룹화된 입력 폼.

### B) Provider Profile Flow Machine
```javascript
function renderProviderUI() {
    if (currentStore) {
        renderStoreDetailView(currentStore); // List/Detail context
    } else {
        renderStoreCreateForm(); // Initial registration
    }
}
```

## 3. Database Schema (Refined)

### Master Data (M3 Selection Context)
- `master_countries`: (id, name_text_id, currency_code, currency_symbol)
- `master_industries`: (id, name_text_id, icon_type)

### Provider Store (Profile)
- `provider_profiles`:
  - `store_name_text_id`: Text Entity
  - `address_text_id`: Text Entity
  - `country_id`: Master Country FK
  - `currency_code`: Read-only (Derived)
  - `industry_ids`: Array of Master Industry FKs

## 4. Visual Standards (M3 Reference)
- **Typography:** Display, Headline, Title, Body, Label scales.
- **Color:** Surface, On-Surface, Primary, Secondary, Variant colors.
- **Elevation:** Tonal surfaces instead of heavy drop shadows.
