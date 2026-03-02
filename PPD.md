# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 중심은 '반려견'임.
- **Global Text System Separation:** 플랫폼의 모든 텍스트는 3가지 소스(UI Dictionary, Master Data, Data Text Entity)로 엄격히 분리되어 관리됨.
- **Hard-code Prohibition:** 시스템 전체에서 하드코딩된 문자열 사용을 금지하며, 모든 문구는 다국어 엔진을 거쳐 렌더링됨.
- **Universal Edit Rule:** 관리자는 시스템의 모든 요소(UI 문구 포함)를 실시간으로 수정 및 번역할 수 있음.

## 2. User Roles & Account
- **ADMIN:** UI Dictionary, 마스터 데이터, 시스템 메뉴 관리. 전 영역 수정 권한 보유.
- **PROVIDER (Shop/Hospital):** 자신의 업체 정보를 등록하고 서비스를 제공.
- **USER (Owner):** 반려동물을 등록하고 타임라인을 소비.

## 3. Core UX Flows (Updated)

### Flow 1: UI Dictionary 관리 (Admin)
- [Admin-View] UI 문구(예: '저장', '취소') 수정 -> [Global-Sync] 모든 대시보드의 버튼 문구 즉시 반영.

### Flow 2: 마스터 데이터 및 드롭다운
- [Admin] 마스터 항목(품종 등) 등록 -> [User/Provider] 드롭다운에서 번역된 마스터 항목 선택 사용.

### Flow 3: 개인 데이터 등록
- [Owner/Shop] 텍스트 입력(샵명 등) -> [Text-Entity] 자동 번역 및 13개 국어 엔티티 생성 -> [Feed] 다른 유저에게 번역된 상태로 노출.

## 4. Language System UX
- **Triple-Source Rendering:** `t(source, key)` 함수를 통해 소스별(UI/Master/Entity) 텍스트를 정합성 있게 출력.
- **Universal Editor Modal:** 모든 소스의 텍스트를 수정할 수 있는 공통 편집 인터페이스 제공.
