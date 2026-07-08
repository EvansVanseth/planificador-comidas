import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

function findSimilarIngredients(
  ingredients: { name: string }[],
  name: string,
): { name: string }[] {
  const normalized = name.toLowerCase().trim();
  return ingredients.filter(i => {
    const normalizedName = i.name.toLowerCase().trim();
    return normalizedName !== normalized && (
      normalizedName.includes(normalized) ||
      normalized.includes(normalizedName)
    );
  });
}

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
    console.log(theme.success(`Ingrediente creado: ${id}`));

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) console.log(theme.error(error.message));
    console.log(theme.header('\n--- Creacion cancelada ---'));
  }
}
