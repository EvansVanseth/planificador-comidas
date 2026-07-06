import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { RecipeRepository } from '../../infrastructure/repositories/recipe-repository.interface';
import { IngredientRepository } from '../../infrastructure/repositories/ingredient-repository.interface';
import { NeededIngredientEntry } from './get-needed-ingredients.use-case';
import { AppError } from '../shared/errors/app-error';

export type ShoppingListEntry = NeededIngredientEntry & {
  pantryCovers: number;
  pantryAvailable: boolean;
  neededAfterPantry: number;
  inShoppingList: boolean;
  shoppingCompleted: boolean;
};

export class GetShoppingListUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private recipeRepository: RecipeRepository,
    private ingredientRepository: IngredientRepository,
  ) {}

  execute(planningId: string): ShoppingListEntry[] {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    // Misma proyección que NeededIngredients
    const recipeCovers = new Map<string, number>();
    for (const day of planning.getDays()) {
      const dto = day.toDTO();
      for (const service of Object.values(dto.services)) {
        if (service?.getRecipeId()) {
          const id = service.getRecipeId()!;
          recipeCovers.set(id, (recipeCovers.get(id) ?? 0) + service.getCovers());
        }
      }
    }

    const ingredientRecipes = new Map<string, Set<string>>();
    const ingredientNotes = new Map<string, string | null>();
    const ingredientTotals = new Map<string, number>();

    for (const [recipeId, totalCovers] of recipeCovers) {
      const recipe = this.recipeRepository.findById(recipeId);
      if (!recipe) continue;

      for (const ing of recipe.getIngredients()) {
        ingredientRecipes.set(ing.ingredientId, (ingredientRecipes.get(ing.ingredientId) ?? new Set()).add(recipe.getName()));
        ingredientTotals.set(ing.ingredientId, (ingredientTotals.get(ing.ingredientId) ?? 0) + totalCovers);
        if (ing.quantityNote && !ingredientNotes.has(ing.ingredientId)) {
          ingredientNotes.set(ing.ingredientId, ing.quantityNote);
        }
      }
    }

    const ingredientNames = new Map<string, string>();
    for (const id of ingredientRecipes.keys()) {
      const ing = this.ingredientRepository.findById(id);
      ingredientNames.set(id, ing?.getName() ?? '?');
    }

    // Cruzar con pantry y shopping list de la planificación
    const pantryByIngredient = new Map(planning.getPantryItems().map(p => [p.getIngredientId(), p]));
    const shoppingByIngredient = new Map(planning.getShoppingItems().map(s => [s.getIngredientId(), s]));

    const result: ShoppingListEntry[] = [];
    for (const [ingredientId, recipes] of ingredientRecipes) {
      const totalCovers = ingredientTotals.get(ingredientId) ?? 0;
      const pantryItem = pantryByIngredient.get(ingredientId);
      const pantryAvailable = pantryItem?.isAvailable() ?? false;
      const pantryCovers = pantryItem?.getCovers() ?? 0;
      const shopItem = shoppingByIngredient.get(ingredientId);

      const neededAfterPantry = pantryAvailable ? 0 : Math.max(0, totalCovers - pantryCovers);

      result.push({
        ingredientId,
        ingredientName: ingredientNames.get(ingredientId) ?? '?',
        quantityNote: ingredientNotes.get(ingredientId) ?? null,
        totalCovers,
        recipeNames: Array.from(recipes).sort(),
        pantryCovers,
        pantryAvailable,
        neededAfterPantry,
        inShoppingList: !!shopItem,
        shoppingCompleted: shopItem?.isCompleted() ?? false,
      });
    }

    result.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
    return result;
  }
}
