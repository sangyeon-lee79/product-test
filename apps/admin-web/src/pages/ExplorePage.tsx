import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type FeedPost } from '../lib/api';
import { isLoggedIn } from '../lib/auth';
import { useI18n, useT } from '../lib/i18n';
import { BCP47_LOCALE_MAP, type Lang } from '@petfolio/shared';

function ensureArray(raw: string[] | string | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') as string[] : [];
  } catch { return []; }
}

function formatDate(iso?: string | null, locale?: string): string {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleString(locale); } catch { return iso; }
}

const NAV_ITEMS = [
  { icon: '🏠', label: '홈',     to: '/'        },
  { icon: '🔍', label: '탐색',   to: '/explore', active: true },
  { icon: '🔔', label: '알림',   to: null       },
  { icon: '🐾', label: '내 펫',  to: '/guardian'},
  { icon: '📅', label: '예약',   to: null       },
  { icon: '👤', label: '프로필', to: null       },
];

export default function ExplorePage() {
  const { lang } = useI18n();
  const t = useT();
  const locale = BCP47_LOCALE_MAP[lang as Lang] || 'en-US';
  const [allFeeds, setAllFeeds] = useState<FeedPost[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<FeedPost | null>(null);
  const [isDark,   setIsDark]   = useState(() => localStorage.getItem('petfolio-theme') === 'dark');

  const loggedIn = isLoggedIn();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('petfolio-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    setLoading(true);
    api.feeds.list({ limit: 120 })
      .then((r) => setAllFeeds(r.feeds || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  /* Filter by search term */
  const filteredFeeds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allFeeds;
    return allFeeds.filter((f) =>
      (f.caption || '').toLowerCase().includes(q) ||
      (f.pet_name || '').toLowerCase().includes(q) ||
      (f.author_email || '').toLowerCase().includes(q) ||
      ensureArray(f.tags).some((t) => t.toLowerCase().includes(q))
    );
  }, [allFeeds, search]);

  /* Sidebar */
  const Sidebar = () => (
    <aside className="ig-sidebar">
      <div className="ig-sidebar-logo">Petfolio</div>
      <nav className="ig-nav">
        {NAV_ITEMS.map((item) => {
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={`ig-nav-item${item.active ? ' active' : ''}`}>
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
      </div>
    </aside>
  );

  /* Feed detail modal */
  const DetailModal = ({ feed }: { feed: FeedPost }) => {
    const media = ensureArray(feed.media_urls);
    const tags  = ensureArray(feed.tags);
    return (
      <div className="modal-overlay" onClick={() => setSelected(null)}>
        <div style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="ig-card-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="ig-avatar">{(feed.author_email || '?')[0].toUpperCase()}</div>
            <div className="ig-card-author">
              <div className="ig-card-username">{(feed.author_email || '-').split('@')[0]}</div>
              <div className="ig-card-meta">{formatDate(feed.created_at, locale)}</div>
            </div>
            <button className="ig-card-menu" onClick={() => setSelected(null)}>✕</button>
          </div>

          {/* Image */}
          {media[0] && (
            <div className="ig-card-image">
              <img src={media[0]} alt={feed.caption || 'post'} />
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '12px 14px' }}>
            {feed.pet_name && <span className="ig-pet-badge" style={{ marginBottom: 8, display: 'inline-block' }}>{feed.pet_name}</span>}
            {feed.caption && <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 8 }}>{feed.caption}</p>}
            {tags.length > 0 && (
              <div className="ig-card-tags" style={{ padding: 0, marginBottom: 8 }}>
                {tags.map((t) => <span key={t}>#{t}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>♥ {feed.like_count || 0}</span>
              <span>💬 {feed.comment_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ig-layout">
      <Sidebar />

      <div className="explore-main" style={{ flex: 1 }}>
        {/* Search bar */}
        <div className="explore-search-bar">
          <span className="explore-search-icon">🔍</span>
          <input
            placeholder={t('explore.search_placeholder', '캡션, 펫 이름, 태그로 검색…')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats row */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {filteredFeeds.length} {t('explore.post_count', '개의 게시물')}
        </div>

        {/* Explore grid */}
        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : (
          <div className="explore-grid">
            {filteredFeeds.map((feed) => {
              const media = ensureArray(feed.media_urls);
              return (
                <div key={feed.id} className="explore-tile" onClick={() => setSelected(feed)}>
                  {media[0] ? (
                    <>
                      <img src={media[0]} alt={feed.caption || 'post'} loading="lazy" />
                      <div className="explore-tile-overlay">
                        <span className="explore-tile-stat">♥ {feed.like_count || 0}</span>
                        <span className="explore-tile-stat">💬 {feed.comment_count || 0}</span>
                      </div>
                    </>
                  ) : (
                    <div className="explore-tile-no-img">
                      {feed.caption ? feed.caption.slice(0, 60) : feed.feed_type}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredFeeds.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600 }}>{t('explore.no_results', '검색 결과가 없습니다')}</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <DetailModal feed={selected} />}

      {/* Mobile bottom tabbar */}
      <nav className="ig-bottom-tabbar">
        <Link to="/" className="ig-tabbar-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="ig-tabbar-label">{t('public.nav.home', 'Home')}</span>
        </Link>
        <Link to="/explore" className="ig-tabbar-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span className="ig-tabbar-label">{t('public.nav.explore', 'Explore')}</span>
        </Link>
        <button className="ig-tabbar-item" disabled={!loggedIn} onClick={() => loggedIn && navigate('/guardian')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19c-4.3 0-7.5-3.4-7.5-5s3.2-5 7.5-5 7.5 3.4 7.5 5-3.2 5-7.5 5z"/><circle cx="12" cy="14" r="1.5"/><path d="M10 2c0 .5.5 1 1 1h2c.5 0 1-.5 1-1"/></svg>
          <span className="ig-tabbar-label">{t('public.nav.mypet', 'My Pet')}</span>
        </button>
        <button className="ig-tabbar-item" disabled={!loggedIn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="ig-tabbar-label">{t('public.nav.alerts', 'Alerts')}</span>
        </button>
        <button className="ig-tabbar-item" disabled={!loggedIn} onClick={() => loggedIn && navigate('/guardian')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="ig-tabbar-label">{t('public.nav.profile', 'Profile')}</span>
        </button>
      </nav>
    </div>
  );
}
