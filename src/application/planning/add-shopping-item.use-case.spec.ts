import { describe, it, expect, beforeEach } from 'vitest';
import { AddShoppingItemUseCase } from './add-shopping-item.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('AddShoppingItemUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440010';

  let useCase: AddShoppingItemUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(async () => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new AddShoppingItemUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    await planningRepo.save(planning);
  });

  it('debe añadir un item a la lista de la compra', async () => {
    await useCase.execute(planningId, ingredientId);

    const updated = (await planningRepo.findById(planningId))!;
    const items = updated.getShoppingItems();
    expect(items).toHaveLength(1);
    expect(items[0].getIngredientId()).toBe(ingredientId);
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute('inexistente', ingredientId)).rejects.toThrow(AppError);
  });
});
