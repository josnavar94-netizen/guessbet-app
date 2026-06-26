import webpush from 'web-push';
import { sql } from '@/lib/db';
import { logError } from '@/lib/logError';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:guessbet.admin@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  configured = true;
}

/** Manda una notificación push a todos los dispositivos suscritos. Si falta config, no hace nada. */
export async function sendPushToAll(title: string, body: string, url = '/dashboard') {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  ensureConfigured();

  const { rows } = await sql`SELECT id, endpoint, p256dh, auth FROM push_subscriptions`;
  const payload = JSON.stringify({ title, body, url });

  for (const sub of rows) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
    } catch (err: any) {
      // 404/410 = el navegador invalidó esa suscripción (desinstaló la app, etc.) — se borra.
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
      } else {
        await logError(err, 'webPush:sendPushToAll');
      }
    }
  }
}
