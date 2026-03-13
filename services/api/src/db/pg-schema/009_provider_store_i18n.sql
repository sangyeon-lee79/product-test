-- 009: Missing i18n keys for ProviderStoreSection
INSERT INTO i18n_keys (id, key, namespace, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'admin.store.form.services', 'admin', '서비스', 'Services', 'サービス', '服务', '服務', 'Servicios', 'Services', 'Services', 'Serviços', 'Dịch vụ', 'บริการ', 'Layanan', 'الخدمات', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.store.form.discounts', 'admin', '할인', 'Discounts', '割引', '折扣', '折扣', 'Descuentos', 'Réductions', 'Rabatte', 'Descontos', 'Giảm giá', 'ส่วนลด', 'Diskon', 'الخصومات', true, NOW(), NOW()),
(gen_random_uuid(), 'admin.common.delete', 'admin', '삭제', 'Delete', '削除', '删除', '刪除', 'Eliminar', 'Supprimer', 'Löschen', 'Excluir', 'Xóa', 'ลบ', 'Hapus', 'حذف', true, NOW(), NOW()),
(gen_random_uuid(), 'provider.store.trans_popup_title', 'provider_store', '다국어 번역', 'Translations', '多言語翻訳', '多语言翻译', '多語言翻譯', 'Traducciones', 'Traductions', 'Übersetzungen', 'Traduções', 'Bản dịch', 'คำแปล', 'Terjemahan', 'الترجمات', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
