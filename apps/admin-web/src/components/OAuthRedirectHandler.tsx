/**
 * Top-level OAuth redirect handler.
 *
 * Problem: With HashRouter the OAuth provider redirects to
 *   https://domain.com/?code=xxx&state=google:login#/
 * which renders PublicHome — not Login/Signup where the old
 * handlers lived.  The code was never exchanged for tokens.
 *
 * Solution: This component wraps <Routes> and intercepts the
 * OAuth redirect *before* any route renders.
 *
 *  - login  → exchange code, store tokens, navigate to role home
 *  - signup → exchange code, navigate to /signup with snsToken in state
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setTokens } from '../lib/api';
import { getRoleHomePath, storeRole } from '../lib/auth';
import { getOAuthRedirectResult, clearOAuthRedirectParams } from '../lib/oauthRedirect';
import { useT } from '../lib/i18n';

export default function OAuthRedirectHandler({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const t = useT();
  const [processing, setProcessing] = useState(() => !!getOAuthRedirectResult());

  useEffect(() => {
    const result = getOAuthRedirectResult();
    if (!result) return;
    clearOAuthRedirectParams();

    api.oauthLogin(result.provider, result.code)
      .then(data => {
        if (result.mode === 'signup') {
          // Pass tokens to signup page via location state
          navigate('/signup', {
            replace: true,
            state: {
              snsToken: {
                access: data.access_token,
                refresh: data.refresh_token,
                role: data.role,
                email: data.email || '',
              },
            },
          });
        } else {
          // Login: persist tokens immediately and go to role home
          setTokens(data.access_token, data.refresh_token);
          storeRole(data.role);
          navigate(getRoleHomePath(data.role), { replace: true });
        }
      })
      .catch(() => {
        navigate('/login', { replace: true });
      })
      .finally(() => setProcessing(false));
  }, []);

  if (processing) {
    return (
      <div className="oauth-processing">
        <div className="spinner" />
        <p>{t('public.oauth.processing', 'Logging in...')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
