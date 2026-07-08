import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function agregarDia(container: IContainer, planningId: string, weeks: number) {
  try {
    const maxDay = weeks * 7;
    const respuesta = await prompts({
      type: 'number',
      name: 'orden',
      message: `Numero de dia (1-${maxDay}):`,
      validate: (v: number) => v >= 1 && v <= maxDay ? true : `Debe ser entre 1 y ${maxDay}`,
    }, { onCancel: ON_CANCEL });

    if (!respuesta) return;

    container.addDayToPlanning.execute(planningId, respuesta.orden);
    console.log('✓ ' + `Dia ${respuesta.orden} agregado`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
