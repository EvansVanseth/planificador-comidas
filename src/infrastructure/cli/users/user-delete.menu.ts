import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarUsuario(container: IContainer) {
  try {
    const users = container.listUsers.execute();
    if (users.length === 0) {
      console.log('No hay usuarios para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el usuario a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...users.map(u => ({ title: u.name, value: u.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;
    const userId = seleccion.id;
    const userName = users.find(u => u.id === userId)?.name ?? userId;

    const tags = container.listTags.execute(userId);
    const ingredients = container.listIngredients.execute(userId);
    const recipes = container.listRecipes.execute(userId);
    const plannings = container.listPlannings.execute(userId);

    console.log(`\n⚠️  Se eliminará el usuario "${userName}" y TODOS sus datos:`);
    console.log(`  - ${tags.length} etiqueta(s)`);
    console.log(`  - ${ingredients.length} ingrediente(s)`);
    console.log(`  - ${recipes.length} receta(s)`);
    console.log(`  - ${plannings.length} planificación(es)`);
    console.log('');

    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: '¿Estás seguro? Esta operación no se puede deshacer.',
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (!confirm?.value) {
      console.log('Operación cancelada');
      return;
    }

    const result = container.deleteUser.execute(userId);
    console.log('✓ Usuario eliminado correctamente');
    if (result.tagsDeleted > 0) console.log(`  - ${result.tagsDeleted} etiqueta(s) eliminada(s)`);
    if (result.ingredientsDeleted > 0) console.log(`  - ${result.ingredientsDeleted} ingrediente(s) eliminado(s)`);
    if (result.recipesDeleted > 0) console.log(`  - ${result.recipesDeleted} receta(s) eliminada(s)`);
    if (result.planningsDeleted > 0) console.log(`  - ${result.planningsDeleted} planificación(es) eliminada(s)`);

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
