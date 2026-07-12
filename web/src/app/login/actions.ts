'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';

type State = { error: string };

export async function login(_prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string;
  if (!email || email.trim().length === 0) {
    return { error: 'Escribe tu email' };
  }

  const container = getContainer();
  const users = container.listUsers.execute();
  const user = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!user) {
    return { error: 'No existe un usuario con ese email. ¿Quieres crear una cuenta?' };
  }

  const cookieStore = await cookies();
  cookieStore.set('userId', user.id, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  redirect('/dashboard');
}
