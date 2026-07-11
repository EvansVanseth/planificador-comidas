'use server';

import { getContainer } from '@/domain-container';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createIngredient(formData: FormData) {
  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;

  if (!name || name.trim().length === 0) {
    redirect('/dashboard/ingredients?error=El nombre no puede estar vacío');
  }

  const c = getContainer();
  try {
    c.createIngredient.execute(userId, name.trim());
  } catch {
    redirect('/dashboard/ingredients?error=Ya existe un ingrediente con ese nombre');
  }

  revalidatePath('/dashboard/ingredients');
  redirect('/dashboard/ingredients');
}

export async function deleteIngredient(formData: FormData) {
  const id = formData.get('id') as string;

  const c = getContainer();
  c.deleteIngredient.execute(id);

  revalidatePath('/dashboard/ingredients');
  redirect('/dashboard/ingredients');
}
