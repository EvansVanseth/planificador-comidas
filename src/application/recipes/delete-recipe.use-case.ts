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

  async execute(id: string): Promise<DeleteRecipeResult> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) throw new AppError(`Recipe not found: ${id}`);

    const userId = recipe.getUserId();
    let planningsAffected = 0;

    const plannings = await this.planningRepository.findAllByUserId(userId);
    for (const planning of plannings) {
      const unassigned = planning.unassignRecipeFromAllServices(id);
      if (unassigned > 0) {
        await this.planningRepository.save(planning);
        planningsAffected++;
      }
    }

    await this.recipeRepository.delete(id);
    return { planningsAffected };
  }
}
