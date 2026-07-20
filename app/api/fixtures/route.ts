import { NextResponse } from 'next/server';
import { computeUpcomingFixtures } from '@/lib/fixtures';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('league') === 'pl' ? 'PL' : 'WC';
  const fixtures = await computeUpcomingFixtures(code);
  return NextResponse.json({ fixtures });
}
