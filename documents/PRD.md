# Pet Lifecycle SNS Platform — PRD.md
# 제품 요구사항 정의서 (Product Requirements Document)
# Status: MVP In Progress (2026-03-08 동기화)

Petfolio
Your pet's life portfolio

---

## 0. 개발 현황 동기화 (2026-03-08)

### 0.1 현재 반영 완료 (PLAN.md 기준)
- Pet Album 통합 저장소: `pet_album_media` + `/api/v1/pet-album` CRUD
- Feed/Booking 완료 승인 흐름과 Pet Album 자동 연동
- My Pet 직접입력 확장: 이름/마이크로칩/생일/몸무게/메모
- `pets` 확장: `birthday`, `current_weight` (기존 `birth_date`, `weight_kg`와 호환)
- 몸무게 시계열 이력: `pet_weight_logs`
- 몸무게 API: `GET/POST/PUT/DELETE /api/v1/pets/:id/weight-logs` + `range`
- Guardian Web Health 탭: 몸무게 기간 필터/요약/추이 그래프/기록 추가

### 0.2 현재 반영 완료 — UI 리디자인 (2026-03-08)
- **디자인 시스템**: Warm Amber 팔레트(`--primary: #d97706`), Pretendard + DM Serif Display, CSS 변수 기반 다크모드
- **PublicHome (/)**: Instagram-style 3열 레이아웃 (사이드바/피드/우측 CTA), story bar, 공개 피드 열람
- **ExplorePage (/explore)**: 신규 라우트, 3열 탐색 그리드, 실시간 검색, 상세 모달
- **GuardianMainPage (/guardian)**: Instagram 프로필 스타일 전면 리디자인
  - 컴팩트 펫 헤더: 80px 아바타, 인라인 통계(Posts/Media/Friends), 상태 칩
  - Sticky 탭 바: Timeline / Health / Services / Gallery / Profile
  - 2단 레이아웃: 메인(flex:1) + 사이드바(300px), 모바일 단열 전환
  - 타임라인: 컴팩트 작성 바 → 모달, 갤러리: 3열 라이트박스, 프로필: 2열 인포 그리드

### 0.3 진행 중/잔여
- 모바일/웹 공통 피드 리스트 + 좋아요/댓글 UX 일관화 및 실기기 QA
- S7 질병 기록 + 타임라인 (logs/log_values/log_media DB + API + Mobile/Web UI)

### 0.4 Master Dropdown Locale/Stable-ID 정책 (2026-03-08 반영)
- 드롭다운 옵션 표시:
  - 현재 선택 locale 기준 번역값 사용
  - locale 누락 시 `ko`, 이후 `en`, 이후 key fallback
- 저장 정책:
  - 번역 문자열 저장 금지
  - `master_item_id` 또는 `master_item_key`를 stable value로 저장
  - 클라이언트 저장 payload는 가능한 `master_item_id`로 정규화 후 전송
- 렌더 정책:
  - Profile/Wizard/Health 포함 전 화면에서 저장된 id/key를 기준으로 현재 locale 라벨 재계산
  - 언어 변경 시 화면 전체가 즉시 locale 라벨로 갱신되어야 함
- 적용 화면:
  - Pet Wizard 드롭다운 전체
  - 질병 / 예방접종 / 성격기질 / 대표색상 / 식단유형 / 알러지 / 증상
  - Profile 요약 카드
  - Health 입력 모달
  - Master Data 연결 select component 전체

### 0.5 Frontend i18n Cleanup 확장 반영 (2026-03-08)
- 대상 클라이언트:
  - Admin Web Guardian 화면
  - Guardian Web 앱 화면
- 요구 반영:
  - 하드코딩 UI 텍스트 제거, i18n key 사용 원칙 강화
  - 마스터 드롭다운 옵션은 현재 locale 번역값으로 즉시 렌더
  - locale 변경 시 전체 화면 텍스트/옵션 동기 갱신
  - refresh 및 로그인 이후에도 locale 유지
- 데이터 무결성:
  - DB 저장은 번역문자열이 아닌 stable id/key 유지
  - 표시 시점에만 locale translation lookup 수행

---

## 1. 제품 개요

### 1.1 제품명
Petfolio — Your pet's life portfolio

### 1.2 제품 정의
반려동물의 전 생애를 SNS 피드 + 포트폴리오/아카이브로 기록하는 플랫폼.
공개 피드(PublicHome) + 탐색(Explore) + Guardian 대시보드(질병 중심 타임라인) + Provider 서비스 완료 → 1-click 피드 공유 바이럴 루프를 통합한 SNS형 PHR 플랫폼

### 1.3 플랫폼 공식 용어
- **Guardian** = 보호자 계정(User)
- **Provider** = 공급자(매장/병원/미용 등)
- **Admin** = 관리자

### 1.4 MVP 핵심 우선순위
1. Admin: 마스터/언어/국가-통화/광고슬롯 데이터 기반 완성
2. Storage: R2 업로드(검사결과/피드/완료사진) 선행
3. Auth: 테스트 로그인 → OAuth(Google/Apple) 2단 구성
4. Guardian: 펫 생애 추적(질병 기록) MVP 최우선
5. Provider: 예약/완료사진 → Guardian 1-click 피드 공유(바이럴 루프)
6. Guardian Web: 폼 중심 검증용 웹
7. 알고리즘/커머스 고도화는 2차

### 1.5 전역 규칙
- 하드코딩 텍스트/드롭다운 금지 → t(key) + 마스터 기반만 허용
- 다국어 = "번역"이 아닌 "언어변환" (관리자/Guardian/Provider가 값 보정)
- 광고 정책: 건강/질병 기록 화면 광고 노출 금지
- 관리/설정 UI 기본 패턴: List → Select → Edit + Create
- 연결형 계층 데이터(질병→증상→수치…)는 Tree-view/Graph UI 예외 허용
- 기존 코드/데이터 삭제/초기화 금지 (수정·확장만)

### 1.6 Master/i18n 통합 규격 (필수)
- Master UI 구조: `Category | L1 | L2 | L3 | L4 | L5`
- 질병 예시 흐름:
  - `질병군 -> 내분비질환 -> 당뇨 -> 혈당측정기 -> 혈당수치 -> 공복`
- UI 출력 규칙:
  - key 저장, label 표시
  - `display_value = translation[current_locale]`
  - locale 누락 시 `ko` fallback
  - key 직접 출력 금지
- 자동번역 규칙:
  - source는 `한국어 표시명(label_ko)`만 허용
  - `master.*`, `admin.*` 형태 source 금지
- 저장 검증:
  - `ko` 필수
  - 13개 언어 전체 번역값 필수
  - 번역값이 key와 동일하거나 key 패턴이면 저장 금지
- 계층 검증:
  - `disease_type -> disease_group`
  - `disease_device_type -> disease_type`
  - `disease_measurement_type -> disease_device_type`
  - `disease_measurement_context -> disease_measurement_type`
  - `diet_subtype -> diet_type`
  - `allergy_type -> allergy_group`
- Seed 규칙:
  - 필수 필드: `key/code + label_ko + parent + level`
  - 하드코딩 금지, Master API 조회만 허용

---

## 2. 사용자 유형 & 역할

### 2.1 Guardian (보호자)

| 속성 | 설명 |
|------|------|
| 접근 채널 | Mobile App (Flutter) + Guardian Web (React) |
| 핵심 니즈 | 펫 생애 기록(질병 중심), SNS 피드, Provider 서비스 예약 |
| 프로필 | @handle(유니크), 국가, 관심사(마스터 선택), 소개(언어변환 옵션), 사진 |

### 2.2 Provider (공급자)

| 속성 | 설명 |
|------|------|
| 접근 채널 | Mobile App (Flutter, 권한 스위치) + Provider Web (Optional) |
| 핵심 니즈 | 매장/서비스 등록, 예약 관리, 완료사진 → Guardian 바이럴 유도 |
| 프로필 | 매장(이름/주소/전화), 국가→통화 자동 연결, 업종 다중 선택 |

### 2.3 Admin (관리자)

| 속성 | 설명 |
|------|------|
| 접근 채널 | Admin Web (React) |
| 핵심 니즈 | 마스터 데이터, 언어관리, 국가-통화, 광고, 통계 |

---

## 3. 사용자 스토리

### 3.1 Admin 스토리 (Phase B)

**ADM-01: 마스터 카테고리/아이템 관리**
> Admin으로서, 업종/견종/질병/증상/수치항목/단위/기록유형/관심사/국가참조/광고슬롯 등 마스터 카테고리와 아이템을 CRUD할 수 있다.
- 임의 카테고리 추가 가능 (확장형)
- 사용중 아이템은 삭제 대신 비활성 처리
- 모든 아이템은 언어관리 키와 연동

**ADM-02: 질병 기록 연결(매핑) 관리**
> Admin으로서, Disease → Symptom → Metric → Unit/LogType 연결을 관리할 수 있다.
- 연결 속성: required, sort_order, active, default
- Tree-view/Graph UI 허용

**ADM-03: LogType 템플릿 관리**
> Admin으로서, 입력폼 템플릿(blood_glucose_log, insulin_log, meal_log, water_log, activity_log, lab_test_log, symptom_event_log)을 관리할 수 있다.
- Metric은 최소 1개 LogType에 연결 필수

**ADM-04: 언어관리(13개국어)**
> Admin으로서, 플랫폼 전체 텍스트(라벨/버튼/메뉴/상태/알림/드롭다운 표시명)를 13개국어로 관리할 수 있다.
- key 옆 현재 언어값 표시: `app_title [방울아 놀자]`
- 페이지별 사용 키 목록 + "사용중 키만" 필터
- (선택) 자동 언어변환 버튼(Google 번역) + 수동 수정

**ADM-04A: 번역 감사(Audit)**
> Admin으로서, 배포 전 번역 누락/키노출/패턴오염을 점검하고 실패 시 배포를 차단할 수 있다.
- 검사 조건:
  - 언어 누락(13개 중 공란)
  - key literal 노출(`master.*`, `admin.*`)
  - 잘못된 패턴(`%.disease_%` 등)

**ADM-05: 국가-통화 관리**
> Admin으로서, 국가/통화 CRUD 및 국가-통화 매핑(default)을 관리할 수 있다.
- Provider 매장등록 시 국가 선택 → 통화 자동 연결(읽기전용)

**ADM-06: 광고 설정**
> Admin으로서, 광고 전역 On/Off, 슬롯별 On/Off, Ad Unit ID를 관리할 수 있다.
- 건강/질병 기록 화면 광고 금지 플래그
- 노출 로그(간단 카운팅)

**ADM-07: 통계 대시보드**
> Admin으로서, 가입자(Guardian/Provider), 피드 수, 예약 수, 광고 노출(슬롯별)을 확인할 수 있다.

---

### 3.2 Guardian 스토리 (Phase D/E)

**GRD-01: 인증**
> Guardian으로서, 테스트 로그인(초기) 또는 OAuth(Google/Apple)로 로그인할 수 있다.

**GRD-02: 프로필 설정**
> Guardian으로서, @handle(유니크), 국가, 관심사(마스터 선택), 소개(언어변환 옵션), 사진을 설정할 수 있다.

**GRD-03: 펫 등록/관리**
> Guardian으로서, 펫을 다중 등록하고 견종/질병 선택과 함께 이름/마이크로칩/생일/몸무게/메모를 직접 입력해 관리할 수 있다.

**GRD-03A: 몸무게 이력 관리**
> Guardian으로서, 몸무게를 날짜별로 누적 기록하고 기간(1m/3m/6m/1y/all)별 추이를 그래프로 확인할 수 있다.

**GRD-04: 질병 기록 (핵심 MVP)**
> Guardian으로서, 펫의 질병 관련 기록을 LogType 템플릿에 따라 입력할 수 있다.
- 혈당 기록: 수치/단위 + 측정방식(리브레/혈액)
- 인슐린 기록: 종류/용량 IU/시간/스케줄
- 식단 기록: 사료/화식 g, kcal 계산 구조
- 수분 기록: ml
- 운동 기록: 활동/시간
- 이벤트 기록: 발정/중성화/호르몬/투약
- 검사/병원 기록: 첨부(R2) + 선택/수치
- 위험 경고: 저혈당/급락 화면 경고

**GRD-05: 오프라인 기록 (제한적)**
> Guardian으로서, 오프라인에서도 Log를 임시 저장(SQLite)하고 온라인 복귀 시 동기화할 수 있다.
- 충돌 해결: 마지막 수정 우선 + 변경 이력 저장

**GRD-06: 타임라인 조회**
> Guardian으로서, 펫의 전체 기록을 타임라인으로 조회할 수 있다.

**GRD-07: 피드/SNS**
> Guardian으로서, 피드를 작성/조회하고, Provider 완료사진을 1-click으로 공유할 수 있다.

**GRD-08: Provider 서비스 예약**
> Guardian으로서, Provider 매장/서비스를 조회하고 예약 요청/상태 확인을 할 수 있다.

**GRD-09: Pet Gallery (Instagram-style)**
> Guardian으로서, 프로필/피드/예약완료/건강기록/수동업로드 미디어를 하나의 Gallery 탭에서 source_type 기반으로 필터링해 조회할 수 있다.

---

### 3.3 Provider 스토리 (Phase F)

**PRV-01: 권한 스위치**
> Provider로서, 앱 내에서 공급자 권한으로 전환할 수 있다.

**PRV-02: 매장 관리**
> Provider로서, 매장(이름/주소/전화)을 생성/수정하고, 국가 선택 → 통화 자동 연결, 업종 다중 선택할 수 있다.

**PRV-03: 서비스/할인 관리**
> Provider로서, 서비스(명/설명/가격/사진)를 등록하고 텍스트 언어변환(선택), 할인(기간/율)을 설정할 수 있다.

**PRV-04: 예약 관리**
> Provider로서, 예약을 수신/수락/완료 처리할 수 있다.

**PRV-05: 완료 → 바이럴 루프**
> Provider로서, 완료사진을 업로드(R2)하고 Guardian에게 발송하면, Guardian이 1-click 피드 공유 시 매장 링크가 자동 포함된다.

**PRV-06: SNS 홍보 카드**
> Provider로서, SNS 홍보 카드를 생성할 수 있다.

---

## 4. 기능 요구사항 (Phase 매핑)

### 4.1 Phase A — 기반/인프라

| ID | 기능 | 우선순위 |
|----|------|----------|
| INF-01 | /documents 폴더 + 3문서 배치 | P0 |
| INF-02 | Monorepo 구조 확정 (apps/mobile, admin-web, guardian-web, provider-web, services/api, packages/shared) | P0 |
| INF-03 | PostgreSQL + Hyperdrive 연결 | P0 |
| INF-04 | R2 버킷 생성 (media) | P0 |
| INF-05 | Cloudflare Pages 배포 파이프라인 (Admin/Guardian Web) | P0 |
| INF-06 | Cloudflare Workers 배포 파이프라인 (API, 스테이징 1개) | P0 |
| INF-07 | API ↔ Web ↔ Mobile 통신 테스트 | P0 |

### 4.2 Phase B — Admin

| ID | 기능 | 우선순위 |
|----|------|----------|
| ADM-B1 | Master Category CRUD (확장형) | P0 |
| ADM-B2 | Master Item CRUD (수정/삭제/비활성) | P0 |
| ADM-B3 | 필수 Seed 카테고리 10종 | P0 |
| ADM-B4 | 질병 연결 매핑 (Disease→Symptom→Metric→Unit/LogType) | P0 |
| ADM-B5 | LogType 입력폼 템플릿 (7종) | P0 |
| ADM-B6 | 언어관리 13개국어 CRUD | P0 |
| ADM-B7 | 국가/통화/매핑 CRUD | P0 |
| ADM-B8 | 광고 전역/슬롯 설정 | P1 |
| ADM-B9 | 통계 대시보드 (최소) | P1 |

### 4.3 Phase C — Backend API

| ID | 기능 | 우선순위 |
|----|------|----------|
| API-01 | GET /i18n (lang, prefix) | P0 |
| API-02 | GET /master/categories, /master/items | P0 |
| API-03 | GET /countries + currency map | P0 |
| API-04 | GET /ads/config | P1 |
| API-05 | 테스트 로그인/세션 (MVP-0) | P0 |
| API-06 | OAuth Google/Apple (MVP-1) | P0 |
| API-07 | GET /storage/presigned-url (R2) | P0 |
| API-08 | Guardian CRUD + handle 유니크 | P0 |
| API-09 | Guardian Profile CRUD | P0 |
| API-10 | Pets CRUD + 마이크로칩 | P0 |
| API-11 | Pet 질병 연결 (복수) | P0 |
| API-12 | Logs CRUD (선택값+수치+단위+첨부+타임라인) | P0 |
| API-13 | Feed CRUD + Like/Comment (최소) | P1 |
| API-14 | Provider Store CRUD + 업종 다중 선택 | P1 |
| API-15 | Provider Service CRUD (가격/사진/할인) | P1 |
| API-16 | Booking CRUD (요청/수락/완료) | P1 |
| API-17 | 완료사진 전송 + 피드 공유 메타데이터 | P1 |
| API-18 | Pet Album CRUD + source_type 필터 | P1 |
| API-19 | Pet Weight Logs CRUD + range 조회 | P0 |

### 4.4 Phase D — Guardian Mobile (Flutter)

| ID | 기능 | 우선순위 |
|----|------|----------|
| MOB-01 | i18n + master 로드 + t(key) 렌더 | P0 |
| MOB-02 | 언어 변경 UI | P0 |
| MOB-03 | 테스트 로그인 → OAuth | P0 |
| MOB-04 | Guardian 프로필 폼 (@handle/국가/관심/소개) | P0 |
| MOB-05 | 펫 다중 등록 + 마이크로칩 + 견종/질병 선택 | P0 |
| MOB-06 | 질병 기록 7종 LogType 입력 | P0 |
| MOB-07 | 위험 경고 (저혈당/급락) | P0 |
| MOB-08 | 오프라인 SQLite 임시 저장 + 동기화 | P1 |
| MOB-09 | 피드 리스트/작성 (사진=R2) | P1 |
| MOB-10 | Provider 매장/서비스 보기 + 예약 | P1 |
| MOB-11 | 완료사진 수신 → 1-click 피드 공유 | P1 |
| MOB-12 | Pet Profile Gallery 탭 (Instagram-style grid) | P1 |
| MOB-13 | Health 탭 몸무게 이력/그래프 | P1 |

### 4.5 Phase E — Guardian Web (React)

| ID | 기능 | 우선순위 |
|----|------|----------|
| WEB-01 | i18n + master + t(key) 렌더 (반응형, Desktop 우선) | P0 |
| WEB-02 | Guardian 프로필 폼 | P0 |
| WEB-03 | 펫 등록/수정 + 마이크로칩 | P0 |
| WEB-04 | 질병 기록 입력 (동일 LogType 템플릿) | P0 |
| WEB-05 | 검사결과 업로드/조회 (R2) | P0 |
| WEB-06 | 타임라인/리스트 보기 | P0 |
| WEB-07 | 피드 보기/작성 (옵션) | P2 |
| WEB-08 | 예약 상태 확인 (옵션) | P2 |
| WEB-09 | My Pet 직접입력 확장 (생일/몸무게/메모) | P0 |
| WEB-10 | 몸무게 이력 입력 + 추이 그래프 | P0 |
| WEB-11 | Pet Gallery 탭 + source_type 필터 | P1 |

### 4.6 Phase F — Provider (Mobile 우선)

| ID | 기능 | 우선순위 |
|----|------|----------|
| PRV-01 | 권한 스위치 (공급자) | P0 |
| PRV-02 | 매장 생성/수정 + 국가→통화 + 업종 다중 선택 | P0 |
| PRV-03 | 서비스 등록 (명/설명/가격/사진) + 언어변환 옵션 | P0 |
| PRV-04 | 할인 (기간/율) | P1 |
| PRV-05 | SNS 홍보 카드 생성 | P2 |
| PRV-06 | 예약 수신/수락/완료 | P0 |
| PRV-07 | 완료사진 업로드(R2) → Guardian 발송 | P0 |
| PRV-08 | 1-click 피드 공유 메타데이터 (매장 링크 자동 포함) | P0 |

### 4.7 Phase G — Ads (AdMob)

| ID | 기능 | 우선순위 |
|----|------|----------|
| ADS-01 | AdMob SDK 연동 (Flutter) | P1 |
| ADS-02 | 슬롯: feed_list_banner, store_detail_banner | P1 |
| ADS-03 | 건강/질병 기록 영역 광고 차단 (정책 플래그) | P0 |
| ADS-04 | Admin 전역/슬롯 On/Off 연동 | P1 |
| ADS-05 | 노출 카운트 기록 | P2 |

---

## 5. 비기능 요구사항

### 5.1 성능
- API 응답: 95th percentile < 500ms
- 타임라인 첫 로딩 < 2초
- 이미지 업로드(R2) < 5초 (10MB 기준)
- Cloudflare Workers cold start < 200ms

### 5.2 보안
- HTTPS 전 구간
- JWT (Access + Refresh) — Workers 기반
- OAuth 2.0 (Google/Apple)
- PII 암호화 저장
- Provider 사업자 인증 프로세스

### 5.3 오프라인 (제한)
- 질병 기록(Log)만 SQLite 오프라인 임시 저장
- 동기화: 마지막 수정 우선 + 변경 이력 저장
- 마스터/i18n은 앱 시작 시 캐시, 오프라인 시 캐시 사용

## i18n Non-Negotiable Requirements
- UI 텍스트(카테고리명, L1~L5 컬럼명, 버튼, placeholder, 안내 문구, 상태값, 삭제/수정 문구, validation/error, empty state)는 i18n key 기반으로만 렌더링한다.
- 시스템 key(`master.*`, `admin.*` 등)를 사용자 화면에 직접 출력하지 않는다.
- 번역 누락 시 key 대신 "번역 누락" 상태를 표시한다.
- Master category/item은 번역 레코드(13개 언어)가 완성되지 않으면 저장하지 않는다.
- 신규 항목 생성 흐름은 `한국어 표시명 입력 -> key 자동 생성 -> i18n 생성 -> 다국어 자동번역 -> 저장` 순서를 따른다.

### 5.4 국제화
- 13개국어 언어변환 (번역 아닌 관리자/사용자 값 보정)
- UTC 기반 + 로컬 타임존 표시
- 국가-통화 매핑 기반 가격 표시

### 5.5 광고 정책
- 건강/질병 기록 화면 광고 절대 금지 (신뢰도 유지)
- Admin에서 전역/슬롯별 On/Off 제어

---

## 6. 화면 구조

### 6.1 Admin Web

```
로그인
├── 대시보드 (통계)
├── 마스터 데이터
│   ├── 카테고리 관리
│   ├── 아이템 관리
│   └── 질병 연결 관리 (Tree-view)
├── 언어관리
│   ├── 키 목록 (페이지 필터)
│   └── 13개국어 편집
├── 국가/통화 관리
├── 광고 설정
│   ├── 전역 On/Off
│   └── 슬롯별 설정
└── 설정
```

### 6.2 Guardian Mobile App

```
로그인 (테스트/OAuth)
├── 홈 (피드)
├── 검색 (매장/서비스)
├── 내 펫
│   ├── 펫 리스트
│   ├── 펫 프로필 + 타임라인 + Gallery
│   ├── 기록 입력 (LogType 선택)
│   │   ├── 혈당 기록
│   │   ├── 인슐린 기록
│   │   ├── 식단 기록
│   │   ├── 수분 기록
│   │   ├── 운동 기록
│   │   ├── 이벤트 기록
│   │   └── 검사/병원 기록
│   ├── 위험 경고 (저혈당/급락)
│   └── Health (몸무게 이력/추이)
├── 예약
│   ├── 예약 요청
│   └── 상태 확인
├── 알림
└── 마이페이지
    ├── 프로필 (@handle/국가/관심)
    ├── 언어 설정
    └── 펫 관리
```

### 6.3 Guardian Web

```
로그인
├── 프로필 설정
├── 펫 등록/수정
├── 몸무게 이력/추이 (Health)
├── 펫 Gallery
├── 질병 기록 입력 (LogType 템플릿)
├── 검사결과 업로드/조회
├── 타임라인 보기
├── (옵션) 피드
└── (옵션) 예약 상태
```

### 6.4 Provider (Mobile 권한 스위치)

```
[권한 스위치 → Provider]
├── 매장 관리
│   ├── 매장 생성/수정
│   └── 업종/국가/통화
├── 서비스 관리
│   ├── 서비스 등록
│   ├── 할인 설정
│   └── 홍보 카드
├── 예약 관리
│   ├── 수신/수락
│   └── 완료 처리
└── 완료사진
    ├── 업로드 (R2)
    └── Guardian 발송
```

---

## 7. MVP Done Criteria

| # | 기준 | Phase |
|---|------|-------|
| 1 | Admin: 마스터/언어/국가/광고 설정 완료 | B |
| 2 | R2 업로드(검사/피드/완료사진) 정상 동작 | A+C |
| 3 | OAuth(Google/Apple) 또는 테스트로그인 안정 동작 | C |
| 4 | Guardian: 펫 등록 + 질병 기록 7종 타임라인 동작 | D+E |
| 5 | Provider: 서비스/할인/완료사진 → 1-click 피드 공유 파이프라인 | F |
| 6 | 하드코딩 텍스트 제로 — t(key) 달성 | 전체 |
| 7 | 건강 기록 화면 광고 미노출 정책 적용 | G |
| 8 | My Pet 생일/몸무게 이력 + Pet Gallery 통합 조회 동작 | C+D+E |

---

## 8. 향후 확장 (Out of Scope)

- 알고리즘 기반 피드 추천
- 커머스 고도화 (상품/재고/정교 추천)
- 보험 연계 API
- AI 건강 분석/예측
- 수의학 데이터 표준 연동
- 실시간 채팅 (Guardian ↔ Provider)
- Provider Web 본격 구축
