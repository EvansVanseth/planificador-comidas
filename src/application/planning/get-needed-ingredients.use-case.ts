import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { buildNeededIngredients, NeededIngredientEntry } from './needed-ingredients.projection';

export type { NeededIngredientEntry };

export class GetNeededIngredientsUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private recipeRepository: RecipeRepository,
    private ingredientRepository: IngredientRepository,
  ) {}

  async execute(planningId: string): Promise<NeededIngredientEntry[]> {
    const planning = await this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    return buildNeededIngredients(planning, this.recipeRepository, this.ingredientRepository);
  }
}
