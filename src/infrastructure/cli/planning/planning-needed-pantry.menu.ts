import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

type NeededItem = {
  ingredientId: string;
  ingredientName: string;
  totalCovers: number;
  quantityNote: string | null;
  recipeNames: string[];
};

export async function gestionarNeededYPantry(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) return;
    const pantry = planning.getPantryItems();

    const needed: NeededItem[] = container.getNeededIngredients.execute(planningId);

    console.log('\n--- Ingredientes necesarios y despensa ---');
    if (needed.length === 0) {
      console.log('  (sin recetas asignadas — no hay ingredientes necesarios)');
    } else {
      needed.forEach(n => {
        const pantryItem = pantry.find(p => p.getIngredientId() === n.ingredientId);
        let status: string;
        if (pantryItem) {
          if (pantryItem.isAvailable()) {
            status = '[TENGO DE TODO]';
          } else {
            const falta = n.totalCovers - pantryItem.getCovers();
            if (falta <= 0) {
              status = `[cubre ${pantryItem.getCovers()} — CUBIERTO]`;
            } else {
              status = `[cubre ${pantryItem.getCovers()} → COMPRAR ${falta}]`;
            }
          }
        } else {
          status = '[sin info en despensa]';
        }
        const recetas = n.recipeNames?.length ? ` (${n.recipeNames.join(', ')})` : '';
        console.log(`  ${n.ingredientName} — ${n.totalCovers} com.${recetas} ${status}`);
      });
    }

    if (needed.length === 0) {
      const volver = await prompts({
        type: 'select', name: 'value', message: 'Accion:',
        choices: [{ title: 'Volver', value: 'back' }],
      }, { onCancel: ON_CANCEL });
      if (volver?.value === 'back') continuar = false;
      continue;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona ingrediente:',
      choices: [
        { title: '(Volver)', value: '__back__' },
        ...needed.map(n => ({ title: n.ingredientName, value: n.ingredientId })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido?.id || elegido.id === '__back__') {
      continuar = false;
      continue;
    }

    const ingredientId = elegido.id;
    const pantryItem = pantry.find(p => p.getIngredientId() === ingredientId);

    const respTiene = await prompts({
      type: 'confirm',
      name: 'value',
      message: '¿Tienes de todo?',
      initial: pantryItem?.isAvailable() ?? false,
    }, { onCancel: ON_CANCEL });

    if (respTiene === undefined) continue;

    if (respTiene.value) {
      try {
        container.markPantryItemAvailable.execute(planningId, ingredientId);
        console.log('✓ Marcado como "tengo de todo"');
      } catch (error) {
        if (error instanceof AppError) console.log('✗ ' + error.message);
      }
    } else {
      const respCovers = await prompts({
        type: 'number',
        name: 'value',
        message: '¿Para cuantos comensales tienes?',
        initial: pantryItem ? pantryItem.getCovers() : 0,
        validate: (v: number) => v >= 0 ? true : 'Debe ser un numero positivo',
      }, { onCancel: ON_CANCEL });

      if (respCovers === undefined) continue;

      try {
        if (pantryItem) {
          container.updatePantryItemCovers.execute(planningId, ingredientId, respCovers.value);
          console.log('✓ ' + `Cobertura actualizada: ${respCovers.value} comensales`);
        } else {
          container.addPantryItem.execute(planningId, ingredientId);
          container.updatePantryItemCovers.execute(planningId, ingredientId, respCovers.value);
          console.log('✓ ' + `Agregado a despensa: ${respCovers.value} comensales`);
        }
      } catch (error) {
        if (error instanceof AppError) console.log('✗ ' + error.message);
      }
    }
  }
}
