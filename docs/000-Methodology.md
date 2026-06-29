# Bitácora Metodológica y Flujo de Ingeniería de Software

Este documento describe el proceso de diseño iterativo seguido para el desarrollo del **Planificador de Comidas Semanal**. Detalla el orden lógico en el que se crearon los documentos, la justificación de este flujo y las pequeñas evoluciones (iteraciones) que sufrió cada uno a partir de la retroalimentación y el análisis arquitectónico.

---

## 1. El Flujo de Trabajo Profesional (The Engineering Pipeline)

En la ingeniería de software profesional, el desarrollo de un producto no comienza con la escritura de código, sino con un desglose progresivo desde la **idea abstracta** hasta el **diseño de bajo nivel**. El orden de creación de nuestros artefactos fue:

```
[ PRD ] (Voz de la clienta)
   |
   v
[ SRS ] (Requisitos formales)
   |
   v
[ MODELO DE DOMINIO ] (Diseño conceptual y DDD)
   |
   v
[ DISEÑO TÉCNICO ] (Stack de tecnología e infraestructura)
   |
   v
[ HISTORIAS DE USUARIO ] (Definición del comportamiento de la aplicación)
   |
   v
[ MOCKUP ] (Aspecto visual de la aplicación)
   |
   v
[ ROADMAP ] (Hoja de ruta y tareas)
```

### ¿Por qué en este orden?
Si hubiéramos elegido el stack tecnológico primero, estaríamos forzando las necesidades de tu mujer a adaptarse a las limitaciones de una base de datos o framework concreto. Al diseñar en este orden, garantizamos que **la tecnología está al servicio del negocio**, y no al revés. Cada documento actúa como un plano que valida al siguiente.

---

## 2. Evolución Iterativa de los Documentos

A continuación, se detalla la historia y refinamiento de cada archivo del proyecto:

### Paso 1: `Docs/001-PRD.md` (Product Requirements Document)
*   **Origen:** Originalmente creado como `First approach.md` por el usuario y la clienta principal (su esposa).
*   **Propósito:** Capturar la necesidad pura, el dolor de cabeza de "qué comer" y el flujo lógico de compra e ingredientes sin tecnicismos informáticos.
*   **Evolución:** Se mantuvo **intacto** en cuanto a contenido para conservar la voz pura de la clienta. Únicamente se renombró a `PRD.md` para alinearse con los estándares de la industria y servir como Línea Base (Baseline).

### Paso 2: `Docs/002-SRS.md` (Software Requirements Specification)
*   **Origen:** Creado a partir del PRD para traducir las necesidades en compromisos funcionales y restricciones de calidad.
*   **Primera versión:** Definió los módulos CRUD de recetas, el planificador básico, la lista de ingredientes consolidada y la lista de la compra, junto con criterios de rendimiento (RNF).
*   **Iteración:** Tras analizar la seguridad y usabilidad profunda, se añadieron requisitos cruciales:
    *   `RF-01.6` (Gestión independiente del catálogo de ingredientes).
    *   `RF-02.5` (Duplicación de planificaciones para plantillas).
    *   `RF-06` (Módulo completo de seguridad, inicio de sesión y aislamiento estricto de datos).
    *   `RNF-01` (Redefinición a interfaz responsiva adaptativa dual: Mobile-First y Desktop-First).
    *   `RNF-04` (Seguridad de transferencia HTTPS y encriptación de claves).

### Paso 3: `Docs/003-DomainModel.md` (Domain Model)
Este documento fue el que experimentó las iteraciones más valiosas de ingeniería:
*   **Primera versión:** Diseñó entidades globales para Despensa y Compra, y modeló los días del menú asociados a coordenadas de semana/día.
*   **Iteración 1 (Días Secuenciales relativos):** Se cambió la representación del tiempo a un número secuencial relativo (`Día 1..N`). Esto permite copiar menús fácilmente y calcular las fechas del calendario "al vuelo" sin acoplar la base de datos a fechas absolutas.
*   **Iteración 2 (Vistas Virtuales / Proyecciones):** Se determinó que almacenar físicamente las listas de ingredientes y compras causaría desincronización y redundancia. Se rediseñaron como **vistas virtuales calculadas al vuelo en memoria** (Read Models). El inventario de despensa y compras se movió localmente dentro de cada `Planning`.
*   **Iteración 3 (Unificación de Unidades y Multitenencia):** Se reemplazaron las cantidades complejas por `comidas_cobertura` (porciones cubiertas), convirtiendo el cálculo de la lista de compras en una simple resta matemática. Se introdujo el campo `user_id` en todos los agregados para aislar los datos de cada cuenta.

### Paso 4: `Docs/004-TechnicalDesign.md` (Technical Design Document)
*   **Origen:** Traduce el modelo de dominio a herramientas concretas de programación e infraestructura.
*   **Primera versión:** Definió un stack de TypeScript monostack (Next.js con Server Actions), Postgres, Prisma ORM y Vitest para desarrollo local en Docker.
*   **Iteración de Seguridad e Interfaz:**
    *   **Seguridad Multi-capa y Cumplimiento OWASP:** Se incorporó el diseño detallado de **Supabase Auth** y la implementación de seguridad en dos capas (Middleware en Next.js y políticas RLS - *Row-Level Security* - en PostgreSQL). Se añadieron especificaciones de **prevención de XSS** mediante sanitización con `isomorphic-dompurify` para campos libres y **mitigación de fuerza bruta (Rate Limiting)** para inicios de sesión sospechosos por IP.
    *   **Diseño Responsivo Contextual (FutureIdea #3):** Se integró **Tailwind CSS** en el stack de tecnología para dar soporte nativo a un diseño adaptativo. Se diseñó la UI bajo una arquitectura responsiva dual: una interfaz móvil de alta densidad táctil para el uso en movilidad (supermercado/cocina) y una vista expandida tipo matriz panorámica de planificación para ordenadores de escritorio.
    *   **Simulación de Identidad (FutureIdea #5 / Mock Auth):** Se especificó el uso de la variable de entorno `TEST_USER` para habilitar un bypass de autenticación local y en pruebas de integración, inyectando de manera transparente una identidad de usuario ficticio sin depender de servicios externos de red.
    *   **Arquitectura de Accesibilidad (A11Y):** Se definió el uso de librerías de componentes sin estilo (*Headless* como Radix o Headless UI) para garantizar la accesibilidad de teclado y lectores de pantalla. Se especificó el estándar táctil WCAG AA de área táctil mínima de **44x44px** y contraste mínimo de **4.5:1** para asegurar un uso cómodo en el supermercado.

### Paso 5: `Docs/005-UserStories.md` (User Stories & BDD Backlog)
*   **Origen:** Creado para traducir el SRS en escenarios de prueba funcionales y tangibles, utilizando el formato ágil de Historias de Usuario y criterios de aceptación en sintaxis Gherkin (Dado/Cuando/Entonces).
*   **Primera versión:** Esbozó las historias básicas de recetas, planificación y checklists.
*   **Iteración de Calidad y Robustez:** Basándose en una revisión minuciosa de diseño, se aplicaron ajustes cruciales:
    *   **Persistencia Agnóstica (Repository Pattern):** Se desvinculó la lógica de negocio de la infraestructura de almacenamiento física usando el Patrón Repositorio. El sistema soporta dos implementaciones dinámicas (En Memoria para Vitest y Postgres para producción), configurables en tiempo de ejecución a través de la variable de entorno `PERSISTENCE_TYPE` (`MEMORY` o `SB_POSTGRES`).
    *   **Seguridad OWASP Avanzada:** Se implementaron los criterios OWASP para el manejo de contraseñas robustas en el registro y cambio de claves, y se detallaron las protecciones contra inyecciones XSS (sanitización) y ataques de fuerza bruta (Rate Limiting) en los accesos de usuario.
    *   **Trazabilidad de Rutas (Endpoints):** Se especificaron todas las URLs de redireccionamiento de la aplicación (ej. `/dashboard`, `/settings`, `/login`).
    *   **Gestión de Perfil con Validación de Doble Vía:** Se añadieron escenarios de cambio de nombre y un flujo altamente seguro de cambio de email en `/settings`. Este flujo exige que la nueva dirección sea pre-verificada por email, pero requiere una confirmación final explícitamente del usuario desde la app (estando logueado con su correo anterior) para evitar bloqueos accidentales o secuestros de cuentas por typos de email.
    *   **Garantía de No Orfandad (Borrados Seguros):** Se incorporaron criterios de advertencia/bloqueo de borrado si un ingrediente, receta o etiqueta está en uso en otra entidad (ej. advertir al borrar un ingrediente si está usado en alguna receta, o una receta si está en una planificación).
    *   **Fusión de Ingredientes:** Se creó una historia completa para permitir al usuario unificar ingredientes duplicados (ej. "huevo" y "huevos") migrando automáticamente todas las referencias.
    *   **CRUD Completo de Entidades:** Se añadieron las historias para editar y eliminar recetas, etiquetas y planificaciones de forma segura, incorporando advertencias explícitas si se reduce el número de semanas en una planificación (lo cual conlleva pérdida permanente de datos de los días removidos).
    *   **Nombres Descriptivos en Planificaciones (FutureIdea #1):** Se incorporó la posibilidad de añadir un nombre descriptivo opcional a las planificaciones (ej. "Menú de Invierno") en los requisitos (`RF-02.1` y `RF-02.6`), en el modelo de datos (`Planning.nombre: String?`) y en las historias de creación (`HU-05.1`), duplicación (`HU-05.3`, auto-sufijando con "(Copia)") y edición detallada (`HU-05.4`).
    *   **Criterios de Accesibilidad Universal (A11Y):** Se integraron escenarios específicos de navegación accesible de combobox (`HU-02.1` Escenario 2, bajo el estándar WAI-ARIA Combobox) y optimización en movilidad para el checklist de la compra (`HU-06.4` Escenarios 3 y 4, garantizando un área de toque de **44x44px**, contrastes de color mínimos de **4.5:1** y feedback sonoro vía lectores de pantalla mediante notificaciones `aria-live="polite"`).

### Paso 6: `Docs/006-MockUp` (Diseño general visual de la app)
*   **Origen:** Creado para representar visualmente la app. Validar aspecto general y colores usados.
*   **Primera versión:** Primeras dos iteraciones con Figma / Make.

### Paso 7: `Docs/007-RoadMap` (Hoja de ruta para implementación de la app)
Este documento contiene un largo listado de conceptos y pasos a seguir. Incluye todo lo necesario para saber como se ha construido la aplicación y me servirá personalmente como guía de estudio de los temas nuevos para mí.
*   **Origen:** Creado para detallar el paso a paso necesario para la construcción de la app.
*   **Primera versión:** Borrador orientativo.