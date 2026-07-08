import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function eliminarDia(container: IContainer, planningId: string, days: any[]) {
  try {
    if (days.length === 0) {
      console.log('No hay dias para eliminar');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'orden',
      message: 'Selecciona dia a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...days.map(d => ({ title: `Dia ${d.getOrdenDia()}`, value: d.getOrdenDia() })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido || elegido.orden === '__cancel__') return;

    container.removeDayFromPlanning.execute(planningId, elegido.orden);
    console.log('✓ ' + `Dia ${elegido.orden} eliminado`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
