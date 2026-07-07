import prompts from 'prompts';
import { IContainer } from '../container';

const ON_CANCEL = () => {};

export async function gestionarListaCompra(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const p = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!p) return;
    const shopping = p.getShoppingItems();

    console.log(`\n--- Lista de compra (${shopping.length} items) ---`);
    shopping.forEach(item => {
      const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
      const name = ing?.name ?? item.getIngredientId();
      const status = item.isCompleted() ? '[COMPRADO]' : '[PENDIENTE]';
      console.log(`  ${name} ${status}`);
    });

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar lista de compra:',
      choices: [
        { title: 'Agregar ingrediente',        value: 'add' },
        { title: 'Marcar como comprado',       value: 'complete' },
        { title: 'Marcar como pendiente',      value: 'pending' },
        { title: 'Quitar de la lista',         value: 'remove' },
        { title: 'Volver',                     value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add': {
        const needed = container.getNeededIngredients.execute(planningId);
        const choices = needed
          .filter(n => !shopping.some(s => s.getIngredientId() === n.ingredientId))
          .map(n => ({ title: n.ingredientName, value: n.ingredientId }));
        if (choices.length === 0) { console.log('Todos los ingredientes ya estan en la lista'); break; }
        const resp = await prompts({ type: 'select', name: 'id', message: 'Ingrediente:', choices: [{ title: '(Cancelar)', value: '__cancel__' }, ...choices] }, { onCancel: ON_CANCEL });
        if (resp?.id && resp.id !== '__cancel__') {
          container.addShoppingItem.execute(planningId, resp.id);
          console.log('Agregado a la lista de compra');
        }
        break;
      }
      case 'complete': {
        const pendientes = shopping.filter(s => !s.isCompleted());
        if (pendientes.length === 0) { console.log('No hay items pendientes'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Marcar como comprado:',
          choices: [
            { title: '(Cancelar)', value: '__cancel__' },
            ...pendientes.map(item => {
              const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
              return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
            }),
          ],
        }, { onCancel: ON_CANCEL });
        if (resp?.id && resp.id !== '__cancel__') {
          container.toggleShoppingItem.execute(planningId, resp.id, true);
          console.log('Marcado como comprado');
        }
        break;
      }
      case 'pending': {
        const comprados = shopping.filter(s => s.isCompleted());
        if (comprados.length === 0) { console.log('No hay items comprados'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Marcar como pendiente:',
          choices: [
            { title: '(Cancelar)', value: '__cancel__' },
            ...comprados.map(item => {
              const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
              return { title: ing?.name ?? item.getIngredientId(), value: item.getIngredientId() };
            }),
          ],
        }, { onCancel: ON_CANCEL });
        if (resp?.id && resp.id !== '__cancel__') {
          container.toggleShoppingItem.execute(planningId, resp.id, false);
          console.log('Marcado como pendiente');
        }
        break;
      }
      case 'remove': {
        if (shopping.length === 0) { console.log('No hay items en la lista'); break; }
        const resp = await prompts({
          type: 'select', name: 'id', message: 'Quitar de la lista:',
          choices: [
            { title: '(Cancelar)', value: '__cancel__' },
            ...shopping.map(item => {
              const ing = container.listIngredients.execute(userId).find(i => i.id === item.getIngredientId());
              return { title: `${ing?.name ?? item.getIngredientId()} (${item.isCompleted() ? 'comprado' : 'pendiente'})`, value: item.getIngredientId() };
            }),
          ],
        }, { onCancel: ON_CANCEL });
        if (resp?.id && resp.id !== '__cancel__') {
          container.removeShoppingItem.execute(planningId, resp.id);
          console.log('Quitado de la lista');
        }
        break;
      }
      case 'back':
        continuar = false;
        break;
    }
  }
}
