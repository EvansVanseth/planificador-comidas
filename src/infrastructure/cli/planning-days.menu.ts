import prompts from 'prompts';
import { IContainer } from '../container';
import { mostrarPlanificacion } from './planning-display';
import { agregarDia } from './planning-day-add.menu';
import { agregarDiasEnLote } from './planning-day-bulk-add.menu';
import { eliminarDia } from './planning-day-remove.menu';
import { eliminarDiasEnLote } from './planning-day-bulk-remove.menu';
import { gestionarServicios } from './planning-services.menu';
import { editarEnLote } from './planning-bulk-update.menu';

const ON_CANCEL = () => {};

export async function gestionarDias(container: IContainer, userId: string, planningId: string) {
  let continuar = true;
  while (continuar) {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) { console.log('Planificacion no encontrada'); return; }

    const days = planning.getDays();
    mostrarPlanificacion(planning, container.listRecipes.execute(userId), container.listTags.execute(userId));

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Gestionar dias:',
      choices: [
        { title: 'Agregar dia',           value: 'add-day' },
        { title: 'Agregar dias en lote',  value: 'bulk-add' },
        { title: 'Editar dia',            value: 'manage-meals' },
        { title: 'Editar en lote',        value: 'bulk-edit' },
        { title: 'Eliminar dia',          value: 'remove-day' },
        { title: 'Eliminar varios dias',  value: 'bulk-remove' },
        { title: 'Volver',                value: 'back' },
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
      case 'manage-meals':
        await gestionarServicios(container, userId, planningId, days);
        break;
      case 'bulk-edit':
        await editarEnLote(container, userId, planningId);
        break;
      case 'remove-day':
        await eliminarDia(container, planningId, days);
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
