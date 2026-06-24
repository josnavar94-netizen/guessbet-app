import { NextResponse } from 'next/server';
import { computeUpcomingFixtures } from '@/lib/fixtures';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const fixtures = await computeUpcomingFixtures('WC');
  return NextResponse.json({ fixtures });
}
