import { useState } from 'react';
import { api, type Appointment, type GroomingPhoto } from '../../lib/api';

interface Props {
  open: boolean;
  appointment: Appointment;
  t: (key: string, fallback?: string) => string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GroomingCompleteModal({ open, appointment, t, onClose, onSuccess }: Props) {
  const [groomingType, setGroomingType] = useState(appointment.service_type || '');
  const [cutStyle, setCutStyle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(appointment.duration_minutes || '');
  const [productsUsed, setProductsUsed] = useState('');
  const [supplierComment, setSupplierComment] = useState('');
  const [photos, setPhotos] = useState<GroomingPhoto[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function addPhoto() {
    const url = photoUrl.trim();
    if (!url) return;
    setPhotos(prev => [...prev, { url, isMain: prev.length === 0 }]);
    setPhotoUrl('');
  }

  function setMainPhoto(index: number) {
    setPhotos(prev => prev.map((p, i) => ({ ...p, isMain: i === index })));
  }

  function removePhoto(index: number) {
    setPhotos(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some(p => p.isMain)) next[0].isMain = true;
      return next;
    });
  }

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      await api.groomingRecords.create({
        appointmentId: appointment.id,
        petId: appointment.pet_id || undefined,
        guardianId: appointment.guardian_id,
        groomingType: groomingType || undefined,
        cutStyle: cutStyle || undefined,
        durationMinutes: durationMinutes || undefined,
        productsUsed: productsUsed || undefined,
        supplierComment: supplierComment || undefined,
        photos,
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.save', 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  const GROOMING_TYPES = [
    { value: 'full_grooming', key: 'grooming.service.full' },
    { value: 'partial_grooming', key: 'grooming.service.partial' },
    { value: 'bath_dry', key: 'grooming.service.bath_dry' },
    { value: 'spa', key: 'grooming.service.spa' },
  ];

  const CUT_STYLES = [
    { value: 'teddy_bear', key: 'grooming.cut.teddy_bear' },
    { value: 'bear', key: 'grooming.cut.bear' },
    { value: 'sporty', key: 'grooming.cut.sporty' },
    { value: 'natural', key: 'grooming.cut.natural' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('grooming.complete.title', 'Grooming Completion Report')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Photos */}
          <div className="form-group">
            <label className="form-label">{t('grooming.complete.photos', 'Completion Photos')}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {photos.map((photo, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img src={photo.url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: photo.isMain ? '3px solid #E87C2B' : '1px solid var(--border)' }} />
                  {photo.isMain && (
                    <span style={{ position: 'absolute', top: 2, left: 2, background: '#E87C2B', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 4 }}>
                      {t('grooming.complete.main_photo', 'Main')}
                    </span>
                  )}
                  <button onClick={() => setMainPhoto(i)} style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 3, padding: '1px 4px', cursor: 'pointer' }}>
                    {'\u2B50'}
                  </button>
                  <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 2, right: 2, fontSize: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', lineHeight: '16px' }}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {photos.length < 5 && (
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="form-input" placeholder="URL" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-secondary btn-sm" onClick={addPhoto}>+</button>
              </div>
            )}
          </div>

          {/* Grooming type */}
          <div className="form-group">
            <label className="form-label">{t('grooming.complete.type', 'Grooming Type')}</label>
            <select className="form-input" value={groomingType} onChange={e => setGroomingType(e.target.value)}>
              <option value="">—</option>
              {GROOMING_TYPES.map(gt => (
                <option key={gt.value} value={gt.value}>{t(gt.key, gt.value)}</option>
              ))}
            </select>
          </div>

          {/* Cut style */}
          <div className="form-group">
            <label className="form-label">{t('grooming.complete.cut', 'Cut Style')}</label>
            <select className="form-input" value={cutStyle} onChange={e => setCutStyle(e.target.value)}>
              <option value="">—</option>
              {CUT_STYLES.map(cs => (
                <option key={cs.value} value={cs.value}>{t(cs.key, cs.value)}</option>
              ))}
            </select>
          </div>

          {/* Duration + Products */}
          <div className="form-row col2">
            <div className="form-group">
              <label className="form-label">{t('grooming.complete.duration', 'Duration')}</label>
              <input type="number" className="form-input" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value ? Number(e.target.value) : '')} placeholder={t('booking.minutes', 'min')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('grooming.complete.products', 'Products Used')}</label>
              <input className="form-input" value={productsUsed} onChange={e => setProductsUsed(e.target.value)} />
            </div>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label">{t('grooming.complete.comment', 'Comment to Guardian')}</label>
            <textarea className="form-input" rows={3} value={supplierComment} onChange={e => setSupplierComment(e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
            {saving ? '...' : t('grooming.complete.send_btn', 'Send to Guardian')}
          </button>
        </div>
      </div>
    </div>
  );
}
