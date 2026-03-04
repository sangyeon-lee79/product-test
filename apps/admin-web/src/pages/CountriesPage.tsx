import { useEffect, useState, useCallback } from 'react';
import { api, type Country, type Currency } from '../lib/api';

export default function CountriesPage() {
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
        flash('국가가 추가되었습니다.');
      } else if (countryModal === 'edit' && countryForm.id) {
        await api.countries.update(countryForm.id, { name_key: countryForm.name_key, sort_order: parseInt(countryForm.sort_order) });
        flash('수정되었습니다.');
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
        flash('통화가 추가되었습니다.');
      } else if (currencyModal === 'edit' && currencyForm.id) {
        await api.currencies.update(currencyForm.id, { symbol: currencyForm.symbol, name_key: currencyForm.name_key, decimal_places: parseInt(currencyForm.decimal_places) });
        flash('수정되었습니다.');
      }
      setCurrencyModal(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🌍 국가 / 통화 관리</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'countries' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setCountryForm({ code: '', name_key: '', sort_order: '0' }); setCountryModal('create'); }}>+ 국가 추가</button>
          )}
          {tab === 'currencies' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setCurrencyForm({ code: '', symbol: '', name_key: '', decimal_places: '2' }); setCurrencyModal('create'); }}>+ 통화 추가</button>
          )}
        </div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['countries', 'currencies'] as const).map(t => (
            <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>
              {t === 'countries' ? '🌍 국가' : '💱 통화'}
            </button>
          ))}
        </div>

        {loading ? <div className="loading-center"><span className="spinner" /></div> : (
          <div className="card">
            {tab === 'countries' && (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>코드</th><th>i18n 키</th><th>Sort</th><th>상태</th><th>작업</th></tr></thead>
                  <tbody>
                    {countries.map(c => (
                      <tr key={c.id}>
                        <td><span className="badge badge-blue font-mono">{c.code}</span></td>
                        <td><span className="font-mono text-sm">{c.name_key}</span></td>
                        <td>{c.sort_order}</td>
                        <td><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? '활성' : '비활성'}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setCountryForm({ id: c.id, code: c.code, name_key: c.name_key, sort_order: String(c.sort_order) }); setCountryModal('edit'); }}>편집</button>
                        </td>
                      </tr>
                    ))}
                    {countries.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>국가 없음</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
            {tab === 'currencies' && (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>코드</th><th>기호</th><th>i18n 키</th><th>소수점</th><th>상태</th><th>작업</th></tr></thead>
                  <tbody>
                    {currencies.map(c => (
                      <tr key={c.id}>
                        <td><span className="badge badge-blue font-mono">{c.code}</span></td>
                        <td style={{ fontSize: 16 }}>{c.symbol}</td>
                        <td><span className="font-mono text-sm">{c.name_key}</span></td>
                        <td>{c.decimal_places}</td>
                        <td><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? '활성' : '비활성'}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setCurrencyForm({ id: c.id, code: c.code, symbol: c.symbol, name_key: c.name_key, decimal_places: String(c.decimal_places) }); setCurrencyModal('edit'); }}>편집</button>
                        </td>
                      </tr>
                    ))}
                    {currencies.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>통화 없음</td></tr>}
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
              <div className="modal-title">{countryModal === 'create' ? '국가 추가' : '국가 수정'}</div>
              <button className="modal-close" onClick={() => setCountryModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">국가 코드 * (ISO 3166-1 alpha-2)</label>
                <input className="form-input font-mono" value={countryForm.code} disabled={countryModal === 'edit'} onChange={e => setCountryForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="KR, US, JP..." maxLength={3} />
              </div>
              <div className="form-group">
                <label className="form-label">i18n 키 *</label>
                <input className="form-input font-mono" value={countryForm.name_key} onChange={e => setCountryForm(f => ({ ...f, name_key: e.target.value }))} placeholder="country.kr" />
              </div>
              <div className="form-group">
                <label className="form-label">정렬 순서</label>
                <input className="form-input" type="number" value={countryForm.sort_order} onChange={e => setCountryForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCountryModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleCountrySave} disabled={saving}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Modal */}
      {currencyModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCurrencyModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{currencyModal === 'create' ? '통화 추가' : '통화 수정'}</div>
              <button className="modal-close" onClick={() => setCurrencyModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">통화 코드 * (ISO 4217)</label>
                  <input className="form-input font-mono" value={currencyForm.code} disabled={currencyModal === 'edit'} onChange={e => setCurrencyForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="KRW, USD..." maxLength={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">기호 *</label>
                  <input className="form-input" value={currencyForm.symbol} onChange={e => setCurrencyForm(f => ({ ...f, symbol: e.target.value }))} placeholder="₩, $, ¥..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">i18n 키 *</label>
                <input className="form-input font-mono" value={currencyForm.name_key} onChange={e => setCurrencyForm(f => ({ ...f, name_key: e.target.value }))} placeholder="currency.krw" />
              </div>
              <div className="form-group">
                <label className="form-label">소수점 자리수</label>
                <input className="form-input" type="number" min={0} max={4} value={currencyForm.decimal_places} onChange={e => setCurrencyForm(f => ({ ...f, decimal_places: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCurrencyModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleCurrencySave} disabled={saving}>저장</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
