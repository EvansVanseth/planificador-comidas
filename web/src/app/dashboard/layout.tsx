import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';
import Sidebar from './sidebar';
import ToastQueue from '@/components/toast-queue';

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

  let toasts: { message: string; type: string }[] = [];
  try {
    const toastCookie = cookieStore.get('toast_queue');
    if (toastCookie) toasts = JSON.parse(toastCookie.value);
  } catch {}

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#F8FAFC]">
        <div className="mx-auto max-w-[911px] px-6 py-6">
          {toasts.length > 0 && (
            <ToastQueue
              messages={toasts.map((t) => ({
                message: t.message,
                type: t.type === 'error' ? 'error' : 'success',
              }))}
            />
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
