-- 080: i18n keys for FriendsModal (guardian page)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Modal title & tabs ───────────────────────────────────────────────────────
(md5('i18n_gf_title'),        'guardian.friends.title',        'guardian', '친구', 'Friends', '友達', '好友', '好友', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),
(md5('i18n_gf_tab_friends'),  'guardian.friends.tab_friends',  'guardian', '친구 목록', 'Friends', '友達リスト', '好友列表', '好友列表', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),
(md5('i18n_gf_tab_pending'),  'guardian.friends.tab_pending',  'guardian', '대기중 요청', 'Pending', '承認待ち', '待处理', '待處理', 'Pendientes', 'En attente', 'Ausstehend', 'Pendentes', 'Đang chờ', 'รอดำเนินการ', 'Menunggu', 'قيد الانتظار', true, NOW(), NOW()),

-- ── Accept / Reject ──────────────────────────────────────────────────────────
(md5('i18n_gf_accept'),       'guardian.friends.accept',       'guardian', '수락', 'Accept', '承認', '接受', '接受', 'Aceptar', 'Accepter', 'Annehmen', 'Aceitar', 'Chấp nhận', 'ยอมรับ', 'Terima', 'قبول', true, NOW(), NOW()),
(md5('i18n_gf_reject'),       'guardian.friends.reject',       'guardian', '거절', 'Reject', '拒否', '拒绝', '拒絕', 'Rechazar', 'Refuser', 'Ablehnen', 'Rejeitar', 'Từ chối', 'ปฏิเสธ', 'Tolak', 'رفض', true, NOW(), NOW()),
(md5('i18n_gf_respond_fail'), 'guardian.friends.respond_failed','guardian', '요청 처리에 실패했습니다.', 'Failed to process request.', 'リクエストの処理に失敗しました。', '处理请求失败。', '處理請求失敗。', 'Error al procesar la solicitud.', 'Échec du traitement de la demande.', 'Anfrage konnte nicht verarbeitet werden.', 'Falha ao processar a solicitação.', 'Không thể xử lý yêu cầu.', 'ไม่สามารถดำเนินการตามคำขอได้', 'Gagal memproses permintaan.', 'فشل في معالجة الطلب.', true, NOW(), NOW()),

-- ── Empty states ─────────────────────────────────────────────────────────────
(md5('i18n_gf_empty_title'),  'guardian.friends.empty_title',  'guardian', '아직 친구가 없어요', 'No friends yet', 'まだ友達がいません', '还没有好友', '還沒有好友', 'Aún no hay amigos', 'Pas encore d''amis', 'Noch keine Freunde', 'Ainda sem amigos', 'Chưa có bạn bè', 'ยังไม่มีเพื่อน', 'Belum ada teman', 'لا يوجد أصدقاء بعد', true, NOW(), NOW()),
(md5('i18n_gf_empty_desc'),   'guardian.friends.empty_desc',   'guardian', '피드에서 친구 요청을 보내 연결해보세요.', 'Send friend requests from the feed to connect.', 'フィードから友達リクエストを送って繋がりましょう。', '从动态中发送好友请求来建立联系。', '從動態中發送好友請求來建立聯繫。', 'Envía solicitudes de amistad desde el feed.', 'Envoyez des demandes d''ami depuis le fil.', 'Senden Sie Freundschaftsanfragen aus dem Feed.', 'Envie pedidos de amizade pelo feed.', 'Gửi lời mời kết bạn từ bảng tin.', 'ส่งคำขอเป็นเพื่อนจากฟีด', 'Kirim permintaan pertemanan dari feed.', 'أرسل طلبات صداقة من الخلاصة.', true, NOW(), NOW()),
(md5('i18n_gf_nopend_title'), 'guardian.friends.no_pending_title','guardian', '대기중인 요청이 없어요', 'No pending requests', '承認待ちのリクエストはありません', '没有待处理的请求', '沒有待處理的請求', 'No hay solicitudes pendientes', 'Aucune demande en attente', 'Keine ausstehenden Anfragen', 'Sem pedidos pendentes', 'Không có yêu cầu đang chờ', 'ไม่มีคำขอที่รอดำเนินการ', 'Tidak ada permintaan tertunda', 'لا توجد طلبات معلقة', true, NOW(), NOW()),
(md5('i18n_gf_nopend_desc'),  'guardian.friends.no_pending_desc','guardian', '모든 요청을 처리했어요!', 'You''re all caught up!', 'すべてのリクエストを処理しました！', '所有请求已处理！', '所有請求已處理！', '¡Todo al día!', 'Tout est à jour !', 'Alles erledigt!', 'Tudo em dia!', 'Đã xử lý hết!', 'ดำเนินการครบแล้ว!', 'Semua sudah ditangani!', 'تم التعامل مع الكل!', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();
