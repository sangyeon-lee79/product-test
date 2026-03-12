import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Notification } from '../types/api';
import { useT } from '../lib/i18n';
import { isLoggedIn } from '../lib/auth';
import NotificationSettingsPanel from './NotificationSettingsPanel';

const POLL_INTERVAL = 30_000;
const NOTIF_LIMIT = 30;

const TYPE_ICONS: Record<string, string> = {
  friend_request: '👋',
  friend_accepted: '🤝',
  post_like: '❤️',
  post_comment: '💬',
  friend_new_post: '📸',
  pet_health_remind: '💊',
  appointment_remind: '📅',
  service_notice: '📢',
  marketing: '🎁',
  grooming_complete: '✂️',
};

function timeAgo(dateStr: string, t: (k: string, d?: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return t('notification.time.just_now', 'Just now');
  if (mins < 60) return `${mins}${t('notification.time.minutes_ago', 'min ago')}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}${t('notification.time.hours_ago', 'hr ago')}`;
  const days = Math.floor(hours / 24);
  return `${days}${t('notification.time.days_ago', 'd ago')}`;
}

function getNotifMessage(n: Notification, t: (k: string, d?: string) => string): string {
  if (n.body) return n.body;
  const msgMap: Record<string, string> = {
    friend_request: t('notification.msg.sent_friend_request', 'sent you a friend request'),
    friend_accepted: t('notification.msg.accepted_friend_request', 'accepted your friend request'),
    post_like: t('notification.msg.liked_your_post', 'liked your post'),
    post_comment: t('notification.msg.commented_on_your_post', 'commented on your post'),
    friend_new_post: t('notification.msg.shared_new_post', 'shared a new post'),
    grooming_complete: t('notification.msg.grooming_complete', 'sent a grooming completion notice'),
  };
  const msg = msgMap[n.type] || n.type;
  return n.actor_name ? `${n.actor_name} ${msg}` : msg;
}

export default function NotificationCenter() {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await api.notifications.list({ limit: NOTIF_LIMIT });
      if (res) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count);
      }
    } catch { /* silent */ }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSettings(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleMarkAllRead() {
    try {
      await api.notifications.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  }

  async function handleItemClick(n: Notification) {
    if (!n.is_read) {
      try {
        await api.notifications.read(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch { /* silent */ }
    }

    // Navigate based on type
    if (n.type === 'grooming_complete' && n.reference_id) {
      navigate(`/guardian?grooming_record_id=${n.reference_id}`);
      setOpen(false);
      return;
    }

    const link = n.data?.link;
    if (link) {
      // link is like "/#/guardian" — extract hash path
      const hashPath = link.includes('#') ? link.split('#')[1] : link;
      navigate(hashPath);
    }
    setOpen(false);
  }

  return (
    <div className="notif-center" ref={dropdownRef}>
      <button className="topbar-notif" onClick={() => { setOpen(v => !v); setShowSettings(false); }}>
        🔔
        {unreadCount > 0 && <span className="topbar-notif-dot" />}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>{t('notification.center.title', 'Notifications')}</h3>
            <div className="notif-header-actions">
              <button className="notif-settings-btn" onClick={() => setShowSettings(v => !v)} title={t('notification.settings.title', 'Settings')}>
                ⚙️
              </button>
              {unreadCount > 0 && (
                <button className="notif-mark-all" onClick={handleMarkAllRead}>
                  {t('notification.center.mark_all_read', 'Mark all read')}
                </button>
              )}
            </div>
          </div>

          {showSettings ? (
            <NotificationSettingsPanel />
          ) : (
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">{t('notification.center.empty', 'No notifications')}</div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    className={`notif-item${n.is_read ? '' : ' unread'}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <span className="notif-icon">
                      {n.actor_avatar_url
                        ? <img src={n.actor_avatar_url} alt="" className="notif-avatar" />
                        : <span className="notif-type-icon">{TYPE_ICONS[n.type] || '🔔'}</span>
                      }
                    </span>
                    <div className="notif-content">
                      <p className="notif-message">{getNotifMessage(n, t)}</p>
                      <span className="notif-time">{timeAgo(n.created_at, t)}</span>
                    </div>
                    {!n.is_read && <span className="notif-unread-dot" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
