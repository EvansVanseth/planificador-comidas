import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';
import { agregarServicio } from './planning-service-add.menu';
import { modificarServicio } from './planning-service-edit.menu';
import { eliminarServicio } from './planning-service-remove.menu';
import { gestionarExclusiones } from './planning-service-exclusions.menu';
import { gestionarPreferencias } from './planning-service-preferences.menu';

const ON_CANCEL = () => {};

export async function gestionarServicios(container: IContainer, userId: string, planningId: string, days: any[]) {
  if (days.length === 0) {
    console.log('No hay dias. Agrega un dia primero.');
    return;
  }

  const elegido = await prompts({
    type: 'select',
    name: 'orden',
    message: 'Selecciona el dia:',
    choices: [
      { title: '(Cancelar)', value: '__cancel__' },
      ...days.map(d => ({ title: `Dia ${d.getOrdenDia()}`, value: d.getOrdenDia() })),
    ],
  }, { onCancel: ON_CANCEL });

  if (!elegido || elegido.orden === '__cancel__') return;
  const ordenDia = elegido.orden;

  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) return;
    const day = planning.getDay(ordenDia);
    const meals = day ? Object.entries(day.services).filter(([_, s]) => s !== null) : [];

    const allTags = container.listTags.execute(userId).filter(t => t.dimension === TagDimension.MOMENTO_DIA);
    const allRecipes = container.listRecipes.execute(userId);

    console.log(theme.header(`\n--- Dia ${ordenDia} ---`));
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
