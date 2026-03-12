// Pure mapper functions: raw health log → RecordCardProps
import type { PetWeightLog, PetHealthMeasurementLog, FeedingLog, PetExerciseLog, PetLog, PetFeed } from '../../types/api';
import type { Option } from '../../pages/guardian/guardianTypes';
import type { RecordCardData } from './RecordCard';

type TFn = (key: string, fallback?: string) => string;

function formatHHMM(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function mapWeightLog(log: PetWeightLog, t: TFn): RecordCardData {
  return {
    id: `w-${log.id}`,
    type: 'weight',
    icon: '⚖️',
    title: t('guardian.health.weight_log', 'Weight'),
    time: formatHHMM(log.measured_at),
    values: [
      { label: t('guardian.record.value', 'Value'), value: String(log.weight_value), unit: t('unit.kg', 'kg') },
    ],
    notes: log.notes || undefined,
    images: [],
  };
}

export function mapMeasurementLog(
  log: PetHealthMeasurementLog,
  optMetric: Option[],
  optMeasurementContext: Option[],
  t: TFn,
): RecordCardData {
  const metric = optMetric.find((m) => m.id === log.measurement_item_id);
  const metricLabel = metric?.label;
  const context = optMeasurementContext.find((o) => o.id === log.measurement_context_id);
  const ctxLabel = context
    ? (context.i18nKey ? t(context.i18nKey, context.label) : context.label)
    : undefined;

  const values = [
    { label: metricLabel || t('guardian.record.metric', 'Metric'), value: String(log.value) },
  ];
  if (ctxLabel) values.push({ label: t('guardian.record.context', 'Context'), value: ctxLabel });

  return {
    id: `m-${log.id}`,
    type: 'measurement',
    icon: '📊',
    title: metricLabel || t('guardian.health.measure_log', 'Measurement'),
    time: formatHHMM(log.measured_at),
    values,
    notes: log.memo || undefined,
    images: [],
  };
}

export function mapFeedingLog(
  log: FeedingLog,
  petFeeds: PetFeed[],
  getMixedFeedLabel: (log: FeedingLog) => string,
  t: TFn,
): RecordCardData {
  const isMixed = !!log.is_mixed && !!log.items?.length;
  const totalG = isMixed
    ? log.items!.reduce((sum, item) => sum + (item.amount_g ?? 0), 0)
    : (log.amount_g ?? null);
  const totalKcal = isMixed
    ? Math.round(log.items!.reduce((sum, item) => sum + ((item.amount_g ?? 0) * (item.calories_per_100g ?? 0) / 100), 0))
    : ((log.amount_g && log.calories_per_100g) ? Math.round(log.amount_g * log.calories_per_100g / 100) : null);
  const feedLabel = isMixed
    ? getMixedFeedLabel(log)
    : (log.feed_nickname || log.model_display_label || log.model_name || t('common.none', '-'));

  const values = [];
  if (totalG != null) values.push({ label: t('guardian.record.amount', 'Amount'), value: String(totalG), unit: t('unit.g', 'g') });
  if (totalKcal) values.push({ label: t('guardian.record.calories', 'Cal'), value: String(totalKcal), unit: t('unit.kcal', 'kcal') });

  const images: RecordCardData['images'] = [];
  if (!isMixed && log.pet_feed_id) {
    const pf = petFeeds.find((f) => f.id === log.pet_feed_id);
    if (pf?.image_url) images.push({ url: pf.image_url, alt: feedLabel });
  }

  return {
    id: `f-${log.id}`,
    type: 'feeding',
    icon: '🍽️',
    title: feedLabel,
    time: formatHHMM(log.feeding_time || log.created_at),
    values,
    notes: log.memo || undefined,
    images,
  };
}

export function mapExerciseLog(log: PetExerciseLog, t: TFn): RecordCardData {
  const typeLabel = t(`master.exercise_type.${log.exercise_type}`, log.exercise_type);
  const intensityLabel = t(`guardian.exercise.intensity_${log.intensity}`, log.intensity);

  const values = [
    { label: t('guardian.record.duration', 'Duration'), value: String(log.duration_min), unit: t('unit.min', 'min') },
    { label: t('guardian.record.intensity', 'Intensity'), value: intensityLabel },
  ];
  if (log.distance_km != null) {
    values.push({ label: t('guardian.record.distance', 'Distance'), value: String(log.distance_km), unit: t('unit.km', 'km') });
  }

  return {
    id: `e-${log.id}`,
    type: 'exercise',
    icon: '🏃',
    title: typeLabel,
    time: formatHHMM(log.exercise_date),
    values,
    notes: log.note || undefined,
    images: [],
  };
}

export function mapMedicationLog(log: PetLog, t: TFn): RecordCardData {
  const meta = (log.metadata || {}) as Record<string, unknown>;
  const medicineName = String(meta.medicine_name || log.title || t('guardian.health.medication_log', 'Medication'));
  const doseAmount = meta.dose_amount ? String(meta.dose_amount) : '';
  const doseUnit = meta.dose_unit ? String(meta.dose_unit) : '';
  const prescribed = meta.prescribed === true;

  const values = [];
  if (doseAmount) values.push({ label: t('guardian.record.dose', 'Dose'), value: doseAmount, unit: doseUnit || undefined });

  const images: RecordCardData['images'] = (log.media || [])
    .filter((m) => m.media_url)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({ url: m.media_url, thumbnailUrl: m.thumbnail_url || undefined, alt: medicineName }));

  return {
    id: `med-${log.id}`,
    type: 'medication',
    icon: '💉',
    title: medicineName,
    time: formatHHMM(log.event_date || log.created_at),
    badge: prescribed ? t('guardian.medication.prescribed', 'Rx') : undefined,
    values,
    notes: log.notes || undefined,
    images,
  };
}
