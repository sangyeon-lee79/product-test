// packages/shared/types — Admin Web, Guardian Web, Mobile이 공용으로 사용하는 타입
// LLD §4 기반

export type Role = 'guardian' | 'provider' | 'admin';
export type Species = 'dog' | 'cat' | 'other';
export type Gender = 'male' | 'female' | 'unknown';
export type BookingStatus = 'requested' | 'accepted' | 'completed' | 'cancelled';

// 13개국어 언어 코드 (LLD §4.2 i18n_translations)
export type LangCode = 'ko' | 'en' | 'ja' | 'zh_cn' | 'zh_tw' | 'es' | 'fr' | 'de' | 'pt' | 'vi' | 'th' | 'id_lang' | 'ar';

export const LANG_CODES: LangCode[] = ['ko', 'en', 'ja', 'zh_cn', 'zh_tw', 'es', 'fr', 'de', 'pt', 'vi', 'th', 'id_lang', 'ar'];

// S2: 마스터 카테고리 키 (LLD §4.2)
export type MasterCategoryKey =
  | 'industry' | 'breed' | 'disease' | 'symptom'
  | 'metric' | 'unit' | 'log_type' | 'interest'
  | 'country_ref' | 'ad_slot';

// S7: 7종 LogType 키 (PLAN.md S2-5)
export type LogTypeKey =
  | 'blood_glucose_log'
  | 'insulin_log'
  | 'meal_log'
  | 'water_log'
  | 'activity_log'
  | 'lab_test_log'
  | 'symptom_event_log';

// S11: 광고 슬롯 키 (LLD §4.2 ad_slots)
export type AdSlotKey = 'feed_list_banner' | 'store_detail_banner';

// API 공통 응답 타입
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// S9: LLD §5.3 R2 Presigned URL 응답
export interface PresignedUrlResponse {
  upload_url: string;
  file_key: string;
  public_url: string;
  expires_in: number; // 300초
}

// R2 업로드 타입 (LLD §8.1 버킷 구조)
export type StorageType =
  | 'avatar_user' | 'avatar_pet'
  | 'log_media' | 'feed_media'
  | 'completion_photo'
  | 'store_photo' | 'service_photo';

// S7: 위험 경고 응답 (LLD §9.2)
export interface GlucoseAlert {
  type: 'low_glucose_critical' | 'low_glucose_warning' | 'high_glucose_warning' | 'rapid_drop_warning';
  severity: 'critical' | 'warning';
  message_key: string;
  value: number;
  threshold: number;
  unit: string;
}
