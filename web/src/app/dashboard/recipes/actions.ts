'use server';

import { getContainer } from '@/domain-container';
import { addToastToQueue } from '@/lib/toast-utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const PATH = '/dashboard/recipes';

export async function deleteRecipe(formData: FormData) {
  const id = formData.get('id') as string;

  const c = getContainer();
  const result = c.deleteRecipe.execute(id);

  const msg =
    result.planningsAffected > 0
      ? `Receta eliminada. Se removió de ${result.planningsAffected} planificacione(s).`
      : 'Receta eliminada correctamente.';

  await addToastToQueue(msg);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function createIngredientInline(userId: string, name: string) {
  const c = getContainer();
  const trimmed = name.trim();
  if (!trimmed) throw new Error('El nombre no puede estar vacío.');

  const existing = c.listIngredients.execute(userId);
  const found = existing.find((i) => i.name.toLowerCase() === trimmed.toLowerCase());
  if (found) return { id: found.id, name: found.name };

  c.createIngredient.execute(userId, trimmed);
  const updated = c.listIngredients.execute(userId);
  const created = updated.find((i) => i.name.toLowerCase() === trimmed.toLowerCase());
  if (!created) throw new Error('Error al crear el ingrediente.');
  return { id: created.id, name: created.name };
}

export async function getDeleteImpact(recipeId: string, userId: string) {
  const c = getContainer();

  const plannings = c.listPlannings.execute(userId);
  let planningsAffected = 0;
  for (const p of plannings) {
    const primitives = p.toPrimitives();
    for (const day of primitives.days) {
      if (day.services.some((s) => s.recipeId === recipeId)) {
        planningsAffected++;
        break;
      }
    }
  }

  return { planningsAffected };
}
