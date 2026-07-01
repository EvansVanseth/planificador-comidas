import { describe, it, expect, beforeEach } from 'vitest';
import { DeletePlanningUseCase } from './delete-planning.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('DeletePlanningUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: DeletePlanningUseCase;
  let repo: InMemoryPlanningRepository;

  beforeEach(() => {
    repo = new InMemoryPlanningRepository();
    useCase = new DeletePlanningUseCase(repo);
  });

  it('debe eliminar un planning existente', () => {
    repo.save(Planning.create(validId, validUserId, 'Test', null, 1));
    useCase.execute(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe lanzar error si el planning no existe', () => {
    expect(() => useCase.execute(validId)).toThrow(AppError);
  });
});
