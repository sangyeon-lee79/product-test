# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 중심은 '반려견'임.
- **Universal Text Conversion v2:** 모든 문자열 데이터(메뉴 포함)는 13개 국어로 변환되어 `text_entity`로 관리됨.
- **Distributed API Model:** 플랫폼 비용 절감을 위해 개인 유저가 본인의 Google API 리소스를 연동하여 번역을 수행할 수 있음.
- **Universal Edit Rule:** 관리자는 시스템의 모든 요소(메뉴, 사용자 정보, 반려동물 정보)를 🌐 버튼을 통해 즉시 수정 및 번역 가능함.

## 2. User Roles & Account
- **ADMIN:** 시스템 마스터 데이터 및 메뉴 관리.
- **PROVIDER:** 서비스 제공자 (병원, 미용샵 등).
- **USER:** 반려견 소유자. 개인 번역 API 설정 가능.

## 3. Core UX Flows (Data Lifecycle)

### Flow 1: 마스터 데이터 및 메뉴 수정 (Admin)
- [Admin-Panel] 기존 메뉴명 클릭 -> [🌐 Edit] 13개 국어 수정 그리드 노출 -> [Save] 실시간 시스템 반영.

### Flow 2: 개인 API 설정 (User/Provider)
- [Settings] 본인의 Google API Key 입력 -> [Registration] 텍스트 입력 시 본인의 API를 사용하여 13개 국어 자동 생성.

### Flow 3: 데이터 소비 (Selection-Based)
- 일반 사용자는 관리자/업체가 번역해 놓은 고품질의 데이터를 선택하여 사용.

## 4. Language System UX
- **Data Entry UI:** 문자열 입력 필드 옆에 🌐 배치.
- **Universal Editor:** 모든 리스트의 아이템 옆에 [📝 수정] 버튼 배치 -> 클릭 시 언어 변환 그리드 모달 노출.
