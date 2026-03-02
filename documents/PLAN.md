# PLAN.md - Bang-ul Play MVP Roadmap

## 1. Project Overview
반려견 중심의 생애 데이터 추적, 공급자 상거래 및 SNS 기능이 결합된 글로벌 PHR 플랫폼 "방울아놀자" 개발 로드맵.

## 2. Tech Stack (Fixed)
- **Mobile App:** Flutter (Dart) - Material 3 standard.
- **Backend API:** Node.js (TypeScript).
- **Web Admin:** React (TypeScript, Vite).
- **Database:** PostgreSQL.

## 3. Phases & Milestones

### Phase 1: Pet Health Core & SNS UI (Completed)
- [O] SNS-style Feed Timeline UI (Vertical line, dots, verified badge).
- [O] Pet Identity CRUD (Master-driven selections).

### Phase 2: Master Admin & Universal Control (Current)
- [ ] **Master Data Management (Screen 1):** 카테고리/아이템 리스트-에디트 시스템.
- [ ] **Language Management (Screen 2):** 전역 텍스트 사전 및 언어별 컬럼 편집.
- [ ] **Country & Currency Management (Screen 3):** 국가-통화 매핑 및 공급자 연동.
- [O] **Universal Edit System:** 메뉴 및 정적 레이블의 13개 국어 수정 기능.

### Phase 3: Provider System & Commerce (Current)
- [O] **Provider Profile (Fixed):** 국가 선택 시 통화 자동 매핑 로직.
- [ ] **Inventory & Service Management:** 마스터 상품 연동 및 공급자 고유 서비스 생성.
- [ ] **Reservation Flow:** 상태 관리(Requested -> Accepted -> Completed).

### Phase 4: SNS Integration & Algorithm
- [ ] **Login Required Feed:** 알고리즘 기반 피드 랭킹.
- [ ] **Automatic Timeline Entry:** 예약 완료 시 자동 기록 생성.

## 4. Definitions of Done (DoD)
- 모든 선택값은 마스터 테이블에서 기원 (하드코딩 금지).
- 모든 표시 텍스트는 번역 테이블에서 기원 (하드코딩 금지).
- 관리자 화면은 "리스트 -> 선택 -> 수정" 구조 준수.
- 국가 선택 시 통화 자동 결정 로직 확인.
