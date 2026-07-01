import { IngredientRepository } from '../../infrastructure/repositories/ingredient-repository.interface';
import { IngredientPrimitives } from '@/domain/ingredients/aggregates/ingredient.aggregate';

export class ListIngredientsUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  execute(): IngredientPrimitives[] {
    return this.ingredientRepository.findAll().map(i => i.toPrimitives());
  }
}
