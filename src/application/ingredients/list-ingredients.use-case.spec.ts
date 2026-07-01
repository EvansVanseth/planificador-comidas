import { describe, it, expect, beforeEach } from 'vitest';
import { ListIngredientsUseCase } from './list-ingredients.use-case';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';

describe('ListIngredientsUseCase', () => {
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: ListIngredientsUseCase;
  let repo: InMemoryIngredientRepository;

  beforeEach(() => {
    repo = new InMemoryIngredientRepository();
    useCase = new ListIngredientsUseCase(repo);
  });

  it('debe devolver lista vacía si no hay ingredientes', () => {
    expect(useCase.execute()).toEqual([]);
  });

  it('debe devolver todos los ingredientes como primitivas', () => {
    const ing1 = Ingredient.create('550e8400-e29b-41d4-a716-446655440001', validUserId, 'Arroz');
    const ing2 = Ingredient.create('550e8400-e29b-41d4-a716-446655440002', validUserId, 'Frijoles');
    repo.save(ing1);
    repo.save(ing2);

    const result = useCase.execute();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(ing1.toPrimitives());
  });
});
