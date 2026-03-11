// 몸무게 추가/수정 모달 — GuardianMainPage에서 분리
import { useState } from 'react';
import { api, type Pet, type PetWeightLog } from '../../lib/api';
import { toDatetimeLocal, uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  editingLog: PetWeightLog | null;
  selectedPet: Pet | null;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WeightModal({ open, editingLog, selectedPet, t, setError, onClose, onSuccess }: Props) {
  const [weightForm, setWeightForm] = useState<{ value: string; measured_at: string; notes: string }>({
    value: '',
    measured_at: '',
    notes: '',
  });
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form when opening
  if (open && !initialized) {
    if (editingLog) {
      setWeightForm({
        value: String(editingLog.weight_value ?? ''),
        measured_at: editingLog.measured_at ? toDatetimeLocal(editingLog.measured_at) : '',
        notes: editingLog.notes || '',
      });
    } else {
      setWeightForm({ value: '', measured_at: toDatetimeLocal(), notes: '' });
    }
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  if (!open) return null;

  async function handleSave() {
    if (!selectedPet?.id || saving) return;
    const value = Number(weightForm.value);
    if (!Number.isFinite(value) || value <= 0) {
      setError(t('guardian.health.weight_invalid', 'Please enter a valid weight.'));
      return;
    }
    setSaving(true);
    try {
      if (editingLog) {
        await api.pets.weightLogs.update(selectedPet.id, editingLog.id, {
          weight_value: value,
          notes: weightForm.notes.trim() || null,
        });
      } else {
        await api.pets.weightLogs.create(selectedPet.id, {
          weight_value: value,
          weight_unit_id: selectedPet.weight_unit_id || null,
          measured_at: weightForm.measured_at || new Date().toISOString(),
          notes: weightForm.notes.trim() || null,
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.weight_create_failed', 'Failed to save weight log.')));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingLog
              ? t('guardian.health.weight_modal.edit_title', 'Edit Weight')
              : t('guardian.health.weight_modal.add_title', 'Add Weight')}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="weight-value">{t('guardian.health.weight_modal.weight', 'Weight')}</label>
            <input
              id="weight-value"
              name="weight-value"
              className="form-input"
              type="number"
              step="0.01"
              value={weightForm.value}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, value: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="weight-measured-at">{t('guardian.health.weight_modal.measured_at', 'Measured At')}</label>
            <input
              id="weight-measured-at"
              name="weight-measured-at"
              className="form-input"
              type="datetime-local"
              value={weightForm.measured_at}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, measured_at: e.target.value }))}
              disabled={!!editingLog}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="weight-notes">{t('guardian.health.weight_modal.memo', 'Memo')}</label>
            <textarea
              id="weight-notes"
              name="weight-notes"
              className="form-textarea"
              value={weightForm.notes}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" onClick={() => void handleSave()} disabled={saving}>{saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}</button>
        </div>
      </div>
    </div>
  );
}
