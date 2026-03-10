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
  const [password, setPassword] = useState('');
  const [loadingMode, setLoadingMode] = useState<'password' | ''>('');
  const [error, setError] = useState('');
  const title = useMemo(() => (forcedAdmin ? t('admin.login.console', 'Admin Console') : t('public.login.title', '로그인')), [forcedAdmin, t]);

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

  async function completeLogin(data: { access_token: string; refresh_token: string; role: string }) {
    setTokens(data.access_token, data.refresh_token);
    storeRole(data.role);
    navigate(getRoleHomePath(data.role), { replace: true });
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoadingMode('password');
    setError('');
    try {
      const data = await api.login(email, password);
      await completeLogin(data);
    } catch (err) {
      setError(uiErrorMessage(err));
    } finally {
      setLoadingMode('');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card" style={{ width: 420 }}>
        <div className="card-body">
          <div className="login-logo">
            <h1>🐾 {t('platform.name', 'Petfolio')}</h1>
            <p>{t('platform.tagline', "Your pet's life portfolio")}</p>
            <p>{title}</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label className="form-label">{t('public.login.email', 'Email')}</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={forcedAdmin ? 'admin@petlife.com' : 'name@example.com'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('public.login.password', '비밀번호')}</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={loadingMode !== ''} style={{ width: '100%', justifyContent: 'center' }}>
                {loadingMode === 'password' ? t('admin.login.loading', '로그인 중...') : t('public.login.submit_password', '이메일 로그인')}
              </button>
            </div>
          </form>
          <p className="text-muted text-sm mt-3" style={{ textAlign: 'center' }}>
            {t('public.login.dev_note', '현재 Google OAuth는 준비 단계이며 이메일/비밀번호 로그인이 기본입니다.')}
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
