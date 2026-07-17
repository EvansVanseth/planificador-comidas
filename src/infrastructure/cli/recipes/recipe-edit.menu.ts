import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';
import { gestionarIngredientes } from './recipe-ingredients.menu';
import { gestionarEtiquetas } from './recipe-tags.menu';
import { mostrarReceta } from './recipe-display';

const ON_CANCEL = () => {};

export async function editarReceta(container: IContainer, userId: string) {
  const recipes = await container.listRecipes.execute(userId);
  if (recipes.length === 0) {
    console.log('No hay recetas para editar');
    return;
  }

  const seleccion = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la receta a editar:',
    choices: [
      { title: '(Cancelar)', value: '__cancel__' },
      ...recipes.map(r => ({ title: r.name, value: r.id })),
    ],
  }, { onCancel: ON_CANCEL });

  if (!seleccion?.id || seleccion.id === '__cancel__') return;
  const recipeId = seleccion.id;

  let continuar = true;
  while (continuar) {
    const recipe = (await container.listRecipes.execute(userId)).find(r => r.id === recipeId);
    if (!recipe) {
      console.log('Receta no encontrada');
      return;
    }

    const allIngredients = await container.listIngredients.execute(userId);
    const allTags = await container.listTags.execute(userId);

    mostrarReceta(recipe, allIngredients, allTags);

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Editar — ¿Que quieres hacer?',
      choices: [
        { title: 'Editar datos',          value: 'edit-data' },
        { title: 'Editar ingredientes',   value: 'edit-ingredients' },
        { title: 'Editar etiquetas',      value: 'edit-tags' },
        { title: 'Volver',                value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'edit-data':
        await editarDatosReceta(container, recipeId);
        break;
      case 'edit-ingredients':
        await gestionarIngredientes(container, userId, recipeId);
        break;
      case 'edit-tags':
        await gestionarEtiquetas(container, userId, recipeId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

async function editarDatosReceta(container: IContainer, recipeId: string) {
  try {
    const cambios = await prompts([
      { type: 'text', name: 'name', message: 'Nuevo nombre (dejar vacio para mantener):' },
      { type: 'number', name: 'baseServings', message: 'Nuevos comensales base (0 para mantener):', initial: 0 },
      { type: 'number', name: 'prepTime', message: 'Nuevo tiempo (min, 0 para mantener):', initial: 0 },
    ], { onCancel: ON_CANCEL });

    if (!cambios) return;

    const input: any = { id: recipeId };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    if (cambios.baseServings > 0) input.baseServings = cambios.baseServings;
    if (cambios.prepTime > 0) input.prepTime = cambios.prepTime;
    await container.updateRecipe.execute(input);
    } catch (error) {
      if (error instanceof DomainError || error instanceof AppError) {
        console.log('✗ ' + error.message);
      }
      console.log('\n--- Edicion cancelada ---');
  }
}
