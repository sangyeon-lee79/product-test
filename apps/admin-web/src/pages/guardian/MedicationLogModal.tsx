// 약품 투여 기록 추가/수정 모달 — GuardianMainPage Health 탭에서 사용
import { useEffect, useState } from 'react';
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
  const [models, setModels] = useState<FeedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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
    setFieldErrors({});
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  // Load models when type changes
  useEffect(() => {
    if (!open || !form.medicine_type_id) { setModels([]); return; }
    let cancelled = false;
    setLoadingModels(true);
    api.medicineCatalog.public.models({ feed_type_id: form.medicine_type_id }, lang)
      .then((res) => { if (!cancelled) setModels(res); })
      .catch(() => { if (!cancelled) setModels([]); })
      .finally(() => { if (!cancelled) setLoadingModels(false); });
    return () => { cancelled = true; };
  }, [open, form.medicine_type_id, lang]);

  // Auto-fill dose_unit and route when model selected
  useEffect(() => {
    if (!form.medicine_model_id) return;
    const model = models.find((m) => m.id === form.medicine_model_id);
    if (!model) return;
    const meta = parseModelMeta(model);
    setForm((prev) => ({
      ...prev,
      dose_unit: prev.dose_unit || meta.dosage_unit || '',
      administration_route: prev.administration_route || meta.administration_route || '',
    }));
  }, [form.medicine_model_id, models]);

  if (!open) return null;

  const isEdit = !!editingLog;

  // Type options
  const typeOptions = medicineTypes.map((mt) => ({
    id: mt.id,
    label: mt.display_label || mt.name_ko || mt.key,
  }));

  // Model options filtered by type
  const modelOptions = models.map((m) => ({
    id: m.id,
    label: m.model_display_label || m.model_name || m.id,
  }));

  const selectedModel = models.find((m) => m.id === form.medicine_model_id);
  const modelMeta = selectedModel ? parseModelMeta(selectedModel) : {};

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.medicine_type_id) errors.medicine_type_id = t('guardian.medication.err_type', '약품 유형을 선택해주세요');
    if (!form.medicine_model_id) errors.medicine_model_id = t('guardian.medication.err_medicine', '약품을 선택해주세요');
    if (!form.dose_amount || Number(form.dose_amount) <= 0) errors.dose_amount = t('guardian.medication.err_dose', '투여량을 입력해주세요');
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

      // Build title from model name
      const modelLabel = modelOptions.find((o) => o.id === form.medicine_model_id)?.label || '';
      const title = `${modelLabel} ${form.dose_amount}${form.dose_unit}`;

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
          logtype_id: form.medicine_type_id,
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
    <div className="gm-modal-overlay" onClick={onClose}>
      <div className="gm-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="gm-modal-header">
          <h3>{isEdit ? t('guardian.medication.edit_title', '약품 투여 수정') : t('guardian.medication.title', '약품 투여 기록')}</h3>
          <button className="gm-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="gm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Medicine Type */}
          <label className="gm-field">
            <span className="gm-field-label">{t('guardian.medication.medicine_type', '약품 유형')}</span>
            <select value={form.medicine_type_id} onChange={(e) => setForm((p) => ({ ...p, medicine_type_id: e.target.value, medicine_model_id: '' }))}>
              <option value="">--</option>
              {typeOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            {fieldErrors.medicine_type_id && <span className="gm-field-error">{fieldErrors.medicine_type_id}</span>}
          </label>

          {/* Medicine Model */}
          <label className="gm-field">
            <span className="gm-field-label">{t('guardian.medication.medicine_name', '약품명')}</span>
            <select value={form.medicine_model_id} disabled={!form.medicine_type_id || loadingModels}
              onChange={(e) => setForm((p) => ({ ...p, medicine_model_id: e.target.value }))}>
              <option value="">{loadingModels ? '...' : '--'}</option>
              {modelOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            {fieldErrors.medicine_model_id && <span className="gm-field-error">{fieldErrors.medicine_model_id}</span>}
          </label>

          {/* Dose + Unit */}
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="gm-field" style={{ flex: 2 }}>
              <span className="gm-field-label">{t('guardian.medication.dose_amount', '투여량')}</span>
              <input type="number" min="0" step="any" value={form.dose_amount}
                onChange={(e) => setForm((p) => ({ ...p, dose_amount: e.target.value }))} />
              {fieldErrors.dose_amount && <span className="gm-field-error">{fieldErrors.dose_amount}</span>}
            </label>
            <label className="gm-field" style={{ flex: 1 }}>
              <span className="gm-field-label">{t('guardian.medication.dose_unit', '단위')}</span>
              <input type="text" value={form.dose_unit} placeholder="mg, IU, ml..."
                onChange={(e) => setForm((p) => ({ ...p, dose_unit: e.target.value }))} />
            </label>
          </div>

          {/* Administration Route */}
          <label className="gm-field">
            <span className="gm-field-label">{t('guardian.medication.route', '투여 경로')}</span>
            <select value={form.administration_route} onChange={(e) => setForm((p) => ({ ...p, administration_route: e.target.value }))}>
              <option value="">--</option>
              {ROUTE_OPTIONS.map((r) => (
                <option key={r} value={r}>{t(`medicine.route.${r}`, r)}</option>
              ))}
            </select>
          </label>

          {/* Date + Time */}
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="gm-field" style={{ flex: 1 }}>
              <span className="gm-field-label">{t('guardian.medication.date', '투여 날짜')}</span>
              <input type="date" value={form.administration_date}
                onChange={(e) => setForm((p) => ({ ...p, administration_date: e.target.value }))} />
            </label>
            <label className="gm-field" style={{ flex: 1 }}>
              <span className="gm-field-label">{t('guardian.medication.time', '투여 시간')}</span>
              <input type="time" value={form.administration_time}
                onChange={(e) => setForm((p) => ({ ...p, administration_time: e.target.value }))} />
            </label>
          </div>

          {/* Next Dose Date */}
          <label className="gm-field">
            <span className="gm-field-label">{t('guardian.medication.next_dose', '다음 투여 예정일')}</span>
            <input type="date" value={form.next_dose_date}
              onChange={(e) => setForm((p) => ({ ...p, next_dose_date: e.target.value }))} />
          </label>

          {/* Prescriber */}
          <label className="gm-field">
            <span className="gm-field-label">{t('guardian.medication.prescriber', '처방 수의사')}</span>
            <input type="text" value={form.prescriber}
              onChange={(e) => setForm((p) => ({ ...p, prescriber: e.target.value }))} />
          </label>

          {/* Notes */}
          <label className="gm-field">
            <span className="gm-field-label">{t('guardian.medication.notes', '메모')}</span>
            <textarea rows={2} value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </label>

          {/* Prescribed badge */}
          {modelMeta.prescribed && (
            <div style={{ padding: '6px 10px', background: 'var(--warning-bg, #fef3c7)', borderRadius: 8, fontSize: 12, color: 'var(--warning-text, #92400e)' }}>
              {t('guardian.medication.prescribed_note', '처방 의약품입니다. 수의사 지시에 따라 투여해주세요.')}
            </div>
          )}
        </div>

        <div className="gm-modal-footer">
          {isEdit && (
            <button className="gm-btn gm-btn-danger" onClick={handleDelete} disabled={saving}>
              {t('guardian.medication.delete', '삭제')}
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="gm-btn gm-btn-secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel', '취소')}
          </button>
          <button className="gm-btn gm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '...' : t('guardian.medication.save', '저장')}
          </button>
        </div>
      </div>
    </div>
  );
}
