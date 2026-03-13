import { useEffect, useState, useCallback } from 'react';
import { api, type Store } from '../../lib/api';
import { useI18n, useT } from '../../lib/i18n';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayHours = { open: string; close: string; closed?: boolean };
type OperatingHours = Record<string, DayHours>;
const DEFAULT_HOURS: OperatingHours = Object.fromEntries(
  DAYS.map(d => [d, d === 'sun' ? { open: '09:00', close: '21:00', closed: true } : { open: '09:00', close: '21:00' }])
);
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

const OT_FEE_TYPES = [
  { value: 'free', i18nKey: 'supplier.setting.overtime_fee_free' },
  { value: 'fixed', i18nKey: 'supplier.setting.overtime_fee_fixed' },
  { value: 'per_30min', i18nKey: 'supplier.setting.overtime_fee_per30' },
];

export default function SupplierSettingsSection() {
  const t = useT();
  const { lang } = useI18n();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings form
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({ ...DEFAULT_HOURS });
  const [allowOvertime, setAllowOvertime] = useState(false);
  const [overtimeFeeType, setOvertimeFeeType] = useState('free');
  const [overtimeFeeAmount, setOvertimeFeeAmount] = useState(0);
  const [reviewPublic, setReviewPublic] = useState(true);

  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.stores.my(lang);
      const items = res.items || [];
      setStores(items);
      if (items.length > 0 && !selectedStoreId) {
        setSelectedStoreId(items[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.failed'));
    } finally {
      setLoading(false);
    }
  }, [lang, selectedStoreId]);

  useEffect(() => { void loadStores(); }, [loadStores]);

  // Load settings when store changes
  useEffect(() => {
    if (!selectedStoreId) return;
    const store = stores.find(s => s.id === selectedStoreId);
    if (!store) return;
    setOperatingHours(store.operating_hours ? { ...DEFAULT_HOURS, ...store.operating_hours } : { ...DEFAULT_HOURS });
    setAllowOvertime(!!store.allow_overtime);
    setOvertimeFeeType(store.overtime_fee_type || 'free');
    setOvertimeFeeAmount(store.overtime_fee_amount || 0);
    setReviewPublic(store.review_public !== false);
  }, [selectedStoreId, stores]);

  async function handleSave() {
    if (!selectedStoreId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.stores.settings(selectedStoreId, {
        operatingHours,
        allowOvertime,
        overtimeFeeType,
        overtimeFeeAmount,
        reviewPublic,
      });
      setSuccess(t('common.saved'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.failed'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>...</div>;

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 12 }}>{success}</div>}

      {stores.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>{t('provider.store.no_stores')}</div>
      ) : (
        <>
          {/* Store selector if multiple stores */}
          {stores.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">{t('supplier.settings.select_store')}</label>
              <select
                className="form-select"
                value={selectedStoreId}
                onChange={e => setSelectedStoreId(e.target.value)}
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.display_name || s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Operating hours */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
              {t('supplier.settings.hours_title')}
            </h4>
            <div className="sp-hours-grid">
              {DAYS.map(day => {
                const dh = operatingHours[day] || { open: '09:00', close: '21:00' };
                return (
                  <div key={day} className="sp-hours-row">
                    <input
                      type="checkbox"
                      checked={!dh.closed}
                      onChange={e => setOperatingHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day], closed: !e.target.checked }
                      }))}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <span className="sp-hours-day">{t(`supplier.settings.day.${day}`)}</span>
                    {dh.closed ? (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {t('supplier.settings.closed')}
                      </span>
                    ) : (
                      <span className="sp-hours-time">
                        <select
                          className="form-select"
                          value={dh.open}
                          onChange={e => setOperatingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], open: e.target.value }
                          }))}
                        >
                          {TIME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <span style={{ color: 'var(--text-muted)' }}>~</span>
                        <select
                          className="form-select"
                          value={dh.close}
                          onChange={e => setOperatingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], close: e.target.value }
                          }))}
                        >
                          {TIME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overtime settings */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
              {t('supplier.setting.overtime_title')}
            </h4>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={allowOvertime}
                onChange={e => setAllowOvertime(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              {t('supplier.setting.overtime_allow')}
            </label>

            {allowOvertime && (
              <div style={{ marginLeft: 28, display: 'grid', gap: 10 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13 }}>{t('supplier.setting.overtime_fee')}</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {OT_FEE_TYPES.map(ft => (
                      <button
                        key={ft.value}
                        className={`btn btn-sm ${overtimeFeeType === ft.value ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setOvertimeFeeType(ft.value)}
                      >
                        {t(ft.i18nKey)}
                      </button>
                    ))}
                  </div>
                </div>

                {overtimeFeeType !== 'free' && (
                  <div>
                    <label className="form-label" style={{ fontSize: 13 }}>{t('supplier.settings.overtime_fee_amount')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={overtimeFeeAmount}
                      onChange={e => setOvertimeFeeAmount(Number(e.target.value) || 0)}
                      min={0}
                      style={{ maxWidth: 200 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Review settings */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
              {t('supplier.setting.review_title')}
            </h4>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={reviewPublic}
                onChange={e => setReviewPublic(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              {t('supplier.setting.review_public_on')}
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginLeft: 28 }}>
              {t('supplier.setting.review_public_desc')}
            </p>
          </div>

          {/* Save */}
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? '...' : t('admin.common.save')}
          </button>
        </>
      )}
    </div>
  );
}
