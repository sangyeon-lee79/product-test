import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setTokens } from '../lib/api';
import { storeRole } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@petlife.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.testLogin(email, 'admin');
      setTokens(data.access_token, data.refresh_token);
      storeRole(data.role);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="card-body">
          <div className="login-logo">
            <h1>🐾 방울아 놀자</h1>
            <p>Admin Console</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">이메일 (테스트 로그인)</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@petlife.com"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" /> 로그인 중...</> : '로그인'}
            </button>
          </form>
          <p className="text-muted text-sm mt-3" style={{ textAlign: 'center' }}>
            개발용 테스트 로그인 (OAuth는 S12에서 구현)
          </p>
        </div>
      </div>
    </div>
  );
}
