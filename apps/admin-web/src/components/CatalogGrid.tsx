// Shared components for catalog hierarchy pages (DevicePage, FeedPage)

import type { ReactNode } from 'react';

// ─── Col ─────────────────────────────────────────────────────────────────────

interface CatalogColProps {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
}

export function CatalogCol({ title, onAdd, addLabel, children }: CatalogColProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{title}</div>
        {onAdd && <button className="btn btn-primary btn-sm" onClick={onAdd}>+ {addLabel}</button>}
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
}

export function CatalogModelDetail({ title, fields, onEdit, onDelete, editLabel, deleteLabel }: CatalogModelDetailProps) {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>{editLabel}</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>{deleteLabel}</button>
        </div>
      </div>
      <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
        {fields.map(({ label, value }) => (
          <div key={label}>{label}: {value}</div>
        ))}
      </div>
    </div>
  );
}
