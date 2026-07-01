import { RecipeRepository } from '../../infrastructure/repositories/recipe-repository.interface';
import { RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';

export class ListRecipesUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  execute(): RecipePrimitives[] {
    return this.recipeRepository.findAll().map(r => r.toPrimitives());
  }
}
