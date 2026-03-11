import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  type Booking,
  type Country,
  type FeedingLog,
  type FeedingMixFavorite,
  type FeedPost,
  type FriendPet,
  type FriendRequest,
  type GuardianProfile,
  type GuardianDevice,
  type HealthMeasurementSummary,
  type PetFeed,
  type MasterItem,
  type Pet,
  type PetAlbumMedia,
  type PetHealthMeasurementLog,
  type PetExerciseLog,

  type PetWeightLog,
  type WeightSummary,
  type Store,
} from '../lib/api';


import { useI18n, useT } from '../lib/i18n';
import { BCP47_LOCALE_MAP, LANG_LABELS, type Lang } from '@petfolio/shared';
import { getStoredRole } from '../lib/auth';
import PetGalleryPanel from '../components/PetGalleryPanel';
import ComposeModal from './guardian/ComposeModal';
import WeightModal from './guardian/WeightModal';
import MeasurementModal from './guardian/MeasurementModal';
import DeviceManageModal from './guardian/DeviceManageModal';
import FeedManageModal from './guardian/FeedManageModal';
import FeedingLogModal from './guardian/FeedingLogModal';
import ExerciseLogModal from './guardian/ExerciseLogModal';
import PetReportTab from './guardian/PetReportTab';
import PetWizardModal from './guardian/PetWizardModal';
import GuardianProfileEditModal from './guardian/GuardianProfileEditModal';
import {
  type FeedTab,
  type Mode,
  type PetProfileTab,
  type WeightRange,
  type Option,
  type GuardianPetOptions,
  CATEGORY_KEYS,
  toOption,
  loadCategoryItems,
  uiErrorMessage,
  formatDate,
  fmtDate,

  feedTypeLabel,
  visibilityLabel,
  normalizeMultiStableIds,
} from './guardian/guardianTypes';

export default function GuardianMainPage() {
  const { pet_id: petIdParam } = useParams();
  const t = useT();
  const { lang } = useI18n();
  const locale = BCP47_LOCALE_MAP[lang as Lang] || 'en-US';
  const role = getStoredRole();
  const isGuardian = role === 'guardian';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [editingPetId, setEditingPetId] = useState('');
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [petMode, setPetMode] = useState<Mode>('create');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [albumMedia, setAlbumMedia] = useState<PetAlbumMedia[]>([]);
  const [, /* nearbyStores */] = useState<Store[]>([]);
  const [weightLogs, setWeightLogs] = useState<PetWeightLog[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<PetHealthMeasurementLog[]>([]);
  const [, setWeightSummary] = useState<WeightSummary | null>(null);
  const [, setMeasurementSummary] = useState<HealthMeasurementSummary | null>(null);
  const [weightRange] = useState<WeightRange>('1m');
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [editingWeightLog, setEditingWeightLog] = useState<PetWeightLog | null>(null);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [editingMeasurementLog, setEditingMeasurementLog] = useState<PetHealthMeasurementLog | null>(null);
  const [deviceManageModalOpen, setDeviceManageModalOpen] = useState(false);
  const [guardianDevices, setGuardianDevices] = useState<GuardianDevice[]>([]);
  const [feedManageModalOpen, setFeedManageModalOpen] = useState(false);
  const [petFeeds, setPetFeeds] = useState<PetFeed[]>([]);
  const [petSupplements, setPetSupplements] = useState<PetFeed[]>([]);
  const [feedingLogModalOpen, setFeedingLogModalOpen] = useState(false);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [editingFeedingLog, setEditingFeedingLog] = useState<FeedingLog | null>(null);
  const [feedingMixFavorites, setFeedingMixFavorites] = useState<FeedingMixFavorite[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<PetExerciseLog[]>([]);
  const [exerciseLogModalOpen, setExerciseLogModalOpen] = useState(false);
  const [editingExerciseLog, setEditingExerciseLog] = useState<PetExerciseLog | null>(null);
  const [exerciseTypeItems, setExerciseTypeItems] = useState<MasterItem[]>([]);
  const [exerciseIntensityItems, setExerciseIntensityItems] = useState<MasterItem[]>([]);
  const [exerciseLocationItems, setExerciseLocationItems] = useState<MasterItem[]>([]);
  const [friendPets, setFriendPets] = useState<FriendPet[]>([]);
  const [guardianProfile, setGuardianProfile] = useState<GuardianProfile | null>(null);
  const [guardianCountries, setGuardianCountries] = useState<Country[]>([]);
  const [guardianProfileEditOpen, setGuardianProfileEditOpen] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [petTab, setPetTab] = useState<PetProfileTab>('health');
  const [composeModalOpen, setComposeModalOpen] = useState(false);

  // ── Health sub-tabs ──────────────────────────────────────────────────────

  // ── Pagination ──────────────────────────────────────────────────────────
  const PAGE_SIZE = 10;
  const [timelinePage, setTimelinePage] = useState(1);

  const [optMetric, setOptMetric] = useState<MasterItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [lightboxItems, setLightboxItems] = useState<string[]>([]);

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
  const [optSymptom, setOptSymptom] = useState<Option[]>([]);
  const [optVaccination, setOptVaccination] = useState<Option[]>([]);
  const [optHealthLevel, setOptHealthLevel] = useState<Option[]>([]);
  const [optActivity, setOptActivity] = useState<Option[]>([]);
  const [optDiet, setOptDiet] = useState<Option[]>([]);
  const [optTemperament, setOptTemperament] = useState<Option[]>([]);
  const [optCoatLength, setOptCoatLength] = useState<Option[]>([]);
  const [optGrooming, setOptGrooming] = useState<Option[]>([]);

  const optionLabel = (option: Option | undefined, fallback: string): string => {
    if (!option) return fallback;
    if (option.i18nKey) {
      const translated = t(option.i18nKey, '').trim();
      if (translated) return translated;
    }
    return (option.label || '').trim() || fallback;
  };

  const labelOf = (options: Option[], id: string | null | undefined, fallback: string): string => {
    if (!id) return fallback;
    const matched = options.find((o) => o.id === id || o.key === id);
    return optionLabel(matched, fallback);
  };

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

  const currentUserId = currentUserIdFromToken();

  const selectedPet = useMemo(() => pets.find((p) => p.id === selectedPetId) || pets[0] || null, [pets, selectedPetId]);

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

  function summarizeOptions(options: Option[], raw: string[] | string | null | undefined, max = 2): { text: string; tooltip: string } {
    const ids = normalizeMultiStableIds(raw, options);
    if (ids.length === 0) return { text: t('common.none', '-'), tooltip: '' };
    const labels = ids.map((id) => labelOf(options, id, t('common.none', '-')));
    const text = labels.length > max ? `${labels.slice(0, max).join(', ')} +${labels.length - max}` : labels.join(', ');
    return { text, tooltip: labels.join('\n') };
  }

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

  const healthFeeds = useMemo(
    () => feeds.filter((f) => f.feed_type === 'health_update' && (!selectedPet || !f.pet_id || f.pet_id === selectedPet.id)),
    [feeds, selectedPet],
  );

  const serviceFeeds = useMemo(
    () => feeds.filter((f) => f.feed_type === 'booking_completed' && (!selectedPet || !f.pet_id || f.pet_id === selectedPet.id)),
    [feeds, selectedPet],
  );

  const petOptions = useMemo<GuardianPetOptions>(() => ({
    optPetType, optBreed, optGender, optLifeStage, optColor, optAllergy, optDisease,
    optDiseaseGroup, optVaccination, optSymptom, optHealthLevel, optActivity, optDiet,
    optTemperament, optCoatLength, optGrooming,
  }), [optPetType, optBreed, optGender, optLifeStage, optColor, optAllergy, optDisease,
    optDiseaseGroup, optVaccination, optSymptom, optHealthLevel, optActivity, optDiet,
    optTemperament, optCoatLength, optGrooming]);

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
        guardianProfileRes,
        countriesRes,
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
        metricRows,
        exerciseTypeRows,
        exerciseIntensityRows,
        exerciseLocationRows,
        friendPetsRes,
      ] = await Promise.all([
        safe(api.pets.list(), { pets: [] }, 'pets.list'),
        safe(api.bookings.list(), { bookings: [] }, 'bookings.list'),
        safe(api.friends.list(), { friends: [] }, 'friends.list'),
        safe(api.friends.requests.list('inbox'), { requests: [], scope: 'inbox' }, 'friends.requests'),
        safe(api.feeds.list({ tab, limit: 30 }), { feeds: [] }, 'feeds.list'),
        safe(api.petAlbum.list({ include_pending: true, limit: 400 }), { media: [] }, 'petAlbum.list'),
        safe(api.guardians.me(), { profile: null }, 'guardians.me'),
        safe(api.countries.list(), [] as Country[], 'countries.list'),
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
        loadCategoryItems(['metric'], lang),
        loadCategoryItems(CATEGORY_KEYS.exercise_type, lang),
        loadCategoryItems(CATEGORY_KEYS.exercise_intensity, lang),
        loadCategoryItems(CATEGORY_KEYS.exercise_location, lang),
        safe(api.friends.pets(), { pets: [] }, 'friends.pets'),
      ]);

      setPets(petsRes.pets || []);
      if (!selectedPetId && (petsRes.pets || []).length > 0) setSelectedPetId((petsRes.pets || [])[0].id);
      setBookings(bookingsRes.bookings || []);
      setFriendCount((friendsRes.friends || []).length);
      setPendingRequests((requestsRes.requests || []).filter((r) => r.status === 'request_sent'));
      setFeeds(feedsRes.feeds || []);
      setAlbumMedia(albumRes.media || []);
      setGuardianProfile(guardianProfileRes.profile || null);
      setGuardianCountries(countriesRes || []);

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
      setOptMetric(metricRows);
      setExerciseTypeItems(exerciseTypeRows);
      setExerciseIntensityItems(exerciseIntensityRows);
      setExerciseLocationItems(exerciseLocationRows);
      setFriendPets(friendPetsRes.pets || []);

      if (!silent && failedApis.length > 0) {
        setError(t('guardian.alert.partial_load_failed', 'Some data could not be loaded. Please try again shortly.'));
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

  useEffect(() => {
    if (!petIdParam) return;
    setSelectedPetId(petIdParam);
  }, [petIdParam]);

  useEffect(() => {
    if (!selectedPet?.id) {
      setWeightLogs([]);
      setWeightSummary(null);
      setMeasurementLogs([]);
      setMeasurementSummary(null);
      setExerciseLogs([]);
      return;
    }
    loadWeightLogs(selectedPet.id, weightRange);
    loadMeasurementLogs(selectedPet.id, weightRange);
    void loadExerciseLogs(selectedPet.id);
  }, [selectedPet?.id, weightRange]);

  // Guardian devices + pet feeds — pet 변경 시에만 로드 (weightRange 무관)
  useEffect(() => {
    if (!selectedPet?.id) { setGuardianDevices([]); setPetFeeds([]); setPetSupplements([]); setFeedingLogs([]); setFeedingMixFavorites([]); return; }
    void loadGuardianDevices(selectedPet.id);
    void loadPetFeeds(selectedPet.id);
    void loadPetSupplements(selectedPet.id);
    void loadFeedingLogs(selectedPet.id);
    void api.pets.feedingMixFavorites.list(selectedPet.id).then(r => setFeedingMixFavorites(r.favorites || [])).catch(() => setFeedingMixFavorites([]));
  }, [selectedPet?.id]);


  async function loadWeightLogs(petId: string, range: WeightRange) {
    try {
      const res = await api.pets.weightLogs.list(petId, { range });
      setWeightLogs(res.logs || []);
      setWeightSummary(res.summary || null);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.weight_log_load_failed', 'Failed to load weight logs.')));
      setWeightLogs([]);
      setWeightSummary(null);
    }
  }

  async function loadMeasurementLogs(petId: string, range: WeightRange) {
    try {
      const res = await api.pets.healthMeasurements.list(petId, { range });
      setMeasurementLogs(res.logs || []);
      setMeasurementSummary(res.summary || null);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.measurement_log_load_failed', 'Failed to load health measurement logs.')));
      setMeasurementLogs([]);
      setMeasurementSummary(null);
    }
  }

  async function loadFeedingLogs(petId: string) {
    try {
      const res = await api.pets.feedingLogs.list(petId);
      setFeedingLogs(res.logs || []);
    } catch {
      setFeedingLogs([]);
    }
  }

  async function loadExerciseLogs(petId: string) {
    try {
      const res = await api.pets.exerciseLogs.list(petId, { range: weightRange });
      setExerciseLogs(res.logs || []);
    } catch {
      setExerciseLogs([]);
    }
  }

  async function loadGuardianDevices(petId: string) {
    try {
      const res = await api.pets.guardianDevices.list(petId);
      setGuardianDevices(res.devices || []);
    } catch {
      setGuardianDevices([]);
    }
  }

  async function loadPetFeeds(petId: string) {
    try {
      const res = await api.pets.petFeeds.list(petId);
      setPetFeeds(res.feeds || []);
    } catch {
      setPetFeeds([]);
    }
  }

  async function loadPetSupplements(petId: string) {
    try {
      const res = await api.pets.petSupplements.list(petId);
      setPetSupplements(res.feeds || []);
    } catch {
      setPetSupplements([]);
    }
  }



  async function removeWeightLog(logId: string) {
    if (!selectedPet?.id) return;
    if (!confirm(t('guardian.health.weight_delete_confirm', 'Delete this weight log?'))) return;
    try {
      await api.pets.weightLogs.remove(selectedPet.id, logId);
      await loadWeightLogs(selectedPet.id, weightRange);
      await loadAll(feedTab);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.weight_delete_failed', 'Failed to delete weight log.')));
    }
  }

  async function removeHealthMeasurementLog(logId: string) {
    if (!selectedPet?.id) return;
    if (!confirm(t('guardian.health.measurement_delete_confirm', 'Delete this health measurement log?'))) return;
    try {
      await api.pets.healthMeasurements.remove(selectedPet.id, logId);
      await loadMeasurementLogs(selectedPet.id, weightRange);
      await loadAll(feedTab);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.measurement_delete_failed', 'Failed to delete health measurement log.')));
    }
  }

  async function removeFeedingLog(logId: string) {
    if (!selectedPet?.id) return;
    if (!confirm(t('guardian.feeding.delete_confirm', 'Delete this feeding log?'))) return;
    try {
      await api.pets.feedingLogs.remove(selectedPet.id, logId);
      await loadFeedingLogs(selectedPet.id);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.feeding.delete_failed', 'Failed to delete feeding log.')));
    }
  }

  async function removeExerciseLog(logId: string) {
    if (!selectedPet?.id) return;
    if (!confirm(t('guardian.exercise.delete_confirm', 'Delete this exercise log?'))) return;
    try {
      await api.pets.exerciseLogs.remove(selectedPet.id, logId);
      await loadExerciseLogs(selectedPet.id);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.exercise.create_failed', 'Failed to save exercise log.')));
    }
  }

  function renderPagination(page: number, totalItems: number, setPage: (p: number) => void) {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <div className="pagination" style={{ marginTop: 8 }}>
        <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('admin.common.prev', '이전')}</button>
        <span>{page} / {totalPages}</span>
        <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{t('admin.common.next', '다음')}</button>
      </div>
    );
  }

  async function removeFeedPost(feedId: string) {
    if (!confirm(t('guardian.feed.delete_confirm', 'Delete this post?'))) return;
    try {
      await api.feeds.remove(feedId);
      await loadAll(feedTab);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.feed.delete_failed', 'Failed to delete post.')));
    }
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

  function openCreatePet() {
    setPetMode('create');
    setEditingPetId('');
    setPetModalOpen(true);
  }

  function openEditPet(petId: string) {
    setEditingPetId(petId);
    setPetMode('edit');
    setPetModalOpen(true);
  }

  function openCreateHealthMeasurementModal() {
    setEditingMeasurementLog(null);
    setMeasurementModalOpen(true);
  }

  function openEditHealthMeasurementLog(log: PetHealthMeasurementLog) {
    setEditingMeasurementLog(log);
    setMeasurementModalOpen(true);
  }

  // ── Unified Timeline ──────────────────────────────────────────────────────
  type TimelineItem = { id: string; type: 'weight' | 'measurement' | 'feeding' | 'exercise'; date: string; source: PetWeightLog | PetHealthMeasurementLog | FeedingLog | PetExerciseLog };
  const unifiedTimeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    for (const log of weightLogs) items.push({ id: `w-${log.id}`, type: 'weight', date: log.measured_at, source: log });
    for (const log of measurementLogs) items.push({ id: `m-${log.id}`, type: 'measurement', date: log.measured_at, source: log });
    for (const log of feedingLogs) items.push({ id: `f-${log.id}`, type: 'feeding', date: log.feeding_time || log.created_at, source: log });
    for (const log of exerciseLogs) items.push({ id: `e-${log.id}`, type: 'exercise', date: log.exercise_date, source: log });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [weightLogs, measurementLogs, feedingLogs, exerciseLogs]);

  const formatTimelineDate = (value: string): string => fmtDate(value, '-', locale);

  function getMixedFeedLabel(log: FeedingLog): string {
    if (!log.items?.length) return t('guardian.feeding.mixed_feed', '혼합급여');
    const ids = new Set(log.items.map(i => i.pet_feed_id).filter(Boolean));
    for (const fav of feedingMixFavorites) {
      try {
        const fi = JSON.parse(fav.items_json) as Array<{ pet_feed_id: string }>;
        const fids = new Set(fi.map(i => i.pet_feed_id));
        if (ids.size === fids.size && [...ids].every(id => fids.has(id!))) return fav.name;
      } catch { /* skip */ }
    }
    return t('guardian.feeding.mixed_feed', '혼합급여');
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
          {pets.length <= 1 && (
            <button className="btn btn-primary btn-sm" onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
          )}
          <Link className="btn btn-secondary btn-sm" to="/">{t('guardian.main.public_feed', 'Feed')}</Link>
        </div>
      </div>

      {/* ── Pet switching tabs (2+ pets) ── */}
      {pets.length >= 2 && (
        <div className="gm-pet-switch-tabs">
          {pets.map((p) => {
            const isActive = selectedPet?.id === p.id;
            return (
              <button key={p.id} className={`gm-pet-switch-tab${isActive ? ' active' : ''}`} onClick={() => setSelectedPetId(p.id)}>
                <span className="gm-pet-switch-dot" style={{ background: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                {p.name}
              </button>
            );
          })}
          <button className="gm-pet-switch-tab add" onClick={openCreatePet} title={t('common.add_pet', 'Add Pet')} aria-label={t('common.add_pet', 'Add Pet')}>+</button>
        </div>
      )}

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
        <button className={`gm-tab${petTab === 'report' ? ' active' : ''}`} onClick={() => setPetTab('report')}>
          <span className="gm-tab-icon">📊</span>{t('guardian.tab.report', 'Report')}
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
                <div className="gm-onboard-card">
                  <div className="gm-onboard-icon">🐾</div>
                  <div className="gm-onboard-title">{t('guardian.empty.onboard_title', '아직 등록된 반려동물이 없어요')}</div>
                  <p className="gm-onboard-desc">{t('guardian.empty.onboard_desc', '반려동물을 추가하고 건강을 기록해보세요!')}</p>
                  <button className="gm-onboard-btn" onClick={openCreatePet}>{t('guardian.empty.onboard_cta', '+ 반려동물 추가하기')}</button>
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
                                  <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'), locale)}</p>
                                </div>
                              </div>
                              <div className="sns-card-right">
                                <div className="sns-badges"><span className="badge badge-green">{visibilityLabel(t, f.visibility_scope)}</span></div>
                                {currentUserId && f.author_user_id === currentUserId && (
                                  <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeFeedPost(f.id)}>🗑️</button>
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
                  {!selectedPet ? (
                    <div className="gm-section">
                      <div className="gm-section-body gm-empty">
                        <div className="gm-empty-icon">🐾</div>
                        <div className="gm-empty-title">{t('guardian.empty.no_pets_title', 'Register your first pet')}</div>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{t('guardian.empty.no_pets_desc', 'Without a pet profile, feed/health/booking links are limited.')}</p>
                        <button className="btn btn-primary" onClick={openCreatePet}>{t('guardian.empty.no_pets_cta', 'Register your first pet')}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ── Health Toolkit ── */}
                      <div className="gm-health-toolbar">
                        <div className="gm-toolbar-group gm-toolbar-record">
                          <button className="gm-toolbar-tile gm-tile-weight" onClick={() => { setEditingWeightLog(null); setWeightModalOpen(true); }}>
                            <span className="gm-tile-icon">⚖️</span>
                            <span className="gm-tile-label">{t('guardian.health.add_weight', '몸무게')}</span>
                          </button>
                          <button className="gm-toolbar-tile gm-tile-measure" onClick={openCreateHealthMeasurementModal}>
                            <span className="gm-tile-icon">📊</span>
                            <span className="gm-tile-label">{t('guardian.health.add_measurement', '수치 추가')}</span>
                          </button>
                          <button className="gm-toolbar-tile gm-tile-feed" onClick={() => { setEditingFeedingLog(null); setFeedingLogModalOpen(true); }}>
                            <span className="gm-tile-icon">🍽️</span>
                            <span className="gm-tile-label">{t('guardian.feeding.add', '급여 기록')}</span>
                          </button>
                          <button className="gm-toolbar-tile gm-tile-exercise" onClick={() => { setEditingExerciseLog(null); setExerciseLogModalOpen(true); }}>
                            <span className="gm-tile-icon">🏃</span>
                            <span className="gm-tile-label">{t('guardian.exercise.add', '운동 추가')}</span>
                          </button>
                        </div>
                        <div className="gm-toolbar-divider" />
                        <div className="gm-toolbar-group gm-toolbar-manage">
                          <button className="gm-toolbar-tile gm-tile-devices" onClick={() => setDeviceManageModalOpen(true)}>
                            <span className="gm-tile-icon">🩺</span>
                            <span className="gm-tile-label">{t('guardian.device.manage_title', '측정 장비')}</span>
                          </button>
                          <button className="gm-toolbar-tile gm-tile-feeds" onClick={() => setFeedManageModalOpen(true)}>
                            <span className="gm-tile-icon">🥣</span>
                            <span className="gm-tile-label">{t('guardian.feed.manage_title', '사료 관리')}</span>
                          </button>
                        </div>
                      </div>


                      {/* ── Timeline ── */}
                      <div className="gm-section">
                        <div className="gm-section-header">
                          <span className="gm-section-title">{t('guardian.health.subtab_timeline', '타임라인')}</span>
                        </div>
                        <div className="gm-section-body">
                          {unifiedTimeline.length === 0 ? (
                            <div className="gm-tl-empty">
                              <div className="gm-tl-empty-icon">📋</div>
                              <p>{t('guardian.log.no_records', 'No records yet.')}</p>
                            </div>
                          ) : (
                            <div className="gm-timeline">
                              {(() => {
                                let lastDateKey = '';
                                const pageItems = unifiedTimeline.slice((timelinePage - 1) * PAGE_SIZE, timelinePage * PAGE_SIZE);
                                return pageItems.flatMap((item) => {
                                  const dateKey = formatTimelineDate(item.date);
                                  const showDateHeader = dateKey !== lastDateKey;
                                  lastDateKey = dateKey;
                                  const d = new Date(item.date);
                                  const hhmm = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                  const emoji = item.type === 'weight' ? '⚖️' : item.type === 'feeding' ? '🍽️' : item.type === 'exercise' ? '🏃' : '📊';
                                  const els = [];
                                  if (showDateHeader) els.push(<div key={`date-${dateKey}`} className="gm-tl-date">{dateKey}</div>);

                                  if (item.type === 'weight') {
                                    const log = item.source as PetWeightLog;
                                    els.push(
                                      <div key={item.id} className="gm-tl-card" data-type={item.type}>
                                        <div className="gm-tl-icon">{emoji}</div>
                                        <div className="gm-tl-content">
                                          <div className="gm-tl-main">
                                            <span className="gm-tl-time">{hhmm}</span>
                                            <span className="gm-tl-sep">·</span>
                                            <span>{log.weight_value}kg</span>
                                            {log.notes && <><span className="gm-tl-sep">·</span><span className="gm-tl-note">{log.notes}</span></>}
                                          </div>
                                          <div className="gm-tl-actions">
                                            <button title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => { setEditingWeightLog(log); setWeightModalOpen(true); }}>✏️</button>
                                            <button title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeWeightLog(log.id)}>🗑️</button>
                                          </div>
                                        </div>
                                      </div>,
                                    );
                                    return els;
                                  }

                                  if (item.type === 'measurement') {
                                    const log = item.source as PetHealthMeasurementLog;
                                    const measurementContext = optMeasurementContext.find((o) => o.id === log.measurement_context_id);
                                    const metricLabel = optMetric.find((m) => m.id === log.measurement_item_id)?.display_label;
                                    const ctxLabel = measurementContext
                                      ? (measurementContext.i18nKey ? t(measurementContext.i18nKey, measurementContext.label) : measurementContext.label)
                                      : undefined;
                                    els.push(
                                      <div key={item.id} className="gm-tl-card" data-type={item.type}>
                                        <div className="gm-tl-icon">{emoji}</div>
                                        <div className="gm-tl-content">
                                          <div className="gm-tl-main">
                                            <span className="gm-tl-time">{hhmm}</span>
                                            <span className="gm-tl-sep">·</span>
                                            <span>{log.value}</span>
                                            {ctxLabel && <><span className="gm-tl-sep">·</span><span>{ctxLabel}</span></>}
                                            {metricLabel && <><span className="gm-tl-sep">·</span><span>{metricLabel}</span></>}
                                          </div>
                                          <div className="gm-tl-actions">
                                            <button title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditHealthMeasurementLog(log)}>✏️</button>
                                            <button title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeHealthMeasurementLog(log.id)}>🗑️</button>
                                          </div>
                                        </div>
                                      </div>,
                                    );
                                    return els;
                                  }

                                  if (item.type === 'exercise') {
                                    const log = item.source as PetExerciseLog;
                                    const typeLabel = t(`master.exercise_type.${log.exercise_type}`, log.exercise_type);
                                    const intensityLabel = t(`guardian.exercise.intensity_${log.intensity}`, log.intensity);
                                    els.push(
                                      <div key={item.id} className="gm-tl-card" data-type={item.type}>
                                        <div className="gm-tl-icon">{emoji}</div>
                                        <div className="gm-tl-content">
                                          <div className="gm-tl-main">
                                            <span className="gm-tl-time">{hhmm}</span>
                                            <span className="gm-tl-sep">·</span>
                                            <span>{typeLabel} {log.duration_min}min</span>
                                            <span className="gm-tl-sep">·</span>
                                            <span>{intensityLabel}</span>
                                            {log.distance_km != null && <><span className="gm-tl-sep">·</span><span>{log.distance_km}km</span></>}
                                          </div>
                                          <div className="gm-tl-actions">
                                            <button title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => { setEditingExerciseLog(log); setExerciseLogModalOpen(true); }}>✏️</button>
                                            <button title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeExerciseLog(log.id)}>🗑️</button>
                                          </div>
                                        </div>
                                      </div>,
                                    );
                                    return els;
                                  }

                                  const log = item.source as FeedingLog;
                                  const isMixed = !!log.is_mixed && !!log.items?.length;
                                  const totalG = isMixed
                                    ? log.items!.reduce((sum, feedItem) => sum + (feedItem.amount_g ?? 0), 0)
                                    : (log.amount_g ?? null);
                                  const totalKcal = isMixed
                                    ? Math.round(log.items!.reduce((sum, feedItem) => sum + ((feedItem.amount_g ?? 0) * (feedItem.calories_per_100g ?? 0) / 100), 0))
                                    : ((log.amount_g && log.calories_per_100g) ? Math.round(log.amount_g * log.calories_per_100g / 100) : null);
                                  const feedLabel = isMixed
                                    ? getMixedFeedLabel(log)
                                    : (log.feed_nickname || log.model_display_label || log.model_name || t('common.none', '-'));
                                  els.push(
                                    <div key={item.id} className="gm-tl-card" data-type={item.type}>
                                      <div className="gm-tl-icon">{emoji}</div>
                                      <div className="gm-tl-content">
                                        <div className="gm-tl-main">
                                          <span className="gm-tl-time">{hhmm}</span>
                                          <span className="gm-tl-sep">·</span>
                                          <span>{totalG != null ? `${totalG}g` : '-'}{totalKcal ? ` / ${totalKcal}kcal` : ''}</span>
                                          <span className="gm-tl-sep">·</span>
                                          <span>{feedLabel}</span>
                                        </div>
                                        <div className="gm-tl-actions">
                                          <button title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => { setEditingFeedingLog(log); setFeedingLogModalOpen(true); }}>✏️</button>
                                          <button title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeFeedingLog(log.id)}>🗑️</button>
                                        </div>
                                      </div>
                                    </div>,
                                  );
                                  return els;
                                });
                              })()}
                            </div>
                          )}
                          {renderPagination(timelinePage, unifiedTimeline.length, setTimelinePage)}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedPet && healthFeeds.length > 0 && (
                    <div className="gm-section">
                      <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.updates', 'Health Updates')}</span></div>
                      <div className="gm-section-body">
                        {healthFeeds.map((f) => (
                          <article key={f.id} className="sns-card">
                            <p className="sns-meta">{feedTypeLabel(t, f.feed_type)}</p>
                            <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'), locale)}</p>
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
                        <p className="text-sm text-muted">{formatDate(b.updated_at, t('common.none', '-'), locale)}</p>
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

                  {/* Store Browse */}
                  <div className="gm-section-header" style={{ marginTop: 16 }}>
                    <span className="gm-section-title">{t('guardian.store.browse', 'Browse Stores')}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      api.stores.list({ lang, limit: 20 }).then(res => setNearbyStores(res.items || [])).catch(() => {});
                    }}>{t('guardian.store.browse', 'Browse')}</button>
                  </div>
                  <div className="gm-section-body">
                    {nearbyStores.length === 0 ? (
                      <p className="text-muted" style={{ fontSize: 13 }}>{t('admin.store.list.empty', 'No stores')}</p>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {nearbyStores.map(s => (
                          <div key={s.id} className="guardian-pet-item" style={{ padding: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: 14 }}>{s.display_name || s.name}</strong>
                              <span className="text-muted" style={{ fontSize: 11 }}>
                                {s.service_count || 0} {t('guardian.store.services', 'Services')}
                              </span>
                            </div>
                            {s.address && <div className="text-muted" style={{ fontSize: 12 }}>{s.address}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Profile ── */}
              {petTab === 'profile' && (
                <>
                  {/* Guardian Profile — 항상 고정 */}
                  {guardianProfile && (
                    <div className="gm-section" style={{ marginBottom: 16 }}>
                      <div className="gm-section-header">
                        <span className="gm-section-title">{t('guardian.profile.title', 'Guardian Profile')}</span>
                        <button className="btn btn-secondary btn-sm" title={t('guardian.profile.edit_profile', 'Edit Profile')} aria-label={t('guardian.profile.edit_profile', 'Edit Profile')} onClick={() => setGuardianProfileEditOpen(true)}>✏️</button>
                      </div>
                      <div className="gm-section-body">
                        <div className="gm-info-grid">
                          <div className="gm-info-item"><div className="gm-info-label">{t('guardian.form.name', 'Name')}</div><div className="gm-info-value">{guardianProfile.display_name || guardianProfile.full_name || t('common.none', '-')}</div></div>
                          <div className="gm-info-item"><div className="gm-info-label">{t('guardian.profile.email', 'Email')}</div><div className="gm-info-value">{guardianProfile.email || t('common.none', '-')}</div></div>
                          <div className="gm-info-item"><div className="gm-info-label">{t('guardian.profile.country', 'Country')}</div><div className="gm-info-value">{(() => { const c = guardianCountries.find((x) => x.id === guardianProfile.country_id); if (!c) return t('common.none', '-'); const lbl = c[lang as keyof Country]; return (typeof lbl === 'string' && lbl.trim()) ? lbl.trim() : c.ko_name || c.code; })()}</div></div>
                          <div className="gm-info-item"><div className="gm-info-label">{t('guardian.profile.language', 'Language')}</div><div className="gm-info-value">{LANG_LABELS[guardianProfile.language as Lang] || guardianProfile.language || t('common.none', '-')}</div></div>
                          <div className="gm-info-item"><div className="gm-info-label">{t('guardian.profile.phone', 'Phone')}</div><div className="gm-info-value">{guardianProfile.phone || t('common.none', '-')}</div></div>
                          <div className="gm-info-item"><div className="gm-info-label">{t('guardian.profile.auth_method', 'Sign-up Method')}</div><div className="gm-info-value">{guardianProfile.oauth_provider ? guardianProfile.oauth_provider.charAt(0).toUpperCase() + guardianProfile.oauth_provider.slice(1) : 'Email'}</div></div>
                          <div className="gm-info-item" style={{ gridColumn: '1 / -1' }}><div className="gm-info-label">{t('guardian.profile.joined_date', 'Joined')}</div><div className="gm-info-value">{guardianProfile.user_created_at ? fmtDate(guardianProfile.user_created_at, '-', locale) : t('common.none', '-')}</div></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pet Profile — 사이드바 선택된 펫 기준 */}
                  {selectedPet && (
                    <div className="gm-section">
                      <div className="gm-section-header">
                        <span className="gm-section-title">{t('guardian.profile.pet_profile', 'Pet Profile')}</span>
                        <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditPet(selectedPet.id)}>✏️</button>
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
                </>
              )}

              {/* ── Report ── */}
              {petTab === 'report' && (
                <PetReportTab selectedPet={selectedPet} lang={lang} locale={locale} t={t} setError={setError} />
              )}
            </main>

            {/* ── Sidebar ── */}
            <aside className="gm-sidebar">
              <div className="gm-sidebar-section">
                <div className="gm-sidebar-header">{t('guardian.mypets.title', 'My Pets')}</div>
                <div className="gm-sidebar-body" style={{ padding: pets.length ? '8px' : undefined }}>
                  {pets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{t('guardian.empty.onboard_title', '아직 등록된 반려동물이 없어요')}</p>
                      <button className="gm-quick-btn primary" style={{ width: '100%' }} onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
                    </div>
                  ) : (
                    <>
                      {pets.map((p) => {
                        const isSelected = selectedPet?.id === p.id;
                        const weight = p.current_weight ?? p.weight_kg;
                        const breedLabel = labelOf(optBreed, p.breed_id, '');
                        const genderLabel = labelOf(optGender, p.gender_id, '');
                        const infoLine = [weight != null ? `${weight}kg` : null, breedLabel || null, genderLabel || null].filter(Boolean).join(' · ');
                        return (
                          <div key={p.id} className={`gm-pet-card${isSelected ? ' selected' : ''}`} onClick={() => setSelectedPetId(p.id)}>
                            <div className="gm-pet-card-avatar">{p.name[0].toUpperCase()}</div>
                            <div className="gm-pet-card-info">
                              <div className="gm-pet-card-name">{p.name}</div>
                              {infoLine && <div className="gm-pet-card-detail">{infoLine}</div>}
                            </div>
                            <div className="gm-pet-card-actions">
                              <button className="gm-pet-card-action" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditPet(p.id); }}>✏️</button>
                              <button className="gm-pet-card-action danger" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={(e) => { e.stopPropagation(); removePet(p.id); }}>🗑️</button>
                            </div>
                          </div>
                        );
                      })}
                      <button className="gm-sidebar-add-btn" onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
                    </>
                  )}
                </div>
              </div>
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

      {/* ── Modals ── */}
      <ComposeModal
        open={composeModalOpen}
        pets={pets}
        selectedPetId={selectedPetId}
        t={t}
        setError={setError}
        onClose={() => setComposeModalOpen(false)}
        onSuccess={() => void loadAll(feedTab)}
      />
      <WeightModal
        open={weightModalOpen}
        editingLog={editingWeightLog}
        selectedPet={selectedPet}
        t={t}
        setError={setError}
        onClose={() => { setWeightModalOpen(false); setEditingWeightLog(null); }}
        onSuccess={() => {
          if (selectedPet?.id) void loadWeightLogs(selectedPet.id, weightRange);
          void loadAll(feedTab);
        }}
      />
      <MeasurementModal
        open={measurementModalOpen}
        editingLog={editingMeasurementLog}
        selectedPet={selectedPet}
        guardianDevices={guardianDevices}
        optDisease={optDisease}
        optDiseaseDevice={optDiseaseDevice}
        optMeasurement={optMeasurement}
        optMeasurementContext={optMeasurementContext}
        lang={lang}
        t={t}
        setError={setError}
        onClose={() => { setMeasurementModalOpen(false); setEditingMeasurementLog(null); }}
        onSuccess={() => {
          if (selectedPet?.id) void loadMeasurementLogs(selectedPet.id, weightRange);
        }}
        onOpenDeviceManage={() => setDeviceManageModalOpen(true)}
      />
      <DeviceManageModal
        open={deviceManageModalOpen}
        selectedPet={selectedPet}
        lang={lang}
        t={t}
        setError={setError}
        onClose={() => setDeviceManageModalOpen(false)}
        onChanged={(devices) => setGuardianDevices(devices)}
      />
      <FeedManageModal
        open={feedManageModalOpen}
        selectedPet={selectedPet}
        lang={lang}
        t={t}
        setError={setError}
        onClose={() => setFeedManageModalOpen(false)}
        onChanged={(feeds) => setPetFeeds(feeds)}
        onSupplementsChanged={(supps: PetFeed[]) => setPetSupplements(supps)}
      />
      <FeedingLogModal
        open={feedingLogModalOpen}
        editingLog={editingFeedingLog}
        selectedPet={selectedPet}
        petFeeds={petFeeds}
        petSupplements={petSupplements}
        t={t}
        setError={setError}
        onClose={() => { setFeedingLogModalOpen(false); setEditingFeedingLog(null); }}
        onSuccess={() => { if (selectedPet?.id) void loadFeedingLogs(selectedPet.id); }}
        onOpenFeedManage={() => setFeedManageModalOpen(true)}
      />
      <ExerciseLogModal
        open={exerciseLogModalOpen}
        editingLog={editingExerciseLog}
        selectedPet={selectedPet}
        exerciseTypeItems={exerciseTypeItems}
        exerciseIntensityItems={exerciseIntensityItems}
        exerciseLocationItems={exerciseLocationItems}
        petTypeOptions={optPetType}
        friendPets={friendPets}
        lang={lang}
        t={t}
        setError={setError}
        onClose={() => { setExerciseLogModalOpen(false); setEditingExerciseLog(null); }}
        onSuccess={() => { if (selectedPet?.id) void loadExerciseLogs(selectedPet.id); }}
      />
      <PetWizardModal
        open={petModalOpen}
        mode={petMode}
        editingPetId={editingPetId}
        locale={locale}
        options={petOptions}
        t={t}
        setError={setError}
        onClose={() => { setPetModalOpen(false); setEditingPetId(''); }}
        onSuccess={(savedPet) => {
          setPets((prev) => {
            const exists = prev.some((p) => p.id === savedPet.id);
            if (!exists) return [...prev, savedPet];
            return prev.map((p) => (p.id === savedPet.id ? savedPet : p));
          });
          setSelectedPetId(savedPet.id);
          setPetModalOpen(false);
          setEditingPetId('');
          void loadAll(feedTab, { silent: true });
        }}
      />

      {guardianProfile && (
        <GuardianProfileEditModal
          open={guardianProfileEditOpen}
          profile={guardianProfile}
          countries={guardianCountries}
          lang={lang as Lang}
          onClose={() => setGuardianProfileEditOpen(false)}
          onSaved={(updated) => setGuardianProfile(updated)}
        />
      )}
    </div>
  );
}
