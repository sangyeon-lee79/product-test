import { useEffect, useState, useMemo } from 'react';
import { api, type Appointment } from '../../lib/api';
import GroomingCompleteModal from './GroomingCompleteModal';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'rejected' | 'completed';

const APT_STATUS_META: Record<string, { key: string; badge: string }> = {
  pending: { key: 'supplier.appointment.status.pending', badge: 'badge-amber' },
  confirmed: { key: 'supplier.appointment.status.confirmed', badge: 'badge-blue' },
  rejected: { key: 'supplier.appointment.status.rejected', badge: 'badge-red' },
  completed: { key: 'supplier.appointment.status.completed', badge: 'badge-green' },
};

interface Props {
  t: (key: string, fallback?: string) => string;
  locale: string;
}

export default function AppointmentSection({ t, locale }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejectModalId, setRejectModalId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [groomingModalApt, setGroomingModalApt] = useState<Appointment | null>(null);

  async function loadAppointments(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    setError('');
    try {
      const res = await api.appointments.list();
      setAppointments(res.appointments || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAppointments(); }, []);

  const filtered = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filter === 'all' ? sorted : sorted.filter(a => a.status === filter);
  }, [appointments, filter]);

  const selected = useMemo(() => filtered.find(a => a.id === selectedId) || filtered[0] || null, [filtered, selectedId]);

  async function handleConfirm(id: string) {
    setBusyId(id);
    setMessage('');
    try {
      await api.appointments.confirm(id);
      setMessage(t('supplier.appointment.status.confirmed', 'Confirmed'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusyId('');
    }
  }

  async function handleReject() {
    if (!rejectModalId) return;
    setBusyId(rejectModalId);
    try {
      await api.appointments.reject(rejectModalId, rejectReason);
      setRejectModalId('');
      setRejectReason('');
      setMessage(t('supplier.appointment.status.rejected', 'Rejected'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusyId('');
    }
  }

  function fmtDate(iso: string | null) {
    if (!iso) return '-';
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  }

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {message && <div className="alert alert-success" style={{ marginBottom: 12 }}>{message}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'confirmed', 'completed', 'rejected'] as StatusFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f === 'all' ? t('common.all', 'All') : t(APT_STATUS_META[f]?.key || f, f)}
            {f !== 'all' && ` (${appointments.filter(a => a.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(300px, 0.9fr)', gap: 16, alignItems: 'start' }}>
        {/* Left: list */}
        <div className="card">
          {filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.empty', 'No data')}</div>}
          {filtered.map(apt => {
            const active = selected?.id === apt.id;
            const meta = APT_STATUS_META[apt.status];
            return (
              <button
                key={apt.id}
                onClick={() => setSelectedId(apt.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 14px', cursor: 'pointer',
                  background: active ? '#FFF7ED' : 'transparent',
                  borderBottom: '1px solid var(--border)', border: 'none', borderLeft: active ? '3px solid #E87C2B' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{apt.guardian_name || apt.guardian_email || apt.guardian_id.slice(0, 8)}</span>
                  {meta && <span className={`badge ${meta.badge}`} style={{ fontSize: 11 }}>{t(meta.key, apt.status)}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {apt.pet_name && <span>{apt.pet_name} · </span>}
                  {apt.service_type && <span>{apt.service_type} · </span>}
                  {fmtDate(apt.scheduled_at)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: detail */}
        <div className="card">
          {!selected ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.select_item', 'Select an item')}</div>
          ) : (
            <div style={{ padding: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>{selected.guardian_name || selected.guardian_email}</h4>
                <span className={`badge ${APT_STATUS_META[selected.status]?.badge || ''}`}>
                  {t(APT_STATUS_META[selected.status]?.key || selected.status, selected.status)}
                </span>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13, marginBottom: 16 }}>
                <div><strong>{t('booking.pet_select', 'Pet')}:</strong> {selected.pet_name || '-'}</div>
                <div><strong>{t('booking.service_type', 'Service')}:</strong> {selected.service_type || '-'}</div>
                <div><strong>{t('booking.date_select', 'Date')}:</strong> {fmtDate(selected.scheduled_at)}</div>
                <div><strong>{t('booking.duration', 'Duration')}:</strong> {selected.duration_minutes ? `${selected.duration_minutes}${t('booking.minutes', 'min')}` : '-'}</div>
                <div><strong>{t('booking.price', 'Price')}:</strong> {selected.price ? selected.price.toLocaleString() : '-'}</div>
              </div>

              {/* Request note */}
              {selected.request_note && (
                <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  <strong>{t('booking.request_note', 'Request Note')}:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selected.request_note}</p>
                </div>
              )}

              {/* Rejected reason */}
              {selected.status === 'rejected' && selected.rejected_reason && (
                <div style={{ padding: 10, background: '#FEF2F2', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  <strong>{t('supplier.appointment.reject_reason', 'Rejection Reason')}:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selected.rejected_reason}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.status === 'pending' && (
                  <>
                    <button className="btn btn-primary btn-sm" disabled={busyId === selected.id} onClick={() => handleConfirm(selected.id)}>
                      {t('supplier.appointment.confirm_btn', 'Accept')}
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === selected.id} onClick={() => { setRejectModalId(selected.id); setRejectReason(''); }}>
                      {t('supplier.appointment.reject_btn', 'Reject')}
                    </button>
                  </>
                )}
                {selected.status === 'confirmed' && (
                  <button className="btn btn-primary btn-sm" onClick={() => setGroomingModalApt(selected)}>
                    {t('supplier.appointment.complete_btn', 'Complete')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject reason modal */}
      {rejectModalId && (
        <div className="modal-overlay" onClick={() => setRejectModalId('')}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('supplier.appointment.reject_reason', 'Rejection Reason')}</h3>
              <button className="modal-close" onClick={() => setRejectModalId('')}>&times;</button>
            </div>
            <div className="modal-body">
              <textarea className="form-input" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectModalId('')}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-danger" disabled={!!busyId} onClick={handleReject}>
                {busyId ? '...' : t('supplier.appointment.reject_btn', 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grooming complete modal */}
      {groomingModalApt && (
        <GroomingCompleteModal
          open={!!groomingModalApt}
          appointment={groomingModalApt}
          t={t}
          onClose={() => setGroomingModalApt(null)}
          onSuccess={() => void loadAppointments({ silent: true })}
        />
      )}
    </div>
  );
}
