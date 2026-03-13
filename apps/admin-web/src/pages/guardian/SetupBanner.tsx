import type { GuardianDevice, PetFeed } from '../../lib/api';
import { useT } from '../../lib/i18n';

interface Props {
  petId?: string;
  devices: GuardianDevice[];
  feeds: PetFeed[];
  onOpenDeviceManage: () => void;
  onOpenFeedManage: () => void;
}

export default function SetupBanner({ devices, feeds, onOpenDeviceManage, onOpenFeedManage }: Props) {
  const t = useT();

  if (devices.length > 0 && feeds.length > 0) return null;

  return (
    <div className="pf-gd-setup-banner">
      <div className="pf-gd-setup-icons">
        <span className="pf-gd-setup-icon">🩺</span>
        <span className="pf-gd-setup-icon">🥣</span>
      </div>
      <div className="pf-gd-setup-text">
        <strong className="pf-gd-setup-title">{t('health.setup.title')}</strong>
        <span className="pf-gd-setup-desc">{t('health.setup.desc')}</span>
      </div>
      <div className="pf-gd-setup-actions">
        {devices.length === 0 && (
          <button className="pf-gd-setup-btn pf-gd-setup-btn--equip" onClick={onOpenDeviceManage}>
            {t('health.setup.equip')}
          </button>
        )}
        {feeds.length === 0 && (
          <button className="pf-gd-setup-btn pf-gd-setup-btn--food" onClick={onOpenFeedManage}>
            {t('health.setup.food')}
          </button>
        )}
      </div>
    </div>
  );
}
