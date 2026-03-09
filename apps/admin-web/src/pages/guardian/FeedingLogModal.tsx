// 급여 기록 모달 — 등록 사료 선택 → 급여량/횟수/시간/메모 입력
import { useState } from 'react';
import { api, type FeedingLog, type Pet, type PetFeed } from '../../lib/api';
import { toDatetimeLocal, uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  editingLog: FeedingLog | null;
  selectedPet: Pet | null;
  petFeeds: PetFeed[];
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
  onOpenFeedManage?: () => void;
}

const EMPTY_FORM = {
  pet_feed_id: '',
  amount_g: '',
  frequency: '',
  feeding_time: '',
  memo: '',
};

export default function FeedingLogModal({
  open, editingLog, selectedPet, petFeeds,
  t, setError, onClose, onSuccess, onOpenFeedManage,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);

  const petId = selectedPet?.id;

  // Initialize form when opening
  if (open && !initialized) {
    if (editingLog) {
      setForm({
        pet_feed_id: editingLog.pet_feed_id || '',
        amount_g: editingLog.amount_g != null ? String(editingLog.amount_g) : '',
        frequency: editingLog.frequency != null ? String(editingLog.frequency) : '',
        feeding_time: editingLog.feeding_time ? toDatetimeLocal(editingLog.feeding_time) : toDatetimeLocal(),
        memo: editingLog.memo || '',
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        feeding_time: toDatetimeLocal(),
      });
    }
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  async function handleSave() {
    if (!petId) return;
    if (!form.pet_feed_id) {
      setError(t('guardian.feeding.select_feed', 'Please select a feed'));
      return;
    }

    const selectedFeed = petFeeds.find((f) => f.id === form.pet_feed_id);
    const feedModelId = selectedFeed?.feed_model_id || undefined;

    const payload = {
      pet_feed_id: form.pet_feed_id,
      feed_model_id: feedModelId,
      amount_g: form.amount_g ? Number(form.amount_g) : undefined,
      frequency: form.frequency ? Number(form.frequency) : undefined,
      feeding_time: form.feeding_time || undefined,
      memo: form.memo || undefined,
    };

    try {
      if (editingLog) {
        await api.pets.feedingLogs.update(petId, editingLog.id, payload);
      } else {
        await api.pets.feedingLogs.create(petId, payload);
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editingLog
              ? t('guardian.feeding.edit', '급여 기록 수정')
              : t('guardian.feeding.add', '급여 기록 추가')}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {petFeeds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p className="text-sm text-muted">{t('guardian.feeding.no_feeds_registered', '등록된 사료가 없습니다')}</p>
              {onOpenFeedManage && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => { onClose(); onOpenFeedManage(); }}>
                  {t('guardian.feed.manage_title', '사료 관리')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Feed select */}
              <div className="form-group">
                <label className="form-label" htmlFor="flog-feed">{t('guardian.feeding.select_feed', '사료 선택')} *</label>
                <select
                  id="flog-feed"
                  name="flog-feed"
                  className="form-select"
                  value={form.pet_feed_id}
                  onChange={(e) => setForm((p) => ({ ...p, pet_feed_id: e.target.value }))}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {petFeeds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nickname || f.model_display_label || f.model_name || f.feed_model_id}
                      {f.is_primary ? ` (${t('guardian.feed.is_primary', '기본')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount + Frequency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="flog-amount">{t('guardian.feeding.amount', '급여량 (g)')}</label>
                  <input
                    id="flog-amount"
                    name="flog-amount"
                    className="form-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.amount_g}
                    onChange={(e) => setForm((p) => ({ ...p, amount_g: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="flog-freq">{t('guardian.feeding.frequency', '급여 횟수/일')}</label>
                  <input
                    id="flog-freq"
                    name="flog-freq"
                    className="form-input"
                    type="number"
                    min="1"
                    max="20"
                    value={form.frequency}
                    onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
                  />
                </div>
              </div>

              {/* Feeding time */}
              <div className="form-group">
                <label className="form-label" htmlFor="flog-time">{t('guardian.feeding.time', '급여 시간')}</label>
                <input
                  id="flog-time"
                  name="flog-time"
                  className="form-input"
                  type="datetime-local"
                  value={form.feeding_time}
                  onChange={(e) => setForm((p) => ({ ...p, feeding_time: e.target.value }))}
                />
              </div>

              {/* Memo */}
              <div className="form-group">
                <label className="form-label" htmlFor="flog-memo">{t('guardian.feeding.memo', '메모')}</label>
                <textarea
                  id="flog-memo"
                  name="flog-memo"
                  className="form-input"
                  rows={2}
                  value={form.memo}
                  onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                />
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          {petFeeds.length > 0 && (
            <button className="btn btn-primary" onClick={() => void handleSave()}>
              {t('guardian.feeding.save', '저장')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
