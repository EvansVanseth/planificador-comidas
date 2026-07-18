'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthProvider } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import { addToastToQueue } from '@/lib/toast-utils';

const PATH = '/dashboard/settings';

async function getAuthUser() {
  const user = await getAuthProvider().getUser();
  return { user };
}

export async function updateName(_prevState: { error: string }, formData: FormData): Promise<{ error: string }> {
  const name = formData.get('name') as string;
  if (!name || name.trim().length === 0) {
    return { error: 'Escribe tu nombre' };
  }

  const { user } = await getAuthUser();
  if (!user) redirect('/login');

  const container = getContainer();
  try {
    await getAuthProvider().updateName(user.id, name.trim());
    await container.updateUser.execute({ id: user.id, name: name.trim() });
  } catch {
    return { error: 'Error al actualizar el nombre' };
  }

  await addToastToQueue('Nombre actualizado correctamente', 'success');
  revalidatePath(PATH);
  return { error: '' };
}

export async function changePassword(_prevState: { error: string }, formData: FormData): Promise<{ error: string }> {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword) return { error: 'Escribe tu contraseña actual' };
  if (!newPassword || newPassword.length < 6) return { error: 'La nueva contraseña debe tener al menos 6 caracteres' };

  const { user } = await getAuthUser();
  if (!user) redirect('/login');

  try {
    // Verify current password by attempting sign-in
    await getAuthProvider().signIn(user.email, currentPassword);
    // Set new password
    await getAuthProvider().updatePassword(newPassword);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('incorrectos') || msg.includes('Invalid')) {
      return { error: 'La contraseña actual no es correcta' };
    }
    return { error: msg || 'Error al cambiar la contraseña' };
  }

  await addToastToQueue('Contraseña actualizada correctamente', 'success');
  revalidatePath(PATH);
  return { error: '' };
}

export async function deleteAccount() {
  const { user } = await getAuthUser();
  if (!user) redirect('/login');

  const container = getContainer();
  await container.deleteUser.execute(user.id);

  await getAuthProvider().deleteUser(user.id);

  redirect('/');
}
