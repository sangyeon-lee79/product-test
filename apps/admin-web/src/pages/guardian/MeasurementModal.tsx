// 질병 수치 추가/수정 모달 — 단일 페이지 (등록 장비 선택 → 수치 입력)
import { useEffect, useMemo, useState } from 'react';
import { api, type DeviceBrand, type DeviceManufacturer, type DeviceModel, type GuardianDevice, type MeasurementUnit, type Pet, type PetHealthMeasurementLog } from '../../lib/api';
import type { Lang } from '../../lib/i18n';
import {
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
  guardianDevices: GuardianDevice[];
  optDisease: Option[];
  optDiseaseDevice: Option[];
  optMeasurement: Option[];
  optMeasurementContext: Option[];
  lang: Lang;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
  onOpenDeviceManage: () => void;
}

export default function MeasurementModal({
  open, editingLog, selectedPet, guardianDevices,
  optDisease, optDiseaseDevice, optMeasurement, optMeasurementContext,
  lang, t, setError, onClose, onSuccess, onOpenDeviceManage,
}: Props) {
  const [measurementForm, setMeasurementForm] = useState<MeasurementForm>(EMPTY_MEASUREMENT_FORM);
  // Fallback cascade state (for manual entry when no registered devices)
  const [deviceManufacturers, setDeviceManufacturers] = useState<DeviceManufacturer[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<DeviceBrand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnit[]>([]);
  const [showManualDevice, setShowManualDevice] = useState(false);

  const hasRegisteredDevices = guardianDevices.length > 0;

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
    setShowManualDevice(false);
  }

  // Populate form when modal opens
  useEffect(() => {
    if (!open) return;
    if (editingLog) {
      setMeasurementForm({
        guardian_device_id: (editingLog as unknown as Record<string, unknown>).guardian_device_id as string || '',
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
      setShowManualDevice(false);
    } else {
      resetMeasurementForm();
      // Auto-select default device
      const defaultDevice = guardianDevices.find((d) => d.is_default && d.status === 'active');
      if (defaultDevice) {
        selectDevice(defaultDevice);
      }
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

  function selectDevice(d: GuardianDevice) {
    setMeasurementForm((prev) => ({
      ...prev,
      guardian_device_id: d.id,
      disease_item_id: d.disease_item_id || prev.disease_item_id,
      device_type_item_id: d.type_key ? (optDiseaseDevice.find((o) => o.key === d.type_key)?.id || prev.device_type_item_id) : prev.device_type_item_id,
      model_id: d.device_model_id || prev.model_id,
      // Reset dependent fields when device changes
      measurement_item_id: prev.guardian_device_id !== d.id ? '' : prev.measurement_item_id,
      measurement_context_id: prev.guardian_device_id !== d.id ? '' : prev.measurement_context_id,
    }));
    setShowManualDevice(false);
  }

  // Load units
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      try {
        const units = await api.devices.public.units();
        setMeasurementUnits(units);
      } catch { /* ignore */ }
    };
    void run();
  }, [open]);

  // Load manufacturers when manual device type changes
  useEffect(() => {
    if (!open || !showManualDevice) return;
    const run = async () => {
      try {
        const mfrs = await api.devices.public.manufacturers(measurementForm.device_type_item_id || undefined);
        setDeviceManufacturers(mfrs);
      } catch { /* ignore */ }
    };
    void run();
  }, [open, showManualDevice, measurementForm.device_type_item_id]);

  // Load brands when manual manufacturer changes
  useEffect(() => {
    if (!open || !showManualDevice) return;
    if (!measurementForm.manufacturer_id) { setDeviceBrands([]); return; }
    const run = async () => {
      try {
        const rows = await api.devices.public.brands(measurementForm.manufacturer_id);
        setDeviceBrands(rows);
      } catch { /* ignore */ }
    };
    void run();
  }, [open, showManualDevice, measurementForm.manufacturer_id]);

  // Load models when manual filter changes
  useEffect(() => {
    if (!open || !showManualDevice) return;
    if (!measurementForm.device_type_item_id && !measurementForm.manufacturer_id && !measurementForm.brand_id) { setDeviceModels([]); return; }
    const run = async () => {
      try {
        const rows = await api.devices.public.models({
          device_type_id: measurementForm.device_type_item_id || undefined,
          manufacturer_id: measurementForm.manufacturer_id || undefined,
          brand_id: measurementForm.brand_id || undefined,
        });
        setDeviceModels(rows);
      } catch { /* ignore */ }
    };
    void run();
  }, [open, showManualDevice, measurementForm.device_type_item_id, measurementForm.manufacturer_id, measurementForm.brand_id]);

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

  function deviceLabel(d: GuardianDevice): string {
    return d.model_display_label || d.model_name || d.model_code || d.device_model_id;
  }

  function deviceSubLabel(d: GuardianDevice): string {
    const parts: string[] = [];
    const typeName = d.type_display_label || d.type_name_ko || d.type_name_en || '';
    if (typeName) parts.push(typeName);
    const mfr = d.mfr_display_label || d.mfr_name_ko || d.mfr_name_en || '';
    const brand = d.brand_display_label || d.brand_name_ko || d.brand_name_en || '';
    if (mfr && brand) parts.push(`${mfr} > ${brand}`);
    else if (mfr) parts.push(mfr);
    else if (brand) parts.push(brand);
    return parts.join(' · ');
  }

  async function saveMeasurement() {
    if (!selectedPet?.id) return;
    const stableDiseaseId = normalizeSingleStableId(measurementForm.disease_item_id, optDisease, false);
    const stableDeviceTypeId = normalizeSingleStableId(measurementForm.device_type_item_id, optDiseaseDevice, false);
    const stableMeasurementItemId = normalizeSingleStableId(measurementForm.measurement_item_id, optMeasurement, false);
    const stableMeasurementContextId = normalizeSingleStableId(measurementForm.measurement_context_id, optMeasurementContext, false);
    const stableUnitId = normalizeSingleStableId(measurementForm.unit_item_id, measurementUnitOptions, false);
    const value = Number(measurementForm.value);
    if (!stableDiseaseId) { setError(t('guardian.health.disease_required', 'Please select a disease.')); return; }
    if (!stableMeasurementItemId) { setError(t('guardian.health.measurement_item_required', 'Please select a measurement item.')); return; }
    if (!measurementForm.measured_at) { setError(t('guardian.health.measured_at_required', 'Please enter measured date/time.')); return; }
    if (!Number.isFinite(value)) { setError(t('guardian.health.measurement_value_invalid', 'Please enter a valid measurement value.')); return; }

    try {
      const payload = {
        disease_item_id: stableDiseaseId,
        device_type_item_id: stableDeviceTypeId || null,
        device_model_id: measurementForm.model_id || null,
        guardian_device_id: measurementForm.guardian_device_id || null,
        measurement_item_id: stableMeasurementItemId,
        measurement_context_id: stableMeasurementContextId || null,
        value,
        unit_item_id: stableUnitId || null,
        measured_at: measurementForm.measured_at || new Date().toISOString(),
        memo: measurementForm.memo.trim() || null,
      };
      if (editingLog) {
        await api.pets.healthMeasurements.update(selectedPet.id, editingLog.id, payload);
      } else {
        await api.pets.healthMeasurements.create(selectedPet.id, payload);
      }
      resetMeasurementForm();
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, editingLog
        ? t('guardian.health.measurement_update_failed', 'Failed to update health measurement log.')
        : t('guardian.health.measurement_create_failed', 'Failed to add health measurement log.')));
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editingLog
              ? t('guardian.health.measurement.edit', '질병 수치 수정')
              : t('guardian.health.measurement.add', '질병 수치 추가')}
          </h3>
          <button className="modal-close" onClick={() => { resetMeasurementForm(); onClose(); }}>&times;</button>
        </div>
        <div className="modal-body">

          {/* ── Step 1: Registered device selection ── */}
          {hasRegisteredDevices && !editingLog && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                {t('guardian.health.measurement.select_registered_device', '등록된 장비에서 선택')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {guardianDevices.filter((d) => d.status === 'active').map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => selectDevice(d)}
                    style={{
                      border: measurementForm.guardian_device_id === d.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      background: measurementForm.guardian_device_id === d.id ? 'var(--primary-light, #fffbeb)' : 'var(--surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {deviceLabel(d)}
                      {d.nickname && <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 6 }}>({d.nickname})</span>}
                      {!!d.is_default && <span style={{ fontSize: 11, background: 'var(--primary)', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 6 }}>{t('guardian.device.is_default', '기본')}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{deviceSubLabel(d)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasRegisteredDevices && !editingLog && (
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, textAlign: 'center' }}>
              <p className="text-sm text-muted" style={{ margin: '0 0 8px' }}>
                {t('guardian.device.no_devices', '등록된 장비가 없습니다')}
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => { onClose(); onOpenDeviceManage(); }}>
                {t('guardian.device.manage_title', '내 측정 장비')} →
              </button>
            </div>
          )}

          {/* ── Manual device toggle (fallback) ── */}
          {!editingLog && (
            <div style={{ marginBottom: 12, textAlign: 'right' }}>
              <button
                className="btn btn-sm"
                style={{ fontSize: 12 }}
                onClick={() => {
                  setShowManualDevice(!showManualDevice);
                  if (!showManualDevice) setMeasurementForm((p) => ({ ...p, guardian_device_id: '' }));
                }}
              >
                {showManualDevice ? t('guardian.health.measurement.select_registered_device', '등록된 장비에서 선택') : t('guardian.health.measurement.device_type', '장치 직접 선택')}
              </button>
            </div>
          )}

          {/* ── Disease selection ── */}
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

          {/* ── Manual cascade (only if editing or manual mode) ── */}
          {(showManualDevice || editingLog) && (
            <>
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

          {/* ── Measurement fields ── */}
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
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => { resetMeasurementForm(); onClose(); }}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" onClick={() => void saveMeasurement()}>
            {t('common.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}
