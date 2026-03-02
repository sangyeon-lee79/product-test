# PRD.md - Product Requirements Document (Bang-ul Play)

## 1. Product Principles & Goals
- **Pet-Centricity:** 모든 기록의 상위 엔티티는 '반려견'이며, 생애 주기를 관통하는 데이터 연속성을 보장함.
- **100% Global Text System:** 하드코딩 텍스트를 0%로 제한하며, 모든 시스템 값은 관리자가 13개 국어로 마스터 등록하고 유저는 '선택'만 함.
- **Structured Data Selection:** 유저의 수기 입력을 최소화하고 드롭다운/마스터 기반의 정형 데이터 입력을 유도하여 데이터 분석 품질을 높임.
- **Role-Based Collaboration:** 유저(보호자), 공급자(샵/병원), 관리자(마스터)가 유기적으로 데이터를 공유(권한 기반)하는 생태계 구축.

## 2. Global Text System Rules
- **Source Separation:** UI Dictionary (인터페이스) / Master Data (선택값) / Text Entities (유저 내용) 3계층 분리.
- **Administrative Control:** 마스터 어드민은 시스템의 모든 텍스트(메뉴, 레이블, 드롭다운 값)를 13개 국어로 수정 가능함.
- **Optional Conversion:** 유저/공급자가 직접 입력하는 텍스트는 🌐 버튼을 통한 언어변환 옵션을 제공하되, 사용하지 않을 경우 원본 언어 1개만 저장.

## 3. Detailed Dashboard Requirements

### 3.1 User (Pet Owner)
- **Registration:** 펫 등록 시 견종, 질병 코드를 마스터 데이터에서 선택.
- **Daily Log:** 일일 상태, 식단, 수치 기록 (선택 기반).
- **Social Feed:** 로그인 후 열람 가능. 상호작용 기반 랭킹 알고리즘 적용.
- **Reservations:** 공급자가 등록한 서비스 선택 및 예약 요청.

### 3.2 Provider (Store/Merchant)
- **Store Profile:** 국가 선택 시 통화(Currency) 자동 매핑. 업종 다중 선택 (마스터 기반).
- **Inventory:** 관리자가 등록한 상품 마스터 중 선택하여 판매가/재고만 관리.
- **Services:** 공급자가 직접 생성하되, 업종(Industry) 범주 내에서 정의.
- **Permissions:** 예약이 승인된 경우에 한해, 자신의 업종과 일치하는 펫의 이력 데이터 열람 허용.
- **Promotions:** 서비스/상품 할인 설정 및 SNS 홍보 피드 자동 생성.

### 3.3 Admin (Master)
- **Master Data Studio:** 업종, 국가, 통화, 견종, 질병, 상품 카탈로그 중앙 관리.
- **UI Dictionary Studio:** 페이지별 UI 키 매핑 및 실시간 번역값([ ]) 관리.
- **Analytics Dashboard:** 가입자, 펫 수, 예약 완료율, SNS 참여도 지표 모니터링.

## 4. UI/UX Standard (Material 3 Reference)
- **Grid:** 8dp 배수 간격 시스템.
- **UX Pattern:** List(목록) -> Select(상세/수정) -> Create(폼) 패턴 엄격 준수.
- **Consistency:** 세 역할의 대시보드는 동일한 디자인 언어(Shell)를 공유함.
