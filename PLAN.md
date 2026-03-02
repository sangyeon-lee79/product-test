# PLAN.md - 방울아놀자 MVP Roadmap

## 1. Project Overview
반려견 중심의 생애 기록 및 SNS형 PHR 플랫폼 "방울아놀자" 개발 로드맵.

## 2. Phases & Milestones

### Phase 1: Pet Health Core (Current)
- [ ] Pet Identity CRUD (이름, 품종, 성별, 생일 등)
- [ ] Condition System (질병 관리: 진단일, 심각도, 상태)
- [ ] Daily Metrics (건강 지표: 몸무게, 활동량 등)
- [ ] Diet Tracking (사료 및 급여 관리)
- [ ] basic Timeline (기록 누적)

### Phase 2: Language Conversion & Admin
- [ ] Dictionary DB Schema (13개 국어 대응)
- [ ] Admin Dictionary Studio (React + Vite)
- [ ] UI Key-Value Mapping (t(domain, key) 시스템)

### Phase 3: SNS Integration
- [ ] Multi-Role Auth (User, Groomer, Hospital)
- [ ] Feed System (Following / ForYou)
- [ ] Ranking Algorithm Implementation

### Phase 4: Grooming Shop Loop
- [ ] Shop Profile & Service Slots
- [ ] Booking System (Owner <-> Shop)
- [ ] Completion & Auto-Timeline Integration
- [ ] Feed Sharing & Rebooking Loop

### Phase 5: Safety & Optimization
- [ ] Admin Monitoring Tools
- [ ] Data Validation & Security
- [ ] Performance Tuning (Cloudflare Workers)

## 3. Definitions of Done (DoD)
- 기능 구현 완료
- PLAN.md / PPD.md / LLD.md 업데이트 완료
- API 엔드포인트 및 DB 스키마 검증 완료
- 다국어 키 적용 확인
