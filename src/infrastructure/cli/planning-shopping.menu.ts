import prompts from 'prompts';
import { IContainer } from '../container';
import { verIngredientesNecesarios, verListaCompra } from './planning-display';
import { gestionarDespensa } from './planning-pantry.menu';
import { gestionarListaCompra } from './planning-shopping-list.menu';

const ON_CANCEL = () => {};

export async function gestionarCompra(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Despensa y compra:',
      choices: [
        { title: 'Ver ingredientes necesarios',  value: 'needed-ingredients' },
        { title: 'Ver lista de la compra',       value: 'shopping-list' },
        { title: 'Gestionar despensa',           value: 'pantry' },
        { title: 'Gestionar lista de compra',    value: 'shopping' },
        { title: 'Volver',                       value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'needed-ingredients':
        verIngredientesNecesarios(container, planningId);
        break;
      case 'shopping-list':
        verListaCompra(container, planningId);
        break;
      case 'pantry':
        await gestionarDespensa(container, userId, planningId);
        break;
      case 'shopping':
        await gestionarListaCompra(container, userId, planningId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
