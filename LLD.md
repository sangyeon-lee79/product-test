# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Frontend:** Pure JS + CSS (Web Components Style)
- **State Management:** LocalStorage-based persistence for v1
- **Testing:** Playwright MCP (Automated UI/UX Testing)
- **Translation:** Distributed Client-side API (Google Translate API)

## 2. Database Schema (v2 Core)

### Universal Text Entity Model
- `text_entities`:
  - `id`: Unique identifier (referenced by menus, master items, shops, pets)
  - `domain`: category (menu, breed, shop, etc.)
  - `original_text`: The first entered text
  - `original_lang`: Code of the first entered language (Source)
  - `converted_json`: JSON object containing 13 language values
  - `auto_generated`: Boolean flag (false if user edited)

### Registry Structure
- `menu_items`: (id, label_text_id) -> DB-driven menu names
- `master_registry`: (domain, item_list: text_entity_id[])
- `shop_registry`: (id, owner_id, name_text_id)

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
