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

export interface GuardianProfile {
  id?: string;
  user_id: string;
  handle?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  bio?: string | null;
  bio_translations?: Record<string, string>;
  country_id?: string | null;
  region_text?: string | null;
  language?: string | null;
  timezone?: string | null;
  interests?: string[];
  avatar_url?: string | null;
  email?: string | null;
  oauth_provider?: string | null;
  phone?: string | null;
  user_created_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  country_code?: string | null;
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
  avatar_url?: string | null;
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

export interface OAuthBreakdown {
  email: number;
  google: number;
  apple: number;
  kakao: number;
}

export interface MemberSummary {
  total_members: number;
  new_members: number;
  total_breakdown?: OAuthBreakdown;
  new_breakdown?: OAuthBreakdown;
}

export interface MemberRecord {
  id: string;
  email: string;
  role: 'guardian' | 'provider' | 'admin';
  oauth_provider?: string;
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

export interface PublicKakaoConfig {
  kakao_rest_api_key: string;
  kakao_javascript_key: string;
  kakao_redirect_uri: string;
}

export interface PublicAppleConfig {
  apple_service_id: string;
  apple_redirect_uri: string;
}

export interface PlatformSettingItem {
  value: string;
  updated_at: string | null;
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
  post_type?: string | null;
  caption?: string | null;
  media_urls: string[] | string;
  tags: string[] | string;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: number;
  created_at: string;
  // Grooming feed fields
  author_type?: string | null;
  supplier_id?: string | null;
  grooming_record_id?: string | null;
  grooming_tags?: Array<{ icon: string; label: string }> | string | null;
  // Injected card fields (feed_type === 'card')
  card_type?: string | null;
  tab_type?: string | null;
  card_title?: string | null;
  card_subtitle?: string | null;
  card_description?: string | null;
  card_image_url?: string | null;
  card_link_url?: string | null;
  card_avatar_url?: string | null;
  card_display_name?: string | null;
  card_badge_text?: string | null;
  card_score?: number | null;
  card_region?: string | null;
  card_metadata?: Record<string, unknown> | null;
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

export interface RequesterPet {
  id: string;
  name: string;
  avatar_url?: string | null;
  pet_type_code?: string | null;
  breed_code?: string | null;
  birth_date?: string | null;
}

export interface RequesterFeedImage {
  post_id: string;
  media_url: string;
  thumbnail_url?: string | null;
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
  requester_display_name?: string | null;
  requester_avatar_url?: string | null;
  requester_country_name?: string | null;
  requester_joined_at?: string | null;
  requester_pets?: RequesterPet[];
  requester_pets_total?: number;
  requester_feed_images?: RequesterFeedImage[];
}

export interface FriendConnection {
  id: string;
  relation_type: string;
  status: string;
  created_at: string;
  friend_user_id: string;
  friend_email: string;
  friend_role: string;
  friend_display_name?: string | null;
  friend_avatar_url?: string | null;
}

export interface FriendSearchResultPet {
  name: string;
  pet_type_code: string | null;
  breed_code: string | null;
}

export interface FriendSearchResult {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  country_name: string | null;
  region_text: string | null;
  pets: FriendSearchResultPet[];
  friend_status: 'none' | 'pending' | 'friend' | 'self';
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
  model_name: string; model_code: string | null; description: string | null; image_url?: string | null;
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
  model_name?: string; model_code?: string | null; model_image_url?: string | null;
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
  model_name: string; model_code: string | null; description: string | null; image_url?: string | null;
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
  image_url?: string | null;
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

export interface PetExerciseLog {
  id: string;
  pet_id: string;
  exercise_type: string;
  exercise_subtype: string;
  exercise_date: string;
  duration_min: number;
  distance_km?: number | null;
  intensity: string;
  leash?: boolean | null;
  location_type?: string | null;
  with_other_pets?: boolean;
  companion_pet_ids?: string[] | null;
  note?: string | null;
  recorded_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FriendPet {
  pet_id: string;
  pet_name: string;
  pet_type_code?: string | null;
  guardian_user_id: string;
  guardian_email: string;
  guardian_name?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  actor_user_id: string;
  actor_email?: string | null;
  actor_name?: string | null;
  actor_avatar_url?: string | null;
  reference_id: string;
  reference_type: string;
  is_read: boolean;
  title?: string | null;
  body?: string | null;
  data?: Record<string, string> | null;
  push_sent?: boolean;
  created_at: string;
}

export interface NotificationSettings {
  friend_request: boolean;
  friend_accepted: boolean;
  post_like: boolean;
  post_comment: boolean;
  friend_new_post: boolean;
  pet_health_remind: boolean;
  appointment_remind: boolean;
  service_notice: boolean;
  marketing: boolean;
}

export interface ExerciseSummary {
  total_count: number;
  total_duration_min: number;
  avg_duration_min: number;
  latest_date?: string | null;
}

export interface ProviderProfile {
  business_category_l1_id: string | null;
  business_category_l2_id: string | null;
  business_category_l3_id: string | null;
  pet_type_l1_id: string | null;
  pet_type_l2_id: string | null;
  business_l1_label: string;
  business_l2_label: string;
  business_l3_label: string;
  pet_type_l1_label: string;
  pet_type_l2_label: string;
  business_registration_no: string | null;
  operating_hours: string | null;
  certifications: string[];
  supported_pet_types: string[];
  address_line: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  feeding: {
    top5_feeds: { name: string; count: number }[];
    manufacturer_ratio: { name: string; value: number }[];
    type_distribution: { type: string; count: number }[];
    supplement_category: { category: string; count: number }[];
    prescribed_ratio: { prescribed: number; total: number };
    avg_daily_calories: number | null;
  };
  exercise: {
    type_count: { type: string; count: number }[];
    avg_duration: { type: string; avg_min: number }[];
    intensity_dist: { intensity: string; count: number }[];
    location_dist: { location: string; count: number }[];
    monthly_trend: { month: string; count: number }[];
    pet_type_compare: { pet_type: string; exercise_type: string; count: number }[];
  };
  health: {
    weight_trend: { date: string; avg_weight: number }[];
    weight_by_size: { size: string; avg_weight: number }[];
    top5_measurements: { name: string; count: number }[];
    weight_change_dist: { direction: string; count: number }[];
  };
  members: {
    total_users: number;
    by_oauth: { provider: string; count: number }[];
    signup_trend: { month: string; count: number }[];
    active_guardians_30d: number;
    feature_usage: { feature: string; count: number }[];
    pet_type_dist: { type: string; count: number }[];
    top10_breeds: { name: string; count: number }[];
  };
}

// ─── Pet Report ───────────────────────────────────────────────────────────────

export interface PetReport {
  pet: { id: string; name: string; pet_type_code: string | null; current_weight: number | null };
  period: string;
  feeding: {
    today_calories: number;
    target_calories: number | null;
    weekly_calories: { date: string; calories: number }[];
    nutrient_ratio: { nutrient: string; pct: number }[];
    top3_feeds: { name: string; count: number }[];
    supplements: { name: string; is_prescribed: boolean; taken_today: boolean }[];
  };
  exercise: {
    week_summary: { count: number; total_min: number; avg_intensity: number };
    weekly_calendar: { date: string; exercised: boolean }[];
    type_ratio: { type: string; count: number }[];
    monthly_trend: { month: string; total_min: number }[];
    recent: { date: string; type: string; duration_min: number; intensity: string }[];
  };
  health: {
    weight_trend: { date: string; weight: number }[];
    current_weight: number | null;
    weight_delta: number | null;
    measurement_trends: { metric: string; data: { date: string; value: number }[] }[];
    recent_records: { date: string; type: string; value: number }[];
  };
  weekly_summary: {
    feeding_card: { avg_calories: number; prev_avg_calories: number; delta_pct: number };
    exercise_card: { count: number; prev_count: number; delta: number };
    health_card: { weight: number | null; prev_weight: number | null; delta: number | null };
    alerts: { type: string; message_key: string; severity: string }[];
  };
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

// ─── Catalog Stats ───────────────────────────────────────────────────────────

export interface CatalogStats {
  total_models: number;
  active_models: number;
  user_registered: number;
  actual_usage: number;
  prescribed?: number;
}

// ─── S9: Store / Service / Discount ─────────────────────────────────────────
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
  business_type: string | null;
  business_subtype: string | null;
  address_state_code: string | null;
  address_city_code: string | null;
  address_detail: string | null;
  status: string;
  operating_hours?: Record<string, { open: string; close: string; closed?: boolean }> | null;
  allow_overtime?: boolean;
  overtime_fee_type?: string;
  overtime_fee_amount?: number;
  review_public?: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  display_name?: string;
  display_description?: string;
  country_name?: string;
  currency_code?: string;
  owner_email?: string;
  owner_name?: string;
  service_count?: number;
}

export interface StoreIndustry {
  industry_id: string;
  industry_key: string;
  display_label: string;
}

export interface StoreService {
  id: string;
  store_id: string;
  name: string;
  name_translations: Record<string, string>;
  description: string | null;
  description_translations: Record<string, string>;
  price: number | null;
  currency_id: string | null;
  currency_code?: string;
  photo_urls: string[];
  duration_minutes?: number | null;
  sort_order: number;
  is_active: boolean;
  display_name?: string;
  display_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceDiscount {
  id: string;
  service_id: string;
  discount_rate: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StoreStats {
  total: number;
  active: number;
  new_30d: number;
}

// ─── Appointments (Grooming Booking) ────────────────────────────────────────

export interface Appointment {
  id: string;
  pet_id: string | null;
  guardian_id: string;
  supplier_id: string;
  store_id: string | null;
  service_id: string | null;
  service_type: string;
  scheduled_at: string | null;
  duration_minutes: number | null;
  price: number | null;
  request_note: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
  // New fields (007 migration)
  business_type: string | null;
  extra_data: Record<string, unknown>;
  pet_report_period: string | null;
  pet_report_sent: boolean;
  deleted_at: string | null;
  cancelled_reason: string | null;
  is_overtime: boolean;
  overtime_minutes: number;
  overtime_fee: number;
  // Joined
  pet_name?: string | null;
  pet_avatar?: string | null;
  guardian_name?: string | null;
  guardian_email?: string | null;
  supplier_name?: string | null;
  supplier_email?: string | null;
  store_name?: string | null;
  species?: string | null;
  breed_id?: string | null;
  review_count?: number;
  has_guardian_review?: number;
  has_supplier_review?: number;
  service_name?: string | null;
  service_duration?: number | null;
  service_price?: number | null;
}

export interface AppointmentReview {
  id: string;
  appointment_id: string;
  store_id: string | null;
  author_user_id: string;
  pet_id: string | null;
  author_type: 'guardian' | 'supplier';
  rating: number;
  content: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  author_name?: string;
  pet_name?: string | null;
  pet_avatar?: string | null;
}

// ─── Grooming Records ───────────────────────────────────────────────────────

export interface GroomingPhoto {
  url: string;
  isMain: boolean;
}

export interface GroomingRecord {
  id: string;
  appointment_id: string | null;
  pet_id: string | null;
  supplier_id: string;
  guardian_id: string;
  grooming_type: string | null;
  cut_style: string | null;
  duration_minutes: number | null;
  products_used: string | null;
  special_notes: string | null;
  supplier_comment: string | null;
  photos: GroomingPhoto[];
  status: 'pending_guardian' | 'approved' | 'published';
  guardian_choice: string | null;
  post_id: string | null;
  created_at: string;
  completed_at: string | null;
  // New fields (007 migration)
  cut_style_item_id: string | null;
  custom_cut_name: string | null;
  memo: string | null;
  report_sent_at: string | null;
  guardian_choice_at: string | null;
  // Joined
  pet_name?: string | null;
  pet_avatar?: string | null;
  guardian_name?: string | null;
  supplier_name?: string | null;
}

// ─── Dummy Stores (demo data) ───────────────────────────────────────────────

export interface DummyStoreService {
  id: string;
  name: Record<string, string>;
  display_name: string;
  price: number | null;
  duration_min: number | null;
}

export interface DummyStore {
  id: string;
  category: string;
  name: Record<string, string>;
  description: Record<string, string>;
  address: { state_code: string; city_code: string; detail: string } | null;
  display_name: string;
  display_description: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  services: DummyStoreService[];
}

// Feed Card Settings
export interface FeedCardSetting {
  id: string;
  card_type: string;
  is_enabled: boolean;
  interval_n: number;
  sort_order: number;
  rotation_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FeedDummyCard {
  id: string;
  tab_type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  avatar_url: string | null;
  display_name: string | null;
  badge_text: string | null;
  score: number;
  region: string | null;
  breed_info: string | null;
  pet_type: string | null;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedPreviewItem {
  position: number;
  type: 'post' | 'ranking' | 'recommended' | 'ad' | 'store';
  label: string;
}
