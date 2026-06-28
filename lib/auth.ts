import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

const COOKIE = 'gb_session';
const DURATION = 60 * 60 * 24 * 30; // 30 días; la sesión se mantiene hasta que el usuario cierre sesión manualmente

function getKey() {
  if (!process.env.JWT_SECRET && process.env.VERCEL_ENV === 'production') {
    throw new Error('JWT_SECRET no está configurado en producción.');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-min-32-chars-change-me');
}

export type Session = { userId: number; username: string; email: string; plan: string; sv: number; };

export async function createSession(payload: Session) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURATION}s`)
    .sign(getKey());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DURATION,
    path: '/',
  });
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    const session = payload as unknown as Session;
    const result = await sql`SELECT session_version FROM users WHERE id=${session.userId}`;
    const currentVersion = result.rows[0]?.session_version ?? 0;
    if (session.sv !== currentVersion) return null; // sesión cerrada por inicio en otro dispositivo
    return session;
  } catch {
    return null;
  }
}

export function destroySession() {
  cookies().delete(COOKIE);
}
