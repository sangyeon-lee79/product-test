# S2 보충자료 - 마스터 데이터

## 1. 카테고리 사전 (10종)
| Category Key | 설명 | 사용 화면 |
|---|---|---|
| `industry` | 매장 업종 (미용, 병원 등) | Provider 매장 등록, Guardian 매장 검색 |
| `breed` | 반려동물 견종/묘종 | 펫 등록/수정 |
| `disease` | 질병 목록 | 펫 질병 연결, 질병 기록 |
| `symptom` | 증상 목록 | 질병 기록 (symptom_event_log) |
| `metric` | 측정 수치 항목 (혈당, 인슐린량 등) | 질병 기록 입력폼 |
| `unit` | 측정 단위 (mg/dL, IU, ml 등) | 질병 기록 입력폼 |
| `log_type` | 기록 유형 (혈당기록, 식단기록 등) | 타임라인, 기록 추가 화면 |
| `interest` | 보호자 관심사 (훈련, 건강, 미용 등) | 가디언 프로필 |
| `country_ref` | 국가 참조 데이터 | 국가 설정 관리 |
| `ad_slot` | 광고 슬롯 위치 | 광고 관리, 앱 UI |

---

## 2. 아이템 키 네이밍 규칙
아이템의 `key`는 해당 카테고리를 접두사로 사용하여 유일하게 구성한다.
- **규칙**: `master.<category>.<item>`
- **예시**:
  - `master.breed.pomeranian`
  - `master.log_type.blood_glucose_log`
  - `master.unit.mg_dl`

---

## 3. 비활성 정책 가이드
- **삭제 금지**: 데이터 무결성을 위해 참조 중인 마스터 아이템은 삭제하지 않는다.
- **비활성화**: 더 이상 사용하지 않을 경우 `is_active=false`로 처리한다.
- **UI 노출**: 클라이언트 API는 기본적으로 `is_active=true`인 항목만 반환한다.

---

## 4. Seed 데이터 기준
- **MVP 필수셋**: `PLAN.md`에서 정의된 기초 10종 카테고리와 당뇨 기록에 필요한 아이템들.
- **확장셋**: 베타 서비스 이후 견종(breed), 질병(disease) 목록을 점진적으로 추가.
- **언어연결**: 모든 마스터 아이템은 `i18n_translations`의 키와 1:1 매칭되어야 한다.
