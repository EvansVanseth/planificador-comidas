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
      className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Entrando...' : 'Comenzar'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Planificador de Comidas
        </h1>
        <p className="text-gray-500 text-sm mb-8 text-center">
          Ingresá tu nombre para empezar
        </p>

        <form action={formAction} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Tu nombre"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          {state?.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
