// 반려동물 등록/수정 위저드 모달 — GuardianMainPage에서 분리
import { useEffect, useMemo, useState } from 'react';
import { api, type Pet } from '../../lib/api';
import {
  type Mode,
  type PetWizardStep,
  type Option,
  type PetForm,
  type GuardianPetOptions,
  PET_WIZARD_STEPS,
  DEFAULT_PET_FORM,
  normalizeUniqueIds,
  normalizeMultiStableIds,
  normalizeSingleStableId,
  uiErrorMessage,
} from './guardianTypes';

interface Props {
  open: boolean;
  mode: Mode;
  editingPetId: string;
  options: GuardianPetOptions;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: (savedPet: Pet) => void;
}

export default function PetWizardModal({ open, mode, editingPetId, options, t, setError, onClose, onSuccess }: Props) {
  const [petForm, setPetForm] = useState<PetForm>(DEFAULT_PET_FORM);
  const [petWizardStep, setPetWizardStep] = useState<PetWizardStep>(1);
  const [diseaseRows, setDiseaseRows] = useState<Array<{ groupId: string; diseaseId: string }>>([{ groupId: '', diseaseId: '' }]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [fetchedDiseaseOptions, setFetchedDiseaseOptions] = useState<Option[]>([]);

  const allDiseaseOptions = useMemo(() => {
    const merged = new Map<string, Option>();
    for (const option of [...options.optDisease, ...fetchedDiseaseOptions]) {
      if (!option.id) continue;
      merged.set(option.id, option);
    }
    return Array.from(merged.values());
  }, [fetchedDiseaseOptions, options.optDisease]);

  const optionLabel = (option: Option | undefined, fallback: string): string => {
    if (!option) return fallback;
    if (option.i18nKey) {
      const translated = t(option.i18nKey, '').trim();
      if (translated) return translated;
    }
    return (option.label || '').trim() || fallback;
  };

  const labelOf = (opts: Option[], id: string | null | undefined, fallback: string): string => {
    if (!id) return fallback;
    const matched = opts.find((o) => o.id === id || o.key === id);
    return optionLabel(matched, fallback);
  };

  // Load pet data when edit mode opens
  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setPetForm(DEFAULT_PET_FORM);
      setPetWizardStep(1);
      setDiseaseRows([{ groupId: '', diseaseId: '' }]);
      setActivePet(null);
      setFetchedDiseaseOptions((prev) => (prev.length > 0 ? [] : prev));
      return;
    }
    if (!editingPetId) return;
    const run = async () => {
      try {
        const res = await api.pets.detail(editingPetId);
        const p = res.pet;
        const diseaseHistoryIds = normalizeMultiStableIds(p.disease_history_ids, allDiseaseOptions);
        setActivePet(p);
        setPetWizardStep(1);
        const mappedDiseaseRows = normalizeUniqueIds(diseaseHistoryIds)
          .map((diseaseId) => {
            const disease = allDiseaseOptions.find((d) => d.id === diseaseId || d.key === diseaseId);
            return { groupId: disease?.parentId || '', diseaseId };
          })
          .filter((row) => row.groupId && row.diseaseId);
        setDiseaseRows(mappedDiseaseRows.length ? mappedDiseaseRows : [{ groupId: '', diseaseId: '' }]);
        setPetForm({
          name: p.name || '',
          microchip_no: p.microchip_no || '',
          birthday: p.birthday || p.birth_date || '',
          current_weight: p.current_weight != null ? String(p.current_weight) : (p.weight_kg != null ? String(p.weight_kg) : ''),
          current_weight_measured_at: '',
          current_weight_notes: '',
          notes: p.notes || '',
          pet_type_id: normalizeSingleStableId(p.pet_type_id, options.optPetType),
          breed_id: normalizeSingleStableId(p.breed_id, options.optBreed),
          gender_id: normalizeSingleStableId(p.gender_id, options.optGender),
          neuter_status_id: p.neuter_status_id || '',
          life_stage_id: normalizeSingleStableId(p.life_stage_id, options.optLifeStage),
          body_size_id: p.body_size_id || '',
          country_id: p.country_id || '',
          allergy_ids: normalizeMultiStableIds(p.allergy_ids, options.optAllergy),
          disease_history_ids: diseaseHistoryIds,
          symptom_tag_ids: normalizeMultiStableIds(p.symptom_tag_ids, options.optSymptom),
          vaccination_ids: normalizeMultiStableIds(p.vaccination_ids, options.optVaccination),
          weight_unit_id: p.weight_unit_id || '',
          health_condition_level_id: normalizeSingleStableId(p.health_condition_level_id, options.optHealthLevel),
          activity_level_id: normalizeSingleStableId(p.activity_level_id, options.optActivity),
          diet_type_id: normalizeSingleStableId(p.diet_type_id, options.optDiet),
          temperament_ids: normalizeMultiStableIds(p.temperament_ids, options.optTemperament),
          ownership_type_id: p.ownership_type_id || '',
          coat_length_id: normalizeSingleStableId(p.coat_length_id, options.optCoatLength),
          coat_type_id: p.coat_type_id || '',
          grooming_cycle_id: normalizeSingleStableId(p.grooming_cycle_id, options.optGrooming),
          color_ids: normalizeMultiStableIds(p.color_ids, options.optColor),
        });
      } catch (e) {
        setError(uiErrorMessage(e, t('guardian.alert.pet_detail_failed', '펫 상세를 불러오지 못했습니다.')));
      }
    };
    void run();
  }, [allDiseaseOptions, editingPetId, mode, open]);

  // Sync disease rows when optDisease or disease_history_ids change while modal is open
  useEffect(() => {
    if (!open) return;
    const normalizedDiseaseIds = normalizeMultiStableIds(petForm.disease_history_ids, allDiseaseOptions);
    const mapped = normalizedDiseaseIds
      .map((diseaseId) => {
        const disease = allDiseaseOptions.find((d) => d.id === diseaseId || d.key === diseaseId);
        return { groupId: disease?.parentId || '', diseaseId };
      })
      .filter((row) => row.groupId && row.diseaseId);
    setDiseaseRows(mapped.length ? mapped : [{ groupId: '', diseaseId: '' }]);
  }, [allDiseaseOptions, open, petForm.disease_history_ids]);

  useEffect(() => {
    if (!open) return;
    const groupIds = normalizeUniqueIds(
      diseaseRows
        .map((row) => normalizeSingleStableId(row.groupId, options.optDiseaseGroup))
        .filter(Boolean),
    );
    if (groupIds.length === 0) return;

    let cancelled = false;
    const run = async () => {
      for (const groupId of groupIds) {
        const alreadyLoaded = options.optDisease.some((item) => item.parentId === groupId)
          || fetchedDiseaseOptions.some((item) => item.parentId === groupId);
        if (alreadyLoaded) continue;
        try {
          const rows = await api.master.public.items('disease_type', groupId);
          if (cancelled || rows.length === 0) continue;
          setFetchedDiseaseOptions((prev) => {
            const merged = new Map(prev.map((item) => [item.id, item]));
            for (const row of rows) {
              merged.set(row.id, {
                id: row.id,
                key: row.key,
                label: (row.display_label || row.ko_name || row.en || row.key || '').trim(),
                i18nKey: `master.disease_type.${row.key}`,
                parentId: row.parent_id,
                metadata: {},
              });
            }
            return Array.from(merged.values());
          });
        } catch {
          // Keep the current option set when the fallback request fails.
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [diseaseRows, fetchedDiseaseOptions, open, options.optDisease, options.optDiseaseGroup]);

  const breedOptionsFiltered = useMemo(() => {
    if (!petForm.pet_type_id) return options.optBreed;
    return options.optBreed.filter((b) => b.parentId === petForm.pet_type_id);
  }, [options.optBreed, petForm.pet_type_id]);

  const wizardTitle = useMemo(() => {
    const dash = '-';
    if (petWizardStep === 1) return `${t('guardian.pet_wizard.basic_info', '기본정보')} - ${dash} - ${dash}`;
    if (petWizardStep === 2) {
      return `${t('master.pet_type', '펫종류')} - ${labelOf(options.optPetType, petForm.pet_type_id, dash)} - ${labelOf(breedOptionsFiltered, petForm.breed_id, dash)}`;
    }
    if (petWizardStep === 3) {
      const colorLabel = petForm.color_ids.length
        ? `${labelOf(options.optColor, petForm.color_ids[0], dash)}${petForm.color_ids.length > 1 ? ` +${petForm.color_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.pet_gender', '성별')} - ${labelOf(options.optGender, petForm.gender_id, dash)} - ${colorLabel}`;
    }
    if (petWizardStep === 4) {
      const vaccinationLabel = petForm.vaccination_ids.length
        ? `${labelOf(options.optVaccination, petForm.vaccination_ids[0], dash)}${petForm.vaccination_ids.length > 1 ? ` +${petForm.vaccination_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.vaccination_type', '예방접종')} - ${vaccinationLabel} - ${dash}`;
    }
    if (petWizardStep === 5) {
      const diseaseLabel = petForm.disease_history_ids.length
        ? `${labelOf(allDiseaseOptions, petForm.disease_history_ids[0], dash)}${petForm.disease_history_ids.length > 1 ? ` +${petForm.disease_history_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.disease_group', '질병군')} - ${labelOf(options.optDiseaseGroup, diseaseRows.find((row) => row.groupId)?.groupId || '', dash)} - ${diseaseLabel}`;
    }
    if (petWizardStep === 6) {
      const temperamentLabel = petForm.temperament_ids.length
        ? `${labelOf(options.optTemperament, petForm.temperament_ids[0], dash)}${petForm.temperament_ids.length > 1 ? ` +${petForm.temperament_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.temperament_type', '성격기질')} - ${temperamentLabel} - ${labelOf(options.optActivity, petForm.activity_level_id, dash)}`;
    }
    return `${t('master.coat_length', '털길이')} - ${labelOf(options.optCoatLength, petForm.coat_length_id, dash)} - ${labelOf(options.optGrooming, petForm.grooming_cycle_id, dash)}`;
  }, [allDiseaseOptions, breedOptionsFiltered, diseaseRows, options, petForm, petWizardStep, t]);

  function renderSelect(label: string, value: string, opts: Option[], onChange: (v: string) => void, required = false, name?: string) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={name}>{label}{required ? ' *' : ''}</label>
        <select id={name} name={name} className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{t('common.select', 'Select')}</option>
          {opts.map((o) => <option key={o.id} value={o.id}>{optionLabel(o, t('common.none', '-'))}</option>)}
        </select>
      </div>
    );
  }

  function renderDropdownRows(
    label: string,
    values: string[],
    opts: Option[],
    onChange: (next: string[]) => void,
    name?: string,
  ) {
    const selected = normalizeMultiStableIds(values, opts);
    const rows = selected.length > 0 ? selected : [''];
    const remaining = opts.filter((o) => !selected.includes(o.id));
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((rowValue, index) => {
            const rowOptions = opts.filter((o) => o.id === rowValue || !selected.includes(o.id));
            return (
              <div key={`${label}-${index}-${rowValue || 'empty'}`} style={{ display: 'flex', gap: 8 }}>
                <select
                  name={name ? `${name}-${index}` : undefined}
                  className="form-select"
                  value={rowValue}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    if (!rowValue) {
                      if (!nextValue) return;
                      onChange(normalizeUniqueIds([...selected, nextValue]));
                      return;
                    }
                    const next = [...selected];
                    if (!nextValue) next.splice(index, 1);
                    else next[index] = nextValue;
                    onChange(normalizeUniqueIds(next));
                  }}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {rowOptions.map((o) => <option key={o.id} value={o.id}>{optionLabel(o, t('common.none', '-'))}</option>)}
                </select>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onChange(selected.filter((_, i) => i !== index))}
                  disabled={!rowValue}
                  aria-label={t('common.delete', 'Delete')}
                  title={t('common.delete', 'Delete')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 6l1 14h8l1-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 10v7M14 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (remaining.length === 0) return;
                onChange(normalizeUniqueIds([...selected, remaining[0].id]));
              }}
              disabled={remaining.length === 0}
              aria-label={t('common.add', 'Add')}
              title={t('common.add', 'Add')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderDiseaseRows(
    rows: Array<{ groupId: string; diseaseId: string }>,
    onChange: (next: Array<{ groupId: string; diseaseId: string }>) => void,
  ) {
    const normalizedRows = rows
      .map((row) => {
        const groupId = normalizeSingleStableId(row.groupId, options.optDiseaseGroup);
        const diseaseId = normalizeSingleStableId(row.diseaseId, allDiseaseOptions);
        return { groupId, diseaseId };
      })
      .filter((row) => row.groupId || row.diseaseId);
    const displayRows = normalizedRows.length > 0 ? normalizedRows : [{ groupId: '', diseaseId: '' }];
    return (
      <div className="form-group">
        <label className="form-label">{t('master.disease_group', 'Disease Group')} / {t('master.disease_type', 'Disease')}</label>
        <div style={{ display: 'grid', gap: 8 }}>
          {displayRows.map((row, index) => {
            const diseaseOptions = allDiseaseOptions
              .filter((d) => !row.groupId || d.parentId === row.groupId)
              .filter((d) => d.id === row.diseaseId || !displayRows.some((r, i) => i !== index && r.diseaseId === d.id));
            return (
              <div key={`disease-row-${index}-${row.groupId}-${row.diseaseId}`} style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr auto' }}>
                <select
                  name={`pet-disease-group-${index}`}
                  className="form-select"
                  value={row.groupId}
                  onChange={(e) => {
                    const nextGroupId = e.target.value;
                    const next = [...displayRows];
                    const keepDisease = allDiseaseOptions.some((d) => d.id === next[index].diseaseId && d.parentId === nextGroupId);
                    next[index] = { groupId: nextGroupId, diseaseId: keepDisease ? next[index].diseaseId : '' };
                    onChange(next.filter((r) => r.groupId || r.diseaseId));
                  }}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {options.optDiseaseGroup.map((o) => <option key={o.id} value={o.id}>{optionLabel(o, t('common.none', '-'))}</option>)}
                </select>
                <select
                  name={`pet-disease-${index}`}
                  className="form-select"
                  value={row.diseaseId}
                  onChange={(e) => {
                    const next = [...displayRows];
                    next[index] = { ...next[index], diseaseId: e.target.value };
                    onChange(next.filter((r) => r.groupId || r.diseaseId));
                  }}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {diseaseOptions.map((o) => <option key={o.id} value={o.id}>{optionLabel(o, t('common.none', '-'))}</option>)}
                </select>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onChange(displayRows.filter((_, i) => i !== index))}
                  disabled={!row.groupId && !row.diseaseId}
                  aria-label={t('common.delete', 'Delete')}
                  title={t('common.delete', 'Delete')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 6l1 14h8l1-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 10v7M14 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onChange([...displayRows.filter((r) => r.groupId || r.diseaseId), { groupId: '', diseaseId: '' }])}
              aria-label={t('common.add', 'Add')}
              title={t('common.add', 'Add')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function savePet() {
    const stablePetTypeId = normalizeSingleStableId(petForm.pet_type_id, options.optPetType, false);
    if (!petForm.name.trim()) {
      setError(t('guardian.alert.name_required', 'Pet name is required.'));
      return;
    }
    if (!stablePetTypeId) {
      setError(t('guardian.alert.pet_type_required', 'Pet type is required.'));
      return;
    }
    if (petForm.microchip_no.trim()) {
      try {
        const dup = await api.pets.checkMicrochip(petForm.microchip_no.trim(), mode === 'edit' ? (editingPetId || activePet?.id) : undefined);
        if (!dup.available) {
          setError(dup.reason || t('guardian.alert.microchip_duplicate', 'This microchip number is already registered.'));
          return;
        }
      } catch (e) {
        setError(uiErrorMessage(e, t('guardian.alert.microchip_check_failed', '마이크로칩 중복 확인에 실패했습니다.')));
        return;
      }
    }
    if (petForm.current_weight.trim() && !Number.isFinite(Number(petForm.current_weight))) {
      setError('Current weight must be a valid number.');
      return;
    }

    const payload = {
      ...petForm,
      color_ids: normalizeMultiStableIds(petForm.color_ids, options.optColor, false),
      allergy_ids: normalizeMultiStableIds(petForm.allergy_ids, options.optAllergy, false),
      disease_history_ids: normalizeMultiStableIds(petForm.disease_history_ids, allDiseaseOptions, false),
      symptom_tag_ids: normalizeMultiStableIds(petForm.symptom_tag_ids, options.optSymptom, false),
      vaccination_ids: normalizeMultiStableIds(petForm.vaccination_ids, options.optVaccination, false),
      temperament_ids: normalizeMultiStableIds(petForm.temperament_ids, options.optTemperament, false),
      microchip_no: petForm.microchip_no.trim() || null,
      birthday: petForm.birthday || null,
      birth_date: petForm.birthday || null,
      current_weight: petForm.current_weight.trim() ? Number(petForm.current_weight) : null,
      weight_kg: petForm.current_weight.trim() ? Number(petForm.current_weight) : null,
      current_weight_measured_at: petForm.current_weight_measured_at || null,
      current_weight_notes: petForm.current_weight_notes.trim() || null,
      notes: petForm.notes.trim() || null,
      pet_type_id: stablePetTypeId,
      breed_id: normalizeSingleStableId(petForm.breed_id, options.optBreed, false) || null,
      gender_id: normalizeSingleStableId(petForm.gender_id, options.optGender, false) || null,
      neuter_status_id: petForm.neuter_status_id || null,
      life_stage_id: normalizeSingleStableId(petForm.life_stage_id, options.optLifeStage, false) || null,
      body_size_id: petForm.body_size_id || null,
      country_id: petForm.country_id || null,
      weight_unit_id: petForm.weight_unit_id || null,
      health_condition_level_id: normalizeSingleStableId(petForm.health_condition_level_id, options.optHealthLevel, false) || null,
      activity_level_id: normalizeSingleStableId(petForm.activity_level_id, options.optActivity, false) || null,
      diet_type_id: normalizeSingleStableId(petForm.diet_type_id, options.optDiet, false) || null,
      ownership_type_id: petForm.ownership_type_id || null,
      coat_length_id: normalizeSingleStableId(petForm.coat_length_id, options.optCoatLength, false) || null,
      coat_type_id: petForm.coat_type_id || null,
      grooming_cycle_id: normalizeSingleStableId(petForm.grooming_cycle_id, options.optGrooming, false) || null,
    };

    try {
      let savedPet: Pet | null = null;
      if (mode === 'create') {
        const res = await api.pets.create(payload);
        savedPet = res.pet;
      } else {
        const targetPetId = editingPetId || activePet?.id || '';
        if (!targetPetId) {
          setError(t('guardian.alert.pet_edit_target_not_found', 'Cannot find target pet for edit. Please try again.'));
          return;
        }
        const res = await api.pets.update(targetPetId, payload);
        savedPet = res.pet;
      }
      if (savedPet) {
        setActivePet(null);
        setPetForm(DEFAULT_PET_FORM);
        onSuccess(savedPet);
        onClose();
      }
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.alert.pet_save_failed', '반려동물 저장에 실패했습니다.')));
    }
  }

  function handleClose() {
    setActivePet(null);
    setPetWizardStep(1);
    setDiseaseRows([{ groupId: '', diseaseId: '' }]);
    onClose();
  }

  function gotoPetStep(step: PetWizardStep) {
    setError('');
    setPetWizardStep(step);
  }

  function gotoNextPetStep() {
    if (petWizardStep === 1 && !petForm.name.trim()) {
      setError(t('guardian.alert.name_required', 'Pet name is required.'));
      return;
    }
    if (petWizardStep === 2 && !petForm.pet_type_id) {
      setError(t('guardian.alert.pet_type_required', 'Pet type is required.'));
      return;
    }
    if (petWizardStep === 3 && !petForm.gender_id) {
      setError(t('guardian.alert.gender_required', 'Gender is required.'));
      return;
    }
    setError('');
    setPetWizardStep((prev) => (prev < 7 ? ((prev + 1) as PetWizardStep) : prev));
  }

  function gotoPrevPetStep() {
    setError('');
    setPetWizardStep((prev) => (prev > 1 ? ((prev - 1) as PetWizardStep) : prev));
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal guardian-pet-modal">
        <div className="modal-header">
          <h3 className="modal-title">{mode === 'create' ? t('guardian.modal.add_pet', 'Add Pet') : t('guardian.modal.edit_pet', 'Edit Pet')}</h3>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>
        <div className="modal-body guardian-modal-body">
          <div className="card-title mb-2">{wizardTitle}</div>

          {petWizardStep === 1 && (
            <>
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-name">{t('guardian.form.name', 'Name')} *</label>
                  <input id="pet-name" name="pet-name" className="form-input" value={petForm.name} onChange={(e) => setPetForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-microchip">{t('guardian.form.microchip', 'Microchip Number')}</label>
                  <input id="pet-microchip" name="pet-microchip" className="form-input" value={petForm.microchip_no} onChange={(e) => setPetForm((p) => ({ ...p, microchip_no: e.target.value }))} />
                </div>
              </div>
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-birthday">{t('guardian.form.birthday', 'Birthday')}</label>
                  <input id="pet-birthday" name="pet-birthday" className="form-input" type="date" value={petForm.birthday} onChange={(e) => setPetForm((p) => ({ ...p, birthday: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-weight">{t('guardian.form.current_weight', 'Current Weight')}</label>
                  <input id="pet-weight" name="pet-weight" className="form-input" type="number" step="0.01" value={petForm.current_weight} onChange={(e) => setPetForm((p) => ({ ...p, current_weight: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {petWizardStep === 2 && (
            <div className="form-row col2">
              {renderSelect(t('master.pet_type', 'Pet Type'), petForm.pet_type_id, options.optPetType, (v) => setPetForm((p) => ({ ...p, pet_type_id: v, breed_id: '' })), true, 'pet-type')}
              {renderSelect(t('master.pet_breed', 'Breed'), petForm.breed_id, breedOptionsFiltered, (v) => setPetForm((p) => ({ ...p, breed_id: v })), false, 'pet-breed')}
            </div>
          )}

          {petWizardStep === 3 && (
            <div className="form-row col2">
              {renderSelect(t('master.pet_gender', 'Gender'), petForm.gender_id, options.optGender, (v) => setPetForm((p) => ({ ...p, gender_id: v })), true, 'pet-gender')}
              {renderDropdownRows(
                t('master.pet_color', 'Primary Color'),
                petForm.color_ids,
                options.optColor,
                (next) => setPetForm((p) => ({ ...p, color_ids: normalizeUniqueIds(next) })),
                'pet-color',
              )}
            </div>
          )}

          {petWizardStep === 4 && (
            <div className="form-row col1">
              {renderDropdownRows(
                t('master.vaccination_type', 'Vaccination'),
                petForm.vaccination_ids,
                options.optVaccination,
                (next) => setPetForm((p) => ({ ...p, vaccination_ids: normalizeUniqueIds(next) })),
                'pet-vaccination',
              )}
            </div>
          )}

          {petWizardStep === 5 && (
            <div className="form-row col1">
              {renderDiseaseRows(diseaseRows, (nextRows) => {
                const dedupByDisease = new Map<string, { groupId: string; diseaseId: string }>();
                for (const row of nextRows) {
                  if (!row.groupId || !row.diseaseId) continue;
                  dedupByDisease.set(row.diseaseId, row);
                }
                const normalizedRows = Array.from(dedupByDisease.values());
                setDiseaseRows(normalizedRows.length ? normalizedRows : [{ groupId: '', diseaseId: '' }]);
                setPetForm((p) => ({ ...p, disease_history_ids: normalizedRows.map((r) => r.diseaseId) }));
              })}
            </div>
          )}

          {petWizardStep === 6 && (
            <>
              <div className="form-row col2">
                {renderDropdownRows(
                  t('master.temperament_type', 'Temperament'),
                  petForm.temperament_ids,
                  options.optTemperament,
                  (next) => setPetForm((p) => ({ ...p, temperament_ids: normalizeUniqueIds(next) })),
                  'pet-temperament',
                )}
                {renderSelect(t('master.activity_level', 'Activity Level'), petForm.activity_level_id, options.optActivity, (v) => setPetForm((p) => ({ ...p, activity_level_id: v })), false, 'pet-activity')}
              </div>
              <div className="form-row col2">
                {renderSelect(t('master.diet_type', 'Diet Type'), petForm.diet_type_id, options.optDiet, (v) => setPetForm((p) => ({ ...p, diet_type_id: v })), false, 'pet-diet')}
                {renderDropdownRows(
                  t('master.allergy_type', 'Allergy'),
                  petForm.allergy_ids,
                  options.optAllergy,
                  (next) => setPetForm((p) => ({ ...p, allergy_ids: normalizeUniqueIds(next) })),
                  'pet-allergy',
                )}
              </div>
              <div className="form-row col1">
                {renderDropdownRows(
                  t('master.symptom_type', 'Symptom'),
                  petForm.symptom_tag_ids,
                  options.optSymptom,
                  (next) => setPetForm((p) => ({ ...p, symptom_tag_ids: normalizeUniqueIds(next) })),
                  'pet-symptom',
                )}
              </div>
            </>
          )}

          {petWizardStep === 7 && (
            <>
              <div className="form-row col2">
                {renderSelect(t('master.coat_length', 'Coat Length'), petForm.coat_length_id, options.optCoatLength, (v) => setPetForm((p) => ({ ...p, coat_length_id: v })), false, 'pet-coat-length')}
                {renderSelect(t('master.grooming_cycle', 'Grooming Cycle'), petForm.grooming_cycle_id, options.optGrooming, (v) => setPetForm((p) => ({ ...p, grooming_cycle_id: v })), false, 'pet-grooming')}
              </div>
              <div className="form-row col1">
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-notes">{t('guardian.form.notes', 'Notes')}</label>
                  <textarea id="pet-notes" name="pet-notes" className="form-textarea" value={petForm.notes} onChange={(e) => setPetForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: 6, marginRight: 'auto', flexWrap: 'wrap' }}>
            {PET_WIZARD_STEPS.map(({ step, labelKey, fallback }) => {
              const label = t(labelKey, fallback);
              return (
                <button
                  key={step}
                  type="button"
                  className={`btn ${petWizardStep === step ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => gotoPetStep(step)}
                  title={label}
                >
                  {step}. {label}
                </button>
              );
            })}
          </div>
          <button className="btn btn-secondary" onClick={handleClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-secondary" onClick={gotoPrevPetStep} disabled={petWizardStep === 1}>
            {t('common.previous', 'Previous')}
          </button>
          <button className="btn btn-secondary" onClick={gotoNextPetStep} disabled={petWizardStep === 7}>
            {t('common.next', 'Next')}
          </button>
          <button className="btn btn-primary" onClick={() => void savePet()}>
            {t('common.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}
