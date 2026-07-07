import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';

const ON_CANCEL = () => {};

export async function menuPlanificaciones(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Planificaciones — ¿Que quieres hacer?',
      choices: [
        { title: 'Ver planificaciones',    value: 'list' },
        { title: 'Crear planificacion',    value: 'create' },
        { title: 'Editar planificacion',   value: 'edit' },
        { title: 'Gestionar dias',         value: 'days' },
        { title: 'Eliminar planificacion', value: 'delete' },
        { title: 'Volver',                 value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarPlanificaciones(container, userId);
        break;
      case 'create':
        await crearPlanificacion(container, userId);
        break;
      case 'edit':
        await editarPlanificacion(container, userId);
        break;
      case 'days':
        await gestionarDias(container, userId);
        break;
      case 'delete':
        await eliminarPlanificacion(container, userId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

function listarPlanificaciones(container: IContainer, userId: string) {
  const plannings = container.listPlannings.execute(userId);
  if (plannings.length === 0) {
    console.log('No hay planificaciones');
    return;
  }
  const allRecipes = container.listRecipes.execute(userId);
  const recipeName = (id: string | null) => id ? (allRecipes.find(r => r.id === id)?.name ?? id) : null;

  console.log('--- Planificaciones ---');
  plannings.forEach(p => {
    const days = p.getDays();
    console.log(`\n(id: ${p.getId()}) ${p.getName()} — ${p.getWeeks()} semanas, ${days.length} dias`);
    days.forEach(d => {
      const meals = Object.values(d.toDTO().services).filter(s => s !== null);
      const info = meals.map(m => {
        const name = recipeName(m.getRecipeId());
        return `${m.getCovers()} comensales${name ? ` — ${name}` : ''}`;
      }).join(', ');
      console.log(`  Dia ${d.getOrdenDia()}: ${meals.length} servicio(s) — ${info || 'vacio'}`);
    });
  });
}

async function crearPlanificacion(container: IContainer, userId: string) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre:' },
      { type: 'number', name: 'weeks', message: 'Semanas:' }
    ], { onCancel: ON_CANCEL });

    if (!answers) return;

    const id = container.createPlanning.execute(userId, answers.name, null, answers.weeks);
    console.log(`Planificacion creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}

async function editarPlanificacion(container: IContainer, userId: string) {
  try {
    const plannings = container.listPlannings.execute(userId);
    if (plannings.length === 0) {
      console.log('No hay planificaciones para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la planificacion a editar:',
      choices: plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas, ${p.getDays().length} dias)`, value: p.getId() })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    const cambios = await prompts([
      { type: 'text', name: 'name', message: 'Nuevo nombre (dejar vacio para mantener):' },
      { type: 'number', name: 'weeks', message: 'Nuevas semanas (0 para mantener):', initial: 0 },
    ], { onCancel: ON_CANCEL });

    if (!cambios) return;

    const input: any = { id: seleccion.id };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    if (cambios.weeks > 0) input.weeks = cambios.weeks;
    container.updatePlanning.execute(input);
    console.log('Planificacion actualizada');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}

async function eliminarPlanificacion(container: IContainer, userId: string) {
  try {
    const plannings = container.listPlannings.execute(userId);
    if (plannings.length === 0) {
      console.log('No hay planificaciones para eliminar');
      return;
    }

    const response = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la planificacion a eliminar:',
      choices: plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas)`, value: p.getId() })),
    }, { onCancel: ON_CANCEL });

    if (!response?.id) return;

    container.deletePlanning.execute(response.id);
    console.log('Planificacion eliminada');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}

// --- Gestion de dias y servicios ---

async function gestionarDias(container: IContainer, userId: string) {
  const plannings = container.listPlannings.execute(userId);
  if (plannings.length === 0) {
    console.log('No hay planificaciones');
    return;
  }

  const seleccion = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la planificacion:',
    choices: plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas, ${p.getDays().length} dias)`, value: p.getId() })),
  }, { onCancel: ON_CANCEL });

  if (!seleccion?.id) return;
  const planningId = seleccion.id;

  const allRecipes = container.listRecipes.execute(userId);
  const recipeName = (id: string | null) => id ? (allRecipes.find(r => r.id === id)?.name ?? id) : null;

  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) { console.log('Planificacion no encontrada'); return; }

    const days = planning.getDays();
    console.log(`\n--- ${planning.getName()} — ${planning.getWeeks()} semanas ---`);
    if (days.length === 0) {
      console.log('  (sin dias agregados aun)');
    } else {
      days.forEach(d => {
        const meals = Object.values(d.toDTO().services).filter(s => s !== null);
        const info = meals.map(m => {
          const name = recipeName(m.getRecipeId());
          return `${m.getCovers()} comensales${name ? ` — ${name}` : ''}`;
        }).join(', ');
        console.log(`  Dia ${d.getOrdenDia()}: ${meals.length} servicio(s) — ${info || 'vacio'}`);
      });
    }

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar dias:',
      choices: [
        { title: 'Ver ingredientes necesarios', value: 'needed-ingredients' },
        { title: 'Ver lista de la compra',      value: 'shopping-list' },
        { title: 'Agregar dia',       value: 'add-day' },
        { title: 'Eliminar dia',      value: 'remove-day' },
        { title: 'Gestionar servicios de un dia', value: 'manage-meals' },
        { title: 'Gestionar despensa', value: 'pantry' },
        { title: 'Gestionar lista de compra', value: 'shopping' },
        { title: 'Volver',            value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'needed-ingredients':
        verIngredientesNecesarios(container, planningId);
        break;
      case 'shopping-list':
        verListaCompra(container, planningId);
        break;
      case 'add-day':
        await agregarDia(container, planningId, planning.getWeeks());
        break;
      case 'remove-day':
        await eliminarDia(container, planningId, days);
        break;
      case 'manage-meals':
        await gestionarServicios(container, userId, planningId, days);
        break;
      case 'pantry':
        await gestionarDespensa(container, userId, planningId);
        break;
      case 'shopping':
        await gestionarListaCompra(container, userId, planningId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

async function agregarDia(container: IContainer, planningId: string, weeks: number) {
  try {
    const maxDay = weeks * 7;
    const respuesta = await prompts({
      type: 'number',
      name: 'orden',
      message: `Numero de dia (1-${maxDay}):`,
      validate: (v: number) => v >= 1 && v <= maxDay ? true : `Debe ser entre 1 y ${maxDay}`,
    }, { onCancel: ON_CANCEL });

    if (!respuesta) return;

    container.addDayToPlanning.execute(planningId, respuesta.orden);
    console.log(`Dia ${respuesta.orden} agregado`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function eliminarDia(container: IContainer, planningId: string, days: any[]) {
  try {
    if (days.length === 0) {
      console.log('No hay dias para eliminar');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'orden',
      message: 'Selecciona dia a eliminar:',
      choices: days.map(d => ({ title: `Dia ${d.getOrdenDia()}`, value: d.getOrdenDia() })),
    }, { onCancel: ON_CANCEL });

    if (!elegido) return;

    container.removeDayFromPlanning.execute(planningId, elegido.orden);
    console.log(`Dia ${elegido.orden} eliminado`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function gestionarServicios(container: IContainer, userId: string, planningId: string, days: any[]) {
  if (days.length === 0) {
    console.log('No hay dias. Agrega un dia primero.');
    return;
  }

  const elegido = await prompts({
    type: 'select',
    name: 'orden',
    message: 'Selecciona el dia:',
    choices: days.map(d => ({ title: `Dia ${d.getOrdenDia()}`, value: d.getOrdenDia() })),
  }, { onCancel: ON_CANCEL });

  if (!elegido) return;
  const ordenDia = elegido.orden;

  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) return;
    const day = planning.getDay(ordenDia);
    const meals = day ? Object.entries(day.services).filter(([_, s]) => s !== null) : [];

    const allTags = container.listTags.execute(userId).filter(t => t.dimension === TagDimension.MOMENTO_DIA);
    const allRecipes = container.listRecipes.execute(userId);

    console.log(`\n--- Dia ${ordenDia} ---`);
    if (meals.length === 0) {
      console.log('  (sin servicios)');
    } else {
      meals.forEach(([tagId, meal]) => {
        const tag = allTags.find(t => t.id === tagId);
        const tagName = tag ? tag.name : tagId;
        const recipe = meal!.getRecipeId() ? allRecipes.find(r => r.id === meal!.getRecipeId()) : null;
        const recipeName = recipe ? recipe.name : (meal!.getRecipeId() ? '?' : 'ninguna');
        console.log(`  ${tagName}: ${meal!.getCovers()} comensales, receta: ${recipeName}`);
      });
    }

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar servicios:',
      choices: [
        { title: 'Agregar servicio',               value: 'add-meal' },
        { title: 'Modificar servicio',             value: 'edit-meal' },
        { title: 'Eliminar servicio',              value: 'remove-meal' },
        { title: 'Gestionar exclusiones',          value: 'exclusions' },
        { title: 'Gestionar preferencias',         value: 'preferences' },
        { title: 'Volver',                         value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    const usedTagIds = new Set(meals.map(([tagId]) => tagId));
    const availableTags = allTags.filter(t => !usedTagIds.has(t.id));

    switch (opcion.value) {
      case 'add-meal':
        await agregarServicio(container, userId, planningId, ordenDia, availableTags, allRecipes);
        break;
      case 'edit-meal':
        await modificarServicio(container, userId, planningId, ordenDia, meals, allTags, allRecipes);
        break;
      case 'remove-meal':
        await eliminarServicio(container, planningId, ordenDia, meals, allTags);
        break;
      case 'exclusions':
        await gestionarExclusiones(container, userId, planningId, ordenDia, meals, allTags);
        break;
      case 'preferences':
        await gestionarPreferencias(container, userId, planningId, ordenDia, meals, allTags);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

async function modificarServicio(
  container: IContainer,
  userId: string,
  planningId: string,
  ordenDia: number,
  meals: [string, any][],
  momentTags: any[],
  recipes: any[],
) {
  try {
    if (meals.length === 0) {
      console.log('No hay servicios que modificar');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'tagId',
      message: 'Selecciona el servicio a modificar:',
      choices: meals.map(([tagId, meal]) => {
        const tag = momentTags.find((t: any) => t.id === tagId);
        const tagName = tag ? tag.name : tagId;
        const recipe = meal!.getRecipeId() ? recipes.find((r: any) => r.id === meal!.getRecipeId()) : null;
        const recipeName = recipe ? recipe.name : (meal!.getRecipeId() ? '?' : 'ninguna');
        return { title: `${tagName} — ${meal!.getCovers()} comensales, ${recipeName}`, value: tagId };
      }),
    }, { onCancel: ON_CANCEL });

    if (!elegido?.tagId) return;

    const coversResp = await prompts({
      type: 'number',
      name: 'value',
      message: 'Nuevos comensales:',
      validate: (v: number) => v >= 0 ? true : 'Debe ser un numero positivo',
    }, { onCancel: ON_CANCEL });

    if (coversResp === undefined) return;
    const covers = coversResp.value;

    let recipeId: string | undefined;
    if (covers > 0 && recipes.length > 0) {
      const recipeResp = await prompts({
        type: 'select',
        name: 'id',
        message: 'Nueva receta (opcional):',
        choices: [
          { title: '(ninguna)', value: '' },
          ...recipes.map(r => ({ title: r.name, value: r.id })),
        ],
      }, { onCancel: ON_CANCEL });
      if (recipeResp?.id) recipeId = recipeResp.id;
    }

    container.assignMeal.execute(planningId, ordenDia, elegido.tagId, recipeId ?? '', covers);
    console.log('Servicio modificado');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function agregarServicio(
  container: IContainer,
  userId: string,
  planningId: string,
  ordenDia: number,
  momentTags: any[],
  recipes: any[],
) {
  try {
    if (momentTags.length === 0) {
      console.log('No hay etiquetas de tipo MOMENTO_DIA. Crea una primero.');
      return;
    }

    const tagElegida = await prompts({
      type: 'select',
      name: 'id',
      message: 'Momento del dia:',
      choices: momentTags.map(t => ({ title: t.name, value: t.id })),
    }, { onCancel: ON_CANCEL });

    if (!tagElegida?.id) return;

    const coversResp = await prompts({
      type: 'number',
      name: 'value',
      message: 'Comensales:',
      validate: (v: number) => v >= 0 ? true : 'Debe ser un numero positivo',
    }, { onCancel: ON_CANCEL });

    if (coversResp === undefined) return;
    const covers = coversResp.value;

    let recipeId: string | undefined;
    if (covers > 0 && recipes.length > 0) {
      const recipeResp = await prompts({
        type: 'select',
        name: 'id',
        message: 'Receta (opcional):',
        choices: [
          { title: '(ninguna)', value: '' },
          ...recipes.map(r => ({ title: r.name, value: r.id })),
        ],
      }, { onCancel: ON_CANCEL });
      if (recipeResp?.id) recipeId = recipeResp.id;
    }

    container.assignMeal.execute(planningId, ordenDia, tagElegida.id, recipeId ?? '', covers);
    console.log('Servicio agregado');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

function verIngredientesNecesarios(container: IContainer, planningId: string) {
  try {
    const items = container.getNeededIngredients.execute(planningId);
    if (items.length === 0) {
      console.log('No hay ingredientes necesarios (sin recetas asignadas)');
      return;
    }
    console.log('\n--- Ingredientes necesarios ---');
    items.forEach(i => {
      const recetas = i.recipeNames.join(', ');
      console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — ${i.totalCovers} comensales`);
      console.log(`    Recetas: ${recetas}`);
    });
    console.log(`Total: ${items.length} ingredientes\n`);
  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
  }
}

function verListaCompra(container: IContainer, planningId: string) {
  try {
    const items = container.getShoppingList.execute(planningId);
    if (items.length === 0) {
      console.log('No hay ingredientes en la lista de la compra');
      return;
    }
    console.log('\n--- Lista de la compra ---');
    items.forEach(i => {
      const tag = i.shoppingCompleted ? ' [COMPRADO]' : i.inShoppingList ? '' : '';
      if (i.pantryAvailable) {
        console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — ${i.totalCovers} comensales [TENGO DE TODO]${tag}`);
      } else if (i.neededAfterPantry <= 0) {
        console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — ${i.totalCovers} comensales [CUBIERTO]${tag}`);
      } else {
        console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — necesario para ${i.totalCovers} comensales, tienes para ${i.pantryCovers} → COMPRAR PARA ${i.neededAfterPantry}${tag}`);
      }
    });
    console.log(`Total: ${items.length} ingredientes\n`);
  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
  }
}

async function gestionarDespensa(container: IContainer, userId: string, planningId: string) {
  const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
  if (!planning) return;

  const allIngredients = container.listIngredients.execute(userId).map(i => i.name);

  let continuar = true;
  while (continuar) {
    const p = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!p) return;
    const pantry = p.getPantryItems();

    console.log(`\n--- Despensa (${pantry.length} items) ---`);
    pantry.forEach(item => {
      const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
      const name = ing?.name ?? item.getIngredientId();
      const status = item.isAvailable() ? '[TENGO DE TODO]' : `[cubre ${item.getCovers()} comensales]`;
      console.log(`  ${name} ${status}`);
    });

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar despensa:',
      choices: [
        { title: 'Agregar ingrediente a la despensa', value: 'add' },
        { title: 'Marcar como "tengo de todo"',       value: 'available' },
        { title: 'Actualizar comensales que cubre',   value: 'update-covers' },
        { title: 'Quitar de la despensa',             value: 'remove' },
        { title: 'Volver',                            value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add': {
        const needed = container.getNeededIngredients.execute(planningId);
        const choices = needed
          .filter(n => !pantry.some(pp => pp.getIngredientId() === n.ingredientId))
          .map(n => ({ title: n.ingredientName, value: n.ingredientId }));
        if (choices.length === 0) { console.log('Todos los ingredientes ya estan en la despensa'); break; }
        const resp = await prompts({ type: 'select', name: 'id', message: 'Ingrediente:', choices }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.addPantryItem.execute(planningId, resp.id);
          console.log('Agregado a la despensa');
        }
        break;
      }
      case 'available': {
        if (pantry.length === 0) { console.log('No hay items en la despensa'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Marcar como "tengo de todo":',
          choices: pantry.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.markPantryItemAvailable.execute(planningId, resp.id);
          console.log('Marcado como "tengo de todo"');
        }
        break;
      }
      case 'update-covers': {
        if (pantry.length === 0) { console.log('No hay items en la despensa'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Actualizar comensales que cubre:',
          choices: pantry.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (!resp?.id) break;
        const covers = await prompts({ type: 'number', name: 'value', message: 'Comensales que cubre en despensa:', validate: (v: number) => v >= 0 }, { onCancel: ON_CANCEL });
        if (covers !== undefined) {
          container.updatePantryItemCovers.execute(planningId, resp.id, covers.value);
          console.log('Cobertura actualizada');
        }
        break;
      }
      case 'remove': {
        if (pantry.length === 0) { console.log('No hay items en la despensa'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Quitar de la despensa:',
          choices: pantry.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.removePantryItem.execute(planningId, resp.id);
          console.log('Quitado de la despensa');
        }
        break;
      }
      case 'back':
        continuar = false;
        break;
    }
  }
}

async function gestionarListaCompra(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const p = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!p) return;
    const shopping = p.getShoppingItems();

    console.log(`\n--- Lista de compra (${shopping.length} items) ---`);
    shopping.forEach(item => {
      const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
      const name = ing?.name ?? item.getIngredientId();
      const status = item.isCompleted() ? '[COMPRADO]' : '[PENDIENTE]';
      console.log(`  ${name} ${status}`);
    });

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar lista de compra:',
      choices: [
        { title: 'Agregar ingrediente',        value: 'add' },
        { title: 'Marcar como comprado',       value: 'complete' },
        { title: 'Marcar como pendiente',      value: 'pending' },
        { title: 'Quitar de la lista',         value: 'remove' },
        { title: 'Volver',                     value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add': {
        const needed = container.getNeededIngredients.execute(planningId);
        const choices = needed
          .filter(n => !shopping.some(s => s.getIngredientId() === n.ingredientId))
          .map(n => ({ title: n.ingredientName, value: n.ingredientId }));
        if (choices.length === 0) { console.log('Todos los ingredientes ya estan en la lista'); break; }
        const resp = await prompts({ type: 'select', name: 'id', message: 'Ingrediente:', choices }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.addShoppingItem.execute(planningId, resp.id);
          console.log('Agregado a la lista de compra');
        }
        break;
      }
      case 'complete': {
        const pendientes = shopping.filter(s => !s.isCompleted());
        if (pendientes.length === 0) { console.log('No hay items pendientes'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Marcar como comprado:',
          choices: pendientes.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.toggleShoppingItem.execute(planningId, resp.id, true);
          console.log('Marcado como comprado');
        }
        break;
      }
      case 'pending': {
        const comprados = shopping.filter(s => s.isCompleted());
        if (comprados.length === 0) { console.log('No hay items comprados'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Marcar como pendiente:',
          choices: comprados.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.toggleShoppingItem.execute(planningId, resp.id, false);
          console.log('Marcado como pendiente');
        }
        break;
      }
      case 'remove': {
        if (shopping.length === 0) { console.log('No hay items en la lista'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Quitar de la lista:',
          choices: shopping.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: `${ing?.name ?? item.getIngredientId()} (${item.isCompleted() ? 'comprado' : 'pendiente'})`, value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.removeShoppingItem.execute(planningId, resp.id);
          console.log('Quitado de la lista');
        }
        break;
      }
      case 'back':
        continuar = false;
        break;
    }
  }
}

async function gestionarExclusiones(
  container: IContainer,
  userId: string,
  planningId: string,
  ordenDia: number,
  meals: [string, any][],
  allTags: any[],
) {
  try {
    if (meals.length === 0) {
      console.log('No hay servicios en este dia');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'tagId',
      message: 'Selecciona el servicio:',
      choices: meals.map(([tagId, meal]) => {
        const tag = allTags.find((t: any) => t.id === tagId);
        const tagName = tag ? tag.name : tagId;
        const excls = meal!.getExclusions().length;
        return { title: `${tagName} (${excls} exclusiones)`, value: tagId };
      }),
    }, { onCancel: ON_CANCEL });

    if (!elegido?.tagId) return;
    const momentTagId = elegido.tagId;

    const allUserTags = container.listTags.execute(userId);
    const currentExclusions = meals.find(([id]) => id === momentTagId)?.[1]?.getExclusions() ?? [];

    const seleccion = await prompts({
      type: 'multiselect',
      name: 'tags',
      message: 'Selecciona etiquetas a excluir (ESPACIO para marcar, ENTER para confirmar):',
      choices: allUserTags.map(t => ({
        title: `${t.name} (${t.dimension})`,
        value: t.id,
        selected: currentExclusions.includes(t.id),
      })),
      instructions: false,
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.tags) return;

    container.setMealExclusions.execute(planningId, ordenDia, momentTagId, seleccion.tags);
    console.log(`Exclusiones actualizadas (${seleccion.tags.length} etiquetas)`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function gestionarPreferencias(
  container: IContainer,
  userId: string,
  planningId: string,
  ordenDia: number,
  meals: [string, any][],
  allTags: any[],
) {
  try {
    if (meals.length === 0) {
      console.log('No hay servicios en este dia');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'tagId',
      message: 'Selecciona el servicio:',
      choices: meals.map(([tagId, meal]) => {
        const tag = allTags.find((t: any) => t.id === tagId);
        const tagName = tag ? tag.name : tagId;
        const pref = meal!.getPreferences().length;
        return { title: `${tagName} (${pref} preferencias)`, value: tagId };
      }),
    }, { onCancel: ON_CANCEL });

    if (!elegido?.tagId) return;
    const momentTagId = elegido.tagId;

    const allUserTags = container.listTags.execute(userId);
    const currentPreferences = meals.find(([id]) => id === momentTagId)?.[1]?.getPreferences() ?? [];

    const seleccion = await prompts({
      type: 'multiselect',
      name: 'tags',
      message: 'Selecciona etiquetas preferidas (ESPACIO para marcar, ENTER para confirmar):',
      choices: allUserTags.map(t => ({
        title: `${t.name} (${t.dimension})`,
        value: t.id,
        selected: currentPreferences.includes(t.id),
      })),
      instructions: false,
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.tags) return;

    container.setMealPreferences.execute(planningId, ordenDia, momentTagId, seleccion.tags);
    console.log(`Preferencias actualizadas (${seleccion.tags.length} etiquetas)`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function eliminarServicio(container: IContainer, planningId: string, ordenDia: number, meals: [string, any][], allTags: any[]) {
  try {
    if (meals.length === 0) {
      console.log('No hay servicios para eliminar');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'tagId',
      message: 'Selecciona servicio a eliminar:',
      choices: meals.map(([tagId, meal]) => {
        const tag = allTags.find((t: any) => t.id === tagId);
        const tagName = tag ? tag.name : tagId;
        return { title: `${tagName} — ${meal!.getCovers()} comensales`, value: tagId };
      }),
    }, { onCancel: ON_CANCEL });

    if (!elegido?.tagId) return;

    container.removeMealFromDay.execute(planningId, ordenDia, elegido.tagId);
    console.log('Servicio eliminado');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
