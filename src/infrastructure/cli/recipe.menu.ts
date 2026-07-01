import prompts from 'prompts';
import { IContainer } from '../container';

export async function menuRecetas(container: IContainer) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Recetas — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar recetas', value: 'list' },
        { title: 'Volver',         value: 'back' }
      ]
    });

    switch (response.opcion) {
      case 'list':
        listarRecetas(container);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

function listarRecetas(container: IContainer) {
  const recipes = container.listRecipes.execute();
  if (recipes.length === 0) {
    console.log('No hay recetas');
    return;
  }
  console.log('--- Recetas ---');
  recipes.forEach(r => console.log(`(id: ${r.id}) ${r.name} — ${r.baseServings} comensales, ${r.prepTime} min`));
}
