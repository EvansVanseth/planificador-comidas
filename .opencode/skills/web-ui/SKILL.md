---
name: web-ui
description: "Web UI conventions for the Planificador de Comidas Next.js app: server/client components, server actions, layout patterns, icons, routing, and dashboard structure."
disable-model-invocation: false
user-invocable: true
license: MIT
metadata:
  author: planificador-de-comidas
  version: "1.1"
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
- Éxito se pasa como `?toast=mensaje` (incluye datos del resultado vía params extra como `&rp=X&pp=Y`)
- La página renderiza toast condicionalmente: `{toastMessage && <ToastNotification message={toastMessage} />}`
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
| `PencilIcon` | Editar / renombrar (16x16) |
| `TrashIcon` | Eliminar (16x16) |
| `CloseIcon` | Cerrar toast / modal (16x16) |

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
  searchParams: { q?: string; error?: string; toast?: string; rp?: string; pp?: string; similar?: string; name?: string };
}) {
  // 1. Fetch data
  const items = c.listSomething.execute(userId);
  const query = searchParams.q?.toLowerCase().trim() ?? '';
  const filtered = query
    ? items.filter(i => i.name.toLowerCase().includes(query))
    : items;

  // Messages from server actions
  const toastMessage = searchParams.toast === 'created' ? 'Creado correctamente.'
    : searchParams.toast === 'deleted' ? `Eliminado. Afectó a ${searchParams.rp ?? 0} recetas...`
    : null;
  const similarNames = searchParams.similar?.split(',').map(s => s.trim()) ?? [];

  return (
    <>
      {/* 0. Toast + modals */}
      {toastMessage && <ToastNotification message={toastMessage} />}
      {similarNames.length > 0 && searchParams.name && (
        <SimilarNameWarning similarNames={similarNames} proposedName={searchParams.name} userId={userId} />
      )}

      {/* 1. Header + create form */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172B]">Título</h1>
        <form action={createAction}>...</form>
      </div>

      {/* 2. Error banner */}
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
    toast.tsx           — Toast notification
    confirm-modal.tsx   — Modal de confirmación genérico
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
        page.tsx              — Listado de ingredientes
        actions.ts            — CRUD ingredientes
        ingredient-row.tsx    — Fila con inline edit + delete modal
        similar-name-modal.tsx — Modal warning por nombres similares
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

## Toast notifications

`web/src/components/toast.tsx` — notificación flotante en esquina inferior derecha:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '@/components/icons';

export default function ToastNotification({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  function dismiss() {
    setVisible(false);
    setTimeout(() => router.replace(window.location.pathname), 300);
  }

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      <div className="flex items-center gap-3 rounded-xl bg-[#009966] px-5 py-3.5 text-white shadow-lg">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={dismiss} className="shrink-0 rounded-md p-0.5 transition-colors hover:bg-white/20">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
```

Reglas:
- Siempre se usa `router.replace(window.location.pathname)` al descartar para limpiar searchParams
- Auto-dismiss a los 4 segundos
- Apparece con fade+slide-up (`translate-y-0 opacity-100`)

---

## Confirmation modal

`web/src/components/confirm-modal.tsx` — modal genérico reutilizable:

```tsx
'use client';

export function ConfirmModal({ title, children, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) { ... }
```

Propiedades:
- `children`: contenido del cuerpo del modal
- `danger`: true pinta el botón de confirmar en rojo
- Escape cierra el modal vía `onCancel`
- Backdrop click también cierra

---

## Patrón de eliminación con modal + preview de impacto

La eliminación nunca es inmediata. Siempre muestra un modal con:

1. Advertencia: "Esta acción es irreversible"
2. Preview del impacto (recetas/planificaciones afectadas) calculado vía `getDeleteImpact()` (server action)
3. Botones Cancelar / Eliminar

Flujo:
```tsx
// Client component
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteImpact, setDeleteImpact] = useState<{recipesAffected: number; planningsAffected: number} | null>(null);
const deleteFormRef = useRef<HTMLFormElement>(null);

// Fetch impact when modal opens
useEffect(() => {
  if (showDeleteModal && !deleteImpact) {
    getDeleteImpact(id, userId).then(setDeleteImpact);
  }
}, [showDeleteModal]);

// Hidden form submits the real delete action
<form ref={deleteFormRef} action={deleteIngredient} aria-hidden="true">
  <input type="hidden" name="id" value={id} />
</form>

// Modal confirm triggers form submit
<ConfirmModal
  title="Eliminar X"
  confirmLabel="Eliminar"
  danger
  onConfirm={() => deleteFormRef.current?.requestSubmit()}
  onCancel={() => setShowDeleteModal(false)}
>
  <p className="mb-4">Esta acción es irreversible...</p>
  {deleteImpact && (
    <p>Recetas afectadas: <strong>{deleteImpact.recipesAffected}</strong></p>
    <p>Planificaciones afectadas: <strong>{deleteImpact.planningsAffected}</strong></p>
  )}
</ConfirmModal>
```

La server action `getDeleteImpact` calcula el impacto SIN modificar datos:
```tsx
export async function getDeleteImpact(ingredientId: string, userId: string) {
  const c = getContainer();
  const recipes = c.listRecipes.execute(userId);
  const recipesAffected = recipes.filter(r =>
    r.ingredients.some(i => i.ingredientId === ingredientId)
  ).length;
  const plannings = c.listPlannings.execute(userId);
  const planningsAffected = plannings.filter(p => {
    const primitives = p.toPrimitives();
    return primitives.pantryItems.some(i => i.ingredientId === ingredientId) ||
           primitives.shoppingItems.some(i => i.ingredientId === ingredientId);
  }).length;
  return { recipesAffected, planningsAffected };
}
```

---

## Creación con detección de nombres similares

Antes de crear un elemento, se verifica si existen otros con nombres similares (substring match case-insensitive). Si se encuentran, se muestra un modal de advertencia:

```tsx
// actions.ts — createIngredient
const existing = c.listIngredients.execute(userId);
const similar = existing.filter(i => isSimilar(trimmed, i.name));
if (similar.length > 0) {
  redirect(`/path?similar=${encodeURIComponent(names)}&name=${encodeURIComponent(trimmed)}`);
}

// page.tsx — renderiza SimilarNameWarning condicionalmente
{similarNames.length > 0 && searchParams.name && (
  <SimilarNameWarning similarNames={similarNames} proposedName={searchParams.name} userId={userId} />
)}
```

`isSimilar` compara case-insensitive: un nombre contiene al otro → es similar. Excluye match exacto (ya manejado como error de duplicado).

`SimilarNameWarning` es un client component con:
- Lista de nombres similares
- Botón "Cancelar" (cierra modal)
- Form submit a `forceCreateIngredient` (server action que crea sin verificar similitud)

---

## File structure

Actualizada:

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
