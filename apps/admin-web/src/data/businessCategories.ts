/**
 * Business category L1/L2 hierarchy for provider stores.
 * L1 = business type (hospital, grooming, ...)
 * L2 = sub-category per L1
 *
 * Stored as code strings in DB (language-independent).
 * Display labels resolved via i18n keys: store.business.<l1> / store.business.<l1>.<l2>
 */

export interface BusinessSubCategory {
  code: string;
  i18nKey: string;
}

export interface BusinessCategory {
  code: string;
  i18nKey: string;
  subs: BusinessSubCategory[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    code: 'hospital',
    i18nKey: 'store.business.hospital',
    subs: [
      { code: 'general', i18nKey: 'store.business.hospital.general' },
      { code: 'emergency', i18nKey: 'store.business.hospital.emergency' },
      { code: 'specialist', i18nKey: 'store.business.hospital.specialist' },
      { code: 'dental', i18nKey: 'store.business.hospital.dental' },
      { code: 'oriental', i18nKey: 'store.business.hospital.oriental' },
    ],
  },
  {
    code: 'grooming',
    i18nKey: 'store.business.grooming',
    subs: [
      { code: 'full', i18nKey: 'store.business.grooming.full' },
      { code: 'bath', i18nKey: 'store.business.grooming.bath' },
      { code: 'nail', i18nKey: 'store.business.grooming.nail' },
      { code: 'style', i18nKey: 'store.business.grooming.style' },
    ],
  },
  {
    code: 'hotel',
    i18nKey: 'store.business.hotel',
    subs: [
      { code: 'hotel', i18nKey: 'store.business.hotel.hotel' },
      { code: 'daycare', i18nKey: 'store.business.hotel.daycare' },
      { code: 'boarding', i18nKey: 'store.business.hotel.boarding' },
    ],
  },
  {
    code: 'training',
    i18nKey: 'store.business.training',
    subs: [
      { code: 'basic', i18nKey: 'store.business.training.basic' },
      { code: 'behavior', i18nKey: 'store.business.training.behavior' },
      { code: 'agility', i18nKey: 'store.business.training.agility' },
    ],
  },
  {
    code: 'shop',
    i18nKey: 'store.business.shop',
    subs: [
      { code: 'food', i18nKey: 'store.business.shop.food' },
      { code: 'supplies', i18nKey: 'store.business.shop.supplies' },
      { code: 'live', i18nKey: 'store.business.shop.live' },
    ],
  },
  {
    code: 'cafe',
    i18nKey: 'store.business.cafe',
    subs: [
      { code: 'cat', i18nKey: 'store.business.cafe.cat' },
      { code: 'dog', i18nKey: 'store.business.cafe.dog' },
      { code: 'general', i18nKey: 'store.business.cafe.general' },
    ],
  },
  {
    code: 'photo',
    i18nKey: 'store.business.photo',
    subs: [
      { code: 'studio', i18nKey: 'store.business.photo.studio' },
      { code: 'outdoor', i18nKey: 'store.business.photo.outdoor' },
    ],
  },
];

/** Lookup map: L1 code → BusinessCategory */
export const BUSINESS_MAP = Object.fromEntries(
  BUSINESS_CATEGORIES.map(c => [c.code, c])
) as Record<string, BusinessCategory>;
