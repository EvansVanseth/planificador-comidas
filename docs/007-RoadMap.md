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
Estado actual: 317 tests, 52 ficheros de test, todo verde.
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

### Fase 12: Bulk editing de días

Permite al usuario configurar comensales, exclusiones y preferencias de varios días a la vez, usando un selector rápido por semana completa.

- [ ] Paso 1: `BulkUpdateDaysUseCase`
    - [ ] Input: planningId, rango de días (semana/días concretos), covers, exclusions, preferences
    - [ ] Aplica los mismos valores a todos los servicios de los días seleccionados
- [ ] Paso 2: Añadir opción "Editar en lote" al menú de gestión de días del CLI
- [ ] Paso 3: Tests del use case

### Fase 13: Duplicar planificación

Permite copiar una planificación existente para usarla como plantilla.

- [ ] Paso 1: `DuplicatePlanningUseCase`
    - [ ] Clona Planning + PlannedDays + MealServices con nuevos IDs
    - [ ] No clona pantry/shopping items (empieza limpio)
    - [ ] `startDate = null` (actúa como plantilla)
    - [ ] Hereda el nombre con sufijo " (Copia)"
- [ ] Paso 2: Añadir opción "Duplicar" al menú de planificaciones en CLI
- [ ] Paso 3: Tests del use case

### Fase 14: Motor de autoplanificación

El core del producto. Algoritmo que, dadas una planificación con exclusiones, preferencias y un balance frío/caliente, asigna recetas automáticamente a los servicios vacíos.

- [ ] Paso 1: ^^ Diseñar algoritmo de planificación
    - [ ] Estrategia de resolución: greedy vs backtracking vs constraint satisfaction
    - [ ] Criterios hard: exclusiones, no repetir receta, MOMENTO_DIA coincidente
    - [ ] Criterios soft: preferencias, balance frío/caliente, diversidad de TIPO_PLATO
- [ ] Paso 2: Implementar `AutoScheduleUseCase` en `application/planning/`
    - [ ] Obtener recetas candidatas del usuario filtradas por tags del servicio
    - [ ] Asignar receta a cada servicio vacío respetando constraints
    - [ ] Distribuir frío/caliente según selector de tendencia (0%–100%)
    - [ ] Evitar repetición de recetas y de TIPO_PLATO dentro del rango planificado
- [ ] Paso 3: Tests exhaustivos del algoritmo
    - [ ] Test: exclusión hard se respeta siempre
    - [ ] Test: no repite receta
    - [ ] Test: balance frío/caliente dentro del rango
    - [ ] Test: diversidad de tipo de plato
    - [ ] Test: respeta asignaciones manuales previas
- [ ] Paso 4: Añadir selector de tendencia frío/caliente a la planificación
    - [ ] Campo `hotColdBalance: number` (0–100) en Planning aggregate
    - [ ] Primitivas y CLI para configurarlo
- [ ] Paso 5: Comando "Autoplanificar" en el menú de planificaciones del CLI
    - [ ] Ejecuta el motor, muestra resumen de asignaciones, permite aceptar o rechazar

### Fase 15: Fusión de ingredientes (Merge)

Permite al usuario unificar ingredientes duplicados ("huevo" → "huevos") actualizando todas las referencias en recetas de forma atómica.

- [ ] Paso 1: `MergeIngredientsUseCase`
    - [ ] Input: sourceIngredientId, targetIngredientId
    - [ ] Reemplaza sourceIngredientId por targetIngredientId en todas las recetas del usuario
    - [ ] Elimina el ingrediente fuente del repositorio
- [ ] Paso 2: Añadir opción "Fusionar ingredientes" al menú de ingredientes en CLI
- [ ] Paso 3: Tests del use case

### Fase 16: ^^ Versión WEB Desktop (Next.js)

Migración de la CLI a interfaz web basada en los mockups aprobados por la usuaria. Todo el dominio existente se reutiliza tal cual.

- [ ] Paso 1: ^^ Preparar proyecto Next.js 14+ con App Router y Tailwind
    - [ ] Inicializar proyecto Next.js
    - [ ] Configurar `@/` alias para apuntar a `./src/*`
    - [ ] Configurar `tsconfig-paths` para el dominio existente
    - [ ] Copiar carpeta `src/` completa dentro del proyecto Next.js
- [ ] Paso 2: ^^ Landing page (HU-00.1)
- [ ] Paso 3: ^^ Login / Registro con Supabase Auth (HU-01.1, HU-01.2)
    - [ ] Configurar Supabase project + schema
    - [ ] Implementar server actions de login/signup
    - [ ] Implementar middleware para proteger rutas
    - [ ] Mock Auth con `TEST_USER` para desarrollo
- [ ] Paso 4: ^^ Dashboard principal (HU-01.3)
- [ ] Paso 5: ^^ Pantalla de recetas (HU-03.1 a HU-03.4)
    - [ ] Listado con filtros por etiqueta y búsqueda por nombre (HU-03.2)
    - [ ] Formulario de creación/edición con autocompletado de ingredientes (RF-01.3)
    - [ ] Eliminación con advertencia de uso en planificaciones (HU-03.4)
- [ ] Paso 6: ^^ Pantalla de ingredientes maestros (HU-02.1, HU-02.2)
    - [ ] CRUD + fusión de ingredientes (de Fase 15)
- [ ] Paso 7: ^^ Pantalla de etiquetas (HU-04.1 a HU-04.3)
- [ ] Paso 8: ^^ Pantalla de planificaciones (HU-05.1 a HU-05.5)
    - [ ] Historial + creación + duplicación
    - [ ] Editor detallado con vista semanal tipo grilla
    - [ ] Configuración de comensales, exclusiones, preferencias (bulk edit)
    - [ ] Botón "Autoplanificar" (de Fase 14)
- [ ] Paso 9: ^^ Vista de ingredientes necesarios (HU-06.3)
- [ ] Paso 10: ^^ Vista de lista de la compra con checkboxes (HU-06.4)
    - [ ] Accesibilidad táctil: 44x44 px, contraste 4.5:1, aria-live

### Fase 17: ^^ Versión WEB Mobile (responsive)

Optimización de la UI existente para contexto móvil, siguiendo los mockups.

- [ ] Paso 1: Adaptar layout a mobile-first con Tailwind (`sm:` / `md:` breakpoints)
- [ ] Paso 2: Optimizar lista de la compra para uso en supermercado (checkboxes grandes, swipe, contraste solar)
- [ ] Paso 3: Probar accesibilidad WCAG 2.1 AA (lectores de pantalla, target size, contraste)

### Fase 18: ^^ Infraestructura de persistencia Postgres

- [ ] Paso 1: Docker Compose para Postgres local (del diseño técnico)
- [ ] Paso 2: Configurar Prisma ORM con `schema.prisma` mapeando el Domain Model
- [ ] Paso 3: Implementar repositorios Postgres (`PostgresPlanningRepository`, etc.)
- [ ] Paso 4: Migrar seed de etiquetas de sistema a Prisma
- [ ] Paso 5: Tests de integración con base de datos real

### Fase 19: ^^ Despliegue en cloud + seguridad

- [ ] Paso 1: Conectar Supabase Postgres (producción)
- [ ] Paso 2: Políticas RLS (Row-Level Security) para aislamiento multitenant
- [ ] Paso 3: Rate limiting en endpoints de auth (OWASP)
- [ ] Paso 4: Sanitización XSS con `isomorphic-dompurify`
- [ ] Paso 5: Desplegar en Vercel (CI/CD desde GitHub)
- [ ] Paso 6: Tests E2E opcionales (Playwright)
- [ ] Paso 7: Revisión de seguridad estricta y robustez

### Fase 20: Preparación académica final

- [ ] Documentación del proyecto
- [ ] Memoria del TFM
- [ ] Presentación / defensa
