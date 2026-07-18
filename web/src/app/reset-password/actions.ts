'use server';

import { getAuthProvider } from '@/lib/auth';

export type State = { error: string; success?: boolean };

export async function resetPassword(_prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string;

  if (!email || email.trim().length === 0) {
    return { error: 'Escribe tu email' };
  }

  try {
    await getAuthProvider().resetPassword(email.trim());
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al enviar el email' };
  }

  return { error: '', success: true };
}
