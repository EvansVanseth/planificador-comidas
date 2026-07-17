import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';
import { TagDimension } from '../../../domain/recipes/value-objects/tag-dimension.enum';
import { mostrarReceta, DIMENSION_LABELS } from './recipe-display';

const ON_CANCEL = () => {};

export async function gestionarEtiquetas(container: IContainer, userId: string, recipeId: string) {
  let continuar = true;
  while (continuar) {
    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar etiquetas:',
      choices: [
        { title: 'Agregar etiqueta existente', value: 'add-existing' },
        { title: 'Crear y agregar nueva etiqueta', value: 'add-new' },
        { title: 'Quitar etiqueta', value: 'remove' },
        { title: 'Volver', value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add-existing':
        await agregarEtiquetaExistente(container, userId, recipeId);
        break;
      case 'add-new':
        await agregarNuevaEtiqueta(container, userId, recipeId);
        break;
      case 'remove':
        await quitarEtiqueta(container, userId, recipeId);
        break;
      case 'back':
        continuar = false;
        break;
    }

    if (opcion.value !== 'back') {
      const recipe = (await container.listRecipes.execute(userId)).find(r => r.id === recipeId);
      if (recipe) {
        const allIngredients = await container.listIngredients.execute(userId);
        const allTags = await container.listTags.execute(userId);
        mostrarReceta(recipe, allIngredients, allTags);
      }
    }
  }
}

async function agregarEtiquetaExistente(container: IContainer, userId: string, recipeId: string) {
  try {
    const disponibles = await container.listTags.execute(userId);
    if (disponibles.length === 0) {
      console.log('No hay etiquetas disponibles. Crea una primero.');
      return;
    }

    const elegida = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona etiqueta:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...disponibles.map(t => ({ title: `${t.name} (${DIMENSION_LABELS[t.dimension] || t.dimension})`, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegida?.id || elegida.id === '__cancel__') return;

    const tag = disponibles.find(t => t.id === elegida.id)!;
    await container.updateRecipe.execute({
      id: recipeId,
      addTags: [{ id: elegida.id, dimension: tag.dimension as TagDimension }],
    });
    console.log('✓ Etiqueta agregada a la receta');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function agregarNuevaEtiqueta(container: IContainer, userId: string, recipeId: string) {
  try {
    const datos = await prompts([
      { type: 'text', name: 'name', message: 'Nombre de la etiqueta:' },
      {
        type: 'select',
        name: 'dimension',
        message: 'Dimension:',
        choices: [
          { title: '(Cancelar)', value: '__cancel__' },
          ...Object.entries(DIMENSION_LABELS).map(([value, title]) => ({ title, value })),
        ],
      },
    ], { onCancel: ON_CANCEL });

    if (!datos?.name?.trim() || datos.dimension === '__cancel__') return;

    await container.addNewTagToRecipe.execute(
      userId,
      recipeId,
      datos.name.trim(),
      datos.dimension as TagDimension,
    );
    console.log('✓ Etiqueta creada y agregada a la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function quitarEtiqueta(container: IContainer, userId: string, recipeId: string) {
  try {
    const receta = (await container.listRecipes.execute(userId)).find(r => r.id === recipeId);
    if (!receta) return;

    const allTags = await container.listTags.execute(userId);
    const currentTags = receta.tags.map(rt => {
      const tag = allTags.find(t => t.id === rt.id);
      return { id: rt.id, display: tag ? `${tag.name} (${DIMENSION_LABELS[rt.dimension] || rt.dimension})` : rt.id };
    });

    if (currentTags.length === 0) {
      console.log('La receta no tiene etiquetas');
      return;
    }

    const elegida = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona etiqueta a quitar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...currentTags.map(t => ({ title: t.display, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegida?.id || elegida.id === '__cancel__') return;

    await container.updateRecipe.execute({ id: recipeId, removeTags: [elegida.id] });
    console.log('✓ Etiqueta quitada de la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
