import { describe, it, expect, beforeEach } from 'vitest';
import { BulkRemoveDaysUseCase } from './bulk-remove-days.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('BulkRemoveDaysUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: BulkRemoveDaysUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new BulkRemoveDaysUseCase(planningRepo);
  });

  function setupPlanningWithDays(): Planning {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440002', 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440003', 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440004', 3);
    return planning;
  }

  it('debe eliminar varios dias correctamente', () => {
    const planning = setupPlanningWithDays();
    planningRepo.save(planning);

    useCase.execute({ planningId, orders: [1, 3] });

    const updated = planningRepo.findById(planningId)!;
    expect(updated.getDays()).toHaveLength(1);
    expect(updated.getDay(1)).toBeNull();
    expect(updated.getDay(2)).not.toBeNull();
  });

  it('debe fallar si un dia no existe', () => {
    const planning = setupPlanningWithDays();
    planningRepo.save(planning);

    expect(() => useCase.execute({ planningId, orders: [99] })).toThrow(DomainError);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute({ planningId, orders: [1] })).toThrow(AppError);
  });
});
