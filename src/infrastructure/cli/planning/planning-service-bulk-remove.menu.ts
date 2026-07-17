import prompts from 'prompts';
import { IContainer } from '../../container';
import { TagDimension } from '../../../domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function eliminarServicioEnLote(container: IContainer, userId: string, planningId: string, days: any[]) {
  try {
    if (days.length === 0) {
      console.log('No hay dias');
      return;
    }

    const allTags = (await container.listTags.execute(userId)).filter(
      t => t.dimension === TagDimension.MOMENTO_DIA
    );

    const momentResp = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el momento del dia a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...allTags.map(t => ({ title: t.name, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!momentResp?.id || momentResp.id === '__cancel__') return;

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

    const confirmar = await prompts({
      type: 'confirm',
      name: 'value',
      message: `¿Eliminar servicio de ${seleccionDias.orders.length} dia(s)?`,
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (!confirmar?.value) return;

    await container.bulkRemoveMeal.execute({
      planningId,
      days: seleccionDias.orders,
      momentTagId: momentResp.id,
    });
    console.log('✓ ' + `Servicio eliminado de ${seleccionDias.orders.length} dia(s)`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
