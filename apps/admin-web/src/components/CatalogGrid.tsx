// Shared components for catalog hierarchy pages (DevicePage, FeedPage)

import { type ReactNode, useRef } from 'react';
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
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
  t?: (key: string, fallback?: string) => string;
}

export function CatalogModelDetail({ title, fields, onEdit, onDelete, editLabel, deleteLabel, imageUrl, onImageUpload, onImageRemove, t }: CatalogModelDetailProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" title="Edit" aria-label="Edit" onClick={onEdit}>{editLabel}</button>
          <button className="btn btn-danger btn-sm" title="Delete" aria-label="Delete" onClick={onDelete}>{deleteLabel}</button>
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
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
                <span style={{ fontSize: 24, opacity: 0.4 }}>&#128247;</span>
                <span style={{ fontSize: 11 }}>{t?.('admin.catalog.upload_image', 'Upload') ?? 'Upload'}</span>
                <span style={{ fontSize: 10, opacity: 0.5 }}>{t?.('admin.catalog.image_upload_hint', '200×200') ?? '200×200'}</span>
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
