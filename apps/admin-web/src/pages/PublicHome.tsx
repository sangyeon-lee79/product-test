import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  } catch {
    return null;
  }
}

function ensureArray(raw: string[] | string | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') as string[] : [];
  } catch {
    return [];
  }
}

function formatDate(iso?: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function uiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    }
    return msg;
  }
  return fallback;
}

export default function PublicHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [tab, setTab] = useState<FeedTab>('all');
  const [businessCategoryId, setBusinessCategoryId] = useState('');
  const [petTypeId, setPetTypeId] = useState('');
  const [businessOptions, setBusinessOptions] = useState<Option[]>([]);
  const [petTypeOptions, setPetTypeOptions] = useState<Option[]>([]);
  const [commentMap, setCommentMap] = useState<Record<string, FeedComment[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [friendMessage, setFriendMessage] = useState('');

  const loggedIn = isLoggedIn();
  const role = getStoredRole();
  const myUserId = useMemo(() => parseJwtSub(), []);

  async function loadFeed(nextTab = tab, nextBusiness = businessCategoryId, nextPetType = petTypeId) {
    setLoading(true);
    setError('');
    try {
      const listRes = await api.feeds.list({
        tab: nextTab,
        business_category_id: nextBusiness || undefined,
        pet_type_id: nextPetType || undefined,
        limit: 40,
      });
      const optionRes = await api.feeds.list({ limit: 100 }).catch(() => ({ feeds: [] as FeedPost[] }));

      const base = listRes.feeds || [];
      const all = optionRes.feeds || [];
      setFeeds(base);

      const businessMap = new Map<string, string>();
      const petTypeMap = new Map<string, string>();

      for (const row of all) {
        if (row.business_category_id) {
          const label = row.business_category_ko || row.business_category_key || row.business_category_id;
          businessMap.set(row.business_category_id, label || row.business_category_id);
        }
        if (row.pet_type_id) {
          const label = row.pet_type_ko || row.pet_type_key || row.pet_type_id;
          petTypeMap.set(row.pet_type_id, label || row.pet_type_id);
        }
      }

      setBusinessOptions(Array.from(businessMap.entries()).map(([id, label]) => ({ id, label })));
      setPetTypeOptions(Array.from(petTypeMap.entries()).map(([id, label]) => ({ id, label })));
    } catch (e) {
      setError(uiErrorMessage(e, '피드 데이터를 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  async function toggleLike(feed: FeedPost) {
    if (!loggedIn) return;
    try {
      if (Number(feed.liked_by_me || 0) > 0) {
        await api.feeds.unlike(feed.id);
      } else {
        await api.feeds.like(feed.id);
      }
      await loadFeed();
    } catch (e) {
      setError(uiErrorMessage(e, '좋아요 처리에 실패했습니다.'));
    }
  }

  async function toggleComments(feedId: string) {
    const next = !openComments[feedId];
    setOpenComments((prev) => ({ ...prev, [feedId]: next }));
    if (!next || commentMap[feedId]) return;
    try {
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((prev) => ({ ...prev, [feedId]: res.comments || [] }));
    } catch (e) {
      setError(uiErrorMessage(e, '댓글을 불러오지 못했습니다.'));
    }
  }

  async function createComment(feedId: string) {
    if (!loggedIn) return;
    const content = (commentInput[feedId] || '').trim();
    if (!content) return;
    try {
      await api.feeds.comments.create(feedId, content);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((prev) => ({ ...prev, [feedId]: res.comments || [] }));
      setCommentInput((prev) => ({ ...prev, [feedId]: '' }));
      await loadFeed();
    } catch (e) {
      setError(uiErrorMessage(e, '댓글 등록에 실패했습니다.'));
    }
  }

  async function saveEditedComment(feedId: string, commentId: string) {
    const content = editingContent.trim();
    if (!content) return;
    try {
      await api.feeds.comments.update(feedId, commentId, content);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((prev) => ({ ...prev, [feedId]: res.comments || [] }));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (e) {
      setError(uiErrorMessage(e, '댓글 수정에 실패했습니다.'));
    }
  }

  async function deleteComment(feedId: string, commentId: string) {
    try {
      await api.feeds.comments.remove(feedId, commentId);
      const res = await api.feeds.comments.list(feedId);
      setCommentMap((prev) => ({ ...prev, [feedId]: res.comments || [] }));
      await loadFeed();
    } catch (e) {
      setError(uiErrorMessage(e, '댓글 삭제에 실패했습니다.'));
    }
  }

  async function sendFriendRequest() {
    if (!loggedIn) return;
    const email = friendEmail.trim().toLowerCase();
    if (!email) return;

    setFriendMessage('');
    try {
      const res = await api.friends.requests.create({ receiver_email: email });
      if (res.status === 'already_friends') {
        setFriendMessage('이미 연결된 사용자입니다.');
      } else if (res.status === 'request_sent') {
        setFriendMessage('친구 요청을 보냈습니다.');
      } else {
        setFriendMessage('요청 처리 완료');
      }
      setFriendEmail('');
    } catch (e) {
      setFriendMessage(uiErrorMessage(e, '친구 요청 처리에 실패했습니다.'));
    }
  }

  return (
    <div className="public-page">
      <header className="public-hero">
        <div>
          <p className="hero-eyebrow">Petfolio | 펫폴리오</p>
          <h1>Petfolio</h1>
          <p className="hero-desc">
            Your pet's life portfolio
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/signup" className="btn btn-secondary">Signup</Link>
            <Link to="/admin/login" className="btn btn-secondary">Admin Login</Link>
          </div>
        </div>
      </header>

      <section className="public-section">
        <div className="feed-toolbar card">
          <div className="feed-tabs">
            <button className={`feed-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => { setTab('all'); loadFeed('all', businessCategoryId, petTypeId); }}>
              All
            </button>
            <button
              className={`feed-tab ${tab === 'friends' ? 'active' : ''}`}
              onClick={() => { setTab('friends'); loadFeed('friends', businessCategoryId, petTypeId); }}
              disabled={!loggedIn}
              title={!loggedIn ? '로그인 후 사용 가능' : ''}
            >
              Friends Feed
            </button>
          </div>
          <div className="feed-filters">
            <select
              className="form-select"
              value={businessCategoryId}
              onChange={(e) => {
                const value = e.target.value;
                setBusinessCategoryId(value);
                loadFeed(tab, value, petTypeId);
              }}
            >
              <option value="">By Business Category</option>
              {businessOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={petTypeId}
              onChange={(e) => {
                const value = e.target.value;
                setPetTypeId(value);
                loadFeed(tab, businessCategoryId, value);
              }}
            >
              <option value="">By Pet Type</option>
              {petTypeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loggedIn && (role === 'guardian' || role === 'provider') && (
          <div className="friend-request card">
            <div className="card-body">
              <p className="text-sm text-muted">Guardian ↔ Supplier 연결</p>
              <div className="friend-row">
                <input
                  className="form-input"
                  placeholder="상대 이메일 입력"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={sendFriendRequest}>친구 요청</button>
              </div>
              {friendMessage && <p className="text-sm mt-2">{friendMessage}</p>}
            </div>
          </div>
        )}

        {error && <div className="alert alert-error mt-2">{error}</div>}

        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : (
          <div className="sns-feed-list">
            {feeds.map((feed) => {
              const media = ensureArray(feed.media_urls);
              const tags = ensureArray(feed.tags);
              const comments = commentMap[feed.id] || [];
              const displayBusiness = feed.business_category_ko || feed.business_category_key || '-';
              const displayPetType = feed.pet_type_ko || feed.pet_type_key || '-';
              const authorLine = feed.feed_type === 'booking_completed'
                ? `${feed.booking_guardian_email || '-'} + ${feed.booking_supplier_email || '-'}`
                : (feed.author_email || '-');

              return (
                <article key={feed.id} className="sns-card">
                  <div className="sns-card-header">
                    <div>
                      <p className="sns-meta">{feed.feed_type}</p>
                      <h3>{authorLine}</h3>
                      <p className="text-sm text-muted">{formatDate(feed.created_at)}</p>
                    </div>
                    <div className="sns-badges">
                      <span className="badge badge-blue">{displayBusiness}</span>
                      <span className="badge badge-gray">{displayPetType}</span>
                      <span className="badge badge-green">{feed.visibility_scope}</span>
                    </div>
                  </div>

                  {feed.pet_name && <p className="sns-pet">Pet: {feed.pet_name}</p>}
                  {feed.caption && <p className="sns-caption">{feed.caption}</p>}

                  {media.length > 0 && (
                    <div className="sns-media-grid">
                      {media.slice(0, 4).map((url, idx) => (
                        <a key={`${feed.id}_${idx}`} href={url} target="_blank" rel="noreferrer" className="sns-media-tile">
                          <img src={url} alt="feed media" />
                        </a>
                      ))}
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="sns-tags">
                      {tags.map((tag) => <span key={`${feed.id}_${tag}`}>#{tag}</span>)}
                    </div>
                  )}

                  <div className="sns-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleLike(feed)} disabled={!loggedIn}>
                      {Number(feed.liked_by_me || 0) > 0 ? 'Unlike' : 'Like'} ({feed.like_count || 0})
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleComments(feed.id)}>
                      Comment ({feed.comment_count || 0})
                    </button>
                  </div>

                  {openComments[feed.id] && (
                    <div className="sns-comments">
                      <div className="sns-comment-input-row">
                        <input
                          className="form-input"
                          value={commentInput[feed.id] || ''}
                          onChange={(e) => setCommentInput((prev) => ({ ...prev, [feed.id]: e.target.value }))}
                          placeholder={loggedIn ? '댓글을 입력하세요' : '로그인 후 댓글 작성 가능'}
                          disabled={!loggedIn}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => createComment(feed.id)} disabled={!loggedIn}>등록</button>
                      </div>

                      <div className="sns-comment-list">
                        {comments.map((comment) => {
                          const mine = myUserId && comment.author_user_id === myUserId;
                          const isEditing = editingCommentId === comment.id;
                          return (
                            <div key={comment.id} className="sns-comment-item">
                              <p className="text-sm"><strong>{comment.author_email || comment.author_user_id}</strong> · {formatDate(comment.created_at)}</p>
                              {isEditing ? (
                                <div className="sns-comment-input-row mt-1">
                                  <input
                                    className="form-input"
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                  />
                                  <button className="btn btn-primary btn-sm" onClick={() => saveEditedComment(feed.id, comment.id)}>저장</button>
                                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCommentId(null); setEditingContent(''); }}>취소</button>
                                </div>
                              ) : (
                                <p>{comment.content}</p>
                              )}
                              {mine && !isEditing && (
                                <div className="td-actions mt-1">
                                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); }}>수정</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => deleteComment(feed.id, comment.id)}>삭제</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
            {feeds.length === 0 && <div className="card"><div className="card-body">노출 가능한 피드가 없습니다.</div></div>}
          </div>
        )}
      </section>

      <section className="public-section">
        <h2>Entry Points</h2>
        <div className="entry-grid">
          <div className="entry-card">
            <h3>Guardian</h3>
            <p>일상/건강 피드 작성, 예약 완료 게시 승인, 친구 연결 기반 소통</p>
            <Link to="/signup" className="btn btn-primary btn-sm">Guardian 시작</Link>
          </div>
          <div className="entry-card">
            <h3>Supplier</h3>
            <p>예약 완료 콘텐츠 업로드 후 보호자 승인 시에만 공개 피드 게시</p>
            <Link to="/signup" className="btn btn-primary btn-sm">Supplier 시작</Link>
          </div>
          <div className="entry-card">
            <h3>Admin</h3>
            <p>마스터데이터/번역/국가 설정 및 전체 운영 데이터 관리</p>
            <Link to="/admin/login" className="btn btn-secondary btn-sm">Admin Login</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
