---
name: ddd
description: "Domain patterns for the Planificador de Comidas project: VOs, Entities, Aggregates, DomainError hierarchy, serialization conventions, naming, and test structure."
disable-model-invocation: false
user-invocable: true
license: MIT
metadata:
  author: planificador-de-comidas
  version: "1.0"
---

# DDD Skill — Planificador de Comidas

Patrones de dominio para el proyecto. Toda abstracción del core domain debe seguir estas convenciones.

---

## File naming

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Value Object | `kebab-case.vo.ts` | `start-date.vo.ts` |
| Enum | `kebab-case.enum.ts` | `tag-dimension.enum.ts` |
| Entity | `kebab-case.entity.ts` | `planned-day.entity.ts` |
| Aggregate | `kebab-case.aggregate.ts` | `recipe.aggregate.ts` |
| Error | `kebab-case-error.ts` | `null-type-error.ts` |
| Spec (colocated) | `*.spec.ts` | `id.vo.spec.ts` |

---

## Value Object pattern

```typescript
export class SomeName {
  readonly value: <tipo>;

  private constructor(value: <tipo>) {
    this.value = value;
  }

  public static create(value: <tipo>): SomeName {
    // validar, lanzar DomainError si inválido
    return new SomeName(value);
  }
}
```

**Rules:**
- `private` constructor — always
- `readonly value` property
- `static create()` factory with validation
- Immutable: no setters
- For compound VOs (`RecipeIngredient`): add `equals()`, `toPrimitives()`, `fromPrimitives()`, and `Object.freeze(this)` in constructor

---

## Enum pattern

```typescript
export enum TagDimension {
  MOMENTO_DIA = 'MOMENTO_DIA',
  FORMATO = 'FORMATO',
  // ...
}
```

Plain TypeScript `enum` in `.enum.ts` files. No constructor, no methods.

---

## Entity pattern

```typescript
export class SomeEntity {
  private id: Id;
  private field: SomeVO;

  // Prefer private constructor + static create()
  private constructor(id: Id, field: SomeVO) { ... }

  public static create(id: string, field: <tipo>): SomeEntity {
    return new SomeEntity(Id.create(id), SomeVO.create(field));
  }

  public getId(): string { return this.id.value; }
  // getters with `get` prefix; booleans use `is` prefix
}
```

**Rules:**
- Has identity (`id: Id`)
- Mutable (methods modify internal state)
- No `equals()` — identity via `id`
- No `Object.freeze()`
- Prefer `private constructor` + `static create()`

---

## Aggregate pattern

```typescript
export type SomePrimitives = {
  id: string;
  userId: string;
  // ... all primitives
};

export class SomeAggregate {
  private id: Id;
  private userId: UserId;
  private children: Map<string, ChildEntity> = new Map();

  private constructor(id: Id, userId: UserId) { ... }

  public static create(id: string, userId: string, ...): SomeAggregate {
    return new SomeAggregate(Id.create(id), UserId.create(userId), ...);
  }

  // Getters with `get` prefix, return primitives
  public getId(): string { return this.id.value; }
  public getUserId(): string { return this.userId.value; }

  // Collections: defensive copy
  public getChildren(): ChildEntity[] { return [...this.children.values()]; }

  // Domain mutations
  public rename(name: string): void {
    this.name = Name.create(FIELD_NAME, name);
  }

  public toPrimitives(): SomePrimitives {
    return {
      id: this.id.value,
      userId: this.userId.value,
      children: Array.from(this.children.values()).map(c => c.toPrimitives()),
    };
  }

  public static fromPrimitives(data: SomePrimitives): SomeAggregate {
    const agg = new SomeAggregate(Id.create(data.id), UserId.create(data.userId));
    data.children?.forEach(c => {
      const entity = ChildEntity.fromPrimitives(c);
      agg.children.set(entity.getId(), entity);
    });
    return agg;
  }
}
```

**Rules:**
- `private constructor` + `static create()` — always
- Parameters in `create()` are plain primitives (caller creates VOs internally)
- Invariant validation in `create()` and each mutation method
- Use `Map<K, V>` for child collections; reconstruct in `fromPrimitives()`
- `toPrimitives()` / `fromPrimitives()` with exported `*Primitives` type

---

## DomainError hierarchy

```typescript
DomainError (extends Error)  // base
├── NullError                // campo vacío
├── NoIntegerError           // no entero
├── OutRangeError            // fuera de [min, max]
├── MinRangeError            // menor que min
└── MaxRangeError            // mayor que max
```

**Usage:**
```typescript
throw new NullError('field name');
throw new MinRangeError('field name', 1);
throw new OutRangeError('field name', 1, 12);
```

No Result/Either — throw exceptions directly.

---

## Serialization roundtrip

```typescript
export type FooPrimitives = { id: string; ... };

// instance → primitives
public toPrimitives(): FooPrimitives { ... }

// primitives → instance (static)
public static fromPrimitives(data: FooPrimitives): Foo { ... }
```

`fromPrimitives` must reconstruct child entities and internal Maps correctly. Roundtrip `toPrimitives() → fromPrimitives() → toPrimitives()` must be idempotent.

---

## Testing pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('SomeName (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('debe crearse correctamente', () => {
    const obj = SomeAggregate.create(validId, ...);
    expect(obj).toBeDefined();
  });

  it('debe rechazar un id inválido', () => {
    expect(() => SomeAggregate.create('bad', ...)).toThrow(DomainError);
  });

  // Mutation tests
  it('debe permitir rename', () => {
    const obj = SomeAggregate.create(validId, ...);
    obj.rename('nuevo');
    expect(obj.getName()).toBe('nuevo');
  });

  // Roundtrip test
  it('debe mantener integridad en roundtrip', () => {
    const original = SomeAggregate.create(validId, ...);
    const primitives = original.toPrimitives();
    const restored = SomeAggregate.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });
});
```

**Rules:**
- Colocated `.spec.ts` next to implementation
- Use literal UUIDs in tests (e.g. `'550e8400-e29b-41d4-a716-446655440000'`)
- Use real InMemory repositories (no mocks) for integration
- Test: happy path, validation errors, mutations, serialization roundtrip

---

## Getter naming

| Type | Pattern | Example |
|------|---------|---------|
| Strings/numbers | `get` prefix | `getName(): string` |
| Booleans | `is` prefix | `isAvailable(): boolean`, `isSystemTag(): boolean` |
| Collections | `get` + plural | `getIngredients(): RecipeIngredient[]` (defensive copy) |

Internal access: `<voInstance>.value` to unwrap the primitive from the VO.

---

## Semantic wrappers (UserId)

```typescript
export class UserId {
  readonly value: string;
  private constructor(value: string) { this.value = value; }
  public static create(value: string): UserId {
    return new UserId(Id.create(value).value);
  }
}
```

Wrap `Id` (UUID) in semantic types for type safety. File: `user-id.vo.ts`.

---

## Collection handling

- **Internal storage**: `Map<K, V>` where K is a primitive key (string, number)
- **Exposure**: getter returns defensive copy: `return [...this.map.values()]`
- **Reconstruction in fromPrimitives()**:
  ```typescript
  data.items?.forEach(i => {
    const entity = SomeEntity.fromPrimitives(i);
    agg.items.set(entity.getId(), entity);
  });
  ```

---

## Field naming conventions

- `Id.create()` validates UUID v4 format
- `Name.create('human readable field name', value)` — first param is a description for error messages, NOT the value
- Always `.trim()` strings before validation
- `@/` alias → `./src/*`
