# Planificador de Comidas

Aplicación para planificar comidas semanales: gestiona recetas, ingredientes, etiquetas y planificaciones con un motor de autoplanificación que respeta preferencias, exclusiones y balance frío/caliente.

Proyecto de fin del máster **"Máster de desarrollo con IA"** de Brais Moure.

## Proyecto desplegado
URL: **https://planificador-comidas-rho.vercel.app/**  
Usuario: **evansvanseth@gmail.com**  
Contraseña: **J83a13g11_a**  

## SLIDE de presentación
URL:   

## VIDEO de presentación
URL:   

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Lenguaje | TypeScript (NodeNext, ES2022) |
| Arquitectura | Clean Architecture + DDD (Hexagonal) |
| Frontend web | Next.js 14 (App Router, Server Components, Server Actions) |
| Estilos | Tailwind CSS |
| CLI | `prompts` (menús interactivos) |
| Testing | Vitest |
| ORM | Prisma 7 con driver adapters (`@prisma/adapter-pg`) |
| Base de datos | PostgreSQL 17 (producción) / JSON file (local) |
| Auth | Supabase Auth (producción) / Cookie-based (local) |
| Despliegue | Vercel (producción) |

---

## Requisitos previos

- **Node.js** 20+ y npm
- **Git**
- (Opcional) **Docker Desktop** — solo si quieres Postgres local
- (Opcional) **Supabase CLI** — solo si quieres auth local con Supabase

---

## Instalación y ejecución

### 1. Clonar e instalar

```bash
git clone https://github.com/EvansVanseth/planificador-comidas
cd TFM
npm install
cd web && npm install && cd ..
```

### 2. Probar la aplicación

El proyecto ofrece **dos modos de ejecución**: CLI y Web. El modo con persistencia en archivo JSON no necesita base de datos ni Supabase.

#### Opción A: CLI (recomendada para probar todas las funcionalidades)

```bash
# Persistencia en archivo (no necesita Postgres)
STORAGE_BACKEND=file npm run cli
```

Menú de persistencia: **Archivo (Persistentes)**  
Menú de usuario: **Juan**  
**Este usuario** es el usado para test de todas las funcionalidades durante desarrollo. **Ya contiene información para** que puedan verse y **probarse las funcionalidades de la aplicación**.

#### Opción B: Web con persistencia en archivo

```bash
# Persistencia en archivo (no necesita Postgres)
cd web
STORAGE_BACKEND=file npm run dev
```

Abre `http://localhost:3000` e inicia sesión con **juan@plancomidas.com** (la contraseña se ignora en modo archivo). El usuario corresponde al mismo usuario que en CLI.

---

## Estructura del proyecto

```
TFM/
├── src/                          # Código fuente del dominio (independiente de framework)
│   ├── domain/                   # Capa de dominio (Clean Architecture)
│   │   ├── planning/             # Agregado Planning (días, servicios, planner)
│   │   ├── recipes/              # Agregado Recipe (recetas, ingredientes)
│   │   ├── tags/                 # Agregado Tag (etiquetas de sistema y usuario)
│   │   ├── ingredients/          # Agregado Ingredient
│   │   ├── users/                # Agregado User
│   │   └── shared/               # VOs compartidos (Id, Name, DomainError)
│   ├── application/              # Casos de uso (orquestan la lógica de dominio)
│   │   ├── planning/
│   │   ├── recipes/
│   │   ├── tags/
│   │   ├── ingredients/
│   │   └── users/
│   ├── infrastructure/           # Implementaciones técnicas
│   │   ├── cli/                  # Interfaz de línea de comandos
│   │   ├── repositories/         # Repositorios (Postgres, archivo, in-memory)
│   │   └── planner/              # Motor de autoplanificación (GreedyPlanner)
│   └── application/              # Use cases compartidos
├── web/                          # Proyecto Next.js (frontend web)
│   └── src/
│       ├── app/                  # App Router (páginas y layouts)
│       │   ├── login/
│       │   ├── signup/
│       │   ├── dashboard/
│       │   │   ├── recipes/
│       │   │   ├── ingredients/
│       │   │   ├── tags/
│       │   │   ├── plannings/
│       │   │   └── settings/
│       │   └── ...
│       ├── components/           # Componentes React reutilizables
│       └── lib/                  # Utilidades (auth, conexión BD)
├── prisma/                       # Schema y migraciones de Prisma
├── docs/                         # Documentación del proyecto
│   └── 007-RoadMap.md            # Hoja de ruta completa del desarrollo
└── data/                         # Persistencia en archivo (modo file)
```

---

## Funcionalidades principales

### Gestión de recetas
- CRUD completo de recetas con nombre, tiempo de preparación, comensales, ingredientes y preparación
- Búsqueda por nombre y filtrado por etiquetas
- Validación de integridad: cada receta debe tener al menos una etiqueta por dimensión requerida (MOMENTO_DIA, FORMATO, TIPO_PLATO)

### Gestión de ingredientes
- CRUD de ingredientes maestros
- Fusión de ingredientes duplicados (actualiza todas las recetas que los referencian)

### Gestión de etiquetas
- CRUD con dimensión (MOMENTO_DIA, FORMATO, TIPO_PLATO, ESTILOS_VIDA)
- Etiquetas de sistema protegidas contra renombrado
- Asignación de etiquetas de sistema a etiquetas de usuario existentes

### Planificación semanal
- Creación de planificaciones con duración (semanas) y fecha de inicio
- Editor visual tipo calendario con cuadrícula semana × momento del día
- Asignación manual de recetas a cada servicio (día + momento)
- Control de comensales por servicio
- Preferencias y exclusiones por servicio (etiquetas que se priorizan o se evitan al autoplanificar)
- Balance frío/caliente (deslizador 0%–100%)

### Autoplanificación
- Algoritmo Greedy que asigna recetas automáticamente a servicios vacíos
- Respeta exclusiones (hard constraint)
- Evita repetir la misma receta y tipo de plato dentro del rango planificado
- Distribuye frío/caliente según el balance configurado
- Prioriza etiquetas preferidas (soft constraint)

### Despensa y lista de la compra
- Ingredientes necesarios calculados a partir de las recetas asignadas
- Gestión de despensa: marcar qué ingredientes ya se tienen y para cuántos comensales
- Lista de la compra con check de comprado/pendiente

### Web
- Interfaz responsive (escritorio + móvil)
- Dashboard con resumen de la planificación activa
- Búsqueda y filtrado en listados
- Modales de confirmación para acciones destructivas
- Autenticación con Supabase (producción) o cookie-based (local)

---

## Tests

```bash
# Tests unitarios (437 tests) — sin base de datos
npm test

# Tests de integración con Postgres (52 tests)
# 1. Arrancar Postgres con Docker
docker compose up -d

# 2. Ejecutar migraciones (crea las tablas si no existen)
DATABASE_URL="postgresql://planificador:planificador@localhost:5432/planificador" npx prisma migrate deploy

# 3. Ejecutar los tests en serie (comparten la misma BD)
DATABASE_URL="postgresql://planificador:planificador@localhost:5432/planificador" npx vitest run integration --no-fileParallelism
```

> Los tests de integración verifican que los repositorios Postgres (`PostgresTagRepository`, `PostgresRecipeRepository`, etc.) persisten y recuperan correctamente los aggregates. Usan la base de datos `planificador` con el usuario `planificador` y contraseña `planificador`, que son los valores por defecto del `docker-compose.yml`.

---

## Licencia

Proyecto académico sin fines comerciales.
