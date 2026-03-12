-- 088_push_notification_i18n.sql
-- i18n keys for push notifications, notification center, settings

INSERT INTO i18n_translations (id, key, category, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
-- Notification Center UI
(gen_random_uuid(), 'notification.center.title', 'notification',
 '알림', 'Notifications', '通知', '通知', '通知', 'Notificaciones', 'Notifications', 'Benachrichtigungen', 'Notificações', 'Thông báo', 'การแจ้งเตือน', 'Notifikasi', 'الإشعارات'),

(gen_random_uuid(), 'notification.center.empty', 'notification',
 '알림이 없습니다', 'No notifications', '通知はありません', '没有通知', '沒有通知', 'Sin notificaciones', 'Aucune notification', 'Keine Benachrichtigungen', 'Sem notificações', 'Không có thông báo', 'ไม่มีการแจ้งเตือน', 'Tidak ada notifikasi', 'لا توجد إشعارات'),

(gen_random_uuid(), 'notification.center.mark_all_read', 'notification',
 '모두 읽음', 'Mark all read', 'すべて既読', '全部已读', '全部已讀', 'Marcar todo leído', 'Tout marquer comme lu', 'Alle als gelesen markieren', 'Marcar tudo como lido', 'Đánh dấu tất cả đã đọc', 'อ่านทั้งหมด', 'Tandai semua dibaca', 'تحديد الكل كمقروء'),

(gen_random_uuid(), 'notification.center.view_all', 'notification',
 '모두 보기', 'View all', 'すべて表示', '查看全部', '查看全部', 'Ver todo', 'Voir tout', 'Alle anzeigen', 'Ver tudo', 'Xem tất cả', 'ดูทั้งหมด', 'Lihat semua', 'عرض الكل'),

-- Notification type labels
(gen_random_uuid(), 'notification.type.friend_request', 'notification',
 '친구 요청', 'Friend Request', '友達リクエスト', '好友请求', '好友請求', 'Solicitud de amistad', 'Demande d''ami', 'Freundschaftsanfrage', 'Pedido de amizade', 'Yêu cầu kết bạn', 'คำขอเป็นเพื่อน', 'Permintaan teman', 'طلب صداقة'),

(gen_random_uuid(), 'notification.type.friend_accepted', 'notification',
 '친구 수락', 'Friend Accepted', '友達承認', '好友已接受', '好友已接受', 'Amistad aceptada', 'Ami accepté', 'Freundschaft akzeptiert', 'Amizade aceita', 'Đã chấp nhận kết bạn', 'ยอมรับเป็นเพื่อน', 'Teman diterima', 'تم قبول الصداقة'),

(gen_random_uuid(), 'notification.type.post_like', 'notification',
 '게시글 좋아요', 'Post Like', 'いいね', '帖子点赞', '貼文按讚', 'Me gusta', 'J''aime', 'Gefällt mir', 'Curtida', 'Lượt thích', 'ถูกใจ', 'Suka pos', 'إعجاب'),

(gen_random_uuid(), 'notification.type.post_comment', 'notification',
 '게시글 댓글', 'Post Comment', 'コメント', '帖子评论', '貼文留言', 'Comentario', 'Commentaire', 'Kommentar', 'Comentário', 'Bình luận', 'ความคิดเห็น', 'Komentar pos', 'تعليق'),

(gen_random_uuid(), 'notification.type.friend_new_post', 'notification',
 '친구 새 게시글', 'Friend New Post', '友達の新投稿', '好友新帖子', '好友新貼文', 'Nueva publicación de amigo', 'Nouvelle publication d''ami', 'Neuer Beitrag eines Freundes', 'Nova publicação de amigo', 'Bài viết mới từ bạn bè', 'โพสต์ใหม่จากเพื่อน', 'Pos baru teman', 'منشور جديد من صديق'),

(gen_random_uuid(), 'notification.type.pet_health_remind', 'notification',
 '건강 리마인더', 'Health Reminder', '健康リマインダー', '健康提醒', '健康提醒', 'Recordatorio de salud', 'Rappel santé', 'Gesundheitserinnerung', 'Lembrete de saúde', 'Nhắc nhở sức khỏe', 'แจ้งเตือนสุขภาพ', 'Pengingat kesehatan', 'تذكير صحي'),

(gen_random_uuid(), 'notification.type.appointment_remind', 'notification',
 '예약 리마인더', 'Appointment Reminder', '予約リマインダー', '预约提醒', '預約提醒', 'Recordatorio de cita', 'Rappel de rendez-vous', 'Terminerinnerung', 'Lembrete de consulta', 'Nhắc nhở lịch hẹn', 'แจ้งเตือนนัดหมาย', 'Pengingat janji', 'تذكير بالموعد'),

(gen_random_uuid(), 'notification.type.service_notice', 'notification',
 '서비스 공지', 'Service Notice', 'お知らせ', '服务通知', '服務通知', 'Aviso de servicio', 'Avis de service', 'Servicemitteilung', 'Aviso de serviço', 'Thông báo dịch vụ', 'ประกาศบริการ', 'Pemberitahuan layanan', 'إشعار الخدمة'),

(gen_random_uuid(), 'notification.type.marketing', 'notification',
 '마케팅', 'Marketing', 'マーケティング', '营销', '行銷', 'Marketing', 'Marketing', 'Marketing', 'Marketing', 'Tiếp thị', 'การตลาด', 'Pemasaran', 'تسويق'),

-- Notification messages
(gen_random_uuid(), 'notification.msg.sent_friend_request', 'notification',
 '님이 친구 요청을 보냈습니다', 'sent you a friend request', 'さんが友達リクエストを送りました', '向您发送了好友请求', '向您發送了好友請求', 'te envió una solicitud de amistad', 'vous a envoyé une demande d''ami', 'hat Ihnen eine Freundschaftsanfrage gesendet', 'enviou um pedido de amizade', 'đã gửi lời mời kết bạn', 'ส่งคำขอเป็นเพื่อนถึงคุณ', 'mengirim permintaan pertemanan', 'أرسل لك طلب صداقة'),

(gen_random_uuid(), 'notification.msg.accepted_friend_request', 'notification',
 '님이 친구 요청을 수락했습니다', 'accepted your friend request', 'さんが友達リクエストを承認しました', '接受了您的好友请求', '接受了您的好友請求', 'aceptó tu solicitud de amistad', 'a accepté votre demande d''ami', 'hat Ihre Freundschaftsanfrage akzeptiert', 'aceitou seu pedido de amizade', 'đã chấp nhận lời mời kết bạn', 'ยอมรับคำขอเป็นเพื่อนของคุณ', 'menerima permintaan pertemanan Anda', 'قبل طلب صداقتك'),

(gen_random_uuid(), 'notification.msg.liked_your_post', 'notification',
 '님이 게시글에 좋아요를 눌렀습니다', 'liked your post', 'さんがあなたの投稿にいいねしました', '赞了您的帖子', '對您的貼文按讚', 'le dio me gusta a tu publicación', 'a aimé votre publication', 'hat Ihren Beitrag geliked', 'curtiu sua publicação', 'đã thích bài viết của bạn', 'ถูกใจโพสต์ของคุณ', 'menyukai pos Anda', 'أعجب بمنشورك'),

(gen_random_uuid(), 'notification.msg.commented_on_your_post', 'notification',
 '님이 게시글에 댓글을 남겼습니다', 'commented on your post', 'さんがあなたの投稿にコメントしました', '评论了您的帖子', '在您的貼文留言', 'comentó en tu publicación', 'a commenté votre publication', 'hat Ihren Beitrag kommentiert', 'comentou sua publicação', 'đã bình luận bài viết của bạn', 'แสดงความคิดเห็นในโพสต์ของคุณ', 'mengomentari pos Anda', 'علّق على منشورك'),

(gen_random_uuid(), 'notification.msg.shared_new_post', 'notification',
 '님이 새 게시글을 올렸습니다', 'shared a new post', 'さんが新しい投稿をしました', '发布了新帖子', '發布了新貼文', 'compartió una nueva publicación', 'a partagé une nouvelle publication', 'hat einen neuen Beitrag geteilt', 'compartilhou uma nova publicação', 'đã đăng bài viết mới', 'แชร์โพสต์ใหม่', 'membagikan pos baru', 'شارك منشوراً جديداً'),

-- Notification settings labels
(gen_random_uuid(), 'notification.settings.title', 'notification',
 '알림 설정', 'Notification Settings', '通知設定', '通知设置', '通知設定', 'Configuración de notificaciones', 'Paramètres de notifications', 'Benachrichtigungseinstellungen', 'Configurações de notificação', 'Cài đặt thông báo', 'ตั้งค่าการแจ้งเตือน', 'Pengaturan notifikasi', 'إعدادات الإشعارات'),

(gen_random_uuid(), 'notification.settings.friend_request', 'notification',
 '친구 요청 알림', 'Friend request notifications', '友達リクエスト通知', '好友请求通知', '好友請求通知', 'Notificaciones de solicitud de amistad', 'Notifications de demandes d''amis', 'Freundschaftsanfragen', 'Notificações de pedidos de amizade', 'Thông báo yêu cầu kết bạn', 'แจ้งเตือนคำขอเป็นเพื่อน', 'Notifikasi permintaan teman', 'إشعارات طلبات الصداقة'),

(gen_random_uuid(), 'notification.settings.friend_accepted', 'notification',
 '친구 수락 알림', 'Friend accepted notifications', '友達承認通知', '好友接受通知', '好友接受通知', 'Notificaciones de amistad aceptada', 'Notifications d''amis acceptés', 'Freundschaftsakzeptiert', 'Notificações de amizade aceita', 'Thông báo chấp nhận kết bạn', 'แจ้งเตือนยอมรับเป็นเพื่อน', 'Notifikasi teman diterima', 'إشعارات قبول الصداقة'),

(gen_random_uuid(), 'notification.settings.post_like', 'notification',
 '좋아요 알림', 'Like notifications', 'いいね通知', '点赞通知', '按讚通知', 'Notificaciones de me gusta', 'Notifications de j''aime', 'Like-Benachrichtigungen', 'Notificações de curtidas', 'Thông báo lượt thích', 'แจ้งเตือนถูกใจ', 'Notifikasi suka', 'إشعارات الإعجاب'),

(gen_random_uuid(), 'notification.settings.post_comment', 'notification',
 '댓글 알림', 'Comment notifications', 'コメント通知', '评论通知', '留言通知', 'Notificaciones de comentarios', 'Notifications de commentaires', 'Kommentar-Benachrichtigungen', 'Notificações de comentários', 'Thông báo bình luận', 'แจ้งเตือนความคิดเห็น', 'Notifikasi komentar', 'إشعارات التعليقات'),

(gen_random_uuid(), 'notification.settings.friend_new_post', 'notification',
 '친구 새 게시글 알림', 'Friend new post notifications', '友達の新投稿通知', '好友新帖子通知', '好友新貼文通知', 'Notificaciones de nuevas publicaciones de amigos', 'Notifications de nouvelles publications d''amis', 'Neue Beiträge von Freunden', 'Notificações de novas publicações de amigos', 'Thông báo bài mới từ bạn bè', 'แจ้งเตือนโพสต์ใหม่จากเพื่อน', 'Notifikasi pos baru teman', 'إشعارات منشورات الأصدقاء الجديدة'),

(gen_random_uuid(), 'notification.settings.pet_health_remind', 'notification',
 '건강 리마인더 알림', 'Health reminder notifications', '健康リマインダー通知', '健康提醒通知', '健康提醒通知', 'Notificaciones de recordatorio de salud', 'Notifications de rappel santé', 'Gesundheitserinnerungen', 'Notificações de lembrete de saúde', 'Thông báo nhắc nhở sức khỏe', 'แจ้งเตือนสุขภาพ', 'Notifikasi pengingat kesehatan', 'إشعارات التذكير الصحي'),

(gen_random_uuid(), 'notification.settings.appointment_remind', 'notification',
 '예약 리마인더 알림', 'Appointment reminder notifications', '予約リマインダー通知', '预约提醒通知', '預約提醒通知', 'Notificaciones de recordatorio de citas', 'Notifications de rappel de rendez-vous', 'Terminerinnerungen', 'Notificações de lembrete de consulta', 'Thông báo nhắc nhở lịch hẹn', 'แจ้งเตือนนัดหมาย', 'Notifikasi pengingat janji', 'إشعارات تذكير المواعيد'),

(gen_random_uuid(), 'notification.settings.service_notice', 'notification',
 '서비스 공지 알림', 'Service notice notifications', 'お知らせ通知', '服务通知', '服務通知', 'Notificaciones de avisos de servicio', 'Notifications d''avis de service', 'Servicemitteilungen', 'Notificações de avisos de serviço', 'Thông báo dịch vụ', 'แจ้งเตือนประกาศบริการ', 'Notifikasi pemberitahuan layanan', 'إشعارات إشعارات الخدمة'),

(gen_random_uuid(), 'notification.settings.marketing', 'notification',
 '마케팅 알림', 'Marketing notifications', 'マーケティング通知', '营销通知', '行銷通知', 'Notificaciones de marketing', 'Notifications marketing', 'Marketing-Benachrichtigungen', 'Notificações de marketing', 'Thông báo tiếp thị', 'แจ้งเตือนการตลาด', 'Notifikasi pemasaran', 'إشعارات التسويق'),

-- Push permission UI
(gen_random_uuid(), 'notification.push.enable_title', 'notification',
 '푸시 알림을 활성화하시겠습니까?', 'Enable push notifications?', 'プッシュ通知を有効にしますか？', '启用推送通知？', '啟用推播通知？', '¿Habilitar notificaciones push?', 'Activer les notifications push ?', 'Push-Benachrichtigungen aktivieren?', 'Ativar notificações push?', 'Bật thông báo đẩy?', 'เปิดใช้งานการแจ้งเตือนแบบพุช?', 'Aktifkan notifikasi push?', 'تفعيل الإشعارات الفورية؟'),

(gen_random_uuid(), 'notification.push.enable_button', 'notification',
 '알림 허용', 'Enable Notifications', '通知を許可', '允许通知', '允許通知', 'Permitir notificaciones', 'Autoriser les notifications', 'Benachrichtigungen erlauben', 'Permitir notificações', 'Cho phép thông báo', 'อนุญาตการแจ้งเตือน', 'Izinkan notifikasi', 'السماح بالإشعارات'),

(gen_random_uuid(), 'notification.push.denied_message', 'notification',
 '알림이 차단되었습니다. 브라우저 설정에서 허용해주세요.', 'Notifications are blocked. Please enable them in your browser settings.', '通知がブロックされています。ブラウザの設定で許可してください。', '通知已被屏蔽。请在浏览器设置中启用。', '通知已被封鎖。請在瀏覽器設定中啟用。', 'Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.', 'Les notifications sont bloquées. Activez-les dans les paramètres du navigateur.', 'Benachrichtigungen sind blockiert. Aktivieren Sie diese in den Browsereinstellungen.', 'As notificações estão bloqueadas. Ative-as nas configurações do navegador.', 'Thông báo đã bị chặn. Vui lòng bật trong cài đặt trình duyệt.', 'การแจ้งเตือนถูกบล็อก กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์', 'Notifikasi diblokir. Aktifkan di pengaturan browser Anda.', 'الإشعارات محظورة. يرجى تفعيلها من إعدادات المتصفح.'),

-- Time labels
(gen_random_uuid(), 'notification.time.just_now', 'notification',
 '방금', 'Just now', 'たった今', '刚刚', '剛剛', 'Ahora mismo', 'À l''instant', 'Gerade eben', 'Agora mesmo', 'Vừa xong', 'เมื่อสักครู่', 'Baru saja', 'الآن'),

(gen_random_uuid(), 'notification.time.minutes_ago', 'notification',
 '분 전', 'min ago', '分前', '分钟前', '分鐘前', 'min atrás', 'min', 'Min.', 'min atrás', 'phút trước', 'นาทีที่แล้ว', 'menit lalu', 'دقيقة مضت'),

(gen_random_uuid(), 'notification.time.hours_ago', 'notification',
 '시간 전', 'hr ago', '時間前', '小时前', '小時前', 'h atrás', 'h', 'Std.', 'h atrás', 'giờ trước', 'ชั่วโมงที่แล้ว', 'jam lalu', 'ساعة مضت'),

(gen_random_uuid(), 'notification.time.days_ago', 'notification',
 '일 전', 'd ago', '日前', '天前', '天前', 'd atrás', 'j', 'T.', 'd atrás', 'ngày trước', 'วันที่แล้ว', 'hari lalu', 'يوم مضى')

ON CONFLICT (key) DO NOTHING;
