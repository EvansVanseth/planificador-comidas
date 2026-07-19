'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { LogoIcon } from '@/components/icons';
import { PasswordInput } from '@/components/ui/password-input';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const supabase = createBrowserSupabase();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-[448px]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6">
            <LogoIcon size={48} />
          </div>
          <h1 className="mb-2 text-[30px] font-bold text-[#0F172B]">
            Nueva contraseña
          </h1>
          <p className="text-sm text-[#45556C]">
            Elige una contraseña segura.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#314158]">
                Nueva contraseña
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="h-10 w-full rounded-[10px] bg-[#007A55] text-base font-medium text-white transition-colors hover:bg-[#008055]"
            >
              Cambiar contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
