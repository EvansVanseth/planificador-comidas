import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

export type BulkAssignMealInput = {
  planningId: string;
  days: number[];
  momentTagId: string;
  covers: number;
  recipeId?: string;
  clearRecipe?: boolean;
};

export class BulkAssignMealUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private tagRepository: TagRepository,
    private recipeRepository: RecipeRepository,
  ) {}

  execute(input: BulkAssignMealInput): void {
    const planning = this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const tag = this.tagRepository.findById(input.momentTagId);
    if (!tag) throw new AppError('La etiqueta de momento del día no existe');
    if (tag.getDimension() !== TagDimension.MOMENTO_DIA) {
      throw new AppError('La etiqueta no es de tipo MOMENTO_DIA');
    }

    if (input.clearRecipe && input.recipeId) {
      throw new AppError('No se puede asignar y quitar receta a la vez');
    }
    if (input.recipeId) {
      const recipe = this.recipeRepository.findById(input.recipeId);
      if (!recipe) throw new AppError('La receta no existe');
    }

    planning.assignMealToDays(input.days, input.momentTagId, input.covers, input.recipeId, input.clearRecipe);
    this.planningRepository.save(planning);
  }
}
