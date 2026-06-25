import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const COOKIE = 'gb_session';
const IDLE_SECONDS = 15 * 60; // cierre de sesión por inactividad: 15 minutos sin ninguna acción

function getKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-min-32-chars-change-me');
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.next();

  try {
    const { payload } = await jwtVerify(token, getKey());

    // Cada acción real (clic, navegación, llamada a la API) corre el reloj de inactividad otros 15 minutos.
    // Si el usuario no hace nada en ese tiempo, el token simplemente expira y deja de renovarse.
    const refreshed = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${IDLE_SECONDS}s`)
      .sign(getKey());

    const res = NextResponse.next();
    res.cookies.set(COOKIE, refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: IDLE_SECONDS,
      path: '/',
    });
    return res;
  } catch {
    // Token inválido o ya expirado por inactividad; getSession() en la ruta lo rechazará y mandará al login.
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
