-- 100: Avatar upload i18n keys (13 languages)
-- Keys: avatar.upload.change, avatar.upload.uploading, avatar.upload.failed,
--        avatar.upload.size_limit, avatar.upload.type_invalid, avatar.upload.success

INSERT INTO i18n_translations (id, key, page,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
('avatar_upload_change', 'avatar.upload.change', 'common',
 '사진 변경', 'Change Photo', '写真を変更', '更换照片', '更換照片',
 'Cambiar foto', 'Changer la photo', 'Foto ändern', 'Alterar foto',
 'Đổi ảnh', 'เปลี่ยนรูป', 'Ganti Foto', 'تغيير الصورة'),

('avatar_upload_uploading', 'avatar.upload.uploading', 'common',
 '업로드 중...', 'Uploading...', 'アップロード中...', '上传中...', '上傳中...',
 'Subiendo...', 'Envoi en cours...', 'Wird hochgeladen...', 'Enviando...',
 'Đang tải lên...', 'กำลังอัปโหลด...', 'Mengunggah...', 'جارٍ الرفع...'),

('avatar_upload_failed', 'avatar.upload.failed', 'common',
 '사진 업로드에 실패했습니다.', 'Failed to upload photo.', '写真のアップロードに失敗しました。',
 '照片上传失败。', '照片上傳失敗。',
 'Error al subir la foto.', 'Échec de l''envoi de la photo.', 'Foto-Upload fehlgeschlagen.',
 'Falha ao enviar a foto.', 'Tải ảnh lên thất bại.', 'อัปโหลดรูปไม่สำเร็จ',
 'Gagal mengunggah foto.', 'فشل رفع الصورة.'),

('avatar_upload_size_limit', 'avatar.upload.size_limit', 'common',
 '파일 크기는 5MB 이하여야 합니다.', 'File size must be 5MB or less.',
 'ファイルサイズは5MB以下にしてください。', '文件大小不能超过5MB。', '檔案大小不能超過5MB。',
 'El archivo debe ser de 5MB o menos.', 'Le fichier doit faire 5 Mo ou moins.',
 'Die Datei darf maximal 5 MB groß sein.', 'O arquivo deve ter no máximo 5MB.',
 'Kích thước tệp phải từ 5MB trở xuống.', 'ขนาดไฟล์ต้องไม่เกิน 5MB',
 'Ukuran file harus 5MB atau kurang.', 'يجب ألّا يتجاوز حجم الملف 5 ميغابايت.'),

('avatar_upload_type_invalid', 'avatar.upload.type_invalid', 'common',
 'JPG/PNG/WEBP 파일만 지원합니다.', 'Only JPG/PNG/WEBP files are allowed.',
 'JPG/PNG/WEBPファイルのみ対応しています。', '仅支持JPG/PNG/WEBP文件。', '僅支援JPG/PNG/WEBP檔案。',
 'Solo se permiten archivos JPG/PNG/WEBP.', 'Seuls les fichiers JPG/PNG/WEBP sont acceptés.',
 'Nur JPG/PNG/WEBP-Dateien sind erlaubt.', 'Apenas arquivos JPG/PNG/WEBP são permitidos.',
 'Chỉ chấp nhận tệp JPG/PNG/WEBP.', 'รองรับเฉพาะไฟล์ JPG/PNG/WEBP',
 'Hanya file JPG/PNG/WEBP yang diizinkan.', 'يُسمح فقط بملفات JPG/PNG/WEBP.'),

('avatar_upload_success', 'avatar.upload.success', 'common',
 '사진이 업로드되었습니다.', 'Photo uploaded successfully.',
 '写真がアップロードされました。', '照片上传成功。', '照片上傳成功。',
 'Foto subida correctamente.', 'Photo envoyée avec succès.', 'Foto erfolgreich hochgeladen.',
 'Foto enviada com sucesso.', 'Ảnh đã được tải lên thành công.', 'อัปโหลดรูปสำเร็จแล้ว',
 'Foto berhasil diunggah.', 'تم رفع الصورة بنجاح.')

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = CURRENT_TIMESTAMP;
