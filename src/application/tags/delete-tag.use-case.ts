import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

const REQUIRED_DIMS: TagDimension[] = [
  TagDimension.MOMENTO_DIA,
  TagDimension.FORMATO,
  TagDimension.TIPO_PLATO,
];

export type DeleteTagResult = {
  recipesAffected: number;
  planningsAffected: number;
  servicesRemoved: number;
};

export class DeleteTagUseCase {
  constructor(
    private tagRepository: TagRepository,
    private recipeRepository: RecipeRepository,
    private planningRepository: PlanningRepository,
  ) {}

  async execute(id: string): Promise<DeleteTagResult> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new AppError(`Tag not found: ${id}`);
    if (tag.isSystemTag()) throw new AppError('No se puede eliminar una etiqueta del sistema');

    const userId = tag.getUserId();
    const tagDimension = tag.getDimension();
    const isRequired = REQUIRED_DIMS.includes(tagDimension);
    const isMomentTag = tagDimension === TagDimension.MOMENTO_DIA;

    // Check recipes — blocked if this tag is the last of a required dimension
    const recipes = await this.recipeRepository.findAllByUserId(userId);
    const blockedRecipes: string[] = [];
    const removableRecipes: typeof recipes = [];

    for (const recipe of recipes) {
      if (!recipe.getTagIds().includes(id)) continue;

      if (isRequired) {
        const primitives = recipe.toPrimitives();
        const sameDimensionCount = primitives.tags.filter(t => t.dimension === tagDimension).length;
        if (sameDimensionCount <= 1) {
          blockedRecipes.push(primitives.name);
          continue;
        }
      }

      recipe.removeTag(id);
      removableRecipes.push(recipe);
    }

    if (blockedRecipes.length > 0) {
      throw new AppError(
        `No se puede eliminar la etiqueta: está siendo usada como única etiqueta de dimensión requerida en las siguientes recetas: ${blockedRecipes.join(', ')}. Asigna otra etiqueta primero.`
      );
    }

    for (const recipe of removableRecipes) {
      await this.recipeRepository.save(recipe);
    }

    // Clean up planning services
    const plannings = await this.planningRepository.findAllByUserId(userId);
    let planningsAffected = 0;
    let servicesRemoved = 0;

    for (const planning of plannings) {
      let planningChanged = false;

      if (isMomentTag) {
        const removed = planning.removeServicesByMomentTag(id);
        if (removed > 0) {
          servicesRemoved += removed;
          planningChanged = true;
        }
      }

      const refsCleaned = planning.removeTagFromServices(id);
      if (refsCleaned > 0) planningChanged = true;

      if (planningChanged) {
        await this.planningRepository.save(planning);
        planningsAffected++;
      }
    }

    await this.tagRepository.delete(id);

    return { recipesAffected: removableRecipes.length, planningsAffected, servicesRemoved };
  }
}
