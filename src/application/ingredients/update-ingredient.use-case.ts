import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type UpdateIngredientInput = {
  id: string;
  name?: string;
  userId?: string;
};

export class UpdateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(input: UpdateIngredientInput): Promise<void> {
    const ingredient = await this.ingredientRepository.findById(input.id);
    if (!ingredient) {
      throw new AppError(`Ingredient not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      const existing = await this.ingredientRepository.findByName(input.name);
      if (existing && existing.getId() !== input.id) {
        throw new AppError(`Ya existe un ingrediente con el nombre "${input.name}"`);
      }
      ingredient.rename(input.name);
    }

    if (input.userId !== undefined) {
      ingredient.reassignUser(input.userId);
    }

    await this.ingredientRepository.save(ingredient);
  }
}
