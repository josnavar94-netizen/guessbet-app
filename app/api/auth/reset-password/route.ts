import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });

    const result = await sql`SELECT id, user_id, expires_at, used FROM password_resets WHERE token=${token}`;
    const reset = result.rows[0];
    if (!reset || reset.used || new Date(reset.expires_at) < new Date())
      return NextResponse.json({ error: 'El link de recuperación no es válido o ya expiró. Solicita uno nuevo.' }, { status: 400 });

    const hash = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password_hash=${hash}, session_version = session_version + 1 WHERE id=${reset.user_id}`;
    await sql`UPDATE password_resets SET used=TRUE WHERE id=${reset.id}`;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
