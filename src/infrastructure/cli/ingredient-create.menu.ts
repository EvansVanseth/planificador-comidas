import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { findSimilarIngredients } from './shared/ingredient-utils';

const ON_CANCEL = () => {};

export async function crearIngrediente(container: IContainer, userId: string) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre del ingrediente:' },
    ], { onCancel: ON_CANCEL });

    if (!answers) return;

    const similares = findSimilarIngredients(container.listIngredients.execute(userId), answers.name);
    if (similares.length > 0) {
      console.log('⚠ Ingredientes similares existentes:');
      similares.forEach(i => console.log(`  - ${i.name}`));
      const confirmar = await prompts({
        type: 'confirm',
        name: 'value',
        message: '¿Crear de todas formas?',
        initial: false,
      }, { onCancel: ON_CANCEL });
      if (!confirmar?.value) {
        console.log('Creacion cancelada');
        return;
      }
    }

    const id = container.createIngredient.execute(userId, answers.name);
    console.log('✓ ' + `Ingrediente creado: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Creacion cancelada ---');
  }
}
