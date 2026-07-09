import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';

export class ListRecipesUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  execute(userId: string): RecipePrimitives[] {
    return this.recipeRepository.findAllByUserId(userId)
      .map(r => r.toPrimitives())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
