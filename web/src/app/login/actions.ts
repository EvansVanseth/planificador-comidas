'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';

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

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (authError) {
    if (authError.message.includes('Invalid login credentials')) {
      return { error: 'Email o contraseña incorrectos' };
    }
    return { error: authError.message };
  }

  redirect('/dashboard');
}
