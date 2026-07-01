import { RecipeRepository } from '../../infrastructure/repositories/recipe-repository.interface';
import { Recipe, TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient, RecipeIngredientPrimitives } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { randomUUID } from 'crypto';

export class CreateRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  execute(
    userId: string,
    name: string,
    baseServings: number,
    prepTime: number,
    preparation: string | null,
    ingredients: RecipeIngredientPrimitives[],
    tags: TagPrimitive[],
  ): string {
    const id = randomUUID();
    const recipeIngredients = ingredients.map(i => RecipeIngredient.fromPrimitives(i));
    const recipe = Recipe.create(id, userId, name, baseServings, prepTime, preparation, recipeIngredients, tags);
    this.recipeRepository.save(recipe);
    return id;
  }
}
