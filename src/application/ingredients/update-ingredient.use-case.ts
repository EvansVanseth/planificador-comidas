import { IngredientRepository } from '../../infrastructure/repositories/ingredient-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type UpdateIngredientInput = {
  id: string;
  name?: string;
  userId?: string;
};

export class UpdateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  execute(input: UpdateIngredientInput): void {
    const ingredient = this.ingredientRepository.findById(input.id);
    if (!ingredient) {
      throw new AppError(`Ingredient not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      ingredient.rename(input.name);
    }

    if (input.userId !== undefined) {
      ingredient.reassignUser(input.userId);
    }

    this.ingredientRepository.save(ingredient);
  }
}
