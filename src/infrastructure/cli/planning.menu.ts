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
  console.log('--- Planificaciones ---');
  plannings.forEach(p => {
    const days = p.getDays();
    console.log(`\n(id: ${p.getId()}) ${p.getName()} — ${p.getWeeks()} semanas, ${days.length} dias`);
    days.forEach(d => {
      const meals = Object.values(d.toDTO().services).filter(s => s !== null);
      const info = meals.map(m => `${m.getCovers()} comensales${m.getRecipeId() ? ' (con receta)' : ''}`).join(', ');
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
        const info = meals.map(m => `${m.getCovers()} comensales${m.getRecipeId() ? ' (receta)' : ''}`).join(', ');
        console.log(`  Dia ${d.getOrdenDia()}: ${meals.length} servicio(s) — ${info || 'vacio'}`);
      });
    }

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar dias:',
      choices: [
        { title: 'Agregar dia',       value: 'add-day' },
        { title: 'Eliminar dia',      value: 'remove-day' },
        { title: 'Gestionar servicios de un dia', value: 'manage-meals' },
        { title: 'Volver',            value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add-day':
        await agregarDia(container, planningId, planning.getWeeks());
        break;
      case 'remove-day':
        await eliminarDia(container, planningId, days);
        break;
      case 'manage-meals':
        await gestionarServicios(container, userId, planningId, days);
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
        { title: 'Agregar / modificar servicio', value: 'add-meal' },
        { title: 'Eliminar servicio',             value: 'remove-meal' },
        { title: 'Volver',                        value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add-meal':
        await agregarOActualizarServicio(container, userId, planningId, ordenDia, allTags, allRecipes);
        break;
      case 'remove-meal':
        await eliminarServicio(container, planningId, ordenDia, meals, allTags);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

async function agregarOActualizarServicio(
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
    console.log('Servicio asignado/actualizado');
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
