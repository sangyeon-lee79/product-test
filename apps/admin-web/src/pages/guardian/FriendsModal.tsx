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

function calcAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function initial(name: string | null | undefined): string {
  return (name || '?')[0].toUpperCase();
}

function petEmoji(typeCode: string | null | undefined): string {
  if (!typeCode) return '🐾';
  const c = typeCode.toLowerCase();
  if (c.includes('dog')) return '🐶';
  if (c.includes('cat')) return '🐱';
  if (c.includes('bird')) return '🐦';
  if (c.includes('fish')) return '🐟';
  if (c.includes('rabbit') || c.includes('bunny')) return '🐰';
  return '🐾';
}

export default function FriendsModal({ open, initialTab = 'friends', pendingRequests, t, setError, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<FriendsTab>(initialTab);
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [enrichedPending, setEnrichedPending] = useState<FriendRequest[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      loadFriends();
      loadEnrichedPending();
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

  async function loadEnrichedPending() {
    setLoadingPending(true);
    try {
      const res = await api.friends.requests.list('inbox');
      setEnrichedPending((res.requests || []).filter(r => r.status === 'request_sent'));
    } catch { /* ignore */ }
    finally { setLoadingPending(false); }
  }

  async function handleRespond(requestId: string, action: 'accept' | 'reject') {
    setRespondingId(requestId);
    try {
      await api.friends.requests.respond(requestId, action);
      setEnrichedPending(prev => prev.filter(r => r.id !== requestId));
      onSuccess();
      if (action === 'accept') await loadFriends();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.friends.respond_failed', 'Failed to process request.')));
    } finally {
      setRespondingId(null);
    }
  }

  function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
    if (fallback) fallback.style.display = '';
  }

  if (!open) return null;

  const pendingCount = pendingRequests.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pf-friends-modal" onClick={(e) => e.stopPropagation()}>
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
              {pendingCount > 0 && <span className="pf-friends-tab-badge">{pendingCount}</span>}
            </button>
          </div>

          {/* ── Friends list ── */}
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
              {friends.map((f) => {
                const displayName = f.friend_display_name || f.friend_email;
                const hasAvatar = !!f.friend_avatar_url;
                return (
                  <div key={f.id} className="pf-friends-item">
                    <div className="pf-friends-avatar">
                      {hasAvatar && <img src={f.friend_avatar_url!} alt="" className="pf-friends-avatar-img" onError={handleImgError} />}
                      <span style={hasAvatar ? { display: 'none' } : undefined}>{initial(displayName)}</span>
                    </div>
                    <div className="pf-friends-info">
                      <div className="pf-friends-name">{displayName}</div>
                      <div className="pf-friends-meta">{formatDate(f.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pending requests (rich cards) ── */}
          {tab === 'pending' && (
            <div>
              {loadingPending && <div className="loading-center"><span className="spinner" /></div>}
              {!loadingPending && enrichedPending.length === 0 && (
                <div className="pf-friends-empty">
                  <div className="pf-friends-empty-icon">✓</div>
                  <div className="pf-friends-empty-title">{t('guardian.friends.no_pending_title', 'No pending requests')}</div>
                  <div className="pf-friends-empty-desc">{t('guardian.friends.no_pending_desc', "You're all caught up!")}</div>
                </div>
              )}
              {enrichedPending.map((r) => {
                const displayName = r.requester_display_name || r.requester_email || '?';
                const hasAvatar = !!r.requester_avatar_url;
                const pets = r.requester_pets || [];
                const petsTotal = r.requester_pets_total || pets.length;
                const feedImages = r.requester_feed_images || [];
                const isResponding = respondingId === r.id;

                return (
                  <div key={r.id} className="pf-friends-card">
                    {/* [1] Guardian header */}
                    <div className="pf-friends-card-header">
                      <div className="pf-friends-card-avatar">
                        {hasAvatar && <img src={r.requester_avatar_url!} alt="" onError={handleImgError} />}
                        <span style={hasAvatar ? { display: 'none' } : undefined}>{initial(displayName)}</span>
                      </div>
                      <div className="pf-friends-card-info">
                        <div className="pf-friends-card-name">{displayName}</div>
                        {r.requester_country_name && (
                          <div className="pf-friends-card-location">📍 {r.requester_country_name}</div>
                        )}
                        <div className="pf-friends-card-meta">
                          {t('guardian.friends.card.requested_at', 'Requested')} {formatDate(r.created_at)}
                          {r.requester_joined_at && (
                            <> · {t('guardian.friends.card.joined', 'Joined')} {formatDate(r.requester_joined_at)}</>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* [2] Pet list */}
                    {pets.length > 0 ? (
                      <div className="pf-friends-card-section">
                        <div className="pf-friends-card-section-title">
                          {t('guardian.friends.card.pets_title', 'Pets')} ({petsTotal})
                        </div>
                        <div className="pf-friends-card-pets">
                          {pets.map((pet) => {
                            const age = calcAge(pet.birth_date);
                            const hasPetAvatar = !!pet.avatar_url;
                            return (
                              <div key={pet.id} className="pf-friends-card-pet">
                                <div className="pf-friends-card-pet-avatar">
                                  {hasPetAvatar && <img src={pet.avatar_url!} alt="" onError={handleImgError} />}
                                  <span style={hasPetAvatar ? { display: 'none' } : undefined}>{petEmoji(pet.pet_type_code)}</span>
                                </div>
                                <div className="pf-friends-card-pet-name">{pet.name}</div>
                                {pet.breed_code && <div className="pf-friends-card-pet-breed">{pet.breed_code}</div>}
                                {age !== null && (
                                  <div className="pf-friends-card-pet-age">
                                    {t('guardian.friends.card.pet_age', '{age}y').replace('{age}', String(age))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {petsTotal > 4 && (
                            <div className="pf-friends-card-pet pf-friends-card-pet--more">
                              {t('guardian.friends.card.more_pets', '+{count} more').replace('{count}', String(petsTotal - 4))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pf-friends-card-section-empty">
                        {t('guardian.friends.card.no_pets', 'No pets registered')}
                      </div>
                    )}

                    {/* [3] Public feed preview */}
                    {feedImages.length > 0 && (
                      <div className="pf-friends-card-section">
                        <div className="pf-friends-card-section-title">
                          {t('guardian.friends.card.recent_posts', 'Recent Posts')}
                        </div>
                        <div className="pf-friends-card-feed-preview">
                          {feedImages.map((img) => (
                            <img
                              key={img.post_id}
                              className="pf-friends-card-feed-thumb"
                              src={img.thumbnail_url || img.media_url}
                              alt=""
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* [4] Accept / Reject buttons */}
                    <div className="pf-friends-card-actions">
                      <button
                        className="pf-friends-card-btn pf-friends-card-btn--accept"
                        disabled={isResponding}
                        onClick={() => handleRespond(r.id, 'accept')}
                      >
                        {isResponding ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : t('guardian.friends.accept', 'Accept')}
                      </button>
                      <button
                        className="pf-friends-card-btn pf-friends-card-btn--reject"
                        disabled={isResponding}
                        onClick={() => handleRespond(r.id, 'reject')}
                      >
                        {t('guardian.friends.reject', 'Reject')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
