// 몸무게 추가 모달 — GuardianMainPage에서 분리
import { useState } from 'react';
import { api, type Pet } from '../../lib/api';
import { uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  selectedPet: Pet | null;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WeightModal({ open, selectedPet, t, setError, onClose, onSuccess }: Props) {
  const [weightForm, setWeightForm] = useState<{ value: string; measured_at: string; notes: string }>({
    value: '',
    measured_at: '',
    notes: '',
  });

  if (!open) return null;

  async function createWeightLog() {
    if (!selectedPet?.id) return;
    const value = Number(weightForm.value);
    if (!Number.isFinite(value) || value <= 0) {
      setError(t('guardian.health.weight_invalid', 'Please enter a valid weight.'));
      return;
    }
    try {
      await api.pets.weightLogs.create(selectedPet.id, {
        weight_value: value,
        weight_unit_id: selectedPet.weight_unit_id || null,
        measured_at: weightForm.measured_at || new Date().toISOString(),
        notes: weightForm.notes.trim() || null,
      });
      setWeightForm({ value: '', measured_at: '', notes: '' });
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.weight_create_failed', 'Failed to add weight log.')));
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{t('guardian.health.weight_modal.add_title', 'Add Weight')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{t('guardian.health.weight_modal.weight', 'Weight')}</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={weightForm.value}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, value: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('guardian.health.weight_modal.measured_at', 'Measured At')}</label>
            <input
              className="form-input"
              type="datetime-local"
              value={weightForm.measured_at}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, measured_at: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('guardian.health.weight_modal.memo', 'Memo')}</label>
            <textarea
              className="form-textarea"
              value={weightForm.notes}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" onClick={() => void createWeightLog()}>{t('common.save', 'Save')}</button>
        </div>
      </div>
    </div>
  );
}
