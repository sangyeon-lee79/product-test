import { useEffect, useState, useCallback } from 'react';
import { api, type I18nRow } from '../lib/api';
import { useT } from '../lib/i18n';

const LANGS = ['ko','en','ja','zh_cn','zh_tw','es','fr','de','pt','vi','th','id_lang','ar'] as const;
const LANG_LABELS: Record<string, string> = {
  ko:'한국어', en:'English', ja:'日本語', zh_cn:'中文(简)', zh_tw:'中文(繁)',
  es:'Español', fr:'Français', de:'Deutsch', pt:'Português', vi:'Tiếng Việt',
  th:'ภาษาไทย', id_lang:'Bahasa Indonesia', ar:'العربية',
};

const EMPTY_FORM = (): Partial<I18nRow> & { key: string; page: string } => ({ key: '', page: '' });

export default function I18nPage() {
  const t = useT();
  const [rows, setRows] = useState<I18nRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [prefix, setPrefix] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<I18nRow>>(EMPTY_FORM());
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await api.i18n.list({ page, prefix: prefix || undefined, limit: LIMIT, active_only: activeOnly || undefined });
      setRows(r.items); setTotal(r.total);
    } catch (e) { setError(e instanceof Error ? e.message : t('common.err.unknown', 'Error')); }
    finally { setLoading(false); }
  }, [page, prefix, activeOnly]);

  useEffect(() => { void load(); }, [load]);

  function openCreate() { setForm(EMPTY_FORM()); setModal('create'); setError(''); }
  function openEdit(row: I18nRow) { setForm({ ...row }); setModal('edit'); setError(''); }
  function closeModal() { setModal(null); setForm(EMPTY_FORM()); }

  async function handleAutoTranslate() {
    const text = form.ko;
    if (!text) { alert(t('admin.i18n.translate_hint', '한국어 원문을 먼저 입력해주세요.')); return; }
    
    setTranslating(true); setError('');
    try {
      const { translations } = await api.i18n.translate(text, form as Record<string, string>);
      setForm((f) => {
        const next = { ...f } as Record<string, string | number | undefined>;
        for (const lang of LANGS) {
          if (lang === 'ko') continue;
          const existing = String((next[lang] as string | undefined) ?? '').trim();
          if (existing) continue;
          const translated = translations[lang];
          if (translated) next[lang] = translated;
        }
        return next as Partial<I18nRow>;
      });
    } catch (e) { setError(e instanceof Error ? e.message : t('admin.i18n.err_translation', 'Translation Error')); }
    finally { setTranslating(false); }
  }

  async function handleSave() {
    setSaving(true); setError('');
    try {
      if (modal === 'create') {
        await api.i18n.create(form);
        setSuccess(t('admin.i18n.success_create', '번역 키가 추가되었습니다.'));
      } else if (modal === 'edit' && form.id) {
        await api.i18n.update(form.id, form);
        setSuccess(t('admin.i18n.success_edit', '번역이 수정되었습니다.'));
      }
      closeModal(); void load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : t('common.err.unknown', 'Error')); }
    finally { setSaving(false); }
  }

  async function handleDeactivate(id: string) {
    if (!confirm(t('admin.i18n.confirm_deactivate', '이 번역 키를 비활성화하시겠습니까?'))) return;
    try {
      await api.i18n.deactivate(id);
      setSuccess(t('admin.i18n.success_deactivate', '비활성화되었습니다.')); void load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : t('common.err.unknown', 'Error')); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🌐 {t('admin.i18n.title', '언어 관리 (i18n)')}</div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>{t('admin.i18n.add_btn', '+ 번역 키 추가')}</button>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          <div className="card-header">
            <div className="filters" style={{ margin: 0 }}>
              <input className="form-input" placeholder={t('admin.i18n.search_prefix', '키 접두사 검색')} value={prefix}
                onChange={e => { setPrefix(e.target.value); setPage(1); }} style={{ width: 240 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input type="checkbox" checked={activeOnly} onChange={e => { setActiveOnly(e.target.checked); setPage(1); }} />
                {t('admin.i18n.active_only', '활성만 보기')}
              </label>
              <span className="text-muted text-sm">{t('admin.i18n.total_count', '총')} {total}{t('common.count_suffix', '개')}</span>
            </div>
          </div>
          <div className="table-wrap">
            {loading ? <div className="loading-center"><span className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>{t('admin.i18n.col_key', '키')}</th>
                    <th>{t('admin.i18n.col_page', '페이지')}</th>
                    <th>{t('admin.i18n.col_ko', '한국어')}</th>
                    <th>{t('admin.i18n.col_en', 'English')}</th>
                    <th>{t('admin.common.status', '상태')}</th>
                    <th>{t('admin.common.action', '작업')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id}>
                      <td><span className="font-mono" style={{ fontSize: 12 }}>{row.key}</span></td>
                      <td><span className="text-muted text-sm">{row.page || '-'}</span></td>
                      <td className="truncate" style={{ maxWidth: 200 }}>{row.ko || <span className="text-muted">-</span>}</td>
                      <td className="truncate" style={{ maxWidth: 180 }}>{row.en || <span className="text-muted">-</span>}</td>
                      <td>
                        <span className={`badge ${row.is_active ? 'badge-green' : 'badge-gray'}`}>
                          {row.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}
                        </span>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEdit(row)}>✏️</button>
                          {row.is_active ? (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(row.id)}>{t('admin.common.deactivate', '비활성화')}</button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>{t('admin.common.no_data', '데이터가 없습니다')}</td></tr>}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <div className="pagination">
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p-1)}>{t('admin.common.prev', '이전')}</button>
                <span>{page} / {totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p+1)}>{t('admin.common.next', '다음')}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === 'create' ? t('admin.i18n.modal_create', '번역 키 추가') : t('admin.i18n.modal_edit', '번역 수정')}</div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">{t('admin.i18n.field_key', '키 *')}</label>
                  <input className="form-input font-mono" value={form.key || ''} disabled={modal === 'edit'}
                    onChange={e => setForm(f => ({ ...f, key: e.target.value }))} placeholder="app.title" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.i18n.field_page', '페이지')}</label>
                  <input className="form-input" value={(form as { page?: string }).page || ''}
                    onChange={e => setForm(f => ({ ...f, page: e.target.value }))} placeholder="home, auth, ..." />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', marginBottom: 16 }} />
              {LANGS.map(lang => (
                <div className="form-group" key={lang}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{LANG_LABELS[lang]} <span className="font-mono" style={{ opacity: .5 }}>({lang})</span></span>
                    {lang === 'ko' && (
                      <button className="btn btn-secondary btn-xs" onClick={handleAutoTranslate} disabled={translating || !form.ko}>
                        {translating ? <><span className="spinner" /> {t('admin.i18n.translating', '번역중...')}</> : t('admin.i18n.auto_translate_btn', '✨ 12개국어 자동번역')}
                      </button>
                    )}
                  </label>
                  <input className="form-input" value={(form as Record<string, string>)[lang] || ''}
                    onChange={e => setForm(f => ({ ...f, [lang]: e.target.value }))} />
                </div>
              ))}
              {modal === 'edit' && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))} />
                    {t('admin.i18n.field_active', '활성화')}
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" /> {t('admin.common.saving', '저장중...')}</> : t('admin.common.save', '저장')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
