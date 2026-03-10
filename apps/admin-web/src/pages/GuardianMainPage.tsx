import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  type Booking,
  type FeedingLog,
  type FeedPost,
  type FriendRequest,
  type GlucoseAlert,
  type GuardianDevice,
  type HealthMeasurementSummary,
  type PetFeed,
  type MasterItem,
  type Pet,
  type PetAlbumMedia,
  type PetHealthMeasurementLog,
  type PetLog,
  type PetWeightLog,
  type WeightSummary,
} from '../lib/api';

// log type → metric/unit config (matches local master seed)
const LOG_TYPE_METRIC_MAP: Record<string, { metricKey: string; unitKeys: string[] }> = {
  blood_glucose_log: { metricKey: 'blood_glucose', unitKeys: ['mg_dl', 'mmol_l'] },
  insulin_log:       { metricKey: 'insulin_dose',  unitKeys: ['iu'] },
  meal_log:          { metricKey: 'food_weight',   unitKeys: ['g', 'kcal', 'ml'] },
  water_log:         { metricKey: 'water_intake',  unitKeys: ['ml'] },
  activity_log:      { metricKey: 'duration',      unitKeys: ['min'] },
  weight_log:        { metricKey: 'body_weight',   unitKeys: ['kg'] },
};
import { useI18n, useT } from '../lib/i18n';
import { getStoredRole } from '../lib/auth';
import PetGalleryPanel from '../components/PetGalleryPanel';
import ComposeModal from './guardian/ComposeModal';
import WeightModal from './guardian/WeightModal';
import MeasurementModal from './guardian/MeasurementModal';
import DeviceManageModal from './guardian/DeviceManageModal';
import FeedManageModal from './guardian/FeedManageModal';
import FeedingLogModal from './guardian/FeedingLogModal';
import PetWizardModal from './guardian/PetWizardModal';
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
  fmtDateTime,
  feedTypeLabel,
  visibilityLabel,
  normalizeMultiStableIds,
} from './guardian/guardianTypes';

export default function GuardianMainPage() {
  const { pet_id: petIdParam } = useParams();
  const t = useT();
  const { lang } = useI18n();
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
  const [weightLogs, setWeightLogs] = useState<PetWeightLog[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<PetHealthMeasurementLog[]>([]);
  const [weightSummary, setWeightSummary] = useState<WeightSummary | null>(null);
  const [measurementSummary, setMeasurementSummary] = useState<HealthMeasurementSummary | null>(null);
  const [weightRange, setWeightRange] = useState<WeightRange>('1m');
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [editingWeightLog, setEditingWeightLog] = useState<PetWeightLog | null>(null);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [editingMeasurementLog, setEditingMeasurementLog] = useState<PetHealthMeasurementLog | null>(null);
  const [deviceManageModalOpen, setDeviceManageModalOpen] = useState(false);
  const [guardianDevices, setGuardianDevices] = useState<GuardianDevice[]>([]);
  const [feedManageModalOpen, setFeedManageModalOpen] = useState(false);
  const [petFeeds, setPetFeeds] = useState<PetFeed[]>([]);
  const [feedingLogModalOpen, setFeedingLogModalOpen] = useState(false);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [editingFeedingLog, setEditingFeedingLog] = useState<FeedingLog | null>(null);
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [petTab, setPetTab] = useState<PetProfileTab>('gallery');
  const [composeModalOpen, setComposeModalOpen] = useState(false);

  // ── Health sub-tabs ──────────────────────────────────────────────────────
  const [healthSubTab, setHealthSubTab] = useState<'graph' | 'timeline'>('graph');
  const [chartFilters, setChartFilters] = useState<{ weight: boolean; measurement: boolean; feeding: boolean; calories: boolean }>({ weight: true, measurement: true, feeding: true, calories: true });
  const toggleChartFilter = (key: keyof typeof chartFilters) => setChartFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Pagination ──────────────────────────────────────────────────────────
  const PAGE_SIZE = 10;
  const [weightLogPage, setWeightLogPage] = useState(1);
  const [measurementLogPage, setMeasurementLogPage] = useState(1);
  const [feedingLogPage, setFeedingLogPage] = useState(1);
  const [timelinePage, setTimelinePage] = useState(1);

  // ── S7 Health Logs ────────────────────────────────────────────────────────
  const [petLogs, setPetLogs] = useState<PetLog[]>([]);
  const [logAlert, setLogAlert] = useState<GlucoseAlert | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [optLogType, setOptLogType] = useState<{ id: string; code: string; label: string }[]>([]);
  const [optMetric, setOptMetric] = useState<MasterItem[]>([]);
  const [optUnit, setOptUnit] = useState<MasterItem[]>([]);
  const [logFormLogtypeId, setLogFormLogtypeId] = useState('');
  const [logFormValue, setLogFormValue] = useState('');
  const [logFormUnitId, setLogFormUnitId] = useState('');
  const [logFormDate, setLogFormDate] = useState('');
  const [logFormTime, setLogFormTime] = useState('');
  const [logFormTitle, setLogFormTitle] = useState('');
  const [logFormNotes, setLogFormNotes] = useState('');
  const [logFormSaving, setLogFormSaving] = useState(false);
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
        logTypeRows,
        metricRows,
        unitRows,
      ] = await Promise.all([
        safe(api.pets.list(), { pets: [] }, 'pets.list'),
        safe(api.bookings.list(), { bookings: [] }, 'bookings.list'),
        safe(api.friends.list(), { friends: [] }, 'friends.list'),
        safe(api.friends.requests.list('inbox'), { requests: [], scope: 'inbox' }, 'friends.requests'),
        safe(api.feeds.list({ tab, limit: 30 }), { feeds: [] }, 'feeds.list'),
        safe(api.petAlbum.list({ include_pending: true, limit: 400 }), { media: [] }, 'petAlbum.list'),
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
        loadCategoryItems(['log_type'], lang),
        loadCategoryItems(['metric'], lang),
        loadCategoryItems(['unit'], lang),
      ]);

      setPets(petsRes.pets || []);
      if (!selectedPetId && (petsRes.pets || []).length > 0) setSelectedPetId((petsRes.pets || [])[0].id);
      setBookings(bookingsRes.bookings || []);
      setFriendCount((friendsRes.friends || []).length);
      setPendingRequests((requestsRes.requests || []).filter((r) => r.status === 'request_sent'));
      setFeeds(feedsRes.feeds || []);
      setAlbumMedia(albumRes.media || []);

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
      setOptLogType(logTypeRows.map((item) => ({
        id: item.id,
        code: item.key ?? '',
        label: item.display_label ?? item[lang as keyof typeof item] as string ?? item.ko ?? item.key ?? '',
      })));
      setOptMetric(metricRows);
      setOptUnit(unitRows);

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
    setWeightLogPage(1);
    setMeasurementLogPage(1);
    setFeedingLogPage(1);
    if (!selectedPet?.id) {
      setWeightLogs([]);
      setWeightSummary(null);
      setMeasurementLogs([]);
      setMeasurementSummary(null);
      setPetLogs([]);
      return;
    }
    loadWeightLogs(selectedPet.id, weightRange);
    loadMeasurementLogs(selectedPet.id, weightRange);
    void loadPetLogs(selectedPet.id);
  }, [selectedPet?.id, weightRange]);

  // Guardian devices + pet feeds — pet 변경 시에만 로드 (weightRange 무관)
  useEffect(() => {
    if (!selectedPet?.id) { setGuardianDevices([]); setPetFeeds([]); setFeedingLogs([]); return; }
    void loadGuardianDevices(selectedPet.id);
    void loadPetFeeds(selectedPet.id);
    void loadFeedingLogs(selectedPet.id);
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

  async function loadPetLogs(petId: string) {
    try {
      const res = await api.pets.logs.list(petId, { limit: 50 });
      setPetLogs(res.logs || []);
    } catch {
      setPetLogs([]);
    }
  }

  async function createPetLog() {
    if (!selectedPet?.id) return;
    if (!logFormLogtypeId || !logFormDate) return;
    setLogFormSaving(true);
    try {
      const selectedCode = optLogType.find((o) => o.id === logFormLogtypeId)?.code ?? '';
      const metricCfg = LOG_TYPE_METRIC_MAP[selectedCode];
      const metricItem = metricCfg ? optMetric.find((m) => m.key === metricCfg.metricKey) : null;
      const valuesPayload = metricItem && logFormValue && logFormUnitId
        ? [{ metric_id: metricItem.id, unit_id: logFormUnitId, numeric_value: parseFloat(logFormValue) }]
        : [];
      const result = await api.pets.logs.create(selectedPet.id, {
        logtype_id: logFormLogtypeId,
        event_date: logFormDate,
        event_time: logFormTime || null,
        title: logFormTitle || null,
        notes: logFormNotes || null,
        values: valuesPayload,
      });
      setLogAlert(result.alert ?? null);
      setLogModalOpen(false);
      setLogFormLogtypeId('');
      setLogFormValue('');
      setLogFormUnitId('');
      setLogFormDate('');
      setLogFormTime('');
      setLogFormTitle('');
      setLogFormNotes('');
      await loadPetLogs(selectedPet.id);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.log.save_failed', '기록 저장에 실패했습니다.')));
    } finally {
      setLogFormSaving(false);
    }
  }

  async function removePetLog(logId: string) {
    if (!selectedPet?.id) return;
    if (!confirm(t('guardian.log.delete_confirm', '이 기록을 삭제하시겠습니까?'))) return;
    try {
      await api.pets.logs.remove(selectedPet.id, logId);
      await loadPetLogs(selectedPet.id);
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.log.delete_failed', '기록 삭제에 실패했습니다.')));
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
  type TimelineItem = { id: string; type: 'weight' | 'measurement' | 'feeding'; date: string; source: PetWeightLog | PetHealthMeasurementLog | FeedingLog };
  const unifiedTimeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    for (const log of weightLogs) items.push({ id: `w-${log.id}`, type: 'weight', date: log.measured_at, source: log });
    for (const log of measurementLogs) items.push({ id: `m-${log.id}`, type: 'measurement', date: log.measured_at, source: log });
    for (const log of feedingLogs) items.push({ id: `f-${log.id}`, type: 'feeding', date: log.feeding_time || log.created_at, source: log });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [weightLogs, measurementLogs, feedingLogs]);

  function renderCombinedHealthChart(weightRows: PetWeightLog[], mRows: PetHealthMeasurementLog[]) {
    if (!weightRows.length && !mRows.length && !petFeeds.length && !feedingLogs.length) {
      return <div className="weight-chart-empty text-sm text-muted">{t('guardian.health.chart_empty', 'No health records to display.')}</div>;
    }
    const width = 720;
    const hasFeedBands = petFeeds.filter((f) => f.start_date).length > 0;
    const feedBandHeight = hasFeedBands ? 40 : 0;
    const height = 280 + feedBandHeight;
    const padL = 50; // left pad for Y-axis labels
    const padR = 50; // right pad for second Y-axis
    const padT = 30;
    const padB = 34;
    const usableW = width - padL - padR;
    const chartBottom = height - padB - feedBandHeight;
    const usableH = chartBottom - padT;

    // Feeding logs with valid amount
    const feedingWithAmount = feedingLogs.filter((fl) => fl.amount_g != null && fl.feeding_time);

    // Calorie data: per-feeding calorie calculation
    const feedNutrMap = new Map<string, number>();
    for (const pf of petFeeds) {
      if (pf.calories_per_100g) feedNutrMap.set(pf.id, pf.calories_per_100g);
    }
    const caloriePoints = feedingWithAmount
      .filter((fl) => fl.pet_feed_id && fl.amount_g)
      .map((fl) => {
        const cal100 = fl.calories_per_100g ?? feedNutrMap.get(fl.pet_feed_id!) ?? 0;
        return { time: new Date(fl.feeding_time!).getTime(), cal: cal100 > 0 ? (Number(fl.amount_g) / 100) * cal100 : 0 };
      })
      .filter((p) => p.cal > 0);

    const allTimes = [
      ...weightRows.map((row) => new Date(row.measured_at).getTime()),
      ...mRows.map((row) => new Date(row.measured_at).getTime()),
      ...feedingWithAmount.map((fl) => new Date(fl.feeding_time!).getTime()),
    ].filter((v) => Number.isFinite(v));
    if (!allTimes.length && !hasFeedBands) return <div className="weight-chart-empty text-sm text-muted">{t('guardian.health.chart_empty', 'No health records to display.')}</div>;
    const minT = allTimes.length ? Math.min(...allTimes) : Date.now() - 86400000 * 30;
    const maxT = allTimes.length ? Math.max(...allTimes) : Date.now();
    const tSpan = Math.max(1, maxT - minT);

    const normalizeX = (timeMs: number) => padL + Math.max(0, Math.min(usableW, ((timeMs - minT) / tSpan) * usableW));

    // Normalize with 10% padding above/below
    function rangeWithPad(values: number[]): [number, number, number] {
      if (!values.length) return [0, 1, 1];
      const mn = Math.min(...values);
      const mx = Math.max(...values);
      const span = Math.max(0.0001, mx - mn);
      const padding = span * 0.1;
      return [mn - padding, mx + padding, span + padding * 2];
    }

    const weightValues = weightRows.map((row) => Number(row.weight_value));
    const measurementValues = mRows.map((row) => Number(row.value));
    const feedingValues = feedingWithAmount.map((fl) => Number(fl.amount_g));
    const calorieValues = caloriePoints.map((p) => p.cal);

    const [minW, , wSpan] = rangeWithPad(weightValues);
    const [minM, , mSpan] = rangeWithPad(measurementValues);
    const [minF, , fSpan] = rangeWithPad(feedingValues);
    const [minC, , cSpan] = rangeWithPad(calorieValues);

    const normalizeY = (value: number, mn: number, span: number) => padT + (1 - ((value - mn) / span)) * usableH;
    const normalizeYW = (v: number) => normalizeY(v, minW, wSpan);
    const normalizeYM = (v: number) => normalizeY(v, minM, mSpan);
    const normalizeYF = (v: number) => normalizeY(v, minF, fSpan);
    const normalizeYC = (v: number) => normalizeY(v, minC, cSpan);

    const sortedWeights = [...weightRows].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
    const sortedMeasurements = [...mRows].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
    const sortedFeedings = [...feedingWithAmount].sort((a, b) => new Date(a.feeding_time!).getTime() - new Date(b.feeding_time!).getTime());
    const sortedCalories = [...caloriePoints].sort((a, b) => a.time - b.time);

    // Quadratic bezier smooth path builder
    function smoothPath(points: Array<{ x: number; y: number }>): string {
      if (points.length === 0) return '';
      if (points.length === 1) return ''; // single point handled separately with circle
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const mx = (prev.x + curr.x) / 2;
        d += ` Q ${prev.x} ${prev.y} ${mx} ${(prev.y + curr.y) / 2}`;
        if (i === points.length - 1) {
          d += ` Q ${mx} ${(prev.y + curr.y) / 2} ${curr.x} ${curr.y}`;
        }
      }
      return d;
    }

    const wPoints = sortedWeights.map((r) => ({ x: normalizeX(new Date(r.measured_at).getTime()), y: normalizeYW(Number(r.weight_value)) }));
    const mPoints = sortedMeasurements.map((r) => ({ x: normalizeX(new Date(r.measured_at).getTime()), y: normalizeYM(Number(r.value)) }));
    const fPoints = sortedFeedings.map((fl) => ({ x: normalizeX(new Date(fl.feeding_time!).getTime()), y: normalizeYF(Number(fl.amount_g)) }));
    const cPoints = sortedCalories.map((p) => ({ x: normalizeX(p.time), y: normalizeYC(p.cal) }));

    const weightPath = wPoints.length > 1 ? smoothPath(wPoints) : '';
    const measurementPath = mPoints.length > 1 ? smoothPath(mPoints) : '';
    const feedingPath = fPoints.length > 1 ? smoothPath(fPoints) : '';
    const caloriePath = cPoints.length > 1 ? smoothPath(cPoints) : '';

    // Last points for end-of-line labels
    const lastWeight = sortedWeights[sortedWeights.length - 1];
    const lastMeasurement = sortedMeasurements[sortedMeasurements.length - 1];
    const lastFeeding = sortedFeedings[sortedFeedings.length - 1];
    const lastCalorie = sortedCalories[sortedCalories.length - 1];

    // Feed timeline bands
    const feedColors = ['#43a047', '#7b1fa2', '#e65100', '#0277bd', '#c62828', '#558b2f'];
    const feedBands = petFeeds
      .filter((f) => f.start_date)
      .map((f, i) => {
        const startMs = new Date(f.start_date!).getTime();
        const endMs = f.end_date ? new Date(f.end_date).getTime() : maxT;
        return { feed: f, startMs, endMs, color: feedColors[i % feedColors.length] };
      });

    const feedBandY = chartBottom + 8;

    // Y-axis tick labels
    const yTickCount = 4;
    const wTicks = weightValues.length ? Array.from({ length: yTickCount }, (_, i) => minW + (wSpan * i) / (yTickCount - 1)) : [];
    const mTicks = measurementValues.length ? Array.from({ length: yTickCount }, (_, i) => minM + (mSpan * i) / (yTickCount - 1)) : [];

    return (
      <div className="weight-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Combined health trend chart">
          <rect x="0" y="0" width={width} height={height} rx="12" fill="#f7fbff" />
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <line key={`grid-${frac}`} x1={padL} y1={padT + frac * usableH} x2={width - padR} y2={padT + frac * usableH}
              stroke="#e8edf3" strokeWidth="1" />
          ))}
          <line x1={padL} y1={padT} x2={padL} y2={chartBottom} stroke="#b8c8de" />
          <line x1={width - padR} y1={padT} x2={width - padR} y2={chartBottom} stroke="#d6deec" />
          <line x1={padL} y1={chartBottom} x2={width - padR} y2={chartBottom} stroke="#b8c8de" />

          {/* Left Y-axis labels (weight in blue) */}
          {chartFilters.weight && wTicks.map((v, i) => (
            <text key={`wt-${i}`} x={padL - 4} y={normalizeYW(v) + 3} fontSize="9" fill="#1a73e8" textAnchor="end">
              {v.toFixed(1)}
            </text>
          ))}

          {/* Right Y-axis labels (measurement in orange) */}
          {chartFilters.measurement && mTicks.map((v, i) => (
            <text key={`mt-${i}`} x={width - padR + 4} y={normalizeYM(v) + 3} fontSize="9" fill="#ef6c00" textAnchor="start">
              {v.toFixed(0)}
            </text>
          ))}

          {/* Feed change vertical markers */}
          {feedBands.map(({ feed, startMs, color }) => {
            const x = normalizeX(startMs);
            return (
              <line key={`fvm-${feed.id}`} x1={x} y1={padT} x2={x} y2={chartBottom}
                stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            );
          })}

          {/* Series paths — conditionally rendered based on legend toggles */}
          {chartFilters.weight && weightPath && <path d={weightPath} fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" />}
          {chartFilters.weight && wPoints.length === 1 && <circle cx={wPoints[0].x} cy={wPoints[0].y} r="4" fill="#1a73e8" />}

          {chartFilters.measurement && measurementPath && <path d={measurementPath} fill="none" stroke="#ef6c00" strokeWidth="2.5" strokeLinecap="round" />}
          {chartFilters.measurement && mPoints.length === 1 && <circle cx={mPoints[0].x} cy={mPoints[0].y} r="4" fill="#ef6c00" />}

          {chartFilters.feeding && feedingPath && <path d={feedingPath} fill="none" stroke="#43a047" strokeWidth="2" strokeDasharray="6 3" strokeLinecap="round" />}
          {chartFilters.feeding && fPoints.length === 1 && <circle cx={fPoints[0].x} cy={fPoints[0].y} r="4" fill="#43a047" />}

          {chartFilters.calories && caloriePath && <path d={caloriePath} fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" />}
          {chartFilters.calories && cPoints.length === 1 && <circle cx={cPoints[0].x} cy={cPoints[0].y} r="4" fill="#d32f2f" />}

          {/* Data point dots */}
          {chartFilters.weight && wPoints.map((p, i) => <circle key={`wd-${i}`} cx={p.x} cy={p.y} r="2.5" fill="#1a73e8" />)}
          {chartFilters.measurement && mPoints.map((p, i) => <circle key={`md-${i}`} cx={p.x} cy={p.y} r="2.5" fill="#ef6c00" />)}

          {/* Last-value labels */}
          {chartFilters.weight && lastWeight && (
            <text x={normalizeX(new Date(lastWeight.measured_at).getTime()) + 6} y={normalizeYW(Number(lastWeight.weight_value)) - 6} fontSize="10" fill="#1a73e8" fontWeight="600">
              {Number(lastWeight.weight_value).toFixed(1)}
            </text>
          )}
          {chartFilters.measurement && lastMeasurement && (
            <text x={normalizeX(new Date(lastMeasurement.measured_at).getTime()) + 6} y={normalizeYM(Number(lastMeasurement.value)) - 6} fontSize="10" fill="#ef6c00" fontWeight="600">
              {Number(lastMeasurement.value).toFixed(1)}
            </text>
          )}
          {chartFilters.feeding && lastFeeding && (
            <text x={normalizeX(new Date(lastFeeding.feeding_time!).getTime()) + 6} y={normalizeYF(Number(lastFeeding.amount_g)) - 6} fontSize="10" fill="#43a047" fontWeight="600">
              {Number(lastFeeding.amount_g).toFixed(0)}g
            </text>
          )}
          {chartFilters.calories && lastCalorie && (
            <text x={normalizeX(lastCalorie.time) + 6} y={normalizeYC(lastCalorie.cal) - 6} fontSize="10" fill="#d32f2f" fontWeight="600">
              {lastCalorie.cal.toFixed(0)}kcal
            </text>
          )}

          {/* Feed timeline bands */}
          {feedBands.map(({ feed, startMs, endMs, color }) => {
            const x1 = normalizeX(Math.max(startMs, minT));
            const x2 = normalizeX(Math.min(endMs, maxT));
            const w = Math.max(4, x2 - x1);
            const label = feed.nickname || feed.model_display_label || feed.model_name || '';
            return (
              <g key={`fb-${feed.id}`}>
                <rect x={x1} y={feedBandY} width={w} height={14} rx="3" fill={color} opacity="0.25" />
                <rect x={x1} y={feedBandY} width={3} height={14} rx="1" fill={color} opacity="0.7" />
                {w > 40 && (
                  <text x={x1 + 6} y={feedBandY + 10.5} fontSize="9" fill={color} fontWeight="500">
                    {label.length > 20 ? label.slice(0, 18) + '…' : label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {/* Clickable legend toggles */}
        <div className="gm-chart-legend">
          {weightRows.length > 0 && (
            <div className={`gm-chart-legend-item${!chartFilters.weight ? ' gm-legend-off' : ''}`} onClick={() => toggleChartFilter('weight')} style={{ cursor: 'pointer', opacity: chartFilters.weight ? 1 : 0.4 }}>
              <span className="gm-chart-legend-dot" style={{ background: '#1a73e8' }} />{t('guardian.health.chart_weight_legend', 'Weight')} (kg)
            </div>
          )}
          {mRows.length > 0 && (
            <div className={`gm-chart-legend-item${!chartFilters.measurement ? ' gm-legend-off' : ''}`} onClick={() => toggleChartFilter('measurement')} style={{ cursor: 'pointer', opacity: chartFilters.measurement ? 1 : 0.4 }}>
              <span className="gm-chart-legend-dot" style={{ background: '#ef6c00' }} />{t('guardian.health.chart_measure_legend', 'Measurement')}
            </div>
          )}
          {feedingWithAmount.length > 0 && (
            <div className={`gm-chart-legend-item${!chartFilters.feeding ? ' gm-legend-off' : ''}`} onClick={() => toggleChartFilter('feeding')} style={{ cursor: 'pointer', opacity: chartFilters.feeding ? 1 : 0.4 }}>
              <span className="gm-chart-legend-dot" style={{ background: '#43a047' }} />{t('guardian.feeding.amount', 'Feeding')} (g)
            </div>
          )}
          {caloriePoints.length > 0 && (
            <div className={`gm-chart-legend-item${!chartFilters.calories ? ' gm-legend-off' : ''}`} onClick={() => toggleChartFilter('calories')} style={{ cursor: 'pointer', opacity: chartFilters.calories ? 1 : 0.4 }}>
              <span className="gm-chart-legend-dot" style={{ background: '#d32f2f' }} />{t('guardian.feeding.total_calories', 'Calories')} (kcal)
            </div>
          )}
        </div>
      </div>
    );
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
          <button className="btn btn-primary btn-sm" onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
          <Link className="btn btn-secondary btn-sm" to="/">{t('guardian.main.public_feed', 'Feed')}</Link>
        </div>
      </div>

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
      </div>

      {error && <div className="alert alert-error" style={{ margin: '12px 24px 0' }}>{error}</div>}

      {loading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : (
        <div className="gm-content">
          <div className="gm-layout">
            <main className="gm-main">
              {pets.length === 0 && (
                <div className="gm-section">
                  <div className="gm-section-body gm-empty">
                    <div className="gm-empty-icon">🐾</div>
                    <div className="gm-empty-title">{t('guardian.empty.no_pets_title', 'Register your first pet')}</div>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{t('guardian.empty.no_pets_desc', 'Without a pet profile, feed/health/booking links are limited.')}</p>
                    <button className="btn btn-primary" onClick={openCreatePet}>{t('guardian.empty.no_pets_cta', 'Register your first pet')}</button>
                  </div>
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
                                  <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'))}</p>
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
                  {/* glucose alert banner */}
                  {logAlert && (
                    <div className={`gm-alert-banner gm-alert-${logAlert.severity}`} style={{ padding: '10px 14px', margin: '8px 0', borderRadius: 8, background: logAlert.severity === 'critical' ? 'var(--danger-light, #fee2e2)' : 'var(--warning-light, #fef9c3)', color: logAlert.severity === 'critical' ? '#b91c1c' : '#92400e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>⚠️ {t(logAlert.message_key, logAlert.type)} — {logAlert.value} {logAlert.unit}</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }} onClick={() => setLogAlert(null)}>✕</button>
                    </div>
                  )}
                  <div className="gm-health-summary-card">
                    <div className="gm-pet-avatar" style={{ width: 48, height: 48, fontSize: 20 }}>
                      {selectedPet ? selectedPet.name[0].toUpperCase() : '🐾'}
                    </div>
                    <div className="gm-health-summary-info">
                      <div className="gm-health-summary-name">{selectedPet?.name || '-'}</div>
                      <div className="gm-health-summary-row">
                        <span>{t('guardian.health.current_weight', '체중')}: <strong>{weightSummary?.latest_weight ?? selectedPet?.current_weight ?? '-'} kg</strong></span>
                        <span className="gm-health-summary-sep">·</span>
                        <span>{t('guardian.health.last_measured', '측정')}: <strong>{formatDate(weightSummary?.latest_measured_at, '-')}</strong></span>
                      </div>
                      <div className="gm-health-summary-row">
                        <span>{t('guardian.health.latest_measurement', '수치')}: <strong>{measurementSummary?.latest_value ?? '-'}</strong></span>
                        <span className="gm-health-summary-sep">·</span>
                        <span>{t('guardian.health.judgement', '상태')}: <strong>{measurementSummary?.latest_judgement_label || measurementSummary?.latest_judgement_level || '-'}</strong></span>
                      </div>
                    </div>
                  </div>
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

                  {/* ── Health Sub-Tabs (Graph / Timeline) ── */}
                  <div className="gm-period-chips" style={{ marginBottom: 4 }}>
                    <button className={`gm-period-chip${healthSubTab === 'graph' ? ' active' : ''}`} onClick={() => setHealthSubTab('graph')}>
                      {t('guardian.health.subtab_graph', '그래프')}
                    </button>
                    <button className={`gm-period-chip${healthSubTab === 'timeline' ? ' active' : ''}`} onClick={() => { setHealthSubTab('timeline'); setTimelinePage(1); }}>
                      {t('guardian.health.subtab_timeline', '타임라인')}
                    </button>
                  </div>

                  {/* ── Graph Sub-Tab ── */}
                  {healthSubTab === 'graph' && (
                    <>
                      <div className="gm-section">
                        <div className="gm-section-header">
                          <span className="gm-section-title">{t('guardian.health.chart_title', '건강 추이')}</span>
                        </div>
                        <div className="gm-section-body">
                          <div className="gm-period-chips" style={{ marginBottom: 12 }}>
                            {(['7d', '15d', '1m', '3m', '6m', '1y', 'all'] as const).map((range) => (
                              <button key={range} className={`gm-period-chip${weightRange === range ? ' active' : ''}`} onClick={() => setWeightRange(range)}>
                                {range === 'all' ? t('common.all', '전체') : range}
                              </button>
                            ))}
                          </div>
                          {renderCombinedHealthChart(weightLogs, measurementLogs)}
                        </div>
                      </div>
                      {/* ── Weight Logs ── */}
                      <div className="gm-section">
                        <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.weight_log', '몸무게 기록')}</span></div>
                        <div className="gm-section-body">
                          <div className="guardian-pet-list">
                            {weightLogs.slice((weightLogPage - 1) * PAGE_SIZE, weightLogPage * PAGE_SIZE).map((log) => (
                              <div key={log.id} className="guardian-pet-item">
                                <div>
                                  <p className="text-sm">{fmtDate(log.measured_at)} · {log.weight_value} kg</p>
                                  {log.notes && <p className="text-sm text-muted" style={{ fontSize: 11 }}>{log.notes}</p>}
                                </div>
                                <div className="td-actions">
                                  <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => { setEditingWeightLog(log); setWeightModalOpen(true); }}>✏️</button>
                                  <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeWeightLog(log.id)}>🗑️</button>
                                </div>
                              </div>
                            ))}
                            {weightLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.health.no_weight_logs', '몸무게 기록이 없습니다.')}</p>}
                          </div>
                          {renderPagination(weightLogPage, weightLogs.length, setWeightLogPage)}
                        </div>
                      </div>
                      {/* ── Measurement Logs ── */}
                      <div className="gm-section">
                        <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.measurement_log', '질병 수치 로그')}</span></div>
                        <div className="gm-section-body">
                          <div className="guardian-pet-list">
                            {measurementLogs.slice((measurementLogPage - 1) * PAGE_SIZE, measurementLogPage * PAGE_SIZE).map((log) => (
                              <div key={log.id} className="guardian-pet-item">
                                <div>
                                  <p className="text-sm">{fmtDateTime(log.measured_at)} · {log.value}{log.judgement_label ? ` · ${log.judgement_label}` : ''}</p>
                                  {log.memo && <p className="text-sm text-muted" style={{ fontSize: 11 }}>{log.memo}</p>}
                                </div>
                                <div className="td-actions">
                                  <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditHealthMeasurementLog(log)}>✏️</button>
                                  <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeHealthMeasurementLog(log.id)}>🗑️</button>
                                </div>
                              </div>
                            ))}
                            {measurementLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.health.no_measurement_logs', '질병 수치 기록이 없습니다.')}</p>}
                          </div>
                          {renderPagination(measurementLogPage, measurementLogs.length, setMeasurementLogPage)}
                        </div>
                      </div>
                      {/* ── Feeding Logs ── */}
                      <div className="gm-section">
                        <div className="gm-section-header"><span className="gm-section-title">{t('guardian.feeding.log_title', '급여 기록')}</span></div>
                        <div className="gm-section-body">
                          <div className="guardian-pet-list">
                            {feedingLogs.slice((feedingLogPage - 1) * PAGE_SIZE, feedingLogPage * PAGE_SIZE).map((log) => {
                              const fname = log.feed_nickname || log.model_display_label || log.model_name || t('common.none', '-');
                              return (
                                <div key={log.id} className="guardian-pet-item">
                                  <div>
                                    <p className="text-sm">{fmtDateTime(log.feeding_time)} · {fname}{log.amount_g != null ? ` ${log.amount_g}g` : ''}</p>
                                    {log.memo && <p className="text-sm text-muted" style={{ fontSize: 11 }}>{log.memo}</p>}
                                  </div>
                                  <div className="td-actions">
                                    <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => { setEditingFeedingLog(log); setFeedingLogModalOpen(true); }}>✏️</button>
                                    <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeFeedingLog(log.id)}>🗑️</button>
                                  </div>
                                </div>
                              );
                            })}
                            {feedingLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.feeding.no_logs', '급여 기록이 없습니다.')}</p>}
                          </div>
                          {renderPagination(feedingLogPage, feedingLogs.length, setFeedingLogPage)}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Timeline Sub-Tab ── */}
                  {healthSubTab === 'timeline' && (
                    <>
                      <div className="gm-section">
                        <div className="gm-section-header">
                          <span className="gm-section-title">{t('guardian.health.subtab_timeline', '타임라인')}</span>
                        </div>
                        <div className="gm-section-body">
                          {unifiedTimeline.length === 0 ? (
                            <div className="gm-tl-empty">
                              <div className="gm-tl-empty-icon">📋</div>
                              <p>{t('guardian.log.no_records', '기록이 없습니다.')}</p>
                            </div>
                          ) : (
                            <div className="gm-timeline">
                              {(() => {
                                let lastDateKey = '';
                                return unifiedTimeline.slice((timelinePage - 1) * PAGE_SIZE, timelinePage * PAGE_SIZE).map((item) => {
                                  const dateKey = fmtDate(item.date);
                                  const showDateHeader = dateKey !== lastDateKey;
                                  lastDateKey = dateKey;
                                  const dateHeader = showDateHeader ? <div key={`date-${dateKey}-${item.id}`} className="gm-tl-date">{dateKey}</div> : null;

                                  if (item.type === 'weight') {
                                    const log = item.source as PetWeightLog;
                                    return (<>{dateHeader}<div key={item.id} className="gm-tl-card" data-type="weight">
                                      <div className="gm-tl-icon">⚖️</div>
                                      <div className="gm-tl-body">
                                        <div className="gm-tl-title">{t('guardian.health.type_weight', '몸무게')}</div>
                                        <div className="gm-tl-value">{log.weight_value} kg</div>
                                        {log.notes && <div className="gm-tl-memo">{log.notes}</div>}
                                      </div>
                                      <div className="gm-tl-actions">
                                        <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => { setEditingWeightLog(log); setWeightModalOpen(true); }}>✏️</button>
                                        <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeWeightLog(log.id)}>🗑️</button>
                                      </div>
                                    </div></>);
                                  }
                                  if (item.type === 'measurement') {
                                    const log = item.source as PetHealthMeasurementLog;
                                    const hh = new Date(log.measured_at).getHours().toString().padStart(2, '0');
                                    const mm = new Date(log.measured_at).getMinutes().toString().padStart(2, '0');
                                    const contextLabel = log.measurement_context_id ? optMeasurementContext.find((o) => o.id === log.measurement_context_id)?.label : undefined;
                                    return (<>{dateHeader}<div key={item.id} className="gm-tl-card" data-type="measurement">
                                      <div className="gm-tl-icon">📊</div>
                                      <div className="gm-tl-body">
                                        <div className="gm-tl-title">{t('guardian.health.type_measurement', '수치')} <span className="gm-tl-meta">{hh}:{mm}</span></div>
                                        <div className="gm-tl-value">{log.value}{contextLabel ? <span className="gm-tl-meta" style={{ marginLeft: 6, fontWeight: 400 }}>({contextLabel})</span> : ''}{log.judgement_label ? <span className="gm-tl-meta" style={{ marginLeft: 6, fontWeight: 400 }}>{log.judgement_label}</span> : ''}</div>
                                        {log.memo && <div className="gm-tl-memo">{log.memo}</div>}
                                      </div>
                                      <div className="gm-tl-actions">
                                        <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditHealthMeasurementLog(log)}>✏️</button>
                                        <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeHealthMeasurementLog(log.id)}>🗑️</button>
                                      </div>
                                    </div></>);
                                  }
                                  // feeding
                                  const log = item.source as FeedingLog;
                                  const fname = log.feed_nickname || log.model_display_label || log.model_name || t('common.none', '-');
                                  const fTime = log.feeding_time ? (() => { const d = new Date(log.feeding_time); return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; })() : '';
                                  return (<>{dateHeader}<div key={item.id} className="gm-tl-card" data-type="feeding">
                                    <div className="gm-tl-icon">🍽️</div>
                                    <div className="gm-tl-body">
                                      <div className="gm-tl-title">{fname} {fTime && <span className="gm-tl-meta">{fTime}</span>}</div>
                                      <div className="gm-tl-value">{log.amount_g != null ? `${log.amount_g}g` : '-'}</div>
                                      {log.memo && <div className="gm-tl-memo">{log.memo}</div>}
                                    </div>
                                    <div className="gm-tl-actions">
                                      <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => { setEditingFeedingLog(log); setFeedingLogModalOpen(true); }}>✏️</button>
                                      <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removeFeedingLog(log.id)}>🗑️</button>
                                    </div>
                                  </div></>);
                                });
                              })()}
                            </div>
                          )}
                          {renderPagination(timelinePage, unifiedTimeline.length, setTimelinePage)}
                        </div>
                      </div>
                      {/* ── S7 Health Logs ── */}
                      <div className="gm-section">
                        <div className="gm-section-header">
                          <span className="gm-section-title">{t('guardian.log.timeline', 'Health Logs')}</span>
                          {isGuardian && <button className="btn btn-primary btn-sm" onClick={() => setLogModalOpen(true)}>+ {t('guardian.log.add', '기록 추가')}</button>}
                        </div>
                        <div className="gm-section-body">
                          {petLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.log.no_records', '기록이 없습니다.')}</p>}
                          <div className="guardian-pet-list">
                            {petLogs.map((log) => {
                              const ltLabel = optLogType.find((o) => o.id === log.logtype_id)?.label ?? log.logtype_code ?? log.logtype_id;
                              return (
                                <div key={log.id} className="guardian-pet-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span className="badge badge-gray" style={{ fontSize: 11 }}>{ltLabel}</span>
                                    <span className="text-muted" style={{ fontSize: 12 }}>{log.event_date}{log.event_time ? ` ${log.event_time}` : ''}</span>
                                  </div>
                                  {log.title && <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{log.title}</p>}
                                  {log.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{log.notes}</p>}
                                  {log.values.length > 0 && (
                                    <p style={{ fontSize: 12, margin: 0 }}>
                                      {log.values.map((v) => `${v.numeric_value ?? v.text_value ?? ''} ${v.unit_code ?? ''}`.trim()).join(' / ')}
                                    </p>
                                  )}
                                  <div className="td-actions">
                                    <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removePetLog(log.id)}>🗑️</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Log Create Modal ── */}
                  {logModalOpen && (
                    <div className="modal-overlay" onClick={() => setLogModalOpen(false)}>
                      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                          <h3 className="modal-title">{t('guardian.log.add', '기록 추가')}</h3>
                          <button className="modal-close" onClick={() => setLogModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                          <div className="form-group">
                            <label className="form-label" htmlFor="log-logtype">{t('guardian.log.logtype', '기록 유형')} *</label>
                            <select id="log-logtype" name="log-logtype" className="form-select" value={logFormLogtypeId} onChange={(e) => { setLogFormLogtypeId(e.target.value); setLogFormValue(''); setLogFormUnitId(''); }}>
                              <option value="">{t('common.select', 'Select')}</option>
                              {optLogType.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                          </div>
                          {(() => {
                            const selectedCode = optLogType.find((o) => o.id === logFormLogtypeId)?.code ?? '';
                            const metricCfg = LOG_TYPE_METRIC_MAP[selectedCode];
                            if (!metricCfg) return null;
                            const metricItem = optMetric.find((m) => m.key === metricCfg.metricKey);
                            if (!metricItem) return null;
                            const unitItems = optUnit.filter((u) => metricCfg.unitKeys.includes(u.key ?? ''));
                            const metricLabel = metricItem.display_label ?? metricItem[lang as keyof typeof metricItem] as string ?? metricItem.ko ?? metricItem.key;
                            return (
                              <div className="form-group">
                                <label className="form-label">{metricLabel}</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <input id="log-value" name="log-value" className="form-input" type="number" step="any" value={logFormValue} onChange={(e) => setLogFormValue(e.target.value)} placeholder="0" style={{ flex: 1 }} />
                                  <select id="log-unit" name="log-unit" className="form-select" value={logFormUnitId} onChange={(e) => setLogFormUnitId(e.target.value)} style={{ width: 100 }}>
                                    <option value="">{t('common.unit', '단위')}</option>
                                    {unitItems.map((u) => <option key={u.id} value={u.id}>{u.display_label ?? u.key}</option>)}
                                  </select>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="form-group">
                            <label className="form-label" htmlFor="log-event-date">{t('guardian.log.event_date', '날짜')} *</label>
                            <input id="log-event-date" name="log-event-date" className="form-input" type="date" value={logFormDate} onChange={(e) => setLogFormDate(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" htmlFor="log-event-time">{t('guardian.log.event_time', '시간')}</label>
                            <input id="log-event-time" name="log-event-time" className="form-input" type="time" value={logFormTime} onChange={(e) => setLogFormTime(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" htmlFor="log-title">{t('guardian.log.title_field', '제목')}</label>
                            <input id="log-title" name="log-title" className="form-input" type="text" value={logFormTitle} onChange={(e) => setLogFormTitle(e.target.value)} placeholder={t('guardian.log.title_field', '제목')} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" htmlFor="log-notes">{t('guardian.log.notes', '메모')}</label>
                            <textarea id="log-notes" name="log-notes" className="form-input" rows={3} value={logFormNotes} onChange={(e) => setLogFormNotes(e.target.value)} placeholder={t('guardian.log.notes', '메모')} />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={() => setLogModalOpen(false)}>{t('guardian.log.cancel', '취소')}</button>
                          <button className="btn btn-primary" disabled={!logFormLogtypeId || !logFormDate || logFormSaving} onClick={() => void createPetLog()}>
                            {logFormSaving ? t('common.saving', '저장 중...') : t('guardian.log.save', '저장')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {healthFeeds.length > 0 && (
                    <div className="gm-section">
                      <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.updates', 'Health Updates')}</span></div>
                      <div className="gm-section-body">
                        {healthFeeds.map((f) => (
                          <article key={f.id} className="sns-card">
                            <p className="sns-meta">{feedTypeLabel(t, f.feed_type)}</p>
                            <p className="text-sm text-muted">{formatDate(f.created_at, t('common.none', '-'))}</p>
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
                        <p className="text-sm text-muted">{formatDate(b.updated_at, t('common.none', '-'))}</p>
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
                </div>
              )}

              {/* ── Profile ── */}
              {petTab === 'profile' && selectedPet && (
                <div className="gm-section">
                  <div className="gm-section-header">
                    <span className="gm-section-title">{t('guardian.tab.profile', 'Pet Profile')}</span>
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
            </main>

            {/* ── Sidebar ── */}
            <aside className="gm-sidebar">
              <div className="gm-sidebar-section">
                <div className="gm-sidebar-header">{t('guardian.mypets.title', 'My Pets')}</div>
                <div className="gm-sidebar-body">
                  <button className="gm-quick-btn primary" style={{ width: '100%', marginBottom: 8 }} onClick={openCreatePet}>+ {t('common.add_pet', 'Add Pet')}</button>
                  {pets.map((p) => (
                    <div key={p.id} className="gm-pet-select-row">
                      <button className={`gm-pet-select-btn${selectedPet?.id === p.id ? ' active' : ''}`} onClick={() => setSelectedPetId(p.id)}>{p.name}</button>
                      <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditPet(p.id)}>✏️</button>
                      <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => removePet(p.id)}>🗑️</button>
                    </div>
                  ))}
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
        optDisease={optDisease}
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
      />
      <FeedingLogModal
        open={feedingLogModalOpen}
        editingLog={editingFeedingLog}
        selectedPet={selectedPet}
        petFeeds={petFeeds}
        t={t}
        setError={setError}
        onClose={() => { setFeedingLogModalOpen(false); setEditingFeedingLog(null); }}
        onSuccess={() => { if (selectedPet?.id) void loadFeedingLogs(selectedPet.id); }}
        onOpenFeedManage={() => setFeedManageModalOpen(true)}
      />
      <PetWizardModal
        open={petModalOpen}
        mode={petMode}
        editingPetId={editingPetId}
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
    </div>
  );
}
