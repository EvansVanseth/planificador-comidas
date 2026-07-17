import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class AddNewTagToRecipeUseCase {
  constructor(
    private recipeRepository: RecipeRepository,
    private tagRepository: TagRepository,
  ) {}

  async execute(userId: string, recipeId: string, tagName: string, tagDimension: TagDimension): Promise<string> {
    const recipe = await this.recipeRepository.findById(recipeId);
    if (!recipe) {
      throw new AppError(`Recipe not found: ${recipeId}`);
    }

    const existing = await this.tagRepository.findByNameAndDimension(tagName, tagDimension);
    if (existing) {
      throw new AppError(`Ya existe una etiqueta con el nombre "${tagName}" en la dimensión ${tagDimension}`);
    }

    const tagId = randomUUID();
    const tag = Tag.create(tagId, userId, tagName, tagDimension, false);
    await this.tagRepository.save(tag);

    recipe.addTag(tagId, tagDimension);
    await this.recipeRepository.save(recipe);

    return tagId;
  }
}
