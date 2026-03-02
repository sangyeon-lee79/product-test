# PPD.md - Product Definition & UX Flows (방울아놀자)

## 1. Product Principle
- **Pet-Centricity:** 사용자 계정이 아닌 '반려견(Pet)'을 모든 기록의 최상위 엔티티로 설정.
- **Structured Data:** 자유 텍스트 입력을 지양하고 모든 질병, 사료, 증상을 코드로 관리.
- **Timeline Continuity:** 모든 건강 데이터와 서비스 이력이 단일 타임라인에 누적.

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

## 4. Language System UX
- 모든 UI 요소는 `t(domain, key)`를 통해 13개 국어(ko, en, vi, id, ja, zh, th, es, fr, de, it, pt, ar)로 자동 변환되어 노출.
- 사용자는 타국 사용자의 기록도 자신의 언어로 번역된 형태로 조회.

## 5. Structured Inputs
- 질병 리스트: 사전 정의된 코드셋에서 선택.
- 몸무게: 숫자 값만 허용.
- 사료: 제조사/상품 코드에서 선택.
