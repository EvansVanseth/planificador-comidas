import { describe, it, expect, beforeEach } from 'vitest';
import { ToggleShoppingItemUseCase } from './toggle-shopping-item.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('ToggleShoppingItemUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440010';

  let useCase: ToggleShoppingItemUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(async () => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new ToggleShoppingItemUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addShoppingItem('550e8400-e29b-41d4-a716-446655440099', ingredientId);
    await planningRepo.save(planning);
  });

  it('debe marcar un item como completado', async () => {
    await useCase.execute(planningId, ingredientId, true);

    const updated = (await planningRepo.findById(planningId))!;
    const items = updated.getShoppingItems();
    const item = items.find(i => i.getIngredientId() === ingredientId);
    expect(item!.isCompleted()).toBe(true);
  });

  it('debe marcar un item como pendiente', async () => {
    await useCase.execute(planningId, ingredientId, false);

    const updated = (await planningRepo.findById(planningId))!;
    const items = updated.getShoppingItems();
    const item = items.find(i => i.getIngredientId() === ingredientId);
    expect(item!.isCompleted()).toBe(false);
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute('inexistente', ingredientId, true)).rejects.toThrow(AppError);
  });
});
