import prompts from 'prompts';
import { createContainer, IContainer } from '../container';
import { menuPlanificaciones } from './planning/planning.menu';
import { menuEtiquetas } from './tags/tag.menu';
import { menuIngredientes } from './ingredients/ingredient.menu';
import { menuRecetas } from './recipes/recipe.menu';
import { menuUsuarios } from './users/user.menu';
import { resolveSystemTagsMenu } from './tags/resolve-system-tags.menu';

const ON_CANCEL = () => {};

async function run() {
  const welcomeMessage = '-----------------------------------------------\r\n' +
                         '| Bienvenido al << Planificador de comidas >> |\r\n' +
                         '-----------------------------------------------\r\n' +
                         ' \r\n' +
                         '¿Que tipo de persistencia quieres usar?\r\n' +
                         ' \r\n';
  const response = await prompts({
    type: 'select',
    name: 'opcion',
    message: welcomeMessage,
    choices: [
      { title: 'En memoria (Volatil)'  , value: 'memory' },
      { title: 'Archivo (Persistentes)', value: 'file' },
      { title: 'Salir', value: 'exit' }
    ]
  }, { onCancel: ON_CANCEL });

  if (!response?.opcion || response.opcion === 'exit') {
    mostrarDespedida();
    return;
  }

  const container = createContainer(response.opcion);

  const userId = await seleccionarUsuario(container);
  if (!userId) {
    mostrarDespedida();
    return;
  }

  await menuPrincipal(container, userId);
}

async function seleccionarUsuario(container: IContainer): Promise<string | null> {
  const usuarios = container.listUsers.execute();

  const choices = usuarios.map(u => ({ title: u.name, value: u.id }));
  choices.push({ title: '(Crear nuevo usuario)', value: '__create__' });
  choices.push({ title: 'Salir', value: '__exit__' });

  const seleccion = await prompts({
    type: 'select',
    name: 'userId',
    message: 'Selecciona un usuario:',
    choices,
  }, { onCancel: ON_CANCEL });

  if (!seleccion?.userId || seleccion.userId === '__exit__') return null;

  if (seleccion.userId === '__create__') {
    const nuevo = await prompts({
      type: 'text',
      name: 'name',
      message: 'Nombre del nuevo usuario:',
    }, { onCancel: ON_CANCEL });

    if (!nuevo?.name?.trim()) return null;

    const newId = container.createUser.execute(nuevo.name.trim());
    container.seedTagsForUser(newId);
    await resolveSystemTagsMenu(container, newId);
    console.log(`Bienvenido, ${nuevo.name.trim()}!`);
    return newId;
  }

  const userName = usuarios.find(u => u.id === seleccion.userId)?.name ?? '';
  container.seedTagsForUser(seleccion.userId);
  await resolveSystemTagsMenu(container, seleccion.userId);
  console.log(`Bienvenido de nuevo, ${userName}!`);
  return seleccion.userId;
}

function mostrarDespedida() {
  console.log('¡ Gracias por usar el Planificdor de comidas !');
}

async function menuPrincipal(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: '¿Que modulo quieres gestionar?',
      choices: [
        { title: 'Etiquetas',        value: 'tags' },
        { title: 'Ingredientes',     value: 'ingredients' },
        { title: 'Recetas',          value: 'recipes' },
        { title: 'Planificaciones',  value: 'plannings' },
        { title: 'Usuarios',         value: 'users' },
        { title: 'Salir',            value: 'exit' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'tags':
        await menuEtiquetas(container, userId);
        break;
      case 'ingredients':
        await menuIngredientes(container, userId);
        break;
      case 'recipes':
        await menuRecetas(container, userId);
        break;
      case 'plannings':
        await menuPlanificaciones(container, userId);
        break;
      case 'users':
        await menuUsuarios(container);
        break;
      case 'exit':
        continuar = false;
        mostrarDespedida();
        break;
    }
  }
}

run();
