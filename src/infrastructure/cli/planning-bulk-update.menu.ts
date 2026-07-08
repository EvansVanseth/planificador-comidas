import prompts from 'prompts';
import { IContainer } from '../container';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';
import { mostrarPlanificacion } from './planning-display';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function editarDias(container: IContainer, userId: string, planningId: string) {
  try {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) { console.log('Planificacion no encontrada'); return; }

    const days = planning.getDays().sort((a, b) => a.getOrdenDia() - b.getOrdenDia());
    if (days.length === 0) {
      console.log('No hay dias. Agrega un dia primero.');
      return;
    }

    mostrarPlanificacion(planning, container.listRecipes.execute(userId), container.listTags.execute(userId));

    const seleccionDias = await prompts({
      type: 'multiselect',
      name: 'orders',
      message: 'Selecciona los dias (ESPACIO para marcar, ENTER para confirmar):',
      choices: days.map(d => ({
        title: `Dia ${d.getOrdenDia()} (${d.toDTO().services ? Object.keys(d.toDTO().services).filter(k => d.toDTO().services[k]).length : 0} servicios)`,
        value: d.getOrdenDia(),
      })),
      instructions: false,
    }, { onCancel: ON_CANCEL });

    if (!seleccionDias?.orders || seleccionDias.orders.length === 0) return;

    const orders: number[] = seleccionDias.orders;

    let continuar = true;
    while (continuar) {
      const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
      if (!planning) { console.log('Planificacion no encontrada'); return; }

      const allTags = container.listTags.execute(userId);
      const momentTags = allTags.filter(t => t.dimension === TagDimension.MOMENTO_DIA);
      const nonMomentTags = allTags.filter(t => t.dimension !== TagDimension.MOMENTO_DIA);
      const allRecipes = container.listRecipes.execute(userId);

      console.log(`\n--- Editando ${orders.length} dia(s) ---`);
      const recipeNameMap = new Map(allRecipes.map(r => [r.id, r.name]));
      const tagNameMap = new Map(allTags.map(t => [t.id, t.name]));
      orders.forEach(orden => {
        const day = planning.getDay(orden);
        if (!day) return;
        const services = day.services;
        const mealEntries = Object.entries(services).filter(([_, s]) => s !== null) as [string, NonNullable<typeof services[string]>][];

        console.log(`  Dia ${orden}: ${mealEntries.length} servicio(s)`);
        if (mealEntries.length === 0) {
          console.log('    (vacio)');
        } else {
          mealEntries.forEach(([tagId, meal]) => {
            const tag = momentTags.find(t => t.id === tagId);
            const tagName = tag ? tag.name : tagId;
            const recipeId = meal.getRecipeId();
            const name = recipeId ? (recipeNameMap.get(recipeId) ?? '?') : null;
            const exclusions = meal.getExclusions().map(id => tagNameMap.get(id) ?? id);
            const preferences = meal.getPreferences().map(id => tagNameMap.get(id) ?? id);
            console.log(`    ${tagName}: ${meal.getCovers()} comensales${name ? ` — ${name}` : ''}`);
            if (exclusions.length > 0) console.log(`      Exclusiones: ${exclusions.join(', ')}`);
            if (preferences.length > 0) console.log(`      Preferencias: ${preferences.join(', ')}`);
          });
        }
      });

      const opcion = await prompts({
        type: 'select',
        name: 'value',
        message: 'Accion sobre los dias seleccionados:',
        choices: [
          { title: 'Agregar servicio',       value: 'add-meal' },
          { title: 'Modificar servicio',     value: 'edit-meal' },
          { title: 'Eliminar servicio',      value: 'remove-meal' },
          { title: 'Gestionar exclusiones',  value: 'exclusions' },
          { title: 'Gestionar preferencias', value: 'preferences' },
          { title: 'Volver',                 value: 'back' },
        ],
      }, { onCancel: ON_CANCEL });

      if (!opcion?.value) continue;
      if (opcion.value === 'back') { continuar = false; break; }

      try {
        switch (opcion.value) {
          case 'add-meal': {
            const momentResp = await prompts({
              type: 'select',
              name: 'id',
              message: 'Momento del dia:',
              choices: [
                { title: '(Cancelar)', value: '__cancel__' },
                ...momentTags.map(t => ({ title: t.name, value: t.id })),
              ],
            }, { onCancel: ON_CANCEL });
            if (!momentResp?.id || momentResp.id === '__cancel__') break;

            const coversResp = await prompts({
              type: 'number',
              name: 'value',
              message: 'Comensales:',
              validate: (v: number) => v >= 1 ? true : 'Debe ser al menos 1',
            }, { onCancel: ON_CANCEL });
            if (!coversResp) break;

            let recipeId: string | undefined;
            if (allRecipes.length > 0) {
              const recipeResp = await prompts({
                type: 'select',
                name: 'id',
                message: 'Receta (opcional):',
                choices: [
                  { title: '(ninguna)', value: '' },
                  ...allRecipes.map(r => ({ title: r.name, value: r.id })),
                ],
              }, { onCancel: ON_CANCEL });
              if (recipeResp?.id) recipeId = recipeResp.id;
            }

            container.bulkAssignMeal.execute({ planningId, days: orders, momentTagId: momentResp.id, covers: coversResp.value, recipeId });
            console.log('✓ ' + `Servicio asignado a ${orders.length} dia(s)`);
            break;
          }

          case 'edit-meal': {
            const momentResp = await prompts({
              type: 'select',
              name: 'id',
              message: 'Momento del dia a modificar:',
              choices: [
                { title: '(Cancelar)', value: '__cancel__' },
                ...momentTags.map(t => ({ title: t.name, value: t.id })),
              ],
            }, { onCancel: ON_CANCEL });
            if (!momentResp?.id || momentResp.id === '__cancel__') break;

            const coversResp = await prompts({
              type: 'number',
              name: 'value',
              message: 'Nuevos comensales:',
              validate: (v: number) => v >= 0 ? true : 'Debe ser un numero positivo',
            }, { onCancel: ON_CANCEL });
            if (coversResp === undefined) break;

            const recipeResp = await prompts({
              type: 'select',
              name: 'id',
              message: 'Receta:',
              choices: [
                { title: '(sin cambios)', value: '__unchanged__' },
                { title: '(quitar receta)', value: '__clear__' },
                ...allRecipes.map(r => ({ title: r.name, value: r.id })),
              ],
            }, { onCancel: ON_CANCEL });
            if (!recipeResp?.id) break;

            const recipeId = recipeResp.id === '__unchanged__' ? undefined : recipeResp.id === '__clear__' ? undefined : recipeResp.id;
            const clearRecipe = recipeResp.id === '__clear__';

            container.bulkAssignMeal.execute({ planningId, days: orders, momentTagId: momentResp.id, covers: coversResp.value, recipeId, clearRecipe });
            console.log('✓ ' + `Servicio modificado en ${orders.length} dia(s)`);
            break;
          }

          case 'remove-meal': {
            const momentResp = await prompts({
              type: 'select',
              name: 'id',
              message: 'Momento del dia a eliminar:',
              choices: [
                { title: '(Cancelar)', value: '__cancel__' },
                ...momentTags.map(t => ({ title: t.name, value: t.id })),
              ],
            }, { onCancel: ON_CANCEL });
            if (!momentResp?.id || momentResp.id === '__cancel__') break;

            const confirmar = await prompts({
              type: 'confirm',
              name: 'value',
              message: `¿Eliminar servicio de ${orders.length} dia(s)?`,
              initial: false,
            }, { onCancel: ON_CANCEL });
            if (!confirmar?.value) break;

            container.bulkRemoveMeal.execute({ planningId, days: orders, momentTagId: momentResp.id });
            console.log('✓ ' + `Servicio eliminado de ${orders.length} dia(s)`);
            break;
          }

          case 'exclusions': {
            const exclResp = await prompts({
              type: 'multiselect',
              name: 'tags',
              message: 'Selecciona etiquetas a excluir (ESPACIO para marcar, ENTER para confirmar — vacio limpia exclusiones):',
              choices: nonMomentTags.map(t => ({
                title: `${t.name} (${t.dimension})`,
                value: t.id,
              })),
              instructions: false,
            }, { onCancel: ON_CANCEL });
            if (exclResp === undefined) break;

            const confirmar = await prompts({
              type: 'confirm',
              name: 'value',
              message: `¿Aplicar exclusiones a ${orders.length} dia(s)?`,
              initial: true,
            }, { onCancel: ON_CANCEL });
            if (!confirmar?.value) break;

            container.bulkUpdateDays.execute({ planningId, days: orders, exclusions: exclResp.tags });
            console.log('✓ ' + `Exclusiones actualizadas en ${orders.length} dia(s)`);
            break;
          }

          case 'preferences': {
            const prefResp = await prompts({
              type: 'multiselect',
              name: 'tags',
              message: 'Selecciona etiquetas preferidas (ESPACIO para marcar, ENTER para confirmar — vacio limpia preferencias):',
              choices: nonMomentTags.map(t => ({
                title: `${t.name} (${t.dimension})`,
                value: t.id,
              })),
              instructions: false,
            }, { onCancel: ON_CANCEL });
            if (prefResp === undefined) break;

            const confirmar = await prompts({
              type: 'confirm',
              name: 'value',
              message: `¿Aplicar preferencias a ${orders.length} dia(s)?`,
              initial: true,
            }, { onCancel: ON_CANCEL });
            if (!confirmar?.value) break;

            container.bulkUpdateDays.execute({ planningId, days: orders, preferences: prefResp.tags });
            console.log('✓ ' + `Preferencias actualizadas en ${orders.length} dia(s)`);
            break;
          }
        }
      } catch (error) {
        if (error instanceof DomainError || error instanceof AppError) {
          console.log('✗ ' + error.message);
        }
      }
    }
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
