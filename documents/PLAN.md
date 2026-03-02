# PLAN.md - Bang-ul Play MVP Roadmap

## 1. Project Overview
반려견 중심의 생애 데이터 추적, 공급자 상거래 및 SNS 기능이 결합된 글로벌 PHR 플랫폼 "방울아놀자" 개발 로드맵.

## 2. Tech Stack (Fixed)
- **Mobile App:** Flutter (Dart)
- **Backend API:** Node.js (TypeScript)
- **Web Admin:** React (TypeScript, Vite)
- **Database:** PostgreSQL
- **Infra:** Cloudflare (Pages / Workers)

## 3. Phases & Milestones

### Phase 1: Pet Health Core & Global Text System (Completed)
- [O] Pet Identity CRUD & SNS-style Feed UI
- [O] 13-Language Universal Translation System (v2)
- [O] Global Text System Separation (UI Dictionary / Master Data / Text Entities)
- [O] UI Dictionary Page-based Management (현재 언어값 표시 [ ])

### Phase 2: Master Admin Control (Current)
- [ ] **Master Data Studio Completion:**
  - 업종 관리 (언어변환 입력 + 상태 관리)
  - 국가/통화 관리 (국가-통화 매핑 + 언어변환)
  - 견종/질병/기록 템플릿 마스터 구축
  - 상품 마스터 (제조사/스펙 포함)
- [ ] **Admin Analytics:** 가입/피드/예약/상거래 통합 지표 대시보드

### Phase 3: Provider System & Commerce (Current)
- [O] **Provider Profile (Fixed):** 국가 선택 시 통화 자동 매핑 및 "리스트-퍼스트" 구조.
- [ ] **Inventory System:** 관리자 등록 상품 선택 및 가격/재고 설정.
- [ ] **Service Management:** 공급자 고유 서비스 생성 (업종별 범위 제한).
- [ ] **Reservation Flow:** 예약 수신/승인 및 업종별 펫 데이터 열람 권한 로직.
- [ ] **Promotions:** 할인 설정 및 SNS 홍보 피드 생성.

### Phase 4: SNS Integration & Algorithm
- [ ] **Login Required Feed:** 로그인 상태에서만 피드 노출 및 랭킹 엔진.
- [ ] **Pet Timeline Auto-Sync:** 예약 완료 시 피드/타임라인 자동 기록 연동.

### Phase 5: Safety & Optimization
- [ ] Admin Monitoring Tools
- [ ] Data Validation & Security
- [ ] Performance Tuning (Cloudflare Workers)

## 4. Definitions of Done (DoD)
- 모든 텍스트의 100% 언어키 전환 (하드코딩 0%)
- 리스트 -> 선택 -> 수정 UX 패턴 준수
- Material 3 디자인 가이드 준수 (8dp grid, Typography)
- Playwright 테스트 통과
