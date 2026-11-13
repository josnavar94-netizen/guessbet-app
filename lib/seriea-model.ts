// Auto-generado por scripts/build-league-models.mjs — NO editar a mano
// Serie A · 2021-22, 2022-23, 2023-24, 2024-25, 2025-26
// Fuente: football-data.co.uk

export type SATeamModel = {
  avgGF: number; avgGA: number; winRate: number; ptsRate: number; pj: number;
  homeGF: number|null; awayGF: number|null; homeGA: number|null; awayGA: number|null;
  elo: number;
};
export type SATeamReal = { avgGF: number; avgGA: number; pj: number };
export type SAClub = { short: string; crest: string | null };

/** Goles por equipo por partido (media de las últimas 3 temporadas) */
export const SA_LEAGUE_AVG = 1.266;

/** Mapa de equipo → nombre corto y escudo */
export const SA_CLUBS: Record<string, SAClub> = {
  "FC Internazionale Milano": {
    "short": "Internazionale Milano",
    "crest": "https://crests.football-data.org/108.png"
  },
  "Genoa CFC": {
    "short": "Genoa",
    "crest": "https://crests.football-data.org/107.png"
  },
  "Verona": {
    "short": "Verona",
    "crest": null
  },
  "US Sassuolo": {
    "short": "Sassuolo",
    "crest": "https://crests.football-data.org/471.png"
  },
  "Empoli FC": {
    "short": "Empoli",
    "crest": "https://crests.football-data.org/1105.png"
  },
  "SS Lazio": {
    "short": "Lazio",
    "crest": "https://crests.football-data.org/110.png"
  },
  "Torino FC": {
    "short": "Torino",
    "crest": "https://crests.football-data.org/586.png"
  },
  "Atalanta BC": {
    "short": "Atalanta",
    "crest": "https://crests.football-data.org/714.png"
  },
  "Bologna FC 1909": {
    "short": "Bologna FC",
    "crest": "https://crests.football-data.org/3.png"
  },
  "US Salernitana 1919": {
    "short": "Salernitana",
    "crest": "https://crests.football-data.org/5915.png"
  },
  "Udinese Calcio": {
    "short": "Udinese Calcio",
    "crest": "https://crests.football-data.org/116.png"
  },
  "Juventus FC": {
    "short": "Juventus",
    "crest": "https://crests.football-data.org/109.png"
  },
  "SSC Napoli": {
    "short": "Napoli",
    "crest": "https://crests.football-data.org/113.png"
  },
  "Venezia FC": {
    "short": "Venezia",
    "crest": "https://crests.football-data.org/454.png"
  },
  "AS Roma": {
    "short": "Roma",
    "crest": "https://crests.football-data.org/100.png"
  },
  "ACF Fiorentina": {
    "short": "Fiorentina",
    "crest": "https://crests.football-data.org/99.png"
  },
  "Cagliari Calcio": {
    "short": "Cagliari Calcio",
    "crest": "https://crests.football-data.org/1106.png"
  },
  "Spezia Calcio": {
    "short": "Spezia Calcio",
    "crest": "https://crests.football-data.org/7250.png"
  },
  "UC Sampdoria": {
    "short": "UC Sampdoria",
    "crest": "https://crests.football-data.org/104.png"
  },
  "AC Milan": {
    "short": "Milan",
    "crest": "https://crests.football-data.org/98.png"
  },
  "US Lecce": {
    "short": "Lecce",
    "crest": "https://crests.football-data.org/5890.png"
  },
  "AC Monza": {
    "short": "Monza",
    "crest": "https://crests.football-data.org/7372.png"
  },
  "US Cremonese": {
    "short": "Cremonese",
    "crest": "https://crests.football-data.org/645.png"
  },
  "Frosinone Calcio": {
    "short": "Frosinone Calcio",
    "crest": "https://crests.football-data.org/2297.png"
  },
  "Parma Calcio 1913": {
    "short": "Parma Calcio",
    "crest": "https://crests.football-data.org/115.png"
  },
  "Como 1907": {
    "short": "Como",
    "crest": "https://crests.football-data.org/7399.png"
  },
  "Pisa": {
    "short": "Pisa",
    "crest": null
  }
};

/** Estadísticas históricas (2021-22, 2022-23, 2023-24, 2024-25, 2025-26) */
export const SA_MODEL: Record<string, SATeamModel> = {
  "FC Internazionale Milano": {
    "avgGF": 2.168,
    "avgGA": 0.874,
    "winRate": 0.674,
    "ptsRate": 0.733,
    "pj": 190,
    "homeGF": 2.305,
    "awayGF": 2.032,
    "homeGA": 0.821,
    "awayGA": 0.926,
    "elo": 1736
  },
  "Genoa CFC": {
    "avgGF": 0.987,
    "avgGA": 1.349,
    "winRate": 0.237,
    "ptsRate": 0.353,
    "pj": 152,
    "homeGF": 1.105,
    "awayGF": 0.868,
    "homeGA": 1.289,
    "awayGA": 1.408,
    "elo": 1471
  },
  "Verona": {
    "avgGF": 1.016,
    "avgGA": 1.558,
    "winRate": 0.226,
    "ptsRate": 0.316,
    "pj": 190,
    "homeGF": 1.095,
    "awayGF": 0.937,
    "homeGA": 1.547,
    "awayGA": 1.568,
    "elo": 1351
  },
  "US Sassuolo": {
    "avgGF": 1.316,
    "avgGA": 1.658,
    "winRate": 0.303,
    "ptsRate": 0.382,
    "pj": 152,
    "homeGF": 1.303,
    "awayGF": 1.329,
    "homeGA": 1.487,
    "awayGA": 1.829,
    "elo": 1480
  },
  "Empoli FC": {
    "avgGF": 0.98,
    "avgGA": 1.526,
    "winRate": 0.23,
    "ptsRate": 0.331,
    "pj": 152,
    "homeGF": 0.987,
    "awayGF": 0.974,
    "homeGA": 1.526,
    "awayGA": 1.526,
    "elo": 1417
  },
  "SS Lazio": {
    "avgGF": 1.516,
    "avgGA": 1.137,
    "winRate": 0.474,
    "ptsRate": 0.558,
    "pj": 190,
    "homeGF": 1.653,
    "awayGF": 1.379,
    "homeGA": 1.137,
    "awayGA": 1.137,
    "elo": 1559
  },
  "Torino FC": {
    "avgGF": 1.089,
    "avgGA": 1.189,
    "winRate": 0.326,
    "ptsRate": 0.43,
    "pj": 190,
    "homeGF": 1.116,
    "awayGF": 1.063,
    "homeGA": 1.011,
    "awayGA": 1.368,
    "elo": 1482
  },
  "Atalanta BC": {
    "avgGF": 1.747,
    "avgGA": 1.111,
    "winRate": 0.489,
    "ptsRate": 0.57,
    "pj": 190,
    "homeGF": 1.811,
    "awayGF": 1.684,
    "homeGA": 1.158,
    "awayGA": 1.063,
    "elo": 1583
  },
  "Bologna FC 1909": {
    "avgGF": 1.353,
    "avgGA": 1.205,
    "winRate": 0.4,
    "ptsRate": 0.502,
    "pj": 190,
    "homeGF": 1.411,
    "awayGF": 1.295,
    "homeGA": 0.958,
    "awayGA": 1.453,
    "elo": 1555
  },
  "US Salernitana 1919": {
    "avgGF": 0.991,
    "avgGA": 1.939,
    "winRate": 0.158,
    "ptsRate": 0.263,
    "pj": 114,
    "homeGF": 1.123,
    "awayGF": 0.86,
    "homeGA": 1.807,
    "awayGA": 2.07,
    "elo": 1396
  },
  "Udinese Calcio": {
    "avgGF": 1.216,
    "avgGA": 1.384,
    "winRate": 0.284,
    "ptsRate": 0.393,
    "pj": 190,
    "homeGF": 1.284,
    "awayGF": 1.147,
    "homeGA": 1.326,
    "awayGA": 1.442,
    "elo": 1501
  },
  "Juventus FC": {
    "avgGF": 1.505,
    "avgGA": 0.895,
    "winRate": 0.516,
    "ptsRate": 0.618,
    "pj": 190,
    "homeGF": 1.632,
    "awayGF": 1.379,
    "homeGA": 0.747,
    "awayGA": 1.042,
    "elo": 1629
  },
  "SSC Napoli": {
    "avgGF": 1.7,
    "avgGA": 0.895,
    "winRate": 0.589,
    "ptsRate": 0.667,
    "pj": 190,
    "homeGF": 1.747,
    "awayGF": 1.653,
    "homeGA": 0.937,
    "awayGA": 0.853,
    "elo": 1652
  },
  "Venezia FC": {
    "avgGF": 0.868,
    "avgGA": 1.645,
    "winRate": 0.145,
    "ptsRate": 0.246,
    "pj": 76,
    "homeGF": 1,
    "awayGF": 0.737,
    "homeGA": 1.579,
    "awayGA": 1.711,
    "elo": 1431
  },
  "AS Roma": {
    "avgGF": 1.521,
    "avgGA": 1.016,
    "winRate": 0.511,
    "ptsRate": 0.581,
    "pj": 190,
    "homeGF": 1.705,
    "awayGF": 1.337,
    "homeGA": 0.789,
    "awayGA": 1.242,
    "elo": 1653
  },
  "ACF Fiorentina": {
    "avgGF": 1.442,
    "avgGA": 1.216,
    "winRate": 0.416,
    "ptsRate": 0.5,
    "pj": 190,
    "homeGF": 1.663,
    "awayGF": 1.221,
    "homeGA": 1.084,
    "awayGA": 1.347,
    "elo": 1537
  },
  "Cagliari Calcio": {
    "avgGF": 1.026,
    "avgGA": 1.612,
    "winRate": 0.224,
    "ptsRate": 0.318,
    "pj": 152,
    "homeGF": 1.237,
    "awayGF": 0.816,
    "homeGA": 1.526,
    "awayGA": 1.697,
    "elo": 1482
  },
  "Spezia Calcio": {
    "avgGF": 0.947,
    "avgGA": 1.75,
    "winRate": 0.211,
    "ptsRate": 0.294,
    "pj": 76,
    "homeGF": 1.026,
    "awayGF": 0.868,
    "homeGA": 1.579,
    "awayGA": 1.921,
    "elo": 1452
  },
  "UC Sampdoria": {
    "avgGF": 0.921,
    "avgGA": 1.763,
    "winRate": 0.171,
    "ptsRate": 0.241,
    "pj": 76,
    "homeGF": 1.079,
    "awayGF": 0.763,
    "homeGA": 1.579,
    "awayGA": 1.947,
    "elo": 1424
  },
  "AC Milan": {
    "avgGF": 1.7,
    "avgGA": 1.058,
    "winRate": 0.558,
    "ptsRate": 0.639,
    "pj": 190,
    "homeGF": 1.705,
    "awayGF": 1.695,
    "homeGA": 0.905,
    "awayGA": 1.211,
    "elo": 1588
  },
  "US Lecce": {
    "avgGF": 0.789,
    "avgGA": 1.368,
    "winRate": 0.224,
    "ptsRate": 0.32,
    "pj": 152,
    "homeGF": 0.803,
    "awayGF": 0.776,
    "homeGA": 1.395,
    "awayGA": 1.342,
    "elo": 1455
  },
  "AC Monza": {
    "avgGF": 1.009,
    "avgGA": 1.509,
    "winRate": 0.246,
    "ptsRate": 0.336,
    "pj": 114,
    "homeGF": 1.07,
    "awayGF": 0.947,
    "homeGA": 1.386,
    "awayGA": 1.632,
    "elo": 1353
  },
  "US Cremonese": {
    "avgGF": 0.895,
    "avgGA": 1.658,
    "winRate": 0.171,
    "ptsRate": 0.268,
    "pj": 76,
    "homeGF": 0.868,
    "awayGF": 0.921,
    "homeGA": 1.579,
    "awayGA": 1.737,
    "elo": 1399
  },
  "Frosinone Calcio": {
    "avgGF": 1.158,
    "avgGA": 1.816,
    "winRate": 0.211,
    "ptsRate": 0.307,
    "pj": 38,
    "homeGF": 1.474,
    "awayGF": 0.842,
    "homeGA": 1.684,
    "awayGA": 1.947,
    "elo": 1456
  },
  "Parma Calcio 1913": {
    "avgGF": 0.947,
    "avgGA": 1.368,
    "winRate": 0.237,
    "ptsRate": 0.355,
    "pj": 76,
    "homeGF": 1.079,
    "awayGF": 0.816,
    "homeGA": 1.395,
    "awayGA": 1.342,
    "elo": 1503
  },
  "Como 1907": {
    "avgGF": 1.5,
    "avgGA": 1.066,
    "winRate": 0.434,
    "ptsRate": 0.526,
    "pj": 76,
    "homeGF": 1.658,
    "awayGF": 1.342,
    "homeGA": 1.079,
    "awayGA": 1.053,
    "elo": 1642
  },
  "Pisa": {
    "avgGF": 0.684,
    "avgGA": 1.868,
    "winRate": 0.053,
    "ptsRate": 0.158,
    "pj": 38,
    "homeGF": 0.474,
    "awayGF": 0.895,
    "homeGA": 1.368,
    "awayGA": 2.368,
    "elo": 1313
  }
};

/** Estadísticas de la temporada 2025-26 */
export const SA_REAL: Record<string, SATeamReal> = {
  "FC Internazionale Milano": {
    "avgGF": 2.342,
    "avgGA": 0.921,
    "pj": 38
  },
  "Genoa CFC": {
    "avgGF": 1.079,
    "avgGA": 1.342,
    "pj": 38
  },
  "Verona": {
    "avgGF": 0.658,
    "avgGA": 1.605,
    "pj": 38
  },
  "US Sassuolo": {
    "avgGF": 1.211,
    "avgGA": 1.316,
    "pj": 38
  },
  "SS Lazio": {
    "avgGF": 1.079,
    "avgGA": 1.053,
    "pj": 38
  },
  "Torino FC": {
    "avgGF": 1.158,
    "avgGA": 1.658,
    "pj": 38
  },
  "Atalanta BC": {
    "avgGF": 1.342,
    "avgGA": 0.947,
    "pj": 38
  },
  "Bologna FC 1909": {
    "avgGF": 1.289,
    "avgGA": 1.211,
    "pj": 38
  },
  "Udinese Calcio": {
    "avgGF": 1.184,
    "avgGA": 1.263,
    "pj": 38
  },
  "Juventus FC": {
    "avgGF": 1.605,
    "avgGA": 0.895,
    "pj": 38
  },
  "SSC Napoli": {
    "avgGF": 1.526,
    "avgGA": 0.947,
    "pj": 38
  },
  "AS Roma": {
    "avgGF": 1.553,
    "avgGA": 0.816,
    "pj": 38
  },
  "ACF Fiorentina": {
    "avgGF": 1.079,
    "avgGA": 1.316,
    "pj": 38
  },
  "Cagliari Calcio": {
    "avgGF": 1.053,
    "avgGA": 1.395,
    "pj": 38
  },
  "AC Milan": {
    "avgGF": 1.395,
    "avgGA": 0.921,
    "pj": 38
  },
  "US Lecce": {
    "avgGF": 0.737,
    "avgGA": 1.316,
    "pj": 38
  },
  "US Cremonese": {
    "avgGF": 0.842,
    "avgGA": 1.5,
    "pj": 38
  },
  "Parma Calcio 1913": {
    "avgGF": 0.737,
    "avgGA": 1.211,
    "pj": 38
  },
  "Como 1907": {
    "avgGF": 1.711,
    "avgGA": 0.763,
    "pj": 38
  },
  "Pisa": {
    "avgGF": 0.684,
    "avgGA": 1.868,
    "pj": 38
  }
};
