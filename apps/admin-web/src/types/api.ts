// API 응답 타입 정의

export interface I18nRow {
  id: string; key: string; page: string | null; is_active: number;
  ko: string | null; en: string | null; ja: string | null;
  zh_cn: string | null; zh_tw: string | null; es: string | null;
  fr: string | null; de: string | null; pt: string | null;
  vi: string | null; th: string | null; id_lang: string | null; ar: string | null;
  created_at: string; updated_at: string;
}

export interface MasterCategory {
  id: string; key: string; sort_order: number; is_active: number;
  ko_name?: string | null;
  ko?: string | null; en?: string | null; ja?: string | null;
  zh_cn?: string | null; zh_tw?: string | null; es?: string | null;
  fr?: string | null; de?: string | null; pt?: string | null;
  vi?: string | null; th?: string | null; id_lang?: string | null; ar?: string | null;
  created_at: string; updated_at: string;
}

export interface MasterItem {
  id: string; category_id: string; key: string; parent_id: string | null;
  sort_order: number; is_active: number; metadata: string;
  display_label?: string | null;
  created_at: string; updated_at: string; category_key?: string; ko_name?: string | null;
  ko?: string | null; en?: string | null; ja?: string | null;
  zh_cn?: string | null; zh_tw?: string | null; es?: string | null;
  fr?: string | null; de?: string | null; pt?: string | null;
  vi?: string | null; th?: string | null; id_lang?: string | null; ar?: string | null;
}

export interface Country {
  id: string; code: string; name_key: string; is_active: number;
  sort_order: number; created_at: string;
  ko_name?: string | null;
  default_currency_id?: string | null;
  default_currency_code?: string | null;
  ko?: string | null; en?: string | null; ja?: string | null;
  zh_cn?: string | null; zh_tw?: string | null; es?: string | null;
  fr?: string | null; de?: string | null; pt?: string | null;
  vi?: string | null; th?: string | null; id_lang?: string | null; ar?: string | null;
}

export interface Currency {
  id: string; code: string; symbol: string; name_key: string;
  decimal_places: number; is_active: number; created_at: string;
}

export interface Pet {
  id: string;
  guardian_id: string;
  name: string;
  pet_type_id: string;
  breed_id?: string | null;
  gender_id?: string | null;
  neuter_status_id?: string | null;
  life_stage_id?: string | null;
  body_size_id?: string | null;
  country_id?: string | null;
  medication_status_id?: string | null;
  weight_unit_id?: string | null;
  health_condition_level_id?: string | null;
  activity_level_id?: string | null;
  diet_type_id?: string | null;
  living_style_id?: string | null;
  ownership_type_id?: string | null;
  coat_length_id?: string | null;
  coat_type_id?: string | null;
  grooming_cycle_id?: string | null;
  color_ids?: string[] | string;
  allergy_ids?: string[] | string;
  disease_history_ids?: string[] | string;
  symptom_tag_ids?: string[] | string;
  vaccination_ids?: string[] | string;
  temperament_ids?: string[] | string;
  notes?: string | null;
  intro_text?: string | null;
  birthday?: string | null;
  birth_date?: string | null;
  current_weight?: number | null;
  microchip_no?: string | null;
  weight_kg?: number | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PetWeightLog {
  id: string;
  pet_id: string;
  weight_value: number;
  weight_unit_id?: string | null;
  measured_at: string;
  recorded_by_user_id: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeightSummary {
  latest_weight?: number | null;
  latest_measured_at?: string | null;
  min_weight?: number | null;
  max_weight?: number | null;
  delta_from_prev?: number | null;
  weight_unit_id?: string | null;
}

export interface PetDiseaseHistory {
  id: string;
  pet_id: string;
  disease_group_item_id?: string | null;
  disease_item_id: string;
  diagnosed_at?: string | null;
  notes?: string | null;
  is_active: number;
  disease_key?: string | null;
  disease_group_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PetDiseaseDevice {
  id: string;
  pet_id: string;
  disease_item_id: string;
  device_item_id: string;
  serial_number?: string | null;
  nickname?: string | null;
  notes?: string | null;
  is_active: number;
  device_key?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PetGlucoseLog {
  id: string;
  pet_id: string;
  disease_item_id: string;
  device_item_id?: string | null;
  glucose_value: number;
  glucose_unit_item_id: string;
  measured_at: string;
  measured_context_item_id?: string | null;
  notes?: string | null;
  recorded_by_user_id: string;
  judgement_level?: string | null;
  judgement_label?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GlucoseSummary {
  latest_value?: number | null;
  latest_measured_at?: string | null;
  latest_judgement_level?: string | null;
  latest_judgement_label?: string | null;
}

export interface PetHealthMeasurementLog {
  id: string;
  pet_id: string;
  disease_item_id: string;
  device_type_item_id?: string | null;
  device_model_id?: string | null;
  measurement_item_id: string;
  measurement_context_id?: string | null;
  value: number;
  unit_item_id?: string | null;
  measured_at: string;
  memo?: string | null;
  recorded_by_user_id: string;
  judgement_level?: string | null;
  judgement_label?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthMeasurementSummary {
  latest_value?: number | null;
  latest_measured_at?: string | null;
  latest_judgement_level?: string | null;
  latest_judgement_label?: string | null;
  latest_measurement_item_id?: string | null;
}

export interface Booking {
  id: string;
  guardian_id: string;
  supplier_id: string;
  pet_id?: string | null;
  service_id?: string | null;
  business_category_id?: string | null;
  status: string;
  requested_date?: string | null;
  requested_time?: string | null;
  notes?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberSummary {
  total_members: number;
  new_members: number;
}

export interface MemberRecord {
  id: string;
  email: string;
  role: 'guardian' | 'provider' | 'admin';
  status: string;
  created_at: string;
  full_name?: string | null;
  nickname?: string | null;
  phone?: string | null;
  address_line?: string | null;
  region_text?: string | null;
  preferred_language?: string | null;
  business_category_l1_id?: string | null;
  business_category_l2_id?: string | null;
  business_category_l3_id?: string | null;
  pet_type_l1_id?: string | null;
  pet_type_l2_id?: string | null;
  business_registration_no?: string | null;
  operating_hours?: string | null;
  certifications?: string[] | string;
  provider_approval_status?: string | null;
  role_application_id?: string | null;
  role_application_status?: string | null;
  requested_role?: string | null;
  business_l1_label?: string | null;
  business_l2_label?: string | null;
  business_l3_label?: string | null;
  pet_type_l1_label?: string | null;
  pet_type_l2_label?: string | null;
}

export interface GoogleSettingItem {
  value: string;
  updated_at: string | null;
}

export interface PublicGoogleConfig {
  google_places_api_key: string;
  google_oauth_client_id: string;
  google_oauth_redirect_uri: string;
}

export interface OAuthLoginResponse {
  user_id: string;
  role: string;
  email: string;
  provider: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface FeedPost {
  id: string;
  feed_type: string;
  author_user_id: string;
  author_role: string;
  author_email?: string | null;
  pet_id?: string | null;
  pet_name?: string | null;
  business_category_id?: string | null;
  business_category_key?: string | null;
  business_category_ko?: string | null;
  pet_type_id?: string | null;
  pet_type_key?: string | null;
  pet_type_ko?: string | null;
  booking_guardian_email?: string | null;
  booking_supplier_email?: string | null;
  booking_guardian_id?: string | null;
  booking_supplier_id?: string | null;
  visibility_scope: string;
  caption?: string | null;
  media_urls: string[] | string;
  tags: string[] | string;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: number;
  created_at: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_user_id: string;
  author_email?: string | null;
  parent_comment_id?: string | null;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PetAlbumMedia {
  id: string;
  pet_id: string;
  source_type: 'profile' | 'feed' | 'booking_completed' | 'health_record' | 'manual_upload';
  source_id?: string | null;
  booking_id?: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  tags: string[] | string;
  uploaded_by_user_id: string;
  uploaded_by_email?: string | null;
  visibility_scope: 'public' | 'friends_only' | 'private' | 'guardian_supplier_only' | 'booking_related';
  is_primary?: number;
  sort_order?: number;
  status: 'active' | 'pending' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface FriendRequest {
  id: string;
  requester_user_id: string;
  requester_email?: string | null;
  receiver_user_id: string;
  receiver_email?: string | null;
  status: string;
  created_at: string;
  responded_at?: string | null;
}

export interface FriendConnection {
  id: string;
  relation_type: string;
  status: string;
  created_at: string;
  friend_user_id: string;
  friend_email: string;
  friend_role: string;
}

export interface DeviceType {
  id: string; key: string; name_ko?: string | null; name_en?: string | null; display_label?: string | null;
  model_count?: number;
  status: string; sort_order: number; created_at: string; updated_at: string;
}

export interface DeviceManufacturer {
  id: string; key: string; name_key?: string | null; name_ko: string; name_en: string; display_label?: string | null;
  parent_type_ids?: string | null;
  model_count?: number;
  country: string | null; status: string; sort_order: number;
  created_at: string; updated_at: string;
}

export interface DeviceBrand {
  id: string; key?: string | null; manufacturer_id: string; name_key?: string | null; name_ko: string; name_en: string; display_label?: string | null;
  parent_type_ids?: string | null;
  model_count?: number;
  status: string; mfr_name_ko?: string | null;
  mfr_display_label?: string | null;
  parent_mfr_ids?: string | null;
  sort_order?: number;
  created_at: string; updated_at: string;
}

export interface DeviceModel {
  id: string; key?: string | null; device_type_id: string | null; device_type_item_id?: string | null; manufacturer_id: string; brand_id: string | null; name_key?: string | null;
  model_name: string; model_code: string | null; description: string | null;
  parent_type_ids?: string | null;
  parent_brand_ids?: string | null;
  sort_order?: number;
  status: string; created_at: string; updated_at: string;
  type_name_ko?: string | null; type_name_en?: string | null;
  type_display_label?: string | null;
  mfr_name_ko?: string | null; mfr_name_en?: string | null;
  mfr_display_label?: string | null;
  brand_name_ko?: string | null; brand_name_en?: string | null;
  brand_display_label?: string | null;
  model_display_label?: string | null;
}

export interface MeasurementUnit {
  id: string; key: string; name: string; symbol: string | null;
  status: string; sort_order: number; created_at: string; updated_at: string;
}

export interface GuardianDevice {
  id: string; pet_id: string; device_model_id: string;
  disease_item_id?: string | null; is_default?: number;
  nickname: string | null; serial_number: string | null;
  start_date: string | null; notes: string | null; status: string;
  model_name?: string; model_code?: string | null;
  type_name_ko?: string | null; type_name_en?: string | null; type_key?: string | null;
  type_display_label?: string | null;
  mfr_name_ko?: string | null; mfr_name_en?: string | null; mfr_display_label?: string | null;
  brand_name_ko?: string | null; brand_name_en?: string | null; brand_display_label?: string | null;
  model_display_label?: string | null;
  created_at: string; updated_at: string;
}

export interface FeedType {
  id: string; key: string; name_ko?: string | null; name_en?: string | null; display_label?: string | null;
  model_count?: number;
  status: string; sort_order: number; created_at: string; updated_at: string;
}

export interface FeedManufacturer {
  id: string; key: string; name_key?: string | null; name_ko: string; name_en: string; display_label?: string | null;
  parent_type_ids?: string | null;
  model_count?: number;
  country: string | null; status: string; sort_order: number;
  created_at: string; updated_at: string;
}

export interface FeedBrand {
  id: string; key?: string | null; manufacturer_id: string; name_key?: string | null; name_ko: string; name_en: string; display_label?: string | null;
  parent_type_ids?: string | null;
  model_count?: number;
  status: string; mfr_name_ko?: string | null;
  mfr_display_label?: string | null;
  parent_mfr_ids?: string | null;
  sort_order?: number;
  created_at: string; updated_at: string;
}

export interface FeedModel {
  id: string; key?: string | null; feed_type_item_id: string; manufacturer_id: string; brand_id: string | null; name_key?: string | null;
  model_name: string; model_code: string | null; description: string | null;
  parent_type_ids?: string | null;
  parent_brand_ids?: string | null;
  sort_order?: number;
  status: string; created_at: string; updated_at: string;
  type_name_ko?: string | null; type_name_en?: string | null;
  type_display_label?: string | null;
  mfr_name_ko?: string | null; mfr_name_en?: string | null;
  mfr_display_label?: string | null;
  brand_name_ko?: string | null; brand_name_en?: string | null;
  brand_display_label?: string | null;
  model_display_label?: string | null;
}

// ─── Pet Feeds ────────────────────────────────────────────────────────────────

export interface PetFeed {
  id: string;
  pet_id: string;
  feed_model_id: string;
  disease_item_id?: string | null;
  nickname?: string | null;
  daily_amount_g?: number | null;
  daily_amount_unit?: string | null;
  feeding_frequency?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  is_primary: number | boolean;
  status: string;
  model_name?: string | null;
  model_code?: string | null;
  type_key?: string | null;
  type_display_label?: string | null;
  mfr_name_ko?: string | null;
  mfr_name_en?: string | null;
  mfr_display_label?: string | null;
  brand_name_ko?: string | null;
  brand_name_en?: string | null;
  brand_display_label?: string | null;
  model_display_label?: string | null;
  calories_per_100g?: number | null;
  protein_pct?: number | null;
  fat_pct?: number | null;
  fiber_pct?: number | null;
  moisture_pct?: number | null;
  carbohydrate_pct?: number | null;
  serving_size_g?: number | null;
  created_at: string;
  updated_at: string;
}

export interface FeedNutrition {
  id: string;
  feed_model_id: string;
  calories_per_100g?: number | null;
  protein_pct?: number | null;
  fat_pct?: number | null;
  fiber_pct?: number | null;
  moisture_pct?: number | null;
  ash_pct?: number | null;
  calcium_pct?: number | null;
  phosphorus_pct?: number | null;
  omega3_pct?: number | null;
  omega6_pct?: number | null;
  carbohydrate_pct?: number | null;
  serving_size_g?: number | null;
  ingredients_text?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Pet Feeding Logs ─────────────────────────────────────────────────────────

export interface FeedingLogItem {
  id: string;
  feeding_log_id: string;
  pet_feed_id?: string | null;
  feed_model_id?: string | null;
  amount_g?: number | null;
  ratio_pct?: number | null;
  sort_order: number;
  feed_nickname?: string | null;
  model_name?: string | null;
  model_display_label?: string | null;
  calories_per_100g?: number | null;
  protein_pct?: number | null;
  fat_pct?: number | null;
  fiber_pct?: number | null;
  carbohydrate_pct?: number | null;
}

export interface FeedingLog {
  id: string;
  pet_id: string;
  pet_feed_id?: string | null;
  feed_model_id?: string | null;
  amount_g?: number | null;
  amount_unit?: string | null;
  frequency?: number | null;
  feeding_time?: string | null;
  memo?: string | null;
  is_mixed?: number | null;
  items?: FeedingLogItem[];
  status: string;
  feed_nickname?: string | null;
  model_name?: string | null;
  model_display_label?: string | null;
  calories_per_100g?: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Feeding Mix Favorites ────────────────────────────────────────────────────

export interface FeedingMixFavorite {
  id: string;
  pet_id: string;
  name: string;
  items_json: string; // JSON string of [{pet_feed_id, amount_g}]
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── S7: Health Logs ──────────────────────────────────────────────────────────

export interface LogValue {
  id: string;
  log_id: string;
  metric_id: string;
  metric_code?: string | null;
  unit_id: string;
  unit_code?: string | null;
  numeric_value?: number | null;
  text_value?: string | null;
  sort_order: number;
}

export interface LogMedia {
  id: string;
  log_id: string;
  media_url: string;
  media_type: string;
  thumbnail_url?: string | null;
  sort_order: number;
}

export interface GlucoseAlert {
  type: string;
  severity: 'critical' | 'warning';
  message_key: string;
  value: number;
  threshold: number;
  unit: string;
}

export interface FeedRegistrationRequest {
  id: string;
  requester_user_id: string;
  requester_email?: string;
  pet_id?: string | null;
  feed_name: string;
  feed_type_item_id?: string | null;
  manufacturer_name?: string | null;
  brand_name?: string | null;
  calories_per_100g?: number | null;
  protein_pct?: number | null;
  fat_pct?: number | null;
  fiber_pct?: number | null;
  moisture_pct?: number | null;
  ash_pct?: number | null;
  calcium_pct?: number | null;
  phosphorus_pct?: number | null;
  omega3_pct?: number | null;
  omega6_pct?: number | null;
  carbohydrate_pct?: number | null;
  serving_size_g?: number | null;
  ingredients_text?: string | null;
  reference_url?: string | null;
  memo?: string | null;
  status: string;
  reviewed_by_user_id?: string | null;
  review_note?: string | null;
  reviewed_at?: string | null;
  approved_manufacturer_id?: string | null;
  approved_brand_id?: string | null;
  approved_model_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetLog {
  id: string;
  pet_id: string;
  author_id: string;
  logtype_id: string;
  logtype_code?: string | null;
  event_date: string;
  event_time?: string | null;
  title?: string | null;
  notes?: string | null;
  metadata: Record<string, unknown>;
  is_synced: number;
  sync_version: number;
  status: string;
  values: LogValue[];
  media: LogMedia[];
  alert?: GlucoseAlert | null;
  created_at: string;
  updated_at: string;
}
