# PLAN.md - 방울아놀자 MVP Roadmap

## 1. Project Overview
반려견 중심의 생애 기록 및 SNS형 PHR 플랫폼 "방울아놀자" 개발 로드맵.

## 2. Phases & Milestones

### Phase 1: Pet Health Core
- [O] Pet Identity CRUD (이름, 품종, 성별, 생일 등)
- [O] Condition System (질병 관리: 진단일, 심각도, 상태)
- [O] Daily Metrics (건강 지표: 몸무게, 활동량 등)
- [O] basic Timeline (기록 누적 및 SNS 피드 스타일 UI)

### Phase 2: Master Admin & Universal Translation
- [O] Master Data Studio (Breeds, Conditions, Industries 관리)
- [O] 13-Language Universal Translation System (v2)
- [O] Universal Edit System (메뉴명, 데이터 전 영역 수정)
- [O] Distributed API Model (개인 API 연동)
- [O] Master Menu & Dropdown System (마스터 데이터 기반 선택 시스템)
- [O] Global Text System Separation (UI Dictionary / Master Data / Text Entities 분리)
- [O] Admin Dashboard (플랫폼 지표 모니터링)

### Phase 3: SNS Integration (Next)
- [ ] Multi-Role Auth (User, Groomer, Hospital 역할 기반 로그인)
- [ ] Feed System (Following / ForYou 기반 정교한 필터링)
- [ ] Ranking Algorithm Implementation (관심사/Engagement 기반)

### Phase 4: Grooming Shop Loop
- [ ] Shop Profile & Service Slots 상세화
- [ ] Booking System (예약 및 결제 연동)
- [ ] Completion & Auto-Timeline Integration (샵 인증 기록 자동화)

### Phase 5: Safety & Optimization
- [ ] Admin Monitoring Tools (부적절 콘텐츠 관리)
- [ ] Data Validation & Security Hardening
- [ ] Performance Tuning (Cloudflare Workers 최적화)

## 3. Definitions of Done (DoD)
- 기능 구현 및 Playwright 테스트 통과
- PLAN.md / PPD.md / LLD.md 업데이트 완료
- 모든 텍스트의 13개 국어 호환성 확인
- 하드코딩된 문자열 제거 확인
