# 0022 Restore Bangul Sample — Remote Apply Guide

목적:
- 기존 데이터 초기화 없이 `guardian@petlife.com` + `방울` 샘플 데이터를 복구한다.
- Guardian/Public 메인에서 기본 샘플 조회가 가능한 상태를 보장한다.

## 사전 조건

- Cloudflare 계정 로그인 완료 (`wrangler login`)
- `services/api/wrangler.jsonc`의 D1 바인딩(`pet-life-db`) 접근 권한 보유

## 실행

```bash
cd services/api
bash src/db/queries/apply_0022_restore_bangul_remote.sh
```

## 수동 실행(대안)

```bash
cd services/api
npx wrangler d1 execute pet-life-db --remote --file src/db/migrations/0022_restore_bangul_sample.sql
npx wrangler d1 execute pet-life-db --remote --command "SELECT version FROM schema_migrations WHERE version='0022_restore_bangul_sample';"
npx wrangler d1 execute pet-life-db --remote --command "SELECT u.email, p.id, p.name, p.microchip_no, p.birthday, p.current_weight FROM users u JOIN pets p ON p.guardian_id=u.id WHERE u.email='guardian@petlife.com' AND p.name='방울' AND p.status!='deleted';"
```

## 확인 포인트

- `schema_migrations`에 `0022_restore_bangul_sample` 존재
- `users.email='guardian@petlife.com'` 사용자 존재
- `pets.name='방울'` 레코드 존재, `microchip_no='BANGUL-0001'`
- `pet_album_media`에 profile 샘플 항목 존재 (source_type=`profile`)
