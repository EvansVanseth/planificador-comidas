import prompts from 'prompts';
import { IContainer } from '../../container';
import { listarEtiquetas } from './tag-display';
import { crearEtiqueta } from './tag-create.menu';
import { editarEtiqueta } from './tag-edit.menu';
import { eliminarEtiqueta } from './tag-delete.menu';
import { reordenarMomentos } from './tag-order.menu';

const ON_CANCEL = () => {};

export async function menuEtiquetas(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Etiquetas — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar etiquetas',  value: 'list' },
        { title: 'Crear etiqueta',      value: 'create' },
        { title: 'Editar etiqueta',     value: 'edit' },
        { title: 'Eliminar etiqueta',   value: 'delete' },
        { title: 'Reordenar momentos',  value: 'reorder' },
        { title: 'Volver',              value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarEtiquetas(container, userId);
        break;
      case 'create':
        await crearEtiqueta(container, userId);
        break;
      case 'edit':
        await editarEtiqueta(container, userId);
        break;
      case 'delete':
        await eliminarEtiqueta(container, userId);
        break;
      case 'reorder':
        await reordenarMomentos(container, userId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
