import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, setTokens } from '../lib/api';
import { getRoleHomePath, storeRole } from '../lib/auth';
import { loginWithGoogle, getGoogleConfig } from '../lib/google';
import { getKakaoConfig, loginWithKakao } from '../lib/kakao';
import { getAppleConfig, loginWithApple } from '../lib/apple';
import { getOAuthRedirectResult, clearOAuthRedirectParams } from '../lib/oauthRedirect';
import { useT } from '../lib/i18n';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const forcedAdmin = location.pathname === '/admin/login';
  const defaultEmail = forcedAdmin ? 'admin@petlife.com' : 'guardian@petlife.com';
  const defaultPassword = forcedAdmin ? 'Admin123!' : 'Guardian123!';
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [loadingMode, setLoadingMode] = useState<'password' | ''>('');
  const [error, setError] = useState('');
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [kakaoAvailable, setKakaoAvailable] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const title = useMemo(() => (forcedAdmin ? t('admin.login.console', 'Admin Console') : t('public.login.title', '로그인')), [forcedAdmin, t]);

  function uiErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return t('common.err.network', 'Network error. Please try again later.');
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

  // Check which OAuth platforms are configured
  useEffect(() => {
    getGoogleConfig().then(c => setGoogleAvailable(!!c.google_oauth_client_id)).catch(() => {});
    getKakaoConfig().then(c => setKakaoAvailable(!!c.kakao_javascript_key)).catch(() => {});
    getAppleConfig().then(c => setAppleAvailable(!!c.apple_service_id)).catch(() => {});
  }, []);

  // Handle OAuth redirect result (unified for Google, Kakao, Apple)
  useEffect(() => {
    const result = getOAuthRedirectResult();
    if (!result) return;
    clearOAuthRedirectParams();
    setLoadingMode('password');
    setError('');
    api.oauthLogin(result.provider, result.code)
      .then(data => completeLogin(data))
      .catch(err => setError(uiErrorMessage(err)))
      .finally(() => setLoadingMode(''));
  }, []);

  function handleOAuthRedirect(provider: 'google' | 'kakao' | 'apple') {
    setError('');
    const doRedirect = provider === 'google' ? loginWithGoogle
      : provider === 'apple' ? loginWithApple
      : loginWithKakao;
    doRedirect('login').catch((e: unknown) => {
      setError(e instanceof Error ? e.message : t('public.signup.sns_fail', 'SNS 연결에 실패했습니다.'));
    });
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
              <div className="oauth-buttons">
                {googleAvailable && (
                  <button className="oauth-btn oauth-btn-google" onClick={() => handleOAuthRedirect('google')} disabled={loadingMode !== ''} type="button">
                    {t('public.login.google', 'Google 로그인')}
                  </button>
                )}
                {kakaoAvailable && (
                  <button className="oauth-btn oauth-btn-kakao" onClick={() => handleOAuthRedirect('kakao')} disabled={loadingMode !== ''} type="button">
                    {t('public.login.kakao', '카카오 로그인')}
                  </button>
                )}
                {appleAvailable && (
                  <button className="oauth-btn oauth-btn-apple" onClick={() => handleOAuthRedirect('apple')} disabled={loadingMode !== ''} type="button">
                    {t('public.login.apple', 'Apple로 로그인')}
                  </button>
                )}
              </div>
            </div>
          </form>
          <p className="text-muted text-sm mt-3" style={{ textAlign: 'center' }}>
            {t('public.login.dev_note', 'Google 로그인과 이메일 로그인을 모두 사용할 수 있습니다.')}
          </p>
          {!forcedAdmin && (
            <p className="text-sm mt-3" style={{ textAlign: 'center' }}>
              {t('public.login.no_account', "Don't have an account?")} <Link to="/signup">{t('public.signup.title', 'Sign up')}</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
