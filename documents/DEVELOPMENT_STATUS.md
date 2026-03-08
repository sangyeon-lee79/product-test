# 개발 현황 (Development Status)
- 최종 업데이트: 2026-03-08
- 기준 브랜치: `main` (origin/main 대비 ahead 1)
- 최신 확인 커밋: `9084a05`

## 1) 누적 개발 개요
- 기간: 2026-02-10 ~ 2026-03-08
- 총 커밋 수: 206
- 일자별 커밋 분포
  - 2026-02-10: 1건
  - 2026-03-02: 29건
  - 2026-03-04: 18건
  - 2026-03-05: 14건
  - 2026-03-06: 30건
  - 2026-03-07: 85건
  - 2026-03-08: 29건

## 2) 완료된 핵심 기능 (누적)
- 인프라/배포
  - Cloudflare Workers + D1 + R2 기반 구조 정착
  - GitHub Actions 기반 Workers/Pages 배포 안정화(재시도/환경변수 보강)
  - CORS/네트워크 오류 대응 강화
- 다국어(i18n)
  - 13개 언어(ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar) 운영
  - Admin/Guardian/Public 영역 i18n 키 기반 렌더링으로 전환
  - 번역 자동화(ko 소스 기반) + 품질 점검/배포 게이트 적용
- 마스터 데이터
  - 마스터 6레벨(Category~L5) 구조 확장 및 정규화
  - 질병/식이/알레르기/펫 타입/품종/기기 관련 대규모 시드 반영
  - 하드코딩 제거 원칙 적용(선택값은 master_categories/items 기반)
- 인증/권한/스토리지
  - JWT 인증(Access/Refresh) 및 역할 기반 접근
  - R2 업로드/조회 API 및 가디언 업로드 UX 개선
- Guardian/Pet 도메인
  - 보호자/펫 CRUD, 펫 프로필(위저드), 몸무게 기록
  - 건강 측정 로그/타임라인, 혈당 경고 로직(저혈당/고혈당/급락)
  - 펫 앨범/갤러리 및 피드 연동
- Feed/예약/소셜
  - 피드 CRUD, 좋아요/댓글, 예약 흐름, SNS형 UI 정비
- 국가/통화
  - 국가/통화/매핑 테이블 구축 및 Admin 관리 기능 반영

## 3) 최근 개발 내역 (2026-03-08)
- 브랜딩/UI
  - Petfolio 웜 앰버 디자인 시스템 적용
  - Public 피드 3열 인스타그램 스타일 레이아웃 반영
  - Guardian 메인 대시보드 리디자인(프로필 스타일)
- 펫 위저드/저장 안정화
  - 편집 위저드 재로딩/내비게이션 안정화
  - 편집 시 저장 대상 ID/아이콘 액션/보조 fallback 로직 보강
  - 색상/성향 등 선택값 영속성 개선
- 다국어/로케일 일관화
  - 언어 선택기 위치 조정(사이드바/헤더) 및 locale 지속성 개선
  - 마스터 드롭다운 라벨을 API `display_label` + lang 전파 기준으로 통일
  - i18n fallback 정리(키 노출 최소화)
- 디바이스/카탈로그/마스터 확장
  - device manufacturer/brand/model 네이밍을 i18n key 중심으로 통합
  - 디바이스 관리 참조를 master L3 구조로 리팩터링
  - 사료(diet) L3 feed-type 시드 확장 및 체인 렌더링 복구
  - feed catalog 관리자 기능 추가 및 권한 체크 버그 수정
  - 카탈로그 다중 부모(multi-parent) 계층 + ko-first 자동번역 흐름 반영
- 국가/통화 시드 확장
  - KR/US/VN/JP 포함 국가/통화 기본값 추가
  - 13개 로케일 번역값으로 국가 시드 확장

## 4) 품질/운영 가드레일
- 마스터 저장 시 i18n 필수(ko 라벨 + 번역 페이로드)
- 번역 품질 점검 쿼리/엔드포인트 운영
  - `GET /api/v1/admin/i18n/audit?prefix=master.`
  - `src/db/queries/verify_master_i18n_gate.sql`
  - `src/db/queries/audit_i18n_quality.sql`
- 신규 도메인 옵션은 하드코딩 금지, 마스터/번역 테이블 기반 관리

## 5) 현재 잔여 과제
- Mobile(Flutter) 기능 본격 구현은 미완
- 일부 도메인(광고/예약/소셜)의 운영 시나리오별 E2E 검증 강화 필요
- 배포 전 점검 자동화(번역/마스터 무결성/마이그레이션 리허설) 지속 보강 필요

## 6) 참고 문서
- `Handoff.md`
- `documents/PLAN.md`
- `documents/PRD.md`
- `documents/LLD.md`
