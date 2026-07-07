import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { mostrarPlanificacion } from './planning-display';
import { editarPlanificacion } from './planning-edit.menu';


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
        await crearPlanificacion(container, userId);
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
  const plannings = container.listPlannings.execute(userId);
  if (plannings.length === 0) {
    console.log('No hay planificaciones');
    return;
  }
  const allRecipes = container.listRecipes.execute(userId);
  const allTags = container.listTags.execute(userId);

  console.log('--- Planificaciones ---');
  plannings.forEach(p => mostrarPlanificacion(p, allRecipes, allTags));
}

async function crearPlanificacion(container: IContainer, userId: string) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre:' },
      { type: 'number', name: 'weeks', message: 'Semanas:' }
    ], { onCancel: ON_CANCEL });

    if (!answers) return;

    const id = container.createPlanning.execute(userId, answers.name, null, answers.weeks);
    console.log(`Planificacion creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
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
    console.log('Planificacion eliminada');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
