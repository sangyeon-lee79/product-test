# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 모든 기록의 최상위 엔티티는 '반려견'임.
- **Universal Text Conversion v2:** UI 레이블뿐만 아니라 사용자가 입력한 모든 텍스트(강아지 이름, 샵 이름, 피드 내용 등)를 13개 국어로 변환 및 관리.
- **SNS-style Feed Timeline:** 의료, 미용 등 모든 기록을 SNS 피드 형식의 시각적 타임라인으로 제공.
- **Structured Data:** 자유 텍스트 입력을 지양하되, 입력된 텍스트는 즉시 언어 변환 엔티티화함.

## 2. User Roles & Account
- **USER:** 반려견 소유자. 여러 마리의 반려견 등록 가능.
- **GROOMER:** 미용사. 샵 프로필 관리 및 예약 처리.
- **HOSPITAL:** 병원. 의료 기록 인증 및 관리.

## 3. Core UX Flows

### Flow 1: 반려견 등록 및 건강 설정 (Phase 1)
- [Pet-Setup] 이름, 품종 등 기본 정보 입력 -> [Conditions] 기존 기저질환 코드 선택 -> [Setup-Complete] 타임라인 생성.

### Flow 2: 데일리 케어 기록 (Phase 1)
- [Daily-Logging] 몸무게 입력 / 급여 기록 -> [Auto-Timeline] 타임라인에 이벤트 자동 추가.

### Flow 3: 그루밍 샵 루프 (Phase 4)
- [Booking] 사용자가 샵 선택 및 예약 -> [Permission] 샵에 반려견 정보(일부) 노출 -> [Execution] 서비스 완료 -> [Verified-Log] 샵 계정으로 타임라인에 공식 기록 등록.

## 4. Language System UX (v2 Upgrade)
- **🌐 Conversion Button:** 텍스트 입력 시 사용자는 언어 변환 버튼을 클릭하여 13개 국어 변환 결과를 확인하고 편집할 수 있음.
- **Ownership:** 데이터 소유자(사용자/업체) 및 관리자(Admin)는 변환된 텍스트 값을 직접 수정 가능.
- **Auto-Generated Flag:** 시스템 생성 번역과 수동 수정 번역을 구분하여 관리.
- 모든 UI 요소 및 데이터 텍스트는 13개 국어(ko, en, vi, id, ja, zh, th, es, fr, de, it, pt, ar)로 노출.

## 5. Structured Inputs
- 질병 리스트: 사전 정의된 코드셋에서 선택.
- 몸무게: 숫자 값만 허용.
- 사료: 제조사/상품 코드에서 선택.
