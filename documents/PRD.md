# PRD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 데이터의 중심은 '반려견'임.
- **Flutter & Material 3:** 모바일 앱은 Flutter를 사용하며, UI/UX는 Material 3 디자인 원칙을 계승함.
- **Visual Consistency:** Admin/Provider/User 모든 대시보드는 동일한 M3 기반의 간격(8dp), 타이포그래피, 상호작용 패턴을 공유함.
- **List-First UX:** 모든 관리 화면은 목록(List)을 먼저 보여준 후 상세/수정(Edit)으로 진입함.

## 2. User Roles & Account
- **ADMIN:** 시스템/상품 마스터 및 UI Dictionary 관리.
- **PROVIDER:** 상점 프로필(Fix), 인벤토리, 예약 관리.
- **USER:** 반려동물 관리, 예약, 커뮤니티 활동.

## 3. Core UX Flows

### Flow 1: Material 3 Design Reference
- **Spacing:** 8dp 그리드 시스템 적용.
- **Surfaces:** M3의 Elevation 및 Surface 색상 체계 반영.
- **Forms:** 섹션 그룹화, 라벨+헬퍼 텍스트, 명확한 기본/보조 버튼 구조.

### Flow 2: Provider Store Profile (Fixed)
- **Logic:** 프로필 부재 시 '생성 폼', 존재 시 '상세/수정 페이지' 노출.
- **Fields:** 상점명, 주소, 전화번호, 국가(Dropdown), 통화(Auto), 업종(Multi).
- **Rule:** 국가는 Admin 마스터에서 선택하며, 통화는 입력 불가능(자동 매핑).

### Flow 3: List-First Navigation
- 모든 등록 도메인은 [목록 조회] -> [아이템 선택/수정] 혹은 [신규 생성]의 흐름을 따름.

## 4. Language System UX
- **Triple-Source:** UI / Master / Entity 분리 렌더링.
- **Optional 🌐:** 텍스트 필드 옆 보조 도구로만 활용 (폼 대체 금지).
