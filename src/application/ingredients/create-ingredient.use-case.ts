import { IngredientRepository } from '../../infrastructure/repositories/ingredient-repository.interface';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { randomUUID } from 'crypto';

export class CreateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  execute(userId: string, name: string): string {
    const id = randomUUID();
    const ingredient = Ingredient.create(id, userId, name);
    this.ingredientRepository.save(ingredient);
    return id;
  }
}
