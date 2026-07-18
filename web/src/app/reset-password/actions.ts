'use server';

import { createClient } from '@/lib/supabase';

export type State = { error: string; success?: boolean };

export async function resetPassword(_prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string;

  if (!email || email.trim().length === 0) {
    return { error: 'Escribe tu email' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `http://127.0.0.1:3000/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: '', success: true };
}
