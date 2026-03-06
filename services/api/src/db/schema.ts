// LLD §4 전체 DB 스키마 타입 정의
// 실제 쿼리는 각 라우트에서 env.DB (Hyperdrive) 를 통해 실행
// 각 슬라이스에서 해당 테이블 마이그레이션 추가

// ─── Admin 영역 (S1~S4) ───────────────────────────────────────────────

// S1: LLD §4.2 i18n_translations
export interface I18nTranslation {
  id: string;
  key: string;
  page: string | null;
  ko: string | null;
  en: string | null;
  ja: string | null;
  zh_cn: string | null;
  zh_tw: string | null;
  es: string | null;
  fr: string | null;
  de: string | null;
  pt: string | null;
  vi: string | null;
  th: string | null;
  id_lang: string | null;
  ar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// S2: LLD §4.2 master_categories
export interface MasterCategory {
  id: string;
  key: string; // 'industry'|'breed'|'disease'|'symptom'|'metric'|'unit'|'log_type'|'interest'|'country_ref'|'ad_slot'
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// S2: LLD §4.2 master_items
export interface MasterItem {
  id: string;
  category_id: string;
  key: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// S3: LLD §4.2 매핑 테이블
export interface DiseaseSymptomMap {
  id: string;
  disease_id: string;
  symptom_id: string;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface SymptomMetricMap {
  id: string;
  symptom_id: string;
  metric_id: string;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface MetricUnitMap {
  id: string;
  metric_id: string;
  unit_id: string;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface MetricLogtypeMap {
  id: string;
  metric_id: string;
  logtype_id: string;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
}

// S4: LLD §4.2 countries / currencies
export interface Country {
  id: string;
  code: string;
  name_key: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Currency {
  id: string;
  code: string;
  symbol: string;
  name_key: string;
  decimal_places: number;
  is_active: boolean;
  created_at: string;
}

export interface CountryCurrencyMap {
  id: string;
  country_id: string;
  currency_id: string;
  is_default: boolean;
}

// S11: LLD §4.2 ad_config / ad_slots
export interface AdConfig {
  id: string;
  global_enabled: boolean;
  updated_at: string;
}

export interface AdSlot {
  id: string;
  slot_key: string;
  ad_unit_id: string | null;
  is_enabled: boolean;
  no_health_zone: boolean; // 건강/질병 화면 차단 플래그
  impression_count: number;
  updated_at: string;
}

// ─── Guardian 영역 (S5~S7) ───────────────────────────────────────────

// S5: LLD §4.3 users
export interface User {
  id: string;
  email: string | null;
  password_hash: string | null;
  role: 'guardian' | 'provider' | 'admin';
  oauth_provider: 'google' | 'apple' | null;
  oauth_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// S6: LLD §4.3 user_profiles
export interface UserProfile {
  id: string;
  user_id: string;
  handle: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  bio_translations: Record<string, string>;
  country_id: string | null;
  language: string;
  timezone: string;
  interests: string[];
  created_at: string;
  updated_at: string;
}

// S6: LLD §4.3 pets
export interface Pet {
  id: string;
  guardian_id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed_id: string | null;
  birthday: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'unknown' | null;
  current_weight: number | null;
  weight_kg: number | null;
  is_neutered: boolean;
  microchip_no: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PetWeightLog {
  id: string;
  pet_id: string;
  weight_value: number;
  weight_unit_id: string | null;
  measured_at: string;
  recorded_by_user_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// S6: LLD §4.3 pet_diseases
export interface PetDisease {
  id: string;
  pet_id: string;
  disease_id: string;
  diagnosed_at: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

// S7: LLD §4.3 logs
export interface Log {
  id: string;
  pet_id: string;
  author_id: string;
  logtype_id: string;
  event_date: string;
  event_time: string | null;
  title: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  is_synced: boolean;
  sync_version: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// S7: LLD §4.3 log_values
export interface LogValue {
  id: string;
  log_id: string;
  metric_id: string;
  unit_id: string;
  numeric_value: number | null;
  text_value: string | null;
  sort_order: number;
  created_at: string;
}

// S7: LLD §4.3 log_media
export interface LogMedia {
  id: string;
  log_id: string;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
}

// S10: LLD §4.3 feeds
export interface Feed {
  id: string;
  author_id: string;
  pet_id: string | null;
  content: string | null;
  content_translations: Record<string, string>;
  media_urls: string[];
  tags: string[];
  like_count: number;
  comment_count: number;
  source_type: 'booking_completion' | null;
  source_id: string | null;
  provider_store_id: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// S10: unified pet album media
export interface PetAlbumMedia {
  id: string;
  pet_id: string;
  source_type: 'profile' | 'feed' | 'booking_completed' | 'health_record' | 'manual_upload';
  source_id: string | null;
  booking_id: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  tags: string[];
  uploaded_by_user_id: string;
  visibility_scope: 'public' | 'friends_only' | 'private' | 'guardian_supplier_only' | 'booking_related';
  is_primary: boolean;
  sort_order: number;
  status: 'active' | 'pending' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
}

// ─── Provider 영역 (S9~S10) ──────────────────────────────────────────

// S9: LLD §4.4 stores
export interface Store {
  id: string;
  owner_id: string;
  name: string;
  name_translations: Record<string, string>;
  description: string | null;
  description_translations: Record<string, string>;
  address: string | null;
  phone: string | null;
  country_id: string | null;
  currency_id: string | null;
  latitude: number | null;
  longitude: number | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// S9: LLD §4.4 services
export interface Service {
  id: string;
  store_id: string;
  name: string;
  name_translations: Record<string, string>;
  description: string | null;
  description_translations: Record<string, string>;
  price: number | null;
  currency_id: string | null;
  photo_urls: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// S10: LLD §4.4 bookings
export interface Booking {
  id: string;
  store_id: string;
  service_id: string;
  guardian_id: string;
  pet_id: string | null;
  status: 'requested' | 'accepted' | 'completed' | 'cancelled';
  requested_date: string | null;
  requested_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// S10: LLD §4.4 booking_completions
export interface BookingCompletion {
  id: string;
  booking_id: string;
  photo_urls: string[];
  message: string | null;
  is_shared: boolean;
  shared_feed_id: string | null;
  created_at: string;
}
