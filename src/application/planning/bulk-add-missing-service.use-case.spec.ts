import { describe, it, expect, beforeEach } from 'vitest';
import { BulkAddMissingServiceUseCase, BulkAddMissingServiceInput } from './bulk-add-missing-service.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('BulkAddMissingServiceUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const momentTagId = '550e8400-e29b-41d4-a716-446655440010';
  const otherMomentTagId = '550e8400-e29b-41d4-a716-446655440011';

  let useCase: BulkAddMissingServiceUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new BulkAddMissingServiceUseCase(planningRepo);
  });

  const input = (overrides?: Partial<BulkAddMissingServiceInput>): BulkAddMissingServiceInput => ({
    planningId,
    momentTagId,
    covers: 4,
    exclusions: [],
    preferences: [],
    ...overrides,
  });

  it('debe agregar el servicio a días que no lo tienen', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440100', 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440101', 2);
    planningRepo.save(planning);

    const count = useCase.execute(input());

    expect(count).toBe(2);
    const updated = planningRepo.findById(planningId)!;
    expect(updated.getDay(1)!.services[momentTagId]).not.toBeNull();
    expect(updated.getDay(2)!.services[momentTagId]).not.toBeNull();
  });

  it('debe saltar días que ya tienen el servicio', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440100', 1);
    planning.assignMealToDay(1, momentTagId, 2);
    planningRepo.save(planning);

    const count = useCase.execute(input());

    expect(count).toBe(0);
    const updated = planningRepo.findById(planningId)!;
    expect(updated.getDay(1)!.services[momentTagId]!.getCovers()).toBe(2);
  });

  it('debe mezclar días con y sin el servicio', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440100', 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440101', 2);
    planning.assignMealToDay(1, momentTagId, 2);
    planningRepo.save(planning);

    const count = useCase.execute(input({ covers: 6 }));

    expect(count).toBe(1);
    const updated = planningRepo.findById(planningId)!;
    expect(updated.getDay(1)!.services[momentTagId]!.getCovers()).toBe(2);
    expect(updated.getDay(2)!.services[momentTagId]!.getCovers()).toBe(6);
  });

  it('debe asignar exclusiones y preferencias', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440100', 1);
    planningRepo.save(planning);

    useCase.execute(input({
      exclusions: ['550e8400-e29b-41d4-a716-446655440200'],
      preferences: ['550e8400-e29b-41d4-a716-446655440201'],
    }));

    const updated = planningRepo.findById(planningId)!;
    const service = updated.getDay(1)!.services[momentTagId]!;
    expect(service.getExclusions()).toEqual(['550e8400-e29b-41d4-a716-446655440200']);
    expect(service.getPreferences()).toEqual(['550e8400-e29b-41d4-a716-446655440201']);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute(input({ planningId: 'inexistente' }))).toThrow(AppError);
  });
});
