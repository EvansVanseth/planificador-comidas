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
        { title: 'Listar recetas',                 value: 'list' },
        { title: 'Crear receta',                   value: 'create' },
        { title: 'Editar receta',                  value: 'edit' },
        { title: 'Gestionar ingredientes',         value: 'ingredients' },
        { title: 'Gestionar etiquetas',            value: 'tags' },
        { title: 'Eliminar receta',                value: 'delete' },
        { title: 'Volver',                         value: 'back' }
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
      case 'ingredients':
        await gestionarIngredientes(container, userId);
        break;
      case 'tags':
        await gestionarEtiquetas(container, userId);
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
  const allIng = container.listIngredients.execute(userId);
  const allTags = container.listTags.execute(userId);

  console.log('--- Recetas ---');
  recipes.forEach(r => {
    console.log(`\n(id: ${r.id}) ${r.name} — ${r.baseServings} comensales, ${r.prepTime} min`);
    if (r.preparation) console.log(`  Preparación: ${r.preparation.slice(0, 80)}${r.preparation.length > 80 ? '…' : ''}`);

    if (r.tags.length) {
      const names = r.tags.map(t => {
        const tag = allTags.find(at => at.id === t.id);
        return tag ? tag.name : t.id;
      }).join(', ');
      console.log(`  Tags: ${names}`);
    }

    if (r.ingredients.length) {
      const names = r.ingredients.map(i => {
        const ing = allIng.find(ai => ai.id === i.ingredientId);
        const base = ing ? ing.name : i.ingredientId;
        return i.quantityNote ? `${base} (${i.quantityNote})` : base;
      }).join(', ');
      console.log(`  Ingredientes: ${names}`);
    }
  });
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
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}

async function editarReceta(container: IContainer, userId: string) {
  try {
    const recipes = container.listRecipes.execute(userId);
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
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}

async function gestionarIngredientes(container: IContainer, userId: string) {
  const recipes = container.listRecipes.execute(userId);
  if (recipes.length === 0) {
    console.log('No hay recetas');
    return;
  }

  const seleccion = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la receta:',
    choices: recipes.map(r => ({ title: r.name, value: r.id })),
  }, { onCancel: ON_CANCEL });

  if (!seleccion?.id) return;
  const recipeId = seleccion.id;

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
      choices: disponibles.map(i => ({ title: i.name, value: i.id })),
    }, { onCancel: ON_CANCEL });

    if (!elegido?.id) return;

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
      choices: currentIngredients.map(i => ({ title: i.display, value: i.id })),
    }, { onCancel: ON_CANCEL });

    if (!elegido?.id) return;

    container.updateRecipe.execute({ id: recipeId, removeIngredients: [elegido.id] });
    console.log('Ingrediente quitado de la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function gestionarEtiquetas(container: IContainer, userId: string) {
  const recipes = container.listRecipes.execute(userId);
  if (recipes.length === 0) {
    console.log('No hay recetas');
    return;
  }

  const seleccion = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la receta:',
    choices: recipes.map(r => ({ title: r.name, value: r.id })),
  }, { onCancel: ON_CANCEL });

  if (!seleccion?.id) return;
  const recipeId = seleccion.id;

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
  }
}

async function agregarEtiquetaExistente(container: IContainer, userId: string, recipeId: string) {
  try {
    const disponibles = container.listTags.execute(userId);
    if (disponibles.length === 0) {
      console.log('No hay etiquetas disponibles. Crea una primero.');
      return;
    }

    const elegida = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona etiqueta:',
      choices: disponibles.map(t => ({ title: `${t.name} (${DIMENSION_LABELS[t.dimension] || t.dimension})`, value: t.id })),
    }, { onCancel: ON_CANCEL });

    if (!elegida?.id) return;

    const tag = disponibles.find(t => t.id === elegida.id)!;
    container.updateRecipe.execute({
      id: recipeId,
      addTags: [{ id: elegida.id, dimension: tag.dimension as TagDimension }],
    });
    console.log('Etiqueta agregada a la receta');
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
        choices: Object.entries(DIMENSION_LABELS).map(([value, title]) => ({ title, value })),
      },
    ], { onCancel: ON_CANCEL });

    if (!datos?.name?.trim()) return;

    container.addNewTagToRecipe.execute(
      userId,
      recipeId,
      datos.name.trim(),
      datos.dimension as TagDimension,
    );
    console.log('Etiqueta creada y agregada a la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}

async function quitarEtiqueta(container: IContainer, userId: string, recipeId: string) {
  try {
    const receta = container.listRecipes.execute(userId).find(r => r.id === recipeId);
    if (!receta) return;

    const allTags = container.listTags.execute(userId);
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
      choices: currentTags.map(t => ({ title: t.display, value: t.id })),
    }, { onCancel: ON_CANCEL });

    if (!elegida?.id) return;

    container.updateRecipe.execute({ id: recipeId, removeTags: [elegida.id] });
    console.log('Etiqueta quitada de la receta');
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
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
      choices: recipes.map(r => ({ title: r.name, value: r.id })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    container.deleteRecipe.execute(seleccion.id);
    console.log('Receta eliminada correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
