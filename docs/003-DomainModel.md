# Modelo de Dominio (Domain Model) - Planificador de Comidas

Este documento detalla el **Modelo de Dominio** de la aplicación. Utiliza conceptos de **Domain-Driven Design (DDD)** para estructurar las entidades, objetos de valor y agregados principales de nuestro sistema, asegurando que la lógica de negocio esté aislada de la infraestructura y de la base de datos.

---

## 1. Patrones de Diseño Aplicados (DDD Concepts)
Para elevar la calidad arquitectónica de la aplicación, clasificamos nuestras clases de dominio en:
*   **Agregado (Aggregate):** Un conjunto de objetos asociados que se tratan como una unidad para cambios de datos. Tienen un "Aggregate Root" (Raíz de Agregado) a través del cual se accede a ellos.
*   **Entidad (Entity):** Un objeto de dominio que tiene una identidad única definida a lo largo del tiempo, más allá de sus atributos.
*   **Objeto de Valor (Value Object):** Un objeto que no tiene identidad propia, definido puramente por sus atributos. Es inmutable.

---

## 2. Mapa de Agregados y Entidades

```
+---------------------------------------------------------------+
| AGREGADO PLANIFICACIÓN (Planning Aggregate)                    |
|                                                               |
|   [Planning] (Root)                                           |
|      |                                                        |
|      +-- [PlannedDay] (Días relativos: 1..N)                  |
|      |     |                                                  |
|      |     +-- [MealService] (Desayuno, Comida, Cena)         |
|      |                                                        |
|      +-- [PlanningPantryItem] (Inventario local de la planif.) |
|      |                                                        |
|      +-- [PlanningShoppingItem] (Checklist de compra local)   |
+---------------------------------------------------------------+

+------------------------+      +------------------------+      +------------------------+
| AGREGADO RECETA        |      | AGREGADO INGREDIENTE   |      | AGREGADO ETIQUETA      |
|                        |      |                        |      |                        |
|   [Recipe] (Root)      |      |   [Ingredient] (Root)  |      |   [Tag] (Root)         |
+------------------------+      +------------------------+      +------------------------+
```

---

## 3. Especificación Detallada de Modelos

### Agregado: Planificación (Planning)
Es el contenedor temporal del menú. Se diseña de forma **relativa al calendario** para permitir su uso como plantillas (templates) y copias directas.

#### `Planning` (Raíz de Agregado / Entity)
*   `id`: `UUID` - Identificador único de la planificación.
*   `user_id`: `UUID` - Referencia al usuario propietario de la planificación.
*   `nombre`: `String?` - Nombre descriptivo opcional para identificar la planificación (e.g., "Menú de Invierno").
*   `fecha_inicio`: `Date?` - Fecha del lunes de inicio. Es **opcional (nullable)**. Si es nulo, la planificación actúa como una plantilla.
*   `semanas`: `Integer` - Número de semanas planificadas.
*   `dias_planificados`: `List<PlannedDay>` - Lista ordenada de días relativos. Su tamaño exacto es `semanas * 7`.
*   `pantry_items`: `List<PlanningPantryItem>` - Estado local de stock de ingredientes para esta planificación.
*   `shopping_items`: `List<PlanningShoppingItem>` - Estado local de checklist de compras para esta planificación.
*   **Reglas de Negocio:**
    *   La `fecha_inicio` (si se provee) debe validarse que corresponde a un día Lunes.
    *   La cantidad de `dias_planificados` se autogenera secuencialmente al crear el agregado.

#### `PlannedDay` (Entity)
*   `id`: `UUID` - Identificador único.
*   `orden_dia`: `Integer` - Número secuencial de día relativo (desde `1` hasta `semanas * 7`).
    *   *Nota de Arquitectura:* Un número secuencial simplifica la traslación a fechas del calendario real: `fecha_real = fecha_inicio + (orden_dia - 1) * dias`.
*   `servicios`: `Map<MealTime, MealService>` - Diccionario mapeando cada comida del día.

#### `MealTime` (Enum / Value Object)
*   Valores: `DESAYUNO` (Breakfast), `COMIDA` (Lunch), `CENA` (Dinner).

#### `MealService` (Entity)
*   `comensales`: `Integer` - Cantidad de personas para este servicio. Si es `0`, el servicio se considera excluido de la planificación.
*   `receta_id`: `UUID?` - Referencia opcional a la receta asignada. `null` si el motor de planificación aún no la ha calculado o si no se ha elegido manualmente.
*   `exclusiones`: `Set<UUID>` - Referencia a IDs de etiquetas (`Tag`) que el motor de planificación no puede elegir.
*   `preferencias`: `Set<UUID>` - Referencia a IDs de etiquetas (`Tag`) que el motor de planificación intentará priorizar.

#### `PlanningPantryItem` (Entity)
Representa la declaración del usuario sobre el stock disponible para un ingrediente específico dentro de esta planificación.
*   `id`: `UUID`
*   `ingrediente_id`: `UUID` - Referencia al ingrediente maestro.
*   `disponible`: `Boolean` - Equivalente al botón "Tengo de todo" para este ingrediente. Si es `true`, indica que hay stock suficiente en la casa para cubrir toda esta planificación.
*   `comidas_cobertura`: `Integer` - Número de comensales/servicios (porciones) que se pueden cubrir con el stock actual de la despensa (por defecto `0`).

#### `PlanningShoppingItem` (Entity)
Mantiene el estado de checklist de compra para un ingrediente dentro de esta planificación.
*   `id`: `UUID`
*   `ingrediente_id`: `UUID` - Referencia al ingrediente maestro.
*   `completado`: `Boolean` - `true` si el usuario ya lo compró en el supermercado; `false` de lo contrario.

---

### Agregado: Receta (Recipe)

#### `Recipe` (Raíz de Agregado / Entity)
*   `id`: `UUID` - Identificador único.
*   `user_id`: `UUID` - Referencia al usuario propietario de la receta.
*   `nombre`: `String` - Nombre descriptivo único para este usuario (e.g. "Milanesas con Puré").
*   `comensales_base`: `Integer` - Cantidad de comensales para la que está pensada la receta por defecto.
*   `tiempo_preparacion`: `Integer` - Tiempo estimado de elaboración en minutos.
*   `elaboracion`: `String?` - Descripción opcional de pasos de cocina (sin peso algorítmico).
*   `ingredientes_receta`: `List<RecipeIngredient>` - Listado de ingredientes necesarios para la elaboración base.
*   `etiquetas`: `Set<UUID>` - Referencia a las etiquetas (`Tag`) asociadas.

#### `RecipeIngredient` (Value Object)
*   `ingrediente_id`: `UUID` - Referencia al ingrediente maestro.
*   `nota_cantidad`: `String?` - Información adicional (e.g., "una pizca", "2 cucharadas"). Es de carácter meramente informativo para el usuario.

---

### Agregado: Ingrediente Maestro (Ingredient)
Garantiza la consistencia semántica en todo el sistema.

#### `Ingredient` (Raíz de Agregado / Entity)
*   `id`: `UUID` - Identificador único.
*   `user_id`: `UUID` - Referencia al usuario propietario de este ingrediente maestro.
*   `nombre`: `String` - Nombre descriptivo único para este usuario (e.g., "Arroz Blanco").
*   **Reglas de Negocio:**
    *   No pueden existir dos ingredientes con el mismo nombre en el sistema para evitar redundancias de catálogo.

---

### Agregado: Etiqueta (Tag)
El corazón de la lógica de filtros y del planificador automático.

#### `Tag` (Raíz de Agregado / Entity)
*   `id`: `UUID` - Identificador único.
*   `user_id`: `UUID?` - Referencia opcional al usuario propietario. Si es `null`, es una etiqueta del sistema predeterminada para todos los usuarios. Si tiene valor, es una etiqueta personalizada creada por este usuario.
*   `nombre`: `String` - Nombre de la etiqueta (e.g., "Caliente", "Pasta", "Vegano", "Especial de la Casa").
*   `dimension`: `TagDimension` - Clasificación de la etiqueta.

#### `TagDimension` (Enum / Value Object)
*   Valores:
    *   `MOMENTO_DIA`: Desayuno, Comida, Cena.
    *   `FORMATO`: Caliente, Frío.
    *   `TIPO_PLATO`: Carne, Pescado, Legumbres, Pasta, Ensalada, Arroz, Dulce.
    *   `ESTILOS_VIDA`: Bajo en calorías, Vegetariano, Vegano, Alérgenos, Personalizada.

---

## 4. Vistas Proyectadas / Modelos de Lectura (Read Models / Virtual Views)

Estas estructuras de datos **no se almacenan físicamente en la base de datos**. Se calculan "al vuelo" (on the fly) en la capa de aplicación combinando datos de múltiples agregados persistidos. Este enfoque garantiza una **Única Fuente de Verdad** (Single Source of Truth) y evita la redundancia o desincronización de datos.

### Vista 1: Lista de Ingredientes Necesarios (NeededIngredientsView)
Es la consolidación de todos los ingredientes necesarios para llevar a cabo el menú planificado.

#### Estructura de Datos (Virtual Object):
*   `ingrediente_id`: `UUID` - Identificador del ingrediente maestro.
*   `nombre_ingrediente`: `String` - Nombre de cara al usuario.
*   `comidas_estimadas`: `Integer` - Número acumulado de comensales/comidas de la planificación que requieren el ingrediente (ej. 15 comensales totales en 4 días).

#### Algoritmo de Cálculo (al vuelo):
1.  Se obtienen todos los `PlannedDay` de la planificación activa donde los servicios tengan `comensales > 0` y una `receta_id` asignada.
2.  Por cada servicio asignado, se obtiene su `Recipe` correspondiente y su lista de `RecipeIngredient`.
3.  Se calcula la cantidad proporcional de comensales y se acumula en un mapa agrupado por `ingrediente_id`.
4.  Se ordena alfabéticamente por `nombre_ingrediente` antes de enviarlo a la interfaz de usuario.

---

### Vista 2: Lista de la Compra Proyectada (ShoppingListView)
Representa los ítems que el usuario debe comprar en el supermercado, mostrando las cantidades netas faltantes tras restar las existencias de la despensa local.

#### Estructura de Datos (Virtual Object):
*   `ingrediente_id`: `UUID`
*   `nombre_ingrediente`: `String`
*   `comidas_necesarias`: `Integer` - Cantidad total bruta requerida para la planificación (de Vista 1).
*   `comidas_cobertura`: `Integer` - Porciones cubiertas por el stock en despensa (de `PlanningPantryItem`).
*   `comidas_faltantes`: `Integer` - Cantidad neta que se debe comprar: `comidas_necesarias - comidas_cobertura`.
*   `completado`: `Boolean` - Vinculado a `PlanningShoppingItem.completado`.

#### Algoritmo de Cálculo (al vuelo):
1.  Se calcula la **Vista 1 (Lista de Ingredientes Necesarios)**.
2.  Por cada ítem de esa lista, se busca si existe un `PlanningPantryItem` en la planificación:
    *   Si existe y `disponible == true` ("tengo de todo"), el ítem **se descarta** (o se considera `comidas_faltantes = 0`).
    *   Si existe y `disponible == false`, se lee `comidas_cobertura` (por defecto `0`). Se calcula `comidas_faltantes = Max(0, comidas_necesarias - comidas_cobertura)`. Si `comidas_faltantes == 0`, se descarta del listado de compra.
    *   Si no existe ningún registro, se asume `comidas_cobertura = 0` y `comidas_faltantes = comidas_necesarias`.
3.  Para los ítems resultantes con `comidas_faltantes > 0`, se busca si existe un `PlanningShoppingItem` en la planificación:
    *   Si existe, se mapea su estado `completado` (true/false).
    *   Si no existe, se asume `completado = false`.
4.  Se presenta al usuario la lista de la compra calculada con el desglose de lo necesario, lo que se tiene y lo faltante.
