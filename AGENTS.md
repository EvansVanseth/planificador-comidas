# AGENTS.md — Planificador de Comidas

## Language
The codebase and all generated artifacts (code, identifiers, comments, commit messages, docs) are in English.
Communication with the user MUST be in Spanish unless the user explicitly switches.

## RoadMap (authoritative guide)

The file `docs/007-RoadMap.md` is the official project roadmap. It lists every phase, step, and task, separating completed from pending work.

**Implementation rules:**
- Follow the roadmap point by point, in the established order.
- Do not skip phases or steps without consulting the user.
- Each step must be completed (tests passing) before moving to the next.
- When in doubt about requirements, design decisions, or expected behavior, consult the documentation in `docs/` (SRS, Domain Model, User Stories, MockUp, Technical Design).
- If documents are ambiguous, ask the user.

## Required skills

As the project grows, skills (in `~/.config/opencode/skills/`) will be created to capture patterns and conventions for recurring tasks. The following are already identified:

- **DDD**: Domain patterns (VO, Entity, Aggregate, DomainError), naming conventions, and structure.
- **Application**: Use case patterns (constructor injection, `AppError`, `*Input` types, colocated `.spec.ts`).
- **CLI**: Menu patterns with `prompts`, error handling, user selection flow.
- Additional skills will emerge during development (planning engine, Postgres persistence, Next.js, etc.) and will be created on demand.

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
  domain/{planning,recipes,shared,users,tags,ingredients}/  — VOs, entities, aggregates
  application/{planning,tags,ingredients,recipes,shared}/    — use cases
  infrastructure/{cli,repositories}/                         — CLI, repos, DI container
```

## Domain conventions
- VOs: private constructor + static `create()`, throw `DomainError` hierarchy
- Entities/aggregates: same pattern + `toPrimitives()` / `fromPrimitives()` with exported `*Primitives` type
- Enums: plain TypeScript `enum` in `.enum.ts` files (e.g. `MealTime`, `TagDimension`)
- `Id` (UUID v4) in `shared/value-objects/`; use semantic wrappers (`UserId`, etc.) for type safety
- `Name` VO in `shared/value-objects/` with 3-100 char range
- `@/` alias → `./src/*`

## Application conventions
- Use cases accept repository via constructor injection (interface, not concrete class)
- Each use case has a colocated `.spec.ts` test file
- `AppError` base class in `shared/errors/` for application-layer errors
- Update use cases accept partial input via typed `*Input` export (e.g. `UpdateTagInput`)
- Repository must expose `findById`, `findAll`, `save`, `delete`

## Testing
- Vitest with `.spec.ts` files colocated next to implementation
- No special setup, no mocks — use InMemory repositories directly in tests
- Pattern: TDD (write spec first, then implement)

## Persistence
- Each aggregate has its own repository interface + InMemory implementation
- `PlanningRepository` also has a `FilePlanningRepository` (JSON file)
- Repositories must implement: `findById`, `findAll`, `save`, `delete`
- DI via container (`createContainer('memory' | 'file')`) — currently only Planning is wired

## Aggregate mutations summary
| Aggregate   | Mutations |
|-------------|-----------|
| Tag         | rename, reassignUser, changeDimension |
| Ingredient  | rename, reassignUser |
| Recipe      | rename, reassignUser, changeBaseServings, changePrepTime, updatePreparation, addTag, removeTag, addIngredient, removeIngredient |
| Planning    | rename, reSchedule, changeWeeks, addDay, removeDay, assignMealToDay, addPantryItem, removePantryItem, markPantryItemAsAvailable, updatePantryItemCovers, addShoppingItem, removeShoppingItem, markShoppingItemAsCompleted, markShoppingItemAsPending |

## Known quirks
- `StartDate.getDay()` is timezone-dependent; `toISOString()` normalises to UTC, which can break roundtrips across midnight. The VO also enforces Monday (`getDay() === 1`).
- No user auth in CLI yet — `userId` is prompted via user selection menu
- `PlanningPrimitives.userid` is lowercase-inconsistent (pre-existing, not corrected)
- `NodeNext` module resolution requires `.js` extension in imports (handled by ts-node/tsconfig-paths)
- Domain validation in `Recipe.create` enforces at least one tag per required dimension (MOMENTO_DIA, FORMATO, TIPO_PLATO); `removeTag` enforces the same constraint
