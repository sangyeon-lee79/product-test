// 피드 작성 모달 — Guardian + Supplier 공용
import { useRef, useState, useEffect } from 'react';
import { api, type Pet } from '../../lib/api';
import {
  type FeedCompose, DEFAULT_FEED_COMPOSE,
  MAX_UPLOAD_SIZE, ALLOWED_UPLOAD_TYPES, FEED_MAX_EDGE, FEED_MAX_MB,
  fileToDataUrl, sanitizePathSegment, compressImageFile, uiErrorMessage,
} from './guardianTypes';

interface Props {
  open: boolean;
  pets: Pet[];
  selectedPetId: string;
  mode?: 'guardian' | 'supplier';
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const SUPPLIER_DEFAULT: FeedCompose = {
  ...DEFAULT_FEED_COMPOSE,
  feed_type: 'supplier_post',
  post_type: 'GENERAL',
  pet_id: '',
};

export default function ComposeModal({ open, pets, selectedPetId, mode = 'guardian', t, setError, onClose, onSuccess }: Props) {
  const isSupplier = mode === 'supplier';
  const defaults = isSupplier ? SUPPLIER_DEFAULT : { ...DEFAULT_FEED_COMPOSE, pet_id: selectedPetId };
  const [feedCompose, setFeedCompose] = useState<FeedCompose>(defaults);
  const [feedImageFile, setFeedImageFile] = useState<File | null>(null);
  const [feedImagePreviewUrl, setFeedImagePreviewUrl] = useState('');
  const [feedUploadProgress, setFeedUploadProgress] = useState(0);
  const [feedUploadError, setFeedUploadError] = useState('');
  const [isPostingFeed, setIsPostingFeed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      if (isSupplier) {
        setFeedCompose({ ...SUPPLIER_DEFAULT });
      } else {
        setFeedCompose((p) => ({ ...p, pet_id: selectedPetId }));
      }
    }
  }, [open, selectedPetId, isSupplier]);

  useEffect(() => {
    return () => {
      if (feedImagePreviewUrl) URL.revokeObjectURL(feedImagePreviewUrl);
    };
  }, [feedImagePreviewUrl]);

  if (!open) return null;

  function validateFeedImage(file: File): string | null {
    if (!ALLOWED_UPLOAD_TYPES.has(file.type.toLowerCase())) return t('guardian.feed.upload_type_invalid', 'Only JPG/PNG/WEBP files are allowed.');
    if (file.size > MAX_UPLOAD_SIZE) return t('guardian.feed.upload_size_limit', 'File size must be 10MB or less.');
    return null;
  }

  function resetFeedImage() {
    if (feedImagePreviewUrl) URL.revokeObjectURL(feedImagePreviewUrl);
    setFeedImageFile(null);
    setFeedImagePreviewUrl('');
    setFeedUploadProgress(0);
    setFeedUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFeedImageSelected(file: File | null) {
    if (!file) return;
    const validationError = validateFeedImage(file);
    if (validationError) { setFeedUploadError(validationError); return; }
    setFeedUploadError('');
    setFeedImageFile(file);
    if (feedImagePreviewUrl) URL.revokeObjectURL(feedImagePreviewUrl);
    setFeedImagePreviewUrl(URL.createObjectURL(file));
  }

  function uploadBinary(uploadUrl: string, file: File, onProgress: (ratio: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) onProgress(event.loaded / event.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) { onProgress(1); resolve(); return; }
        reject(new Error(xhr.statusText || 'upload_failed'));
      };
      xhr.onerror = () => reject(new Error('upload_failed'));
      xhr.send(file);
    });
  }

  async function createFeedPost() {
    if (!feedCompose.caption.trim()) {
      setError(t('guardian.alert.feed_caption_required', 'Please enter feed content.'));
      return;
    }
    setIsPostingFeed(true);
    setFeedUploadError('');
    try {
      const mediaUrls: string[] = [];
      if (feedImageFile) {
        try {
          const compressed = await compressImageFile(feedImageFile, { maxEdge: FEED_MAX_EDGE, maxSizeMB: FEED_MAX_MB, preferredType: 'image/jpeg' });
          const subdir = isSupplier ? 'feed/supplier' : `feed/${sanitizePathSegment(feedCompose.pet_id || selectedPetId || 'pet')}`;
          const presigned = await api.storage.presignedUrl({ type: 'log_media', ext: 'jpg', subdir });
          await uploadBinary(presigned.upload_url, compressed, (ratio) => setFeedUploadProgress(Math.round(ratio * 100)));
          mediaUrls.push(presigned.public_url);
        } catch (uploadError) {
          const raw = uploadError instanceof Error ? uploadError.message : '';
          if (/Storage not configured|no_r2|storage/i.test(raw)) {
            mediaUrls.push(await fileToDataUrl(feedImageFile));
          } else {
            throw uploadError;
          }
        }
      }
      await api.feeds.create({
        feed_type: feedCompose.feed_type,
        visibility_scope: feedCompose.visibility_scope,
        caption: feedCompose.caption.trim(),
        tags: feedCompose.tagsText.split(',').map((v) => v.trim()).filter(Boolean),
        pet_id: isSupplier ? null : (feedCompose.pet_id || null),
        media_urls: mediaUrls,
        ...(isSupplier && feedCompose.post_type ? { post_type: feedCompose.post_type } : {}),
      });
      setFeedCompose(defaults);
      resetFeedImage();
      onSuccess();
      onClose();
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      let message = uiErrorMessage(e, t('guardian.alert.feed_create_failed', 'Failed to create post.'));
      if (/10MB|file size|max/i.test(raw)) message = t('guardian.feed.upload_size_error', 'File size is too large.');
      else if (/JPG|JPEG|PNG|WEBP|type/i.test(raw)) message = t('guardian.feed.upload_type_error', 'Unsupported file type.');
      else if (/Storage not configured|no_r2|storage/i.test(raw)) message = t('guardian.feed.upload_storage_error', 'Storage connection failed.');
      else if (/upload/i.test(raw)) message = t('guardian.feed.upload_failed', 'Upload failed.');
      setFeedUploadError(message);
      setError(message);
    } finally {
      setIsPostingFeed(false);
    }
  }

  const modalTitle = isSupplier
    ? t('supplier.post.create_title', 'Create Post')
    : t('guardian.feed.create_title', 'Create Feed Post');

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{modalTitle}</h3>
          <button className="modal-close" onClick={() => onClose()}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="feed-compose-layout">
            <div className="feed-compose-media">
              <label className="form-label">{t('guardian.feed.photo_upload', 'Photo Upload')}</label>
              <div className="gallery-upload-dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFeedImageSelected(e.dataTransfer.files?.[0] || null); }}>
                <input ref={fileInputRef} name="compose-photo" type="file" className="gallery-upload-file-input" accept="image/jpeg,image/jpg,image/png,image/webp" capture="environment" onChange={(e) => handleFeedImageSelected(e.target.files?.[0] || null)} />
                <p>{t('guardian.feed.photo_hint', 'Drag & drop or select file')}</p>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>{t('guardian.feed.photo_select', 'Select Photo')}</button>
              </div>
              {feedImagePreviewUrl && (
                <div className="feed-compose-preview">
                  <img src={feedImagePreviewUrl} alt={t('guardian.feed.photo_preview', 'Upload preview')} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={resetFeedImage}>{t('guardian.feed.photo_reselect', 'Reselect')}</button>
                </div>
              )}
              {feedUploadError && <div className="alert alert-error mt-2">{feedUploadError}</div>}
              {isPostingFeed && feedUploadProgress > 0 && (
                <div className="gallery-upload-progress mt-2">
                  <div className="gallery-upload-progress-bar" style={{ width: `${feedUploadProgress}%` }} />
                  <span>{t('guardian.feed.uploading', 'Uploading')} {feedUploadProgress}%</span>
                </div>
              )}
            </div>
            <div className="feed-compose-fields">
              <div className="form-row col2">
                {/* Guardian: Feed Type / Supplier: Post Type */}
                {isSupplier ? (
                  <div className="form-group">
                    <label className="form-label" htmlFor="compose-post-type">{t('supplier.post.post_type', 'Post Type')}</label>
                    <select id="compose-post-type" name="compose-post-type" className="form-select" value={feedCompose.post_type || 'GENERAL'} onChange={(e) => setFeedCompose((p) => ({ ...p, post_type: e.target.value }))}>
                      <option value="GENERAL">{t('supplier.post.type.general', 'General')}</option>
                      <option value="NEWS">{t('supplier.post.type.news', 'News')}</option>
                      <option value="PRODUCT">{t('supplier.post.type.product', 'Product')}</option>
                      <option value="EVENT">{t('supplier.post.type.event', 'Event')}</option>
                      <option value="HIRING">{t('supplier.post.type.hiring', 'Hiring')}</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label" htmlFor="compose-feed-type">{t('guardian.feed.feed_type', 'Feed Type')}</label>
                    <select id="compose-feed-type" name="compose-feed-type" className="form-select" value={feedCompose.feed_type} onChange={(e) => setFeedCompose((p) => ({ ...p, feed_type: e.target.value as FeedCompose['feed_type'] }))}>
                      <option value="guardian_post">{t('guardian.feed.type.guardian_post', 'Guardian Post')}</option>
                      <option value="health_update">{t('guardian.feed.type.health_update', 'Health Update')}</option>
                      <option value="pet_milestone">{t('guardian.feed.type.pet_milestone', 'Pet Milestone')}</option>
                      <option value="supplier_story">{t('guardian.feed.type.supplier_story', 'Supplier Story')}</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="compose-visibility">{t('guardian.feed.visibility', 'Visibility')}</label>
                  <select id="compose-visibility" name="compose-visibility" className="form-select" value={feedCompose.visibility_scope} onChange={(e) => setFeedCompose((p) => ({ ...p, visibility_scope: e.target.value as FeedCompose['visibility_scope'] }))}>
                    <option value="public">{t('guardian.feed.visibility.public', 'Public')}</option>
                    <option value="friends_only">{t('guardian.feed.visibility.friends_only', 'Friends Only')}</option>
                    <option value="private">{t('guardian.feed.visibility.private', 'Private')}</option>
                    <option value="connected_only">{t('guardian.feed.visibility.connected_only', 'Connected Only')}</option>
                    <option value="booking_related_only">{t('guardian.feed.visibility.booking_related_only', 'Booking Related Only')}</option>
                  </select>
                </div>
              </div>
              {/* Pet selector: guardian only */}
              {!isSupplier && (
                <div className="form-group">
                  <label className="form-label" htmlFor="compose-linked-pet">{t('guardian.feed.linked_pet', 'Linked Pet')}</label>
                  <select id="compose-linked-pet" name="compose-linked-pet" className="form-select" value={feedCompose.pet_id} onChange={(e) => setFeedCompose((p) => ({ ...p, pet_id: e.target.value }))}>
                    <option value="">{t('common.none', 'None')}</option>
                    {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="compose-caption">{t('guardian.feed.caption', 'Caption')}</label>
                <textarea id="compose-caption" name="compose-caption" className="form-textarea" value={feedCompose.caption} onChange={(e) => setFeedCompose((p) => ({ ...p, caption: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="compose-tags">{t('guardian.feed.tags', 'Tags (comma separated)')}</label>
                <input id="compose-tags" name="compose-tags" className="form-input" value={feedCompose.tagsText} onChange={(e) => setFeedCompose((p) => ({ ...p, tagsText: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => onClose()}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" disabled={isPostingFeed} onClick={() => void createFeedPost()}>{isPostingFeed ? t('guardian.feed.posting', 'Posting...') : t('guardian.feed.post', 'Post')}</button>
        </div>
      </div>
    </div>
  );
}
