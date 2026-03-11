-- 064: Guardian pet UI i18n keys (onboarding + sidebar)
-- Depends on: 003_master_data_seed.sql

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-guardian-onboard-title', 'guardian.empty.onboard_title', 'guardian', true,
   '아직 등록된 반려동물이 없어요', 'No pets registered yet', 'まだペットが登録されていません',
   '还没有注册宠物', '還沒有註冊寵物', 'Aún no hay mascotas registradas',
   'Aucun animal enregistré', 'Noch keine Haustiere registriert', 'Nenhum pet registrado ainda',
   'Chưa có thú cưng nào được đăng ký', 'ยังไม่มีสัตว์เลี้ยงที่ลงทะเบียน', 'Belum ada hewan peliharaan terdaftar',
   'لا توجد حيوانات أليفة مسجلة بعد',
   NOW(), NOW()),
  ('i18n-guardian-onboard-desc', 'guardian.empty.onboard_desc', 'guardian', true,
   '반려동물을 추가하고 건강을 기록해보세요!', 'Add your pet and start tracking their health!',
   'ペットを追加して健康を記録しましょう！', '添加宠物并开始记录健康状况！', '添加寵物並開始記錄健康狀況！',
   '¡Agrega tu mascota y empieza a registrar su salud!', 'Ajoutez votre animal et commencez à suivre sa santé !',
   'Fügen Sie Ihr Haustier hinzu und beginnen Sie, seine Gesundheit zu verfolgen!',
   'Adicione seu pet e comece a acompanhar a saúde!', 'Thêm thú cưng và bắt đầu theo dõi sức khỏe!',
   'เพิ่มสัตว์เลี้ยงและเริ่มบันทึกสุขภาพ!', 'Tambahkan hewan peliharaan dan mulai catat kesehatannya!',
   'أضف حيوانك الأليف وابدأ بتتبع صحته!',
   NOW(), NOW()),
  ('i18n-guardian-onboard-cta', 'guardian.empty.onboard_cta', 'guardian', true,
   '+ 반려동물 추가하기', '+ Add Pet', '+ ペットを追加', '+ 添加宠物', '+ 添加寵物',
   '+ Agregar mascota', '+ Ajouter un animal', '+ Haustier hinzufügen', '+ Adicionar pet',
   '+ Thêm thú cưng', '+ เพิ่มสัตว์เลี้ยง', '+ Tambah hewan peliharaan', '+ إضافة حيوان أليف',
   NOW(), NOW()),
  ('i18n-guardian-sidebar-measurements', 'guardian.sidebar.measurements', 'guardian', true,
   '수치', 'Records', '記録', '记录', '記錄', 'Registros', 'Enregistrements', 'Einträge', 'Registros',
   'Bản ghi', 'บันทึก', 'Catatan', 'سجلات',
   NOW(), NOW()),
  ('i18n-guardian-sidebar-status', 'guardian.sidebar.status', 'guardian', true,
   '상태', 'Status', 'ステータス', '状态', '狀態', 'Estado', 'Statut', 'Status', 'Status',
   'Trạng thái', 'สถานะ', 'Status', 'الحالة',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
