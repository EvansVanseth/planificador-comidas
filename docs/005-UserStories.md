# Historias de Usuario (User Stories) - Planificador de Comidas

Este documento desglosa los requisitos funcionales del sistema (`SRS.md`) en **Historias de Usuario (HU)** y **Criterios de Aceptación** estructurados bajo el estándar de **BDD (Behavior-Driven Development)** usando la sintaxis **Gherkin** (Dado, Cuando, Entonces).

*Nota de Arquitectura sobre Persistencia:* De acuerdo con principios de diseño desacoplado, todas las alusiones al almacenamiento de datos se manejan bajo el concepto abstracto de **Capa de Persistencia (Persistence Layer)**, implementando el Patrón Repositorio. El comportamiento y la inyección de esta capa se configuran dinámicamente mediante la variable de entorno `PERSISTENCE_TYPE` con dos opciones:
*   `MEMORY`: Inyecta la implementación **En Memoria (In-Memory)**, óptima para la ejecución de pruebas automáticas ultrarrápidas con Vitest y desarrollo ágil sin conexión.
*   `SB_POSTGRES`: Inyecta la implementación conectada a la **Base de Datos PostgreSQL** (ya sea en local mediante Docker o en producción en la nube con Supabase) mediante Prisma ORM.

*Nota sobre Autenticación Local y de Testeo:* Para posibilitar la ejecución de pruebas e integración automatizadas y agilizar el desarrollo local sin necesidad de interactuar constantemente con un servidor de identidad real, se implementará la variable de entorno `TEST_USER`. Si está definida (ej., `TEST_USER = test-user-uuid`), los escenarios que requieran autenticación en las Historias de Usuario se darán automáticamente por validados (simulación de sesión o Mock Auth), asumiendo este identificador de usuario ficticio de forma transparente en todo el sistema.

---

## Módulo 0: Usuario No Autenticado (Landing Page)

### HU-00.1: Visualización de Landing Page de Presentación
*   **Como** visitante de la web,
*   **Quiero** ver una página de presentación atractiva e informativa de la app,
*   **Para** conocer sus funcionalidades (planificador, despensa, recetas) y decidir registrarme.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Navegación de visitante anónimo**
        *   **Dado** que un usuario no autenticado ingresa a la URL raíz del sitio (`/`),
        *   **Cuando** carga la página,
        *   **Entonces** el sistema muestra la landing page con la propuesta de valor, capturas ilustrativas y botones visibles para "Registrarse" (`/signup`) o "Iniciar Sesión" (`/login`).

---

## Módulo 1: Autenticación y Gestión de Cuenta (Auth & Account)

### HU-01.1: Registro de Cuenta (Sign Up)
*   **Como** nuevo usuario,
*   **Quiero** crear una cuenta con mi email y una contraseña robusta,
*   **Para** poder tener mi propio catálogo de recetas y planificador privado.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Registro exitoso con contraseña robusta (Estándar OWASP)**
        *   **Dado** que el usuario está en la pantalla de registro (`/signup`),
        *   **Cuando** introduce un email válido no registrado y una contraseña robusta que cumple los criterios OWASP (mínimo 10 caracteres, al menos una mayúscula, una minúscula, un número, un carácter especial y no estar en listas de contraseñas vulnerables comunes), y confirma la contraseña,
        *   **Entonces** el sistema crea de forma segura la cuenta de usuario, inicializa su espacio de persistencia, establece la sesión activa y redirige al usuario a su Dashboard (`/dashboard`).
    *   **Escenario 2: Intento de registro con contraseña débil**
        *   **Dado** que el usuario está en la pantalla de registro (`/signup`),
        *   **Cuando** introduce un email válido y una contraseña que no cumple los criterios OWASP (ej. "123456" o menos de 10 caracteres),
        *   **Entonces** el sistema deniega el registro, mantiene al usuario en `/signup` y muestra un mensaje de error detallando los requisitos de seguridad incumplidos.

### HU-01.2: Inicio de Sesión (Log In)
*   **Como** usuario registrado,
*   **Quiero** iniciar sesión de forma segura,
*   **Para** acceder a mi planificador y recetas guardadas.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Login exitoso**
        *   **Dado** que el usuario está en la pantalla de login (`/login`),
        *   **Cuando** ingresa sus credenciales de acceso correctas y presiona "Ingresar",
        *   **Entonces** la capa de persistencia valida el acceso, el sistema establece la sesión y lo redirige a su Dashboard principal (`/dashboard`).

### HU-01.3: Visualización de Tablero Principal (Dashboard)
*   **Como** usuario autenticado,
*   **Quiero** ver una pantalla principal (Dashboard) clara tras loguearme,
*   **Para** ver el estado de mi planificación activa de la semana, accesos rápidos para cocinar hoy y accesos directos al generador de la lista de compras.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Acceso a Dashboard como usuario activo**
        *   **Dado** que el usuario ha iniciado sesión y accede a la ruta principal del sistema (`/dashboard`),
        *   **Cuando** carga la página,
        *   **Entonces** el sistema consulta la persistencia y muestra el Dashboard con la planificación actual de la semana (si existe), las comidas previstas para el día de hoy y botones de acción rápida para "Recetas" (`/recipes`), "Nueva Planificación" (`/plannings/new`) e "Ir a Lista de Compras" (`/plannings/active/shopping-list`).

### HU-01.4: Gestión de Cuenta y Datos de Perfil (Account Settings)
*   **Como** usuario autenticado,
*   **Quiero** editar mis datos personales (nombre, correo) y cambiar mi contraseña,
*   **Para** mantener mi cuenta actualizada y segura.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Cambio de contraseña exitoso (Estándar OWASP)**
        *   **Dado** que el usuario está en la sección de configuración de cuenta (`/settings`),
        *   **Cuando** ingresa su contraseña actual correcta y una nueva contraseña que cumple con los criterios OWASP (mínimo 10 caracteres, combinando mayúsculas, minúsculas, números y símbolos especiales),
        *   **Entonces** el sistema actualiza la credencial de forma segura en la capa de persistencia y muestra un mensaje de confirmación exitoso.
    *   **Escenario 2: Cambio de nombre de perfil**
        *   **Dado** que el usuario está en `/settings`,
        *   **Cuando** modifica su nombre de perfil de "Mariana" a "Mariana S." y pulsa "Guardar Cambios",
        *   **Entonces** el sistema actualiza su perfil en la capa de persistencia y muestra el nuevo nombre inmediatamente en la interfaz de usuario.
    *   **Escenario 3: Cambio de correo electrónico con validación de doble vía**
        *   **Dado** que el usuario está autenticado y en `/settings`,
        *   **Cuando** introduce una nueva dirección de correo electrónico válida y solicita el cambio,
        *   **Entonces** el sistema envía un enlace de confirmación a la nueva dirección de correo, manteniendo al usuario con su sesión activa bajo su correo anterior.
    *   **Escenario 4: Confirmación y persistencia final del nuevo correo**
        *   **Dado** que el destinatario de la nueva dirección hace clic en el enlace de confirmación enviado por correo,
        *   **Cuando** el sistema registra que esa nueva dirección está validada, pero **NO** efectúa el cambio en la cuenta todavía,
        *   **Entonces** el usuario original (que sigue logueado bajo su correo anterior) visualiza en `/settings` una alerta de "Nueva dirección pre-verificada", y solo al presionar el botón "Confirmar cambio de correo" dentro de la app, el sistema persiste la nueva dirección de correo electrónico como credencial definitiva de acceso.

### HU-01.5: Cierre de Sesión (Log Out)
*   **Como** usuario autenticado,
*   **Quiero** cerrar sesión de forma segura,
*   **Para** evitar que personas no autorizadas que usen mi dispositivo accedan a mis datos.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Cierre de sesión efectivo**
        *   **Dado** que el usuario está logueado en la app,
        *   **Cuando** presiona el botón "Cerrar Sesión",
        *   **Entonces** el sistema destruye la sesión activa y lo redirige inmediatamente a la Landing Page pública (`/`).

### HU-01.6: Eliminación definitiva de Cuenta (Sign Out / Deletion)
*   **Como** usuario autenticado,
*   **Quiero** tener la opción de eliminar mi cuenta y mis datos por completo,
*   **Para** ejercer mi derecho de borrado de información personal.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Eliminación y purga de base de datos**
        *   **Dado** que el usuario está en `/settings`,
        *   **Cuando** selecciona "Eliminar mi cuenta", confirma la acción mediante su contraseña y acepta la advertencia de pérdida de datos irrevocable,
        *   **Entonces** el sistema elimina de manera atómica de la capa de persistencia su registro de usuario y purga en cascada todas sus recetas, ingredientes maestros personalizados, planificaciones y despensas asociadas, redirigiéndolo a la Landing Page pública (`/`).

---

## Módulo 2: Gestión de Ingredientes Maestros (Ingredient Management)

### HU-02.1: Crear Ingrediente Maestro (Autocomplete base)
*   **Como** usuario autenticado,
*   **Quiero** añadir un nuevo ingrediente al catálogo de ingredientes maestros,
*   **Para** que esté disponible para el autocompletado al redactar recetas o listas.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Creación de ingrediente único**
        *   **Dado** que el usuario está completando una receta o en la sección de ingredientes (`/ingredients`),
        *   **Cuando** escribe un nombre de ingrediente que no existe (ej. "Harina de Almendras") y presiona registrar,
        *   **Entonces** el sistema guarda el ingrediente asociado a su `user_id` en la capa de persistencia y lo hace disponible para futuras sugerencias.
    *   **Escenario 2: Navegación accesible del selector/autocompletado (WAI-ARIA Combobox)**
        *   **Dado** que el usuario está en el campo de texto de autocompletado de ingredientes,
        *   **Cuando** escribe "Tom" y utiliza las flechas del teclado `Abajo` o `Arriba`,
        *   **Entonces** el foco de la interfaz se desplaza por las sugerencias ("Tomate", "Tomillo") actualizando los atributos de accesibilidad (ej., `aria-activedescendant` y `aria-expanded="true"`), permitiéndole seleccionar el ingrediente con la tecla `Enter` y escuchar la opción activa de forma clara mediante un lector de pantalla.

### HU-02.2: Visualizar, Editar y Eliminar Ingredientes
*   **Como** usuario autenticado,
*   **Quiero** ver el listado de mis ingredientes y poder renombrarlos o eliminarlos,
*   **Para** corregir errores ortográficos o depurar el listado.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Modificación de ingrediente maestro**
        *   **Dado** que el usuario está en el catálogo de ingredientes (`/ingredients`),
        *   **Cuando** edita el nombre de "Arros" a "Arroz",
        *   **Entonces** la modificación se almacena en la capa de persistencia y se refleja de forma automática en todas las recetas e ingredientes de planificaciones que hagan referencia a dicho ingrediente.
    *   **Escenario 2: Eliminación segura de ingrediente no utilizado**
        *   **Dado** que el usuario está en `/ingredients` y selecciona un ingrediente que no forma parte de ninguna receta (ej. "Salsa de soja"),
        *   **Cuando** pulsa "Eliminar" y confirma la acción,
        *   **Entonces** el sistema remueve el registro de la capa de persistencia de forma permanente.
    *   **Escenario 3: Bloqueo/Advertencia al eliminar un ingrediente en uso**
        *   **Dado** que el usuario está en `/ingredients` e intenta eliminar el ingrediente "Pollo", el cual se utiliza actualmente en la receta "Pollo al Horno",
        *   **Cuando** pulsa "Eliminar",
        *   **Entonces** el sistema bloquea la eliminación directa, muestra una advertencia emergente informándole al usuario que el ingrediente está siendo usado en "Pollo al Horno", y le sugiere fusionar el ingrediente o desvincularlo primero de la receta antes de poder borrarlo.

### HU-02.3: Fusionar Ingredientes Redundantes (Merge Ingredients)
*   **Como** usuario autenticado,
*   **Quiero** fusionar dos ingredientes duplicados o redundantes (ej. "huevo" y "huevos"),
*   **Para** que todas mis recetas se unifiquen automáticamente bajo un solo ingrediente y el redundante sea eliminado de manera segura.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Fusión exitosa de ingredientes redundantes**
        *   **Dado** que el usuario tiene registrados los ingredientes maestros "huevo" (origen) y "huevos" (destino), y cuenta con recetas que apuntan a ambos,
        *   **Cuando** accede a la herramienta de fusión en `/ingredients`, selecciona "huevo" como origen, "huevos" como destino y confirma la fusión,
        *   **Entonces** el sistema actualiza de forma atómica en la capa de persistencia todas las referencias a "huevo" dentro de sus recetas y planificaciones para que apunten a "huevos", y posteriormente elimina de forma segura el registro "huevo" que ha quedado huérfano de referencias.

---

## Módulo 3: Gestión de Recetas (Recipe Management)

### HU-03.1: Crear Receta con Autocompletado de Ingredientes
*   **Como** usuario autenticado,
*   **Quiero** dar de alta una receta ingresando su información base, seleccionando ingredientes sugeridos y asignándole etiquetas,
*   **Para** que el planificador pueda usarla correctamente.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Autocompletado de ingredientes durante la carga**
        *   **Dado** que el usuario está en el formulario de creación de receta (`/recipes/new`),
        *   **Cuando** escribe "Tom..." en el campo de ingrediente,
        *   **Entonces** el sistema muestra una lista de sugerencias con "Tomate", "Tomillo", etc., permitiéndole seleccionar uno de forma rápida.
    *   **Escenario 2: Persistencia exitosa al guardar receta**
        *   **Dado** que el usuario ha completado correctamente toda la información obligatoria de la receta (nombre único para su cuenta, comensales, tiempo, al menos una etiqueta obligatoria e ingredientes),
        *   **Cuando** pulsa el botón "Guardar",
        *   **Entonces** el sistema valida, procesa, crea la estructura de datos y persiste la receta de forma permanente asociada a su `user_id` en la capa de persistencia, redirigiendo al usuario al catálogo general de recetas (`/recipes`) con un mensaje de éxito.

### HU-03.2: Filtrar y Listar Recetas
*   **Como** usuario autenticado,
*   **Quiero** ver el listado de mis recetas y filtrarlas por etiquetas o buscar por nombre,
*   **Para** encontrar rápidamente una receta específica para cocinar hoy.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Búsqueda por filtro cruzado**
        *   **Dado** que el usuario está en el catálogo de recetas (`/recipes`),
        *   **Cuando** escribe "Pasta" en el buscador y selecciona la etiqueta "Cena" y "Caliente",
        *   **Entonces** la interfaz de usuario muestra únicamente las recetas que contienen "Pasta" en su nombre, etiquetadas para "Cena" y en formato "Caliente" que pertenezcan a su cuenta.

### HU-03.3: Editar Receta Existente
*   **Como** usuario autenticado,
*   **Quiero** editar los ingredientes, porciones o instrucciones de una receta existente,
*   **Para** mantener mis recetas actualizadas con mis mejoras de cocina.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Modificación exitosa**
        *   **Dado** que el usuario está en la pantalla de edición de una receta (`/recipes/[id]/edit`),
        *   **Cuando** cambia el tiempo de elaboración y añade un ingrediente, y pulsa "Guardar Cambios",
        *   **Entonces** el sistema sobrescribe la receta de forma segura en la capa de persistencia y lo redirige a la ficha detallada de la receta (`/recipes/[id]`) reflejando los cambios.

### HU-03.4: Eliminar Receta (Seguridad con Planificaciones)
*   **Como** usuario autenticado,
*   **Quiero** eliminar una receta de mi catálogo,
*   **Para** descartar platos que ya no preparo en casa.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Eliminación de receta sin asociar**
        *   **Dado** que el usuario está en `/recipes` y pulsa "Eliminar" en una receta que nunca ha sido planificada,
        *   **Cuando** confirma la eliminación,
        *   **Entonces** el sistema remueve la receta de la capa de persistencia y actualiza el listado.
    *   **Escenario 2: Advertencia de eliminación por uso en planificación activa**
        *   **Dado** que el usuario intenta eliminar la receta "Lasaña", la cual se encuentra asignada actualmente a un día de la planificación activa actual,
        *   **Cuando** pulsa "Eliminar",
        *   **Entonces** el sistema interrumpe el borrado directo, despliega una advertencia indicando que "Lasaña" está planificada para esta semana y que al borrarla se removerá del menú semanal (dejando ese almuerzo/cena vacío para planificar de nuevo), y solo tras una segunda confirmación explícita elimina la receta de la capa de persistencia y limpia la referencia de la planificación.

---

## Módulo 4: Gestión de Etiquetas (Tag Management)

### HU-04.1: Creación de Etiquetas Personalizadas
*   **Como** usuario autenticado,
*   **Quiero** crear etiquetas personalizadas (ej. "Favoritas de Mamá", "Sin sal"),
*   **Para** categorizar mis recetas según mis necesidades dietéticas o preferencias familiares.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Etiqueta personalizada única**
        *   **Dado** que el usuario está en la gestión de etiquetas (`/tags`),
        *   **Cuando** crea una etiqueta dentro de la dimensión "ESTILOS_VIDA" llamada "Sin Sal",
        *   **Entonces** el sistema la guarda con su `user_id` en la capa de persistencia, estando visible únicamente en su cuenta y oculta para el resto de usuarios.

### HU-04.2: Editar Etiquetas Personalizadas
*   **Como** usuario autenticado,
*   **Quiero** renombrar mis etiquetas personalizadas,
*   **Para** corregir su escritura o cambiar su descripción.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Modificación de etiqueta**
        *   **Dado** que el usuario está en `/tags`,
        *   **Cuando** selecciona editar la etiqueta "Sin Sal" por "Bajo en Sodio",
        *   **Entonces** el cambio se guarda en la capa de persistencia y se propaga automáticamente a todas las recetas que la tengan asignada.

### HU-04.3: Eliminar Etiquetas (Advertencia de Uso)
*   **Como** usuario autenticado,
*   **Quiero** eliminar etiquetas que ya no utilizo,
*   **Para** limpiar mis dimensiones de filtrado.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Eliminación segura de etiqueta libre**
        *   **Dado** que el usuario está en `/tags` y elimina una etiqueta que no está asignada a ninguna receta,
        *   **Cuando** confirma el borrado,
        *   **Entonces** el sistema la remueve de la capa de persistencia directamente.
    *   **Escenario 2: Advertencia al eliminar etiqueta en uso**
        *   **Dado** que el usuario intenta eliminar la etiqueta personalizada "Bajo en Sodio", la cual está asignada a 3 recetas de su catálogo,
        *   **Cuando** presiona "Eliminar",
        *   **Entonces** el sistema detiene el borrado directo, advierte al usuario que hay 3 recetas que perderán dicha clasificación si procede, y requiere una segunda confirmación afirmativa del usuario para remover la etiqueta de la persistencia y desvincularla de las recetas.

---

## Módulo 5: Gestión de Planificaciones Generales (Planning Catalog)

### HU-05.1: Crear Nueva Planificación (Vacia o borrador)
*   **Como** usuario autenticado,
*   **Quiero** iniciar una planificación semanal indicando un nombre descriptivo opcional y las semanas que deseo planificar,
*   **Para** definir la estructura o esqueleto de mis comidas de forma fácil de identificar.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Creación básica de planificación**
        *   **Dado** que el usuario está en `/plannings/new`,
        *   **Cuando** ingresa un nombre descriptivo opcional (ej. "Menú de Invierno"), una fecha de inicio (que debe ser lunes, o ninguna si actúa como borrador de plantilla) y selecciona "2 semanas",
        *   **Entonces** el sistema genera en la capa de persistencia un registro `Planning` asociado a su `user_id` con el nombre ingresado, con 14 registros `PlannedDay` vacíos de recetas y con comensales por defecto, redirigiéndolo a la vista de edición de esa planificación (`/plannings/[id]/edit`).

### HU-05.2: Listar e Historial de Planificaciones
*   **Como** usuario autenticado,
*   **Quiero** navegar en un historial de mis planificaciones pasadas, activas y borradores,
*   **Para** revisar qué comimos en semanas anteriores o continuar planificando una semana futura.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Listado de histórico**
        *   **Dado** que el usuario está en el historial de planificaciones (`/plannings`),
        *   **Cuando** carga la vista,
        *   **Entonces** el sistema consulta la persistencia y muestra una lista ordenada cronológicamente de todas las planificaciones asociadas a su `user_id`.

### HU-05.3: Duplicar Planificación Existente
*   **Como** usuario autenticado,
*   **Quiero** duplicar una planificación anterior para crear una nueva copia limpia,
*   **Para** reutilizar un menú completo que funcionó muy bien sin tener que volver a configurarlo.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Duplicación limpia de plantilla**
        *   **Dado** que el usuario selecciona "Duplicar" en una planificación del historial (ej. "Menú de Otoño"),
        *   **Cuando** confirma el proceso,
        *   **Entonces** el sistema genera una copia idéntica del esqueleto de días, comensales, exclusiones, preferencias e incluso recetas pre-asignadas en la capa de persistencia, hereda el nombre descriptivo añadiendo el sufijo "(Copia)", pero establece `fecha_inicio = null` (quedando como plantilla libre de fecha), y redirige al usuario a la edición de la nueva planificación (`/plannings/[new_id]/edit`).

### HU-05.4: Editar Datos de Planificación General
*   **Como** usuario autenticado,
*   **Quiero** cambiar los parámetros globales de una planificación (como su nombre, su fecha de inicio o cantidad de semanas),
*   **Para** adecuar la planificación a un cambio de planes en el calendario familiar.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Asignar o cambiar fecha de inicio**
        *   **Dado** que el usuario edita una planificación que actúa como plantilla (`fecha_inicio = null`),
        *   **Cuando** le asigna un lunes válido del calendario como fecha de inicio y pulsa "Guardar",
        *   **Entonces** el sistema actualiza el registro en la capa de persistencia, proyecta las fechas de calendario reales en la interfaz y redirige al usuario al editor detallado (`/plannings/[id]/edit`).
    *   **Escenario 2: Reducción del número de semanas planificadas**
        *   **Dado** que el usuario está editando una planificación configurada para "4 semanas",
        *   **Cuando** decide reducir la cantidad a "2 semanas",
        *   **Entonces** el sistema interrumpe la operación y despliega una advertencia notificándole que las semanas 3 y 4 se eliminarán de forma definitiva, perdiendo cualquier comensal, exclusión, preferencia y receta asignada manualmente para esos días. Solo si el usuario acepta explícitamente, la capa de persistencia guarda el cambio y purga de forma permanente los días descartados.
    *   **Escenario 3: Cambiar o asignar nombre descriptivo**
        *   **Dado** que el usuario está editando los datos globales de una planificación,
        *   **Cuando** modifica el campo de nombre de "Menú de Otoño (Copia)" a "Plantilla Favorita 1" y presiona "Guardar",
        *   **Entonces** el sistema persiste el nuevo nombre en la capa de persistencia y lo muestra actualizado en la cabecera de la planificación y en el listado del historial.

### HU-05.5: Eliminar Planificación (Advertencia de Pérdida de Datos)
*   **Como** usuario autenticado,
*   **Quiero** eliminar una planificación por completo,
*   **Para** descartar borradores o planificaciones obsoletas.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Eliminación permanente con advertencia de impacto**
        *   **Dado** que el usuario está en `/plannings` e inicia la eliminación de una planificación activa o guardada,
        *   **Cuando** pulsa "Eliminar" y el sistema le despliega un modal advirtiéndole explícitamente que *"Esta acción es irreversible y se perderá toda la información del menú, el stock de despensa local de esta semana y el checklist de compras"*, y el usuario confirma la acción,
        *   **Then** el sistema elimina de forma atómica de la capa de persistencia el registro de `Planning` y sus cascadas hijas (`PlannedDay`, `PlanningPantryItem`, `PlanningShoppingItem`), redirigiéndolo al listado histórico (`/plannings`).

---

## Módulo 6: Gestión de una Planificación Detallada (Active Planner & Lists)

### HU-06.1: Configuración Diaria y Edición en Lote (Bulk Editing)
*   **Como** usuario autenticado,
*   **Quiero** configurar rápidamente los comensales, exclusiones y preferencias de varios días de la planificación,
*   **Para** no tener que configurar cada día de forma repetitiva e individual.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Selección completa de semana**
        *   **Dado** que el usuario está editando una planificación detallada (`/plannings/[id]/edit`),
        *   **Cuando** utiliza la herramienta de selección en lote para marcar la "Semana 1 completa", ajusta los comensales de la cena a "4" y agrega la exclusión "Pescado" y pulsa guardar lote,
        *   **Entonces** el sistema actualiza de manera simultánea en la capa de persistencia los 7 días de esa primera semana con dichos parámetros.

### HU-06.2: Ejecución del Planificador Automático
*   **Como** usuario autenticado,
*   **Quiero** ejecutar el generador automático aplicando filtros de frío/caliente, exclusiones y preferencias,
*   **Para** que la app resuelva el menú completo y yo no tenga que "pensar que comer".
*   **Criterios de Aceptación:**
    *   **Escenario 1: Validación de exclusiones (Hard Constraint)**
        *   **Dado** que el Martes de la Semana 1 tiene la exclusión "Carne",
        *   **Cuando** el usuario ejecuta el planificador automático pulsando "Autoplanificar",
        *   **Entonces** el algoritmo de planificación descarta recetas que contengan la etiqueta "Carne" para ese día, asigna recetas aptas de la capa de persistencia y las guarda, manteniendo al usuario en `/plannings/[id]/edit` con el menú actualizado.
    *   **Escenario 2: Selector de tendencia Frío / Caliente**
        *   **Dado** que el selector de formato está fijado al 50% en una planificación de 1 semana,
        *   **Cuando** se ejecuta la auto-planificación,
        *   **Entonces** el sistema distribuye recetas calientes y frías de forma intercalada de manera que el formato final sea aproximadamente equilibrado en un 50/50, sin acumular más de 3 servicios consecutivos de un mismo formato térmico.

### HU-06.3: Control de Despensa Local (`PlanningPantryItem`)
*   **Como** usuario autenticado,
*   **Quiero** ver la lista de ingredientes que necesito y registrar si tengo alguno de ellos en despensa o cuántas comidas puedo cubrir con lo que ya tengo,
*   **Para** que el sistema calcule correctamente la compra neta.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Indicación de porciones cubiertas**
        *   **Dado** que la planificación en `/plannings/[id]/pantry` necesita Tomates para **8 porciones** en total (conforme a las recetas asignadas),
        *   **Cuando** el usuario marca que tiene Tomates para cubrir **5 comidas**,
        *   **Entonces** el sistema guarda ese estado asociado al ingrediente en el `PlanningPantryItem` de la planificación dentro de la capa de persistencia.

### HU-06.4: Checklist de Lista de la Compra (`PlanningShoppingItem`)
*   **Como** usuario autenticado,
*   **Quiero** ver la lista de ingredientes que necesito comprar y marcar los que ya puse en el carrito del supermercado,
*   **Para** agilizar mi proceso físico de compra en movilidad.
*   **Criterios de Aceptación:**
    *   **Escenario 1: Cálculo dinámico de faltantes**
        *   **Dado** que una planificación requiere Tomate para **8 porciones**, y la despensa local registra cobertura para **5 porciones**,
        *   **Cuando** el usuario accede a la lista de la compra de la planificación (`/plannings/[id]/shopping-list`),
        *   **Entonces** el sistema calcula al vuelo en memoria y muestra "Tomate: Comprar para 3 comidas" (8 - 5 = 3).
    *   **Escenario 2: Marcado de artículo comprado**
        *   **Dado** que el usuario está en el supermercado con su celular y ve "Tomate (Faltan para 3 comidas)" en su listado interactivo (`/plannings/[id]/shopping-list`),
        *   **Cuando** presiona el check del Tomate,
        *   **Entonces** el sistema actualiza de inmediato el registro en el `PlanningShoppingItem` en la capa de persistencia marcándolo como `completado = true` y tachando el ítem en la interfaz.
    *   **Escenario 3: Usabilidad y accesibilidad táctil en movilidad**
        *   **Dado** que el usuario navega la lista de compras desde su dispositivo móvil mientras camina por el supermercado,
        *   **Cuando** visualiza la lista,
        *   **Entonces** cada fila interactiva y checkbox tiene un área de toque mínima de **44x44 píxeles** (para evitar pulsaciones erróneas) y los textos mantienen un contraste mínimo de **4.5:1** respecto al fondo (asegurando legibilidad bajo luces intensas o reflejos solares).
    *   **Escenario 4: Feedback por voz con lector de pantalla**
        *   **Dado** que el usuario está usando la aplicación con un lector de pantalla (ej., TalkBack o VoiceOver),
        *   **Cuando** pulsa el checkbox para marcar el "Tomate" como comprado,
        *   **Entonces** el sistema dispara una notificación aria-live dinámica (`aria-live="polite"`) que anuncia de forma audible al usuario: *"Tomate marcado como comprado"*, confirmando el cambio de estado de forma inmediata sin obligar a re-enfocar la pantalla.
