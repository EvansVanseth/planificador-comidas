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

## Submenús anidados

Usan el mismo patrón `while + switch` dentro del mismo archivo:

```ts
async function gestionarIngredientes(container: IContainer, recipeId: string, userId: string) {
  let continuar = true;
  while (continuar) {
    switch (response.opcion) {
      case 'add-existing': ...
      case 'add-new': ...
      case 'remove': ...
      case 'back': continuar = false;
    }
  }
}
```

Caso real: `gestionarDias` → `gestionarServicios` → `gestionarDespensa` / `gestionarListaCompra`.

## Helpers comunes

- **`findSimilarIngredients`** (ingredient.menu.ts): busca ingredientes existentes para evitar duplicados.
- **`buildChoicesFromList`**: mapea `XxxPrimitives[]` a `{ title, value, description }` para `prompts`.
