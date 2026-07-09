import prompts from 'prompts';
import { IContainer } from '../../container';

const ON_CANCEL = () => {};

export async function gestionarListaCompraUnificada(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) return;
    const pantry = planning.getPantryItems();
    const shopping = planning.getShoppingItems();

    const needed: { ingredientId: string; ingredientName: string; totalCovers: number; recipeNames: string[] }[]
      = container.getNeededIngredients.execute(planningId);

    const aComprar = needed.filter(n => {
      const pantryItem = pantry.find(p => p.getIngredientId() === n.ingredientId);
      if (!pantryItem) return true;
      if (pantryItem.isAvailable()) return false;
      return pantryItem.getCovers() < n.totalCovers;
    }).map(n => {
      const shoppingItem = shopping.find(s => s.getIngredientId() === n.ingredientId);
      const pantryItem = pantry.find(p => p.getIngredientId() === n.ingredientId);
      const cubierto = pantryItem ? pantryItem.getCovers() : 0;
      const neededCovers = n.totalCovers - cubierto;
      return {
        ingredientId: n.ingredientId,
        ingredientName: n.ingredientName,
        totalCovers: n.totalCovers,
        recipeNames: n.recipeNames,
        neededCovers,
        inShoppingList: !!shoppingItem,
        completed: shoppingItem?.isCompleted() ?? false,
      };
    });

    console.log('\n--- Lista de la compra ---');
    if (aComprar.length === 0) {
      console.log('  (no hay ingredientes que comprar — todo cubierto)');
      const volver = await prompts({
        type: 'select', name: 'value', message: 'Accion:',
        choices: [{ title: 'Volver', value: 'back' }],
      }, { onCancel: ON_CANCEL });
      if (volver?.value === 'back') continuar = false;
      continue;
    }

    aComprar.forEach(a => {
      const estado = a.inShoppingList ? (a.completed ? '[COMPRADO]' : '[PENDIENTE]') : '[NO AGREGADO]';
      const recetas = a.recipeNames?.length ? ` (${a.recipeNames.join(', ')})` : '';
      console.log(`  ${a.ingredientName} — COMPRAR ${a.neededCovers} com.${recetas} ${estado}`);
    });

    const elegido = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona ingrediente para cambiar estado:',
      choices: [
        { title: '(Volver)', value: '__back__' },
        ...aComprar.map(a => {
          const estado = a.inShoppingList ? (a.completed ? '[COMPRADO]' : '[PENDIENTE]') : '[NO AGREGADO]';
          const recetas = a.recipeNames?.length ? ` (${a.recipeNames.join(', ')})` : '';
          return { title: `${a.ingredientName} — COMPRAR ${a.neededCovers} com.${recetas} ${estado}`, value: a.ingredientId };
        }),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido?.id || elegido.id === '__back__') {
      continuar = false;
      continue;
    }

    const item = aComprar.find(a => a.ingredientId === elegido.id);
    if (!item) continue;

    if (!item.inShoppingList) {
      container.addShoppingItem.execute(planningId, item.ingredientId);
      console.log('✓ ' + `${item.ingredientName} agregado a la lista como pendiente`);
    } else {
      container.toggleShoppingItem.execute(planningId, item.ingredientId, !item.completed);
      console.log('✓ ' + `${item.ingredientName} marcado como ${item.completed ? 'pendiente' : 'comprado'}`);
    }
  }
}
