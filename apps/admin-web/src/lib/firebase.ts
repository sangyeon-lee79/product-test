// Firebase Cloud Messaging — web push setup

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string || '',
  };
}

function isConfigured(): boolean {
  const cfg = getFirebaseConfig();
  return !!(cfg.apiKey && cfg.projectId && cfg.messagingSenderId);
}

function ensureApp(): FirebaseApp | null {
  if (!isConfigured()) return null;
  if (!app) {
    app = initializeApp(getFirebaseConfig());
  }
  return app;
}

function ensureMessaging(): Messaging | null {
  const firebaseApp = ensureApp();
  if (!firebaseApp) return null;
  if (!messaging) {
    messaging = getMessaging(firebaseApp);
  }
  return messaging;
}

/**
 * Request notification permission and return FCM token.
 * Returns null if denied, unconfigured, or unsupported.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!('Notification' in window)) return null;

  const m = ensureMessaging();
  if (!m) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string || '';
    const token = await getToken(m, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
    });
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Register a callback for foreground FCM messages.
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(
  callback: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void,
): (() => void) | null {
  const m = ensureMessaging();
  if (!m) return null;

  return onMessage(m, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data as Record<string, string> | undefined,
    });
  });
}
