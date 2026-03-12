import { useEffect, useState, useCallback } from 'react';
import { api, type FriendRequest, type FriendConnection, type FriendSearchResult } from '../../lib/api';
import { formatDate, uiErrorMessage } from './guardianTypes';

type FriendsTab = 'friends' | 'pending';

interface Props {
  open: boolean;
  initialTab?: FriendsTab;
  pendingRequests: FriendRequest[];
  lang?: string;
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

const PLACEHOLDER_AVATAR = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%23F0E8DF"/><text x="32" y="38" text-anchor="middle" font-size="24" fill="%23E87C2B">?</text></svg>'
);

export default function FriendsModal({ open, initialTab = 'friends', pendingRequests, lang, t, setError, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<FriendsTab>(initialTab);
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [enrichedPending, setEnrichedPending] = useState<FriendRequest[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [fadingOutId, setFadingOutId] = useState<string | null>(null);

  // Search states
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<FriendSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setSearchEmail('');
      setSearchResult(null);
      setSearchError(null);
      setRequestSent(false);
      setFadingOutId(null);
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

  const handleRespond = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
    setRespondingId(requestId);
    try {
      await api.friends.requests.respond(requestId, action);
      // Fade-out animation before removing
      setFadingOutId(requestId);
      setTimeout(() => {
        setEnrichedPending(prev => prev.filter(r => r.id !== requestId));
        setFadingOutId(null);
      }, 300);
      onSuccess();
      if (action === 'accept') await loadFriends();
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.friends.respond_failed', 'Failed to process request.')));
    } finally {
      setRespondingId(null);
    }
  }, [onSuccess, setError, t]);

  async function handleSearch() {
    const trimmed = searchEmail.trim();
    if (!trimmed) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError(null);
    setRequestSent(false);
    try {
      const res = await api.friends.search(trimmed, lang);
      if (!res.user) {
        setSearchError(t('friends.search.not_found', 'No user found with this email'));
      } else {
        setSearchResult(res.user);
      }
    } catch {
      setSearchError(t('friends.search.error', 'Search failed'));
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest() {
    if (!searchResult) return;
    setSendingRequest(true);
    try {
      await api.friends.requests.create({ receiver_user_id: searchResult.id });
      setRequestSent(true);
      setSearchResult(prev => prev ? { ...prev, friend_status: 'pending' } : null);
      onSuccess();
    } catch (e) {
      setError(uiErrorMessage(e, t('friends.search.error', 'Failed')));
    } finally {
      setSendingRequest(false);
    }
  }

  function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.src = PLACEHOLDER_AVATAR;
    e.currentTarget.onerror = null;
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
          {/* ── Friend search ── */}
          <div className="pf-friends-search">
            <div className="pf-friends-search-input-row">
              <input
                className="pf-friends-search-input"
                type="email"
                placeholder={t('friends.search.placeholder', 'Search by email')}
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
                disabled={searching}
              />
              <button
                className="pf-friends-search-btn"
                onClick={() => void handleSearch()}
                disabled={searching || !searchEmail.trim()}
              >
                {searching
                  ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  : t('friends.search.button', 'Search')}
              </button>
            </div>

            {searchError && (
              <div className="pf-friends-search-msg pf-friends-search-msg--error">{searchError}</div>
            )}

            {searchResult && (
              <div className="pf-friends-search-card">
                <div className="pf-friends-card-header">
                  <div className="pf-friends-card-avatar">
                    <img
                      src={searchResult.avatar_url || PLACEHOLDER_AVATAR}
                      alt=""
                      onError={handleImgError}
                    />
                    {!searchResult.avatar_url && (
                      <span className="pf-friends-card-avatar-initial">{initial(searchResult.display_name)}</span>
                    )}
                  </div>
                  <div className="pf-friends-card-info">
                    <div className="pf-friends-card-name">{searchResult.display_name}</div>
                    <div className="pf-friends-card-meta" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {searchResult.email}
                    </div>
                    {searchResult.pets.length > 0 && (
                      <div className="pf-friends-card-meta" style={{ marginTop: 4 }}>
                        {searchResult.pets.map((pet, i) => (
                          <span key={i}>
                            {i > 0 && ' · '}
                            {petEmoji(pet.pet_type_code)} {pet.name}
                            {pet.breed_code && <span style={{ color: 'var(--text-muted)' }}> · {pet.breed_code}</span>}
                          </span>
                        ))}
                      </div>
                    )}
                    {searchResult.pets.length === 0 && (
                      <div className="pf-friends-card-meta" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                        {t('friends.search.no_pets', 'No pets registered')}
                      </div>
                    )}
                    {(searchResult.country_name || searchResult.region_text) && (
                      <div className="pf-friends-card-location" style={{ marginTop: 2 }}>
                        📍 {[searchResult.country_name, searchResult.region_text?.split('|')[0]].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pf-friends-card-actions">
                  {searchResult.friend_status === 'self' && (
                    <div className="pf-friends-search-status pf-friends-search-status--muted">
                      {t('friends.search.self_search', 'You cannot add yourself')}
                    </div>
                  )}
                  {searchResult.friend_status === 'friend' && (
                    <div className="pf-friends-search-status pf-friends-search-status--success">
                      ✓ {t('friends.search.already_friend', 'Already friends')}
                    </div>
                  )}
                  {searchResult.friend_status === 'pending' && (
                    <div className="pf-friends-search-status pf-friends-search-status--pending">
                      ⏳ {t('friends.search.pending', 'Request pending')}
                    </div>
                  )}
                  {searchResult.friend_status === 'none' && !requestSent && (
                    <button
                      className="pf-friends-card-btn pf-friends-card-btn--accept"
                      style={{ width: '100%' }}
                      onClick={() => void handleSendRequest()}
                      disabled={sendingRequest}
                    >
                      {sendingRequest
                        ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        : t('friends.search.send_request', 'Send Friend Request')}
                    </button>
                  )}
                  {requestSent && (
                    <div className="pf-friends-search-status pf-friends-search-status--success">
                      ✓ {t('friends.search.sent_success', 'Request sent')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
                return (
                  <div key={f.id} className="pf-friends-item">
                    <div className="pf-friends-avatar">
                      <img
                        src={f.friend_avatar_url || PLACEHOLDER_AVATAR}
                        alt=""
                        className="pf-friends-avatar-img"
                        onError={handleImgError}
                      />
                      {!f.friend_avatar_url && (
                        <span className="pf-friends-avatar-initial">{initial(displayName)}</span>
                      )}
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

          {/* ── Pending requests (redesigned rich cards) ── */}
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
                const pets = r.requester_pets || [];
                const petsTotal = r.requester_pets_total || pets.length;
                const feedImages = r.requester_feed_images || [];
                const isResponding = respondingId === r.id;
                const isFadingOut = fadingOutId === r.id;

                return (
                  <div
                    key={r.id}
                    className={`pf-friends-card${isFadingOut ? ' pf-friends-card--fadeout' : ''}`}
                  >
                    {/* [1] Guardian header — 64px avatar with amber border */}
                    <div className="pf-friends-card-header">
                      <div className="pf-friends-card-avatar pf-friends-card-avatar--lg">
                        <img
                          src={r.requester_avatar_url || PLACEHOLDER_AVATAR}
                          alt=""
                          onError={handleImgError}
                        />
                        {!r.requester_avatar_url && (
                          <span className="pf-friends-card-avatar-initial">{initial(displayName)}</span>
                        )}
                      </div>
                      <div className="pf-friends-card-info">
                        <div className="pf-friends-card-name">{displayName}</div>
                        <div className="pf-friends-card-role">
                          {t('guardian.friends.card.guardian_label', 'Guardian')}
                        </div>
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

                    {/* [2] Pet list — max 3 visible + overflow */}
                    {pets.length > 0 ? (
                      <div className="pf-friends-card-section">
                        <div className="pf-friends-card-section-title">
                          {t('guardian.friends.card.pets_title', 'Pets')} ({petsTotal})
                        </div>
                        <div className="pf-friends-card-pets">
                          {pets.slice(0, 3).map((pet) => {
                            const age = calcAge(pet.birth_date);
                            return (
                              <div key={pet.id} className="pf-friends-card-pet">
                                <div className="pf-friends-card-pet-avatar">
                                  {pet.avatar_url
                                    ? <img src={pet.avatar_url} alt="" onError={handleImgError} />
                                    : <span>{petEmoji(pet.pet_type_code)}</span>
                                  }
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
                          {petsTotal > 3 && (
                            <div className="pf-friends-card-pet pf-friends-card-pet--more">
                              {t('guardian.friends.card.more_pets', '+{count} more').replace('{count}', String(petsTotal - 3))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pf-friends-card-section-empty">
                        {t('guardian.friends.card.no_pets', 'No pets registered')}
                      </div>
                    )}

                    {/* [3] Public feed preview — 80px thumbnails */}
                    {feedImages.length > 0 && (
                      <div className="pf-friends-card-section">
                        <div className="pf-friends-card-section-title">
                          {t('guardian.friends.card.feed_title', 'Feed')}
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

                    {/* [4] Full-width Accept / Reject buttons */}
                    <div className="pf-friends-card-actions">
                      <button
                        className="pf-friends-card-btn pf-friends-card-btn--accept"
                        disabled={isResponding}
                        onClick={() => void handleRespond(r.id, 'accept')}
                      >
                        {isResponding ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : t('guardian.friends.accept', 'Accept')}
                      </button>
                      <button
                        className="pf-friends-card-btn pf-friends-card-btn--reject"
                        disabled={isResponding}
                        onClick={() => void handleRespond(r.id, 'reject')}
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
