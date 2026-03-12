// Shared components for catalog hierarchy pages (DevicePage, FeedPage)

import { type ReactNode, useRef, useState } from 'react';
import type { CatalogSortMode } from '../lib/catalogUtils';

// ─── Col ─────────────────────────────────────────────────────────────────────

interface CatalogColProps {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  sortMode?: CatalogSortMode;
  onSortChange?: (mode: CatalogSortMode) => void;
  children: ReactNode;
}

const SORT_LABELS: Record<CatalogSortMode, string> = {
  count_desc: '#↓',
  count_asc: '#↑',
  name_asc: 'A-Z',
};
const SORT_CYCLE: CatalogSortMode[] = ['count_desc', 'name_asc', 'count_asc'];

export function CatalogCol({ title, onAdd, addLabel, sortMode, onSortChange, children }: CatalogColProps) {
  const handleSort = () => {
    if (!onSortChange || !sortMode) return;
    const idx = SORT_CYCLE.indexOf(sortMode);
    onSortChange(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {sortMode && onSortChange && (
            <button
              className="btn btn-secondary btn-sm catalog-sort-btn"
              onClick={handleSort}
              title="Sort"
            >
              {SORT_LABELS[sortMode]}
            </button>
          )}
          {onAdd && <button className="btn btn-primary btn-sm" onClick={onAdd}>+ {addLabel}</button>}
        </div>
      </div>
      <div className="master-column-list">{children}</div>
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  t: (key: string) => string;
}

export function CatalogStatusBadge({ status, t }: StatusBadgeProps) {
  return (
    <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-gray'}`}>
      {status === 'active' ? t('admin.master.active') : t('admin.master.inactive')}
    </span>
  );
}

// ─── List Thumbnail ──────────────────────────────────────────────────────────

interface CatalogListThumbProps {
  src?: string | null;
  fallbackSrc: string;
  alt?: string;
}

export function CatalogListThumb({ src, fallbackSrc, alt }: CatalogListThumbProps) {
  if (!src) {
    return <img src={fallbackSrc} alt={alt ?? ''} className="catalog-list-thumb" />;
  }
  return (
    <img
      src={src}
      alt={alt ?? ''}
      className="catalog-list-thumb"
      onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
    />
  );
}

// ─── ModelDetail ──────────────────────────────────────────────────────────────

export interface ModelDetailField {
  label: string;
  value: string | null | undefined;
}

interface CatalogModelDetailProps {
  title: string;
  fields: ModelDetailField[];
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
  imageUrl?: string | null;
  fallbackImageSrc?: string;
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
  onImageUrlChange?: (url: string) => void;
  t?: (key: string, fallback?: string) => string;
}

export function CatalogModelDetail({ title, fields, onEdit, onDelete, editLabel, deleteLabel, imageUrl, fallbackImageSrc, onImageUpload, onImageRemove, onImageUrlChange, t }: CatalogModelDetailProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const handleUrlSave = () => {
    const trimmed = urlDraft.trim();
    if (trimmed && onImageUrlChange) {
      onImageUrlChange(trimmed);
    }
    setShowUrlInput(false);
    setUrlDraft('');
  };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" title={t?.('common.edit', 'Edit') ?? 'Edit'} aria-label={t?.('common.edit', 'Edit') ?? 'Edit'} onClick={onEdit}>{editLabel}</button>
          <button className="btn btn-danger btn-sm" title={t?.('common.delete', 'Delete') ?? 'Delete'} aria-label={t?.('common.delete', 'Delete') ?? 'Delete'} onClick={onDelete}>{deleteLabel}</button>
        </div>
      </div>
      <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
        {/* Image area */}
        {onImageUpload && (
          <div className="catalog-model-image-wrap">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImageUpload(f);
                e.target.value = '';
              }}
            />
            {imageUrl ? (
              <div className="catalog-model-image-box">
                <img
                  src={imageUrl}
                  alt={title}
                  className="catalog-model-image"
                  onError={(e) => {
                    if (fallbackImageSrc) (e.target as HTMLImageElement).src = fallbackImageSrc;
                    else (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="catalog-model-image-actions">
                  <button className="btn btn-secondary btn-xs" onClick={() => fileRef.current?.click()}>
                    {t?.('admin.catalog.change_image', 'Change') ?? 'Change'}
                  </button>
                  {onImageRemove && (
                    <button className="btn btn-danger btn-xs" onClick={onImageRemove}>
                      {t?.('admin.catalog.remove_image', 'Remove') ?? 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="catalog-model-image-placeholder"
                onClick={() => fileRef.current?.click()}
                title={t?.('admin.catalog.upload_image', 'Upload Image') ?? 'Upload Image'}
              >
                {fallbackImageSrc ? (
                  <img src={fallbackImageSrc} alt="" style={{ width: 48, height: 48, opacity: 0.5 }} />
                ) : (
                  <span style={{ fontSize: 24, opacity: 0.4 }}>&#128247;</span>
                )}
                <span style={{ fontSize: 11 }}>{t?.('admin.catalog.upload_image', 'Upload') ?? 'Upload'}</span>
                <span style={{ fontSize: 10, opacity: 0.5 }}>{t?.('admin.catalog.image_upload_hint', '200×200') ?? '200×200'}</span>
              </div>
            )}
            {/* URL input toggle */}
            {onImageUrlChange && (
              <div style={{ marginTop: 4 }}>
                {showUrlInput ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={urlDraft}
                      onChange={(e) => setUrlDraft(e.target.value)}
                      placeholder={t?.('admin.catalog.image_url_hint', 'Paste image URL') ?? 'Paste image URL'}
                      style={{ fontSize: 11, padding: '3px 6px', flex: 1, minWidth: 0 }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSave(); }}
                    />
                    <button className="btn btn-primary btn-xs" onClick={handleUrlSave}>
                      {t?.('admin.catalog.image_url_save', 'OK') ?? 'OK'}
                    </button>
                    <button className="btn btn-secondary btn-xs" onClick={() => { setShowUrlInput(false); setUrlDraft(''); }}>✕</button>
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary btn-xs"
                    style={{ fontSize: 10, width: '100%' }}
                    onClick={() => { setShowUrlInput(true); setUrlDraft(imageUrl ?? ''); }}
                  >
                    {t?.('admin.catalog.image_url', 'Image URL') ?? 'Image URL'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {/* Fields */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {fields.map(({ label, value }) => (
            <div key={label}>{label}: {value}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
