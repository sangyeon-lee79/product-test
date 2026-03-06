import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Booking, type FeedPost, type FriendRequest, type MasterItem, type Pet, type PetAlbumMedia, type PetWeightLog, type WeightSummary } from '../lib/api';
import { useT } from '../lib/i18n';
import { getStoredRole } from '../lib/auth';
import PetGalleryPanel from '../components/PetGalleryPanel';

type FeedTab = 'all' | 'friends';
type Mode = 'create' | 'edit';
type PetProfileTab = 'timeline' | 'health' | 'services' | 'gallery' | 'profile';
type WeightRange = '1m' | '3m' | '6m' | '1y' | 'all';

type Option = { id: string; label: string; parentId?: string | null; metadata?: Record<string, unknown> };

type PetForm = {
  name: string;
  microchip_no: string;
  birthday: string;
  current_weight: string;
  current_weight_measured_at: string;
  current_weight_notes: string;
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
  birthday: '',
  current_weight: '',
  current_weight_measured_at: '',
  current_weight_notes: '',
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

function formatDate(value?: string | null, fallback = '-'): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function labelOf(options: Option[], id: string | null | undefined, fallback: string): string {
  if (!id) return fallback;
  return options.find((o) => o.id === id)?.label || id;
}

function feedTypeLabel(t: (key: string, fallback?: string) => string, value: string): string {
  const map: Record<string, string> = {
    guardian_post: t('guardian.feed.type.guardian_post', 'Guardian Post'),
    health_update: t('guardian.feed.type.health_update', 'Health Update'),
    pet_milestone: t('guardian.feed.type.pet_milestone', 'Pet Milestone'),
    supplier_story: t('guardian.feed.type.supplier_story', 'Supplier Story'),
    booking_completed: t('guardian.feed.type.booking_completed', 'Booking Completed'),
  };
  return map[value] || value;
}

function visibilityLabel(t: (key: string, fallback?: string) => string, value: string): string {
  const map: Record<string, string> = {
    public: t('guardian.feed.visibility.public', 'Public'),
    friends_only: t('guardian.feed.visibility.friends_only', 'Friends Only'),
    private: t('guardian.feed.visibility.private', 'Private'),
    connected_only: t('guardian.feed.visibility.connected_only', 'Connected Only'),
    booking_related_only: t('guardian.feed.visibility.booking_related_only', 'Booking Related Only'),
  };
  return map[value] || value;
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
  const { pet_id: petIdParam } = useParams();
  const t = useT();
  const role = getStoredRole();
  const isGuardian = role === 'guardian';
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
  const [albumMedia, setAlbumMedia] = useState<PetAlbumMedia[]>([]);
  const [weightLogs, setWeightLogs] = useState<PetWeightLog[]>([]);
  const [weightSummary, setWeightSummary] = useState<WeightSummary | null>(null);
  const [weightRange, setWeightRange] = useState<WeightRange>('3m');
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [weightForm, setWeightForm] = useState<{ value: string; measured_at: string; notes: string }>({
    value: '',
    measured_at: '',
    notes: '',
  });
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [petTab, setPetTab] = useState<PetProfileTab>('gallery');
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
    () => labelOf(optHealthLevel, selectedPet?.health_condition_level_id, t('common.none', '-')),
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
        albumRes,
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
        api.petAlbum.list({ include_pending: true, limit: 400 }).catch(() => ({ media: [] })),
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
      setAlbumMedia(albumRes.media || []);

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
      setError(e instanceof Error ? e.message : t('guardian.alert.load_failed', 'Failed to load guardian page'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!petIdParam) return;
    setSelectedPetId(petIdParam);
  }, [petIdParam]);

  const healthFeeds = useMemo(
    () => feeds.filter((f) => f.feed_type === 'health_update' && (!selectedPet || !f.pet_id || f.pet_id === selectedPet.id)),
    [feeds, selectedPet],
  );

  const serviceFeeds = useMemo(
    () => feeds.filter((f) => f.feed_type === 'booking_completed' && (!selectedPet || !f.pet_id || f.pet_id === selectedPet.id)),
    [feeds, selectedPet],
  );

  async function loadWeightLogs(petId: string, range: WeightRange) {
    try {
      const res = await api.pets.weightLogs.list(petId, { range });
      setWeightLogs(res.logs || []);
      setWeightSummary(res.summary || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load weight logs');
      setWeightLogs([]);
      setWeightSummary(null);
    }
  }

  useEffect(() => {
    if (!selectedPet?.id) {
      setWeightLogs([]);
      setWeightSummary(null);
      return;
    }
    loadWeightLogs(selectedPet.id, weightRange);
  }, [selectedPet?.id, weightRange]);

  async function createWeightLog() {
    if (!selectedPet?.id) return;
    const value = Number(weightForm.value);
    if (!Number.isFinite(value) || value <= 0) {
      setError('몸무게를 올바르게 입력해 주세요.');
      return;
    }
    try {
      await api.pets.weightLogs.create(selectedPet.id, {
        weight_value: value,
        weight_unit_id: selectedPet.weight_unit_id || null,
        measured_at: weightForm.measured_at || new Date().toISOString(),
        notes: weightForm.notes.trim() || null,
      });
      setWeightModalOpen(false);
      setWeightForm({ value: '', measured_at: '', notes: '' });
      await loadWeightLogs(selectedPet.id, weightRange);
      await loadAll(feedTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add weight log');
    }
  }

  async function removeWeightLog(logId: string) {
    if (!selectedPet?.id) return;
    if (!confirm('이 몸무게 기록을 삭제할까요?')) return;
    try {
      await api.pets.weightLogs.remove(selectedPet.id, logId);
      await loadWeightLogs(selectedPet.id, weightRange);
      await loadAll(feedTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete weight log');
    }
  }

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
        birthday: p.birthday || p.birth_date || '',
        current_weight: p.current_weight != null ? String(p.current_weight) : (p.weight_kg != null ? String(p.weight_kg) : ''),
        current_weight_measured_at: '',
        current_weight_notes: '',
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
      setError(e instanceof Error ? e.message : t('guardian.alert.pet_detail_failed', 'Failed to load pet detail'));
    }
  }

  async function savePet() {
    if (!petForm.name.trim()) {
      setError(t('guardian.alert.name_required', 'Pet name is required.'));
      return;
    }
    if (!petForm.pet_type_id) {
      setError(t('guardian.alert.pet_type_required', 'Pet type is required.'));
      return;
    }
    if (petForm.microchip_no.trim()) {
      try {
        const dup = await api.pets.checkMicrochip(petForm.microchip_no.trim(), petMode === 'edit' ? activePet?.id : undefined);
        if (!dup.available) {
          setError(dup.reason || t('guardian.alert.microchip_duplicate', 'This microchip number is already registered.'));
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t('guardian.alert.microchip_check_failed', 'Microchip duplicate check failed.'));
        return;
      }
    }
    if (petForm.current_weight.trim() && !Number.isFinite(Number(petForm.current_weight))) {
      setError('Current weight must be a valid number.');
      return;
    }

    const payload = {
      ...petForm,
      microchip_no: petForm.microchip_no.trim() || null,
      birthday: petForm.birthday || null,
      birth_date: petForm.birthday || null,
      current_weight: petForm.current_weight.trim() ? Number(petForm.current_weight) : null,
      weight_kg: petForm.current_weight.trim() ? Number(petForm.current_weight) : null,
      current_weight_measured_at: petForm.current_weight_measured_at || null,
      current_weight_notes: petForm.current_weight_notes.trim() || null,
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
      setError(e instanceof Error ? e.message : t('guardian.alert.pet_save_failed', 'Failed to save pet.'));
    }
  }

  async function removePet(id: string) {
    if (!confirm(t('guardian.alert.pet_delete_confirm', 'Do you want to delete this pet?'))) return;
    try {
      await api.pets.remove(id);
      if (selectedPetId === id) setSelectedPetId('');
      await loadAll(feedTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('guardian.alert.pet_delete_failed', 'Failed to delete pet.'));
    }
  }

  async function createFeedPost() {
    if (!feedCompose.caption.trim()) {
      setError(t('guardian.alert.feed_caption_required', 'Please enter feed content.'));
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
      setError(e instanceof Error ? e.message : t('guardian.alert.feed_create_failed', 'Failed to create feed post.'));
    }
  }

  function renderSelect(label: string, value: string, options: Option[], onChange: (v: string) => void, required = false) {
    return (
      <div className="form-group">
        <label className="form-label">{label}{required ? ' *' : ''}</label>
        <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{t('common.select', 'Select')}</option>
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

  function renderWeightTrendChart(logs: PetWeightLog[]) {
    if (!logs.length) {
      return <div className="weight-chart-empty text-sm text-muted">몸무게 기록이 없습니다.</div>;
    }
    const rows = [...logs].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
    const values = rows.map((row) => Number(row.weight_value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = 640;
    const height = 220;
    const pad = 28;
    const usableW = width - pad * 2;
    const usableH = height - pad * 2;
    const span = Math.max(0.0001, max - min);
    const points = rows.map((row, idx) => {
      const x = pad + (rows.length === 1 ? usableW / 2 : (idx / (rows.length - 1)) * usableW);
      const y = pad + (1 - ((Number(row.weight_value) - min) / span)) * usableH;
      return { x, y, row };
    });
    const line = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="weight-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Weight trend chart">
          <rect x="0" y="0" width={width} height={height} rx="12" fill="#f7fbff" />
          <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#b8c8de" />
          <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#b8c8de" />
          <path d={line} fill="none" stroke="#1a73e8" strokeWidth="3" />
          {points.map((p) => (
            <circle key={p.row.id} cx={p.x} cy={p.y} r="4" fill="#1a73e8">
              <title>{`${new Date(p.row.measured_at).toLocaleDateString()} / ${p.row.weight_value}`}</title>
            </circle>
          ))}
          <text x={pad} y={16} fontSize="11" fill="#4e6487">{`max ${max.toFixed(2)}`}</text>
          <text x={pad} y={height - 8} fontSize="11" fill="#4e6487">{`min ${min.toFixed(2)}`}</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="guardian-page">
      <section className="guardian-top">
        <div className="guardian-hero card">
          <div className="card-body">
            <p className="hero-eyebrow">{t('platform.name', 'Petfolio')}</p>
            <h2>{t('platform.name', 'Petfolio')}</h2>
            <p className="text-muted">{t('platform.tagline', "Your pet's life portfolio")}</p>
            <div className="hero-actions mt-3">
              <button className="btn btn-primary" onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
              <Link className="btn btn-secondary" to="/">{t('guardian.main.public_feed', 'Public Feed')}</Link>
            </div>
          </div>
        </div>

        <div className="guardian-summary-grid">
          <article className="card"><div className="card-body"><p className="text-sm text-muted">{t('guardian.summary.pets_count', 'Registered Pets')}</p><h3>{pets.length}</h3></div></article>
          <article className="card"><div className="card-body"><p className="text-sm text-muted">{t('guardian.summary.latest_health', 'Latest Health Status')}</p><h3>{latestHealthLabel}</h3></div></article>
          <article className="card"><div className="card-body"><p className="text-sm text-muted">{t('guardian.summary.latest_booking_status', 'Latest Booking Status')}</p><h3>{latestBooking?.status || t('common.none', '-')}</h3></div></article>
          <article className="card"><div className="card-body"><p className="text-sm text-muted">{t('guardian.summary.pending_completion_approvals', 'Pending Completion Approvals')}</p><h3>{pendingApprovalsCount}</h3></div></article>
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
                  <h3>{t('guardian.empty.no_pets_title', 'Register your first pet')}</h3>
                  <p className="text-muted">{t('guardian.empty.no_pets_desc', 'Without a pet profile, feed/health/booking links are limited.')}</p>
                  <button className="btn btn-primary mt-2" onClick={openCreatePet}>{t('guardian.empty.no_pets_cta', 'Register your first pet')}</button>
                </div>
              </div>
            )}

            <div className="feed-toolbar card">
              <div className="feed-tabs pet-profile-tabs">
                <button className={`feed-tab ${petTab === 'timeline' ? 'active' : ''}`} onClick={() => setPetTab('timeline')}>Timeline</button>
                <button className={`feed-tab ${petTab === 'health' ? 'active' : ''}`} onClick={() => setPetTab('health')}>Health</button>
                <button className={`feed-tab ${petTab === 'services' ? 'active' : ''}`} onClick={() => setPetTab('services')}>Services</button>
                <button className={`feed-tab ${petTab === 'gallery' ? 'active' : ''}`} onClick={() => setPetTab('gallery')}>Gallery</button>
                <button className={`feed-tab ${petTab === 'profile' ? 'active' : ''}`} onClick={() => setPetTab('profile')}>Profile</button>
              </div>
            </div>

            {petTab === 'gallery' && (
              <PetGalleryPanel
                selectedPet={selectedPet}
                mediaItems={albumMedia}
                bookings={bookings}
                breedLabel={labelOf(optBreed, selectedPet?.breed_id, t('common.none', '-'))}
                genderLabel={labelOf(optGender, selectedPet?.gender_id, t('common.none', '-'))}
                lifeStageLabel={labelOf(optLifeStage, selectedPet?.life_stage_id, t('common.none', '-'))}
                isGuardian={isGuardian}
                setError={setError}
                onRefresh={() => loadAll(feedTab)}
              />
            )}

            {petTab === 'timeline' && (
              <>
                <div className="card">
                  <div className="card-header"><div className="card-title">{t('guardian.feed.create_title', 'Create Feed Post')}</div></div>
                  <div className="card-body">
                    <div className="form-row col3">
                      <div className="form-group">
                        <label className="form-label">{t('guardian.feed.feed_type', 'Feed Type')}</label>
                        <select className="form-select" value={feedCompose.feed_type} onChange={(e) => setFeedCompose((p) => ({ ...p, feed_type: e.target.value as FeedCompose['feed_type'] }))}>
                          <option value="guardian_post">{t('guardian.feed.type.guardian_post', 'Guardian Post')}</option>
                          <option value="health_update">{t('guardian.feed.type.health_update', 'Health Update')}</option>
                          <option value="pet_milestone">{t('guardian.feed.type.pet_milestone', 'Pet Milestone')}</option>
                          <option value="supplier_story">{t('guardian.feed.type.supplier_story', 'Supplier Story')}</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('guardian.feed.visibility', 'Visibility')}</label>
                        <select className="form-select" value={feedCompose.visibility_scope} onChange={(e) => setFeedCompose((p) => ({ ...p, visibility_scope: e.target.value as FeedCompose['visibility_scope'] }))}>
                          <option value="public">{t('guardian.feed.visibility.public', 'Public')}</option>
                          <option value="friends_only">{t('guardian.feed.visibility.friends_only', 'Friends Only')}</option>
                          <option value="private">{t('guardian.feed.visibility.private', 'Private')}</option>
                          <option value="connected_only">{t('guardian.feed.visibility.connected_only', 'Connected Only')}</option>
                          <option value="booking_related_only">{t('guardian.feed.visibility.booking_related_only', 'Booking Related Only')}</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('guardian.feed.linked_pet', 'Linked Pet')}</label>
                        <select className="form-select" value={feedCompose.pet_id} onChange={(e) => setFeedCompose((p) => ({ ...p, pet_id: e.target.value }))}>
                          <option value="">{t('common.none', 'None')}</option>
                          {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-row col2">
                      <div className="form-group">
                        <label className="form-label">{t('guardian.feed.booking_id_optional', 'booking_id (optional)')}</label>
                        <input className="form-input" value={feedCompose.booking_id} onChange={(e) => setFeedCompose((p) => ({ ...p, booking_id: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('guardian.feed.supplier_id_optional', 'supplier_id (optional)')}</label>
                        <input className="form-input" value={feedCompose.supplier_id} onChange={(e) => setFeedCompose((p) => ({ ...p, supplier_id: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('guardian.feed.caption', 'Caption')}</label>
                      <textarea className="form-textarea" value={feedCompose.caption} onChange={(e) => setFeedCompose((p) => ({ ...p, caption: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('guardian.feed.tags', 'Tags (comma separated)')}</label>
                      <input className="form-input" value={feedCompose.tagsText} onChange={(e) => setFeedCompose((p) => ({ ...p, tagsText: e.target.value }))} />
                    </div>
                    <button className="btn btn-primary" onClick={createFeedPost}>{t('guardian.feed.post', 'Post')}</button>
                  </div>
                </div>

                <div className="feed-toolbar card">
                  <div className="feed-tabs">
                    <button className={`feed-tab ${feedTab === 'all' ? 'active' : ''}`} onClick={() => { setFeedTab('all'); loadAll('all'); }}>{t('guardian.feed.filter.all', 'All')}</button>
                    <button className={`feed-tab ${feedTab === 'friends' ? 'active' : ''}`} onClick={() => { setFeedTab('friends'); loadAll('friends'); }}>{t('guardian.feed.filter.friends', 'Friends Feed')}</button>
                  </div>
                </div>

                <div className="sns-feed-list">
                  {feeds.map((f) => (
                    <article key={f.id} className="sns-card">
                      <div className="sns-card-header">
                        <div>
                          <p className="sns-meta">{feedTypeLabel(t, f.feed_type)}</p>
                          <h3>{f.author_email || t('common.none', '-')}</h3>
                          <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'))}</p>
                        </div>
                        <div className="sns-badges">
                          <span className="badge badge-blue">{f.business_category_ko || f.business_category_key || t('common.none', '-')}</span>
                          <span className="badge badge-gray">{f.pet_type_ko || f.pet_type_key || t('common.none', '-')}</span>
                          <span className="badge badge-green">{visibilityLabel(t, f.visibility_scope)}</span>
                        </div>
                      </div>
                      {f.pet_name && <p className="sns-pet">{t('guardian.feed.pet_prefix', 'Pet')}: {f.pet_name}</p>}
                      {f.caption && <p className="sns-caption">{f.caption}</p>}
                      <div className="sns-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => api.feeds.like(f.id).then(() => loadAll(feedTab)).catch((e) => setError(e instanceof Error ? e.message : t('guardian.alert.like_failed', 'Failed to like post')))}>
                          {t('guardian.feed.like', 'Like')} ({f.like_count || 0})
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => api.feeds.comments.list(f.id).then(() => null).catch((e) => setError(e instanceof Error ? e.message : t('guardian.alert.comment_failed', 'Failed to load comments')))}>
                          {t('guardian.feed.comment', 'Comment')} ({f.comment_count || 0})
                        </button>
                      </div>
                    </article>
                  ))}
                  {feeds.length === 0 && <div className="card"><div className="card-body">{t('guardian.feed.no_feeds', 'No feeds to display.')}</div></div>}
                </div>
              </>
            )}

            {petTab === 'health' && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Weight History</div>
                  <div className="td-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => setWeightModalOpen(true)}>몸무게 추가</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="guardian-summary-grid weight-summary-grid">
                    <article className="card"><div className="card-body"><p className="text-sm text-muted">현재 몸무게</p><h3>{weightSummary?.latest_weight ?? selectedPet?.current_weight ?? '-'} {selectedPet?.weight_unit_id ? '' : 'kg'}</h3></div></article>
                    <article className="card"><div className="card-body"><p className="text-sm text-muted">최근 측정일</p><h3>{formatDate(weightSummary?.latest_measured_at, '-')}</h3></div></article>
                    <article className="card"><div className="card-body"><p className="text-sm text-muted">최고/최저</p><h3>{weightSummary?.max_weight ?? '-'} / {weightSummary?.min_weight ?? '-'}</h3></div></article>
                    <article className="card"><div className="card-body"><p className="text-sm text-muted">직전 대비 변화량</p><h3>{weightSummary?.delta_from_prev ?? '-'} {weightSummary?.delta_from_prev != null ? 'kg' : ''}</h3></div></article>
                  </div>

                  <div className="feed-tabs mt-2">
                    {(['1m', '3m', '6m', '1y', 'all'] as const).map((range) => (
                      <button
                        key={range}
                        className={`feed-tab ${weightRange === range ? 'active' : ''}`}
                        onClick={() => setWeightRange(range)}
                      >
                        {range === 'all' ? '전체' : range}
                      </button>
                    ))}
                  </div>

                  {renderWeightTrendChart(weightLogs)}

                  <div className="mt-3">
                    <h4>Weight Log List</h4>
                    <div className="guardian-pet-list">
                      {weightLogs.map((log) => (
                        <div key={log.id} className="guardian-pet-item">
                          <p className="text-sm">{new Date(log.measured_at).toLocaleDateString()} · {log.weight_value} {selectedPet?.weight_unit_id ? '' : 'kg'}</p>
                          <div className="td-actions">
                            <button className="btn btn-danger btn-sm" onClick={() => removeWeightLog(log.id)}>삭제</button>
                          </div>
                        </div>
                      ))}
                      {weightLogs.length === 0 && <p className="text-muted">몸무게 기록이 없습니다.</p>}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4>Health Updates</h4>
                    {healthFeeds.map((f) => (
                      <article key={f.id} className="sns-card">
                        <p className="sns-meta">{feedTypeLabel(t, f.feed_type)}</p>
                        <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'))}</p>
                        <p>{f.caption || t('common.none', '-')}</p>
                      </article>
                    ))}
                    {healthFeeds.length === 0 && <p className="text-muted">건강기록 피드가 없습니다.</p>}
                  </div>
                </div>
              </div>
            )}

            {petTab === 'services' && (
              <div className="card">
                <div className="card-header"><div className="card-title">Services & Booking Completion</div></div>
                <div className="card-body">
                  {bookings
                    .filter((b) => !selectedPet || !b.pet_id || b.pet_id === selectedPet.id)
                    .map((b) => (
                      <div key={b.id} className="guardian-pet-item">
                        <p className="text-sm">#{b.id.slice(0, 8)} · {b.status}</p>
                        <p className="text-sm text-muted">{formatDate(b.updated_at, t('common.none', '-'))}</p>
                      </div>
                    ))}
                  {serviceFeeds.length > 0 && <p className="mt-2 text-sm">완료 피드 {serviceFeeds.length}건</p>}
                </div>
              </div>
            )}

            {petTab === 'profile' && selectedPet && (
              <div className="card">
                <div className="card-header"><div className="card-title">Pet Profile</div></div>
                <div className="card-body">
                  <p><strong>{selectedPet.name}</strong></p>
                  <p className="text-sm">{t('master.pet_type', 'Pet Type')}: {labelOf(optPetType, selectedPet.pet_type_id, t('common.none', '-'))}</p>
                  <p className="text-sm">{t('master.pet_breed', 'Breed')}: {labelOf(optBreed, selectedPet.breed_id, t('common.none', '-'))}</p>
                  <p className="text-sm">{t('master.pet_gender', 'Gender')}: {labelOf(optGender, selectedPet.gender_id, t('common.none', '-'))}</p>
                  <p className="text-sm">{t('master.life_stage', 'Life Stage')}: {labelOf(optLifeStage, selectedPet.life_stage_id, t('common.none', '-'))}</p>
                  <p className="text-sm">Birthday: {selectedPet.birthday || selectedPet.birth_date || t('common.none', '-')}</p>
                  <p className="text-sm">Current Weight: {selectedPet.current_weight ?? selectedPet.weight_kg ?? t('common.none', '-')}</p>
                  <button className="btn btn-secondary mt-2" onClick={() => openEditPet(selectedPet.id)}>{t('common.edit', 'Edit')}</button>
                </div>
              </div>
            )}
          </main>

          <aside className="guardian-side">
            <div className="card">
              <div className="card-header"><div className="card-title">{t('guardian.mypets.title', 'My Pets')}</div></div>
              <div className="card-body">
                <div className="td-actions mb-4">
                  <button className="btn btn-primary btn-sm" onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
                </div>
                <div className="guardian-pet-list">
                  {pets.map((p) => (
                    <div key={p.id} className={`guardian-pet-item ${selectedPet?.id === p.id ? 'active' : ''}`}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPetId(p.id)}>{p.name}</button>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditPet(p.id)}>{t('common.edit', 'Edit')}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => removePet(p.id)}>{t('common.delete', 'Delete')}</button>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedPet && (
                  <div className="guardian-pet-detail mt-3">
                    <p><strong>{t('guardian.mypets.basic_info', 'Basic Info')}</strong></p>
                    <p className="text-sm">{t('master.pet_type', 'Pet Type')}: {labelOf(optPetType, selectedPet.pet_type_id, t('common.none', '-'))}</p>
                    <p className="text-sm">{t('master.pet_breed', 'Breed')}: {labelOf(optBreed, selectedPet.breed_id, t('common.none', '-'))}</p>
                    <p className="text-sm">{t('master.pet_gender', 'Gender')}: {labelOf(optGender, selectedPet.gender_id, t('common.none', '-'))}</p>
                    <p className="text-sm">{t('master.health_condition_level', 'Health Condition Level')}: {labelOf(optHealthLevel, selectedPet.health_condition_level_id, t('common.none', '-'))}</p>
                    <p className="text-sm">Birthday: {selectedPet.birthday || selectedPet.birth_date || t('common.none', '-')}</p>
                    <p className="text-sm">Current Weight: {selectedPet.current_weight ?? selectedPet.weight_kg ?? t('common.none', '-')}</p>
                    <p className="text-sm">{t('guardian.form.microchip', 'Microchip Number')}: {selectedPet.microchip_no || t('common.none', '-')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">{t('guardian.summary.health_booking', 'Health / Booking Summary')}</div></div>
              <div className="card-body">
                <p className="text-sm">{t('guardian.summary.latest_booking', 'Latest Booking')}: <strong>{latestBooking?.status || t('common.none', '-')}</strong></p>
                <p className="text-sm">{t('guardian.summary.latest_booking_time', 'Latest Booking Time')}: {formatDate(latestBooking?.updated_at, t('common.none', '-'))}</p>
                <p className="text-sm">{t('guardian.summary.pending_completion_approvals', 'Pending Completion Approvals')}: <strong>{pendingApprovalsCount}</strong></p>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">{t('guardian.connections.title', 'Connections')}</div></div>
              <div className="card-body">
                <p className="text-sm">{t('guardian.connections.connected_suppliers', 'Connected Suppliers/Friends')}: <strong>{friendCount}</strong></p>
                <p className="text-sm">{t('guardian.connections.pending_friend_requests', 'Pending Friend Requests')}: <strong>{pendingRequests.length}</strong></p>
              </div>
            </div>
          </aside>
        </section>
      )}

      {petModalOpen && (
        <div className="modal-overlay">
          <div className="modal guardian-pet-modal">
            <div className="modal-header">
              <h3 className="modal-title">{petMode === 'create' ? t('guardian.modal.add_pet', 'Add Pet') : t('guardian.modal.edit_pet', 'Edit Pet')}</h3>
              <button className="modal-close" onClick={() => { setPetModalOpen(false); setActivePet(null); }}>&times;</button>
            </div>
            <div className="modal-body guardian-modal-body">
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">{t('guardian.form.name', 'Name')} *</label>
                  <input className="form-input" value={petForm.name} onChange={(e) => setPetForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('guardian.form.microchip', 'Microchip Number')}</label>
                  <input className="form-input" value={petForm.microchip_no} onChange={(e) => setPetForm((p) => ({ ...p, microchip_no: e.target.value }))} />
                </div>
              </div>

              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">Birthday</label>
                  <input className="form-input" type="date" value={petForm.birthday} onChange={(e) => setPetForm((p) => ({ ...p, birthday: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Weight</label>
                  <input className="form-input" type="number" step="0.01" value={petForm.current_weight} onChange={(e) => setPetForm((p) => ({ ...p, current_weight: e.target.value }))} />
                </div>
              </div>

              <div className="form-row col3">
                {renderSelect(t('master.pet_type', 'Pet Type'), petForm.pet_type_id, optPetType, (v) => setPetForm((p) => ({ ...p, pet_type_id: v, breed_id: '' })), true)}
                {renderSelect(t('master.pet_breed', 'Breed'), petForm.breed_id, breedOptionsFiltered, (v) => setPetForm((p) => ({ ...p, breed_id: v })))}
                {renderSelect(t('master.pet_gender', 'Gender'), petForm.gender_id, optGender, (v) => setPetForm((p) => ({ ...p, gender_id: v })))}
              </div>

              <div className="form-row col3">
                {renderSelect(t('master.neuter_status', 'Neutered/Spayed Status'), petForm.neuter_status_id, optNeuter, (v) => setPetForm((p) => ({ ...p, neuter_status_id: v })))}
                {renderSelect(t('master.life_stage', 'Life Stage'), petForm.life_stage_id, optLifeStage, (v) => setPetForm((p) => ({ ...p, life_stage_id: v })))}
                {renderSelect(t('master.body_size', 'Body Size'), petForm.body_size_id, optBodySize, (v) => setPetForm((p) => ({ ...p, body_size_id: v })))}
              </div>

              <div className="form-row col3">
                {renderSelect(t('master.country', 'Country'), petForm.country_id, optCountry, (v) => setPetForm((p) => ({ ...p, country_id: v })))}
                {renderSelect(t('master.medication_status', 'Medication Status'), petForm.medication_status_id, optMedication, (v) => setPetForm((p) => ({ ...p, medication_status_id: v })))}
                {renderSelect(t('master.weight_unit', 'Weight Unit'), petForm.weight_unit_id, optWeightUnit, (v) => setPetForm((p) => ({ ...p, weight_unit_id: v })))}
              </div>

              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">Weight Measured At</label>
                  <input className="form-input" type="datetime-local" value={petForm.current_weight_measured_at} onChange={(e) => setPetForm((p) => ({ ...p, current_weight_measured_at: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight Memo</label>
                  <input className="form-input" value={petForm.current_weight_notes} onChange={(e) => setPetForm((p) => ({ ...p, current_weight_notes: e.target.value }))} />
                </div>
              </div>

              <div className="form-row col3">
                {renderSelect(t('master.health_condition_level', 'Health Condition Level'), petForm.health_condition_level_id, optHealthLevel, (v) => setPetForm((p) => ({ ...p, health_condition_level_id: v })))}
                {renderSelect(t('master.activity_level', 'Activity Level'), petForm.activity_level_id, optActivity, (v) => setPetForm((p) => ({ ...p, activity_level_id: v })))}
                {renderSelect(t('master.diet_type', 'Diet Type'), petForm.diet_type_id, optDiet, (v) => setPetForm((p) => ({ ...p, diet_type_id: v })))}
              </div>

              <div className="form-row col3">
                {renderSelect(t('master.living_style', 'Living Style'), petForm.living_style_id, optLivingStyle, (v) => setPetForm((p) => ({ ...p, living_style_id: v })))}
                {renderSelect(t('master.ownership_type', 'Ownership Type'), petForm.ownership_type_id, optOwnership, (v) => setPetForm((p) => ({ ...p, ownership_type_id: v })))}
                {renderSelect(t('master.coat_length', 'Coat Length'), petForm.coat_length_id, optCoatLength, (v) => setPetForm((p) => ({ ...p, coat_length_id: v })))}
              </div>

              <div className="form-row col2">
                {renderSelect(t('master.coat_type', 'Coat Type'), petForm.coat_type_id, optCoatType, (v) => setPetForm((p) => ({ ...p, coat_type_id: v })))}
                {renderSelect(t('master.grooming_cycle', 'Grooming Cycle'), petForm.grooming_cycle_id, optGrooming, (v) => setPetForm((p) => ({ ...p, grooming_cycle_id: v })))}
              </div>

              <div className="form-row col2">
                {renderMultiSelect(t('master.pet_color', 'Primary Color'), petForm.color_ids, optColor, (next) => setPetForm((p) => ({ ...p, color_ids: next })))}
                {renderMultiSelect(t('master.allergy_type', 'Allergy'), petForm.allergy_ids, optAllergy, (next) => setPetForm((p) => ({ ...p, allergy_ids: next })))}
              </div>

              <div className="form-row col2">
                {renderMultiSelect(t('master.disease_type', 'Disease History'), petForm.disease_history_ids, optDisease, (next) => setPetForm((p) => ({ ...p, disease_history_ids: next })))}
                {renderMultiSelect(t('master.symptom_type', 'Symptom Tag'), petForm.symptom_tag_ids, optSymptom, (next) => setPetForm((p) => ({ ...p, symptom_tag_ids: next })))}
              </div>

              <div className="form-row col2">
                {renderMultiSelect(t('master.vaccination_type', 'Vaccination'), petForm.vaccination_ids, optVaccination, (next) => setPetForm((p) => ({ ...p, vaccination_ids: next })))}
                {renderMultiSelect(t('master.temperament_type', 'Temperament'), petForm.temperament_ids, optTemperament, (next) => setPetForm((p) => ({ ...p, temperament_ids: next })))}
              </div>

              <div className="form-group">
                <label className="form-label">{t('guardian.form.notes', 'Notes')}</label>
                <textarea className="form-textarea" value={petForm.notes} onChange={(e) => setPetForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPetModalOpen(false)}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={savePet}>{t('common.save', 'Save')}</button>
            </div>
          </div>
        </div>
      )}

      {weightModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">몸무게 추가</h3>
              <button className="modal-close" onClick={() => setWeightModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">몸무게</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={weightForm.value}
                  onChange={(e) => setWeightForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">측정일</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={weightForm.measured_at}
                  onChange={(e) => setWeightForm((prev) => ({ ...prev, measured_at: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">메모</label>
                <textarea
                  className="form-textarea"
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setWeightModalOpen(false)}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={createWeightLog}>{t('common.save', 'Save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
