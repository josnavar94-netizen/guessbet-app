import * as Sentry from '@sentry/nextjs';

let initialized = false;
function ensureInit() {
  if (initialized || !process.env.SENTRY_DSN) return;
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
  initialized = true;
}

/** Loguea el error en consola (Vercel logs) y, si SENTRY_DSN está configurado, lo reporta a Sentry. */
export async function logError(err: unknown, context?: string) {
  console.error(context ? `[${context}]` : '', err);
  if (!process.env.SENTRY_DSN) return;
  ensureInit();
  Sentry.captureException(err);
  // En funciones serverless, la función puede terminar antes de que Sentry alcance a enviar el evento por red.
  // Hay que esperar el flush explícitamente o el error nunca llega.
  await Sentry.flush(2000);
}
