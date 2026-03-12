// Push notification helper — creates in-app notification + sends FCM push

import type { Env } from '../types';
import { newId, now } from '../types';
import { getGcpAccessToken } from './gcpAuth';

const FCM_MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

interface PushParams {
  userId: string;
  type: string;
  actorUserId?: string;
  referenceId?: string;
  referenceType?: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

interface FcmCredentials {
  projectId: string;
  email: string;
  privateKey: string;
}

/**
 * Create an in-app notification and optionally send FCM push.
 * Push failures are silent — they never block the caller.
 */
export async function createAndPush(env: Env, params: PushParams): Promise<string> {
  const id = newId();
  const timestamp = now();

  // 1. Insert in-app notification
  await env.DB.prepare(
    `INSERT INTO notifications (id, user_id, type, actor_user_id, reference_id, reference_type, title, body, data, is_read, push_sent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, false, false, ?)`
  ).bind(
    id,
    params.userId,
    params.type,
    params.actorUserId || null,
    params.referenceId || null,
    params.referenceType || null,
    params.title || null,
    params.body || null,
    JSON.stringify(params.data || {}),
    timestamp,
  ).run();

  // 2. Attempt push (fire-and-forget — do not await in caller if latency matters)
  try {
    await sendPush(env, id, params);
  } catch {
    // Silent — push failure must not block main flow
  }

  return id;
}

async function sendPush(env: Env, notificationId: string, params: PushParams): Promise<void> {
  // Check user notification settings
  const settingCol = notificationTypeToSettingColumn(params.type);
  if (settingCol) {
    const settings = await env.DB.prepare(
      `SELECT ${settingCol} AS enabled FROM notification_settings WHERE user_id = ?`
    ).bind(params.userId).first<{ enabled: boolean }>();
    // If settings row exists and the type is disabled, skip push
    if (settings && !settings.enabled) return;
  }

  // Get active push tokens for user
  const tokens = await env.DB.prepare(
    'SELECT id, token FROM user_push_tokens WHERE user_id = ? AND is_active = true'
  ).bind(params.userId).all<{ id: string; token: string }>();

  if (!tokens.results || tokens.results.length === 0) return;

  // Load FCM credentials from platform_settings
  const creds = await loadFcmCredentials(env);
  if (!creds.projectId || !creds.email || !creds.privateKey) return;

  // Get access token
  const accessToken = await getGcpAccessToken(creds.email, creds.privateKey, FCM_MESSAGING_SCOPE);

  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${creds.projectId}/messages:send`;

  let anySent = false;
  for (const tokenRow of tokens.results) {
    try {
      const res = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: tokenRow.token,
            notification: {
              title: params.title || '',
              body: params.body || '',
            },
            data: params.data || {},
            webpush: {
              fcm_options: {
                link: params.data?.link || '/',
              },
            },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const errorCode = String(
          (body as Record<string, unknown>)?.error &&
          typeof (body as Record<string, unknown>).error === 'object' &&
          ((body as Record<string, unknown>).error as Record<string, unknown>)?.status || ''
        );
        // Deactivate invalid tokens
        if (errorCode === 'NOT_FOUND' || errorCode === 'UNREGISTERED' || res.status === 404) {
          await env.DB.prepare(
            'UPDATE user_push_tokens SET is_active = false, updated_at = ? WHERE id = ?'
          ).bind(now(), tokenRow.id).run();
        }
      } else {
        anySent = true;
      }
    } catch {
      // Individual token failure — continue with next
    }
  }

  // Mark push_sent if at least one succeeded
  if (anySent) {
    await env.DB.prepare(
      'UPDATE notifications SET push_sent = true WHERE id = ?'
    ).bind(notificationId).run();
  }
}

async function loadFcmCredentials(env: Env): Promise<FcmCredentials> {
  const rows = await env.DB.prepare(
    `SELECT setting_key, setting_value FROM platform_settings
     WHERE setting_key IN ('fcm_project_id', 'fcm_service_account_email', 'fcm_service_account_private_key')`
  ).all<{ setting_key: string; setting_value: string }>();

  const map = Object.fromEntries(
    (rows.results || []).map(r => [r.setting_key, (r.setting_value || '').trim()]),
  );

  return {
    projectId: map.fcm_project_id || '',
    email: map.fcm_service_account_email || '',
    privateKey: map.fcm_service_account_private_key || '',
  };
}

function notificationTypeToSettingColumn(type: string): string | null {
  const map: Record<string, string> = {
    friend_request: 'friend_request',
    friend_accepted: 'friend_accepted',
    post_like: 'post_like',
    post_comment: 'post_comment',
    friend_new_post: 'friend_new_post',
    pet_health_remind: 'pet_health_remind',
    appointment_remind: 'appointment_remind',
    service_notice: 'service_notice',
    marketing: 'marketing',
  };
  return map[type] || null;
}
