import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';
import { TagDimension } from '../../../domain/recipes/value-objects/tag-dimension.enum';
import { DIMENSION_LABELS } from './recipe-display';

const ON_CANCEL = () => {};

export async function crearReceta(container: IContainer, userId: string) {
  try {
    const tagsDisponibles = await container.listTags.execute(userId);
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

    const id = await container.createRecipe.execute(
      userId, datos.name, datos.baseServings, datos.prepTime, datos.preparation || null, [], seleccionTags,
    );
    console.log('✓ ' + `Receta creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}
