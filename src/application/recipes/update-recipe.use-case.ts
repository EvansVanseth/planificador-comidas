import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient, RecipeIngredientPrimitives } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

export type UpdateRecipeInput = {
  id: string;
  name?: string;
  userId?: string;
  baseServings?: number;
  prepTime?: number;
  preparation?: string | null;
  addTags?: { id: string; dimension: TagDimension }[];
  removeTags?: string[];
  addIngredients?: RecipeIngredientPrimitives[];
  removeIngredients?: string[];
};

export class UpdateRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  execute(input: UpdateRecipeInput): void {
    const recipe = this.recipeRepository.findById(input.id);
    if (!recipe) {
      throw new AppError(`Recipe not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      const existing = this.recipeRepository.findByName(input.name);
      if (existing && existing.getId() !== input.id) {
        throw new AppError(`Ya existe una receta con el nombre "${input.name}"`);
      }
      recipe.rename(input.name);
    }

    if (input.userId !== undefined) {
      recipe.reassignUser(input.userId);
    }

    if (input.baseServings !== undefined) {
      recipe.changeBaseServings(input.baseServings);
    }

    if (input.prepTime !== undefined) {
      recipe.changePrepTime(input.prepTime);
    }

    if (input.preparation !== undefined) {
      recipe.updatePreparation(input.preparation);
    }

    if (input.addTags) {
      for (const t of input.addTags) {
        recipe.addTag(t.id, t.dimension);
      }
    }

    if (input.removeTags) {
      for (const tagId of input.removeTags) {
        recipe.removeTag(tagId);
      }
    }

    if (input.addIngredients) {
      for (const ing of input.addIngredients) {
        recipe.addIngredient(RecipeIngredient.fromPrimitives(ing));
      }
    }

    if (input.removeIngredients) {
      for (const ingId of input.removeIngredients) {
        recipe.removeIngredient(ingId);
      }
    }

    this.recipeRepository.save(recipe);
  }
}
