import { describe, it, expect, beforeEach } from 'vitest';
import { DuplicatePlanningUseCase } from './duplicate-planning.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('DuplicatePlanningUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: DuplicatePlanningUseCase;
  let repo: InMemoryPlanningRepository;

  beforeEach(() => {
    repo = new InMemoryPlanningRepository();
    useCase = new DuplicatePlanningUseCase(repo);
  });

  it('debe duplicar una planificación básica', () => {
    const originalId = 'b0000000-0000-4000-a000-000000000001';
    const original = Planning.create(originalId, userId, 'Semana 1', null, 2);
    repo.save(original);

    const newId = useCase.execute(originalId, userId);
    expect(newId).not.toBe(originalId);

    const copy = repo.findById(newId);
    expect(copy).not.toBeNull();
    expect(copy!.getName()).toBe('Semana 1 (Copia)');
    expect(copy!.getUserId()).toBe(userId);
    expect(copy!.getWeeks()).toBe(2);
    expect(copy!.getStartDate()).toBeNull();
  });

  it('debe duplicar los días con nuevos IDs', () => {
    const originalId = 'b0000000-0000-4000-a000-000000000001';
    const original = Planning.create(originalId, userId, 'Semana 1', null, 2);
    original.addDay('d1000000-0000-4000-a000-000000000001', 1);
    original.addDay('d2000000-0000-4000-a000-000000000002', 2);
    repo.save(original);

    const newId = useCase.execute(originalId, userId);
    const copy = repo.findById(newId)!;
    const days = copy.getDays();
    expect(days).toHaveLength(2);
    expect(days[0].getId()).not.toBe('d1000000-0000-4000-a000-000000000001');
    expect(days[1].getId()).not.toBe('d2000000-0000-4000-a000-000000000002');
  });

  it('no debe copiar pantry items ni shopping items', () => {
    const originalId = 'b0000000-0000-4000-a000-000000000001';
    const original = Planning.create(originalId, userId, 'Semana 1', null, 2);
    original.addDay('d1000000-0000-4000-a000-000000000001', 1);
    original.addPantryItem('a1000000-0000-4000-a000-000000000001', 'a2000000-0000-4000-a000-000000000001');
    original.addShoppingItem('a3000000-0000-4000-a000-000000000002', 'a4000000-0000-4000-a000-000000000001');
    repo.save(original);

    const newId = useCase.execute(originalId, userId);
    const copy = repo.findById(newId)!;
    expect(copy.getPantryItems()).toHaveLength(0);
    expect(copy.getShoppingItems()).toHaveLength(0);
  });

  it('debe lanzar error si la planificación no existe', () => {
    expect(() => useCase.execute('non-existent-id', userId)).toThrow(AppError);
  });
});
