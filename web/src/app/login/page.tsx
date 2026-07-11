'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from './actions';

const initialState = { error: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-[10px] bg-[#009966] text-base font-medium text-white transition-colors hover:bg-[#008055] disabled:opacity-50"
    >
      {pending ? 'Entrando...' : 'Iniciar sesión'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-[448px]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#009B65"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 5v5a3 3 0 0 0 6 0V5" />
              <path d="M8 5v15" />
              <path d="M19 20V5c-3.5 0-4.5 1.5-4.5 4.5s1 4.5 4.5 4.5" />
            </svg>
          </div>
          <h1 className="mb-2 text-[30px] font-bold text-[#0F172B]">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-[#45556C]">
            Ingresa para ver tu planificación de esta semana.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <form action={formAction} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#314158]">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="demo@plancomidas.com"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 transition-colors focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#314158]">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 transition-colors focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-gray-300 accent-[#0075FF]"
                />
                <span className="text-sm font-medium text-[#0F172B]">
                  Recordarme
                </span>
              </label>
              <span className="cursor-pointer text-sm font-medium text-[#009966] hover:underline">
                ¿Olvidaste tu contraseña?
              </span>
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

          <p className="mb-4 text-center text-sm text-[#62748E]">
            ¿No tienes cuenta?
          </p>
          <button
            type="button"
            className="h-10 w-full rounded-[10px] border border-gray-200 bg-white text-base font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
          >
            Crear una cuenta gratis
          </button>
        </div>
      </div>
    </div>
  );
}
