import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getStoredRole } from '../lib/auth';
import { useT, useI18n, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const t = useT();
  const { lang, setLang } = useI18n();

  const NAV = [
    { section: t('admin.section.dashboard', '대시보드'), items: [
      { to: '/admin', icon: '📊', label: t('admin.nav.dashboard', '분석 대시보드') },
    ]},
    { section: t('admin.section.data', '데이터 관리'), items: [
      { to: '/admin/i18n',      icon: '🌐', label: t('admin.nav.i18n',          '언어 관리') },
      { to: '/admin/master',    icon: '🗂', label: t('admin.nav.master',        '마스터 데이터') },
      { to: '/admin/countries', icon: '🌍', label: t('admin.nav.countries',     '국가 / 통화') },
      { to: '/admin/devices',   icon: '🔬', label: t('admin.nav.devices',       '장치 관리') },
      { to: '/admin/feeds',     icon: '🥣', label: t('admin.nav.feeds',         '사료 관리') },
    ]},
    { section: t('admin.section.ads', '광고 / 운영'), items: [
      { to: '/admin/ads', icon: '📢', label: t('admin.nav.ads', '광고 설정') },
    ]},
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          🐾 {t('platform.name', 'Petfolio')}
          <span>{t('admin.login.console', 'Admin Console')}</span>
          <span className="sidebar-tagline">{t('platform.tagline', "Your pet's life portfolio")}</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(group => (
            <div key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <select
            value={lang}
            onChange={e => setLang(e.target.value as typeof lang)}
            style={{ width: '100%', marginBottom: 8, background: '#1e1e2e', border: '1px solid #333', color: '#ccc', padding: '4px 6px', borderRadius: 4, fontSize: 12 }}
          >
            {SUPPORTED_LANGS.map(l => (
              <option key={l} value={l}>{LANG_LABELS[l]}</option>
            ))}
          </select>
          <div>{getStoredRole()} {t('admin.common.account', '계정')}</div>
          <button className="nav-item" style={{ padding: '6px 0', marginTop: 4 }}
            onClick={() => { logout(); navigate('/login', { replace: true }); }}>
            {t('admin.common.logout', '로그아웃')}
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="brand-strip">
          <strong>{t('platform.name', 'Petfolio')}</strong>
          <span>{t('platform.tagline', "Your pet's life portfolio")}</span>
        </div>
        {children}
      </main>
    </div>
  );
}
