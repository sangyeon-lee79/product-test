import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type FeedComment, type FeedPost } from '../lib/api';
import { getStoredRole, isLoggedIn } from '../lib/auth';

type FeedTab = 'all' | 'friends';
type Option = { id: string; label: string };

function parseJwtSub(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const payload = JSON.parse(atob(base64)) as { sub?: string };
    return payload.sub || null;
  } catch { return null; }
}

function ensureArray(raw: string[] | string | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') as string[] : [];
  } catch { return []; }
}

function formatDate(iso?: string | null): string {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function uiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError'))
      return '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    return msg;
  }
  return fallback;
}

/* ── Nav items config ─────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: '🏠', label: '홈',     to: '/'        },
  { icon: '🔍', label: '탐색',   to: '/explore' },
  { icon: '🔔', label: '알림',   to: null       },
  { icon: '🐾', label: '내 펫',  to: '/guardian'},
  { icon: '📅', label: '예약',   to: null       },
  { icon: '👤', label: '프로필', to: null       },
];

/* ── Component ────────────────────────────────────────────── */
export default function PublicHome() {
  /* ── State (모든 기존 state 유지) ─────────────────────── */
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [feeds, setFeeds]     = useState<FeedPost[]>([]);
  const [tab, setTab]         = useState<FeedTab>('all');
  const [businessCategoryId, setBusinessCategoryId] = useState('');
  const [petTypeId, setPetTypeId]                   = useState('');
  const [businessOptions, setBusinessOptions]       = useState<Option[]>([]);
  const [petTypeOptions, setPetTypeOptions]         = useState<Option[]>([]);
  const [commentMap, setCommentMap]   = useState<Record<string, FeedComment[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent]     = useState('');
  const [friendEmail, setFriendEmail]   = useState('');
  const [friendMessage, setFriendMessage] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('petfolio-theme') === 'dark');

  const loggedIn   = isLoggedIn();
  const role       = getStoredRole();
  const myUserId   = useMemo(() => parseJwtSub(), []);
  const navigate   = useNavigate();

  /* Dark mode */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('petfolio-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  /* Derived: story bar authors */
  const storyAuthors = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const f of feeds) {
      const a = f.author_email;
      if (a && !seen.has(a)) { seen.add(a); out.push(a); }
    }
    return out.slice(0, 12);
  }, [feeds]);

  /* Derived: suggested users for right panel */
  const suggestedUsers = useMemo(() => storyAuthors.slice(0, 5), [storyAuthors]);

  /* ── API calls (모두 기존 그대로) ─────────────────────── */
  async function loadFeed(nextTab = tab, nextBusiness = businessCategoryId, nextPetType = petTypeId) {
    setLoading(true); setError('');
    try {
      const listRes   = await api.feeds.list({ tab: nextTab, business_category_id: nextBusiness || undefined, pet_type_id: nextPetType || undefined, limit: 40 });
      const optionRes = await api.feeds.list({ limit: 100 }).catch(() => ({ feeds: [] as FeedPost[] }));
      const base = listRes.feeds || [];
      const all  = optionRes.feeds || [];
      setFeeds(base);
      const bMap = new Map<string, string>();
      const pMap = new Map<string, string>();
      for (const row of all) {
        if (row.business_category_id) bMap.set(row.business_category_id, row.business_category_ko || row.business_category_key || row.business_category_id);
        if (row.pet_type_id)          pMap.set(row.pet_type_id,          row.pet_type_ko  || row.pet_type_key  || row.pet_type_id);
      }
      setBusinessOptions(Array.from(bMap.entries()).map(([id, label]) => ({ id, label })));
      setPetTypeOptions (Array.from(pMap.entries()).map(([id, label]) => ({ id, label })));
    } catch (e) { setError(uiErrorMessage(e, '피드 데이터를 불러오지 못했습니다.')); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadFeed(); }, []);

  async function toggleLike(feed: FeedPost) {
    if (!loggedIn) return;
    try {
      Number(feed.liked_by_me || 0) > 0 ? await api.feeds.unlike(feed.id) : await api.feeds.like(feed.id);
      await loadFeed();
    } catch (e) { setError(uiErrorMessage(e, '좋아요 처리에 실패했습니다.')); }
  }

  async function toggleComments(feedId: string) {
    const next = !openComments[feedId];
    setOpenComments((p) => ({ ...p, [feedId]: next }));
    if (!next || commentMap[feedId]) return;
    try {
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((p) => ({ ...p, [feedId]: res.comments || [] }));
    } catch (e) { setError(uiErrorMessage(e, '댓글을 불러오지 못했습니다.')); }
  }

  async function createComment(feedId: string) {
    if (!loggedIn) return;
    const content = (commentInput[feedId] || '').trim();
    if (!content) return;
    try {
      await api.feeds.comments.create(feedId, content);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((p) => ({ ...p, [feedId]: res.comments || [] }));
      setCommentInput((p) => ({ ...p, [feedId]: '' }));
      await loadFeed();
    } catch (e) { setError(uiErrorMessage(e, '댓글 등록에 실패했습니다.')); }
  }

  async function saveEditedComment(feedId: string, commentId: string) {
    const content = editingContent.trim();
    if (!content) return;
    try {
      await api.feeds.comments.update(feedId, commentId, content);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((p) => ({ ...p, [feedId]: res.comments || [] }));
      setEditingCommentId(null); setEditingContent('');
    } catch (e) { setError(uiErrorMessage(e, '댓글 수정에 실패했습니다.')); }
  }

  async function deleteComment(feedId: string, commentId: string) {
    try {
      await api.feeds.comments.remove(feedId, commentId);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((p) => ({ ...p, [feedId]: res.comments || [] }));
      await loadFeed();
    } catch (e) { setError(uiErrorMessage(e, '댓글 삭제에 실패했습니다.')); }
  }

  async function sendFriendRequest() {
    if (!loggedIn) return;
    const email = friendEmail.trim().toLowerCase();
    if (!email) return;
    setFriendMessage('');
    try {
      const res = await api.friends.requests.create({ receiver_email: email });
      if (res.status === 'already_friends')  setFriendMessage('이미 연결된 사용자입니다.');
      else if (res.status === 'request_sent') setFriendMessage('연결 요청을 보냈습니다.');
      else                                    setFriendMessage('요청 처리 완료');
      setFriendEmail('');
    } catch (e) { setFriendMessage(uiErrorMessage(e, '요청 처리에 실패했습니다.')); }
  }

  /* ── Sidebar component (inline) ───────────────────────── */
  const Sidebar = () => (
    <aside className="ig-sidebar">
      <div className="ig-sidebar-logo">Petfolio</div>

      {/* Hero mini (비로그인) */}
      {!loggedIn && (
        <div className="ig-hero-mini">
          <h3>반려동물의 삶을<br />아름답게 기록하다</h3>
          <p>SNS + 포트폴리오 아카이브</p>
          <Link to="/signup" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>시작하기</Link>
        </div>
      )}

      <nav className="ig-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.to === '/';
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={`ig-nav-item${isActive ? ' active' : ''}`}>
                <span className="ig-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          }
          return (
            <button key={item.label} className="ig-nav-item" disabled={!loggedIn} style={{ opacity: !loggedIn ? .4 : 1 }}>
              <span className="ig-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="ig-sidebar-footer">
        <button className="ig-dark-toggle" onClick={() => setIsDark((d) => !d)}>
          <span className="ig-nav-icon">{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? '라이트 모드' : '다크 모드'}</span>
        </button>
        {!loggedIn && (
          <Link to="/login" className="ig-nav-item">
            <span className="ig-nav-icon">🔑</span>
            <span>로그인</span>
          </Link>
        )}
        <Link to="/admin/login" className="ig-nav-item" style={{ opacity: .5 }}>
          <span className="ig-nav-icon">⚙️</span>
          <span>Admin</span>
        </Link>
      </div>
    </aside>
  );

  /* ── Feed card renderer ────────────────────────────────── */
  const renderFeedCard = (feed: FeedPost) => {
    const media      = ensureArray(feed.media_urls);
    const tags       = ensureArray(feed.tags);
    const comments   = commentMap[feed.id] || [];
    const isLiked    = Number(feed.liked_by_me || 0) > 0;
    const authorLine = feed.feed_type === 'booking_completed'
      ? `${feed.booking_guardian_email || '-'} + ${feed.booking_supplier_email || '-'}`
      : (feed.author_email || '-');
    const avatarLetter = authorLine[0]?.toUpperCase() || '?';
    const canDelete  = !!(myUserId && feed.author_user_id === myUserId);
    const displayBusiness = feed.business_category_ko || feed.business_category_key || null;

    return (
      <article key={feed.id} className="ig-card">
        {/* Header */}
        <div className="ig-card-header">
          <div className="ig-avatar">{avatarLetter}</div>
          <div className="ig-card-author">
            <div className="ig-card-username">{authorLine.split('@')[0] || authorLine}</div>
            <div className="ig-card-meta">
              <span>{formatDate(feed.created_at)}</span>
              {feed.pet_name && <span className="ig-pet-badge">{feed.pet_name}</span>}
              {displayBusiness && <span className="ig-pet-badge" style={{ background: 'rgba(100,150,255,.12)', color: '#3B5BDB' }}>{displayBusiness}</span>}
            </div>
          </div>
          {canDelete && (
            <button className="ig-card-menu" onClick={() => api.feeds.remove(feed.id).then(() => loadFeed()).catch(() => null)}>···</button>
          )}
        </div>

        {/* Image — 1:1 */}
        {media.length === 1 && (
          <div className="ig-card-image">
            <img src={media[0]} alt={feed.caption || 'post'} loading="lazy" />
          </div>
        )}
        {media.length > 1 && (
          <div className="ig-card-media-grid">
            {media.slice(0, 4).map((url, i) => (
              <div key={i} className="ig-card-media-tile">
                <img src={url} alt="post" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        {/* Text-only post */}
        {media.length === 0 && feed.caption && (
          <div className="ig-card-text-body">{feed.caption}</div>
        )}

        {/* Actions */}
        <div className="ig-card-actions">
          <button
            className={`ig-action-btn${isLiked ? ' liked' : ''}`}
            onClick={() => toggleLike(feed)}
            disabled={!loggedIn}
            title={!loggedIn ? '로그인 후 이용 가능' : ''}
          >
            {isLiked ? '♥' : '♡'}
          </button>
          <button className="ig-action-btn" onClick={() => toggleComments(feed.id)} title="댓글">
            💬
          </button>
          <div className="ig-spacer" />
        </div>

        {/* Like count */}
        {(feed.like_count || 0) > 0 && (
          <div className="ig-card-likes">좋아요 {feed.like_count}개</div>
        )}

        {/* Caption (images present) */}
        {media.length > 0 && feed.caption && (
          <div className="ig-card-caption clamp">
            <span className="cap-user">{authorLine.split('@')[0]}</span>
            {feed.caption}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="ig-card-tags">{tags.map((t) => <span key={t}>#{t}</span>)}</div>
        )}

        {/* Comment peek / toggle */}
        <div className="ig-card-comment-peek" onClick={() => toggleComments(feed.id)}>
          {(feed.comment_count || 0) > 0
            ? `댓글 ${feed.comment_count}개 모두 보기`
            : '댓글 달기…'}
        </div>

        {/* Comment section */}
        {openComments[feed.id] && (
          <div className="ig-card-comments">
            {comments.length > 0 && (
              <div className="ig-comment-list">
                {comments.map((c) => {
                  const mine = !!(myUserId && c.author_user_id === myUserId);
                  const isEditing = editingCommentId === c.id;
                  return (
                    <div key={c.id} className="ig-comment-item">
                      {isEditing ? (
                        <div className="ig-comment-input-row">
                          <input className="ig-comment-input" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                          <button className="ig-comment-post-btn" onClick={() => saveEditedComment(feed.id, c.id)}>저장</button>
                          <button className="ig-comment-post-btn" style={{ color: 'var(--text-muted)' }} onClick={() => { setEditingCommentId(null); setEditingContent(''); }}>취소</button>
                        </div>
                      ) : (
                        <>
                          <span className="ig-comment-user">{c.author_email?.split('@')[0] || c.author_user_id}</span>
                          {c.content}
                          <div className="ig-comment-meta">{formatDate(c.created_at)}</div>
                          {mine && (
                            <div className="ig-comment-actions">
                              <button className="ig-comment-post-btn" style={{ fontSize: 11 }} onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }}>수정</button>
                              <button className="ig-comment-post-btn" style={{ fontSize: 11, color: 'var(--danger)' }} onClick={() => deleteComment(feed.id, c.id)}>삭제</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="ig-comment-input-row">
              <input
                className="ig-comment-input"
                placeholder={loggedIn ? '댓글 달기…' : '로그인 후 댓글 작성 가능'}
                value={commentInput[feed.id] || ''}
                onChange={(e) => setCommentInput((p) => ({ ...p, [feed.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && createComment(feed.id)}
                disabled={!loggedIn}
              />
              <button className="ig-comment-post-btn" onClick={() => createComment(feed.id)} disabled={!loggedIn}>게시</button>
            </div>
          </div>
        )}
      </article>
    );
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="ig-layout">
      <Sidebar />

      {/* ── Main area ──────────────────────────────────── */}
      <div className="ig-main">

        {/* ── Feed column ──────────────────────────────── */}
        <div className="ig-feed-col">

          {/* Story bar */}
          {storyAuthors.length > 0 && (
            <div className="ig-story-bar">
              {storyAuthors.map((author) => (
                <div key={author} className="ig-story-item">
                  <div className="ig-story-ring">
                    <div className="ig-story-avatar">{author[0].toUpperCase()}</div>
                  </div>
                  <span className="ig-story-label">{author.split('@')[0]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Feed tabs */}
          <div className="ig-feed-tabs">
            <button className={`ig-feed-tab${tab === 'all' ? ' active' : ''}`}
              onClick={() => { setTab('all'); loadFeed('all', businessCategoryId, petTypeId); }}>
              전체 피드
            </button>
            <button className={`ig-feed-tab${tab === 'friends' ? ' active' : ''}`}
              onClick={() => { setTab('friends'); loadFeed('friends', businessCategoryId, petTypeId); }}
              disabled={!loggedIn} title={!loggedIn ? '로그인 후 이용 가능' : ''}>
              친구 피드
            </button>
          </div>

          {/* Compact filters */}
          <div className="ig-filter-row">
            <select className="form-select" value={businessCategoryId}
              onChange={(e) => { const v = e.target.value; setBusinessCategoryId(v); loadFeed(tab, v, petTypeId); }}>
              <option value="">업종 전체</option>
              {businessOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <select className="form-select" value={petTypeId}
              onChange={(e) => { const v = e.target.value; setPetTypeId(v); loadFeed(tab, businessCategoryId, v); }}>
              <option value="">펫 유형 전체</option>
              {petTypeOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Feed list */}
          {loading ? (
            <div className="loading-center"><span className="spinner" /></div>
          ) : feeds.length === 0 ? (
            <div className="ig-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🐾</div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>아직 피드가 없습니다</p>
              <p style={{ fontSize: 13 }}>첫 번째 이야기를 올려보세요.</p>
            </div>
          ) : (
            feeds.map(renderFeedCard)
          )}
        </div>

        {/* ── Right panel ──────────────────────────────── */}
        <aside className="ig-right-col">

          {/* Profile mini */}
          {loggedIn ? (
            <div className="ig-profile-mini">
              <div className="ig-profile-mini-avatar">
                {(myUserId || '?')[0].toUpperCase()}
              </div>
              <div className="ig-profile-mini-info">
                <div className="ig-profile-mini-name">{role === 'guardian' ? 'Guardian' : role}</div>
                <div className="ig-profile-mini-sub">Petfolio 계정</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <Link to="/login"  className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>로그인</Link>
              <Link to="/signup" className="btn btn-primary btn-sm"   style={{ flex: 1, justifyContent: 'center' }}>시작하기</Link>
            </div>
          )}

          {/* Suggested users */}
          {suggestedUsers.length > 0 && (
            <div className="ig-right-section">
              <div className="ig-right-title">추천 Guardian</div>
              {suggestedUsers.map((u) => (
                <div key={u} className="ig-right-user">
                  <div className="ig-right-user-avatar">{u[0].toUpperCase()}</div>
                  <div className="ig-right-user-info">
                    <div className="ig-right-user-name">{u.split('@')[0]}</div>
                    <div className="ig-right-user-sub">Petfolio 가디언</div>
                  </div>
                  <button className="ig-follow-btn" disabled={!loggedIn}>팔로우</button>
                </div>
              ))}
            </div>
          )}

          {/* Guardian ↔ Supplier 연결 요청 */}
          {loggedIn && (role === 'guardian' || role === 'provider') && (
            <div className="ig-right-section">
              <div className="ig-right-title">Guardian ↔ Supplier 연결</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input
                  className="form-input" style={{ fontSize: 12, padding: '6px 8px' }}
                  placeholder="상대 이메일"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendFriendRequest()}
                />
                <button className="btn btn-secondary btn-sm" onClick={sendFriendRequest}>요청</button>
              </div>
              {friendMessage && <p style={{ fontSize: 12, color: 'var(--primary)' }}>{friendMessage}</p>}
            </div>
          )}

          {/* Footer */}
          <div className="ig-right-footer">
            <span>© 2026 Petfolio</span> · <span>반려동물 포트폴리오 플랫폼</span>
            <br />
            <Link to="/admin/login">Admin</Link>
          </div>
        </aside>
      </div>

      {/* ── Mobile bottom tabbar ─────────────────────────── */}
      <nav className="ig-bottom-tabbar">
        <Link to="/"        className="ig-tabbar-item active">🏠</Link>
        <Link to="/explore" className="ig-tabbar-item">🔍</Link>
        <button className="ig-tabbar-item" disabled={!loggedIn} onClick={() => loggedIn && navigate('/guardian')}>✏️</button>
        <button className="ig-tabbar-item" disabled={!loggedIn}>🔔</button>
        <button className="ig-tabbar-item" disabled={!loggedIn} onClick={() => loggedIn && navigate('/guardian')}>👤</button>
      </nav>
    </div>
  );
}
