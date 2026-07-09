import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type DeleteRecipeResult = {
  planningsAffected: number;
};

export class DeleteRecipeUseCase {
  constructor(
    private recipeRepository: RecipeRepository,
    private planningRepository: PlanningRepository,
  ) {}

  execute(id: string): DeleteRecipeResult {
    const recipe = this.recipeRepository.findById(id);
    if (!recipe) throw new AppError(`Recipe not found: ${id}`);

    const userId = recipe.getUserId();
    let planningsAffected = 0;

    const plannings = this.planningRepository.findAllByUserId(userId);
    for (const planning of plannings) {
      const unassigned = planning.unassignRecipeFromAllServices(id);
      if (unassigned > 0) {
        this.planningRepository.save(planning);
        planningsAffected++;
      }
    }

    this.recipeRepository.delete(id);
    return { planningsAffected };
  }
}
