import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { AppError } from '../shared/errors/app-error';

export class MergeIngredientsUseCase {
  constructor(
    private ingredientRepository: IngredientRepository,
    private recipeRepository: RecipeRepository,
  ) {}

  async execute(userId: string, sourceIngredientId: string, targetIngredientId: string): Promise<void> {
    if (sourceIngredientId === targetIngredientId) {
      throw new AppError('No se puede fusionar un ingrediente consigo mismo');
    }

    const source = await this.ingredientRepository.findById(sourceIngredientId);
    if (!source) throw new AppError(`Ingrediente origen no encontrado: ${sourceIngredientId}`);

    const target = await this.ingredientRepository.findById(targetIngredientId);
    if (!target) throw new AppError(`Ingrediente destino no encontrado: ${targetIngredientId}`);

    if (source.getUserId() !== target.getUserId()) {
      throw new AppError('Los ingredientes deben pertenecer al mismo usuario');
    }

    const allRecipes = await this.recipeRepository.findAllByUserId(userId);
    const recipesWithSource = allRecipes.filter(r =>
      r.getIngredients().some(i => i.ingredientId === sourceIngredientId)
    );

    for (const recipe of recipesWithSource) {
      const sourceEntry = recipe.getIngredients().find(i => i.ingredientId === sourceIngredientId);
      if (!sourceEntry) continue;

      recipe.removeIngredient(sourceIngredientId);

      const hasTarget = recipe.getIngredients().some(i => i.ingredientId === targetIngredientId);
      if (!hasTarget) {
        const replacement = RecipeIngredient.create(targetIngredientId, sourceEntry.quantityNote ?? undefined);
        recipe.addIngredient(replacement);
      }

      await this.recipeRepository.save(recipe);
    }

    await this.ingredientRepository.delete(sourceIngredientId);
  }
}
