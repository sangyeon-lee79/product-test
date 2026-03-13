import { useCallback, useEffect, useMemo, useState } from 'react';
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

/* ─── BookingConfig per business type ─── */
interface ExtraField {
  key: string;
  i18nKey: string;
  type: 'text' | 'select' | 'boolean';
  options?: { value: string; i18nKey: string }[];
}

const BOOKING_CONFIG: Record<string, { fields: ExtraField[]; noticeKey: string }> = {
  grooming: {
    fields: [{ key: 'grooming_style', i18nKey: 'booking.field.grooming_style', type: 'text' }],
    noticeKey: 'booking.notice.grooming',
  },
  hospital: {
    fields: [
      { key: 'symptom', i18nKey: 'booking.field.symptom', type: 'text' },
      { key: 'first_visit', i18nKey: 'booking.field.first_visit', type: 'boolean' },
    ],
    noticeKey: 'booking.notice.vet',
  },
  training: {
    fields: [
      { key: 'training_goal', i18nKey: 'booking.field.training_goal', type: 'text' },
      {
        key: 'experience_level', i18nKey: 'booking.field.experience_level', type: 'select',
        options: [
          { value: 'none', i18nKey: 'booking.field.experience_none' },
          { value: 'basic', i18nKey: 'booking.field.experience_basic' },
          { value: 'mid', i18nKey: 'booking.field.experience_mid' },
        ],
      },
    ],
    noticeKey: 'booking.notice.training',
  },
  shop: {
    fields: [
      {
        key: 'visit_purpose', i18nKey: 'booking.field.visit_purpose', type: 'select',
        options: [
          { value: 'food', i18nKey: 'booking.field.visit_food' },
          { value: 'goods', i18nKey: 'booking.field.visit_goods' },
          { value: 'consult', i18nKey: 'booking.field.visit_consult' },
          { value: 'etc', i18nKey: 'booking.field.visit_etc' },
        ],
      },
    ],
    noticeKey: 'booking.notice.petshop',
  },
  hotel: {
    fields: [
      { key: 'checkout_date', i18nKey: 'booking.field.checkout_date', type: 'text' },
      { key: 'feeding_info', i18nKey: 'booking.field.feeding_info', type: 'text' },
      { key: 'special_care', i18nKey: 'booking.field.special_care', type: 'text' },
    ],
    noticeKey: 'booking.notice.hotel',
  },
  cafe: {
    fields: [
      { key: 'guest_count', i18nKey: 'booking.field.guest_count', type: 'text' },
      { key: 'has_pet', i18nKey: 'booking.field.has_pet', type: 'boolean' },
    ],
    noticeKey: 'booking.notice.petcafe',
  },
  photo: {
    fields: [
      {
        key: 'shooting_theme', i18nKey: 'booking.field.shooting_theme', type: 'select',
        options: [
          { value: 'basic', i18nKey: 'booking.field.theme_basic' },
          { value: 'season', i18nKey: 'booking.field.theme_season' },
          { value: 'concept', i18nKey: 'booking.field.theme_concept' },
          { value: 'family', i18nKey: 'booking.field.theme_family' },
        ],
      },
    ],
    noticeKey: 'booking.notice.photo',
  },
};

const REPORT_PERIODS = [
  { value: '', i18nKey: 'booking.report_none' },
  { value: '1d', i18nKey: 'booking.report_1d' },
  { value: '7d', i18nKey: 'booking.report_7d' },
  { value: '15d', i18nKey: 'booking.report_15d' },
  { value: '1m', i18nKey: 'booking.report_1m' },
];

/* ─── Helpers ──────────────────────────────────────────────────────────── */

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

  // Extra data for business type fields
  const [extraData, setExtraData] = useState<Record<string, unknown>>({});
  const [petReportPeriod, setPetReportPeriod] = useState('');

  // Slot data from API
  type SlotInfo = { time: string; type: 'normal' | 'overtime' | 'closed'; booked: boolean };
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [storeOT, setStoreOT] = useState<Record<string, unknown>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate || !store.storeId) return;
    setLoadingSlots(true);
    api.appointments.availableSlots({
      storeId: store.storeId,
      date: selectedDate,
      serviceId: selectedServiceId || undefined,
    }).then(res => {
      setSlots(res.slots || []);
      setStoreOT(res.store || {});
    }).catch(() => {
      setSlots([]);
    }).finally(() => setLoadingSlots(false));
  }, [selectedDate, store.storeId, selectedServiceId]);

  // Filter past time slots if selected date is today
  const availableSlots = useMemo(() => {
    if (slots.length === 0) {
      // Fallback: generate simple slots
      const fallback: SlotInfo[] = [];
      for (let h = 9; h <= 20; h++) {
        fallback.push({ time: `${String(h).padStart(2, '0')}:00`, type: 'normal', booked: false });
        fallback.push({ time: `${String(h).padStart(2, '0')}:30`, type: 'normal', booked: false });
      }
      fallback.push({ time: '21:00', type: 'normal', booked: false });
      return fallback;
    }
    if (selectedDate !== todayStr) return slots.filter(s => s.type !== 'closed');
    const nowH = today.getHours();
    const nowM = today.getMinutes();
    return slots.filter(slot => {
      if (slot.type === 'closed') return false;
      const [h, m] = slot.time.split(':').map(Number);
      return h > nowH || (h === nowH && m > nowM);
    });
  }, [selectedDate, todayStr, today, slots]);

  const selectedSlot = availableSlots.find(s => s.time === selectedTime);
  const isOvertime = selectedSlot?.type === 'overtime';

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const selectedService = store.services.find(s => s.id === selectedServiceId) || initialService;
  const config = BOOKING_CONFIG[store.category] || null;

  const canNext = useCallback((): boolean => {
    if (step === 0) return !!selectedDate;
    if (step === 1) return !!selectedTime;
    if (step === 2) return !!selectedPetId;
    return true;
  }, [step, selectedDate, selectedTime, selectedPetId]);

  function setExtra(key: string, value: unknown) {
    setExtraData(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!store.supplierId) {
      setError(t('common.err.save', 'Failed to save'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const scheduledAt = `${selectedDate}T${selectedTime}:00`;
      const overtimeFee = isOvertime && storeOT.overtime_fee_type !== 'free'
        ? Number(storeOT.overtime_fee_amount || 0)
        : 0;

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
        businessType: store.category || undefined,
        extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
        petReportPeriod: petReportPeriod || undefined,
        isOvertime,
        overtimeFee,
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
            <h3 style={{ marginBottom: 8 }}>{t('booking.success_toast', 'Booking submitted!')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('booking.overtime_confirm_notice', 'The store will confirm your booking')}</p>
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
              <p className="gm-booking-step-title">{t('booking.step.date', 'Select a date')}</p>
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
                      onClick={() => { setSelectedDate(ds); setSelectedTime(''); }}
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
              <p className="gm-booking-step-title">{t('booking.step.time', 'Select a time')}</p>
              {loadingSlots ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>{t('common.loading', 'Loading...')}</div>
              ) : (
                <div className="gm-booking-timeslot-grid">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      className={`gm-booking-timeslot${selectedTime === slot.time ? ' selected' : ''}${slot.type === 'overtime' ? ' overtime' : ''}${slot.booked ? ' closed' : ''}`}
                      disabled={slot.booked}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {slot.time}
                      {slot.type === 'overtime' && !slot.booked && <div style={{ fontSize: 9, marginTop: 2 }}>{t('booking.slot.overtime', 'OT')}</div>}
                    </button>
                  ))}
                </div>
              )}
              {isOvertime && (
                <div className="gm-overtime-badge" style={{ marginTop: 10 }}>
                  {t('booking.overtime_warning', 'Overtime Booking')}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Pet + service + extra fields ── */}
          {step === 2 && (
            <div>
              <p className="gm-booking-step-title">{t('booking.pet_select', 'Select your pet')}</p>
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

              {/* Business-type extra fields */}
              {config && config.fields.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {config.fields.map(field => (
                    <div key={field.key} style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                        {t(field.i18nKey, field.key)}
                      </label>
                      {field.type === 'text' && (
                        <input
                          className="form-input"
                          style={{ fontSize: 13 }}
                          value={String(extraData[field.key] || '')}
                          onChange={e => setExtra(field.key, e.target.value)}
                        />
                      )}
                      {field.type === 'boolean' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!!extraData[field.key]}
                            onChange={e => setExtra(field.key, e.target.checked)}
                          />
                          {t(field.i18nKey, field.key)}
                        </label>
                      )}
                      {field.type === 'select' && field.options && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {field.options.map(opt => (
                            <button
                              key={opt.value}
                              className={`gm-store-category-chip${extraData[field.key] === opt.value ? ' active' : ''}`}
                              onClick={() => setExtra(field.key, opt.value)}
                            >
                              {t(opt.i18nKey, opt.value)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Health report period */}
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                  {t('booking.report_title', 'Send Health Report (Optional)')}
                </label>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {t('booking.report_desc', 'Sharing a report helps provide better service')}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {REPORT_PERIODS.map(rp => (
                    <button
                      key={rp.value}
                      className={`gm-store-category-chip${petReportPeriod === rp.value ? ' active' : ''}`}
                      onClick={() => setPetReportPeriod(rp.value)}
                    >
                      {t(rp.i18nKey, rp.value || 'None')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div>
              <p className="gm-booking-step-title">{t('booking.summary_title', 'Booking Summary')}</p>
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
                  <strong>
                    {selectedTime || '-'}
                    {isOvertime && <span className="gm-overtime-badge" style={{ marginLeft: 6 }}>{t('booking.slot.overtime', 'OT')}</span>}
                  </strong>
                </div>
                <div className="gm-booking-summary-row">
                  <span>{t('guardian.booking.confirm.pet', 'Pet')}</span>
                  <strong>{selectedPet?.name || '-'}</strong>
                </div>
                {selectedService?.price != null && (
                  <div className="gm-booking-summary-row">
                    <span>{t('booking.service_fee', 'Service Fee')}</span>
                    <strong>{selectedService.price.toLocaleString()}</strong>
                  </div>
                )}
                {isOvertime && storeOT.overtime_fee_type !== 'free' && Number(storeOT.overtime_fee_amount) > 0 && (
                  <div className="gm-booking-summary-row">
                    <span>{t('booking.overtime_fee', 'Overtime Fee')}</span>
                    <strong>+{Number(storeOT.overtime_fee_amount).toLocaleString()}</strong>
                  </div>
                )}
              </div>

              {/* Notice */}
              {config && (
                <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#FFF7ED', fontSize: 12, color: '#92400e' }}>
                  {t(config.noticeKey, '')}
                </div>
              )}
              <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: 10, background: 'var(--bg)', fontSize: 12, color: 'var(--text-muted)' }}>
                {t('booking.notice.common', 'You will be notified when the provider confirms')}
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                  {t('booking.field.request_note', 'Special Requests (optional)')}
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
              {saving ? '...' : t('booking.submit_btn', 'Submit Booking')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
