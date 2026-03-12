-- 089: NFC 정규화 — 기존 NFD 데이터 수정
-- macOS에서 입력된 한국어/일본어 등이 NFD로 저장된 경우 NFC로 변환

-- user_profiles.display_name
UPDATE user_profiles
SET display_name = normalize(display_name, NFC),
    updated_at = CURRENT_TIMESTAMP
WHERE display_name IS NOT NULL
  AND display_name IS DISTINCT FROM normalize(display_name, NFC);

-- user_profiles.handle
UPDATE user_profiles
SET handle = normalize(handle, NFC),
    updated_at = CURRENT_TIMESTAMP
WHERE handle IS NOT NULL
  AND handle IS DISTINCT FROM normalize(handle, NFC);

-- user_profiles.bio
UPDATE user_profiles
SET bio = normalize(bio, NFC),
    updated_at = CURRENT_TIMESTAMP
WHERE bio IS NOT NULL
  AND bio IS DISTINCT FROM normalize(bio, NFC);

-- user_account_details.full_name
UPDATE user_account_details
SET full_name = normalize(full_name, NFC),
    updated_at = CURRENT_TIMESTAMP
WHERE full_name IS NOT NULL
  AND full_name IS DISTINCT FROM normalize(full_name, NFC);

-- pets.name
UPDATE pets
SET name = normalize(name, NFC),
    updated_at = CURRENT_TIMESTAMP
WHERE name IS NOT NULL
  AND name IS DISTINCT FROM normalize(name, NFC);

-- pets.bio
UPDATE pets
SET bio = normalize(bio, NFC),
    updated_at = CURRENT_TIMESTAMP
WHERE bio IS NOT NULL
  AND bio IS DISTINCT FROM normalize(bio, NFC);
