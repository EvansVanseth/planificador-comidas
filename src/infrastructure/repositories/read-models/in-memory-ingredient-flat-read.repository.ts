import {
  IngredientFlatReadRepository,
  IngredientNameFlat,
} from '@/domain/ingredients/repositories/ingredient-flat-read-repository.interface';
import { IngredientRepository } from '@/domain/ingredients/repositories/ingredient-repository.interface';

export class InMemoryIngredientFlatReadRepository implements IngredientFlatReadRepository {
  constructor(private ingredientRepository: IngredientRepository) {}

  async findNamesByIds(ids: string[]): Promise<IngredientNameFlat[]> {
    const ingredients = await this.ingredientRepository.findManyByIds(ids);
    return ingredients.map((i) => ({ id: i.getId(), name: i.getName() }));
  }
}
