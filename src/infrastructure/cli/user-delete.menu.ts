import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarUsuario(container: IContainer) {
  try {
    const users = container.listUsers.execute();
    if (users.length === 0) {
      console.log('No hay usuarios para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el usuario a eliminar:',
      choices: users.map(u => ({ title: u.name, value: u.id })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    container.deleteUser.execute(seleccion.id);
    console.log('Usuario eliminado correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
