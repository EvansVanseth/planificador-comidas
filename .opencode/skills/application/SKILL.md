---
name: application
description: "Use case patterns for the Planificador de Comidas project: constructor injection, AppError, typed Input types, colocated .spec.ts, execute() signatures, and repository wiring."
disable-model-invocation: false
user-invocable: true
license: MIT
metadata:
  author: planificador-de-comidas
  version: "1.0"
---

# Application Skill — Planificador de Comidas

Patrones de la capa de aplicación (use cases). Cada operación del sistema se modela como un use case independiente.

---

## File naming

`kebab-case.use-case.ts` colocated with `kebab-case.use-case.spec.ts`.

Examples:
```
create-tag.use-case.ts
create-tag.use-case.spec.ts
update-recipe.use-case.ts
assign-meal.use-case.ts
```

Helpers that are not use cases go in the same directory with plain names:
```
seed-system-tags.ts
seed-system-tags.spec.ts
```

---

## Use case structure (CRUD pattern)

### Create

```typescript
import { XxxRepository } from '../../infrastructure/repositories/xxx-repository.interface';
import { Xxx } from '@/domain/xxx/aggregates/xxx.aggregate';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateXxxUseCase {
  constructor(private xxxRepository: XxxRepository) {}

  execute(userId: string, ...params: ...): string {
    // 1. Validate uniqueness if needed
    const existing = this.xxxRepository.findByName(name);
    if (existing) {
      throw new AppError(`Ya existe ... con el nombre "${name}"`);
    }

    // 2. Generate ID
    const id = randomUUID();

    // 3. Create aggregate
    const xxx = Xxx.create(id, userId, ...);

    // 4. Save
    this.xxxRepository.save(xxx);

    // 5. Return ID
    return id;
  }
}
```

**Rules:**
- Contructor receives the repository interface (not concrete class)
- `execute()` receives plain primitives as parameters (userId first, then domain params)
- Generates `id` via `randomUUID()` from `crypto`
- Throws `AppError` on validation failures (uniqueness, not found)
- Returns `string` (the created entity ID)

### List

```typescript
import { XxxRepository } from '../../infrastructure/repositories/xxx-repository.interface';
import { XxxPrimitives } from '@/domain/xxx/aggregates/xxx.aggregate';

export class ListXxxUseCase {
  constructor(private xxxRepository: XxxRepository) {}

  execute(userId: string): XxxPrimitives[] {
    return this.xxxRepository.findAllByUserId(userId).map(x => x.toPrimitives());
  }
}
```

**Rules:**
- Returns array of `*Primitives` (never domain objects)
- Filters by `userId` via repository
- Maps with `.toPrimitives()`

### Update

```typescript
import { XxxRepository } from '../../infrastructure/repositories/xxx-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type UpdateXxxInput = {
  id: string;
  name?: string;
  userId?: string;
  // other optional fields...
};

export class UpdateXxxUseCase {
  constructor(private xxxRepository: XxxRepository) {}

  execute(input: UpdateXxxInput): void {
    // 1. Find or throw
    const xxx = this.xxxRepository.findById(input.id);
    if (!xxx) {
      throw new AppError(`Xxx not found: ${input.id}`);
    }

    // 2. Validate uniqueness if changing name
    if (input.name !== undefined) {
      const existing = this.xxxRepository.findByName(input.name);
      if (existing && existing.getId() !== input.id) {
        throw new AppError(`Ya existe ... con el nombre "${input.name}"`);
      }
      xxx.rename(input.name);
    }

    // 3. Apply mutations (each optional field guarded by !== undefined)
    if (input.userId !== undefined) {
      xxx.reassignUser(input.userId);
    }

    // 4. Save
    this.xxxRepository.save(xxx);
  }
}
```

**Rules:**
- Input type exported as `UpdateXxxInput` (partial, all fields optional except `id`)
- Each field guarded with `if (input.field !== undefined)`
- Throws `AppError` if not found
- Throws `AppError` on name uniqueness conflict (skip check if same entity: `existing.getId() !== input.id`)
- Returns `void`
- Calls `this.xxxRepository.save(xxx)` at the end

### Delete

```typescript
import { XxxRepository } from '../../infrastructure/repositories/xxx-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class DeleteXxxUseCase {
  constructor(private xxxRepository: XxxRepository) {}

  execute(id: string): void {
    const xxx = this.xxxRepository.findById(id);
    if (!xxx) {
      throw new AppError(`Xxx not found: ${id}`);
    }
    // Additional business rules before delete
    this.xxxRepository.delete(id);
  }
}
```

**Rules:**
- Takes entity `id` as sole parameter
- Throws `AppError` if not found
- Returns `void`

---

## Multi-repository use case pattern

Use cases that span multiple aggregates receive multiple repository interfaces:

```typescript
export class SomeCrossAggregateUseCase {
  constructor(
    private repoA: RepositoryA,
    private repoB: RepositoryB,
  ) {}

  execute(userId: string, entityId: string, ...params: ...): string {
    const a = this.repoA.findById(entityId);
    if (!a) throw new AppError(`A not found: ${entityId}`);

    // Create and save in repoB
    const b = B.create(randomUUID(), userId, ...);
    this.repoB.save(b);

    // Link b into a
    a.addB(b.getId());
    this.repoA.save(a);

    return b.getId();
  }
}
```

Example: `AddNewIngredientToRecipeUseCase` (RecipeRepository + IngredientRepository), `AddNewTagToRecipeUseCase` (RecipeRepository + TagRepository), `GetShoppingListUseCase` (PlanningRepository + RecipeRepository + IngredientRepository).

---

## Read-only / view projection use case pattern

For virtual views that don't write, the use case composes data from multiple repositories on the fly:

```typescript
export class GetSomeViewUseCase {
  constructor(
    private repoA: RepositoryA,
    private repoB: RepositoryB,
  ) {}

  execute(planningId: string): ViewEntry[] {
    const planning = this.repoA.findById(planningId);
    if (!planning) throw new AppError('...');

    // Aggregate data in-memory
    const result: ViewEntry[] = [];

    // Sort and return
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }
}
```

Data is projected in memory — no write to repositories.

---

## Seed / helper pattern

Standalone functions (not classes) for bootstrapping data:

```typescript
import { XxxRepository } from '@/infrastructure/repositories/xxx-repository.interface';
import { Xxx } from '@/domain/xxx/aggregates/xxx.aggregate';

export function seedXxx(xxxRepository: XxxRepository, userId: string): void {
  const existing = xxxRepository.findAll();
  if (existing.some(x => x.getUserId() === userId)) return; // idempotent

  for (const seed of SEEDS) {
    const xxx = Xxx.create(randomUUID(), userId, seed.name, ...);
    xxxRepository.save(xxx);
  }
}
```

---

## Testing pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateXxxUseCase } from './create-xxx.use-case';
import { InMemoryXxxRepository } from '../../infrastructure/repositories/in-memory-xxx.repository';
import { AppError } from '../shared/errors/app-error';

describe('CreateXxxUseCase', () => {
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: CreateXxxUseCase;
  let repo: InMemoryXxxRepository;

  beforeEach(() => {
    repo = new InMemoryXxxRepository();
    useCase = new CreateXxxUseCase(repo);
  });

  it('debe crear ... y devolver un id', () => {
    const id = useCase.execute(validUserId, ...);
    expect(id).toBeDefined();
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('...');
  });

  it('debe rechazar nombre duplicado', () => {
    useCase.execute(validUserId, 'Duplicado');
    expect(() => useCase.execute(validUserId, 'Duplicado')).toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', () => {
    useCase.execute(validUserId, 'Nombre');
    expect(() => useCase.execute(validUserId, 'nombre')).toThrow(AppError);
  });
});
```

**Rules:**
- Instantiate `InMemoryXxxRepository` directly (no mocks)
- Import from the relative path `../../infrastructure/repositories/in-memory-xxx.repository` (not `@/`)
- Use literal UUIDs like `'550e8400-e29b-41d4-a716-446655440001'`
- `beforeEach` creates fresh repo and use case
- Test: happy path (check return + saved state), validation errors via `toThrow(AppError)`, uniqueness case-insensitive

---

## Error handling

- `AppError` for application-layer errors (validation, not found, business rule violation)
- `DomainError` (from domain layer) may also be thrown and should be caught in CLI
- Use cases do NOT catch errors — let them propagate to the caller (CLI/WEB)
- Error messages are descriptive strings, typically in Spanish for CLI users

```typescript
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

// In CLI:
try {
  useCase.execute(...);
} catch (error) {
  if (error instanceof DomainError || error instanceof AppError) {
    console.log('✗ ' + error.message);
  }
}
```

---

## import conventions

| Import type | Path | Example |
|-------------|------|---------|
| Repository interface | Relative `../../infrastructure/repositories/...` | `import { XxxRepository } from '../../infrastructure/repositories/xxx-repository.interface'` |
| Domain classes | `@/` alias | `import { Xxx } from '@/domain/xxx/aggregates/xxx.aggregate'` |
| AppError | Relative `../shared/errors/app-error` | `import { AppError } from '../shared/errors/app-error'` |
| DomainError | `@/` alias | `import { DomainError } from '@/domain/shared/errors/domain-error'` |
| InMemory repo in tests | Relative `../../infrastructure/repositories/...` | `import { InMemoryXxxRepository } from '../../infrastructure/repositories/in-memory-xxx.repository'` |

---

## Container wiring

Use cases are instantiated in `createContainer()` in `src/infrastructure/container.ts`. Each use case receives its repository(ies) via constructor:

```typescript
listTags: new ListTagsUseCase(tagRepository),
createTag: new CreateTagUseCase(tagRepository),
updateTag: new UpdateTagUseCase(tagRepository),
deleteTag: new DeleteTagUseCase(tagRepository),
```

For multi-repo use cases:
```typescript
addNewIngredientToRecipe: new AddNewIngredientToRecipeUseCase(recipeRepository, ingredientRepository),
getShoppingList: new GetShoppingListUseCase(planningRepository, recipeRepository, ingredientRepository),
```

---

## Return type conventions

| Operation | Return type |
|-----------|-------------|
| Create | `string` (the new entity ID) |
| List | `XxxPrimitives[]` (array of primitives) |
| Update | `void` |
| Delete | `void` |
| Read-only views | `ViewEntry[]` (custom typed array) |
| Seed helper | `void` |
