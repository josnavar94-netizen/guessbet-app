/**
 * Módulo unificado para ligas de clubes (PL, La Liga, Bundesliga, Serie A).
 * Expone una interfaz genérica que CalcTab y los modelos usan indistintamente.
 */

import { PL_MODEL, PL_REAL, PL_CLUBS, PL_LEAGUE_AVG } from './pl-model';
import { LL_MODEL, LL_REAL, LL_CLUBS, LL_LEAGUE_AVG } from './laliga-model';
import { BL_MODEL, BL_REAL, BL_CLUBS, BL_LEAGUE_AVG } from './bundesliga-model';
import { SA_MODEL, SA_REAL, SA_CLUBS, SA_LEAGUE_AVG } from './seriea-model';

export type ClubModel = {
  avgGF: number; avgGA: number; winRate: number; ptsRate: number; pj: number;
  homeGF: number | null; awayGF: number | null; homeGA: number | null; awayGA: number | null;
  elo: number;
};
export type ClubReal = { avgGF: number; avgGA: number; pj: number };
export type ClubInfo = { short: string; crest: string | null };

export type ClubLeagueData = {
  model: Record<string, ClubModel>;
  real: Record<string, ClubReal>;
  clubs: Record<string, ClubInfo>;
  leagueAvg: number;
  competitionCode: string; // código football-data.org
};

export const CLUB_LEAGUE_DATA: Record<string, ClubLeagueData> = {
  pl: {
    model:          PL_MODEL as Record<string, ClubModel>,
    real:           PL_REAL  as Record<string, ClubReal>,
    clubs:          PL_CLUBS as Record<string, ClubInfo>,
    leagueAvg:      PL_LEAGUE_AVG,
    competitionCode: 'PL',
  },
  laliga: {
    model:          LL_MODEL as Record<string, ClubModel>,
    real:           LL_REAL  as Record<string, ClubReal>,
    clubs:          LL_CLUBS as Record<string, ClubInfo>,
    leagueAvg:      LL_LEAGUE_AVG,
    competitionCode: 'PD',
  },
  bundesliga: {
    model:          BL_MODEL as Record<string, ClubModel>,
    real:           BL_REAL  as Record<string, ClubReal>,
    clubs:          BL_CLUBS as Record<string, ClubInfo>,
    leagueAvg:      BL_LEAGUE_AVG,
    competitionCode: 'BL1',
  },
  seriea: {
    model:          SA_MODEL as Record<string, ClubModel>,
    real:           SA_REAL  as Record<string, ClubReal>,
    clubs:          SA_CLUBS as Record<string, ClubInfo>,
    leagueAvg:      SA_LEAGUE_AVG,
    competitionCode: 'SA',
  },
};

/** IDs de competición football-data.org → league id de la app */
export const COMPETITION_TO_LEAGUE: Record<string, string> = {
  PL:  'pl',
  PD:  'laliga',
  BL1: 'bundesliga',
  SA:  'seriea',
  WC:  'wc',
  UNL: 'unl',  // UEFA Nations League (selecciones)
  EC:  'euro', // Eurocopa
};

export function isClubLeague(leagueId: string): boolean {
  return leagueId in CLUB_LEAGUE_DATA;
}

export function getClubLeagueData(leagueId: string): ClubLeagueData | null {
  return CLUB_LEAGUE_DATA[leagueId] ?? null;
}

/** Devuelve el competition_code para la DB a partir del league id */
export function leagueToCompetitionCode(leagueId: string): string {
  const club = CLUB_LEAGUE_DATA[leagueId];
  if (club) return club.competitionCode;
  if (leagueId === 'wc') return 'WC';
  if (leagueId === 'unl') return 'UNL';
  if (leagueId === 'euro') return 'EC';
  return leagueId.toUpperCase();
}
