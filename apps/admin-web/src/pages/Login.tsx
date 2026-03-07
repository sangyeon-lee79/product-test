import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, setTokens } from '../lib/api';
import { getRoleHomePath, storeRole } from '../lib/auth';
import { useT } from '../lib/i18n';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const forcedAdmin = location.pathname === '/admin/login';
  const [email, setEmail] = useState(forcedAdmin ? 'admin@petlife.com' : 'guardian@petlife.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const title = useMemo(() => (forcedAdmin ? 'Admin Login' : 'Login'), [forcedAdmin]);

  function uiErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
      }
      return msg;
    }
    return t('admin.login.error', '로그인에 실패했습니다.');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.testLogin(email);
      setTokens(data.access_token, data.refresh_token);
      storeRole(data.role);
      navigate(getRoleHomePath(data.role), { replace: true });
    } catch (err) {
      setError(uiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="card-body">
          <div className="login-logo">
            <h1>🐾 {t('platform.name', 'Petfolio')}</h1>
            <p>{t('platform.tagline', "Your pet's life portfolio")}</p>
            <p>펫폴리오</p>
            <p>{title}</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleLogin}>
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
