# CLI — terminal menu patterns

Librería: [`prompts`](https://github.com/terkelg/prompts). Todos los menús en `src/infrastructure/cli/`.

## ON_CANCEL

`prompts` solo dispara `onCancel` con Ctrl+C. **ESC no dispara `onCancel`** y puede dejar el terminal en raw mode, rompiendo prompts posteriores.

```ts
const ON_CANCEL = () => {};
```
Se pasa en cada llamada a `prompts()`. Si el usuario hace Ctrl+C, `prompts` devuelve `undefined`.

## Cancelar explícito (patrón `__cancel__`)

Para evitar el bloqueo por ESC, todo selector `select` que no tenga opción de salida debe incluir un item `(Cancelar)` como primera opción:

```ts
const seleccion = await prompts({
  type: 'select',
  name: 'id',
  message: 'Selecciona...:',
  choices: [
    { title: '(Cancelar)', value: '__cancel__' },
    ...items.map(i => ({ title: i.name, value: i.id })),
  ],
}, { onCancel: ON_CANCEL });

if (!seleccion?.id || seleccion.id === '__cancel__') return;
```

**Regla**: toda función que presente un selector `select` al usuario debe tener un camino de salida explícito (un `'back'` en el loop del menú o un `'(Cancelar)'` en selectores individuales).

## Menu loop

```ts
let continuar = true;
while (continuar) {
  const response = await prompts(
    { type: 'select', name: 'opcion', message: '...', choices: [...] },
    { onCancel: ON_CANCEL }
  );
  if (!response?.opcion) continue;

  switch (response.opcion) {
    case 'list':    await listarXxx(container, userId); break;
    case 'create':  await crearXxx(container, userId); break;
    case 'edit':    await editarXxx(container, userId); break;
    case 'delete':  await eliminarXxx(container, userId); break;
    case 'back':    continuar = false; break;
  }
}
```

- `'back'` setea `continuar = false` para salir.
- Funciones de acción: `async (container: IContainer, userId: string) => void`.

## Signatures de funciones de menú

```ts
export async function menuEtiquetas(container: IContainer, userId: string): Promise<void>
export async function menuIngredientes(container: IContainer, userId: string): Promise<void>
export async function menuRecetas(container: IContainer, userId: string): Promise<void>
export async function menuPlanificaciones(container: IContainer, userId: string): Promise<void>
export async function menuUsuarios(container: IContainer): Promise<void> // sin userId
```

Solo `menuUsuarios` no recibe `userId` — los usuarios son globales.

## Estructura de acciones

| Acción | Código |
|--------|--------|
| **listar** | `const items = container.listXxx.execute(userId)` + `items.forEach(i => console.log(...))` |
| **crear** | `const input = await prompts([...], ON_CANCEL)` → `container.createXxx.execute(input)` |
| **editar** | `const item = selectItem(container, userId)` → `const changes = await prompts([...], ON_CANCEL)` → `container.updateXxx.execute({ id, ...changes })` |
| **eliminar** | `const item = selectItem(container, userId)` → `confirm = await prompts(...)` → `container.deleteXxx.execute(item.id)` |

## Error display

```ts
catch (error) {
  if (error instanceof DomainError || error instanceof AppError) {
    console.log('✗ ' + error.message);
  }
  console.log('\n--- Operacion cancelada ---');
}
```

- `DomainError` y `AppError` muestran ✗ con mensaje.
- Siempre se imprime `'--- Operacion cancelada ---'` después (o `Creacion`, `Edicion` según contexto).

## Editar: desglose en archivos separados

Cuando un menú incluye **editar**, la edición se extrae a un archivo aparte (`xxx-edit.menu.ts`) y se desglosa en un submenú:

```
Menú principal: [Listar] [Crear] [Editar] [Eliminar] [Volver]
                        ↓
                   xxx-edit.menu.ts  →  [Editar datos]
                                         [Editar <lista A>]  ─→  xxx-a.menu.ts
                                         [Editar <lista B>]  ─→  xxx-b.menu.ts
                                         [Volver]
```

Cada `editar <lista>` se extrae a su propio archivo (`xxx-a.menu.ts`, `xxx-b.menu.ts`).

### recipe-edit.menu.ts (orquestador)

```ts
import { gestionarX } from './recipe-x.menu';
import { gestionarY } from './recipe-y.menu';
import { mostrarReceta } from './recipe-display';

export async function editarReceta(container: IContainer, userId: string) {
  // seleccionar receta...

  while (continuar) {
    // refrescar datos + mostrar
    const recipe = container.listRecipes.execute(userId).find(r => r.id === recipeId);
    const allIngredients = container.listIngredients.execute(userId);
    const allTags = container.listTags.execute(userId);
    mostrarReceta(recipe, allIngredients, allTags);

    const opcion = await prompts({
      type: 'select', name: 'value',
      message: 'Editar — ¿Que quieres hacer?',
      choices: [
        { title: 'Editar datos',         value: 'edit-data' },
        { title: 'Editar ingredientes',  value: 'edit-ingredients' },
        { title: 'Editar etiquetas',     value: 'edit-tags' },
        { title: 'Volver',               value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    switch (opcion.value) {
      case 'edit-data':         await editarDatos(container, recipeId); break;
      case 'edit-ingredients':  await gestionarIngredientes(container, userId, recipeId); break;
      case 'edit-tags':         await gestionarEtiquetas(container, userId, recipeId); break;
      case 'back':              continuar = false; break;
    }
  }
}
```

- La función exportada **no recibe** `DIMENSION_LABELS` ni constantes de presentación.
- Antes del menú se refrescan y muestran los datos actuales.
- `'edit-data'` edita campos simples en el mismo archivo como función privada.

### xxx-ingredients.menu.ts / xxx-tags.menu.ts (submenús de listado)

```ts
export async function gestionarXxx(container: IContainer, userId: string, recipeId: string) {
  while (continuar) {
    const opcion = await prompts({
      type: 'select', name: 'value',
      message: 'Gestionar Xxx:',
      choices: [
        { title: 'Agregar existente',  value: 'add-existing' },
        { title: 'Crear y agregar',    value: 'add-new' },
        { title: 'Quitar',            value: 'remove' },
        { title: 'Volver',            value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    switch (opcion.value) {
      case 'add-existing': await agregarExistente(...); break;
      case 'add-new':      await agregarNuevo(...);      break;
      case 'remove':       await quitar(...);             break;
      case 'back':         continuar = false;             break;
    }

    if (opcion.value !== 'back') {
      // refrescar presentación tras cada mutación
      const recipe = container.listRecipes.execute(userId).find(r => r.id === recipeId);
      if (recipe) {
        mostrarReceta(recipe, container.listIngredients.execute(userId), container.listTags.execute(userId));
      }
    }
  }
}
```

- Tras cada mutación (`add-existing`, `add-new`, `remove`), se refresca y muestra el elemento actualizado.
- Las funciones helper (`agregarExistente`, `agregarNuevo`, `quitar`) son privadas en el mismo archivo.
- `'back'` no refresca — solo sale del loop.

## Presentación: archivo separado

Cada agregado que se muestra repetidamente (editar, listar, post-mutación) tiene un **archivo de presentación**:

```
xxx-display.ts  →  export function mostrarXxx(item, ...context): void
                   export const CONSTANTES = { ... };
```

Ejemplo (`recipe-display.ts`):

```ts
import { RecipePrimitives } from '../../domain/...';

export function mostrarReceta(
  recipe: RecipePrimitives,
  allIngredients: IngredientItem[],
  allTags: TagItem[],
) {
  console.log(`\n${recipe.name}`);
  console.log(`  ID: ${recipe.id} — ${recipe.baseServings} comensales, ${recipe.prepTime} min`);
  // ... tags por dimensión, ingredientes, etc.
}

export const DIMENSION_LABELS = { MOMENTO_DIA: 'Momento del dia', ... };
```

- Es la **única fuente** de constantes de presentación (etiquetas de dimensión, órdenes, formatos).
- Los menús importan `mostrarX` y las constantes desde este archivo.
- Cero duplicación — ni `recipe.menu.ts`, `recipe-edit.menu.ts`, `recipe-ingredients.menu.ts` ni `recipe-tags.menu.ts` definen sus propias constantes de display.

## Helpers comunes

- **`findSimilarIngredients`** (ingredient.menu.ts): busca ingredientes existentes para evitar duplicados.
- **`buildChoicesFromList`**: mapea `XxxPrimitives[]` a `{ title, value, description }` para `prompts`.

## Casos reales
- `recipe.menu.ts` → `recipe-edit.menu.ts` → `recipe-ingredients.menu.ts`, `recipe-tags.menu.ts`. Presentación: `recipe-display.ts`.
