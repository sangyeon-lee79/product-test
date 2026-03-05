import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './lib/auth';
import { I18nProvider } from './lib/i18n';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import I18nPage from './pages/I18nPage';
import MasterPage from './pages/MasterPage';
import CountriesPage from './pages/CountriesPage';
import './index.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <I18nProvider>
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/i18n" element={<I18nPage />} />
                <Route path="/master" element={<MasterPage />} />
                <Route path="/countries" element={<CountriesPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </HashRouter>
    </I18nProvider>
  );
}
