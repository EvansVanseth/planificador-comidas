import {
  RecipeFlatReadRepository,
  RecipeIngredientFlat,
} from '@/domain/recipes/repositories/recipe-flat-read-repository.interface';
import { RecipeRepository } from '@/domain/recipes/repositories/recipe-repository.interface';

export class InMemoryRecipeFlatReadRepository implements RecipeFlatReadRepository {
  constructor(private recipeRepository: RecipeRepository) {}

  async getIngredientsByRecipeIds(recipeIds: string[]): Promise<RecipeIngredientFlat[]> {
    const recipes = await this.recipeRepository.findManyByIds(recipeIds);
    const result: RecipeIngredientFlat[] = [];
    for (const recipe of recipes) {
      for (const ing of recipe.getIngredients()) {
        result.push({
          recipeId: recipe.getId(),
          recipeName: recipe.getName(),
          ingredientId: ing.ingredientId,
          quantityNote: ing.quantityNote,
        });
      }
    }
    return result;
  }
}
