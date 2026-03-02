# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 중심은 '반려견'임.
- **Global Text System Separation:** 3-Tier Text Management (UI / Master / Entity).
- **Provider Autonomy:** 공급자는 자신의 상점(Store)을 관리하며, 예약 시에만 제한적으로 반려동물 정보에 접근 가능.
- **Master-Driven Commerce:** 상품은 관리자 마스터 카탈로그에서 선택, 서비스는 공급자가 생성.

## 2. User Roles & Account
- **ADMIN:** 시스템 마스터, 상품 마스터, UI 관리.
- **PROVIDER:** 상점 프로필, 인벤토리(상품/서비스), 예약 관리. (1 계정 = 1 상점 MVP)
- **USER:** 반려동물 등록, 예약, 커뮤니티 활동.

## 3. Core UX Flows

### Flow 1: Provider Setup (Store Profile)
- [Signup] -> [Select Country] (Admin Master) -> [Auto Currency] -> [Select Industries] (Multi-select) -> [Store Details].
- *Rule:* Currency is fixed by Country.

### Flow 2: Inventory Management
- **Products:** [Admin Catalog] -> [Select Item] -> [Set Price/Stock] -> [On/Off].
- **Services:** [Create Service] -> [Input Name/Price/Duration] -> [Select Industry] -> [Save].

### Flow 3: Reservation & Pet Data Access
- [User Booking] -> [Provider Accept] -> [Access Granted].
- *Permission:* Provider views only pet history matching their Store Industries (e.g., Grooming shop sees Grooming history).

### Flow 4: Promotions & SNS
- [Create Promo] -> [Select Target (Service/Product)] -> [Set Discount] -> [SNS Promote Button] -> [Feed Post Generated].

## 4. Language System UX
- **Triple-Source Rendering:** `t(source, key)` 함수 사용.
- **Universal Editor Modal:** 페이지 정보 및 13개 국어 편집 기능 제공.
