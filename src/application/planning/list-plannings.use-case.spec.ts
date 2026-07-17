import { describe, it, expect, beforeEach } from 'vitest';
import { ListPlanningsUseCase } from './list-plannings.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';

describe('ListPlanningsUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440002';

  let useCase: ListPlanningsUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new ListPlanningsUseCase(planningRepo);
  });

  it('debe listar todas las planificaciones de un usuario', async () => {
    await planningRepo.save(Planning.create('550e8400-e29b-41d4-a716-446655440010', userId, 'Semana 1', null, 2));
    await planningRepo.save(Planning.create('550e8400-e29b-41d4-a716-446655440011', userId, 'Semana 2', null, 2));

    const result = await useCase.execute(userId);

    expect(result).toHaveLength(2);
  });

  it('debe filtrar por usuario', async () => {
    await planningRepo.save(Planning.create('550e8400-e29b-41d4-a716-446655440020', userId, 'Semana 1', null, 2));
    await planningRepo.save(Planning.create('550e8400-e29b-41d4-a716-446655440021', otherUserId, 'Semana 2', null, 2));

    const result = await useCase.execute(userId);

    expect(result).toHaveLength(1);
  });

  it('debe devolver lista vacia si no hay planificaciones', async () => {
    const result = await useCase.execute(userId);

    expect(result).toHaveLength(0);
  });
});
