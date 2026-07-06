# Container — DI Container patterns

Container manual (sin librerías externas) en `src/infrastructure/container.ts`.

## Type

```ts
export type RepositoryType = 'memory' | 'file';
```

## IContainer interface

Expone cada use case como propiedad pública. Agrupada por dominio con comentarios de sección:

```ts
export interface IContainer {
  // Planning
  listPlannings: ListPlanningsUseCase;
  createPlanning: CreatePlanningUseCase;
  ...
  // Tags
  listTags: ListTagsUseCase;
  ...
  // Seed helpers
  seedTagsForUser: (userId: string) => void;
}
```

`seedTagsForUser` se expone como función flecha en la interface, no como use case.

## createContainer(mode)

Switch entre modos para instanciar repositorios:

```ts
switch (mode) {
  case 'file':
    planningRepository = new FilePlanningRepository('planning-data.json');
    ...
  case 'memory':
  default:
    planningRepository = new InMemoryPlanningRepository();
    ...
}
```

Cada use case recibe sus repositorios por constructor injection:

```ts
const container: IContainer = {
  listPlannings: new ListPlanningsUseCase(planningRepository),
  assignMeal: new AssignMealUseCase(planningRepository, tagRepository),
  ...
};
```

## Reglas de wiring

1. **Use case de un solo repo**: `new XxxUseCase(repo)`
2. **Use case multi-repo**: pasar en el orden de los parámetros del constructor
3. **Helpers**: funciones standalone se envuelven en arrow function:
   ```ts
   seedTagsForUser: (userId: string) => seedSystemTags(tagRepository, userId)
   ```
4. **Sin singleton ni lazy loading** — se crean todos al construir el container
5. **Sin userId en createContainer** — se pasa desde CLI después de seleccionar usuario

## Cómo se usa desde CLI

```ts
const response = await prompts(menuPrincipal, { onCancel: ON_CANCEL });
const container = createContainer(response.mode); // 'memory' | 'file'
// luego de seleccionar/crear usuario:
await menuPrincipal(container, userId);
```

## Cómo agregar un nuevo use case

1. Importar el use case class al tope
2. Agregar propiedad a `IContainer`
3. Instanciar en el return object de `createContainer`
