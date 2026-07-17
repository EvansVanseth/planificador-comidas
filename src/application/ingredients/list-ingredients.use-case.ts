import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { IngredientPrimitives } from '@/domain/ingredients/aggregates/ingredient.aggregate';

export class ListIngredientsUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(userId: string): Promise<IngredientPrimitives[]> {
    const ingredients = await this.ingredientRepository.findAllByUserId(userId);
    return ingredients
      .map(i => i.toPrimitives())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
