import { describe, it, expect, beforeEach } from 'vitest';
import { RemoveDayFromPlanningUseCase } from './remove-day-from-planning.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('RemoveDayFromPlanningUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: RemoveDayFromPlanningUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new RemoveDayFromPlanningUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440098', 1);
    planningRepo.save(planning);
  });

  it('debe eliminar un dia existente', () => {
    useCase.execute(planningId, 1);

    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1);
    expect(day).toBeNull();
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute('inexistente', 1)).toThrow(AppError);
  });
});
