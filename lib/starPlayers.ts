// Jugadores estrella por equipo con posición e impacto en xG.
// position: 'att' → impacta xG atacante del equipo
//           'mid' → impacta xG atacante (70%) y defensivo (30%)
//           'def' → impacta xG defensivo (reduce goles recibidos)
//           'gk'  → impacta xG defensivo (mayor peso)
// boost: magnitud del impacto cuando el jugador SÍ juega vs el promedio del equipo.
// Nombres normalizados: sin acentos, minúsculas.

export type StarPlayer = { name: string; boost: number; position: 'att' | 'mid' | 'def' | 'gk' };
export type StarFactors = { attackFactor: number; defenseFactor: number };

export const STAR_PLAYERS: Record<string, StarPlayer[]> = {
  // Europa
  'Norway':        [{ name: 'erling haaland', boost: 0.28, position: 'att' }],
  'France':        [{ name: 'kylian mbappe', boost: 0.22, position: 'att' }, { name: 'antoine griezmann', boost: 0.12, position: 'mid' }],
  'Portugal':      [{ name: 'cristiano ronaldo', boost: 0.15, position: 'att' }, { name: 'bruno fernandes', boost: 0.13, position: 'mid' }],
  'England':       [{ name: 'harry kane', boost: 0.20, position: 'att' }, { name: 'jude bellingham', boost: 0.14, position: 'mid' }],
  'Spain':         [{ name: 'pedri', boost: 0.12, position: 'mid' }, { name: 'alvaro morata', boost: 0.11, position: 'att' }],
  'Germany':       [{ name: 'kai havertz', boost: 0.13, position: 'att' }, { name: 'jamal musiala', boost: 0.14, position: 'mid' }],
  'Netherlands':   [{ name: 'virgil van dijk', boost: 0.14, position: 'def' }, { name: 'cody gakpo', boost: 0.13, position: 'att' }],
  'Belgium':       [{ name: 'romelu lukaku', boost: 0.16, position: 'att' }, { name: 'kevin de bruyne', boost: 0.18, position: 'mid' }],
  'Croatia':       [{ name: 'luka modric', boost: 0.14, position: 'mid' }, { name: 'ivan perisic', boost: 0.11, position: 'att' }],
  'Denmark':       [{ name: 'christian eriksen', boost: 0.14, position: 'mid' }, { name: 'rasmus hojlund', boost: 0.13, position: 'att' }],
  'Sweden':        [{ name: 'alexander isak', boost: 0.18, position: 'att' }],
  'Poland':        [{ name: 'robert lewandowski', boost: 0.25, position: 'att' }],
  'Serbia':        [{ name: 'aleksandar mitrovic', boost: 0.18, position: 'att' }],
  'Switzerland':   [{ name: 'granit xhaka', boost: 0.11, position: 'mid' }, { name: 'xherdan shaqiri', boost: 0.10, position: 'att' }],
  'Austria':       [{ name: 'marko arnautovic', boost: 0.13, position: 'att' }],
  'Ukraine':       [{ name: 'mykhailo mudryk', boost: 0.14, position: 'att' }],
  'Turkey':        [{ name: 'hakan calhanoglu', boost: 0.13, position: 'mid' }, { name: 'arda guler', boost: 0.12, position: 'mid' }],
  'Czech Republic':[{ name: 'patrik schick', boost: 0.16, position: 'att' }],
  'Slovakia':      [{ name: 'milan skriniar', boost: 0.10, position: 'def' }],

  // América
  'Argentina':     [{ name: 'lionel messi', boost: 0.28, position: 'att' }, { name: 'lautaro martinez', boost: 0.14, position: 'att' }],
  'Brazil':        [{ name: 'vinicius junior', boost: 0.20, position: 'att' }, { name: 'neymar', boost: 0.18, position: 'att' }, { name: 'rodrygo', boost: 0.12, position: 'att' }],
  'Colombia':      [{ name: 'james rodriguez', boost: 0.15, position: 'mid' }, { name: 'luis diaz', boost: 0.14, position: 'att' }],
  'Uruguay':       [{ name: 'darwin nunez', boost: 0.16, position: 'att' }, { name: 'luis suarez', boost: 0.15, position: 'att' }],
  'Mexico':        [{ name: 'hirving lozano', boost: 0.14, position: 'att' }, { name: 'raul jimenez', boost: 0.15, position: 'att' }],
  'USA':           [{ name: 'christian pulisic', boost: 0.18, position: 'att' }, { name: 'gio reyna', boost: 0.12, position: 'mid' }],
  'Ecuador':       [{ name: 'enner valencia', boost: 0.18, position: 'att' }],
  'Canada':        [{ name: 'alphonso davies', boost: 0.16, position: 'def' }, { name: 'jonathan david', boost: 0.16, position: 'att' }],
  'Chile':         [{ name: 'alexis sanchez', boost: 0.18, position: 'att' }],
  'Paraguay':      [{ name: 'miguel almiron', boost: 0.15, position: 'mid' }],
  'Venezuela':     [{ name: 'salomon rondon', boost: 0.12, position: 'att' }],

  // África
  'Senegal':       [{ name: 'sadio mane', boost: 0.22, position: 'att' }],
  'Morocco':       [{ name: 'achraf hakimi', boost: 0.14, position: 'def' }, { name: 'hakim ziyech', boost: 0.14, position: 'att' }],
  "Cote d'Ivoire": [{ name: 'sebastien haller', boost: 0.16, position: 'att' }, { name: 'franck kessie', boost: 0.11, position: 'mid' }],
  'Nigeria':       [{ name: 'victor osimhen', boost: 0.22, position: 'att' }],
  'Cameroon':      [{ name: 'vincent aboubakar', boost: 0.15, position: 'att' }],
  'Egypt':         [{ name: 'mohamed salah', boost: 0.28, position: 'att' }],
  'Algeria':       [{ name: 'riyad mahrez', boost: 0.20, position: 'att' }],
  'Ghana':         [{ name: 'jordan ayew', boost: 0.13, position: 'att' }],
  'South Africa':  [{ name: 'percy tau', boost: 0.13, position: 'att' }],

  // Asia / Oceanía
  'Japan':         [{ name: 'takumi minamino', boost: 0.13, position: 'att' }, { name: 'daichi kamada', boost: 0.12, position: 'mid' }],
  'South Korea':   [{ name: 'son heung-min', boost: 0.24, position: 'att' }, { name: 'hwang hee-chan', boost: 0.12, position: 'att' }],
  'Iran':          [{ name: 'mehdi taremi', boost: 0.20, position: 'att' }],
  'Saudi Arabia':  [{ name: 'salem al-dawsari', boost: 0.16, position: 'att' }],
  'Australia':     [{ name: 'mathew leckie', boost: 0.13, position: 'att' }, { name: 'mitchell duke', boost: 0.11, position: 'att' }],
  'Qatar':         [{ name: 'akram afif', boost: 0.16, position: 'att' }],
};

// Calcula factores de ataque y defensa según presencia/ausencia de estrellas.
// - attackFactor: multiplica xG del equipo (delanteros y mediocampistas)
// - defenseFactor: multiplica xG del rival (defensas y porteros reducen el ataque rival)
export function calcStarFactor(team: string, starters: string[]): StarFactors {
  const stars = STAR_PLAYERS[team];
  if (!stars || stars.length === 0) return { attackFactor: 1.0, defenseFactor: 1.0 };

  const starterSet = new Set(starters);
  let attackFactor = 1.0;
  let defenseFactor = 1.0;

  for (const star of stars) {
    const plays = starterSet.has(star.name);
    const sign = plays ? 1 : -1;

    if (star.position === 'att') {
      // Delantero: impacto total en ataque
      attackFactor += sign * star.boost * (plays ? 0.5 : 0.6);
    } else if (star.position === 'mid') {
      // Mediocampista: 70% ataque, 30% defensa
      attackFactor  += sign * star.boost * 0.7 * (plays ? 0.5 : 0.6);
      defenseFactor -= sign * star.boost * 0.3 * (plays ? 0.4 : 0.5); // reduce xG rival
    } else if (star.position === 'def') {
      // Defensa: impacto total en reducir xG rival
      defenseFactor -= sign * star.boost * (plays ? 0.5 : 0.6);
    } else if (star.position === 'gk') {
      // Portero: mayor impacto defensivo
      defenseFactor -= sign * star.boost * (plays ? 0.6 : 0.7);
    }
  }

  return {
    attackFactor:  Math.max(0.5, Math.min(1.5, attackFactor)),
    defenseFactor: Math.max(0.5, Math.min(1.5, defenseFactor)),
  };
}
