# Improve Performance Postgres

> Plan de optimización del rendimiento de la persistencia sobre Postgres/Supabase.
> Las fases se implementarán **una a una**. Tras cada Fase el autor revisará el impacto
> real de rendimiento (Despensa y Lista de la compra son el criterio principal de medición)
> antes de iniciar la siguiente.

## Contexto

La app tiene que ser ágil. Hoy la lentitud se nota especialmente en **Despensa** y **Lista de la
compra** de una planificación. Se detectaron dos familias de problemas sobre la capa
`src/infrastructure/repositories` (repositorios Postgres vía Prisma):

1. **Lecturas con N+1 y carga excesiva**: muchas queries secuenciales y árboles completos
   materializados cuando solo se necesita una pizca de datos.
2. **Escrituras full-rewrite**: `save()` de un aggregate elimina y recrea TODA la estructura
   aunque cambie un único campo.

No existe hoy una "pasarela" directa BD → UI: toda lectura obliga a materializar aggregate de
dominio completo. Tampoco hay escritura por diferencias; todo es full write.

**Objetivo**: aligerar el tráfico de datos y la carga computacional.

**Fases planificadas**: A (escrituras dirigidas), B (lecturas lean, sin N+1), C (pasarela/read
models). La antigua **Fase D (motor de diffs genérico) queda descartada** — la Fase A logra el
mismo efecto ("escribir solo el cambio") con menor coste y riesgo.

---

## Diagnóstico (evidencia actual)

### Lecturas

| Ref | Problema | Ubicación |
|-----|----------|-----------|
| R1 | N+1: una query `findById` por receta y por ingrediente en Despensa y Lista de la compra | `src/application/planning/get-needed-ingredients.use-case.ts:24-64`, `get-shopping-list.use-case.ts:22-90` |
| R2 | La página de edición carga TODOS los plannings (con árbol completo) para quedarse con uno | `web/src/app/dashboard/plannings/[id]/edit/page.tsx:26-27` |
| R3 | `findByName` filtra en JS tras cargar todas las filas (sin `where` de Prisma) | `postgres-planning.repository.ts:54-64`, `postgres-recipe.repository.ts:50-59`, `postgres-ingredient.repository.ts:27-32` |
| R4 | `GetShoppingList` duplica la proyección completa de `GetNeededIngredients` | `get-shopping-list.use-case.ts` |

### Escrituras (R5/R6) — la causa mayor
Cada operación de despensa/compra (`toggleShoppingItem`, `markPantryItemAvailable`,
`updatePantryItemCovers`, `addShoppingItem`, `removeShoppingItem`, ...) sigue el patrón
`findById` → muta el aggregate → `save(planning)`. Y `save()` (`postgres-planning.repository.ts:67-147`)
hace:
- `deleteMany(mealService)` + recrear todos
- `deleteMany(plannedDay)` + recrear todos
- `deleteMany(pantryItems)` + `createMany` todos
- `deleteMany(shoppingItems)` + `createMany` todos

Un único toggle de un booleano de la compra reescribe **toda la planificación**.
Además genera `id: randomUUID()` nuevos para cada servicio en cada save y no usa transacciones.

**(R6) — Recetas** (`postgres-recipe.repository.ts:84-103`): mismo patrón full-rewrite de
`recipeIngredient` y `recipeTag` aunque solo cambie el `name`.

---

## Fase A — Escrituras parciales (hot path de despensa/compra)

**Objetivo**: al activar una única operación de despensa/compra se escriba solo el dato
cambiado, sin reescribir en aggregate entero.

### Cambios propuestos

1. **Métodos repo granulares** en `PlanningRepository` (interfaz + impls + in-memory empleado
   en tests) que hagan una sola operación SQL:
   - `setPantryItemCovers(planningId, ingredientId, covers)`
   - `setPantryItemAvailable(planningId, ingredientId, available)`
   - `setPantryItem(planningId, ingredientId, { available, covers })` (upsert)
   - `setShoppingItemCompleted(planningId, ingredientId, completed)` (upsert)
   - `removePantryItem(planningId, ingredientId)` y `removeShoppingItem(planningId, ingredientId)`
2. Los **use-cases de dominio siguen siendo la autoridad**: mantienen `findById` para
   validar invariantes y obtener el aggregate, pero sustituyen `save(planning)` por la
   llamada al repositorio granular.
3. **Optimizar `save()` de planning** para los casos que sí tocan el árbol (grid):
   - Envolver en `prisma.$transaction([...])`.
   - Sustituir `deleteMany`+`createMany` por `update`/`delete` por id (solo lo que cambió),
     en lugar de borrar todo.
   - **No regenerar** `id` de `MealService` ya existentes.

### Verificación
- Unit tests de los use-cases (InMemory) deben quedar verdes sin cambiar su contrato.
- Integration tests de `planningPantryItem`/`shoppingItem` en postgres.
- Medir reducción de queries SQL por toggle.

> **Estado (Fase A): COMPLETA** — implementados los 5 métodos granulares + use-cases y el
> `save()` transaccional por diffs. 506 tests verdes (1 fallo preexistente de `findByName`,
> pendiente de Fase B3). Revisión manual de rendimiento pendiente antes de iniciar Fase B.

---

## Fase B — Lecturas lean (sin N+1 ni carga innecesaria)

**Objetivo**: reducir round-trips y evitar cargar árboles innecesarios.

### Cambios propuestos

1. **B1 — `edit/page.tsx`**: usar `findById` para el planning en edición en lugar de
   `listPlannings` + `.find(...)` (corrige R2).
2. **B2 — Eliminar N+1** en `GetNeededIngredients` y `GetShoppingList`:
   - Un solo `recipe.findMany({ where: { id: { in: recipeIds } }, include: { ingredients: true } })`.
   - Un solo `ingredient.findMany({ where: { id: { in: ingredientIds } } })`.
   - Total: pasa de `1 + R + I` queries a **3**.
   - Los repos de dominio ganan métodos tipo `findManyByIds` (y `InMemory` participe).
3. **B3 — `findByName` con filtro Prisma**: `where: { name: { equals, mode: 'insensitive' }, userId }`
   (corrige R3).
4. **B4 — Refactor**: extraer la proyección común de recetas/ingredientes en un helper
   compartido entre ambos use-cases (corrige R4 y evita duplicación).

### Medidas
- Comparar tiempos de carga de Despensa/Lista antes/después.
- Número de queries emitidas (Prisma query logging, `LOG_LEVEL=query`).

---

## Fase C — "Pasarela" / read models para entidades planas

**Objetivo**: que ciertos datos vayan de la BD a la UI **sin** materializar el aggregate de
dominio completo, para entidades planas (despensa, lista de la compra, ingredientes, tags).

### Trade-off
Supone **CQRS-lite**: salimos parcialmente de la pureza DDD/Clean para las **lecturas**.
Se mantiene el aggregate como autoridad de las **escrituras** e invariantes (asignar receta,
autoplanificador).

### Cambios propuestos

1. **Read-model de solo lectura** en infraestructura (p.ej. `PlanningFlatReadRepository`,
   `IngredientFlatReadRepository`, `TagFlatReadRepository`) con interfaces propias.
   - Devuelven DTOs planos (no entities ni aggregates de dominio).
   - Filtrado llevado en `where`/`join` de Prisma (SQL, no en client).
2. **Uso**:
   - Despensa: join directo `PlanningPantryItem + Ingredient` con nombres y covers.
   - Lista de la compra: `PlanningShoppingItem + Ingredient` con estado `completed`.
   - Listados de tags e ingredientes (records planos sin lógica).
3. **Wiring** vía `IContainer`/`getContainer` para que la UI use los use-cases/read-models
   de solo lectura flat.
4. Respetar los límites: NO usar la pasarela para operaciones con invariantes de dominio
   (asignar receta, autoplanificador, validaciones).

### Criterios de cierre
- Las pantallas de Despensa y Lista de la compra dejan de instanciar aggregates para pintar filas.
- Métricas de red/BD/payload menores.

---

## Notas

- **Dependencias**: la Fase B apoya la base de la Fase A (métodos repo) parcialmente; se puede
  ajustar el orden, pero A se recomienda primero por mayor impacto/menor riesgo.
- **Tests**: mantener InMemory para los unit specs; añadir cobertura integration donde se
  añade lógica SQL nueva.
- **Medición personal**: tras cada Fase, revisión manual del impacto real de rendimiento
  (Despensa, Lista de la compra y grid de edición). No avanzar hasta validar la Fase anterior.
- Fase D (diff generalizado) **descartada**.

---
*Documento de planificación. Implementación fase a fase, revisando impacto tras cada una.*