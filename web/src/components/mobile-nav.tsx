'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GridIcon, RecipeIcon, CalendarIcon, CatalogIcon, FilterIcon, SettingsIcon } from '@/components/icons';

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

      <Link
        href="/dashboard/settings"
        className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium text-[#45556C] transition-colors hover:text-[#007A55]"
      >
        <SettingsIcon />
        <span>Cuenta</span>
      </Link>
    </nav>
  );
}
