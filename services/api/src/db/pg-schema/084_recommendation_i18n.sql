-- 084: i18n keys for user recommendation cards

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(md5('i18n_reco_title'),          'public.recommend.card_title',     'public', '추천 Guardian', 'Recommended Guardian', 'おすすめガーディアン', '推荐监护人', '推薦監護人', 'Guardian recomendado', 'Guardian recommandé', 'Empfohlener Guardian', 'Guardian recomendado', 'Guardian được đề xuất', 'ผู้ดูแลที่แนะนำ', 'Guardian Direkomendasikan', 'وصي موصى به', true, NOW(), NOW()),
(md5('i18n_reco_reason_breed'),   'public.recommend.reason_breed',   'public', '같은 품종', 'Same breed', '同じ品種', '相同品种', '相同品種', 'Misma raza', 'Même race', 'Gleiche Rasse', 'Mesma raça', 'Cùng giống', 'สายพันธุ์เดียวกัน', 'Ras yang sama', 'نفس السلالة', true, NOW(), NOW()),
(md5('i18n_reco_reason_mutual'),  'public.recommend.reason_mutual',  'public', '함께 아는 친구 {n}명', '{n} mutual friends', '共通の友達 {n}人', '{n}个共同好友', '{n}個共同好友', '{n} amigos en común', '{n} amis en commun', '{n} gemeinsame Freunde', '{n} amigos em comum', '{n} bạn chung', 'เพื่อนร่วม {n} คน', '{n} teman bersama', '{n} أصدقاء مشتركين', true, NOW(), NOW()),
(md5('i18n_reco_reason_product'), 'public.recommend.reason_product', 'public', '같은 사료/영양제', 'Same food/supplement', '同じフード/サプリ', '相同食品/营养品', '相同食品/營養品', 'Mismo alimento', 'Même alimentation', 'Gleiches Futter', 'Mesmo alimento', 'Cùng thức ăn', 'อาหารเดียวกัน', 'Makanan yang sama', 'نفس الطعام', true, NOW(), NOW()),
(md5('i18n_reco_reason_provider'),'public.recommend.reason_provider','public', '같은 병원/미용실', 'Same vet/groomer', '同じ病院/サロン', '相同医院/美容院', '相同醫院/美容院', 'Mismo veterinario', 'Même vétérinaire', 'Gleicher Tierarzt', 'Mesmo veterinário', 'Cùng bệnh viện', 'สัตวแพทย์เดียวกัน', 'Dokter hewan yang sama', 'نفس البيطري', true, NOW(), NOW()),
(md5('i18n_reco_type_dog'),       'public.recommend.type_dog',       'public', '🐶 강아지 보호자', '🐶 Dog parent', '🐶 犬の保護者', '🐶 狗狗家长', '🐶 狗狗家長', '🐶 Dueño de perro', '🐶 Parent de chien', '🐶 Hundebesitzer', '🐶 Dono de cão', '🐶 Chủ chó', '🐶 เจ้าของสุนัข', '🐶 Pemilik anjing', '🐶 صاحب كلب', true, NOW(), NOW()),
(md5('i18n_reco_type_cat'),       'public.recommend.type_cat',       'public', '🐱 고양이 보호자', '🐱 Cat parent', '🐱 猫の保護者', '🐱 猫咪家长', '🐱 貓咪家長', '🐱 Dueño de gato', '🐱 Parent de chat', '🐱 Katzenbesitzer', '🐱 Dono de gato', '🐱 Chủ mèo', '🐱 เจ้าของแมว', '🐱 Pemilik kucing', '🐱 صاحب قطة', true, NOW(), NOW()),
(md5('i18n_reco_type_other'),     'public.recommend.type_other',     'public', '🐾 반려동물 보호자', '🐾 Pet parent', '🐾 ペットの保護者', '🐾 宠物家长', '🐾 寵物家長', '🐾 Dueño de mascota', '🐾 Parent d''animal', '🐾 Tierbesitzer', '🐾 Dono de pet', '🐾 Chủ thú cưng', '🐾 เจ้าของสัตว์เลี้ยง', '🐾 Pemilik hewan', '🐾 صاحب حيوان أليف', true, NOW(), NOW()),
(md5('i18n_reco_view_profile'),   'public.recommend.view_profile',   'public', '프로필 보기', 'View Profile', 'プロフィール表示', '查看资料', '查看資料', 'Ver perfil', 'Voir le profil', 'Profil ansehen', 'Ver perfil', 'Xem hồ sơ', 'ดูโปรไฟล์', 'Lihat Profil', 'عرض الملف الشخصي', true, NOW(), NOW()),
(md5('i18n_reco_score_label'),    'public.recommend.score_label',    'public', '매칭 점수', 'Match score', 'マッチスコア', '匹配分', '配對分', 'Puntuación', 'Score', 'Punktzahl', 'Pontuação', 'Điểm', 'คะแนน', 'Skor', 'نقاط', true, NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar;
