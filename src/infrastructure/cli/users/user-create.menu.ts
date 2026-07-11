import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function crearUsuario(container: IContainer) {
  try {
    const answers = await prompts([
      {
        type: 'text',
        name: 'name',
        message: 'Nombre del usuario:',
      },
      {
        type: 'text',
        name: 'email',
        message: 'Email:',
        initial: (prev: string) =>
          `${prev.toLowerCase().replace(/\s+/g, '.')}@plancomidas.com`,
      },
    ], { onCancel: ON_CANCEL });

    if (!answers?.name?.trim()) return;

    const id = container.createUser.execute(answers.name.trim(), answers.email.trim());
    console.log('✓ ' + `Usuario creado: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}
