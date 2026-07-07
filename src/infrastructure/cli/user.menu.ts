import prompts from 'prompts';
import { IContainer } from '../container';
import { listarUsuarios } from './user-display';
import { crearUsuario } from './user-create.menu';
import { editarUsuario } from './user-edit.menu';
import { eliminarUsuario } from './user-delete.menu';

const ON_CANCEL = () => {};

export async function menuUsuarios(container: IContainer) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Usuarios — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar usuarios',  value: 'list' },
        { title: 'Crear usuario',    value: 'create' },
        { title: 'Editar usuario',   value: 'edit' },
        { title: 'Eliminar usuario', value: 'delete' },
        { title: 'Volver',           value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarUsuarios(container);
        break;
      case 'create':
        await crearUsuario(container);
        break;
      case 'edit':
        await editarUsuario(container);
        break;
      case 'delete':
        await eliminarUsuario(container);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
