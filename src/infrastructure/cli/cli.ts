import prompts from 'prompts';
import { createContainer, IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { Planning } from '../../domain/planning/aggregates/planning.aggregate';

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
  });

  if (response.opcion === 'exit') {
    mostrarDespedida();
    return;
  }

  const container = createContainer(response.opcion); 
  
  menuPrincipal(container);

}

async function mostrarMenuPrincipal() {
  const response = await prompts({
    type: 'select',
    name: 'opcion',
    message: '¿Que quieres hacer?',
    choices: [
      { title: 'Ver planificaciones', value: 'list' },
      { title: 'Crear planificación', value: 'create' },
      { title: 'Editar planificacion', value: 'edit' },
      { title: 'Salir', value: 'exit' }
    ]
  });

  return response.opcion;
}

function mostrarDespedida() {
  console.log ('¡ Gracias por usar el Planificdor de comidas !');
}

async function menuPrincipal(container: IContainer) {
  let continuar = true;
  while (continuar) {
    const opcion = await mostrarMenuPrincipal();

    switch (opcion) {
      case 'list':
        // Aqui listariamos las planificaciones existentes
        console.log('--- Listado de planificaciones ---');
        const plannings = container.listPlannings.execute();
        console.log('----------------------------------');
        if (plannings.length === 0) {
          console.log ('No hay planificaciones creadas');
        } else {
          plannings.forEach((planning: Planning) => {
            console.log (`(id: ${planning.getId()}) ${planning.getName()}: ${planning.getWeeks()} semanas`)
          });
        }
        console.log('----------------------------------');
        break;
      case 'create':
        await manejarCreacion(container);
        break;
      case 'edit':
        // Aqui llamaríamos a AssignMealUseCase
        console.log('Editanto el planning...');
        break;
      case 'exit':
        continuar = false;
        mostrarDespedida();
        break;
    }
  }
}

async function manejarCreacion(container: IContainer) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre:' },
      { type: 'number', name: 'weeks', message: 'Semanas:' }
    ], { 
      onCancel: () => { throw new AppError('Operación cancelada por el usuario'); }
    });

    const id = container.createPlanning.execute(answers.name, null, answers.weeks);
    console.log(`Planificación creada: ${id}`);
    
  } catch (error) {
    if (error instanceof DomainError) {
      console.log(error.message);
    } 
    console.log('\n--- Creación cancelada ---');
  }

}

run();