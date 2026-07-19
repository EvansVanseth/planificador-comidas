'use server';

import { redirect } from 'next/navigation';
import { getAuthProvider } from '@/lib/auth';

type State = { error: string };

export async function login(_prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || email.trim().length === 0) {
    return { error: 'Escribe tu email' };
  }
  if (!password) {
    return { error: 'Escribe tu contraseña' };
  }

  try {
    await getAuthProvider().signIn(email.trim(), password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Email o contraseña incorrectos' };
  }

  redirect('/dashboard');
}

export async function getDevInfo(): Promise<{ show: false } | { show: true; dbUrl: string }> {
  if (process.env.DEV_MODE !== 'DEVELOPMENT') {
    return { show: false };
  }

  const raw = process.env.DATABASE_URL ?? 'no definida';

  const sanitized = raw.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');

  return { show: true, dbUrl: sanitized };
}
