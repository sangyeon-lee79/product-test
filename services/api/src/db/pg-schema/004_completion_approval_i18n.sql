-- =============================================================================
-- 004: i18n keys for Grooming Completion & Guardian Approval flow
-- 21 keys, 13 languages (ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
-- =============================================================================

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active)
VALUES
-- ── Completion (supplier side) ──
(gen_random_uuid()::text, 'booking.completion_title', 'grooming',
  '미용 완료 보고서', 'Grooming Completion Report', 'グルーミング完了報告', '美容完成报告', '美容完成報告',
  'Informe de finalización', 'Rapport d''achèvement', 'Abschlussbericht', 'Relatório de conclusão',
  'Báo cáo hoàn thành', 'รายงานเสร็จสิ้น', 'Laporan penyelesaian', 'تقرير الإنجاز', true),

(gen_random_uuid()::text, 'booking.completion_photos', 'grooming',
  '완료 사진', 'Completion Photos', '完了写真', '完成照片', '完成照片',
  'Fotos de finalización', 'Photos d''achèvement', 'Abschlussfotos', 'Fotos de conclusão',
  'Ảnh hoàn thành', 'รูปภาพเสร็จสิ้น', 'Foto penyelesaian', 'صور الإنجاز', true),

(gen_random_uuid()::text, 'booking.completion_style', 'grooming',
  '미용 종류', 'Grooming Type', 'グルーミングタイプ', '美容类型', '美容類型',
  'Tipo de aseo', 'Type de toilettage', 'Pflegeart', 'Tipo de tosa',
  'Loại chăm sóc', 'ประเภทการดูแล', 'Jenis grooming', 'نوع العناية', true),

(gen_random_uuid()::text, 'booking.completion_cut', 'grooming',
  '컷 스타일', 'Cut Style', 'カットスタイル', '剪毛风格', '剪毛風格',
  'Estilo de corte', 'Style de coupe', 'Schnittstil', 'Estilo de corte',
  'Kiểu cắt', 'สไตล์การตัด', 'Gaya potong', 'نمط القص', true),

(gen_random_uuid()::text, 'booking.completion_duration', 'grooming',
  '소요 시간', 'Duration', '所要時間', '耗时', '耗時',
  'Duración', 'Durée', 'Dauer', 'Duração',
  'Thời gian', 'ระยะเวลา', 'Durasi', 'المدة', true),

(gen_random_uuid()::text, 'booking.completion_product', 'grooming',
  '사용 제품', 'Products Used', '使用製品', '使用产品', '使用產品',
  'Productos utilizados', 'Produits utilisés', 'Verwendete Produkte', 'Produtos utilizados',
  'Sản phẩm sử dụng', 'ผลิตภัณฑ์ที่ใช้', 'Produk yang digunakan', 'المنتجات المستخدمة', true),

(gen_random_uuid()::text, 'booking.completion_comment', 'grooming',
  '보호자에게 한마디', 'Comment to Guardian', '飼い主へのコメント', '给主人的留言', '給主人的留言',
  'Comentario al dueño', 'Commentaire au propriétaire', 'Kommentar an Besitzer', 'Comentário ao tutor',
  'Nhắn nhủ đến chủ', 'ข้อความถึงเจ้าของ', 'Pesan untuk pemilik', 'رسالة لصاحب الحيوان', true),

(gen_random_uuid()::text, 'booking.completion_send', 'grooming',
  '보호자에게 전송', 'Send to Guardian', '飼い主に送信', '发送给主人', '傳送給主人',
  'Enviar al dueño', 'Envoyer au propriétaire', 'An Besitzer senden', 'Enviar ao tutor',
  'Gửi cho chủ', 'ส่งถึงเจ้าของ', 'Kirim ke pemilik', 'إرسال لصاحب الحيوان', true),

-- ── Approval (guardian side) ──
(gen_random_uuid()::text, 'booking.approval_title', 'grooming',
  '미용 완료!', 'Grooming Complete!', 'グルーミング完了！', '美容完成！', '美容完成！',
  '!Aseo completado!', 'Toilettage terminé !', 'Pflege abgeschlossen!', 'Tosa concluída!',
  'Hoàn thành chăm sóc!', 'ดูแลเสร็จแล้ว!', 'Grooming selesai!', 'اكتملت العناية!', true),

(gen_random_uuid()::text, 'booking.approval_noti', 'grooming',
  '{store}에서 완료 알림이 왔어요', '{store} sent a completion notice', '{store}から完了通知が届きました', '{store}发来了完成通知', '{store}傳來了完成通知',
  '{store} envió un aviso de finalización', '{store} a envoyé un avis d''achèvement', '{store} hat eine Abschlussmeldung gesendet', '{store} enviou um aviso de conclusão',
  '{store} đã gửi thông báo hoàn thành', '{store} ส่งการแจ้งเตือนเสร็จสิ้น', '{store} mengirim pemberitahuan selesai', 'أرسل {store} إشعار الإنجاز', true),

(gen_random_uuid()::text, 'booking.approval_question', 'grooming',
  '어떻게 하시겠어요?', 'What would you like to do?', 'どうしますか？', '您想怎么做？', '您想怎麼做？',
  '?Qué desea hacer?', 'Que souhaitez-vous faire ?', 'Was möchten Sie tun?', 'O que gostaria de fazer?',
  'Bạn muốn làm gì?', 'คุณต้องการทำอะไร?', 'Apa yang ingin Anda lakukan?', 'ماذا تريد أن تفعل؟', true),

-- ── Choice options ──
(gen_random_uuid()::text, 'booking.choice_feed_only', 'grooming',
  'SNS 피드에만 공유', 'Share to Feed Only', 'フィードのみ共有', '仅分享到动态', '僅分享到動態',
  'Compartir solo en feed', 'Partager sur le fil uniquement', 'Nur im Feed teilen', 'Compartilhar apenas no feed',
  'Chỉ chia sẻ lên feed', 'แชร์ไปที่ฟีดเท่านั้น', 'Bagikan ke feed saja', 'مشاركة في الموجز فقط', true),

(gen_random_uuid()::text, 'booking.choice_feed_desc', 'grooming',
  '공개 피드에 미용 결과를 공유합니다', 'Share grooming results on public feed', '公開フィードにグルーミング結果を共有します', '在公开动态分享美容结果', '在公開動態分享美容結果',
  'Comparta los resultados en el feed público', 'Partagez les résultats sur le fil public', 'Ergebnisse im öffentlichen Feed teilen', 'Compartilhe os resultados no feed público',
  'Chia sẻ kết quả trên feed công khai', 'แชร์ผลลัพธ์บนฟีดสาธารณะ', 'Bagikan hasil di feed publik', 'مشاركة النتائج في الموجز العام', true),

(gen_random_uuid()::text, 'booking.choice_approve_only', 'grooming',
  '타임라인에만 저장', 'Save to Timeline Only', 'タイムラインのみ保存', '仅保存到时间线', '僅保存到時間線',
  'Guardar solo en línea de tiempo', 'Enregistrer uniquement dans le fil', 'Nur in Timeline speichern', 'Salvar apenas na timeline',
  'Chỉ lưu vào timeline', 'บันทึกลงไทม์ไลน์เท่านั้น', 'Simpan ke timeline saja', 'حفظ في الجدول الزمني فقط', true),

(gen_random_uuid()::text, 'booking.choice_approve_desc', 'grooming',
  '반려동물 타임라인에 비공개로 저장합니다', 'Save privately to pet timeline', 'ペットのタイムラインに非公開で保存します', '私密保存到宠物时间线', '私密保存到寵物時間線',
  'Guardar de forma privada en la línea de tiempo', 'Enregistrer en privé dans le fil de l''animal', 'Privat in der Pet-Timeline speichern', 'Salvar de forma privada na timeline do pet',
  'Lưu riêng vào timeline thú cưng', 'บันทึกส่วนตัวในไทม์ไลน์สัตว์เลี้ยง', 'Simpan secara pribadi di timeline hewan', 'حفظ بشكل خاص في الجدول الزمني للحيوان', true),

(gen_random_uuid()::text, 'booking.choice_both', 'grooming',
  '타임라인 저장 + 피드 공유', 'Save & Share to Feed', 'タイムライン保存＋フィード共有', '保存到时间线并分享到动态', '保存到時間線並分享到動態',
  'Guardar y compartir en feed', 'Enregistrer et partager', 'Speichern und im Feed teilen', 'Salvar e compartilhar no feed',
  'Lưu và chia sẻ lên feed', 'บันทึกและแชร์ไปที่ฟีด', 'Simpan dan bagikan ke feed', 'حفظ ومشاركة في الموجز', true),

(gen_random_uuid()::text, 'booking.choice_both_desc', 'grooming',
  '타임라인에 저장하고 공개 피드에도 공유합니다', 'Save to timeline and share on public feed', 'タイムラインに保存し、公開フィードにも共有します', '保存到时间线并分享到公开动态', '保存到時間線並分享到公開動態',
  'Guardar en línea de tiempo y compartir en feed', 'Enregistrer et partager sur le fil public', 'In Timeline speichern und im Feed teilen', 'Salvar na timeline e compartilhar no feed',
  'Lưu vào timeline và chia sẻ lên feed', 'บันทึกลงไทม์ไลน์และแชร์ไปที่ฟีด', 'Simpan di timeline dan bagikan ke feed', 'حفظ في الجدول الزمني ومشاركة في الموجز', true),

(gen_random_uuid()::text, 'booking.choice_confirm', 'grooming',
  '선택 확인', 'Confirm Choice', '選択を確認', '确认选择', '確認選擇',
  'Confirmar selección', 'Confirmer le choix', 'Auswahl bestätigen', 'Confirmar escolha',
  'Xác nhận lựa chọn', 'ยืนยันตัวเลือก', 'Konfirmasi pilihan', 'تأكيد الاختيار', true),

-- ── Success screen ──
(gen_random_uuid()::text, 'booking.approved_title', 'grooming',
  '승인 완료!', 'Approved!', '承認完了！', '已批准！', '已批准！',
  '!Aprobado!', 'Approuvé !', 'Genehmigt!', 'Aprovado!',
  'Đã duyệt!', 'อนุมัติแล้ว!', 'Disetujui!', 'تمت الموافقة!', true),

(gen_random_uuid()::text, 'booking.approved_sub', 'grooming',
  '선택이 반영되었습니다', 'Your choice has been applied', 'ご選択が反映されました', '您的选择已生效', '您的選擇已生效',
  'Su elección ha sido aplicada', 'Votre choix a été appliqué', 'Ihre Auswahl wurde übernommen', 'Sua escolha foi aplicada',
  'Lựa chọn đã được áp dụng', 'ตัวเลือกของคุณถูกนำไปใช้แล้ว', 'Pilihan Anda telah diterapkan', 'تم تطبيق اختيارك', true)

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active;
