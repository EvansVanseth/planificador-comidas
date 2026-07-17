import { describe, it, expect, beforeEach } from 'vitest';
import { RemoveShoppingItemUseCase } from './remove-shopping-item.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('RemoveShoppingItemUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440010';

  let useCase: RemoveShoppingItemUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(async () => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new RemoveShoppingItemUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addShoppingItem('550e8400-e29b-41d4-a716-446655440099', ingredientId);
    await planningRepo.save(planning);
  });

  it('debe eliminar un item de la lista de la compra', async () => {
    await useCase.execute(planningId, ingredientId);

    const updated = (await planningRepo.findById(planningId))!;
    const items = updated.getShoppingItems();
    expect(items.find(i => i.getIngredientId() === ingredientId)).toBeUndefined();
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute('inexistente', ingredientId)).rejects.toThrow(AppError);
  });
});
