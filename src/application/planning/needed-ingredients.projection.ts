import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { RecipeRepository } from '@/domain/recipes/repositories/recipe-repository.interface';
import { IngredientRepository } from '@/domain/ingredients/repositories/ingredient-repository.interface';

export type NeededIngredientEntry = {
  ingredientId: string;
  ingredientName: string;
  quantityNote: string | null;
  totalCovers: number;
  recipeNames: string[];
};

export async function buildNeededIngredients(
  planning: Planning,
  recipeRepository: RecipeRepository,
  ingredientRepository: IngredientRepository,
): Promise<NeededIngredientEntry[]> {
  // Recolectar todas las recetas asignadas con sus covers
  const recipeCovers = new Map<string, number>(); // recipeId → total covers
  for (const day of planning.getDays()) {
    const dto = day.toDTO();
    for (const service of Object.values(dto.services)) {
      if (service?.getRecipeId()) {
        const id = service.getRecipeId()!;
        recipeCovers.set(id, (recipeCovers.get(id) ?? 0) + service.getCovers());
      }
    }
  }

  // Resolver recetas (una sola query) y sus ingredientes
  const recipeNames = new Map<string, string>();
  const ingredientRecipes = new Map<string, Set<string>>(); // ingredientId → Set<recipeName>
  const ingredientNotes = new Map<string, string | null>(); // ingredientId → quantityNote
  const ingredientTotals = new Map<string, number>(); // ingredientId → totalCovers

  const recipes = await recipeRepository.findManyByIds([...recipeCovers.keys()]);
  const recipeById = new Map(recipes.map(r => [r.getId(), r]));

  for (const [recipeId, totalCovers] of recipeCovers) {
    const recipe = recipeById.get(recipeId);
    if (!recipe) continue;

    recipeNames.set(recipeId, recipe.getName());
    for (const ing of recipe.getIngredients()) {
      ingredientRecipes.set(ing.ingredientId, (ingredientRecipes.get(ing.ingredientId) ?? new Set()).add(recipe.getName()));
      ingredientTotals.set(ing.ingredientId, (ingredientTotals.get(ing.ingredientId) ?? 0) + totalCovers);
      if (ing.quantityNote && !ingredientNotes.has(ing.ingredientId)) {
        ingredientNotes.set(ing.ingredientId, ing.quantityNote);
      }
    }
  }

  // Resolver nombres de ingredientes (una sola query)
  const ingredientNames = new Map<string, string>();
  const ingredients = await ingredientRepository.findManyByIds([...ingredientRecipes.keys()]);
  for (const ing of ingredients) {
    ingredientNames.set(ing.getId(), ing.getName());
  }

  const result: NeededIngredientEntry[] = [];
  for (const [ingredientId, recipes] of ingredientRecipes) {
    result.push({
      ingredientId,
      ingredientName: ingredientNames.get(ingredientId) ?? '?',
      quantityNote: ingredientNotes.get(ingredientId) ?? null,
      totalCovers: ingredientTotals.get(ingredientId) ?? 0,
      recipeNames: Array.from(recipes).sort(),
    });
  }

  result.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
  return result;
}
