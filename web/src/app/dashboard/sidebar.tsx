'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from './actions';
import {
  GridIcon,
  RecipeIcon,
  CalendarIcon,
  CatalogIcon,
  LogoutIcon,
} from './icons';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel', icon: GridIcon },
  { href: '/dashboard/ingredients', label: 'Ingredientes', icon: CatalogIcon },
  { href: '/dashboard/tags', label: 'Etiquetas', icon: CatalogIcon },
  { href: '/dashboard/recipes', label: 'Recetas', icon: RecipeIcon },
  { href: '/dashboard/plannings', label: 'Planificador', icon: CalendarIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 px-6">
        <svg
          width="24"
          height="24"
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
        <span className="text-xl font-bold text-[#0a0a0a]">PlanComidas</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + '/') ||
            (item.href === '/dashboard' && pathname === '/dashboard');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#ECFDF5] text-[#007A55]'
                  : 'text-[#45556C] hover:bg-gray-50'
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 px-4 py-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#62748E] transition-colors hover:bg-gray-50"
          >
            <LogoutIcon />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
