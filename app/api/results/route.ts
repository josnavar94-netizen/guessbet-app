import { NextResponse } from 'next/server';
import { computePastResults } from '@/lib/results';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('league') === 'pl' ? 'PL' : 'WC';
  const results = await computePastResults(code);
  return NextResponse.json({ results });
}
