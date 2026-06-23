import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { emailOrUsername, password } = await req.json();
    if (!emailOrUsername || !password)
      return NextResponse.json({ error: 'Completa todos los campos.' }, { status: 400 });

    const result = await sql`
      SELECT id, email, username, password_hash, plan FROM users
      WHERE email=${emailOrUsername.toLowerCase()} OR username=${emailOrUsername}
    `;
    const user = result.rows[0];
    if (!user) return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });

    await createSession({ userId: user.id, username: user.username, email: user.email, plan: user.plan });
    return NextResponse.json({ ok: true, user: { id: user.id, username: user.username, email: user.email, plan: user.plan } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
