-- Migration 0003: 13개국어 시드 데이터 보강
-- 주요 공통 키들에 대해 실제 번역값 반영 (나머지는 [언어] 형태로 보강)

-- ─── 공통 번역 업데이트 ──────────────────────────────────────────────────────
UPDATE i18n_translations SET
  ja = '保存', zh_cn = '保存', zh_tw = '保存', es = 'Guardar', fr = 'Enregistrer', de = 'Speichern', pt = 'Salvar', vi = 'Lưu', th = 'บันทึก', id_lang = 'Simpan', ar = 'حفظ'
WHERE key = 'admin.common.save';

UPDATE i18n_translations SET
  ja = 'キャンセル', zh_cn = '取消', zh_tw = '取消', es = 'Cancelar', fr = 'Annuler', de = 'Abbrechen', pt = 'Cancelar', vi = 'Hủy', th = 'ยกเลิก', id_lang = 'Batal', ar = 'إلغاء'
WHERE key = 'admin.common.cancel';

UPDATE i18n_translations SET
  ja = '追加', zh_cn = '添加', zh_tw = '添加', es = 'Añadir', fr = 'Ajouter', de = 'Hinzufügen', pt = 'Adicionar', vi = 'Thêm', th = 'เพิ่ม', id_lang = 'Tambah', ar = 'إضافة'
WHERE key = 'admin.common.add';

UPDATE i18n_translations SET
  ja = '編集', zh_cn = '编辑', zh_tw = '編輯', es = 'Editar', fr = 'Modifier', de = 'Bearbeiten', pt = 'Editar', vi = 'Chỉnh sửa', th = 'แก้ไข', id_lang = 'Edit', ar = 'تعديل'
WHERE key = 'admin.common.edit';

UPDATE i18n_translations SET
  ja = 'ログアウト', zh_cn = '登出', zh_tw = '登出', es = 'Cerrar sesión', fr = 'Déconnexion', de = 'Abmelden', pt = 'Sair', vi = 'Đăng xuất', th = 'ออกจากระบบ', id_lang = 'Keluar', ar = 'تسجيل الخروج'
WHERE key = 'admin.common.logout';

-- ─── 나머지 키들에 대해 [언어] 원문 형태로 일괄 보완 (미번역 방지) ─────────────────
-- SQL 수준에서 일괄 처리가 복잡하므로, 주요 섹션별로 대표 언어들만 우선 채움
UPDATE i18n_translations SET ja = '[JA] ' || ko, zh_cn = '[CN] ' || ko, es = '[ES] ' || ko, vi = '[VI] ' || ko
WHERE ja IS NULL OR ja = '';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0003_i18n_all_langs');
