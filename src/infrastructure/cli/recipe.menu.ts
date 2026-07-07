import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';
import { editarReceta } from './recipe-edit.menu';
import { mostrarReceta, DIMENSION_LABELS } from './recipe-display';

const ON_CANCEL = () => {};

export async function menuRecetas(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Recetas — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar recetas',   value: 'list' },
        { title: 'Crear receta',     value: 'create' },
        { title: 'Editar receta',    value: 'edit' },
        { title: 'Eliminar receta',  value: 'delete' },
        { title: 'Volver',           value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarRecetas(container, userId);
        break;
      case 'create':
        await crearReceta(container, userId);
        break;
      case 'edit':
        await editarReceta(container, userId);
        break;
      case 'delete':
        await eliminarReceta(container, userId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

function listarRecetas(container: IContainer, userId: string) {
  const recipes = container.listRecipes.execute(userId);
  if (recipes.length === 0) {
    console.log('No hay recetas');
    return;
  }

  const allIngredients = container.listIngredients.execute(userId);
  const allTags = container.listTags.execute(userId);

  console.log('--- Recetas ---');
  recipes.forEach(r => mostrarReceta(r, allIngredients, allTags));
}

async function crearReceta(container: IContainer, userId: string) {
  try {
    const tagsDisponibles = container.listTags.execute(userId);
    const datos = await prompts([
      { type: 'text', name: 'name', message: 'Nombre de la receta:' },
      { type: 'number', name: 'baseServings', message: 'Comensales base:', initial: 2 },
      { type: 'number', name: 'prepTime', message: 'Tiempo de preparacion (min):', initial: 30 },
      { type: 'text', name: 'preparation', message: 'Preparacion (dejar vacio si no):' },
    ], { onCancel: ON_CANCEL });

    if (!datos) return;

    const tagsConDim = tagsDisponibles.map(t => ({ id: t.id, name: t.name, dimension: t.dimension as TagDimension }));
    const requiredDims = ['MOMENTO_DIA', 'FORMATO', 'TIPO_PLATO'];
    const seleccionTags: { id: string; dimension: TagDimension }[] = [];

    for (const dim of requiredDims) {
      const disponibles = tagsConDim.filter(t => t.dimension === dim);
      if (disponibles.length === 0) {
        throw new AppError(`No hay etiquetas de tipo ${DIMENSION_LABELS[dim]}. Crea una primero.`);
      }
      const elegidas = await prompts({
        type: 'multiselect',
        name: 'ids',
        message: `Selecciona etiquetas de ${DIMENSION_LABELS[dim]} (mínimo 1, ESPACIO para marcar, ENTER para confirmar):`,
        choices: disponibles.map(t => ({ title: t.name, value: t.id })),
        min: 1,
        instructions: false,
      }, { onCancel: ON_CANCEL });
      if (!elegidas?.ids?.length) return;
      elegidas.ids.forEach((id: string) => seleccionTags.push({ id, dimension: dim as TagDimension }));
    }

    const id = container.createRecipe.execute(
      userId, datos.name, datos.baseServings, datos.prepTime, datos.preparation || null, [], seleccionTags,
    );
    console.log(`Receta creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}

async function eliminarReceta(container: IContainer, userId: string) {
  try {
    const recipes = container.listRecipes.execute(userId);
    if (recipes.length === 0) {
      console.log('No hay recetas para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la receta a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...recipes.map(r => ({ title: r.name, value: r.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;

    container.deleteRecipe.execute(seleccion.id);
    console.log('Receta eliminada correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
