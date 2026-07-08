import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function eliminarDiasEnLote(container: IContainer, planningId: string, days: any[]) {
  try {
    if (days.length === 0) {
      console.log('No hay dias para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'multiselect',
      name: 'orders',
      message: 'Selecciona los dias a eliminar (ESPACIO para marcar, ENTER para confirmar):',
      choices: days.map(d => ({
        title: `Dia ${d.getOrdenDia()}`,
        value: d.getOrdenDia(),
      })),
      instructions: false,
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.orders || seleccion.orders.length === 0) return;

    const confirmar = await prompts({
      type: 'confirm',
      name: 'value',
      message: `¿Eliminar ${seleccion.orders.length} dia(s)?`,
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (!confirmar?.value) return;

    container.bulkRemoveDays.execute({ planningId, orders: seleccion.orders });
    console.log(theme.success(`Dia(s) eliminado(s): ${seleccion.orders.join(', ')}`));
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(theme.error(error.message));
    }
  }
}
