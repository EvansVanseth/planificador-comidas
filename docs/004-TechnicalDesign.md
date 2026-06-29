# Documento de Diseño Técnico (Technical Design Document - TDD)

Este documento formaliza las decisiones de arquitectura de software, el stack tecnológico seleccionado, el diseño de la infraestructura y la configuración del entorno de desarrollo para el proyecto **Planificador de Comidas Semanal**. Estas definiciones garantizan que el sistema sea escalable, seguro, tipado de punta a punta y fácil de mantener.

---

## 1. Arquitectura del Sistema (System Architecture)

La aplicación implementa una arquitectura **Monostack Híbrida** basada en el compilador de Next.js, desacoplando la interfaz de usuario de la lógica de persistencia, pero manteniendo la cohesión bajo un único lenguaje de programación (**TypeScript**).

```
   [ NAVEGADOR DEL CLIENTE (Mobile / PWA) ]
                      |
                      |  Llamadas RPC Automáticas (Server Actions)
                      v
       [ SERVIDOR SERVERLESS (Vercel) ]
                      |
                      |  ORM (Prisma / Client)
                      v
   [ BASE DE DATOS EN LA NUBE (Supabase / Postgres) ]
```

### Principios de Diseño:
*   **Single Source of Truth (SSOT):** El modelo de dominio de TypeScript gobierna tanto las vistas del frontend como las validaciones en el backend, eliminando la duplicidad de interfaces.
*   **Separación de Responsabilidades (SoC):** La interfaz visual es reactiva y puramente presentacional. Toda la lógica pesada (como el motor de auto-planificación y consolidación de listas) se ejecuta en el lado del servidor (*Server-Side*).
*   **RPC (Remote Procedure Call):** Sustituimos la capa REST manual por llamadas directas a funciones del servidor mediante *React Server Actions*, lo que reduce el *boilerplate code* (código repetitivo de red).
*   **Diseño Responsivo Contextual (Desktop & Mobile):** La interfaz de usuario se adaptará dinámicamente mediante Tailwind CSS a dos contextos clave de uso: pantallas de escritorio (vista espaciosa tipo grilla/matriz para la planificación semanal cómoda) y pantallas móviles (interfaz simplificada de alta densidad para la lista de compras en el supermercado y preparación en cocina).

---

## 2. Stack Tecnológico (The Tech Stack)

| Capa / Componente | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Lenguaje de Programación** | **TypeScript 5+** | Aporta tipado estático fuerte, interfaces y genéricos, facilitando la detección de errores en tiempo de compilación (clave viniendo de C++/Java). |
| **Framework Web Principal** | **Next.js 14+ (App Router)** | Permite renderizado híbrido (SSR/SSG), Server Actions nativas, rutas de API y optimización automática de assets en un único proyecto. |
| **Autenticación y Sesiones** | **Supabase Auth** | Servicio administrado que resuelve el registro, inicio de sesión y cookies de sesión segura de forma directa. Soporta @supabase/ssr para Next.js. |
| **Diseño de Interfaz / CSS** | **Tailwind CSS** | Permite maquetar interfaces optimizadas mediante clases de utilidad responsivas (`sm:`, `md:`, `lg:`) para soportar móviles (supermercado) y pantallas anchas (planificación). |
| **Acceso a Datos (ORM)** | **Prisma ORM** | Provee un cliente de base de datos auto-generado y completamente tipado en base a un esquema declarativo (`schema.prisma`). Simplifica las migraciones. |
| **Base de Datos** | **PostgreSQL 16+** | Base de datos relacional robusta. Garantiza integridad referencial mediante claves foráneas y restricciones complejas de datos. Soporte nativo para JSONB. |
| **Plataforma de Tests** | **Vitest** | Alternativa moderna a Jest. Ejecución ultra veloz basada en Vite, soporte nativo de TypeScript sin transpiladores externos y excelente entorno interactivo para TDD. |

---

## 3. Entorno de Desarrollo Local (Local Development)

El entorno local emula a la perfección el entorno de producción en la nube para garantizar consistencia absoluta y evitar el clásico "en mi máquina funciona".

### Base de Datos PostgreSQL local (Docker)
Para el desarrollo, la base de datos se ejecuta de forma aislada dentro de un contenedor Docker administrado por Docker Compose.

```yaml
# docker-compose.yml (Ubicado en la raíz del proyecto)
version: '3.8'

services:
  postgres_dev:
    image: postgres:16-alpine
    container_name: tfm-postgres-dev
    environment:
      POSTGRES_USER: tfm_user
      POSTGRES_PASSWORD: tfm_password
      POSTGRES_DB: tfm_dev_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata_dev:/var/lib/postgresql/data
    restart: always

volumes:
  pgdata_dev:
```

### Flujo de Migración de Base de Datos (Prisma Workflow)
1.  **Modelado en `schema.prisma`:** Se definen los modelos de base de datos mapeando de forma idéntica nuestro `DomainModel.md`.
2.  **Generación de Migración:** Se ejecuta `npx prisma migrate dev --name <descripcion>`. Prisma calcula el diff, genera el archivo SQL incremental, lo aplica a la base de datos local de Docker y regenera el cliente tipado de TypeScript.
3.  **Inspección Visual:** Se puede abrir `npx prisma studio` para ver y editar los datos de forma visual localmente.

### Abstracción de la Persistencia (El Patrón Repositorio)
Para garantizar el desacoplamiento total de la lógica de negocio frente a la infraestructura de almacenamiento, se implementará el **Patrón Repositorio (Repository Pattern)**. 

El sistema definirá interfaces de TypeScript claras para cada acceso a datos (ej. `IRecipeRepository`, `IPlanningRepository`). La aplicación seleccionará dinámicamente qué implementación concreta inyectar en tiempo de ejecución basándose en la configuración de entorno:

*   **Variable de Entorno:** `PERSISTENCE_TYPE`
*   **Valores de Configuración:**
    *   `MEMORY`: Inyecta repositorios que gestionan colecciones en memoria (`In-Memory`). Es la opción predeterminada y optimizada para la ejecución de pruebas con Vitest y desarrollo rápido sin conexión.
    *   `SB_POSTGRES`: Inyecta repositorios conectados físicamente a la base de datos PostgreSQL (mediante Prisma ORM), ya sea local en Docker o en producción con Supabase.

---

## 4. Infraestructura y Despliegue (Production Infrastructure)

El despliegue de producción está diseñado bajo el paradigma **Serverless** (sin servidores fijos), reduciendo los costes de mantenimiento a $0 (dentro de los límites gratuitos de nivel de desarrollo) y automatizando las tareas de DevOps.

### Servidor de Aplicación: Vercel
*   **Integración Continua (CI/CD):** Vercel se vincula directamente al repositorio GitHub del proyecto. Cada *Push* a la rama `main` compila y despliega una nueva versión de producción en segundos.
*   **Serverless Functions:** Las Server Actions y API Routes de Next.js se compilan como funciones serverless aisladas (AWS Lambda bajo el capó), escalando de forma automática según la demanda de la app.

### Servidor de Base de Datos y Autenticación: Supabase
*   **Base de Datos en la Nube:** Proveedor gestionado de PostgreSQL Serverless.
*   **Seguridad de Red:** Se configuran las variables de entorno de red de forma segura en Vercel (`DATABASE_URL`, `DIRECT_URL`) para que la aplicación web se comunique de forma cifrada con Postgres.
*   **Row-Level Security (RLS) y Auth:** Supabase Auth se integra con el motor de PostgreSQL. Utilizaremos políticas de seguridad a nivel de fila (RLS) para asegurar que un usuario autenticado solo pueda ejecutar consultas `SELECT`, `INSERT`, `UPDATE` o `DELETE` sobre registros donde la columna `user_id` coincida con su ID de sesión (`auth.uid()`). Esto añade una capa redundante de seguridad militar en la base de datos, impidiendo fugas de datos incluso si hubiera un fallo de programación en el backend.
*   **Control de Acceso en el Backend (Next.js Middleware):** Un archivo `middleware.ts` en Next.js interceptará cada petición. Si la cookie de sesión no es válida, redirigirá automáticamente al usuario a la pantalla de login `/login`, bloqueando el renderizado de la UI y las llamadas a Server Actions de forma preventiva.
*   **Bypass de Autenticación para Desarrollo y Tests (`TEST_USER`):** Para agilizar el desarrollo local (evitando la fatiga de inicio de sesión recurrente) y permitir que las pruebas automáticas de Vitest se ejecuten sin dependencias de red externas, se implementará un mecanismo de simulación de identidad (Mock Auth). Si la variable de entorno `TEST_USER` está configurada con un identificador único (ej., `test-user-uuid`), el sistema omitirá los chequeos con Supabase Auth e inyectará automáticamente este usuario ficticio en el contexto de seguridad de la aplicación.

### Seguridad Avanzada (OWASP Compliance)
*   **Sanitización contra XSS:** React y Next.js escapan automáticamente todas las variables renderizadas en JSX, neutralizando XSS de manera nativa. Sin embargo, para los campos de texto libre como las instrucciones de elaboración de recetas (que pueden admitir markdown o saltos de línea estructurados), utilizaremos la librería **`isomorphic-dompurify`** en las Server Actions de inserción y en los componentes de servidor antes del renderizado, impidiendo de forma activa cualquier ejecución de scripts inyectados.
*   **Mitigación de Fuerza Bruta (Rate Limiting):** Se implementará un sistema de Rate Limiting en Next.js Middleware para endpoints de `/signup` y `/login` utilizando una estrategia basada en IP (usando `upstash/ratelimit` o similar), limitando las solicitudes consecutivas sospechosas para bloquear de forma automática intentos de adivinar contraseñas.

### Arquitectura de Accesibilidad (A11Y Implementation)
*   **Librería de Componentes Accesibles (WAI-ARIA):** Para garantizar que el autocompletado de ingredientes (`HU-02.1`) y los modales de advertencia sigan estrictamente las pautas WCAG 2.1 AA, se utilizarán librerías de componentes sin estilo (*Headless*) que gestionan la accesibilidad por teclado y lectores de pantalla de forma nativa (ej. **Radix UI** o **Headless UI**).
*   **Cumplimiento de Target Size y Contraste:** El maquetado móvil con Tailwind CSS utilizará dimensiones de control amplias (mínimo `h-11` o `w-11` para alcanzar el estándar táctil WCAG AA de **44x44px**) para facilitar el manejo rápido en movimiento. Toda la paleta de colores del sistema se validará mediante pruebas de accesibilidad de color para asegurar un contraste mínimo de **4.5:1** en condiciones de alto brillo solar.

---

## 5. Estrategia de Pruebas (Testing Strategy)

Para cumplir con el rigor académico de un TFM de desarrollo con IA, el sistema implementará tres niveles de pruebas locales con **Vitest**:

1.  **Pruebas Unitarias (Unit Tests):** Enfocadas estrictamente en probar el motor del planificador automático (`Auto-Scheduler Engine`) de forma aislada. Debemos asegurar matemáticamente que dada una lista de recetas y unas preferencias/exclusiones, el algoritmo intercala frío/caliente según el selector y no duplica tipos de plato.
2.  **Pruebas de Integración (Integration Tests):** Verifican el flujo completo desde que el usuario actualiza una despensa local hasta que la base de datos PostgreSQL se actualiza y la vista de la lista de compras devuelve las cantidades netas calculadas correctas.
3.  **Pruebas de Extremo a Extremo (E2E Tests):** (Opcional a futuro mediante Playwright o Cypress) para simular los clics reales de la usuaria en la pantalla móvil del supermercado.
