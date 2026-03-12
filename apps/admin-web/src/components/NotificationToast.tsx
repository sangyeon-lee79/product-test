import { useState, useEffect } from 'react';

interface ToastData {
  title?: string;
  body?: string;
}

const TOAST_DURATION = 5000;

let addToastFn: ((data: ToastData) => void) | null = null;

/**
 * Show a toast notification from anywhere.
 * Call this from the foreground message handler.
 */
export function showNotificationToast(data: ToastData) {
  addToastFn?.(data);
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<(ToastData & { id: number })[]>([]);

  useEffect(() => {
    let counter = 0;
    addToastFn = (data) => {
      const id = ++counter;
      setToasts(prev => [...prev, { ...data, id }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, TOAST_DURATION);
    };
    return () => { addToastFn = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="notif-toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="notif-toast">
          <div className="notif-toast-icon">🔔</div>
          <div className="notif-toast-body">
            {toast.title && <strong className="notif-toast-title">{toast.title}</strong>}
            {toast.body && <p className="notif-toast-text">{toast.body}</p>}
          </div>
          <button
            className="notif-toast-close"
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
