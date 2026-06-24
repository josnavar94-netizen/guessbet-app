import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logError } from '@/lib/logError';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.BACKUP_SECRET || secret !== process.env.BACKUP_SECRET) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const [users, bets, matches] = await Promise.all([
      sql`SELECT * FROM users ORDER BY id`,
      sql`SELECT * FROM bets ORDER BY id`,
      sql`SELECT * FROM matches ORDER BY id`,
    ]);

    const backup = {
      generated_at: new Date().toISOString(),
      users: users.rows,
      bets: bets.rows,
      matches: matches.rows,
    };

    const filename = `guessbet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    await logError(err, 'admin/backup');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
