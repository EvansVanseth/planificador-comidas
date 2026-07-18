import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
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

  const name = user.user_metadata?.name as string ?? '';
  const email = user.email ?? '';

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[#0F172B]">Mi cuenta</h1>

      <div className="mb-8 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="mb-1 text-lg font-semibold text-[#0F172B]">Información personal</h2>
        <p className="mb-5 text-sm text-[#45556C]">Tu nombre y correo electrónico.</p>

        <SettingsForm name={name} email={email} />
      </div>

      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="mb-1 text-lg font-semibold text-[#DC2626]">Eliminar cuenta</h2>
        <p className="mb-5 text-sm text-[#45556C]">
          Esta acción eliminará todos tus datos: recetas, planificaciones, ingredientes y etiquetas. No se puede deshacer.
        </p>

        <form
          action="/dashboard/settings/actions"
          method="post"
          id="delete-form"
        >
          <button
            type="submit"
            formAction="/dashboard/settings/actions"
            formMethod="post"
            className="h-10 rounded-[10px] border border-red-200 bg-white px-5 text-sm font-medium text-[#DC2626] transition-colors hover:bg-red-50"
          >
            Eliminar mi cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
