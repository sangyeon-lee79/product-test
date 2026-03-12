import { useState } from 'react';
import { api, type GroomingRecord } from '../../lib/api';

interface Props {
  open: boolean;
  record: GroomingRecord;
  t: (key: string, fallback?: string) => string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GroomingApprovalModal({ open, record, t, onClose, onSuccess }: Props) {
  const [choice, setChoice] = useState<'feed_only' | 'approve_only' | 'approve_and_feed'>('approve_and_feed');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.save', 'Failed'));
    } finally {
      setSaving(false);
    }
  }

  const CHOICES = [
    { value: 'feed_only' as const, icon: '\uD83D\uDCE2', labelKey: 'grooming.guardian.choice_feed', fallback: 'Share to Feed' },
    { value: 'approve_only' as const, icon: '\u2705', labelKey: 'grooming.guardian.choice_approve', fallback: 'Approve Only' },
    { value: 'approve_and_feed' as const, icon: '\uD83C\uDF1F', labelKey: 'grooming.guardian.choice_both', fallback: 'Approve & Share' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('grooming.guardian.noti_title', 'Grooming is complete')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Supplier banner */}
          <div style={{ padding: '10px 14px', background: '#FFF7ED', borderRadius: 8, marginBottom: 14, fontWeight: 600, color: '#92400E' }}>
            {record.supplier_name}
          </div>

          {/* Main photo preview */}
          {mainPhoto && (
            <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden' }}>
              <img src={mainPhoto.url} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />
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

          {/* Choice buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHOICES.map(c => (
              <button
                key={c.value}
                onClick={() => setChoice(c.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                  border: choice === c.value ? '2px solid #E87C2B' : '1px solid var(--border)',
                  background: choice === c.value ? '#FFF7ED' : 'var(--surface)',
                  fontWeight: choice === c.value ? 600 : 400,
                  fontSize: 14, textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                {t(c.labelKey, c.fallback)}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleConfirm}>
            {saving ? '...' : t('grooming.guardian.confirm_btn', 'Confirm Choice')}
          </button>
        </div>
      </div>
    </div>
  );
}
