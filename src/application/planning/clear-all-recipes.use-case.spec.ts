import { describe, it, expect, beforeEach } from 'vitest';
import { ClearAllRecipesUseCase } from './clear-all-recipes.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('ClearAllRecipesUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const recipeId = '550e8400-e29b-41d4-a716-446655440002';
  const momentTagId = '550e8400-e29b-41d4-a716-446655440010';

  let useCase: ClearAllRecipesUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new ClearAllRecipesUseCase(planningRepo);
  });

  it('debe limpiar todas las recetas de todos los servicios', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440098', 1);
    planning.assignMealToDay(1, momentTagId, 4, recipeId);
    planningRepo.save(planning);

    const count = useCase.execute(planningId);

    expect(count).toBe(1);
    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1)!;
    expect(day.services[momentTagId]?.getRecipeId()).toBeNull();
  });

  it('debe limpiar recetas de multiples servicios y dias', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440098', 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440099', 2);
    planning.assignMealToDay(1, momentTagId, 4, recipeId);
    planning.assignMealToDay(1, 'momento-2', 2, recipeId);
    planning.assignMealToDay(2, momentTagId, 3, recipeId);
    planningRepo.save(planning);

    const count = useCase.execute(planningId);

    expect(count).toBe(3);
    const updated = planningRepo.findById(planningId)!;
    expect(updated.getDay(1)!.services[momentTagId]?.getRecipeId()).toBeNull();
    expect(updated.getDay(1)!.services['momento-2']?.getRecipeId()).toBeNull();
    expect(updated.getDay(2)!.services[momentTagId]?.getRecipeId()).toBeNull();
  });

  it('debe ignorar servicios sin receta', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440098', 1);
    planning.assignMealToDay(1, momentTagId, 4, recipeId);
    planning.assignMealToDay(1, 'momento-2', 2);
    planningRepo.save(planning);

    const count = useCase.execute(planningId);

    expect(count).toBe(1);
    const updated = planningRepo.findById(planningId)!;
    expect(updated.getDay(1)!.services[momentTagId]?.getRecipeId()).toBeNull();
    expect(updated.getDay(1)!.services['momento-2']?.getRecipeId()).toBeNull();
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute('inexistente')).toThrow(AppError);
  });
});
