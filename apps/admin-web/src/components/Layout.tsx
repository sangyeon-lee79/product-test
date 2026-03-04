import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getStoredRole } from '../lib/auth';

const NAV = [
  { section: '대시보드', items: [
    { to: '/', icon: '📊', label: '분석 대시보드' },
  ]},
  { section: '데이터 관리', items: [
    { to: '/i18n', icon: '🌐', label: '언어 관리' },
    { to: '/master', icon: '🗂', label: '마스터 데이터' },
    { to: '/countries', icon: '🌍', label: '국가 / 통화' },
    { to: '/disease-maps', icon: '🔗', label: '질병 연결 매핑' },
  ]},
  { section: '광고 / 운영', items: [
    { to: '/ads', icon: '📢', label: '광고 설정' },
  ]},
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          🐾 방울아 놀자
          <span>Admin Console</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(group => (
            <div key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
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
          <div>{getStoredRole()} 계정</div>
          <button className="nav-item" style={{ padding: '6px 0', marginTop: 4 }}
            onClick={() => { logout(); navigate('/login'); }}>
            로그아웃
          </button>
        </div>
      </aside>
      <main className="main">
        {children}
      </main>
    </div>
  );
}
