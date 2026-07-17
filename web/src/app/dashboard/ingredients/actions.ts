'use server';

import { Name } from '@/domain/shared/value-objects/name.vo';
import { getContainer } from '@/domain-container';
import { addToastToQueue } from '@/lib/toast-utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const PATH = '/dashboard/ingredients';

function isSimilar(a: string, b: string): boolean {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  if (al === bl) return false;
  return al.includes(bl) || bl.includes(al);
}

export async function createIngredient(formData: FormData) {
  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;

  let nameVO: Name;
  try {
    nameVO = Name.create('nombre', name || '');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Nombre inválido';
    await addToastToQueue(msg, 'error');
    revalidatePath(PATH);
    redirect(PATH);
  }

  const trimmed = nameVO.value;
  const c = getContainer();

  const existing = await c.listIngredients.execute(userId);
  if (existing.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
    await addToastToQueue('Ya existe un ingrediente con ese nombre', 'error');
    revalidatePath(PATH);
    redirect(PATH);
  }

  const similar = existing.filter((i) => isSimilar(trimmed, i.name));
  if (similar.length > 0) {
    const names = similar.map((i) => i.name).join(',');
    redirect(
      `${PATH}?similar=${encodeURIComponent(names)}&name=${encodeURIComponent(trimmed)}`,
    );
  }

  await c.createIngredient.execute(userId, trimmed);

  await addToastToQueue(`Ingrediente '${trimmed}' creado correctamente.`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function forceCreateIngredient(formData: FormData) {
  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;

  let nameVO: Name;
  try {
    nameVO = Name.create('nombre', name || '');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Nombre inválido';
    await addToastToQueue(msg, 'error');
    revalidatePath(PATH);
    redirect(PATH);
  }

  const c = getContainer();
  await c.createIngredient.execute(userId, nameVO.value);

  await addToastToQueue(`Ingrediente '${nameVO.value}' creado correctamente.`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function renameIngredient(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const previousName = (formData.get('previousName') as string) || '';

  let nameVO: Name;
  try {
    nameVO = Name.create('nombre', name || '');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Nombre inválido';
    await addToastToQueue(msg, 'error');
    revalidatePath(PATH);
    redirect(PATH);
  }

  const c = getContainer();
  try {
    await c.updateIngredient.execute({ id, name: nameVO.value });
  } catch {
    await addToastToQueue('Ya existe un ingrediente con ese nombre', 'error');
    revalidatePath(PATH);
    redirect(PATH);
  }

  await addToastToQueue(
    `Modificado '${previousName}' a '${nameVO.value}' correctamente.`,
  );
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteIngredient(formData: FormData) {
  const id = formData.get('id') as string;

  const c = getContainer();
  const result = await c.deleteIngredient.execute(id);

  await addToastToQueue(
    `Ingrediente eliminado. Afectó a ${result.recipesAffected} recetas y ${result.planningsAffected} planificaciones.`,
  );
  revalidatePath(PATH);
  redirect(PATH);
}

export async function mergeIngredients(formData: FormData) {
  const userId = formData.get('userId') as string;
  const sourceId = formData.get('sourceId') as string;
  const targetId = formData.get('targetId') as string;

  const c = getContainer();
  await c.mergeIngredients.execute(userId, sourceId, targetId);

  await addToastToQueue('Ingredientes fusionados correctamente.');
  revalidatePath(PATH);
  redirect(PATH);
}

export async function getMergePreview(sourceId: string, userId: string) {
  const c = getContainer();
  const recipes = await c.listRecipes.execute(userId);
  const recipesAffected = recipes
    .filter((r) => r.ingredients.some((i) => i.ingredientId === sourceId))
    .map((r) => r.name);
  return { recipesAffected };
}

export async function getDeleteImpact(ingredientId: string, userId: string) {
  const c = getContainer();

  const recipes = await c.listRecipes.execute(userId);
  const recipesAffected = recipes.filter((r) =>
    r.ingredients.some((i) => i.ingredientId === ingredientId),
  ).length;

  const plannings = await c.listPlannings.execute(userId);
  const planningsAffected = plannings.filter((p) => {
    const primitives = p.toPrimitives();
    return (
      primitives.pantryItems.some((i) => i.ingredientId === ingredientId) ||
      primitives.shoppingItems.some((i) => i.ingredientId === ingredientId)
    );
  }).length;

  return { recipesAffected, planningsAffected };
}
