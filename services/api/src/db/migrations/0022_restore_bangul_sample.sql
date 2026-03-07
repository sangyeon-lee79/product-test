-- Migration 0022: Restore Guardian sample data ("방울") for normalized schema
-- 대상 스키마: pets.guardian_user_id / pets.microchip_number (core alignment 이후)

-- 1) Guardian 계정 보장
INSERT OR IGNORE INTO users (id, email, role, created_at, updated_at)
VALUES ('seed-guardian-bangul', 'guardian@petlife.com', 'guardian', datetime('now'), datetime('now'));

UPDATE users
SET role = 'guardian', updated_at = datetime('now')
WHERE email = 'guardian@petlife.com';

-- 2) Guardian 프로필 보장
INSERT OR IGNORE INTO user_profiles (
  id, user_id, handle, display_name, avatar_url, bio, bio_translations,
  country_id, language, timezone, interests, created_at, updated_at
)
SELECT
  'seed-profile-bangul',
  u.id,
  NULL,
  '방울맘',
  'https://placehold.co/320x320?text=Bangul',
  '방울이와 함께하는 일상 기록',
  '{}',
  NULL,
  'ko',
  'Asia/Seoul',
  '[]',
  datetime('now'),
  datetime('now')
FROM users u
WHERE u.email = 'guardian@petlife.com';

UPDATE user_profiles
SET display_name = COALESCE(display_name, '방울맘'),
    avatar_url = COALESCE(avatar_url, 'https://placehold.co/320x320?text=Bangul'),
    bio = COALESCE(bio, '방울이와 함께하는 일상 기록'),
    updated_at = datetime('now')
WHERE user_id = (SELECT id FROM users WHERE email = 'guardian@petlife.com' LIMIT 1);

-- 3) 방울 펫 보장
INSERT INTO pets (
  id,
  guardian_user_id,
  name,
  microchip_number,
  pet_type_id,
  breed_id,
  gender_id,
  life_stage_id,
  body_size_id,
  country_id,
  diet_type_id,
  coat_length_id,
  coat_type_id,
  activity_level_id,
  health_level_id,
  gender_legacy,
  species_legacy,
  birth_date,
  weight_kg,
  is_neutered,
  avatar_url,
  status,
  created_at,
  updated_at
)
SELECT
  'seed-pet-bangul',
  u.id,
  '방울',
  'BANGUL-0001',
  (SELECT id FROM master_items WHERE code = 'dog' LIMIT 1),
  (SELECT id FROM master_items WHERE code = 'pomeranian' LIMIT 1),
  (SELECT id FROM master_items WHERE code = 'female' LIMIT 1),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'female',
  'dog',
  '2021-03-15',
  4.2,
  0,
  'https://placehold.co/600x600?text=Bangul',
  'active',
  datetime('now'),
  datetime('now')
FROM users u
WHERE u.email = 'guardian@petlife.com'
  AND NOT EXISTS (
    SELECT 1
    FROM pets p
    WHERE p.guardian_user_id = u.id
      AND p.name = '방울'
      AND p.status != 'deleted'
  );

UPDATE pets
SET
  microchip_number = COALESCE(microchip_number, 'BANGUL-0001'),
  avatar_url = COALESCE(avatar_url, 'https://placehold.co/600x600?text=Bangul'),
  birth_date = COALESCE(birth_date, '2021-03-15'),
  weight_kg = COALESCE(weight_kg, 4.2),
  updated_at = datetime('now')
WHERE id IN (
  SELECT p.id
  FROM pets p
  INNER JOIN users u ON u.id = p.guardian_user_id
  WHERE u.email = 'guardian@petlife.com'
    AND p.name = '방울'
    AND p.status != 'deleted'
);

-- 4) 몸무게 로그 보장 (table/column 존재 전제: pet_weight_logs from 0020)
INSERT OR IGNORE INTO pet_weight_logs (
  id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
)
SELECT
  'seed-weightlog-bangul-1',
  p.id,
  COALESCE(p.weight_kg, 4.2),
  (SELECT id FROM master_items WHERE code = 'kg' LIMIT 1),
  datetime('now'),
  p.guardian_user_id,
  '샘플 초기 몸무게',
  datetime('now'),
  datetime('now')
FROM pets p
INNER JOIN users u ON u.id = p.guardian_user_id
WHERE u.email = 'guardian@petlife.com'
  AND p.name = '방울'
  AND p.status != 'deleted';

-- 5) 피드 샘플 보장 (feed_posts 기반)
INSERT OR IGNORE INTO feed_posts (
  id, author_user_id, author_role, feed_type, visibility_scope, caption, status, created_at, updated_at
)
SELECT
  'seed-feed-bangul-intro',
  u.id,
  'guardian',
  'guardian_post',
  'public',
  '방울이의 첫 샘플 피드입니다.',
  'published',
  datetime('now'),
  datetime('now')
FROM users u
WHERE u.email = 'guardian@petlife.com';

INSERT OR IGNORE INTO feed_post_pets (id, post_id, pet_id, sort_order)
SELECT
  'seed-feed-post-pet-bangul',
  'seed-feed-bangul-intro',
  p.id,
  0
FROM pets p
INNER JOIN users u ON u.id = p.guardian_user_id
WHERE u.email = 'guardian@petlife.com'
  AND p.name = '방울'
  AND p.status != 'deleted';

INSERT OR IGNORE INTO feed_media (id, post_id, media_type, media_url, thumbnail_url, sort_order)
VALUES (
  'seed-feed-media-bangul',
  'seed-feed-bangul-intro',
  'image',
  'https://placehold.co/1200x900?text=Bangul+Feed',
  'https://placehold.co/1200x900?text=Bangul+Feed',
  0
);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0022_restore_bangul_sample');
