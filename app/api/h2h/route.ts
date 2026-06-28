import { NextRequest, NextResponse } from 'next/server';
import { fetchGithubResults, normalizeTeam } from '@/lib/githubResults';
import { logError } from '@/lib/logError';

export const dynamic = 'force-dynamic';

// Historial real entre dos selecciones, calculado desde el dataset histórico completo (1872-presente,
// incluye amistosos y eliminatorias) en vez de la tabla estática que quedaba desactualizada e incompleta.
export async function GET(req: NextRequest) {
  const home = req.nextUrl.searchParams.get('home');
  const away = req.nextUrl.searchParams.get('away');
  if (!home || !away) return NextResponse.json({ error: 'Faltan equipos.' }, { status: 400 });

  try {
    const all = await fetchGithubResults({ fromDate: '1872-01-01', revalidateSeconds: 3600 });
    const matches = all.filter(m => {
      if (m.homeGoals == null || m.awayGoals == null) return false;
      const h = normalizeTeam(m.homeTeam), a = normalizeTeam(m.awayTeam);
      return (h === home && a === away) || (h === away && a === home);
    });

    let w1 = 0, d = 0, l1 = 0, gf1 = 0, ga1 = 0;
    for (const m of matches) {
      const h = normalizeTeam(m.homeTeam);
      // goles del equipo "home" (primer parámetro) en este enfrentamiento, sin importar de qué lado jugó esa vez
      const g1 = h === home ? m.homeGoals! : m.awayGoals!;
      const g2 = h === home ? m.awayGoals! : m.homeGoals!;
      gf1 += g1; ga1 += g2;
      if (g1 > g2) w1++; else if (g1 < g2) l1++; else d++;
    }

    const n = matches.length;
    return NextResponse.json({
      n, w1, d, l1,
      avgGF1: n > 0 ? gf1 / n : 0,
      avgGA1: n > 0 ? ga1 / n : 0,
    });
  } catch (err) {
    await logError(err, 'h2h:GET');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
