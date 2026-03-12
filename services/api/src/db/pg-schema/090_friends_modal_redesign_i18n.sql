-- 090: i18n keys for friend modal redesign

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Guardian label on friend card ──────────────────────────────────────────────
(md5('i18n_gfc_guardian_label'), 'guardian.friends.card.guardian_label', 'guardian', '보호자', 'Guardian', '保護者', '监护人', '監護人', 'Tutor', 'Tuteur', 'Betreuer', 'Tutor', 'Người giám hộ', 'ผู้ดูแล', 'Penjaga', 'الوصي', true, NOW(), NOW()),

-- ── Feed section label ─────────────────────────────────────────────────────────
(md5('i18n_gfc_feed_title'), 'guardian.friends.card.feed_title', 'guardian', '피드', 'Feed', 'フィード', '动态', '動態', 'Feed', 'Fil', 'Feed', 'Feed', 'Bảng tin', 'ฟีด', 'Feed', 'الخلاصة', true, NOW(), NOW()),

-- ── Accepted toast ─────────────────────────────────────────────────────────────
(md5('i18n_gfc_accepted_msg'), 'guardian.friends.accepted_msg', 'guardian', '친구가 되었습니다!', 'You are now friends!', '友達になりました！', '已成为好友！', '已成為好友！', '¡Ahora son amigos!', 'Vous êtes maintenant amis !', 'Ihr seid jetzt Freunde!', 'Agora são amigos!', 'Đã trở thành bạn bè!', 'เป็นเพื่อนกันแล้ว!', 'Sekarang berteman!', 'أصبحتم أصدقاء!', true, NOW(), NOW()),

-- ── Rejected toast ─────────────────────────────────────────────────────────────
(md5('i18n_gfc_rejected_msg'), 'guardian.friends.rejected_msg', 'guardian', '요청을 거절했습니다', 'Request declined', 'リクエストを拒否しました', '已拒绝请求', '已拒絕請求', 'Solicitud rechazada', 'Demande refusée', 'Anfrage abgelehnt', 'Pedido recusado', 'Đã từ chối yêu cầu', 'ปฏิเสธคำขอแล้ว', 'Permintaan ditolak', 'تم رفض الطلب', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();
