import prompts from 'prompts';
import { IContainer } from '../container';
import { listarIngredientes } from './ingredient-display';
import { crearIngrediente } from './ingredient-create.menu';
import { editarIngrediente } from './ingredient-edit.menu';
import { eliminarIngrediente } from './ingredient-delete.menu';
import { fusionarIngredientes } from './ingredient-merge.menu';

const ON_CANCEL = () => {};

export async function menuIngredientes(container: IContainer, userId: string) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Ingredientes — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar ingredientes', value: 'list' },
        { title: 'Crear ingrediente',   value: 'create' },
        { title: 'Editar ingrediente',   value: 'edit' },
        { title: 'Fusionar ingredientes', value: 'merge' },
        { title: 'Eliminar ingrediente',  value: 'delete' },
        { title: 'Volver',              value: 'back' }
      ]
    }, { onCancel: ON_CANCEL });

    if (!response?.opcion) continue;

    switch (response.opcion) {
      case 'list':
        listarIngredientes(container, userId);
        break;
      case 'create':
        await crearIngrediente(container, userId);
        break;
      case 'merge':
        await fusionarIngredientes(container, userId);
        break;
      case 'edit':
        await editarIngrediente(container, userId);
        break;
      case 'delete':
        await eliminarIngrediente(container, userId);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}
