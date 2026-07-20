import { NextResponse } from 'next/server';
import { computeWcReal } from '@/lib/wcReal';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('league') === 'pl' ? 'PL' : 'WC';
  const wcReal = await computeWcReal(code);
  return NextResponse.json({ wcReal });
}
