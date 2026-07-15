const TOAST_SEPARATOR = '\x00';

export function toastDisplayText(raw: string): string {
  const idx = raw.indexOf(TOAST_SEPARATOR);
  return idx !== -1 ? raw.slice(idx + 1) : raw;
}
