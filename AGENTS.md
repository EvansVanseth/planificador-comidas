# AGENTS.md — Planificador de Comidas

## Stack
- TypeScript (NodeNext, ES2022), Vitest, prompts (CLI)

## Commands
- `npm test` — run all vitest tests
- `npm run cli` — launch CLI (ts-node + tsconfig-paths)
- Run a single file: `npx vitest run path/to/file.spec.ts`
- No lint or typecheck commands configured

## Architecture (Clean / DDD)
```
src/
  domain/{planning,recipes,shared,users}/  — VOs, entities, aggregates
  application/{planning}/                   — use cases
  infrastructure/{cli,repositories}/        — CLI, repos, DI container
```

## Domain conventions
- VOs: private constructor + static `create()`, throw `DomainError` hierarchy
- Entities/aggregates: same pattern + `toPrimitives()` / `fromPrimitives()` with exported `*Primitives` type
- Enums: plain TypeScript `enum` in `.enum.ts` files (e.g. `MealTime`, `TagDimension`)
- `Id` (UUID v4) in `shared/value-objects/`; use semantic wrappers (`UserId`, etc.) for type safety
- `Name` VO in `shared/value-objects/` with 3-100 char range
- `@/` alias → `./src/*`

## Testing
- Vitest with `.spec.ts` files colocated next to implementation
- No special setup, no mocks needed so far (pure domain logic)
- Pattern: TDD (write spec first, then implement)

## Persistence
- `PlanningRepository` interface with `findById`, `findAll`, `save`
- Two implementations: `InMemoryPlanningRepository` and `FilePlanningRepository` (JSON)
- DI via container (`createContainer('memory' | 'file')`)

## Known quirks
- `StartDate.getDay()` is timezone-dependent; serialization via `toISOString()` can break roundtrips across UTC midnight. Use `null` when exact date roundtrip isn't needed.
- No user auth in CLI yet — `userId` is prompted as UUID text
