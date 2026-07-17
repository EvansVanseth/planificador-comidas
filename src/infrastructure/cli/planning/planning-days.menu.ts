import prompts from 'prompts';
import { IContainer } from '../../container';
import { mostrarPlanificacion } from './planning-display';
import { agregarDia } from './planning-day-add.menu';
import { agregarDiasEnLote } from './planning-day-bulk-add.menu';
import { eliminarDiasEnLote } from './planning-day-bulk-remove.menu';
import { editarDias } from './planning-bulk-update.menu';

const ON_CANCEL = () => {};

export async function gestionarDias(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const planning = (await container.listPlannings.execute(userId)).find(p => p.getId() === planningId);
    if (!planning) { console.log('Planificacion no encontrada'); return; }

    const days = planning.getDays().sort((a, b) => a.getOrdenDia() - b.getOrdenDia());
    mostrarPlanificacion(planning, await container.listRecipes.execute(userId), await container.listTags.execute(userId));

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar dias:',
      choices: [
        { title: 'Agregar un dia',          value: 'add-day' },
        { title: 'Agregar varios dias',     value: 'bulk-add' },
        { title: 'Editar dias',             value: 'edit-days' },
        { title: 'Eliminar dias',           value: 'bulk-remove' },
        { title: 'Volver',                  value: 'back' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value) continue;

    switch (opcion.value) {
      case 'add-day':
        await agregarDia(container, planningId, planning.getWeeks());
        break;
      case 'bulk-add':
        await agregarDiasEnLote(container, planningId, planning.getWeeks());
        break;
      case 'edit-days':
        await editarDias(container, userId, planningId);
        break;
      case 'bulk-remove':
        await eliminarDiasEnLote(container, planningId, days);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
