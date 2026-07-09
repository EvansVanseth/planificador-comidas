import { describe, it, expect, beforeEach } from 'vitest';
import { UpdatePantryItemCoversUseCase } from './update-pantry-item-covers.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('UpdatePantryItemCoversUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440010';

  let useCase: UpdatePantryItemCoversUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new UpdatePantryItemCoversUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addPantryItem('550e8400-e29b-41d4-a716-446655440099', ingredientId);
    planningRepo.save(planning);
  });

  it('debe actualizar las cubiertas de un item de la despensa', () => {
    useCase.execute(planningId, ingredientId, 3);

    const updated = planningRepo.findById(planningId)!;
    const items = updated.getPantryItems();
    const item = items.find(i => i.getIngredientId() === ingredientId);
    expect(item!.getCovers()).toBe(3);
    expect(item!.isAvailable()).toBe(false);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute('inexistente', ingredientId, 3)).toThrow(AppError);
  });
});
