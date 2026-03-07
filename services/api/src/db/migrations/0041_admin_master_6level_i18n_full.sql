-- 0041: Admin Master 6-level UI i18n full seed + locale completeness backfill
-- 목적:
-- 1) 6단 마스터 UI 고정 문구를 i18n key로 제공
-- 2) master.* / admin.master.* 번역 컬럼 공란 제거 (13개 언어)

INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
  (lower(hex(randomblob(16))), 'admin.master.hierarchy_guide', 'admin.master', '카테고리 → L1 → L2 → L3(검사방법) → L4(측정항목) → L5(측정컨텍스트)', 'Category -> L1 -> L2 -> L3 (Test Method) -> L4 (Measurement) -> L5 (Context)', 'カテゴリ → L1 → L2 → L3(検査方法) → L4(測定項目) → L5(測定コンテキスト)', '类别 → L1 → L2 → L3(检测方法) → L4(测量项) → L5(测量上下文)', '類別 → L1 → L2 → L3(檢測方法) → L4(測量項目) → L5(測量情境)', 'Categoria -> L1 -> L2 -> L3 (Metodo de prueba) -> L4 (Medicion) -> L5 (Contexto)', 'Categorie -> L1 -> L2 -> L3 (Methode de test) -> L4 (Mesure) -> L5 (Contexte)', 'Kategorie -> L1 -> L2 -> L3 (Testmethode) -> L4 (Messwert) -> L5 (Kontext)', 'Categoria -> L1 -> L2 -> L3 (Metodo de teste) -> L4 (Medicao) -> L5 (Contexto)', 'Danh muc -> L1 -> L2 -> L3 (Phuong phap do) -> L4 (Chi so) -> L5 (Boi canh)', 'หมวดหมู่ -> L1 -> L2 -> L3 (วิธีทดสอบ) -> L4 (ค่าที่วัด) -> L5 (บริบท)', 'Kategori -> L1 -> L2 -> L3 (Metode tes) -> L4 (Pengukuran) -> L5 (Konteks)', 'الفئة -> L1 -> L2 -> L3 (طريقة الفحص) -> L4 (القياس) -> L5 (السياق)', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.level_title', 'admin.master', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 'L{level}', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.level_title_with_name', 'admin.master', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 'L{level} · {name}', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.level_select_required', 'admin.master', 'L{level} 선택 필요', 'Select L{level} first', '先にL{level}を選択してください', '请先选择 L{level}', '請先選擇 L{level}', 'Seleccione primero L{level}', 'Selectionnez d''abord L{level}', 'Bitte zuerst L{level} waehlen', 'Selecione primeiro L{level}', 'Vui long chon truoc L{level}', 'กรุณาเลือก L{level} ก่อน', 'Pilih L{level} terlebih dahulu', 'الرجاء اختيار L{level} اولا', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.edit_category', 'admin.master', '카테고리 편집', 'Edit Category', 'カテゴリ編集', '编辑分类', '編輯分類', 'Editar categoria', 'Modifier la categorie', 'Kategorie bearbeiten', 'Editar categoria', 'Sua danh muc', 'แก้ไขหมวดหมู่', 'Edit kategori', 'تعديل الفئة', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.delete_category', 'admin.master', '카테고리 삭제', 'Delete Category', 'カテゴリ削除', '删除分类', '刪除分類', 'Eliminar categoria', 'Supprimer la categorie', 'Kategorie loeschen', 'Excluir categoria', 'Xoa danh muc', 'ลบหมวดหมู่', 'Hapus kategori', 'حذف الفئة', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.field_key', 'admin.master', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 'Key *', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.placeholder_key', 'admin.master', '예: disease_device_type', 'e.g. disease_device_type', '例: disease_device_type', '例如: disease_device_type', '例如: disease_device_type', 'Ej: disease_device_type', 'Ex: disease_device_type', 'z.B. disease_device_type', 'Ex: disease_device_type', 'Vi du: disease_device_type', 'เช่น disease_device_type', 'Contoh: disease_device_type', 'مثال: disease_device_type', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.none_option', 'admin.master', '-- 없음 --', '-- None --', '-- なし --', '-- 无 --', '-- 無 --', '-- Ninguno --', '-- Aucun --', '-- Keine --', '-- Nenhum --', '-- Khong co --', '-- ไม่มี --', '-- Tidak ada --', '-- لا يوجد --', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.loading_translate', 'admin.master', '번역 중...', 'Translating...', '翻訳中...', '翻译中...', '翻譯中...', 'Traduciendo...', 'Traduction...', 'Uebersetzen...', 'Traduzindo...', 'Dang dich...', 'กําลังแปล...', 'Menerjemahkan...', 'جارٍ الترجمة...', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.error_key_required', 'admin.master', 'Key는 필수입니다.', 'Key is required.', 'Key は必須です。', 'Key 为必填。', 'Key 為必填。', 'La clave es obligatoria.', 'La cle est obligatoire.', 'Key ist erforderlich.', 'Key e obrigatorio.', 'Key la bat buoc.', 'ต้องระบุ Key', 'Key wajib diisi.', 'المعرف مطلوب.', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.error_key_format', 'admin.master', 'Key는 소문자/숫자/언더스코어만 허용됩니다.', 'Key can contain only lowercase letters, numbers, and underscores.', 'Key は小文字/数字/アンダースコアのみ使用できます。', 'Key 仅允许小写字母、数字和下划线。', 'Key 僅允許小寫字母、數字與底線。', 'La clave solo permite minusculas, numeros y guion bajo.', 'La cle accepte uniquement minuscules, chiffres et underscore.', 'Key erlaubt nur Kleinbuchstaben, Zahlen und Unterstriche.', 'A chave permite apenas letras minusculas, numeros e underscore.', 'Key chi chap nhan chu thuong, so va dau gach duoi.', 'Key ใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และขีดล่าง', 'Key hanya boleh huruf kecil, angka, dan underscore.', 'يسمح بالمفتاح بحروف صغيرة وارقام وشرطة سفلية فقط.', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.error_ko_required', 'admin.master', '한국어 표시명은 필수입니다.', 'Korean label is required.', '韓国語表示名は必須です。', '韩语显示名为必填。', '韓文顯示名稱為必填。', 'La etiqueta en coreano es obligatoria.', 'Le libelle coreen est obligatoire.', 'Koreanische Bezeichnung ist erforderlich.', 'Rotulo em coreano e obrigatorio.', 'Nhan tieng Han la bat buoc.', 'ต้องระบุชื่อภาษาเกาหลี', 'Label Korea wajib diisi.', 'تسمية الكورية مطلوبة.', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.error_missing_translations', 'admin.master', '번역값이 비어 있습니다: {langs}', 'Missing translation values: {langs}', '翻訳が未入力です: {langs}', '缺少翻译值: {langs}', '缺少翻譯值: {langs}', 'Faltan traducciones: {langs}', 'Traductions manquantes: {langs}', 'Fehlende Uebersetzungen: {langs}', 'Traducoes ausentes: {langs}', 'Thieu ban dich: {langs}', 'ค่าคำแปลขาดหาย: {langs}', 'Terjemahan kosong: {langs}', 'قيم الترجمة مفقودة: {langs}', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.error_target_category_not_found', 'admin.master', '대상 카테고리를 찾을 수 없습니다.', 'Target category not found.', '対象カテゴリが見つかりません。', '找不到目标分类。', '找不到目標分類。', 'No se encontro la categoria objetivo.', 'Categorie cible introuvable.', 'Zielkategorie wurde nicht gefunden.', 'Categoria alvo nao encontrada.', 'Khong tim thay danh muc muc tieu.', 'ไม่พบหมวดหมู่เป้าหมาย', 'Kategori target tidak ditemukan.', 'تعذر العثور على الفئة المستهدفة.', 1, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'admin.master.error_select_parent_first', 'admin.master', '상위 레벨을 먼저 선택해주세요.', 'Select the parent level first.', '先に上位レベルを選択してください。', '请先选择上级层级。', '請先選擇上層層級。', 'Seleccione primero el nivel superior.', 'Selectionnez d''abord le niveau parent.', 'Bitte zuerst die uebergeordnete Ebene waehlen.', 'Selecione primeiro o nivel pai.', 'Vui long chon cap cha truoc.', 'กรุณาเลือกระดับแม่ก่อน', 'Pilih level induk terlebih dahulu.', 'يرجى اختيار المستوى الاب اولا.', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko = excluded.ko,
  en = excluded.en,
  ja = excluded.ja,
  zh_cn = excluded.zh_cn,
  zh_tw = excluded.zh_tw,
  es = excluded.es,
  fr = excluded.fr,
  de = excluded.de,
  pt = excluded.pt,
  vi = excluded.vi,
  th = excluded.th,
  id_lang = excluded.id_lang,
  ar = excluded.ar,
  is_active = 1,
  updated_at = datetime('now');

-- master/admin.master 번역 컬럼 공란 보정 (13개 언어)
UPDATE i18n_translations
SET
  en      = COALESCE(NULLIF(en, ''), ko),
  ja      = COALESCE(NULLIF(ja, ''), en, ko),
  zh_cn   = COALESCE(NULLIF(zh_cn, ''), en, ko),
  zh_tw   = COALESCE(NULLIF(zh_tw, ''), en, ko),
  es      = COALESCE(NULLIF(es, ''), en, ko),
  fr      = COALESCE(NULLIF(fr, ''), en, ko),
  de      = COALESCE(NULLIF(de, ''), en, ko),
  pt      = COALESCE(NULLIF(pt, ''), en, ko),
  vi      = COALESCE(NULLIF(vi, ''), en, ko),
  th      = COALESCE(NULLIF(th, ''), en, ko),
  id_lang = COALESCE(NULLIF(id_lang, ''), en, ko),
  ar      = COALESCE(NULLIF(ar, ''), en, ko),
  updated_at = datetime('now')
WHERE key LIKE 'master.%'
   OR key LIKE 'admin.master.%';

