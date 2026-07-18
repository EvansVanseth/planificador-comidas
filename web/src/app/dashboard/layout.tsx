import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Sidebar from './sidebar';
import MobileNav from '@/components/mobile-nav';
import ToastQueue from '@/components/toast-queue';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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
