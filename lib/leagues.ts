// Ligas a futuro: por ahora solo el Mundial tiene datos/modelo cargados, el resto se muestra
// como "Próximamente" para que el usuario vea hacia dónde va creciendo la app sin prometer algo que no funciona.
export type League = { id: string; name: string; flag: string; available: boolean };

export const LEAGUES: League[] = [
  { id: 'wc', name: 'Mundial 2026', flag: '🌎', available: true },
  { id: 'pl', name: 'Premier League', flag: '🏴', available: false },
  { id: 'seriea', name: 'Serie A', flag: '🇮🇹', available: false },
  { id: 'laliga', name: 'La Liga', flag: '🇪🇸', available: false },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪', available: false },
  { id: 'ligue1', name: 'Ligue 1', flag: '🇫🇷', available: false },
  { id: 'chile', name: 'Fútbol Chileno', flag: '🇨🇱', available: false },
];
