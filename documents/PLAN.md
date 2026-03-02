# PLAN.md - 방울아놀자 MVP Roadmap

## 1. Project Overview
반려견 중심의 생애 기록 및 SNS형 PHR 플랫폼 "방울아놀자" 개발 로드맵.

## 2. Tech Stack Mandate
- **Mobile:** Flutter (Dart) - Mandatory
- **Design:** Material 3 (M3) Guideline Reference
- **Backend:** Node.js (TypeScript)
- **Database:** PostgreSQL

## 3. Phases & Milestones

### Phase 1: Pet Health Core
- [O] Pet Identity CRUD
- [O] Condition & Metrics System
- [O] SNS-style Feed Timeline UI (M3 Reference)

### Phase 2: Master Admin & Universal Translation
- [O] Master Data Studio (Breeds, Industries, Countries)
- [O] 13-Language Universal Translation System (v2)
- [O] Universal Edit System (Menu & Master Data)
- [O] Distributed API Model
- [O] UI Dictionary Page-based Management

### Phase 3: SNS Integration
- [ ] Multi-Role Auth System
- [ ] M3-style Feed Interaction (Likes, Shares)
- [ ] Ranking & Discovery

### Phase 4: Provider System & Commerce
- [O] **Provider Profile Fix:** "List First, Then Edit" pattern.
- [O] **Country-Currency mapping:** Auto-derived from Admin masters.
- [ ] **Master Product Catalog:** Admin defined.
- [ ] **Store Inventory:** Provider price/stock management.
- [ ] **Service Management:** Custom service creation.
- [ ] **Reservations:** Booking flow & Calendar.

### Phase 5: Safety & Optimization
- [ ] Admin Monitoring Tools
- [ ] Performance Tuning

## 4. Definitions of Done (DoD)
- Flutter mobile stack alignment
- Material 3 design principles followed (Spacing, Typography, Hierarchy)
- "List First, Then Edit" UX pattern verified
- PLAN.md / PRD.md / LLD.md updated
