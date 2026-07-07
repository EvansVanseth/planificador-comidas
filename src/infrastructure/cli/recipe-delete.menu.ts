import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarReceta(container: IContainer, userId: string) {
  try {
    const recipes = container.listRecipes.execute(userId);
    if (recipes.length === 0) {
      console.log('No hay recetas para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la receta a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...recipes.map(r => ({ title: r.name, value: r.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;

    container.deleteRecipe.execute(seleccion.id);
    console.log('Receta eliminada correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
