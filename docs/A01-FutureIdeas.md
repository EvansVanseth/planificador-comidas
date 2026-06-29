// ANEXO
# Ideas de Futuro y Roadmap (Future Ideas & Roadmap)

Este documento recopila las ideas de diseño planteadas para el proyecto, marcando el estado de cada una de ellas conforme se analizan, aprueban e incorporan formalmente en la documentación de ingeniería de software del sistema (PRD, SRS, Modelo de Dominio y Diseño Técnico).

---

## Estado del Roadmap

*   [x] **Idea 1: Nombre descriptivo para las planificaciones**
    *   *Detalle:* Permite identificar plantillas o períodos especiales (ej. "Menú de Invierno") en lugar de usar solo fechas.
    *   *Ubicación:* Incorporado en `002-SRS.md` (`RF-02.1`, `RF-02.6`), `003-DomainModel.md` (`Planning.nombre`), `005-UserStories.md` (`HU-05.1`, `HU-05.3`, `HU-05.4`) y `000-Methodology.md`.

*   [x] **Idea 2: Crear mockups de cada pantalla**
    *   *Detalle:* Diseñar wireframes/bocetos visuales de cada vista antes de comenzar a escribir el código Frontend, asegurando la validación inmediata por parte de la clienta (tu esposa).
    *   *Ubicación:* Se ha creado un documento de seguimiento en `006-MockUp.md`

*   [x] **Idea 3: Interfaz Responsiva Adaptativa Dual (Mobile-First + Desktop)**
    *   *Detalle:* Interfaz optimizada en móvil para el supermercado (alta densidad táctil) y expandida en escritorio para la planificación semanal en casa.
    *   *Ubicación:* Incorporado en `002-SRS.md` (`RNF-01`), `004-TechnicalDesign.md` (Integración de Tailwind CSS y Principios de Diseño) y `000-Methodology.md`.

*   [x] **Idea 4: Abstracción de Persistencia Dual (En Memoria + Base de Datos)**
    *   *Detalle:* Uso del Patrón Repositorio controlado por la variable de entorno `PERSISTENCE_TYPE` (valores `MEMORY` o `SB_POSTGRES`) para desacoplar el negocio del almacenamiento físico.
    *   *Ubicación:* Incorporado en `004-TechnicalDesign.md` (Abstracción de Persistencia), `005-UserStories.md` (Nota sobre Persistencia) y `000-Methodology.md`.

*   [x] **Idea 5: Bypass de Autenticación (`TEST_USER`) para Desarrollo y Tests**
    *   *Detalle:* Variable de entorno `TEST_USER` que permite inyectar un usuario ficticio para omitir los chequeos con Supabase Auth durante el testeo local con Vitest o el maquetado rápido.
    *   *Ubicación:* Incorporado en `004-TechnicalDesign.md` (Bypass de Autenticación), `005-UserStories.md` (Nota de Autenticación Local) y `000-Methodology.md`.
