-- 078: i18n keys for PublicHome — supplier feed tab + right panel widgets

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

(md5('i18n_public_feed_supplier'), 'public.feed.supplier', 'public', '업종 피드', 'Business Feed', 'ビジネスフィード', '商家动态', '商家動態', 'Feed de negocios', 'Flux professionnels', 'Geschäfts-Feed', 'Feed de negócios', 'Nguồn cấp dữ liệu doanh nghiệp', 'ฟีดธุรกิจ', 'Feed bisnis', 'موجز الأعمال', true, NOW(), NOW()),

(md5('i18n_public_widget_guardian_role'), 'public.widget.guardian_role', 'public', 'Petfolio 가디언', 'Petfolio Guardian', 'Petfolio ガーディアン', 'Petfolio 守护者', 'Petfolio 守護者', 'Petfolio Guardián', 'Petfolio Gardien', 'Petfolio Hüter', 'Petfolio Guardião', 'Petfolio Người giám hộ', 'Petfolio ผู้ดูแล', 'Petfolio Penjaga', 'Petfolio الوصي', true, NOW(), NOW()),

(md5('i18n_public_widget_provider_role'), 'public.widget.provider_role', 'public', 'Petfolio 공급자', 'Petfolio Provider', 'Petfolio プロバイダー', 'Petfolio 供应商', 'Petfolio 供應商', 'Petfolio Proveedor', 'Petfolio Fournisseur', 'Petfolio Anbieter', 'Petfolio Fornecedor', 'Petfolio Nhà cung cấp', 'Petfolio ผู้ให้บริการ', 'Petfolio Penyedia', 'Petfolio مزوّد', true, NOW(), NOW()),

(md5('i18n_public_widget_my_pet'), 'public.widget.my_pet', 'public', '내 반려동물', 'My Pet', '私のペット', '我的宠物', '我的寵物', 'Mi mascota', 'Mon animal', 'Mein Haustier', 'Meu pet', 'Thú cưng của tôi', 'สัตว์เลี้ยงของฉัน', 'Hewan peliharaan saya', 'حيواني الأليف', true, NOW(), NOW()),

(md5('i18n_public_widget_next_booking'), 'public.widget.next_booking', 'public', '다음 예약', 'Next Booking', '次の予約', '下一个预约', '下一個預約', 'Próxima reserva', 'Prochaine réservation', 'Nächste Buchung', 'Próxima reserva', 'Lịch hẹn tiếp theo', 'การจองถัดไป', 'Pemesanan berikutnya', 'الحجز التالي', true, NOW(), NOW()),

(md5('i18n_public_widget_no_booking'), 'public.widget.no_booking', 'public', '예정된 일정 없음', 'No upcoming schedule', '予定なし', '暂无预约', '暫無預約', 'Sin citas pendientes', 'Aucun rendez-vous prévu', 'Keine Termine geplant', 'Nenhum agendamento', 'Không có lịch hẹn', 'ไม่มีนัดหมาย', 'Tidak ada jadwal', 'لا مواعيد قادمة', true, NOW(), NOW()),

(md5('i18n_public_widget_no_pet'), 'public.widget.no_pet', 'public', '등록된 반려동물이 없습니다', 'No pets registered', 'ペットが登録されていません', '暂无宠物', '尚未註冊寵物', 'No hay mascotas registradas', 'Aucun animal enregistré', 'Keine Haustiere registriert', 'Nenhum pet cadastrado', 'Chưa có thú cưng nào', 'ยังไม่มีสัตว์เลี้ยง', 'Belum ada hewan peliharaan', 'لا حيوانات أليفة مسجلة', true, NOW(), NOW()),

(md5('i18n_public_widget_login_prompt'), 'public.widget.login_prompt', 'public', '로그인하고 반려동물을 등록하세요', 'Log in to register your pet', 'ログインしてペットを登録しましょう', '登录后注册您的宠物', '登入以註冊您的寵物', 'Inicia sesión para registrar tu mascota', 'Connectez-vous pour enregistrer votre animal', 'Melden Sie sich an, um Ihr Haustier zu registrieren', 'Faça login para cadastrar seu pet', 'Đăng nhập để đăng ký thú cưng', 'เข้าสู่ระบบเพื่อลงทะเบียนสัตว์เลี้ยง', 'Masuk untuk mendaftarkan hewan peliharaan', 'سجّل الدخول لتسجيل حيوانك الأليف', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
