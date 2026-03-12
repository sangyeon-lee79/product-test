-- 082: i18n keys for supplier post feature (13 languages)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- ── Compose modal ────────────────────────────────────────────────────────────
(md5('i18n_sp_placeholder'),   'supplier.post.placeholder',    'supplier', '업종 소식을 공유해보세요', 'Share your business news', 'ビジネスニュースを共有しましょう', '分享您的业务动态', '分享您的業務動態', 'Comparte tus noticias de negocio', 'Partagez vos actualités', 'Teilen Sie Ihre Geschäftsneuigkeiten', 'Compartilhe suas novidades', 'Chia sẻ tin tức kinh doanh', 'แชร์ข่าวสารธุรกิจ', 'Bagikan berita bisnis Anda', 'شارك أخبار عملك', true, NOW(), NOW()),
(md5('i18n_sp_create_title'),  'supplier.post.create_title',   'supplier', '게시글 작성', 'Create Post', '投稿作成', '创建帖子', '建立貼文', 'Crear publicación', 'Créer une publication', 'Beitrag erstellen', 'Criar publicação', 'Tạo bài viết', 'สร้างโพสต์', 'Buat Postingan', 'إنشاء منشور', true, NOW(), NOW()),
(md5('i18n_sp_post_type'),     'supplier.post.post_type',      'supplier', '게시글 유형', 'Post Type', '投稿タイプ', '帖子类型', '貼文類型', 'Tipo de publicación', 'Type de publication', 'Beitragstyp', 'Tipo de publicação', 'Loại bài viết', 'ประเภทโพสต์', 'Jenis Postingan', 'نوع المنشور', true, NOW(), NOW()),

-- ── Post types ───────────────────────────────────────────────────────────────
(md5('i18n_sp_type_general'),  'supplier.post.type.general',   'supplier', '일반', 'General', '一般', '一般', '一般', 'General', 'Général', 'Allgemein', 'Geral', 'Chung', 'ทั่วไป', 'Umum', 'عام', true, NOW(), NOW()),
(md5('i18n_sp_type_news'),     'supplier.post.type.news',      'supplier', '소식', 'News', 'ニュース', '资讯', '資訊', 'Noticias', 'Actualités', 'Nachrichten', 'Notícias', 'Tin tức', 'ข่าวสาร', 'Berita', 'أخبار', true, NOW(), NOW()),
(md5('i18n_sp_type_product'),  'supplier.post.type.product',   'supplier', '제품/서비스', 'Product', 'プロダクト', '产品', '產品', 'Producto', 'Produit', 'Produkt', 'Produto', 'Sản phẩm', 'สินค้า', 'Produk', 'منتج', true, NOW(), NOW()),
(md5('i18n_sp_type_event'),    'supplier.post.type.event',     'supplier', '이벤트/프로모션', 'Event', 'イベント', '活动', '活動', 'Evento', 'Événement', 'Veranstaltung', 'Evento', 'Sự kiện', 'กิจกรรม', 'Acara', 'حدث', true, NOW(), NOW()),
(md5('i18n_sp_type_hiring'),   'supplier.post.type.hiring',    'supplier', '채용', 'Hiring', '採用', '招聘', '徵才', 'Empleo', 'Recrutement', 'Stellenangebot', 'Vagas', 'Tuyển dụng', 'รับสมัครงาน', 'Lowongan', 'توظيف', true, NOW(), NOW()),

-- ── Feed section in supplier dashboard ───────────────────────────────────────
(md5('i18n_sp_feed_title'),    'supplier.feed.title',          'supplier', '내 게시글', 'My Posts', '私の投稿', '我的帖子', '我的貼文', 'Mis publicaciones', 'Mes publications', 'Meine Beiträge', 'Minhas publicações', 'Bài viết của tôi', 'โพสต์ของฉัน', 'Postingan Saya', 'منشوراتي', true, NOW(), NOW()),
(md5('i18n_sp_feed_empty'),    'supplier.feed.empty',          'supplier', '아직 작성한 게시글이 없습니다.', 'No posts yet.', 'まだ投稿がありません。', '还没有帖子。', '還沒有貼文。', 'Aún no hay publicaciones.', 'Aucune publication pour le moment.', 'Noch keine Beiträge.', 'Ainda não há publicações.', 'Chưa có bài viết nào.', 'ยังไม่มีโพสต์', 'Belum ada postingan.', 'لا توجد منشورات بعد.', true, NOW(), NOW()),

-- ── Badge label for public feed ──────────────────────────────────────────────
(md5('i18n_sp_badge_supplier'),'supplier.badge.supplier',      'public', '업종', 'Business', 'ビジネス', '商家', '商家', 'Negocio', 'Entreprise', 'Unternehmen', 'Negócio', 'Doanh nghiệp', 'ธุรกิจ', 'Bisnis', 'أعمال', true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active, updated_at = NOW();
