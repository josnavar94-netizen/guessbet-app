import { sql } from '@/lib/db';

/** Devuelve true si la petición está permitida (y la registra); false si se superó el límite. */
export async function checkRateLimit(ip: string | null, endpoint: string, maxAttempts: number, windowMinutes: number): Promise<boolean> {
  if (!ip) return true; // sin IP no podemos limitar; dejar pasar en vez de bloquear a todos

  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const result = await sql`
    SELECT COUNT(*)::int AS count FROM auth_attempts
    WHERE ip=${ip} AND endpoint=${endpoint} AND created_at > ${windowStart.toISOString()}
  `;
  const allowed = result.rows[0].count < maxAttempts;
  if (allowed) await sql`INSERT INTO auth_attempts (ip, endpoint) VALUES (${ip}, ${endpoint})`;
  return allowed;
}
