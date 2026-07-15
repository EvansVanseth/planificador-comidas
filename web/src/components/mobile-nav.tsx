'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GridIcon, RecipeIcon, CalendarIcon, CatalogIcon, FilterIcon } from '@/components/icons';
import { logout } from '@/app/dashboard/actions';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel', icon: GridIcon },
  { href: '/dashboard/ingredients', label: 'Ingredientes', icon: CatalogIcon },
  { href: '/dashboard/tags', label: 'Etiquetas', icon: FilterIcon },
  { href: '/dashboard/recipes', label: 'Recetas', icon: RecipeIcon },
  { href: '/dashboard/plannings', label: 'Planificar', icon: CalendarIcon },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white md:hidden">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? 'text-[#007A55]'
                : 'text-[#45556C]'
            }`}
          >
            <item.icon />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <form action={logout}>
        <button
          type="submit"
          className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium text-[#45556C] transition-colors hover:text-[#007A55]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="2" />
            <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6 4.2 4.2" />
          </svg>
          <span>Cuenta</span>
        </button>
      </form>
    </nav>
  );
}
