import prompts from 'prompts';
import { IContainer } from '../../container';
import { TagDimension } from '../../../domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function agregarServicioEnLote(container: IContainer, userId: string, planningId: string, days: any[]) {
  try {
    if (days.length === 0) {
      console.log('No hay dias');
      return;
    }

    const seleccionDias = await prompts({
      type: 'multiselect',
      name: 'orders',
      message: 'Selecciona los dias (ESPACIO para marcar, ENTER para confirmar):',
      choices: days.map(d => ({
        title: `Dia ${d.getOrdenDia()}`,
        value: d.getOrdenDia(),
      })),
      instructions: false,
    }, { onCancel: ON_CANCEL });

    if (!seleccionDias?.orders || seleccionDias.orders.length === 0) return;

    const allTags = (await container.listTags.execute(userId)).filter(
      t => t.dimension === TagDimension.MOMENTO_DIA
    );

    const momentResp = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el momento del dia:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...allTags.map(t => ({ title: t.name, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!momentResp?.id || momentResp.id === '__cancel__') return;

    const coversResp = await prompts({
      type: 'number',
      name: 'value',
      message: 'Numero de comensales:',
      validate: (v: number) => v >= 1 ? true : 'Debe ser al menos 1',
    }, { onCancel: ON_CANCEL });

    if (!coversResp) return;

    const allRecipes = await container.listRecipes.execute(userId);
    let recipeId: string | undefined;

    if (coversResp.value > 0 && allRecipes.length > 0) {
      const recipeResp = await prompts({
        type: 'select',
        name: 'id',
        message: 'Selecciona receta (opcional):',
        choices: [
          { title: '(ninguna)', value: '' },
          ...allRecipes.map(r => ({ title: r.name, value: r.id })),
        ],
      }, { onCancel: ON_CANCEL });
      if (recipeResp?.id) recipeId = recipeResp.id;
    }

    const confirmar = await prompts({
      type: 'confirm',
      name: 'value',
      message: `¿Asignar servicio a ${seleccionDias.orders.length} dia(s)?`,
      initial: true,
    }, { onCancel: ON_CANCEL });

    if (!confirmar?.value) return;

    await container.bulkAssignMeal.execute({
      planningId,
      days: seleccionDias.orders,
      momentTagId: momentResp.id,
      covers: coversResp.value,
      recipeId,
    });
    console.log('✓ ' + `Servicio agregado a ${seleccionDias.orders.length} dia(s)`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
