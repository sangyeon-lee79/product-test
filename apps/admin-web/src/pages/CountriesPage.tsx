import { useEffect, useState, useCallback } from 'react';
import { api, type Country } from '../lib/api';
import { useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

const ISO_ALPHA2_CODES = [
  'KR','US','JP','VN','ID','CN','TW','TH','SG','MY','PH','IN','AU','NZ','GB','FR','DE','ES','PT','IT',
  'NL','BE','CH','SE','NO','DK','FI','IE','AT','PL','CZ','HU','RO','GR','TR','AE','SA','QA','KW','EG',
  'ZA','BR','AR','CL','MX','CA','RU','UA','KZ','UZ','PK','BD','LK','NP','MM','KH','LA','MN','HK','MO'
] as const;

const DEFAULT_CURRENCIES = ['KRW','USD','JPY','VND','IDR','EUR','SGD','THB','CNY','TWD','MYR','PHP','GBP','AUD','CAD'] as const;

const emptyTrans = () => Object.fromEntries(SUPPORTED_LANGS.map(l => [l, ''])) as Record<string, string>;

export default function CountriesPage() {
  const t = useT();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [countryModal, setCountryModal] = useState<'create' | 'edit' | null>(null);
  const [countryForm, setCountryForm] = useState<{ id?: string; code: string; sort_order: string; default_currency_code: string }>({
    code: '',
    sort_order: '1',
    default_currency_code: '',
  });
  const [countryTrans, setCountryTrans] = useState<Record<string, string>>(emptyTrans());
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.countries.list();
      setCountries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  function nextSortOrder(): number {
    const maxSort = countries.reduce((max, c) => Math.max(max, c.sort_order), 0);
    return maxSort + 1;
  }

  function getCountryLabel(country: Country): string {
    return country.ko_name?.trim() || country.ko?.trim() || country.code;
  }

  function countryToTranslations(country: Country): Record<string, string> {
    return {
      ko: country.ko ?? country.ko_name ?? '',
      en: country.en ?? '',
      ja: country.ja ?? '',
      zh_cn: country.zh_cn ?? '',
      zh_tw: country.zh_tw ?? '',
      es: country.es ?? '',
      fr: country.fr ?? '',
      de: country.de ?? '',
      pt: country.pt ?? '',
      vi: country.vi ?? '',
      th: country.th ?? '',
      id_lang: country.id_lang ?? '',
      ar: country.ar ?? '',
    };
  }

  async function autoTranslateCountry() {
    const ko = (countryTrans.ko || '').trim();
    if (!ko) return;
    setTranslating(true);
    try {
      const result = await api.i18n.translate(ko, countryTrans);
      const merged: Record<string, string> = { ...countryTrans, ko };
      for (const lang of SUPPORTED_LANGS) {
        if (lang === 'ko') continue;
        if ((countryTrans[lang] || '').trim()) continue;
        const translated = result.translations[lang];
        if (translated) merged[lang] = translated;
      }
      setCountryTrans(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setTranslating(false);
    }
  }

  async function handleCountrySave() {
    setSaving(true);
    setError('');
    try {
      const ko = (countryTrans.ko || '').trim();
      if (!countryForm.code) throw new Error('국가 코드를 선택해주세요.');
      if (!ko) throw new Error('한국어 국가명은 필수입니다.');
      if (!countryForm.default_currency_code) throw new Error('기본 통화를 선택해주세요.');

      let translations: Record<string, string> = { ...countryTrans, ko };
      const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
      if (hasMissing) {
        const result = await api.i18n.translate(ko, translations);
        translations = {
          ...result.translations,
          ...translations,
          ko,
        };
      }

      if (countryModal === 'create') {
        await api.countries.create({
          code: countryForm.code,
          translations,
          default_currency_code: countryForm.default_currency_code,
        });
        flash(t('admin.countries.success_add_country', '국가가 추가되었습니다.'));
      } else if (countryModal === 'edit' && countryForm.id) {
        await api.countries.update(countryForm.id, {
          sort_order: parseInt(countryForm.sort_order, 10),
          translations,
          default_currency_code: countryForm.default_currency_code,
        });
        flash(t('admin.countries.success_edit', '수정되었습니다.'));
      }
      setCountryModal(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  const generatedCountryKey = countryForm.code ? `country.${countryForm.code.toLowerCase()}` : 'country.<code>';

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🌍 {t('admin.countries.title', '국가 관리')}</div>
        <button className="btn btn-primary btn-sm" onClick={() => {
          setCountryForm({ code: '', sort_order: String(nextSortOrder()), default_currency_code: '' });
          setCountryTrans(emptyTrans());
          setCountryModal('create');
        }}>{t('admin.countries.add_country', '+ 국가 추가')}</button>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? <div className="loading-center"><span className="spinner" /></div> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>{t('admin.countries.col_code', '코드')}</th>
                  <th>{t('admin.countries.col_country_name', '국가명')}</th>
                  <th>{t('admin.countries.col_default_currency', '기본 통화')}</th>
                  <th>{t('admin.countries.col_i18n_key', 'i18n 키')}</th>
                  <th>Sort</th>
                  <th>{t('admin.common.status', '상태')}</th>
                  <th>{t('admin.common.action', '작업')}</th>
                </tr></thead>
                <tbody>
                  {countries.map(c => (
                    <tr key={c.id}>
                      <td><span className="badge badge-blue font-mono">{c.code}</span></td>
                      <td style={{ fontWeight: 500 }}>{getCountryLabel(c)}</td>
                      <td><span className="badge badge-gray font-mono">{c.default_currency_code || '-'}</span></td>
                      <td><span className="font-mono text-sm">{c.name_key}</span></td>
                      <td>{c.sort_order}</td>
                      <td><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          setCountryForm({
                            id: c.id,
                            code: c.code,
                            sort_order: String(c.sort_order),
                            default_currency_code: c.default_currency_code || '',
                          });
                          setCountryTrans(countryToTranslations(c));
                          setCountryModal('edit');
                        }}>{t('admin.common.edit', '편집')}</button>
                      </td>
                    </tr>
                  ))}
                  {countries.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>{t('admin.countries.no_country', '국가 없음')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {countryModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCountryModal(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">{countryModal === 'create' ? t('admin.countries.modal_create_country', '국가 추가') : t('admin.countries.modal_edit_country', '국가 수정')}</div>
              <button className="modal-close" onClick={() => setCountryModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">{t('admin.countries.field_country_code', '국가 코드')} *</label>
                <select
                  className="form-input font-mono"
                  value={countryForm.code}
                  disabled={countryModal === 'edit'}
                  onChange={e => setCountryForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                >
                  <option value="">-- ISO 3166-1 alpha-2 선택 --</option>
                  {ISO_ALPHA2_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.countries.field_default_currency', '기본 통화')} *</label>
                <select
                  className="form-input font-mono"
                  value={countryForm.default_currency_code}
                  onChange={e => setCountryForm(f => ({ ...f, default_currency_code: e.target.value.toUpperCase() }))}
                >
                  <option value="">-- 통화 선택 --</option>
                  {DEFAULT_CURRENCIES.map(code => <option key={code} value={code}>{code}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.countries.field_i18n_key', 'i18n 키')}</label>
                <input className="form-input font-mono" value={generatedCountryKey} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input
                  className="form-input"
                  type="number"
                  value={countryForm.sort_order}
                  readOnly={countryModal === 'create'}
                  onChange={e => setCountryForm(f => ({ ...f, sort_order: e.target.value }))}
                />
                {countryModal === 'create' && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>생성 시 자동으로 다음 순서가 부여됩니다.</div>}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.translations', '표시명 (13개국어)')}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => { void autoTranslateCountry(); }} disabled={translating || !countryTrans.ko}>
                    {translating ? '...' : t('admin.master.auto_translate', '🌐 한국어 기준 자동번역')}
                  </button>
                </div>
                {SUPPORTED_LANGS.map(lang => (
                  <div key={lang} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: lang === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                      {LANG_LABELS[lang]}{lang === 'ko' ? ' *' : ''}
                    </label>
                    <input
                      className="form-input"
                      style={{ fontSize: 13 }}
                      value={countryTrans[lang] ?? ''}
                      onChange={e => setCountryTrans(f => ({ ...f, [lang]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCountryModal(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={() => { void handleCountrySave(); }} disabled={saving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
