'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';

type State = { error: string };

export async function signup(_prevState: State, formData: FormData): Promise<State> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!name || name.trim().length === 0) {
    return { error: 'Escribe tu nombre' };
  }
  if (!email || email.trim().length === 0) {
    return { error: 'Escribe tu email' };
  }

  const container = getContainer();

  try {
    const userId = await container.createUser.execute(name.trim(), email.trim());

    const cookieStore = await cookies();
    cookieStore.set('userId', userId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al crear la cuenta';
    return { error: msg };
  }

  redirect('/dashboard');
}
