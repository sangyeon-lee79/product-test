-- 067: i18n keys for image URL manual input
INSERT INTO i18n_translations (id, key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
  (gen_random_uuid()::text, 'admin.catalog.image_url', '이미지 URL', 'Image URL', '画像URL', '图片URL', '圖片URL', 'URL de imagen', 'URL de l''image', 'Bild-URL', 'URL da imagem', 'URL hình ảnh', 'URL รูปภาพ', 'URL Gambar', 'رابط الصورة'),
  (gen_random_uuid()::text, 'admin.catalog.image_url_hint', '외부 이미지 URL 붙여넣기', 'Paste external image URL', '外部画像URLを貼り付け', '粘贴外部图片URL', '貼上外部圖片URL', 'Pegar URL de imagen externa', 'Coller l''URL de l''image externe', 'Externe Bild-URL einfügen', 'Colar URL de imagem externa', 'Dán URL hình ảnh bên ngoài', 'วาง URL รูปภาพภายนอก', 'Tempel URL gambar eksternal', 'لصق رابط الصورة الخارجي'),
  (gen_random_uuid()::text, 'admin.catalog.image_url_save', '적용', 'Apply', '適用', '应用', '套用', 'Aplicar', 'Appliquer', 'Anwenden', 'Aplicar', 'Áp dụng', 'นำไปใช้', 'Terapkan', 'تطبيق')
ON CONFLICT (key) DO NOTHING;
