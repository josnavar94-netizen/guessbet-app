import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import App from './App';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  let plan = session.plan;
  let avatar: string | null = null;
  try {
    const userResult = await sql`SELECT plan, avatar FROM users WHERE id=${session.userId}`;
    plan = userResult.rows[0]?.plan ?? session.plan;
    avatar = userResult.rows[0]?.avatar ?? null;
  } catch {
    // La columna "avatar" todavía no existe (falta correr la migración); seguir sin avatar.
    const userResult = await sql`SELECT plan FROM users WHERE id=${session.userId}`;
    plan = userResult.rows[0]?.plan ?? session.plan;
  }
  return <App username={session.username} email={session.email} plan={plan} avatar={avatar} />;
}
