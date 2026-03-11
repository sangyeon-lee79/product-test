-- 073: i18n keys for Provider store management + Admin dashboard store stats
-- Provider store CRUD keys + Admin dashboard store stats keys

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- Provider store management
(gen_random_uuid(), 'provider.store.create', 'provider_store', '매장 등록', 'Add Store', '店舗登録', '添加店铺', '新增店鋪', 'Agregar tienda', 'Ajouter un magasin', 'Geschäft hinzufügen', 'Adicionar loja', 'Thêm cửa hàng', 'เพิ่มร้านค้า', 'Tambah toko', 'إضافة متجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.edit', 'provider_store', '매장 수정', 'Edit Store', '店舗編集', '编辑店铺', '編輯店鋪', 'Editar tienda', 'Modifier le magasin', 'Geschäft bearbeiten', 'Editar loja', 'Sửa cửa hàng', 'แก้ไขร้านค้า', 'Edit toko', 'تعديل المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.detail', 'provider_store', '매장 상세', 'Store Detail', '店舗詳細', '店铺详情', '店鋪詳情', 'Detalle de tienda', 'Détail du magasin', 'Geschäftsdetails', 'Detalhe da loja', 'Chi tiết cửa hàng', 'รายละเอียดร้านค้า', 'Detail toko', 'تفاصيل المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.delete_confirm', 'provider_store', '이 매장을 삭제하시겠습니까?', 'Delete this store?', 'この店舗を削除しますか？', '确定删除此店铺？', '確定刪除此店鋪？', '¿Eliminar esta tienda?', 'Supprimer ce magasin ?', 'Dieses Geschäft löschen?', 'Excluir esta loja?', 'Xóa cửa hàng này?', 'ลบร้านค้านี้?', 'Hapus toko ini?', 'حذف هذا المتجر؟', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.alert.created', 'provider_store', '매장이 등록되었습니다', 'Store created', '店舗が登録されました', '店铺已创建', '店鋪已建立', 'Tienda creada', 'Magasin créé', 'Geschäft erstellt', 'Loja criada', 'Đã tạo cửa hàng', 'สร้างร้านค้าแล้ว', 'Toko dibuat', 'تم إنشاء المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.alert.updated', 'provider_store', '매장이 수정되었습니다', 'Store updated', '店舗が更新されました', '店铺已更新', '店鋪已更新', 'Tienda actualizada', 'Magasin mis à jour', 'Geschäft aktualisiert', 'Loja atualizada', 'Đã cập nhật cửa hàng', 'อัปเดตร้านค้าแล้ว', 'Toko diperbarui', 'تم تحديث المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.alert.deleted', 'provider_store', '매장이 삭제되었습니다', 'Store deleted', '店舗が削除されました', '店铺已删除', '店鋪已刪除', 'Tienda eliminada', 'Magasin supprimé', 'Geschäft gelöscht', 'Loja excluída', 'Đã xóa cửa hàng', 'ลบร้านค้าแล้ว', 'Toko dihapus', 'تم حذف المتجر', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.service.add', 'provider_store', '서비스 추가', 'Add Service', 'サービス追加', '添加服务', '新增服務', 'Agregar servicio', 'Ajouter un service', 'Service hinzufügen', 'Adicionar serviço', 'Thêm dịch vụ', 'เพิ่มบริการ', 'Tambah layanan', 'إضافة خدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.service.edit', 'provider_store', '서비스 수정', 'Edit Service', 'サービス編集', '编辑服务', '編輯服務', 'Editar servicio', 'Modifier le service', 'Service bearbeiten', 'Editar serviço', 'Sửa dịch vụ', 'แก้ไขบริการ', 'Edit layanan', 'تعديل الخدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.discount.add', 'provider_store', '할인 추가', 'Add Discount', '割引追加', '添加折扣', '新增折扣', 'Agregar descuento', 'Ajouter une remise', 'Rabatt hinzufügen', 'Adicionar desconto', 'Thêm giảm giá', 'เพิ่มส่วนลด', 'Tambah diskon', 'إضافة خصم', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.no_stores', 'provider_store', '등록된 매장이 없습니다', 'No stores yet', 'まだ店舗がありません', '暂无店铺', '尚無店鋪', 'Sin tiendas aún', 'Aucun magasin', 'Noch keine Geschäfte', 'Nenhuma loja ainda', 'Chưa có cửa hàng', 'ยังไม่มีร้านค้า', 'Belum ada toko', 'لا توجد متاجر بعد', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.my_stores', 'provider_store', '내 매장', 'My Stores', 'マイ店舗', '我的店铺', '我的店鋪', 'Mis tiendas', 'Mes magasins', 'Meine Geschäfte', 'Minhas lojas', 'Cửa hàng của tôi', 'ร้านค้าของฉัน', 'Toko saya', 'متاجري', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.services_count', 'provider_store', '{count}개 서비스', '{count} services', '{count}件のサービス', '{count}个服务', '{count}個服務', '{count} servicios', '{count} services', '{count} Services', '{count} serviços', '{count} dịch vụ', '{count} บริการ', '{count} layanan', '{count} خدمات', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.select_store', 'provider_store', '매장을 선택하세요', 'Select a store', '店舗を選択', '请选择店铺', '請選擇店鋪', 'Selecciona una tienda', 'Sélectionnez un magasin', 'Geschäft auswählen', 'Selecione uma loja', 'Chọn cửa hàng', 'เลือกร้านค้า', 'Pilih toko', 'اختر متجرًا', true, NOW(), NOW()),

(gen_random_uuid(), 'provider.store.no_services', 'provider_store', '등록된 서비스가 없습니다', 'No services yet', 'まだサービスがありません', '暂无服务', '尚無服務', 'Sin servicios', 'Aucun service', 'Keine Services', 'Nenhum serviço', 'Chưa có dịch vụ', 'ยังไม่มีบริการ', 'Belum ada layanan', 'لا توجد خدمات', true, NOW(), NOW()),

-- Admin dashboard store stats
(gen_random_uuid(), 'admin.dashboard.stores.title', 'admin_dashboard', '매장 통계', 'Store Statistics', '店舗統計', '店铺统计', '店鋪統計', 'Estadísticas de tiendas', 'Statistiques des magasins', 'Geschäftsstatistiken', 'Estatísticas de lojas', 'Thống kê cửa hàng', 'สถิติร้านค้า', 'Statistik toko', 'إحصائيات المتاجر', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.dashboard.stores.total', 'admin_dashboard', '전체 매장', 'Total Stores', '全店舗数', '全部店铺', '全部店鋪', 'Total tiendas', 'Total magasins', 'Geschäfte gesamt', 'Total de lojas', 'Tổng cửa hàng', 'ร้านค้าทั้งหมด', 'Total toko', 'إجمالي المتاجر', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.dashboard.stores.active', 'admin_dashboard', '활성 매장', 'Active Stores', 'アクティブ店舗', '活跃店铺', '活躍店鋪', 'Tiendas activas', 'Magasins actifs', 'Aktive Geschäfte', 'Lojas ativas', 'Cửa hàng hoạt động', 'ร้านค้าที่ใช้งาน', 'Toko aktif', 'متاجر نشطة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.dashboard.stores.new', 'admin_dashboard', '신규 매장 (30일)', 'New Stores (30d)', '新規店舗 (30日)', '新店铺 (30天)', '新店鋪 (30天)', 'Nuevas tiendas (30d)', 'Nouveaux magasins (30j)', 'Neue Geschäfte (30T)', 'Novas lojas (30d)', 'Cửa hàng mới (30 ngày)', 'ร้านค้าใหม่ (30 วัน)', 'Toko baru (30h)', 'متاجر جديدة (30 يوم)', true, NOW(), NOW())

ON CONFLICT (key) DO NOTHING;
