-- =============================================================================
-- 010: Supplier Settings + Tab i18n keys (13 languages)
-- =============================================================================

-- ── Tab menu ──
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.tab.store', 'supplier', '매장', 'Store', '店舗', '店铺', '店鋪', 'Tienda', 'Boutique', 'Geschäft', 'Loja', 'Cửa hàng', 'ร้านค้า', 'Toko', 'المتجر')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.tab.appointments', 'supplier', '예약', 'Appointments', '予約', '预约', '預約', 'Citas', 'Rendez-vous', 'Termine', 'Agendamentos', 'Lịch hẹn', 'นัดหมาย', 'Janji', 'المواعيد')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.tab.feed', 'supplier', '피드', 'Feed', 'フィード', '动态', '動態', 'Publicaciones', 'Fil', 'Feed', 'Feed', 'Bảng tin', 'ฟีด', 'Feed', 'المنشورات')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.tab.settings', 'supplier', '설정', 'Settings', '設定', '设置', '設定', 'Configuración', 'Paramètres', 'Einstellungen', 'Configurações', 'Cài đặt', 'ตั้งค่า', 'Pengaturan', 'الإعدادات')
ON CONFLICT (key) DO NOTHING;

-- ── Settings page common ──
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.title', 'supplier', '가게 설정', 'Store Settings', '店舗設定', '店铺设置', '店鋪設定', 'Configuración de tienda', 'Paramètres de la boutique', 'Geschäftseinstellungen', 'Configurações da loja', 'Cài đặt cửa hàng', 'ตั้งค่าร้านค้า', 'Pengaturan Toko', 'إعدادات المتجر')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.select_store', 'supplier', '매장 선택', 'Select Store', '店舗を選択', '选择店铺', '選擇店鋪', 'Seleccionar tienda', 'Sélectionner la boutique', 'Geschäft auswählen', 'Selecionar loja', 'Chọn cửa hàng', 'เลือกร้านค้า', 'Pilih Toko', 'اختيار المتجر')
ON CONFLICT (key) DO NOTHING;

-- ── Operating hours ──
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.hours_title', 'supplier', '영업시간', 'Operating Hours', '営業時間', '营业时间', '營業時間', 'Horario de atención', 'Heures d''ouverture', 'Öffnungszeiten', 'Horário de funcionamento', 'Giờ hoạt động', 'เวลาทำการ', 'Jam Operasional', 'ساعات العمل')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.mon', 'supplier', '월', 'Mon', '月', '周一', '週一', 'Lun', 'Lun', 'Mo', 'Seg', 'T2', 'จ.', 'Sen', 'الإثنين')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.tue', 'supplier', '화', 'Tue', '火', '周二', '週二', 'Mar', 'Mar', 'Di', 'Ter', 'T3', 'อ.', 'Sel', 'الثلاثاء')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.wed', 'supplier', '수', 'Wed', '水', '周三', '週三', 'Mié', 'Mer', 'Mi', 'Qua', 'T4', 'พ.', 'Rab', 'الأربعاء')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.thu', 'supplier', '목', 'Thu', '木', '周四', '週四', 'Jue', 'Jeu', 'Do', 'Qui', 'T5', 'พฤ.', 'Kam', 'الخميس')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.fri', 'supplier', '금', 'Fri', '金', '周五', '週五', 'Vie', 'Ven', 'Fr', 'Sex', 'T6', 'ศ.', 'Jum', 'الجمعة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.sat', 'supplier', '토', 'Sat', '土', '周六', '週六', 'Sáb', 'Sam', 'Sa', 'Sáb', 'T7', 'ส.', 'Sab', 'السبت')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.day.sun', 'supplier', '일', 'Sun', '日', '周日', '週日', 'Dom', 'Dim', 'So', 'Dom', 'CN', 'อา.', 'Min', 'الأحد')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.closed', 'supplier', '휴무', 'Closed', '定休日', '休息', '休息', 'Cerrado', 'Fermé', 'Geschlossen', 'Fechado', 'Nghỉ', 'ปิด', 'Tutup', 'مغلق')
ON CONFLICT (key) DO NOTHING;

-- ── Overtime settings (align existing keys) ──
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.settings.overtime_fee_amount', 'supplier', '추가 요금 금액', 'Fee Amount', '追加料金額', '附加费金额', '附加費金額', 'Monto de la tarifa', 'Montant des frais', 'Gebührenbetrag', 'Valor da taxa', 'Số tiền phí', 'จำนวนค่าธรรมเนียม', 'Jumlah Biaya', 'مبلغ الرسوم')
ON CONFLICT (key) DO NOTHING;

-- ── Feed/Post keys ──
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.feed.title', 'supplier', '내 게시물', 'My Posts', '自分の投稿', '我的帖子', '我的貼文', 'Mis publicaciones', 'Mes publications', 'Meine Beiträge', 'Minhas publicações', 'Bài viết của tôi', 'โพสต์ของฉัน', 'Postingan Saya', 'منشوراتي')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.feed.empty', 'supplier', '아직 게시물이 없습니다.', 'No posts yet.', 'まだ投稿がありません。', '还没有帖子。', '還沒有貼文。', 'Aún no hay publicaciones.', 'Pas encore de publications.', 'Noch keine Beiträge.', 'Ainda sem publicações.', 'Chưa có bài viết nào.', 'ยังไม่มีโพสต์', 'Belum ada postingan.', 'لا توجد منشورات بعد.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.post.placeholder', 'supplier', '비즈니스 소식을 공유하세요', 'Share your business news', 'ビジネスニュースを共有', '分享您的商业资讯', '分享您的商業資訊', 'Comparte noticias de tu negocio', 'Partagez vos actualités', 'Teilen Sie Ihre Geschäftsneuigkeiten', 'Compartilhe suas novidades', 'Chia sẻ tin tức kinh doanh', 'แชร์ข่าวธุรกิจของคุณ', 'Bagikan berita bisnis Anda', 'شارك أخبار عملك')
ON CONFLICT (key) DO NOTHING;

-- ── Common keys ──
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'common.saved', 'common', '저장되었습니다', 'Saved successfully', '保存しました', '保存成功', '儲存成功', 'Guardado correctamente', 'Enregistré avec succès', 'Erfolgreich gespeichert', 'Salvo com sucesso', 'Đã lưu thành công', 'บันทึกสำเร็จ', 'Berhasil disimpan', 'تم الحفظ بنجاح')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'common.err.failed', 'common', '처리에 실패했습니다', 'Operation failed', '処理に失敗しました', '操作失败', '操作失敗', 'Operación fallida', 'Échec de l''opération', 'Vorgang fehlgeschlagen', 'Operação falhou', 'Thao tác thất bại', 'การดำเนินการล้มเหลว', 'Operasi gagal', 'فشلت العملية')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'provider.store.no_stores', 'supplier', '등록된 매장이 없습니다', 'No stores', '店舗がありません', '没有店铺', '沒有店鋪', 'No hay tiendas', 'Aucune boutique', 'Keine Geschäfte', 'Sem lojas', 'Không có cửa hàng', 'ไม่มีร้านค้า', 'Tidak ada toko', 'لا توجد متاجر')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'common.yes', 'common', '예', 'Yes', 'はい', '是', '是', 'Sí', 'Oui', 'Ja', 'Sim', 'Có', 'ใช่', 'Ya', 'نعم')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'common.no', 'common', '아니오', 'No', 'いいえ', '否', '否', 'No', 'Non', 'Nein', 'Não', 'Không', 'ไม่', 'Tidak', 'لا')
ON CONFLICT (key) DO NOTHING;

-- ── Appointment calendar view keys ──
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.appointments.view.calendar', 'supplier', '달력', 'Calendar', 'カレンダー', '日历', '日曆', 'Calendario', 'Calendrier', 'Kalender', 'Calendário', 'Lịch', 'ปฏิทิน', 'Kalender', 'التقويم')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.appointments.view.list', 'supplier', '목록', 'List', 'リスト', '列表', '列表', 'Lista', 'Liste', 'Liste', 'Lista', 'Danh sách', 'รายการ', 'Daftar', 'القائمة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.appointments.date_none', 'supplier', '해당 날짜에 예약이 없습니다', 'No appointments on this date', 'この日の予約はありません', '该日期没有预约', '該日期沒有預約', 'No hay citas en esta fecha', 'Pas de rendez-vous à cette date', 'Keine Termine an diesem Datum', 'Sem agendamentos nesta data', 'Không có lịch hẹn trong ngày này', 'ไม่มีนัดหมายในวันนี้', 'Tidak ada janji pada tanggal ini', 'لا توجد مواعيد في هذا التاريخ')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'supplier.appointments.select_date', 'supplier', '날짜를 선택하세요', 'Select a date', '日付を選択してください', '请选择日期', '請選擇日期', 'Seleccione una fecha', 'Sélectionnez une date', 'Wählen Sie ein Datum', 'Selecione uma data', 'Chọn một ngày', 'เลือกวันที่', 'Pilih tanggal', 'اختر تاريخًا')
ON CONFLICT (key) DO NOTHING;
