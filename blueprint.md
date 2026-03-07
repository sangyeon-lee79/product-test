# Blueprint: Petfolio (반려동물 라이프 포트폴리오)

## 1. 프로젝트 개요

**Petfolio**는 "Pet = Life Portfolio"라는 철학 아래 설계된 반려동물 중심의 SNS 플랫폼입니다. 기존의 사용자 중심 SNS와 달리, 모든 데이터 흐름은 **Pet → Timeline**으로 이어집니다. 보호자(Guardian)와 서비스 제공자(Supplier)가 협력하여 반려동물의 생애 전반(Feed, Health, Booking, Milestones)을 기록하고 관리합니다.

## 2. 핵심 설계 원칙

1.  **Pet 중심 데이터:** 모든 콘텐츠와 기록은 `pet_id`를 중심으로 연결됩니다.
2.  **Master Data 기반:** 모든 선택값(품종, 사료, 질병, 증상 등)은 하드코딩 없이 마스터 데이터로 관리됩니다. (Category → Item → SubItem 트리 구조)
3.  **Feed는 콘텐츠:** 단순 포스팅을 넘어 예약 완료, 건강 업데이트, 생애 이정표 등이 모두 피드로 발행됩니다.

## 3. 데이터 구조 (Schema)

### 3.1 마스터 데이터 (Master Data)
- **master_categories:** PET_TYPE, PET_BREED, DIET_TYPE, DISEASE, ALLERGY, SYMPTOM 등 관리.
- **master_items:** 각 카테고리에 속하는 실제 항목들. `parent_item_id`를 통해 계층 구조(예: Dog -> Poodle) 지원.

### 3.2 핵심 엔티티
- **pets:** 반려동물 기본 정보 (마스터 데이터 ID 기반).
- **feed_posts:** 다양한 타입(보호자 포스트, 예약 완료, 건강 업데이트 등)의 피드.
- **feed_post_pets:** 한 피드에 여러 반려동물 태깅 가능.
- **feed_media:** 피드별 이미지/비디오 관리.
- **bookings:** 서비스 예약 및 상태 관리.
- **health_records:** 질병, 증상 기록 및 관리.
- **feed_publish_requests:** 서비스 완료 후 전문가가 작성한 내용을 보호자 승인 후 피드로 발행하는 워크플로우.

## 4. UI/UX 구조 (Pet Profile)

반려동물 프로필은 플랫폼의 핵심 페이지이며, 인스타그램과 유사하지만 반려동물 정보에 특화되어 있습니다.

### 4.1 Tabs 구성
1.  **Timeline:** 모든 관련 피드 (Posts, Bookings, Health, Milestones).
2.  **Health:** 건강 기록, 증상, 질병, 수치 그래프 (몸무게 등).
3.  **Services:** 이용한 서비스(미용, 병원, 호텔 등) 예약 기록.
4.  **Gallery:** 반려동물 사진/영상 그리드 뷰.
5.  **Profile:** 상세 정보 (식단, 성격, 알러지, 예방접종 등).

## 5. 현재 진행 상태 및 로드맵

### V0.4 (현재 진행 중) - 데이터 모델 고도화 및 SNS 기초
- [x] 마스터 데이터 기반 스키마 설계 및 반영
- [ ] Pet Profile UI 구현 (Timeline, Gallery 탭 우선)
- [ ] Feed 작성 및 표시 로직 (Pet-centric)
- [ ] 전문가용 서비스 완료 -> 보호자 승인 -> 피드 발행 Flow 구현

### V0.5 - 건강 관리 및 시각화
- [ ] 건강 기록 입력 UI 및 마스터 데이터 연동
- [ ] 체중, 혈당 등 수치 데이터 그래프 시각화
