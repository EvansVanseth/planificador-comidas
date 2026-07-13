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
