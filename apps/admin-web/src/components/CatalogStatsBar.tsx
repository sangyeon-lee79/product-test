export interface StatCard {
  label: string;
  value: number;
  desc: string;
  active?: boolean;
  onClick?: () => void;
}

interface Props {
  cards: StatCard[];
  loading: boolean;
}

export function CatalogStatsBar({ cards, loading }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length}, minmax(150px, 1fr))`, gap: 12, marginBottom: 16 }}>
      {cards.map((c, i) => (
        <div
          key={i}
          className="card"
          style={{
            cursor: c.onClick ? 'pointer' : undefined,
            outline: c.active ? '2px solid var(--primary)' : undefined,
            outlineOffset: -2,
          }}
          onClick={c.onClick}
        >
          <div className="card-body" style={{ padding: '14px 16px' }}>
            <div className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{loading ? '--' : c.value.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
