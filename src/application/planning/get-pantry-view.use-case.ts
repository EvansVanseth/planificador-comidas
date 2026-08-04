import { PlanningFlatReadRepository } from '../../domain/planning/repositories/planning-flat-read-repository.interface';
import { RecipeFlatReadRepository } from '../../domain/recipes/repositories/recipe-flat-read-repository.interface';
import { IngredientFlatReadRepository } from '../../domain/ingredients/repositories/ingredient-flat-read-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { projectNeededIngredients, NeededIngredientEntry } from './needed-ingredients.projection';

export type { NeededIngredientEntry };

export class GetPantryViewUseCase {
  constructor(
    private planningFlatReadRepository: PlanningFlatReadRepository,
    private recipeFlatReadRepository: RecipeFlatReadRepository,
    private ingredientFlatReadRepository: IngredientFlatReadRepository,
  ) {}

  async execute(planningId: string): Promise<NeededIngredientEntry[]> {
    const snapshot = await this.planningFlatReadRepository.getSnapshot(planningId);
    if (!snapshot) throw new AppError('El Id del planning no existe');

    const recipeIds = [...new Set(snapshot.services.map((s) => s.recipeId))];
    const recipeIngredients = await this.recipeFlatReadRepository.getIngredientsByRecipeIds(recipeIds);

    const ingredientIds = [...new Set(recipeIngredients.map((r) => r.ingredientId))];
    const ingredientNames = await this.ingredientFlatReadRepository.findNamesByIds(ingredientIds);
    const ingredientNameById = new Map(ingredientNames.map((n) => [n.id, n.name]));

    return projectNeededIngredients(snapshot.services, recipeIngredients, ingredientNameById);
  }
}
