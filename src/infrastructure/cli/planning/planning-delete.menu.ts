import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarPlanificacion(container: IContainer, userId: string) {
  try {
    const plannings = await container.listPlannings.execute(userId);
    if (plannings.length === 0) {
      console.log('No hay planificaciones para eliminar');
      return;
    }

    const response = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la planificacion a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas)`, value: p.getId() })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!response?.id || response.id === '__cancel__') return;

    await container.deletePlanning.execute(response.id);
    console.log('✓ Planificacion eliminada');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
