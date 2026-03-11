-- 059: i18n keys for Members Page enhancements
-- oauth provider labels, delete/deactivate, confirm dialogs, breakdown labels

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active)
VALUES
-- OAuth provider column & badges
(gen_random_uuid()::text, 'admin.members.col.auth_method', 'admin', '가입방식', 'Auth Method', '認証方式', '认证方式', '認證方式', 'Método', 'Méthode', 'Methode', 'Método', 'Phương thức', 'วิธีการ', 'Metode', 'الطريقة', true),
(gen_random_uuid()::text, 'admin.members.oauth.email', 'admin', '이메일', 'Email', 'メール', '邮箱', '電郵', 'Email', 'Email', 'E-Mail', 'Email', 'Email', 'อีเมล', 'Email', 'بريد', true),
(gen_random_uuid()::text, 'admin.members.oauth.google', 'admin', '구글', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'جوجل', true),
(gen_random_uuid()::text, 'admin.members.oauth.apple', 'admin', '애플', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'آبل', true),
(gen_random_uuid()::text, 'admin.members.oauth.kakao', 'admin', '카카오', 'Kakao', 'カカオ', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'كاكاو', true),

-- Delete / Deactivate
(gen_random_uuid()::text, 'admin.members.action.delete', 'admin', '삭제', 'Delete', '削除', '删除', '刪除', 'Eliminar', 'Supprimer', 'Löschen', 'Excluir', 'Xóa', 'ลบ', 'Hapus', 'حذف', true),
(gen_random_uuid()::text, 'admin.members.confirm.delete_title', 'admin', '회원 삭제', 'Delete Member', '会員削除', '删除会员', '刪除會員', 'Eliminar miembro', 'Supprimer membre', 'Mitglied löschen', 'Excluir membro', 'Xóa thành viên', 'ลบสมาชิก', 'Hapus anggota', 'حذف العضو', true),
(gen_random_uuid()::text, 'admin.members.confirm.delete_msg', 'admin', '이 회원을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.', 'Permanently delete this member? This action cannot be undone.', 'この会員を完全に削除しますか？この操作は元に戻せません。', '确定要永久删除此会员吗？此操作无法撤销。', '確定要永久刪除此會員嗎？此操作無法撤銷。', '¿Eliminar permanentemente este miembro?', 'Supprimer définitivement ce membre ?', 'Dieses Mitglied dauerhaft löschen?', 'Excluir permanentemente este membro?', 'Xóa vĩnh viễn thành viên này?', 'ลบสมาชิกนี้ถาวร?', 'Hapus anggota ini secara permanen?', 'هل تريد حذف هذا العضو نهائياً؟', true),
(gen_random_uuid()::text, 'admin.members.confirm.deactivate_msg', 'admin', '이 회원은 연결된 데이터(반려동물, 기록 등)가 있어 완전 삭제할 수 없습니다. 대신 비활성화 처리합니다.', 'This member has associated data (pets, records, etc.) and cannot be fully deleted. They will be deactivated instead.', 'この会員には関連データがあるため完全に削除できません。代わりに非活性化します。', '此会员有关联数据，无法完全删除。将改为停用。', '此會員有關聯資料，無法完全刪除。將改為停用。', 'Este miembro tiene datos asociados. Se desactivará en su lugar.', 'Ce membre a des données associées. Il sera désactivé.', 'Dieses Mitglied hat verknüpfte Daten. Es wird stattdessen deaktiviert.', 'Este membro tem dados associados. Será desativado.', 'Thành viên này có dữ liệu liên quan. Sẽ bị vô hiệu hóa.', 'สมาชิกนี้มีข้อมูลที่เกี่ยวข้อง จะถูกปิดใช้งาน', 'Anggota ini memiliki data terkait. Akan dinonaktifkan.', 'هذا العضو لديه بيانات مرتبطة. سيتم تعطيله بدلاً من ذلك.', true),
(gen_random_uuid()::text, 'admin.members.success.deleted', 'admin', '회원이 삭제되었습니다.', 'Member has been deleted.', '会員が削除されました。', '会员已删除。', '會員已刪除。', 'Miembro eliminado.', 'Membre supprimé.', 'Mitglied gelöscht.', 'Membro excluído.', 'Đã xóa thành viên.', 'ลบสมาชิกแล้ว', 'Anggota dihapus.', 'تم حذف العضو.', true),
(gen_random_uuid()::text, 'admin.members.success.deactivated', 'admin', '회원이 비활성화되었습니다.', 'Member has been deactivated.', '会員が非活性化されました。', '会员已停用。', '會員已停用。', 'Miembro desactivado.', 'Membre désactivé.', 'Mitglied deaktiviert.', 'Membro desativado.', 'Đã vô hiệu hóa thành viên.', 'ปิดใช้งานสมาชิกแล้ว', 'Anggota dinonaktifkan.', 'تم تعطيل العضو.', true),

-- Breakdown labels
(gen_random_uuid()::text, 'admin.members.summary.breakdown.email', 'admin', '이메일', 'Email', 'メール', '邮箱', '電郵', 'Email', 'Email', 'E-Mail', 'Email', 'Email', 'อีเมล', 'Email', 'بريد', true),
(gen_random_uuid()::text, 'admin.members.summary.breakdown.google', 'admin', '구글', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'Google', 'جوجل', true),
(gen_random_uuid()::text, 'admin.members.summary.breakdown.apple', 'admin', '애플', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'Apple', 'آبل', true),
(gen_random_uuid()::text, 'admin.members.summary.breakdown.kakao', 'admin', '카카오', 'Kakao', 'カカオ', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'Kakao', 'كاكاو', true),

-- Confirm dialog
(gen_random_uuid()::text, 'admin.common.confirm', 'admin', '확인', 'Confirm', '確認', '确认', '確認', 'Confirmar', 'Confirmer', 'Bestätigen', 'Confirmar', 'Xác nhận', 'ยืนยัน', 'Konfirmasi', 'تأكيد', true),

-- Status badge
(gen_random_uuid()::text, 'admin.members.status.inactive', 'admin', '비활성', 'Inactive', '非活性', '已停用', '已停用', 'Inactivo', 'Inactif', 'Inaktiv', 'Inativo', 'Không hoạt động', 'ไม่ใช้งาน', 'Nonaktif', 'غير نشط', true)

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang,
  ar = EXCLUDED.ar, is_active = true;
