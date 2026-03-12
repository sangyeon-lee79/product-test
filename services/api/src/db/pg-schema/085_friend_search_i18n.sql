-- 085: i18n keys for friend search in FriendsModal

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Search UI ──────────────────────────────────────────────────────────────────
(md5('i18n_fs_btn'),         'friends.search.button',         'guardian', '검색', 'Search', '検索', '搜索', '搜尋', 'Buscar', 'Rechercher', 'Suchen', 'Pesquisar', 'Tìm kiếm', 'ค้นหา', 'Cari', 'بحث', true, NOW(), NOW()),
(md5('i18n_fs_placeholder'), 'friends.search.placeholder',    'guardian', '이메일로 검색', 'Search by email', 'メールで検索', '通过邮箱搜索', '透過電郵搜尋', 'Buscar por correo', 'Rechercher par e-mail', 'Suche per E-Mail', 'Pesquisar por e-mail', 'Tìm theo email', 'ค้นหาด้วยอีเมล', 'Cari berdasarkan email', 'البحث بالبريد الإلكتروني', true, NOW(), NOW()),
(md5('i18n_fs_not_found'),   'friends.search.not_found',      'guardian', '해당 이메일로 가입된 사용자가 없습니다', 'No user found with this email', 'このメールアドレスのユーザーが見つかりません', '未找到该邮箱的用户', '未找到該電郵的用戶', 'No se encontró usuario con este correo', 'Aucun utilisateur trouvé avec cet e-mail', 'Kein Benutzer mit dieser E-Mail gefunden', 'Nenhum usuário encontrado com este e-mail', 'Không tìm thấy người dùng với email này', 'ไม่พบผู้ใช้ด้วยอีเมลนี้', 'Tidak ditemukan pengguna dengan email ini', 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني', true, NOW(), NOW()),
(md5('i18n_fs_self'),        'friends.search.self_search',    'guardian', '본인은 친구 추가할 수 없습니다', 'You cannot add yourself', '自分自身を追加することはできません', '无法添加自己', '無法新增自己', 'No puedes agregarte a ti mismo', 'Vous ne pouvez pas vous ajouter', 'Sie können sich nicht selbst hinzufügen', 'Você não pode adicionar a si mesmo', 'Bạn không thể thêm chính mình', 'คุณไม่สามารถเพิ่มตัวเองได้', 'Anda tidak bisa menambahkan diri sendiri', 'لا يمكنك إضافة نفسك', true, NOW(), NOW()),

-- ── Card actions ────────────────────────────────────────────────────────────────
(md5('i18n_fs_send'),        'friends.search.send_request',   'guardian', '친구 신청하기', 'Send Friend Request', '友達リクエストを送る', '发送好友请求', '發送好友請求', 'Enviar solicitud', 'Envoyer une demande', 'Freundschaftsanfrage senden', 'Enviar pedido de amizade', 'Gửi lời mời kết bạn', 'ส่งคำขอเป็นเพื่อน', 'Kirim permintaan pertemanan', 'إرسال طلب صداقة', true, NOW(), NOW()),
(md5('i18n_fs_already'),     'friends.search.already_friend', 'guardian', '이미 친구입니다', 'Already friends', 'すでに友達です', '已经是好友', '已經是好友', 'Ya son amigos', 'Déjà amis', 'Bereits befreundet', 'Já são amigos', 'Đã là bạn bè', 'เป็นเพื่อนกันแล้ว', 'Sudah berteman', 'أصدقاء بالفعل', true, NOW(), NOW()),
(md5('i18n_fs_pending'),     'friends.search.pending',        'guardian', '신청 대기 중', 'Request pending', 'リクエスト承認待ち', '请求待处理', '請求待處理', 'Solicitud pendiente', 'Demande en attente', 'Anfrage ausstehend', 'Pedido pendente', 'Yêu cầu đang chờ', 'คำขอรอดำเนินการ', 'Permintaan tertunda', 'الطلب معلق', true, NOW(), NOW()),
(md5('i18n_fs_sent_ok'),     'friends.search.sent_success',   'guardian', '신청 완료', 'Request sent', 'リクエスト送信完了', '请求已发送', '請求已發送', 'Solicitud enviada', 'Demande envoyée', 'Anfrage gesendet', 'Pedido enviado', 'Đã gửi yêu cầu', 'ส่งคำขอแล้ว', 'Permintaan terkirim', 'تم إرسال الطلب', true, NOW(), NOW()),

-- ── Empty / error ──────────────────────────────────────────────────────────────
(md5('i18n_fs_no_pets'),     'friends.search.no_pets',        'guardian', '등록된 반려동물 없음', 'No pets registered', '登録されたペットなし', '暂无宠物', '尚無寵物', 'Sin mascotas registradas', 'Aucun animal enregistré', 'Keine Haustiere registriert', 'Nenhum pet registrado', 'Chưa đăng ký thú cưng', 'ยังไม่มีสัตว์เลี้ยง', 'Belum ada hewan peliharaan', 'لا حيوانات أليفة مسجلة', true, NOW(), NOW()),
(md5('i18n_fs_error'),       'friends.search.error',          'guardian', '검색에 실패했습니다', 'Search failed', '検索に失敗しました', '搜索失败', '搜尋失敗', 'Error en la búsqueda', 'Échec de la recherche', 'Suche fehlgeschlagen', 'Falha na pesquisa', 'Tìm kiếm thất bại', 'การค้นหาล้มเหลว', 'Pencarian gagal', 'فشل البحث', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();
