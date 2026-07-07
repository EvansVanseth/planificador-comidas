import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { mostrarReceta } from './recipe-display';

const ON_CANCEL = () => {};

export async function gestionarIngredientes(container: IContainer, userId: string, recipeId: string) {
  let continuar = true;
  while (continuar) {
    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar ingredientes:',
      choices: [
        { title: 'Agregar ingrediente existente', value: 'add-existing' },
        { title: 'Crear y agregar nuevo ingrediente', value: 'add-new' },
        { title: 'Quitar ingrediente', value: 'remove' },
        { title: 'Volver', value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add-existing':
        await agregarIngredienteExistente(container, userId, recipeId);
        break;
      case 'add-new':
        await agregarNuevoIngrediente(container, userId, recipeId);
        break;
      case 'remove':
        await quitarIngrediente(container, userId, recipeId);
        break;
      case 'back':
        continuar = false;
        break;
    }

    if (opcion.value !== 'back') {
      const recipe = container.listRecipes.execute(userId).find(r => r.id === recipeId);
      if (recipe) {
        const allIngredients = container.listIngredients.execute(userId);
        const allTags = container.listTags.execute(userId);
        mostrarReceta(recipe, allIngredients, allTags);
      }
    }
  }
}

async function agregarIngredienteExistente(container: IContainer, userId: string, recipeId: string) {
  try {
    const disponibles = container.listIngredients.execute(userId);
    if (disponibles.length === 0) {
      console.log('No hay ingredientes disponibles. Crea uno primero.');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona ingrediente:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...disponibles.map(i => ({ title: i.name, value: i.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido?.id || elegido.id === '__cancel__') return;

    const note = await prompts({
      type: 'text',
      name: 'value',
      message: 'Nota de cantidad (opcional):',
    }, { onCancel: ON_CANCEL });

    container.updateRecipe.execute({
      id: recipeId,
      addIngredients: [{ ingredientId: elegido.id, quantityNote: note?.value?.trim() || null }],
    });
    console.log('Ingrediente agregado a la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function agregarNuevoIngrediente(container: IContainer, userId: string, recipeId: string) {
  try {
    const datos = await prompts([
      { type: 'text', name: 'name', message: 'Nombre del ingrediente:' },
      { type: 'text', name: 'note', message: 'Nota de cantidad (opcional):' },
    ], { onCancel: ON_CANCEL });

    if (!datos?.name?.trim()) return;

    container.addNewIngredientToRecipe.execute(
      userId,
      recipeId,
      datos.name.trim(),
      datos.note?.trim() || undefined,
    );
    console.log('Ingrediente creado y agregado a la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function quitarIngrediente(container: IContainer, userId: string, recipeId: string) {
  try {
    const receta = container.listRecipes.execute(userId).find(r => r.id === recipeId);
    if (!receta) return;

    const allIngredients = container.listIngredients.execute(userId);
    const currentIngredients = receta.ingredients.map(ri => {
      const ing = allIngredients.find(i => i.id === ri.ingredientId);
      return { id: ri.ingredientId, display: ing ? `${ing.name}${ri.quantityNote ? ` (${ri.quantityNote})` : ''}` : ri.ingredientId };
    });

    if (currentIngredients.length === 0) {
      console.log('La receta no tiene ingredientes');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona ingrediente a quitar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...currentIngredients.map(i => ({ title: i.display, value: i.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido?.id || elegido.id === '__cancel__') return;

    container.updateRecipe.execute({ id: recipeId, removeIngredients: [elegido.id] });
    console.log('Ingrediente quitado de la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
