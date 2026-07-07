import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarIngrediente(container: IContainer, userId: string) {
  try {
    const ingredients = container.listIngredients.execute(userId);
    if (ingredients.length === 0) {
      console.log('No hay ingredientes para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el ingrediente a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...ingredients.map(i => ({ title: i.name, value: i.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;

    container.deleteIngredient.execute(seleccion.id);
    console.log('Ingrediente eliminado correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
