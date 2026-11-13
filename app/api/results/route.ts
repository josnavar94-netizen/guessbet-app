import { NextResponse } from 'next/server';
import { computePastResults } from '@/lib/results';
import { leagueToCompetitionCode } from '@/lib/club-leagues';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') || 'wc';
  const code = leagueToCompetitionCode(league);
  const results = await computePastResults(code);
  return NextResponse.json({ results });
}
