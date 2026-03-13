INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
  (gen_random_uuid()::text, 'timeline.tab.my_feed', 'guardian', '내 피드', 'My Feed', 'マイフィード', '我的动态', '我的動態', 'Mi feed', 'Mon fil', 'Mein Feed', 'Meu feed', 'Bảng feed của tôi', 'ฟีดของฉัน', 'Feed Saya', 'منشوراتي'),
  (gen_random_uuid()::text, 'timeline.tab.friend_feed', 'guardian', '친구 피드', 'Friends Feed', '友だちフィード', '好友动态', '好友動態', 'Feed de amigos', 'Fil des amis', 'Freundes-Feed', 'Feed de amigos', 'Feed bạn bè', 'ฟีดเพื่อน', 'Feed Teman', 'خلاصة الأصدقاء'),
  (gen_random_uuid()::text, 'feed.type.supplier_post', 'guardian', '매장 소식', 'Store Post', '店舗のお知らせ', '门店消息', '門市消息', 'Novedades de la tienda', 'Actualité de la boutique', 'Neuigkeiten des Geschäfts', 'Novidades da loja', 'Tin từ cửa hàng', 'ข่าวร้านค้า', 'Info Toko', 'أخبار المتجر'),
  (gen_random_uuid()::text, 'feed.type.grooming_record', 'guardian', '미용 완료', 'Grooming', 'トリミング完了', '美容完成', '美容完成', 'Peluquería', 'Toilettage', 'Pflege', 'Tosa', 'Hoàn tất chăm sóc', 'ตัดแต่งเสร็จสิ้น', 'Perawatan Selesai', 'اكتمل التجميل'),
  (gen_random_uuid()::text, 'feed.type.health_record', 'guardian', '건강 기록', 'Health', '健康記録', '健康记录', '健康紀錄', 'Salud', 'Santé', 'Gesundheit', 'Saúde', 'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'السجل الصحي'),
  (gen_random_uuid()::text, 'feed.type.general', 'guardian', '일반 게시물', 'Post', '一般投稿', '普通帖子', '一般貼文', 'Publicación', 'Publication', 'Beitrag', 'Postagem', 'Bài đăng', 'โพสต์', 'Posting', 'منشور'),
  (gen_random_uuid()::text, 'feed.visibility.public', 'guardian', '전체 공개', 'Public', '公開', '公开', '公開', 'Público', 'Public', 'Öffentlich', 'Público', 'Công khai', 'สาธารณะ', 'Publik', 'عام'),
  (gen_random_uuid()::text, 'feed.visibility.friends', 'guardian', '친구 공개', 'Friends', '友だち公開', '好友可见', '好友可見', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'للأصدقاء'),
  (gen_random_uuid()::text, 'feed.visibility.private', 'guardian', '나만 보기', 'Private', '自分のみ', '仅自己可见', '僅自己可見', 'Privado', 'Privé', 'Privat', 'Privado', 'Chỉ mình tôi', 'เฉพาะฉัน', 'Pribadi', 'خاص')
ON CONFLICT (key) DO UPDATE SET
  page = EXCLUDED.page,
  ko = EXCLUDED.ko,
  en = EXCLUDED.en,
  ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn,
  zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es,
  fr = EXCLUDED.fr,
  de = EXCLUDED.de,
  pt = EXCLUDED.pt,
  vi = EXCLUDED.vi,
  th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang,
  ar = EXCLUDED.ar,
  updated_at = NOW();
