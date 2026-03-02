# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 최상위 엔티티는 '반려견'임. 모든 기록은 견체공학적으로 누적됨.
- **Universal Text Conversion v2:** UI 레이블 및 사용자가 입력한 모든 문자열 데이터를 13개 국어로 관리.
- **Distributed API Model:** 플랫폼 비용 절감을 위해 사용자가 본인의 Google API Key를 사용하여 번역 리소스를 공급하는 구조.
- **Universal Edit Rule:** 관리자는 시스템의 모든 요소(메뉴명, 사용자 정보, 반려동물 정보)를 실시간으로 수정 및 번역할 수 있음.
- **SNS-style Feed Timeline:** 의료, 미용 등 모든 기록을 SNS 피드 형식으로 제공하여 시각적 연속성 확보.

## 2. User Roles & Account
- **ADMIN:** 마스터 데이터(품종, 질병 등) 및 시스템 메뉴 관리. 전 영역 수정 권한 보유.
- **PROVIDER (Shop/Hospital):** 자신의 업체 정보를 등록(🌐 변환 사용)하고 서비스를 제공.
- **USER (Owner):** 반려동물을 등록(🌐 변환 사용)하고 타임라인을 소비하며, 개인 번역 API 설정 가능.

## 3. Core UX Flows (Updated)

### Flow 1: 전 영역 텍스트 수정 (Admin)
- [Admin-View] 메뉴명 혹은 데이터 옆의 📝 버튼 클릭 -> [Universal-Editor] 13개 국어 수정 및 저장 -> [Global-Sync] 시스템 즉시 반영.

### Flow 2: 개인 API 연동 및 데이터 등록
- [Settings] 유저가 본인의 API Key 입력 -> [Registration] 텍스트 입력 시 현재 언어를 원본으로 인식하여 본인의 리소스로 13개 국어 자동 생성.

### Flow 3: 다국어 데이터 소비
- 사용자가 상단 언어 선택기를 변경하면 모든 마스터 데이터와 업체 정보가 해당 언어로 즉시 전환됨.

## 4. Language System UX
- **Context-Aware Detection:** 입력 시 현재 UI 언어를 Source Language(ORG)로 자동 설정.
- **Universal Editor Modal:** 일관된 13개 국어 편집 그리드 UI 제공.
