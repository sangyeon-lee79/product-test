# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 중심은 '반려견'임.
- **Universal Text Conversion v2:** 모든 문자열 데이터(샵명, 업종명, 반려견명 등)는 등록 시점에 13개 국어로 변환되어 `text_entity`로 관리됨.
- **Role-Based Data Entry:**
  - **Admin:** 업종(Category), 품종(Breed), 질병(Condition) 등 마스터 데이터 등록 (🌐 변환 사용).
  - **Provider (Shop/Hospital):** 업체명, 서비스명, 설명 등 등록 (🌐 변환 사용).
  - **User (Owner):** 반려견 이름 등록 (🌐 변환 사용).
- **Selection-Based Usage:** 일반 사용자는 이미 번역/등록된 데이터를 '선택'하여 사용함 (직접 입력 최소화).

## 2. User Roles & Account
- **ADMIN:** 시스템 마스터 데이터 관리.
- **PROVIDER:** 서비스 제공자 (병원, 미용샵, 호텔 등).
- **USER:** 반려견 소유자 및 일반 사용자.

## 3. Core UX Flows (Data Lifecycle)

### Flow 1: 마스터 데이터 등록 (Admin)
- [Admin-Panel] 새로운 업종명 입력 -> [🌐 변환] 13개 국어 생성 및 검수 -> [Save] 전역 선택 리스트에 반영.

### Flow 2: 업체/샵 등록 (Provider)
- [Shop-Signup] 샵 이름 입력 -> [🌐 변환] 글로벌 샵 이름 생성 -> [Select-Category] 관리자가 등록한 업종 중 선택.

### Flow 3: 서비스 이용 및 기록 (User)
- [Pet-Registration] 강아지 이름 입력 (🌐 변환 사용) -> [Booking] 등록된 샵 선택 -> [Record] 완료된 서비스(미용/진료 등) 항목 선택.

## 4. Language System UX
- **Data Entry UI:** 문자열 입력 필드 우측에 반드시 🌐 버튼 배치. 클릭 시 13개 국어 편집 그리드 노출.
- **Consumer UI:** 사용자의 설정 언어에 맞춰 `text_entity`의 변환된 값만 노출.
