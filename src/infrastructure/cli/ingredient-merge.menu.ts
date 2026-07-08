import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function fusionarIngredientes(container: IContainer, userId: string) {
  try {
    const ingredients = container.listIngredients.execute(userId);
    if (ingredients.length < 2) {
      console.log('Se necesitan al menos 2 ingredientes para fusionar');
      return;
    }

    const choices = ingredients.map(i => ({ title: i.name, value: i.id }));

    const sourceResp = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el ingrediente a fusionar (origen):',
      choices: [{ title: '(Cancelar)', value: '__cancel__' }, ...choices],
    }, { onCancel: ON_CANCEL });

    if (!sourceResp?.id || sourceResp.id === '__cancel__') return;

    const remaining = ingredients.filter(i => i.id !== sourceResp.id);
    const targetResp = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el ingrediente destino (se conserva):',
      choices: [{ title: '(Cancelar)', value: '__cancel__' }, ...remaining.map(i => ({ title: i.name, value: i.id }))],
    }, { onCancel: ON_CANCEL });

    if (!targetResp?.id || targetResp.id === '__cancel__') return;

    const sourceName = ingredients.find(i => i.id === sourceResp.id)!.name;
    const targetName = ingredients.find(i => i.id === targetResp.id)!.name;

    const allRecipes = container.listRecipes.execute(userId);
    const affectedRecipes = allRecipes.filter(r =>
      r.ingredients.some(ing => ing.ingredientId === sourceResp.id)
    );

    console.log(`\n--- Fusionar "${sourceName}" → "${targetName}" ---`);
    if (affectedRecipes.length === 0) {
      console.log('Ninguna receta usa este ingrediente. Solo se eliminara el ingrediente origen.');
    } else {
      console.log(`Recetas afectadas (${affectedRecipes.length}):`);
      for (const r of affectedRecipes) {
        console.log(`  - ${r.name}`);
      }
    }

    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: '¿Confirmar fusion?',
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (!confirm?.value) {
      console.log('Fusion cancelada');
      return;
    }

    container.mergeIngredients.execute(userId, sourceResp.id, targetResp.id);
    console.log(`✓ "${sourceName}" fusionado en "${targetName}"`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Fusion cancelada ---');
  }
}
