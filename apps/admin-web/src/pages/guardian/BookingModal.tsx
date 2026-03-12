import { useState } from 'react';
import { api, type Pet, type StoreService } from '../../lib/api';

interface Props {
  open: boolean;
  pets: Pet[];
  supplierId: string;
  supplierName: string;
  storeId?: string;
  services: StoreService[];
  t: (key: string, fallback?: string) => string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ open, pets, supplierId, supplierName, storeId, services, t, onClose, onSuccess }: Props) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [requestNote, setRequestNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const selectedService = services.find(s => s.id === selectedServiceId);

  function handleServiceSelect(svcId: string) {
    setSelectedServiceId(svcId);
    const svc = services.find(s => s.id === svcId);
    if (svc) {
      setServiceType(svc.display_name || svc.name || '');
      if (svc.price) setPrice(svc.price);
    }
  }

  async function handleSubmit() {
    if (!selectedPetId) { setError(t('booking.pet_select', 'Select Pet')); return; }
    if (!scheduledAt) { setError(t('booking.date_select', 'Select Date')); return; }

    setSaving(true);
    setError('');
    try {
      await api.appointments.create({
        petId: selectedPetId,
        supplierId,
        storeId,
        serviceId: selectedServiceId || undefined,
        serviceType,
        scheduledAt,
        durationMinutes: durationMinutes || undefined,
        price: price || undefined,
        requestNote: requestNote || undefined,
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.save', 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  const selectedPet = pets.find(p => p.id === selectedPetId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('booking.title', 'Book Appointment')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Supplier info */}
          <div className="card" style={{ marginBottom: 16, padding: 12 }}>
            <strong>{supplierName}</strong>
          </div>

          {/* Pet select */}
          <div className="form-group">
            <label className="form-label">{t('booking.pet_select', 'Select Pet')}</label>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {pets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: selectedPetId === pet.id ? '2px solid #E87C2B' : '1px solid var(--border)',
                    background: selectedPetId === pet.id ? '#FFF7ED' : 'var(--surface)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: selectedPetId === pet.id ? 600 : 400,
                  }}
                >
                  {pet.name}
                </button>
              ))}
            </div>
          </div>

          {/* Service select */}
          {services.length > 0 && (
            <div className="form-group">
              <label className="form-label">{t('booking.service_select', 'Select Service')}</label>
              {services.map(svc => (
                <button
                  key={svc.id}
                  onClick={() => handleServiceSelect(svc.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    marginBottom: 6,
                    borderRadius: 8,
                    border: selectedServiceId === svc.id ? '2px solid #E87C2B' : '1px solid var(--border)',
                    background: selectedServiceId === svc.id ? '#FFF7ED' : 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{svc.display_name || svc.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {svc.price != null && <span>{svc.price.toLocaleString()}{svc.currency_code ? ` ${svc.currency_code}` : ''}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Service type (manual if no services list) */}
          {services.length === 0 && (
            <div className="form-group">
              <label className="form-label">{t('booking.service_type', 'Service Type')}</label>
              <select className="form-input" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                <option value="">{t('booking.service_select', 'Select Service')}</option>
                <option value="full_grooming">{t('grooming.service.full', 'Full Grooming')}</option>
                <option value="partial_grooming">{t('grooming.service.partial', 'Partial Grooming')}</option>
                <option value="bath_dry">{t('grooming.service.bath_dry', 'Bath & Dry')}</option>
                <option value="spa">{t('grooming.service.spa', 'Spa')}</option>
              </select>
            </div>
          )}

          {/* Date/Time */}
          <div className="form-row col2">
            <div className="form-group">
              <label className="form-label">{t('booking.date_select', 'Select Date')}</label>
              <input type="datetime-local" className="form-input" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('booking.duration', 'Duration')}</label>
              <input type="number" className="form-input" placeholder={t('booking.minutes', 'min')} value={durationMinutes} onChange={e => setDurationMinutes(e.target.value ? Number(e.target.value) : '')} />
            </div>
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">{t('booking.price', 'Price')}</label>
            <input type="number" className="form-input" value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')} />
          </div>

          {/* Request note */}
          <div className="form-group">
            <label className="form-label">{t('booking.request_note', 'Request Note')}</label>
            <textarea className="form-input" rows={3} value={requestNote} onChange={e => setRequestNote(e.target.value)} />
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: 14, background: 'var(--bg)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('booking.summary', 'Booking Summary')}</div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              {selectedPet && <div>{t('booking.pet_select', 'Pet')}: {selectedPet.name}</div>}
              {(serviceType || selectedService) && <div>{t('booking.service_type', 'Service')}: {selectedService?.display_name || selectedService?.name || serviceType}</div>}
              {scheduledAt && <div>{t('booking.date_select', 'Date')}: {new Date(scheduledAt).toLocaleString()}</div>}
              {durationMinutes && <div>{t('booking.duration', 'Duration')}: {durationMinutes}{t('booking.minutes', 'min')}</div>}
              {price && <div>{t('booking.price', 'Price')}: {Number(price).toLocaleString()}</div>}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
            {saving ? '...' : t('booking.confirm_btn', 'Book Now')}
          </button>
        </div>
      </div>
    </div>
  );
}
