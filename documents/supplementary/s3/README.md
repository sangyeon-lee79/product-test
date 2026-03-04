# S3 보충자료 - 질병 연결 매핑

## 1. 매핑 4테이블 구조 및 제약조건
질병 기록 입력폼 구성을 위해 아래 4단계 매핑을 사용한다.
- `disease_symptom_map`: 특정 질병에 나타나는 증상.
- `symptom_metric_map`: 증상에 따라 측정해야 할 수치 항목.
- `metric_unit_map`: 수치 항목에 사용 가능한 단위.
- `metric_logtype_map`: 수치 항목이 저장될 로그 유형.

---

## 2. 트리 API 응답 스키마 (JSON 예시)
`GET /api/v1/master/disease-map?disease_id=uuid` 호출 시 응답 예시:
```json
{
  "disease": { "id": "uuid", "key": "diabetes" },
  "symptoms": [
    {
      "id": "uuid", "key": "hyperglycemia", "required": true,
      "metrics": [
        {
          "id": "uuid", "key": "blood_glucose",
          "units": [
            { "id": "uuid", "key": "mg_dl", "is_default": true },
            { "id": "uuid", "key": "mmol_l" }
          ],
          "log_types": [
            { "id": "uuid", "key": "blood_glucose_log", "is_default": true }
          ]
        }
      ]
    }
  ]
}
```

---

## 3. Admin Tree 편집 UX 규칙
- **필수 여부**: `is_required` 체크 시 입력폼에서 누락 불가.
- **정렬**: `sort_order`를 통해 입력 항목 순서 고정.
- **기본값**: `is_default` 설정된 단위(unit)가 입력 시 자동 선택됨.
- **삭제 정책**: 연결 사용 중인 경우 삭제 대신 `is_active=false`.

---

## 4. 당뇨 기준 기준데이터(골든셋) 입력 템플릿
- **질병**: 당뇨 (diabetes)
- **증상**: 고혈당(hyperglycemia), 저혈당(hypoglycemia), 식이관리(meal_management)
- **수치**: 
  - 고혈당/저혈당 -> `blood_glucose` (단위: mg/dL, mmol/L) -> `blood_glucose_log`
  - 식이관리 -> `food_weight` (단위: g) -> `meal_log`
  - 식이관리 -> `calorie_intake` (단위: kcal) -> `meal_log`
