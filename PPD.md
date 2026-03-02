# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 중심은 '반려견'임.
- **Global Text System Separation:** 플랫폼의 모든 텍스트는 3가지 소스(UI Dictionary, Master Data, Data Text Entity)로 엄격히 분리되어 관리됨.
- **Page-based UI Management:** UI 키를 페이지 단위로 그룹화하여 관리 효율성을 높임.
- **Hard-code Prohibition:** 시스템 전체에서 하드코딩된 문자열 사용을 금지함.

## 2. User Roles & Account
- **ADMIN:** UI Dictionary(페이지별 관리 포함), 마스터 데이터, 시스템 메뉴 관리.
- **PROVIDER (Shop/Hospital):** 자신의 업체 정보를 등록하고 서비스를 제공.
- **USER (Owner):** 반려동물을 등록하고 타임라인을 소비.

## 3. Core UX Flows (Updated)

### Flow 1: UI Dictionary 관리 (Admin)
- [Admin-View] 보기 모드 전환(전체/페이지별) -> [Page-Select] 특정 페이지 선택 시 관련 키만 필터링 -> [Key-List] 키 옆에 현재 언어 표시값 확인 -> [📝 Edit] 수정 모달 오픈.

### Flow 2: 마스터 데이터 및 드롭다운
... (기존 내용)

## 4. Language System UX
- **Triple-Source Rendering:** `t(source, key)` 함수 사용.
- **Current Lang Visibility:** UI 사전 관리 목록에서 현재 언어 기준 번역값을 즉시 확인 가능.
- **Universal Editor Modal:** 페이지 정보 및 13개 국어 편집 기능 제공.
