# RoadMap (Hoja de ruta) - Planificador de comidas

Este documento contiene todos y cada uno de los pasos a seguir para la construcción de la app. La misma es un listado de tareas, con pequeños parones o desgloses adicionales a medida que se vean necesarios para aprender conceptos nuevos o asentar nuevos temas vistos en el Master. 

*Abreviaturas*
- Los elementos marcados con `^^` son temas que aprederemos durante la elaboración de este software. Principalmente los que dispongan de ellos o se realizará un proyecto separado para su puesta en práctica o se escribirá a mano la mayoría del código. 
- Los elementos marcados con `!!` son temas que hemos aprendido durante el transcurso del Master.
- Los elementos marcados con `..` son temas que ya conocíamos en anterioridad o que usabamos desconociendo su nombre técnico.

## Completado (Fases 0-10)

- [x] Fase 0: Ingeniería de software (docs/)
    - [x] Paso 0: .. Redactar metodología y flujo de trabajo
    - [x] Paso 1: .. (PRD) Redactar documento con clienta de requisitos
    - [x] Paso 2: !! (SRS) Elaborar requisitos formales  
    - [x] Paso 3: !! (Dominio) Elaborar modelo de dominio  
    - [x] Paso 4: !! (Diseño) Plantear stack tecnológico e infraestructura  
    - [x] Paso 5: !! (Historias de usuario) Definir el comportamiento
    - [x] Paso 6: !! (MockUp) Borrador de aspecto inicial
    - [x] Paso 7: .. (RoadMap) Inicio de este documento

- [x] Fase 1 a 10: Implementación completa del dominio, CLI, persistencia, CRUD, vistas proyectadas y gestión de usuarios

```
Estado actual: 378 tests, 61 ficheros de test, todo verde. CLI sin picocolors (no funciona en Windows con tsx).
```

## Próximas fases

### Fase 11: Exclusiones y preferencias en MealService

Prerrequisito indispensable para el motor de autoplanificación. El Domain Model especifica que cada `MealService` debe tener listas de exclusión y preferencia (Set de Tag IDs), pero actualmente no existen.

- [x] Paso 1: Añadir `exclusions` y `preferences` a `MealService`
    - [x] ~~Modificar `MealService` entity~~ (ya existía desde Fase 5)
    - [x] ~~Actualizar primitivas de `MealService`~~ (ya existía desde Fase 5)
    - [x] ~~Actualizar `PlannedDay` para exponer estos campos en su DTO~~ (ya existía desde Fase 5)
    - [x] Actualizar `Planning.assignMealToDay` para propagar `exclusions`/`preferences`
    - [x] Tests unitarios de `MealService` (15 tests de entity)
- [x] Paso 2: Nuevos use cases para gestionar exclusiones y preferencias
    - [x] `SetMealExclusionsUseCase` — asigna exclusiones a un servicio concreto (5 tests)
    - [x] `SetMealPreferencesUseCase` — asigna preferencias a un servicio concreto (5 tests)
- [x] Paso 3: Submenú en CLI para gestionar exclusiones y preferencias por día/servicio
    - [x] Opciones "Gestionar exclusiones" y "Gestionar preferencias" en el menú de servicios
    - [x] Selector multiselect con tags pre-seleccionadas
- [x] Paso 4: Actualizar `assignMeal` para que valide exclusiones (2 tests añadidos)
    - [x] Añadido `RecipeRepository` a `AssignMealUseCase`
    - [x] Valida que la receta no tenga tags en la lista de exclusión del servicio
- [x] Paso 5: Refactorizar estructura de menús CLI (extracción a archivos individuales)
    - [x] Extraer cada acción CRUD a su propio archivo (`*-create.menu.ts`, `*-edit.menu.ts`, `*-delete.menu.ts`, `*-display.ts`)
    - [x] Aplicar patrón a usuarios, ingredientes, etiquetas, recetas y planificaciones
    - [x] Añadir `(Cancelar)` como primer ítem en todo `select` de selección de recurso
    - [x] Desgranar `planning-edit.menu.ts` y `planning-days.menu.ts` en 12 archivos individuales
- [x] Paso 6: Unificar flujo de ingredientes necesarios, despensa y lista de la compra
    - [x] `planning-needed-pantry.menu.ts`: muestra ingredientes necesarios + permite gestionar despensa (¿tienes de todo? / ¿para cuántos comensales tienes?)
    - [x] `planning-shopping-toggle.menu.ts`: lista solo lo que falta comprar con toggle comprado/pendiente por ingrediente
    - [x] Eliminar submenú antiguo "Despensa y compra" (3 archivos)
    - [x] Menú de editar planificación queda con 4 opciones: Editar datos, Gestionar días, Ingredientes necesarios y despensa, Lista de la compra
### Fase 12: Bulk editing de días

Permite al usuario configurar comensales, exclusiones y preferencias de varios días
a la vez, usando un selector por multiselect de días.

- [x] Paso 1: `BulkUpdateDaysUseCase`
    - [x] Input: planningId, days: DayOrder[], covers?, exclusions?, preferences?
    - [x] Aplica los mismos valores a todos los servicios de los días seleccionados
- [x] Paso 2: Añadir opción "Editar en lote" al menú de gestión de días del CLI
    - [x] `planning-bulk-update.menu.ts` con multiselect de días, confirm ask para covers/exclusiones/preferencias
- [x] Paso 3: Tests del use case (7 tests: covers, exclusions, preferences, parcial, combinado, planning no existe, dia no existe)
- [x] Paso 4: Validación MOMENTO_DIA en exclusiones y preferencias
    - [x] Use cases filtran etiquetas MOMENTO_DIA via TagRepository
    - [x] CLI filtra MOMENTO_DIA de los selectores multiselect
- [x] Paso 5: Creación en lote de días
    - [x] `Planning.addDays()` en aggregate (validación atómica)
    - [x] `BulkCreateDaysUseCase` (4 tests)
    - [x] `planning-day-bulk-add.menu.ts` — opción "Todos los días" o rango personalizado
- [x] Paso 6: Eliminación en lote de días
    - [x] `Planning.removeDays()` en aggregate (validación atómica)
    - [x] `BulkRemoveDaysUseCase` (3 tests)
    - [x] `planning-day-bulk-remove.menu.ts` — multiselect con confirmación
- [x] Paso 7: Asignación en lote de servicios
    - [x] `Planning.assignMealToDays()` en aggregate (validación atómica, upsert)
    - [x] `BulkAssignMealUseCase` con validación de TagRepository y RecipeRepository (5 tests)
    - [x] `planning-service-bulk-add.menu.ts` — multiselect días + momento + covers + receta
- [x] Paso 8: Eliminación en lote de servicios
    - [x] `Planning.removeMealFromDays()` en aggregate (validación atómica)
    - [x] `BulkRemoveMealUseCase` (4 tests)
    - [x] `planning-service-bulk-remove.menu.ts` — seleccionar momento + multiselect días

### Fase 13: Reestructuración de menús de días

Unifica las operaciones individuales y en lote de días/servicios en un único menú "Editar dias" con acciones que se aplican a todos los días seleccionados.

- [x] Paso 1: Fusionar menús de días y servicios en "Editar dias"
    - [x] Eliminar opciones "Editar dia", "Editar en lote", "Agregar servicio en lote", "Eliminar servicio en lote", "Eliminar dia"
    - [x] Renombrar opciones: "Agregar dia" → "Agregar un dia", "Agregar dias en lote" → "Agregar varios dias", "Eliminar varios dias" → "Eliminar dias"
    - [x] Nueva opción "Editar dias" con multiselect de días + menú de acciones (Agregar/Modificar/Eliminar servicio, Exclusiones, Preferencias)
    - [x] Reutilizar bulk use cases existentes para aplicar acciones sobre todos los días seleccionados
- [x] Paso 2: Ordenar días por ordenDia en todos los selectores de días (editar, eliminar, batch)
- [x] Paso 3: Mostrar días seleccionados con formato detallado (servicios, exclusiones y preferencias por comensal)

### Fase 14: Duplicar planificación

Permite copiar una planificación existente para usarla como plantilla.

- [x] Paso 1: `DuplicatePlanningUseCase`
    - [x] Clona Planning + PlannedDays + MealServices con nuevos IDs
    - [x] No clona pantry/shopping items (empieza limpio)
    - [x] `startDate = null` (actúa como plantilla)
    - [x] Hereda el nombre con sufijo " (Copia)"
- [x] Paso 2: Añadir opción "Duplicar" al menú de planificaciones en CLI
- [x] Paso 3: Tests del use case

### Fase 16: Motor de autoplanificación

El core del producto. Algoritmo que, dadas una planificación con exclusiones, preferencias y un balance frío/caliente, asigna recetas automáticamente a los servicios vacíos.

- [x] Paso 1: ^^ Diseñar algoritmo de planificación
    - [x] Estrategia de resolución: greedy vs backtracking vs constraint satisfaction → greedy
    - [x] Criterios hard: exclusiones, no repetir receta, MOMENTO_DIA coincidente
    - [x] Criterios soft: preferencias, balance frío/caliente, diversidad de TIPO_PLATO
- [ ] Paso 1b: ^^ Añadir `systemKey` a Tag para identificar etiquetas de sistema de forma estable
    - [x] Campo `systemKey: string | null` en Tag aggregate + `TagPrimitives`
    - [x] Tag.rename() bloqueado si tiene systemKey
    - [x] Seed actualizado con systemKey en todas las etiquetas de sistema
    - [x] `fromPrimitives` tolera JSON antiguos sin systemKey (`?? null`)
    - [x] AutoScheduleUseCase busca por `systemKey === 'CALIENTE'` en vez de por nombre
- [x] Paso 2: Implementar `AutoScheduleUseCase` en `application/planning/`
    - [x] Obtener recetas candidatas del usuario filtradas por tags del servicio
    - [x] Asignar receta a cada servicio vacío respetando constraints
    - [x] Distribuir frío/caliente según selector de tendencia (0%–100%)
    - [x] Evitar repetición de recetas y de TIPO_PLATO dentro del rango planificado
- [x] Paso 3: Tests exhaustivos del algoritmo
    - [x] Test: exclusión hard se respeta siempre
    - [x] Test: no repite receta
    - [x] Test: balance frío/caliente dentro del rango
    - [x] Test: diversidad de tipo de plato
    - [x] Test: respeta asignaciones manuales previas (use case test con FakePlanner)
- [x] Paso 4: Añadir selector de tendencia frío/caliente a la planificación
    - [x] Campo `hotColdBalance: number` (0–100) en Planning aggregate (default 50)
    - [x] `PlanningPrimitives` con `hotColdBalance?: number` (backward compat)
    - [x] `fromPrimitives` tolera JSON antiguos sin el campo
    - [x] `CreatePlanningUseCase` acepta `hotColdBalance` opcional
    - [x] `UpdatePlanningUseCase` puede cambiar `hotColdBalance`
    - [x] CLI creación: prompt para balance
    - [x] CLI edición: confirm + prompt para balance
    - [x] `AutoScheduleUseCase` lee balance del aggregate
- [x] Paso 5: Comando "Autoplanificar" en el menú de planificaciones del CLI
    - [x] Opción "Autoplanificar" en menú de planificaciones
    - [x] Selección de planificación + confirmación antes de ejecutar
    - [x] Muestra resumen: asignaciones (día, momento, receta) y no asignados (día, momento, razón)
    - [x] Cableado en container con GreedyPlanner

### Fase 17: Fusión de ingredientes (Merge)

Permite al usuario unificar ingredientes duplicados ("huevo" → "huevos") actualizando todas las referencias en recetas de forma atómica.

- [x] Paso 1: `MergeIngredientsUseCase`
    - [x] Reemplaza sourceIngredientId por targetIngredientId en todas las recetas del usuario (preserva quantityNote)
    - [x] Si la receta ya tiene el destino, elimina la referencia fuente sin duplicar
    - [x] Valida: origen ≠ destino, ambos existen, mismo usuario
    - [x] Elimina el ingrediente fuente del repositorio
- [x] Paso 2: Añadir opción "Fusionar ingredientes" al menú de ingredientes en CLI
    - [x] Diálogo: seleccionar origen → seleccionar destino → preview de recetas afectadas → confirmar
- [x] Paso 3: Tests del use case (8 tests: fusión, receta con ambos, múltiples recetas, errores de validación, sin recetas afectadas)

### Fase 18: ^^ Versión WEB Desktop (Next.js)

Migración de la CLI a interfaz web basada en los mockups aprobados por la usuaria. Todo el dominio existente (`src/`) se reutiliza sin modificar, importado desde un proyecto Next.js en `/web` (monorepo). Persistencia sigue siendo archivos (`data/`). Mock login (sin Supabase Auth).

**Paso 1: Inicializar proyecto Next.js**

- [x] 1.1: ^^ Qué es Next.js — conceptos: SSR, Server Components, App Router, por qué lo elegimos
- [x] 1.2: ^^ Crear proyecto con `create-next-app` en `/web`, explicar archivos generados
- [x] 1.3: ^^ App Router — rutas, `layout.tsx`, `page.tsx`, navegación
- [x] 1.4: ^^ Tailwind CSS — utility-first, cómo se usa en componentes
- [x] 1.5: ^^ Conectar dominio — alias `@domain/*` → `../src/*` en tsconfig, primer import
- [x] 1.6: ^^ Verificar integración — página que importa y ejecuta un use case real

**Paso 2: Mock login**

- [x] 2.1: ^^ Landing page (`/`) — presentación de la app, botón "Comenzar" (HU-00.1)
- [x] 2.2: ^^ Pantalla de login (`/login`) — campo de texto, crea usuario si no existe, guarda userId en cookie (HU-01.1/01.2 simplificado)
- [x] 2.3: ^^ Layout protegido — wrapper que redirige a `/login` si no hay userId

**Paso 3: Dashboard**

- [x] 3.1: ^^ Dashboard (`/dashboard`) — planificación activa, "Cocinar hoy", accesos rápidos (HU-01.3)
- [x] 3.2: ^^ Navegación global — sidebar o navbar con enlaces a secciones

**Paso 4: Recetas**

- [x] 4.1: ^^ Listado de recetas (`/recipes`) — búsqueda por nombre, filtro por etiquetas (HU-03.2)
- [x] 4.2: ^^ Crear receta (`/recipes/new`) — formulario con autocompletado de ingredientes (HU-03.1)
- [x] 4.3: ^^ Editar receta (`/recipes/[id]/edit`) — mismo formulario reutilizado (HU-03.3)
- [x] 4.4: ^^ Eliminar receta — modal de confirmación con advertencia de uso (HU-03.4)

**Paso 5: Ingredientes maestros**

- [x] 5.1: ^^ Listado + crear ingrediente (`/ingredients`) (HU-02.1, HU-02.2)
- [x] 5.2: ^^ Editar / eliminar ingrediente
- [x] 5.3: ^^ Fusión de ingredientes (desde Fase 17) (HU-02.3)

**Paso 6: Etiquetas**

- [x] 6.1: ^^ CRUD de etiquetas (`/tags`) con advertencia de uso (HU-04.1 a HU-04.3)

**Paso 7: Planificaciones — listado**

- [x] 7.1: ^^ Historial de planificaciones (`/plannings`) (HU-05.2)
- [x] 7.2: ^^ Crear planificación (HU-05.1)
- [x] 7.3: ^^ Duplicar planificación (desde Fase 14) (HU-05.3)
- [x] 7.4: ^^ Eliminar planificación con advertencia (HU-05.5)

**Paso 8: Planificaciones — editor semanal**

- [x] 8.1: ^^ Editor de planificación (`/plannings/[id]/edit`) — vista semanal en grilla
- [x] 8.2: ^^ Asignar comida a un día/servicio (HU-06.1)
- [x] 8.3: ^^ Edición en lote de días (desde Fase 12) (HU-06.1)
- [x] 8.4: ^^ Botón "Autoplanificar" (desde Fase 16) (HU-06.2)
- [x] 8.5: ^^ Editar datos generales de la planificación (HU-05.4)

**Paso 9: Despensa y lista de la compra**

- [ ] 9.1: ^^ Vista de ingredientes necesarios y despensa (HU-06.3)
- [ ] 9.2: ^^ Lista de la compra con checkboxes (HU-06.4)

### Fase 19: ^^ Versión WEB Mobile (responsive)

Adaptación de la UI de escritorio a contexto móvil usando solo Tailwind breakpoints. Sin cambios estructurales.

- [ ] Paso 1: Adaptar layout a mobile-first con Tailwind (`sm:` / `md:` breakpoints)
- [ ] Paso 2: Optimizar lista de la compra para uso en supermercado (target táctil 44x44px, contraste 4.5:1)
- [ ] Paso 3: Validar contraste WCAG 2.1 AA en toda la UI

### Fase 20: ^^ Persistencia con Postgres + Prisma

Sustitución de la persistencia por archivos por una base de datos Postgres. Se usa Prisma ORM como capa de acceso a datos (schema declarativo, migraciones automáticas, cliente tipado).

- [ ] Paso 1: Docker Compose para Postgres local (docker-compose.yml con postgres:16-alpine)
- [ ] Paso 2: Inicializar Prisma (`npx prisma init`) con `schema.prisma` mapeando el Domain Model
- [ ] Paso 3: Crear migración inicial y generar Prisma Client
- [ ] Paso 4: Implementar `PostgresTagRepository` (siguiendo `TagRepository` interface)
- [ ] Paso 5: Implementar `PostgresIngredientRepository`
- [ ] Paso 6: Implementar `PostgresRecipeRepository`
- [ ] Paso 7: Implementar `PostgresUserRepository`
- [ ] Paso 8: Implementar `PostgresPlanningRepository`
- [ ] Paso 9: Migrar seed de etiquetas de sistema a Prisma
- [ ] Paso 10: Tests de integración con base de datos real
- [ ] Paso 11: Actualizar `container.ts` para soportar `PERSISTENCE_TYPE=POSTGRES`

### Fase 21: ^^ Despliegue en cloud (Supabase + Vercel)

Paso a producción usando los servicios donde el usuario ya tiene cuenta.

- [ ] Paso 1: Crear proyecto Supabase y obtener DATABASE_URL
- [ ] Paso 2: Migrar esquema a Supabase Postgres (producción)
- [ ] Paso 3: Configurar Supabase Auth (login/registro real con email)
- [ ] Paso 4: Implementar políticas RLS (Row-Level Security) para aislamiento multitenant
- [ ] Paso 5: Reemplazar mock login por Supabase Auth en la web
- [ ] Paso 6: Desplegar en Vercel (CI/CD desde GitHub)
- [ ] Paso 7: Rate limiting en endpoints de auth (OWASP)
- [ ] Paso 8: Sanitización XSS (`isomorphic-dompurify`)
- [ ] Paso 9: Revisión de seguridad y robustez

### Fase 22: Preparación académica final

- [ ] Documentación del proyecto
- [ ] Memoria del TFM
- [ ] Presentación / defensa
