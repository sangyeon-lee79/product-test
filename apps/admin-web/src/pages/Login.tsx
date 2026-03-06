import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api, setTokens } from '../lib/api';
import { getRoleHomePath, normalizeRole, storeRole } from '../lib/auth';
import { useT } from '../lib/i18n';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const t = useT();
  const forcedAdmin = location.pathname === '/admin/login';
  const initialRole = normalizeRole(searchParams.get('role'));
  const [email, setEmail] = useState(forcedAdmin ? 'admin@petlife.com' : 'guardian@petlife.com');
  const [role, setRole] = useState<'guardian' | 'provider' | 'admin'>(forcedAdmin ? 'admin' : initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const title = useMemo(() => (forcedAdmin ? 'Admin Login' : 'Login'), [forcedAdmin]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loginRole = forcedAdmin ? 'admin' : role;
      const data = await api.testLogin(email, loginRole);
      setTokens(data.access_token, data.refresh_token);
      storeRole(data.role);
      navigate(getRoleHomePath(data.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.login.error', '로그인 실패'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="card-body">
          <div className="login-logo">
            <h1>🐾 {t('admin.login.app_name', '방울아 놀자')}</h1>
            <p>{title}</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleLogin}>
            {!forcedAdmin && (
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select className="form-select" value={role} onChange={e => setRole(normalizeRole(e.target.value))}>
                  <option value="guardian">Guardian</option>
                  <option value="provider">Supplier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={forcedAdmin ? 'admin@petlife.com' : 'guardian@petlife.com'}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" /> {t('admin.login.loading', '로그인 중...')}</> : t('admin.login.submit', '로그인')}
            </button>
          </form>
          <p className="text-muted text-sm mt-3" style={{ textAlign: 'center' }}>
            개발 환경: 테스트 로그인 사용 중
          </p>
          {!forcedAdmin && (
            <p className="text-sm mt-3" style={{ textAlign: 'center' }}>
              계정이 없나요? <Link to="/signup">회원가입</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
