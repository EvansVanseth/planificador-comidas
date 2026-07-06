import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

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

function listarUsuarios(container: IContainer) {
  const users = container.listUsers.execute();
  if (users.length === 0) {
    console.log('No hay usuarios');
    return;
  }
  console.log('--- Usuarios ---');
  users.forEach(u => console.log(`(id: ${u.id}) ${u.name}`));
}

async function crearUsuario(container: IContainer) {
  try {
    const answers = await prompts({
      type: 'text',
      name: 'name',
      message: 'Nombre del usuario:',
    }, { onCancel: ON_CANCEL });

    if (!answers?.name?.trim()) return;

    const id = container.createUser.execute(answers.name.trim());
    console.log(`Usuario creado: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}

async function editarUsuario(container: IContainer) {
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
      choices: users.map(u => ({ title: u.name, value: u.id })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

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

async function eliminarUsuario(container: IContainer) {
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
