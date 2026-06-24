import { NextResponse } from 'next/server';
import { computeWcReal } from '@/lib/wcReal';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const wcReal = await computeWcReal('WC');
  return NextResponse.json({ wcReal });
}
