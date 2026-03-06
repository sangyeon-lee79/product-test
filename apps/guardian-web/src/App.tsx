import { useEffect, useMemo, useState } from 'react';
import './App.css';

type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; error: string };
type ApiResp<T> = ApiOk<T> | ApiErr;

type Country = { id: string; code: string };
type MasterItem = { id: string; key: string };
type Profile = {
  id?: string;
  handle: string | null;
  display_name: string | null;
  bio: string | null;
  bio_translations: Record<string, string>;
  country_id: string | null;
  language: string | null;
  timezone: string | null;
  interests: string[];
  avatar_url: string | null;
};
type PetDisease = { disease_id: string; disease_key?: string };
type Pet = {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed_id: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'unknown' | null;
  weight_kg: number | null;
  is_neutered: number;
  microchip_no: string | null;
  avatar_url: string | null;
  diseases: PetDisease[];
};

type PetForm = {
  id?: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed_id: string;
  birth_date: string;
  gender: 'male' | 'female' | 'unknown' | '';
  weight_kg: string;
  is_neutered: boolean;
  microchip_no: string;
  avatar_url: string;
  disease_ids: string[];
};

const emptyPetForm: PetForm = {
  name: '',
  species: 'dog',
  breed_id: '',
  birth_date: '',
  gender: '',
  weight_kg: '',
  is_neutered: false,
  microchip_no: '',
  avatar_url: '',
  disease_ids: [],
};

function getApiBase() {
  const envBase = import.meta.env.VITE_API_URL as string | undefined;
  if (envBase) return envBase.replace(/\/+$/, '');
  const { hostname, protocol } = window.location;
  if (hostname.includes('cluster.cloudworkstations.dev')) return `${protocol}//${hostname.replace(/^5173-/, '8787-')}`;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8787';
  return 'https://pet-life-api.adrien-lee.workers.dev';
}

const API_BASE = getApiBase();

async function api<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let json: ApiResp<T> | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as ApiResp<T>;
    } catch {
      json = null;
    }
  }
  if (!res.ok) {
    const apiError = json && !json.success ? json.error : '';
    throw new Error(apiError || `HTTP ${res.status}`);
  }
  if (!json || !json.success) throw new Error('Invalid response');
  return json.data;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('guardian_access_token') || '');
  const [email, setEmail] = useState('guardian@petlife.com');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [breeds, setBreeds] = useState<MasterItem[]>([]);
  const [diseases, setDiseases] = useState<MasterItem[]>([]);
  const [interests, setInterests] = useState<MasterItem[]>([]);

  const [profile, setProfile] = useState<Profile>({
    handle: '',
    display_name: '',
    bio: '',
    bio_translations: {},
    country_id: '',
    language: 'ko',
    timezone: 'Asia/Seoul',
    interests: [],
    avatar_url: '',
  });

  const [pets, setPets] = useState<Pet[]>([]);
  const [petForm, setPetForm] = useState<PetForm>(emptyPetForm);
  const [editingPetDiseaseIds, setEditingPetDiseaseIds] = useState<string[]>([]);

  const breedMap = useMemo(() => Object.fromEntries(breeds.map((x) => [x.id, x.key])), [breeds]);
  const diseaseMap = useMemo(() => Object.fromEntries(diseases.map((x) => [x.id, x.key])), [diseases]);

  async function login() {
    setLoading(true);
    setMessage('');
    try {
      const data = await api<{ access_token: string }>('/api/v1/auth/test-login', {
        method: 'POST',
        body: JSON.stringify({ email, role: 'guardian' }),
      });
      setToken(data.access_token);
      localStorage.setItem('guardian_access_token', data.access_token);
      setMessage('Logged in.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      const [countryRows, breedRows, diseaseRows, interestRows] = await Promise.all([
        api<Country[]>('/api/v1/countries'),
        api<MasterItem[]>('/api/v1/master/items?category_key=breed'),
        api<MasterItem[]>('/api/v1/master/items?category_key=disease'),
        api<MasterItem[]>('/api/v1/master/items?category_key=interest'),
      ]);
      setCountries(countryRows);
      setBreeds(breedRows);
      setDiseases(diseaseRows);
      setInterests(interestRows);

      const me = await api<{ profile: Profile | null }>('/api/v1/guardians/me', {}, token);
      if (me.profile) {
        setProfile({ ...me.profile, interests: me.profile.interests || [] });
      }
      const petData = await api<{ pets: Pet[] }>('/api/v1/pets', {}, token);
      setPets(petData.pets || []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [token]);

  function toggleInterest(id: string) {
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(id) ? p.interests.filter((x) => x !== id) : [...p.interests, id],
    }));
  }

  function togglePetDisease(id: string) {
    setPetForm((f) => ({
      ...f,
      disease_ids: f.disease_ids.includes(id) ? f.disease_ids.filter((x) => x !== id) : [...f.disease_ids, id],
    }));
  }

  async function checkHandle() {
    if (!profile.handle) return;
    try {
      const data = await api<{ available: boolean; reason?: string }>(`/api/v1/guardians/check-handle?handle=${encodeURIComponent(profile.handle)}`, {}, token);
      setMessage(data.available ? 'Handle available.' : `Handle unavailable${data.reason ? ` (${data.reason})` : ''}.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Handle check failed');
    }
  }

  async function saveProfile() {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      await api('/api/v1/guardians/me', {
        method: 'PUT',
        body: JSON.stringify({
          handle: profile.handle || null,
          display_name: profile.display_name || null,
          bio: profile.bio || null,
          bio_translations: profile.bio_translations || {},
          country_id: profile.country_id || null,
          language: profile.language || 'ko',
          timezone: profile.timezone || 'Asia/Seoul',
          interests: profile.interests,
          avatar_url: profile.avatar_url || null,
        }),
      }, token);
      setMessage('Profile saved.');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Profile save failed');
    } finally {
      setLoading(false);
    }
  }

  function startEditPet(pet: Pet) {
    const diseaseIds = (pet.diseases || []).map((d) => d.disease_id);
    setEditingPetDiseaseIds(diseaseIds);
    setPetForm({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed_id: pet.breed_id || '',
      birth_date: pet.birth_date || '',
      gender: pet.gender || '',
      weight_kg: pet.weight_kg == null ? '' : String(pet.weight_kg),
      is_neutered: !!pet.is_neutered,
      microchip_no: pet.microchip_no || '',
      avatar_url: pet.avatar_url || '',
      disease_ids: diseaseIds,
    });
  }

  async function savePet() {
    if (!token) return;
    if (!petForm.name.trim()) {
      setMessage('Pet name is required.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        name: petForm.name.trim(),
        species: petForm.species,
        breed_id: petForm.breed_id || null,
        birth_date: petForm.birth_date || null,
        gender: petForm.gender || null,
        weight_kg: petForm.weight_kg ? Number(petForm.weight_kg) : null,
        is_neutered: petForm.is_neutered,
        microchip_no: petForm.microchip_no || null,
        avatar_url: petForm.avatar_url || null,
      };

      if (!petForm.id) {
        await api('/api/v1/pets', { method: 'POST', body: JSON.stringify({ ...payload, disease_ids: petForm.disease_ids }) }, token);
      } else {
        await api(`/api/v1/pets/${petForm.id}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
        const toAdd = petForm.disease_ids.filter((x) => !editingPetDiseaseIds.includes(x));
        const toRemove = editingPetDiseaseIds.filter((x) => !petForm.disease_ids.includes(x));
        for (const diseaseId of toAdd) {
          await api(`/api/v1/pets/${petForm.id}/diseases`, { method: 'POST', body: JSON.stringify({ disease_id: diseaseId }) }, token);
        }
        for (const diseaseId of toRemove) {
          await api(`/api/v1/pets/${petForm.id}/diseases/${diseaseId}`, { method: 'DELETE' }, token);
        }
      }

      setMessage('Pet saved.');
      setPetForm(emptyPetForm);
      setEditingPetDiseaseIds([]);
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Pet save failed');
    } finally {
      setLoading(false);
    }
  }

  async function deletePet(id: string) {
    if (!token) return;
    if (!window.confirm('Delete this pet?')) return;
    setLoading(true);
    setMessage('');
    try {
      await api(`/api/v1/pets/${id}`, { method: 'DELETE' }, token);
      setMessage('Pet deleted.');
      if (petForm.id === id) setPetForm(emptyPetForm);
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('guardian_access_token');
    setToken('');
    setPets([]);
    setMessage('Logged out.');
  }

  if (!token) {
    return (
      <main className="app-wrap">
        <section className="panel login-panel">
          <h1>Guardian Web</h1>
          <p className="muted">S6 profile + pet registration</p>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <button disabled={loading} onClick={() => void login()}>Test Login (guardian)</button>
          {message && <p className="notice">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-wrap">
      <header className="top-row">
        <h1>Guardian Profile + Pets</h1>
        <button onClick={logout}>Logout</button>
      </header>
      {message && <div className="notice">{message}</div>}

      <section className="panel">
        <h2>Profile</h2>
        <div className="grid2">
          <div>
            <label>Handle</label>
            <div className="row">
              <input value={profile.handle || ''} onChange={(e) => setProfile((p) => ({ ...p, handle: e.target.value }))} placeholder="bangul_mom" />
              <button type="button" onClick={() => void checkHandle()}>Check</button>
            </div>
          </div>
          <div>
            <label>Display Name</label>
            <input value={profile.display_name || ''} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} />
          </div>
          <div>
            <label>Country</label>
            <select value={profile.country_id || ''} onChange={(e) => setProfile((p) => ({ ...p, country_id: e.target.value }))}>
              <option value="">Select country</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
          <div>
            <label>Language</label>
            <input value={profile.language || 'ko'} onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value }))} />
          </div>
          <div>
            <label>Timezone</label>
            <input value={profile.timezone || 'Asia/Seoul'} onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))} />
          </div>
          <div>
            <label>Avatar URL</label>
            <input value={profile.avatar_url || ''} onChange={(e) => setProfile((p) => ({ ...p, avatar_url: e.target.value }))} />
          </div>
        </div>
        <label>Bio</label>
        <textarea value={profile.bio || ''} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} />
        <label>Interests</label>
        <div className="check-grid">
          {interests.map((i) => (
            <label key={i.id} className="check-item">
              <input type="checkbox" checked={profile.interests.includes(i.id)} onChange={() => toggleInterest(i.id)} />
              <span>{i.key}</span>
            </label>
          ))}
        </div>
        <button disabled={loading} onClick={() => void saveProfile()}>Save Profile</button>
      </section>

      <section className="panel">
        <h2>Pets</h2>
        <div className="pet-layout">
          <div className="pet-list">
            {pets.map((p) => (
              <div key={p.id} className="pet-card">
                <div>
                  <strong>{p.name}</strong>
                  <p className="muted">{p.species} / {p.breed_id ? (breedMap[p.breed_id] || p.breed_id) : '-'}</p>
                  <p className="muted">Diseases: {(p.diseases || []).map((d) => diseaseMap[d.disease_id] || d.disease_id).join(', ') || '-'}</p>
                </div>
                <div className="row">
                  <button onClick={() => startEditPet(p)}>Edit</button>
                  <button className="danger" onClick={() => void deletePet(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pet-form">
            <h3>{petForm.id ? 'Edit Pet' : 'Add Pet'}</h3>
            <div className="grid2">
              <div>
                <label>Name *</label>
                <input value={petForm.name} onChange={(e) => setPetForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label>Species *</label>
                <select value={petForm.species} onChange={(e) => setPetForm((f) => ({ ...f, species: e.target.value as PetForm['species'] }))}>
                  <option value="dog">dog</option>
                  <option value="cat">cat</option>
                  <option value="other">other</option>
                </select>
              </div>
              <div>
                <label>Breed</label>
                <select value={petForm.breed_id} onChange={(e) => setPetForm((f) => ({ ...f, breed_id: e.target.value }))}>
                  <option value="">Select breed</option>
                  {breeds.map((b) => <option key={b.id} value={b.id}>{b.key}</option>)}
                </select>
              </div>
              <div>
                <label>Birth Date</label>
                <input type="date" value={petForm.birth_date} onChange={(e) => setPetForm((f) => ({ ...f, birth_date: e.target.value }))} />
              </div>
              <div>
                <label>Gender</label>
                <select value={petForm.gender} onChange={(e) => setPetForm((f) => ({ ...f, gender: e.target.value as PetForm['gender'] }))}>
                  <option value="">-</option>
                  <option value="male">male</option>
                  <option value="female">female</option>
                  <option value="unknown">unknown</option>
                </select>
              </div>
              <div>
                <label>Weight (kg)</label>
                <input type="number" step="0.1" value={petForm.weight_kg} onChange={(e) => setPetForm((f) => ({ ...f, weight_kg: e.target.value }))} />
              </div>
              <div>
                <label>Microchip No</label>
                <input value={petForm.microchip_no} onChange={(e) => setPetForm((f) => ({ ...f, microchip_no: e.target.value }))} />
              </div>
              <div>
                <label>Avatar URL</label>
                <input value={petForm.avatar_url} onChange={(e) => setPetForm((f) => ({ ...f, avatar_url: e.target.value }))} />
              </div>
            </div>
            <label className="check-item">
              <input type="checkbox" checked={petForm.is_neutered} onChange={(e) => setPetForm((f) => ({ ...f, is_neutered: e.target.checked }))} />
              <span>Neutered</span>
            </label>

            <label>Diseases</label>
            <div className="check-grid">
              {diseases.map((d) => (
                <label key={d.id} className="check-item">
                  <input type="checkbox" checked={petForm.disease_ids.includes(d.id)} onChange={() => togglePetDisease(d.id)} />
                  <span>{d.key}</span>
                </label>
              ))}
            </div>

            <div className="row">
              <button disabled={loading} onClick={() => void savePet()}>{petForm.id ? 'Update Pet' : 'Create Pet'}</button>
              {petForm.id && <button onClick={() => { setPetForm(emptyPetForm); setEditingPetDiseaseIds([]); }}>Cancel Edit</button>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
