# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Frontend:** Pure JS + CSS (Web Components Style)
- **State Management:** LocalStorage-based persistence for v1
- **Testing:** Playwright MCP (Automated UI/UX Testing)
- **Translation:** Distributed Client-side API (Google Translate API)

## 2. Database Schema (v2 Core)

### Master Menu System (Mandatory)
- `master_domains`: (id, name) [industry, breed, service, condition, food, sns_tag]
- `master_items`: (id, domain_id, code, status, order)
- `master_item_values`: (item_id, language, value) -> 13 langs per item

### Consumer Integration
- `shops.industry_item_id` -> `master_items.id`
- `pets.breed_item_id` -> `master_items.id`
- 모든 드롭다운은 `master_items.id`를 저장하고, `master_item_values`를 통해 현재 언어 레이블을 렌더링함.

### User Settings (Distributed API)
- `google_api_key`: Stored securely in client-side storage or user profile.

## 3. Implementation Logic

### Unified Translation Function `t()`
1. If `entity_id` exists:
   - return `converted_json[currentLang]`
   - if null, return `original_text`
2. Else:
   - look up in static `dictionary`

### Universal Editor Workflow
- `openUniversalEditor(entityId)`: 
  - Fetches `text_entity` by ID.
  - Renders 13-input grid.
  - Updates `converted_json` on Save.

## 4. UI Rendering Rule
- 모든 텍스트는 `text_entity` 조회를 거쳐야 하며, 관리자 권한 시 📝 버튼이 동적으로 생성됨.
