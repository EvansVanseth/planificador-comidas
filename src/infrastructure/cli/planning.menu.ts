import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { Planning } from '../../domain/planning/aggregates/planning.aggregate';

const ON_CANCEL = () => {};

export async function menuPlanificaciones(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Planificaciones — ¿Que quieres hacer?',
      choices: [
        { title: 'Ver planificaciones',    value: 'list' },
        { title: 'Crear planificacion',    value: 'create' },
        { title: 'Editar planificacion',   value: 'edit' },
        { title: 'Eliminar planificacion', value: 'delete' },
        { title: 'Volver',                 value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarPlanificaciones(container, userId);
        break;
      case 'create':
        await crearPlanificacion(container);
        break;
      case 'edit':
        await editarPlanificacion(container, userId);
        break;
      case 'delete':
        await eliminarPlanificacion(container, userId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

function listarPlanificaciones(container: IContainer, userId: string) {
  console.log('--- Listado de planificaciones ---');
  const plannings = container.listPlannings.execute(userId);
  if (plannings.length === 0) {
    console.log('No hay planificaciones creadas');
  } else {
    plannings.forEach((planning: Planning) => {
      console.log(`(id: ${planning.getId()}) ${planning.getName()}: ${planning.getWeeks()} semanas`);
    });
  }
  console.log('----------------------------------');
}

async function crearPlanificacion(container: IContainer) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'userId', message: 'ID de usuario (UUID):', initial: '550e8400-e29b-41d4-a716-446655440000' },
      { type: 'text', name: 'name', message: 'Nombre:' },
      { type: 'number', name: 'weeks', message: 'Semanas:' }
    ], { onCancel: ON_CANCEL });

    if (!answers) return;

    const id = container.createPlanning.execute(answers.userId, answers.name, null, answers.weeks);
    console.log(`Planificacion creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}

async function editarPlanificacion(container: IContainer, userId: string) {
  try {
    const plannings = container.listPlannings.execute(userId);
    if (plannings.length === 0) {
      console.log('No hay planificaciones para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la planificacion a editar:',
      choices: plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas)`, value: p.getId() })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    const cambios = await prompts([
      { type: 'text', name: 'name', message: 'Nuevo nombre (dejar vacio para mantener):' },
      { type: 'number', name: 'weeks', message: 'Nuevas semanas (0 para mantener):', initial: 0 },
    ], { onCancel: ON_CANCEL });

    if (!cambios) return;

    const input: any = { id: seleccion.id };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    if (cambios.weeks > 0) input.weeks = cambios.weeks;
    container.updatePlanning.execute(input);
    console.log('Planificacion actualizada correctamente');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}

async function eliminarPlanificacion(container: IContainer, userId: string) {
  try {
    const plannings = container.listPlannings.execute(userId);
    if (plannings.length === 0) {
      console.log('No hay planificaciones para eliminar');
      return;
    }

    const response = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la planificacion a eliminar:',
      choices: plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas)`, value: p.getId() })),
    }, { onCancel: ON_CANCEL });

    if (!response?.id) return;

    container.deletePlanning.execute(response.id);
    console.log('Planificacion eliminada correctamente');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Operacion cancelada ---');
  }
}
