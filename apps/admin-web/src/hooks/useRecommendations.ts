/**
 * useRecommendations — 추천 유저 점수 계산 + localStorage 캐시
 *
 * 현재: 더미 데이터 기반 (USE_DUMMY = true).
 * 향후: USE_DUMMY = false 로 바꾸고 allUsers를 API에서 fetch.
 */
import { useMemo } from 'react';
import type { GuardianProfile, Pet } from '../types/api';

/* ── 더미 모드 플래그 — DB 재설계 후 false 전환 ──────────── */
const USE_DUMMY = true;

/* ── Public types ─────────────────────────────────────────── */
export interface RecommendedUser {
  id: string;
  nickname: string;
  email: string;
  avatar_url?: string | null;
  region?: string | null;
  pets: { name: string; breed: string; type: string; breed_id?: string }[];
  friends?: { id: string }[];
  provider_ids?: string[];
  product_ids?: string[];
}

export interface Recommendation {
  user: RecommendedUser;
  score: number;
  reasons: string[];
}

/* ── Score weights ────────────────────────────────────────── */
const SCORE_WEIGHTS = {
  sameBreed:      30,
  sameType:       20,
  sameRegion:     20,
  friendOfFriend: 15,
  sameProduct:    10,
  sameProvider:    5,
} as const;

/* ── localStorage cache ───────────────────────────────────── */
const RECO_KEY  = 'petfolio_recommendations';
const RECO_TTL  = 60 * 60 * 1000; // 1h

function getCached(): Recommendation[] | null {
  try {
    const raw = localStorage.getItem(RECO_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as { data: Recommendation[]; timestamp: number };
    if (Date.now() - timestamp > RECO_TTL) { localStorage.removeItem(RECO_KEY); return null; }
    return data;
  } catch { return null; }
}

function setCache(data: Recommendation[]) {
  try {
    localStorage.setItem(RECO_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

/* ── Dummy users with pre-assigned scores ─────────────────── */
interface DummyEntry {
  user: RecommendedUser;
  score: number;
  reasonKeys: string[]; // i18n key suffixes or literal display
}

const DUMMY_ENTRIES: DummyEntry[] = [
  { user: { id: 'rec_01', nickname: 'jelly_mom',   email: 'jelly@petfolio.io',  region: '강남구', pets: [{ name: '젤리', breed: '포메라니안', type: 'dog' }], friends: [{ id: 'rec_03' }, { id: 'rec_05' }] },
    score: 85, reasonKeys: ['breed:포메라니안', 'type_dog', 'region:강남구', 'mutual:2'] },
  { user: { id: 'rec_02', nickname: 'mango_dad',   email: 'mango@petfolio.io',  region: '마포구', pets: [{ name: '망고', breed: '골든리트리버', type: 'dog' }], friends: [{ id: 'rec_01' }] },
    score: 55, reasonKeys: ['type_dog', 'product'] },
  { user: { id: 'rec_03', nickname: 'nabi_family', email: 'nabi@petfolio.io',   region: '강남구', pets: [{ name: '나비', breed: '러시안블루', type: 'cat' }], friends: [{ id: 'rec_01' }, { id: 'rec_04' }] },
    score: 50, reasonKeys: ['region:강남구', 'mutual:1', 'provider'] },
  { user: { id: 'rec_04', nickname: 'choco_lover', email: 'choco@petfolio.io',  region: '서초구', pets: [{ name: '초코', breed: '푸들', type: 'dog' }], friends: [{ id: 'rec_03' }] },
    score: 45, reasonKeys: ['type_dog', 'region:서초구', 'provider'] },
  { user: { id: 'rec_05', nickname: 'luna_meow',   email: 'luna@petfolio.io',   region: '송파구', pets: [{ name: '루나', breed: '브리티시숏헤어', type: 'cat' }], friends: [{ id: 'rec_01' }, { id: 'rec_06' }] },
    score: 40, reasonKeys: ['mutual:2', 'product'] },
  { user: { id: 'rec_06', nickname: 'coco_world',  email: 'coco@petfolio.io',   region: '강남구', pets: [{ name: '코코', breed: '말티즈', type: 'dog' }], friends: [{ id: 'rec_05' }, { id: 'rec_07' }] },
    score: 70, reasonKeys: ['type_dog', 'region:강남구', 'mutual:1', 'product'] },
  { user: { id: 'rec_07', nickname: 'bori_puppy',  email: 'bori@petfolio.io',   region: '용산구', pets: [{ name: '보리', breed: '시바이누', type: 'dog' }], friends: [{ id: 'rec_06' }] },
    score: 35, reasonKeys: ['type_dog', 'provider'] },
  { user: { id: 'rec_08', nickname: 'mimi_cat',    email: 'mimi@petfolio.io',   region: '마포구', pets: [{ name: '미미', breed: '페르시안', type: 'cat' }], friends: [{ id: 'rec_03' }, { id: 'rec_05' }] },
    score: 30, reasonKeys: ['mutual:2'] },
  { user: { id: 'rec_09', nickname: 'happy_tail',  email: 'happy@petfolio.io',  region: '강남구', pets: [{ name: '해피', breed: '포메라니안', type: 'dog' }], friends: [{ id: 'rec_01' }, { id: 'rec_06' }] },
    score: 80, reasonKeys: ['breed:포메라니안', 'type_dog', 'region:강남구'] },
  { user: { id: 'rec_10', nickname: 'ddori_corgi', email: 'ddori@petfolio.io',  region: '서초구', pets: [{ name: '또리', breed: '웰시코기', type: 'dog' }], friends: [] },
    score: 25, reasonKeys: ['type_dog'] },
  { user: { id: 'rec_11', nickname: 'naru_papa',   email: 'naru@petfolio.io',   region: '송파구', pets: [{ name: '나루', breed: '비숑프리제', type: 'dog' }], friends: [{ id: 'rec_02' }] },
    score: 35, reasonKeys: ['type_dog', 'mutual:1'] },
  { user: { id: 'rec_12', nickname: 'kitty_queen', email: 'kitty@petfolio.io',  region: '강남구', pets: [{ name: '키티', breed: '스코티시폴드', type: 'cat' }], friends: [{ id: 'rec_03' }, { id: 'rec_08' }] },
    score: 45, reasonKeys: ['region:강남구', 'mutual:2'] },
  { user: { id: 'rec_13', nickname: 'max_runner',  email: 'max@petfolio.io',    region: '용산구', pets: [{ name: '맥스', breed: '래브라도리트리버', type: 'dog' }], friends: [{ id: 'rec_02' }, { id: 'rec_07' }] },
    score: 40, reasonKeys: ['type_dog', 'mutual:1', 'provider'] },
  { user: { id: 'rec_14', nickname: 'snow_white',  email: 'snow@petfolio.io',   region: '마포구', pets: [{ name: '눈이', breed: '사모예드', type: 'dog' }], friends: [{ id: 'rec_06' }] },
    score: 30, reasonKeys: ['type_dog'] },
  { user: { id: 'rec_15', nickname: 'toto_bunny',  email: 'toto@petfolio.io',   region: '강남구', pets: [{ name: '토토', breed: '네덜란드드워프', type: 'other' }], friends: [] },
    score: 20, reasonKeys: ['region:강남구'] },
];

/* ── Translate reason keys → display strings ──────────────── */
function resolveReasons(keys: string[], t: (k: string, f?: string) => string): string[] {
  return keys.map(k => {
    if (k.startsWith('breed:'))  return `${t('public.recommend.reason_breed', 'Same breed')} (${k.slice(6)})`;
    if (k === 'type_dog')        return t('public.recommend.type_dog', '🐶 Dog parent');
    if (k === 'type_cat')        return t('public.recommend.type_cat', '🐱 Cat parent');
    if (k.startsWith('region:')) return `📍 ${k.slice(7)}`;
    if (k.startsWith('mutual:')) return t('public.recommend.reason_mutual', '{n} mutual friends').replace('{n}', k.slice(7));
    if (k === 'product')         return t('public.recommend.reason_product', 'Same food/supplement');
    if (k === 'provider')        return t('public.recommend.reason_provider', 'Same vet/groomer');
    return k;
  });
}

/* ── Hook ──────────────────────────────────────────────────── */
interface UseRecommendationsOpts {
  myProfile: GuardianProfile | null;
  myPets: Pet[];
  friendIds: Set<string>;
  myUserId: string | null;
  t: (key: string, fallback?: string) => string;
}

export function useRecommendations({ myProfile, myPets, friendIds, myUserId, t }: UseRecommendationsOpts): Recommendation[] {
  return useMemo(() => {
    /* ── 더미 모드: 항상 표시 (로그인 불문) ─────────────── */
    if (USE_DUMMY) {
      const cached = getCached();
      if (cached) return cached;

      const results: Recommendation[] = DUMMY_ENTRIES
        .filter(e => e.user.id !== myUserId && !friendIds.has(e.user.id))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(e => ({
          user: e.user,
          score: e.score,
          reasons: resolveReasons(e.reasonKeys, t),
        }));

      if (results.length > 0) setCache(results);
      return results;
    }

    /* ── 실데이터 모드 (향후) ────────────────────────────── */
    if (!myUserId) return [];

    const cached = getCached();
    if (cached) return cached;

    const myBreedIds = new Set(myPets.map(p => p.breed_id).filter(Boolean) as string[]);
    const myTypeIds  = new Set(myPets.map(p => p.pet_type_id).filter(Boolean));
    const myRegion   = myProfile?.region_text || '';

    const petTypeLabel = (type: string) => {
      if (type === 'dog') return t('public.recommend.type_dog', 'Dog');
      if (type === 'cat') return t('public.recommend.type_cat', 'Cat');
      return t('public.recommend.type_other', 'Other');
    };

    const calcScore = (target: RecommendedUser): { score: number; reasons: string[] } => {
      let score = 0;
      const reasons: string[] = [];

      const targetBreeds = target.pets.map(p => p.breed_id || p.breed);
      if (targetBreeds.some(b => myBreedIds.has(b!))) {
        score += SCORE_WEIGHTS.sameBreed;
        const matchedPet = target.pets.find(p => myBreedIds.has(p.breed_id || ''));
        reasons.push(t('public.recommend.reason_breed', 'Same breed') + (matchedPet ? ` (${matchedPet.breed})` : ''));
      }

      const targetTypes = target.pets.map(p => p.type);
      const matchedType = targetTypes.find(tt => myTypeIds.has(tt));
      if (matchedType) {
        score += SCORE_WEIGHTS.sameType;
        reasons.push(petTypeLabel(matchedType));
      }

      if (myRegion && target.region && myRegion === target.region) {
        score += SCORE_WEIGHTS.sameRegion;
        reasons.push(`📍 ${target.region}`);
      }

      const mutualCount = (target.friends || []).filter(f => friendIds.has(f.id)).length;
      if (mutualCount > 0) {
        score += SCORE_WEIGHTS.friendOfFriend;
        reasons.push(t('public.recommend.reason_mutual', '{n} mutual friends').replace('{n}', String(mutualCount)));
      }

      return { score, reasons };
    };

    // In real mode, allUsers would come from API
    const allUsers: RecommendedUser[] = [];
    const results = allUsers
      .filter(u => u.id !== myUserId && !friendIds.has(u.id))
      .map(u => ({ user: u, ...calcScore(u) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    if (results.length > 0) setCache(results);
    return results;
  }, [myUserId, myPets, myProfile, friendIds, t]);
}
