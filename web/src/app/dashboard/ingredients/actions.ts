'use server';

import { getContainer } from '@/domain-container';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function isSimilar(a: string, b: string): boolean {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  if (al === bl) return false;
  return al.includes(bl) || bl.includes(al);
}

export async function createIngredient(formData: FormData) {
  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;

  if (!name || name.trim().length === 0) {
    redirect('/dashboard/ingredients?error=El nombre no puede estar vacío');
  }

  const trimmed = name.trim();
  const c = getContainer();

  const existing = c.listIngredients.execute(userId);
  if (existing.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
    redirect('/dashboard/ingredients?error=Ya existe un ingrediente con ese nombre');
  }

  const similar = existing.filter((i) => isSimilar(trimmed, i.name));
  if (similar.length > 0) {
    const names = similar.map((i) => i.name).join(',');
    redirect(
      `/dashboard/ingredients?similar=${encodeURIComponent(names)}&name=${encodeURIComponent(trimmed)}`,
    );
  }

  try {
    c.createIngredient.execute(userId, trimmed);
  } catch {
    redirect('/dashboard/ingredients?error=Ya existe un ingrediente con ese nombre');
  }

  revalidatePath('/dashboard/ingredients');
  redirect('/dashboard/ingredients?toast=created');
}

export async function forceCreateIngredient(formData: FormData) {
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
  redirect('/dashboard/ingredients?toast=created');
}

export async function renameIngredient(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;

  if (!name || name.trim().length === 0) {
    redirect('/dashboard/ingredients?error=El nombre no puede estar vacío');
  }

  const c = getContainer();
  try {
    c.updateIngredient.execute({ id, name: name.trim() });
  } catch {
    redirect('/dashboard/ingredients?error=Ya existe un ingrediente con ese nombre');
  }

  revalidatePath('/dashboard/ingredients');
  redirect('/dashboard/ingredients?toast=edited');
}

export async function deleteIngredient(formData: FormData) {
  const id = formData.get('id') as string;

  const c = getContainer();
  const result = c.deleteIngredient.execute(id);

  revalidatePath('/dashboard/ingredients');
  redirect(
    `/dashboard/ingredients?toast=deleted&rp=${result.recipesAffected}&pp=${result.planningsAffected}`,
  );
}

export async function getDeleteImpact(ingredientId: string, userId: string) {
  const c = getContainer();

  const recipes = c.listRecipes.execute(userId);
  const recipesAffected = recipes.filter((r) =>
    r.ingredients.some((i) => i.ingredientId === ingredientId),
  ).length;

  const plannings = c.listPlannings.execute(userId);
  const planningsAffected = plannings.filter((p) => {
    const primitives = p.toPrimitives();
    return (
      primitives.pantryItems.some((i) => i.ingredientId === ingredientId) ||
      primitives.shoppingItems.some((i) => i.ingredientId === ingredientId)
    );
  }).length;

  return { recipesAffected, planningsAffected };
}
