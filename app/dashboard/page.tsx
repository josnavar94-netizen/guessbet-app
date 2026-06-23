import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import App from './App';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const userResult = await sql`SELECT plan FROM users WHERE id=${session.userId}`;
  const plan = userResult.rows[0]?.plan ?? session.plan;
  return <App username={session.username} email={session.email} plan={plan} />;
}
