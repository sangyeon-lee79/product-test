// GuardianMainPage에서 추출한 순수 타입·상수·유틸 함수
import { api, type MasterItem } from '../../lib/api';
import type { Lang } from '../../lib/i18n';

// ── 타입 ──────────────────────────────────────────────────
export type FeedTab = 'mine' | 'friends';
export type Mode = 'create' | 'edit';
export type PetProfileTab = 'timeline' | 'health' | 'services' | 'gallery' | 'profile' | 'report';
export type WeightRange = '7d' | '15d' | '1m' | '3m' | '6m' | '1y' | 'all';
export type PetWizardStep = 1 | 2 | 3 | 4 | 5 | 6;
export type MeasurementWizardStep = 1 | 2; // kept for backwards compat

export type Option = {
  id: string;
  key: string;
  label: string;
  i18nKey?: string;
  parentId?: string | null;
  metadata?: Record<string, unknown>;
};

export type PetForm = {
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

export type FeedCompose = {
  feed_type: 'guardian_post' | 'health_update' | 'pet_milestone' | 'supplier_story' | 'supplier_post';
  visibility_scope: 'public' | 'friends_only' | 'private' | 'connected_only' | 'booking_related_only';
  caption: string;
  tagsText: string;
  pet_id: string;
  post_type?: string;
};

export type MeasurementForm = {
  guardian_device_id: string;
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
};

export type GuardianPetOptions = {
  optPetType: Option[];
  optBreed: Option[];
  optGender: Option[];
  optLifeStage: Option[];
  optColor: Option[];
  optAllergy: Option[];
  optDisease: Option[];
  optDiseaseGroup: Option[];
  optVaccination: Option[];
  optSymptom: Option[];
  optHealthLevel: Option[];
  optActivity: Option[];
  optDiet: Option[];
  optTemperament: Option[];
  optCoatLength: Option[];
  optGrooming: Option[];
};

// ── 상수 ──────────────────────────────────────────────────
export const PET_WIZARD_STEPS: Array<{ step: PetWizardStep; labelKey: string; fallback: string; emoji: string }> = [
  { step: 1, labelKey: 'guardian.pet_wizard.basic_info', fallback: '기본정보', emoji: '📋' },
  { step: 2, labelKey: 'master.pet_type', fallback: '펫종류', emoji: '🐾' },
  { step: 3, labelKey: 'master.pet_gender', fallback: '성별', emoji: '⚥' },
  { step: 4, labelKey: 'master.vaccination_type', fallback: '예방접종', emoji: '💉' },
  { step: 5, labelKey: 'master.temperament_type', fallback: '성격기질', emoji: '🐶' },
  { step: 6, labelKey: 'master.coat_length', fallback: '털길이', emoji: '✂️' },
];

export const DEFAULT_PET_FORM: PetForm = {
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

export const DEFAULT_FEED_COMPOSE: FeedCompose = {
  feed_type: 'guardian_post',
  visibility_scope: 'public',
  caption: '',
  tagsText: '',
  pet_id: '',
};

export const EMPTY_MEASUREMENT_FORM: MeasurementForm = {
  guardian_device_id: '',
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
};

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
export const FEED_MAX_EDGE = 1080;
export const FEED_MAX_MB = 0.5;

export const CATEGORY_KEYS: Record<string, string[]> = {
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
  exercise_type: ['master.exercise_type', 'exercise_type'],
  exercise_intensity: ['master.exercise_intensity', 'exercise_intensity'],
  exercise_location: ['master.exercise_location', 'exercise_location'],
};

// ── 순수 함수 ─────────────────────────────────────────────
export function toArray(raw: string[] | string | null | undefined): string[] {
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

export function normalizeUniqueIds(values: string[]): string[] {
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

export function normalizedCategoryBaseKey(categoryKey: string): string {
  return categoryKey.replace(/^master\./, '');
}

export function localizedMasterItemLabel(
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

export function toOption(
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

export function formatDate(value?: string | null, fallback = '-', locale?: string): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleString(locale);
  } catch {
    return value;
  }
}

/** Date only — locale-aware */
export function fmtDate(value?: string | null, fallback = '-', locale?: string): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value ?? fallback;
  }
}

/** Date + 24h time (no seconds) — locale-aware */
export function fmtDateTime(value?: string | null, fallback = '-', locale?: string): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleString(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return value ?? fallback;
  }
}

export function normalizeSingleStableId(value: string | null | undefined, options: Option[], allowUnknownWhenOptionsMissing = true): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (options.length === 0) return allowUnknownWhenOptionsMissing ? raw : '';
  const matched = options.find((o) => o.id === raw || o.key === raw);
  return matched?.id || '';
}

export function normalizeMultiStableIds(raw: string[] | string | null | undefined, options: Option[], allowUnknownWhenOptionsMissing = true): string[] {
  return normalizeUniqueIds(
    toArray(raw)
      .map((value) => normalizeSingleStableId(value, options, allowUnknownWhenOptionsMissing))
      .filter(Boolean),
  );
}

export function feedTypeLabel(
  t: (key: string, fallback?: string) => string,
  feedType: string,
  postType?: string | null,
): string {
  const normalizedPostType = String(postType || '').trim().toLowerCase();
  const normalizedFeedType = String(feedType || '').trim().toLowerCase();

  if (normalizedFeedType === 'supplier_post') {
    return t('feed.type.supplier_post', 'Store Post');
  }
  if (normalizedFeedType === 'booking_completed' || normalizedFeedType === 'grooming_record' || normalizedPostType === 'grooming') {
    return t('feed.type.grooming_record', 'Grooming');
  }
  if (normalizedFeedType === 'health_update' || normalizedFeedType === 'health_record') {
    return t('feed.type.health_record', 'Health');
  }
  return t('feed.type.general', 'Post');
}

export function visibilityLabel(t: (key: string, fallback?: string) => string, value: string): string {
  const map: Record<string, string> = {
    public: t('feed.visibility.public', 'Public'),
    friends: t('feed.visibility.friends', 'Friends'),
    friends_only: t('feed.visibility.friends', 'Friends'),
    connected_only: t('feed.visibility.friends', 'Friends'),
    booking_related_only: t('feed.visibility.friends', 'Friends'),
    private: t('feed.visibility.private', 'Private'),
  };
  return map[value] || value;
}

export function fileToDataUrl(file: File): Promise<string> {
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

export function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function loadImageElement(file: File): Promise<HTMLImageElement> {
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

export async function compressImageFile(
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

export function uiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return 'Unable to load data. Please try again shortly.';
    }
    return msg;
  }
  return fallback;
}

export function toDatetimeLocal(value?: string | null): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export async function loadCategoryItems(candidates: string[], lang?: Lang): Promise<MasterItem[]> {
  for (const key of candidates) {
    try {
      const normalizedKey = key.replace(/^master\./, '');
      if (normalizedKey === 'disease_group') {
        const rows = await api.master.public.diseaseGroups(lang);
        if (rows.length > 0) return rows;
        continue;
      }
      if (normalizedKey === 'disease_type') {
        const groups = await api.master.public.diseaseGroups(lang);
        if (groups.length === 0) continue;
        const diseaseRows = await Promise.all(
          groups.map((group) => api.master.public.diseases(group.id, lang).catch(() => [])),
        );
        const rows = diseaseRows.flat();
        if (rows.length > 0) return rows;
        continue;
      }
      if (normalizedKey === 'allergy_type') {
        const groups = await api.master.public.allergyGroups(lang);
        if (groups.length === 0) continue;
        const allergyRows = await Promise.all(
          groups.map((group) => api.master.public.allergies(group.id, lang).catch(() => [])),
        );
        const rows = allergyRows.flat();
        if (rows.length > 0) return rows;
        continue;
      }
      const rows = await api.master.public.items(key, undefined, lang);
      if (rows.length > 0) return rows;
    } catch {
      // try next candidate
    }
  }
  return [];
}
