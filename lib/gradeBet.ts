// Gradúa automáticamente una apuesta a partir del resultado real de un partido (home_goals/away_goals).
// Solo cubre mercados basados en goles del marcador final — los mercados secundarios (corners, tarjetas,
// tiros a puerta) y "sin contar empate" (que admiten un push/reembolso que este sistema no modela) no se
// pueden graduar con esta información y se dejan para que el usuario los marque manualmente.

function gradeLeg(label: string, home: string, away: string, hg: number, ag: number): 'won' | 'lost' | null {
  const total = hg + ag;
  switch (label) {
    case `Gana ${home} (1)`: return hg > ag ? 'won' : 'lost';
    case 'Empatan (X)': return hg === ag ? 'won' : 'lost';
    case `Gana ${away} (2)`: return ag > hg ? 'won' : 'lost';
    case 'Más de 2.5 goles': return total > 2.5 ? 'won' : 'lost';
    case 'Menos de 2.5 goles': return total < 2.5 ? 'won' : 'lost';
    case 'Ambos equipos anotan': return (hg > 0 && ag > 0) ? 'won' : 'lost';
    case 'NO ambos anotan': return !(hg > 0 && ag > 0) ? 'won' : 'lost';
    case `Gana ${home} o empatan`: return hg >= ag ? 'won' : 'lost';
    case `Empatan o gana ${away}`: return ag >= hg ? 'won' : 'lost';
    case `Gana ${home} o gana ${away}`: return hg !== ag ? 'won' : 'lost';
    default: return null; // mercado no graduable automáticamente (DNB, corners, tarjetas, tiros, etc.)
  }
}

/** Gradúa una apuesta (simple o combinada) contra el resultado final. Devuelve null si algún mercado no se puede graduar automáticamente. */
export function gradeBet(pickLabel: string, home: string, away: string, homeGoals: number, awayGoals: number): 'won' | 'lost' | null {
  const legsText = pickLabel.replace(/^Combinada \(\d+\):\s*/, '');
  const legs = legsText.split(' + ').map(l => l.trim());
  const results = legs.map(l => gradeLeg(l, home, away, homeGoals, awayGoals));
  if (results.some(r => r === null)) return null;
  return results.every(r => r === 'won') ? 'won' : 'lost';
}
