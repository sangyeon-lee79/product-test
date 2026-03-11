-- 065_model_images.sql
-- Add representative image_url to feed_models and device_models

ALTER TABLE feed_models ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE device_models ADD COLUMN IF NOT EXISTS image_url TEXT;

-- i18n keys for catalog image UI
INSERT INTO i18n_translations (key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
  ('admin.catalog.image', '이미지', 'Image', '画像', '图片', '圖片', 'Imagen', 'Image', 'Bild', 'Imagem', 'Hình ảnh', 'รูปภาพ', 'Gambar', 'صورة'),
  ('admin.catalog.upload_image', '이미지 업로드', 'Upload Image', '画像アップロード', '上传图片', '上傳圖片', 'Subir imagen', 'Télécharger', 'Bild hochladen', 'Enviar imagem', 'Tải ảnh lên', 'อัปโหลดรูป', 'Unggah gambar', 'رفع صورة'),
  ('admin.catalog.change_image', '이미지 변경', 'Change Image', '画像変更', '更换图片', '更換圖片', 'Cambiar imagen', 'Changer', 'Bild ändern', 'Alterar imagem', 'Đổi ảnh', 'เปลี่ยนรูป', 'Ganti gambar', 'تغيير الصورة'),
  ('admin.catalog.remove_image', '이미지 삭제', 'Remove Image', '画像削除', '删除图片', '刪除圖片', 'Eliminar imagen', 'Supprimer', 'Bild entfernen', 'Remover imagem', 'Xóa ảnh', 'ลบรูป', 'Hapus gambar', 'إزالة الصورة'),
  ('admin.catalog.no_image', '이미지 없음', 'No Image', '画像なし', '无图片', '無圖片', 'Sin imagen', 'Pas d''image', 'Kein Bild', 'Sem imagem', 'Không có ảnh', 'ไม่มีรูป', 'Tidak ada gambar', 'لا توجد صورة'),
  ('admin.catalog.image_upload_hint', '권장 200×200, jpg/png/webp', 'Recommended 200×200, jpg/png/webp', '推奨 200×200, jpg/png/webp', '建议 200×200, jpg/png/webp', '建議 200×200, jpg/png/webp', 'Recomendado 200×200, jpg/png/webp', 'Recommandé 200×200, jpg/png/webp', 'Empfohlen 200×200, jpg/png/webp', 'Recomendado 200×200, jpg/png/webp', 'Khuyến nghị 200×200, jpg/png/webp', 'แนะนำ 200×200, jpg/png/webp', 'Disarankan 200×200, jpg/png/webp', 'موصى به 200×200, jpg/png/webp')
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar;
