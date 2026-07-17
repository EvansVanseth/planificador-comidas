import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';

export class ListRecipesUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(userId: string): Promise<RecipePrimitives[]> {
    const recipes = await this.recipeRepository.findAllByUserId(userId);
    return recipes
      .map(r => r.toPrimitives())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
