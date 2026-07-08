import { describe, it, expect, beforeEach } from 'vitest';
import { BulkRemoveMealUseCase } from './bulk-remove-meal.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('BulkRemoveMealUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const lunchTagId = '550e8400-e29b-41d4-a716-446655440010';
  const dinnerTagId = '550e8400-e29b-41d4-a716-446655440011';

  let useCase: BulkRemoveMealUseCase;
  let planningRepo: InMemoryPlanningRepository;

  function setupPlanningWithServices(): Planning {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440002', 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440003', 2);
    planning.assignMealToDay(1, lunchTagId, 4);
    planning.assignMealToDay(1, dinnerTagId, 2);
    planning.assignMealToDay(2, lunchTagId, 3);
    return planning;
  }

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new BulkRemoveMealUseCase(planningRepo);
  });

  it('debe eliminar el mismo servicio de varios dias', () => {
    const planning = setupPlanningWithServices();
    planningRepo.save(planning);

    useCase.execute({ planningId, days: [1, 2], momentTagId: lunchTagId });

    const updated = planningRepo.findById(planningId)!;
    expect(updated.getDay(1)!.services[lunchTagId]).toBeUndefined();
    expect(updated.getDay(1)!.services[dinnerTagId]).not.toBeNull();
    expect(updated.getDay(2)!.services[lunchTagId]).toBeUndefined();
  });

  it('debe fallar si un dia no tiene el servicio', () => {
    const planning = setupPlanningWithServices();
    planningRepo.save(planning);

    expect(() => useCase.execute({ planningId, days: [1, 2], momentTagId: dinnerTagId })).toThrow(DomainError);
  });

  it('debe fallar si un dia no existe', () => {
    const planning = setupPlanningWithServices();
    planningRepo.save(planning);

    expect(() => useCase.execute({ planningId, days: [99], momentTagId: lunchTagId })).toThrow(DomainError);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute({ planningId, days: [1], momentTagId: lunchTagId })).toThrow(AppError);
  });
});
