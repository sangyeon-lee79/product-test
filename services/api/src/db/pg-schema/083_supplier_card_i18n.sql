-- 083: i18n keys for supplier card UI enhancements
INSERT INTO i18n_translations (key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar) VALUES
('supplier.card.view_store', '업체 보기', 'View Store', '店舗を見る', '查看店铺', '查看店鋪', 'Ver tienda', 'Voir boutique', 'Laden ansehen', 'Ver loja', 'Xem cửa hàng', 'ดูร้านค้า', 'Lihat Toko', 'عرض المتجر'),
('supplier.card.sponsored', 'Sponsored', 'Sponsored', 'スポンサー', '推广', '推廣', 'Patrocinado', 'Sponsorisé', 'Gesponsert', 'Patrocinado', 'Được tài trợ', 'สปอนเซอร์', 'Bersponsor', 'ممول')
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar;
