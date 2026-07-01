import { RecipeRepository } from '../../infrastructure/repositories/recipe-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class DeleteRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  execute(id: string): void {
    const recipe = this.recipeRepository.findById(id);
    if (!recipe) {
      throw new AppError(`Recipe not found: ${id}`);
    }
    this.recipeRepository.delete(id);
  }
}
