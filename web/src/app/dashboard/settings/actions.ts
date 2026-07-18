'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient } from '../service-role';
import { getContainer } from '@/domain-container';
import { addToastToQueue } from '@/lib/toast-utils';

const PATH = '/dashboard/settings';

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function updateName(_prevState: { error: string }, formData: FormData): Promise<{ error: string }> {
  const name = formData.get('name') as string;
  if (!name || name.trim().length === 0) {
    return { error: 'Escribe tu nombre' };
  }

  const { supabase, user } = await getAuthUser();
  if (!user) redirect('/login');

  const { error } = await supabase.auth.updateUser({
    data: { name: name.trim() },
  });

  if (error) return { error: error.message };

  const container = getContainer();
  try {
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

  const { supabase, user } = await getAuthUser();
  if (!user) redirect('/login');

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) return { error: 'La contraseña actual no es correcta' };

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: updateError.message };

  await addToastToQueue('Contraseña actualizada correctamente', 'success');
  revalidatePath(PATH);
  return { error: '' };
}

export async function deleteAccount() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const container = getContainer();
  await container.deleteUser.execute(user.id);

  const adminClient = createServiceRoleClient();
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) throw new Error(deleteError.message);

  redirect('/');
}
