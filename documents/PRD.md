# PRD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 중심은 '반려견'임.
- **Global Text System Separation:** 3-Tier Text Management (UI / Master / Entity).
- **List-First UI Pattern:** 모든 등록 및 관리 화면은 '목록 조회'가 선행되어야 함 (List -> Create/Edit).
- **Provider Autonomy:** 공급자는 자신의 상점을 관리하며, 설정된 국가에 따라 통화(Currency)가 자동 결정됨.

## 2. User Roles & Account
- **ADMIN:** 시스템 마스터, 상품 마스터, UI 관리.
- **PROVIDER:** 상점 프로필, 인벤토리, 예약 관리.
- **USER:** 반려동물 등록, 예약, 커뮤니티 활동.

## 3. Core UX Flows

### Flow 1: List-First Admin/Provider Flow
- [List Page] 모든 항목 목록 확인 -> [Add Button] 클릭 시 생성 폼 -> [Item Click] 클릭 시 상세/수정 폼.

### Flow 2: Provider Store Profile (Fixed)
- [Entry] 상점 프로필 관리 클릭.
- [Check] 프로필 존재 여부 확인.
  - 없음: 생성 폼(Create Form) 노출.
  - 있음: 상세/수정 페이지(Edit Page) 노출.
- [Form Fields]
  - 상점명 (Text + 🌐)
  - 주소 (Text + 🌐)
  - 전화번호
  - 국가 (Admin Master Dropdown)
  - 통화 (Auto-derived from Country, Read-only)
  - 업종 (Admin Master Multi-select)

### Flow 3: Currency & Pricing
- 상점의 국적에 따라 모든 서비스/상품의 가격 통화가 고정됨.

## 4. Language System UX
- **Triple-Source Rendering:** `t(source, key)` 함수 사용.
- **Optional Translation:** 🌐 버튼은 텍스트 필드 옆의 보조 도구로만 존재하며, 폼 자체를 대체하지 않음.
