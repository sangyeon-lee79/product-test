// 급여 기록 모달 — 단일 사료 또는 혼합 급여 (multi-feed mixing)
// + 중복 사료 선택 방지, 즐겨찾기 저장/불러오기, 영양제 선택
import { useEffect, useMemo, useState } from 'react';
import { api, type FeedingLog, type FeedingMixFavorite, type Pet, type PetFeed } from '../../lib/api';
import { toDatetimeLocal, uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  editingLog: FeedingLog | null;
  selectedPet: Pet | null;
  petFeeds: PetFeed[];
  petSupplements: PetFeed[];
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

interface SupplementRow {
  pet_feed_id: string;
  dosage: string;
}

const EMPTY_FORM = {
  pet_feed_id: '',
  amount_g: '',
  feeding_time: '',
  memo: '',
};

function parseSupplementMeta(f: PetFeed): { ingredients?: string; dosage_unit?: string; calories_per_serving?: number; species_key?: string; prescribed?: boolean } {
  try {
    const desc = (f as unknown as Record<string, unknown>).model_description;
    if (desc && typeof desc === 'string') return JSON.parse(desc);
  } catch { /* ignore */ }
  return {};
}

export default function FeedingLogModal({
  open, editingLog, selectedPet, petFeeds, petSupplements,
  t, setError, onClose, onSuccess, onOpenFeedManage,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMixed, setIsMixed] = useState(false);
  const [mixedRows, setMixedRows] = useState<MixedRow[]>([{ pet_feed_id: '', amount_g: '' }]);
  const [supplementRows, setSupplementRows] = useState<SupplementRow[]>([]);

  // Favorites state
  const [favorites, setFavorites] = useState<FeedingMixFavorite[]>([]);
  const [showSaveFav, setShowSaveFav] = useState(false);
  const [saveFavName, setSaveFavName] = useState('');

  const petId = selectedPet?.id;

  // Build nutrition lookup from petFeeds
  const feedNutritionMap = useMemo(() => {
    const m = new Map<string, PetFeed>();
    for (const f of petFeeds) m.set(f.id, f);
    return m;
  }, [petFeeds]);

  // Set of pet_feed_ids selected in other rows (for duplicate prevention)
  const selectedFeedIds = useMemo(() => {
    const s = new Set<string>();
    for (const row of mixedRows) {
      if (row.pet_feed_id) s.add(row.pet_feed_id);
    }
    return s;
  }, [mixedRows]);

  // Set of supplement ids already selected (for duplicate prevention)
  const selectedSupplementIds = useMemo(() => {
    const s = new Set<string>();
    for (const row of supplementRows) {
      if (row.pet_feed_id) s.add(row.pet_feed_id);
    }
    return s;
  }, [supplementRows]);

  // Load favorites when modal opens in mixed mode
  useEffect(() => {
    if (open && petId) {
      api.pets.feedingMixFavorites.list(petId)
        .then((res) => setFavorites(res.favorites))
        .catch(() => { /* silently ignore */ });
    }
    if (!open) {
      setFavorites([]);
      setShowSaveFav(false);
      setSaveFavName('');
    }
  }, [open, petId]);

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
    setSupplementRows([]);
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

  // Supplement calorie calculation
  const supplementCalorieDetails = useMemo(() => {
    const details: { name: string; kcal: number }[] = [];
    let total = 0;
    for (const row of supplementRows) {
      if (!row.pet_feed_id) continue;
      const supp = petSupplements.find((s) => s.id === row.pet_feed_id);
      if (!supp) continue;
      const meta = parseSupplementMeta(supp);
      const dosage = Number(row.dosage);
      if (!meta.calories_per_serving || !Number.isFinite(dosage) || dosage <= 0) continue;
      const kcal = meta.calories_per_serving * dosage;
      details.push({ name: feedLabel(supp), kcal });
      total += kcal;
    }
    return { details, total };
  }, [supplementRows, petSupplements]);

  // Total calories across feed + supplements
  const feedCalories = isMixed ? (mixedSummary?.totalCal ?? 0) : singleCalories;
  const totalCaloriesAll = feedCalories + supplementCalorieDetails.total;

  // Valid mixed rows count (for save favorite button)
  const validMixedRowCount = mixedRows.filter((r) => r.pet_feed_id).length;

  async function handleSave() {
    if (!petId || saving) return;

    // Build supplement items for the payload
    const suppItems = supplementRows
      .filter((r) => r.pet_feed_id && Number(r.dosage) > 0)
      .map((r) => ({ pet_feed_id: r.pet_feed_id, amount_g: Number(r.dosage) || undefined }));

    if (isMixed) {
      const validRows = mixedRows.filter((r) => r.pet_feed_id);
      if (validRows.length === 0) {
        setError(t('guardian.feeding.select_feed', 'Please select a feed'));
        return;
      }
    } else if (!form.pet_feed_id) {
      setError(t('guardian.feeding.select_feed', 'Please select a feed'));
      return;
    }

    setSaving(true);
    try {
      if (isMixed) {
        const validRows = mixedRows.filter((r) => r.pet_feed_id);
        const allItems = [
          ...validRows.map((r) => ({ pet_feed_id: r.pet_feed_id, amount_g: Number(r.amount_g) || undefined })),
          ...suppItems,
        ];
        const totalG = validRows.reduce((sum, r) => sum + (Number(r.amount_g) || 0), 0);
        const payload = {
          is_mixed: true,
          amount_g: totalG > 0 ? totalG : undefined,
          feeding_time: form.feeding_time || undefined,
          memo: form.memo || undefined,
          items: allItems,
        };
        if (editingLog) {
          await api.pets.feedingLogs.update(petId, editingLog.id, payload);
        } else {
          await api.pets.feedingLogs.create(petId, payload);
        }
      } else if (suppItems.length > 0) {
        // If supplements are added, save as mixed to include them
        const feedItem = { pet_feed_id: form.pet_feed_id, amount_g: form.amount_g ? Number(form.amount_g) : undefined };
        const allItems = [feedItem, ...suppItems];
        const payload = {
          is_mixed: true,
          amount_g: form.amount_g ? Number(form.amount_g) : undefined,
          feeding_time: form.feeding_time || undefined,
          memo: form.memo || undefined,
          items: allItems,
        };
        if (editingLog) {
          await api.pets.feedingLogs.update(petId, editingLog.id, payload);
        } else {
          await api.pets.feedingLogs.create(petId, payload);
        }
      } else {
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
        if (editingLog) {
          await api.pets.feedingLogs.update(petId, editingLog.id, payload);
        } else {
          await api.pets.feedingLogs.create(petId, payload);
        }
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    } finally {
      setSaving(false);
    }
  }

  function feedLabel(f: PetFeed): string {
    return f.nickname || f.model_display_label || f.model_name || f.feed_model_id;
  }

  function addRow() {
    if (mixedRows.length >= petFeeds.length) return;
    setMixedRows((prev) => [...prev, { pet_feed_id: '', amount_g: '' }]);
  }

  function removeRow(idx: number) {
    setMixedRows((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof MixedRow, value: string) {
    setMixedRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  // Supplement row helpers
  function addSupplementRow() {
    setSupplementRows((prev) => [...prev, { pet_feed_id: '', dosage: '1' }]);
  }

  function removeSupplementRow(idx: number) {
    setSupplementRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSupplementRow(idx: number, field: keyof SupplementRow, value: string) {
    setSupplementRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  // Load a favorite into mixedRows + supplementRows
  function loadFavorite(fav: FeedingMixFavorite) {
    try {
      const items = JSON.parse(fav.items_json) as Array<{ pet_feed_id: string; amount_g?: number; type?: string }>;
      if (!Array.isArray(items) || items.length === 0) return;
      const feedItems = items.filter(it => it.type !== 'supplement');
      const suppItems = items.filter(it => it.type === 'supplement');
      if (feedItems.length > 0) {
        setMixedRows(feedItems.map((it) => ({
          pet_feed_id: it.pet_feed_id || '',
          amount_g: it.amount_g != null ? String(it.amount_g) : '',
        })));
      }
      if (suppItems.length > 0) {
        setSupplementRows(suppItems.map((it) => ({
          pet_feed_id: it.pet_feed_id || '',
          dosage: it.amount_g != null ? String(it.amount_g) : '1',
        })));
      } else {
        setSupplementRows([]);
      }
    } catch { /* ignore parse errors */ }
  }

  // Save current mixed rows + supplement rows as favorite
  async function handleSaveFavorite() {
    if (!petId || !saveFavName.trim()) return;
    const validFeedRows = mixedRows.filter((r) => r.pet_feed_id);
    const validSuppRows = supplementRows.filter((r) => r.pet_feed_id);
    if (validFeedRows.length + validSuppRows.length < 1) return;
    try {
      const items = [
        ...validFeedRows.map((r) => ({
          pet_feed_id: r.pet_feed_id,
          amount_g: Number(r.amount_g) || undefined,
        })),
        ...validSuppRows.map((r) => ({
          pet_feed_id: r.pet_feed_id,
          amount_g: Number(r.dosage) || undefined,
          type: 'supplement' as const,
        })),
      ];
      await api.pets.feedingMixFavorites.create(petId, {
        name: saveFavName.trim(),
        items,
      });
      const res = await api.pets.feedingMixFavorites.list(petId);
      setFavorites(res.favorites);
      setShowSaveFav(false);
      setSaveFavName('');
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    }
  }

  // Delete a favorite
  async function handleDeleteFavorite(favId: string) {
    if (!petId) return;
    try {
      await api.pets.feedingMixFavorites.remove(petId, favId);
      setFavorites((prev) => prev.filter((f) => f.id !== favId));
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to delete.')));
    }
  }

  if (!open) return null;

  // Whether to show the combined nutrition summary box (single mode with data, or always for mixed)
  const showNutritionSummary = (isMixed && mixedSummary && mixedSummary.totalG > 0) || (!isMixed && singleCalories > 0) || supplementCalorieDetails.total > 0;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editingLog
              ? t('guardian.feeding.edit', 'Edit Feeding Log')
              : t('guardian.feeding.add', 'Add Feeding Log')}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {petFeeds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p className="text-sm text-muted">{t('guardian.feeding.no_feeds_registered', 'No feeds registered')}</p>
              {onOpenFeedManage && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => { onClose(); onOpenFeedManage(); }}>
                  {t('guardian.feed.manage_title', 'Feed Management')}
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
                    {t('guardian.feeding.single_mode', 'Single Feed')}
                  </button>
                  <button
                    className={`gm-period-chip${isMixed ? ' active' : ''}`}
                    onClick={() => setIsMixed(true)}
                  >
                    {t('guardian.feeding.mixed_feed', 'Mixed Feed')}
                  </button>
                </div>
              )}

              {/* ── Single mode ── */}
              {!isMixed && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="flog-feed">{t('guardian.feeding.select_feed', 'Select Feed')} *</label>
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
                          {f.is_primary ? ` (${t('guardian.feed.is_primary', 'Primary')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="flog-amount">{t('guardian.feeding.amount', 'Amount (g)')}</label>
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
                    {singleCalories > 0 && supplementCalorieDetails.total === 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                        ≈ {singleCalories.toFixed(0)} {t('unit.kcal', 'kcal')}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* ── Mixed mode ── */}
              {isMixed && (
                <div style={{ marginBottom: 12 }}>
                  {/* Favorites dropdown */}
                  {favorites.length > 0 && (
                    <div style={{ marginBottom: 10, padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>
                        {t('guardian.feeding.load_favorite', 'Load Favorite')}
                      </label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {favorites.map((fav) => {
                          let suppCount = 0;
                          try {
                            const items = JSON.parse(fav.items_json) as Array<{ type?: string }>;
                            suppCount = items.filter(it => it.type === 'supplement').length;
                          } catch { /* ignore */ }
                          return (
                          <div key={fav.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: '2px 8px' }}
                              onClick={() => loadFavorite(fav)}
                            >
                              {fav.name}
                              {suppCount > 0 && <span style={{ marginLeft: 4 }} title={t('guardian.feeding.supplements_included', 'Supplements included')}>{'\uD83D\uDC8A'}{suppCount}</span>}
                            </button>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, padding: 0 }}
                              onClick={() => void handleDeleteFavorite(fav.id)}
                              title={t('guardian.feeding.delete_favorite', 'Delete')}
                            >
                              &times;
                            </button>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {mixedRows.map((row, idx) => {
                    const rowCal = calcCalories(row.pet_feed_id, row.amount_g);
                    return (
                      <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
                        <div style={{ flex: 2 }}>
                          {idx === 0 && <label className="form-label" style={{ fontSize: 12 }}>{t('guardian.feeding.select_feed', 'Feed')}</label>}
                          <select
                            className="form-select"
                            value={row.pet_feed_id}
                            onChange={(e) => updateRow(idx, 'pet_feed_id', e.target.value)}
                          >
                            <option value="">{t('common.select', 'Select')}</option>
                            {petFeeds.map((f) => (
                              <option
                                key={f.id}
                                value={f.id}
                                disabled={f.id !== row.pet_feed_id && selectedFeedIds.has(f.id)}
                              >
                                {feedLabel(f)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          {idx === 0 && <label className="form-label" style={{ fontSize: 12 }}>{t('guardian.feeding.amount', 'Amount(g)')}</label>}
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
                          {rowCal > 0 ? `${rowCal.toFixed(0)} ${t('unit.kcal', 'kcal')}` : ''}
                        </div>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ flexShrink: 0, marginBottom: 2 }}
                          onClick={() => removeRow(idx)}
                          title={t('guardian.feeding.remove_feed_row', 'Remove')}
                          disabled={mixedRows.length <= 1}
                        >
                          −
                        </button>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={addRow}
                      style={{ fontSize: 12 }}
                      disabled={mixedRows.length >= petFeeds.length}
                    >
                      + {t('guardian.feeding.add_feed_row', 'Add Feed')}
                    </button>

                    {/* Save favorite button — show when feed+supplement total >= 1 */}
                    {(validMixedRowCount + supplementRows.filter(r => r.pet_feed_id).length) >= 1 && !showSaveFav && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowSaveFav(true)}
                        style={{ fontSize: 12 }}
                      >
                        {t('guardian.feeding.save_favorite', 'Save Favorite')}
                      </button>
                    )}
                  </div>

                  {/* Save favorite form */}
                  {showSaveFav && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        className="form-input"
                        style={{ flex: 1, fontSize: 12 }}
                        type="text"
                        value={saveFavName}
                        onChange={(e) => setSaveFavName(e.target.value)}
                        placeholder={t('guardian.feeding.favorite_name_placeholder', 'e.g. Morning meal')}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 12 }}
                        disabled={!saveFavName.trim()}
                        onClick={() => void handleSaveFavorite()}
                      >
                        {t('guardian.feeding.save', 'Save')}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 12 }}
                        onClick={() => { setShowSaveFav(false); setSaveFavName(''); }}
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Supplement section ── */}
              <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {t('guardian.feeding.supplement_section', 'Supplements (optional)')}
                  </span>
                  {petSupplements.length > 0 && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 12 }}
                      onClick={addSupplementRow}
                      disabled={supplementRows.length >= petSupplements.length}
                    >
                      + {t('guardian.feeding.add_supplement', 'Add Supplement')}
                    </button>
                  )}
                </div>

                {petSupplements.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
                    <p style={{ margin: '0 0 6px' }}>{t('guardian.feeding.no_supplements', 'No supplements registered. Please add them in Feed/Supplement management first.')}</p>
                    {onOpenFeedManage && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11 }}
                        onClick={() => { onClose(); onOpenFeedManage(); }}
                      >
                        {t('guardian.feed.manage_title', 'Feed Management')}
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {supplementRows.map((row, idx) => {
                      const supp = petSupplements.find((s) => s.id === row.pet_feed_id);
                      const meta = supp ? parseSupplementMeta(supp) : {};
                      const dosageUnit = meta.dosage_unit || 'tablet';
                      const rowCal = meta.calories_per_serving && Number(row.dosage) > 0
                        ? meta.calories_per_serving * Number(row.dosage) : 0;
                      return (
                        <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
                          <div style={{ flex: 2 }}>
                            {idx === 0 && <label className="form-label" style={{ fontSize: 12 }}>{t('guardian.feeding.supplement_select', 'Supplement')}</label>}
                            <select
                              className="form-select"
                              value={row.pet_feed_id}
                              onChange={(e) => updateSupplementRow(idx, 'pet_feed_id', e.target.value)}
                            >
                              <option value="">{t('common.select', 'Select')}</option>
                              {petSupplements.map((s) => {
                                const sMeta = parseSupplementMeta(s);
                                return (
                                  <option
                                    key={s.id}
                                    value={s.id}
                                    disabled={s.id !== row.pet_feed_id && selectedSupplementIds.has(s.id)}
                                  >
                                    {feedLabel(s)}{sMeta.prescribed ? ` (${t('guardian.feeding.prescribed_badge', 'Rx')})` : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            {idx === 0 && <label className="form-label" style={{ fontSize: 12 }}>{t('guardian.feeding.supplement_dosage', 'Dosage')}</label>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input
                                className="form-input"
                                type="number"
                                step="0.5"
                                min="0"
                                value={row.dosage}
                                onChange={(e) => updateSupplementRow(idx, 'dosage', e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dosageUnit}</span>
                            </div>
                          </div>
                          <div style={{ width: 60, textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', paddingBottom: 6 }}>
                            {rowCal > 0 ? `${rowCal.toFixed(0)} ${t('unit.kcal', 'kcal')}` : ''}
                          </div>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ flexShrink: 0, marginBottom: 2 }}
                            onClick={() => removeSupplementRow(idx)}
                            title={t('common.delete', 'Delete')}
                          >
                            −
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* ── Total nutrition summary (feed + supplement) ── */}
              {showNutritionSummary && (
                <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('nutrition.total', 'Nutrition Summary')}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                    {isMixed && mixedSummary && mixedSummary.totalG > 0 && (
                      <span>{t('guardian.feeding.total_amount', 'Total Amount')}: {mixedSummary.totalG.toFixed(0)}{t('unit.g', 'g')}</span>
                    )}
                    {!isMixed && form.amount_g && Number(form.amount_g) > 0 && (
                      <span>{t('guardian.feeding.total_amount', 'Total Amount')}: {Number(form.amount_g).toFixed(0)}{t('unit.g', 'g')}</span>
                    )}
                    <span>
                      {t('guardian.feeding.total_calories', 'Total Calories')}: {totalCaloriesAll.toFixed(0)} {t('unit.kcal', 'kcal')}
                      {supplementCalorieDetails.total > 0 && (
                        <> ({t('guardian.feeding.feed_calories', 'Feed')}: {feedCalories.toFixed(0)} + {t('guardian.feeding.supplement_calories', 'Supplements')}: {supplementCalorieDetails.total.toFixed(0)})</>
                      )}
                    </span>
                  </div>
                  {isMixed && mixedSummary && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {mixedSummary.totalProtein > 0 && <span>{t('nutrition.protein', 'Protein')}: {mixedSummary.totalProtein.toFixed(1)}{t('unit.g', 'g')}</span>}
                      {mixedSummary.totalFat > 0 && <span>{t('nutrition.fat', 'Fat')}: {mixedSummary.totalFat.toFixed(1)}{t('unit.g', 'g')}</span>}
                      {mixedSummary.totalCarbs > 0 && <span>{t('nutrition.carbohydrate', 'Carbs')}: {mixedSummary.totalCarbs.toFixed(1)}{t('unit.g', 'g')}</span>}
                      {mixedSummary.totalFiber > 0 && <span>{t('nutrition.fiber', 'Fiber')}: {mixedSummary.totalFiber.toFixed(1)}{t('unit.g', 'g')}</span>}
                    </div>
                  )}
                  {supplementCalorieDetails.details.length > 0 && (
                    <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                      {t('guardian.feeding.supplement_calories', 'Supplement Calories')}: {supplementCalorieDetails.total.toFixed(0)} {t('unit.kcal', 'kcal')} ({supplementCalorieDetails.details.map((d) => `${d.name} ${d.kcal.toFixed(0)}${t('unit.kcal', 'kcal')}`).join(' + ')})
                    </div>
                  )}
                </div>
              )}

              {/* Feeding time */}
              <div className="form-group">
                <label className="form-label" htmlFor="flog-time">{t('guardian.feeding.time', 'Feeding Time')}</label>
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
                <label className="form-label" htmlFor="flog-memo">{t('guardian.feeding.memo', 'Memo')}</label>
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
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>{t('common.cancel', 'Cancel')}</button>
          {petFeeds.length > 0 && (
            <button className="btn btn-primary" onClick={() => void handleSave()} disabled={saving}>
              {saving ? t('common.saving', 'Saving...') : t('guardian.feeding.save', 'Save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
