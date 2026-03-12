import { useState, useEffect, useCallback } from 'react';
import { useT } from '../lib/i18n';
import { api } from '../lib/api';
import type { FeedCardSetting, FeedDummyCard, FeedPreviewItem } from '../lib/api';

const TAB_TYPES = [
  'weekly_health_king',
  'breed_health_king',
  'new_registration',
  'local_health_king',
  'recommended_user',
  'store',
  'ad',
] as const;

const CARD_TYPE_KEYS: Record<string, string> = {
  ranking: 'admin.feed_card.type_ranking',
  recommended: 'admin.feed_card.type_recommended',
  ad: 'admin.feed_card.type_ad',
  store: 'admin.feed_card.type_store',
};

const TAB_TYPE_KEYS: Record<string, string> = {
  weekly_health_king: 'admin.feed_card.dummy_tab_weekly_health_king',
  breed_health_king: 'admin.feed_card.dummy_tab_breed_health_king',
  new_registration: 'admin.feed_card.dummy_tab_new_registration',
  local_health_king: 'admin.feed_card.dummy_tab_local_health_king',
  recommended_user: 'admin.feed_card.dummy_tab_recommended_user',
  store: 'admin.feed_card.dummy_tab_store',
  ad: 'admin.feed_card.dummy_tab_ad',
};

const PREVIEW_COLORS: Record<string, string> = {
  post: 'var(--border)',
  ranking: '#f59e0b',
  recommended: '#3b82f6',
  ad: '#10b981',
  store: '#9b5de5',
};

const STORE_CATEGORIES = [
  { key: '', i18nKey: 'admin.feed_card.store_cat_all', fallback: 'All' },
  { key: 'grooming', i18nKey: 'admin.feed_card.store_cat_grooming', fallback: 'Grooming' },
  { key: 'hospital', i18nKey: 'admin.feed_card.store_cat_hospital', fallback: 'Hospital' },
  { key: 'hotel', i18nKey: 'admin.feed_card.store_cat_hotel', fallback: 'Hotel' },
  { key: 'training', i18nKey: 'admin.feed_card.store_cat_training', fallback: 'Training' },
  { key: 'shop', i18nKey: 'admin.feed_card.store_cat_shop', fallback: 'Shop' },
  { key: 'cafe', i18nKey: 'admin.feed_card.store_cat_cafe', fallback: 'Café' },
  { key: 'photo', i18nKey: 'admin.feed_card.store_cat_photo', fallback: 'Photo' },
];

export default function FeedCardSettingsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<'settings' | 'dummy'>('settings');

  return (
    <div className="fcs-page">
      <div className="fcs-tabs">
        <button
          className={`fcs-tab${activeTab === 'settings' ? ' active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          {t('admin.feed_card.tab_settings', 'Settings')}
        </button>
        <button
          className={`fcs-tab${activeTab === 'dummy' ? ' active' : ''}`}
          onClick={() => setActiveTab('dummy')}
        >
          {t('admin.feed_card.tab_dummy_data', 'Dummy Data')}
        </button>
      </div>

      {activeTab === 'settings' ? <SettingsTab /> : <DummyDataTab />}
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────

function SettingsTab() {
  const t = useT();
  const [settings, setSettings] = useState<FeedCardSetting[]>([]);
  const [preview, setPreview] = useState<FeedPreviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        api.feedCardSettings.list(),
        api.feedCardSettings.preview(),
      ]);
      setSettings(sRes.settings);
      setPreview(pRes.preview);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    setSettings(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((s, i) => ({ ...s, sort_order: i + 1 }));
    });
  };

  const moveDown = (idx: number) => {
    if (idx >= settings.length - 1) return;
    setSettings(prev => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((s, i) => ({ ...s, sort_order: i + 1 }));
    });
  };

  const updateField = (idx: number, field: string, value: unknown) => {
    setSettings(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.feedCardSettings.bulkUpdate(
        settings.map(s => ({
          id: s.id,
          is_enabled: s.is_enabled,
          interval_n: s.interval_n,
          sort_order: s.sort_order,
          rotation_order: s.rotation_order,
        }))
      );
      setMsg(t('admin.feed_card.save_success', 'Settings saved successfully'));
      // Refresh preview
      const pRes = await api.feedCardSettings.preview();
      setPreview(pRes.preview);
    } catch {
      setMsg(t('admin.feed_card.save_error', 'Failed to save settings'));
    }
    setSaving(false);
  };

  if (loading) return <div className="fcs-loading">Loading...</div>;

  return (
    <div className="fcs-settings-layout">
      {/* Settings panel */}
      <div className="fcs-settings-panel">
        <div className="fcs-card-list">
          {settings.map((s, idx) => (
            <div key={s.id} className="fcs-card-row">
              <div className="fcs-card-order">
                <button
                  className="fcs-btn-sm"
                  disabled={idx === 0}
                  onClick={() => moveUp(idx)}
                  title={t('admin.feed_card.move_up', 'Move Up')}
                >
                  ▲
                </button>
                <button
                  className="fcs-btn-sm"
                  disabled={idx === settings.length - 1}
                  onClick={() => moveDown(idx)}
                  title={t('admin.feed_card.move_down', 'Move Down')}
                >
                  ▼
                </button>
              </div>

              <div className="fcs-card-info">
                <span
                  className="fcs-card-type-badge"
                  style={{ background: PREVIEW_COLORS[s.card_type] || 'var(--border)' }}
                >
                  {t(CARD_TYPE_KEYS[s.card_type] || '', s.card_type)}
                </span>
              </div>

              <label className="fcs-toggle-wrap">
                <input
                  type="checkbox"
                  checked={s.is_enabled}
                  onChange={e => updateField(idx, 'is_enabled', e.target.checked)}
                />
                <span className="fcs-toggle-label">
                  {s.is_enabled
                    ? t('admin.feed_card.enabled', 'Enabled')
                    : t('admin.feed_card.disabled', 'Disabled')}
                </span>
              </label>

              <label className="fcs-interval-wrap">
                <span className="fcs-field-label">
                  {t('admin.feed_card.interval', 'Insert Interval')}
                </span>
                <input
                  type="number"
                  className="fcs-input-num"
                  min={1}
                  max={100}
                  value={s.interval_n}
                  onChange={e => updateField(idx, 'interval_n', parseInt(e.target.value) || 1)}
                />
                <span className="fcs-unit">
                  {t('admin.feed_card.posts_unit', 'posts')}
                </span>
              </label>

              {s.card_type === 'ranking' && (
                <div className="fcs-rotation-wrap">
                  <span className="fcs-field-label">
                    {t('admin.feed_card.rotation_mode', 'Display Order')}
                  </span>
                  <div className="fcs-rotation-radios">
                    <label className="fcs-radio-label">
                      <input
                        type="radio"
                        name={`rotation-${s.id}`}
                        checked={s.rotation_order > 0}
                        onChange={() => updateField(idx, 'rotation_order', 1)}
                      />
                      {t('admin.feed_card.rotation_sequential', 'Sequential from 1st')}
                    </label>
                    <label className="fcs-radio-label">
                      <input
                        type="radio"
                        name={`rotation-${s.id}`}
                        checked={s.rotation_order === 0}
                        onChange={() => updateField(idx, 'rotation_order', 0)}
                      />
                      {t('admin.feed_card.rotation_random', 'Random')}
                    </label>
                  </div>
                  <span className="fcs-rotation-hint">
                    {t('admin.feed_card.rotation_hint', 'How ranking cards cycle through positions')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fcs-actions">
          <button className="fcs-btn-save" onClick={save} disabled={saving}>
            {saving ? '...' : t('admin.feed_card.save', 'Save')}
          </button>
          {msg && <span className="fcs-msg">{msg}</span>}
        </div>
      </div>

      {/* Preview panel */}
      <div className="fcs-preview-panel">
        <h3 className="fcs-preview-title">
          {t('admin.feed_card.preview_title', 'Feed Preview')}
        </h3>
        <div className="fcs-preview-list">
          {preview.map((item) => (
            <div
              key={item.position}
              className={`fcs-preview-item fcs-preview-${item.type}`}
              style={{ borderLeftColor: PREVIEW_COLORS[item.type] }}
            >
              <span className="fcs-preview-pos">#{item.position}</span>
              <span className="fcs-preview-label">
                {item.type === 'post'
                  ? `${t('admin.feed_card.preview_post', 'Post')} ${item.label.replace('Post #', '#')}`
                  : t(CARD_TYPE_KEYS[item.type] || '', item.type)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dummy Data Tab ─────────────────────────────────────────

function DummyDataTab() {
  const t = useT();
  const [activeSubTab, setActiveSubTab] = useState<string>(TAB_TYPES[0]);
  const [cards, setCards] = useState<FeedDummyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<FeedDummyCard | null>(null);
  const [msg, setMsg] = useState('');
  const [storeCatFilter, setStoreCatFilter] = useState('');

  const loadCards = useCallback(async (tabType: string) => {
    setLoading(true);
    try {
      const res = await api.feedCardSettings.dummyCards.list({ tab_type: tabType });
      setCards(res.cards);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadCards(activeSubTab); }, [activeSubTab, loadCards]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.feed_card.dummy_delete_confirm', 'Delete this card?'))) return;
    try {
      await api.feedCardSettings.dummyCards.delete(id);
      setMsg(t('admin.feed_card.dummy_delete_success', 'Card deleted'));
      loadCards(activeSubTab);
    } catch { /* ignore */ }
  };

  const handleToggleActive = async (card: FeedDummyCard) => {
    try {
      await api.feedCardSettings.dummyCards.update(card.id, { is_active: !card.is_active });
      loadCards(activeSubTab);
    } catch { /* ignore */ }
  };

  return (
    <div className="fcs-dummy-layout">
      {/* Sub-tabs */}
      <div className="fcs-subtabs">
        {TAB_TYPES.map(tab => (
          <button
            key={tab}
            className={`fcs-subtab${activeSubTab === tab ? ' active' : ''}`}
            onClick={() => { setActiveSubTab(tab); setMsg(''); setStoreCatFilter(''); }}
          >
            {t(TAB_TYPE_KEYS[tab], tab)}
          </button>
        ))}
      </div>

      {/* Cards list */}
      <div className="fcs-dummy-content">
        <div className="fcs-dummy-header">
          <button
            className="fcs-btn-add"
            onClick={() => { setEditCard(null); setModalOpen(true); }}
          >
            + {t('admin.feed_card.dummy_add', 'Add Card')}
          </button>
          {msg && <span className="fcs-msg">{msg}</span>}
        </div>

        {/* Store category filter */}
        {activeSubTab === 'store' && (
          <div className="fcs-cat-filter">
            {STORE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`fcs-cat-btn${storeCatFilter === cat.key ? ' active' : ''}`}
                onClick={() => setStoreCatFilter(cat.key)}
              >
                {t(cat.i18nKey, cat.fallback)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="fcs-loading">Loading...</div>
        ) : cards.length === 0 ? (
          <div className="fcs-empty">{t('admin.feed_card.no_cards', 'No cards registered')}</div>
        ) : (
          <div className="fcs-dummy-list">
            {cards.filter(card =>
              activeSubTab !== 'store' || !storeCatFilter || card.badge_text === storeCatFilter
            ).map(card => (
              <div key={card.id} className={`fcs-dummy-card${card.is_active ? '' : ' inactive'}`}>
                {card.image_url && (
                  <img className="fcs-dummy-thumb" src={card.image_url} alt="" />
                )}
                <div className="fcs-dummy-info">
                  <div className="fcs-dummy-title-row">
                    <span className="fcs-dummy-title">{card.title || '—'}</span>
                    {card.badge_text && <span className="fcs-dummy-badge">{card.badge_text}</span>}
                  </div>
                  {card.display_name && (
                    <span className="fcs-dummy-name">{card.display_name}</span>
                  )}
                  {card.subtitle && (
                    <span className="fcs-dummy-sub">{card.subtitle}</span>
                  )}
                </div>
                <div className="fcs-dummy-actions">
                  <button
                    className={`fcs-btn-toggle${card.is_active ? ' on' : ''}`}
                    onClick={() => handleToggleActive(card)}
                    title={card.is_active
                      ? t('admin.feed_card.dummy_active', 'Active')
                      : t('admin.feed_card.dummy_inactive', 'Inactive')}
                  >
                    {card.is_active ? '●' : '○'}
                  </button>
                  <button
                    className="fcs-btn-edit"
                    onClick={() => { setEditCard(card); setModalOpen(true); }}
                  >
                    {t('admin.feed_card.dummy_edit', 'Edit')}
                  </button>
                  <button
                    className="fcs-btn-delete"
                    onClick={() => handleDelete(card.id)}
                  >
                    {t('admin.feed_card.dummy_delete', 'Delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <DummyCardModal
          card={editCard}
          tabType={activeSubTab}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            setMsg(t('admin.feed_card.dummy_save_success', 'Card saved'));
            loadCards(activeSubTab);
          }}
        />
      )}
    </div>
  );
}

// ─── Dummy Card Modal ───────────────────────────────────────

function DummyCardModal({
  card,
  tabType,
  onClose,
  onSaved,
}: {
  card: FeedDummyCard | null;
  tabType: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: card?.title || '',
    subtitle: card?.subtitle || '',
    description: card?.description || '',
    image_url: card?.image_url || '',
    link_url: card?.link_url || '',
    avatar_url: card?.avatar_url || '',
    display_name: card?.display_name || '',
    badge_text: card?.badge_text || '',
    score: card?.score ?? 0,
    region: card?.region || '',
    breed_info: card?.breed_info || '',
    pet_type: card?.pet_type || '',
    sort_order: card?.sort_order ?? 0,
    is_active: card?.is_active !== false,
    start_date: card?.start_date?.slice(0, 10) || '',
    end_date: card?.end_date?.slice(0, 10) || '',
  });

  const setField = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        tab_type: tabType,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (card) {
        await api.feedCardSettings.dummyCards.update(card.id, data);
      } else {
        await api.feedCardSettings.dummyCards.create(data as Partial<FeedDummyCard> & { tab_type: string });
      }
      onSaved();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const fields: Array<{ key: string; i18nKey: string; fallback: string; type?: string }> = [
    { key: 'title', i18nKey: 'admin.feed_card.dummy_title', fallback: 'Title' },
    { key: 'subtitle', i18nKey: 'admin.feed_card.dummy_subtitle', fallback: 'Subtitle' },
    { key: 'description', i18nKey: 'admin.feed_card.dummy_description', fallback: 'Description' },
    { key: 'display_name', i18nKey: 'admin.feed_card.dummy_display_name', fallback: 'Display Name' },
    { key: 'badge_text', i18nKey: 'admin.feed_card.dummy_badge_text', fallback: 'Badge Text' },
    { key: 'score', i18nKey: 'admin.feed_card.dummy_score', fallback: 'Score', type: 'number' },
    { key: 'image_url', i18nKey: 'admin.feed_card.dummy_image_url', fallback: 'Image URL' },
    { key: 'avatar_url', i18nKey: 'admin.feed_card.dummy_avatar_url', fallback: 'Avatar URL' },
    { key: 'link_url', i18nKey: 'admin.feed_card.dummy_link_url', fallback: 'Link URL' },
    { key: 'region', i18nKey: 'admin.feed_card.dummy_region', fallback: 'Region' },
    { key: 'breed_info', i18nKey: 'admin.feed_card.dummy_breed_info', fallback: 'Breed Info' },
    { key: 'pet_type', i18nKey: 'admin.feed_card.dummy_pet_type', fallback: 'Pet Type' },
    { key: 'sort_order', i18nKey: 'admin.feed_card.sort_order', fallback: 'Priority', type: 'number' },
    { key: 'start_date', i18nKey: 'admin.feed_card.dummy_start_date', fallback: 'Start Date', type: 'date' },
    { key: 'end_date', i18nKey: 'admin.feed_card.dummy_end_date', fallback: 'End Date', type: 'date' },
  ];

  return (
    <div className="fcs-modal-backdrop" onClick={onClose}>
      <div className="fcs-modal" onClick={e => e.stopPropagation()}>
        <h3>{card ? t('admin.feed_card.dummy_edit', 'Edit') : t('admin.feed_card.dummy_add', 'Add Card')}</h3>

        <div className="fcs-modal-form">
          {fields.map(f => (
            <label key={f.key} className="fcs-form-field">
              <span>{t(f.i18nKey, f.fallback)}</span>
              <input
                type={f.type || 'text'}
                value={(form as Record<string, unknown>)[f.key] as string}
                onChange={e => setField(
                  f.key,
                  f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                )}
              />
            </label>
          ))}

          <label className="fcs-form-field fcs-form-check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setField('is_active', e.target.checked)}
            />
            <span>{t('admin.feed_card.dummy_active', 'Active')}</span>
          </label>
        </div>

        <div className="fcs-modal-actions">
          <button className="fcs-btn-cancel" onClick={onClose}>
            {t('admin.feed_card.cancel', 'Cancel')}
          </button>
          <button className="fcs-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '...' : t('admin.feed_card.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
