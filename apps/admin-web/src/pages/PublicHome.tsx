import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type FeedComment, type FeedPost, type GuardianProfile, type Pet, type Booking } from '../lib/api';
import { getStoredRole, isLoggedIn } from '../lib/auth';
import { useI18n, useT } from '../lib/i18n';
import AuthModal from '../components/AuthModal';

type FeedTab = 'all' | 'friends';
type FilterOption = { id: string; code: string; i18n_key: string; label: string };

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

function relativeTime(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function uiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return fallback;
    return msg;
  }
  return fallback;
}

const IMG_PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23E8E6E1"><rect width="400" height="400"/><text x="200" y="210" text-anchor="middle" fill="%236B6B6B" font-size="48">🐾</text></svg>');

/* ── Component ────────────────────────────────────────────── */
export default function PublicHome() {
  const t = useT();
  const { lang } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [tab, setTab] = useState<FeedTab>('all');
  const [businessCategoryId, setBusinessCategoryId] = useState('');
  const [petTypeId, setPetTypeId] = useState('');
  const [businessOptions, setBusinessOptions] = useState<FilterOption[]>([]);
  const [petTypeOptions, setPetTypeOptions] = useState<FilterOption[]>([]);
  const [commentMap, setCommentMap] = useState<Record<string, FeedComment[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [friendMessage, setFriendMessage] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('petfolio-theme') === 'dark');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [myProfile, setMyProfile] = useState<GuardianProfile | null>(null);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [rightLoading, setRightLoading] = useState(false);
  const [friendStatusMap, setFriendStatusMap] = useState<Map<string, 'none' | 'pending' | 'accepted'>>(new Map());
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());
  const [friendDataLoaded, setFriendDataLoaded] = useState(false);

  const openAuthModal = (mode: 'login' | 'signup') => { setAuthModalMode(mode); setAuthModalOpen(true); };
  const handleImgError = useCallback((key: string) => { setBrokenImages(prev => { const n = new Set(prev); n.add(key); return n; }); }, []);

  const loggedIn = isLoggedIn();
  const role = getStoredRole();
  const myUserId = useMemo(() => parseJwtSub(), []);
  const navigate = useNavigate();

  const NAV_ITEMS = useMemo(() => ([
    { icon: '🏠', label: t('public.nav.home', '홈'), to: '/' },
    { icon: '🔍', label: t('public.nav.explore', '탐색'), to: '/explore' },
    { icon: '🔔', label: t('public.nav.alerts', '알림'), to: null },
    { icon: '🐾', label: t('public.nav.mypet', '내 펫'), to: '/guardian' },
    { icon: '📅', label: t('public.nav.booking', '예약'), to: null },
    { icon: '👤', label: t('public.nav.profile', '프로필'), to: null },
  ]), [t]);

  const translateMasterLabel = (key?: string | null, fallback?: string | null, finalFallback?: string | null) => {
    const safeFallback = fallback || finalFallback || '-';
    if (!key) return safeFallback;
    const direct = t(key, '__MISSING__');
    if (direct !== '__MISSING__') return direct;
    return t(`master.${key}`, safeFallback);
  };

  /* Dark mode */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('petfolio-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  /* Derived: story bar authors */
  const storyAuthors = useMemo(() => {
    const seen = new Set<string>();
    const out: { email: string; hasNew: boolean }[] = [];
    for (const f of feeds) {
      const a = f.author_email;
      if (a && !seen.has(a)) {
        seen.add(a);
        const hoursAgo = (Date.now() - new Date(f.created_at).getTime()) / 3600000;
        out.push({ email: a, hasNew: hoursAgo < 24 });
      }
    }
    return out.slice(0, 14);
  }, [feeds]);

  const suggestedUsers = useMemo(() => storyAuthors.slice(0, 5), [storyAuthors]);

  /* ── API calls ─────────────────────────────────────────── */
  async function loadFeed(nextTab = tab, nextBusiness = businessCategoryId, nextPetType = petTypeId) {
    setLoading(true); setError('');
    try {
      const listRes = await api.feeds.list({ tab: nextTab, business_category_id: nextBusiness || undefined, pet_type_id: nextPetType || undefined, limit: 40 });
      setFeeds(listRes.feeds || []);
    } catch (e) { setError(uiErrorMessage(e, t('public.error.feed_load', '피드 데이터를 불러오지 못했습니다.'))); }
    finally { setLoading(false); }
  }

  async function loadFilters() {
    try {
      const res = await api.feeds.filters(lang);
      setBusinessOptions(res.business_categories || []);
      setPetTypeOptions(res.pet_types || []);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadFeed(); loadFilters(); }, []);
  useEffect(() => { void loadFeed(tab, businessCategoryId, petTypeId); loadFilters(); }, [lang]);

  useEffect(() => {
    if (!loggedIn) { setMyProfile(null); setMyPets([]); setMyBookings([]); setFriendStatusMap(new Map()); setFriendDataLoaded(false); return; }
    setRightLoading(true);
    Promise.allSettled([
      api.guardians.me(),
      api.pets.list(),
      api.bookings.list(),
      api.friends.list(),
      api.friends.requests.list('outbox'),
    ]).then(([profRes, petsRes, bookRes, friendsRes, outboxRes]) => {
      if (profRes.status === 'fulfilled') setMyProfile(profRes.value.profile ?? null);
      if (petsRes.status === 'fulfilled') setMyPets(petsRes.value.pets || []);
      if (bookRes.status === 'fulfilled') setMyBookings(bookRes.value.bookings || []);
      /* Build friend status map */
      const map = new Map<string, 'none' | 'pending' | 'accepted'>();
      if (friendsRes.status === 'fulfilled') {
        for (const f of (friendsRes.value.friends || [])) {
          if (f.status === 'accepted') map.set(f.friend_user_id, 'accepted');
        }
      }
      if (outboxRes.status === 'fulfilled') {
        for (const r of (outboxRes.value.requests || [])) {
          if (r.status === 'pending' && !map.has(r.receiver_user_id)) {
            map.set(r.receiver_user_id, 'pending');
          }
        }
      }
      setFriendStatusMap(map);
      setFriendDataLoaded(true);
    }).finally(() => setRightLoading(false));
  }, [loggedIn]);

  async function toggleLike(feed: FeedPost) {
    if (!loggedIn) return;
    try {
      Number(feed.liked_by_me || 0) > 0 ? await api.feeds.unlike(feed.id) : await api.feeds.like(feed.id);
      await loadFeed();
    } catch (e) { setError(uiErrorMessage(e, t('public.error.like', '좋아요 처리에 실패했습니다.'))); }
  }

  async function toggleComments(feedId: string) {
    const next = !openComments[feedId];
    setOpenComments((p) => ({ ...p, [feedId]: next }));
    if (!next || commentMap[feedId]) return;
    try {
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((p) => ({ ...p, [feedId]: res.comments || [] }));
    } catch (e) { setError(uiErrorMessage(e, t('public.error.comment_load', '댓글을 불러오지 못했습니다.'))); }
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
    } catch (e) { setError(uiErrorMessage(e, t('public.error.comment_create', '댓글 등록에 실패했습니다.'))); }
  }

  async function saveEditedComment(feedId: string, commentId: string) {
    const content = editingContent.trim();
    if (!content) return;
    try {
      await api.feeds.comments.update(feedId, commentId, content);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((p) => ({ ...p, [feedId]: res.comments || [] }));
      setEditingCommentId(null); setEditingContent('');
    } catch (e) { setError(uiErrorMessage(e, t('public.error.comment_update', '댓글 수정에 실패했습니다.'))); }
  }

  async function deleteComment(feedId: string, commentId: string) {
    try {
      await api.feeds.comments.remove(feedId, commentId);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((p) => ({ ...p, [feedId]: res.comments || [] }));
      await loadFeed();
    } catch (e) { setError(uiErrorMessage(e, t('public.error.comment_delete', '댓글 삭제에 실패했습니다.'))); }
  }

  async function sendFriendRequest() {
    if (!loggedIn) return;
    const email = friendEmail.trim().toLowerCase();
    if (!email) return;
    setFriendMessage('');
    try {
      const res = await api.friends.requests.create({ receiver_email: email });
      if (res.status === 'already_friends') setFriendMessage(t('public.friend.already', '이미 연결된 사용자입니다.'));
      else if (res.status === 'request_sent') setFriendMessage(t('public.friend.sent', '연결 요청을 보냈습니다.'));
      else setFriendMessage(t('public.friend.done', '요청 처리 완료'));
      setFriendEmail('');
    } catch (e) { setFriendMessage(uiErrorMessage(e, t('public.friend.error', '요청 처리에 실패했습니다.'))); }
  }

  function toggleSave(feedId: string) {
    setSavedPosts(prev => {
      const n = new Set(prev);
      n.has(feedId) ? n.delete(feedId) : n.add(feedId);
      return n;
    });
  }

  async function sendFriendRequestFromCard(authorUserId: string) {
    if (!loggedIn || requestingIds.has(authorUserId)) return;
    setRequestingIds(prev => { const n = new Set(prev); n.add(authorUserId); return n; });
    try {
      await api.friends.requests.create({ receiver_user_id: authorUserId });
      setFriendStatusMap(prev => { const n = new Map(prev); n.set(authorUserId, 'pending'); return n; });
    } catch { /* ignore */ }
    finally { setRequestingIds(prev => { const n = new Set(prev); n.delete(authorUserId); return n; }); }
  }

  function renderFriendButton(feed: FeedPost) {
    if (!loggedIn || !friendDataLoaded || feed.author_user_id === myUserId) return null;
    const status = friendStatusMap.get(feed.author_user_id) || 'none';
    if (status === 'accepted') return <span className="pf-friend-btn pf-friend-btn--accepted">{t('friend.btn.accepted', '친구')}</span>;
    if (status === 'pending') return <span className="pf-friend-btn pf-friend-btn--pending">{t('friend.btn.pending', '신청 중')}</span>;
    const isProvider = feed.author_role === 'provider';
    const requesting = requestingIds.has(feed.author_user_id);
    return (
      <button className="pf-friend-btn pf-friend-btn--add" disabled={requesting} onClick={() => sendFriendRequestFromCard(feed.author_user_id)}>
        {requesting ? '…' : isProvider ? t('friend.btn.add_provider', '단골 맺기') : t('friend.btn.add_guardian', '친구 신청')}
      </button>
    );
  }

  /* ── Card type detection ───────────────────────────────── */
  function getCardType(feed: FeedPost): 'photo' | 'health' | 'text' {
    if (feed.feed_type === 'health_update') return 'health';
    const media = ensureArray(feed.media_urls);
    return media.length > 0 ? 'photo' : 'text';
  }

  /* ── Sidebar ───────────────────────────────────────────── */
  const Sidebar = () => (
    <aside className="pf-sidebar">
      <div className="pf-sidebar-logo">{t('platform.name', 'Petfolio')}</div>

      {!loggedIn && (
        <div className="pf-hero-mini">
          <h3>{t('public.hero.title', '반려동물의 삶을')}<br />{t('public.hero.title_2', '아름답게 기록하다')}</h3>
          <p>{t('public.hero.sub', 'SNS + 포트폴리오 아카이브')}</p>
          <button className="pf-btn-start" onClick={() => openAuthModal('signup')}>{t('public.cta.start', '시작하기')}</button>
        </div>
      )}

      <nav className="pf-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.to === '/';
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={`pf-nav-item${isActive ? ' active' : ''}`}>
                <span className="pf-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          }
          const handleNavClick = () => {
            if (!loggedIn) { openAuthModal('login'); return; }
            if (item.label === t('public.nav.profile', '프로필') || item.label === t('public.nav.mypet', '내 펫')) navigate('/guardian');
          };
          return (
            <button key={item.label} className="pf-nav-item" onClick={handleNavClick} style={{ opacity: !loggedIn ? .65 : 1 }}>
              <span className="pf-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pf-sidebar-footer">
        <button className="pf-nav-item" onClick={() => setIsDark(d => !d)}>
          <span className="pf-nav-icon">{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? t('public.theme.light', '라이트 모드') : t('public.theme.dark', '다크 모드')}</span>
        </button>
        {!loggedIn && (
          <button className="pf-nav-item" onClick={() => openAuthModal('login')}>
            <span className="pf-nav-icon">🔑</span>
            <span>{t('public.auth.login', '로그인')}</span>
          </button>
        )}
        <Link to="/admin/login" className="pf-nav-item" style={{ opacity: .45 }}>
          <span className="pf-nav-icon">⚙️</span>
          <span>{t('public.admin', 'Admin')}</span>
        </Link>
      </div>
    </aside>
  );

  /* ── Photo card ────────────────────────────────────────── */
  const renderPhotoCard = (feed: FeedPost, idx: number) => {
    const media = ensureArray(feed.media_urls);
    const tags = ensureArray(feed.tags);
    const comments = commentMap[feed.id] || [];
    const isLiked = Number(feed.liked_by_me || 0) > 0;
    const authorLine = feed.feed_type === 'booking_completed'
      ? `${feed.booking_guardian_email || '-'} + ${feed.booking_supplier_email || '-'}`
      : (feed.author_email || '-');
    const avatarLetter = authorLine[0]?.toUpperCase() || '?';
    const canDelete = !!(myUserId && feed.author_user_id === myUserId);
    const isSaved = savedPosts.has(feed.id);
    const imgKey = `${feed.id}-0`;
    const imgSrc = brokenImages.has(imgKey) ? IMG_PLACEHOLDER : media[0];

    return (
      <article key={feed.id} className="pf-card pf-card--photo" style={{ animationDelay: `${idx * 60}ms` }}>
        {media.length > 0 && (
          <div className="pf-card-image">
            <img src={imgSrc} alt={feed.caption || t('public.post', '게시')} loading="lazy" onError={() => handleImgError(imgKey)} />
            {media.length > 1 && <span className="pf-card-image-count">+{media.length - 1}</span>}
          </div>
        )}
        <div className="pf-card-body">
          <div className="pf-card-header">
            <div className="pf-avatar">{avatarLetter}</div>
            <div className="pf-card-author">
              <span className="pf-card-username">{authorLine.split('@')[0] || authorLine}</span>
              <span className="pf-card-time">{relativeTime(feed.created_at)}</span>
            </div>
            {renderFriendButton(feed)}
            {canDelete && (
              <button className="pf-card-menu" onClick={() => api.feeds.remove(feed.id).then(() => loadFeed()).catch(() => null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            )}
          </div>
          {(feed.pet_name || feed.business_category_key) && (
            <div className="pf-card-badges">
              {feed.pet_name && <span className="pf-badge pf-badge--pet">{feed.pet_name}</span>}
              {feed.business_category_key && <span className="pf-badge pf-badge--biz">{translateMasterLabel(feed.business_category_key, feed.business_category_ko, feed.business_category_id)}</span>}
            </div>
          )}
          {feed.caption && <p className="pf-card-caption">{feed.caption}</p>}
          {tags.length > 0 && <div className="pf-card-tags">{tags.map((tg) => <span key={tg}>#{tg}</span>)}</div>}
          <div className="pf-card-actions">
            <button className={`pf-action${isLiked ? ' liked' : ''}`} onClick={() => toggleLike(feed)} disabled={!loggedIn}>
              {isLiked ? '❤️' : '🤍'} <span>{feed.like_count || ''}</span>
            </button>
            <button className="pf-action" onClick={() => toggleComments(feed.id)}>💬 <span>{feed.comment_count || ''}</span></button>
            <button className={`pf-action${isSaved ? ' saved' : ''}`} onClick={() => toggleSave(feed.id)}>{isSaved ? '🔖' : '📑'}</button>
            <div className="pf-spacer" />
            <button className="pf-action pf-action--share">↗️</button>
          </div>
          {openComments[feed.id] && renderComments(feed, comments)}
        </div>
      </article>
    );
  };

  /* ── Health card ────────────────────────────────────────── */
  const renderHealthCard = (feed: FeedPost, idx: number) => {
    const authorLine = feed.author_email || '-';
    const isLiked = Number(feed.liked_by_me || 0) > 0;
    const isSaved = savedPosts.has(feed.id);
    const comments = commentMap[feed.id] || [];
    const meta = (() => { try { return feed.caption ? JSON.parse(feed.caption) : {}; } catch { return {}; } })() as Record<string, unknown>;

    return (
      <article key={feed.id} className="pf-card pf-card--health" style={{ animationDelay: `${idx * 60}ms` }}>
        <div className="pf-card-body">
          <div className="pf-card-header">
            <div className="pf-avatar">{authorLine[0]?.toUpperCase() || '?'}</div>
            <div className="pf-card-author">
              <span className="pf-card-username">{authorLine.split('@')[0]}</span>
              <span className="pf-card-time">{relativeTime(feed.created_at)}</span>
            </div>
            {renderFriendButton(feed)}
          </div>
          {feed.pet_name && <span className="pf-health-pet">{feed.pet_name}</span>}
          <div className="pf-health-grid">
            <div className="pf-health-stat">
              <span className="pf-health-stat-icon">⚖️</span>
              <span className="pf-health-stat-value">{meta.weight ? `${meta.weight}` : '--'}</span>
              <span className="pf-health-stat-label">{t('public.health.weight', '체중')} kg</span>
            </div>
            <div className="pf-health-stat">
              <span className="pf-health-stat-icon">🔥</span>
              <span className="pf-health-stat-value">{meta.calories ? `${meta.calories}` : '--'}</span>
              <span className="pf-health-stat-label">{t('public.health.calories', '칼로리')} kcal</span>
            </div>
            <div className="pf-health-stat">
              <span className="pf-health-stat-icon">🏃</span>
              <span className="pf-health-stat-value">{meta.exercise ? `${meta.exercise}` : '--'}</span>
              <span className="pf-health-stat-label">{t('public.health.exercise', '운동')} min</span>
            </div>
            <div className="pf-health-stat">
              <span className="pf-health-stat-icon">👣</span>
              <span className="pf-health-stat-value">{meta.steps ? `${meta.steps}` : '--'}</span>
              <span className="pf-health-stat-label">{t('public.health.steps', '걸음수')}</span>
            </div>
          </div>
          <div className="pf-health-progress">
            <div className="pf-health-progress-label">
              <span>{t('public.health.goal', '오늘 목표')}</span><span>72%</span>
            </div>
            <div className="pf-health-progress-bar"><div className="pf-health-progress-fill" style={{ width: '72%' }} /></div>
          </div>
          <div className="pf-card-actions">
            <button className={`pf-action${isLiked ? ' liked' : ''}`} onClick={() => toggleLike(feed)} disabled={!loggedIn}>{isLiked ? '❤️' : '🤍'} <span>{feed.like_count || ''}</span></button>
            <button className="pf-action" onClick={() => toggleComments(feed.id)}>💬 <span>{feed.comment_count || ''}</span></button>
            <button className={`pf-action${isSaved ? ' saved' : ''}`} onClick={() => toggleSave(feed.id)}>{isSaved ? '🔖' : '📑'}</button>
            <div className="pf-spacer" />
            <button className="pf-action pf-action--share">↗️</button>
          </div>
          {openComments[feed.id] && renderComments(feed, comments)}
        </div>
      </article>
    );
  };

  /* ── Text card ─────────────────────────────────────────── */
  const renderTextCard = (feed: FeedPost, idx: number) => {
    const tags = ensureArray(feed.tags);
    const authorLine = feed.author_email || '-';
    const isLiked = Number(feed.liked_by_me || 0) > 0;
    const isSaved = savedPosts.has(feed.id);
    const comments = commentMap[feed.id] || [];

    return (
      <article key={feed.id} className="pf-card pf-card--text" style={{ animationDelay: `${idx * 60}ms` }}>
        <div className="pf-card-body">
          {feed.caption && <blockquote className="pf-text-quote">{feed.caption}</blockquote>}
          {tags.length > 0 && <div className="pf-card-tags">{tags.map((tg) => <span key={tg}>#{tg}</span>)}</div>}
          <div className="pf-card-header" style={{ marginTop: 8 }}>
            <div className="pf-avatar pf-avatar--sm">{authorLine[0]?.toUpperCase() || '?'}</div>
            <div className="pf-card-author">
              <span className="pf-card-username">{authorLine.split('@')[0]}</span>
              {feed.pet_name && <span className="pf-badge pf-badge--pet" style={{ marginLeft: 6 }}>{feed.pet_name}</span>}
            </div>
            {renderFriendButton(feed)}
            <span className="pf-card-time">{relativeTime(feed.created_at)}</span>
          </div>
          <div className="pf-card-actions">
            <button className={`pf-action${isLiked ? ' liked' : ''}`} onClick={() => toggleLike(feed)} disabled={!loggedIn}>{isLiked ? '❤️' : '🤍'} <span>{feed.like_count || ''}</span></button>
            <button className="pf-action" onClick={() => toggleComments(feed.id)}>💬 <span>{feed.comment_count || ''}</span></button>
            <button className={`pf-action${isSaved ? ' saved' : ''}`} onClick={() => toggleSave(feed.id)}>{isSaved ? '🔖' : '📑'}</button>
            <div className="pf-spacer" />
            <button className="pf-action pf-action--share">↗️</button>
          </div>
          {openComments[feed.id] && renderComments(feed, comments)}
        </div>
      </article>
    );
  };

  /* ── Comments ──────────────────────────────────────────── */
  const renderComments = (feed: FeedPost, comments: FeedComment[]) => (
    <div className="pf-comments">
      {comments.length > 0 && (
        <div className="pf-comment-list">
          {comments.map((c) => {
            const mine = !!(myUserId && c.author_user_id === myUserId);
            const isEditing = editingCommentId === c.id;
            return (
              <div key={c.id} className="pf-comment">
                {isEditing ? (
                  <div className="pf-comment-edit">
                    <input className="pf-comment-input" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                    <button className="pf-comment-btn" onClick={() => saveEditedComment(feed.id, c.id)}>{t('common.save', '저장')}</button>
                    <button className="pf-comment-btn" style={{ color: 'var(--mid)' }} onClick={() => { setEditingCommentId(null); setEditingContent(''); }}>{t('common.cancel', '취소')}</button>
                  </div>
                ) : (
                  <>
                    <span className="pf-comment-user">{c.author_email?.split('@')[0] || c.author_user_id}</span>
                    <span className="pf-comment-text">{c.content}</span>
                    <span className="pf-comment-time">{relativeTime(c.created_at)}</span>
                    {mine && (
                      <span className="pf-comment-mine">
                        <button onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }}>✏️</button>
                        <button onClick={() => deleteComment(feed.id, c.id)}>🗑️</button>
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="pf-comment-form">
        <input className="pf-comment-input" placeholder={loggedIn ? t('public.comment.write', '댓글 달기…') : t('public.comment.login_hint', '로그인 후 댓글 작성 가능')}
          value={commentInput[feed.id] || ''} onChange={(e) => setCommentInput((p) => ({ ...p, [feed.id]: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && createComment(feed.id)} disabled={!loggedIn} />
        <button className="pf-comment-btn pf-comment-btn--post" onClick={() => createComment(feed.id)} disabled={!loggedIn}>{t('public.post', '게시')}</button>
      </div>
    </div>
  );

  /* ── Feed card dispatcher ──────────────────────────────── */
  const renderFeedCard = (feed: FeedPost, idx: number) => {
    const type = getCardType(feed);
    switch (type) {
      case 'health': return renderHealthCard(feed, idx);
      case 'text': return renderTextCard(feed, idx);
      default: return renderPhotoCard(feed, idx);
    }
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="pf-layout">
      <Sidebar />

      <div className="pf-main">
        <div className="pf-feed-col">

          {/* Mobile header */}
          <div className="pf-mobile-lang">
            <span className="pf-mobile-logo">{t('platform.name', 'Petfolio')}</span>
          </div>

          {/* Story bar */}
          <div className="pf-story-bar">
            <div className="pf-story-item pf-story-add" onClick={() => loggedIn ? null : openAuthModal('login')}>
              <div className="pf-story-ring pf-story-ring--add"><div className="pf-story-avatar-inner">＋</div></div>
              <span className="pf-story-name">{t('public.story.add', '추가')}</span>
            </div>
            {storyAuthors.map(({ email, hasNew }) => (
              <div key={email} className="pf-story-item">
                <div className={`pf-story-ring${hasNew ? '' : ' seen'}`}><div className="pf-story-avatar-inner">{email[0].toUpperCase()}</div></div>
                <span className="pf-story-name">{email.split('@')[0]}</span>
              </div>
            ))}
          </div>

          {/* Feed tabs */}
          <div className="pf-feed-tabs">
            <button className={`pf-feed-tab${tab === 'all' ? ' active' : ''}`} onClick={() => { setTab('all'); loadFeed('all', businessCategoryId, petTypeId); }}>
              {loggedIn ? t('public.feed.my_feed', '내 피드') : t('public.feed.all', '전체 피드')}
            </button>
            {loggedIn && (
              <button className={`pf-feed-tab${tab === 'friends' ? ' active' : ''}`} onClick={() => { setTab('friends'); loadFeed('friends', businessCategoryId, petTypeId); }}>
                {t('friend.section.title', '친구')}
              </button>
            )}
          </div>

          {/* Filter pills */}
          {(businessOptions.length > 0 || petTypeOptions.length > 0) && (
            <div className="pf-filter-row">
              {businessOptions.length > 0 && (
                <div className="pf-filter-group">
                  <span className="pf-filter-label">{t('public.filter.business', '업종')}</span>
                  <button className={`pf-pill${businessCategoryId === '' ? ' active' : ''}`} onClick={() => { setBusinessCategoryId(''); loadFeed(tab, '', petTypeId); }}>{t('public.filter.all', '전체')}</button>
                  {businessOptions.map((o) => (
                    <button key={o.id} className={`pf-pill${businessCategoryId === o.id ? ' active' : ''}`}
                      onClick={() => { const v = businessCategoryId === o.id ? '' : o.id; setBusinessCategoryId(v); loadFeed(tab, v, petTypeId); }}>
                      {translateMasterLabel(o.i18n_key, o.label, o.code)}
                    </button>
                  ))}
                </div>
              )}
              {petTypeOptions.length > 0 && (
                <div className="pf-filter-group">
                  <span className="pf-filter-label">{t('public.filter.pet_type', '펫 유형')}</span>
                  <button className={`pf-pill${petTypeId === '' ? ' active' : ''}`} onClick={() => { setPetTypeId(''); loadFeed(tab, businessCategoryId, ''); }}>{t('public.filter.all', '전체')}</button>
                  {petTypeOptions.map((o) => (
                    <button key={o.id} className={`pf-pill${petTypeId === o.id ? ' active' : ''}`}
                      onClick={() => { const v = petTypeId === o.id ? '' : o.id; setPetTypeId(v); loadFeed(tab, businessCategoryId, v); }}>
                      {translateMasterLabel(o.i18n_key, o.label, o.code)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <div className="alert alert-error" style={{ margin: '0 0 16px' }}>{error}</div>}

          {/* Masonry Feed */}
          {loading ? (
            <div className="loading-center"><span className="spinner" /></div>
          ) : feeds.length === 0 ? (
            <div className="pf-card" style={{ padding: 48, textAlign: 'center', color: 'var(--mid)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontStyle: 'italic', marginBottom: 6 }}>{t('public.feed.empty_title', '아직 피드가 없습니다')}</p>
              <p style={{ fontSize: 13 }}>{t('public.feed.empty_desc', '첫 번째 이야기를 올려보세요.')}</p>
            </div>
          ) : (
            <div className="pf-masonry">{feeds.map((f, i) => renderFeedCard(f, i))}</div>
          )}
        </div>

        {/* Right panel */}
        <aside className="pf-right-col">
          <div className="pf-pet-widget">
            {rightLoading ? (
              /* Skeleton placeholder */
              <>
                <div className="pf-pet-widget-header">
                  <div className="pf-skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                  <div className="pf-pet-widget-info">
                    <div className="pf-skeleton" style={{ width: 120, height: 16, marginBottom: 6 }} />
                    <div className="pf-skeleton" style={{ width: 80, height: 12 }} />
                  </div>
                </div>
                <div className="pf-skeleton" style={{ width: '100%', height: 40, marginTop: 12 }} />
                <div className="pf-skeleton" style={{ width: '100%', height: 32, marginTop: 8 }} />
              </>
            ) : loggedIn && myProfile ? (
              /* Logged-in: real profile data */
              <>
                <div className="pf-pet-widget-header">
                  {myProfile.avatar_url ? (
                    <img src={myProfile.avatar_url} alt="" className="pf-pet-widget-avatar-img" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div className="pf-pet-widget-avatar">{(myProfile.display_name || myProfile.email || '?')[0].toUpperCase()}</div>
                  )}
                  <div className="pf-pet-widget-info">
                    <span className="pf-pet-widget-name">{myProfile.display_name || myProfile.email?.split('@')[0] || '-'}</span>
                    <span className="pf-pet-widget-breed">{role === 'guardian' ? t('public.widget.guardian_role', 'Petfolio Guardian') : t('public.widget.provider_role', 'Petfolio Provider')}</span>
                  </div>
                </div>
                {/* Pet widget */}
                <div className="pf-pet-widget-stats">
                  <div className="pf-pet-widget-stat">
                    <span className="pf-pet-widget-stat-label">{t('public.widget.my_pet', '내 반려동물')}</span>
                    <span className="pf-pet-widget-stat-value">{myPets.length > 0 ? myPets[0].name : '--'}</span>
                    {myPets.length > 0 && myPets[0].current_weight && (
                      <span className="pf-pet-widget-stat-label">{myPets[0].current_weight} kg</span>
                    )}
                    {myPets.length === 0 && (
                      <span className="pf-pet-widget-stat-label" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('public.widget.no_pet', '등록된 반려동물이 없습니다')}</span>
                    )}
                  </div>
                </div>
                {/* Next booking */}
                <div className="pf-pet-widget-schedule">
                  <span>📅</span>
                  <span className="pf-pet-widget-schedule-text">{t('public.widget.next_booking', '다음 예약')}</span>
                  <span className="pf-pet-widget-schedule-date">
                    {(() => {
                      const today = new Date().toISOString().slice(0, 10);
                      const upcoming = myBookings.find(b => b.requested_date && b.requested_date >= today && b.status !== 'cancelled');
                      return upcoming?.requested_date || t('public.widget.no_booking', '예정된 일정 없음');
                    })()}
                  </span>
                </div>
                <button className="pf-pet-add-btn" onClick={() => navigate('/guardian')}>＋ {t('public.widget.add_pet', '반려동물 추가')}</button>
              </>
            ) : (
              /* Not logged in */
              <>
                <div className="pf-pet-widget-header">
                  <div className="pf-pet-widget-avatar">🐕</div>
                  <div className="pf-pet-widget-info">
                    <span className="pf-pet-widget-name">{t('platform.name', 'Petfolio')}</span>
                    <span className="pf-pet-widget-breed">{t('public.hero.sub', 'SNS + 포트폴리오 아카이브')}</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>{t('public.widget.login_prompt', '로그인하고 반려동물을 등록하세요')}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="pf-btn-outline" onClick={() => openAuthModal('login')}>{t('public.auth.login', '로그인')}</button>
                  <button className="pf-btn-start" style={{ flex: 1 }} onClick={() => openAuthModal('signup')}>{t('public.cta.start', '시작하기')}</button>
                </div>
              </>
            )}
          </div>

          {suggestedUsers.length > 0 && (
            <div className="pf-right-section">
              <div className="pf-right-section-title">{t('public.recommend.guardian', '추천 Guardian')}</div>
              {suggestedUsers.map(({ email }) => (
                <div key={email} className="pf-suggest-user">
                  <div className="pf-suggest-avatar">{email[0].toUpperCase()}</div>
                  <div className="pf-suggest-info">
                    <span className="pf-suggest-name">{email.split('@')[0]}</span>
                    <span className="pf-suggest-sub">{t('public.recommend.guardian_sub', 'Petfolio 가디언')}</span>
                  </div>
                  <button className="pf-follow-btn" disabled={!loggedIn}>{t('public.follow', '팔로우')}</button>
                </div>
              ))}
            </div>
          )}

          {loggedIn && (
            <div className="pf-right-section">
              <div className="pf-right-section-title">{t('friend.section.title', '친구')}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="form-input" style={{ fontSize: 12, padding: '8px 10px' }} placeholder={t('public.friend.email', '상대 이메일')}
                  value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendFriendRequest()} />
                <button className="pf-btn-outline" onClick={sendFriendRequest}>{t('friend.btn.add_guardian', '친구 신청')}</button>
              </div>
              {friendMessage && <p style={{ fontSize: 12, color: 'var(--amber)', marginTop: 6 }}>{friendMessage}</p>}
            </div>
          )}

          <div className="pf-right-footer">
            <span>{t('public.copyright', '© 2026 Petfolio')}</span> · <span>{t('platform.tagline', "Your pet's life portfolio")}</span>
            <br /><Link to="/admin/login">{t('public.admin', 'Admin')}</Link>
          </div>
        </aside>
      </div>

      {/* Mobile bottom tabbar */}
      <nav className="pf-bottom-tabbar">
        <Link to="/" className="pf-tabbar-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="pf-tabbar-label">{t('public.nav.home', 'Home')}</span>
        </Link>
        <Link to="/explore" className="pf-tabbar-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span className="pf-tabbar-label">{t('public.nav.explore', 'Explore')}</span>
        </Link>
        <button className="pf-tabbar-item" onClick={() => loggedIn ? navigate('/guardian') : openAuthModal('login')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19c-4.3 0-7.5-3.4-7.5-5s3.2-5 7.5-5 7.5 3.4 7.5 5-3.2 5-7.5 5z"/><circle cx="12" cy="14" r="1.5"/><path d="M10 2c0 .5.5 1 1 1h2c.5 0 1-.5 1-1"/></svg>
          <span className="pf-tabbar-label">{t('public.nav.mypet', 'My Pet')}</span>
        </button>
        <button className="pf-tabbar-item" onClick={() => loggedIn ? navigate('/') : openAuthModal('login')}>
          {loggedIn
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          }
          <span className="pf-tabbar-label">{loggedIn ? t('public.nav.alerts', 'Alerts') : t('public.auth.login', 'Login')}</span>
        </button>
        <button className="pf-tabbar-item" onClick={() => loggedIn ? navigate('/guardian') : openAuthModal('login')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="pf-tabbar-label">{loggedIn ? t('public.nav.profile', 'Profile') : t('public.auth.login', 'Login')}</span>
        </button>
      </nav>

      <AuthModal open={authModalOpen} initialMode={authModalMode} onClose={() => setAuthModalOpen(false)} onSuccess={() => setAuthModalOpen(false)} />
    </div>
  );
}
