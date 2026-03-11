// 약품 투여 기록 추가/수정 모달 — GuardianMainPage Health 탭에서 사용
// Search-first UI: 검색 → 약품 선택 → 투여 정보 입력
import { useEffect, useMemo, useState } from 'react';
import { api, type FeedModel, type FeedType, type Pet, type PetLog } from '../../lib/api';
import { uiErrorMessage } from './guardianTypes';
import type { Lang } from '@petfolio/shared';

interface Props {
  open: boolean;
  editingLog: PetLog | null;
  selectedPet: Pet | null;
  medicineTypes: FeedType[];
  lang: Lang;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

interface MedicationForm {
  medicine_type_id: string;
  medicine_model_id: string;
  dose_amount: string;
  dose_unit: string;
  administration_route: string;
  administration_date: string;
  administration_time: string;
  next_dose_date: string;
  prescriber: string;
  notes: string;
}

const EMPTY_FORM: MedicationForm = {
  medicine_type_id: '',
  medicine_model_id: '',
  dose_amount: '',
  dose_unit: '',
  administration_route: '',
  administration_date: '',
  administration_time: '',
  next_dose_date: '',
  prescriber: '',
  notes: '',
};

const ROUTE_OPTIONS = ['injection', 'oral', 'topical', 'eye_drop', 'ear_drop'];

function toDateOnly(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  try { return new Date(value).toISOString().slice(0, 10); } catch { return ''; }
}

function toTimeOnly(value?: string | null): string {
  if (!value) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  return value.slice(0, 5);
}

function parseModelMeta(model: FeedModel): { dosage_unit?: string; administration_route?: string; prescribed?: boolean } {
  try {
    if (model.description && typeof model.description === 'string') return JSON.parse(model.description);
  } catch { /* ignore */ }
  return {};
}

export default function MedicationLogModal({
  open, editingLog, selectedPet, medicineTypes, lang, t, setError, onClose, onSuccess,
}: Props) {
  const [form, setForm] = useState<MedicationForm>(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Search-first state
  const [searchTerm, setSearchTerm] = useState('');
  const [allModels, setAllModels] = useState<FeedModel[]>([]);
  const [allModelsLoading, setAllModelsLoading] = useState(false);

  const petId = selectedPet?.id;

  // Initialize form
  if (open && !initialized) {
    if (editingLog) {
      const meta = (editingLog.metadata && typeof editingLog.metadata === 'object' ? editingLog.metadata : {}) as Record<string, unknown>;
      setForm({
        medicine_type_id: (meta.medicine_type_id as string) || editingLog.logtype_id || '',
        medicine_model_id: (meta.medicine_model_id as string) || '',
        dose_amount: meta.dose_amount != null ? String(meta.dose_amount) : '',
        dose_unit: (meta.dose_unit as string) || '',
        administration_route: (meta.administration_route as string) || '',
        administration_date: toDateOnly(editingLog.event_date),
        administration_time: toTimeOnly(editingLog.event_time),
        next_dose_date: (meta.next_dose_date as string) || '',
        prescriber: (meta.prescriber as string) || '',
        notes: editingLog.notes || '',
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        administration_date: toDateOnly(),
        administration_time: toTimeOnly(),
      });
    }
    setSearchTerm('');
    setFieldErrors({});
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  // Load ALL models when modal opens (search-first)
  useEffect(() => {
    if (!open) return;
    setAllModelsLoading(true);
    void (async () => {
      try {
        const models = await api.medicineCatalog.public.models({}, lang);
        setAllModels(models);
      } catch { setAllModels([]); }
      finally { setAllModelsLoading(false); }
    })();
  }, [open, lang]);

  // Auto-fill dose_unit and route when model selected
  useEffect(() => {
    if (!form.medicine_model_id) return;
    const model = allModels.find((m) => m.id === form.medicine_model_id);
    if (!model) return;
    const meta = parseModelMeta(model);
    setForm((prev) => ({
      ...prev,
      dose_unit: meta.dosage_unit || prev.dose_unit || '',
      administration_route: meta.administration_route || prev.administration_route || '',
      medicine_type_id: model.feed_type_item_id || prev.medicine_type_id || '',
    }));
  }, [form.medicine_model_id, allModels]);

  if (!open) return null;

  const isEdit = !!editingLog;

  // Client-side filtered models
  const filteredModels = (() => {
    let result = allModels;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((m) =>
        [m.model_display_label, m.model_name, m.model_code, m.mfr_display_label, m.brand_display_label, m.type_display_label]
          .some(s => s?.toLowerCase().includes(term))
      );
    }
    return result;
  })();

  const selectedModel = allModels.find((m) => m.id === form.medicine_model_id);
  const modelMeta = selectedModel ? parseModelMeta(selectedModel) : {};

  function modelLabel(m: FeedModel): string {
    return m.model_display_label || m.model_name || m.model_code || m.id;
  }

  function modelSubLabel(m: FeedModel): string {
    const parts: string[] = [];
    const mfr = m.mfr_display_label || m.mfr_name_ko || m.mfr_name_en || '';
    if (mfr) parts.push(mfr);
    const type = m.type_display_label || m.type_name_ko || m.type_name_en || '';
    if (type) parts.push(type);
    return parts.join(' · ');
  }

  function handleSelectModel(model: FeedModel) {
    if (form.medicine_model_id === model.id) {
      // Deselect
      setForm(p => ({ ...p, medicine_model_id: '', medicine_type_id: '', dose_unit: '', administration_route: '' }));
    } else {
      setForm(p => ({ ...p, medicine_model_id: model.id }));
    }
    setFieldErrors(p => ({ ...p, medicine_model_id: '' }));
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.medicine_model_id) errors.medicine_model_id = t('guardian.medication.err_medicine', '약품을 선택해주세요');
    if (!form.dose_amount || Number(form.dose_amount) <= 0) errors.dose_amount = t('guardian.medication.err_dose', '투여량을 입력해주세요');
    if (!form.administration_date) errors.administration_date = t('guardian.medication.err_date', '투여 날짜를 입력해주세요');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!petId || !validate()) return;
    setSaving(true);
    try {
      const metadata: Record<string, unknown> = {
        medicine_type_id: form.medicine_type_id,
        medicine_model_id: form.medicine_model_id,
        dose_amount: Number(form.dose_amount),
        dose_unit: form.dose_unit,
        administration_route: form.administration_route,
      };
      if (form.next_dose_date) metadata.next_dose_date = form.next_dose_date;
      if (form.prescriber) metadata.prescriber = form.prescriber;
      if (modelMeta.prescribed) metadata.prescribed = true;

      const label = selectedModel ? modelLabel(selectedModel) : '';
      const title = `${label} ${form.dose_amount}${form.dose_unit}`.trim();

      if (isEdit && editingLog) {
        await api.pets.logs.update(petId, editingLog.id, {
          event_date: form.administration_date,
          event_time: form.administration_time || null,
          title,
          notes: form.notes || null,
          metadata,
        });
      } else {
        await api.pets.logs.create(petId, {
          logtype_id: form.medicine_type_id || medicineTypes[0]?.id || '',
          event_date: form.administration_date,
          event_time: form.administration_time || null,
          title,
          notes: form.notes || null,
          metadata,
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, 'Failed to save medication log'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!petId || !editingLog) return;
    if (!confirm(t('guardian.medication.delete_confirm', '이 약품 기록을 삭제하시겠습니까?'))) return;
    setSaving(true);
    try {
      await api.pets.logs.remove(petId, editingLog.id);
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, 'Failed to delete'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h3 className="modal-title">
            💉 {isEdit ? t('guardian.medication.edit_title', '약품 투여 수정') : t('guardian.medication.title', '약품 기록')}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Medicine search (search-first) ── */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">{t('guardian.medication.medicine_name', '약품명')} *</label>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('common.total', 'Total')} {filteredModels.length}
              </span>
            </div>
            <input
              className="form-input" type="text" value={searchTerm} autoFocus={!isEdit}
              placeholder={`🔍 ${t('guardian.medication.search_placeholder', '약품을 검색하세요...')}`}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ── Results list ── */}
          {allModelsLoading ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{t('guardian.catalog.loading_models', '제품 목록 불러오는 중...')}</p>
          ) : (
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
              {filteredModels.length === 0 ? (
                <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  {t('guardian.catalog.no_results', '검색 결과가 없습니다')}
                </div>
              ) : (
                filteredModels.map((m) => {
                  const isSelected = form.medicine_model_id === m.id;
                  const meta = parseModelMeta(m);
                  return (
                    <div key={m.id} onClick={() => handleSelectModel(m)} style={{
                      padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-light, #fffbeb)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 14, flexShrink: 0, width: 18, textAlign: 'center', color: isSelected ? 'var(--primary)' : 'transparent' }}>✓</span>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>💊</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {modelLabel(m)}
                          {meta.prescribed && <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--danger, #dc2626)', color: '#fff', borderRadius: 3, padding: '1px 4px', verticalAlign: 'middle' }}>Rx</span>}
                        </div>
                        {modelSubLabel(m) && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{modelSubLabel(m)}</div>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          {fieldErrors.medicine_model_id && <span className="pet-form-help danger" style={{ fontSize: 12 }}>{fieldErrors.medicine_model_id}</span>}

          {/* ── Dose + Unit ── */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <label className="form-label">{t('guardian.medication.dose_amount', '투여량')} *</label>
              <input className="form-input" type="number" min="0" step="any" value={form.dose_amount}
                onChange={(e) => { setForm((p) => ({ ...p, dose_amount: e.target.value })); setFieldErrors(p => ({ ...p, dose_amount: '' })); }} />
              {fieldErrors.dose_amount && <span className="pet-form-help danger" style={{ fontSize: 12 }}>{fieldErrors.dose_amount}</span>}
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">{t('guardian.medication.dose_unit', '단위')}</label>
              <input className="form-input" type="text" value={form.dose_unit} disabled={!!modelMeta.dosage_unit}
                style={modelMeta.dosage_unit ? { background: 'var(--bg)', color: 'var(--text-muted)' } : undefined}
                placeholder="mg, IU, ml..."
                onChange={(e) => setForm((p) => ({ ...p, dose_unit: e.target.value }))} />
            </div>
          </div>

          {/* ── Route + DateTime ── */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">{t('guardian.medication.route', '투여 경로')}</label>
              <select className="form-select" value={form.administration_route}
                onChange={(e) => setForm((p) => ({ ...p, administration_route: e.target.value }))}>
                <option value="">--</option>
                {ROUTE_OPTIONS.map((r) => <option key={r} value={r}>{t(`medicine.route.${r}`, r)}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">{t('guardian.medication.date', '투여 날짜/시간')} *</label>
              <div style={{ display: 'flex', gap: 4 }}>
                <input className="form-input" type="date" value={form.administration_date} style={{ flex: 1 }}
                  onChange={(e) => { setForm((p) => ({ ...p, administration_date: e.target.value })); setFieldErrors(p => ({ ...p, administration_date: '' })); }} />
                <input className="form-input" type="time" value={form.administration_time} style={{ width: 100 }}
                  onChange={(e) => setForm((p) => ({ ...p, administration_time: e.target.value }))} />
              </div>
              {fieldErrors.administration_date && <span className="pet-form-help danger" style={{ fontSize: 12 }}>{fieldErrors.administration_date}</span>}
            </div>
          </div>

          {/* ── Next dose date ── */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('guardian.medication.next_dose', '다음 투여 예정일')}</label>
            <input className="form-input" type="date" value={form.next_dose_date}
              onChange={(e) => setForm((p) => ({ ...p, next_dose_date: e.target.value }))} />
          </div>

          {/* ── Prescriber ── */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('guardian.medication.prescriber', '처방 수의사')}</label>
            <input className="form-input" type="text" value={form.prescriber}
              onChange={(e) => setForm((p) => ({ ...p, prescriber: e.target.value }))} />
          </div>

          {/* ── Notes ── */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('guardian.medication.notes', '메모')}</label>
            <textarea className="form-textarea" rows={2} value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>

          {/* ── Prescribed badge ── */}
          {modelMeta.prescribed && (
            <div style={{ padding: '6px 10px', background: 'var(--primary-light, #fef3c7)', borderRadius: 8, fontSize: 12, color: 'var(--warning-text, #92400e)' }}>
              ⚠️ {t('guardian.medication.prescribed_note', '처방 의약품입니다. 수의사 지시에 따라 투여해주세요.')}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEdit && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
              {t('guardian.medication.delete', '삭제')}
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel', '취소')}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '...' : t('guardian.medication.save', '저장')}
          </button>
        </div>
      </div>
    </div>
  );
}
