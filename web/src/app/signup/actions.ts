'use server';

import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';
import type { IContainer } from '@/infrastructure/container';
import { getAuthProvider } from '@/lib/auth';

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

  let authUserId: string;
  try {
    authUserId = await getAuthProvider().signUp(email.trim(), password, name.trim());
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear la cuenta' };
  }

  let container: IContainer;
  try {
    container = getContainer();
  } catch (e) {
    console.error('[signup] Error al crear el container:', e);
    return { error: e instanceof Error ? e.message : 'Error al conectar con la base de datos' };
  }

  try {
    await container.createUser.execute(name.trim(), email.trim(), authUserId);
    await container.seedTagsForUser(authUserId);
  } catch (e) {
    console.error('[signup] Error al crear usuario/tags:', e);
    return { error: e instanceof Error ? e.message : 'Error al crear la cuenta' };
  }

  redirect('/dashboard');
}
