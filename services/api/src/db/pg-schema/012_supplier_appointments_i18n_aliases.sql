-- =============================================================================
-- 012_supplier_appointments_i18n_aliases.sql
-- =============================================================================
-- Adds alias keys used by the supplier Appointments UI.
-- Keeps existing schema/key structure intact and fills gaps idempotently.
-- =============================================================================

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
  (gen_random_uuid()::text, 'supplier.appointments.title', 'supplier', '예약 관리', 'Appointment Management', '予約管理', '予約管理', '預約管理', 'Gestión de citas', 'Gestion des rendez-vous', 'Terminverwaltung', 'Gerenciamento de agendamentos', 'Quản lý lịch hẹn', 'จัดการนัดหมาย', 'Manajemen Janji', 'إدارة المواعيد'),
  (gen_random_uuid()::text, 'supplier.appointments.calendar', 'supplier', '달력', 'Calendar', 'カレンダー', '日历', '日曆', 'Calendario', 'Calendrier', 'Kalender', 'Calendário', 'Lịch', 'ปฏิทิน', 'Kalender', 'التقويم'),
  (gen_random_uuid()::text, 'supplier.appointments.list', 'supplier', '목록', 'List', 'リスト', '列表', '列表', 'Lista', 'Liste', 'Liste', 'Lista', 'Danh sách', 'รายการ', 'Daftar', 'القائمة'),
  (gen_random_uuid()::text, 'supplier.appointments.no_result', 'supplier', '예약이 없습니다', 'No appointments', '予約がありません', '没有预约', '沒有預約', 'No hay citas', 'Aucun rendez-vous', 'Keine Termine', 'Sem agendamentos', 'Không có lịch hẹn', 'ไม่มีนัดหมาย', 'Tidak ada janji', 'لا توجد مواعيد'),
  (gen_random_uuid()::text, 'appointment.detail.pet', 'appointment', '반려동물', 'Pet', 'ペット', '宠物', '寵物', 'Mascota', 'Animal', 'Haustier', 'Pet', 'Thú cưng', 'สัตว์เลี้ยง', 'Hewan', 'الحيوان الأليف'),
  (gen_random_uuid()::text, 'appointment.detail.service', 'appointment', '서비스', 'Service', 'サービス', '服务', '服務', 'Servicio', 'Service', 'Service', 'Serviço', 'Dịch vụ', 'บริการ', 'Layanan', 'الخدمة'),
  (gen_random_uuid()::text, 'appointment.detail.date', 'appointment', '날짜', 'Date', '日付', '日期', '日期', 'Fecha', 'Date', 'Datum', 'Data', 'Ngày', 'วันที่', 'Tanggal', 'التاريخ'),
  (gen_random_uuid()::text, 'appointment.detail.duration', 'appointment', '소요시간', 'Duration', '所要時間', '时长', '時長', 'Duración', 'Durée', 'Dauer', 'Duração', 'Thời lượng', 'ระยะเวลา', 'Durasi', 'المدة'),
  (gen_random_uuid()::text, 'appointment.detail.price', 'appointment', '금액', 'Price', '金額', '金额', '金額', 'Precio', 'Prix', 'Preis', 'Preço', 'Giá', 'ราคา', 'Harga', 'السعر'),
  (gen_random_uuid()::text, 'appointment.action.accept', 'appointment', '수락', 'Accept', '承認', '接受', '接受', 'Aceptar', 'Accepter', 'Akzeptieren', 'Aceitar', 'Chấp nhận', 'ยอมรับ', 'Terima', 'قبول'),
  (gen_random_uuid()::text, 'appointment.action.reject_reason', 'appointment', '거절 사유를 입력해주세요', 'Please enter reason for rejection', '拒否理由を入力してください', '请输入拒绝原因', '請輸入拒絕原因', 'Ingrese el motivo del rechazo', 'Veuillez saisir le motif du refus', 'Bitte geben Sie den Ablehnungsgrund ein', 'Informe o motivo da recusa', 'Vui lòng nhập lý do từ chối', 'กรุณากรอกเหตุผลในการปฏิเสธ', 'Masukkan alasan penolakan', 'يرجى إدخال سبب الرفض'),
  (gen_random_uuid()::text, 'supplier.settings.day.su', 'supplier', '일', 'Su', '日', '日', '日', 'Do', 'Di', 'So', 'Dom', 'CN', 'อา', 'Min', 'ح'),
  (gen_random_uuid()::text, 'supplier.settings.day.mo', 'supplier', '월', 'Mo', '月', '一', '一', 'Lu', 'Lu', 'Mo', 'Seg', 'T2', 'จ', 'Sen', 'ن'),
  (gen_random_uuid()::text, 'supplier.settings.day.tu', 'supplier', '화', 'Tu', '火', '二', '二', 'Ma', 'Ma', 'Di', 'Ter', 'T3', 'อ', 'Sel', 'ث'),
  (gen_random_uuid()::text, 'supplier.settings.day.we', 'supplier', '수', 'We', '水', '三', '三', 'Mi', 'Me', 'Mi', 'Qua', 'T4', 'พ', 'Rab', 'ر'),
  (gen_random_uuid()::text, 'supplier.settings.day.th', 'supplier', '목', 'Th', '木', '四', '四', 'Ju', 'Je', 'Do', 'Qui', 'T5', 'พฤ', 'Kam', 'خ'),
  (gen_random_uuid()::text, 'supplier.settings.day.fr', 'supplier', '금', 'Fr', '金', '五', '五', 'Vi', 'Ve', 'Fr', 'Sex', 'T6', 'ศ', 'Jum', 'ج'),
  (gen_random_uuid()::text, 'supplier.settings.day.sa', 'supplier', '토', 'Sa', '土', '六', '六', 'Sa', 'Sa', 'Sa', 'Sáb', 'T7', 'ส', 'Sab', 'س')
ON CONFLICT (key) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('012_supplier_appointments_i18n_aliases')
ON CONFLICT (version) DO NOTHING;
