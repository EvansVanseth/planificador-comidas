export function LogoIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#009B65"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5v5a3 3 0 0 0 6 0V5" />
      <path d="M8 5v15" />
      <path d="M19 20V5c-3.5 0-4.5 1.5-4.5 4.5s1 4.5 4.5 4.5" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="6" height="6" rx="1" />
      <rect x="12" y="2" width="6" height="6" rx="1" />
      <rect x="2" y="12" width="6" height="6" rx="1" />
      <rect x="12" y="12" width="6" height="6" rx="1" />
    </svg>
  );
}

export function RecipeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 3h8a2 2 0 012 2v12a2 2 0 01-2 2H4V3z" />
      <path d="M14 7h2a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
      <path d="M7 7h2" />
      <path d="M7 10h2" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="16" height="15" rx="2" />
      <path d="M2 8h16" />
      <path d="M6 1v4" />
      <path d="M14 1v4" />
    </svg>
  );
}

export function CalendarSmallIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="1" y="2.5" width="12" height="10" rx="1.5" />
      <path d="M1 5.5h12" />
      <path d="M4 1v3" />
      <path d="M10 1v3" />
    </svg>
  );
}

export function CalendarFilledIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <rect x="1.5" y="3" width="15" height="13.5" rx="2" stroke="#009966" strokeWidth="1.5" />
      <path d="M1.5 7.5H16.5" stroke="#009966" strokeWidth="1.5" />
      <path d="M5.25 1.5V4.5" stroke="#009966" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.75 1.5V4.5" stroke="#009966" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.25 10.5H7.5V12.75H5.25V10.5Z" fill="#009966" />
      <path d="M10.5 10.5H12.75V12.75H10.5V10.5Z" fill="#009966" />
    </svg>
  );
}

export function CatalogIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4h6l2 2h8v10H2V4z" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17h8a2 2 0 002-2V5a2 2 0 00-2-2H7" />
      <path d="M10 10H2" />
      <path d="M5 7l-3 3 3 3" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0"
    >
      <circle cx="10" cy="10" r="10" fill="#009966" />
      <path
        d="M6 10.5L8.5 13L14 7.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M1.5 2.25H3.75L5.25 11.25H14.25L16.5 4.5H4.5"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="15" r="1.5" fill="#F59E0B" />
      <circle cx="13.5" cy="15" r="1.5" fill="#F59E0B" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M8 3v10" />
      <path d="M3 8h10" />
    </svg>
  );
}
