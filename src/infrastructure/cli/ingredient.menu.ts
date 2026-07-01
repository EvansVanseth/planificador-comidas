import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

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
        { title: 'Volver',              value: 'back' }
      ]
    });

    switch (response.opcion) {
      case 'list':
        listarIngredientes(container);
        break;
      case 'create':
        await crearIngrediente(container);
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
    ], {
      onCancel: () => { throw new AppError('Operacion cancelada por el usuario'); }
    });

    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const id = container.createIngredient.execute(userId, answers.name);
    console.log(`Ingrediente creado: ${id}`);

  } catch (error) {
    if (error instanceof DomainError) {
      console.log(error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}
