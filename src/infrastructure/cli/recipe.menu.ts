import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';

const ON_CANCEL = () => {};

const DIMENSION_LABELS: Record<string, string> = {
  MOMENTO_DIA: 'Momento del dia',
  FORMATO: 'Formato',
  TIPO_PLATO: 'Tipo de plato',
  ESTILOS_VIDA: 'Estilo de vida',
};

export async function menuRecetas(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Recetas — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar recetas',  value: 'list' },
        { title: 'Crear receta',    value: 'create' },
        { title: 'Editar receta',   value: 'edit' },
        { title: 'Eliminar receta', value: 'delete' },
        { title: 'Volver',          value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarRecetas(container);
        break;
      case 'create':
        await crearReceta(container, userId);
        break;
      case 'edit':
        await editarReceta(container);
        break;
      case 'delete':
        await eliminarReceta(container);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

function listarRecetas(container: IContainer) {
  const recipes = container.listRecipes.execute();
  if (recipes.length === 0) {
    console.log('No hay recetas');
    return;
  }
  console.log('--- Recetas ---');
  recipes.forEach(r => {
    console.log(`(id: ${r.id}) ${r.name} — ${r.baseServings} comensales, ${r.prepTime} min`);
    if (r.tags.length) console.log(`  Tags: ${r.tags.length}`);
    if (r.ingredients.length) console.log(`  Ingredientes: ${r.ingredients.length}`);
  });
}

async function crearReceta(container: IContainer, userId: string) {
  try {
    const tagsDisponibles = container.listTags.execute();
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
      const elegida = await prompts({
        type: 'select',
        name: 'id',
        message: `Selecciona etiqueta de ${DIMENSION_LABELS[dim]}:`,
        choices: disponibles.map(t => ({ title: t.name, value: t.id })),
      }, { onCancel: ON_CANCEL });
      if (!elegida?.id) return;
      seleccionTags.push({ id: elegida.id, dimension: dim as TagDimension });
    }

    const id = container.createRecipe.execute(
      userId, datos.name, datos.baseServings, datos.prepTime, datos.preparation || null, [], seleccionTags,
    );
    console.log(`Receta creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}

async function editarReceta(container: IContainer) {
  try {
    const recipes = container.listRecipes.execute();
    if (recipes.length === 0) {
      console.log('No hay recetas para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la receta a editar:',
      choices: recipes.map(r => ({ title: r.name, value: r.id })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    const cambios = await prompts([
      { type: 'text', name: 'name', message: 'Nuevo nombre (dejar vacio para mantener):' },
      { type: 'number', name: 'baseServings', message: 'Nuevos comensales base (0 para mantener):', initial: 0 },
      { type: 'number', name: 'prepTime', message: 'Nuevo tiempo (min, 0 para mantener):', initial: 0 },
    ], { onCancel: ON_CANCEL });

    if (!cambios) return;

    const input: any = { id: seleccion.id };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    if (cambios.baseServings > 0) input.baseServings = cambios.baseServings;
    if (cambios.prepTime > 0) input.prepTime = cambios.prepTime;
    container.updateRecipe.execute(input);
    console.log('Receta actualizada correctamente');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}

async function eliminarReceta(container: IContainer) {
  try {
    const recipes = container.listRecipes.execute();
    if (recipes.length === 0) {
      console.log('No hay recetas para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la receta a eliminar:',
      choices: recipes.map(r => ({ title: r.name, value: r.id })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    container.deleteRecipe.execute(seleccion.id);
    console.log('Receta eliminada correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log(error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
