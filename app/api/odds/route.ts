import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const { rows } = await sql`SELECT home_team, away_team, bookmaker, home_odds, draw_odds, away_odds, over_odds, under_odds, total_line FROM match_odds`;
  return NextResponse.json({ odds: rows });
}
