# Slides — Planificador de Comidas

## Instrucciones para preparar la presentación

Formato: **Google Slides** (o PowerPoint / Canva).
Exportación final: PDF + enlace público en README.

Estilo visual:
- Fondo blanco / gris muy claro (#F8FAFC)
- Color primario: verde #007A55
- Texto: #0F172B (títulos) y #4F617B (cuerpo)
- Tipografía: sans-serif legible (Inter, Roboto o equivalente)
- Iconos: usar sets como Lucide, Heroicons o FontAwesome (línea fina, mismo peso visual)
- Las capturas de pantalla deben tener un borde sutil (#E2E8F0, border-radius 8px) y sombra ligera
- Máximo 15–20 palabras por punto, sin párrafos largos en las slides (el texto de apoyo va en este documento)

---

## Slide 1 — Portada

### Descripción
Título del proyecto, subtítulo breve, nombre del autor, máster y fecha.

Título del proyecto: PlanComidas
Subtitulo breve: Deja de pensar qué comer hoy
Nombre del autor: Juan Alonso Garcia
Máster: Desarrollo de software con IA
Fecha: 20/07/2026

Diseño minimalista: título grande centrado, línea decorativa fina debajo, luego información secundaria más pequeña.

### Recursos
- Logo de la aplicación (icono de la web, el de 48px escalado)
- Icono o logo del máster "Desarrollo de software con IA" — BigSchool (Brais Moure) (opcional, al pie)
- Fondo: gradiente sutil del verde corporativo (#007A55 → #0D9488) solo en una franja decorativa o en el borde inferior

### Texto de narración
> "Hola, soy Juan y este es mi Trabajo de Fin de Máster: **PlanComidas**. Una aplicación que permite organizar la alimentación semanal de forma inteligente, combinando un modelo de dominio sólido con un motor de autoplanificación. Lo he desarrollado como parte del máster Desarrollo de software con IA de BigSchool que tiene como tutor principal a Brais Moure."

---

## Slide 2 — Problema

### Descripción
Explicar el problema que se quiere resolver. Dos columnas:
- **Izquierda**: "Planificar comidas semanales es tedioso". Lista breve de dolores:
  - Pensar qué cocinar cada día
  - Repetir platos por falta de inspiración
  - No saber si falta algo en la despensa
  - Apps existentes: CRUD genérico + drag & drop, sin inteligencia
- **Derecha**: icono grande representando desorden/problema (tablero con post-its desordenados, o icono de cabeza con engranajes)

Al pie, una frase destacada: "Necesitamos un sistema que piense por nosotros, no solo que guarde datos."

### Recursos
- Icono de calendario desordenado o persona confundida
- Icono de lista con tachones
- Icono de cubo de basura (apps genéricas)
- Contraposición visual: desorden vs. orden

### Texto de narración
> "Planificar las comidas de la semana es una tarea que muchos encuentra tediosa. Hay que pensar qué cocinar, evitar repetir platos, acordarse de comprar los ingredientes que faltan… Las aplicaciones existentes se limitan a ser gestores de recetas con drag & drop — un CRUD con buena interfaz, pero sin inteligencia real. El problema no es guardar recetas, el problema es decidir qué cocinar cada día. Ahí es donde este proyecto se diferencia."

---

## Slide 3 — Ingeniería de software

### Descripción
Mostrar el proceso de ingeniería previo al desarrollo. Diagrama de flujo horizontal con 6 etapas conectadas por flechas:

```
PRD (Requisitos) → SRS (Especificación) → Domain Model → Tech Design → MockUps (Figma) → RoadMap
```

Debajo de cada etapa, un icono representativo y 2–3 palabras clave:
- PRD: 👤 Entrevista con usuaria real
- SRS: 📋 Requisitos formales
- Domain Model: 🧩 Entidades y VOs
- Tech Design: 🏗️ Stack y capas
- MockUps: 🎨 Figma / prototipo
- RoadMap: 🗺️ 23 fases planificadas

Al pie: "Cero líneas de código hasta tener el diseño validado."

### Recursos
- Iconos para cada etapa (documento, checklist, puzzle, engranaje, lápiz+diseño, mapa)
- Si se dispone: miniaturas de los documentos reales (PRD, SRS, Domain Model) en la esquina
- Logo de Figma (si se usó)
- Línea de tiempo visual con flechas horizontales

### Texto de narración
> "Antes de escribir una sola línea de código, el proyecto pasó por un proceso completo de ingeniería de software. Empezamos con un PRD —una reunión con la usuaria real para captar sus necesidades—, luego formalizamos los requisitos en un SRS, modelamos el dominio con entidades y value objects, diseñamos la arquitectura técnica, creamos mockups en Figma para validar la interfaz, y finalmente planificamos todo en un roadmap de 23 fases. Este enfoque permitió tener una visión clara del producto antes de empezar a implementar."

---

## Slide 4 — Stack tecnológico y arquitectura

### Descripción
Tres bloques visuales:

**Bloque 1 — Stack**: tabla o grid de iconos con nombres:
- TypeScript, Next.js 14, Tailwind CSS, Prisma 7, PostgreSQL, Supabase, Vitest, Vercel

**Bloque 2 — Arquitectura**: diagrama de capas Clean Architecture. Cuatro rectángulos concéntricos o apilados:
- **Domain**: Entidades, Value Objects, Agregados → sin dependencias externas
- **Application**: Casos de uso → orquestan el dominio
- **Infrastructure**: CLI, Postgres repos, Planner → implementaciones técnicas
- **Web**: Next.js (Server Components + Server Actions)

**Bloque 3 — Dato curioso**: "El dominio se desarrolló y testeó completamente desde CLI. La web se añadió después sin modificar una línea del dominio."

### Recursos
- Logos de cada tecnología (TypeScript, Next.js, Tailwind, Prisma, PostgreSQL, Supabase, Vitest, Vercel)
- Diagrama de capas (se puede generar con draw.io, excalidraw o similar)
- Icono de terminal (CLI) + icono de navegador (web) para el dato curioso

### Texto de narración
> "El stack combina tecnologías modernas: TypeScript en todo el ecosistema, Next.js 14 con App Router para la web, Prisma 7 con PostgreSQL para persistencia, Supabase para autenticación y Vercel para despliegue. Pero lo más importante es la arquitectura: Clean Architecture con DDD. El dominio es puro TypeScript, sin frameworks, sin dependencias externas. Tanto es así que todo el dominio se desarrolló y testeó desde la terminal —la interfaz web se añadió después sin tocar una línea del núcleo."

---

## Slide 5 — Modelo de dominio

### Descripción
Diagrama de los 4 agregados principales mostrando sus relaciones.

```
Tag ──< RecipeTag >── Recipe ──< RecipeIngredient >── Ingredient
                                                          │
Planning ──< PlannedDay ──< MealService                    │
                                      │                    │
                               (time → Tag.id)      (ingredientId)
```

Debajo, destacar los Value Objects más relevantes:
- `Id` (UUID), `Name` (3–100 chars), `DayOrder`, `CoversNumber`, `PrepCookTime`
- `TagDimension` (MOMENTO_DIA, FORMATO, TIPO_PLATO, ESTILOS_VIDA)

Al pie: "437 tests unitarios validan el modelo de dominio."

### Recursos
- Diagrama de agregados con sus relaciones (generado con mermaid.js o draw.io)
- Icono de cubo (agregado) para cada entidad principal
- Viñetas para los VOs destacados
- "437 ✅" como badge visual

### Texto de narración
> "El modelo de dominio se compone de cuatro agregados principales: Tag, Recipe, Ingredient y Planning. Las etiquetas se asignan a las recetas, las recetas contienen ingredientes, y las planificaciones organizan días con servicios que apuntan a recetas. Cada agregado está protegido por sus invariantes: un nombre no puede tener menos de 3 caracteres, una receta no puede existir sin etiquetas obligatorias, un servicio necesita un número válido de comensales. Todo esto validado por 437 tests unitarios."

---

## Slide 6 — Sistema de etiquetas

### Descripción
Explicar las 4 dimensiones de etiquetas y cómo estructuran la planificación.

**Visual principal**: una receta ejemplo (ej: "Tortilla de patatas") rodeada de sus etiquetas agrupadas por dimensión, con colores distintos:
- 🔵 MOMENTO_DIA → "Comida" (orden: 3)
- 🟠 FORMATO → "Caliente"
- 🟣 TIPO_PLATO → "Principal"
- ⚪ ESTILOS_VIDA → "Económico", "Rápido"

Debajo, destacar: "Cada receta necesita al menos una etiqueta de cada dimensión requerida."

A la derecha, una nota: "Las etiquetas de sistema (CALIENTE, FRIO, DESAYUNO…) tienen systemKey y no se pueden eliminar. Son la interfaz entre el usuario y el planificador."

### Recursos
- Captura de pantalla de la página de tags de la web (mostrando las 4 dimensiones con colores)
- Captura de pantalla de la página de edición de receta (mostrando selector de tags por dimensión)
- Círculos o pills de colores (los mismos que usa la app: blue, amber, purple, gray)
- Icono de etiqueta/tag al inicio de la slide

### Texto de narración
> "El sistema de etiquetas es la columna vertebral del dominio. Hay 4 dimensiones: momento del día, formato, tipo de plato y estilos de vida. Cada receta debe tener al menos una etiqueta de cada dimensión requerida —esto no es decorativo, es una regla de negocio. Las etiquetas de sistema, como 'Caliente' o 'Desayuno', tienen un identificador único ('systemKey') que el planificador automático usa para razonar sobre ellas. El usuario puede crear sus propias etiquetas, pero no puede eliminar las de sistema."

---

## Slide 7 — Planificador automático

### Descripción
Explicar el algoritmo de autoplanificación. Diagrama de flujo simplificado:

```
Recetas disponibles
       ↓
  Filtro hard: exclusiones, MOMENTO_DIA, no repetir
       ↓
    Candidatos
       ↓
  Score soft: preferencias (+10), balance frío/caliente (+5), diversidad TIPO_PLATO (+3)
       ↓
   Mejor receta asignada al slot
```

A la derecha, destacar los dos tipos de restricciones:
- **Hard**: Exclusiones, momento del día incorrecto, receta ya usada → descarta
- **Soft**: Preferencias, balance frío/caliente, variedad de plato → puntúa

Al pie: Resultado de ejemplo: "10 servicios → 7 calientes, 3 fríos (objetivo: 70%)"

### Recursos
- Captura del modal "Autoplanificar" de la web
- Captura del slider de balance frío/caliente (0–100%) del modal de edición de planificación
- Captura de la cuadrícula con recetas ya asignadas (resultado post-planificar)
- Diagrama de flujo (flechas descendentes, cajas de decisión)
- Iconos: varita mágica (✨), check (✓), x (✗)

### Texto de narración
> "El planificador automático es el corazón del producto. Usa un algoritmo greedy: para cada servicio vacío, filtra las recetas candidatas aplicando restricciones hard —que respetan las exclusiones del servicio, el momento del día y evitan repetir platos. Luego puntúa las candidatas con criterios soft: las preferencias suman 10 puntos, el balance frío/caliente suma 5 si acerca la distribución al objetivo, y la diversidad de tipo de plato suma 3. La receta con mayor puntuación se asigna. El resultado se muestra en la cuadrícula, y el usuario siempre puede ajustar manualmente lo que no le convenza."

---

## Slide 8 — Web: Editor semanal

### Descripción
Mostrar la interfaz principal del editor de planificación.

**Captura grande** de la cuadrícula semanal con recetas asignadas, resaltando:
- Los 7 días de la semana como columnas
- Los momentos del día (Desayuno, Comida, Cena, Merienda) como filas
- Las tarjetas de receta dentro de cada celda
- El indicador de comensales y preferencias/exclusiones en cada servicio
- Los botones de acción: Autoplanificar, Añadir día, Editar datos

Al lado o debajo, **detalle del modal de celda** (MealCellModal) mostrando:
- Selector de receta con búsqueda
- Checkbox "Saltar restricciones"
- Selector de comensales
- Panel de preferencias y exclusiones por dimensión

### Recursos
- Captura de pantalla grande del editor semanal (planning-grid.tsx) con datos reales
- Captura del modal de celda (meal-cell-modal.tsx) abierto sobre un servicio
- Captura del panel de preferencias/exclusiones expandido
- Opcional: captura mostrando el balance frío/caliente en la cabecera

### Texto de narración
> "El editor semanal es la pantalla principal de la web. Muestra la planificación en una cuadrícula donde cada columna es un día y cada fila es un momento del día —desayuno, comida, cena. Cada celda permite asignar una receta, configurar comensales, y definir preferencias y exclusiones por dimensión. Por ejemplo, puedo decir que para los desayunos quiero evitar lácteos o prefiero algo rápido. El botón de autoplanificar usa toda esa información para rellenar los huecos vacíos automáticamente."

---

## Slide 9 — Mobile responsive

### Descripción
Mostrar la adaptación responsive de la web.

**Dos dispositivos** en fila:
- Escritorio: la cuadrícula completa
- Móvil: carrusel de días con Embla carousel, cards de servicios apiladas

Destacar adaptaciones específicas:
- Target táctil mínimo 44×44px en botones
- Contraste WCAG 2.1 AA en todos los colores
- Navegación por gestos (swipe entre días)
- Sidebar convertida en menú hamburguesa

### Recursos
- 2 capturas: desktop / mobile del editor de planificación
- Icono de dispositivos (monitor, teléfono)
- Badge "WCAG 2.1 AA ✅" con icono de accesibilidad
- Opcional: captura de la lista de la compra en móvil (uso en supermercado)

### Texto de narración
> "La web es completamente responsive. En escritorio se ve la cuadrícula completa de 7 columnas. En móvil, los días se navegan mediante un carrusel con gestos táctiles —ideal para usar la lista de la compra en el supermercado. Todos los botones tienen un tamaño mínimo de 44 por 44 píxeles para uso táctil, y los colores cumplen con el estándar de contraste WCAG 2.1 AA."

---

## Slide 10 — Testing

### Descripción
Pirámide de testing visual con los números del proyecto.

```
         ╱╲
        ╱  ╲
       ╱ E2E╲
      ╱──────╲
     ╱Integration╲
    ╱  (52 tests) ╲
   ╱────────────────╲
  ╱   Unit / Domain   ╲
  ╱   (437 tests)      ╲
 ╱────────────────────────╲
```

Debajo, tres columnas:
- **Unitarios (437)**: Dominio + Aplicación, corren sin BD, en milisegundos
- **Integración (52)**: Repositorios Postgres, requieren BD real, validan persistencia
- **Arquitectura**: Clean Architecture permite testear el dominio sin infraestructura

Al pie: "76 ficheros de test, todos verdes."

### Recursos
- Pirámide de testing visual (se puede hacer con formas geométricas simples)
- Icono de escudo ✅ verde
- Badges: "437 unit", "52 integration", "76 files", "✅ All green"
- Opcional: terminal mostrando "npm test" con todos los tests pasando

### Texto de narración
> "El proyecto tiene 437 tests unitarios y 52 tests de integración, todos en verde. Los tests unitarios cubren el dominio y los casos de uso —corren en milisegundos sin necesidad de base de datos porque usan repositorios en memoria. Los tests de integración validan que los repositorios Postgres persisten y recuperan correctamente los aggregates. La pirámide está bien equilibrada: muchos tests unitarios rápidos, menos tests de integración lentos, y la arquitectura Clean permite testear la lógica de negocio sin depender de la infraestructura."

---

## Slide 11 — Despliegue

### Descripción
Mostrar la evolución de la persistencia y el despliegue.

Línea de tiempo horizontal con 3 hitos:

```
Archivos JSON (dev) ───→ Postgres Docker (local) ───→ Supabase + Vercel (prod)
       🗄️                          🐘                          ☁️
   data/*.json              docker-compose.yml          supabase + vercel
```

Debajo, destacar:
- **Persistencia**: 2 modos intercambiables via variable de entorno `STORAGE_BACKEND`
- **Auth**: Cookie-based (local) → Supabase Auth (producción)
- **Seguridad**: Políticas RLS en Postgres, service_role key para operaciones administrativas
- **URL**: `https://planificador-comidas.vercel.app`

### Recursos
- Captura de la web desplegada (pantalla completa)
- Logos de Supabase y Vercel
- Icono de candado (seguridad / RLS)
- Captura del pipeline de despliegue (Vercel dashboard o GitHub Actions) si existe

### Texto de narración
> "El proyecto empezó con persistencia en archivos JSON para desarrollo rápido, luego migró a Postgres con Docker para el entorno local, y finalmente se desplegó en Supabase (base de datos + autenticación) y Vercel (frontend). Los 2 modos de persistencia son intercambiables cambiando una variable de entorno (File / Postgres). En producción se aplican políticas RLS para garantizar que cada usuario solo vea sus propios datos."

---

## Slide 12 — Lecciones aprendidas y conclusiones

### Descripción
Dos columnas:

**Izquierda: "Lo que funcionó"**
- Ingeniería de software previa al código
- Clean Architecture + DDD (dominio reutilizable entre CLI y Web)
- Tests como herramienta de diseño, no solo de verificación
- RoadMap como guía, no como camisa de fuerza

**Derecha: "Lo que haría diferente"**
- Virtual scrolling / paginación desde el inicio para listas grandes
- Read models para consultas en lugar de cargar aggregates completos
- Un ORM más liviano que Prisma para este tamaño de proyecto

**Colofón** al centro: "El proyecto cumple el objetivo: una aplicación real, bien construida, que resuelve un problema real."

### Recursos
- Icono de check verde ✅ para columna izquierda
- Icono de reloj ⌛ o archivo 🗄️ para columna derecha
- Icono de estrella ⭐ o bandera 🏁 para el colofón
- Foto personal (opcional) para dar cercanía

### Texto de narración
> "Como lecciones aprendidas, destaco tres cosas. Primero: la ingeniería de software previa evitó tener que rehacer el diseño a medio camino. Segundo: Clean Architecture demostró su valor cuando añadimos la web sin tocar el dominio. Y tercero: los tests unitarios son una herramienta de diseño, no una carga. Si algo haría diferente, sería incorporar virtual scrolling y read models ligeros desde el inicio para evitar cuellos de botella de rendimiento en listas grandes, y quizás elegir un ORM más ligero que Prisma para un proyecto de este tamaño."

---

## Slide 13 — Gracias

### Descripción
Slide final. Título grande "Gracias", nombre del autor, enlaces:
- Repositorio: `https://github.com/EvansVanseth/planificador-comidas`
- Web: `https://planificador-comidas-rho.vercel.app/`
- Email / LinkedIn (opcional)

Incluir agradecimiento a Brais Moure y al equipo del máster.

Fondo: mismo estilo que la portada pero invertido (verde arriba, blanco abajo) o una foto de fondo sutil.

### Recursos
- Logos: GitHub, web, LinkedIn (opcional)
- Logo del máster
- Icono de código (</>)
- QR opcional que enlace al repositorio

### Texto de narración
> "Muchas gracias por tu tiempo. El código está disponible en GitHub y la aplicación desplegada en Vercel. Puedes probarla con el usuario de prueba que encontrarás en el README del proyecto. Ha sido un viaje increíblemente formativo. Gracias a Brais Moure y a todo el equipo del máster por hacer esto posible."
