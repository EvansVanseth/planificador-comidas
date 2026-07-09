import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type DeleteTagResult = {
  recipesAffected: number;
  planningsAffected: number;
  recipesSkipped: number;
};

export class DeleteTagUseCase {
  constructor(
    private tagRepository: TagRepository,
    private recipeRepository: RecipeRepository,
    private planningRepository: PlanningRepository,
  ) {}

  execute(id: string): DeleteTagResult {
    const tag = this.tagRepository.findById(id);
    if (!tag) throw new AppError(`Tag not found: ${id}`);
    if (tag.isSystemTag()) throw new AppError('No se puede eliminar una etiqueta del sistema');

    const userId = tag.getUserId();
    let recipesAffected = 0;
    let recipesSkipped = 0;
    let planningsAffected = 0;

    const recipes = this.recipeRepository.findAllByUserId(userId);
    for (const recipe of recipes) {
      if (recipe.getTagIds().includes(id)) {
        try {
          recipe.removeTag(id);
          this.recipeRepository.save(recipe);
          recipesAffected++;
        } catch {
          recipesSkipped++;
        }
      }
    }

    const plannings = this.planningRepository.findAllByUserId(userId);
    for (const planning of plannings) {
      const count = planning.removeTagFromServices(id);
      if (count > 0) {
        this.planningRepository.save(planning);
        planningsAffected++;
      }
    }

    this.tagRepository.delete(id);

    return { recipesAffected, planningsAffected, recipesSkipped };
  }
}
