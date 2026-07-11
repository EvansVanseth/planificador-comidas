import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';
import Sidebar from './sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/login');

  const c = getContainer();
  const users = c.listUsers.execute();
  const user = users.find((u) => u.id === userId);
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#F8FAFC]">
        <div className="mx-auto max-w-[911px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
