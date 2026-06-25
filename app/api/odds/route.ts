import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const { rows } = await sql`SELECT home_team, away_team, home_odds, draw_odds, away_odds, over_odds, under_odds, btts_odds FROM match_odds WHERE bookmaker='coolbet'`;
  return NextResponse.json({ odds: rows });
}
