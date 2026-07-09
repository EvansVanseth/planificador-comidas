import { describe, it, expect, beforeEach } from 'vitest';
import { MarkPantryItemAvailableUseCase } from './mark-pantry-item-available.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('MarkPantryItemAvailableUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440010';

  let useCase: MarkPantryItemAvailableUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new MarkPantryItemAvailableUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addPantryItem('550e8400-e29b-41d4-a716-446655440099', ingredientId);
    planningRepo.save(planning);
  });

  it('debe marcar un item de la despensa como disponible', () => {
    useCase.execute(planningId, ingredientId);

    const updated = planningRepo.findById(planningId)!;
    const items = updated.getPantryItems();
    const item = items.find(i => i.getIngredientId() === ingredientId);
    expect(item).toBeDefined();
    expect(item!.isAvailable()).toBe(true);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute('inexistente', ingredientId)).toThrow(AppError);
  });
});
