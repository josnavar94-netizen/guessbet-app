// Jugadores estrella por equipo — impacto en xG atacante cuando están/no están en el once.
// boost: multiplicador adicional sobre xG cuando el jugador SÍ juega (ej. 0.20 = +20%).
// El nombre debe estar normalizado (sin acentos, minúsculas) para que coincida con la DB.
// Solo incluir jugadores cuya presencia/ausencia cambia materialmente el xG del equipo.

export type StarPlayer = { name: string; boost: number };

export const STAR_PLAYERS: Record<string, StarPlayer[]> = {
  // Europa
  'Norway':       [{ name: 'erling haaland', boost: 0.28 }],
  'France':       [{ name: 'kylian mbappe', boost: 0.22 }, { name: 'antoine griezmann', boost: 0.12 }],
  'Portugal':     [{ name: 'cristiano ronaldo', boost: 0.15 }, { name: 'bruno fernandes', boost: 0.13 }],
  'England':      [{ name: 'harry kane', boost: 0.20 }, { name: 'jude bellingham', boost: 0.14 }],
  'Spain':        [{ name: 'pedri', boost: 0.12 }, { name: 'alvaro morata', boost: 0.11 }],
  'Germany':      [{ name: 'kai havertz', boost: 0.13 }, { name: 'jamal musiala', boost: 0.14 }],
  'Netherlands':  [{ name: 'virgil van dijk', boost: 0.10 }, { name: 'cody gakpo', boost: 0.13 }],
  'Belgium':      [{ name: 'romelu lukaku', boost: 0.16 }, { name: 'kevin de bruyne', boost: 0.18 }],
  'Croatia':      [{ name: 'luka modric', boost: 0.14 }, { name: 'ivan perisic', boost: 0.11 }],
  'Denmark':      [{ name: 'christian eriksen', boost: 0.14 }, { name: 'rasmus hojlund', boost: 0.13 }],
  'Sweden':       [{ name: 'alexander isak', boost: 0.18 }],
  'Poland':       [{ name: 'robert lewandowski', boost: 0.25 }],
  'Serbia':       [{ name: 'aleksandar mitrovic', boost: 0.18 }],
  'Switzerland':  [{ name: 'granit xhaka', boost: 0.11 }, { name: 'xherdan shaqiri', boost: 0.10 }],
  'Austria':      [{ name: 'marko arnautovic', boost: 0.13 }],
  'Ukraine':      [{ name: 'mykhailo mudryk', boost: 0.14 }],
  'Turkey':       [{ name: 'hakan calhanoglu', boost: 0.13 }, { name: 'arda guler', boost: 0.12 }],
  'Czech Republic': [{ name: 'patrik schick', boost: 0.16 }],
  'Slovakia':     [{ name: 'milan skriniar', boost: 0.10 }],
  'Romania':      [{ name: 'razvan marin', boost: 0.10 }],

  // América
  'Argentina':    [{ name: 'lionel messi', boost: 0.28 }, { name: 'lautaro martinez', boost: 0.14 }],
  'Brazil':       [{ name: 'vinicius junior', boost: 0.20 }, { name: 'neymar', boost: 0.18 }, { name: 'rodrygo', boost: 0.12 }],
  'Colombia':     [{ name: 'james rodriguez', boost: 0.15 }, { name: 'luis diaz', boost: 0.14 }],
  'Uruguay':      [{ name: 'luis suarez', boost: 0.15 }, { name: 'darwin nunez', boost: 0.16 }],
  'Mexico':       [{ name: 'hirving lozano', boost: 0.14 }, { name: 'raul jimenez', boost: 0.15 }],
  'USA':          [{ name: 'christian pulisic', boost: 0.18 }, { name: 'gio reyna', boost: 0.12 }],
  'Ecuador':      [{ name: 'enner valencia', boost: 0.18 }],
  'Canada':       [{ name: 'alphonso davies', boost: 0.16 }, { name: 'jonathan david', boost: 0.16 }],
  'Chile':        [{ name: 'alexis sanchez', boost: 0.18 }],
  'Peru':         [{ name: 'paolo guerrero', boost: 0.13 }],
  'Paraguay':     [{ name: 'miguel almiron', boost: 0.15 }],
  'Venezuela':    [{ name: 'salomon rondon', boost: 0.12 }],
  'Bolivia':      [{ name: 'marcelo moreno martins', boost: 0.12 }],

  // África
  'Senegal':      [{ name: 'sadio mane', boost: 0.22 }],
  'Morocco':      [{ name: 'achraf hakimi', boost: 0.14 }, { name: 'hakim ziyech', boost: 0.14 }],
  "Cote d'Ivoire": [{ name: 'sebastien haller', boost: 0.16 }, { name: 'franck kessie', boost: 0.11 }],
  'Ghana':        [{ name: 'jordan ayew', boost: 0.13 }],
  'Nigeria':      [{ name: 'victor osimhen', boost: 0.22 }, { name: 'kelechi iheanacho', boost: 0.11 }],
  'Cameroon':     [{ name: 'vincent aboubakar', boost: 0.15 }],
  'Egypt':        [{ name: 'mohamed salah', boost: 0.28 }],
  'Tunisia':      [{ name: 'wahbi khazri', boost: 0.12 }],
  'Algeria':      [{ name: 'riyad mahrez', boost: 0.20 }],
  'Mali':         [{ name: 'moussa marega', boost: 0.12 }],
  'South Africa': [{ name: 'percy tau', boost: 0.13 }],
  'DR Congo':     [{ name: 'yannick bolasie', boost: 0.11 }],

  // Asia / Oceanía
  'Japan':        [{ name: 'takumi minamino', boost: 0.13 }, { name: 'daichi kamada', boost: 0.12 }],
  'South Korea':  [{ name: 'son heung-min', boost: 0.24 }, { name: 'hwang hee-chan', boost: 0.12 }],
  'Iran':         [{ name: 'mehdi taremi', boost: 0.20 }],
  'Saudi Arabia': [{ name: 'salem al-dawsari', boost: 0.16 }],
  'Australia':    [{ name: 'mathew leckie', boost: 0.13 }, { name: 'mitchell duke', boost: 0.11 }],
  'Qatar':        [{ name: 'akram afif', boost: 0.16 }],
};

// Calcula el factor de ajuste de xG basado en presencia/ausencia de estrellas en el once.
// starters: lista de nombres YA normalizados (sin acentos, minúsculas).
// Retorna un multiplicador: >1 si las estrellas juegan, <1 si están ausentes.
export function calcStarFactor(team: string, starters: string[]): number {
  const stars = STAR_PLAYERS[team];
  if (!stars || stars.length === 0) return 1.0;

  const starterSet = new Set(starters);
  let factor = 1.0;

  for (const star of stars) {
    const plays = starterSet.has(star.name);
    if (plays) {
      factor += star.boost * 0.5; // juega: boost parcial (el modelo base ya asume cierta calidad)
    } else {
      factor -= star.boost * 0.6; // ausente: penalización mayor (confirma que NO está)
    }
  }

  return Math.max(0.5, Math.min(1.5, factor)); // cap entre -50% y +50%
}
