import { NextResponse } from 'next/server';
import { computePastResults } from '@/lib/results';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const results = await computePastResults('WC');
  return NextResponse.json({ results });
}
