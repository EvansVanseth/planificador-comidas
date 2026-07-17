import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function editarIngrediente(container: IContainer, userId: string) {
  try {
    const ingredients = await container.listIngredients.execute(userId);
    if (ingredients.length === 0) {
      console.log('No hay ingredientes para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el ingrediente a editar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...ingredients.map(i => ({ title: i.name, value: i.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;

    const cambios = await prompts({
      type: 'text',
      name: 'name',
      message: 'Nuevo nombre (dejar vacio para mantener):',
    }, { onCancel: ON_CANCEL });

    if (!cambios) return;
    if (!cambios.name.trim()) return;
    await container.updateIngredient.execute({ id: seleccion.id, name: cambios.name.trim() });
    console.log('✓ Ingrediente actualizado correctamente');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}
