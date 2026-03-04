# 단계별 외부 공식 레퍼런스 (조사본)

아래 링크는 각 슬라이스 구현 시 바로 참고 가능한 공식 문서 중심으로 정리했습니다.

## S0.1-S0.3 (인프라/기반)
- Cloudflare Workers Routes: https://developers.cloudflare.com/workers/configuration/routing/routes/
- Cloudflare D1 Migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Cloudflare D1 Wrangler Commands: https://developers.cloudflare.com/d1/wrangler-commands/
- Cloudflare Hyperdrive Get Started: https://developers.cloudflare.com/hyperdrive/get-started/
- Cloudflare Hyperdrive PostgreSQL 연결: https://developers.cloudflare.com/hyperdrive/configuration/connect-to-postgres/

## S1-S2 (i18n/마스터 데이터)
- PostgreSQL JSON/JSONB: https://www.postgresql.org/docs/current/datatype-json.html

## S3 (질병 매핑)
- PostgreSQL FK/인덱싱 설계 참고(공식 문서 허브): https://www.postgresql.org/docs/current/

## S4 (국가/통화)
- ISO 3166 국가코드: https://www.iso.org/iso-3166-country-codes.html
- ISO 4217 통화코드: https://www.iso.org/iso-4217-currency-codes.html

## S5 (인증/JWT/OAuth/R2)
- RFC 7519 JWT: https://www.rfc-editor.org/rfc/rfc7519
- RFC 6749 OAuth 2.0: https://www.rfc-editor.org/rfc/rfc6749
- Google ID Token 서버 검증: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- Apple Sign in with Apple 검증: https://developer.apple.com/documentation/signinwithapple/verifying-a-user
- Cloudflare Workers Web Crypto: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- Cloudflare R2 Presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Cloudflare R2 Workers API: https://developers.cloudflare.com/r2/get-started/workers-api/

## S6-S7 (Guardian 프로필/기록)
- PostgreSQL 공식 문서(테이블 설계/제약/인덱스): https://www.postgresql.org/docs/current/

## S8 (오프라인 동기화)
- Flutter sqflite 패키지: https://pub.dev/packages/sqflite

## S9-S10 (Provider/예약/피드)
- PostgreSQL 트랜잭션/잠금 참고: https://www.postgresql.org/docs/current/tutorial-transactions.html

## S11 (광고)
- Flutter Ads 개요: https://docs.flutter.dev/resources/ads-overview
- google_mobile_ads 패키지: https://pub.dev/packages/google_mobile_ads

## S12 (OAuth 마무리)
- OpenID Connect Core 1.0: https://openid.net/specs/openid-connect-core-1_0.html
- OAuth 2.0 (RFC 6749): https://www.rfc-editor.org/rfc/rfc6749
