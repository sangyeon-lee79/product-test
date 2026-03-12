-- 081: i18n keys for enriched friend request cards (guardian resume style)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Friend card sections ────────────────────────────────────────────────────
(md5('i18n_gfc_pets_title'),    'guardian.friends.card.pets_title',    'guardian', '반려동물', 'Pets', 'ペット', '宠物', '寵物', 'Mascotas', 'Animaux', 'Haustiere', 'Pets', 'Thú cưng', 'สัตว์เลี้ยง', 'Hewan Peliharaan', 'حيوانات أليفة', true, NOW(), NOW()),
(md5('i18n_gfc_more_pets'),     'guardian.friends.card.more_pets',     'guardian', '+{count}마리 더', '+{count} more', '+{count}匹', '+{count}只', '+{count}隻', '+{count} más', '+{count} de plus', '+{count} mehr', '+{count} mais', '+{count} nữa', '+{count} เพิ่มเติม', '+{count} lagi', '+{count} أخرى', true, NOW(), NOW()),
(md5('i18n_gfc_recent_posts'),  'guardian.friends.card.recent_posts',  'guardian', '최근 게시물', 'Recent Posts', '最近の投稿', '最近帖子', '最近貼文', 'Publicaciones recientes', 'Publications récentes', 'Neueste Beiträge', 'Posts recentes', 'Bài đăng gần đây', 'โพสต์ล่าสุด', 'Postingan Terbaru', 'المنشورات الأخيرة', true, NOW(), NOW()),
(md5('i18n_gfc_no_pets'),       'guardian.friends.card.no_pets',       'guardian', '등록된 반려동물이 없습니다', 'No pets registered', 'ペットが登録されていません', '没有注册宠物', '沒有註冊寵物', 'Sin mascotas registradas', 'Aucun animal enregistré', 'Keine Haustiere registriert', 'Sem pets registrados', 'Chưa đăng ký thú cưng', 'ไม่มีสัตว์เลี้ยงที่ลงทะเบียน', 'Belum ada hewan peliharaan', 'لا توجد حيوانات مسجلة', true, NOW(), NOW()),
(md5('i18n_gfc_requested_at'),  'guardian.friends.card.requested_at',  'guardian', '요청일', 'Requested', 'リクエスト日', '请求日期', '請求日期', 'Solicitado', 'Demandé le', 'Angefragt am', 'Solicitado em', 'Ngày yêu cầu', 'วันที่ขอ', 'Tanggal permintaan', 'تاريخ الطلب', true, NOW(), NOW()),
(md5('i18n_gfc_pet_age'),       'guardian.friends.card.pet_age',       'guardian', '{age}세', '{age}y', '{age}歳', '{age}岁', '{age}歲', '{age}a', '{age}a', '{age}J', '{age}a', '{age}t', '{age}ปี', '{age}th', '{age}سنة', true, NOW(), NOW()),
(md5('i18n_gfc_joined'),        'guardian.friends.card.joined',        'guardian', '가입', 'Joined', '登録', '加入', '加入', 'Registrado', 'Inscrit', 'Beigetreten', 'Registrado', 'Tham gia', 'เข้าร่วม', 'Bergabung', 'انضم', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();
