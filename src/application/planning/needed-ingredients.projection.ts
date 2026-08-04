import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { RecipeRepository } from '@/domain/recipes/repositories/recipe-repository.interface';
import { IngredientRepository } from '@/domain/ingredients/repositories/ingredient-repository.interface';
import { PlanningServiceFlat } from '@/domain/planning/repositories/planning-flat-read-repository.interface';
import { RecipeIngredientFlat } from '@/domain/recipes/repositories/recipe-flat-read-repository.interface';

export type NeededIngredientEntry = {
  ingredientId: string;
  ingredientName: string;
  quantityNote: string | null;
  totalCovers: number;
  recipeNames: string[];
};

export function projectNeededIngredients(
  services: PlanningServiceFlat[],
  recipeIngredients: RecipeIngredientFlat[],
  ingredientNameById: ReadonlyMap<string, string>,
): NeededIngredientEntry[] {
  const recipeCovers = new Map<string, number>(); // recipeId → total covers
  for (const service of services) {
    recipeCovers.set(service.recipeId, (recipeCovers.get(service.recipeId) ?? 0) + service.covers);
  }

  const ingredientRecipes = new Map<string, Set<string>>(); // ingredientId → Set<recipeName>
  const ingredientNotes = new Map<string, string | null>(); // ingredientId → quantityNote
  const ingredientTotals = new Map<string, number>(); // ingredientId → totalCovers

  for (const item of recipeIngredients) {
    ingredientRecipes.set(item.ingredientId, (ingredientRecipes.get(item.ingredientId) ?? new Set()).add(item.recipeName));
    ingredientTotals.set(item.ingredientId, (ingredientTotals.get(item.ingredientId) ?? 0) + (recipeCovers.get(item.recipeId) ?? 0));
    if (item.quantityNote && !ingredientNotes.has(item.ingredientId)) {
      ingredientNotes.set(item.ingredientId, item.quantityNote);
    }
  }

  const result: NeededIngredientEntry[] = [];
  for (const [ingredientId, recipes] of ingredientRecipes) {
    result.push({
      ingredientId,
      ingredientName: ingredientNameById.get(ingredientId) ?? '?',
      quantityNote: ingredientNotes.get(ingredientId) ?? null,
      totalCovers: ingredientTotals.get(ingredientId) ?? 0,
      recipeNames: Array.from(recipes).sort(),
    });
  }

  result.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
  return result;
}

export async function buildNeededIngredients(
  planning: Planning,
  recipeRepository: RecipeRepository,
  ingredientRepository: IngredientRepository,
): Promise<NeededIngredientEntry[]> {
  const services: PlanningServiceFlat[] = [];
  for (const day of planning.getDays()) {
    const dto = day.toDTO();
    for (const service of Object.values(dto.services)) {
      if (service?.getRecipeId()) {
        services.push({ recipeId: service.getRecipeId()!, covers: service.getCovers() });
      }
    }
  }

  const recipeIds = [...new Set(services.map((s) => s.recipeId))];
  const recipes = await recipeRepository.findManyByIds(recipeIds);
  const recipeById = new Map(recipes.map((r) => [r.getId(), r]));

  const recipeIngredients: RecipeIngredientFlat[] = [];
  for (const recipeId of recipeIds) {
    const recipe = recipeById.get(recipeId);
    if (!recipe) continue;

    for (const ing of recipe.getIngredients()) {
      recipeIngredients.push({
        recipeId,
        recipeName: recipe.getName(),
        ingredientId: ing.ingredientId,
        quantityNote: ing.quantityNote,
      });
    }
  }

  const ingredientIds = [...new Set(recipeIngredients.map((r) => r.ingredientId))];
  const ingredients = await ingredientRepository.findManyByIds(ingredientIds);
  const ingredientNameById = new Map(ingredients.map((i) => [i.getId(), i.getName()]));

  return projectNeededIngredients(services, recipeIngredients, ingredientNameById);
}
