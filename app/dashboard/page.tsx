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
  let isAdmin = false;
  try {
    // Si el plan Premium ya venció (pago único, sin renovación automática), vuelve a Free.
    await sql`UPDATE users SET plan='free' WHERE id=${session.userId} AND plan='premium' AND plan_expires_at < NOW()`;
    const userResult = await sql`SELECT plan, avatar, email_verified, is_admin FROM users WHERE id=${session.userId}`;
    plan = userResult.rows[0]?.plan ?? session.plan;
    avatar = userResult.rows[0]?.avatar ?? null;
    emailVerified = userResult.rows[0]?.email_verified ?? true;
    isAdmin = userResult.rows[0]?.is_admin ?? false;
  } catch {
    // Alguna columna todavía no existe (falta correr la migración); seguir con valores por defecto.
    const userResult = await sql`SELECT plan FROM users WHERE id=${session.userId}`;
    plan = userResult.rows[0]?.plan ?? session.plan;
  }
  return <App username={session.username} email={session.email} plan={plan} avatar={avatar} emailVerified={emailVerified} isAdmin={isAdmin} />;
}
