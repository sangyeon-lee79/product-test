import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  type Booking,
  type FeedPost,
  type FriendRequest,
  type GlucoseAlert,
  type GuardianDevice,
  type HealthMeasurementSummary,
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
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [editingMeasurementLog, setEditingMeasurementLog] = useState<PetHealthMeasurementLog | null>(null);
  const [deviceManageModalOpen, setDeviceManageModalOpen] = useState(false);
  const [guardianDevices, setGuardianDevices] = useState<GuardianDevice[]>([]);
  const [selectedMeasurementItemId, setSelectedMeasurementItemId] = useState('');
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [petTab, setPetTab] = useState<PetProfileTab>('gallery');
  const [composeModalOpen, setComposeModalOpen] = useState(false);

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

  // Guardian devices — pet 변경 시에만 로드 (weightRange 무관)
  useEffect(() => {
    if (!selectedPet?.id) { setGuardianDevices([]); return; }
    void loadGuardianDevices(selectedPet.id);
  }, [selectedPet?.id]);

  useEffect(() => {
    if (!measurementLogs.length) {
      if (selectedMeasurementItemId) setSelectedMeasurementItemId('');
      return;
    }
    if (!selectedMeasurementItemId || !measurementLogs.some((log) => String(log.measurement_item_id) === selectedMeasurementItemId)) {
      setSelectedMeasurementItemId(String(measurementLogs[0].measurement_item_id || ''));
    }
  }, [measurementLogs, selectedMeasurementItemId]);

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
      if (res.logs && res.logs.length > 0 && !selectedMeasurementItemId) {
        setSelectedMeasurementItemId(String(res.logs[0].measurement_item_id || ''));
      }
    } catch (e) {
      setError(uiErrorMessage(e, t('guardian.health.measurement_log_load_failed', 'Failed to load health measurement logs.')));
      setMeasurementLogs([]);
      setMeasurementSummary(null);
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

  function renderCombinedHealthChart(weightRows: PetWeightLog[], mRows: PetHealthMeasurementLog[]) {
    if (!weightRows.length && !mRows.length) {
      return <div className="weight-chart-empty text-sm text-muted">{t('guardian.health.chart_empty', 'No health records to display.')}</div>;
    }
    const width = 720;
    const height = 260;
    const pad = 34;
    const rightPad = 46;
    const usableW = width - pad - rightPad;
    const usableH = height - pad * 2;

    const allTimes = [
      ...weightRows.map((row) => new Date(row.measured_at).getTime()),
      ...mRows.map((row) => new Date(row.measured_at).getTime()),
    ].filter((v) => Number.isFinite(v));
    if (!allTimes.length) return <div className="weight-chart-empty text-sm text-muted">{t('guardian.health.chart_empty', 'No health records to display.')}</div>;
    const minT = Math.min(...allTimes);
    const maxT = Math.max(...allTimes);
    const tSpan = Math.max(1, maxT - minT);

    const normalizeX = (timeMs: number) => pad + ((timeMs - minT) / tSpan) * usableW;
    const weightValues = weightRows.map((row) => Number(row.weight_value));
    const measurementValues = mRows.map((row) => Number(row.value));
    const minW = weightValues.length ? Math.min(...weightValues) : 0;
    const maxW = weightValues.length ? Math.max(...weightValues) : 1;
    const minM = measurementValues.length ? Math.min(...measurementValues) : 0;
    const maxM = measurementValues.length ? Math.max(...measurementValues) : 1;
    const wSpan = Math.max(0.0001, maxW - minW);
    const mSpan = Math.max(0.0001, maxM - minM);
    const normalizeYW = (value: number) => pad + (1 - ((value - minW) / wSpan)) * usableH;
    const normalizeYM = (value: number) => pad + (1 - ((value - minM) / mSpan)) * usableH;

    const sortedWeights = [...weightRows].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
    const sortedMeasurements = [...mRows].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

    const weightPath = sortedWeights
      .map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${normalizeX(new Date(row.measured_at).getTime())} ${normalizeYW(Number(row.weight_value))}`)
      .join(' ');
    const measurementPath = sortedMeasurements
      .map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${normalizeX(new Date(row.measured_at).getTime())} ${normalizeYM(Number(row.value))}`)
      .join(' ');

    return (
      <div className="weight-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Combined health trend chart">
          <rect x="0" y="0" width={width} height={height} rx="12" fill="#f7fbff" />
          <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#b8c8de" />
          <line x1={width - rightPad} y1={pad} x2={width - rightPad} y2={height - pad} stroke="#d6deec" />
          <line x1={pad} y1={height - pad} x2={width - rightPad} y2={height - pad} stroke="#b8c8de" />
          {weightPath && <path d={weightPath} fill="none" stroke="#1a73e8" strokeWidth="3" />}
          {measurementPath && <path d={measurementPath} fill="none" stroke="#ef6c00" strokeWidth="3" />}
          <text x={pad} y={16} fontSize="11" fill="#1a73e8">{`W ${maxW.toFixed(2)} / ${minW.toFixed(2)}`}</text>
          <text x={width - rightPad + 4} y={16} fontSize="11" fill="#ef6c00">{`M ${maxM.toFixed(2)} / ${minM.toFixed(2)}`}</text>
        </svg>
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
                                  <button className="btn btn-danger btn-sm" onClick={() => removeFeedPost(f.id)}>{t('common.delete', 'Delete')}</button>
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
                  <div className="gm-health-stats">
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.current_weight', '현재 몸무게')}</div>
                      <div className="gm-health-stat-value">{weightSummary?.latest_weight ?? selectedPet?.current_weight ?? '-'}</div>
                    </div>
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.last_measured', '최근 측정일')}</div>
                      <div className="gm-health-stat-value" style={{ fontSize: 14 }}>{formatDate(weightSummary?.latest_measured_at, '-')}</div>
                    </div>
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.latest_measurement', '최근 질병 수치')}</div>
                      <div className="gm-health-stat-value">{measurementSummary?.latest_value ?? '-'}</div>
                    </div>
                    <div className="gm-health-stat">
                      <div className="gm-health-stat-label">{t('guardian.health.judgement', '최근 판단 상태')}</div>
                      <div className="gm-health-stat-value" style={{ fontSize: 14 }}>{measurementSummary?.latest_judgement_label || measurementSummary?.latest_judgement_level || '-'}</div>
                    </div>
                  </div>
                  <div className="gm-section">
                    <div className="gm-section-header">
                      <span className="gm-section-title">{t('guardian.health.chart_title', '건강 추이')}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" style={{ fontSize: 12 }} onClick={() => setDeviceManageModalOpen(true)}>{t('guardian.device.manage_title', '장비 관리')}</button>
                        <button className="btn btn-primary btn-sm" onClick={() => setWeightModalOpen(true)}>{t('guardian.health.add_weight', '몸무게 추가')}</button>
                        <button className="btn btn-secondary btn-sm" onClick={openCreateHealthMeasurementModal}>{t('guardian.health.add_measurement', '수치 추가')}</button>
                      </div>
                    </div>
                    <div className="gm-section-body">
                      <div className="gm-period-chips" style={{ marginBottom: 12 }}>
                        {(['7d', '15d', '1m', '3m', '6m', '1y', 'all'] as const).map((range) => (
                          <button key={range} className={`gm-period-chip${weightRange === range ? ' active' : ''}`} onClick={() => setWeightRange(range)}>
                            {range === 'all' ? t('common.all', '전체') : range}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div className="form-group">
                          <label className="form-label">{t('guardian.health.measurement_item', '질병 수치 항목')}</label>
                          <select className="form-select" value={selectedMeasurementItemId} onChange={(e) => setSelectedMeasurementItemId(e.target.value)}>
                            <option value="">{t('common.select', 'Select')}</option>
                            {optMeasurement.filter((m) => measurementLogs.some((log) => log.measurement_item_id === m.id)).map((o) => (
                              <option key={o.id} value={o.id}>{optionLabel(o, t('common.none', '-'))}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {renderCombinedHealthChart(weightLogs, measurementLogs.filter((log) => !selectedMeasurementItemId || log.measurement_item_id === selectedMeasurementItemId))}
                    </div>
                  </div>
                  <div className="gm-section">
                    <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.weight_log', '몸무게 기록')}</span></div>
                    <div className="gm-section-body">
                      <div className="guardian-pet-list">
                        {weightLogs.map((log) => (
                          <div key={log.id} className="guardian-pet-item">
                            <p className="text-sm">{new Date(log.measured_at).toLocaleDateString()} · {log.weight_value} kg</p>
                            <div className="td-actions"><button className="btn btn-danger btn-sm" onClick={() => removeWeightLog(log.id)}>{t('common.delete', '삭제')}</button></div>
                          </div>
                        ))}
                        {weightLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.health.no_weight_logs', '몸무게 기록이 없습니다.')}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="gm-section">
                    <div className="gm-section-header"><span className="gm-section-title">{t('guardian.health.measurement_log', '질병 수치 로그')}</span></div>
                    <div className="gm-section-body">
                      <div className="guardian-pet-list">
                        {measurementLogs.filter((log) => !selectedMeasurementItemId || log.measurement_item_id === selectedMeasurementItemId).map((log) => (
                          <div key={log.id} className="guardian-pet-item">
                            <p className="text-sm">{new Date(log.measured_at).toLocaleString()} · {log.value}{log.judgement_label ? ` · ${log.judgement_label}` : ''}</p>
                            <div className="td-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => openEditHealthMeasurementLog(log)}>{t('common.edit', '수정')}</button>
                              <button className="btn btn-danger btn-sm" onClick={() => removeHealthMeasurementLog(log.id)}>{t('common.delete', '삭제')}</button>
                            </div>
                          </div>
                        ))}
                        {measurementLogs.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('guardian.health.no_measurement_logs', '질병 수치 기록이 없습니다.')}</p>}
                      </div>
                    </div>
                  </div>
                  {/* ── Health Log Timeline (S7) ── */}
                  <div className="gm-section">
                    <div className="gm-section-header">
                      <span className="gm-section-title">{t('guardian.log.timeline', 'Timeline')}</span>
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
                                <button className="btn btn-danger btn-sm" onClick={() => removePetLog(log.id)}>{t('common.delete', '삭제')}</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

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
                            <label className="form-label">{t('guardian.log.logtype', '기록 유형')} *</label>
                            <select className="form-select" value={logFormLogtypeId} onChange={(e) => { setLogFormLogtypeId(e.target.value); setLogFormValue(''); setLogFormUnitId(''); }}>
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
                                  <input className="form-input" type="number" step="any" value={logFormValue} onChange={(e) => setLogFormValue(e.target.value)} placeholder="0" style={{ flex: 1 }} />
                                  <select className="form-select" value={logFormUnitId} onChange={(e) => setLogFormUnitId(e.target.value)} style={{ width: 100 }}>
                                    <option value="">{t('common.unit', '단위')}</option>
                                    {unitItems.map((u) => <option key={u.id} value={u.id}>{u.display_label ?? u.key}</option>)}
                                  </select>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="form-group">
                            <label className="form-label">{t('guardian.log.event_date', '날짜')} *</label>
                            <input className="form-input" type="date" value={logFormDate} onChange={(e) => setLogFormDate(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">{t('guardian.log.event_time', '시간')}</label>
                            <input className="form-input" type="time" value={logFormTime} onChange={(e) => setLogFormTime(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">{t('guardian.log.title_field', '제목')}</label>
                            <input className="form-input" type="text" value={logFormTitle} onChange={(e) => setLogFormTitle(e.target.value)} placeholder={t('guardian.log.title_field', '제목')} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">{t('guardian.log.notes', '메모')}</label>
                            <textarea className="form-input" rows={3} value={logFormNotes} onChange={(e) => setLogFormNotes(e.target.value)} placeholder={t('guardian.log.notes', '메모')} />
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
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditPet(selectedPet.id)}>{t('common.edit', 'Edit')}</button>
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
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditPet(p.id)}>{t('common.edit', 'Edit')}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => removePet(p.id)}>{t('common.delete', '삭제')}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gm-sidebar-section">
                <div className="gm-sidebar-header">{t('guardian.sidebar.quick_actions', 'Quick Actions')}</div>
                <div className="gm-sidebar-body">
                  <div className="gm-quick-actions">
                    <button className="gm-quick-btn" onClick={() => setComposeModalOpen(true)}>✏️ {t('guardian.sidebar.post', 'Post')}</button>
                    <button className="gm-quick-btn" onClick={() => setWeightModalOpen(true)}>⚖️ {t('guardian.health.add_weight', 'Weight')}</button>
                    <button className="gm-quick-btn" onClick={openCreateHealthMeasurementModal}>📊 {t('guardian.health.add_measurement', 'Measure')}</button>
                    <button className="gm-quick-btn" onClick={() => setPetTab('gallery')}>🖼️ {t('guardian.tab.gallery', 'Gallery')}</button>
                  </div>
                </div>
              </div>
              {selectedPet && (
                <div className="gm-sidebar-section">
                  <div className="gm-sidebar-header">{t('guardian.sidebar.health_snapshot', 'Health Snapshot')}</div>
                  <div className="gm-sidebar-body">
                    <p className="text-sm">{t('guardian.health.current_weight', '현재 몸무게')}: <strong>{weightSummary?.latest_weight ?? selectedPet.current_weight ?? '-'}</strong></p>
                    <p className="text-sm">{t('guardian.health.delta', '직전 대비')}: <strong>{weightSummary?.delta_from_prev ?? '-'}{weightSummary?.delta_from_prev != null ? ' kg' : ''}</strong></p>
                    <p className="text-sm">{t('guardian.health.latest_measurement', '최근 수치')}: <strong>{measurementSummary?.latest_value ?? '-'}</strong></p>
                    <p className="text-sm" style={{ marginTop: 6 }}>{t('guardian.health.log_count', '수치 기록 수')}: <strong>{measurementLogs.length}</strong></p>
                  </div>
                </div>
              )}
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
        selectedPet={selectedPet}
        t={t}
        setError={setError}
        onClose={() => setWeightModalOpen(false)}
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
