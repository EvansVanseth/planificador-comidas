import { describe, it, expect, beforeEach } from 'vitest';
import { BulkCreateDaysUseCase } from './bulk-create-days.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('BulkCreateDaysUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: BulkCreateDaysUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new BulkCreateDaysUseCase(planningRepo);
  });

  it('debe crear varios dias correctamente', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    await planningRepo.save(planning);

    await useCase.execute({ planningId, orders: [1, 3, 5] });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDays()).toHaveLength(3);
    expect(updated.getDay(1)).not.toBeNull();
    expect(updated.getDay(3)).not.toBeNull();
    expect(updated.getDay(5)).not.toBeNull();
  });

  it('debe fallar si un dia ya existe', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440002', 1);
    await planningRepo.save(planning);

    await expect(useCase.execute({ planningId, orders: [1, 2] })).rejects.toThrow(DomainError);
    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDays()).toHaveLength(1);
  });

  it('debe fallar si un dia esta fuera del rango de semanas', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    await planningRepo.save(planning);

    await expect(useCase.execute({ planningId, orders: [8] })).rejects.toThrow(DomainError);
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute({ planningId, orders: [1] })).rejects.toThrow(AppError);
  });
});
