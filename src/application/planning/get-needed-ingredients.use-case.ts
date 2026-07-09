import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type NeededIngredientEntry = {
  ingredientId: string;
  ingredientName: string;
  quantityNote: string | null;
  totalCovers: number;
  recipeNames: string[];
};

export class GetNeededIngredientsUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private recipeRepository: RecipeRepository,
    private ingredientRepository: IngredientRepository,
  ) {}

  execute(planningId: string): NeededIngredientEntry[] {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

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

    // Resolver recetas y sus ingredientes
    const recipeNames = new Map<string, string>();
    const ingredientRecipes = new Map<string, Set<string>>(); // ingredientId → Set<recipeName>
    const ingredientNotes = new Map<string, string | null>(); // ingredientId → quantityNote
    const ingredientTotals = new Map<string, number>(); // ingredientId → totalCovers

    for (const [recipeId, totalCovers] of recipeCovers) {
      const recipe = this.recipeRepository.findById(recipeId);
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

    // Resolver nombres de ingredientes
    const ingredientNames = new Map<string, string>();
    for (const id of ingredientRecipes.keys()) {
      const ing = this.ingredientRepository.findById(id);
      ingredientNames.set(id, ing?.getName() ?? '?');
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
}
