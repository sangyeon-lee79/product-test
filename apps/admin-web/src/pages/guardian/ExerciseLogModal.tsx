// 운동 기록 추가/수정 모달 — GuardianMainPage에서 사용
import { useState } from 'react';
import { api, type Pet, type PetExerciseLog, type MasterItem } from '../../lib/api';
import { toDatetimeLocal, uiErrorMessage, toOption, type Option } from './guardianTypes';
import type { Lang } from '@petfolio/shared';

interface Props {
  open: boolean;
  editingLog: PetExerciseLog | null;
  selectedPet: Pet | null;
  exerciseTypeItems: MasterItem[];
  exerciseIntensityItems: MasterItem[];
  exerciseLocationItems: MasterItem[];
  petTypeOptions: Option[];
  lang: Lang;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExerciseForm {
  exercise_type: string;
  exercise_subtype: string;
  exercise_date: string;
  duration_min: string;
  distance_km: string;
  intensity: string;
  leash: boolean;
  location_type: string;
  with_other_pets: boolean;
  note: string;
}

const EMPTY_FORM: ExerciseForm = {
  exercise_type: '',
  exercise_subtype: '',
  exercise_date: '',
  duration_min: '',
  distance_km: '',
  intensity: 'medium',
  leash: false,
  location_type: 'outdoor',
  with_other_pets: false,
  note: '',
};

export default function ExerciseLogModal({ open, editingLog, selectedPet, exerciseTypeItems, exerciseIntensityItems, exerciseLocationItems, petTypeOptions, lang, t, setError, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<ExerciseForm>(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);

  if (open && !initialized) {
    if (editingLog) {
      setForm({
        exercise_type: editingLog.exercise_type || '',
        exercise_subtype: editingLog.exercise_subtype || '',
        exercise_date: editingLog.exercise_date ? toDatetimeLocal(editingLog.exercise_date) : '',
        duration_min: String(editingLog.duration_min ?? ''),
        distance_km: editingLog.distance_km != null ? String(editingLog.distance_km) : '',
        intensity: editingLog.intensity || 'medium',
        leash: editingLog.leash === true,
        location_type: editingLog.location_type || 'outdoor',
        with_other_pets: editingLog.with_other_pets === true,
        note: editingLog.note || '',
      });
    } else {
      setForm({ ...EMPTY_FORM, exercise_date: toDatetimeLocal() });
    }
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  if (!open) return null;

  // Resolve pet species code from pet_type_id via master options
  let speciesCode = '';
  if (selectedPet?.pet_type_id) {
    const matched = petTypeOptions.find((o) => o.id === selectedPet.pet_type_id);
    if (matched) speciesCode = matched.key.toLowerCase();
  }

  // L1 items — filter by metadata.species (from master data)
  const l1Items = exerciseTypeItems.filter((item) => {
    if (item.parent_id) return false;
    try {
      const meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') as Record<string, unknown> : {};
      const species = Array.isArray(meta.species) ? meta.species as string[] : [];
      return species.length === 0 || !speciesCode || species.includes(speciesCode);
    } catch {
      return true;
    }
  });
  const l1Options: Option[] = toOption(l1Items, lang, t, 'exercise_type');

  // L2 items filtered by selected L1
  const selectedL1Item = l1Items.find((item) => item.key === form.exercise_type || item.id === form.exercise_type);
  const l2Items = selectedL1Item
    ? exerciseTypeItems.filter((item) => item.parent_id === selectedL1Item.id)
    : [];
  const l2Options: Option[] = toOption(l2Items, lang, t, 'exercise_type');

  // Intensity & location options from master data
  const intensityOptions: Option[] = toOption(exerciseIntensityItems, lang, t, 'exercise_intensity');
  const locationOptions: Option[] = toOption(exerciseLocationItems, lang, t, 'exercise_location');

  const showDistanceLeash = form.exercise_type === 'walking' || form.exercise_type === 'running';

  async function handleSave() {
    if (!selectedPet?.id) return;
    if (!form.exercise_type) { setError(t('guardian.exercise.type', 'Exercise Type') + ' required'); return; }
    if (!form.exercise_subtype) { setError(t('guardian.exercise.subtype', 'Subtype') + ' required'); return; }
    const duration = Number(form.duration_min);
    if (!Number.isFinite(duration) || duration <= 0) {
      setError(t('guardian.exercise.duration', 'Duration') + ' required');
      return;
    }

    const distanceKm = form.distance_km.trim() ? Number(form.distance_km) : null;
    if (distanceKm !== null && !Number.isFinite(distanceKm)) {
      setError(t('guardian.exercise.distance', 'Distance') + ' invalid');
      return;
    }

    try {
      if (editingLog) {
        await api.pets.exerciseLogs.update(selectedPet.id, editingLog.id, {
          exercise_type: form.exercise_type,
          exercise_subtype: form.exercise_subtype,
          duration_min: duration,
          distance_km: showDistanceLeash ? distanceKm : null,
          intensity: form.intensity,
          leash: showDistanceLeash ? form.leash : null,
          location_type: form.location_type,
          with_other_pets: form.with_other_pets,
          note: form.note.trim() || null,
        });
      } else {
        await api.pets.exerciseLogs.create(selectedPet.id, {
          exercise_type: form.exercise_type,
          exercise_subtype: form.exercise_subtype,
          exercise_date: form.exercise_date || new Date().toISOString(),
          duration_min: duration,
          distance_km: showDistanceLeash ? distanceKm : undefined,
          intensity: form.intensity,
          leash: showDistanceLeash ? form.leash : undefined,
          location_type: form.location_type,
          with_other_pets: form.with_other_pets,
          note: form.note.trim() || undefined,
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.exercise.create_failed', 'Failed to save exercise log.')));
    }
  }

  const update = (field: keyof ExerciseForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingLog
              ? t('guardian.exercise.edit_title', 'Edit Exercise')
              : t('guardian.exercise.add', 'Add Exercise')}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {/* Exercise Type (L1) */}
          <div className="form-group">
            <label className="form-label" htmlFor="ex-type">{t('guardian.exercise.type', 'Exercise Type')}</label>
            <select id="ex-type" className="form-input" value={form.exercise_type}
              onChange={(e) => { update('exercise_type', e.target.value); update('exercise_subtype', ''); }}>
              <option value="">--</option>
              {l1Options.map((o) => <option key={o.id} value={o.key}>{o.label}</option>)}
            </select>
          </div>

          {/* Exercise Subtype (L2) */}
          <div className="form-group">
            <label className="form-label" htmlFor="ex-subtype">{t('guardian.exercise.subtype', 'Subtype')}</label>
            <select id="ex-subtype" className="form-input" value={form.exercise_subtype}
              onChange={(e) => update('exercise_subtype', e.target.value)} disabled={!form.exercise_type}>
              <option value="">--</option>
              {l2Options.map((o) => <option key={o.id} value={o.key}>{o.label}</option>)}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="ex-date">{t('guardian.exercise.date', 'Exercise Date')}</label>
            <input id="ex-date" className="form-input" type="datetime-local"
              value={form.exercise_date} onChange={(e) => update('exercise_date', e.target.value)}
              disabled={!!editingLog} />
          </div>

          {/* Duration */}
          <div className="form-group">
            <label className="form-label" htmlFor="ex-duration">{t('guardian.exercise.duration', 'Duration (min)')}</label>
            <input id="ex-duration" className="form-input" type="number" min="1" step="1"
              value={form.duration_min} onChange={(e) => update('duration_min', e.target.value)} />
          </div>

          {/* Distance (conditional) */}
          {showDistanceLeash && (
            <div className="form-group">
              <label className="form-label" htmlFor="ex-distance">{t('guardian.exercise.distance', 'Distance (km)')}</label>
              <input id="ex-distance" className="form-input" type="number" step="0.01" min="0"
                value={form.distance_km} onChange={(e) => update('distance_km', e.target.value)} />
            </div>
          )}

          {/* Intensity */}
          <div className="form-group">
            <label className="form-label" htmlFor="ex-intensity">{t('guardian.exercise.intensity', 'Intensity')}</label>
            <select id="ex-intensity" className="form-input" value={form.intensity}
              onChange={(e) => update('intensity', e.target.value)}>
              {intensityOptions.length > 0
                ? intensityOptions.map((o) => <option key={o.id} value={o.key}>{o.label}</option>)
                : <>
                    <option value="low">{t('guardian.exercise.intensity_low', 'Low')}</option>
                    <option value="medium">{t('guardian.exercise.intensity_medium', 'Medium')}</option>
                    <option value="high">{t('guardian.exercise.intensity_high', 'High')}</option>
                  </>
              }
            </select>
          </div>

          {/* Leash (conditional) */}
          {showDistanceLeash && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input id="ex-leash" type="checkbox" checked={form.leash}
                onChange={(e) => update('leash', e.target.checked)} />
              <label className="form-label" htmlFor="ex-leash" style={{ margin: 0 }}>{t('guardian.exercise.leash', 'Leash Used')}</label>
            </div>
          )}

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="ex-location">{t('guardian.exercise.location', 'Location')}</label>
            <select id="ex-location" className="form-input" value={form.location_type}
              onChange={(e) => update('location_type', e.target.value)}>
              {locationOptions.length > 0
                ? locationOptions.map((o) => <option key={o.id} value={o.key}>{o.label}</option>)
                : <>
                    <option value="indoor">{t('guardian.exercise.location_indoor', 'Indoor')}</option>
                    <option value="outdoor">{t('guardian.exercise.location_outdoor', 'Outdoor')}</option>
                    <option value="park">{t('guardian.exercise.location_park', 'Park')}</option>
                    <option value="beach">{t('guardian.exercise.location_beach', 'Beach')}</option>
                    <option value="other">{t('guardian.exercise.location_other', 'Other')}</option>
                  </>
              }
            </select>
          </div>

          {/* With other pets */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input id="ex-with-others" type="checkbox" checked={form.with_other_pets}
              onChange={(e) => update('with_other_pets', e.target.checked)} />
            <label className="form-label" htmlFor="ex-with-others" style={{ margin: 0 }}>{t('guardian.exercise.with_others', 'With Other Pets')}</label>
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="ex-note">{t('guardian.exercise.note', 'Note')}</label>
            <textarea id="ex-note" className="form-textarea" value={form.note}
              onChange={(e) => update('note', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" onClick={() => void handleSave()}>{t('common.save', 'Save')}</button>
        </div>
      </div>
    </div>
  );
}
