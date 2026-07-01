import { IngredientRepository } from '../../infrastructure/repositories/ingredient-repository.interface';
import { IngredientPrimitives } from '@/domain/ingredients/aggregates/ingredient.aggregate';

export class ListIngredientsUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  execute(userId: string): IngredientPrimitives[] {
    return this.ingredientRepository.findAllByUserId(userId).map(i => i.toPrimitives());
  }
}
