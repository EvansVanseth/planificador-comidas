import prompts from 'prompts';
import { IContainer } from '../../container';
import { listarPlanificaciones } from './planning-display';
import { crearPlanificacion } from './planning-create.menu';
import { editarPlanificacion } from './planning-edit.menu';
import { eliminarPlanificacion } from './planning-delete.menu';
import { duplicarPlanificacion } from './planning-duplicate.menu';


const ON_CANCEL = () => {};

export async function menuPlanificaciones(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Planificaciones — ¿Que quieres hacer?',
      choices: [
        { title: 'Ver planificaciones',    value: 'list' },
        { title: 'Crear planificacion',      value: 'create' },
        { title: 'Duplicar planificacion',  value: 'duplicate' },
        { title: 'Editar planificacion',    value: 'edit' },
        { title: 'Eliminar planificacion', value: 'delete' },
        { title: 'Volver',                  value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarPlanificaciones(container, userId);
        break;
      case 'create':
        await crearPlanificacion(container, userId);
        break;
      case 'duplicate':
        await duplicarPlanificacion(container, userId);
        break;
      case 'edit':
        await editarPlanificacion(container, userId);
        break;
      case 'delete':
        await eliminarPlanificacion(container, userId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
