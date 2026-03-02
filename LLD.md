# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Text Management:** 3-Tier Separation (UI / Master / Entity)
- **Frontend:** Data-driven UI (No hardcoded strings)

## 2. Database Schema (v2 Core)

### A) UI Dictionary
- `ui_dictionary_keys`: (id, key, domain, description)
- `ui_dictionary_values`: (key_id, language, value)

### B) Master Data
- `master_domains`: (id, name)
- `master_items`: (id, domain_id, code, status, order)
- `master_item_values`: (item_id, language, value)

### C) Text Entities (Data Text)
- `text_entities`: (id, domain, original_text, original_lang, converted_json)

## 3. Implementation Logic

### Universal Translation Function `t(source, key, id)`
1. `source === 'ui'`: `ui_dictionary`에서 검색.
2. `source === 'master'`: `master_item_values`에서 검색.
3. `source === 'entity'`: `text_entities`에서 검색.

## 4. UI Rendering Rule
- `index.html` 내의 모든 텍스트 노드는 `data-ui-key` 혹은 `data-entity-id` 속성을 가져야 함.
- 페이지 로드 및 언어 변경 시 해당 속성을 가진 요소의 텍스트가 자동으로 업데이트됨.
