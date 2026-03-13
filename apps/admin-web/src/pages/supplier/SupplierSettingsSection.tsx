import { useEffect, useState, useCallback } from 'react';
import { api, type Store } from '../../lib/api';
import { useI18n, useT } from '../../lib/i18n';

const OT_FEE_TYPES = [
  { value: 'free', i18nKey: 'supplier.settings.overtime_free' },
  { value: 'fixed', i18nKey: 'supplier.settings.overtime_fixed' },
  { value: 'per_30min', i18nKey: 'supplier.settings.overtime_per30' },
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
      setError(e instanceof Error ? e.message : 'Failed');
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
    // Read from store object fields (may have been added by 007 migration)
    const s = store as Store & {
      allow_overtime?: boolean;
      overtime_fee_type?: string;
      overtime_fee_amount?: number;
      review_public?: boolean;
    };
    setAllowOvertime(!!s.allow_overtime);
    setOvertimeFeeType(s.overtime_fee_type || 'free');
    setOvertimeFeeAmount(s.overtime_fee_amount || 0);
    setReviewPublic(s.review_public !== false);
  }, [selectedStoreId, stores]);

  async function handleSave() {
    if (!selectedStoreId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.stores.settings(selectedStoreId, {
        allowOvertime,
        overtimeFeeType,
        overtimeFeeAmount,
        reviewPublic,
      });
      setSuccess(t('common.saved', 'Settings saved'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
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
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>{t('provider.store.no_stores', 'No stores')}</div>
      ) : (
        <>
          {/* Store selector if multiple stores */}
          {stores.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">{t('supplier.settings.select_store', 'Select Store')}</label>
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

          {/* Overtime settings */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
              {t('supplier.settings.overtime_title', 'Overtime Booking Settings')}
            </h4>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={allowOvertime}
                onChange={e => setAllowOvertime(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              {t('supplier.settings.allow_overtime', 'Allow overtime bookings')}
            </label>

            {allowOvertime && (
              <div style={{ marginLeft: 28, display: 'grid', gap: 10 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13 }}>{t('supplier.settings.overtime_fee_type', 'Overtime Fee Type')}</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {OT_FEE_TYPES.map(ft => (
                      <button
                        key={ft.value}
                        className={`btn btn-sm ${overtimeFeeType === ft.value ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setOvertimeFeeType(ft.value)}
                      >
                        {t(ft.i18nKey, ft.value)}
                      </button>
                    ))}
                  </div>
                </div>

                {overtimeFeeType !== 'free' && (
                  <div>
                    <label className="form-label" style={{ fontSize: 13 }}>{t('supplier.settings.overtime_fee_amount', 'Fee Amount')}</label>
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
              {t('supplier.settings.review_title', 'Review Settings')}
            </h4>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={reviewPublic}
                onChange={e => setReviewPublic(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              {t('supplier.settings.review_public', 'Show reviews on store profile')}
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginLeft: 28 }}>
              {t('supplier.settings.review_public_desc', 'When enabled, guardian reviews will be visible on your store page')}
            </p>
          </div>

          {/* Save */}
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? '...' : t('admin.common.save', 'Save Settings')}
          </button>
        </>
      )}
    </div>
  );
}
