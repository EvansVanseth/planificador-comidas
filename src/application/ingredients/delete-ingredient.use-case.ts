import { IngredientRepository } from '../../infrastructure/repositories/ingredient-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class DeleteIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  execute(id: string): void {
    const ingredient = this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new AppError(`Ingredient not found: ${id}`);
    }
    this.ingredientRepository.delete(id);
  }
}
