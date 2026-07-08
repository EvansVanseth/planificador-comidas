import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function crearPlanificacion(container: IContainer, userId: string) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre:' },
      { type: 'number', name: 'weeks', message: 'Semanas:' },
      {
        type: 'confirm',
        name: 'hasStartDate',
        message: '¿Asignar fecha de inicio?',
        initial: false,
      },
    ], { onCancel: ON_CANCEL });

    if (!answers) return;

    let startDate: Date | null = null;
    if (answers.hasStartDate) {
      const dateResp = await prompts({
        type: 'date',
        name: 'value',
        message: 'Selecciona el lunes de inicio:',
        initial: new Date(),
        validate: (v: Date) => v.getDay() === 1 ? true : 'Debe ser lunes',
      }, { onCancel: ON_CANCEL });
      if (dateResp?.value) startDate = dateResp.value;
    }

    const id = container.createPlanning.execute(userId, answers.name, startDate, answers.weeks);
    console.log('✓ ' + `Planificacion creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}
