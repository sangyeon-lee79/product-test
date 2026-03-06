import { useEffect, useState, useCallback } from 'react';
import { api, type Country, type Currency } from '../lib/api';
import { useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

const ISO_ALPHA2_CODES = [
  'KR','US','JP','VN','ID','CN','TW','TH','SG','MY','PH','IN','AU','NZ','GB','FR','DE','ES','PT','IT',
  'NL','BE','CH','SE','NO','DK','FI','IE','AT','PL','CZ','HU','RO','GR','TR','AE','SA','QA','KW','EG',
  'ZA','BR','AR','CL','MX','CA','RU','UA','KZ','UZ','PK','BD','LK','NP','MM','KH','LA','MN','HK','MO'
] as const;

const emptyTrans = () => Object.fromEntries(SUPPORTED_LANGS.map(l => [l, ''])) as Record<string, string>;

export default function CountriesPage() {
  const t = useT();
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [tab, setTab] = useState<'countries' | 'currencies'>('countries');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Country modal
  const [countryModal, setCountryModal] = useState<'create' | 'edit' | null>(null);
  const [countryForm, setCountryForm] = useState<{ id?: string; code: string; sort_order: string; default_currency_id: string }>({ code: '', sort_order: '1', default_currency_id: '' });
  const [countryTrans, setCountryTrans] = useState<Record<string, string>>(emptyTrans());
  const [countrySaving, setCountrySaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  // Currency modal
  const [currencyModal, setCurrencyModal] = useState<'create' | 'edit' | null>(null);
  const [currencyForm, setCurrencyForm] = useState<{ id?: string; code: string; symbol: string; name_key: string; decimal_places: string }>({ code: '', symbol: '', name_key: '', decimal_places: '2' });
  const [currencySaving, setCurrencySaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cur] = await Promise.all([api.countries.list(), api.currencies.list()]);
      setCountries(c);
      setCurrencies(cur);
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

  function nextCountrySortOrder(): number {
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
    setCountrySaving(true);
    setError('');
    try {
      const ko = (countryTrans.ko || '').trim();
      if (!countryForm.code) throw new Error('국가 코드를 선택해주세요.');
      if (!ko) throw new Error('한국어 국가명은 필수입니다.');
      if (!countryForm.default_currency_id) throw new Error('기본 통화를 선택해주세요.');

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
          default_currency_id: countryForm.default_currency_id,
        });
        flash(t('admin.countries.success_add_country', '국가가 추가되었습니다.'));
      } else if (countryModal === 'edit' && countryForm.id) {
        await api.countries.update(countryForm.id, {
          sort_order: parseInt(countryForm.sort_order, 10),
          translations,
          default_currency_id: countryForm.default_currency_id,
        });
        flash(t('admin.countries.success_edit', '수정되었습니다.'));
      }
      setCountryModal(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCountrySaving(false);
    }
  }

  async function handleCurrencySave() {
    setCurrencySaving(true);
    setError('');
    try {
      if (currencyModal === 'create') {
        await api.currencies.create({ code: currencyForm.code, symbol: currencyForm.symbol, name_key: currencyForm.name_key, decimal_places: parseInt(currencyForm.decimal_places, 10) });
        flash(t('admin.countries.success_add_currency', '통화가 추가되었습니다.'));
      } else if (currencyModal === 'edit' && currencyForm.id) {
        await api.currencies.update(currencyForm.id, { symbol: currencyForm.symbol, name_key: currencyForm.name_key, decimal_places: parseInt(currencyForm.decimal_places, 10) });
        flash(t('admin.countries.success_edit', '수정되었습니다.'));
      }
      setCurrencyModal(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCurrencySaving(false);
    }
  }

  const generatedCountryKey = countryForm.code ? `country.${countryForm.code.toLowerCase()}` : 'country.<code>';

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🌍 {t('admin.countries.title', '국가 / 통화 관리')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'countries' && (
            <button className="btn btn-primary btn-sm" onClick={() => {
              setCountryForm({ code: '', sort_order: String(nextCountrySortOrder()), default_currency_id: '' });
              setCountryTrans(emptyTrans());
              setCountryModal('create');
            }}>{t('admin.countries.add_country', '+ 국가 추가')}</button>
          )}
          {tab === 'currencies' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setCurrencyForm({ code: '', symbol: '', name_key: '', decimal_places: '2' }); setCurrencyModal('create'); }}>{t('admin.countries.add_currency', '+ 통화 추가')}</button>
          )}
        </div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['countries', 'currencies'] as const).map(tabKey => (
            <button key={tabKey} className={`btn ${tab === tabKey ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(tabKey)}>
              {tabKey === 'countries' ? `🌍 ${t('admin.countries.tab_countries', '국가')}` : `💱 ${t('admin.countries.tab_currencies', '통화')}`}
            </button>
          ))}
        </div>

        {loading ? <div className="loading-center"><span className="spinner" /></div> : (
          <div className="card">
            {tab === 'countries' && (
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
                            setCountryForm({ id: c.id, code: c.code, sort_order: String(c.sort_order), default_currency_id: c.default_currency_id || '' });
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
            )}
            {tab === 'currencies' && (
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>{t('admin.countries.col_code', '코드')}</th>
                    <th>{t('admin.countries.col_symbol', '기호')}</th>
                    <th>{t('admin.countries.col_i18n_key', 'i18n 키')}</th>
                    <th>{t('admin.countries.col_decimal', '소수점')}</th>
                    <th>{t('admin.common.status', '상태')}</th>
                    <th>{t('admin.common.action', '작업')}</th>
                  </tr></thead>
                  <tbody>
                    {currencies.map(c => (
                      <tr key={c.id}>
                        <td><span className="badge badge-blue font-mono">{c.code}</span></td>
                        <td style={{ fontSize: 16 }}>{c.symbol}</td>
                        <td><span className="font-mono text-sm">{c.name_key}</span></td>
                        <td>{c.decimal_places}</td>
                        <td><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setCurrencyForm({ id: c.id, code: c.code, symbol: c.symbol, name_key: c.name_key, decimal_places: String(c.decimal_places) }); setCurrencyModal('edit'); }}>{t('admin.common.edit', '편집')}</button>
                        </td>
                      </tr>
                    ))}
                    {currencies.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>{t('admin.countries.no_currency', '통화 없음')}</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Country Modal */}
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
                  className="form-input"
                  value={countryForm.default_currency_id}
                  onChange={e => setCountryForm(f => ({ ...f, default_currency_id: e.target.value }))}
                >
                  <option value="">-- 기본 통화 선택 --</option>
                  {currencies.filter(c => c.is_active).map(cur => (
                    <option key={cur.id} value={cur.id}>{cur.code} ({cur.symbol})</option>
                  ))}
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
              <button className="btn btn-primary" onClick={() => { void handleCountrySave(); }} disabled={countrySaving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Modal */}
      {currencyModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCurrencyModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{currencyModal === 'create' ? t('admin.countries.modal_create_currency', '통화 추가') : t('admin.countries.modal_edit_currency', '통화 수정')}</div>
              <button className="modal-close" onClick={() => setCurrencyModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">{t('admin.countries.field_country_code', '통화 코드 * (ISO 4217)')}</label>
                  <input className="form-input font-mono" value={currencyForm.code} disabled={currencyModal === 'edit'} onChange={e => setCurrencyForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="KRW, USD..." maxLength={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.countries.field_symbol', '기호 *')}</label>
                  <input className="form-input" value={currencyForm.symbol} onChange={e => setCurrencyForm(f => ({ ...f, symbol: e.target.value }))} placeholder="₩, $, ¥..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.countries.field_i18n_key', 'i18n 키 *')}</label>
                <input className="form-input font-mono" value={currencyForm.name_key} onChange={e => setCurrencyForm(f => ({ ...f, name_key: e.target.value }))} placeholder="currency.krw" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.countries.field_decimal_places', '소수점 자리수')}</label>
                <input className="form-input" type="number" min={0} max={4} value={currencyForm.decimal_places} onChange={e => setCurrencyForm(f => ({ ...f, decimal_places: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCurrencyModal(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={() => { void handleCurrencySave(); }} disabled={currencySaving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
