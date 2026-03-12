import { useState } from 'react';
import { api, type GroomingRecord } from '../../lib/api';

interface Props {
  open: boolean;
  record: GroomingRecord;
  t: (key: string, fallback?: string) => string;
  onClose: () => void;
  onSuccess: () => void;
}

const PLACEHOLDER = '/assets/images/placeholder_feed.svg';

export default function GroomingApprovalModal({ open, record, t, onClose, onSuccess }: Props) {
  const [choice, setChoice] = useState<'feed_only' | 'approve_only' | 'approve_and_feed'>('approve_and_feed');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!open) return null;

  const mainPhoto = record.photos?.find(p => p.isMain) || record.photos?.[0];
  const tags: { icon: string; label: string }[] = [];
  if (record.cut_style) tags.push({ icon: '\u2702\uFE0F', label: record.cut_style });
  if (record.grooming_type) tags.push({ icon: '\uD83D\uDEC1', label: record.grooming_type });
  if (record.duration_minutes) tags.push({ icon: '\u23F1', label: `${record.duration_minutes}${t('booking.minutes', 'min')}` });

  async function handleConfirm() {
    setSaving(true);
    setError('');
    try {
      await api.groomingRecords.guardianChoice(record.id, choice);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.save', 'Failed'));
    } finally {
      setSaving(false);
    }
  }

  function handleDoneClose() {
    onSuccess();
    onClose();
  }

  const CHOICES = [
    { value: 'feed_only' as const, icon: '\uD83D\uDCE2', labelKey: 'booking.choice_feed_only', fallback: 'Share to Feed Only', descKey: 'booking.choice_feed_desc', descFallback: 'Share grooming results on public feed' },
    { value: 'approve_only' as const, icon: '\u2705', labelKey: 'booking.choice_approve_only', fallback: 'Save to Timeline Only', descKey: 'booking.choice_approve_desc', descFallback: 'Save privately to pet timeline' },
    { value: 'approve_and_feed' as const, icon: '\uD83C\uDF1F', labelKey: 'booking.choice_both', fallback: 'Save & Share to Feed', descKey: 'booking.choice_both_desc', descFallback: 'Save to timeline and share on public feed' },
  ];

  // ── Success screen ──
  if (done) {
    return (
      <div className="modal-overlay" onClick={handleDoneClose}>
        <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div className="modal-body" style={{ padding: '40px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u2705'}</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
              {t('booking.approved_title', 'Approved!')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary, #666)' }}>
              {t('booking.approved_sub', 'Your choice has been applied')}
            </p>
          </div>
          <div className="modal-footer" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleDoneClose}>
              {t('common.ok', 'OK')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('booking.approval_title', 'Grooming Complete!')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Supplier banner + notification text */}
          <div style={{ padding: '10px 14px', background: '#FFF7ED', borderRadius: 8, marginBottom: 14, color: '#92400E' }}>
            <div style={{ fontWeight: 600 }}>{record.supplier_name}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {t('booking.approval_noti', '{store} sent a completion notice').replace('{store}', record.supplier_name || '')}
            </div>
          </div>

          {/* Pet name */}
          {record.pet_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {record.pet_avatar && (
                <img
                  src={record.pet_avatar}
                  alt=""
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <span style={{ fontWeight: 600, fontSize: 14 }}>{record.pet_name}</span>
            </div>
          )}

          {/* Main photo preview */}
          {mainPhoto && (
            <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden' }}>
              <img
                src={mainPhoto.url}
                alt=""
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Comment + tags */}
          {record.supplier_comment && (
            <p style={{ marginBottom: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
              {record.supplier_comment}
            </p>
          )}

          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {tags.map((tag, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--bg)', borderRadius: 20, padding: '4px 12px',
                  fontSize: 12, fontWeight: 600, border: '1px solid var(--border)',
                }}>
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Question */}
          <p style={{ marginBottom: 10, fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
            {t('booking.approval_question', 'What would you like to do?')}
          </p>

          {/* Choice buttons with descriptions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHOICES.map(c => (
              <button
                key={c.value}
                onClick={() => setChoice(c.value)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                  border: choice === c.value ? '2px solid #E87C2B' : '1px solid var(--border)',
                  background: choice === c.value ? '#FFF7ED' : 'var(--surface)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18, marginTop: 2 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: choice === c.value ? 600 : 400, fontSize: 14 }}>
                    {t(c.labelKey, c.fallback)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary, #888)', marginTop: 2 }}>
                    {t(c.descKey, c.descFallback)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleConfirm}>
            {saving ? '...' : t('booking.choice_confirm', 'Confirm Choice')}
          </button>
        </div>
      </div>
    </div>
  );
}
