import { describe, it, expect, beforeEach } from 'vitest';
import { AddDayToPlanningUseCase } from './add-day-to-planning.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('AddDayToPlanningUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: AddDayToPlanningUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new AddDayToPlanningUseCase(planningRepo);

    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planningRepo.save(planning);
  });

  it('debe añadir un dia y devolver su id', () => {
    const dayId = useCase.execute(planningId, 1);

    expect(dayId).toBeDefined();
    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1);
    expect(day).not.toBeNull();
    expect(day!.id).toBe(dayId);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute('inexistente', 1)).toThrow(AppError);
  });
});
