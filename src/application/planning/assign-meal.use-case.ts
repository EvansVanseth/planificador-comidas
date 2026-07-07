import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface'
import { TagRepository } from '../../infrastructure/repositories/tag-repository.interface'
import { RecipeRepository } from '../../infrastructure/repositories/recipe-repository.interface'
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum'
import { AppError } from '../shared/errors/app-error';

export class AssignMealUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private tagRepository: TagRepository,
    private recipeRepository: RecipeRepository,
  ) {}

  execute(planningId: string, orderDay: number, momentTagId: string, recipeId: string, covers: number) {
    const planning = this.planningRepository.findById(planningId);
    if (planning === null) throw new AppError('El Id del planning no existe');

    const tag = this.tagRepository.findById(momentTagId);
    if (tag === null) throw new AppError('La etiqueta de momento del día no existe');
    if (tag.getDimension() !== TagDimension.MOMENTO_DIA) {
      throw new AppError('La etiqueta no es de tipo MOMENTO_DIA');
    }

    if (recipeId) {
      const dayDTO = planning.getDay(orderDay);
      const meal = dayDTO?.services[momentTagId];
      const exclusions = meal?.getExclusions() ?? [];

      if (exclusions.length > 0) {
        const recipe = this.recipeRepository.findById(recipeId);
        if (!recipe) throw new AppError('La receta no existe');

        const recipeTagIds = recipe.getTagIds();
        const conflicted = exclusions.filter(e => recipeTagIds.includes(e));
        if (conflicted.length > 0) {
          const tagNames = conflicted.map(id => this.tagRepository.findById(id)?.getName() ?? id).join(', ');
          throw new AppError(`La receta contiene etiquetas excluidas: ${tagNames}`);
        }
      }
    }

    planning.assignMealToDay(orderDay, momentTagId, covers, recipeId);
    this.planningRepository.save(planning);
  }
}