import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: s.userId, username: s.username, email: s.email, plan: s.plan } });
}
