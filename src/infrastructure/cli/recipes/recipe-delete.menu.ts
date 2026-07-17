import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarReceta(container: IContainer, userId: string) {
  try {
    const recipes = await container.listRecipes.execute(userId);
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
    const recipeId = seleccion.id;
    const recipeName = recipes.find(r => r.id === recipeId)?.name ?? recipeId;

    const plannings = await container.listPlannings.execute(userId);
    let planningsWithRecipe = 0;
    for (const planning of plannings) {
      for (const day of planning.getDays()) {
        const dto = day.toDTO();
        for (const service of Object.values(dto.services)) {
          if (service?.getRecipeId() === recipeId) {
            planningsWithRecipe++;
            break;
          }
        }
        if (planningsWithRecipe > 0) break;
      }
    }

    if (planningsWithRecipe > 0) {
      console.log(`\nLa receta "${recipeName}" está asignada en ${planningsWithRecipe} planificación(es)`);

      const confirm = await prompts({
        type: 'confirm',
        name: 'value',
        message: '¿Desasignar la receta de los servicios y eliminarla?',
        initial: false,
      }, { onCancel: ON_CANCEL });

      if (!confirm?.value) {
        console.log('Operación cancelada');
        return;
      }
    }

    const result = await container.deleteRecipe.execute(recipeId);
    console.log('✓ Receta eliminada correctamente');
    if (result.planningsAffected > 0) {
      console.log(`  - Desasignada de ${result.planningsAffected} planificación(es)`);
    }

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
