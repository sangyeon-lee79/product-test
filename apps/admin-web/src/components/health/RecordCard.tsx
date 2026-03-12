// Unified health record card — used by all 5 record types in the Guardian timeline
import { type SyntheticEvent } from 'react';

export type RecordType = 'weight' | 'measurement' | 'feeding' | 'exercise' | 'medication';

export interface ValuePill {
  label: string;
  value: string;
  unit?: string;
}

export interface RecordCardImage {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
}

/** Data portion returned by mapper functions (no callbacks) */
export interface RecordCardData {
  id: string;
  type: RecordType;
  icon: string;
  title: string;
  time: string;
  badge?: string;
  notes?: string;
  values: ValuePill[];
  images?: RecordCardImage[];
}

interface RecordCardProps extends RecordCardData {
  onEdit: () => void;
  onDelete: () => void;
  onImageClick?: (images: RecordCardImage[], startIndex: number) => void;
  t: (key: string, fallback?: string) => string;
}

const PLACEHOLDER = '/assets/images/placeholder_feed.svg';

function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
}

export default function RecordCard({
  type, icon, title, time, badge, notes, values, images,
  onEdit, onDelete, onImageClick, t,
}: RecordCardProps) {
  const imgs = images?.filter((i) => i.url) ?? [];
  const gridClass = imgs.length === 1 ? 'rc-img-grid rc-img-grid--single'
    : imgs.length === 2 ? 'rc-img-grid rc-img-grid--two'
    : imgs.length >= 3 ? 'rc-img-grid rc-img-grid--multi' : '';

  return (
    <div className="rc-card" data-type={type}>
      {/* Header */}
      <div className="rc-header">
        <div className="rc-icon">{icon}</div>
        <div className="rc-header-text">
          <div className="rc-title">{title}</div>
          <div className="rc-time">{time}</div>
        </div>
        {badge && <span className="rc-badge">{badge}</span>}
        <div className="rc-actions">
          <button title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={onEdit}>✏️</button>
          <button title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={onDelete}>🗑️</button>
        </div>
      </div>

      {/* Body — value pills + notes */}
      {(values.length > 0 || notes) && (
        <div className="rc-body">
          {values.length > 0 && (
            <div className="rc-values">
              {values.map((v) => (
                <div key={v.label} className="rc-pill">
                  <span className="rc-pill-label">{v.label}</span>
                  <span className="rc-pill-value">{v.value}</span>
                  {v.unit && <span className="rc-pill-unit">{v.unit}</span>}
                </div>
              ))}
            </div>
          )}
          {notes && <div className="rc-notes">{notes}</div>}
        </div>
      )}

      {/* Footer — image grid */}
      {imgs.length > 0 && (
        <div className="rc-footer">
          <div className={gridClass}>
            {imgs.length <= 2 ? (
              imgs.map((img, i) => (
                <img
                  key={i}
                  src={img.thumbnailUrl || img.url}
                  alt={img.alt || ''}
                  onError={handleImgError}
                  onClick={() => onImageClick?.(imgs, i)}
                />
              ))
            ) : (
              <>
                <img
                  src={imgs[0].thumbnailUrl || imgs[0].url}
                  alt={imgs[0].alt || ''}
                  onError={handleImgError}
                  onClick={() => onImageClick?.(imgs, 0)}
                />
                <div
                  className="rc-img-overlay"
                  data-count={`+${imgs.length - 1}`}
                  onClick={() => onImageClick?.(imgs, 1)}
                >
                  <img
                    src={imgs[1].thumbnailUrl || imgs[1].url}
                    alt={imgs[1].alt || ''}
                    onError={handleImgError}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
