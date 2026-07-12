import { cookies } from 'next/headers';

export type ToastItem = {
  message: string;
  type: 'success' | 'error';
};

export async function addToastToQueue(
  message: string,
  type: ToastItem['type'] = 'success',
) {
  const cookieStore = await cookies();
  let queue: ToastItem[] = [];
  try {
    const existing = cookieStore.get('toast_queue');
    if (existing) queue = JSON.parse(existing.value);
  } catch {}
  queue.push({ message, type });
  cookieStore.set('toast_queue', JSON.stringify(queue), {
    path: '/dashboard',
    maxAge: 10,
  });
}
