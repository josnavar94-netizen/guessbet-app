// Cuotas reales de Betano vía OddsPapi (oddspapi.io). A diferencia de The Odds API, esta requiere
// primero encontrar el ID del torneo "Mundial 2026" en su catálogo (no es algo que podamos adivinar
// y dejar fijo, porque ese ID es interno de OddsPapi y puede no coincidir entre cuentas/temporadas).
// EXPERIMENTAL: no se pudo probar contra la API real (sin cuenta/API key); revisar junto al usuario
// la primera vez que se configure ODDSPAPI_API_KEY, por si la forma exacta de la respuesta difiere.

import { FetchedOdds } from '@/lib/oddsApi';

const SOCCER_SPORT_ID = 10; // confirmado en la documentación de OddsPapi (sportId=10 = Soccer)

async function findWorldCupTournamentId(apiKey: string): Promise<string | null> {
  const res = await fetch(`https://api.oddspapi.io/v4/tournaments?apiKey=${apiKey}&sportId=${SOCCER_SPORT_ID}`, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`[oddsPapi] /tournaments respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return null;
  }
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.tournaments || [];
  const match = list.find((t: any) =>
    typeof t.name === 'string' && /world cup/i.test(t.name) && /2026|fifa/i.test(t.name)
  );
  return match?.id ?? null;
}

export async function fetchBetanoOdds(): Promise<FetchedOdds[]> {
  const apiKey = process.env.ODDSPAPI_API_KEY;
  if (!apiKey) return [];

  const tournamentId = await findWorldCupTournamentId(apiKey);
  if (!tournamentId) {
    console.error('[oddsPapi] No se encontró el torneo "World Cup 2026" en el catálogo de OddsPapi.');
    return [];
  }

  const url = `https://api.oddspapi.io/v4/odds-by-tournaments?bookmaker=betano&tournamentIds=${tournamentId}&apiKey=${apiKey}&oddsFormat=decimal`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`[oddsPapi] /odds-by-tournaments respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return [];
  }

  const events = await res.json();
  const list = Array.isArray(events) ? events : events.events || [];

  return list.map((ev: any) => {
    const out: FetchedOdds = {
      bookmaker: 'betano', home: ev.home_team ?? ev.homeTeam, away: ev.away_team ?? ev.awayTeam,
      home_odds: null, draw_odds: null, away_odds: null, over_odds: null, under_odds: null,
    };
    const markets = ev.markets || ev.odds || [];
    const h2h = markets.find((m: any) => m.key === 'h2h' || m.market === 'h2h');
    if (h2h) {
      for (const o of h2h.outcomes || []) {
        if (o.name === out.home) out.home_odds = o.price;
        else if (o.name === out.away) out.away_odds = o.price;
        else if (o.name === 'Draw') out.draw_odds = o.price;
      }
    }
    const totals = markets.find((m: any) => m.key === 'totals' || m.market === 'totals');
    if (totals) {
      for (const o of totals.outcomes || []) {
        if (o.point === 2.5 && o.name === 'Over') out.over_odds = o.price;
        if (o.point === 2.5 && o.name === 'Under') out.under_odds = o.price;
      }
    }
    return out;
  });
}
