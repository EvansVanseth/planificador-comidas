import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';
import { mostrarPlanificacion } from './planning-display';

const ON_CANCEL = () => {};

export async function gestionarDias(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) { console.log('Planificacion no encontrada'); return; }

    const days = planning.getDays();
    mostrarPlanificacion(planning, container.listRecipes.execute(userId), container.listTags.execute(userId));

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar dias:',
      choices: [
        { title: 'Agregar dia',    value: 'add-day' },
        { title: 'Editar dia',     value: 'manage-meals' },
        { title: 'Eliminar dia',   value: 'remove-day' },
        { title: 'Volver',         value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add-day':
        await agregarDia(container, planningId, planning.getWeeks());
        break;
      case 'manage-meals':
        await gestionarServicios(container, userId, planningId, days);
        break;
      case 'remove-day':
        await eliminarDia(container, planningId, days);
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
