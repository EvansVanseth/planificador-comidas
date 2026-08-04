import { describe, it, expect, beforeEach } from 'vitest';
import { GetPlanningByIdUseCase } from './get-planning-by-id.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { randomUUID } from 'crypto';

describe('GetPlanningByIdUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: GetPlanningByIdUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new GetPlanningByIdUseCase(planningRepo);
  });

  it('debe devolver el planning si existe', async () => {
    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    await planningRepo.save(planning);

    const found = await useCase.execute(planningId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(planningId);
  });

  it('debe devolver null si no existe', async () => {
    expect(await useCase.execute(planningId)).toBeNull();
  });
});
