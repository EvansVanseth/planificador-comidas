'use server';

import { redirect } from 'next/navigation';
import { getAuthProvider } from '@/lib/auth';

export async function logout() {
  await getAuthProvider().signOut();
  redirect('/login');
}
