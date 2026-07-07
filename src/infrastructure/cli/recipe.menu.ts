import prompts from 'prompts';
import { IContainer } from '../container';
import { listarRecetas } from './recipe-display';
import { crearReceta } from './recipe-create.menu';
import { editarReceta } from './recipe-edit.menu';
import { eliminarReceta } from './recipe-delete.menu';

const ON_CANCEL = () => {};

export async function menuRecetas(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Recetas — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar recetas',   value: 'list' },
        { title: 'Crear receta',     value: 'create' },
        { title: 'Editar receta',    value: 'edit' },
        { title: 'Eliminar receta',  value: 'delete' },
        { title: 'Volver',           value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarRecetas(container, userId);
        break;
      case 'create':
        await crearReceta(container, userId);
        break;
      case 'edit':
        await editarReceta(container, userId);
        break;
      case 'delete':
        await eliminarReceta(container, userId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
