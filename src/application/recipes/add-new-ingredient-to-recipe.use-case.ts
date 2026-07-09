import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class AddNewIngredientToRecipeUseCase {
  constructor(
    private recipeRepository: RecipeRepository,
    private ingredientRepository: IngredientRepository,
  ) {}

  execute(userId: string, recipeId: string, ingredientName: string, quantityNote?: string): string {
    const recipe = this.recipeRepository.findById(recipeId);
    if (!recipe) {
      throw new AppError(`Recipe not found: ${recipeId}`);
    }

    const ingredientId = randomUUID();
    const ingredient = Ingredient.create(ingredientId, userId, ingredientName);
    this.ingredientRepository.save(ingredient);

    const recipeIngredient = RecipeIngredient.create(ingredientId, quantityNote);
    recipe.addIngredient(recipeIngredient);
    this.recipeRepository.save(recipe);

    return ingredientId;
  }
}
