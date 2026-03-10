// 급여 기록 모달 — 단일 사료 또는 혼합 급여 (multi-feed mixing)
import { useMemo, useState } from 'react';
import { api, type FeedingLog, type Pet, type PetFeed } from '../../lib/api';
import { toDatetimeLocal, uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  editingLog: FeedingLog | null;
  selectedPet: Pet | null;
  petFeeds: PetFeed[];
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
  onOpenFeedManage?: () => void;
}

interface MixedRow {
  pet_feed_id: string;
  amount_g: string;
}

const EMPTY_FORM = {
  pet_feed_id: '',
  amount_g: '',
  feeding_time: '',
  memo: '',
};

export default function FeedingLogModal({
  open, editingLog, selectedPet, petFeeds,
  t, setError, onClose, onSuccess, onOpenFeedManage,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);
  const [isMixed, setIsMixed] = useState(false);
  const [mixedRows, setMixedRows] = useState<MixedRow[]>([{ pet_feed_id: '', amount_g: '' }]);

  const petId = selectedPet?.id;

  // Build nutrition lookup from petFeeds
  const feedNutritionMap = useMemo(() => {
    const m = new Map<string, PetFeed>();
    for (const f of petFeeds) m.set(f.id, f);
    return m;
  }, [petFeeds]);

  // Initialize form when opening
  if (open && !initialized) {
    if (editingLog) {
      const mixed = !!editingLog.is_mixed && Array.isArray(editingLog.items) && editingLog.items.length > 0;
      setIsMixed(mixed);
      if (mixed && editingLog.items) {
        setMixedRows(editingLog.items.map((it) => ({
          pet_feed_id: it.pet_feed_id || '',
          amount_g: it.amount_g != null ? String(it.amount_g) : '',
        })));
      } else {
        setMixedRows([{ pet_feed_id: '', amount_g: '' }]);
      }
      setForm({
        pet_feed_id: editingLog.pet_feed_id || '',
        amount_g: editingLog.amount_g != null ? String(editingLog.amount_g) : '',
        feeding_time: editingLog.feeding_time ? toDatetimeLocal(editingLog.feeding_time) : toDatetimeLocal(),
        memo: editingLog.memo || '',
      });
    } else {
      setIsMixed(false);
      setMixedRows([{ pet_feed_id: '', amount_g: '' }]);
      setForm({
        ...EMPTY_FORM,
        pet_feed_id: petFeeds.find((f) => f.is_primary)?.id || '',
        feeding_time: toDatetimeLocal(),
      });
    }
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  // Calorie calc for a single feed row
  function calcCalories(feedId: string, amountG: string): number {
    const feed = feedNutritionMap.get(feedId);
    if (!feed?.calories_per_100g) return 0;
    const g = Number(amountG);
    if (!Number.isFinite(g) || g <= 0) return 0;
    return (g / 100) * feed.calories_per_100g;
  }

  // Nutrition summary for mixed mode
  const mixedSummary = useMemo(() => {
    if (!isMixed) return null;
    let totalCal = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0, totalFiber = 0, totalG = 0;
    for (const row of mixedRows) {
      const feed = feedNutritionMap.get(row.pet_feed_id);
      const g = Number(row.amount_g);
      if (!feed || !Number.isFinite(g) || g <= 0) continue;
      totalG += g;
      if (feed.calories_per_100g) totalCal += (g / 100) * feed.calories_per_100g;
      if (feed.protein_pct) totalProtein += (g / 100) * feed.protein_pct;
      if (feed.fat_pct) totalFat += (g / 100) * feed.fat_pct;
      if (feed.carbohydrate_pct) totalCarbs += (g / 100) * feed.carbohydrate_pct;
      if (feed.fiber_pct) totalFiber += (g / 100) * feed.fiber_pct;
    }
    return { totalCal, totalProtein, totalFat, totalCarbs, totalFiber, totalG };
  }, [isMixed, mixedRows, feedNutritionMap]);

  // Single mode calorie display
  const singleCalories = !isMixed ? calcCalories(form.pet_feed_id, form.amount_g) : 0;

  async function handleSave() {
    if (!petId) return;

    if (isMixed) {
      const validRows = mixedRows.filter((r) => r.pet_feed_id);
      if (validRows.length === 0) {
        setError(t('guardian.feeding.select_feed', 'Please select a feed'));
        return;
      }
      const totalG = validRows.reduce((sum, r) => sum + (Number(r.amount_g) || 0), 0);
      const payload = {
        is_mixed: true,
        amount_g: totalG > 0 ? totalG : undefined,
        feeding_time: form.feeding_time || undefined,
        memo: form.memo || undefined,
        items: validRows.map((r) => ({
          pet_feed_id: r.pet_feed_id,
          amount_g: Number(r.amount_g) || undefined,
        })),
      };
      try {
        if (editingLog) {
          await api.pets.feedingLogs.update(petId, editingLog.id, payload);
        } else {
          await api.pets.feedingLogs.create(petId, payload);
        }
        onSuccess();
        onClose();
      } catch (e) {
        setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
      }
    } else {
      if (!form.pet_feed_id) {
        setError(t('guardian.feeding.select_feed', 'Please select a feed'));
        return;
      }
      const selectedFeed = petFeeds.find((f) => f.id === form.pet_feed_id);
      const feedModelId = selectedFeed?.feed_model_id || undefined;
      const payload = {
        pet_feed_id: form.pet_feed_id,
        feed_model_id: feedModelId,
        amount_g: form.amount_g ? Number(form.amount_g) : undefined,
        feeding_time: form.feeding_time || undefined,
        memo: form.memo || undefined,
        is_mixed: false,
      };
      try {
        if (editingLog) {
          await api.pets.feedingLogs.update(petId, editingLog.id, payload);
        } else {
          await api.pets.feedingLogs.create(petId, payload);
        }
        onSuccess();
        onClose();
      } catch (e) {
        setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
      }
    }
  }

  function feedLabel(f: PetFeed): string {
    return f.nickname || f.model_display_label || f.model_name || f.feed_model_id;
  }

  function addRow() {
    setMixedRows((prev) => [...prev, { pet_feed_id: '', amount_g: '' }]);
  }

  function removeRow(idx: number) {
    setMixedRows((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof MixedRow, value: string) {
    setMixedRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editingLog
              ? t('guardian.feeding.edit', '급여 기록 수정')
              : t('guardian.feeding.add', '급여 기록 추가')}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {petFeeds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p className="text-sm text-muted">{t('guardian.feeding.no_feeds_registered', '등록된 사료가 없습니다')}</p>
              {onOpenFeedManage && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => { onClose(); onOpenFeedManage(); }}>
                  {t('guardian.feed.manage_title', '사료 관리')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mode toggle — only show if more than 1 feed registered */}
              {petFeeds.length > 1 && (
                <div className="gm-period-chips" style={{ marginBottom: 12 }}>
                  <button
                    className={`gm-period-chip${!isMixed ? ' active' : ''}`}
                    onClick={() => setIsMixed(false)}
                  >
                    {t('guardian.feeding.single_mode', '단일 사료')}
                  </button>
                  <button
                    className={`gm-period-chip${isMixed ? ' active' : ''}`}
                    onClick={() => setIsMixed(true)}
                  >
                    {t('guardian.feeding.mixed_feed', '혼합급여')}
                  </button>
                </div>
              )}

              {/* ── Single mode ── */}
              {!isMixed && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="flog-feed">{t('guardian.feeding.select_feed', '사료 선택')} *</label>
                    <select
                      id="flog-feed"
                      name="flog-feed"
                      className="form-select"
                      value={form.pet_feed_id}
                      onChange={(e) => setForm((p) => ({ ...p, pet_feed_id: e.target.value }))}
                      disabled={!!editingLog}
                    >
                      <option value="">{t('common.select', 'Select')}</option>
                      {petFeeds.map((f) => (
                        <option key={f.id} value={f.id}>
                          {feedLabel(f)}
                          {f.is_primary ? ` (${t('guardian.feed.is_primary', '기본')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="flog-amount">{t('guardian.feeding.amount', '급여량 (g)')}</label>
                    <input
                      id="flog-amount"
                      name="flog-amount"
                      className="form-input"
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.amount_g}
                      onChange={(e) => setForm((p) => ({ ...p, amount_g: e.target.value }))}
                    />
                    {singleCalories > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                        ≈ {singleCalories.toFixed(0)} kcal
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* ── Mixed mode ── */}
              {isMixed && (
                <div style={{ marginBottom: 12 }}>
                  {mixedRows.map((row, idx) => {
                    const rowCal = calcCalories(row.pet_feed_id, row.amount_g);
                    return (
                      <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
                        <div style={{ flex: 2 }}>
                          {idx === 0 && <label className="form-label" style={{ fontSize: 12 }}>{t('guardian.feeding.select_feed', '사료')}</label>}
                          <select
                            className="form-select"
                            value={row.pet_feed_id}
                            onChange={(e) => updateRow(idx, 'pet_feed_id', e.target.value)}
                          >
                            <option value="">{t('common.select', 'Select')}</option>
                            {petFeeds.map((f) => (
                              <option key={f.id} value={f.id}>{feedLabel(f)}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          {idx === 0 && <label className="form-label" style={{ fontSize: 12 }}>{t('guardian.feeding.amount', '급여량(g)')}</label>}
                          <input
                            className="form-input"
                            type="number"
                            step="0.1"
                            min="0"
                            value={row.amount_g}
                            onChange={(e) => updateRow(idx, 'amount_g', e.target.value)}
                          />
                        </div>
                        <div style={{ width: 60, textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', paddingBottom: 6 }}>
                          {rowCal > 0 ? `${rowCal.toFixed(0)} kcal` : ''}
                        </div>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ flexShrink: 0, marginBottom: 2 }}
                          onClick={() => removeRow(idx)}
                          title={t('guardian.feeding.remove_feed_row', '삭제')}
                          disabled={mixedRows.length <= 1}
                        >
                          −
                        </button>
                      </div>
                    );
                  })}
                  <button className="btn btn-secondary btn-sm" onClick={addRow} style={{ fontSize: 12 }}>
                    + {t('guardian.feeding.add_feed_row', '사료 추가')}
                  </button>

                  {/* Total nutrition summary */}
                  {mixedSummary && mixedSummary.totalG > 0 && (
                    <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('nutrition.total', '총 영양 합계')}</div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                        <span>{t('guardian.feeding.total_amount', '총 급여량')}: {mixedSummary.totalG.toFixed(0)}g</span>
                        <span>{t('guardian.feeding.total_calories', '총 칼로리')}: {mixedSummary.totalCal.toFixed(0)} kcal</span>
                        {mixedSummary.totalProtein > 0 && <span>{t('nutrition.protein', '단백질')}: {mixedSummary.totalProtein.toFixed(1)}g</span>}
                        {mixedSummary.totalFat > 0 && <span>{t('nutrition.fat', '지방')}: {mixedSummary.totalFat.toFixed(1)}g</span>}
                        {mixedSummary.totalCarbs > 0 && <span>{t('nutrition.carbohydrate', '탄수화물')}: {mixedSummary.totalCarbs.toFixed(1)}g</span>}
                        {mixedSummary.totalFiber > 0 && <span>{t('nutrition.fiber', '식이섬유')}: {mixedSummary.totalFiber.toFixed(1)}g</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feeding time */}
              <div className="form-group">
                <label className="form-label" htmlFor="flog-time">{t('guardian.feeding.time', '급여 시간')}</label>
                <input
                  id="flog-time"
                  name="flog-time"
                  className="form-input"
                  type="datetime-local"
                  value={form.feeding_time}
                  onChange={(e) => setForm((p) => ({ ...p, feeding_time: e.target.value }))}
                  disabled={!!editingLog}
                />
              </div>

              {/* Memo */}
              <div className="form-group">
                <label className="form-label" htmlFor="flog-memo">{t('guardian.feeding.memo', '메모')}</label>
                <textarea
                  id="flog-memo"
                  name="flog-memo"
                  className="form-input"
                  rows={2}
                  value={form.memo}
                  onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                />
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          {petFeeds.length > 0 && (
            <button className="btn btn-primary" onClick={() => void handleSave()}>
              {t('guardian.feeding.save', '저장')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
