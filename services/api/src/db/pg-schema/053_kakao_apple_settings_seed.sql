-- 053: Kakao / Apple platform_settings seed keys
-- Follows same pattern as Google settings in platform_settings table

-- Kakao OAuth settings (4 keys)
INSERT INTO platform_settings (id, setting_key, setting_value, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'kakao_rest_api_key',    '', now(), now()),
  (gen_random_uuid()::text, 'kakao_javascript_key',  '', now(), now()),
  (gen_random_uuid()::text, 'kakao_redirect_uri',    '', now(), now()),
  (gen_random_uuid()::text, 'kakao_verified_at',     '', now(), now())
ON CONFLICT (setting_key) DO NOTHING;

-- Apple Sign-In settings (6 keys)
INSERT INTO platform_settings (id, setting_key, setting_value, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'apple_service_id',    '', now(), now()),
  (gen_random_uuid()::text, 'apple_team_id',       '', now(), now()),
  (gen_random_uuid()::text, 'apple_key_id',        '', now(), now()),
  (gen_random_uuid()::text, 'apple_private_key',   '', now(), now()),
  (gen_random_uuid()::text, 'apple_redirect_uri',  '', now(), now()),
  (gen_random_uuid()::text, 'apple_verified_at',   '', now(), now())
ON CONFLICT (setting_key) DO NOTHING;
