// LLD §4 전체 DB 스키마 타입 정의

// ─── Admin 영역 (S1~S4) ───────────────────────────────────────────────

// S1: i18n_translations
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

// S2: master_categories
export interface MasterCategory {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// S2: master_items
export interface MasterItem {
  id: string;
  category_id: string;
  parent_item_id: string | null;
  code: string;
  name: string | null;
  description: string | null;
  sort_order: number;
  status: 'active' | 'inactive';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// S4: countries / currencies
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

// ─── Guardian 영역 (S5~S7) ───────────────────────────────────────────

// S5: users
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

// S6: user_profiles
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

// S6: pets
export interface Pet {
  id: string;
  guardian_user_id: string;
  name: string;
  microchip_number: string | null;
  pet_type_id: string | null;
  breed_id: string | null;
  gender_id: string | null;
  life_stage_id: string | null;
  body_size_id: string | null;
  country_id: string | null;
  diet_type_id: string | null;
  coat_length_id: string | null;
  coat_type_id: string | null;
  activity_level_id: string | null;
  health_level_id: string | null;
  birth_date: string | null;
  weight_kg: number | null;
  is_neutered: boolean;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility during migration
  gender_legacy?: string | null;
  species_legacy?: string | null;
}

// Health Records
export interface HealthRecord {
  id: string;
  pet_id: string;
  record_type: 'symptom' | 'disease' | 'vaccination' | 'checkup' | 'weight';
  symptom_id: string | null;
  disease_id: string | null;
  description: string | null;
  recorded_at: string;
  created_by_user_id: string;
  created_at: string;
}

// Pet Weight Logs (keeping for detailed tracking, though weight is also in HealthRecord type)
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

// ─── Feed 영역 ───────────────────────────────────────────────────────

export interface FeedPost {
  id: string;
  author_user_id: string;
  author_role: 'guardian' | 'provider' | 'admin';
  feed_type: 'guardian_post' | 'booking_completed' | 'health_update' | 'supplier_story' | 'pet_milestone';
  visibility_scope: 'public' | 'friends_only' | 'private';
  caption: string | null;
  status: 'published' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface FeedPostPet {
  id: string;
  post_id: string;
  pet_id: string;
  sort_order: number;
}

export interface FeedMedia {
  id: string;
  post_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: 'active' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface FeedLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface FeedPublishRequest {
  id: string;
  booking_id: string;
  supplier_id: string;
  guardian_id: string;
  content: string | null;
  media_urls: string; // JSON array
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at: string | null;
}

// ─── Provider 영역 ───────────────────────────────────────────────────

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

export interface Booking {
  id: string;
  supplier_id: string;
  guardian_id: string;
  pet_id: string | null;
  service_id: string | null;
  status: 'created' | 'in_progress' | 'service_completed' | 'publish_requested' | 'publish_approved' | 'publish_rejected' | 'cancelled';
  requested_date: string | null;
  requested_time: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
