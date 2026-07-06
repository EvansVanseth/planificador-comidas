import { RecipeRepository } from '../../infrastructure/repositories/recipe-repository.interface';
import { Recipe, TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient, RecipeIngredientPrimitives } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { AppError } from '../shared/errors/app-error';
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
    const existing = this.recipeRepository.findByName(name);
    if (existing) {
      throw new AppError(`Ya existe una receta con el nombre "${name}"`);
    }

    const id = randomUUID();
    const recipeIngredients = ingredients.map(i => RecipeIngredient.fromPrimitives(i));
    const recipe = Recipe.create(id, userId, name, baseServings, prepTime, preparation, recipeIngredients, tags);
    this.recipeRepository.save(recipe);
    return id;
  }
}
