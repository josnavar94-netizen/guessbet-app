import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-min-32-chars-change-me');
const COOKIE = 'gb_session';
const DURATION = 60 * 60 * 24 * 30; // 30 días

export type Session = { userId: number; username: string; email: string; plan: string; };

export async function createSession(payload: Session) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURATION}s`)
    .sign(key);
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
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export function destroySession() {
  cookies().delete(COOKIE);
}
