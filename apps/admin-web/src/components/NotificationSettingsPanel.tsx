import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { NotificationSettings } from '../types/api';
import { useT } from '../lib/i18n';

const SETTING_KEYS: (keyof NotificationSettings)[] = [
  'friend_request',
  'friend_accepted',
  'post_like',
  'post_comment',
  'friend_new_post',
  'pet_health_remind',
  'appointment_remind',
  'service_notice',
  'marketing',
];

export default function NotificationSettingsPanel() {
  const t = useT();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api.notifications.getSettings().then(res => {
      if (res) setSettings(res.settings);
    }).catch(() => {});
  }, []);

  async function toggle(key: keyof NotificationSettings) {
    if (!settings) return;
    const newVal = !settings[key];
    setSaving(key);
    try {
      await api.notifications.updateSettings({ [key]: newVal });
      setSettings(prev => prev ? { ...prev, [key]: newVal } : prev);
    } catch { /* silent */ }
    setSaving(null);
  }

  if (!settings) {
    return <div className="notif-settings-loading">...</div>;
  }

  return (
    <div className="notif-settings">
      <h4 className="notif-settings-title">{t('notification.settings.title', 'Notification Settings')}</h4>
      {SETTING_KEYS.map(key => (
        <label key={key} className="notif-settings-row">
          <span className="notif-settings-label">
            {t(`notification.settings.${key}`, key.replace(/_/g, ' '))}
          </span>
          <button
            className={`notif-toggle${settings[key] ? ' on' : ''}`}
            onClick={() => toggle(key)}
            disabled={saving === key}
          >
            <span className="notif-toggle-thumb" />
          </button>
        </label>
      ))}
    </div>
  );
}
