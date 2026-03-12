import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { getRoleHomePath, getStoredRole, isLoggedIn, normalizeRole } from './lib/auth';
import { I18nProvider } from './lib/i18n';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PublicHome from './pages/PublicHome';
import Dashboard from './pages/Dashboard';
import I18nPage from './pages/I18nPage';
import MasterPage from './pages/MasterPage';
import CountriesPage from './pages/CountriesPage';
import DevicePage from './pages/DevicePage';
import FeedPage from './pages/FeedPage';
import SupplementPage from './pages/SupplementPage';
import MedicinePage from './pages/MedicinePage';
import GuardianMainPage from './pages/GuardianMainPage';
import SupplierDashboardPage from './pages/SupplierDashboardPage';
import ExplorePage from './pages/ExplorePage';
import MembersPage from './pages/MembersPage';
import ApiConnectionsPage from './pages/ApiConnectionsPage';
import OAuthRedirectHandler from './components/OAuthRedirectHandler';
import NotificationToast, { showNotificationToast } from './components/NotificationToast';
import { requestNotificationPermission, onForegroundMessage } from './lib/firebase';
import { api } from './lib/api';
import './index.css';

function useFcmSetup() {
  useEffect(() => {
    if (!isLoggedIn()) return;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          await api.notifications.registerPushToken(token, 'web');
        }
      } catch { /* Firebase not configured — skip */ }

      try {
        unsubscribe = onForegroundMessage((payload) => {
          showNotificationToast({ title: payload.title, body: payload.body });
        });
      } catch { /* skip */ }
    })();

    return () => { unsubscribe?.(); };
  }, []);
}

function AuthRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RoleRoute({ allow }: { allow: Array<'admin' | 'guardian' | 'provider'> }) {
  const role = normalizeRole(getStoredRole());
  return allow.includes(role) ? <Outlet /> : <Navigate to={getRoleHomePath(role)} replace />;
}

function DefaultAfterLogin() {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <Navigate to={getRoleHomePath(getStoredRole())} replace />;
}

function AdminShell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  useFcmSetup();

  return (
    <I18nProvider>
      <HashRouter>
        <NotificationToast />
        <OAuthRedirectHandler>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DefaultAfterLogin />} />

          <Route element={<AuthRoute />}>
            <Route element={<RoleRoute allow={['guardian']} />}>
              <Route path="/guardian" element={<GuardianMainPage />} />
              <Route path="/guardian/pets/:pet_id" element={<GuardianMainPage />} />
            </Route>
            <Route element={<RoleRoute allow={['provider']} />}>
              <Route path="/supplier" element={<SupplierDashboardPage />} />
            </Route>
            <Route element={<RoleRoute allow={['admin']} />}>
              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<Dashboard />} />
                <Route path="i18n" element={<I18nPage />} />
                <Route path="master" element={<MasterPage />} />
                <Route path="countries" element={<CountriesPage />} />
                <Route path="devices" element={<DevicePage />} />
                <Route path="feeds" element={<FeedPage />} />
                <Route path="supplements" element={<SupplementPage />} />
                <Route path="medicines" element={<MedicinePage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="api-connections" element={<ApiConnectionsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </OAuthRedirectHandler>
      </HashRouter>
    </I18nProvider>
  );
}
