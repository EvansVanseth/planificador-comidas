---
name: web-ui
description: "Trigger: toast, notificación, notificar, toast queue, error banner. Patterns for Next.js 14 web UI: toast notifications via cookie queue, server actions, modals, navigation."
license: Apache-2.0
metadata:
  author: "planificador-comidas"
  version: "1.4"
---

## Activation Contract

Apply these patterns when:
- Creating or modifying server actions that need to show success/error feedback
- Building modals, navigation, or page layouts
- Working with ingredient, tag, recipe, or planning pages

## Hard Rules

### Toast notification system (v2 — cookie queue)

- **Shared utility**: `import { addToastToQueue } from '@/lib/toast-utils'`
  - Signature: `addToastToQueue(message: string, type: 'success' | 'error' = 'success')`
  - Writes a `toast_queue` cookie with JSON array of `{message, type}` objects
  - Always uses `path=/dashboard` — the layout reads from `/dashboard/*`
- **Rendering**: `<ToastQueue messages={toasts} />` is already in `dashboard/layout.tsx` — do NOT add it per-page
- **ToastNotification** (`components/toast.tsx`): accepts `type: 'success' | 'error'`, auto-dismisses after 4s, `bg-[#009966]` (success) or `bg-[#DC2626]` (error)
- **Messages must be unique per operation** — include entity names so each message string is distinct:
  - Create: `` `Ingrediente '${name}' creado correctamente.` ``
  - Rename: `` `Modificado '${previousName}' a '${newName}' correctamente.` ``
  - Delete: `` `Etiqueta '${name}' eliminada. Afectó a X recetas...` ``
  - Error: include specific reason (e.g. `'Ya existe un ingrediente con ese nombre'`)
- **For rename actions**: add hidden `<input name="previousName" value={name} />` to the form so the server action can build the message with the old name
- **Replacing `?error=`**: instead of `redirect('/page?error=...')`, use:
  ```ts
  await addToastToQueue('mensaje de error', 'error');
  revalidatePath(path);
  redirect(path);
  ```
- **Error handling in UI**: catch `AppError`/`DomainError` in try/catch and convert to toast errors. Do NOT rely on URL query params.

### Confirmation modals for destructive actions (delete/remove)

- **Pattern**: `useState` boolean/null for the target entity, not `window.confirm()`
  - `const [removeConfirmDay, setRemoveConfirmDay] = useState<number | null>(null)`
  - Trigger button sets state (e.g. `onClick={() => setRemoveConfirmDay(order)}`)
  - Modal renders when state is non-null, with "Cancelar" (clears state) and "Eliminar" (submits server action form)
- **Structure**: overlay (`bg-black/40`) + white card (`max-w-md rounded-xl bg-white p-6 shadow-2xl`)
  - Click on overlay closes modal: `onClick={() => setRemoveConfirmDay(null)}`
  - "Cancelar" button: `type="button"`, same `onClick`
  - "Eliminar" button: inside a `<form action={serverAction}>` with hidden inputs, `type="submit"`, `bg-[#DC2626]`
- **Reference**: `tag-row.tsx` (delete modal with impact preview), `planning-grid.tsx` (remove day modal)

## Execution Steps

1. Import `addToastToQueue` from `@/lib/toast-utils` in the server action
2. Define a `PATH` constant at the top of the file for `revalidatePath` + `redirect`
3. Include entity name in every toast message (it must be unique per operation)
4. For rename actions: read `formData.get('previousName')` and use it in the message
5. Call `addToastToQueue` before `revalidatePath` + `redirect`
6. The layout already handles rendering — no changes needed to `page.tsx`

## References

- `web/src/lib/toast-utils.ts` — shared utility
- `web/src/components/toast.tsx` — single toast component
- `web/src/components/toast-queue.tsx` — queue consumer with auto-clear
- `web/src/app/dashboard/layout.tsx` — layout with ToastQueue integration
- `web/src/app/dashboard/ingredients/actions.ts` — reference: create with name, rename with previousName
- `web/src/app/dashboard/tags/actions.ts` — reference: tag CRUD with unique messages
- `web/src/app/dashboard/ingredients/ingredient-row.tsx` — rename form with hidden previousName
- `web/src/app/dashboard/tags/tag-row.tsx` — rename form with hidden previousName, delete with hidden tagName
