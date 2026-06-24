import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, acceptedTerms } = await req.json();
    if (!email || !username || !password)
      return NextResponse.json({ error: 'Completa todos los campos.' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    if (username.length < 3)
      return NextResponse.json({ error: 'El nombre de usuario debe tener al menos 3 caracteres.' }, { status: 400 });
    if (!acceptedTerms)
      return NextResponse.json({ error: 'Debes aceptar los Términos y la Política de Privacidad.' }, { status: 400 });

    const existing = await sql`SELECT id FROM users WHERE email=${email.toLowerCase()} OR username=${username}`;
    if (existing.rows.length > 0)
      return NextResponse.json({ error: 'Ese correo o usuario ya está registrado.' }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (email, username, password_hash, terms_accepted_at, terms_version)
      VALUES (${email.toLowerCase()}, ${username}, ${hash}, NOW(), '1.0')
      RETURNING id, email, username, plan
    `;
    const user = result.rows[0];
    await createSession({ userId: user.id, username: user.username, email: user.email, plan: user.plan, sv: 0 });
    return NextResponse.json({ ok: true, user: { id: user.id, username: user.username, email: user.email, plan: user.plan } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
