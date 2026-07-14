'use server';

import { getContainer } from '@/domain-container';
import { addToastToQueue } from '@/lib/toast-utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const PATH = '/dashboard/plannings';

export async function createPlanning(formData: FormData) {
  const userId = formData.get('userId') as string;
  const name = (formData.get('name') as string) || null;
  const weeks = parseInt(formData.get('weeks') as string, 10) || 2;
  const balance = parseInt(formData.get('hotColdBalance') as string, 10) || 50;
  const startDateRaw = formData.get('startDate') as string | null;

  let startDate: Date | null = null;
  if (startDateRaw) {
    startDate = new Date(startDateRaw + 'T00:00:00');
  }

  const c = getContainer();
  const displayName = name?.trim() || `Planificación ${weeks} semanas`;
  c.createPlanning.execute(userId, displayName, startDate, weeks, balance);

  await addToastToQueue('Planificación creada correctamente.');
  revalidatePath(PATH);
  redirect(PATH);
}

export async function duplicatePlanning(formData: FormData) {
  const id = formData.get('id') as string;
  const userId = formData.get('userId') as string;

  const c = getContainer();
  c.duplicatePlanning.execute(id, userId);

  await addToastToQueue('Planificación duplicada correctamente.');
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePlanning(formData: FormData) {
  const id = formData.get('id') as string;

  const c = getContainer();
  c.deletePlanning.execute(id);

  await addToastToQueue('Planificación eliminada correctamente.');
  revalidatePath(PATH);
  redirect(PATH);
}

export async function updatePlanning(formData: FormData) {
  const id = formData.get('id') as string;
  const name = (formData.get('name') as string) || undefined;
  const weeksRaw = formData.get('weeks') as string;
  const startDateRaw = formData.get('startDate') as string | null;
  const balanceRaw = formData.get('hotColdBalance') as string;

  const c = getContainer();
  try {
    c.updatePlanning.execute({
      id,
      name: name || undefined,
      weeks: weeksRaw ? parseInt(weeksRaw, 10) : undefined,
      startDate: startDateRaw ? new Date(startDateRaw + 'T00:00:00') : null,
      hotColdBalance: balanceRaw ? parseInt(balanceRaw, 10) : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al actualizar la planificación';
    await addToastToQueue(msg, 'error');
    const editPath = `/dashboard/plannings/${id}/edit`;
    revalidatePath(editPath);
    redirect(editPath);
  }

  await addToastToQueue('Planificación actualizada correctamente.');
  const editPath = `/dashboard/plannings/${id}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function addAllDays(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const weeks = parseInt(formData.get('weeks') as string, 10);
  const existingRaw = formData.get('existingDays') as string;
  const existingOrders = new Set(existingRaw ? existingRaw.split(',').map(Number) : []);
  const totalDays = weeks * 7;

  const missing: number[] = [];
  for (let o = 1; o <= totalDays; o++) {
    if (!existingOrders.has(o)) missing.push(o);
  }

  if (missing.length === 0) {
    await addToastToQueue('Todos los días ya están creados.', 'error');
    const editPath = `/dashboard/plannings/${planningId}/edit`;
    revalidatePath(editPath);
    redirect(editPath);
  }

  const c = getContainer();
  try {
    c.bulkCreateDays.execute({ planningId, orders: missing });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al añadir días';
    await addToastToQueue(msg, 'error');
  }

  await addToastToQueue(`${missing.length} día(s) añadido(s).`);
  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function addDay(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const dayOrder = parseInt(formData.get('dayOrder') as string, 10);

  const c = getContainer();
  try {
    c.addDayToPlanning.execute(planningId, dayOrder);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al añadir el día';
    await addToastToQueue(msg, 'error');
  }

  await addToastToQueue(`Día ${dayOrder} añadido.`);
  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function removeDay(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const dayOrder = parseInt(formData.get('dayOrder') as string, 10);

  const c = getContainer();
  try {
    c.removeDayFromPlanning.execute(planningId, dayOrder);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar el día';
    await addToastToQueue(msg, 'error');
  }

  await addToastToQueue(`Día ${dayOrder} eliminado.`);
  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function assignMeal(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const orderDay = parseInt(formData.get('dayOrder') as string, 10);
  const momentTagId = formData.get('momentTagId') as string;
  const recipeId = formData.get('recipeId') as string;
  const covers = parseInt(formData.get('covers') as string, 10) || 1;

  const c = getContainer();
  try {
    c.assignMeal.execute(planningId, orderDay, momentTagId, recipeId, covers);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al asignar la receta';
    await addToastToQueue(msg, 'error');
    const editPath = `/dashboard/plannings/${planningId}/edit`;
    revalidatePath(editPath);
    redirect(editPath);
  }

  await addToastToQueue('Servicio actualizado correctamente.');
  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
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
