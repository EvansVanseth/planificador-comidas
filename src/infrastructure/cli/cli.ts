import prompts from 'prompts';
import { createContainer, IContainer } from '../container';
import { menuPlanificaciones } from './planning.menu';
import { menuEtiquetas } from './tag.menu';
import { menuIngredientes } from './ingredient.menu';
import { menuRecetas } from './recipe.menu';

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
  }, { onCancel: () => {} });

  if (!response?.opcion || response.opcion === 'exit') {
    mostrarDespedida();
    return;
  }

  const userIdPrompt = await prompts({
    type: 'text',
    name: 'userId',
    message: 'Tu ID de usuario (UUID):',
    initial: '550e8400-e29b-41d4-a716-446655440000',
  }, { onCancel: () => {} });

  if (!userIdPrompt?.userId) {
    mostrarDespedida();
    return;
  }

  const container = createContainer(response.opcion, userIdPrompt.userId);

  await menuPrincipal(container, userIdPrompt.userId);
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
        { title: 'Salir',            value: 'exit' }
      ]
    }, { onCancel: () => {} });

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
        await menuPlanificaciones(container);
        break;
      case 'exit':
        continuar = false;
        mostrarDespedida();
        break;
    }
  }
}

run();
