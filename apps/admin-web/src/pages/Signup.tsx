import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setTokens } from '../lib/api';
import { getApiBase } from '../lib/apiBase';
import { getRoleHomePath, normalizeRole, storeRole } from '../lib/auth';

type CountryRow = {
  id: string;
  code: string;
  currency_code?: string | null;
};

const API_BASE = getApiBase();

function roleToApiRole(role: string): 'guardian' | 'provider' {
  const normalized = normalizeRole(role);
  return normalized === 'provider' ? 'provider' : 'guardian';
}

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('guardian@petlife.com');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'guardian' | 'provider'>('guardian');
  const [countryCode, setCountryCode] = useState('KR');
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadCountries() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/countries`);
        const text = await res.text();
        const parsed = text ? JSON.parse(text) as { success?: boolean; data?: CountryRow[]; error?: string } : null;
        if (!res.ok || !parsed?.success) throw new Error(parsed?.error || `HTTP ${res.status}`);
        if (!mounted) return;
        const list = (parsed.data || []).sort((a, b) => a.code.localeCompare(b.code));
        setCountries(list);
        if (list.length > 0 && !list.find(c => c.code === countryCode)) {
          setCountryCode(list[0].code);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load countries');
      }
    }
    void loadCountries();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedCountry = useMemo(
    () => countries.find(c => c.code === countryCode),
    [countries, countryCode],
  );

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiRole = roleToApiRole(role);
      const data = await api.signup({
        email,
        role: apiRole,
        display_name: displayName,
        country_code: countryCode,
      });
      setTokens(data.access_token, data.refresh_token);
      storeRole(data.role);
      navigate(getRoleHomePath(data.role), { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card" style={{ width: 480 }}>
        <div className="card-body">
          <div className="login-logo">
            <h1>🐾 Join PetLife</h1>
            <p>Guardian / Supplier account signup</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value as typeof role)}>
                <option value="guardian">Guardian</option>
                <option value="provider">Supplier</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className="form-input"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Display Name *</label>
              <input
                className="form-input"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="홍길동"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country *</label>
              <select className="form-select" required value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                {countries.map(c => (
                  <option key={c.id} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>

            <div className="alert" style={{ background: '#f5f8ff', border: '1px solid #d6e2ff', color: '#244c99' }}>
              Default setup: language/currency are auto-configured from selected country.
              <div className="mt-1 text-sm">Currency preview: {selectedCountry?.currency_code || '-'}</div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-sm mt-3" style={{ textAlign: 'center' }}>
            이미 계정이 있나요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
