import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useT } from '../lib/i18n';

export default function Dashboard() {
  const t = useT();
  const [health, setHealth] = useState<{ status: string; environment: string; services: Record<string, string> } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.health().then(setHealth).catch(e => setError(e.message));
  }, []);

  const stats = [
    { label: t('admin.dashboard.api_status', 'API 상태'),  value: health?.status === 'ok' ? t('admin.dashboard.status_ok', '정상') : health ? t('admin.dashboard.status_error', '오류') : t('admin.dashboard.checking', '확인중...'), color: health?.status === 'ok' ? '#38a169' : '#e53e3e' },
    { label: t('admin.dashboard.env', '환경'),              value: health?.environment || '-', color: '#1a73e8' },
    { label: t('admin.dashboard.db', 'DB'),                 value: health?.services?.db || t('admin.dashboard.connecting', '연결중...'), color: health?.services?.db === 'connected' ? '#38a169' : '#d69e2e' },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Petfolio · {t('admin.dashboard.title', '분석 대시보드')}</div>
      </div>
      <div className="content">
        <div className="form-row col3 mb-4">
          {stats.map(stat => (
            <div className="card" key={stat.label}>
              <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.6px' }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 {t('admin.dashboard.progress', '개발 진행 현황 (PLAN.md)')}</div>
          </div>
          <div className="card-body">
            {[
              { slice: 'S0 인프라',             done: true,  note: 'D1 DB + Wrangler 설정 완료' },
              { slice: 'S1 언어관리 (i18n)',    done: true,  note: 'API + Admin UI 완료' },
              { slice: 'S2 마스터 데이터',      done: true,  note: 'API + Admin UI + Seed 완료' },
              { slice: 'S3 질병 연결 매핑',     done: true,  note: 'API + Admin UI 완료' },
              { slice: 'S4 국가/통화',          done: true,  note: 'API + Admin UI + Seed 완료' },
              { slice: 'S5 인증 + R2',          done: true,  note: 'JWT + R2 프록시 업로드 완료' },
              { slice: 'S6 프로필 + 펫',        done: true,  note: 'Guardian/Pet/Disease API 완료' },
              { slice: 'S7~S12',               done: false, note: '미개발' },
            ].map(item => (
              <div key={item.slice} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 20, textAlign: 'center' }}>{item.done ? '✅' : '⬜'}</span>
                <span style={{ fontWeight: 500, minWidth: 200 }}>{item.slice}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
