-- Feed Registration Request i18n keys (20 keys × 13 languages)
INSERT OR IGNORE INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
-- Guardian keys
('i18n_frq_001', 'guardian.feed.request_btn', 'guardian', 1,
 '사료 등록 요청', 'Request Feed Registration', 'フード登録リクエスト', '请求饲料登记', '請求飼料登記', 'Solicitar registro de alimento', 'Demander l''enregistrement', 'Futterregistrierung anfordern', 'Solicitar registro de ração', 'Yêu cầu đăng ký thức ăn', 'ขอลงทะเบียนอาหาร', 'Minta pendaftaran pakan', 'طلب تسجيل العلف',
 datetime('now'), datetime('now')),

('i18n_frq_002', 'guardian.feed.request_desc', 'guardian', 1,
 '원하는 사료가 목록에 없나요? 등록을 요청해주세요.', 'Can''t find your feed? Request registration.', 'フードが見つかりませんか？登録をリクエストしてください。', '找不到您的饲料？请求登记。', '找不到您的飼料？請求登記。', '¿No encuentra su alimento? Solicite el registro.', 'Vous ne trouvez pas votre aliment ? Demandez l''enregistrement.', 'Futter nicht gefunden? Registrierung anfordern.', 'Não encontra sua ração? Solicite o registro.', 'Không tìm thấy thức ăn? Yêu cầu đăng ký.', 'ไม่พบอาหาร? ขอลงทะเบียน', 'Tidak menemukan pakan? Minta pendaftaran.', 'لا تجد العلف؟ اطلب التسجيل.',
 datetime('now'), datetime('now')),

('i18n_frq_003', 'guardian.feed.request_name', 'guardian', 1,
 '사료 이름', 'Feed Name', 'フード名', '饲料名称', '飼料名稱', 'Nombre del alimento', 'Nom de l''aliment', 'Futtername', 'Nome da ração', 'Tên thức ăn', 'ชื่ออาหาร', 'Nama pakan', 'اسم العلف',
 datetime('now'), datetime('now')),

('i18n_frq_004', 'guardian.feed.request_manufacturer', 'guardian', 1,
 '제조사', 'Manufacturer', 'メーカー', '制造商', '製造商', 'Fabricante', 'Fabricant', 'Hersteller', 'Fabricante', 'Nhà sản xuất', 'ผู้ผลิต', 'Produsen', 'الشركة المصنعة',
 datetime('now'), datetime('now')),

('i18n_frq_005', 'guardian.feed.request_brand', 'guardian', 1,
 '브랜드', 'Brand', 'ブランド', '品牌', '品牌', 'Marca', 'Marque', 'Marke', 'Marca', 'Thương hiệu', 'แบรนด์', 'Merek', 'العلامة التجارية',
 datetime('now'), datetime('now')),

('i18n_frq_006', 'guardian.feed.request_type', 'guardian', 1,
 '사료 종류', 'Feed Type', 'フード種類', '饲料类型', '飼料類型', 'Tipo de alimento', 'Type d''aliment', 'Futtertyp', 'Tipo de ração', 'Loại thức ăn', 'ประเภทอาหาร', 'Jenis pakan', 'نوع العلف',
 datetime('now'), datetime('now')),

('i18n_frq_007', 'guardian.feed.request_nutrition', 'guardian', 1,
 '영양 정보 (선택)', 'Nutrition Info (Optional)', '栄養情報（任意）', '营养信息（可选）', '營養資訊（選填）', 'Información nutricional (opcional)', 'Infos nutritionnelles (optionnel)', 'Nährwertinfos (optional)', 'Informações nutricionais (opcional)', 'Thông tin dinh dưỡng (tùy chọn)', 'ข้อมูลโภชนาการ (ไม่บังคับ)', 'Info nutrisi (opsional)', 'معلومات غذائية (اختياري)',
 datetime('now'), datetime('now')),

('i18n_frq_008', 'guardian.feed.request_url', 'guardian', 1,
 '참고 URL', 'Reference URL', '参考URL', '参考链接', '參考連結', 'URL de referencia', 'URL de référence', 'Referenz-URL', 'URL de referência', 'URL tham khảo', 'URL อ้างอิง', 'URL referensi', 'رابط مرجعي',
 datetime('now'), datetime('now')),

('i18n_frq_009', 'guardian.feed.request_memo', 'guardian', 1,
 '메모', 'Memo', 'メモ', '备注', '備註', 'Nota', 'Note', 'Notiz', 'Nota', 'Ghi chú', 'บันทึก', 'Catatan', 'ملاحظة',
 datetime('now'), datetime('now')),

('i18n_frq_010', 'guardian.feed.request_submitted', 'guardian', 1,
 '등록 요청이 제출되었습니다.', 'Registration request submitted.', '登録リクエストが送信されました。', '登记请求已提交。', '登記請求已提交。', 'Solicitud de registro enviada.', 'Demande d''enregistrement envoyée.', 'Registrierungsanfrage gesendet.', 'Solicitação de registro enviada.', 'Yêu cầu đăng ký đã được gửi.', 'ส่งคำขอลงทะเบียนแล้ว', 'Permintaan pendaftaran telah dikirim.', 'تم إرسال طلب التسجيل.',
 datetime('now'), datetime('now')),

('i18n_frq_011', 'guardian.feed.request_status_pending', 'guardian', 1,
 '대기중', 'Pending', '保留中', '待处理', '待處理', 'Pendiente', 'En attente', 'Ausstehend', 'Pendente', 'Đang chờ', 'รอดำเนินการ', 'Menunggu', 'قيد الانتظار',
 datetime('now'), datetime('now')),

('i18n_frq_012', 'guardian.feed.request_status_approved', 'guardian', 1,
 '승인됨', 'Approved', '承認済み', '已批准', '已核准', 'Aprobado', 'Approuvé', 'Genehmigt', 'Aprovado', 'Đã duyệt', 'อนุมัติแล้ว', 'Disetujui', 'تمت الموافقة',
 datetime('now'), datetime('now')),

('i18n_frq_013', 'guardian.feed.request_status_rejected', 'guardian', 1,
 '반려됨', 'Rejected', '却下', '已拒绝', '已拒絕', 'Rechazado', 'Rejeté', 'Abgelehnt', 'Rejeitado', 'Đã từ chối', 'ถูกปฏิเสธ', 'Ditolak', 'مرفوض',
 datetime('now'), datetime('now')),

('i18n_frq_014', 'guardian.feed.my_requests', 'guardian', 1,
 '내 등록 요청', 'My Requests', '私のリクエスト', '我的请求', '我的請求', 'Mis solicitudes', 'Mes demandes', 'Meine Anfragen', 'Minhas solicitações', 'Yêu cầu của tôi', 'คำขอของฉัน', 'Permintaan saya', 'طلباتي',
 datetime('now'), datetime('now')),

('i18n_frq_015', 'guardian.feed.request_review_note', 'guardian', 1,
 '관리자 메모', 'Admin Note', '管理者メモ', '管理员备注', '管理員備註', 'Nota del admin', 'Note de l''admin', 'Admin-Notiz', 'Nota do admin', 'Ghi chú quản trị', 'หมายเหตุจากแอดมิน', 'Catatan admin', 'ملاحظة المسؤول',
 datetime('now'), datetime('now')),

-- Admin keys
('i18n_frq_016', 'admin.feed.requests_tab', 'admin', 1,
 '등록 요청', 'Requests', 'リクエスト', '请求', '請求', 'Solicitudes', 'Demandes', 'Anfragen', 'Solicitações', 'Yêu cầu', 'คำขอ', 'Permintaan', 'الطلبات',
 datetime('now'), datetime('now')),

('i18n_frq_017', 'admin.feed.catalog_tab', 'admin', 1,
 '사료 카탈로그', 'Feed Catalog', 'フードカタログ', '饲料目录', '飼料目錄', 'Catálogo de alimentos', 'Catalogue d''aliments', 'Futterkatalog', 'Catálogo de rações', 'Danh mục thức ăn', 'แคตตาล็อกอาหาร', 'Katalog pakan', 'كتالوج الأعلاف',
 datetime('now'), datetime('now')),

('i18n_frq_018', 'admin.feed.requester', 'admin', 1,
 '요청자', 'Requester', '申請者', '请求者', '請求者', 'Solicitante', 'Demandeur', 'Antragsteller', 'Solicitante', 'Người yêu cầu', 'ผู้ขอ', 'Pemohon', 'مقدم الطلب',
 datetime('now'), datetime('now')),

('i18n_frq_019', 'admin.feed.request_date', 'admin', 1,
 '요청일', 'Request Date', '申請日', '请求日期', '請求日期', 'Fecha de solicitud', 'Date de demande', 'Antragsdatum', 'Data da solicitação', 'Ngày yêu cầu', 'วันที่ขอ', 'Tanggal permintaan', 'تاريخ الطلب',
 datetime('now'), datetime('now')),

('i18n_frq_020', 'admin.feed.approve', 'admin', 1,
 '승인', 'Approve', '承認', '批准', '核准', 'Aprobar', 'Approuver', 'Genehmigen', 'Aprovar', 'Phê duyệt', 'อนุมัติ', 'Setujui', 'الموافقة',
 datetime('now'), datetime('now')),

('i18n_frq_021', 'admin.feed.reject', 'admin', 1,
 '반려', 'Reject', '却下', '拒绝', '拒絕', 'Rechazar', 'Rejeter', 'Ablehnen', 'Rejeitar', 'Từ chối', 'ปฏิเสธ', 'Tolak', 'رفض',
 datetime('now'), datetime('now')),

('i18n_frq_022', 'admin.feed.reject_reason', 'admin', 1,
 '반려 사유', 'Rejection Reason', '却下理由', '拒绝原因', '拒絕原因', 'Motivo del rechazo', 'Motif du rejet', 'Ablehnungsgrund', 'Motivo da rejeição', 'Lý do từ chối', 'เหตุผลที่ปฏิเสธ', 'Alasan penolakan', 'سبب الرفض',
 datetime('now'), datetime('now')),

('i18n_frq_023', 'admin.feed.approve_confirm', 'admin', 1,
 '이 사료를 카탈로그에 등록하시겠습니까?', 'Register this feed to the catalog?', 'このフードをカタログに登録しますか？', '将此饲料注册到目录？', '將此飼料登記到目錄？', '¿Registrar este alimento en el catálogo?', 'Enregistrer cet aliment dans le catalogue ?', 'Dieses Futter im Katalog registrieren?', 'Registrar esta ração no catálogo?', 'Đăng ký thức ăn này vào danh mục?', 'ลงทะเบียนอาหารนี้ในแคตตาล็อก?', 'Daftarkan pakan ini ke katalog?', 'تسجيل هذا العلف في الكتالوج؟',
 datetime('now'), datetime('now')),

('i18n_frq_024', 'admin.feed.approved_success', 'admin', 1,
 '승인되어 카탈로그에 등록되었습니다.', 'Approved and registered to catalog.', '承認され、カタログに登録されました。', '已批准并注册到目录。', '已核准並登記到目錄。', 'Aprobado y registrado en el catálogo.', 'Approuvé et enregistré dans le catalogue.', 'Genehmigt und im Katalog registriert.', 'Aprovado e registrado no catálogo.', 'Đã phê duyệt và đăng ký vào danh mục.', 'อนุมัติและลงทะเบียนในแคตตาล็อกแล้ว', 'Disetujui dan didaftarkan ke katalog.', 'تمت الموافقة والتسجيل في الكتالوج.',
 datetime('now'), datetime('now')),

('i18n_frq_025', 'admin.feed.rejected_success', 'admin', 1,
 '반려 처리되었습니다.', 'Request rejected.', 'リクエストが却下されました。', '请求已拒绝。', '請求已拒絕。', 'Solicitud rechazada.', 'Demande rejetée.', 'Anfrage abgelehnt.', 'Solicitação rejeitada.', 'Yêu cầu đã bị từ chối.', 'คำขอถูกปฏิเสธ', 'Permintaan ditolak.', 'تم رفض الطلب.',
 datetime('now'), datetime('now')),

('i18n_frq_026', 'admin.feed.no_requests', 'admin', 1,
 '등록 요청이 없습니다.', 'No registration requests.', '登録リクエストはありません。', '没有登记请求。', '沒有登記請求。', 'No hay solicitudes de registro.', 'Aucune demande d''enregistrement.', 'Keine Registrierungsanfragen.', 'Nenhuma solicitação de registro.', 'Không có yêu cầu đăng ký.', 'ไม่มีคำขอลงทะเบียน', 'Tidak ada permintaan pendaftaran.', 'لا توجد طلبات تسجيل.',
 datetime('now'), datetime('now'));
