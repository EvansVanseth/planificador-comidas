import { describe, it, expect, beforeEach } from 'vitest';
import { RemoveMealFromDayUseCase } from './remove-meal-from-day.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('RemoveMealFromDayUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const momentTagId = '550e8400-e29b-41d4-a716-446655440010';

  let useCase: RemoveMealFromDayUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new RemoveMealFromDayUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440098', 1);
    planning.assignMealToDay(1, momentTagId, 4);
    planningRepo.save(planning);
  });

  it('debe eliminar una comida de un dia', () => {
    useCase.execute(planningId, 1, momentTagId);

    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1);
    expect(day!.services[momentTagId]).toBeUndefined();
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute('inexistente', 1, momentTagId)).toThrow(AppError);
  });
});
