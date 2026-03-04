# S4 보충자료 - 국가/통화 관리

## 1. 국가/통화 표준 (ISO)
- **국가**: ISO 3166-1 alpha-2/3 코드 준수 (예: KR/KOR, US/USA).
- **통화**: ISO 4217 코드 준수 (예: KRW, USD, JPY).

---

## 2. 소수점 및 통화 기호 정책
- **소수점**: `decimal_places` 컬럼을 통해 통화별 소수점 자릿수 관리 (예: KRW=0, USD=2).
- **기호**: `symbol` 컬럼에 각국 통화 기호 저장 (예: ₩, $, ¥).

---

## 3. 국가-통화 기본 매핑 운영 규칙
- **기본 통화**: 특정 국가에서 결제 또는 가격 표시 시 기본적으로 선택되는 통화 (`is_default=true`).
- **다중 통화**: 한 국가에서 여러 통화를 사용할 경우 맵 테이블에 복수 등록 가능하나, 기본값은 반드시 하나여야 한다.

---

## 4. 다국어 국가명 Key 목록
모든 국가는 `i18n_translations`에 아래와 같은 키로 이름을 등록해야 한다.
- `master.country_ref.kr`: "대한민국"
- `master.country_ref.us`: "미국"
- `master.country_ref.jp`: "일본"

---

## 5. 주요 시장 Seed 목록 (초기)
| Code | Name Key | Currency Code | Symbol |
|---|---|---|---|
| KR | master.country_ref.kr | KRW | ₩ |
| US | master.country_ref.us | USD | $ |
| JP | master.country_ref.jp | JPY | ¥ |
| VN | master.country_ref.vn | VND | ₫ |
