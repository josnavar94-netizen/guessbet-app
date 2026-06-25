import { NextResponse } from 'next/server';
import { getSyncStatus } from '@/lib/syncStatus';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const status = await getSyncStatus('WC');
  return NextResponse.json(status);
}
