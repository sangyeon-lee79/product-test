# S6 보충자료 - Guardian 프로필 + 펫

## 1. handle 규칙 및 정책
- **규칙**: 소문자 영문, 숫자, 언더바(_), 점(.)만 허용.
- **길이**: 최소 3자, 최대 20자.
- **중복 정책**: 실시간 API(`/guardians/check-handle`)를 통해 고유성 검증. 한 번 선점된 핸들은 변경 전까지 유일하다.

---

## 2. 프로필/펫 입력 검증 스펙
- **Guardian Profile**: `display_name` (필수), `country_id` (필수), `handle` (필수/고유).
- **Pet Profile**: 
  - `name` (필수, 20자 이내)
  - `species` (필수: `dog`, `cat`, `other`)
  - `breed_id` (필수, `breed` 마스터 아이템)
  - `birth_date` (필수, 미래 날짜 불가)

---

## 3. 이미지 업로드 정책 (avatar)
- 사용자가 업로드 시 `S5` Presigned URL 발급 절차를 따른다.
- **사용자 아바타**: `avatars/users/{userId}/avatar.jpg`
- **펫 아바타**: `avatars/pets/{petId}/avatar.jpg`
- 기존 이미지가 있을 경우 R2에서 덮어쓰거나 기존 파일을 삭제 후 신규 업로드한다.

---

## 4. 펫-질병 연결 운영 기준
- **연결 시점**: 펫 등록 시 또는 등록 후 펫 프로필 편집에서 질병 선택.
- **활성화**: `is_active=true`인 연결만 `S7` 기록 입력 시 입력 항목 구성의 기반이 된다.
- **기록**: 질병 연결이 해제되더라도 이전에 작성된 질병 기록(`logs`)은 보존된다.
