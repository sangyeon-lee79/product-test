# S7 보충자료 - 질병 기록 + 타임라인

## 1. 7종 LogType 입력 템플릿
각 로그 유형에 따라 `metadata`와 `values`를 다르게 구성한다.
- **혈당기록 (`blood_glucose_log`)**: `numeric_value` (수치), `unit` (mg/dL|mmol/L), `metadata` (측정방식).
- **인슐린기록 (`insulin_log`)**: `numeric_value` (용량, IU), `metadata` (인슐린 종류).
- **식단기록 (`meal_log`)**: `numeric_value` (무게, g), `metadata` (사료 종류, kcal).
- **수분기록 (`water_log`)**: `numeric_value` (ml).
- **운동기록 (`activity_log`)**: `numeric_value` (분, min), `metadata` (운동종류).
- **이벤트기록 (`symptom_event_log`)**: `text_value` (증상 설명), `metadata` (이벤트 종류).
- **검사/병원기록 (`lab_test_log`)**: `media` (검사지 사진), `text_value` (진단 내용).

---

## 2. 위험 경고 임계치 및 알림 정책
혈당 수치 입력 시 즉시 서버에서 판정하여 응답의 `alert` 객체에 포함한다.
- **긴급 저혈당 (Critical)**: `< 60 mg/dL`
- **저혈당 주의 (Warning)**: `< 80 mg/dL`
- **고혈당 주의 (Warning)**: `> 300 mg/dL`
- **급락 경고**: 직전 기록 대비 `-50 mg/dL` 이상 하락 시.

---

## 3. 타임라인 필터 및 정렬 API 계약
- **Endpoint**: `GET /api/v1/pets/:petId/logs`
- **Query Params**:
  - `logtype`: 특정 유형 필터 (쉼표 구분 가능).
  - `date_from`, `date_to`: 기간 필터.
  - `sort`: `desc` (최신순, 기본값), `asc` (오래된순).
  - `page`, `limit`: 페이징 처리.

---

## 4. 기록 미디어 업로드 규칙
- **저장 경로**: `logs/{logId}/{uuid}.jpg`
- **Thumbnail**: 서버에서 생성하여 `log_media`의 `thumbnail_url`에 별도 저장 권장.
- **최대 개수**: 1회 기록 당 사진 최대 5장으로 제한.
