import { redirect } from 'next/navigation';
import { getAuthProvider } from '@/lib/auth';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const user = await getAuthProvider().getUser();
  if (!user) redirect('/login');

  const name = user.name;
  const email = user.email;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172B]">Mi cuenta</h1>
        <p className="mt-1 text-base text-[#4F617B]">
          Gestiona tu información personal y configuración de la cuenta.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <SettingsForm name={name} email={email} />
          </div>
        </div>
      </div>
    </div>
  );
}
