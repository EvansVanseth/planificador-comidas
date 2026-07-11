'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';

type State = { error: string };

export async function login(_prevState: State, formData: FormData): Promise<State> {
  const name = formData.get('name') as string;
  if (!name || name.trim().length === 0) {
    return { error: 'Ingresá tu nombre' };
  }

  const container = getContainer();
  const users = container.listUsers.execute();
  const existing = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase());

  let userId: string;
  if (existing) {
    userId = existing.id;
  } else {
    userId = container.createUser.execute(name.trim());
  }

  const cookieStore = await cookies();
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  redirect('/dashboard');
}
