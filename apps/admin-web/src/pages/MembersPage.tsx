import { useEffect, useMemo, useState } from 'react';
import { api, type MasterItem, type MemberRecord, type MemberSummary } from '../lib/api';
import { useI18n, useT } from '../lib/i18n';

function normalizeCertifications(value: string[] | string | undefined | null): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

const OAUTH_BADGE: Record<string, { icon: string; color: string; bg: string }> = {
  email: { icon: '\u{1F4E7}', color: '#555', bg: '#f0f0f0' },
  google: { icon: 'G', color: '#fff', bg: '#4285F4' },
  apple: { icon: '\uF8FF', color: '#fff', bg: '#333' },
  kakao: { icon: 'K', color: '#3C1E1E', bg: '#FEE500' },
};

function OAuthBadge({ provider, label }: { provider: string; label: string }) {
  const cfg = OAUTH_BADGE[provider] || OAUTH_BADGE.email;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap',
    }}>
      {provider === 'google' ? <span style={{ fontFamily: 'sans-serif', fontWeight: 700 }}>G</span>
        : provider === 'apple' ? <span style={{ fontSize: 13 }}>{'\uF8FF'}</span>
        : provider === 'kakao' ? <span style={{ fontWeight: 800 }}>K</span>
        : <span>{'\u{2709}'}</span>}
      {label}
    </span>
  );
}

export default function MembersPage() {
  const t = useT();
  const { lang } = useI18n();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [summary, setSummary] = useState<MemberSummary>({ total_members: 0, new_members: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [l1Options, setL1Options] = useState<MasterItem[]>([]);
  const [l2Options, setL2Options] = useState<MasterItem[]>([]);
  const [petTypeL1Options, setPetTypeL1Options] = useState<MasterItem[]>([]);
  const [petTypeL2Options, setPetTypeL2Options] = useState<MasterItem[]>([]);
  const [l3Options, setL3Options] = useState<MasterItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MemberRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    nickname: '',
    phone: '',
    address_line: '',
    preferred_language: '',
    role: 'guardian' as 'guardian' | 'provider' | 'admin',
    business_category_l1_id: '',
    business_category_l2_id: '',
    business_category_l3_id: '',
    pet_type_l1_id: '',
    pet_type_l2_id: '',
    business_registration_no: '',
    operating_hours: '',
    certifications: '',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.members.list({
        q: search || undefined,
        role: roleFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setMembers(data.members || []);
      setSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.members.err_load', 'Failed to load members'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadL1() {
      try {
        const rows = await api.master.public.items('business_category', null, lang, { item_level: 'l1' });
        if (mounted) setL1Options(rows);
      } catch {
        if (mounted) setL1Options([]);
      }
    }
    async function loadPetTypeL1() {
      try {
        const rows = await api.master.public.items('pet_type', null, lang);
        if (mounted) setPetTypeL1Options(rows);
      } catch {
        if (mounted) setPetTypeL1Options([]);
      }
    }
    void loadL1();
    void loadPetTypeL1();
    return () => { mounted = false; };
  }, [lang]);

  useEffect(() => {
    if (!form.business_category_l1_id) {
      setL2Options([]);
      return;
    }
    let mounted = true;
    async function loadL2() {
      try {
        const rows = await api.master.public.items('business_category', form.business_category_l1_id, lang, { item_level: 'l2' });
        if (mounted) setL2Options(rows);
      } catch {
        if (mounted) setL2Options([]);
      }
    }
    void loadL2();
    return () => { mounted = false; };
  }, [form.business_category_l1_id, lang]);

  useEffect(() => {
    if (!form.pet_type_l1_id) {
      setPetTypeL2Options([]);
      return;
    }
    let mounted = true;
    async function loadPetL2() {
      try {
        const rows = await api.master.public.items('pet_type', form.pet_type_l1_id, lang);
        if (mounted) setPetTypeL2Options(rows);
      } catch {
        if (mounted) setPetTypeL2Options([]);
      }
    }
    void loadPetL2();
    return () => { mounted = false; };
  }, [form.pet_type_l1_id, lang]);

  useEffect(() => {
    if (!form.business_category_l1_id || !form.pet_type_l1_id || !form.pet_type_l2_id) {
      setL3Options([]);
      return;
    }
    let mounted = true;
    async function loadL3() {
      try {
        const rows = await api.master.public.items('business_category', null, lang, {
          item_level: 'l3_style',
          business_category_l1_id: form.business_category_l1_id,
          pet_type_l1_id: form.pet_type_l1_id,
          pet_type_l2_id: form.pet_type_l2_id,
        });
        if (mounted) setL3Options(rows);
      } catch {
        if (mounted) setL3Options([]);
      }
    }
    void loadL3();
    return () => { mounted = false; };
  }, [form.business_category_l1_id, form.pet_type_l1_id, form.pet_type_l2_id, lang]);

  const roleLabel = useMemo(() => ({
    guardian: t('admin.members.role.guardian', '보호자'),
    provider: t('admin.members.role.provider', '업종회원'),
    admin: t('admin.members.role.admin', '관리자'),
  }), [t]);

  const oauthLabel = useMemo(() => ({
    email: t('admin.members.oauth.email', '이메일'),
    google: t('admin.members.oauth.google', '구글'),
    apple: t('admin.members.oauth.apple', '애플'),
    kakao: t('admin.members.oauth.kakao', '카카오'),
  }), [t]);

  function openMember(member: MemberRecord) {
    setSelectedMember(member);
    setForm({
      full_name: member.full_name || '',
      nickname: member.nickname || '',
      phone: member.phone || '',
      address_line: member.address_line || '',
      preferred_language: member.preferred_language || '',
      role: member.role,
      business_category_l1_id: member.business_category_l1_id || '',
      business_category_l2_id: member.business_category_l2_id || '',
      business_category_l3_id: member.business_category_l3_id || '',
      pet_type_l1_id: member.pet_type_l1_id || '',
      pet_type_l2_id: member.pet_type_l2_id || '',
      business_registration_no: member.business_registration_no || '',
      operating_hours: member.operating_hours || '',
      certifications: normalizeCertifications(member.certifications).join(', '),
    });
  }

  async function saveMember() {
    if (!selectedMember) return;
    setSaving(true);
    setError('');
    try {
      const updatePayload = {
        ...form,
        certifications: form.certifications.split(',').map((item) => item.trim()).filter(Boolean),
        business_category_l1_id: form.business_category_l1_id || null,
        business_category_l2_id: form.business_category_l2_id || null,
        business_category_l3_id: form.business_category_l3_id || null,
        pet_type_l1_id: form.pet_type_l1_id || null,
        pet_type_l2_id: form.pet_type_l2_id || null,
      };
      await api.members.update(selectedMember.id, updatePayload);
      // Optimistic update: apply role change to local state immediately
      setMembers((prev) => prev.map((m) =>
        m.id === selectedMember.id ? { ...m, role: form.role, full_name: form.full_name, nickname: form.nickname } : m
      ));
      setSuccess(t('admin.members.success.updated', '회원 정보가 업데이트되었습니다.'));
      setSelectedMember(null);
      // Full re-fetch in background for label consistency
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.members.err_update', 'Failed to update member'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      const result = await api.members.delete(deleteTarget.id);
      if (result.action === 'deactivated') {
        setSuccess(t('admin.members.success.deactivated', '회원이 비활성화되었습니다.'));
      } else {
        setSuccess(t('admin.members.success.deleted', '회원이 삭제되었습니다.'));
      }
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.members.err_delete', 'Failed to delete member'));
    } finally {
      setDeleting(false);
    }
  }

  async function decide(applicationId: string, action: 'approve' | 'reject') {
    try {
      await api.members.decideRoleApplication(applicationId, action);
      setSuccess(t(action === 'approve' ? 'admin.members.success.approved' : 'admin.members.success.rejected'));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.members.err_update_app', 'Failed to update application'));
    }
  }

  const bd = summary.total_breakdown || { email: 0, google: 0, apple: 0, kakao: 0 };
  const nbd = summary.new_breakdown || { email: 0, google: 0, apple: 0, kakao: 0 };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('admin.members.title', '회원 관리')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Summary cards with oauth breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div className="card">
            <div className="card-body">
              <div className="text-muted">{t('admin.members.summary.total', '전체 회원 수')}</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{summary.total_members}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{'\u{2709}'} {t('admin.members.summary.breakdown.email', '이메일')} <b>{bd.email}</b></span>
                <span style={{ color: '#FEE500', textShadow: '0 0 1px #000' }}>{'\u{25CF}'} {t('admin.members.summary.breakdown.kakao', '카카오')} <b style={{ color: 'var(--text)' }}>{bd.kakao}</b></span>
                <span style={{ color: '#4285F4' }}>{'\u{25CF}'} {t('admin.members.summary.breakdown.google', '구글')} <b style={{ color: 'var(--text)' }}>{bd.google}</b></span>
                <span>{'\uF8FF'} {t('admin.members.summary.breakdown.apple', '애플')} <b>{bd.apple}</b></span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-muted">{t('admin.members.summary.new', '신규 가입자 수')}</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{summary.new_members}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{'\u{2709}'} {t('admin.members.summary.breakdown.email', '이메일')} <b>{nbd.email}</b></span>
                <span style={{ color: '#FEE500', textShadow: '0 0 1px #000' }}>{'\u{25CF}'} {t('admin.members.summary.breakdown.kakao', '카카오')} <b style={{ color: 'var(--text)' }}>{nbd.kakao}</b></span>
                <span style={{ color: '#4285F4' }}>{'\u{25CF}'} {t('admin.members.summary.breakdown.google', '구글')} <b style={{ color: 'var(--text)' }}>{nbd.google}</b></span>
                <span>{'\uF8FF'} {t('admin.members.summary.breakdown.apple', '애플')} <b>{nbd.apple}</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar — single line on desktop */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, alignItems: 'center' }} className="members-filter-row">
              <input className="form-input" style={{ flex: 2, minWidth: 0 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.members.filter.search', '이름 또는 이메일 검색')} />
              <select className="form-select" style={{ flex: 1, minWidth: 0 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">{t('admin.members.filter.role', '역할 필터')}</option>
                <option value="guardian">{roleLabel.guardian}</option>
                <option value="provider">{roleLabel.provider}</option>
                <option value="admin">{roleLabel.admin}</option>
              </select>
              <input className="form-input" style={{ flex: 1, minWidth: 0 }} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <input className="form-input" style={{ flex: 1, minWidth: 0 }} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => void load()}>{t('admin.members.action.apply_filters', '필터 적용')}</button>
            </div>
          </div>
        </div>

        <div className="card">
          {loading && <div className="card-body" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t('admin.common.loading', '로딩 중...')}</div>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('admin.members.col.name', '이름')}</th>
                  <th>{t('admin.members.col.email', '이메일')}</th>
                  <th>{t('admin.members.col.joined_at', '가입일')}</th>
                  <th>{t('admin.members.col.auth_method', '가입방식')}</th>
                  <th>{t('admin.members.col.role', '현재 role')}</th>
                  <th>{t('admin.members.col.category_l1', '업종 L1')}</th>
                  <th>{t('admin.members.col.category_l2', '업종 L2')}</th>
                  <th>{t('admin.members.col.pet_l1', '펫종류 L1')}</th>
                  <th>{t('admin.members.col.pet_l2', '펫종류 L2')}</th>
                  <th>{t('admin.members.col.category_l3', '작업 스타일')}</th>
                  <th>{t('admin.members.col.application', '신청 상태')}</th>
                  <th>{t('admin.common.action', '작업')}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const prov = member.oauth_provider || 'email';
                  return (
                    <tr key={member.id} style={member.status === 'inactive' ? { opacity: 0.5 } : undefined}>
                      <td>
                        {member.full_name || member.nickname || '-'}
                        {member.status === 'inactive' && (
                          <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'var(--text-muted)', color: '#fff' }}>
                            {t('admin.members.status.inactive', '비활성')}
                          </span>
                        )}
                      </td>
                      <td>{member.email}</td>
                      <td>{member.created_at.slice(0, 10)}</td>
                      <td><OAuthBadge provider={prov} label={oauthLabel[prov as keyof typeof oauthLabel] || prov} /></td>
                      <td>{roleLabel[member.role]}</td>
                      <td>{member.business_l1_label || '-'}</td>
                      <td>{member.business_l2_label || '-'}</td>
                      <td>{member.pet_type_l1_label || '-'}</td>
                      <td>{member.pet_type_l2_label || '-'}</td>
                      <td>{member.business_l3_label || '-'}</td>
                      <td>{member.role_application_status || t('admin.members.application.none', '없음')}</td>
                      <td className="td-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openMember(member)}>{t('admin.members.action.edit', '정보 수정')}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(member)}>{t('admin.members.action.delete', '삭제')}</button>
                        {member.role_application_id && member.role_application_status === 'pending' && (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => void decide(member.role_application_id!, 'approve')}>{t('admin.members.action.approve', '승인')}</button>
                            <button className="btn btn-danger btn-sm" onClick={() => void decide(member.role_application_id!, 'reject')}>{t('admin.members.action.reject', '거절')}</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!members.length && (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                      {t('admin.members.empty', '회원 데이터가 없습니다.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedMember(null)}>
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div className="modal-title">{t('admin.members.modal.title', '회원 상세 / role 수정')}</div>
              <button className="modal-close" onClick={() => setSelectedMember(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 12, maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-row col2">
                <div className="form-group"><label className="form-label">{t('admin.members.field.full_name', '이름')}</label><input className="form-input" value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">{t('admin.members.field.nickname', '닉네임')}</label><input className="form-input" value={form.nickname} onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))} /></div>
              </div>
              <div className="form-row col2">
                <div className="form-group"><label className="form-label">{t('admin.members.field.phone', '연락처')}</label><input className="form-input" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">{t('admin.members.field.address', '주소')}</label><input className="form-input" value={form.address_line} onChange={(e) => setForm((prev) => ({ ...prev, address_line: e.target.value }))} /></div>
              </div>
              <div className="form-row col3">
                <div className="form-group">
                  <label className="form-label">{t('admin.members.field.role', 'role')}</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as typeof form.role }))}>
                    <option value="guardian">{roleLabel.guardian}</option>
                    <option value="provider">{roleLabel.provider}</option>
                    <option value="admin">{roleLabel.admin}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.members.field.business_l1', '업종 L1')}</label>
                  <select className="form-select" value={form.business_category_l1_id} onChange={(e) => setForm((prev) => ({ ...prev, business_category_l1_id: e.target.value, business_category_l2_id: '' }))}>
                    <option value="">{t('admin.common.select', '선택...')}</option>
                    {l1Options.map((item) => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.members.field.business_l2', '업종 L2')}</label>
                  <select className="form-select" value={form.business_category_l2_id} onChange={(e) => setForm((prev) => ({ ...prev, business_category_l2_id: e.target.value }))}>
                    <option value="">{t('public.signup.provider_l2_optional', '선택 안 함')}</option>
                    {l2Options.map((item) => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row col3">
                <div className="form-group">
                  <label className="form-label">{t('admin.members.field.pet_l1', '펫종류 L1')}</label>
                  <select className="form-select" value={form.pet_type_l1_id} onChange={(e) => setForm((prev) => ({ ...prev, pet_type_l1_id: e.target.value, pet_type_l2_id: '', business_category_l3_id: '' }))}>
                    <option value="">{t('admin.common.select', '선택...')}</option>
                    {petTypeL1Options.map((item) => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.members.field.pet_l2', '펫종류 L2')}</label>
                  <select className="form-select" value={form.pet_type_l2_id} onChange={(e) => setForm((prev) => ({ ...prev, pet_type_l2_id: e.target.value, business_category_l3_id: '' }))}>
                    <option value="">{t('admin.common.select', '선택...')}</option>
                    {petTypeL2Options.map((item) => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.members.field.business_l3', '작업 스타일')}</label>
                  <select className="form-select" value={form.business_category_l3_id} onChange={(e) => setForm((prev) => ({ ...prev, business_category_l3_id: e.target.value }))}>
                    <option value="">{t('admin.common.select', '선택...')}</option>
                    {l3Options.map((item) => <option key={item.id} value={item.id}>{item.display_label || item.ko || item.key}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row col3">
                <div className="form-group"><label className="form-label">{t('admin.members.field.business_number', '사업자 번호')}</label><input className="form-input" value={form.business_registration_no} onChange={(e) => setForm((prev) => ({ ...prev, business_registration_no: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">{t('admin.members.field.operating_hours', '운영 시간')}</label><input className="form-input" value={form.operating_hours} onChange={(e) => setForm((prev) => ({ ...prev, operating_hours: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">{t('admin.members.field.certifications', '자격증/면허')}</label><input className="form-input" value={form.certifications} onChange={(e) => setForm((prev) => ({ ...prev, certifications: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedMember(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={() => void saveMember()} disabled={saving}>{saving ? t('admin.common.saving', '저장중...') : t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">{t('admin.members.confirm.delete_title', '회원 삭제')}</div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: 20 }}>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <b>{deleteTarget.full_name || deleteTarget.nickname || deleteTarget.email}</b>
              </p>
              <p style={{ margin: '12px 0 0', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {t('admin.members.confirm.delete_msg', '이 회원을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')}
              </p>
              <p style={{ margin: '8px 0 0', lineHeight: 1.6, fontSize: 13, color: 'var(--text-muted)' }}>
                {t('admin.members.confirm.deactivate_msg', '이 회원은 연결된 데이터(반려동물, 기록 등)가 있어 완전 삭제할 수 없습니다. 대신 비활성화 처리합니다.')}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-danger" onClick={() => void confirmDelete()} disabled={deleting}>
                {deleting ? '...' : t('admin.common.confirm', '확인')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .members-filter-row { flex-wrap: wrap !important; }
        }
      `}</style>
    </>
  );
}
