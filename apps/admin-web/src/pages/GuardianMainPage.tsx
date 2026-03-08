import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Booking, type DeviceBrand, type DeviceManufacturer, type DeviceModel, type FeedPost, type FriendRequest, type HealthMeasurementSummary, type MasterItem, type MeasurementUnit, type Pet, type PetAlbumMedia, type PetHealthMeasurementLog, type PetWeightLog, type WeightSummary } from '../lib/api';
import { useI18n, useT, type Lang } from '../lib/i18n';
import { getStoredRole } from '../lib/auth';
import PetGalleryPanel from '../components/PetGalleryPanel';

type FeedTab = 'all' | 'friends';
type Mode = 'create' | 'edit';
type PetProfileTab = 'timeline' | 'health' | 'services' | 'gallery' | 'profile';
type WeightRange = '7d' | '15d' | '1m' | '3m' | '6m' | '1y' | 'all';
type PetWizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type MeasurementWizardStep = 1 | 2;

type Option = { id: string; key: string; label: string; i18nKey?: string; parentId?: string | null; metadata?: Record<string, unknown> };
const PET_WIZARD_STEPS: Array<{ step: PetWizardStep; label: string }> = [
  { step: 1, label: '기본정보' },
  { step: 2, label: '펫종류' },
  { step: 3, label: '성별' },
  { step: 4, label: '예방접종' },
  { step: 5, label: '질병군' },
  { step: 6, label: '성격기질' },
  { step: 7, label: '털길이' },
];

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
  weight_unit_id: string;
  health_condition_level_id: string;
  activity_level_id: string;
  diet_type_id: string;
  temperament_ids: string[];
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
  weight_unit_id: '',
  health_condition_level_id: '',
  activity_level_id: '',
  diet_type_id: '',
  temperament_ids: [],
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
};

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const FEED_MAX_EDGE = 1080;
const FEED_MAX_MB = 0.5;

const CATEGORY_KEYS: Record<string, string[]> = {
  pet_type: ['master.pet_type', 'pet_type'],
  pet_breed: ['master.pet_type', 'pet_type'],
  pet_gender: ['master.pet_gender', 'pet_gender', 'gender'],
  neuter_status: ['master.neuter_status', 'neuter_status'],
  life_stage: ['master.life_stage', 'life_stage'],
  body_size: ['master.body_size', 'body_size'],
  pet_color: ['master.pet_color', 'pet_color'],
  country: ['master.country', 'country'],
  allergy_type: ['master.allergy_type', 'allergy_type'],
  disease_type: ['master.disease_type', 'disease_type'],
  disease_group: ['master.disease_group', 'disease_group'],
  disease_device_type: ['master.disease_device_type', 'disease_device_type'],
  disease_measurement_type: ['master.disease_measurement_type', 'disease_measurement_type'],
  disease_measurement_context: ['master.disease_measurement_context', 'disease_measurement_context'],
  symptom_type: ['master.symptom_type', 'symptom_type'],
  vaccination_type: ['master.vaccination_type', 'vaccination_type'],
  weight_unit: ['master.weight_unit', 'weight_unit'],
  health_condition_level: ['master.health_condition_level', 'health_condition_level'],
  activity_level: ['master.activity_level', 'activity_level'],
  diet_type: ['master.diet_type', 'diet_type'],
  temperament_type: ['master.temperament_type', 'temperament_type'],
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

function normalizeUniqueIds(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const id = String(value || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function normalizedCategoryBaseKey(categoryKey: string): string {
  return categoryKey.replace(/^master\./, '');
}

function localizedMasterItemLabel(
  item: MasterItem,
  lang: Lang,
  t: (key: string, fallback?: string) => string,
  categoryBaseKey?: string,
): string {
  if (categoryBaseKey) {
    const i18nKey = `master.${categoryBaseKey}.${item.key}`;
    const translated = t(i18nKey, '__MISSING__');
    if (translated !== '__MISSING__') return translated;
  }
  const byLang = item[lang as keyof MasterItem];
  if (typeof byLang === 'string' && byLang.trim()) return byLang.trim();
  const ko = item.ko_name || item.ko;
  if (ko && ko.trim()) return ko.trim();
  if (typeof item.en === 'string' && item.en.trim()) return item.en.trim();
  return '-';
}

function toOption(
  items: MasterItem[],
  lang: Lang,
  t: (key: string, fallback?: string) => string,
  categoryKey?: string,
): Option[] {
  const categoryBaseKey = categoryKey ? normalizedCategoryBaseKey(categoryKey) : undefined;
  return items.map((item) => {
    let metadata: Record<string, unknown> = {};
    try {
      metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') as Record<string, unknown> : {};
    } catch {
      metadata = {};
    }
    return {
      id: item.id,
      key: item.key,
      label: (item.display_label || '').trim() || localizedMasterItemLabel(item, lang, t, categoryBaseKey),
      i18nKey: categoryBaseKey ? `master.${categoryBaseKey}.${item.key}` : undefined,
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
  const matched = options.find((o) => o.id === id || o.key === id);
  return matched?.label || fallback;
}

function normalizeSingleStableId(value: string | null | undefined, options: Option[], allowUnknownWhenOptionsMissing = true): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (options.length === 0) return allowUnknownWhenOptionsMissing ? raw : '';
  const matched = options.find((o) => o.id === raw || o.key === raw);
  return matched?.id || '';
}

function normalizeMultiStableIds(raw: string[] | string | null | undefined, options: Option[], allowUnknownWhenOptionsMissing = true): string[] {
  return normalizeUniqueIds(
    toArray(raw)
      .map((value) => normalizeSingleStableId(value, options, allowUnknownWhenOptionsMissing))
      .filter(Boolean),
  );
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('invalid_file_data'));
    };
    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('image_decode_failed'));
    };
    image.src = objectUrl;
  });
}

async function compressImageFile(
  file: File,
  options: { maxEdge: number; maxSizeMB: number; preferredType?: 'image/jpeg' | 'image/webp' },
): Promise<File> {
  const image = await loadImageElement(file);
  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longEdge > options.maxEdge ? options.maxEdge / longEdge : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_not_supported');
  ctx.drawImage(image, 0, 0, width, height);

  const outputType = options.preferredType ?? 'image/jpeg';
  const targetBytes = options.maxSizeMB * 1024 * 1024;
  const qualities = [0.82, 0.75, 0.68, 0.6];

  for (const quality of qualities) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, quality));
    if (!blob) continue;
    if (blob.size <= targetBytes || quality === qualities[qualities.length - 1]) {
      const ext = outputType === 'image/webp' ? 'webp' : 'jpg';
      const filename = `${file.name.replace(/\.[^.]+$/, '')}_${options.maxEdge}.${ext}`;
      return new File([blob], filename, { type: outputType, lastModified: Date.now() });
    }
  }
  throw new Error('image_compress_failed');
}

function uiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    }
    return msg;
  }
  return fallback;
}

async function loadCategoryItems(candidates: string[], lang?: Lang): Promise<MasterItem[]> {
  for (const key of candidates) {
    try {
      const rows = await api.master.public.items(key, undefined, lang);
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
  const { lang } = useI18n();
  const role = getStoredRole();
  const isGuardian = role === 'guardian';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [editingPetId, setEditingPetId] = useState('');
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [petMode, setPetMode] = useState<Mode>('create');
  const [petForm, setPetForm] = useState<PetForm>(DEFAULT_PET_FORM);
  const [petWizardStep, setPetWizardStep] = useState<PetWizardStep>(1);
  const [diseaseRows, setDiseaseRows] = useState<Array<{ groupId: string; diseaseId: string }>>([{ groupId: '', diseaseId: '' }]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [albumMedia, setAlbumMedia] = useState<PetAlbumMedia[]>([]);
  const [weightLogs, setWeightLogs] = useState<PetWeightLog[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<PetHealthMeasurementLog[]>([]);
  const [weightSummary, setWeightSummary] = useState<WeightSummary | null>(null);
  const [measurementSummary, setMeasurementSummary] = useState<HealthMeasurementSummary | null>(null);
  const [weightRange, setWeightRange] = useState<WeightRange>('1m');
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [editingMeasurementLogId, setEditingMeasurementLogId] = useState<string | null>(null);
  const [measurementWizardStep, setMeasurementWizardStep] = useState<MeasurementWizardStep>(1);
  const [selectedMeasurementItemId, setSelectedMeasurementItemId] = useState('');
  const [weightForm, setWeightForm] = useState<{ value: string; measured_at: string; notes: string }>({
    value: '',
    measured_at: '',
    notes: '',
  });
  const [measurementForm, setMeasurementForm] = useState<{
    disease_item_id: string;
    device_type_item_id: string;
    measurement_item_id: string;
    measurement_context_id: string;
    manufacturer_id: string;
    brand_id: string;
    model_id: string;
    value: string;
    unit_item_id: string;
    measured_at: string;
    memo: string;
  }>({
    disease_item_id: '',
    device_type_item_id: '',
    measurement_item_id: '',
    measurement_context_id: '',
    manufacturer_id: '',
    brand_id: '',
    model_id: '',
    value: '',
    unit_item_id: '',
    measured_at: '',
    memo: '',
  });
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [petTab, setPetTab] = useState<PetProfileTab>('gallery');
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [lightboxItems, setLightboxItems] = useState<string[]>([]);
  const [feedCompose, setFeedCompose] = useState<FeedCompose>(DEFAULT_FEED_COMPOSE);
  const [feedImageFile, setFeedImageFile] = useState<File | null>(null);
  const [feedImagePreviewUrl, setFeedImagePreviewUrl] = useState('');
  const [feedUploadProgress, setFeedUploadProgress] = useState(0);
  const [feedUploadError, setFeedUploadError] = useState('');
  const [isPostingFeed, setIsPostingFeed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [friendCount, setFriendCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  const [optPetType, setOptPetType] = useState<Option[]>([]);
  const [optBreed, setOptBreed] = useState<Option[]>([]);
  const [optGender, setOptGender] = useState<Option[]>([]);
  const [optLifeStage, setOptLifeStage] = useState<Option[]>([]);
  const [optColor, setOptColor] = useState<Option[]>([]);
  const [optAllergy, setOptAllergy] = useState<Option[]>([]);
  const [optDisease, setOptDisease] = useState<Option[]>([]);
  const [optDiseaseGroup, setOptDiseaseGroup] = useState<Option[]>([]);
  const [optDiseaseDevice, setOptDiseaseDevice] = useState<Option[]>([]);
  const [optMeasurement, setOptMeasurement] = useState<Option[]>([]);
  const [optMeasurementContext, setOptMeasurementContext] = useState<Option[]>([]);
  const [deviceManufacturers, setDeviceManufacturers] = useState<DeviceManufacturer[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<DeviceBrand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnit[]>([]);
  const [optSymptom, setOptSymptom] = useState<Option[]>([]);
  const [optVaccination, setOptVaccination] = useState<Option[]>([]);
  const [optHealthLevel, setOptHealthLevel] = useState<Option[]>([]);
  const [optActivity, setOptActivity] = useState<Option[]>([]);
  const [optDiet, setOptDiet] = useState<Option[]>([]);
  const [optTemperament, setOptTemperament] = useState<Option[]>([]);
  const [optCoatLength, setOptCoatLength] = useState<Option[]>([]);
  const [optGrooming, setOptGrooming] = useState<Option[]>([]);

  function currentUserIdFromToken(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded)) as { sub?: string };
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  function toDatetimeLocal(value?: string | null): string {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function resetMeasurementForm(nextMeasuredAt?: string) {
    setMeasurementForm({
      disease_item_id: '',
      device_type_item_id: '',
      measurement_item_id: '',
      measurement_context_id: '',
      manufacturer_id: '',
      brand_id: '',
      model_id: '',
      value: '',
      unit_item_id: '',
      measured_at: nextMeasuredAt || '',
      memo: '',
    });
  }

  const currentUserId = currentUserIdFromToken();

  const selectedPet = useMemo(() => pets.find((p) => p.id === selectedPetId) || pets[0] || null, [pets, selectedPetId]);

  const breedOptionsFiltered = useMemo(() => {
    if (!petForm.pet_type_id) return optBreed;
    return optBreed.filter((b) => b.parentId === petForm.pet_type_id);
  }, [optBreed, petForm.pet_type_id]);

  const wizardTitle = useMemo(() => {
    const dash = '-';
    if (petWizardStep === 1) return `${t('guardian.pet_wizard.basic_info', '기본정보')} - ${dash} - ${dash}`;
    if (petWizardStep === 2) {
      return `${t('master.pet_type', '펫종류')} - ${labelOf(optPetType, petForm.pet_type_id, dash)} - ${labelOf(breedOptionsFiltered, petForm.breed_id, dash)}`;
    }
    if (petWizardStep === 3) {
      const colorLabel = petForm.color_ids.length
        ? `${labelOf(optColor, petForm.color_ids[0], dash)}${petForm.color_ids.length > 1 ? ` +${petForm.color_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.pet_gender', '성별')} - ${labelOf(optGender, petForm.gender_id, dash)} - ${colorLabel}`;
    }
    if (petWizardStep === 4) {
      const vaccinationLabel = petForm.vaccination_ids.length
        ? `${labelOf(optVaccination, petForm.vaccination_ids[0], dash)}${petForm.vaccination_ids.length > 1 ? ` +${petForm.vaccination_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.vaccination_type', '예방접종')} - ${vaccinationLabel} - ${dash}`;
    }
    if (petWizardStep === 5) {
      const diseaseLabel = petForm.disease_history_ids.length
        ? `${labelOf(optDisease, petForm.disease_history_ids[0], dash)}${petForm.disease_history_ids.length > 1 ? ` +${petForm.disease_history_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.disease_group', '질병군')} - ${labelOf(optDiseaseGroup, diseaseRows.find((row) => row.groupId)?.groupId || '', dash)} - ${diseaseLabel}`;
    }
    if (petWizardStep === 6) {
      const temperamentLabel = petForm.temperament_ids.length
        ? `${labelOf(optTemperament, petForm.temperament_ids[0], dash)}${petForm.temperament_ids.length > 1 ? ` +${petForm.temperament_ids.length - 1}` : ''}`
        : dash;
      return `${t('master.temperament_type', '성격기질')} - ${temperamentLabel} - ${labelOf(optActivity, petForm.activity_level_id, dash)}`;
    }
    return `${t('master.coat_length', '털길이')} - ${labelOf(optCoatLength, petForm.coat_length_id, dash)} - ${labelOf(optGrooming, petForm.grooming_cycle_id, dash)}`;
  }, [
    breedOptionsFiltered,
    diseaseRows,
    optActivity,
    optCoatLength,
    optColor,
    optDisease,
    optDiseaseGroup,
    optGender,
    optGrooming,
    optPetType,
    optTemperament,
    optVaccination,
    petForm.activity_level_id,
    petForm.breed_id,
    petForm.coat_length_id,
    petForm.color_ids,
    petForm.disease_history_ids,
    petForm.gender_id,
    petForm.grooming_cycle_id,
    petForm.pet_type_id,
    petForm.temperament_ids,
    petForm.vaccination_ids,
    petWizardStep,
    t,
  ]);

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


  const petSummaryDetails = useMemo(() => {
    if (!selectedPet) return null;
    const temperamentBase = summarizeOptions(optTemperament, selectedPet.temperament_ids);
    const activityLabel = labelOf(optActivity, selectedPet.activity_level_id, t('common.none', '-'));
    const temperamentText = `${temperamentBase.text} · ${activityLabel}`;
    const temperamentTooltip = `${temperamentBase.tooltip || temperamentBase.text}\n${t('master.activity_level', 'Activity Level')}: ${activityLabel}`;
    return {
      diet: summarizeOptions(optDiet, selectedPet.diet_type_id ? [selectedPet.diet_type_id] : []),
      disease: summarizeOptions(optDisease, selectedPet.disease_history_ids),
      vaccination: summarizeOptions(optVaccination, selectedPet.vaccination_ids),
      temperament: { text: temperamentText, tooltip: temperamentTooltip },
      color: summarizeOptions(optColor, selectedPet.color_ids),
      grooming: summarizeOptions(optGrooming, selectedPet.grooming_cycle_id ? [selectedPet.grooming_cycle_id] : []),
    };
  }, [optActivity, optColor, optDiet, optDisease, optGrooming, optTemperament, optVaccination, selectedPet, t]);

  async function loadAll(tab = feedTab, opts?: { silent?: boolean }) {
    const silent = Boolean(opts?.silent);
    setLoading(true);
    if (!silent) setError('');
    try {
      const failedApis: string[] = [];
      const safe = async <T,>(promise: Promise<T>, fallback: T, name: string): Promise<T> => {
        try {
          return await promise;
        } catch {
          failedApis.push(name);
          return fallback;
        }
      };

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
        lifeStageRows,
        colorRows,
        allergyRows,
        diseaseRows,
        diseaseGroupRows,
        diseaseDeviceRows,
        measurementRows,
        measurementContextRows,
        symptomRows,
        vaccinationRows,
        healthRows,
        activityRows,
        dietRows,
        temperamentRows,
        coatLengthRows,
        groomingRows,
      ] = await Promise.all([
        safe(api.pets.list(), { pets: [] }, 'pets.list'),
        safe(api.bookings.list(), { bookings: [] }, 'bookings.list'),
        safe(api.friends.list(), { friends: [] }, 'friends.list'),
        safe(api.friends.requests.list('inbox'), { requests: [], scope: 'inbox' }, 'friends.requests'),
        safe(api.feeds.list({ tab, limit: 30 }), { feeds: [] }, 'feeds.list'),
        safe(api.petAlbum.list({ include_pending: true, limit: 400 }), { media: [] }, 'petAlbum.list'),
        loadCategoryItems(CATEGORY_KEYS.pet_type, lang),
        loadCategoryItems(CATEGORY_KEYS.pet_breed, lang),
        loadCategoryItems(CATEGORY_KEYS.pet_gender, lang),
        loadCategoryItems(CATEGORY_KEYS.life_stage, lang),
        loadCategoryItems(CATEGORY_KEYS.pet_color, lang),
        loadCategoryItems(CATEGORY_KEYS.allergy_type, lang),
        loadCategoryItems(CATEGORY_KEYS.disease_type, lang),
        loadCategoryItems(CATEGORY_KEYS.disease_group, lang),
        loadCategoryItems(CATEGORY_KEYS.disease_device_type, lang),
        loadCategoryItems(CATEGORY_KEYS.disease_measurement_type, lang),
        loadCategoryItems(CATEGORY_KEYS.disease_measurement_context, lang),
        loadCategoryItems(CATEGORY_KEYS.symptom_type, lang),
        loadCategoryItems(CATEGORY_KEYS.vaccination_type, lang),
        loadCategoryItems(CATEGORY_KEYS.health_condition_level, lang),
        loadCategoryItems(CATEGORY_KEYS.activity_level, lang),
        loadCategoryItems(CATEGORY_KEYS.diet_type, lang),
        loadCategoryItems(CATEGORY_KEYS.temperament_type, lang),
        loadCategoryItems(CATEGORY_KEYS.coat_length, lang),
        loadCategoryItems(CATEGORY_KEYS.grooming_cycle, lang),
      ]);

      setPets(petsRes.pets || []);
      if (!selectedPetId && (petsRes.pets || []).length > 0) setSelectedPetId((petsRes.pets || [])[0].id);
      setBookings(bookingsRes.bookings || []);
      setFriendCount((friendsRes.friends || []).length);
      setPendingRequests((requestsRes.requests || []).filter((r) => r.status === 'request_sent'));
      setFeeds(feedsRes.feeds || []);
      setAlbumMedia(albumRes.media || []);

      setOptPetType(toOption(petTypeRows, lang, t, CATEGORY_KEYS.pet_type[0]).filter((item) => !item.parentId));
      setOptBreed(toOption(breedRows, lang, t, CATEGORY_KEYS.pet_breed[0]).filter((item) => Boolean(item.parentId)));
      setOptGender(toOption(genderRows, lang, t, CATEGORY_KEYS.pet_gender[0]));
      setOptLifeStage(toOption(lifeStageRows, lang, t, CATEGORY_KEYS.life_stage[0]));
      setOptColor(toOption(colorRows, lang, t, CATEGORY_KEYS.pet_color[0]));
      setOptAllergy(toOption(allergyRows, lang, t, CATEGORY_KEYS.allergy_type[0]));
      setOptDisease(toOption(diseaseRows, lang, t, CATEGORY_KEYS.disease_type[0]));
      setOptDiseaseGroup(toOption(diseaseGroupRows, lang, t, CATEGORY_KEYS.disease_group[0]));
      setOptDiseaseDevice(toOption(diseaseDeviceRows, lang, t, CATEGORY_KEYS.disease_device_type[0]));
      setOptMeasurement(toOption(measurementRows, lang, t, CATEGORY_KEYS.disease_measurement_type[0]));
      setOptMeasurementContext(toOption(measurementContextRows, lang, t, CATEGORY_KEYS.disease_measurement_context[0]));
      setOptSymptom(toOption(symptomRows, lang, t, CATEGORY_KEYS.symptom_type[0]));
      setOptVaccination(toOption(vaccinationRows, lang, t, CATEGORY_KEYS.vaccination_type[0]));
      setOptHealthLevel(toOption(healthRows, lang, t, CATEGORY_KEYS.health_condition_level[0]));
      setOptActivity(toOption(activityRows, lang, t, CATEGORY_KEYS.activity_level[0]));
      setOptDiet(toOption(dietRows, lang, t, CATEGORY_KEYS.diet_type[0]));
      setOptTemperament(toOption(temperamentRows, lang, t, CATEGORY_KEYS.temperament_type[0]));
      setOptCoatLength(toOption(coatLengthRows, lang, t, CATEGORY_KEYS.coat_length[0]));
      setOptGrooming(toOption(groomingRows, lang, t, CATEGORY_KEYS.grooming_cycle[0]));

      if (!silent && failedApis.length > 0) {
        setError('일부 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (e) {
      if (!silent) setError(uiErrorMessage(e, t('guardian.alert.load_failed', '데이터를 불러오지 못했습니다.')));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    void loadAll(feedTab, { silent: true });
  }, [lang]);

  useEffect(() => () => {
    if (feedImagePreviewUrl) URL.revokeObjectURL(feedImagePreviewUrl);
  }, [feedImagePreviewUrl]);

  useEffect(() => {
    if (!petIdParam) return;
    setSelectedPetId(petIdParam);
  }, [petIdParam]);

  useEffect(() => {
    if (!petModalOpen) return;
    const normalizedDiseaseIds = normalizeMultiStableIds(petForm.disease_history_ids, optDisease);
    const mapped = normalizedDiseaseIds
      .map((diseaseId) => {
        const disease = optDisease.find((d) => d.id === diseaseId || d.key === diseaseId);
        return { groupId: disease?.parentId || '', diseaseId };
      })
      .filter((row) => row.groupId && row.diseaseId);
    setDiseaseRows(mapped.length ? mapped : [{ groupId: '', diseaseId: '' }]);
  }, [optDisease, petForm.disease_history_ids, petModalOpen]);

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
      setError(uiErrorMessage(e, '몸무게 기록을 불러오지 못했습니다.'));
      setWeightLogs([]);
      setWeightSummary(null);
    }
  }

  async function loadMeasurementLogs(petId: string, range: WeightRange) {
    try {
      const res = await api.pets.healthMeasurements.list(petId, { range });
      setMeasurementLogs(res.logs || []);
      setMeasurementSummary(res.summary || null);
      if (res.logs && res.logs.length > 0 && !selectedMeasurementItemId) {
        setSelectedMeasurementItemId(String(res.logs[0].measurement_item_id || ''));
      }
    } catch (e) {
      setError(uiErrorMessage(e, '질병 수치 기록을 불러오지 못했습니다.'));
      setMeasurementLogs([]);
      setMeasurementSummary(null);
    }
  }

  useEffect(() => {
    if (!selectedPet?.id) {
      setWeightLogs([]);
      setWeightSummary(null);
      setMeasurementLogs([]);
      setMeasurementSummary(null);
      return;
    }
    loadWeightLogs(selectedPet.id, weightRange);
    loadMeasurementLogs(selectedPet.id, weightRange);
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
      setError(uiErrorMessage(e, '몸무게 기록 추가에 실패했습니다.'));
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
      setError(uiErrorMessage(e, '몸무게 기록 삭제에 실패했습니다.'));
    }
  }

  const diseaseOptionsForHealth = useMemo(() => {
    const selectedIds = normalizeMultiStableIds(selectedPet?.disease_history_ids, optDisease);
    if (!selectedIds.length) return optDisease;
    const set = new Set(selectedIds);
    return optDisease.filter((item) => set.has(item.id));
  }, [optDisease, selectedPet?.disease_history_ids]);

  const healthDeviceOptions = useMemo(
    () => optDiseaseDevice.filter((item) => !measurementForm.disease_item_id || item.parentId === measurementForm.disease_item_id),
    [optDiseaseDevice, measurementForm.disease_item_id],
  );

  const healthMeasurementOptions = useMemo(
    () => optMeasurement.filter((item) => !measurementForm.device_type_item_id || item.parentId === measurementForm.device_type_item_id),
    [optMeasurement, measurementForm.device_type_item_id],
  );

  const healthContextOptions = useMemo(
    () => optMeasurementContext.filter((item) => !measurementForm.measurement_item_id || item.parentId === measurementForm.measurement_item_id),
    [optMeasurementContext, measurementForm.measurement_item_id],
  );

  useEffect(() => {
    if (!measurementLogs.length) {
      if (selectedMeasurementItemId) setSelectedMeasurementItemId('');
      return;
    }
    if (!selectedMeasurementItemId || !measurementLogs.some((log) => String(log.measurement_item_id) === selectedMeasurementItemId)) {
      setSelectedMeasurementItemId(String(measurementLogs[0].measurement_item_id || ''));
    }
  }, [measurementLogs, selectedMeasurementItemId]);

  const manufacturerOptions = useMemo(
    () => deviceManufacturers
      .filter((row) => row.status === 'active')
      .map((row) => ({
        id: row.id,
        key: row.key,
        label: lang === 'ko' ? (row.name_ko || row.name_en || row.key) : (row.name_en || row.name_ko || row.key),
      })),
    [deviceManufacturers, lang],
  );

  const brandOptions = useMemo(
    () => deviceBrands
      .filter((row) => row.status === 'active')
      .map((row) => ({
        id: row.id,
        key: row.name_en || row.name_ko || row.id,
        label: lang === 'ko' ? (row.name_ko || row.name_en || row.id) : (row.name_en || row.name_ko || row.id),
      })),
    [deviceBrands, lang],
  );

  const modelOptions = useMemo(
    () => deviceModels
      .filter((row) => row.status === 'active')
      .map((row) => ({ id: row.id, key: row.model_code || row.model_name || row.id, label: row.model_name || row.model_code || row.id })),
    [deviceModels],
  );

  const measurementUnitOptions = useMemo(
    () => measurementUnits
      .filter((row) => row.status === 'active')
      .map((row) => ({ id: row.id, key: row.key || row.id, label: row.symbol ? `${row.name} (${row.symbol})` : row.name })),
    [measurementUnits],
  );

  useEffect(() => {
    if (!measurementModalOpen) return;
    const run = async () => {
      try {
        const [manufacturers, units] = await Promise.all([
          api.devices.public.manufacturers(measurementForm.device_type_item_id || undefined),
          api.devices.public.units(),
        ]);
        setDeviceManufacturers(manufacturers);
        setMeasurementUnits(units);
      } catch (e) {
        setError(uiErrorMessage(e, '장치/단위 데이터를 불러오지 못했습니다.'));
      }
    };
    run();
  }, [measurementModalOpen, measurementForm.device_type_item_id]);

  useEffect(() => {
    if (!measurementModalOpen) return;
    const run = async () => {
      if (!measurementForm.manufacturer_id) {
        setDeviceBrands([]);
        return;
      }
      try {
        const rows = await api.devices.public.brands(measurementForm.manufacturer_id);
        setDeviceBrands(rows);
      } catch (e) {
        setError(uiErrorMessage(e, '브랜드 데이터를 불러오지 못했습니다.'));
      }
    };
    run();
  }, [measurementModalOpen, measurementForm.manufacturer_id]);

  useEffect(() => {
    if (!measurementModalOpen) return;
    if (!measurementForm.manufacturer_id) return;
    if (!measurementForm.brand_id) return;
    if (deviceBrands.some((row) => row.id === measurementForm.brand_id)) return;
    setMeasurementForm((prev) => ({ ...prev, brand_id: '', model_id: '' }));
  }, [measurementModalOpen, deviceBrands, measurementForm.manufacturer_id, measurementForm.brand_id]);

  useEffect(() => {
    if (!measurementModalOpen) return;
    const run = async () => {
      if (!measurementForm.device_type_item_id && !measurementForm.manufacturer_id && !measurementForm.brand_id) {
        setDeviceModels([]);
        return;
      }
      try {
        const rows = await api.devices.public.models({
          device_type_id: measurementForm.device_type_item_id || undefined,
          manufacturer_id: measurementForm.manufacturer_id || undefined,
          brand_id: measurementForm.brand_id || undefined,
        });
        setDeviceModels(rows);
      } catch (e) {
        setError(uiErrorMessage(e, '모델 데이터를 불러오지 못했습니다.'));
      }
    };
    run();
  }, [measurementModalOpen, measurementForm.device_type_item_id, measurementForm.manufacturer_id, measurementForm.brand_id]);

  useEffect(() => {
    if (!measurementModalOpen) return;
    if (!measurementForm.model_id) return;
    const matchedModel = deviceModels.find((row) => row.id === measurementForm.model_id);
    if (!matchedModel) return;
    setMeasurementForm((prev) => ({
      ...prev,
      manufacturer_id: prev.manufacturer_id || matchedModel.manufacturer_id || '',
      brand_id: prev.brand_id || matchedModel.brand_id || '',
    }));
  }, [measurementModalOpen, deviceModels, measurementForm.model_id]);

  useEffect(() => {
    if (!measurementModalOpen) return;
    if (measurementForm.unit_item_id) return;
    const defaultUnit = measurementUnitOptions[0];
    if (defaultUnit) {
      setMeasurementForm((prev) => ({ ...prev, unit_item_id: defaultUnit.id }));
    }
  }, [measurementModalOpen, measurementUnitOptions, measurementForm.unit_item_id]);

  async function createHealthMeasurementLog() {
    if (!selectedPet?.id) return;
    const stableDiseaseId = normalizeSingleStableId(measurementForm.disease_item_id, optDisease, false);
    const stableDeviceTypeId = normalizeSingleStableId(measurementForm.device_type_item_id, optDiseaseDevice, false);
    const stableMeasurementItemId = normalizeSingleStableId(measurementForm.measurement_item_id, optMeasurement, false);
    const stableMeasurementContextId = normalizeSingleStableId(measurementForm.measurement_context_id, optMeasurementContext, false);
    const stableUnitId = normalizeSingleStableId(measurementForm.unit_item_id, measurementUnitOptions, false);
    const value = Number(measurementForm.value);
    if (!stableDiseaseId) {
      setError('질병을 선택해 주세요.');
      return;
    }
    if (!stableDeviceTypeId) {
      setError('장치 유형을 선택해 주세요.');
      return;
    }
    if (!stableMeasurementItemId) {
      setError('측정항목을 선택해 주세요.');
      return;
    }
    if (!measurementForm.measured_at) {
      setError('측정일을 입력해 주세요.');
      return;
    }
    if (!Number.isFinite(value)) {
      setError('측정값을 올바르게 입력해 주세요.');
      return;
    }
    try {
      await api.pets.healthMeasurements.create(selectedPet.id, {
        disease_item_id: stableDiseaseId,
        device_type_item_id: stableDeviceTypeId || null,
        device_model_id: measurementForm.model_id || null,
        measurement_item_id: stableMeasurementItemId,
        measurement_context_id: stableMeasurementContextId || null,
        value,
        unit_item_id: stableUnitId || null,
        measured_at: measurementForm.measured_at || new Date().toISOString(),
        memo: measurementForm.memo.trim() || null,
      });
      setMeasurementModalOpen(false);
      setMeasurementWizardStep(1);
      resetMeasurementForm();
      await loadMeasurementLogs(selectedPet.id, weightRange);
      await loadAll(feedTab);
    } catch (e) {
      setError(uiErrorMessage(e, '질병 수치 기록 추가에 실패했습니다.'));
    }
  }

  async function updateHealthMeasurementLog() {
    if (!selectedPet?.id || !editingMeasurementLogId) return;
    const stableDiseaseId = normalizeSingleStableId(measurementForm.disease_item_id, optDisease, false);
    const stableDeviceTypeId = normalizeSingleStableId(measurementForm.device_type_item_id, optDiseaseDevice, false);
    const stableMeasurementItemId = normalizeSingleStableId(measurementForm.measurement_item_id, optMeasurement, false);
    const stableMeasurementContextId = normalizeSingleStableId(measurementForm.measurement_context_id, optMeasurementContext, false);
    const stableUnitId = normalizeSingleStableId(measurementForm.unit_item_id, measurementUnitOptions, false);
    const value = Number(measurementForm.value);
    if (!stableDiseaseId) {
      setError('질병을 선택해 주세요.');
      return;
    }
    if (!stableDeviceTypeId) {
      setError('장치 유형을 선택해 주세요.');
      return;
    }
    if (!stableMeasurementItemId) {
      setError('측정항목을 선택해 주세요.');
      return;
    }
    if (!measurementForm.measured_at) {
      setError('측정일을 입력해 주세요.');
      return;
    }
    if (!Number.isFinite(value)) {
      setError('측정값을 올바르게 입력해 주세요.');
      return;
    }
    try {
      await api.pets.healthMeasurements.update(selectedPet.id, editingMeasurementLogId, {
        disease_item_id: stableDiseaseId,
        device_type_item_id: stableDeviceTypeId || null,
        device_model_id: measurementForm.model_id || null,
        measurement_item_id: stableMeasurementItemId,
        measurement_context_id: stableMeasurementContextId || null,
        value,
        unit_item_id: stableUnitId || null,
        measured_at: measurementForm.measured_at || new Date().toISOString(),
        memo: measurementForm.memo.trim() || null,
      });
      setMeasurementModalOpen(false);
      setEditingMeasurementLogId(null);
      setMeasurementWizardStep(1);
      resetMeasurementForm();
      await loadMeasurementLogs(selectedPet.id, weightRange);
    } catch (e) {
      setError(uiErrorMessage(e, '질병 수치 기록 수정에 실패했습니다.'));
    }
  }

  function openEditHealthMeasurementLog(log: PetHealthMeasurementLog) {
    setEditingMeasurementLogId(log.id);
    const matchedModel = log.device_model_id ? deviceModels.find((m) => m.id === log.device_model_id) : null;
    setMeasurementForm({
      disease_item_id: log.disease_item_id || '',
      device_type_item_id: log.device_type_item_id || '',
      measurement_item_id: log.measurement_item_id || '',
      measurement_context_id: log.measurement_context_id || '',
      manufacturer_id: matchedModel?.manufacturer_id || '',
      brand_id: matchedModel?.brand_id || '',
      model_id: log.device_model_id || '',
      value: String(log.value ?? ''),
      unit_item_id: log.unit_item_id || '',
      measured_at: toDatetimeLocal(log.measured_at),
      memo: log.memo || '',
    });
    setMeasurementWizardStep(1);
    setMeasurementModalOpen(true);
  }

  async function openCreateHealthMeasurementModal() {
    setEditingMeasurementLogId(null);
    setMeasurementWizardStep(1);
    let measuredAt = toDatetimeLocal();
    try {
      const health = await api.health();
      if (health.timestamp) measuredAt = toDatetimeLocal(health.timestamp);
    } catch {
      // fallback to client now
    }
    resetMeasurementForm(measuredAt);
    setMeasurementModalOpen(true);
  }

  async function removeHealthMeasurementLog(logId: string) {
    if (!selectedPet?.id) return;
    if (!confirm('이 질병 수치 기록을 삭제할까요?')) return;
    try {
      await api.pets.healthMeasurements.remove(selectedPet.id, logId);
      await loadMeasurementLogs(selectedPet.id, weightRange);
      await loadAll(feedTab);
    } catch (e) {
      setError(uiErrorMessage(e, '질병 수치 기록 삭제에 실패했습니다.'));
    }
  }

  function openCreatePet() {
    setPetMode('create');
    setPetForm(DEFAULT_PET_FORM);
    setPetWizardStep(1);
    setDiseaseRows([{ groupId: '', diseaseId: '' }]);
    setEditingPetId('');
    setPetModalOpen(true);
  }

  async function openEditPet(petId: string) {
    try {
      const res = await api.pets.detail(petId);
      const p = res.pet;
      const diseaseHistoryIds = normalizeMultiStableIds(p.disease_history_ids, optDisease);
      setPetMode('edit');
      setActivePet(p);
      setEditingPetId(p.id);
      setPetWizardStep(1);
      const mappedDiseaseRows = normalizeUniqueIds(diseaseHistoryIds)
        .map((diseaseId) => {
          const disease = optDisease.find((d) => d.id === diseaseId || d.key === diseaseId);
          return { groupId: disease?.parentId || '', diseaseId };
        })
        .filter((row) => row.groupId && row.diseaseId);
      setDiseaseRows(mappedDiseaseRows.length ? mappedDiseaseRows : [{ groupId: '', diseaseId: '' }]);
      setPetForm({
        name: p.name || '',
        microchip_no: p.microchip_no || '',
        birthday: p.birthday || p.birth_date || '',
        current_weight: p.current_weight != null ? String(p.current_weight) : (p.weight_kg != null ? String(p.weight_kg) : ''),
        current_weight_measured_at: '',
        current_weight_notes: '',
        notes: p.notes || '',
        pet_type_id: normalizeSingleStableId(p.pet_type_id, optPetType),
        breed_id: normalizeSingleStableId(p.breed_id, optBreed),
        gender_id: normalizeSingleStableId(p.gender_id, optGender),
        neuter_status_id: p.neuter_status_id || '',
        life_stage_id: normalizeSingleStableId(p.life_stage_id, optLifeStage),
        body_size_id: p.body_size_id || '',
        country_id: p.country_id || '',
        allergy_ids: normalizeMultiStableIds(p.allergy_ids, optAllergy),
        disease_history_ids: diseaseHistoryIds,
        symptom_tag_ids: normalizeMultiStableIds(p.symptom_tag_ids, optSymptom),
        vaccination_ids: normalizeMultiStableIds(p.vaccination_ids, optVaccination),
        weight_unit_id: p.weight_unit_id || '',
        health_condition_level_id: normalizeSingleStableId(p.health_condition_level_id, optHealthLevel),
        activity_level_id: normalizeSingleStableId(p.activity_level_id, optActivity),
        diet_type_id: normalizeSingleStableId(p.diet_type_id, optDiet),
        temperament_ids: normalizeMultiStableIds(p.temperament_ids, optTemperament),
        ownership_type_id: p.ownership_type_id || '',
        coat_length_id: normalizeSingleStableId(p.coat_length_id, optCoatLength),
        coat_type_id: p.coat_type_id || '',
        grooming_cycle_id: normalizeSingleStableId(p.grooming_cycle_id, optGrooming),
        color_ids: normalizeMultiStableIds(p.color_ids, optColor),
      });
      setPetModalOpen(true);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.alert.pet_detail_failed', '펫 상세를 불러오지 못했습니다.')));
    }
  }

  async function savePet() {
    const stablePetTypeId = normalizeSingleStableId(petForm.pet_type_id, optPetType, false);
    if (!petForm.name.trim()) {
      setError(t('guardian.alert.name_required', 'Pet name is required.'));
      return;
    }
    if (!stablePetTypeId) {
      setError(t('guardian.alert.pet_type_required', 'Pet type is required.'));
      return;
    }
    if (petForm.microchip_no.trim()) {
      try {
        const dup = await api.pets.checkMicrochip(petForm.microchip_no.trim(), petMode === 'edit' ? (editingPetId || activePet?.id) : undefined);
        if (!dup.available) {
          setError(dup.reason || t('guardian.alert.microchip_duplicate', 'This microchip number is already registered.'));
          return;
        }
      } catch (e) {
        setError(uiErrorMessage(e, t('guardian.alert.microchip_check_failed', '마이크로칩 중복 확인에 실패했습니다.')));
        return;
      }
    }
    if (petForm.current_weight.trim() && !Number.isFinite(Number(petForm.current_weight))) {
      setError('Current weight must be a valid number.');
      return;
    }

    const payload = {
      ...petForm,
      color_ids: normalizeMultiStableIds(petForm.color_ids, optColor, false),
      allergy_ids: normalizeMultiStableIds(petForm.allergy_ids, optAllergy, false),
      disease_history_ids: normalizeMultiStableIds(petForm.disease_history_ids, optDisease, false),
      symptom_tag_ids: normalizeMultiStableIds(petForm.symptom_tag_ids, optSymptom, false),
      vaccination_ids: normalizeMultiStableIds(petForm.vaccination_ids, optVaccination, false),
      temperament_ids: normalizeMultiStableIds(petForm.temperament_ids, optTemperament, false),
      microchip_no: petForm.microchip_no.trim() || null,
      birthday: petForm.birthday || null,
      birth_date: petForm.birthday || null,
      current_weight: petForm.current_weight.trim() ? Number(petForm.current_weight) : null,
      weight_kg: petForm.current_weight.trim() ? Number(petForm.current_weight) : null,
      current_weight_measured_at: petForm.current_weight_measured_at || null,
      current_weight_notes: petForm.current_weight_notes.trim() || null,
      notes: petForm.notes.trim() || null,
      pet_type_id: stablePetTypeId,
      breed_id: normalizeSingleStableId(petForm.breed_id, optBreed, false) || null,
      gender_id: normalizeSingleStableId(petForm.gender_id, optGender, false) || null,
      neuter_status_id: petForm.neuter_status_id || null,
      life_stage_id: normalizeSingleStableId(petForm.life_stage_id, optLifeStage, false) || null,
      body_size_id: petForm.body_size_id || null,
      country_id: petForm.country_id || null,
      weight_unit_id: petForm.weight_unit_id || null,
      health_condition_level_id: normalizeSingleStableId(petForm.health_condition_level_id, optHealthLevel, false) || null,
      activity_level_id: normalizeSingleStableId(petForm.activity_level_id, optActivity, false) || null,
      diet_type_id: normalizeSingleStableId(petForm.diet_type_id, optDiet, false) || null,
      ownership_type_id: petForm.ownership_type_id || null,
      coat_length_id: normalizeSingleStableId(petForm.coat_length_id, optCoatLength, false) || null,
      coat_type_id: petForm.coat_type_id || null,
      grooming_cycle_id: normalizeSingleStableId(petForm.grooming_cycle_id, optGrooming, false) || null,
    };

    try {
      let savedPet: Pet | null = null;
      if (petMode === 'create') {
        const res = await api.pets.create(payload);
        savedPet = res.pet;
      } else {
        const targetPetId = editingPetId || activePet?.id || selectedPet?.id || '';
        if (!targetPetId) {
          setError('수정 대상 펫을 찾을 수 없습니다. 다시 시도해 주세요.');
          return;
        }
        const res = await api.pets.update(targetPetId, payload);
        savedPet = res.pet;
      }
      if (savedPet) {
        setPets((prev) => {
          const exists = prev.some((p) => p.id === savedPet?.id);
          if (!exists) return [...prev, savedPet as Pet];
          return prev.map((p) => (p.id === savedPet?.id ? (savedPet as Pet) : p));
        });
        setSelectedPetId(savedPet.id);
      }
      setPetModalOpen(false);
      setActivePet(null);
      setEditingPetId('');
      setPetForm(DEFAULT_PET_FORM);
      void loadAll(feedTab, { silent: true });
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.alert.pet_save_failed', '반려동물 저장에 실패했습니다.')));
    }
  }

  function closePetModal() {
    setPetModalOpen(false);
    setActivePet(null);
    setEditingPetId('');
    setPetWizardStep(1);
    setDiseaseRows([{ groupId: '', diseaseId: '' }]);
  }

  function gotoPetStep(step: PetWizardStep) {
    setError('');
    setPetWizardStep(step);
  }

  function gotoNextPetStep() {
    if (petWizardStep === 1) {
      if (!petForm.name.trim()) {
        setError(t('guardian.alert.name_required', 'Pet name is required.'));
        return;
      }
    }
    if (petWizardStep === 2 && !petForm.pet_type_id) {
      setError(t('guardian.alert.pet_type_required', 'Pet type is required.'));
      return;
    }
    if (petWizardStep === 3 && !petForm.gender_id) {
      setError(t('guardian.alert.gender_required', 'Gender is required.'));
      return;
    }
    setError('');
    setPetWizardStep((prev) => (prev < 7 ? ((prev + 1) as PetWizardStep) : prev));
  }

  function gotoPrevPetStep() {
    setError('');
    setPetWizardStep((prev) => (prev > 1 ? ((prev - 1) as PetWizardStep) : prev));
  }

  async function removePet(id: string) {
    if (!confirm(t('guardian.alert.pet_delete_confirm', 'Do you want to delete this pet?'))) return;
    try {
      await api.pets.remove(id);
      if (selectedPetId === id) setSelectedPetId('');
      await loadAll(feedTab);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.alert.pet_delete_failed', '반려동물 삭제에 실패했습니다.')));
    }
  }

  function validateFeedImage(file: File): string | null {
    if (!ALLOWED_UPLOAD_TYPES.has(file.type.toLowerCase())) return 'JPG/PNG/WEBP 파일만 업로드할 수 있습니다.';
    if (file.size > MAX_UPLOAD_SIZE) return '파일 크기는 10MB 이하여야 합니다.';
    return null;
  }

  function resetFeedImage() {
    if (feedImagePreviewUrl) URL.revokeObjectURL(feedImagePreviewUrl);
    setFeedImageFile(null);
    setFeedImagePreviewUrl('');
    setFeedUploadProgress(0);
    setFeedUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFeedImageSelected(file: File | null) {
    if (!file) return;
    const validationError = validateFeedImage(file);
    if (validationError) {
      setFeedUploadError(validationError);
      return;
    }
    setFeedUploadError('');
    setFeedImageFile(file);
    if (feedImagePreviewUrl) URL.revokeObjectURL(feedImagePreviewUrl);
    setFeedImagePreviewUrl(URL.createObjectURL(file));
  }

  function uploadBinary(uploadUrl: string, file: File, onProgress: (ratio: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) onProgress(event.loaded / event.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(1);
          resolve();
          return;
        }
        reject(new Error(xhr.statusText || 'upload_failed'));
      };
      xhr.onerror = () => reject(new Error('upload_failed'));
      xhr.send(file);
    });
  }

  async function createFeedPost() {
    if (!feedCompose.caption.trim()) {
      setError(t('guardian.alert.feed_caption_required', 'Please enter feed content.'));
      return;
    }
    setIsPostingFeed(true);
    setFeedUploadError('');
    try {
      const mediaUrls: string[] = [];
      if (feedImageFile) {
        try {
          const compressed = await compressImageFile(feedImageFile, {
            maxEdge: FEED_MAX_EDGE,
            maxSizeMB: FEED_MAX_MB,
            preferredType: 'image/jpeg',
          });
          const petSeg = sanitizePathSegment(feedCompose.pet_id || selectedPet?.id || 'pet');
          const presigned = await api.storage.presignedUrl({
            type: 'log_media',
            ext: 'jpg',
            subdir: `feed/${petSeg}`,
          });
          await uploadBinary(presigned.upload_url, compressed, (ratio) => setFeedUploadProgress(Math.round(ratio * 100)));
          mediaUrls.push(presigned.public_url);
        } catch (uploadError) {
          const raw = uploadError instanceof Error ? uploadError.message : '';
          const isStorageUnavailable = /Storage not configured|no_r2|storage/i.test(raw);
          if (isStorageUnavailable) {
            mediaUrls.push(await fileToDataUrl(feedImageFile));
          } else {
            throw uploadError;
          }
        }
      }
      await api.feeds.create({
        feed_type: feedCompose.feed_type,
        visibility_scope: feedCompose.visibility_scope,
        caption: feedCompose.caption.trim(),
        tags: feedCompose.tagsText.split(',').map((v) => v.trim()).filter(Boolean),
        pet_id: feedCompose.pet_id || null,
        media_urls: mediaUrls,
      });
      setFeedCompose(DEFAULT_FEED_COMPOSE);
      resetFeedImage();
      await loadAll(feedTab);
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      let message = uiErrorMessage(e, t('guardian.alert.feed_create_failed', '피드 등록에 실패했습니다.'));
      if (/10MB|file size|max/i.test(raw)) message = '파일 크기가 너무 큽니다.';
      else if (/JPG|JPEG|PNG|WEBP|type/i.test(raw)) message = '지원하지 않는 파일 형식입니다.';
      else if (/Storage not configured|no_r2|storage/i.test(raw)) message = '저장소 연결에 실패했습니다.';
      else if (/upload/i.test(raw)) message = '업로드 중 오류가 발생했습니다.';
      setFeedUploadError(message);
      setError(message);
    } finally {
      setIsPostingFeed(false);
    }
  }

  async function removeFeedPost(feedId: string) {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await api.feeds.remove(feedId);
      await loadAll(feedTab);
    } catch (e) {
      setError(uiErrorMessage(e, '게시글 삭제에 실패했습니다.'));
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

  function renderDropdownRows(
    label: string,
    values: string[],
    options: Option[],
    onChange: (next: string[]) => void,
  ) {
    const selected = normalizeMultiStableIds(values, options);
    const rows = selected.length > 0 ? selected : [''];
    const remaining = options.filter((o) => !selected.includes(o.id));
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((rowValue, index) => {
            const rowOptions = options.filter((o) => o.id === rowValue || !selected.includes(o.id));
            return (
              <div key={`${label}-${index}-${rowValue || 'empty'}`} style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-select"
                  value={rowValue}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    if (!rowValue) {
                      if (!nextValue) return;
                      onChange(normalizeUniqueIds([...selected, nextValue]));
                      return;
                    }
                    const next = [...selected];
                    if (!nextValue) next.splice(index, 1);
                    else next[index] = nextValue;
                    onChange(normalizeUniqueIds(next));
                  }}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {rowOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onChange(selected.filter((_, i) => i !== index))}
                  disabled={!rowValue}
                  aria-label={t('common.delete', 'Delete')}
                  title={t('common.delete', 'Delete')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 6l1 14h8l1-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 10v7M14 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (remaining.length === 0) return;
                onChange(normalizeUniqueIds([...selected, remaining[0].id]));
              }}
              disabled={remaining.length === 0}
              aria-label={t('common.add', 'Add')}
              title={t('common.add', 'Add')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderDiseaseRows(
    rows: Array<{ groupId: string; diseaseId: string }>,
    onChange: (next: Array<{ groupId: string; diseaseId: string }>) => void,
  ) {
    const normalizedRows = rows
      .map((row) => {
        const groupId = normalizeSingleStableId(row.groupId, optDiseaseGroup);
        const diseaseId = normalizeSingleStableId(row.diseaseId, optDisease);
        return { groupId, diseaseId };
      })
      .filter((row) => row.groupId || row.diseaseId);
    const displayRows = normalizedRows.length > 0 ? normalizedRows : [{ groupId: '', diseaseId: '' }];
    return (
      <div className="form-group">
        <label className="form-label">{t('master.disease_group', 'Disease Group')} / {t('master.disease_type', 'Disease')}</label>
        <div style={{ display: 'grid', gap: 8 }}>
          {displayRows.map((row, index) => {
            const diseaseOptions = optDisease
              .filter((d) => !row.groupId || d.parentId === row.groupId)
              .filter((d) => d.id === row.diseaseId || !displayRows.some((r, i) => i !== index && r.diseaseId === d.id));
            return (
              <div key={`disease-row-${index}-${row.groupId}-${row.diseaseId}`} style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr auto' }}>
                <select
                  className="form-select"
                  value={row.groupId}
                  onChange={(e) => {
                    const nextGroupId = e.target.value;
                    const next = [...displayRows];
                    const keepDisease = optDisease.some((d) => d.id === next[index].diseaseId && d.parentId === nextGroupId);
                    next[index] = { groupId: nextGroupId, diseaseId: keepDisease ? next[index].diseaseId : '' };
                    onChange(next.filter((r) => r.groupId || r.diseaseId));
                  }}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {optDiseaseGroup.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <select
                  className="form-select"
                  value={row.diseaseId}
                  onChange={(e) => {
                    const next = [...displayRows];
                    next[index] = { ...next[index], diseaseId: e.target.value };
                    onChange(next.filter((r) => r.groupId || r.diseaseId));
                  }}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {diseaseOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onChange(displayRows.filter((_, i) => i !== index))}
                  disabled={!row.groupId && !row.diseaseId}
                  aria-label={t('common.delete', 'Delete')}
                  title={t('common.delete', 'Delete')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 6l1 14h8l1-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 10v7M14 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onChange([...displayRows.filter((r) => r.groupId || r.diseaseId), { groupId: '', diseaseId: '' }])}
              aria-label={t('common.add', 'Add')}
              title={t('common.add', 'Add')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function summarizeOptions(options: Option[], raw: string[] | string | null | undefined, max = 2): { text: string; tooltip: string } {
    const ids = normalizeMultiStableIds(raw, options);
    if (ids.length === 0) return { text: t('common.none', '-'), tooltip: '' };
    const labels = ids.map((id) => labelOf(options, id, t('common.none', '-')));
    const text = labels.length > max ? `${labels.slice(0, max).join(', ')} +${labels.length - max}` : labels.join(', ');
    return { text, tooltip: labels.join('\n') };
  }

  function renderCombinedHealthChart(weightRows: PetWeightLog[], measurementRows: PetHealthMeasurementLog[]) {
    if (!weightRows.length && !measurementRows.length) {
      return <div className="weight-chart-empty text-sm text-muted">표시할 건강 기록이 없습니다.</div>;
    }
    const width = 720;
    const height = 260;
    const pad = 34;
    const rightPad = 46;
    const usableW = width - pad - rightPad;
    const usableH = height - pad * 2;

    const allTimes = [
      ...weightRows.map((row) => new Date(row.measured_at).getTime()),
      ...measurementRows.map((row) => new Date(row.measured_at).getTime()),
    ].filter((v) => Number.isFinite(v));
    if (!allTimes.length) return <div className="weight-chart-empty text-sm text-muted">표시할 건강 기록이 없습니다.</div>;
    const minT = Math.min(...allTimes);
    const maxT = Math.max(...allTimes);
    const tSpan = Math.max(1, maxT - minT);

    const normalizeX = (timeMs: number) => pad + ((timeMs - minT) / tSpan) * usableW;
    const weightValues = weightRows.map((row) => Number(row.weight_value));
    const measurementValues = measurementRows.map((row) => Number(row.value));
    const minW = weightValues.length ? Math.min(...weightValues) : 0;
    const maxW = weightValues.length ? Math.max(...weightValues) : 1;
    const minM = measurementValues.length ? Math.min(...measurementValues) : 0;
    const maxM = measurementValues.length ? Math.max(...measurementValues) : 1;
    const wSpan = Math.max(0.0001, maxW - minW);
    const mSpan = Math.max(0.0001, maxM - minM);
    const normalizeYW = (value: number) => pad + (1 - ((value - minW) / wSpan)) * usableH;
    const normalizeYM = (value: number) => pad + (1 - ((value - minM) / mSpan)) * usableH;

    const sortedWeights = [...weightRows].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
    const sortedMeasurements = [...measurementRows].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

    const weightPath = sortedWeights
      .map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${normalizeX(new Date(row.measured_at).getTime())} ${normalizeYW(Number(row.weight_value))}`)
      .join(' ');
    const measurementPath = sortedMeasurements
      .map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${normalizeX(new Date(row.measured_at).getTime())} ${normalizeYM(Number(row.value))}`)
      .join(' ');

    return (
      <div className="weight-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Combined health trend chart">
          <rect x="0" y="0" width={width} height={height} rx="12" fill="#f7fbff" />
          <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#b8c8de" />
          <line x1={width - rightPad} y1={pad} x2={width - rightPad} y2={height - pad} stroke="#d6deec" />
          <line x1={pad} y1={height - pad} x2={width - rightPad} y2={height - pad} stroke="#b8c8de" />
          {weightPath && <path d={weightPath} fill="none" stroke="#1a73e8" strokeWidth="3" />}
          {measurementPath && <path d={measurementPath} fill="none" stroke="#ef6c00" strokeWidth="3" />}
          <text x={pad} y={16} fontSize="11" fill="#1a73e8">{`W ${maxW.toFixed(2)} / ${minW.toFixed(2)}`}</text>
          <text x={width - rightPad + 4} y={16} fontSize="11" fill="#ef6c00">{`M ${maxM.toFixed(2)} / ${minM.toFixed(2)}`}</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="gm-page">
      {/* ── Compact pet header ── */}
      <div className="gm-pet-header">
        <div className="gm-pet-avatar">
          {selectedPet ? selectedPet.name[0].toUpperCase() : '🐾'}
        </div>
        <div className="gm-pet-info">
          <h2>{selectedPet?.name || t('guardian.empty.no_pets_title', 'No pet selected')}</h2>
          {selectedPet && (
            <p>
              {labelOf(optPetType, selectedPet.pet_type_id, '')}
              {labelOf(optBreed, selectedPet.breed_id, '') ? ` · ${labelOf(optBreed, selectedPet.breed_id, '')}` : ''}
              {labelOf(optGender, selectedPet.gender_id, '') ? ` · ${labelOf(optGender, selectedPet.gender_id, '')}` : ''}
            </p>
          )}
        </div>
        {selectedPet && (
          <div className="gm-pet-stats">
            <div className="gm-pet-stat"><strong>{feeds.length}</strong><span>{t('guardian.stats.posts', 'Posts')}</span></div>
            <div className="gm-pet-stat"><strong>{albumMedia.length}</strong><span>{t('guardian.stats.media', 'Media')}</span></div>
            <div className="gm-pet-stat"><strong>{friendCount}</strong><span>{t('guardian.stats.friends', 'Friends')}</span></div>
          </div>
        )}
        {selectedPet && petSummaryDetails && (
          <div className="gm-pet-chips">
            {petSummaryDetails.diet.text && <span className="gm-pet-chip" title={petSummaryDetails.diet.tooltip}>{petSummaryDetails.diet.text}</span>}
            {petSummaryDetails.disease.text && <span className="gm-pet-chip" title={petSummaryDetails.disease.tooltip}>{petSummaryDetails.disease.text}</span>}
            {petSummaryDetails.vaccination.text && <span className="gm-pet-chip" title={petSummaryDetails.vaccination.tooltip}>{petSummaryDetails.vaccination.text}</span>}
          </div>
        )}
        <div className="gm-header-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
          <Link className="btn btn-secondary btn-sm" to="/">{t('guardian.main.public_feed', 'Feed')}</Link>
        </div>
      </div>

      {/* ── Sticky tab bar ── */}
      <div className="gm-tabs">
        <button className={`gm-tab${petTab === 'timeline' ? ' active' : ''}`} onClick={() => setPetTab('timeline')}>
          <span className="gm-tab-icon">📋</span>{t('guardian.tab.timeline', 'Timeline')}
        </button>
        <button className={`gm-tab${petTab === 'health' ? ' active' : ''}`} onClick={() => setPetTab('health')}>
          <span className="gm-tab-icon">❤️</span>{t('guardian.tab.health', 'Health')}
        </button>
        <button className={`gm-tab${petTab === 'services' ? ' active' : ''}`} onClick={() => setPetTab('services')}>
          <span className="gm-tab-icon">🛎️</span>{t('guardian.tab.services', 'Services')}
        </button>
        <button className={`gm-tab${petTab === 'gallery' ? ' active' : ''}`} onClick={() => setPetTab('gallery')}>
          <span className="gm-tab-icon">🖼️</span>{t('guardian.tab.gallery', 'Gallery')}
        </button>
        <button className={`gm-tab${petTab === 'profile' ? ' active' : ''}`} onClick={() => setPetTab('profile')}>
          <span className="gm-tab-icon">👤</span>{t('guardian.tab.profile', 'Profile')}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ margin: '12px 24px 0' }}>{error}</div>}

      {loading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : (
        <div className="gm-content">
          <div className="gm-layout">
            <main className="gm-main">
              {pets.length === 0 && (
                <div className="gm-section">
                  <div className="gm-section-body gm-empty">
                    <div className="gm-empty-icon">🐾</div>
                    <div className="gm-empty-title">{t('guardian.empty.no_pets_title', 'Register your first pet')}</div>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{t('guardian.empty.no_pets_desc', 'Without a pet profile, feed/health/booking links are limited.')}</p>
                    <button className="btn btn-primary" onClick={openCreatePet}>{t('guardian.empty.no_pets_cta', 'Register your first pet')}</button>
                  </div>
                </div>
              )}

              {/* ── Gallery ── */}
              {petTab === 'gallery' && (
                <>
                  {albumMedia.length > 0 ? (
                    <div className="gm-gallery-grid">
                      {albumMedia.map((item, idx) => (
                        <div key={item.id} className="gm-gallery-tile" onClick={() => { setLightboxItems(albumMedia.map((m) => m.media_url)); setLightboxIndex(idx); }}>
                          <img src={item.media_url} alt={item.caption || 'media'} loading="lazy" />
                          <div className="gm-gallery-tile-overlay"><span>🖼️</span></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="gm-empty" style={{ padding: 40 }}>
                      <div className="gm-empty-icon">🖼️</div>
                      <div className="gm-empty-title">{t('guardian.gallery.empty', '미디어가 없습니다')}</div>
                    </div>
                  )}
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
                </>
              )}

              {/* ── Timeline ── */}
              {petTab === 'timeline' && (
                <>
                  <div className="gm-compose-bar" onClick={() => setComposeModalOpen(true)}>
                    <div className="gm-compose-avatar">{selectedPet ? selectedPet.name[0].toUpperCase() : '?'}</div>
                    <div className="gm-compose-placeholder">{t('guardian.feed.compose_placeholder', '무슨 일이 있었나요?')}</div>
                    <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>📷</span>
                  </div>
                  <div className="gm-section">
                    <div className="gm-feed-tabs">
                      <button className={`gm-feed-tab${feedTab === 'all' ? ' active' : ''}`} onClick={() => { setFeedTab('all'); loadAll('all'); }}>{t('guardian.feed.filter.all', 'All')}</button>
                      <button className={`gm-feed-tab${feedTab === 'friends' ? ' active' : ''}`} onClick={() => { setFeedTab('friends'); loadAll('friends'); }}>{t('guardian.feed.filter.friends', 'Friends Feed')}</button>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div className="sns-feed-list">
                        {feeds.map((f) => (
                          <article key={f.id} className="sns-card">
                            <div className="sns-card-header">
                              <div className="sns-author-row">
                                <div className="sns-avatar">{(f.author_email || '?')[0].toUpperCase()}</div>
                                <div className="sns-author-info">
                                  <p className="sns-meta">{feedTypeLabel(t, f.feed_type)}</p>
                                  <span className="sns-author-name">{f.author_email || t('common.none', '-')}</span>
                                  <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'))}</p>
                                </div>
                              </div>
                              <div className="sns-card-right">
                                <div className="sns-badges"><span className="badge badge-green">{visibilityLabel(t, f.visibility_scope)}</span></div>
                                {currentUserId && f.author_user_id === currentUserId && (
                                  <button className="btn btn-danger btn-sm" onClick={() => removeFeedPost(f.id)}>{t('common.delete', 'Delete')}</button>
                                )}
                              </div>
                            </div>
                            {f.pet_name && <span className="sns-pet-chip">{f.pet_name}</span>}
                            {f.caption && <p className="sns-caption">{f.caption}</p>}
                            {Array.isArray(f.media_urls) && f.media_urls[0] && (
                              <div className="sns-feed-image-wrap">
                                <img className="sns-feed-image" src={f.media_urls[0]} alt={f.caption || 'feed'} loading="lazy" />
                              </div>
                            )}
                            <div className="sns-actions">
                              <button className="sns-action-btn" onClick={() => api.feeds.like(f.id).then(() => loadAll(feedTab)).catch((e) => setError(uiErrorMessage(e, t('guardian.alert.like_failed', '좋아요 처리에 실패했습니다.'))))}>♥ {f.like_count || 0}</button>
                              <button className="sns-action-btn" onClick={() => api.feeds.comments.list(f.id).then(() => null).catch((e) => setError(uiErrorMessage(e, t('guardian.alert.comment_failed', '댓글을 불러오지 못했습니다.'))))}>○ {f.comment_count || 0}</button>
                            </div>
                          </article>
                        ))}
                        {feeds.length === 0 && (
                          <div className="gm-empty" style={{ padding: '24px 0' }}>
                            <div className="gm-empty-icon">📭</div>
                            <p>{t('guardian.feed.no_feeds', 'No feeds to display.')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Health ── */}
              {petTab === 'health' && (
                <>
                  <div className="gm-health-stats">
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.current_weight', '현재 몸무게')}</div>
                      <div className="gm-health-stat-value">{weightSummary?.latest_weight ?? selectedPet?.current_weight ?? '-'}</div>
                    </div>
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.last_measured', '최근 측정일')}</div>
                      <div className="gm-health-stat-value" style={{ fontSize: 14 }}>{formatDate(weightSummary?.latest_measured_at, '-')}</div>
                    </div>
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.latest_measurement', '최근 질병 수치')}</div>
                      <div className="gm-health-stat-value">{measurementSummary?.latest_value ?? '-'}</div>
                    </div>
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.judgement', '최근 판단 상태')}</div>
                      <div className="gm-health-stat-value" style={{ fontSize: 14 }}>{measurementSummary?.latest_judgement_label || measurementSummary?.latest_judgement_level || '-'}</div>
                    </div>
                  </div>
                  <div className="gm-section">
                    <div className="gm-section-header">
                      <span className="gm-section-title">{t('guardian.health.chart_title', '건강 추이')}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setWeightModalOpen(true)}>{t('guardian.health.add_weight', '몸무게 추가')}</button>
                        <button className="btn btn-secondary btn-sm" onClick={openCreateHealthMeasurementModal}>{t('guardian.health.add_measurement', '수치 추가')}</button>
                      </div>
                    </div>
                    <div className="gm-section-body">
                      <div className="gm-period-chips" style={{ marginBottom: 12 }}>
                        {(['7d', '15d', '1m', '3m', '6m', '1y', 'all'] as const).map((range) => (
                          <button key={range} className={`gm-period-chip${weightRange === range ? ' active' : ''}`} onClick={() => setWeightRange(range)}>
                            {range === 'all' ? t('common.all', '전체') : range}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        {renderSelect(t('guardian.health.measurement_item', '질병 수치 항목'), selectedMeasurementItemId, optMeasurement.filter((m) => measurementLogs.some((log) => log.measurement_item_id === m.id)), (v) => setSelectedMeasurementItemId(v))}
                      </div>
                      {renderCombinedHealthChart(weightLogs, measurementLogs.filter((log) => !selectedMeasurementItemId || log.measurement_item_id === selectedMeasurementItemId))}
                    </div>
                  </div>
                  <div className="gm-section">
                    <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.weight_log', '몸무게 기록')}</span></div>
                    <div className="gm-section-body">
                      <div className="guardian-pet-list">
                        {weightLogs.map((log) => (
                          <div key={log.id} className="guardian-pet-item">
                            <p className="text-sm">{new Date(log.measured_at).toLocaleDateString()} · {log.weight_value} kg</p>
                            <div className="td-actions"><button className="btn btn-danger btn-sm" onClick={() => removeWeightLog(log.id)}>{t('common.delete', '삭제')}</button></div>
                          </div>
                        ))}
                        {weightLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.health.no_weight_logs', '몸무게 기록이 없습니다.')}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="gm-section">
                    <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.measurement_log', '질병 수치 로그')}</span></div>
                    <div className="gm-section-body">
                      <div className="guardian-pet-list">
                        {measurementLogs.filter((log) => !selectedMeasurementItemId || log.measurement_item_id === selectedMeasurementItemId).map((log) => (
                          <div key={log.id} className="guardian-pet-item">
                            <p className="text-sm">{new Date(log.measured_at).toLocaleString()} · {log.value}{log.judgement_label ? ` · ${log.judgement_label}` : ''}</p>
                            <div className="td-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => openEditHealthMeasurementLog(log)}>{t('common.edit', '수정')}</button>
                              <button className="btn btn-danger btn-sm" onClick={() => removeHealthMeasurementLog(log.id)}>{t('common.delete', '삭제')}</button>
                            </div>
                          </div>
                        ))}
                        {measurementLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.health.no_measurement_logs', '질병 수치 기록이 없습니다.')}</p>}
                      </div>
                    </div>
                  </div>
                  {healthFeeds.length > 0 && (
                    <div className="gm-section">
                      <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.updates', 'Health Updates')}</span></div>
                      <div className="gm-section-body">
                        {healthFeeds.map((f) => (
                          <article key={f.id} className="sns-card">
                            <p className="sns-meta">{feedTypeLabel(t, f.feed_type)}</p>
                            <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'))}</p>
                            <p>{f.caption || t('common.none', '-')}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Services ── */}
              {petTab === 'services' && (
                <div className="gm-section">
                  <div className="gm-section-header"><span className="gm-section-title">{t('guardian.tab.services', 'Services & Bookings')}</span></div>
                  <div className="gm-section-body">
                    {bookings.filter((b) => !selectedPet || !b.pet_id || b.pet_id === selectedPet.id).map((b) => (
                      <div key={b.id} className="guardian-pet-item">
                        <p className="text-sm">#{b.id.slice(0, 8)} · {b.status}</p>
                        <p className="text-sm text-muted">{formatDate(b.updated_at, t('common.none', '-'))}</p>
                      </div>
                    ))}
                    {bookings.filter((b) => !selectedPet || !b.pet_id || b.pet_id === selectedPet.id).length === 0 && (
                      <div className="gm-empty" style={{ padding: '20px 0' }}>
                        <div className="gm-empty-icon">📅</div>
                        <p>{t('guardian.services.no_bookings', '예약 내역이 없습니다.')}</p>
                      </div>
                    )}
                    {serviceFeeds.length > 0 && <p className="mt-2 text-sm">{t('guardian.services.completed_feeds', '완료 피드')} {serviceFeeds.length}{t('common.count_suffix', '건')}</p>}
                  </div>
                </div>
              )}

              {/* ── Profile ── */}
              {petTab === 'profile' && selectedPet && (
                <div className="gm-section">
                  <div className="gm-section-header">
                    <span className="gm-section-title">{t('guardian.tab.profile', 'Pet Profile')}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditPet(selectedPet.id)}>{t('common.edit', 'Edit')}</button>
                  </div>
                  <div className="gm-section-body">
                    <div className="gm-info-grid" style={{ marginBottom: 16 }}>
                      <div className="gm-info-item"><div className="gm-info-label">{t('guardian.form.name', 'Name')}</div><div className="gm-info-value">{selectedPet.name}</div></div>
                      <div className="gm-info-item"><div className="gm-info-label">{t('master.pet_type', 'Pet Type')}</div><div className="gm-info-value">{labelOf(optPetType, selectedPet.pet_type_id, t('common.none', '-'))}</div></div>
                      <div className="gm-info-item"><div className="gm-info-label">{t('master.pet_breed', 'Breed')}</div><div className="gm-info-value">{labelOf(optBreed, selectedPet.breed_id, t('common.none', '-'))}</div></div>
                      <div className="gm-info-item"><div className="gm-info-label">{t('master.pet_gender', 'Gender')}</div><div className="gm-info-value">{labelOf(optGender, selectedPet.gender_id, t('common.none', '-'))}</div></div>
                      <div className="gm-info-item"><div className="gm-info-label">{t('master.life_stage', 'Life Stage')}</div><div className="gm-info-value">{labelOf(optLifeStage, selectedPet.life_stage_id, t('common.none', '-'))}</div></div>
                      <div className="gm-info-item"><div className="gm-info-label">{t('guardian.form.birthday', 'Birthday')}</div><div className="gm-info-value">{selectedPet.birthday || selectedPet.birth_date || t('common.none', '-')}</div></div>
                      <div className="gm-info-item"><div className="gm-info-label">{t('guardian.form.current_weight', 'Weight')}</div><div className="gm-info-value">{selectedPet.current_weight ?? selectedPet.weight_kg ?? t('common.none', '-')}</div></div>
                      <div className="gm-info-item"><div className="gm-info-label">{t('master.health_condition_level', 'Health Level')}</div><div className="gm-info-value">{labelOf(optHealthLevel, selectedPet.health_condition_level_id, t('common.none', '-'))}</div></div>
                    </div>
                    <div className="gm-health-tags">
                      {petSummaryDetails?.diet.text && <span className="gm-health-tag" title={petSummaryDetails.diet.tooltip}>{t('master.diet_type', 'Diet')}: {petSummaryDetails.diet.text}</span>}
                      {petSummaryDetails?.disease.text && <span className="gm-health-tag" title={petSummaryDetails.disease.tooltip}>{t('master.disease_type', 'Disease')}: {petSummaryDetails.disease.text}</span>}
                      {petSummaryDetails?.vaccination.text && <span className="gm-health-tag" title={petSummaryDetails.vaccination.tooltip}>{t('master.vaccination_type', 'Vaccination')}: {petSummaryDetails.vaccination.text}</span>}
                      {petSummaryDetails?.temperament.text && <span className="gm-health-tag" title={petSummaryDetails.temperament.tooltip}>{t('master.temperament_type', 'Temperament')}: {petSummaryDetails.temperament.text}</span>}
                      {petSummaryDetails?.color.text && <span className="gm-health-tag" title={petSummaryDetails.color.tooltip}>{t('master.pet_color', 'Color')}: {petSummaryDetails.color.text}</span>}
                      {petSummaryDetails?.grooming.text && <span className="gm-health-tag" title={petSummaryDetails.grooming.tooltip}>{t('master.grooming_cycle', 'Grooming')}: {petSummaryDetails.grooming.text}</span>}
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* ── Sidebar ── */}
            <aside className="gm-sidebar">
              <div className="gm-sidebar-section">
                <div className="gm-sidebar-header">{t('guardian.mypets.title', 'My Pets')}</div>
                <div className="gm-sidebar-body">
                  <button className="gm-quick-btn primary" style={{ width: '100%', marginBottom: 8 }} onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
                  {pets.map((p) => (
                    <div key={p.id} className="gm-pet-select-row">
                      <button className={`gm-pet-select-btn${selectedPet?.id === p.id ? ' active' : ''}`} onClick={() => setSelectedPetId(p.id)}>{p.name}</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditPet(p.id)}>{t('common.edit', 'Edit')}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => removePet(p.id)}>{t('common.delete', '삭제')}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gm-sidebar-section">
                <div className="gm-sidebar-header">{t('guardian.sidebar.quick_actions', 'Quick Actions')}</div>
                <div className="gm-sidebar-body">
                  <div className="gm-quick-actions">
                    <button className="gm-quick-btn" onClick={() => setComposeModalOpen(true)}>✏️ {t('guardian.sidebar.post', 'Post')}</button>
                    <button className="gm-quick-btn" onClick={() => setWeightModalOpen(true)}>⚖️ {t('guardian.health.add_weight', 'Weight')}</button>
                    <button className="gm-quick-btn" onClick={openCreateHealthMeasurementModal}>📊 {t('guardian.health.add_measurement', 'Measure')}</button>
                    <button className="gm-quick-btn" onClick={() => setPetTab('gallery')}>🖼️ {t('guardian.tab.gallery', 'Gallery')}</button>
                  </div>
                </div>
              </div>
              {selectedPet && (
                <div className="gm-sidebar-section">
                  <div className="gm-sidebar-header">{t('guardian.sidebar.health_snapshot', 'Health Snapshot')}</div>
                  <div className="gm-sidebar-body">
                    <p className="text-sm">{t('guardian.health.current_weight', '현재 몸무게')}: <strong>{weightSummary?.latest_weight ?? selectedPet.current_weight ?? '-'}</strong></p>
                    <p className="text-sm">{t('guardian.health.delta', '직전 대비')}: <strong>{weightSummary?.delta_from_prev ?? '-'}{weightSummary?.delta_from_prev != null ? ' kg' : ''}</strong></p>
                    <p className="text-sm">{t('guardian.health.latest_measurement', '최근 수치')}: <strong>{measurementSummary?.latest_value ?? '-'}</strong></p>
                    <p className="text-sm" style={{ marginTop: 6 }}>{t('guardian.health.log_count', '수치 기록 수')}: <strong>{measurementLogs.length}</strong></p>
                  </div>
                </div>
              )}
              <div className="gm-sidebar-section">
                <div className="gm-sidebar-header">{t('guardian.summary.health_booking', 'Bookings')}</div>
                <div className="gm-sidebar-body">
                  <p className="text-sm">{t('guardian.summary.latest_booking', 'Latest')}: <strong>{latestBooking?.status || t('common.none', '-')}</strong></p>
                  <p className="text-sm">{t('guardian.summary.pending_completion_approvals', 'Pending')}: <strong>{pendingApprovalsCount}</strong></p>
                </div>
              </div>
              <div className="gm-sidebar-section">
                <div className="gm-sidebar-header">{t('guardian.connections.title', 'Connections')}</div>
                <div className="gm-sidebar-body">
                  <p className="text-sm">{t('guardian.connections.connected_suppliers', 'Connected')}: <strong>{friendCount}</strong></p>
                  <p className="text-sm">{t('guardian.connections.pending_friend_requests', 'Pending')}: <strong>{pendingRequests.length}</strong></p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ── Compose Modal ── */}
      {composeModalOpen && (
        <div className="modal-overlay" onClick={() => setComposeModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('guardian.feed.create_title', 'Create Feed Post')}</h3>
              <button className="modal-close" onClick={() => setComposeModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="feed-compose-layout">
                <div className="feed-compose-media">
                  <label className="form-label">{t('guardian.feed.photo_upload', '사진 업로드')}</label>
                  <div className="gallery-upload-dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFeedImageSelected(e.dataTransfer.files?.[0] || null); }}>
                    <input ref={fileInputRef} type="file" className="gallery-upload-file-input" accept="image/jpeg,image/jpg,image/png,image/webp" capture="environment" onChange={(e) => handleFeedImageSelected(e.target.files?.[0] || null)} />
                    <p>{t('guardian.feed.photo_hint', '드래그 앤 드롭 또는 파일 선택')}</p>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>{t('guardian.feed.photo_select', '사진 선택')}</button>
                  </div>
                  {feedImagePreviewUrl && (
                    <div className="feed-compose-preview">
                      <img src={feedImagePreviewUrl} alt={t('guardian.feed.photo_preview', '업로드 미리보기')} />
                      <button type="button" className="btn btn-secondary btn-sm" onClick={resetFeedImage}>{t('guardian.feed.photo_reselect', '다시 선택')}</button>
                    </div>
                  )}
                  {feedUploadError && <div className="alert alert-error mt-2">{feedUploadError}</div>}
                  {isPostingFeed && feedUploadProgress > 0 && (
                    <div className="gallery-upload-progress mt-2">
                      <div className="gallery-upload-progress-bar" style={{ width: `${feedUploadProgress}%` }} />
                      <span>{t('guardian.feed.uploading', '업로드 중')} {feedUploadProgress}%</span>
                    </div>
                  )}
                </div>
                <div className="feed-compose-fields">
                  <div className="form-row col2">
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
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('guardian.feed.linked_pet', 'Linked Pet')}</label>
                    <select className="form-select" value={feedCompose.pet_id} onChange={(e) => setFeedCompose((p) => ({ ...p, pet_id: e.target.value }))}>
                      <option value="">{t('common.none', 'None')}</option>
                      {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('guardian.feed.caption', 'Caption')}</label>
                    <textarea className="form-textarea" value={feedCompose.caption} onChange={(e) => setFeedCompose((p) => ({ ...p, caption: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('guardian.feed.tags', 'Tags (comma separated)')}</label>
                    <input className="form-input" value={feedCompose.tagsText} onChange={(e) => setFeedCompose((p) => ({ ...p, tagsText: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setComposeModalOpen(false)}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" disabled={isPostingFeed} onClick={createFeedPost}>{isPostingFeed ? t('guardian.feed.posting', '게시 중...') : t('guardian.feed.post', 'Post')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex >= 0 && lightboxItems.length > 0 && (
        <div className="gm-lightbox" onClick={() => setLightboxIndex(-1)}>
          {lightboxIndex > 0 && (
            <button className="gm-lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i - 1); }}>‹</button>
          )}
          <img className="gm-lightbox-img" src={lightboxItems[lightboxIndex]} alt="media" onClick={(e) => e.stopPropagation()} />
          {lightboxIndex < lightboxItems.length - 1 && (
            <button className="gm-lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i + 1); }}>›</button>
          )}
          <button className="gm-lightbox-close" onClick={() => setLightboxIndex(-1)}>✕</button>
        </div>
      )}

      {petModalOpen && (
        <div className="modal-overlay">
          <div className="modal guardian-pet-modal">
            <div className="modal-header">
              <h3 className="modal-title">{petMode === 'create' ? t('guardian.modal.add_pet', 'Add Pet') : t('guardian.modal.edit_pet', 'Edit Pet')}</h3>
              <button className="modal-close" onClick={closePetModal}>&times;</button>
            </div>
            <div className="modal-body guardian-modal-body">
              <div className="card-title mb-2">{wizardTitle}</div>

              {petWizardStep === 1 && (
                <>
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
                      <label className="form-label">{t('guardian.form.birthday', 'Birthday')}</label>
                      <input className="form-input" type="date" value={petForm.birthday} onChange={(e) => setPetForm((p) => ({ ...p, birthday: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('guardian.form.current_weight', 'Current Weight')}</label>
                      <input className="form-input" type="number" step="0.01" value={petForm.current_weight} onChange={(e) => setPetForm((p) => ({ ...p, current_weight: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}

              {petWizardStep === 2 && (
                <>
                  <div className="form-row col2">
                    {renderSelect(t('master.pet_type', 'Pet Type'), petForm.pet_type_id, optPetType, (v) => setPetForm((p) => ({ ...p, pet_type_id: v, breed_id: '' })), true)}
                    {renderSelect(t('master.pet_breed', 'Breed'), petForm.breed_id, breedOptionsFiltered, (v) => setPetForm((p) => ({ ...p, breed_id: v })))}
                  </div>
                </>
              )}

              {petWizardStep === 3 && (
                <>
                  <div className="form-row col2">
                    {renderSelect(t('master.pet_gender', 'Gender'), petForm.gender_id, optGender, (v) => setPetForm((p) => ({ ...p, gender_id: v })), true)}
                    {renderDropdownRows(
                      t('master.pet_color', 'Primary Color'),
                      petForm.color_ids,
                      optColor,
                      (next) => setPetForm((p) => ({ ...p, color_ids: normalizeUniqueIds(next) })),
                    )}
                  </div>
                </>
              )}

              {petWizardStep === 4 && (
                <>
                  <div className="form-row col1">
                    {renderDropdownRows(
                      t('master.vaccination_type', 'Vaccination'),
                      petForm.vaccination_ids,
                      optVaccination,
                      (next) => setPetForm((p) => ({ ...p, vaccination_ids: normalizeUniqueIds(next) })),
                    )}
                  </div>
                </>
              )}

              {petWizardStep === 5 && (
                <>
                  <div className="form-row col1">
                    {renderDiseaseRows(diseaseRows, (nextRows) => {
                      const dedupByDisease = new Map<string, { groupId: string; diseaseId: string }>();
                      for (const row of nextRows) {
                        if (!row.groupId || !row.diseaseId) continue;
                        dedupByDisease.set(row.diseaseId, row);
                      }
                      const normalizedRows = Array.from(dedupByDisease.values());
                      setDiseaseRows(normalizedRows.length ? normalizedRows : [{ groupId: '', diseaseId: '' }]);
                      setPetForm((p) => ({ ...p, disease_history_ids: normalizedRows.map((r) => r.diseaseId) }));
                    })}
                  </div>
                </>
              )}

              {petWizardStep === 6 && (
                <>
                  <div className="form-row col2">
                    {renderDropdownRows(
                      t('master.temperament_type', 'Temperament'),
                      petForm.temperament_ids,
                      optTemperament,
                      (next) => setPetForm((p) => ({ ...p, temperament_ids: normalizeUniqueIds(next) })),
                    )}
                    {renderSelect(t('master.activity_level', 'Activity Level'), petForm.activity_level_id, optActivity, (v) => setPetForm((p) => ({ ...p, activity_level_id: v })))}
                  </div>
                  <div className="form-row col2">
                    {renderSelect(t('master.diet_type', 'Diet Type'), petForm.diet_type_id, optDiet, (v) => setPetForm((p) => ({ ...p, diet_type_id: v })))}
                    {renderDropdownRows(
                      t('master.allergy_type', 'Allergy'),
                      petForm.allergy_ids,
                      optAllergy,
                      (next) => setPetForm((p) => ({ ...p, allergy_ids: normalizeUniqueIds(next) })),
                    )}
                  </div>
                  <div className="form-row col1">
                    {renderDropdownRows(
                      t('master.symptom_type', 'Symptom'),
                      petForm.symptom_tag_ids,
                      optSymptom,
                      (next) => setPetForm((p) => ({ ...p, symptom_tag_ids: normalizeUniqueIds(next) })),
                    )}
                  </div>
                </>
              )}

              {petWizardStep === 7 && (
                <>
                  <div className="form-row col2">
                    {renderSelect(t('master.coat_length', 'Coat Length'), petForm.coat_length_id, optCoatLength, (v) => setPetForm((p) => ({ ...p, coat_length_id: v })))}
                    {renderSelect(t('master.grooming_cycle', 'Grooming Cycle'), petForm.grooming_cycle_id, optGrooming, (v) => setPetForm((p) => ({ ...p, grooming_cycle_id: v })))}
                  </div>
                  <div className="form-row col1">
                    <div className="form-group">
                      <label className="form-label">{t('guardian.form.notes', 'Notes')}</label>
                      <textarea className="form-textarea" value={petForm.notes} onChange={(e) => setPetForm((p) => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <div style={{ display: 'flex', gap: 6, marginRight: 'auto', flexWrap: 'wrap' }}>
                {PET_WIZARD_STEPS.map(({ step, label }) => (
                  <button
                    key={step}
                    type="button"
                    className={`btn ${petWizardStep === step ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => gotoPetStep(step)}
                    title={label}
                  >
                    {step}. {label}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary" onClick={closePetModal}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-secondary" onClick={gotoPrevPetStep} disabled={petWizardStep === 1}>
                {t('common.previous', 'Previous')}
              </button>
              <button className="btn btn-secondary" onClick={gotoNextPetStep} disabled={petWizardStep === 7}>
                {t('common.next', 'Next')}
              </button>
              <button className="btn btn-primary" onClick={() => void savePet()}>
                {t('common.save', 'Save')}
              </button>
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

      {measurementModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMeasurementLogId
                  ? t('guardian.health.measurement.edit', '질병 수치 수정')
                  : t('guardian.health.measurement.add', '질병 수치 추가')}
              </h3>
              <button
                className="modal-close"
                onClick={() => {
                  setMeasurementModalOpen(false);
                  setEditingMeasurementLogId(null);
                  setMeasurementWizardStep(1);
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="pet-wizard-steps mb-2">
                <button className={`pet-wizard-step ${measurementWizardStep === 1 ? 'active' : ''}`} type="button">1 / 2</button>
                <button className={`pet-wizard-step ${measurementWizardStep === 2 ? 'active' : ''}`} type="button">2 / 2</button>
              </div>

              {measurementWizardStep === 1 && (
                <>
                  {renderSelect(t('guardian.health.measurement.disease', '질병'), measurementForm.disease_item_id, diseaseOptionsForHealth, (v) => setMeasurementForm((prev) => ({
                    ...prev,
                    disease_item_id: v,
                    device_type_item_id: '',
                    manufacturer_id: '',
                    brand_id: '',
                    model_id: '',
                    measurement_item_id: '',
                    measurement_context_id: '',
                  })), true)}
                  {renderSelect(t('guardian.health.measurement.device_type', '장치 유형'), measurementForm.device_type_item_id, healthDeviceOptions, (v) => setMeasurementForm((prev) => ({
                    ...prev,
                    device_type_item_id: v,
                    manufacturer_id: '',
                    brand_id: '',
                    model_id: '',
                    measurement_item_id: '',
                    measurement_context_id: '',
                  })), true)}
                  {renderSelect(t('guardian.health.measurement.manufacturer', '제조사'), measurementForm.manufacturer_id, manufacturerOptions, (v) => setMeasurementForm((prev) => ({
                    ...prev,
                    manufacturer_id: v,
                    brand_id: '',
                    model_id: '',
                  })))}
                  {renderSelect(t('guardian.health.measurement.brand', '브랜드'), measurementForm.brand_id, brandOptions, (v) => setMeasurementForm((prev) => ({
                    ...prev,
                    brand_id: v,
                    model_id: '',
                  })))}
                  {renderSelect(t('guardian.health.measurement.model', '모델'), measurementForm.model_id, modelOptions, (v) => setMeasurementForm((prev) => ({ ...prev, model_id: v })))}
                </>
              )}

              {measurementWizardStep === 2 && (
                <>
                  {renderSelect(t('guardian.health.measurement.item', '측정항목'), measurementForm.measurement_item_id, healthMeasurementOptions, (v) => setMeasurementForm((prev) => ({
                    ...prev,
                    measurement_item_id: v,
                    measurement_context_id: '',
                  })), true)}
                  {renderSelect(t('guardian.health.measurement.context', '측정 컨텍스트'), measurementForm.measurement_context_id, healthContextOptions, (v) => setMeasurementForm((prev) => ({ ...prev, measurement_context_id: v })))}
                  <div className="form-row col2">
                    <div className="form-group">
                      <label className="form-label">{t('guardian.health.measurement.value', '수치 값')} *</label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={measurementForm.value}
                        onChange={(e) => setMeasurementForm((prev) => ({ ...prev, value: e.target.value }))}
                      />
                    </div>
                    {renderSelect(t('guardian.health.measurement.unit', '단위'), measurementForm.unit_item_id, measurementUnitOptions, (v) => setMeasurementForm((prev) => ({ ...prev, unit_item_id: v })))}
                  </div>
                  <div className="form-row col2">
                    <div className="form-group">
                      <label className="form-label">{t('guardian.health.measurement.measured_at', '측정일')} *</label>
                      <input
                        className="form-input"
                        type="datetime-local"
                        value={measurementForm.measured_at}
                        onChange={(e) => setMeasurementForm((prev) => ({ ...prev, measured_at: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('guardian.health.measurement.memo', '메모')}</label>
                      <input
                        className="form-input"
                        value={measurementForm.memo}
                        onChange={(e) => setMeasurementForm((prev) => ({ ...prev, memo: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {measurementWizardStep === 1 ? (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setMeasurementModalOpen(false);
                      setEditingMeasurementLogId(null);
                      setMeasurementWizardStep(1);
                    }}
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setMeasurementWizardStep(2)}
                    disabled={!measurementForm.disease_item_id || !measurementForm.device_type_item_id}
                  >
                    {t('common.next', '다음')} &gt;
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => setMeasurementWizardStep(1)}>&lt; {t('common.previous', '이전')}</button>
                  <button className="btn btn-primary" onClick={editingMeasurementLogId ? updateHealthMeasurementLog : createHealthMeasurementLog}>
                    {t('common.save', 'Save')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
