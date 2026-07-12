---
name: web-ui
description: "Web UI conventions for the Planificador de Comidas Next.js app: server/client components, server actions, layout patterns, icons, routing, and dashboard structure."
disable-model-invocation: false
user-invocable: true
license: MIT
metadata:
  author: planificador-de-comidas
  version: "1.0"
---

# Web UI Skill — Planificador de Comidas

Patrones y convenciones para la interfaz web del proyecto (Next.js 14, App Router, Tailwind CSS).

---

## Page types

### Server component (default)

Toda página es server component por defecto. Solo se usa `'use client'` cuando se necesita interactividad (useState, useEffect, usePathname, event handlers, etc.).

```tsx
// app/dashboard/ingredients/page.tsx — server component
import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';

export default async function IngredientsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';
  const c = getContainer();
  const ingredients = c.listIngredients.execute(userId);
  // render JSX
}
```

### Client component (when needed)

```tsx
'use client';

import { usePathname } from 'next/navigation';
```

---

## Data fetching

- `cookies()` se usa directamente en server components (no via `next/headers` en actions)
- `getContainer()` devuelve el singleton con todos los use cases
- Los use cases devuelven `*Primitives[]` — se iteran directamente en JSX
- `searchParams` prop para filtros vía query string (`?q=...`)

---

## Mutations (server actions)

Cada sección tiene su propio `actions.ts` colocado junto al `page.tsx`:

```
dashboard/ingredients/
  page.tsx
  actions.ts
```

Patrón:

```tsx
'use server';

import { getContainer } from '@/domain-container';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSomething(formData: FormData) {
  const c = getContainer();
  try {
    c.createSomething.execute(...);
  } catch {
    redirect('/path?error=mensaje');
  }
  revalidatePath('/path');
  redirect('/path');
}
```

Reglas:
- `revalidatePath()` antes de `redirect()` para que la página destino vea los datos nuevos
- Errores de dominio/validación se pasan como query param `?error=`
- El componente renderiza el error condicionalmente: `{searchParams.error && <div>...}`
- No se usan `useActionState` ni manejo de estado en cliente para operaciones CRUD simples

---

## Layout and auth

`app/dashboard/layout.tsx` es el layout protegido:

```tsx
export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/login');

  const c = getContainer();
  const user = c.listUsers.execute().find(u => u.id === userId);
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#F8FAFC]">
        <div className="mx-auto max-w-[911px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
```

Reglas:
- Layout se encarga del auth check y redirect
- Pages hijas no necesitan repetir el auth check, pero igual leen `userId` de cookies para data fetching (safe porque layout ya redirigió)
- `userId` tipado como `cookie?.value ?? ''` (ESLint no permite non-null assertions en optional chains)

---

## Sidebar

`app/dashboard/sidebar.tsx` es un client component:

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from './actions';
import { GridIcon, RecipeIcon, CalendarIcon, CatalogIcon, LogoutIcon, LogoIcon } from '@/components/icons';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel', icon: GridIcon },
  { href: '/dashboard/ingredients', label: 'Ingredientes', icon: CatalogIcon },
  { href: '/dashboard/tags', label: 'Etiquetas', icon: CatalogIcon },
  { href: '/dashboard/recipes', label: 'Recetas', icon: RecipeIcon },
  { href: '/dashboard/plannings', label: 'Planificador', icon: CalendarIcon },
];
```

- Active detection via `usePathname()` — coincide exacto o subruta
- `Link` de next/navigation para SPA navigation
- Server action `logout` importada directamente en client component

---

## Icons

Todos los iconos están centralizados en `web/src/components/icons.tsx`:

| Componente | Uso |
|---|---|
| `LogoIcon` | Logo marca (tenedor+cuchillo), acepta prop `size` |
| `GridIcon` | Nav: Panel |
| `RecipeIcon` | Nav: Recetas |
| `CalendarIcon` | Nav: Planificador (20x20) |
| `CalendarSmallIcon` | Indicador pequeño (14x14) |
| `CalendarFilledIcon` | Landing page (18x18, verde) |
| `CatalogIcon` | Nav: Catálogo / Ingredientes / Etiquetas |
| `LogoutIcon` | Botón cerrar sesión |
| `CheckIcon` | Checkmark landing page |
| `CartIcon` | Carrito landing page |
| `PlusIcon` | Botón crear/nuevo (16x16) |

Import desde `@/components/icons`:

```tsx
import { LogoIcon, PlusIcon } from '@/components/icons';
```

---

## Page structure conventions

### Listado con búsqueda

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; error?: string };
}) {
  // 1. Fetch data
  const items = c.listSomething.execute(userId);
  const query = searchParams.q?.toLowerCase().trim() ?? '';
  const filtered = query
    ? items.filter(i => i.name.toLowerCase().includes(query))
    : items;

  return (
    <>
      {/* 2. Header + create form */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172B]">Título</h1>
        <form action={createAction}>...</form>
      </div>

      {/* 3. Error banner */}
      {searchParams.error && <div className="...">{searchParams.error}</div>}

      {/* 4. Search input */}
      <form className="mb-6">
        <input name="q" defaultValue={query} placeholder="Buscar..." />
      </form>

      {/* 5. Empty state or list */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {filtered.map(item => (
            <Row key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
```

### Empty state

```tsx
<div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
  <p className="text-sm text-[#62748E]">
    Mensaje contextual según si hay filtro activo o no.
  </p>
</div>
```

---

## File structure

```
web/src/
  components/
    icons.tsx           — Todos los SVG iconos
  app/
    layout.tsx          — Root layout (html, body, fonts)
    page.tsx            — Landing page (pública)
    login/
      page.tsx          — Login (client component, pública)
      actions.ts        — Server action de login
    dashboard/
      layout.tsx        — Layout protegido (auth + sidebar)
      sidebar.tsx       — Sidebar (client component)
      page.tsx          — Dashboard principal
      actions.ts        — Logout action
      helpers.ts        — Funciones auxiliares (fechas)
      ingredients/
        page.tsx        — Listado de ingredientes
        actions.ts      — CRUD ingredientes
      tags/             — (futuro)
      recipes/          — (futuro)
      plannings/        — (futuro)
```

---

## Design tokens (Tailwind)

```txt
--color-primary:     #009966 / #008055 (hover)
--color-bg:          #F8FAFC
--color-text:        #0F172B
--color-text-muted:  #45556C / #62748E
--color-border:      #E2E8F0 / gray-200
--color-card:        white
--color-nav-active:  #ECFDF5 bg / #007A55 text
--color-error:       red-50 bg / red-200 border / red-600 text

--border-radius:     rounded-lg (8px) / rounded-[10px] / rounded-xl (12px)
--max-width-main:    911px
--shadow:            [0_1px_2px_rgba(0,0,0,0.05)]
```

---

## Error handling

- Server actions: try/catch + `redirect('/path?error=mensaje')`
- Errores de validación del dominio (`AppError`, `DomainError`) se capturan en la action
- La página renderiza el error via `searchParams.error`
- Errores inesperados (500) se dejan propagar (Next.js error boundary)
- No se usa `useActionState` para errores simples; para forms complejos sí

---

## Routing

| Route | Page | Auth |
|---|---|---|
| `/` | Landing | No |
| `/login` | Login | No |
| `/dashboard` | Dashboard | Sí |
| `/dashboard/ingredients` | Ingredientes | Sí |
| `/dashboard/tags` | Etiquetas | Sí |
| `/dashboard/recipes` | Recetas | Sí |
| `/dashboard/recipes/[id]/edit` | Editar receta | Sí |
| `/dashboard/plannings` | Planificaciones | Sí |
| `/dashboard/plannings/[id]/edit` | Editor semanal | Sí |
