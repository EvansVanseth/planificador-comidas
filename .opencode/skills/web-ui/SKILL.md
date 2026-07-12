---
name: web-ui
description: "Trigger: toast, notificación, notificar, toast queue, error banner. Patterns for Next.js 14 web UI: toast notifications via cookie queue, server actions, modals, navigation."
license: Apache-2.0
metadata:
  author: "planificador-comidas"
  version: "1.2"
---

## Activation Contract

Apply these patterns when:
- Creating or modifying server actions that need to show success/error feedback
- Building modals, navigation, or page layouts
- Working with ingredient, tag, recipe, or planning pages

## Hard Rules

### Toast notification system (v2 — cookie queue)

- **Shared utility**: `import { addToastToQueue } from '@/lib/toast-utils'`
  - Signature: `addToastToQueue(message: string, type: 'success' | 'error' = 'success', path: string = '/dashboard')`
  - Writes a `toast_queue` cookie with JSON array of `{message, type}` objects
  - `path` scopes the cookie — use the page path (e.g. `/dashboard/ingredients`) for scoped toasts, or `/dashboard` for global ones
- **Rendering**: `<ToastQueue messages={toasts} path="/dashboard" />` is already in `dashboard/layout.tsx` — do NOT add it per-page
- **Replacing `?error=`**: instead of `redirect('/page?error=...')`, use:
  ```ts
  await addToastToQueue('mensaje de error', 'error', path);
  revalidatePath(path);
  redirect(path);
  ```
- **ToastNotification** (`components/toast.tsx`): accepts `type: 'success' | 'error'`, auto-dismisses after 4s, uses `bg-[#009966]` (success) or `bg-[#DC2626]` (error)

## Execution Steps

1. Import `addToastToQueue` from `@/lib/toast-utils` in the server action
2. Call it before `revalidatePath` + `redirect`
3. Define a `PATH` constant at the top of the file to reuse across actions
4. The layout already handles rendering — no changes needed to `page.tsx`

## References

- `web/src/lib/toast-utils.ts` — shared utility
- `web/src/components/toast.tsx` — single toast
- `web/src/components/toast-queue.tsx` — queue consumer
- `web/src/app/dashboard/layout.tsx` — layout with ToastQueue
- `web/src/app/dashboard/ingredients/actions.ts` — reference implementation
