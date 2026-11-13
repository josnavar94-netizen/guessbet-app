export type League = { id: string; name: string; flag: string; available: boolean };

export const LEAGUES: League[] = [
  { id: 'wc',          name: 'Mundial 2026',        flag: '🌎', available: true  },
  { id: 'pl',          name: 'Premier League',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', available: true  },
  { id: 'laliga',      name: 'La Liga',             flag: '🇪🇸', available: true  },
  { id: 'bundesliga',  name: 'Bundesliga',          flag: '🇩🇪', available: true  },
  { id: 'seriea',      name: 'Serie A',             flag: '🇮🇹', available: true  },
  { id: 'unl',         name: 'UEFA Nations League', flag: '🏆', available: true  },
  { id: 'chile',       name: 'Fútbol Chileno',      flag: '🇨🇱', available: false },
  { id: 'ligue1',      name: 'Ligue 1',             flag: '🇫🇷', available: false },
];
