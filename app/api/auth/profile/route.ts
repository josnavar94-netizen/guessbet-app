import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { getSession, createSession } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  try {
    const { username, currentPassword, newPassword, avatar } = await req.json();

    const userResult = await sql`SELECT * FROM users WHERE id=${session.userId}`;
    const user = userResult.rows[0];
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });

    let newUsername = user.username;
    if (username && username !== user.username) {
      if (username.length < 3)
        return NextResponse.json({ error: 'El nombre de usuario debe tener al menos 3 caracteres.' }, { status: 400 });
      const existing = await sql`SELECT id FROM users WHERE username=${username} AND id != ${user.id}`;
      if (existing.rows.length > 0)
        return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso.' }, { status: 409 });
      newUsername = username;
    }

    if (avatar !== undefined) {
      if (avatar !== null) {
        if (typeof avatar !== 'string' || !avatar.startsWith('data:image/'))
          return NextResponse.json({ error: 'Formato de imagen inválido.' }, { status: 400 });
        if (avatar.length > 500_000)
          return NextResponse.json({ error: 'La imagen es demasiado grande.' }, { status: 400 });
      }
      await sql`UPDATE users SET avatar=${avatar} WHERE id=${user.id}`;
    }

    let sv = user.session_version;

    if (newPassword) {
      if (!currentPassword)
        return NextResponse.json({ error: 'Ingresa tu contraseña actual para cambiarla.' }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid)
        return NextResponse.json({ error: 'Tu contraseña actual no es correcta.' }, { status: 401 });
      if (newPassword.length < 6)
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' }, { status: 400 });

      const hash = await bcrypt.hash(newPassword, 10);
      sv = sv + 1; // invalida sesiones en otros dispositivos
      await sql`UPDATE users SET username=${newUsername}, password_hash=${hash}, session_version=${sv} WHERE id=${user.id}`;
    } else {
      await sql`UPDATE users SET username=${newUsername} WHERE id=${user.id}`;
    }

    await createSession({ userId: user.id, username: newUsername, email: user.email, plan: user.plan, sv });
    return NextResponse.json({ ok: true, username: newUsername });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
