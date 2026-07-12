'use server';

import { Name } from '@/domain/shared/value-objects/name.vo';
import { getContainer } from '@/domain-container';
import { addToastToQueue } from '@/lib/toast-utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

const PATH = '/dashboard/tags';

export async function createTag(formData: FormData) {
  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const dimension = formData.get('dimension') as TagDimension;

  let nameVO: Name;
  try {
    nameVO = Name.create('nombre', name || '');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Nombre inválido';
    await addToastToQueue(msg, 'error', PATH);
    revalidatePath(PATH);
    redirect(PATH);
  }

  const c = getContainer();
  try {
    c.createTag.execute(userId, nameVO.value, dimension, false);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al crear la etiqueta';
    await addToastToQueue(msg, 'error', PATH);
    revalidatePath(PATH);
    redirect(PATH);
  }

  await addToastToQueue('Etiqueta creada correctamente.', 'success', PATH);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function updateTag(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;

  let nameVO: Name;
  try {
    nameVO = Name.create('nombre', name || '');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Nombre inválido';
    await addToastToQueue(msg, 'error', PATH);
    revalidatePath(PATH);
    redirect(PATH);
  }

  const c = getContainer();
  try {
    c.updateTag.execute({ id, name: nameVO.value });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al editar la etiqueta';
    await addToastToQueue(msg, 'error', PATH);
    revalidatePath(PATH);
    redirect(PATH);
  }

  await addToastToQueue('Etiqueta editada correctamente.', 'success', PATH);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteTag(formData: FormData) {
  const id = formData.get('id') as string;

  const c = getContainer();
  try {
    const result = c.deleteTag.execute(id);
    await addToastToQueue(
      `Etiqueta eliminada. Afectó a ${result.recipesAffected} recetas y ${result.planningsAffected} planificaciones.`,
      'success',
      PATH,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar la etiqueta';
    await addToastToQueue(msg, 'error', PATH);
  }

  revalidatePath(PATH);
  redirect(PATH);
}

export async function getDeleteImpact(tagId: string, userId: string) {
  const c = getContainer();

  const recipes = c.listRecipes.execute(userId);
  const recipesWithTag = recipes
    .filter((r) => r.tags.some((t) => t.id === tagId))
    .map((r) => r.name);

  const plannings = c.listPlannings.execute(userId);
  let planningsAffected = 0;
  for (const planning of plannings) {
    for (const day of planning.getDays()) {
      const dto = day.toDTO();
      for (const [momentTagId, service] of Object.entries(dto.services)) {
        if (service === null) continue;
        if (
          momentTagId === tagId ||
          service.getExclusions().includes(tagId) ||
          service.getPreferences().includes(tagId)
        ) {
          planningsAffected++;
          break;
        }
      }
    }
  }

  return { recipesAffected: recipesWithTag, planningsAffected };
}
