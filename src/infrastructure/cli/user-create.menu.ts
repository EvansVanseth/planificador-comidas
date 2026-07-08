import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function crearUsuario(container: IContainer) {
  try {
    const answers = await prompts({
      type: 'text',
      name: 'name',
      message: 'Nombre del usuario:',
    }, { onCancel: ON_CANCEL });

    if (!answers?.name?.trim()) return;

    const id = container.createUser.execute(answers.name.trim());
    console.log(theme.success(`Usuario creado: ${id}`));

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(theme.error(error.message));
    }
    console.log(theme.header('\n--- Creacion cancelada ---'));
  }
}
