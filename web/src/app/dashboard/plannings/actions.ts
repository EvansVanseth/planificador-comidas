'use server';

import { getContainer } from '@/domain-container';
import { getUserId } from '@/lib/auth';
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
  await c.createPlanning.execute(userId, displayName, startDate, weeks, balance);

  await addToastToQueue('Planificación creada correctamente.');
  revalidatePath(PATH);
  redirect(PATH);
}

export async function duplicatePlanning(formData: FormData) {
  const id = formData.get('id') as string;
  const userId = formData.get('userId') as string;

  const c = getContainer();
  await c.duplicatePlanning.execute(id, userId);

  await addToastToQueue('Planificación duplicada correctamente.');
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePlanning(formData: FormData) {
  const id = formData.get('id') as string;

  const c = getContainer();
  await c.deletePlanning.execute(id);

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
    await c.updatePlanning.execute({
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
    await c.bulkCreateDays.execute({ planningId, orders: missing });
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
    await c.addDayToPlanning.execute(planningId, dayOrder);
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
    await c.removeDayFromPlanning.execute(planningId, dayOrder);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar el día';
    await addToastToQueue(msg, 'error');
  }

  await addToastToQueue(`Día ${dayOrder} eliminado.`);
  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function clearAllRecipes(formData: FormData) {
  const planningId = formData.get('planningId') as string;

  const c = getContainer();
  try {
    const count = await c.clearAllRecipes.execute(planningId);
    await addToastToQueue(`Recetas eliminadas de ${count} servicio${count !== 1 ? 's' : ''}.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al limpiar las recetas';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function bulkAddMissingService(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const momentTagId = formData.get('momentTagId') as string;
  const covers = parseInt(formData.get('covers') as string, 10) || 1;
  const exclusionsRaw = formData.get('exclusions') as string | null;
  const preferencesRaw = formData.get('preferences') as string | null;
  const exclusions: string[] | undefined = exclusionsRaw ? JSON.parse(exclusionsRaw) : undefined;
  const preferences: string[] | undefined = preferencesRaw ? JSON.parse(preferencesRaw) : undefined;

  const c = getContainer();
  try {
    const count = await c.bulkAddMissingService.execute({ planningId, momentTagId, covers, exclusions, preferences });
    await addToastToQueue(`Servicio añadido a ${count} día${count !== 1 ? 's' : ''}.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al añadir servicio';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function autoSchedule(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const userId = await getUserId();

  const c = getContainer();
  try {
    const result = await c.autoSchedule.execute({ planningId, userId });
    const total = result.assignments.length + result.unassigned.length;
    const done = result.assignments.length;
    await addToastToQueue(`Autoplanificado: ${done} servicio${done !== 1 ? 's' : ''} asignado${done !== 1 ? 's' : ''} de ${total}.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al autoplanificar';
    await addToastToQueue(msg, 'error');
  }

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
  const ignoreRestrictions = formData.get('ignoreRestrictions') === 'true';
  const exclusionsRaw = formData.get('exclusions') as string | null;
  const preferencesRaw = formData.get('preferences') as string | null;
  const exclusions: string[] | undefined = exclusionsRaw ? JSON.parse(exclusionsRaw) : undefined;
  const preferences: string[] | undefined = preferencesRaw ? JSON.parse(preferencesRaw) : undefined;

  const c = getContainer();
  try {
    await c.assignMeal.execute(planningId, orderDay, momentTagId, recipeId || null, covers, ignoreRestrictions, exclusions, preferences);
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

export async function removeMeal(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const orderDay = parseInt(formData.get('dayOrder') as string, 10);
  const momentTagId = formData.get('momentTagId') as string;

  const c = getContainer();
  try {
    await c.removeMealFromDay.execute(planningId, orderDay, momentTagId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar el servicio';
    await addToastToQueue(msg, 'error');
  }

  await addToastToQueue('Servicio eliminado.');
  const editPath = `/dashboard/plannings/${planningId}/edit`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function addPantryItem(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const ingredientId = formData.get('ingredientId') as string;
  const ingredientName = formData.get('ingredientName') as string;

  const c = getContainer();
  try {
    await c.addPantryItem.execute(planningId, ingredientId);
    await addToastToQueue(`${ingredientName} añadido a la despensa.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al añadir a la despensa';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit?tab=pantry`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function removePantryItem(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const ingredientId = formData.get('ingredientId') as string;
  const ingredientName = formData.get('ingredientName') as string;

  const c = getContainer();
  try {
    await c.removePantryItem.execute(planningId, ingredientId);
    await addToastToQueue(`${ingredientName} eliminado de la despensa.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar de la despensa';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit?tab=pantry`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function updatePantryItemCovers(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const ingredientId = formData.get('ingredientId') as string;
  const ingredientName = formData.get('ingredientName') as string;
  const covers = parseInt(formData.get('covers') as string, 10);

  const c = getContainer();
  try {
    await c.updatePantryItemCovers.execute(planningId, ingredientId, covers);
    if (covers > 0) {
      await addToastToQueue(`${ingredientName}: ${covers} comensal${covers !== 1 ? 'es' : ''} cubierto${covers !== 1 ? 's' : ''}.`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al actualizar';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit?tab=pantry`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function markPantryItemAvailable(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const ingredientId = formData.get('ingredientId') as string;
  const ingredientName = formData.get('ingredientName') as string;

  const c = getContainer();
  try {
    await c.markPantryItemAvailable.execute(planningId, ingredientId);
    await addToastToQueue(`${ingredientName}: tienes de todo.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al marcar disponible';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit?tab=pantry`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function addShoppingItem(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const ingredientId = formData.get('ingredientId') as string;
  const ingredientName = formData.get('ingredientName') as string;

  const c = getContainer();
  try {
    await c.addShoppingItem.execute(planningId, ingredientId);
    await addToastToQueue(`${ingredientName} añadido a la lista de la compra.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al añadir';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit?tab=shopping`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function removeShoppingItem(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const ingredientId = formData.get('ingredientId') as string;
  const ingredientName = formData.get('ingredientName') as string;

  const c = getContainer();
  try {
    await c.removeShoppingItem.execute(planningId, ingredientId);
    await addToastToQueue(`${ingredientName} eliminado de la lista de la compra.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit?tab=shopping`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function toggleShoppingItem(formData: FormData) {
  const planningId = formData.get('planningId') as string;
  const ingredientId = formData.get('ingredientId') as string;
  const ingredientName = formData.get('ingredientName') as string;
  const completed = formData.get('completed') === 'true';

  const c = getContainer();
  try {
    await c.toggleShoppingItem.execute(planningId, ingredientId, completed);
    await addToastToQueue(completed ? `${ingredientName} marcado como comprado.` : `${ingredientName} marcado como pendiente.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al actualizar';
    await addToastToQueue(msg, 'error');
  }

  const editPath = `/dashboard/plannings/${planningId}/edit?tab=shopping`;
  revalidatePath(editPath);
  redirect(editPath);
}

export async function getDeleteImpact(tagId: string, userId: string) {
  const c = getContainer();

  const recipes = await c.listRecipes.execute(userId);
  const recipesWithTag = recipes
    .filter((r) => r.tags.some((t) => t.id === tagId))
    .map((r) => r.name);

  const plannings = await c.listPlannings.execute(userId);
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
