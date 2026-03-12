-- 094_hardcoded_text_i18n.sql
-- i18n keys for all previously hardcoded frontend text
-- All 13 languages: ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- =====================================================================
-- Explore page
-- =====================================================================
(gen_random_uuid(), 'explore.search_placeholder', 'explore',
 '캡션, 펫 이름, 태그로 검색…', 'Search by caption, pet name, or tag…', 'キャプション、ペット名、タグで検索…', '按标题、宠物名或标签搜索…', '按標題、寵物名或標籤搜尋…', 'Buscar por título, nombre o etiqueta…', 'Rechercher par légende, nom ou tag…', 'Nach Beschreibung, Name oder Tag suchen…', 'Pesquisar por legenda, nome ou tag…', 'Tìm theo chú thích, tên thú cưng hoặc thẻ…', 'ค้นหาด้วยคำบรรยาย ชื่อสัตว์เลี้ยง หรือแท็ก…', 'Cari berdasarkan keterangan, nama hewan, atau tag…', 'البحث بالوصف أو اسم الحيوان أو الوسم…', true, NOW(), NOW()),

(gen_random_uuid(), 'explore.post_count', 'explore',
 '개의 게시물', 'posts', '件の投稿', '篇帖子', '篇貼文', 'publicaciones', 'publications', 'Beiträge', 'publicações', 'bài đăng', 'โพสต์', 'pos', 'منشورات', true, NOW(), NOW()),

(gen_random_uuid(), 'explore.no_results', 'explore',
 '검색 결과가 없습니다', 'No results found', '検索結果がありません', '未找到搜索结果', '未找到搜尋結果', 'Sin resultados', 'Aucun résultat', 'Keine Ergebnisse', 'Nenhum resultado', 'Không tìm thấy kết quả', 'ไม่พบผลลัพธ์', 'Tidak ada hasil', 'لا توجد نتائج', true, NOW(), NOW()),

-- =====================================================================
-- Countries page
-- =====================================================================
(gen_random_uuid(), 'admin.countries.err_select_code', 'admin.countries',
 '국가 코드를 선택해주세요.', 'Please select a country code.', '国コードを選択してください。', '请选择国家代码。', '請選擇國家代碼。', 'Seleccione un código de país.', 'Veuillez sélectionner un code pays.', 'Bitte wählen Sie einen Ländercode.', 'Selecione um código de país.', 'Vui lòng chọn mã quốc gia.', 'กรุณาเลือกรหัสประเทศ', 'Pilih kode negara.', 'يرجى اختيار رمز الدولة.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.err_ko_required', 'admin.countries',
 '한국어 국가명은 필수입니다.', 'Korean country name is required.', '韓国語の国名は必須です。', '韩语国名为必填项。', '韓語國名為必填項。', 'El nombre del país en coreano es obligatorio.', 'Le nom du pays en coréen est obligatoire.', 'Der koreanische Ländername ist erforderlich.', 'O nome do país em coreano é obrigatório.', 'Tên quốc gia bằng tiếng Hàn là bắt buộc.', 'ชื่อประเทศภาษาเกาหลีจำเป็นต้องกรอก', 'Nama negara dalam bahasa Korea wajib diisi.', 'اسم الدولة بالكورية مطلوب.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.err_select_currency', 'admin.countries',
 '기본 통화를 선택해주세요.', 'Please select a default currency.', 'デフォルト通貨を選択してください。', '请选择默认货币。', '請選擇預設貨幣。', 'Seleccione una moneda predeterminada.', 'Veuillez sélectionner une devise par défaut.', 'Bitte wählen Sie eine Standardwährung.', 'Selecione uma moeda padrão.', 'Vui lòng chọn tiền tệ mặc định.', 'กรุณาเลือกสกุลเงินเริ่มต้น', 'Pilih mata uang default.', 'يرجى اختيار العملة الافتراضية.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.select_iso_code', 'admin.countries',
 '-- ISO 3166-1 alpha-2 선택 --', '-- Select ISO 3166-1 alpha-2 --', '-- ISO 3166-1 alpha-2 を選択 --', '-- 选择 ISO 3166-1 alpha-2 --', '-- 選擇 ISO 3166-1 alpha-2 --', '-- Seleccionar ISO 3166-1 alpha-2 --', '-- Sélectionner ISO 3166-1 alpha-2 --', '-- ISO 3166-1 alpha-2 auswählen --', '-- Selecionar ISO 3166-1 alpha-2 --', '-- Chọn ISO 3166-1 alpha-2 --', '-- เลือก ISO 3166-1 alpha-2 --', '-- Pilih ISO 3166-1 alpha-2 --', '-- اختر ISO 3166-1 alpha-2 --', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.select_currency', 'admin.countries',
 '-- 통화 선택 --', '-- Select currency --', '-- 通貨を選択 --', '-- 选择货币 --', '-- 選擇貨幣 --', '-- Seleccionar moneda --', '-- Sélectionner la devise --', '-- Währung auswählen --', '-- Selecionar moeda --', '-- Chọn tiền tệ --', '-- เลือกสกุลเงิน --', '-- Pilih mata uang --', '-- اختر العملة --', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.countries.auto_sort_hint', 'admin.countries',
 '생성 시 자동으로 다음 순서가 부여됩니다.', 'The next sort order will be assigned automatically.', '作成時に次の順番が自動的に割り当てられます。', '创建时将自动分配下一个排序号。', '建立時將自動分配下一個排序號。', 'El siguiente orden se asignará automáticamente.', 'L''ordre suivant sera attribué automatiquement.', 'Die nächste Sortierreihenfolge wird automatisch zugewiesen.', 'A próxima ordem será atribuída automaticamente.', 'Thứ tự tiếp theo sẽ được gán tự động.', 'ลำดับถัดไปจะถูกกำหนดโดยอัตโนมัติ', 'Urutan berikutnya akan ditetapkan secara otomatis.', 'سيتم تعيين الترتيب التالي تلقائيًا.', true, NOW(), NOW()),

-- =====================================================================
-- Common error keys
-- =====================================================================
(gen_random_uuid(), 'common.err.unknown', 'common',
 '오류가 발생했습니다', 'Error', 'エラーが発生しました', '发生错误', '發生錯誤', 'Error', 'Erreur', 'Fehler', 'Erro', 'Đã xảy ra lỗi', 'เกิดข้อผิดพลาด', 'Terjadi kesalahan', 'حدث خطأ', true, NOW(), NOW()),

(gen_random_uuid(), 'common.scroll_left', 'common',
 '왼쪽으로 스크롤', 'Scroll left', '左にスクロール', '向左滚动', '向左滾動', 'Desplazar a la izquierda', 'Défiler à gauche', 'Nach links scrollen', 'Rolar para a esquerda', 'Cuộn sang trái', 'เลื่อนไปทางซ้าย', 'Geser ke kiri', 'التمرير لليسار', true, NOW(), NOW()),

(gen_random_uuid(), 'common.scroll_right', 'common',
 '오른쪽으로 스크롤', 'Scroll right', '右にスクロール', '向右滚动', '向右滾動', 'Desplazar a la derecha', 'Défiler à droite', 'Nach rechts scrollen', 'Rolar para a direita', 'Cuộn sang phải', 'เลื่อนไปทางขวา', 'Geser ke kanan', 'التمرير لليمين', true, NOW(), NOW()),

(gen_random_uuid(), 'common.sort', 'common',
 '정렬', 'Sort', 'ソート', '排序', '排序', 'Ordenar', 'Trier', 'Sortieren', 'Ordenar', 'Sắp xếp', 'เรียงลำดับ', 'Urutkan', 'ترتيب', true, NOW(), NOW()),

-- =====================================================================
-- I18n page
-- =====================================================================
(gen_random_uuid(), 'admin.i18n.translating', 'admin.i18n',
 '번역중...', 'Translating...', '翻訳中...', '翻译中...', '翻譯中...', 'Traduciendo...', 'Traduction...', 'Übersetze...', 'Traduzindo...', 'Đang dịch...', 'กำลังแปล...', 'Menerjemahkan...', 'جارٍ الترجمة...', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.i18n.auto_translate_btn', 'admin.i18n',
 '✨ 12개국어 자동번역', '✨ Auto-translate 12 languages', '✨ 12言語自動翻訳', '✨ 自动翻译12种语言', '✨ 自動翻譯12種語言', '✨ Traducción automática 12 idiomas', '✨ Traduction auto 12 langues', '✨ 12 Sprachen automatisch übersetzen', '✨ Tradução automática 12 idiomas', '✨ Tự động dịch 12 ngôn ngữ', '✨ แปลอัตโนมัติ 12 ภาษา', '✨ Terjemahan otomatis 12 bahasa', '✨ ترجمة تلقائية 12 لغة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.i18n.total_count', 'admin.i18n',
 '총', 'Total', '合計', '共', '共', 'Total', 'Total', 'Gesamt', 'Total', 'Tổng', 'ทั้งหมด', 'Total', 'الإجمالي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.i18n.err_translation', 'admin.i18n',
 '번역 오류', 'Translation Error', '翻訳エラー', '翻译错误', '翻譯錯誤', 'Error de traducción', 'Erreur de traduction', 'Übersetzungsfehler', 'Erro de tradução', 'Lỗi dịch thuật', 'ข้อผิดพลาดในการแปล', 'Kesalahan terjemahan', 'خطأ في الترجمة', true, NOW(), NOW()),

-- =====================================================================
-- Auth / Signup
-- =====================================================================
(gen_random_uuid(), 'auth.password_hint', 'auth',
 '8자 이상', '8+ characters', '8文字以上', '8个字符以上', '8個字元以上', '8 o más caracteres', '8 caractères ou plus', 'Mindestens 8 Zeichen', '8 ou mais caracteres', '8 ký tự trở lên', '8 ตัวอักษรขึ้นไป', '8 karakter atau lebih', '8 أحرف على الأقل', true, NOW(), NOW()),

-- =====================================================================
-- Members page errors
-- =====================================================================
(gen_random_uuid(), 'admin.members.err_load', 'admin.members',
 '회원 목록을 불러오지 못했습니다', 'Failed to load members', '会員一覧の読み込みに失敗しました', '加载会员列表失败', '載入會員列表失敗', 'Error al cargar miembros', 'Échec du chargement des membres', 'Fehler beim Laden der Mitglieder', 'Falha ao carregar membros', 'Không tải được danh sách thành viên', 'ไม่สามารถโหลดรายชื่อสมาชิกได้', 'Gagal memuat anggota', 'فشل في تحميل الأعضاء', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.members.err_update', 'admin.members',
 '회원 정보 수정에 실패했습니다', 'Failed to update member', '会員情報の更新に失敗しました', '更新会员信息失败', '更新會員資訊失敗', 'Error al actualizar miembro', 'Échec de la mise à jour du membre', 'Fehler beim Aktualisieren des Mitglieds', 'Falha ao atualizar membro', 'Cập nhật thành viên thất bại', 'ไม่สามารถอัปเดตสมาชิกได้', 'Gagal memperbarui anggota', 'فشل في تحديث العضو', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.members.err_delete', 'admin.members',
 '회원 삭제에 실패했습니다', 'Failed to delete member', '会員の削除に失敗しました', '删除会员失败', '刪除會員失敗', 'Error al eliminar miembro', 'Échec de la suppression du membre', 'Fehler beim Löschen des Mitglieds', 'Falha ao excluir membro', 'Xóa thành viên thất bại', 'ไม่สามารถลบสมาชิกได้', 'Gagal menghapus anggota', 'فشل في حذف العضو', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.members.err_update_app', 'admin.members',
 '신청 상태 변경에 실패했습니다', 'Failed to update application', '申請の更新に失敗しました', '更新申请失败', '更新申請失敗', 'Error al actualizar la solicitud', 'Échec de la mise à jour de la demande', 'Fehler beim Aktualisieren des Antrags', 'Falha ao atualizar solicitação', 'Cập nhật đơn thất bại', 'ไม่สามารถอัปเดตคำขอได้', 'Gagal memperbarui pengajuan', 'فشل في تحديث الطلب', true, NOW(), NOW()),

-- =====================================================================
-- Guardian / Health
-- =====================================================================
(gen_random_uuid(), 'guardian.pet_summary', 'guardian',
 '반려동물 프로필 요약', 'Pet profile summary', 'ペットプロフィール概要', '宠物资料概要', '寵物資料概要', 'Resumen del perfil de mascota', 'Résumé du profil animal', 'Haustier-Profilübersicht', 'Resumo do perfil do pet', 'Tóm tắt hồ sơ thú cưng', 'สรุปข้อมูลสัตว์เลี้ยง', 'Ringkasan profil hewan', 'ملخص ملف الحيوان', true, NOW(), NOW()),

(gen_random_uuid(), 'guardian.feeding.supplements_included', 'guardian',
 '포함된 영양제', 'Supplements included', '含まれるサプリメント', '包含的营养品', '包含的營養品', 'Suplementos incluidos', 'Suppléments inclus', 'Enthaltene Ergänzungen', 'Suplementos incluídos', 'Thực phẩm bổ sung', 'อาหารเสริมที่รวม', 'Suplemen yang termasuk', 'المكملات المضمنة', true, NOW(), NOW()),

(gen_random_uuid(), 'guardian.report.err_load', 'guardian',
 '리포트를 불러오지 못했습니다', 'Failed to load report', 'レポートの読み込みに失敗しました', '加载报告失败', '載入報告失敗', 'Error al cargar el informe', 'Échec du chargement du rapport', 'Fehler beim Laden des Berichts', 'Falha ao carregar relatório', 'Không tải được báo cáo', 'ไม่สามารถโหลดรายงานได้', 'Gagal memuat laporan', 'فشل في تحميل التقرير', true, NOW(), NOW()),

-- =====================================================================
-- API Connections page
-- =====================================================================
(gen_random_uuid(), 'admin.api_connections.err_load', 'admin.api_connections',
 '설정을 불러오지 못했습니다', 'Failed to load settings', '設定の読み込みに失敗しました', '加载设置失败', '載入設定失敗', 'Error al cargar la configuración', 'Échec du chargement des paramètres', 'Fehler beim Laden der Einstellungen', 'Falha ao carregar configurações', 'Không tải được cài đặt', 'ไม่สามารถโหลดการตั้งค่าได้', 'Gagal memuat pengaturan', 'فشل في تحميل الإعدادات', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.err_save', 'admin.api_connections',
 '저장에 실패했습니다', 'Failed to save', '保存に失敗しました', '保存失败', '儲存失敗', 'Error al guardar', 'Échec de l''enregistrement', 'Fehler beim Speichern', 'Falha ao salvar', 'Lưu thất bại', 'ไม่สามารถบันทึกได้', 'Gagal menyimpan', 'فشل في الحفظ', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.places_ok', 'admin.api_connections',
 '정상입니다. Google Places 스크립트 로드가 확인되었습니다.', 'OK. Google Places script loaded successfully.', '正常です。Google Placesスクリプトの読み込みが確認されました。', '正常。Google Places 脚本加载成功。', '正常。Google Places 腳本載入成功。', 'OK. Script de Google Places cargado.', 'OK. Script Google Places chargé.', 'OK. Google Places-Skript geladen.', 'OK. Script do Google Places carregado.', 'OK. Tải script Google Places thành công.', 'ปกติ โหลดสคริปต์ Google Places สำเร็จ', 'OK. Skrip Google Places berhasil dimuat.', 'تم. تم تحميل برنامج Google Places.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.places_fail', 'admin.api_connections',
 'Google Places 연결 확인에 실패했습니다.', 'Google Places connection check failed.', 'Google Placesの接続確認に失敗しました。', 'Google Places 连接检查失败。', 'Google Places 連線檢查失敗。', 'Fallo en la verificación de Google Places.', 'Échec de la vérification Google Places.', 'Google Places-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Google Places.', 'Kiểm tra kết nối Google Places thất bại.', 'การตรวจสอบ Google Places ล้มเหลว', 'Gagal memeriksa koneksi Google Places.', 'فشل التحقق من اتصال Google Places.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.oauth_ok', 'admin.api_connections',
 '정상입니다. Google 로그인 스크립트와 Client ID 초기화가 확인되었습니다.', 'OK. Google sign-in script and Client ID initialization confirmed.', '正常です。Googleログインスクリプトの読み込みとClient IDの初期化が確認されました。', '正常。Google 登录脚本和 Client ID 初始化已确认。', '正常。Google 登入腳本和 Client ID 初始化已確認。', 'OK. Script de Google y Client ID inicializados.', 'OK. Script Google et Client ID initialisés.', 'OK. Google-Script und Client-ID initialisiert.', 'OK. Script Google e Client ID inicializados.', 'OK. Xác nhận script đăng nhập Google và Client ID.', 'ปกติ สคริปต์ Google และ Client ID เริ่มต้นสำเร็จ', 'OK. Skrip Google dan Client ID berhasil diinisialisasi.', 'تم. تم التحقق من برنامج Google ومعرف العميل.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.oauth_fail', 'admin.api_connections',
 'Google 로그인 연결 확인에 실패했습니다.', 'Google sign-in connection check failed.', 'Googleログインの接続確認に失敗しました。', 'Google 登录连接检查失败。', 'Google 登入連線檢查失敗。', 'Fallo en la verificación de Google OAuth.', 'Échec de la vérification Google OAuth.', 'Google OAuth-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Google OAuth.', 'Kiểm tra đăng nhập Google thất bại.', 'การตรวจสอบ Google OAuth ล้มเหลว', 'Gagal memeriksa koneksi Google OAuth.', 'فشل التحقق من اتصال Google OAuth.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.sample_text', 'admin.api_connections',
 '테스트 번역', 'Test translation', 'テスト翻訳', '测试翻译', '測試翻譯', 'Traducción de prueba', 'Traduction test', 'Testübersetzung', 'Tradução teste', 'Dịch thử', 'ทดสอบการแปล', 'Terjemahan uji coba', 'ترجمة تجريبية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.translate_ok', 'admin.api_connections',
 '정상입니다. 테스트 번역 결과', 'OK. Test translation result', '正常です。テスト翻訳結果', '正常。测试翻译结果', '正常。測試翻譯結果', 'OK. Resultado de traducción', 'OK. Résultat de traduction', 'OK. Übersetzungsergebnis', 'OK. Resultado da tradução', 'OK. Kết quả dịch thử', 'ปกติ ผลการแปลทดสอบ', 'OK. Hasil terjemahan uji coba', 'تم. نتيجة الترجمة التجريبية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.empty_response', 'admin.api_connections',
 '(빈 응답)', '(empty response)', '(空のレスポンス)', '(空响应)', '(空回應)', '(respuesta vacía)', '(réponse vide)', '(leere Antwort)', '(resposta vazia)', '(phản hồi trống)', '(การตอบกลับว่าง)', '(respons kosong)', '(استجابة فارغة)', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.translate_fail', 'admin.api_connections',
 'Google 번역 연결 확인에 실패했습니다.', 'Google Translate connection check failed.', 'Google翻訳の接続確認に失敗しました。', 'Google 翻译连接检查失败。', 'Google 翻譯連線檢查失敗。', 'Fallo en la verificación de Google Translate.', 'Échec de la vérification Google Translate.', 'Google Translate-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Google Translate.', 'Kiểm tra Google Translate thất bại.', 'การตรวจสอบ Google Translate ล้มเหลว', 'Gagal memeriksa koneksi Google Translate.', 'فشل التحقق من اتصال Google Translate.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.json_loaded', 'admin.api_connections',
 'JSON 파일을 불러왔습니다. 저장 후 연결 확인을 눌러주세요.', 'JSON file loaded. Save and run connection check.', 'JSONファイルを読み込みました。保存後に接続確認を押してください。', 'JSON 文件已加载。保存后请点击连接检查。', 'JSON 檔案已載入。儲存後請點擊連線檢查。', 'Archivo JSON cargado. Guarde y verifique la conexión.', 'Fichier JSON chargé. Enregistrez et vérifiez la connexion.', 'JSON-Datei geladen. Speichern und Verbindung prüfen.', 'Arquivo JSON carregado. Salve e verifique a conexão.', 'Đã tải file JSON. Lưu rồi kiểm tra kết nối.', 'โหลดไฟล์ JSON แล้ว บันทึกแล้วกดตรวจสอบ', 'File JSON dimuat. Simpan lalu periksa koneksi.', 'تم تحميل ملف JSON. احفظ وتحقق من الاتصال.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.json_key_missing', 'admin.api_connections',
 'JSON을 불러왔지만 client_email/private_key를 찾지 못했습니다.', 'JSON loaded but client_email/private_key not found.', 'JSONを読み込みましたがclient_email/private_keyが見つかりません。', 'JSON 已加载但未找到 client_email/private_key。', 'JSON 已載入但未找到 client_email/private_key。', 'JSON cargado pero no se encontraron client_email/private_key.', 'JSON chargé mais client_email/private_key introuvables.', 'JSON geladen, aber client_email/private_key nicht gefunden.', 'JSON carregado mas client_email/private_key não encontrados.', 'Đã tải JSON nhưng không tìm thấy client_email/private_key.', 'โหลด JSON แล้วแต่ไม่พบ client_email/private_key', 'JSON dimuat tapi client_email/private_key tidak ditemukan.', 'تم تحميل JSON لكن لم يتم العثور على client_email/private_key.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.json_read_fail', 'admin.api_connections',
 'JSON 파일을 읽지 못했습니다.', 'Failed to read JSON file.', 'JSONファイルの読み込みに失敗しました。', '无法读取 JSON 文件。', '無法讀取 JSON 檔案。', 'Error al leer el archivo JSON.', 'Échec de la lecture du fichier JSON.', 'JSON-Datei konnte nicht gelesen werden.', 'Falha ao ler arquivo JSON.', 'Không đọc được file JSON.', 'ไม่สามารถอ่านไฟล์ JSON ได้', 'Gagal membaca file JSON.', 'فشل في قراءة ملف JSON.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.hint.places_key', 'admin.api_connections',
 'Google Maps Platform > Credentials에서 만든 API key를 입력합니다.', 'Enter the API key from Google Maps Platform > Credentials.', 'Google Maps Platform > Credentialsで作成したAPIキーを入力します。', '输入 Google Maps Platform > Credentials 中创建的 API 密钥。', '輸入 Google Maps Platform > Credentials 中建立的 API 金鑰。', 'Ingrese la clave API de Google Maps Platform > Credentials.', 'Entrez la clé API de Google Maps Platform > Credentials.', 'Geben Sie den API-Schlüssel von Google Maps Platform > Credentials ein.', 'Insira a chave API do Google Maps Platform > Credentials.', 'Nhập API key từ Google Maps Platform > Credentials.', 'ป้อน API key จาก Google Maps Platform > Credentials', 'Masukkan API key dari Google Maps Platform > Credentials.', 'أدخل مفتاح API من Google Maps Platform > Credentials.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.hint.translate_json', 'admin.api_connections',
 'Cloud Translation API용 서비스계정 JSON 파일을 붙여넣거나 업로드합니다.', 'Paste or upload the service account JSON for Cloud Translation API.', 'Cloud Translation API用のサービスアカウントJSONを貼り付けるかアップロードします。', '粘贴或上传 Cloud Translation API 的服务账户 JSON。', '貼上或上傳 Cloud Translation API 的服務帳戶 JSON。', 'Pegue o cargue el JSON de la cuenta de servicio para Cloud Translation API.', 'Collez ou téléchargez le JSON du compte de service pour Cloud Translation API.', 'Fügen Sie die Service-Account-JSON für Cloud Translation API ein oder laden Sie sie hoch.', 'Cole ou envie o JSON da conta de serviço para Cloud Translation API.', 'Dán hoặc tải lên file JSON tài khoản dịch vụ cho Cloud Translation API.', 'วางหรืออัปโหลด JSON บัญชีบริการสำหรับ Cloud Translation API', 'Tempel atau unggah JSON akun layanan untuk Cloud Translation API.', 'الصق أو ارفع ملف JSON لحساب الخدمة الخاص بـ Cloud Translation API.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.field.service_account_json', 'admin.api_connections',
 '서비스 계정 JSON', 'Service Account JSON', 'サービスアカウントJSON', '服务账户 JSON', '服務帳戶 JSON', 'JSON de cuenta de servicio', 'JSON du compte de service', 'Dienstkonto-JSON', 'JSON da conta de serviço', 'JSON tài khoản dịch vụ', 'JSON บัญชีบริการ', 'JSON akun layanan', 'JSON حساب الخدمة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.btn.load_json', 'admin.api_connections',
 'JSON 파일 불러오기', 'Load JSON file', 'JSONファイルを読み込む', '加载 JSON 文件', '載入 JSON 檔案', 'Cargar archivo JSON', 'Charger le fichier JSON', 'JSON-Datei laden', 'Carregar arquivo JSON', 'Tải file JSON', 'โหลดไฟล์ JSON', 'Muat file JSON', 'تحميل ملف JSON', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.kakao_ok', 'admin.api_connections',
 '정상입니다. Kakao REST API Key가 유효합니다.', 'OK. Kakao REST API Key is valid.', '正常です。Kakao REST APIキーが有効です。', '正常。Kakao REST API Key 有效。', '正常。Kakao REST API Key 有效。', 'OK. Clave Kakao REST API válida.', 'OK. Clé Kakao REST API valide.', 'OK. Kakao REST API-Schlüssel gültig.', 'OK. Chave Kakao REST API válida.', 'OK. Kakao REST API Key hợp lệ.', 'ปกติ Kakao REST API Key ถูกต้อง', 'OK. Kakao REST API Key valid.', 'تم. مفتاح Kakao REST API صالح.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.kakao_fail', 'admin.api_connections',
 'Kakao 연결 확인에 실패했습니다.', 'Kakao connection check failed.', 'Kakaoの接続確認に失敗しました。', 'Kakao 连接检查失败。', 'Kakao 連線檢查失敗。', 'Fallo en la verificación de Kakao.', 'Échec de la vérification Kakao.', 'Kakao-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Kakao.', 'Kiểm tra kết nối Kakao thất bại.', 'การตรวจสอบ Kakao ล้มเหลว', 'Gagal memeriksa koneksi Kakao.', 'فشل التحقق من اتصال Kakao.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.apple_ok', 'admin.api_connections',
 '정상입니다. Apple .p8 키로 JWT 생성이 확인되었습니다.', 'OK. JWT generation with Apple .p8 key confirmed.', '正常です。Apple .p8キーでのJWT生成が確認されました。', '正常。使用 Apple .p8 密钥生成 JWT 已确认。', '正常。使用 Apple .p8 金鑰生成 JWT 已確認。', 'OK. Generación JWT con clave Apple .p8 confirmada.', 'OK. Génération JWT avec clé Apple .p8 confirmée.', 'OK. JWT-Generierung mit Apple .p8-Schlüssel bestätigt.', 'OK. Geração JWT com chave Apple .p8 confirmada.', 'OK. Xác nhận tạo JWT bằng Apple .p8 key.', 'ปกติ ยืนยันการสร้าง JWT ด้วย Apple .p8 key', 'OK. Pembuatan JWT dengan Apple .p8 key dikonfirmasi.', 'تم. تم التحقق من إنشاء JWT بمفتاح Apple .p8.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.test.apple_fail', 'admin.api_connections',
 'Apple 연결 확인에 실패했습니다.', 'Apple connection check failed.', 'Appleの接続確認に失敗しました。', 'Apple 连接检查失败。', 'Apple 連線檢查失敗。', 'Fallo en la verificación de Apple.', 'Échec de la vérification Apple.', 'Apple-Verbindungsprüfung fehlgeschlagen.', 'Falha na verificação do Apple.', 'Kiểm tra kết nối Apple thất bại.', 'การตรวจสอบ Apple ล้มเหลว', 'Gagal memeriksa koneksi Apple.', 'فشل التحقق من اتصال Apple.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.p8_loaded', 'admin.api_connections',
 '.p8 파일을 불러왔습니다. 저장 후 연결 확인을 눌러주세요.', '.p8 file loaded. Save and run connection check.', '.p8ファイルを読み込みました。保存後に接続確認を押してください。', '.p8 文件已加载。保存后请点击连接检查。', '.p8 檔案已載入。儲存後請點擊連線檢查。', 'Archivo .p8 cargado. Guarde y verifique la conexión.', 'Fichier .p8 chargé. Enregistrez et vérifiez.', '.p8-Datei geladen. Speichern und Verbindung prüfen.', 'Arquivo .p8 carregado. Salve e verifique.', 'Đã tải file .p8. Lưu rồi kiểm tra kết nối.', 'โหลดไฟล์ .p8 แล้ว บันทึกแล้วกดตรวจสอบ', 'File .p8 dimuat. Simpan lalu periksa koneksi.', 'تم تحميل ملف .p8. احفظ وتحقق من الاتصال.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.p8_read_fail', 'admin.api_connections',
 '.p8 파일을 읽지 못했습니다.', 'Failed to read .p8 file.', '.p8ファイルの読み込みに失敗しました。', '无法读取 .p8 文件。', '無法讀取 .p8 檔案。', 'Error al leer el archivo .p8.', 'Échec de la lecture du fichier .p8.', '.p8-Datei konnte nicht gelesen werden.', 'Falha ao ler arquivo .p8.', 'Không đọc được file .p8.', 'ไม่สามารถอ่านไฟล์ .p8 ได้', 'Gagal membaca file .p8.', 'فشل في قراءة ملف .p8.', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.api_connections.btn.load_p8', 'admin.api_connections',
 '.p8 파일 불러오기', 'Load .p8 file', '.p8ファイルを読み込む', '加载 .p8 文件', '載入 .p8 檔案', 'Cargar archivo .p8', 'Charger le fichier .p8', '.p8-Datei laden', 'Carregar arquivo .p8', 'Tải file .p8', 'โหลดไฟล์ .p8', 'Muat file .p8', 'تحميل ملف .p8', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.apple.hint.team_id', 'admin.apple',
 'Apple Developer 계정의 Team ID (10자리)', 'Team ID from Apple Developer account (10 characters)', 'Apple Developerアカウントのチーム ID（10桁）', 'Apple Developer 账户的 Team ID（10位）', 'Apple Developer 帳戶的 Team ID（10位）', 'Team ID de la cuenta Apple Developer (10 caracteres)', 'Team ID du compte Apple Developer (10 caractères)', 'Team-ID des Apple Developer-Kontos (10 Zeichen)', 'Team ID da conta Apple Developer (10 caracteres)', 'Team ID từ tài khoản Apple Developer (10 ký tự)', 'Team ID จากบัญชี Apple Developer (10 ตัวอักษร)', 'Team ID dari akun Apple Developer (10 karakter)', 'معرّف الفريق من حساب Apple Developer (10 أحرف)', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.apple.hint.key_id', 'admin.apple',
 'Sign in with Apple용 Key의 Key ID (10자리)', 'Key ID for Sign in with Apple key (10 characters)', 'Sign in with Apple用キーのキー ID（10桁）', 'Sign in with Apple 密钥的 Key ID（10位）', 'Sign in with Apple 金鑰的 Key ID（10位）', 'Key ID de la clave Sign in with Apple (10 caracteres)', 'Key ID de la clé Sign in with Apple (10 caractères)', 'Key-ID des Sign in with Apple-Schlüssels (10 Zeichen)', 'Key ID da chave Sign in with Apple (10 caracteres)', 'Key ID cho Sign in with Apple key (10 ký tự)', 'Key ID สำหรับ Sign in with Apple (10 ตัวอักษร)', 'Key ID untuk Sign in with Apple (10 karakter)', 'معرّف المفتاح لـ Sign in with Apple (10 أحرف)', true, NOW(), NOW())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = NOW();
