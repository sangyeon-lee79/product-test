import { useEffect, useMemo, useState } from 'react';
import { api, type Booking } from '../lib/api';

type BookingFilter = 'all' | Booking['status'];
type BookingStatusAction = 'created' | 'in_progress' | 'service_completed' | 'publish_requested' | 'publish_approved' | 'publish_rejected' | 'cancelled';

const STATUS_META: Record<string, { label: string; badge: string }> = {
  created: { label: '예약 요청', badge: 'badge-blue' },
  in_progress: { label: '진행 중', badge: 'badge-amber' },
  service_completed: { label: '서비스 완료', badge: 'badge-green' },
  publish_requested: { label: '공유 승인 요청', badge: 'badge-blue' },
  publish_approved: { label: '공유 승인 완료', badge: 'badge-green' },
  publish_rejected: { label: '공유 반려', badge: 'badge-red' },
  cancelled: { label: '취소됨', badge: 'badge-gray' },
};

function decodeToken(): { sub?: string; email?: string } {
  const token = localStorage.getItem('access_token');
  if (!token) return {};
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    return JSON.parse(atob(b64)) as { sub?: string; email?: string };
  } catch {
    return {};
  }
}

function fmtDateTime(value?: string | null, time?: string | null): string {
  if (!value) return '-';
  if (!time) return value;
  return `${value} ${time}`;
}

function fmtRelativeDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function SupplierDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [selectedId, setSelectedId] = useState('');
  const [completionMemo, setCompletionMemo] = useState('');
  const [completionMedia, setCompletionMedia] = useState('');

  const me = useMemo(() => decodeToken(), []);

  async function loadBookings(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    setError('');
    try {
      const data = await api.bookings.list();
      setBookings(data.bookings || []);
      if (!selectedId && data.bookings?.length) {
        setSelectedId(data.bookings[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '예약 목록을 불러오지 못했습니다.');
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return filter === 'all' ? sorted : sorted.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const selectedBooking = useMemo(
    () => filteredBookings.find((booking) => booking.id === selectedId) || filteredBookings[0] || null,
    [filteredBookings, selectedId],
  );

  useEffect(() => {
    if (selectedBooking && selectedBooking.id !== selectedId) {
      setSelectedId(selectedBooking.id);
    }
  }, [selectedBooking, selectedId]);

  useEffect(() => {
    if (!selectedBooking) {
      setCompletionMemo('');
      setCompletionMedia('');
      return;
    }
    setCompletionMemo(selectedBooking.notes || '');
    setCompletionMedia('');
  }, [selectedBooking?.id]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'created').length,
    active: bookings.filter((booking) => booking.status === 'in_progress').length,
    approval: bookings.filter((booking) => booking.status === 'publish_requested').length,
  }), [bookings]);

  async function changeStatus(bookingId: string, status: BookingStatusAction) {
    setBusyId(bookingId);
    setMessage('');
    setError('');
    try {
      await api.bookings.updateStatus(bookingId, status);
      setMessage('예약 상태를 업데이트했습니다.');
      await loadBookings({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : '예약 상태 변경에 실패했습니다.');
    } finally {
      setBusyId('');
    }
  }

  async function requestCompletion() {
    if (!selectedBooking) return;
    const mediaUrls = completionMedia
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);

    setBusyId(selectedBooking.id);
    setMessage('');
    setError('');
    try {
      await api.bookings.requestCompletion(selectedBooking.id, {
        completion_memo: completionMemo.trim() || null,
        media_urls: mediaUrls,
        business_category_id: selectedBooking.business_category_id ?? null,
      });
      setMessage('보호자에게 완료 공유 승인을 요청했습니다.');
      await loadBookings({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : '완료 공유 요청에 실패했습니다.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div style={{ padding: 24, display: 'grid', gap: 20 }}>
      <section className="card" style={{ overflow: 'hidden' }}>
        <div className="card-body" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 60%, #fef3c7 100%)' }}>
          <p className="hero-eyebrow">Provider Workspace</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 30, lineHeight: 1.1, marginBottom: 8 }}>업종관리자 예약 운영 페이지</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 720 }}>
                가디언 페이지에서 생성한 예약 요청을 공급자 계정에서 접수하고, 서비스 완료 후 보호자 피드 공유 승인 요청까지 이어지는 흐름을 한 화면에서 관리합니다.
              </p>
            </div>
            <div style={{ minWidth: 240, padding: 16, background: 'rgba(255,255,255,0.8)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>현재 로그인</div>
              <div style={{ fontWeight: 700 }}>{me.email || 'provider'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>supplier_id: {me.sub || '-'}</div>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div className="card"><div className="card-body"><div className="text-muted">전체 예약</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div></div></div>
        <div className="card"><div className="card-body"><div className="text-muted">신규 요청</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.pending}</div></div></div>
        <div className="card"><div className="card-body"><div className="text-muted">진행 중</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.active}</div></div></div>
        <div className="card"><div className="card-body"><div className="text-muted">승인 대기</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.approval}</div></div></div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1.1fr) minmax(320px, 0.9fr)', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">예약 목록</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value as BookingFilter)} style={{ minWidth: 160 }}>
                <option value="all">전체 상태</option>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.label}</option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => void loadBookings()} disabled={loading}>새로고침</button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--text-muted)' }}>예약 데이터를 불러오는 중입니다.</div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text-muted)' }}>표시할 예약이 없습니다.</div>
            ) : (
              <div style={{ display: 'grid' }}>
                {filteredBookings.map((booking) => {
                  const meta = STATUS_META[booking.status] || { label: booking.status, badge: 'badge-gray' };
                  const active = booking.id === selectedBooking?.id;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelectedId(booking.id)}
                      style={{
                        border: 0,
                        background: active ? '#fff7ed' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        padding: 18,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                        <strong>{booking.id}</strong>
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                      </div>
                      <div style={{ display: 'grid', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                        <div>가디언: {booking.guardian_id}</div>
                        <div>반려동물: {booking.pet_id || '-'}</div>
                        <div>희망 일정: {fmtDateTime(booking.requested_date, booking.requested_time)}</div>
                        <div>최근 변경: {fmtRelativeDate(booking.updated_at)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">예약 상세 / 처리</div>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 16 }}>
            {!selectedBooking ? (
              <div style={{ color: 'var(--text-muted)' }}>선택된 예약이 없습니다.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 18 }}>{selectedBooking.id}</strong>
                    <span className={`badge ${(STATUS_META[selectedBooking.status] || STATUS_META.cancelled).badge}`}>
                      {(STATUS_META[selectedBooking.status] || { label: selectedBooking.status }).label}
                    </span>
                  </div>
                  <div className="form-row col2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">Guardian ID</div>
                      <div>{selectedBooking.guardian_id}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">Pet ID</div>
                      <div>{selectedBooking.pet_id || '-'}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">예약 희망 일시</div>
                      <div>{fmtDateTime(selectedBooking.requested_date, selectedBooking.requested_time)}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">서비스 카테고리</div>
                      <div>{selectedBooking.business_category_id || '-'}</div>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div className="form-label">가디언 메모</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedBooking.notes || '-'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => void changeStatus(selectedBooking.id, 'in_progress')}
                    disabled={busyId === selectedBooking.id || !['created', 'in_progress'].includes(selectedBooking.status)}
                  >
                    접수 / 진행 처리
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => void changeStatus(selectedBooking.id, 'service_completed')}
                    disabled={busyId === selectedBooking.id || !['in_progress', 'service_completed', 'publish_rejected'].includes(selectedBooking.status)}
                  >
                    서비스 완료 처리
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => void changeStatus(selectedBooking.id, 'cancelled')}
                    disabled={busyId === selectedBooking.id || selectedBooking.status === 'cancelled'}
                  >
                    예약 취소
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'grid', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>완료 공유 요청</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      가디언 페이지의 예약관리와 맞물리도록, 서비스 완료 후 사진과 메모를 올려 보호자 승인 요청 상태로 전환합니다.
                    </p>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">완료 메모</label>
                    <textarea
                      className="form-textarea"
                      value={completionMemo}
                      onChange={(e) => setCompletionMemo(e.target.value)}
                      placeholder="시술/서비스 결과, 특이사항, 홈케어 가이드를 입력하세요."
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">미디어 URL</label>
                    <textarea
                      className="form-textarea"
                      value={completionMedia}
                      onChange={(e) => setCompletionMedia(e.target.value)}
                      placeholder={'한 줄에 하나씩 입력\nhttps://example.com/photo-1.jpg'}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => void requestCompletion()}
                    disabled={busyId === selectedBooking.id || !['service_completed', 'publish_rejected', 'publish_requested'].includes(selectedBooking.status)}
                  >
                    보호자에게 공유 승인 요청
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
