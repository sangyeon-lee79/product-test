import { useEffect, useState, useCallback } from 'react';
import { api, type Country, type Currency } from '../lib/api';
import { useT } from '../lib/i18n';

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
  const [countryForm, setCountryForm] = useState<{ id?: string; code: string; name_key: string; sort_order: string }>({ code: '', name_key: '', sort_order: '0' });
  const [saving, setSaving] = useState(false);

  // Currency modal
  const [currencyModal, setCurrencyModal] = useState<'create' | 'edit' | null>(null);
  const [currencyForm, setCurrencyForm] = useState<{ id?: string; code: string; symbol: string; name_key: string; decimal_places: string }>({ code: '', symbol: '', name_key: '', decimal_places: '2' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cur] = await Promise.all([api.countries.list(), api.currencies.list()]);
      setCountries(c); setCurrencies(cur);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }

  async function handleCountrySave() {
    setSaving(true); setError('');
    try {
      if (countryModal === 'create') {
        await api.countries.create({ code: countryForm.code, name_key: countryForm.name_key, sort_order: parseInt(countryForm.sort_order) });
        flash(t('admin.countries.success_add_country', '국가가 추가되었습니다.'));
      } else if (countryModal === 'edit' && countryForm.id) {
        await api.countries.update(countryForm.id, { name_key: countryForm.name_key, sort_order: parseInt(countryForm.sort_order) });
        flash(t('admin.countries.success_edit', '수정되었습니다.'));
      }
      setCountryModal(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function handleCurrencySave() {
    setSaving(true); setError('');
    try {
      if (currencyModal === 'create') {
        await api.currencies.create({ code: currencyForm.code, symbol: currencyForm.symbol, name_key: currencyForm.name_key, decimal_places: parseInt(currencyForm.decimal_places) });
        flash(t('admin.countries.success_add_currency', '통화가 추가되었습니다.'));
      } else if (currencyModal === 'edit' && currencyForm.id) {
        await api.currencies.update(currencyForm.id, { symbol: currencyForm.symbol, name_key: currencyForm.name_key, decimal_places: parseInt(currencyForm.decimal_places) });
        flash(t('admin.countries.success_edit', '수정되었습니다.'));
      }
      setCurrencyModal(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🌍 {t('admin.countries.title', '국가 / 통화 관리')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'countries' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setCountryForm({ code: '', name_key: '', sort_order: '0' }); setCountryModal('create'); }}>{t('admin.countries.add_country', '+ 국가 추가')}</button>
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
                    <th>{t('admin.countries.col_i18n_key', 'i18n 키')}</th>
                    <th>Sort</th>
                    <th>{t('admin.common.status', '상태')}</th>
                    <th>{t('admin.common.action', '작업')}</th>
                  </tr></thead>
                  <tbody>
                    {countries.map(c => (
                      <tr key={c.id}>
                        <td><span className="badge badge-blue font-mono">{c.code}</span></td>
                        <td><span className="font-mono text-sm">{c.name_key}</span></td>
                        <td>{c.sort_order}</td>
                        <td><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setCountryForm({ id: c.id, code: c.code, name_key: c.name_key, sort_order: String(c.sort_order) }); setCountryModal('edit'); }}>{t('admin.common.edit', '편집')}</button>
                        </td>
                      </tr>
                    ))}
                    {countries.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>{t('admin.countries.no_country', '국가 없음')}</td></tr>}
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
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{countryModal === 'create' ? t('admin.countries.modal_create_country', '국가 추가') : t('admin.countries.modal_edit_country', '국가 수정')}</div>
              <button className="modal-close" onClick={() => setCountryModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">{t('admin.countries.field_country_code', '국가 코드 * (ISO 3166-1 alpha-2)')}</label>
                <input className="form-input font-mono" value={countryForm.code} disabled={countryModal === 'edit'} onChange={e => setCountryForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="KR, US, JP..." maxLength={3} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.countries.field_i18n_key', 'i18n 키 *')}</label>
                <input className="form-input font-mono" value={countryForm.name_key} onChange={e => setCountryForm(f => ({ ...f, name_key: e.target.value }))} placeholder="country.kr" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input className="form-input" type="number" value={countryForm.sort_order} onChange={e => setCountryForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCountryModal(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={handleCountrySave} disabled={saving}>{t('admin.common.save', '저장')}</button>
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
              <button className="btn btn-primary" onClick={handleCurrencySave} disabled={saving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
