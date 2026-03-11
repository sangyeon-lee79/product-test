// 장비 관리 모달 — 등록된 측정 장비 목록, 추가, 수정, 삭제
import { useEffect, useMemo, useRef, useState } from 'react';
import { api, type DeviceModel, type GuardianDevice, type Pet } from '../../lib/api';
import type { Lang } from '../../lib/i18n';
import { uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  selectedPet: Pet | null;
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
  nickname: '',
  is_default: false,
};

export default function DeviceManageModal({
  open, selectedPet,
  lang, t, setError, onClose, onChanged,
}: Props) {
  const [devices, setDevices] = useState<GuardianDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Search-first state
  const [searchTerm, setSearchTerm] = useState('');
  const [allModels, setAllModels] = useState<DeviceModel[]>([]);
  const [allModelsLoading, setAllModelsLoading] = useState(false);
  const composingRef = useRef(false);

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

  // Load ALL models when add form opens (search-first)
  useEffect(() => {
    if (!open || !showForm || editingId) return;
    setAllModelsLoading(true);
    void (async () => {
      try {
        setAllModels(await api.devices.public.models({}, lang));
      } catch { setAllModels([]); }
      finally { setAllModelsLoading(false); }
    })();
  }, [open, showForm, editingId, lang]);

  // Client-side filtered models
  const filteredModels = useMemo(() => {
    let result = allModels;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((m) =>
        [m.model_display_label, m.model_name, m.model_code, m.mfr_display_label, m.brand_display_label]
          .some(s => s?.toLowerCase().includes(term))
      );
    }
    return result;
  }, [allModels, searchTerm]);

  function handleSelectModel(model: DeviceModel) {
    setForm(p => ({ ...p, model_id: form.model_id === model.id ? '' : model.id }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSearchTerm('');
    setAllModels([]);
    setShowForm(true);
  }

  function openEditForm(d: GuardianDevice) {
    setEditingId(d.id);
    setForm({
      device_type_item_id: '',
      manufacturer_id: '',
      brand_id: '',
      model_id: d.device_model_id,
      nickname: d.nickname || '',
      is_default: !!d.is_default,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!petId || saving) return;
    if (!editingId && !form.model_id) { setError(t('guardian.health.model_required', 'Please select a device model.')); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.pets.guardianDevices.update(petId, editingId, {
          nickname: form.nickname,
          is_default: form.is_default,
        });
      } else {
        await api.pets.guardianDevices.create(petId, {
          device_model_id: form.model_id,
          nickname: form.nickname || undefined,
          is_default: form.is_default,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setSearchTerm('');
      setAllModels([]);
      await loadDevices();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    } finally {
      setSaving(false);
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                {d.model_image_url ? (
                  <img src={d.model_image_url} alt="" className="gm-device-card-thumb" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/placeholder_device.svg'; }} />
                ) : (
                  <div className="gm-device-card-thumb-placeholder">{'\u{1F4F1}'}</div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
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
                  <button className="btn btn-sm" style={{ fontSize: 12 }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditForm(d)}>✏️</button>
                  <button className="btn btn-sm btn-danger" style={{ fontSize: 12 }} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void handleDelete(d.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}

          {showForm && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--surface)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>
                {editingId ? t('guardian.device.edit', '장비 수정') : t('guardian.device.add', '장비 추가')}
              </h4>
              {!editingId && (
                <>
                  {/* Search input */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <label className="form-label" htmlFor="device-search">{t('guardian.device.search_label', '장비명 검색')} *</label>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {t('common.total', 'Total')} {filteredModels.length}
                      </span>
                    </div>
                    <input
                      id="device-search" className="form-input" type="text"
                      value={searchTerm} placeholder={`🔍 ${t('guardian.device.search_placeholder', '장비를 검색하세요...')}`}
                      autoComplete="off" autoCorrect="off"
                      onChange={(e) => { if (!composingRef.current) setSearchTerm(e.target.value); }}
                      onCompositionStart={() => { composingRef.current = true; }}
                      onCompositionEnd={(e) => { composingRef.current = false; setSearchTerm((e.target as HTMLInputElement).value); }}
                      autoFocus
                    />
                  </div>

                  {/* Results list */}
                  {allModelsLoading ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0' }}>{t('guardian.catalog.loading_models', '제품 목록 불러오는 중...')}</p>
                  ) : (
                    <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 12 }}>
                      {filteredModels.length === 0 ? (
                        <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                          {t('guardian.catalog.no_results', '검색 결과가 없습니다')}
                        </div>
                      ) : (
                        filteredModels.map((m) => {
                          const isSelected = form.model_id === m.id;
                          const label = m.model_display_label || m.model_name || m.model_code || m.id;
                          const sub = [m.type_display_label, [m.mfr_display_label, m.brand_display_label].filter(Boolean).join(' > ')].filter(Boolean).join(' · ');
                          return (
                            <div key={m.id} onClick={() => handleSelectModel(m)} style={{
                              padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                              background: isSelected ? 'var(--primary-light, #fffbeb)' : 'transparent',
                              display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                              <span style={{ fontSize: 14, flexShrink: 0, width: 18, textAlign: 'center', color: isSelected ? 'var(--primary)' : 'transparent' }}>✓</span>
                              {m.image_url ? (
                                <img src={m.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>📱</div>
                              )}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                                {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="device-nickname">{t('guardian.device.nickname', '별명')}</label>
                <input
                  id="device-nickname"
                  name="device-nickname"
                  className="form-input"
                  value={form.nickname}
                  placeholder={t('guardian.device.nickname_placeholder', '예: 방울이 리브레')}
                  onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginTop: 8, cursor: 'pointer' }}>
                <input
                  name="device-is-default"
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
                />
                {t('guardian.device.set_default', '기본 설정')}
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm" disabled={saving} onClick={() => { setShowForm(false); setEditingId(null); setSearchTerm(''); setAllModels([]); }}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => void handleSave()}>
                  {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
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
