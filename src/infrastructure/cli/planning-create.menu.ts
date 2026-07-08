import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function crearPlanificacion(container: IContainer, userId: string) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre:' },
      { type: 'number', name: 'weeks', message: 'Semanas:' }
    ], { onCancel: ON_CANCEL });

    if (!answers) return;

    const id = container.createPlanning.execute(userId, answers.name, null, answers.weeks);
    console.log('✓ ' + `Planificacion creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}
