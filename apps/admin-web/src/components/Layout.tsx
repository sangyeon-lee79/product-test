import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logout, getStoredRole } from '../lib/auth';
import { useT, useI18n, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';
import { BCP47_LOCALE_MAP, type Lang } from '@petfolio/shared';
import NotificationCenter from './NotificationCenter';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'admin.nav.dashboard',
  '/admin/i18n': 'admin.nav.i18n',
  '/admin/master': 'admin.nav.master',
  '/admin/countries': 'admin.nav.countries',
  '/admin/devices': 'admin.nav.devices',
  '/admin/feeds': 'admin.nav.feeds',
  '/admin/supplements': 'admin.nav.supplements',
  '/admin/medicines': 'admin.nav.medicines',
  '/admin/members': 'admin.nav.members',
  '/admin/api-connections': 'admin.nav.api_connections',
  '/admin/ads': 'admin.nav.ads',
  '/admin/feed-card-settings': 'admin.nav.feed_card_settings',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const { lang, setLang } = useI18n();
  const locale = BCP47_LOCALE_MAP[lang as Lang] || 'en-US';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = getStoredRole() || 'admin';
  const today = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });

  // Resolve hash path
  const hashPath = location.pathname;
  const titleKey = PAGE_TITLES[hashPath] || 'admin.nav.dashboard';
  const pageTitle = t(titleKey, 'Dashboard');

  const NAV = [
    { section: t('admin.section.overview', 'Overview'), items: [
      { to: '/admin', icon: '📊', label: t('admin.nav.dashboard', 'Dashboard') },
    ]},
    { section: t('admin.section.users', 'Users'), items: [
      { to: '/admin/members', icon: '👥', label: t('admin.nav.members', 'User Management'), badge: null as number | null },
      { to: '/admin/ads', icon: '🏪', label: t('admin.nav.provider_mgmt', 'Provider Management') },
    ]},
    { section: t('admin.section.content', 'Content'), items: [
      { to: '/admin/feeds', icon: '📝', label: t('admin.nav.feed_mgmt', 'Feed Management') },
      { to: '/admin/feed-card-settings', icon: '🃏', label: t('admin.nav.feed_card_settings', 'Feed Card Settings') },
      { to: '/admin/ads', icon: '📢', label: t('admin.nav.ads', 'Ad Management') },
    ]},
    { section: t('admin.section.master_data', 'Master Data'), items: [
      { to: '/admin/feeds', icon: '🥣', label: t('admin.nav.feeds', 'Feed Catalog') },
      { to: '/admin/supplements', icon: '💊', label: t('admin.nav.supplements', 'Supplements / Medicine') },
      { to: '/admin/medicines', icon: '💉', label: t('admin.nav.medicines', 'Medicine') },
      { to: '/admin/master', icon: '🗂', label: t('admin.nav.master', 'Breed Data') },
      { to: '/admin/devices', icon: '🔬', label: t('admin.nav.devices', 'Device Management') },
      { to: '/admin/countries', icon: '🌍', label: t('admin.nav.countries', 'Countries / Currency') },
      { to: '/admin/i18n', icon: '🌐', label: t('admin.nav.i18n', 'i18n Translations') },
    ]},
    { section: t('admin.section.system', 'System'), items: [
      { to: '/admin/api-connections', icon: '⚙️', label: t('admin.nav.api_connections', 'Settings') },
    ]},
  ];

  return (
    <div className="layout">
      {/* Sidebar backdrop (mobile) */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-name">Petfolio<span className="sidebar-logo-dot">.</span></div>
          <div className="sidebar-logo-sub">{t('admin.login.console', 'Admin Console')}</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(group => (
            <div key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to + item.label}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {'badge' in item && item.badge != null && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar">{role[0].toUpperCase()}</div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{role}</div>
            <div className="sidebar-profile-role">{t('admin.common.account', 'Account')}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <select
            value={lang}
            onChange={e => setLang(e.target.value as typeof lang)}
          >
            {SUPPORTED_LANGS.map(l => (
              <option key={l} value={l}>{LANG_LABELS[l]}</option>
            ))}
          </select>
          <button className="nav-item" onClick={() => { logout(); navigate('/', { replace: true }); }}>
            {t('admin.common.logout', 'Logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</button>
          <h1 className="topbar-title">{pageTitle}</h1>
          <div className="topbar-search">
            <input placeholder={t('admin.topbar.search', 'Search...')} readOnly />
          </div>
          <NotificationCenter />
          <span className="topbar-date">{today}</span>
        </header>
        {children}
      </main>
    </div>
  );
}
