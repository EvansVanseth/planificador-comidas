import prompts from 'prompts';
import { IContainer } from '../container';

const ON_CANCEL = () => {};

export async function gestionarDespensa(container: IContainer, userId: string, planningId: string) {
  const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
  if (!planning) return;

  let continuar = true;
  while (continuar) {
    const p = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!p) return;
    const pantry = p.getPantryItems();

    console.log(`\n--- Despensa (${pantry.length} items) ---`);
    pantry.forEach(item => {
      const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
      const name = ing?.name ?? item.getIngredientId();
      const status = item.isAvailable() ? '[TENGO DE TODO]' : `[cubre ${item.getCovers()} comensales]`;
      console.log(`  ${name} ${status}`);
    });

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar despensa:',
      choices: [
        { title: 'Agregar ingrediente a la despensa', value: 'add' },
        { title: 'Marcar como "tengo de todo"',       value: 'available' },
        { title: 'Actualizar comensales que cubre',   value: 'update-covers' },
        { title: 'Quitar de la despensa',             value: 'remove' },
        { title: 'Volver',                            value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add': {
        const needed = container.getNeededIngredients.execute(planningId);
        const choices = needed
          .filter(n => !pantry.some(pp => pp.getIngredientId() === n.ingredientId))
          .map(n => ({ title: n.ingredientName, value: n.ingredientId }));
        if (choices.length === 0) { console.log('Todos los ingredientes ya estan en la despensa'); break; }
        const resp = await prompts({ type: 'select', name: 'id', message: 'Ingrediente:', choices }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.addPantryItem.execute(planningId, resp.id);
          console.log('Agregado a la despensa');
        }
        break;
      }
      case 'available': {
        if (pantry.length === 0) { console.log('No hay items en la despensa'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Marcar como "tengo de todo":',
          choices: pantry.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.markPantryItemAvailable.execute(planningId, resp.id);
          console.log('Marcado como "tengo de todo"');
        }
        break;
      }
      case 'update-covers': {
        if (pantry.length === 0) { console.log('No hay items en la despensa'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Actualizar comensales que cubre:',
          choices: pantry.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (!resp?.id) break;
        const covers = await prompts({ type: 'number', name: 'value', message: 'Comensales que cubre en despensa:', validate: (v: number) => v >= 0 }, { onCancel: ON_CANCEL });
        if (covers !== undefined) {
          container.updatePantryItemCovers.execute(planningId, resp.id, covers.value);
          console.log('Cobertura actualizada');
        }
        break;
      }
      case 'remove': {
        if (pantry.length === 0) { console.log('No hay items en la despensa'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Quitar de la despensa:',
          choices: pantry.map(item => {
            const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
            return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
          }),
        }, { onCancel: ON_CANCEL });
        if (resp?.id) {
          container.removePantryItem.execute(planningId, resp.id);
          console.log('Quitado de la despensa');
        }
        break;
      }
      case 'back':
        continuar = false;
        break;
    }
  }
}
