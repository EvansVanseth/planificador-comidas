import { IContainer } from '../container';
import { theme } from './cli-theme';
import { RecipePrimitives } from '../../domain/recipes/aggregates/recipe.aggregate';

const DIMENSION_LABELS: Record<string, string> = {
  MOMENTO_DIA: 'Momento del dia',
  FORMATO: 'Formato',
  TIPO_PLATO: 'Tipo de plato',
  ESTILOS_VIDA: 'Estilo de vida',
};

const DIM_ORDER = ['MOMENTO_DIA', 'FORMATO', 'TIPO_PLATO', 'ESTILOS_VIDA'];

type IngredientItem = { id: string; name: string };
type TagItem = { id: string; name: string; dimension: string };

export function mostrarReceta(
  recipe: RecipePrimitives,
  allIngredients: IngredientItem[],
  allTags: TagItem[],
) {
  console.log(`\n${recipe.name}`);
  console.log(`  ID: ${recipe.id} — ${recipe.baseServings} comensales, ${recipe.prepTime} min`);
  if (recipe.preparation) {
    console.log(`  Preparación: ${recipe.preparation.slice(0, 80)}${recipe.preparation.length > 80 ? '…' : ''}`);
  }

  DIM_ORDER.forEach(dim => {
    const tagsForDim = recipe.tags.filter(t => t.dimension === dim);
    if (tagsForDim.length) {
      const names = tagsForDim.map(t => {
        const tag = allTags.find(at => at.id === t.id);
        return tag ? tag.name : t.id;
      }).join(', ');
      console.log(`  ${DIMENSION_LABELS[dim]}: ${names}`);
    }
  });

  if (recipe.ingredients.length) {
    const names = recipe.ingredients.map(i => {
      const ing = allIngredients.find(ai => ai.id === i.ingredientId);
      const base = ing ? ing.name : i.ingredientId;
      return i.quantityNote ? `${base} (${i.quantityNote})` : base;
    }).join(', ');
    console.log(`  Ingredientes: ${names}`);
  }
}

export { DIMENSION_LABELS };

export function listarRecetas(container: IContainer, userId: string) {
  const recipes = container.listRecipes.execute(userId);
  if (recipes.length === 0) {
    console.log('No hay recetas');
    return;
  }

  const allIngredients = container.listIngredients.execute(userId);
  const allTags = container.listTags.execute(userId);

  console.log(theme.header('--- Recetas ---'));
  recipes.forEach(r => mostrarReceta(r, allIngredients, allTags));
}
