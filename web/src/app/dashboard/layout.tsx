import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAuthProvider } from '@/lib/auth';
import Sidebar from './sidebar';
import MobileNav from '@/components/mobile-nav';
import ToastQueue from '@/components/toast-queue';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthProvider().getUser();
  if (!user) redirect('/login');

  const cookieStore = await cookies();
  let toasts: { message: string; type: string }[] = [];
  try {
    const toastCookie = cookieStore.get('toast_queue');
    if (toastCookie) toasts = JSON.parse(toastCookie.value);
  } catch {}

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-[#CCEDD5] pb-16 md:pb-0">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-4 md:px-6 md:py-6">
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
      <MobileNav />
    </div>
  );
}
