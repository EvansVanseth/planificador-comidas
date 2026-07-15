export function getTomorrowDayOrder(
  startDateStr: string | null,
  weeks: number,
): number | null {
  if (!startDateStr) return null;
  const start = new Date(startDateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startNorm = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const tomorrowNorm = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
  );
  const diff = Math.round(
    (tomorrowNorm.getTime() - startNorm.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0 || diff >= weeks * 7) return null;
  return diff + 1;
}

export function getTodayDayOrder(
  startDateStr: string | null,
  weeks: number,
): number | null {
  if (!startDateStr) return null;
  const start = new Date(startDateStr);
  const today = new Date();
  const startNorm = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const todayNorm = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diff = Math.round(
    (todayNorm.getTime() - startNorm.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0 || diff >= weeks * 7) return null;
  return diff + 1;
}

const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function getDayName(offset: number): string {
  return DAY_NAMES[(offset - 1) % 7];
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
