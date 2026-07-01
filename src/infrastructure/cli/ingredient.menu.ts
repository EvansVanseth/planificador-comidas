import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function menuIngredientes(container: IContainer) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Ingredientes — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar ingredientes', value: 'list' },
        { title: 'Crear ingrediente',   value: 'create' },
        { title: 'Editar ingrediente',  value: 'edit' },
        { title: 'Eliminar ingrediente', value: 'delete' },
        { title: 'Volver',              value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarIngredientes(container);
        break;
      case 'create':
        await crearIngrediente(container);
        break;
      case 'edit':
        await editarIngrediente(container);
        break;
      case 'delete':
        await eliminarIngrediente(container);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

function listarIngredientes(container: IContainer) {
  const ingredients = container.listIngredients.execute();
  if (ingredients.length === 0) {
    console.log('No hay ingredientes');
    return;
  }
  console.log('--- Ingredientes ---');
  ingredients.forEach(i => console.log(`(id: ${i.id}) ${i.name}`));
}

async function crearIngrediente(container: IContainer) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre del ingrediente:' },
    ], { onCancel: ON_CANCEL });

    if (!answers) return;

    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const id = container.createIngredient.execute(userId, answers.name);
    console.log(`Ingrediente creado: ${id}`);

  } catch (error) {
    if (error instanceof DomainError) console.log(error.message);
    console.log('\n--- Creacion cancelada ---');
  }
}

async function editarIngrediente(container: IContainer) {
  try {
    const ingredients = container.listIngredients.execute();
    if (ingredients.length === 0) {
      console.log('No hay ingredientes para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el ingrediente a editar:',
      choices: ingredients.map(i => ({ title: i.name, value: i.id })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    const cambios = await prompts({
      type: 'text',
      name: 'name',
      message: 'Nuevo nombre (dejar vacio para mantener):',
    }, { onCancel: ON_CANCEL });

    if (!cambios) return;
    if (!cambios.name.trim()) return;
    container.updateIngredient.execute({ id: seleccion.id, name: cambios.name.trim() });
    console.log('Ingrediente actualizado correctamente');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}

async function eliminarIngrediente(container: IContainer) {
  try {
    const ingredients = container.listIngredients.execute();
    if (ingredients.length === 0) {
      console.log('No hay ingredientes para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el ingrediente a eliminar:',
      choices: ingredients.map(i => ({ title: i.name, value: i.id })),
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id) return;

    container.deleteIngredient.execute(seleccion.id);
    console.log('Ingrediente eliminado correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log(error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
