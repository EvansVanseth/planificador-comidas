import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { Recipe, TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient, RecipeIngredientPrimitives } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(
    userId: string,
    name: string,
    baseServings: number,
    prepTime: number,
    preparation: string | null,
    ingredients: RecipeIngredientPrimitives[],
    tags: TagPrimitive[],
  ): Promise<string> {
    const existing = await this.recipeRepository.findByName(name);
    if (existing) {
      throw new AppError(`Ya existe una receta con el nombre "${name}"`);
    }

    const id = randomUUID();
    const recipeIngredients = ingredients.map(i => RecipeIngredient.fromPrimitives(i));
    const recipe = Recipe.create(id, userId, name, baseServings, prepTime, preparation, recipeIngredients, tags);
    await this.recipeRepository.save(recipe);
    return id;
  }
}
