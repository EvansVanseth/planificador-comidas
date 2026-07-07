import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function editarUsuario(container: IContainer) {
  try {
    const users = container.listUsers.execute();
    if (users.length === 0) {
      console.log('No hay usuarios para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el usuario a editar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...users.map(u => ({ title: u.name, value: u.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;

    const cambios = await prompts({
      type: 'text',
      name: 'name',
      message: 'Nuevo nombre (dejar vacio para mantener):',
    }, { onCancel: ON_CANCEL });

    if (!cambios) return;

    const input: any = { id: seleccion.id };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    container.updateUser.execute(input);
    console.log('Usuario actualizado correctamente');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}
