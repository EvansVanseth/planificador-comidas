import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';

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
    const ingredientId = seleccion.id;
    const ingredientName = ingredients.find(i => i.id === ingredientId)?.name ?? ingredientId;

    const recipes = container.listRecipes.execute(userId);
    const recipesWithIngredient = recipes.filter(r => r.ingredients.some(i => i.ingredientId === ingredientId));
    const plannings = container.listPlannings.execute(userId);
    let planningsWithIngredient = 0;
    for (const planning of plannings) {
      if (planning.getPantryItems().some(i => i.getIngredientId() === ingredientId) ||
          planning.getShoppingItems().some(i => i.getIngredientId() === ingredientId)) {
        planningsWithIngredient++;
      }
    }

    if (recipesWithIngredient.length > 0 || planningsWithIngredient > 0) {
      console.log(`\nEl ingrediente "${ingredientName}" está en uso:`);
      if (recipesWithIngredient.length > 0) {
        console.log(`  - ${recipesWithIngredient.length} receta(s) lo usan`);
        recipesWithIngredient.forEach(r => console.log(`    · ${r.name}`));
      }
      if (planningsWithIngredient > 0) {
        console.log(`  - ${planningsWithIngredient} planificación(es) lo tienen en despensa o lista de compra`);
      }

      const confirm = await prompts({
        type: 'confirm',
        name: 'value',
        message: '¿Eliminar el ingrediente de todas las referencias y borrarlo?',
        initial: false,
      }, { onCancel: ON_CANCEL });

      if (!confirm?.value) {
        console.log('Operación cancelada');
        return;
      }
    }

    const result = container.deleteIngredient.execute(ingredientId);
    console.log('✓ Ingrediente eliminado correctamente');
    if (result.recipesAffected > 0) {
      console.log(`  - Eliminado de ${result.recipesAffected} receta(s)`);
    }
    if (result.planningsAffected > 0) {
      console.log(`  - Eliminado de ${result.planningsAffected} planificación(es)`);
    }

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
