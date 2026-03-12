/**
 * useRecommendations — 추천 유저 점수 계산 + localStorage 캐시
 *
 * 현재: 더미 데이터 기반.
 * 향후: allUsers를 API(`/api/v1/users/public`)에서 fetch로 교체.
 */
import { useMemo } from 'react';
import type { GuardianProfile, Pet } from '../types/api';

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

/* ── Dummy users (replace with API later) ─────────────────── */
const DUMMY_USERS: RecommendedUser[] = [
  { id: 'rec_01', nickname: 'jelly_mom',     email: 'jelly@petfolio.io',    region: '강남구',   pets: [{ name: '젤리', breed: '포메라니안', type: 'dog', breed_id: 'pomeranian' }], friends: [{ id: 'rec_03' }, { id: 'rec_05' }] },
  { id: 'rec_02', nickname: 'mango_dad',     email: 'mango@petfolio.io',    region: '마포구',   pets: [{ name: '망고', breed: '골든리트리버', type: 'dog', breed_id: 'golden_retriever' }], friends: [{ id: 'rec_01' }] },
  { id: 'rec_03', nickname: 'nabi_family',   email: 'nabi@petfolio.io',     region: '강남구',   pets: [{ name: '나비', breed: '러시안블루', type: 'cat', breed_id: 'russian_blue' }], friends: [{ id: 'rec_01' }, { id: 'rec_04' }] },
  { id: 'rec_04', nickname: 'choco_lover',   email: 'choco@petfolio.io',    region: '서초구',   pets: [{ name: '초코', breed: '푸들', type: 'dog', breed_id: 'poodle' }], friends: [{ id: 'rec_03' }] },
  { id: 'rec_05', nickname: 'luna_meow',     email: 'luna@petfolio.io',     region: '송파구',   pets: [{ name: '루나', breed: '브리티시숏헤어', type: 'cat', breed_id: 'british_shorthair' }], friends: [{ id: 'rec_01' }, { id: 'rec_06' }] },
  { id: 'rec_06', nickname: 'coco_world',    email: 'coco@petfolio.io',     region: '강남구',   pets: [{ name: '코코', breed: '말티즈', type: 'dog', breed_id: 'maltese' }], friends: [{ id: 'rec_05' }, { id: 'rec_07' }] },
  { id: 'rec_07', nickname: 'bori_puppy',    email: 'bori@petfolio.io',     region: '용산구',   pets: [{ name: '보리', breed: '시바이누', type: 'dog', breed_id: 'shiba_inu' }], friends: [{ id: 'rec_06' }] },
  { id: 'rec_08', nickname: 'mimi_cat',      email: 'mimi@petfolio.io',     region: '마포구',   pets: [{ name: '미미', breed: '페르시안', type: 'cat', breed_id: 'persian' }], friends: [{ id: 'rec_03' }, { id: 'rec_05' }] },
  { id: 'rec_09', nickname: 'happy_tail',    email: 'happy@petfolio.io',    region: '강남구',   pets: [{ name: '해피', breed: '포메라니안', type: 'dog', breed_id: 'pomeranian' }], friends: [{ id: 'rec_01' }, { id: 'rec_06' }] },
  { id: 'rec_10', nickname: 'ddori_corgi',   email: 'ddori@petfolio.io',    region: '서초구',   pets: [{ name: '또리', breed: '웰시코기', type: 'dog', breed_id: 'corgi' }], friends: [] },
  { id: 'rec_11', nickname: 'naru_papa',     email: 'naru@petfolio.io',     region: '송파구',   pets: [{ name: '나루', breed: '비숑프리제', type: 'dog', breed_id: 'bichon_frise' }], friends: [{ id: 'rec_02' }] },
  { id: 'rec_12', nickname: 'kitty_queen',   email: 'kitty@petfolio.io',    region: '강남구',   pets: [{ name: '키티', breed: '스코티시폴드', type: 'cat', breed_id: 'scottish_fold' }], friends: [{ id: 'rec_03' }, { id: 'rec_08' }] },
  { id: 'rec_13', nickname: 'max_runner',    email: 'max@petfolio.io',      region: '용산구',   pets: [{ name: '맥스', breed: '래브라도리트리버', type: 'dog', breed_id: 'labrador' }], friends: [{ id: 'rec_02' }, { id: 'rec_07' }] },
  { id: 'rec_14', nickname: 'snow_white',    email: 'snow@petfolio.io',     region: '마포구',   pets: [{ name: '눈이', breed: '사모예드', type: 'dog', breed_id: 'samoyed' }], friends: [{ id: 'rec_06' }] },
  { id: 'rec_15', nickname: 'toto_bunny',    email: 'toto@petfolio.io',     region: '강남구',   pets: [{ name: '토토', breed: '네덜란드드워프', type: 'other', breed_id: 'dutch_dwarf' }], friends: [] },
];

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
    if (!myUserId) return [];

    // Try cache first
    const cached = getCached();
    if (cached) return cached;

    // Extract my data for comparison
    const myBreedIds = new Set(myPets.map(p => p.breed_id).filter(Boolean) as string[]);
    const myTypeIds  = new Set(myPets.map(p => p.pet_type_id).filter(Boolean));
    const myRegion   = myProfile?.region_text || '';
    const myFriendIds = friendIds;

    // Derive pet type labels from dummy data for display
    const petTypeLabel = (type: string) => {
      if (type === 'dog') return t('public.recommend.type_dog', 'Dog');
      if (type === 'cat') return t('public.recommend.type_cat', 'Cat');
      return t('public.recommend.type_other', 'Other');
    };

    const calcScore = (target: RecommendedUser): { score: number; reasons: string[] } => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Same breed (+30)
      const targetBreeds = target.pets.map(p => p.breed_id || p.breed);
      if (targetBreeds.some(b => myBreedIds.has(b!))) {
        score += SCORE_WEIGHTS.sameBreed;
        const matchedPet = target.pets.find(p => myBreedIds.has(p.breed_id || ''));
        reasons.push(t('public.recommend.reason_breed', 'Same breed') + (matchedPet ? ` (${matchedPet.breed})` : ''));
      }

      // 2. Same pet type (+20)
      const targetTypes = target.pets.map(p => p.type);
      const matchedType = targetTypes.find(tt => {
        // Compare with master IDs or fallback to dummy type strings
        if (myTypeIds.has(tt)) return true;
        // Simple heuristic for dummy data: 'dog'/'cat' matching
        return myPets.some(mp => {
          const mpType = (mp.pet_type_id || '').toLowerCase();
          return mpType.includes(tt) || tt.includes(mpType);
        });
      });
      if (matchedType) {
        score += SCORE_WEIGHTS.sameType;
        reasons.push(petTypeLabel(matchedType));
      }

      // 3. Same region (+20)
      if (myRegion && target.region && myRegion === target.region) {
        score += SCORE_WEIGHTS.sameRegion;
        reasons.push(`📍 ${target.region}`);
      }

      // 4. Friend of friend (+15)
      const mutualCount = (target.friends || []).filter(f => myFriendIds.has(f.id)).length;
      if (mutualCount > 0) {
        score += SCORE_WEIGHTS.friendOfFriend;
        reasons.push(t('public.recommend.reason_mutual', `${mutualCount} mutual friends`).replace('{n}', String(mutualCount)));
      }

      // 5. Same product (+10) — placeholder for real data
      // Currently gives points randomly based on deterministic hash to simulate
      const hash = (target.id.charCodeAt(target.id.length - 1) + (myUserId?.charCodeAt(0) || 0)) % 10;
      if (hash < 3) {
        score += SCORE_WEIGHTS.sameProduct;
        reasons.push(t('public.recommend.reason_product', 'Same food/supplement'));
      }

      // 6. Same provider (+5) — placeholder for real data
      if (hash >= 7) {
        score += SCORE_WEIGHTS.sameProvider;
        reasons.push(t('public.recommend.reason_provider', 'Same vet/groomer'));
      }

      return { score, reasons };
    };

    const results = DUMMY_USERS
      .filter(u => u.id !== myUserId && !myFriendIds.has(u.id))
      .map(u => ({ user: u, ...calcScore(u) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    if (results.length > 0) setCache(results);
    return results;
  }, [myUserId, myPets, myProfile, friendIds, t]);
}
