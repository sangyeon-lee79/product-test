// 장비 관리 모달 — 등록된 측정 장비 목록, 추가, 수정, 삭제
import { useEffect, useMemo, useState } from 'react';
import { api, type DeviceBrand, type DeviceManufacturer, type DeviceModel, type GuardianDevice, type Pet } from '../../lib/api';
import type { Lang } from '../../lib/i18n';
import { type Option, uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  selectedPet: Pet | null;
  optDisease: Option[];
  optDiseaseDevice: Option[];
  lang: Lang;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onChanged: (devices: GuardianDevice[]) => void;
}

const EMPTY_FORM = {
  device_type_item_id: '',
  manufacturer_id: '',
  brand_id: '',
  model_id: '',
  disease_item_id: '',
  nickname: '',
  is_default: false,
};

export default function DeviceManageModal({
  open, selectedPet, optDisease, optDiseaseDevice,
  lang, t, setError, onClose, onChanged,
}: Props) {
  const [devices, setDevices] = useState<GuardianDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // cascade state
  const [manufacturers, setManufacturers] = useState<DeviceManufacturer[]>([]);
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);

  const petId = selectedPet?.id;

  async function loadDevices() {
    if (!petId) return;
    setLoading(true);
    try {
      const res = await api.pets.guardianDevices.list(petId);
      setDevices(res.devices);
      onChanged(res.devices);
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.network', 'Failed to load data.')));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && petId) void loadDevices();
  }, [open, petId]);

  // Load manufacturers when device type changes
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      try {
        const rows = await api.devices.public.manufacturers(form.device_type_item_id || undefined);
        setManufacturers(rows);
      } catch { /* ignore */ }
    };
    void run();
  }, [open, form.device_type_item_id]);

  // Load brands when manufacturer changes
  useEffect(() => {
    if (!open || !form.manufacturer_id) { setBrands([]); return; }
    const run = async () => {
      try {
        const rows = await api.devices.public.brands(form.manufacturer_id);
        setBrands(rows);
      } catch { /* ignore */ }
    };
    void run();
  }, [open, form.manufacturer_id]);

  // Load models when filter changes
  useEffect(() => {
    if (!open) return;
    if (!form.device_type_item_id && !form.manufacturer_id && !form.brand_id) { setModels([]); return; }
    const run = async () => {
      try {
        const rows = await api.devices.public.models({
          device_type_id: form.device_type_item_id || undefined,
          manufacturer_id: form.manufacturer_id || undefined,
          brand_id: form.brand_id || undefined,
        });
        setModels(rows);
      } catch { /* ignore */ }
    };
    void run();
  }, [open, form.device_type_item_id, form.manufacturer_id, form.brand_id]);

  const diseaseOptionsForPet = useMemo(() => {
    if (!selectedPet?.disease_history_ids) return optDisease;
    let ids: string[] = [];
    try {
      const raw = selectedPet.disease_history_ids;
      ids = Array.isArray(raw) ? raw : JSON.parse(raw as string) as string[];
    } catch { return optDisease; }
    if (!ids.length) return optDisease;
    const set = new Set(ids);
    const filtered = optDisease.filter((o) => set.has(o.id));
    return filtered.length ? filtered : optDisease;
  }, [optDisease, selectedPet?.disease_history_ids]);

  const deviceTypeOptions = useMemo(
    () => optDiseaseDevice.filter((item) => !form.disease_item_id || item.parentId === form.disease_item_id),
    [optDiseaseDevice, form.disease_item_id],
  );

  const mfrOptions = useMemo(
    () => manufacturers.filter((r) => r.status === 'active').map((r) => ({
      id: r.id, key: r.key,
      label: (r.display_label || '').trim() || (lang === 'ko' ? (r.name_ko || r.name_en || r.key) : (r.name_en || r.name_ko || r.key)),
    })),
    [manufacturers, lang],
  );

  const brandOptions = useMemo(
    () => brands.filter((r) => r.status === 'active').map((r) => ({
      id: r.id, key: r.name_en || r.name_ko || r.id,
      label: lang === 'ko' ? (r.name_ko || r.name_en || r.id) : (r.name_en || r.name_ko || r.id),
    })),
    [brands, lang],
  );

  const modelOptions = useMemo(
    () => models.filter((r) => r.status === 'active').map((r) => ({
      id: r.id, key: r.model_code || r.model_name || r.id,
      label: r.model_name || r.model_code || r.id,
    })),
    [models],
  );

  function optionLabel(option: Option | undefined, fallback: string): string {
    if (!option) return fallback;
    if (option.i18nKey) { const tr = t(option.i18nKey, '').trim(); if (tr) return tr; }
    return (option.label || '').trim() || fallback;
  }

  function renderSelect(label: string, value: string, options: Array<{ id: string; key: string; label: string }>, onChange: (v: string) => void, required = false) {
    return (
      <div className="form-group">
        <label className="form-label">{label}{required ? ' *' : ''}</label>
        <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{t('common.select', 'Select')}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{optionLabel(o as Option, '-')}</option>)}
        </select>
      </div>
    );
  }

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(d: GuardianDevice) {
    setEditingId(d.id);
    setForm({
      device_type_item_id: '',
      manufacturer_id: '',
      brand_id: '',
      model_id: d.device_model_id,
      disease_item_id: d.disease_item_id || '',
      nickname: d.nickname || '',
      is_default: !!d.is_default,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!petId) return;
    if (!form.model_id) { setError(t('guardian.health.model_required', 'Please select a device model.')); return; }
    try {
      if (editingId) {
        await api.pets.guardianDevices.update(petId, editingId, {
          disease_item_id: form.disease_item_id || undefined,
          nickname: form.nickname,
          is_default: form.is_default,
        });
      } else {
        await api.pets.guardianDevices.create(petId, {
          device_model_id: form.model_id,
          disease_item_id: form.disease_item_id || undefined,
          nickname: form.nickname || undefined,
          is_default: form.is_default,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadDevices();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    }
  }

  async function handleDelete(id: string) {
    if (!petId) return;
    if (!confirm(t('guardian.device.delete_confirm', 'Delete this device?'))) return;
    try {
      await api.pets.guardianDevices.remove(petId, id);
      await loadDevices();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to delete.')));
    }
  }

  async function handleSetDefault(id: string) {
    if (!petId) return;
    try {
      await api.pets.guardianDevices.update(petId, id, { is_default: true });
      await loadDevices();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to set default.')));
    }
  }

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

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('guardian.device.manage_title', '내 측정 장비')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {loading && <p className="text-sm text-muted">{t('common.loading', 'Loading...')}</p>}

          {!loading && devices.length === 0 && !showForm && (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
              {t('guardian.device.no_devices', '등록된 장비가 없습니다')}
            </p>
          )}

          {!showForm && devices.map((d) => (
            <div key={d.id} style={{
              border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 8,
              background: d.is_default ? 'var(--primary-light, #fffbeb)' : 'var(--surface)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {deviceLabel(d)}
                    {d.nickname && <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>({d.nickname})</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{deviceSubLabel(d)}</div>
                  {!!d.is_default && (
                    <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, background: 'var(--primary)', color: '#fff', borderRadius: 4, padding: '1px 6px' }}>
                      {t('guardian.device.is_default', '기본 장비')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {!d.is_default && (
                    <button className="btn btn-sm" style={{ fontSize: 12 }} onClick={() => void handleSetDefault(d.id)}>
                      {t('guardian.device.set_default', '기본 설정')}
                    </button>
                  )}
                  <button className="btn btn-sm" style={{ fontSize: 12 }} onClick={() => openEditForm(d)}>
                    {t('guardian.device.edit', '수정')}
                  </button>
                  <button className="btn btn-sm btn-danger" style={{ fontSize: 12 }} onClick={() => void handleDelete(d.id)}>
                    {t('common.delete', 'Delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {showForm && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--surface)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>
                {editingId ? t('guardian.device.edit', '장비 수정') : t('guardian.device.add', '장비 추가')}
              </h4>
              {renderSelect(t('guardian.device.disease', '질병'), form.disease_item_id, diseaseOptionsForPet, (v) => setForm((p) => ({
                ...p, disease_item_id: v, device_type_item_id: '', manufacturer_id: '', brand_id: '', model_id: '',
              })))}
              {!editingId && (
                <>
                  {renderSelect(t('guardian.health.measurement.device_type', '장치 유형'), form.device_type_item_id, deviceTypeOptions, (v) => setForm((p) => ({
                    ...p, device_type_item_id: v, manufacturer_id: '', brand_id: '', model_id: '',
                  })), true)}
                  {renderSelect(t('guardian.health.measurement.manufacturer', '제조사'), form.manufacturer_id, mfrOptions, (v) => setForm((p) => ({
                    ...p, manufacturer_id: v, brand_id: '', model_id: '',
                  })))}
                  {renderSelect(t('guardian.health.measurement.brand', '브랜드'), form.brand_id, brandOptions, (v) => setForm((p) => ({
                    ...p, brand_id: v, model_id: '',
                  })))}
                  {renderSelect(t('guardian.health.measurement.model', '모델'), form.model_id, modelOptions, (v) => setForm((p) => ({ ...p, model_id: v })), true)}
                </>
              )}
              <div className="form-group">
                <label className="form-label">{t('guardian.device.nickname', '별명')}</label>
                <input
                  className="form-input"
                  value={form.nickname}
                  placeholder={t('guardian.device.nickname_placeholder', '예: 방울이 리브레')}
                  onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginTop: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
                />
                {t('guardian.device.set_default', '기본 설정')}
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => void handleSave()}>
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {!showForm && (
            <button className="btn btn-primary" onClick={openAddForm}>
              + {t('guardian.device.add', '장비 추가')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>{t('common.close', 'Close')}</button>
        </div>
      </div>
    </div>
  );
}
