'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signup } from './actions';
import Link from 'next/link';
import { LogoIcon } from '@/components/icons';

const initialState = { error: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-[10px] bg-[#007A55] text-base font-medium text-white transition-colors hover:bg-[#008055] disabled:opacity-50"
    >
      {pending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-[448px]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6">
            <Link href="/">
              <LogoIcon size={48} />
            </Link>
          </div>
          <h1 className="mb-2 text-[30px] font-bold text-[#0F172B]">
            Crear tu cuenta
          </h1>
          <p className="text-sm text-[#45556C]">
            Empieza a organizar tus comidas en segundos.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <form action={formAction} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#314158]">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                placeholder="Tu nombre"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#314158]">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="demo@plancomidas.com"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#314158]">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            <SubmitButton />
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
          </div>

          <p className="mb-4 text-center text-sm text-[#4F617B]">
            ¿Ya tienes cuenta?
          </p>
          <Link
            href="/login"
            className="flex h-10 w-full items-center justify-center rounded-[10px] border border-gray-200 bg-white text-base font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
