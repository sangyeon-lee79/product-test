import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type FeedPost } from '../lib/api';
import { isLoggedIn } from '../lib/auth';
import { useI18n } from '../lib/i18n';
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
            placeholder="캡션, 펫 이름, 태그로 검색…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats row */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {filteredFeeds.length}개의 게시물
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
            <p style={{ fontWeight: 600 }}>검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <DetailModal feed={selected} />}

      {/* Mobile bottom tabbar */}
      <nav className="ig-bottom-tabbar">
        <Link to="/"        className="ig-tabbar-item">🏠</Link>
        <Link to="/explore" className="ig-tabbar-item active">🔍</Link>
        <button className="ig-tabbar-item" disabled={!loggedIn} onClick={() => loggedIn && navigate('/guardian')}>✏️</button>
        <button className="ig-tabbar-item" disabled={!loggedIn}>🔔</button>
        <button className="ig-tabbar-item" disabled={!loggedIn} onClick={() => loggedIn && navigate('/guardian')}>👤</button>
      </nav>
    </div>
  );
}
