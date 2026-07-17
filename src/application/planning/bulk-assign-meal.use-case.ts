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
  ignoreRestrictions?: boolean;
};

export class BulkAssignMealUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private tagRepository: TagRepository,
    private recipeRepository: RecipeRepository,
  ) {}

  async execute(input: BulkAssignMealInput): Promise<void> {
    const planning = await this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const tag = await this.tagRepository.findById(input.momentTagId);
    if (!tag) throw new AppError('La etiqueta de momento del día no existe');
    if (tag.getDimension() !== TagDimension.MOMENTO_DIA) {
      throw new AppError('La etiqueta no es de tipo MOMENTO_DIA');
    }

    if (input.clearRecipe && input.recipeId) {
      throw new AppError('No se puede asignar y quitar receta a la vez');
    }

    const finalRecipeId = input.recipeId || undefined;

    if (finalRecipeId && !input.ignoreRestrictions) {
      const recipe = await this.recipeRepository.findById(finalRecipeId);
      if (!recipe) throw new AppError('La receta no existe');

      const recipeTagIds = recipe.getTagIds();

      const moments = await Promise.all(
        recipeTagIds.map(tid => this.tagRepository.findById(tid)),
      );
      const recipeMoments = moments.filter(
        (t): t is NonNullable<typeof t> => t !== null && t.getDimension() === TagDimension.MOMENTO_DIA,
      );
      const recipeMomentIds = recipeMoments.map(t => t.getId());
      if (recipeMoments.length > 0 && !recipeMomentIds.some(tid => tid === input.momentTagId)) {
        throw new AppError('La receta no está disponible para este momento del día');
      }

      for (const dayOrder of input.days) {
        const day = planning.getDay(dayOrder);
        const meal = day?.services[input.momentTagId];
        const exclusions = meal?.getExclusions() ?? [];
        if (exclusions.length > 0) {
          const tags = await Promise.all(
            exclusions.map(id => this.tagRepository.findById(id)),
          );
          const conflicted = exclusions.filter((e, i) => tags[i] !== null && recipeTagIds.includes(e));
          if (conflicted.length > 0) {
            const tagNames = conflicted.map(id => tags.find(t => t?.getId() === id)?.getName() ?? id).join(', ');
            throw new AppError(`El día ${dayOrder} tiene exclusiones que coinciden con la receta: ${tagNames}`);
          }
        }
      }
    }

    planning.assignMealToDays(input.days, input.momentTagId, input.covers, finalRecipeId, input.clearRecipe);
    await this.planningRepository.save(planning);
  }
}
