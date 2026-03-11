import { useEffect, useState } from 'react';
import { api, type FriendRequest, type FriendConnection } from '../../lib/api';
import { formatDate, uiErrorMessage } from './guardianTypes';

type FriendsTab = 'friends' | 'pending';

interface Props {
  open: boolean;
  initialTab?: FriendsTab;
  pendingRequests: FriendRequest[];
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FriendsModal({ open, initialTab = 'friends', pendingRequests, t, setError, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<FriendsTab>(initialTab);
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      loadFriends();
    }
  }, [open, initialTab]);

  async function loadFriends() {
    setLoadingFriends(true);
    try {
      const res = await api.friends.list();
      setFriends(res.friends || []);
    } catch { /* ignore */ }
    finally { setLoadingFriends(false); }
  }

  async function handleRespond(requestId: string, action: 'accept' | 'reject') {
    setRespondingId(requestId);
    try {
      await api.friends.requests.respond(requestId, action);
      onSuccess();
      if (action === 'accept') await loadFriends();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.friends.respond_failed', 'Failed to process request.')));
    } finally {
      setRespondingId(null);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('guardian.friends.title', 'Friends')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body guardian-modal-body">
          {/* Tab bar */}
          <div className="pf-friends-tabs">
            <button className={`pf-friends-tab${tab === 'friends' ? ' active' : ''}`} onClick={() => setTab('friends')}>
              {t('guardian.friends.tab_friends', 'Friends')}
            </button>
            <button className={`pf-friends-tab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>
              {t('guardian.friends.tab_pending', 'Pending')}
              {pendingRequests.length > 0 && <span className="pf-friends-tab-badge">{pendingRequests.length}</span>}
            </button>
          </div>

          {/* Friends list */}
          {tab === 'friends' && (
            <div>
              {loadingFriends && <div className="loading-center"><span className="spinner" /></div>}
              {!loadingFriends && friends.length === 0 && (
                <div className="pf-friends-empty">
                  <div className="pf-friends-empty-icon">👥</div>
                  <div className="pf-friends-empty-title">{t('guardian.friends.empty_title', 'No friends yet')}</div>
                  <div className="pf-friends-empty-desc">{t('guardian.friends.empty_desc', 'Send friend requests from the feed to connect.')}</div>
                </div>
              )}
              {friends.map((f) => (
                <div key={f.id} className="pf-friends-item">
                  <div className="pf-friends-avatar">{(f.friend_email || '?')[0].toUpperCase()}</div>
                  <div className="pf-friends-info">
                    <div className="pf-friends-name">{f.friend_email}</div>
                    <div className="pf-friends-meta">{formatDate(f.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending requests */}
          {tab === 'pending' && (
            <div>
              {pendingRequests.length === 0 && (
                <div className="pf-friends-empty">
                  <div className="pf-friends-empty-icon">✓</div>
                  <div className="pf-friends-empty-title">{t('guardian.friends.no_pending_title', 'No pending requests')}</div>
                  <div className="pf-friends-empty-desc">{t('guardian.friends.no_pending_desc', "You're all caught up!")}</div>
                </div>
              )}
              {pendingRequests.map((r) => (
                <div key={r.id} className="pf-friends-item">
                  <div className="pf-friends-avatar">{(r.requester_email || '?')[0].toUpperCase()}</div>
                  <div className="pf-friends-info">
                    <div className="pf-friends-name">{r.requester_email}</div>
                    <div className="pf-friends-meta">{formatDate(r.created_at)}</div>
                  </div>
                  <div className="pf-friends-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={respondingId === r.id}
                      onClick={() => handleRespond(r.id, 'accept')}
                    >
                      {t('guardian.friends.accept', 'Accept')}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={respondingId === r.id}
                      onClick={() => handleRespond(r.id, 'reject')}
                    >
                      {t('guardian.friends.reject', 'Reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
