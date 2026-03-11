-- 반려동물 등록/수정 고정 필드 및 마이크로칩 UX i18n 키
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en, is_active, created_at, updated_at) VALUES
(lower(hex(randomblob(16))), 'guardian.pet_form.name_locked_help', 'guardian', '이름은 등록 후 변경할 수 없습니다.', 'Name cannot be changed after registration.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.pet_type_locked_help', 'guardian', '펫종류는 등록 후 변경할 수 없습니다.', 'Pet type cannot be changed after registration.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.breed_locked_help', 'guardian', '품종은 등록 후 변경할 수 없습니다.', 'Breed cannot be changed after registration.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.gender_locked_help', 'guardian', '성별은 등록 후 변경할 수 없습니다.', 'Gender cannot be changed after registration.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.microchip_check', 'guardian', '중복 확인', 'Check', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.microchip_checking', 'guardian', '확인 중...', 'Checking...', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.microchip_available', 'guardian', '등록 가능한 번호입니다.', 'This number is available for registration.', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.microchip_unknown', 'guardian', '모름', 'I do not know', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.microchip_placeholder', 'guardian', '마이크로칩 번호를 입력하세요', 'Enter microchip number', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.pet_form.microchip_country_code', 'guardian', '국가 코드', 'Country code', 1, datetime('now'), datetime('now'));
