-- 074: i18n keys for Health tab toolbar buttons (unified naming) + Medication log modal
-- 7 toolbar buttons + medication modal form labels

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Toolbar button labels (7) ────────────────────────────────────────────────
(md5('i18n_htb_weight_log'),     'guardian.health.weight_log',     'guardian', '체중 기록', 'Weight Log', '体重記録', '体重记录', '體重記錄', 'Registro de peso', 'Registre de poids', 'Gewichtsprotokoll', 'Registro de peso', 'Nhật ký cân nặng', 'บันทึกน้ำหนัก', 'Log Berat', 'سجل الوزن', true, NOW(), NOW()),
(md5('i18n_htb_measure_log'),    'guardian.health.measure_log',    'guardian', '수치 기록', 'Measure Log', '測定記録', '测量记录', '測量記錄', 'Registro de medición', 'Registre de mesure', 'Messprotokoll', 'Registro de medição', 'Nhật ký đo', 'บันทึกค่าวัด', 'Log Ukuran', 'سجل القياس', true, NOW(), NOW()),
(md5('i18n_htb_feeding_log'),    'guardian.health.feeding_log',    'guardian', '급여 기록', 'Feeding Log', '給餌記録', '喂食记录', '餵食記錄', 'Registro de alimentación', 'Registre d''alimentation', 'Fütterungsprotokoll', 'Registro de alimentação', 'Nhật ký cho ăn', 'บันทึกการให้อาหาร', 'Log Pemberian Makan', 'سجل التغذية', true, NOW(), NOW()),
(md5('i18n_htb_exercise_log'),   'guardian.health.exercise_log',   'guardian', '운동 기록', 'Exercise Log', '運動記録', '运动记录', '運動記錄', 'Registro de ejercicio', 'Registre d''exercice', 'Bewegungsprotokoll', 'Registro de exercício', 'Nhật ký tập luyện', 'บันทึกการออกกำลังกาย', 'Log Olahraga', 'سجل التمرين', true, NOW(), NOW()),
(md5('i18n_htb_medication_log'), 'guardian.health.medication_log', 'guardian', '약품 기록', 'Medication Log', '投薬記録', '用药记录', '用藥記錄', 'Registro de medicación', 'Registre de médicament', 'Medikamentenprotokoll', 'Registro de medicação', 'Nhật ký thuốc', 'บันทึกยา', 'Log Obat', 'سجل الأدوية', true, NOW(), NOW()),
(md5('i18n_htb_device_manage'),  'guardian.health.device_manage',  'guardian', '장비 관리', 'Device Mgmt', 'デバイス管理', '设备管理', '設備管理', 'Gestión de equipo', 'Gestion d''appareil', 'Geräteverwaltung', 'Gestão de equipamento', 'Quản lý thiết bị', 'จัดการอุปกรณ์', 'Kelola Perangkat', 'إدارة الأجهزة', true, NOW(), NOW()),
(md5('i18n_htb_feed_manage'),    'guardian.health.feed_manage',    'guardian', '사료 관리', 'Feed Mgmt', '飼料管理', '饲料管理', '飼料管理', 'Gestión de alimento', 'Gestion d''aliment', 'Futterverwaltung', 'Gestão de ração', 'Quản lý thức ăn', 'จัดการอาหาร', 'Kelola Pakan', 'إدارة العلف', true, NOW(), NOW()),

-- ── Medication log modal labels ──────────────────────────────────────────────
(md5('i18n_med_modal_title'),        'guardian.medication.title',         'guardian', '약품 투여 기록', 'Medication Administration', '投薬記録', '用药记录', '用藥記錄', 'Registro de medicación', 'Administration de médicament', 'Medikamentenverabreichung', 'Administração de medicação', 'Ghi nhận dùng thuốc', 'บันทึกการให้ยา', 'Catatan Pemberian Obat', 'سجل إعطاء الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_type'),         'guardian.medication.medicine_type', 'guardian', '약품 유형', 'Medicine Type', '薬品タイプ', '药品类型', '藥品類型', 'Tipo de medicamento', 'Type de médicament', 'Medikamententyp', 'Tipo de medicamento', 'Loại thuốc', 'ประเภทยา', 'Jenis Obat', 'نوع الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_name'),         'guardian.medication.medicine_name', 'guardian', '약품명', 'Medicine Name', '薬品名', '药品名', '藥品名', 'Nombre del medicamento', 'Nom du médicament', 'Medikamentenname', 'Nome do medicamento', 'Tên thuốc', 'ชื่อยา', 'Nama Obat', 'اسم الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_dose'),         'guardian.medication.dose_amount',   'guardian', '투여량', 'Dose Amount', '投与量', '剂量', '劑量', 'Dosis', 'Dose', 'Dosis', 'Dose', 'Liều lượng', 'ปริมาณยา', 'Dosis', 'الجرعة', true, NOW(), NOW()),
(md5('i18n_med_modal_unit'),         'guardian.medication.dose_unit',     'guardian', '단위', 'Unit', '単位', '单位', '單位', 'Unidad', 'Unité', 'Einheit', 'Unidade', 'Đơn vị', 'หน่วย', 'Satuan', 'الوحدة', true, NOW(), NOW()),
(md5('i18n_med_modal_route'),        'guardian.medication.route',         'guardian', '투여 경로', 'Administration Route', '投与経路', '给药途径', '給藥途徑', 'Vía de administración', 'Voie d''administration', 'Verabreichungsweg', 'Via de administração', 'Đường dùng thuốc', 'เส้นทางการให้ยา', 'Rute Pemberian', 'طريق الإعطاء', true, NOW(), NOW()),
(md5('i18n_med_modal_date'),         'guardian.medication.date',          'guardian', '투여 날짜', 'Date', '投与日', '用药日期', '用藥日期', 'Fecha', 'Date', 'Datum', 'Data', 'Ngày', 'วันที่', 'Tanggal', 'التاريخ', true, NOW(), NOW()),
(md5('i18n_med_modal_time'),         'guardian.medication.time',          'guardian', '투여 시간', 'Time', '投与時間', '用药时间', '用藥時間', 'Hora', 'Heure', 'Uhrzeit', 'Hora', 'Giờ', 'เวลา', 'Waktu', 'الوقت', true, NOW(), NOW()),
(md5('i18n_med_modal_notes'),        'guardian.medication.notes',         'guardian', '메모', 'Notes', 'メモ', '备注', '備註', 'Notas', 'Notes', 'Notizen', 'Notas', 'Ghi chú', 'หมายเหตุ', 'Catatan', 'ملاحظات', true, NOW(), NOW()),
(md5('i18n_med_modal_next'),         'guardian.medication.next_dose',     'guardian', '다음 투여 예정일', 'Next Dose Date', '次回投与予定日', '下次用药日期', '下次用藥日期', 'Próxima dosis', 'Prochaine dose', 'Nächste Dosis', 'Próxima dose', 'Ngày dùng tiếp', 'วันให้ยาครั้งถัดไป', 'Dosis Berikutnya', 'موعد الجرعة التالية', true, NOW(), NOW()),
(md5('i18n_med_modal_prescriber'),   'guardian.medication.prescriber',    'guardian', '처방 수의사', 'Prescriber', '処方獣医師', '处方兽医', '處方獸醫', 'Prescriptor', 'Prescripteur', 'Verschreibender Tierarzt', 'Prescritor', 'Bác sĩ kê đơn', 'สัตวแพทย์ผู้สั่งยา', 'Dokter Penulis Resep', 'الطبيب البيطري', true, NOW(), NOW()),
(md5('i18n_med_modal_save'),         'guardian.medication.save',          'guardian', '저장', 'Save', '保存', '保存', '儲存', 'Guardar', 'Enregistrer', 'Speichern', 'Salvar', 'Lưu', 'บันทึก', 'Simpan', 'حفظ', true, NOW(), NOW()),
(md5('i18n_med_modal_edit_title'),   'guardian.medication.edit_title',    'guardian', '약품 투여 수정', 'Edit Medication', '投薬記録の編集', '编辑用药记录', '編輯用藥記錄', 'Editar medicación', 'Modifier le médicament', 'Medikament bearbeiten', 'Editar medicação', 'Sửa ghi nhận thuốc', 'แก้ไขการให้ยา', 'Edit Pemberian Obat', 'تعديل سجل الدواء', true, NOW(), NOW()),
(md5('i18n_med_modal_delete'),       'guardian.medication.delete',        'guardian', '삭제', 'Delete', '削除', '删除', '刪除', 'Eliminar', 'Supprimer', 'Löschen', 'Excluir', 'Xóa', 'ลบ', 'Hapus', 'حذف', true, NOW(), NOW()),
(md5('i18n_med_modal_del_confirm'),  'guardian.medication.delete_confirm','guardian', '이 약품 기록을 삭제하시겠습니까?', 'Delete this medication record?', 'この投薬記録を削除しますか？', '确定删除此用药记录？', '確定刪除此用藥記錄？', '¿Eliminar este registro?', 'Supprimer cet enregistrement ?', 'Diesen Eintrag löschen?', 'Excluir este registro?', 'Xóa bản ghi này?', 'ลบบันทึกนี้?', 'Hapus catatan ini?', 'حذف هذا السجل؟', true, NOW(), NOW()),

-- ── Error messages ───────────────────────────────────────────────────────────
(md5('i18n_med_err_type'),    'guardian.medication.err_type',    'guardian', '약품 유형을 선택해주세요', 'Please select medicine type', '薬品タイプを選択してください', '请选择药品类型', '請選擇藥品類型', 'Seleccione el tipo', 'Sélectionnez le type', 'Bitte Typ wählen', 'Selecione o tipo', 'Chọn loại thuốc', 'กรุณาเลือกประเภทยา', 'Pilih jenis obat', 'يرجى اختيار نوع الدواء', true, NOW(), NOW()),
(md5('i18n_med_err_medicine'),'guardian.medication.err_medicine','guardian', '약품을 선택해주세요', 'Please select a medicine', '薬品を選択してください', '请选择药品', '請選擇藥品', 'Seleccione un medicamento', 'Sélectionnez un médicament', 'Bitte Medikament wählen', 'Selecione um medicamento', 'Chọn một loại thuốc', 'กรุณาเลือกยา', 'Pilih obat', 'يرجى اختيار الدواء', true, NOW(), NOW()),
(md5('i18n_med_err_dose'),   'guardian.medication.err_dose',   'guardian', '투여량을 입력해주세요', 'Please enter dose amount', '投与量を入力してください', '请输入剂量', '請輸入劑量', 'Ingrese la dosis', 'Entrez la dose', 'Bitte Dosis eingeben', 'Insira a dose', 'Nhập liều lượng', 'กรุณากรอกปริมาณยา', 'Masukkan dosis', 'يرجى إدخال الجرعة', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
