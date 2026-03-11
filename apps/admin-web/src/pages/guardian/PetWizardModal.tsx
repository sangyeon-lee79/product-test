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
  locale: string;
  options: GuardianPetOptions;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: (savedPet: Pet) => void;
}

type MicrochipStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'error';

const MICROCHIP_PREFIX_RE = /^([A-Za-z]{2})(.+)$/;

function localeCountryCode(locale: string): string {
  const matched = locale.match(/-([A-Za-z]{2})$/);
  return matched?.[1]?.toUpperCase() || 'KR';
}

function splitMicrochipValue(rawValue: string | null | undefined, fallbackCountryCode: string) {
  const compact = String(rawValue || '').trim().replace(/\s+/g, '');
  if (!compact) return { countryCode: fallbackCountryCode, localValue: '', normalizedValue: '' };
  const prefixed = compact.match(MICROCHIP_PREFIX_RE);
  if (prefixed) {
    return {
      countryCode: prefixed[1].toUpperCase(),
      localValue: prefixed[2],
      normalizedValue: `${prefixed[1].toUpperCase()}${prefixed[2]}`,
    };
  }
  return {
    countryCode: fallbackCountryCode,
    localValue: compact,
    normalizedValue: `${fallbackCountryCode}${compact}`,
  };
}

export default function PetWizardModal({ open, mode, editingPetId, locale, options, t, setError, onClose, onSuccess }: Props) {
  const [petForm, setPetForm] = useState<PetForm>(DEFAULT_PET_FORM);
  const [petWizardStep, setPetWizardStep] = useState<PetWizardStep>(1);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [microchipCountryCode, setMicrochipCountryCode] = useState(() => localeCountryCode(locale));
  const [microchipUnknown, setMicrochipUnknown] = useState(false);
  const [microchipStatus, setMicrochipStatus] = useState<MicrochipStatus>('idle');
  const [microchipMessage, setMicrochipMessage] = useState('');
  const [lastCheckedMicrochip, setLastCheckedMicrochip] = useState('');

  const defaultCountryCode = useMemo(() => localeCountryCode(locale), [locale]);
  const immutableFieldHelp = {
    name: t('guardian.pet_form.name_locked_help', '이름은 등록 후 변경할 수 없습니다.'),
    petType: t('guardian.pet_form.pet_type_locked_help', '펫종류는 등록 후 변경할 수 없습니다.'),
    breed: t('guardian.pet_form.breed_locked_help', '품종은 등록 후 변경할 수 없습니다.'),
    gender: t('guardian.pet_form.gender_locked_help', '성별은 등록 후 변경할 수 없습니다.'),
  };

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
      setActivePet(null);
      setMicrochipCountryCode(defaultCountryCode);
      setMicrochipUnknown(false);
      setMicrochipStatus('idle');
      setMicrochipMessage('');
      setLastCheckedMicrochip('');
      return;
    }
    if (!editingPetId) return;
    const run = async () => {
      try {
        const res = await api.pets.detail(editingPetId);
        const p = res.pet;
        const splitMicrochip = splitMicrochipValue(p.microchip_no, defaultCountryCode);
        setActivePet(p);
        setPetWizardStep(1);
        setMicrochipCountryCode(splitMicrochip.countryCode);
        setMicrochipUnknown(!splitMicrochip.localValue);
        setMicrochipStatus(splitMicrochip.normalizedValue ? 'available' : 'idle');
        setMicrochipMessage(splitMicrochip.normalizedValue ? t('guardian.pet_form.microchip_available', '등록 가능한 번호입니다.') : '');
        setLastCheckedMicrochip(splitMicrochip.normalizedValue);
        setPetForm({
          name: p.name || '',
          microchip_no: splitMicrochip.localValue,
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
          disease_history_ids: normalizeMultiStableIds(p.disease_history_ids, options.optDisease),
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
  }, [defaultCountryCode, editingPetId, mode, open, options.optDisease, t]);

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
      const temperamentLabel = petForm.temperament_ids.length
        ? `${labelOf(options.optTemperament, petForm.temperament_ids[0], dash)}${petForm.temperament_ids.length > 1 ? ` +${petForm.temperament_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.temperament_type', '성격기질')} - ${temperamentLabel} - ${labelOf(options.optActivity, petForm.activity_level_id, dash)}`;
    }
    return `${t('master.coat_length', '털길이')} - ${labelOf(options.optCoatLength, petForm.coat_length_id, dash)} - ${labelOf(options.optGrooming, petForm.grooming_cycle_id, dash)}`;
  }, [breedOptionsFiltered, options, petForm, petWizardStep, t]);

  const normalizedMicrochip = useMemo(
    () => (microchipUnknown ? '' : splitMicrochipValue(petForm.microchip_no, microchipCountryCode).normalizedValue),
    [microchipCountryCode, microchipUnknown, petForm.microchip_no],
  );

  const microchipNeedsValidation = !microchipUnknown && Boolean(petForm.microchip_no.trim());
  const microchipValidationPassed = !microchipNeedsValidation || (microchipStatus === 'available' && lastCheckedMicrochip === normalizedMicrochip);
  const canSave = Boolean(
    petForm.name.trim()
      && petForm.pet_type_id
      && petForm.gender_id
      && microchipValidationPassed
      && microchipStatus !== 'checking',
  );

  function renderFieldHelp(text: string, tone: 'warning' | 'success' | 'danger' = 'warning') {
    return <p className={`pet-form-help ${tone}`}>{text}</p>;
  }

  function resetMicrochipFeedback(nextMessage = '') {
    setMicrochipStatus('idle');
    setMicrochipMessage(nextMessage);
    setLastCheckedMicrochip('');
  }

  async function runMicrochipCheck() {
    if (microchipUnknown || !petForm.microchip_no.trim()) {
      resetMicrochipFeedback('');
      return true;
    }

    const splitMicrochip = splitMicrochipValue(petForm.microchip_no, microchipCountryCode);
    setMicrochipCountryCode(splitMicrochip.countryCode);
    setPetForm((prev) => (prev.microchip_no === splitMicrochip.localValue ? prev : { ...prev, microchip_no: splitMicrochip.localValue }));
    setMicrochipStatus('checking');
    setMicrochipMessage('');

    try {
      const dup = await api.pets.checkMicrochip(
        splitMicrochip.normalizedValue,
        mode === 'edit' ? (editingPetId || activePet?.id) : undefined,
        splitMicrochip.countryCode,
      );
      if (dup.available) {
        setMicrochipStatus('available');
        setMicrochipMessage(t('guardian.pet_form.microchip_available', '등록 가능한 번호입니다.'));
        setLastCheckedMicrochip(splitMicrochip.normalizedValue);
        return true;
      }
      setMicrochipStatus('duplicate');
      setMicrochipMessage(t('guardian.alert.microchip_duplicate', '이미 등록된 마이크로칩 번호입니다.'));
      setLastCheckedMicrochip(splitMicrochip.normalizedValue);
      return false;
    } catch (e) {
      setMicrochipStatus('error');
      setMicrochipMessage(t('guardian.alert.microchip_check_failed', '마이크로칩 중복 확인에 실패했습니다.'));
      setLastCheckedMicrochip('');
      setError(uiErrorMessage(e, t('guardian.alert.microchip_check_failed', '마이크로칩 중복 확인에 실패했습니다.')));
      return false;
    }
  }

  function renderSelect(
    label: string,
    value: string,
    opts: Option[],
    onChange: (v: string) => void,
    required = false,
    name?: string,
    disabled = false,
    helpText?: string,
  ) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={name}>{label}{required ? ' *' : ''}</label>
        <select id={name} name={name} className="form-select" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          <option value="">{t('common.select', '선택')}</option>
          {opts.map((o) => <option key={o.id} value={o.id}>{optionLabel(o, t('common.none', '-'))}</option>)}
        </select>
        {helpText ? renderFieldHelp(helpText) : null}
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
                  <option value="">{t('common.select', '선택')}</option>
                  {rowOptions.map((o) => <option key={o.id} value={o.id}>{optionLabel(o, t('common.none', '-'))}</option>)}
                </select>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onChange(selected.filter((_, i) => i !== index))}
                  disabled={!rowValue}
                  aria-label={t('common.delete', '삭제')}
                  title={t('common.delete', '삭제')}
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
              aria-label={t('common.add', '추가')}
              title={t('common.add', '추가')}
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
      setError(t('guardian.alert.name_required', '반려동물 이름은 필수입니다.'));
      return;
    }
    if (!stablePetTypeId) {
      setError(t('guardian.alert.pet_type_required', '펫 종류는 필수입니다.'));
      return;
    }
    if (!petForm.gender_id) {
      setError(t('guardian.alert.gender_required', '성별은 필수입니다.'));
      return;
    }
    if (microchipNeedsValidation && !microchipValidationPassed) {
      const checked = await runMicrochipCheck();
      if (!checked) return;
    }
    if (petForm.current_weight.trim() && !Number.isFinite(Number(petForm.current_weight))) {
      setError(t('guardian.alert.current_weight_invalid', '현재 체중은 올바른 숫자여야 합니다.'));
      return;
    }

    const payload = {
      ...petForm,
      color_ids: normalizeMultiStableIds(petForm.color_ids, options.optColor, false),
      allergy_ids: normalizeMultiStableIds(petForm.allergy_ids, options.optAllergy, false),
      disease_history_ids: normalizeMultiStableIds(petForm.disease_history_ids, options.optDisease, false),
      symptom_tag_ids: normalizeMultiStableIds(petForm.symptom_tag_ids, options.optSymptom, false),
      vaccination_ids: normalizeMultiStableIds(petForm.vaccination_ids, options.optVaccination, false),
      temperament_ids: normalizeMultiStableIds(petForm.temperament_ids, options.optTemperament, false),
      microchip_no: normalizedMicrochip || null,
      country_code: microchipCountryCode,
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
          setError(t('guardian.alert.pet_edit_target_not_found', '수정할 반려동물을 찾을 수 없습니다. 다시 시도해주세요.'));
          return;
        }
        const updatePayload = Object.fromEntries(
          Object.entries(payload).filter(([key]) => !['name', 'pet_type_id', 'breed_id', 'gender_id'].includes(key)),
        ) as Partial<Pet>;
        const res = await api.pets.update(targetPetId, updatePayload);
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
    setMicrochipCountryCode(defaultCountryCode);
    setMicrochipUnknown(false);
    setMicrochipStatus('idle');
    setMicrochipMessage('');
    setLastCheckedMicrochip('');
    onClose();
  }

  function gotoPetStep(step: PetWizardStep) {
    setError('');
    setPetWizardStep(step);
  }

  function gotoNextPetStep() {
    if (petWizardStep === 1 && !petForm.name.trim()) {
      setError(t('guardian.alert.name_required', '반려동물 이름은 필수입니다.'));
      return;
    }
    if (petWizardStep === 2 && !petForm.pet_type_id) {
      setError(t('guardian.alert.pet_type_required', '펫 종류는 필수입니다.'));
      return;
    }
    if (petWizardStep === 3 && !petForm.gender_id) {
      setError(t('guardian.alert.gender_required', '성별은 필수입니다.'));
      return;
    }
    setError('');
    setPetWizardStep((prev) => (prev < 6 ? ((prev + 1) as PetWizardStep) : prev));
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
          <h3 className="modal-title">{mode === 'create' ? t('guardian.modal.add_pet', '반려동물 추가') : t('guardian.modal.edit_pet', '반려동물 수정')}</h3>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>
        <div className="modal-body guardian-modal-body">
          <div className="card-title mb-2">{wizardTitle}</div>

          {petWizardStep === 1 && (
            <>
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-name">{t('guardian.form.name', '이름')} *</label>
                  <input
                    id="pet-name"
                    name="pet-name"
                    className="form-input"
                    value={petForm.name}
                    onChange={(e) => setPetForm((p) => ({ ...p, name: e.target.value }))}
                    disabled={mode === 'edit'}
                  />
                  {renderFieldHelp(immutableFieldHelp.name)}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-microchip">{t('guardian.form.microchip', '마이크로칩 번호')}</label>
                  <div className="pet-microchip-row">
                    <span className="pet-microchip-prefix" aria-label={t('guardian.pet_form.microchip_country_code', '국가 코드')}>
                      {microchipCountryCode}
                    </span>
                    <input
                      id="pet-microchip"
                      name="pet-microchip"
                      className="form-input"
                      value={petForm.microchip_no}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        const splitMicrochip = splitMicrochipValue(nextValue, microchipCountryCode);
                        setMicrochipCountryCode(splitMicrochip.countryCode);
                        setPetForm((p) => ({ ...p, microchip_no: nextValue }));
                        resetMicrochipFeedback('');
                      }}
                      onBlur={() => { void runMicrochipCheck(); }}
                      disabled={microchipUnknown}
                      placeholder={t('guardian.pet_form.microchip_placeholder', '마이크로칩 번호를 입력하세요')}
                    />
                    <button type="button" className="btn btn-secondary pet-microchip-check-btn" onClick={() => void runMicrochipCheck()} disabled={microchipUnknown || !petForm.microchip_no.trim() || microchipStatus === 'checking'}>
                      {microchipStatus === 'checking' ? t('guardian.pet_form.microchip_checking', '확인 중...') : t('guardian.pet_form.microchip_check', '중복 확인')}
                    </button>
                  </div>
                  <label className="pet-microchip-unknown">
                    <input
                      type="checkbox"
                      checked={microchipUnknown}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setMicrochipUnknown(checked);
                        if (checked) {
                          setPetForm((p) => ({ ...p, microchip_no: '' }));
                          resetMicrochipFeedback('');
                          return;
                        }
                        setMicrochipCountryCode(defaultCountryCode);
                        resetMicrochipFeedback('');
                      }}
                    />
                    <span>{t('guardian.pet_form.microchip_unknown', '모름')}</span>
                  </label>
                  {microchipMessage
                    ? renderFieldHelp(
                      microchipMessage,
                      microchipStatus === 'available' ? 'success' : (microchipStatus === 'duplicate' || microchipStatus === 'error' ? 'danger' : 'warning'),
                    )
                    : null}
                </div>
              </div>
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-birthday">{t('guardian.form.birthday', '생일')}</label>
                  <input id="pet-birthday" name="pet-birthday" className="form-input" type="date" value={petForm.birthday} onChange={(e) => setPetForm((p) => ({ ...p, birthday: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-weight">{t('guardian.form.current_weight', '현재 체중')}</label>
                  <input id="pet-weight" name="pet-weight" className="form-input" type="number" step="0.01" value={petForm.current_weight} onChange={(e) => setPetForm((p) => ({ ...p, current_weight: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {petWizardStep === 2 && (
            <div className="form-row col2">
              {renderSelect(t('master.pet_type', '펫종류'), petForm.pet_type_id, options.optPetType, (v) => setPetForm((p) => ({ ...p, pet_type_id: v, breed_id: '' })), true, 'pet-type', mode === 'edit', immutableFieldHelp.petType)}
              {renderSelect(t('master.pet_breed', '품종'), petForm.breed_id, breedOptionsFiltered, (v) => setPetForm((p) => ({ ...p, breed_id: v })), false, 'pet-breed', mode === 'edit', immutableFieldHelp.breed)}
            </div>
          )}

          {petWizardStep === 3 && (
            <div className="form-row col2">
              {renderSelect(t('master.pet_gender', '성별'), petForm.gender_id, options.optGender, (v) => setPetForm((p) => ({ ...p, gender_id: v })), true, 'pet-gender', mode === 'edit', immutableFieldHelp.gender)}
              {renderDropdownRows(
                t('master.pet_color', '대표 색상'),
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
                t('master.vaccination_type', '예방접종'),
                petForm.vaccination_ids,
                options.optVaccination,
                (next) => setPetForm((p) => ({ ...p, vaccination_ids: normalizeUniqueIds(next) })),
                'pet-vaccination',
              )}
            </div>
          )}

          {petWizardStep === 5 && (
            <>
              <div className="form-row col2">
                {renderDropdownRows(
                  t('master.temperament_type', '성격기질'),
                  petForm.temperament_ids,
                  options.optTemperament,
                  (next) => setPetForm((p) => ({ ...p, temperament_ids: normalizeUniqueIds(next) })),
                  'pet-temperament',
                )}
                {renderSelect(t('master.activity_level', '활동량'), petForm.activity_level_id, options.optActivity, (v) => setPetForm((p) => ({ ...p, activity_level_id: v })), false, 'pet-activity')}
              </div>
              <div className="form-row col2">
                {renderSelect(t('master.diet_type', '식단 유형'), petForm.diet_type_id, options.optDiet, (v) => setPetForm((p) => ({ ...p, diet_type_id: v })), false, 'pet-diet')}
                {renderDropdownRows(
                  t('master.allergy_type', '알레르기'),
                  petForm.allergy_ids,
                  options.optAllergy,
                  (next) => setPetForm((p) => ({ ...p, allergy_ids: normalizeUniqueIds(next) })),
                  'pet-allergy',
                )}
              </div>
              <div className="form-row col1">
                {renderDropdownRows(
                  t('master.symptom_type', '증상'),
                  petForm.symptom_tag_ids,
                  options.optSymptom,
                  (next) => setPetForm((p) => ({ ...p, symptom_tag_ids: normalizeUniqueIds(next) })),
                  'pet-symptom',
                )}
              </div>
            </>
          )}

          {petWizardStep === 6 && (
            <>
              <div className="form-row col2">
                {renderSelect(t('master.coat_length', '털 길이'), petForm.coat_length_id, options.optCoatLength, (v) => setPetForm((p) => ({ ...p, coat_length_id: v })), false, 'pet-coat-length')}
                {renderSelect(t('master.grooming_cycle', '그루밍 주기'), petForm.grooming_cycle_id, options.optGrooming, (v) => setPetForm((p) => ({ ...p, grooming_cycle_id: v })), false, 'pet-grooming')}
              </div>
              <div className="form-row col1">
                <div className="form-group">
                  <label className="form-label" htmlFor="pet-notes">{t('guardian.form.notes', '메모')}</label>
                  <textarea id="pet-notes" name="pet-notes" className="form-textarea" value={petForm.notes} onChange={(e) => setPetForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: 4, marginRight: 'auto', flexWrap: 'wrap' }}>
            {PET_WIZARD_STEPS.map(({ step, labelKey, fallback, emoji }) => {
              const label = t(labelKey, fallback);
              return (
                <button
                  key={step}
                  type="button"
                  className={`btn ${petWizardStep === step ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => gotoPetStep(step)}
                  title={label}
                  style={{ flex: 1, minWidth: 0, padding: '6px 4px', fontSize: 13 }}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          <button className="btn btn-secondary" onClick={handleClose}>{t('common.cancel', '취소')}</button>
          <button className="btn btn-secondary" onClick={gotoPrevPetStep} disabled={petWizardStep === 1}>
            {t('common.previous', '이전')}
          </button>
          <button className="btn btn-secondary" onClick={gotoNextPetStep} disabled={petWizardStep === 6}>
            {t('common.next', '다음')}
          </button>
          <button className="btn btn-primary" onClick={() => void savePet()} disabled={!canSave}>
            {t('common.save', '저장')}
          </button>
        </div>
      </div>
    </div>
  );
}
