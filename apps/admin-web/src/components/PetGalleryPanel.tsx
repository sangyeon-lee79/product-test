import { useMemo, useState } from 'react';
import { api, type Booking, type Pet, type PetAlbumMedia } from '../lib/api';

export type GallerySourceType = 'profile' | 'feed' | 'booking_completed' | 'health_record' | 'manual_upload';
type MediaFilter = 'all' | 'image' | 'video';
type SortOrder = 'latest' | 'oldest';
type UploadKind = 'manual_upload' | 'health_record' | 'profile';
type VisibilityScope = 'public' | 'friends_only' | 'private' | 'guardian_supplier_only' | 'booking_related';

interface GalleryItem {
  id: string;
  petId: string;
  sourceType: GallerySourceType;
  sourceId: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  caption: string;
  uploadedBy: string;
  visibilityScope: VisibilityScope;
  createdAt: string;
  bookingId?: string | null;
  isPrimary?: boolean;
  tags: string[];
  status: string;
}

interface Props {
  selectedPet: Pet | null;
  mediaItems: PetAlbumMedia[];
  bookings: Booking[];
  breedLabel: string;
  genderLabel: string;
  lifeStageLabel: string;
  isGuardian: boolean;
  onRefresh: () => Promise<void>;
  setError: (message: string) => void;
}

function ensureArray(raw: string[] | string | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') as string[] : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string | null, fallback = '-'): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function iconFor(item: GalleryItem): string {
  if (item.mediaType === 'video') return '▶';
  if (item.sourceType === 'profile') return '⭐';
  if (item.sourceType === 'health_record') return '🩺';
  if (item.sourceType === 'booking_completed') return '✂';
  return '•';
}

function badgeFor(item: GalleryItem): string {
  if (item.mediaType === 'video') return 'VIDEO';
  if (item.sourceType === 'profile') return item.isPrimary ? 'CURRENT PROFILE' : 'PROFILE';
  if (item.sourceType === 'health_record') return 'HEALTH';
  if (item.sourceType === 'booking_completed') return item.status === 'pending' ? 'BOOKING PENDING' : 'BOOKING';
  if (item.sourceType === 'manual_upload') return 'MANUAL';
  return 'FEED';
}

function sourceLabel(source: GallerySourceType): string {
  const map: Record<GallerySourceType, string> = {
    profile: '프로필',
    feed: '피드',
    booking_completed: '예약완료',
    health_record: '건강기록',
    manual_upload: '수동업로드',
  };
  return map[source];
}

export default function PetGalleryPanel({
  selectedPet,
  mediaItems,
  bookings,
  breedLabel,
  genderLabel,
  lifeStageLabel,
  isGuardian,
  onRefresh,
  setError,
}: Props) {
  const [sourceFilter, setSourceFilter] = useState<'all' | GallerySourceType>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadKind, setUploadKind] = useState<UploadKind>('manual_upload');
  const [uploadVisibility, setUploadVisibility] = useState<VisibilityScope>('public');
  const [savingUpload, setSavingUpload] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const allItems = useMemo(() => {
    if (!selectedPet) return [] as GalleryItem[];

    return mediaItems
      .filter((item) => item.pet_id === selectedPet.id && item.status !== 'deleted')
      .map((item) => ({
        id: item.id,
        petId: item.pet_id,
        sourceType: item.source_type,
        sourceId: item.source_id || '',
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url || item.media_url,
        caption: item.caption || '',
        uploadedBy: item.uploaded_by_email || item.uploaded_by_user_id || '-',
        visibilityScope: item.visibility_scope,
        createdAt: item.created_at,
        bookingId: item.booking_id,
        isPrimary: Number(item.is_primary || 0) > 0,
        tags: ensureArray(item.tags),
        status: item.status,
      }));
  }, [mediaItems, selectedPet]);

  const visibleItems = useMemo(() => {
    let rows = allItems;
    if (sourceFilter !== 'all') rows = rows.filter((row) => row.sourceType === sourceFilter);
    if (mediaFilter !== 'all') rows = rows.filter((row) => row.mediaType === mediaFilter);
    rows = [...rows].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === 'latest' ? diff : -diff;
    });
    return rows;
  }, [allItems, sourceFilter, mediaFilter, sortOrder]);

  const selectedItem = selectedIndex !== null ? visibleItems[selectedIndex] : null;

  const photoCount = allItems.filter((v) => v.mediaType === 'image').length;
  const videoCount = allItems.filter((v) => v.mediaType === 'video').length;
  const latestUploadDate = allItems.length
    ? formatDate([...allItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt)
    : '-';

  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking>();
    for (const booking of bookings) map.set(booking.id, booking);
    return map;
  }, [bookings]);

  async function submitUpload() {
    if (!selectedPet) return;
    const mediaUrl = uploadUrl.trim();
    if (!mediaUrl) {
      setError('미디어 URL을 입력해 주세요.');
      return;
    }

    const tags = uploadTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSavingUpload(true);
    try {
      await api.petAlbum.create({
        pet_id: selectedPet.id,
        source_type: uploadKind === 'health_record' ? 'health_record' : uploadKind === 'profile' ? 'profile' : 'manual_upload',
        media_url: mediaUrl,
        thumbnail_url: mediaUrl,
        caption: uploadCaption.trim() || null,
        tags,
        visibility_scope: uploadVisibility,
        is_primary: uploadKind === 'profile',
      });
      setUploadOpen(false);
      setUploadUrl('');
      setUploadCaption('');
      setUploadTags('');
      setUploadKind('manual_upload');
      setUploadVisibility('public');
      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드에 실패했습니다.');
    } finally {
      setSavingUpload(false);
    }
  }

  async function removeMedia(item: GalleryItem) {
    if (!confirm('이 미디어를 삭제할까요?')) return;
    setDeletingId(item.id);
    try {
      await api.petAlbum.remove(item.id);
      setSelectedIndex(null);
      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setDeletingId('');
    }
  }

  if (!selectedPet) {
    return (
      <div className="card">
        <div className="card-body">
          <h3>Gallery</h3>
          <p className="text-muted">등록된 펫이 없어 Gallery를 표시할 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-shell card">
      <div className="card-body">
        <header className="gallery-summary">
          <div className="gallery-profile-pic" aria-label="pet profile summary">{selectedPet.name.slice(0, 1).toUpperCase()}</div>
          <div className="gallery-summary-text">
            <h3>{selectedPet.name}</h3>
            <p className="text-muted">{breedLabel} / {genderLabel} / {lifeStageLabel}</p>
            <p className="gallery-summary-meta">사진 {photoCount}장 · 영상 {videoCount}개 · 최근 업데이트: {latestUploadDate}</p>
          </div>
          {isGuardian && <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>사진 추가</button>}
        </header>

        <div className="gallery-filter-bar">
          <div className="gallery-filter-group">
            {(['all', 'feed', 'booking_completed', 'health_record', 'profile', 'manual_upload'] as const).map((v) => (
              <button
                key={v}
                className={`feed-tab ${sourceFilter === v ? 'active' : ''}`}
                onClick={() => setSourceFilter(v)}
              >
                {v === 'all' ? '전체' : sourceLabel(v)}
              </button>
            ))}
          </div>
          <div className="gallery-filter-group">
            <button className={`feed-tab ${mediaFilter === 'image' ? 'active' : ''}`} onClick={() => setMediaFilter('image')}>사진만</button>
            <button className={`feed-tab ${mediaFilter === 'video' ? 'active' : ''}`} onClick={() => setMediaFilter('video')}>영상만</button>
            <button className={`feed-tab ${mediaFilter === 'all' ? 'active' : ''}`} onClick={() => setMediaFilter('all')}>영상포함</button>
            <select className="form-select gallery-sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>

        {allItems.length === 0 ? (
          <div className="gallery-empty">
            <h4>아직 사진이 없습니다.</h4>
            <p>첫 프로필 사진이나 반려동물 사진을 업로드해보세요.</p>
            {isGuardian && <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>사진 추가</button>}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="gallery-empty compact">선택한 유형의 사진이 없습니다.</div>
        ) : (
          <div className="gallery-grid" role="list">
            {visibleItems.map((item, idx) => (
              <button key={item.id} className="gallery-tile" onClick={() => setSelectedIndex(idx)}>
                {item.mediaType === 'video' ? (
                  <video src={item.mediaUrl} preload="metadata" muted playsInline />
                ) : (
                  <img src={item.thumbnailUrl} alt={`${selectedPet.name} gallery`} loading="lazy" />
                )}
                <span className="gallery-overlay-icon" aria-hidden>{iconFor(item)}</span>
                <span className="gallery-badge">{badgeFor(item)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal gallery-detail-modal">
            <div className="modal-header">
              <h3 className="modal-title">{selectedPet.name} Gallery</h3>
              <button className="modal-close" onClick={() => setSelectedIndex(null)}>&times;</button>
            </div>
            <div className="modal-body gallery-detail-body">
              <div className="gallery-detail-media">
                {selectedItem.mediaType === 'video' ? (
                  <video src={selectedItem.mediaUrl} controls autoPlay playsInline />
                ) : (
                  <img src={selectedItem.mediaUrl} alt={`${selectedPet.name} detail`} />
                )}
                <div className="gallery-detail-nav">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedIndex((prev) => {
                      if (prev === null) return 0;
                      return prev <= 0 ? visibleItems.length - 1 : prev - 1;
                    })}
                  >
                    이전
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedIndex((prev) => {
                      if (prev === null) return 0;
                      return prev >= visibleItems.length - 1 ? 0 : prev + 1;
                    })}
                  >
                    다음
                  </button>
                </div>
              </div>
              <aside className="gallery-detail-meta">
                <h4>{selectedPet.name}</h4>
                <p><strong>업로드 유형:</strong> {sourceLabel(selectedItem.sourceType)}</p>
                <p><strong>업로드 날짜:</strong> {formatDate(selectedItem.createdAt)}</p>
                <p><strong>업로드자:</strong> {selectedItem.uploadedBy}</p>
                <p><strong>공개 범위:</strong> {selectedItem.visibilityScope}</p>
                {selectedItem.bookingId && (
                  <p><strong>예약 상태:</strong> {bookingMap.get(selectedItem.bookingId)?.status || '예약 정보 없음'}</p>
                )}
                {selectedItem.isPrimary && <p><strong>현재 프로필</strong></p>}
                {selectedItem.caption && <p className="gallery-caption">{selectedItem.caption}</p>}
                {selectedItem.tags.length > 0 && (
                  <p className="gallery-tags">{selectedItem.tags.map((tag) => `#${tag}`).join(' ')}</p>
                )}
                {selectedItem.sourceId && (
                  <p><a href={`/#/?feed_id=${selectedItem.sourceId}`}>원본 피드 보기</a></p>
                )}
                {isGuardian && (
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === selectedItem.id}
                    onClick={() => removeMedia(selectedItem)}
                  >
                    {deletingId === selectedItem.id ? '삭제 중...' : '삭제'}
                  </button>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}

      {uploadOpen && (
        <div className="modal-overlay">
          <div className="modal gallery-upload-modal">
            <div className="modal-header">
              <h3 className="modal-title">사진 추가</h3>
              <button className="modal-close" onClick={() => setUploadOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">미디어 URL</label>
                <input className="form-input" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">업로드 유형</label>
                <select className="form-select" value={uploadKind} onChange={(e) => setUploadKind(e.target.value as UploadKind)}>
                  <option value="manual_upload">일반 앨범</option>
                  <option value="health_record">건강기록 연결</option>
                  <option value="profile">프로필 사진으로 설정</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">공개 범위</label>
                <select className="form-select" value={uploadVisibility} onChange={(e) => setUploadVisibility(e.target.value as VisibilityScope)}>
                  <option value="public">public</option>
                  <option value="friends_only">friends_only</option>
                  <option value="private">private</option>
                  <option value="guardian_supplier_only">guardian_supplier_only</option>
                  <option value="booking_related">booking_related</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">캡션</label>
                <textarea className="form-textarea" value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">태그</label>
                <input className="form-input" value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="cute, spring" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setUploadOpen(false)}>취소</button>
              <button className="btn btn-primary" onClick={submitUpload} disabled={savingUpload}>{savingUpload ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
