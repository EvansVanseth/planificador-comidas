# RoadMap (Hoja de ruta) - Planificador de comidas

Este documento contiene todos y cada uno de los pasos a seguir para la construcción de la app. La misma es un listado de tareas, con pequeños parones o desgloses adicionales a medida que se vean necesarios para aprender conceptos nuevos o asentar nuevos temas vistos en el Master. 

*Abreviaturas*
- Los elementos marcados con `^^` son temas que aprederemos durante la elaboración de este software. Principalmente los que dispongan de ellos o se realizará un proyecto separado para su puesta en práctica o se escribirá a mano la mayoría del código. 
- Los elementos marcados con `!!` son temas que hemos aprendido durante el transcurso del Master.
- Los elementos marcados con `..` son temas que ya conocíamos en anterioridad o que usabamos desconociendo su nombre técnico.

- [x] Fase 0: Ingeniería de software (docs/)
    - [x] Paso 0: .. Redactar metodología  y flujo de trabajo
    - [x] Paso 1: .. (PRD) Redactar documento con clienta de requisitos
    - [x] Paso 2: !! (SRS) Elaborar requisitos formales  
    - [x] Paso 3: !! (Dominio) Elaborar modelo de dominio  
    - [x] Paso 4: !! (Diseño) Plantear stack tecnológico e infraestructura  
    - [x] Paso 5: !! (Historias de usuario) Definir el comportamiento
    - [x] Paso 6: !! (MockUp) Borrador de aspecto inicial
    - [x] Paso 7: .. (RoadMap) Inicio de este documento

- [ ] Fase 1: Dominio puro (/domain)
    - [x] Paso 0: Preparación (docs/F01-EnvConfig.md)
        - [x] .. Git
        - [x] ^^ TypeScript
        - [ ] ^^ DDD (Domain-driven design)
        - [ ] ^^ TDD (Test-driven development)
    - [x] Paso 1: ^^ Bounded contexts: Definir
        - [x] domain/recipes (Recetas - Libro de cocina)
        - [x] domain/planning (Planificación - Calendario y plan)
        - [x] domain/users (Usuarios)
        - [x] domain/shared (Global)
    - [x] Paso 2: ^^ Recetas (creando los primeros VO)
        - [x] tag-dimension.vo.ts
        - [x] prep-cook-time.vo.ts
    - [x] Paso 3: ^^ Profundizando en VO, entities, aggregates y errores
        - [x] Planificación
            - [x] start-date.vo.ts
            - [x] planned-weeks.vo.ts
            - [x] day-order.vo.ts
            - [x] covers-number.vo.ts
            - [x] meal-time.enum.ts
            - [x] meal-service.interface.ts
            - [x] planned-day.entity.ts
            - [x] planning.aggregate.ts
        - [x] Errors
            - [x] DomeinError
            - [x] NullError
            - [x] NoIntegerError
            - [x] OutRangeError
            - [x] MinRangeError
            - [x] MaxRangeError
        - [x] Global
            - [x] id.vo.ts
            - [x] name.vo.ts

- [x] Fase 2: Terminal CLI (como interactuamos con el dominio) (/application y /repositories)
    - [x] Paso 1: Preparar la terminal
        - [x] Preparación bucle CLI
        - [x] Configuración entorno (script: npm run cli)
        - [x] Comprensión del flujo de datos
        ( domain -> usecases -> container (inyecta repositorio) -> **cli** / WEB / backend )
    - [x] Paso 2: Preparar repositorio en memoria
        - [x] interface PlanningRepository (QUE)
        - [x] implementación PlanningRepository en memoria (COMO)
    - [x] Paso 2: Preparar primer use case
        - [x] useCase con inyección del interface PlanningRepository (QUE)
    - [x] Paso 3: Preparar el acceso principal
        - [x] container, la puerta de entrada al dominio (di MELOR amigo!)
    - [x] Paso 4: Mejorando la interfaz CLI
        - [x] configuramos cli para usar menus con Prompts
        - [x] uso del useCase en cli.ts a través de container
        - [x] construcción de interfaz básica (crear y leer plannings)
    - [x] Paso 5: Selección de tipo de repositorio desde el cliente
        - [x] selección por usuario de tipo de persistencia (por ahora ambas 'memory')
        - [x] reestructuración de carpetas (**comprendiendo el conjunto**)
        ```
        /src
            /domain             <-- Reglas de negocio (El corazón)
            /application        <-- Casos de uso (El flujo)
            /infrastructure
            /repositories       <-- Persistencia (Lo que inyectas)
                /cli            <-- TU APP ACTUAL
                /web            <-- una posible futura App Web (React/Vue/etc.)
                /server         <-- un posible futuro Backend (Express/Fastify)
                container.ts    <-- El cerebro que conecta todo
        ```
    - [x] Paso 6: Creación de persistencia en archivo
        - [x] crear conversión y lectura de primitivas para entidades y agregados

--- A partir de este punto : Uso de OpenCode para seguir programando ---
```
    IA Agent: OpenCode (Build / Plan)
    IA Model: DeepSeek V4 Flash Free
    MCP:
        - context7
        - engram
    Gentle-AI: Persona installed
    InRepo: AGENTS.md 
    Skills: Not used
```

- [x] Fase 3: Completar domain
    - [x] Paso 1: Crear VO y agregado para Bounded Context (Users) `domain/users/`
        - [x] user-id.vo.ts + user-id.vo.spec.ts
        - [x] user.aggregate.ts + user.aggregate.spec.ts
    - [x] Paso 2: Ajustes varios para sostener applicación y infraestructura
        - [x] Refactoricar Planning para usar IdUser
        - [x] Refactoricar Planning para usar IdUser
        - [x] Ajustado CLI y repositorios para el nuevo create con userId de Planning (Por ahora usaremos un mockIdUser)
    - [x] Paso 3: Creación de otros enum, VO, entities y agregados de recipes
        - [x] Conversión de TagDimension de VO a enum (+ test)
        - [x] Ajuste de MealTime (se ha añadido test)
        - [x] tag.aggregate.ts + tag.aggregate.spec.ts
        - [x] ingredient.aggregate.ts + ingregient.aggregate.spec.ts
        - [x] recipe-ingredient.vo.ts + recipe-ingregient.vo.spec.ts
        - [x] recipe.aggregate.ts (+spec) + base-servings.vo (+spec)
        - [x] refactor mealservice from enum to entity
        - [x] planning-pantry-item.entity.ts (+spec)
        - [x] planning-shopping-item.entity.ts (+spec)
        - [x] refactor planning.aggregate.ts (added planning pantry and shopping items)
- [x] Fase 4: Casos de uso + InMemoryRepositories (para tests): Revisar agregados (puertas de acceso al dominio)
        - [x] Listar, crear, modificar y eliminar (en adelante CRUD) Tags (etiquetas)
        - [x] CRUD Ingredients (ingredientes)
        - [x] CRUD Recipes (recetas)
        - [x] CRUD Plannings (planificaciones)
- [ ] Fase 5: CLI + FilePersistence
        - [x] Refactorizar estructura de menus
        - [x] Menu para manejar CRUD de Tags
        - [x] Menu para manejar CRUD de Ingredients
        - [x] Menu para manejar CRUD de Recipes
        - [x] Menu para manejar CRUD de Plannings (de este ya hay algo hecho)   
        - [x] Valorar métodos para añadir etiquetas de sistema y evitar que se puedan eliminar
            **MOMENTO_DIA**: Deben coincidir con MealTime. Estas etiquetas añadidas a las recetas indican para qué momento del día pueden ser asignadas las recetas, pero deben estar limitadas a las opciones que ofrece la planificación. Pues PlannedDay dispone de un espacio para BREKFAST, uno para LUNCH y otro para DINNER.
            Tenemos dos opciones de las que plantear opciones: permitir que al planificar se especifique qué etiquetas de momento día queremos para cada dia (PlannedDay debería disponer de un map para recibir esas etiquetas; es más flexible pero más dificil de programar) o no permitir la personalización de las etiquetas MOMENTO_DIA y que estén por sistema fijadas en BREAKFAST, LUNCH y DINNER. 
            **Se decide usar (Desayuno, comida y cena) como etiquetas de sistema con permiso para personalización extra.**
            - [x] Desayuno (MOMENTO_DIA)   
            - [x] Comida (MOMENTO_DIA)   
            - [x] Cena (MOMENTO_DIA)   
            **FORMATO**: Solamente pueden existir dos por sistema sin personalización (Caliente / Frio).  
            - [x] Caliente (FORMATO)   
            - [x] Frio (FORMATO)   
            **TIPO_PLATO**: La siguiente lista es de sistema, pero pueden añadirse más por parte del usuario (sin duplicados).
            - [x] Carne (TIPO_PLATO)   
            - [x] Pescado (TIPO_PLATO)   
            - [x] Legumbres (TIPO_PLATO)   
            - [x] Pasta (TIPO_PLATO)   
            - [x] Ensalada (TIPO_PLATO)   
            - [x] Arroz (TIPO_PLATO)   
            - [x] Dulce (TIPO_PLATO)   
            **ESTILOS_VIDA**: La siguiente lista es de sistema, pero pueden añadirse más por parte del usuario (sin duplicados).
            - [x] Bajo en calorías (ESTILOS_VIDA)   
            - [x] Vegetariano (ESTILOS_VIDA)  
            - [x] Vegano (ESTILOS_VIDA)  
        - [x] Implementar persistencia en archivo para Etiquetas  
        - [x] Implementar persistencia en archivo para Ingredientes  
        - [x] Implementar persistencia en archivo para Recetas
        - [x] Implementar persistencia en archivo para Plannings (revisar estado)   
- [ ] Fase 6: Nombres únicos
        - [x] Los nombres de las etiquetas deben ser únicos para cada dimension
        - [x] Los nombres de los ingredientes deben ser únicos 
        - [x] Los nombres de las recetas deben ser únicos
        - [x] Los nombres de las planificaciones deben ser únicos
        - [x] Para los ingredientes debemos presentar al usuario ingredientes similares de forma que se evite duplicidades como Tomte, tomate, tomates, etc...
- [x] Fase 7: Gestión de ingredientes y etiquetas de una receta
        - [x] Añadir/Eliminar ingredientes existentes de una receta — vía `updateRecipe` con `addIngredients`/`removeIngredients`
        - [x] Añadir/Eliminar etiquetas existentes de una receta — vía `updateRecipe` con `addTags`/`removeTags`
        - [x] Añadir ingrediente nuevo a una receta — `AddNewIngredientToRecipeUseCase`
        - [x] Añadir etiqueta nueva a una receta — `AddNewTagToRecipeUseCase`
        - [x] Deben mantenerse unicos los ingredientes y las etiquetas por receta 
- [ ] Fase 8: Crear vistas (Virtual views) proyectadas de una planificación
        - [ ] Vista NeededIngredients
        - [ ] Vista ShoppingList

- [ ] Fase 9: Crear dominio para usuarios y autenticación
- [ ] Fase 10: Preparar autenticación por CLI

- [ ] Fase X: Motor de autoplanificación
- [ ] Fase X: Infraestructura de persistencia postgres en local
- [ ] Fase X: Infraestructura de persistencia postgres en supabase

- [ ] Fase X: Creación versión WEB Desktop
- [ ] Fase X: Creación versión WEB Mobile
- [ ] Fase X: Revisión de seguridad estricta y robustez

- [ ] Fase X: Despliegue en cloud
- [ ] Fase X: Preparación academica final

