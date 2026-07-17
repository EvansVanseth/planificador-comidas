import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(userId: string, name: string): Promise<string> {
    const existing = await this.ingredientRepository.findByName(name);
    if (existing) {
      throw new AppError(`Ya existe un ingrediente con el nombre "${name}"`);
    }

    const id = randomUUID();
    const ingredient = Ingredient.create(id, userId, name);
    await this.ingredientRepository.save(ingredient);
    return id;
  }
}
