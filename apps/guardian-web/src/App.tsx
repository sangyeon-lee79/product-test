import { useEffect, useMemo, useState } from 'react';
import './App.css';

type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; error: string };
type ApiResp<T> = ApiOk<T> | ApiErr;

type Country = { id: string; code: string; ko_name?: string | null };
type MasterItem = {
  id: string;
  key: string;
  ko_name?: string | null;
  en?: string | null;
  metadata?: string;
};

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

type Pet = {
  id: string;
  name: string;
  pet_type_id: string | null;
  breed_id: string | null;
  gender_id: string | null;
  neuter_status_id: string | null;
  life_stage_id: string | null;
  body_size_id: string | null;
  country_id: string | null;
  medication_status_id: string | null;
  weight_unit_id: string | null;
  health_condition_level_id: string | null;
  activity_level_id: string | null;
  diet_type_id: string | null;
  living_style_id: string | null;
  ownership_type_id: string | null;
  coat_length_id: string | null;
  coat_type_id: string | null;
  grooming_cycle_id: string | null;
  color_ids: string[];
  allergy_ids: string[];
  disease_history_ids: string[];
  symptom_tag_ids: string[];
  vaccination_ids: string[];
  temperament_ids: string[];
  birth_date: string | null;
  weight_kg: number | null;
  microchip_no: string | null;
  notes: string | null;
  intro_text: string | null;
};

type PetForm = {
  id?: string;
  name: string;
  pet_type_id: string;
  breed_id: string;
  gender_id: string;
  neuter_status_id: string;
  life_stage_id: string;
  body_size_id: string;
  country_id: string;
  medication_status_id: string;
  weight_unit_id: string;
  health_condition_level_id: string;
  activity_level_id: string;
  diet_type_id: string;
  living_style_id: string;
  ownership_type_id: string;
  coat_length_id: string;
  coat_type_id: string;
  grooming_cycle_id: string;
  color_ids: string[];
  allergy_ids: string[];
  disease_history_ids: string[];
  symptom_tag_ids: string[];
  vaccination_ids: string[];
  temperament_ids: string[];
  birth_date: string;
  weight_kg: string;
  microchip_no: string;
  notes: string;
  intro_text: string;
};

type Booking = {
  id: string;
  guardian_id: string;
  supplier_id: string;
  pet_id: string | null;
  service_id: string | null;
  business_category_id: string | null;
  status: string;
  requested_date: string | null;
  requested_time: string | null;
  notes: string | null;
  created_at: string;
};

type AlbumMedia = {
  id: string;
  pet_id: string;
  source_type: string;
  source_id: string | null;
  booking_id: string | null;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  tags: string[];
  uploaded_by_user_id: string;
  visibility_scope: string;
  is_primary: number;
  status: string;
  created_at: string;
};

const CATEGORY_KEYS = {
  pet_type: 'pet_type',
  pet_breed: 'pet_breed',
  pet_gender: 'pet_gender',
  neuter_status: 'neuter_status',
  life_stage: 'life_stage',
  body_size: 'body_size',
  pet_color: 'pet_color',
  allergy_type: 'allergy_type',
  disease_type: 'disease_type',
  symptom_type: 'symptom_type',
  vaccination_type: 'vaccination_type',
  medication_status: 'medication_status',
  weight_unit: 'weight_unit',
  health_condition_level: 'health_condition_level',
  activity_level: 'activity_level',
  diet_type: 'diet_type',
  temperament_type: 'temperament_type',
  living_style: 'living_style',
  ownership_type: 'ownership_type',
  coat_length: 'coat_length',
  coat_type: 'coat_type',
  grooming_cycle: 'grooming_cycle',
  interest: 'interest',
} as const;

const emptyPetForm: PetForm = {
  name: '',
  pet_type_id: '',
  breed_id: '',
  gender_id: '',
  neuter_status_id: '',
  life_stage_id: '',
  body_size_id: '',
  country_id: '',
  medication_status_id: '',
  weight_unit_id: '',
  health_condition_level_id: '',
  activity_level_id: '',
  diet_type_id: '',
  living_style_id: '',
  ownership_type_id: '',
  coat_length_id: '',
  coat_type_id: '',
  grooming_cycle_id: '',
  color_ids: [],
  allergy_ids: [],
  disease_history_ids: [],
  symptom_tag_ids: [],
  vaccination_ids: [],
  temperament_ids: [],
  birth_date: '',
  weight_kg: '',
  microchip_no: '',
  notes: '',
  intro_text: '',
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

function itemLabel(item: MasterItem): string {
  return item.ko_name || item.en || item.key;
}

function parseBreedTypes(item: MasterItem): string[] {
  if (!item.metadata) return [];
  try {
    const obj = JSON.parse(item.metadata) as { pet_type_keys?: unknown };
    if (!Array.isArray(obj.pet_type_keys)) return [];
    return obj.pet_type_keys.map((x) => (typeof x === 'string' ? x : '')).filter(Boolean);
  } catch {
    return [];
  }
}

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => (typeof x === 'string' ? x : '')).filter(Boolean);
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('guardian_access_token') || '');
  const [email, setEmail] = useState('guardian@petlife.com');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [microchipMessage, setMicrochipMessage] = useState('');

  const [countries, setCountries] = useState<Country[]>([]);
  const [master, setMaster] = useState<Record<string, MasterItem[]>>({});

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [albumSourceType, setAlbumSourceType] = useState('');
  const [albumMediaType, setAlbumMediaType] = useState('');
  const [albumSort, setAlbumSort] = useState<'latest' | 'oldest'>('latest');
  const [albumMedia, setAlbumMedia] = useState<AlbumMedia[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<AlbumMedia | null>(null);
  const [modalCaption, setModalCaption] = useState('');
  const [bookingSupplierId, setBookingSupplierId] = useState('');
  const [bookingPetId, setBookingPetId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const masterById = useMemo(() => {
    const all = Object.values(master).flat();
    return Object.fromEntries(all.map((x) => [x.id, x]));
  }, [master]);

  const petTypeById = useMemo(() => {
    const list = master[CATEGORY_KEYS.pet_type] || [];
    return Object.fromEntries(list.map((x) => [x.id, x.key]));
  }, [master]);

  const filteredBreeds = useMemo(() => {
    const list = master[CATEGORY_KEYS.pet_breed] || [];
    if (!petForm.pet_type_id) return list;
    const selectedTypeKey = petTypeById[petForm.pet_type_id];
    if (!selectedTypeKey) return list;
    return list.filter((breed) => {
      const matchTypes = parseBreedTypes(breed);
      return matchTypes.length === 0 || matchTypes.includes(selectedTypeKey);
    });
  }, [master, petForm.pet_type_id, petTypeById]);

  async function login() {
    setLoading(true);
    setMessage('');
    try {
      const data = await api<{ access_token: string }>('/api/v1/auth/test-login', {
        method: 'POST',
        body: JSON.stringify({ email }),
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
      const categoryList = Object.values(CATEGORY_KEYS);
      const masterPromises = categoryList.map((key) =>
        api<MasterItem[]>(`/api/v1/master/items?category_key=${encodeURIComponent(key)}`)
          .then((rows) => [key, rows] as const)
          .catch(() => [key, []] as const),
      );

      const [countryRows, ...masterRows] = await Promise.all([
        api<Country[]>('/api/v1/countries'),
        ...masterPromises,
      ]);

      setCountries(countryRows);
      setMaster(Object.fromEntries(masterRows));

      const me = await api<{ profile: Profile | null }>('/api/v1/guardians/me', {}, token);
      if (me.profile) {
        setProfile({ ...me.profile, interests: me.profile.interests || [] });
      }
      const petData = await api<{ pets: Pet[] }>('/api/v1/pets', {}, token);
      const loadedPets = petData.pets || [];
      setPets(loadedPets);
      if (!selectedPetId && loadedPets.length) {
        setSelectedPetId(loadedPets[0].id);
        setBookingPetId(loadedPets[0].id);
      }

      const bookingData = await api<{ bookings: Booking[] }>('/api/v1/bookings', {}, token);
      setBookings(bookingData.bookings || []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedPetId) {
      setAlbumMedia([]);
      return;
    }
    let cancelled = false;
    setAlbumLoading(true);
    void api<{ media: AlbumMedia[] }>(
      `/api/v1/pet-album?pet_id=${encodeURIComponent(selectedPetId)}&include_pending=true${albumSourceType ? `&source_type=${encodeURIComponent(albumSourceType)}` : ''}${albumMediaType ? `&media_type=${encodeURIComponent(albumMediaType)}` : ''}&sort=${albumSort}&limit=180`,
      {},
      token,
    )
      .then((res) => {
        if (!cancelled) setAlbumMedia(res.media || []);
      })
      .catch((e) => {
        if (!cancelled) setMessage(e instanceof Error ? e.message : 'Failed to load gallery');
      })
      .finally(() => {
        if (!cancelled) setAlbumLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, selectedPetId, albumSourceType, albumMediaType, albumSort]);

  function toggleInterest(id: string) {
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(id) ? p.interests.filter((x) => x !== id) : [...p.interests, id],
    }));
  }

  function toggleMultiField(field: keyof Pick<
    PetForm,
    'color_ids' | 'allergy_ids' | 'disease_history_ids' | 'symptom_tag_ids' | 'vaccination_ids' | 'temperament_ids'
  >, id: string) {
    setPetForm((f) => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter((x) => x !== id) : [...f[field], id],
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

  async function checkMicrochip() {
    const value = petForm.microchip_no.trim();
    if (!value || !token) {
      setMicrochipMessage('');
      return true;
    }
    try {
      const query = new URLSearchParams({ microchip_no: value });
      if (petForm.id) query.set('exclude_pet_id', petForm.id);
      const res = await api<{ available: boolean; reason?: string }>(`/api/v1/pets/check-microchip?${query.toString()}`, {}, token);
      if (!res.available) {
        setMicrochipMessage(res.reason || '이미 등록된 마이크로칩 번호입니다.');
        return false;
      }
      setMicrochipMessage('사용 가능한 마이크로칩 번호입니다.');
      return true;
    } catch (e) {
      setMicrochipMessage(e instanceof Error ? e.message : '마이크로칩 확인 실패');
      return false;
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
    setMicrochipMessage('');
    setPetForm({
      id: pet.id,
      name: pet.name || '',
      pet_type_id: pet.pet_type_id || '',
      breed_id: pet.breed_id || '',
      gender_id: pet.gender_id || '',
      neuter_status_id: pet.neuter_status_id || '',
      life_stage_id: pet.life_stage_id || '',
      body_size_id: pet.body_size_id || '',
      country_id: pet.country_id || '',
      medication_status_id: pet.medication_status_id || '',
      weight_unit_id: pet.weight_unit_id || '',
      health_condition_level_id: pet.health_condition_level_id || '',
      activity_level_id: pet.activity_level_id || '',
      diet_type_id: pet.diet_type_id || '',
      living_style_id: pet.living_style_id || '',
      ownership_type_id: pet.ownership_type_id || '',
      coat_length_id: pet.coat_length_id || '',
      coat_type_id: pet.coat_type_id || '',
      grooming_cycle_id: pet.grooming_cycle_id || '',
      color_ids: toArray(pet.color_ids),
      allergy_ids: toArray(pet.allergy_ids),
      disease_history_ids: toArray(pet.disease_history_ids),
      symptom_tag_ids: toArray(pet.symptom_tag_ids),
      vaccination_ids: toArray(pet.vaccination_ids),
      temperament_ids: toArray(pet.temperament_ids),
      birth_date: pet.birth_date || '',
      weight_kg: pet.weight_kg == null ? '' : String(pet.weight_kg),
      microchip_no: pet.microchip_no || '',
      notes: pet.notes || '',
      intro_text: pet.intro_text || '',
    });
  }

  async function savePet() {
    if (!token) return;
    if (!petForm.name.trim()) {
      setMessage('Pet name is required.');
      return;
    }
    if (!petForm.pet_type_id) {
      setMessage('Pet type is required.');
      return;
    }

    const microchipOk = await checkMicrochip();
    if (!microchipOk) {
      setMessage('마이크로칩 번호 중복으로 저장할 수 없습니다.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const petTypeKey = petTypeById[petForm.pet_type_id];
      const payload = {
        name: petForm.name.trim(),
        species: petTypeKey === 'dog' || petTypeKey === 'cat' ? petTypeKey : 'other',
        pet_type_id: petForm.pet_type_id,
        breed_id: petForm.breed_id || null,
        gender_id: petForm.gender_id || null,
        neuter_status_id: petForm.neuter_status_id || null,
        life_stage_id: petForm.life_stage_id || null,
        body_size_id: petForm.body_size_id || null,
        country_id: petForm.country_id || null,
        medication_status_id: petForm.medication_status_id || null,
        weight_unit_id: petForm.weight_unit_id || null,
        health_condition_level_id: petForm.health_condition_level_id || null,
        activity_level_id: petForm.activity_level_id || null,
        diet_type_id: petForm.diet_type_id || null,
        living_style_id: petForm.living_style_id || null,
        ownership_type_id: petForm.ownership_type_id || null,
        coat_length_id: petForm.coat_length_id || null,
        coat_type_id: petForm.coat_type_id || null,
        grooming_cycle_id: petForm.grooming_cycle_id || null,
        color_ids: petForm.color_ids,
        allergy_ids: petForm.allergy_ids,
        disease_history_ids: petForm.disease_history_ids,
        symptom_tag_ids: petForm.symptom_tag_ids,
        vaccination_ids: petForm.vaccination_ids,
        temperament_ids: petForm.temperament_ids,
        birth_date: petForm.birth_date || null,
        weight_kg: petForm.weight_kg ? Number(petForm.weight_kg) : null,
        microchip_no: petForm.microchip_no || null,
        notes: petForm.notes || null,
        intro_text: petForm.intro_text || null,
      };

      if (!petForm.id) {
        await api('/api/v1/pets', { method: 'POST', body: JSON.stringify(payload) }, token);
      } else {
        await api(`/api/v1/pets/${petForm.id}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
      }

      setMessage('Pet saved.');
      setPetForm(emptyPetForm);
      setMicrochipMessage('');
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
      if (petForm.id === id) {
        setPetForm(emptyPetForm);
        setMicrochipMessage('');
      }
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  async function createBookingRequest() {
    if (!token) return;
    if (!bookingSupplierId.trim()) {
      setMessage('Supplier ID is required.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await api('/api/v1/bookings', {
        method: 'POST',
        body: JSON.stringify({
          supplier_id: bookingSupplierId.trim(),
          pet_id: bookingPetId || null,
          requested_date: bookingDate || null,
          requested_time: bookingTime || null,
          notes: bookingNotes || null,
        }),
      }, token);
      setMessage('Booking requested.');
      setBookingDate('');
      setBookingTime('');
      setBookingNotes('');
      const data = await api<{ bookings: Booking[] }>('/api/v1/bookings', {}, token);
      setBookings(data.bookings || []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Booking request failed');
    } finally {
      setLoading(false);
    }
  }

  async function shareApprovedCompletion(bookingId: string) {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      await api('/api/v1/feeds/from-completion', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId, visibility_scope: 'public' }),
      }, token);
      setMessage('Shared completion feed created.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Share failed');
    } finally {
      setLoading(false);
    }
  }

  async function updateAlbumCaption() {
    if (!token || !selectedMedia) return;
    setLoading(true);
    setMessage('');
    try {
      await api(`/api/v1/pet-album/${selectedMedia.id}`, {
        method: 'PUT',
        body: JSON.stringify({ caption: modalCaption }),
      }, token);
      setAlbumMedia((rows) => rows.map((x) => (x.id === selectedMedia.id ? { ...x, caption: modalCaption } : x)));
      setSelectedMedia((prev) => (prev ? { ...prev, caption: modalCaption } : prev));
      setMessage('Caption updated.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  async function deleteAlbumItem() {
    if (!token || !selectedMedia) return;
    if (!window.confirm('Delete this media?')) return;
    setLoading(true);
    setMessage('');
    try {
      await api(`/api/v1/pet-album/${selectedMedia.id}`, { method: 'DELETE' }, token);
      setAlbumMedia((rows) => rows.filter((x) => x.id !== selectedMedia.id));
      setSelectedMedia(null);
      setMessage('Media deleted.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  async function approveBookingMedia(action: 'approve' | 'reject') {
    if (!token || !selectedMedia?.source_id) return;
    setLoading(true);
    setMessage('');
    try {
      await api(`/api/v1/feeds/${selectedMedia.source_id}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          visibility_scope: action === 'approve' ? 'public' : undefined,
        }),
      }, token);
      const nextStatus = action === 'approve' ? 'active' : 'hidden';
      setAlbumMedia((rows) => rows.map((x) => (x.id === selectedMedia.id ? { ...x, status: nextStatus } : x)));
      setSelectedMedia((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      setMessage(action === 'approve' ? 'Booking media approved.' : 'Booking media rejected.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Approve/Reject failed');
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

  function renderSingleSelect(label: string, field: keyof PetForm, options: MasterItem[]) {
    return (
      <div>
        <label>{label}</label>
        <select value={(petForm[field] as string) || ''} onChange={(e) => setPetForm((f) => ({ ...f, [field]: e.target.value }))}>
          <option value="">Select</option>
          {options.map((x) => <option key={x.id} value={x.id}>{itemLabel(x)}</option>)}
        </select>
      </div>
    );
  }

  function renderMultiSelect(label: string, field: keyof Pick<PetForm, 'color_ids' | 'allergy_ids' | 'disease_history_ids' | 'symptom_tag_ids' | 'vaccination_ids' | 'temperament_ids'>, options: MasterItem[]) {
    return (
      <>
        <label>{label}</label>
        <div className="check-grid">
          {options.map((x) => (
            <label key={x.id} className="check-item">
              <input type="checkbox" checked={petForm[field].includes(x.id)} onChange={() => toggleMultiField(field, x.id)} />
              <span>{itemLabel(x)}</span>
            </label>
          ))}
        </div>
      </>
    );
  }

  if (!token) {
    return (
      <main className="app-wrap">
        <section className="panel login-panel">
          <h1>Guardian Web</h1>
          <p className="muted">My Pet Structured Profile</p>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <button disabled={loading} onClick={() => void login()}>Test Login</button>
          {message && <p className="notice">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-wrap">
      <header className="top-row">
        <h1>Guardian Profile + My Pets</h1>
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
              {countries.map((c) => <option key={c.id} value={c.id}>{c.ko_name || c.code}</option>)}
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
          {(master[CATEGORY_KEYS.interest] || []).map((i) => (
            <label key={i.id} className="check-item">
              <input type="checkbox" checked={profile.interests.includes(i.id)} onChange={() => toggleInterest(i.id)} />
              <span>{itemLabel(i)}</span>
            </label>
          ))}
        </div>
        <button disabled={loading} onClick={() => void saveProfile()}>Save Profile</button>
      </section>

      <section className="panel">
        <h2>My Pets</h2>
        <div className="pet-layout">
          <div className="pet-list">
            {pets.map((p) => (
              <div key={p.id} className="pet-card">
                <div>
                  <strong>{p.name}</strong>
                  <p className="muted">{p.pet_type_id ? itemLabel(masterById[p.pet_type_id]) : '-'} / {p.breed_id ? itemLabel(masterById[p.breed_id]) : '-'}</p>
                  <p className="muted">Gender: {p.gender_id ? itemLabel(masterById[p.gender_id]) : '-'}</p>
                  <p className="muted">Microchip: {p.microchip_no || '-'}</p>
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
              {renderSingleSelect('Pet Type *', 'pet_type_id', master[CATEGORY_KEYS.pet_type] || [])}
              {renderSingleSelect('Breed', 'breed_id', filteredBreeds)}
              {renderSingleSelect('Gender', 'gender_id', master[CATEGORY_KEYS.pet_gender] || [])}
              {renderSingleSelect('Neutered Status', 'neuter_status_id', master[CATEGORY_KEYS.neuter_status] || [])}
              {renderSingleSelect('Life Stage', 'life_stage_id', master[CATEGORY_KEYS.life_stage] || [])}
              {renderSingleSelect('Body Size', 'body_size_id', master[CATEGORY_KEYS.body_size] || [])}
              {renderSingleSelect('Country', 'country_id', countries.map((c) => ({ id: c.id, key: c.code, ko_name: c.ko_name })))}
              {renderSingleSelect('Medication Status', 'medication_status_id', master[CATEGORY_KEYS.medication_status] || [])}
              {renderSingleSelect('Weight Unit', 'weight_unit_id', master[CATEGORY_KEYS.weight_unit] || [])}
              {renderSingleSelect('Health Condition', 'health_condition_level_id', master[CATEGORY_KEYS.health_condition_level] || [])}
              {renderSingleSelect('Activity Level', 'activity_level_id', master[CATEGORY_KEYS.activity_level] || [])}
              {renderSingleSelect('Diet Type', 'diet_type_id', master[CATEGORY_KEYS.diet_type] || [])}
              {renderSingleSelect('Living Style', 'living_style_id', master[CATEGORY_KEYS.living_style] || [])}
              {renderSingleSelect('Ownership Type', 'ownership_type_id', master[CATEGORY_KEYS.ownership_type] || [])}
              {renderSingleSelect('Coat Length', 'coat_length_id', master[CATEGORY_KEYS.coat_length] || [])}
              {renderSingleSelect('Coat Type', 'coat_type_id', master[CATEGORY_KEYS.coat_type] || [])}
              {renderSingleSelect('Grooming Cycle', 'grooming_cycle_id', master[CATEGORY_KEYS.grooming_cycle] || [])}
              <div>
                <label>Birth Date</label>
                <input type="date" value={petForm.birth_date} onChange={(e) => setPetForm((f) => ({ ...f, birth_date: e.target.value }))} />
              </div>
              <div>
                <label>Weight</label>
                <input type="number" step="0.1" value={petForm.weight_kg} onChange={(e) => setPetForm((f) => ({ ...f, weight_kg: e.target.value }))} />
              </div>
              <div>
                <label>Microchip Number (Unique)</label>
                <input value={petForm.microchip_no} onChange={(e) => setPetForm((f) => ({ ...f, microchip_no: e.target.value }))} onBlur={() => void checkMicrochip()} />
                {microchipMessage && <p className="muted">{microchipMessage}</p>}
              </div>
            </div>

            {renderMultiSelect('Primary Color', 'color_ids', master[CATEGORY_KEYS.pet_color] || [])}
            {renderMultiSelect('Allergy', 'allergy_ids', master[CATEGORY_KEYS.allergy_type] || [])}
            {renderMultiSelect('Disease History', 'disease_history_ids', master[CATEGORY_KEYS.disease_type] || [])}
            {renderMultiSelect('Symptom Tag', 'symptom_tag_ids', master[CATEGORY_KEYS.symptom_type] || [])}
            {renderMultiSelect('Vaccination Status', 'vaccination_ids', master[CATEGORY_KEYS.vaccination_type] || [])}
            {renderMultiSelect('Temperament', 'temperament_ids', master[CATEGORY_KEYS.temperament_type] || [])}

            <label>Notes</label>
            <textarea rows={2} value={petForm.notes} onChange={(e) => setPetForm((f) => ({ ...f, notes: e.target.value }))} />
            <label>Intro</label>
            <textarea rows={2} value={petForm.intro_text} onChange={(e) => setPetForm((f) => ({ ...f, intro_text: e.target.value }))} />

            <div className="row">
              <button disabled={loading} onClick={() => void savePet()}>{petForm.id ? 'Update Pet' : 'Create Pet'}</button>
              {petForm.id && <button onClick={() => { setPetForm(emptyPetForm); setMicrochipMessage(''); }}>Cancel Edit</button>}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Booking Request (Guardian)</h2>
        <div className="grid2">
          <div>
            <label>Supplier User ID *</label>
            <input value={bookingSupplierId} onChange={(e) => setBookingSupplierId(e.target.value)} placeholder="provider user id" />
          </div>
          <div>
            <label>Pet</label>
            <select value={bookingPetId} onChange={(e) => setBookingPetId(e.target.value)}>
              <option value="">Select pet</option>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label>Requested Date</label>
            <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
          </div>
          <div>
            <label>Requested Time</label>
            <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
          </div>
        </div>
        <label>Notes</label>
        <textarea rows={2} value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} />
        <div className="row">
          <button disabled={loading} onClick={() => void createBookingRequest()}>Create Booking</button>
        </div>
        <div className="pet-list">
          {bookings.map((b) => (
            <div key={b.id} className="pet-card">
              <p className="muted">Booking: {b.id}</p>
              <p className="muted">Status: {b.status}</p>
              <p className="muted">Pet: {b.pet_id || '-'}</p>
              <p className="muted">Supplier: {b.supplier_id}</p>
              <div className="row">
                <button onClick={() => void shareApprovedCompletion(b.id)}>Share Approved Completion</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Gallery</h2>
        <div className="row">
          <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)}>
            <option value="">Select pet</option>
            {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={albumSourceType} onChange={(e) => setAlbumSourceType(e.target.value)}>
            <option value="">All Source</option>
            <option value="feed">Feed</option>
            <option value="booking_completed">Booking</option>
            <option value="health_record">Health</option>
            <option value="profile">Profile</option>
            <option value="manual_upload">Manual</option>
          </select>
          <select value={albumMediaType} onChange={(e) => setAlbumMediaType(e.target.value)}>
            <option value="">Image + Video</option>
            <option value="image">Image Only</option>
            <option value="video">Video Only</option>
          </select>
          <select value={albumSort} onChange={(e) => setAlbumSort(e.target.value as 'latest' | 'oldest')}>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        {albumLoading && <p className="muted">Loading gallery...</p>}
        {!albumLoading && (
          <div className="album-grid">
            {albumMedia.map((m) => (
              <button
                key={m.id}
                className="album-tile"
                onClick={() => {
                  setSelectedMedia(m);
                  setModalCaption(m.caption || '');
                }}
              >
                <img src={m.thumbnail_url || m.media_url} alt={m.caption || m.source_type} />
                <span className="badge">{m.source_type}</span>
                <span className="status">{m.status}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedMedia && (
        <div className="modal-backdrop" onClick={() => setSelectedMedia(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-media-wrap">
              <img className="modal-media" src={selectedMedia.media_url} alt={selectedMedia.caption || selectedMedia.source_type} />
            </div>
            <div className="modal-meta">
              <p><strong>Source:</strong> {selectedMedia.source_type}</p>
              <p><strong>Status:</strong> {selectedMedia.status}</p>
              <p><strong>Visibility:</strong> {selectedMedia.visibility_scope}</p>
              <p><strong>Created:</strong> {selectedMedia.created_at}</p>
              <label>Caption</label>
              <textarea rows={3} value={modalCaption} onChange={(e) => setModalCaption(e.target.value)} />
              <div className="row">
                <button onClick={() => void updateAlbumCaption()}>Save Caption</button>
                <button className="danger" onClick={() => void deleteAlbumItem()}>Delete</button>
              </div>
              {selectedMedia.source_type === 'booking_completed' && selectedMedia.status === 'pending' && (
                <div className="row">
                  <button onClick={() => void approveBookingMedia('approve')}>Approve</button>
                  <button className="danger" onClick={() => void approveBookingMedia('reject')}>Reject</button>
                </div>
              )}
              <div className="row">
                <button onClick={() => setSelectedMedia(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
