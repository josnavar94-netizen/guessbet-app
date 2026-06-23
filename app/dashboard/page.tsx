import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import App from './App';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return <App username={session.username} email={session.email} plan={session.plan} />;
}
