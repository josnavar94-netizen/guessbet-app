// Cuotas reales de Coolbet vía The Odds API (the-odds-api.com), plan gratuito (500 créditos/mes).
// Solo Coolbet tiene cobertura real entre las casas que ofrece GuessBet hoy (Betano y Jugabet no
// aparecen en su lista de casas soportadas) — Betano/Jugabet/Otra siguen siendo siempre manuales.

export type FetchedOdds = {
  home: string;
  away: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
  over_odds: number | null;
  under_odds: number | null;
  btts_odds: number | null;
};

const SPORT_KEY = 'soccer_fifa_world_cup';

export async function fetchCoolbetOdds(): Promise<FetchedOdds[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return [];

  const url = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h,totals,btts&bookmakers=coolbet&oddsFormat=decimal`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`[oddsApi] The Odds API respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return [];
  }

  const events = await res.json();
  if (!Array.isArray(events)) return [];

  return events.map((ev: any) => {
    const coolbet = (ev.bookmakers || []).find((b: any) => b.key === 'coolbet');
    const out: FetchedOdds = {
      home: ev.home_team, away: ev.away_team,
      home_odds: null, draw_odds: null, away_odds: null, over_odds: null, under_odds: null, btts_odds: null,
    };
    if (!coolbet) return out;

    const h2h = coolbet.markets?.find((m: any) => m.key === 'h2h');
    if (h2h) {
      for (const o of h2h.outcomes || []) {
        if (o.name === ev.home_team) out.home_odds = o.price;
        else if (o.name === ev.away_team) out.away_odds = o.price;
        else if (o.name === 'Draw') out.draw_odds = o.price;
      }
    }
    const totals = coolbet.markets?.find((m: any) => m.key === 'totals');
    if (totals) {
      for (const o of totals.outcomes || []) {
        if (o.point === 2.5 && o.name === 'Over') out.over_odds = o.price;
        if (o.point === 2.5 && o.name === 'Under') out.under_odds = o.price;
      }
    }
    const btts = coolbet.markets?.find((m: any) => m.key === 'btts');
    if (btts) {
      const yes = btts.outcomes?.find((o: any) => o.name === 'Yes');
      if (yes) out.btts_odds = yes.price;
    }
    return out;
  });
}
