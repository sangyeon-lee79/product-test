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
  const allDone = devices.length > 0 && feeds.length > 0;

  return (
    <div className={`pf-gd-setup-banner${allDone ? ' pf-gd-setup-banner--done' : ''}`}>
      <div className="pf-gd-setup-icons">
        <span className="pf-gd-setup-icon">{allDone ? '✅' : '🩺'}</span>
        <span className="pf-gd-setup-icon">{allDone ? '✅' : '🥣'}</span>
      </div>
      <div className="pf-gd-setup-text">
        <strong className="pf-gd-setup-title">
          {allDone
            ? t('health.setup.done_title')
            : t('health.setup.title')}
        </strong>
        <span className="pf-gd-setup-desc">
          {allDone
            ? t('health.setup.done_desc').replace('{0}', String(devices.length)).replace('{1}', String(feeds.length))
            : t('health.setup.desc')}
        </span>
      </div>
      <div className="pf-gd-setup-actions">
        <button className={`pf-gd-setup-btn ${allDone ? 'pf-gd-setup-btn--manage' : 'pf-gd-setup-btn--equip'}`} onClick={onOpenDeviceManage}>
          {t('health.setup.equip')}
        </button>
        <button className={`pf-gd-setup-btn ${allDone ? 'pf-gd-setup-btn--manage' : 'pf-gd-setup-btn--food'}`} onClick={onOpenFeedManage}>
          {t('health.setup.food')}
        </button>
      </div>
    </div>
  );
}
