import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import App from './App';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  let plan = session.plan;
  let avatar: string | null = null;
  let emailVerified = true;
  try {
    const userResult = await sql`SELECT plan, avatar, email_verified FROM users WHERE id=${session.userId}`;
    plan = userResult.rows[0]?.plan ?? session.plan;
    avatar = userResult.rows[0]?.avatar ?? null;
    emailVerified = userResult.rows[0]?.email_verified ?? true;
  } catch {
    // Alguna columna todavía no existe (falta correr la migración); seguir con valores por defecto.
    const userResult = await sql`SELECT plan FROM users WHERE id=${session.userId}`;
    plan = userResult.rows[0]?.plan ?? session.plan;
  }
  return <App username={session.username} email={session.email} plan={plan} avatar={avatar} emailVerified={emailVerified} />;
}
