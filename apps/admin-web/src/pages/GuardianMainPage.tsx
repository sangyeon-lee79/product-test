import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Booking, type FeedPost, type FriendRequest, type MasterItem, type Pet } from '../lib/api';

type FeedTab = 'all' | 'friends';
type Mode = 'create' | 'edit';

type Option = { id: string; label: string; parentId?: string | null; metadata?: Record<string, unknown> };

type PetForm = {
  name: string;
  microchip_no: string;
  notes: string;
  pet_type_id: string;
  breed_id: string;
  gender_id: string;
  neuter_status_id: string;
  life_stage_id: string;
  body_size_id: string;
  country_id: string;
  allergy_ids: string[];
  disease_history_ids: string[];
  symptom_tag_ids: string[];
  vaccination_ids: string[];
  medication_status_id: string;
  weight_unit_id: string;
  health_condition_level_id: string;
  activity_level_id: string;
  diet_type_id: string;
  temperament_ids: string[];
  living_style_id: string;
  ownership_type_id: string;
  coat_length_id: string;
  coat_type_id: string;
  grooming_cycle_id: string;
  color_ids: string[];
};

type FeedCompose = {
  feed_type: 'guardian_post' | 'health_update' | 'pet_milestone' | 'supplier_story';
  visibility_scope: 'public' | 'friends_only' | 'private' | 'connected_only' | 'booking_related_only';
  caption: string;
  tagsText: string;
  pet_id: string;
  booking_id: string;
  supplier_id: string;
};

const DEFAULT_PET_FORM: PetForm = {
  name: '',
  microchip_no: '',
  notes: '',
  pet_type_id: '',
  breed_id: '',
  gender_id: '',
  neuter_status_id: '',
  life_stage_id: '',
  body_size_id: '',
  country_id: '',
  allergy_ids: [],
  disease_history_ids: [],
  symptom_tag_ids: [],
  vaccination_ids: [],
  medication_status_id: '',
  weight_unit_id: '',
  health_condition_level_id: '',
  activity_level_id: '',
  diet_type_id: '',
  temperament_ids: [],
  living_style_id: '',
  ownership_type_id: '',
  coat_length_id: '',
  coat_type_id: '',
  grooming_cycle_id: '',
  color_ids: [],
};

const DEFAULT_FEED_COMPOSE: FeedCompose = {
  feed_type: 'guardian_post',
  visibility_scope: 'public',
  caption: '',
  tagsText: '',
  pet_id: '',
  booking_id: '',
  supplier_id: '',
};

const CATEGORY_KEYS: Record<string, string[]> = {
  pet_type: ['master.pet_type', 'pet_type'],
  pet_breed: ['master.pet_breed', 'pet_breed', 'breed'],
  pet_gender: ['master.pet_gender', 'pet_gender', 'gender'],
  neuter_status: ['master.neuter_status', 'neuter_status'],
  life_stage: ['master.life_stage', 'life_stage'],
  body_size: ['master.body_size', 'body_size'],
  pet_color: ['master.pet_color', 'pet_color'],
  country: ['master.country', 'country'],
  allergy_type: ['master.allergy_type', 'allergy_type'],
  disease_type: ['master.disease_type', 'disease_type'],
  symptom_type: ['master.symptom_type', 'symptom_type'],
  vaccination_type: ['master.vaccination_type', 'vaccination_type'],
  medication_status: ['master.medication_status', 'medication_status'],
  weight_unit: ['master.weight_unit', 'weight_unit'],
  health_condition_level: ['master.health_condition_level', 'health_condition_level'],
  activity_level: ['master.activity_level', 'activity_level'],
  diet_type: ['master.diet_type', 'diet_type'],
  temperament_type: ['master.temperament_type', 'temperament_type'],
  living_style: ['master.living_style', 'living_style'],
  ownership_type: ['master.ownership_type', 'ownership_type'],
  coat_length: ['master.coat_length', 'coat_length'],
  coat_type: ['master.coat_type', 'coat_type'],
  grooming_cycle: ['master.grooming_cycle', 'grooming_cycle'],
};

function toArray(raw: string[] | string | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string') as string[];
  } catch {
    return [];
  }
}

function toOption(items: MasterItem[]): Option[] {
  return items.map((item) => {
    let metadata: Record<string, unknown> = {};
    try {
      metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') as Record<string, unknown> : {};
    } catch {
      metadata = {};
    }
    return {
      id: item.id,
      label: item.ko_name || item.ko || item.key,
      parentId: item.parent_id,
      metadata,
    };
  });
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function labelOf(options: Option[], id?: string | null): string {
  if (!id) return '-';
  return options.find((o) => o.id === id)?.label || id;
}

async function loadCategoryItems(candidates: string[]): Promise<MasterItem[]> {
  for (const key of candidates) {
    try {
      const rows = await api.master.public.items(key);
      if (rows.length > 0) return rows;
    } catch {
      // try next candidate
    }
  }
  return [];
}

export default function GuardianMainPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [petMode, setPetMode] = useState<Mode>('create');
  const [petForm, setPetForm] = useState<PetForm>(DEFAULT_PET_FORM);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [feedCompose, setFeedCompose] = useState<FeedCompose>(DEFAULT_FEED_COMPOSE);

  const [friendCount, setFriendCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  const [optPetType, setOptPetType] = useState<Option[]>([]);
  const [optBreed, setOptBreed] = useState<Option[]>([]);
  const [optGender, setOptGender] = useState<Option[]>([]);
  const [optNeuter, setOptNeuter] = useState<Option[]>([]);
  const [optLifeStage, setOptLifeStage] = useState<Option[]>([]);
  const [optBodySize, setOptBodySize] = useState<Option[]>([]);
  const [optColor, setOptColor] = useState<Option[]>([]);
  const [optCountry, setOptCountry] = useState<Option[]>([]);
  const [optAllergy, setOptAllergy] = useState<Option[]>([]);
  const [optDisease, setOptDisease] = useState<Option[]>([]);
  const [optSymptom, setOptSymptom] = useState<Option[]>([]);
  const [optVaccination, setOptVaccination] = useState<Option[]>([]);
  const [optMedication, setOptMedication] = useState<Option[]>([]);
  const [optWeightUnit, setOptWeightUnit] = useState<Option[]>([]);
  const [optHealthLevel, setOptHealthLevel] = useState<Option[]>([]);
  const [optActivity, setOptActivity] = useState<Option[]>([]);
  const [optDiet, setOptDiet] = useState<Option[]>([]);
  const [optTemperament, setOptTemperament] = useState<Option[]>([]);
  const [optLivingStyle, setOptLivingStyle] = useState<Option[]>([]);
  const [optOwnership, setOptOwnership] = useState<Option[]>([]);
  const [optCoatLength, setOptCoatLength] = useState<Option[]>([]);
  const [optCoatType, setOptCoatType] = useState<Option[]>([]);
  const [optGrooming, setOptGrooming] = useState<Option[]>([]);

  const selectedPet = useMemo(() => pets.find((p) => p.id === selectedPetId) || pets[0] || null, [pets, selectedPetId]);

  const breedOptionsFiltered = useMemo(() => {
    if (!petForm.pet_type_id) return optBreed;
    return optBreed.filter((b) => {
      const byParent = b.parentId && b.parentId === petForm.pet_type_id;
      const byMeta = b.metadata && String(b.metadata.pet_type_id || '') === petForm.pet_type_id;
      return byParent || byMeta || (!b.parentId && !b.metadata?.pet_type_id);
    });
  }, [optBreed, petForm.pet_type_id]);

  const latestBooking = useMemo(() => {
    if (!bookings.length) return null;
    const rows = selectedPet ? bookings.filter((b) => !b.pet_id || b.pet_id === selectedPet.id) : bookings;
    const target = rows.length ? rows : bookings;
    return [...target].sort((a, b) => (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))[0] || null;
  }, [bookings, selectedPet]);

  const pendingApprovalsCount = useMemo(
    () => bookings.filter((b) => b.status === 'publish_requested').length,
    [bookings],
  );

  const latestHealthLabel = useMemo(
    () => labelOf(optHealthLevel, selectedPet?.health_condition_level_id),
    [optHealthLevel, selectedPet?.health_condition_level_id],
  );

  async function loadAll(tab = feedTab) {
    setLoading(true);
    setError('');
    try {
      const [
        petsRes,
        bookingsRes,
        friendsRes,
        requestsRes,
        feedsRes,
        petTypeRows,
        breedRows,
        genderRows,
        neuterRows,
        lifeStageRows,
        bodySizeRows,
        colorRows,
        countryRows,
        allergyRows,
        diseaseRows,
        symptomRows,
        vaccinationRows,
        medicationRows,
        weightRows,
        healthRows,
        activityRows,
        dietRows,
        temperamentRows,
        livingRows,
        ownershipRows,
        coatLengthRows,
        coatTypeRows,
        groomingRows,
      ] = await Promise.all([
        api.pets.list(),
        api.bookings.list(),
        api.friends.list(),
        api.friends.requests.list('inbox'),
        api.feeds.list({ tab, limit: 30 }),
        loadCategoryItems(CATEGORY_KEYS.pet_type),
        loadCategoryItems(CATEGORY_KEYS.pet_breed),
        loadCategoryItems(CATEGORY_KEYS.pet_gender),
        loadCategoryItems(CATEGORY_KEYS.neuter_status),
        loadCategoryItems(CATEGORY_KEYS.life_stage),
        loadCategoryItems(CATEGORY_KEYS.body_size),
        loadCategoryItems(CATEGORY_KEYS.pet_color),
        loadCategoryItems(CATEGORY_KEYS.country),
        loadCategoryItems(CATEGORY_KEYS.allergy_type),
        loadCategoryItems(CATEGORY_KEYS.disease_type),
        loadCategoryItems(CATEGORY_KEYS.symptom_type),
        loadCategoryItems(CATEGORY_KEYS.vaccination_type),
        loadCategoryItems(CATEGORY_KEYS.medication_status),
        loadCategoryItems(CATEGORY_KEYS.weight_unit),
        loadCategoryItems(CATEGORY_KEYS.health_condition_level),
        loadCategoryItems(CATEGORY_KEYS.activity_level),
        loadCategoryItems(CATEGORY_KEYS.diet_type),
        loadCategoryItems(CATEGORY_KEYS.temperament_type),
        loadCategoryItems(CATEGORY_KEYS.living_style),
        loadCategoryItems(CATEGORY_KEYS.ownership_type),
        loadCategoryItems(CATEGORY_KEYS.coat_length),
        loadCategoryItems(CATEGORY_KEYS.coat_type),
        loadCategoryItems(CATEGORY_KEYS.grooming_cycle),
      ]);

      setPets(petsRes.pets || []);
      if (!selectedPetId && (petsRes.pets || []).length > 0) setSelectedPetId((petsRes.pets || [])[0].id);
      setBookings(bookingsRes.bookings || []);
      setFriendCount((friendsRes.friends || []).length);
      setPendingRequests((requestsRes.requests || []).filter((r) => r.status === 'request_sent'));
      setFeeds(feedsRes.feeds || []);

      setOptPetType(toOption(petTypeRows));
      setOptBreed(toOption(breedRows));
      setOptGender(toOption(genderRows));
      setOptNeuter(toOption(neuterRows));
      setOptLifeStage(toOption(lifeStageRows));
      setOptBodySize(toOption(bodySizeRows));
      setOptColor(toOption(colorRows));
      setOptCountry(toOption(countryRows));
      setOptAllergy(toOption(allergyRows));
      setOptDisease(toOption(diseaseRows));
      setOptSymptom(toOption(symptomRows));
      setOptVaccination(toOption(vaccinationRows));
      setOptMedication(toOption(medicationRows));
      setOptWeightUnit(toOption(weightRows));
      setOptHealthLevel(toOption(healthRows));
      setOptActivity(toOption(activityRows));
      setOptDiet(toOption(dietRows));
      setOptTemperament(toOption(temperamentRows));
      setOptLivingStyle(toOption(livingRows));
      setOptOwnership(toOption(ownershipRows));
      setOptCoatLength(toOption(coatLengthRows));
      setOptCoatType(toOption(coatTypeRows));
      setOptGrooming(toOption(groomingRows));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Guardian 화면 로딩 실패');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreatePet() {
    setPetMode('create');
    setPetForm(DEFAULT_PET_FORM);
    setPetModalOpen(true);
  }

  async function openEditPet(petId: string) {
    try {
      const res = await api.pets.detail(petId);
      const p = res.pet;
      setPetMode('edit');
      setActivePet(p);
      setPetForm({
        name: p.name || '',
        microchip_no: p.microchip_no || '',
        notes: p.notes || '',
        pet_type_id: p.pet_type_id || '',
        breed_id: p.breed_id || '',
        gender_id: p.gender_id || '',
        neuter_status_id: p.neuter_status_id || '',
        life_stage_id: p.life_stage_id || '',
        body_size_id: p.body_size_id || '',
        country_id: p.country_id || '',
        allergy_ids: toArray(p.allergy_ids),
        disease_history_ids: toArray(p.disease_history_ids),
        symptom_tag_ids: toArray(p.symptom_tag_ids),
        vaccination_ids: toArray(p.vaccination_ids),
        medication_status_id: p.medication_status_id || '',
        weight_unit_id: p.weight_unit_id || '',
        health_condition_level_id: p.health_condition_level_id || '',
        activity_level_id: p.activity_level_id || '',
        diet_type_id: p.diet_type_id || '',
        temperament_ids: toArray(p.temperament_ids),
        living_style_id: p.living_style_id || '',
        ownership_type_id: p.ownership_type_id || '',
        coat_length_id: p.coat_length_id || '',
        coat_type_id: p.coat_type_id || '',
        grooming_cycle_id: p.grooming_cycle_id || '',
        color_ids: toArray(p.color_ids),
      });
      setPetModalOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '펫 상세 조회 실패');
    }
  }

  async function savePet() {
    if (!petForm.name.trim()) {
      setError('반려동물 이름은 필수입니다.');
      return;
    }
    if (!petForm.pet_type_id) {
      setError('펫 종류는 필수입니다.');
      return;
    }
    if (petForm.microchip_no.trim()) {
      try {
        const dup = await api.pets.checkMicrochip(petForm.microchip_no.trim(), petMode === 'edit' ? activePet?.id : undefined);
        if (!dup.available) {
          setError(dup.reason || '이미 등록된 마이크로칩 번호입니다.');
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '마이크로칩 중복 확인 실패');
        return;
      }
    }

    const payload = {
      ...petForm,
      microchip_no: petForm.microchip_no.trim() || null,
      notes: petForm.notes.trim() || null,
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
    };

    try {
      if (petMode === 'create') {
        await api.pets.create(payload);
      } else if (activePet?.id) {
        await api.pets.update(activePet.id, payload);
      }
      setPetModalOpen(false);
      setActivePet(null);
      setPetForm(DEFAULT_PET_FORM);
      await loadAll(feedTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : '펫 저장 실패');
    }
  }

  async function removePet(id: string) {
    if (!confirm('이 반려동물을 삭제하시겠습니까?')) return;
    try {
      await api.pets.remove(id);
      if (selectedPetId === id) setSelectedPetId('');
      await loadAll(feedTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : '펫 삭제 실패');
    }
  }

  async function createFeedPost() {
    if (!feedCompose.caption.trim()) {
      setError('피드 내용(caption)을 입력해주세요.');
      return;
    }
    try {
      await api.feeds.create({
        feed_type: feedCompose.feed_type,
        visibility_scope: feedCompose.visibility_scope,
        caption: feedCompose.caption.trim(),
        tags: feedCompose.tagsText.split(',').map((v) => v.trim()).filter(Boolean),
        pet_id: feedCompose.pet_id || null,
        booking_id: feedCompose.booking_id || null,
        supplier_id: feedCompose.supplier_id || null,
      });
      setFeedCompose(DEFAULT_FEED_COMPOSE);
      await loadAll(feedTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : '피드 등록 실패');
    }
  }

  function renderSelect(label: string, value: string, options: Option[], onChange: (v: string) => void, required = false) {
    return (
      <div className="form-group">
        <label className="form-label">{label}{required ? ' *' : ''}</label>
        <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">선택</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  function renderMultiSelect(label: string, value: string[], options: Option[], onChange: (next: string[]) => void) {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <select
          className="form-select"
          multiple
          value={value}
          onChange={(e) => {
            const next = Array.from(e.target.selectedOptions).map((o) => o.value);
            onChange(next);
          }}
          size={Math.min(6, Math.max(3, options.length || 3))}
        >
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="guardian-page">
      <section className="guardian-top">
        <div className="guardian-hero card">
          <div className="card-body">
            <p className="hero-eyebrow">Guardian SNS Home</p>
            <h2>반려동물 기반 SNS + 기록 홈</h2>
            <p className="text-muted">펫 등록 상태에 따라 피드/예약/건강 데이터가 연동됩니다.</p>
            <div className="hero-actions mt-3">
              <button className="btn btn-primary" onClick={openCreatePet}>+ Add Pet</button>
              <Link className="btn btn-secondary" to="/">Public Feed</Link>
            </div>
          </div>
        </div>

        <div className="guardian-summary-grid">
          <article className="card"><div className="card-body"><p className="text-sm text-muted">등록된 반려동물</p><h3>{pets.length}</h3></div></article>
          <article className="card"><div className="card-body"><p className="text-sm text-muted">최근 건강 상태</p><h3>{latestHealthLabel}</h3></div></article>
          <article className="card"><div className="card-body"><p className="text-sm text-muted">최근 예약 상태</p><h3>{latestBooking?.status || '-'}</h3></div></article>
          <article className="card"><div className="card-body"><p className="text-sm text-muted">대기중 완료게시 승인</p><h3>{pendingApprovalsCount}</h3></div></article>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : (
        <section className="guardian-layout">
          <main className="guardian-main-feed">
            {pets.length === 0 && (
              <div className="card">
                <div className="card-body">
                  <h3>첫 반려동물을 등록해주세요</h3>
                  <p className="text-muted">등록된 펫이 없으면 피드/건강/예약 연결이 제한됩니다.</p>
                  <button className="btn btn-primary mt-2" onClick={openCreatePet}>Register your first pet</button>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header"><div className="card-title">Create Feed Post</div></div>
              <div className="card-body">
                <div className="form-row col3">
                  <div className="form-group">
                    <label className="form-label">Feed Type</label>
                    <select className="form-select" value={feedCompose.feed_type} onChange={(e) => setFeedCompose((p) => ({ ...p, feed_type: e.target.value as FeedCompose['feed_type'] }))}>
                      <option value="guardian_post">guardian_post</option>
                      <option value="health_update">health_update</option>
                      <option value="pet_milestone">pet_milestone</option>
                      <option value="supplier_story">supplier_story</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Visibility</label>
                    <select className="form-select" value={feedCompose.visibility_scope} onChange={(e) => setFeedCompose((p) => ({ ...p, visibility_scope: e.target.value as FeedCompose['visibility_scope'] }))}>
                      <option value="public">public</option>
                      <option value="friends_only">friends_only</option>
                      <option value="private">private</option>
                      <option value="connected_only">connected_only</option>
                      <option value="booking_related_only">booking_related_only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Linked Pet</label>
                    <select className="form-select" value={feedCompose.pet_id} onChange={(e) => setFeedCompose((p) => ({ ...p, pet_id: e.target.value }))}>
                      <option value="">None</option>
                      {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row col2">
                  <div className="form-group">
                    <label className="form-label">booking_id (optional)</label>
                    <input className="form-input" value={feedCompose.booking_id} onChange={(e) => setFeedCompose((p) => ({ ...p, booking_id: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">supplier_id (optional)</label>
                    <input className="form-input" value={feedCompose.supplier_id} onChange={(e) => setFeedCompose((p) => ({ ...p, supplier_id: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Caption</label>
                  <textarea className="form-textarea" value={feedCompose.caption} onChange={(e) => setFeedCompose((p) => ({ ...p, caption: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" value={feedCompose.tagsText} onChange={(e) => setFeedCompose((p) => ({ ...p, tagsText: e.target.value }))} />
                </div>
                <button className="btn btn-primary" onClick={createFeedPost}>Post</button>
              </div>
            </div>

            <div className="feed-toolbar card">
              <div className="feed-tabs">
                <button className={`feed-tab ${feedTab === 'all' ? 'active' : ''}`} onClick={() => { setFeedTab('all'); loadAll('all'); }}>All</button>
                <button className={`feed-tab ${feedTab === 'friends' ? 'active' : ''}`} onClick={() => { setFeedTab('friends'); loadAll('friends'); }}>Friends Feed</button>
              </div>
            </div>

            <div className="sns-feed-list">
              {feeds.map((f) => (
                <article key={f.id} className="sns-card">
                  <div className="sns-card-header">
                    <div>
                      <p className="sns-meta">{f.feed_type}</p>
                      <h3>{f.author_email || '-'}</h3>
                      <p className="text-sm text-muted">{formatDate(f.created_at)}</p>
                    </div>
                    <div className="sns-badges">
                      <span className="badge badge-blue">{f.business_category_ko || f.business_category_key || '-'}</span>
                      <span className="badge badge-gray">{f.pet_type_ko || f.pet_type_key || '-'}</span>
                      <span className="badge badge-green">{f.visibility_scope}</span>
                    </div>
                  </div>
                  {f.pet_name && <p className="sns-pet">Pet: {f.pet_name}</p>}
                  {f.caption && <p className="sns-caption">{f.caption}</p>}
                  <div className="sns-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => api.feeds.like(f.id).then(() => loadAll(feedTab)).catch((e) => setError(e instanceof Error ? e.message : 'like 실패'))}>
                      Like ({f.like_count || 0})
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => api.feeds.comments.list(f.id).then(() => null).catch((e) => setError(e instanceof Error ? e.message : 'comment 실패'))}>
                      Comment ({f.comment_count || 0})
                    </button>
                  </div>
                </article>
              ))}
              {feeds.length === 0 && <div className="card"><div className="card-body">표시할 피드가 없습니다.</div></div>}
            </div>
          </main>

          <aside className="guardian-side">
            <div className="card">
              <div className="card-header"><div className="card-title">My Pets</div></div>
              <div className="card-body">
                <div className="td-actions mb-4">
                  <button className="btn btn-primary btn-sm" onClick={openCreatePet}>+ Add Pet</button>
                </div>
                <div className="guardian-pet-list">
                  {pets.map((p) => (
                    <div key={p.id} className={`guardian-pet-item ${selectedPet?.id === p.id ? 'active' : ''}`}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPetId(p.id)}>{p.name}</button>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditPet(p.id)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => removePet(p.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedPet && (
                  <div className="guardian-pet-detail mt-3">
                    <p><strong>기본정보</strong></p>
                    <p className="text-sm">Type: {labelOf(optPetType, selectedPet.pet_type_id)}</p>
                    <p className="text-sm">Breed: {labelOf(optBreed, selectedPet.breed_id)}</p>
                    <p className="text-sm">Gender: {labelOf(optGender, selectedPet.gender_id)}</p>
                    <p className="text-sm">Health: {labelOf(optHealthLevel, selectedPet.health_condition_level_id)}</p>
                    <p className="text-sm">Microchip: {selectedPet.microchip_no || '-'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Health / Booking Summary</div></div>
              <div className="card-body">
                <p className="text-sm">Latest Booking: <strong>{latestBooking?.status || '-'}</strong></p>
                <p className="text-sm">Latest Booking Time: {formatDate(latestBooking?.updated_at)}</p>
                <p className="text-sm">Pending Completion Approvals: <strong>{pendingApprovalsCount}</strong></p>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Connections</div></div>
              <div className="card-body">
                <p className="text-sm">Connected Suppliers/Friends: <strong>{friendCount}</strong></p>
                <p className="text-sm">Pending Friend Requests: <strong>{pendingRequests.length}</strong></p>
              </div>
            </div>
          </aside>
        </section>
      )}

      {petModalOpen && (
        <div className="modal-overlay">
          <div className="modal guardian-pet-modal">
            <div className="modal-header">
              <h3 className="modal-title">{petMode === 'create' ? 'Add Pet' : 'Edit Pet'}</h3>
              <button className="modal-close" onClick={() => { setPetModalOpen(false); setActivePet(null); }}>&times;</button>
            </div>
            <div className="modal-body guardian-modal-body">
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">이름 *</label>
                  <input className="form-input" value={petForm.name} onChange={(e) => setPetForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">마이크로칩 번호</label>
                  <input className="form-input" value={petForm.microchip_no} onChange={(e) => setPetForm((p) => ({ ...p, microchip_no: e.target.value }))} />
                </div>
              </div>

              <div className="form-row col3">
                {renderSelect('펫 종류', petForm.pet_type_id, optPetType, (v) => setPetForm((p) => ({ ...p, pet_type_id: v, breed_id: '' })), true)}
                {renderSelect('품종', petForm.breed_id, breedOptionsFiltered, (v) => setPetForm((p) => ({ ...p, breed_id: v })))}
                {renderSelect('성별', petForm.gender_id, optGender, (v) => setPetForm((p) => ({ ...p, gender_id: v })))}
              </div>

              <div className="form-row col3">
                {renderSelect('중성화 여부', petForm.neuter_status_id, optNeuter, (v) => setPetForm((p) => ({ ...p, neuter_status_id: v })))}
                {renderSelect('생애 단계', petForm.life_stage_id, optLifeStage, (v) => setPetForm((p) => ({ ...p, life_stage_id: v })))}
                {renderSelect('체형/크기', petForm.body_size_id, optBodySize, (v) => setPetForm((p) => ({ ...p, body_size_id: v })))}
              </div>

              <div className="form-row col3">
                {renderSelect('국가', petForm.country_id, optCountry, (v) => setPetForm((p) => ({ ...p, country_id: v })))}
                {renderSelect('복용 약물 상태', petForm.medication_status_id, optMedication, (v) => setPetForm((p) => ({ ...p, medication_status_id: v })))}
                {renderSelect('체중 단위', petForm.weight_unit_id, optWeightUnit, (v) => setPetForm((p) => ({ ...p, weight_unit_id: v })))}
              </div>

              <div className="form-row col3">
                {renderSelect('건강 상태', petForm.health_condition_level_id, optHealthLevel, (v) => setPetForm((p) => ({ ...p, health_condition_level_id: v })))}
                {renderSelect('활동량', petForm.activity_level_id, optActivity, (v) => setPetForm((p) => ({ ...p, activity_level_id: v })))}
                {renderSelect('식사 유형', petForm.diet_type_id, optDiet, (v) => setPetForm((p) => ({ ...p, diet_type_id: v })))}
              </div>

              <div className="form-row col3">
                {renderSelect('실내/실외', petForm.living_style_id, optLivingStyle, (v) => setPetForm((p) => ({ ...p, living_style_id: v })))}
                {renderSelect('보호 상태', petForm.ownership_type_id, optOwnership, (v) => setPetForm((p) => ({ ...p, ownership_type_id: v })))}
                {renderSelect('털 길이', petForm.coat_length_id, optCoatLength, (v) => setPetForm((p) => ({ ...p, coat_length_id: v })))}
              </div>

              <div className="form-row col2">
                {renderSelect('털 타입', petForm.coat_type_id, optCoatType, (v) => setPetForm((p) => ({ ...p, coat_type_id: v })))}
                {renderSelect('미용 주기', petForm.grooming_cycle_id, optGrooming, (v) => setPetForm((p) => ({ ...p, grooming_cycle_id: v })))}
              </div>

              <div className="form-row col2">
                {renderMultiSelect('대표 색상', petForm.color_ids, optColor, (next) => setPetForm((p) => ({ ...p, color_ids: next })))}
                {renderMultiSelect('알러지', petForm.allergy_ids, optAllergy, (next) => setPetForm((p) => ({ ...p, allergy_ids: next })))}
              </div>

              <div className="form-row col2">
                {renderMultiSelect('질병 이력', petForm.disease_history_ids, optDisease, (next) => setPetForm((p) => ({ ...p, disease_history_ids: next })))}
                {renderMultiSelect('증상 태그', petForm.symptom_tag_ids, optSymptom, (next) => setPetForm((p) => ({ ...p, symptom_tag_ids: next })))}
              </div>

              <div className="form-row col2">
                {renderMultiSelect('예방접종', petForm.vaccination_ids, optVaccination, (next) => setPetForm((p) => ({ ...p, vaccination_ids: next })))}
                {renderMultiSelect('성격/기질', petForm.temperament_ids, optTemperament, (next) => setPetForm((p) => ({ ...p, temperament_ids: next })))}
              </div>

              <div className="form-group">
                <label className="form-label">메모</label>
                <textarea className="form-textarea" value={petForm.notes} onChange={(e) => setPetForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPetModalOpen(false)}>취소</button>
              <button className="btn btn-primary" onClick={savePet}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
