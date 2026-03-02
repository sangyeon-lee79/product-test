# LLD.md - Low Level Design & Architecture (방울아놀자)

## 1. System Architecture
- **Text Management:** 3-Tier Separation (UI / Master / Entity)
- **UI Management:** Page-based filtering & mapping

## 2. Database Schema (v2 Core)

### A) UI Dictionary (Expanded)
- `ui_dictionary_keys`: 
  - `id`: UUID
  - `key`: VARCHAR
  - `domain`: VARCHAR
  - `description`: TEXT
- `ui_dictionary_values`: (key_id, language, value)
- `ui_dictionary_key_pages`: (id, key_id, page) -> 페이지-키 매핑 테이블

## 3. Implementation Logic

### Universal Translation Function `t(source, key, id)`
... (기존 내용)

### UI Dictionary Page Management
- **Page Enum:** `index`, `login`, `signup`, `dashboard_user`, `dashboard_provider`, `dashboard_admin`, `pet_profile`, `settings`, `feed`, `reservation`, `shop_profile`
- **Current Value Priority:** 1. 해당 언어 번역값 -> 2. 기본 언어값 (ko) -> 3. "—"

## 4. UI Rendering Rule
- `data-ui-key` 속성을 통해 페이지별 키 식별.
- `renderAll()` 실행 시 현재 보기 모드에 따라 UI 사전 목록 재생성.
