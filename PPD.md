# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
... (기존 내용)
- **Master Menu Principle:** 모든 선택값(품종, 업종 등)은 관리자가 등록한 마스터 데이터에서만 기원함.
- **Dropdown Selection Rule:** 사용자는 품종, 업종, 서비스 등을 선택할 때 오직 드롭다운만 사용 가능 (텍스트 입력 금지).
- **Global Label Propagation:** 관리자가 마스터 메뉴를 수정하면 전 시스템의 드롭다운 레이블이 실시간 동기화됨.


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
