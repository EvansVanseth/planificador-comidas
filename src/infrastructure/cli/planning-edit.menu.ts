import prompts from 'prompts';
import { IContainer } from '../container';
import { mostrarPlanificacion } from './planning-display';
import { editarDatosPlanificacion } from './planning-edit-data.menu';
import { gestionarDias } from './planning-days.menu';
import { gestionarCompra } from './planning-shopping.menu';

const ON_CANCEL = () => {};

export async function editarPlanificacion(container: IContainer, userId: string) {
  const plannings = container.listPlannings.execute(userId);
  if (plannings.length === 0) {
    console.log('No hay planificaciones para editar');
    return;
  }

  const seleccion = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la planificacion a editar:',
    choices: [
      { title: '(Cancelar)', value: '__cancel__' },
      ...plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas, ${p.getDays().length} dias)`, value: p.getId() })),
    ],
  }, { onCancel: ON_CANCEL });

  if (!seleccion?.id || seleccion.id === '__cancel__') return;
  const planningId = seleccion.id;

  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) {
      console.log('Planificacion no encontrada');
      return;
    }

    mostrarPlanificacion(planning, container.listRecipes.execute(userId), container.listTags.execute(userId));

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Editar — ¿Que quieres hacer?',
      choices: [
        { title: 'Editar datos',         value: 'edit-data' },
        { title: 'Gestionar dias',       value: 'manage-days' },
        { title: 'Despensa y compra',    value: 'shopping' },
        { title: 'Volver',               value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'edit-data':
        await editarDatosPlanificacion(container, planningId);
        break;
      case 'manage-days':
        await gestionarDias(container, userId, planningId);
        break;
      case 'shopping':
        await gestionarCompra(container, userId, planningId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
