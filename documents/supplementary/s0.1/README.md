# S0.1 보충자료 - Repo & 폴더 구조

## 1. 폴더 구조 표준 (Monorepo)
프로젝트는 기능별로 `apps/`, `services/`, `packages/`로 구분한다.

### `apps/` (실행 가능한 어플리케이션)
- `mobile/`: Flutter 기반 Guardian/Provider 통합 앱.
- `admin-web/`: React 기반 관리자 웹.
- `guardian-web/`: React 기반 보호자용 모바일 웹.
- `provider-web/`: React 기반 공급자(병원/미용)용 웹 (MVP 확장).

### `services/` (백엔드 서비스)
- `api/`: Cloudflare Workers 기반 통합 REST API.
  - `src/db/migrations/`: 모든 DB 스키마 변경 이력 관리.

### `packages/` (공용 라이브러리)
- `shared/`: 앱과 서버가 공유하는 타입, 밸리데이터, i18n 키 정의.

---

## 2. 네이밍 규칙
- **폴더명**: `kebab-case` (예: `admin-web`, `shared-types`)
- **파일명**:
  - React: `PascalCase.tsx` (컴포넌트), `camelCase.ts` (유틸/훅)
  - Flutter: `snake_case.dart`
  - API: `camelCase.ts`
- **DB 테이블**: `snake_case` (복수형 권장, 예: `user_profiles`, `master_items`)
- **DB 컬럼**: `snake_case`

---

## 3. 신규 모듈 추가 템플릿
새로운 기능을 추가할 때는 아래 구조를 유지한다.

### API Route 추가
1. `services/api/src/routes/`에 파일 생성.
2. `index.ts`에 라우트 등록.
3. `packages/shared/types/`에 관련 인터페이스 정의.

### UI 컴포넌트 추가
1. `components/` 내 기능별 폴더 생성.
2. `index.ts`를 통해 외부 노출.
3. 관련 i18n 키를 `S1` 절차에 따라 먼저 등록.

---

## 4. 루트 의존성 및 스크립트
루트 `package.json`에서 전체 워크스페이스를 관리한다.
- `npm run dev`: 전체 개발 서버 실행.
- `npm run build`: 전체 빌드.
- `npm run test`: 전체 테스트 실행.
