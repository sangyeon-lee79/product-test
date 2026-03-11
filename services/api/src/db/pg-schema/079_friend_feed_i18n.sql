-- 079: i18n keys for friend system + feed separation + notifications

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Friend buttons ─────────────────────────────────────────────────────────────
(md5('i18n_fr_btn_guardian'),  'friend.btn.add_guardian',  'public', '친구 신청', 'Add Friend', '友達申請', '添加好友', '加好友', 'Agregar amigo', 'Ajouter un ami', 'Freund hinzufügen', 'Adicionar amigo', 'Kết bạn', 'เพิ่มเพื่อน', 'Tambah Teman', 'إضافة صديق', true, NOW(), NOW()),
(md5('i18n_fr_btn_provider'),  'friend.btn.add_provider',  'public', '단골 맺기', 'Become Regular', '常連になる', '成为常客', '成為常客', 'Hacerse habitual', 'Devenir habitué', 'Stammkunde werden', 'Tornar-se frequente', 'Trở thành khách quen', 'เป็นลูกค้าประจำ', 'Jadi Pelanggan', 'أصبح عميلاً منتظماً', true, NOW(), NOW()),
(md5('i18n_fr_btn_pending'),   'friend.btn.pending',       'public', '신청 중', 'Pending', '申請中', '申请中', '申請中', 'Pendiente', 'En attente', 'Ausstehend', 'Pendente', 'Đang chờ', 'รอดำเนินการ', 'Menunggu', 'قيد الانتظار', true, NOW(), NOW()),
(md5('i18n_fr_btn_accepted'),  'friend.btn.accepted',      'public', '친구', 'Friends', '友達', '好友', '好友', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),
(md5('i18n_fr_btn_unfriend'),  'friend.btn.unfriend',      'public', '친구 삭제', 'Remove Friend', '友達解除', '删除好友', '刪除好友', 'Eliminar amigo', 'Supprimer l''ami', 'Freund entfernen', 'Remover amigo', 'Hủy kết bạn', 'ลบเพื่อน', 'Hapus Teman', 'إزالة صديق', true, NOW(), NOW()),
(md5('i18n_fr_unfriend_cfm'),  'friend.unfriend.confirm',  'public', '정말 친구를 삭제하시겠습니까?', 'Remove this friend?', 'この友達を解除しますか？', '确定删除好友？', '確定刪除好友？', '¿Eliminar este amigo?', 'Supprimer cet ami ?', 'Diesen Freund entfernen?', 'Remover este amigo?', 'Hủy kết bạn này?', 'ลบเพื่อนนี้?', 'Hapus teman ini?', 'إزالة هذا الصديق؟', true, NOW(), NOW()),
(md5('i18n_fr_section_title'), 'friend.section.title',     'public', '친구', 'Friends', '友達', '好友', '好友', 'Amigos', 'Amis', 'Freunde', 'Amigos', 'Bạn bè', 'เพื่อน', 'Teman', 'أصدقاء', true, NOW(), NOW()),

-- ── Notifications ──────────────────────────────────────────────────────────────
(md5('i18n_notif_title'),      'notification.title',           'common', '알림', 'Notifications', '通知', '通知', '通知', 'Notificaciones', 'Notifications', 'Benachrichtigungen', 'Notificações', 'Thông báo', 'การแจ้งเตือน', 'Notifikasi', 'الإشعارات', true, NOW(), NOW()),
(md5('i18n_notif_fr_req'),     'notification.friend_request',  'common', '님이 친구 요청을 보냈습니다', 'sent you a friend request', 'さんから友達リクエストが届きました', '向您发送了好友请求', '向您發送了好友請求', 'te envió una solicitud de amistad', 'vous a envoyé une demande d''ami', 'hat Ihnen eine Freundschaftsanfrage gesendet', 'enviou um pedido de amizade', 'đã gửi lời mời kết bạn', 'ส่งคำขอเป็นเพื่อนถึงคุณ', 'mengirim permintaan pertemanan', 'أرسل لك طلب صداقة', true, NOW(), NOW()),
(md5('i18n_notif_fr_acc'),     'notification.friend_accepted', 'common', '님이 친구 요청을 수락했습니다', 'accepted your friend request', 'さんが友達リクエストを承認しました', '接受了您的好友请求', '接受了您的好友請求', 'aceptó tu solicitud de amistad', 'a accepté votre demande d''ami', 'hat Ihre Freundschaftsanfrage angenommen', 'aceitou seu pedido de amizade', 'đã chấp nhận lời mời kết bạn', 'ยอมรับคำขอเป็นเพื่อนของคุณ', 'menerima permintaan pertemanan Anda', 'قبل طلب صداقتك', true, NOW(), NOW()),
(md5('i18n_notif_empty'),      'notification.empty',           'common', '알림이 없습니다', 'No notifications', '通知はありません', '没有通知', '沒有通知', 'Sin notificaciones', 'Aucune notification', 'Keine Benachrichtigungen', 'Sem notificações', 'Không có thông báo', 'ไม่มีการแจ้งเตือน', 'Tidak ada notifikasi', 'لا توجد إشعارات', true, NOW(), NOW()),
(md5('i18n_notif_mark_read'),  'notification.mark_read',       'common', '읽음 처리', 'Mark as read', '既読にする', '标为已读', '標為已讀', 'Marcar como leído', 'Marquer comme lu', 'Als gelesen markieren', 'Marcar como lido', 'Đánh dấu đã đọc', 'ทำเครื่องหมายว่าอ่านแล้ว', 'Tandai telah dibaca', 'تعليم كمقروء', true, NOW(), NOW()),

-- ── Feed tab label ─────────────────────────────────────────────────────────────
(md5('i18n_feed_my_feed'),     'public.feed.my_feed',          'public', '내 피드', 'My Feed', 'マイフィード', '我的动态', '我的動態', 'Mi feed', 'Mon fil', 'Mein Feed', 'Meu feed', 'Bảng tin của tôi', 'ฟีดของฉัน', 'Feed Saya', 'خلاصتي', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
