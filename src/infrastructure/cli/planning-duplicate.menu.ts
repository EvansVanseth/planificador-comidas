import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function duplicarPlanificacion(container: IContainer, userId: string) {
  try {
    const plannings = container.listPlannings.execute(userId);
    if (plannings.length === 0) {
      console.log('No hay planificaciones para duplicar');
      return;
    }

    const response = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la planificacion a duplicar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas)`, value: p.getId() })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!response?.id || response.id === '__cancel__') return;

    const newId = container.duplicatePlanning.execute(response.id, userId);
    const copy = container.listPlannings.execute(userId).find(p => p.getId() === newId);
    console.log(`✓ Planificacion duplicada como "${copy?.getName()}"`);

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
