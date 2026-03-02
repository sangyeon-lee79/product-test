# PPD.md - Product Definition & UX Flows (방울아놀자)
## 1. Product Principle
... (기존 내용)
- **Master Admin Control:** 관리자가 플랫폼의 모든 정형 데이터(마스터 아이템)를 통제함.
- **Data-Driven Insights:** 대시보드를 통해 사용자, 반려동물, 예약, SNS 활동 지표를 실시간 모니터링.

## 3. Core UX Flows (Data Lifecycle)
... (기존 내용)
### Flow 4: Master Admin Monitoring
- [Dashboard] 전체 가입자, 활성 펫, 예약 완료율 확인 -> [Master-Edit] 필요한 마스터 데이터(품종 등) 추가 및 13개 국어 배포.

- **ADMIN:** 시스템 마스터 데이터 관리.
- **PROVIDER:** 서비스 제공자 (병원, 미용샵, 호텔 등).
- **USER:** 반려견 소유자 및 일반 사용자.

## 3. Core UX Flows (Data Lifecycle)

### Flow 1: 마스터 데이터 등록 (Admin)
- [Admin-Panel] 새로운 업종명 입력 -> [🌐 변환] 13개 국어 생성 및 검수 -> [Save] 전역 선택 리스트에 반영.

### Flow 2: 업체/샵 등록 (Provider)
- [Shop-Signup] 샵 이름 입력 -> [🌐 변환] 글로벌 샵 이름 생성 -> [Select-Category] 관리자가 등록한 업종 중 선택.

### Flow 3: 서비스 이용 및 기록 (User)
- [Pet-Registration] 강아지 이름 입력 (🌐 변환 사용) -> [Booking] 등록된 샵 선택 -> [Record] 완료된 서비스(미용/진료 등) 항목 선택.

## 4. Language System UX
- **Data Entry UI:** 문자열 입력 필드 우측에 반드시 🌐 버튼 배치. 클릭 시 13개 국어 편집 그리드 노출.
- **Consumer UI:** 사용자의 설정 언어에 맞춰 `text_entity`의 변환된 값만 노출.
