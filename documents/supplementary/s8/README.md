# S8 보충자료 - 오프라인 동기화

## 1. sync_version 정책
- **증분 관리**: 모든 기록은 서버 생성/수정 시 `sync_version`이 1씩 증가한다.
- **충돌 판정**: 서버의 `sync_version`과 클라이언트가 알고 있는 `sync_version`이 다를 경우 충돌로 간주한다.
- **해결**: 서버의 최종 버전이 클라이언트 버전보다 높으면 서버 데이터를 우선으로 덮어쓴다.

---

## 2. SQLite local_logs 스키마 문서
모바일 앱의 로컬 저장소 스키마는 서버와 유사하나 동기화 상태 필드가 추가된다.
```sql
CREATE TABLE local_logs (
    local_id        TEXT PRIMARY KEY,
    server_id       TEXT,
    is_synced       INTEGER DEFAULT 0, -- 0: 미동기화, 1: 동기화 완료
    sync_version    INTEGER DEFAULT 0,
    -- ... logs 테이블과 동일한 필드들
    values_json     TEXT, -- log_values 데이터를 JSON 문자열로 저장
    metadata        TEXT  -- metadata를 JSON 문자열로 저장
);
```

---

## 3. 동기화 상태 UI 가이드
- **미동기화**: 구름 아이콘에 사선(/) 또는 주황색 배지.
- **동기화 중**: 회전하는 로딩 아이콘.
- **동기화 완료**: 체크마크 아이콘 또는 아이콘 소멸.
- **충돌 발생**: 빨간색 느낌표 아이콘 및 사용자 알림 팝업.

---

## 4. 충돌 해결 정책
1. **마지막 수정 우선 (LWW)**: 기본적으로 `updated_at`이 더 최신인 기록을 서버에 유지한다.
2. **배치 처리**: `POST /logs/sync`를 통해 한꺼번에 여러 건을 동기화하며, 개별 건별로 성공/충돌 여부를 응답받는다.
3. **사용자 개입**: 충돌이 심각할 경우(수치 데이터 차이 큼) 사용자에게 양쪽 데이터를 보여주고 선택하게 유도한다.
