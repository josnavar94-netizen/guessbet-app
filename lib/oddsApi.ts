// Cuotas reales vía The Odds API (the-odds-api.com), plan gratuito (500 créditos/mes).
// Cubre las casas que The Odds API ofrece en la región EU: Coolbet y 1xBet, de las que aparecen
// en el selector de GuessBet. Betano/Jugabet/Bet365(free)/Otra no están disponibles ahí y siguen manuales.

export type FetchedOdds = {
  bookmaker: string;
  home: string;
  away: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
  over_odds: number | null;
  under_odds: number | null;
  total_line: number | null; // la línea de goles real que ofrece la casa (no siempre es 2.5)
};

const SPORT_KEY = 'soccer_fifa_world_cup';
const BOOKMAKERS = ['coolbet', '1xbet'];

export async function fetchOddsApiOdds(): Promise<FetchedOdds[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return [];

  // btts no está disponible en este endpoint/plan (error 422 INVALID_MARKET) — se deja siempre manual.
  const url = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h,totals&bookmakers=${BOOKMAKERS.join(',')}&oddsFormat=decimal`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`[oddsApi] The Odds API respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return [];
  }

  const events = await res.json();
  if (!Array.isArray(events)) return [];

  const out: FetchedOdds[] = [];
  for (const ev of events) {
    for (const bk of ev.bookmakers || []) {
      if (!BOOKMAKERS.includes(bk.key)) continue;
      const row: FetchedOdds = {
        bookmaker: bk.key, home: ev.home_team, away: ev.away_team,
        home_odds: null, draw_odds: null, away_odds: null, over_odds: null, under_odds: null, total_line: null,
      };
      const h2h = bk.markets?.find((m: any) => m.key === 'h2h');
      if (h2h) {
        for (const o of h2h.outcomes || []) {
          if (o.name === ev.home_team) row.home_odds = o.price;
          else if (o.name === ev.away_team) row.away_odds = o.price;
          else if (o.name === 'Draw') row.draw_odds = o.price;
        }
      }
      // Se toma la línea de goles que la casa realmente ofrece (no siempre es 2.5 —
      // bookmakers ajustan la línea principal según cuán parejo está el partido).
      const totals = bk.markets?.find((m: any) => m.key === 'totals');
      if (totals) {
        const overOutcome = (totals.outcomes || []).find((o: any) => o.name === 'Over');
        const underOutcome = (totals.outcomes || []).find((o: any) => o.name === 'Under' && o.point === overOutcome?.point);
        if (overOutcome) {
          row.total_line = overOutcome.point;
          row.over_odds = overOutcome.price;
          row.under_odds = underOutcome?.price ?? null;
        }
      }
      out.push(row);
    }
  }
  return out;
}
