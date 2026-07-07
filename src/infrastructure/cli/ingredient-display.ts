import { IContainer } from '../container';

export function listarIngredientes(container: IContainer, userId: string) {
  const ingredients = container.listIngredients.execute(userId);
  if (ingredients.length === 0) {
    console.log('No hay ingredientes');
    return;
  }
  console.log('--- Ingredientes ---');
  ingredients.forEach(i => console.log(`(id: ${i.id}) ${i.name}`));
}
