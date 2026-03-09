// 질병 수치 추가/수정 모달 — GuardianMainPage에서 분리
import { useEffect, useMemo, useState } from 'react';
import { api, type DeviceBrand, type DeviceManufacturer, type DeviceModel, type MeasurementUnit, type Pet, type PetHealthMeasurementLog } from '../../lib/api';
import type { Lang } from '../../lib/i18n';
import {
  type MeasurementWizardStep,
  type Option,
  type MeasurementForm,
  EMPTY_MEASUREMENT_FORM,
  normalizeSingleStableId,
  normalizeMultiStableIds,
  toDatetimeLocal,
  uiErrorMessage,
} from './guardianTypes';

interface Props {
  open: boolean;
  editingLog: PetHealthMeasurementLog | null;
  selectedPet: Pet | null;
  optDisease: Option[];
  optDiseaseDevice: Option[];
  optMeasurement: Option[];
  optMeasurementContext: Option[];
  lang: Lang;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MeasurementModal({
  open, editingLog, selectedPet,
  optDisease, optDiseaseDevice, optMeasurement, optMeasurementContext,
  lang, t, setError, onClose, onSuccess,
}: Props) {
  const [measurementWizardStep, setMeasurementWizardStep] = useState<MeasurementWizardStep>(1);
  const [measurementForm, setMeasurementForm] = useState<MeasurementForm>(EMPTY_MEASUREMENT_FORM);
  const [deviceManufacturers, setDeviceManufacturers] = useState<DeviceManufacturer[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<DeviceBrand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnit[]>([]);

  const optionLabel = (option: Option | undefined, fallback: string): string => {
    if (!option) return fallback;
    if (option.i18nKey) {
      const translated = t(option.i18nKey, '').trim();
      if (translated) return translated;
    }
    return (option.label || '').trim() || fallback;
  };

  function renderSelect(label: string, value: string, options: Array<{ id: string; key: string; label: string }>, onChange: (v: string) => void, required = false) {
    return (
      <div className="form-group">
        <label className="form-label">{label}{required ? ' *' : ''}</label>
        <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{t('common.select', 'Select')}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{optionLabel(o as Option, t('common.none', '-'))}</option>)}
        </select>
      </div>
    );
  }

  function resetMeasurementForm(nextMeasuredAt?: string) {
    setMeasurementForm({ ...EMPTY_MEASUREMENT_FORM, measured_at: nextMeasuredAt || '' });
  }

  // Populate form when modal opens or editingLog changes
  useEffect(() => {
    if (!open) return;
    if (editingLog) {
      setMeasurementForm({
        disease_item_id: editingLog.disease_item_id || '',
        device_type_item_id: editingLog.device_type_item_id || '',
        measurement_item_id: editingLog.measurement_item_id || '',
        measurement_context_id: editingLog.measurement_context_id || '',
        manufacturer_id: '',
        brand_id: '',
        model_id: editingLog.device_model_id || '',
        value: String(editingLog.value ?? ''),
        unit_item_id: editingLog.unit_item_id || '',
        measured_at: toDatetimeLocal(editingLog.measured_at),
        memo: editingLog.memo || '',
      });
      setMeasurementWizardStep(1);
    } else {
      resetMeasurementForm();
      setMeasurementWizardStep(1);
      const run = async () => {
        let measuredAt = toDatetimeLocal();
        try {
          const health = await api.health();
          if (health.timestamp) measuredAt = toDatetimeLocal(health.timestamp);
        } catch { /* fallback to client now */ }
        setMeasurementForm((prev) => ({ ...prev, measured_at: measuredAt }));
      };
      void run();
    }
  }, [open, editingLog?.id]);

  // Load manufacturers + units when modal opens or device_type_item_id changes
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      try {
        const [manufacturers, units] = await Promise.all([
          api.devices.public.manufacturers(measurementForm.device_type_item_id || undefined),
          api.devices.public.units(),
        ]);
        setDeviceManufacturers(manufacturers);
        setMeasurementUnits(units);
      } catch (e) {
        setError(uiErrorMessage(e, t('guardian.health.device_unit_load_failed', 'Failed to load device/unit data.')));
      }
    };
    run();
  }, [open, measurementForm.device_type_item_id]);

  // Load brands when manufacturer changes
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      if (!measurementForm.manufacturer_id) {
        setDeviceBrands([]);
        return;
      }
      try {
        const rows = await api.devices.public.brands(measurementForm.manufacturer_id);
        setDeviceBrands(rows);
      } catch (e) {
        setError(uiErrorMessage(e, t('guardian.health.brand_load_failed', 'Failed to load brand data.')));
      }
    };
    run();
  }, [open, measurementForm.manufacturer_id]);

  // Reset brand when brands list changes and current brand is no longer valid
  useEffect(() => {
    if (!open) return;
    if (!measurementForm.manufacturer_id) return;
    if (!measurementForm.brand_id) return;
    if (deviceBrands.some((row) => row.id === measurementForm.brand_id)) return;
    setMeasurementForm((prev) => ({ ...prev, brand_id: '', model_id: '' }));
  }, [open, deviceBrands, measurementForm.manufacturer_id, measurementForm.brand_id]);

  // Load models when device filter changes
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      if (!measurementForm.device_type_item_id && !measurementForm.manufacturer_id && !measurementForm.brand_id) {
        setDeviceModels([]);
        return;
      }
      try {
        const rows = await api.devices.public.models({
          device_type_id: measurementForm.device_type_item_id || undefined,
          manufacturer_id: measurementForm.manufacturer_id || undefined,
          brand_id: measurementForm.brand_id || undefined,
        });
        setDeviceModels(rows);
      } catch (e) {
        setError(uiErrorMessage(e, t('guardian.health.model_load_failed', 'Failed to load model data.')));
      }
    };
    run();
  }, [open, measurementForm.device_type_item_id, measurementForm.manufacturer_id, measurementForm.brand_id]);

  // Auto-fill manufacturer/brand from model
  useEffect(() => {
    if (!open) return;
    if (!measurementForm.model_id) return;
    const matchedModel = deviceModels.find((row) => row.id === measurementForm.model_id);
    if (!matchedModel) return;
    setMeasurementForm((prev) => ({
      ...prev,
      manufacturer_id: prev.manufacturer_id || matchedModel.manufacturer_id || '',
      brand_id: prev.brand_id || matchedModel.brand_id || '',
    }));
  }, [open, deviceModels, measurementForm.model_id]);

  // Auto-set default unit
  useEffect(() => {
    if (!open) return;
    if (measurementForm.unit_item_id) return;
    const defaultUnit = measurementUnitOptions[0];
    if (defaultUnit) {
      setMeasurementForm((prev) => ({ ...prev, unit_item_id: defaultUnit.id }));
    }
  }, [open, measurementForm.unit_item_id]);

  const diseaseOptionsForHealth = useMemo(() => {
    const selectedIds = normalizeMultiStableIds(selectedPet?.disease_history_ids, optDisease);
    if (!selectedIds.length) return optDisease;
    const set = new Set(selectedIds);
    return optDisease.filter((item) => set.has(item.id));
  }, [optDisease, selectedPet?.disease_history_ids]);

  const healthDeviceOptions = useMemo(
    () => optDiseaseDevice.filter((item) => !measurementForm.disease_item_id || item.parentId === measurementForm.disease_item_id),
    [optDiseaseDevice, measurementForm.disease_item_id],
  );

  const healthMeasurementOptions = useMemo(
    () => optMeasurement.filter((item) => !measurementForm.device_type_item_id || item.parentId === measurementForm.device_type_item_id),
    [optMeasurement, measurementForm.device_type_item_id],
  );

  const healthContextOptions = useMemo(
    () => optMeasurementContext.filter((item) => !measurementForm.measurement_item_id || item.parentId === measurementForm.measurement_item_id),
    [optMeasurementContext, measurementForm.measurement_item_id],
  );

  const manufacturerOptions = useMemo(
    () => deviceManufacturers
      .filter((row) => row.status === 'active')
      .map((row) => ({
        id: row.id,
        key: row.key,
        label: (row.display_label || '').trim() || (lang === 'ko' ? (row.name_ko || row.name_en || row.key) : (row.name_en || row.name_ko || row.key)),
      })),
    [deviceManufacturers, lang],
  );

  const brandOptions = useMemo(
    () => deviceBrands
      .filter((row) => row.status === 'active')
      .map((row) => ({
        id: row.id,
        key: row.name_en || row.name_ko || row.id,
        label: lang === 'ko' ? (row.name_ko || row.name_en || row.id) : (row.name_en || row.name_ko || row.id),
      })),
    [deviceBrands, lang],
  );

  const modelOptions = useMemo(
    () => deviceModels
      .filter((row) => row.status === 'active')
      .map((row) => ({ id: row.id, key: row.model_code || row.model_name || row.id, label: row.model_name || row.model_code || row.id })),
    [deviceModels],
  );

  const measurementUnitOptions = useMemo(
    () => measurementUnits
      .filter((row) => row.status === 'active')
      .map((row) => ({ id: row.id, key: row.key || row.id, label: row.symbol ? `${row.name} (${row.symbol})` : row.name })),
    [measurementUnits],
  );

  async function createHealthMeasurementLog() {
    if (!selectedPet?.id) return;
    const stableDiseaseId = normalizeSingleStableId(measurementForm.disease_item_id, optDisease, false);
    const stableDeviceTypeId = normalizeSingleStableId(measurementForm.device_type_item_id, optDiseaseDevice, false);
    const stableMeasurementItemId = normalizeSingleStableId(measurementForm.measurement_item_id, optMeasurement, false);
    const stableMeasurementContextId = normalizeSingleStableId(measurementForm.measurement_context_id, optMeasurementContext, false);
    const stableUnitId = normalizeSingleStableId(measurementForm.unit_item_id, measurementUnitOptions, false);
    const value = Number(measurementForm.value);
    if (!stableDiseaseId) { setError(t('guardian.health.disease_required', 'Please select a disease.')); return; }
    if (!stableDeviceTypeId) { setError(t('guardian.health.device_type_required', 'Please select a device type.')); return; }
    if (!stableMeasurementItemId) { setError(t('guardian.health.measurement_item_required', 'Please select a measurement item.')); return; }
    if (!measurementForm.measured_at) { setError(t('guardian.health.measured_at_required', 'Please enter measured date/time.')); return; }
    if (!Number.isFinite(value)) { setError(t('guardian.health.measurement_value_invalid', 'Please enter a valid measurement value.')); return; }
    try {
      await api.pets.healthMeasurements.create(selectedPet.id, {
        disease_item_id: stableDiseaseId,
        device_type_item_id: stableDeviceTypeId || null,
        device_model_id: measurementForm.model_id || null,
        measurement_item_id: stableMeasurementItemId,
        measurement_context_id: stableMeasurementContextId || null,
        value,
        unit_item_id: stableUnitId || null,
        measured_at: measurementForm.measured_at || new Date().toISOString(),
        memo: measurementForm.memo.trim() || null,
      });
      setMeasurementWizardStep(1);
      resetMeasurementForm();
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.measurement_create_failed', 'Failed to add health measurement log.')));
    }
  }

  async function updateHealthMeasurementLog() {
    if (!selectedPet?.id || !editingLog?.id) return;
    const stableDiseaseId = normalizeSingleStableId(measurementForm.disease_item_id, optDisease, false);
    const stableDeviceTypeId = normalizeSingleStableId(measurementForm.device_type_item_id, optDiseaseDevice, false);
    const stableMeasurementItemId = normalizeSingleStableId(measurementForm.measurement_item_id, optMeasurement, false);
    const stableMeasurementContextId = normalizeSingleStableId(measurementForm.measurement_context_id, optMeasurementContext, false);
    const stableUnitId = normalizeSingleStableId(measurementForm.unit_item_id, measurementUnitOptions, false);
    const value = Number(measurementForm.value);
    if (!stableDiseaseId) { setError(t('guardian.health.disease_required', 'Please select a disease.')); return; }
    if (!stableDeviceTypeId) { setError(t('guardian.health.device_type_required', 'Please select a device type.')); return; }
    if (!stableMeasurementItemId) { setError(t('guardian.health.measurement_item_required', 'Please select a measurement item.')); return; }
    if (!measurementForm.measured_at) { setError(t('guardian.health.measured_at_required', 'Please enter measured date/time.')); return; }
    if (!Number.isFinite(value)) { setError(t('guardian.health.measurement_value_invalid', 'Please enter a valid measurement value.')); return; }
    try {
      await api.pets.healthMeasurements.update(selectedPet.id, editingLog.id, {
        disease_item_id: stableDiseaseId,
        device_type_item_id: stableDeviceTypeId || null,
        device_model_id: measurementForm.model_id || null,
        measurement_item_id: stableMeasurementItemId,
        measurement_context_id: stableMeasurementContextId || null,
        value,
        unit_item_id: stableUnitId || null,
        measured_at: measurementForm.measured_at || new Date().toISOString(),
        memo: measurementForm.memo.trim() || null,
      });
      setMeasurementWizardStep(1);
      resetMeasurementForm();
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.measurement_update_failed', 'Failed to update health measurement log.')));
    }
  }

  function handleClose() {
    setMeasurementWizardStep(1);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingLog
              ? t('guardian.health.measurement.edit', '질병 수치 수정')
              : t('guardian.health.measurement.add', '질병 수치 추가')}
          </h3>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="pet-wizard-steps mb-2">
            <button className={`pet-wizard-step ${measurementWizardStep === 1 ? 'active' : ''}`} type="button">1 / 2</button>
            <button className={`pet-wizard-step ${measurementWizardStep === 2 ? 'active' : ''}`} type="button">2 / 2</button>
          </div>

          {measurementWizardStep === 1 && (
            <>
              {renderSelect(t('guardian.health.measurement.disease', '질병'), measurementForm.disease_item_id, diseaseOptionsForHealth, (v) => setMeasurementForm((prev) => ({
                ...prev,
                disease_item_id: v,
                device_type_item_id: '',
                manufacturer_id: '',
                brand_id: '',
                model_id: '',
                measurement_item_id: '',
                measurement_context_id: '',
              })), true)}
              {renderSelect(t('guardian.health.measurement.device_type', '장치 유형'), measurementForm.device_type_item_id, healthDeviceOptions, (v) => setMeasurementForm((prev) => ({
                ...prev,
                device_type_item_id: v,
                manufacturer_id: '',
                brand_id: '',
                model_id: '',
                measurement_item_id: '',
                measurement_context_id: '',
              })), true)}
              {renderSelect(t('guardian.health.measurement.manufacturer', '제조사'), measurementForm.manufacturer_id, manufacturerOptions, (v) => setMeasurementForm((prev) => ({
                ...prev,
                manufacturer_id: v,
                brand_id: '',
                model_id: '',
              })))}
              {renderSelect(t('guardian.health.measurement.brand', '브랜드'), measurementForm.brand_id, brandOptions, (v) => setMeasurementForm((prev) => ({
                ...prev,
                brand_id: v,
                model_id: '',
              })))}
              {renderSelect(t('guardian.health.measurement.model', '모델'), measurementForm.model_id, modelOptions, (v) => setMeasurementForm((prev) => ({ ...prev, model_id: v })))}
            </>
          )}

          {measurementWizardStep === 2 && (
            <>
              {renderSelect(t('guardian.health.measurement.item', '측정항목'), measurementForm.measurement_item_id, healthMeasurementOptions, (v) => setMeasurementForm((prev) => ({
                ...prev,
                measurement_item_id: v,
                measurement_context_id: '',
              })), true)}
              {renderSelect(t('guardian.health.measurement.context', '측정 컨텍스트'), measurementForm.measurement_context_id, healthContextOptions, (v) => setMeasurementForm((prev) => ({ ...prev, measurement_context_id: v })))}
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">{t('guardian.health.measurement.value', '수치 값')} *</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={measurementForm.value}
                    onChange={(e) => setMeasurementForm((prev) => ({ ...prev, value: e.target.value }))}
                  />
                </div>
                {renderSelect(t('guardian.health.measurement.unit', '단위'), measurementForm.unit_item_id, measurementUnitOptions, (v) => setMeasurementForm((prev) => ({ ...prev, unit_item_id: v })))}
              </div>
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">{t('guardian.health.measurement.measured_at', '측정일')} *</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={measurementForm.measured_at}
                    onChange={(e) => setMeasurementForm((prev) => ({ ...prev, measured_at: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('guardian.health.measurement.memo', '메모')}</label>
                  <input
                    className="form-input"
                    value={measurementForm.memo}
                    onChange={(e) => setMeasurementForm((prev) => ({ ...prev, memo: e.target.value }))}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          {measurementWizardStep === 1 ? (
            <>
              <button className="btn btn-secondary" onClick={handleClose}>{t('common.cancel', 'Cancel')}</button>
              <button
                className="btn btn-primary"
                onClick={() => setMeasurementWizardStep(2)}
                disabled={!measurementForm.disease_item_id || !measurementForm.device_type_item_id}
              >
                {t('common.next', '다음')} &gt;
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setMeasurementWizardStep(1)}>&lt; {t('common.previous', '이전')}</button>
              <button className="btn btn-primary" onClick={() => void (editingLog ? updateHealthMeasurementLog() : createHealthMeasurementLog())}>
                {t('common.save', 'Save')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
