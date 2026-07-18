'use server';

import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';
import { createClient } from '@/lib/supabase';

type State = { error: string };

export async function signup(_prevState: State, formData: FormData): Promise<State> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || name.trim().length === 0) {
    return { error: 'Escribe tu nombre' };
  }
  if (!email || email.trim().length === 0) {
    return { error: 'Escribe tu email' };
  }
  if (!password || password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() } },
  });

  if (authError) {
    return { error: authError.message };
  }

  const authUserId = authData.user?.id;
  if (!authUserId) {
    return { error: 'Error al crear la cuenta' };
  }

  const container = getContainer();

  try {
    await container.createUser.execute(name.trim(), email.trim(), authUserId);
    await container.seedTagsForUser(authUserId);
  } catch {
    return { error: 'Error al crear la cuenta' };
  }

  redirect('/dashboard');
}
