import { useCallback, useMemo, useState } from 'react';
import { api, type Pet } from '../../lib/api';
import { useI18n, useT } from '../../lib/i18n';
import { BCP47_LOCALE_MAP, type Lang } from '@petfolio/shared';

/* ─── Types ────────────────────────────────────────────────────────────── */

interface StoreService {
  id: string;
  displayName: string;
  price: number | null;
  durationMin: number | null;
}

interface DisplayStore {
  id: string;
  displayName: string;
  displayDescription: string;
  category: string;
  addressText: string;
  rating: number;
  reviewCount: number;
  isDemo: boolean;
  avatarUrl?: string | null;
  services: StoreService[];
  supplierId?: string;
  storeId?: string;
}

interface Props {
  store: DisplayStore;
  initialService: StoreService | null;
  pets: Pet[];
  onClose: () => void;
  onSuccess: () => void;
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  slots.push('21:00');
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const STEP_KEYS = ['date', 'time', 'pet', 'confirm'] as const;

/* ─── Component ────────────────────────────────────────────────────────── */

export default function StepBookingModal({ store, initialService, pets, onClose, onSuccess }: Props) {
  const t = useT();
  const { lang } = useI18n();
  const locale = BCP47_LOCALE_MAP[lang as Lang] || 'en-US';

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(initialService?.id || '');
  const [requestNote, setRequestNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Calendar state
  const today = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function dateStr(day: number): string {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isPastDate(day: number): boolean {
    return dateStr(day) < todayStr;
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
  }

  // Filter past time slots if selected date is today
  const availableSlots = useMemo(() => {
    if (selectedDate !== todayStr) return TIME_SLOTS;
    const nowH = today.getHours();
    const nowM = today.getMinutes();
    return TIME_SLOTS.filter(slot => {
      const [h, m] = slot.split(':').map(Number);
      return h > nowH || (h === nowH && m > nowM);
    });
  }, [selectedDate, todayStr, today]);

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const selectedService = store.services.find(s => s.id === selectedServiceId) || initialService;

  const canNext = useCallback((): boolean => {
    if (step === 0) return !!selectedDate;
    if (step === 1) return !!selectedTime;
    if (step === 2) return !!selectedPetId;
    return true;
  }, [step, selectedDate, selectedTime, selectedPetId]);

  async function handleSubmit() {
    if (!store.supplierId) {
      setError(t('common.err.save', 'Failed to save'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const scheduledAt = `${selectedDate}T${selectedTime}:00`;
      await api.appointments.create({
        petId: selectedPetId,
        supplierId: store.supplierId,
        storeId: store.storeId,
        serviceId: selectedServiceId || undefined,
        serviceType: selectedService?.displayName || '',
        scheduledAt,
        durationMinutes: selectedService?.durationMin || undefined,
        price: selectedService?.price || undefined,
        requestNote: requestNote || undefined,
      });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.save', 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="modal-overlay" onClick={onSuccess}>
        <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div className="modal-body" style={{ padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u2705'}</div>
            <h3 style={{ marginBottom: 8 }}>{t('guardian.booking.confirm.success', 'Booking submitted!')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('guardian.booking.confirm.success_desc', 'The store will confirm your booking')}</p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={onSuccess}>
              {t('common.ok', 'OK')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal gm-booking-modal" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="modal-close" style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }} onClick={onClose}>&times;</button>

        {/* Progress bar */}
        <div className="gm-booking-progress">
          {STEP_KEYS.map((key, i) => (
            <div
              key={key}
              className={`gm-booking-progress-step${i === step ? ' active' : ''}${i < step ? ' completed' : ''}`}
            >
              <div className="gm-booking-progress-dot">{i < step ? '\u2713' : i + 1}</div>
              <span className="gm-booking-progress-label">{t(`guardian.booking.step.${key}`, key)}</span>
            </div>
          ))}
        </div>

        {/* Store info banner */}
        <div className="gm-booking-store-banner">
          <strong>{store.displayName}</strong>
          {selectedService && <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 13 }}>{selectedService.displayName}</span>}
        </div>

        <div className="modal-body" style={{ padding: '16px 20px', minHeight: 320 }}>
          {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

          {/* ── Step 0: Date ── */}
          {step === 0 && (
            <div className="gm-booking-calendar">
              <p className="gm-booking-step-title">{t('guardian.booking.calendar.select_date', 'Select a date')}</p>
              <div className="gm-cal-nav">
                <button className="gm-cal-nav-btn" onClick={prevMonth}>&lsaquo;</button>
                <span className="gm-cal-month">
                  {new Date(calYear, calMonth).toLocaleDateString(locale, { year: 'numeric', month: 'long' })}
                </span>
                <button className="gm-cal-nav-btn" onClick={nextMonth}>&rsaquo;</button>
              </div>
              <div className="gm-cal-grid">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="gm-cal-header">{d}</div>
                ))}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} className="gm-cal-day empty" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const ds = dateStr(day);
                  const past = isPastDate(day);
                  const selected = ds === selectedDate;
                  return (
                    <button
                      key={day}
                      className={`gm-cal-day${past ? ' disabled' : ''}${selected ? ' selected' : ''}${ds === todayStr ? ' today' : ''}`}
                      disabled={past}
                      onClick={() => setSelectedDate(ds)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 1: Time ── */}
          {step === 1 && (
            <div>
              <p className="gm-booking-step-title">{t('guardian.booking.time.select_time', 'Select a time')}</p>
              <div className="gm-booking-timeslot-grid">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    className={`gm-booking-timeslot${selectedTime === slot ? ' selected' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Pet ── */}
          {step === 2 && (
            <div>
              <p className="gm-booking-step-title">{t('guardian.booking.pet.select_pet', 'Select your pet')}</p>
              {/* Service select if store has services */}
              {store.services.length > 1 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                    {t('guardian.booking.confirm.service', 'Service')}
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {store.services.map(svc => (
                      <button
                        key={svc.id}
                        className={`gm-store-category-chip${selectedServiceId === svc.id ? ' active' : ''}`}
                        onClick={() => setSelectedServiceId(svc.id)}
                      >
                        {svc.displayName}
                        {svc.price != null && ` (${svc.price.toLocaleString()})`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="gm-booking-pet-list">
                {pets.map(pet => (
                  <button
                    key={pet.id}
                    className={`gm-booking-pet-card${selectedPetId === pet.id ? ' selected' : ''}`}
                    onClick={() => setSelectedPetId(pet.id)}
                  >
                    <div className="gm-booking-pet-avatar">
                      {pet.avatar_url ? (
                        <img src={pet.avatar_url} alt="" />
                      ) : (
                        <span>{'\uD83D\uDC3E'}</span>
                      )}
                    </div>
                    <div className="gm-booking-pet-info">
                      <div className="gm-booking-pet-name">{pet.name}</div>
                      <div className="gm-booking-pet-breed">{pet.birthday ? new Date(pet.birthday).toLocaleDateString() : ''}</div>
                    </div>
                    {selectedPetId === pet.id && <div className="gm-booking-pet-check">{'\u2713'}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div>
              <p className="gm-booking-step-title">{t('guardian.booking.confirm.title', 'Booking Confirmation')}</p>
              <div className="gm-booking-summary">
                <div className="gm-booking-summary-row">
                  <span>{t('guardian.booking.confirm.store', 'Store')}</span>
                  <strong>{store.displayName}</strong>
                </div>
                {selectedService && (
                  <div className="gm-booking-summary-row">
                    <span>{t('guardian.booking.confirm.service', 'Service')}</span>
                    <strong>{selectedService.displayName}</strong>
                  </div>
                )}
                <div className="gm-booking-summary-row">
                  <span>{t('guardian.booking.confirm.date', 'Date')}</span>
                  <strong>{selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</strong>
                </div>
                <div className="gm-booking-summary-row">
                  <span>{t('guardian.booking.confirm.time', 'Time')}</span>
                  <strong>{selectedTime || '-'}</strong>
                </div>
                <div className="gm-booking-summary-row">
                  <span>{t('guardian.booking.confirm.pet', 'Pet')}</span>
                  <strong>{selectedPet?.name || '-'}</strong>
                </div>
                {selectedService?.price != null && (
                  <div className="gm-booking-summary-row">
                    <span>{t('guardian.store.detail.price', 'Price')}</span>
                    <strong>{selectedService.price.toLocaleString()}</strong>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                  {t('guardian.booking.request_note', 'Request Note (optional)')}
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={requestNote}
                  onChange={e => setRequestNote(e.target.value)}
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="gm-booking-nav">
          <button
            className="btn btn-secondary"
            onClick={() => step === 0 ? onClose() : setStep(step - 1)}
          >
            {step === 0 ? t('common.cancel', 'Cancel') : t('guardian.booking.prev', 'Previous')}
          </button>
          {step < 3 ? (
            <button
              className="btn btn-primary"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
            >
              {t('guardian.booking.next', 'Next')}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? '...' : t('guardian.booking.confirm.submit', 'Confirm Booking')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
