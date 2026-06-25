import { sql } from '@/lib/db';

export type SyncStatus = { lastSyncAt: string | null; lastFinishedMatch: string | null };

// Última vez que el cron tocó la tabla `matches` (cualquier upsert, no solo resultados nuevos),
// para mostrarle al usuario una confirmación real de que la sincronización sigue corriendo.
export async function getSyncStatus(competitionCode = 'WC'): Promise<SyncStatus> {
  const { rows } = await sql`
    SELECT MAX(updated_at)::text AS last_sync,
           MAX(CASE WHEN status = 'FINISHED' THEN updated_at END)::text AS last_finished
    FROM matches WHERE competition_code = ${competitionCode}
  `;
  return {
    lastSyncAt: rows[0]?.last_sync ?? null,
    lastFinishedMatch: rows[0]?.last_finished ?? null,
  };
}
