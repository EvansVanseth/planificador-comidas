import { IContainer } from '../../container';

export async function listarUsuarios(container: IContainer) {
  const users = await container.listUsers.execute();
  if (users.length === 0) {
    console.log('No hay usuarios');
    return;
  }
  console.log('--- Usuarios ---');
  users.forEach(u => console.log(`(id: ${u.id}) ${u.name}`));
}
