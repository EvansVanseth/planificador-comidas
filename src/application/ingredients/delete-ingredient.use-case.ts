import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type DeleteIngredientResult = {
  recipesAffected: number;
  planningsAffected: number;
};

export class DeleteIngredientUseCase {
  constructor(
    private ingredientRepository: IngredientRepository,
    private recipeRepository: RecipeRepository,
    private planningRepository: PlanningRepository,
  ) {}

  execute(id: string): DeleteIngredientResult {
    const ingredient = this.ingredientRepository.findById(id);
    if (!ingredient) throw new AppError(`Ingredient not found: ${id}`);

    const userId = ingredient.getUserId();
    let recipesAffected = 0;
    let planningsAffected = 0;

    const recipes = this.recipeRepository.findAllByUserId(userId);
    for (const recipe of recipes) {
      if (recipe.getIngredients().some(i => i.ingredientId === id)) {
        recipe.removeIngredient(id);
        this.recipeRepository.save(recipe);
        recipesAffected++;
      }
    }

    const plannings = this.planningRepository.findAllByUserId(userId);
    for (const planning of plannings) {
      let planningChanged = false;

      if (planning.getPantryItems().some(i => i.getIngredientId() === id)) {
        planning.removePantryItem(id);
        planningChanged = true;
      }

      if (planning.getShoppingItems().some(i => i.getIngredientId() === id)) {
        planning.removeShoppingItem(id);
        planningChanged = true;
      }

      if (planningChanged) {
        this.planningRepository.save(planning);
        planningsAffected++;
      }
    }

    this.ingredientRepository.delete(id);

    return { recipesAffected, planningsAffected };
  }
}
